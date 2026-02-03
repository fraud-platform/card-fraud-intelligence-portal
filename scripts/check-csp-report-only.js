#!/usr/bin/env node
/* Lightweight check script: verifies CSP Report-Only header and meta nonce match */

const url = process.env.CSP_URL || 'http://localhost:8080/';

async function run() {
  console.log(`Checking ${url}`);
  // Use global fetch available in Node 18+; if not present, provide helpful message
  if (typeof fetch !== 'function') {
    console.error('Global fetch() is not available in this Node runtime. Use Node 18+ or add a fetch polyfill.');
    process.exit(10);
  }

  const res = await fetch(url, { redirect: 'follow' });

  const header = res.headers.get('content-security-policy-report-only');
  if (!header) {
    console.error('Missing Content-Security-Policy-Report-Only header');
    process.exit(2);
  }
  console.log('Found CSP-Report-Only header:', header);

  const text = await res.text();
  const metaMatch = text.match(/<meta\s+name=\"csp-nonce\"\s+content=\"([^\"]*)\">/i);
  if (!metaMatch) {
    console.error('Missing <meta name="csp-nonce"> tag in HTML');
    process.exit(3);
  }
  const metaNonce = metaMatch[1];
  console.log('Found meta nonce:', metaNonce);

  // Extract nonce from header - naive extraction for nonce-<value>
  const headerNonceMatch = header.match(/nonce-([^\s';]+)/);
  if (!headerNonceMatch) {
    console.error('No nonce found in CSP header');
    process.exit(4);
  }
  const headerNonce = headerNonceMatch[1];
  console.log('Found header nonce:', headerNonce);

  if (metaNonce !== headerNonce) {
    console.error('Nonce mismatch between meta and header');
    process.exit(5);
  }

  console.log('CSP Report-Only test PASSED (nonce present and matches)');
  process.exit(0);
}

run().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});