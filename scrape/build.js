// Build a self-contained local clone from the rendered DOM + CDN assets.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const CDN = path.join(SITE, 'assets', 'cdn');
fs.mkdirSync(CDN, { recursive: true });

// 1. Gather all CDN/cloudfront URLs from rendered html, raw html, css, and the app.js bundle.
const sources = {
  rendered: fs.readFileSync(path.join(__dirname, 'rendered.html'), 'utf8'),
  raw: fs.readFileSync(path.join(ROOT, 'artdunk_raw.html'), 'utf8'),
  css: fs.readFileSync(path.join(SITE, 'css', 'webflow.css'), 'utf8'),
  app: fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'),
};

const urlRe = /https?:\/\/(?:[a-z0-9.-]*website-files\.com|d3e54v103j8qbb\.cloudfront\.net)\/[A-Za-z0-9._%()'\/-]+/g;
const all = new Set();
for (const k in sources) {
  let m;
  while ((m = urlRe.exec(sources[k]))) {
    let u = m[0].replace(/['")]+$/, '');           // trim trailing quote/paren noise
    u = u.replace(/\?.*$/, '');                       // drop query string
    all.add(u);
  }
}

// deterministic local filename
function nameOf(u) {
  const noproto = u.replace(/^https?:\/\//, '');
  return noproto.replace(/[^A-Za-z0-9._-]/g, '_');
}

const map = new Map(); // url -> local relative path from site root
for (const u of all) {
  map.set(u, 'assets/cdn/' + nameOf(u));
}

// 2. Download each (curl, follow redirects). Keep encoded URL as-is.
let ok = 0, fail = 0;
for (const [u, rel] of map) {
  const dest = path.join(SITE, rel);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) { ok++; continue; }
  try {
    execSync(`curl -fsSL --compressed -A "Mozilla/5.0" -o ${JSON.stringify(dest)} ${JSON.stringify(u)}`, { stdio: 'ignore' });
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) ok++; else { fail++; console.log('EMPTY', u); }
  } catch (e) { fail++; console.log('FAIL', u); }
}
console.log(`downloaded ok=${ok} fail=${fail} of ${map.size}`);

fs.writeFileSync(path.join(__dirname, 'urlmap.json'), JSON.stringify([...map], null, 2));
