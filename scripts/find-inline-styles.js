#!/usr/bin/env node
// Simple grep-like utility to find inline style usage patterns in JSX (style={{ ... }})

const fs = require('fs');
const path = require('path');

function walk(dir, cb) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      walk(full, cb);
    } else if (f.isFile() && (full.endsWith('.tsx') || full.endsWith('.jsx') || full.endsWith('.ts') || full.endsWith('.js'))) {
      cb(full);
    }
  }
}

const results = [];
walk(path.resolve(__dirname, '..', 'src'), (file) => {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /style=\{\{/g;
  let match;
  let count = 0;
  while ((match = regex.exec(content)) !== null) {
    count++;
  }
  if (count > 0) results.push({ file, count });
});

if (results.length === 0) {
  console.log('No inline style={{ ... }} usages found.');
  process.exit(0);
}

console.log('Inline style usage summary:');
for (const r of results) {
  console.log(`${r.count.toString().padStart(3)}  ${r.file}`);
}
process.exit(0);
