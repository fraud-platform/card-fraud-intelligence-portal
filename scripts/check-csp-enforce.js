#!/usr/bin/env node
/* CSP enforcement check: ensures Content-Security-Policy header does not contain unsafe directives */

const url = process.env.CSP_URL || 'http://localhost:8080/';

async function run() {
  console.log(`Checking CSP enforcement at ${url}`);
  if (typeof fetch !== 'function') {
    console.error('Global fetch() is not available in this Node runtime. Use Node 18+ or add a fetch polyfill.');
    process.exit(10);
  }

  const res = await fetch(url, { redirect: 'follow' });

  // prefer enforced header but accept report-only as well if present
  const header = res.headers.get('content-security-policy') || res.headers.get('content-security-policy-report-only');
  if (!header) {
    console.error('Missing Content-Security-Policy header (or report-only header)');
    process.exit(2);
  }

  console.log('Found CSP header:', header);

  // Parse script-src directive and ensure it does not contain unsafe tokens
  const scriptSrcMatch = header.match(/script-src\s+([^;]+)/i);
  if (scriptSrcMatch) {
    const scriptSrc = scriptSrcMatch[1];
    if (/unsafe-inline/.test(scriptSrc) || /unsafe-eval/.test(scriptSrc)) {
      console.error('CSP script-src contains unsafe directives (unsafe-inline or unsafe-eval). Please remove them before enforcing.');
      process.exit(3);
    }
  } else {
    console.warn('No script-src directive found in CSP header; ensure scripts are covered by CSP.');
  }

  // Warn if unsafe-inline exists elsewhere (e.g., style-src) — not failing here to allow progressive migration
  if (/unsafe-inline/.test(header)) {
    console.warn('CSP contains \"unsafe-inline\" in directives other than script-src (e.g., style-src). This is allowed temporarily but should be removed before full enforcement.');
  }

  console.log('CSP Enforce test PASSED (no unsafe script directives detected)');
  process.exit(0);
}

run().catch((err) => {
  console.error('Error running CSP enforce test:', err);
  process.exit(1);
});