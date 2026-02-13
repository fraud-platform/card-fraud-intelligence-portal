# CSP Nonce Runbook

Guidance for nonce-based CSP validation in local and pre-production runs.

Last verified: February 13, 2026.

## Why This Exists

UI libraries may inject inline styles/scripts at runtime. A nonce-based CSP allows strict policy without `unsafe-inline`.

## Implementation Model

1. Generate a cryptographically secure nonce per HTTP response.
2. Inject nonce into HTML meta tag:
   - `<meta name="csp-nonce" content="<nonce>">`
3. Return matching CSP header in report-only mode first.
4. Promote to enforcement once reports show expected behavior.

## Local Verification Flow

```powershell
pnpm build
pnpm csp:serve
pnpm csp:test
pnpm csp:enforce
```

## Required Alignment

- Keep CSP guidance aligned with `nginx.conf`.
- Keep scripts aligned with:
  - `scripts/csp-dev-server.js`
  - `scripts/check-csp-report-only.js`
  - `scripts/check-csp-enforce.js`
