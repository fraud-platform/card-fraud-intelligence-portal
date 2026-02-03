Nonce-based Content Security Policy (CSP) — Implementation & Test

This document shows example approaches for server-side per-request nonce injection and a quick Report-Only test harness.

Why
- Some UI libraries (e.g., Ant Design) inject inline style/script tags at runtime. A nonce-based CSP allows you to remove `unsafe-inline` while still permitting those legitimate inline insertions.

Approach overview
1. Generate a cryptographically secure nonce per-request (HTTP response lifecycle).
2. Inject the nonce into a meta tag in the served HTML: `<meta name="csp-nonce" content="<nonce>">` so the client can read it at runtime.
3. Return a matching CSP header (start with Report-Only to monitor):
   - Header example: `Content-Security-Policy-Report-Only: script-src 'self' 'nonce-<nonce>'; style-src 'self' 'nonce-<nonce>';`.
4. Validate in Report-Only mode; when OK, move to enforcement and remove `unsafe-inline` entries.

Server Examples

1) Nginx (templating / placeholder)

If you can template `index.html` or set per-request vars, inject the nonce into the HTML and header. Example (pseudocode placeholder):

```nginx
# Pseudocode - requires templating / middleware to set $request_nonce
add_header Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self' 'nonce-$request_nonce'; style-src 'self' 'nonce-$request_nonce';" always;
# Ensure your index.html includes: <meta name="csp-nonce" content="$request_nonce">
```

Notes:
- Nginx alone cannot generate a per-request cryptographic nonce without external modules or templating. Use a templating step or an upstream middleware to write the nonce into `$request_nonce`.

2) Edge Function (Cloudflare Worker example)

This example shows how to inject a nonce and return a Report-Only header in an edge function. For other providers (Netlify/Vercel/Cloudfront), adapt similarly.

```js
// Cloudflare Worker example (simplified)
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const res = await fetch(url.origin + '/index.html');
  let body = await res.text();

  const nonce = crypto.getRandomValues(new Uint8Array(16)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');

  // Inject meta tag placeholder
  body = body.replace('<meta name="csp-nonce" content="">', `<meta name="csp-nonce" content="${nonce}">`);

  const headers = new Headers(res.headers);
  headers.set('Content-Security-Policy-Report-Only', `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}';`);

  return new Response(body, { status: 200, headers });
}
```

3) Simple Node dev server (included script)

A minimal dev helper `scripts/csp-dev-server.js` is included in this repo. It:
- Serves `index.html` (from `dist/` or `public/`)
- Generates a per-request nonce
- Injects the nonce into the `<meta name="csp-nonce">` tag
- Adds a `Content-Security-Policy-Report-Only` header including the nonce

Run it locally to validate your SPA will receive the nonce in runtime when the server injects it.

Test (Report-Only)

A convenience script `scripts/check-csp-report-only.js` is included that:
- Performs a GET `/` against `http://localhost:8080`
- Validates that the `Content-Security-Policy-Report-Only` header exists and contains a `nonce-<value>` token
- Validates that the HTML contains `<meta name="csp-nonce" content="<value>">` and that both nonces match

Usage (local quick-check):

1) Build the app: `pnpm build` (or ensure `index.html` is present in the directory you plan to serve)
2) Start the test server: `pnpm run csp:serve -- --root ./dist` (defaults to serving `./dist` or `./public`)
3) In a second terminal run: `pnpm run csp:test` — returns 0 on success and non-zero on failures.

Migration Plan

1. Start with `Content-Security-Policy-Report-Only` header and monitor violations in your reporting endpoint.
2. Fix any violations (update app, third-party integration, or CSP policy).
3. After 1-2 weeks with no critical violations, switch to `Content-Security-Policy` (enforce) and remove `unsafe-inline` where safe.

Notes & Caveats

- Ensure CSP header includes any domains you need in `connect-src`, `img-src`, etc. The sample only focuses on script/style nonces.
- If you generate a nonce, any inline <script> or <style> that must run must include the nonce attribute to be allowed (e.g., `<script nonce="...">`). Some libraries (AntD) insert inline styles at runtime; passing the nonce into the runtime (via the meta) allows them to add the correct nonce when injecting styles.
- If you use server-side rendering, ensure you inject the meta tag into the rendered HTML per-request.
