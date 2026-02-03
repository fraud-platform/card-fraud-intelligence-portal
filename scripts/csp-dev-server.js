#!/usr/bin/env node
/*
Simple CSP dev server: serves files and injects a per-request nonce into index.html
Usage: node scripts/csp-dev-server.js [--root ./dist] [--port 8080]
*/
import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const argv = process.argv.slice(2);
const rootIndex = argv.indexOf('--root');
const root = rootIndex !== -1 && argv[rootIndex + 1] ? argv[rootIndex + 1] : './dist';
const portIndex = argv.indexOf('--port');
const port = portIndex !== -1 && argv[portIndex + 1] ? Number(argv[portIndex + 1]) : 8080;

const contentType = (filePath) => {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.woff2')) return 'font/woff2';
  return 'application/octet-stream';
};

const getNonce = () => crypto.randomBytes(16).toString('base64');

async function serveFile(reqPath) {
  const fsPath = path.join(process.cwd(), root, reqPath);
  try {
    const stat = await fs.stat(fsPath);
    if (stat.isDirectory()) {
      return { type: 'directory' };
    }
    const data = await fs.readFile(fsPath);
    return { type: 'file', data };
  } catch (e) {
    return { type: 'missing' };
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://localhost:${port}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';

    const result = await serveFile(pathname);
    if (result.type === 'file') {
      if (pathname.endsWith('.html')) {
        let html = result.data.toString('utf8');
        const nonce = getNonce();

        // Inject nonce into meta tag placeholder
        html = html.replace(/<meta name="csp-nonce" content="">/i, `<meta name="csp-nonce" content="${nonce}">`);

        // Set Report-Only header including the nonce
        res.setHeader('Content-Security-Policy-Report-Only', `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}';`);
        res.setHeader('Content-Type', contentType(pathname));
        res.writeHead(200);
        res.end(html);
        return;
      }

      res.setHeader('Content-Type', contentType(pathname));
      res.writeHead(200);
      res.end(result.data);
      return;
    }

    // Fallback to index.html for SPA routing
    const indexCheck = await serveFile('/index.html');
    if (indexCheck.type === 'file') {
      let html = indexCheck.data.toString('utf8');
      const nonce = getNonce();
      html = html.replace(/<meta name="csp-nonce" content="">/i, `<meta name="csp-nonce" content="${nonce}">`);
      res.setHeader('Content-Security-Policy-Report-Only', `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}';`);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.writeHead(200);
      res.end(html);
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  } catch (err) {
    console.error('Server error', err);
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(port, () => {
  console.log(`CSP dev server serving ${root} on http://localhost:${port}`);
  console.log('Meta tag placeholder expected: <meta name="csp-nonce" content="">');
});
