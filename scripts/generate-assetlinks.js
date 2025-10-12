#!/usr/bin/env node
// Simple generator for assetlinks.json
// Usage: node scripts/generate-assetlinks.js <packageName> <sha256Fingerprint>
const fs = require('fs');
const [,, packageName, fingerprint] = process.argv;
if (!packageName || !fingerprint) {
  console.error('Usage: node scripts/generate-assetlinks.js <packageName> <sha256Fingerprint>');
  process.exit(2);
}
const out = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: packageName,
      sha256_cert_fingerprints: [fingerprint]
    }
  }
];
const path = 'docs/assetlinks-generated.json';
fs.writeFileSync(path, JSON.stringify(out, null, 2));
console.log('Wrote', path);
