const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const map = new Map(JSON.parse(fs.readFileSync(path.join(__dirname, 'urlmap.json'), 'utf8')));

// Helper: rewrite every known CDN url (encoded and unencoded) -> local relative path.
function rewrite(txt) {
  for (const [u, rel] of map) {
    if (txt.includes(u)) txt = txt.split(u).join(rel);
    // also try with query-stripped variants already handled; handle &amp; encoded ampersands not needed
  }
  // strip preconnect/preload to cdn (harmless) and the cdn css/js already mapped
  return txt;
}

// 1) HTML — start from pristine raw, rewrite urls.
let html = fs.readFileSync(path.join(ROOT, 'artdunk_raw.html'), 'utf8');
html = rewrite(html);

// Fix the custom-code loader: it pings localhost:3000 then falls back to CDN app.txt.
// Replace the whole loader logic with a direct local load of app.js.
html = html.replace(
  /\$\.loadScript\('http:\/\/localhost:3000\/dev\/app\.js'[^;]*;?/,
  "$.loadScript('assets/cdn/" + 'cdn.prod.website-files.com_643d2c14ea3ee5824c82adfc_64f0905c9e3b0aa4a3103f03_app.txt' + "', ()=>{});"
);
// also neutralize the backup fetch to cdn app.txt (already local via map) — fine.

fs.writeFileSync(path.join(SITE, 'index.html'), html);

// 2) CSS — rewrite font/image urls to local.
let css = fs.readFileSync(path.join(SITE, 'css', 'webflow.css'), 'utf8');
css = rewrite(css);
fs.writeFileSync(path.join(SITE, 'css', 'webflow.css'), css);

// 3) app.txt bundle — rewrite internal CDN refs (lottie json etc.) to local.
const appLocal = path.join(SITE, 'assets', 'cdn', 'cdn.prod.website-files.com_643d2c14ea3ee5824c82adfc_64f0905c9e3b0aa4a3103f03_app.txt');
let app = fs.readFileSync(appLocal, 'utf8');
app = rewrite(app);
fs.writeFileSync(appLocal, app);

// 4) main webflow JS + schunks — rewrite any cdn refs.
const cdnDir = path.join(SITE, 'assets', 'cdn');
for (const f of fs.readdirSync(cdnDir)) {
  if (f.endsWith('.js')) {
    const p = path.join(cdnDir, f);
    let j = fs.readFileSync(p, 'utf8');
    const out = rewrite(j);
    if (out !== j) fs.writeFileSync(p, out);
  }
}

// report any remaining live CDN refs in index.html
const remain = (fs.readFileSync(path.join(SITE,'index.html'),'utf8').match(/website-files\.com|cloudfront\.net/g)||[]).length;
console.log('done. remaining cdn refs in index.html:', remain);
