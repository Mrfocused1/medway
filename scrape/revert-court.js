// Restore the court-outline SVGs (which I wrongly swapped) from the pristine raw HTML,
// keeping the MBA logo ONLY in the nav (logo-svg) and intro/footer center (artdunk-logo-trans).
const fs = require('fs');
const ROOT = '/Users/paulbridges/Desktop/Medway Basketball Association';
const raw = fs.readFileSync(ROOT + '/artdunk_raw.html', 'utf8');

// containers whose inline <svg> are COURT graphics, not the brand logo -> restore originals
const COURT_MARKERS = ['load-embed left', 'load-embed right', 'nav-menu-bg-desktop-svg', 'nav-menu-bg-mobile-svg'];

function innerSvgAfter(html, marker) {
  const m = html.indexOf(marker);
  if (m < 0) return null;
  const s = html.indexOf('<svg', m);
  const e = html.indexOf('</svg>', s);
  if (s < 0 || e < 0) return null;
  return { svg: html.slice(s, e + 6), markerPos: m };
}

// extract the original court SVGs from raw (by marker order; raw has them once each here)
const originals = {};
for (const mk of COURT_MARKERS) {
  const r = innerSvgAfter(raw, mk);
  originals[mk] = r ? r.svg : null;
  console.log('original', mk, '->', r ? 'found' : 'MISSING');
}

function replaceSvgAfter(html, marker, newSvg) {
  const m = html.indexOf(marker);
  if (m < 0) return { html, ok: false };
  const s = html.indexOf('<svg', m);
  const e = html.indexOf('</svg>', s);
  if (s < 0 || e < 0) return { html, ok: false };
  return { html: html.slice(0, s) + newSvg + html.slice(e + 6), ok: true };
}

for (const site of ['site', 'site-orange']) {
  const p = ROOT + '/' + site + '/index.html';
  let h = fs.readFileSync(p, 'utf8');
  console.log('\n' + site + ':');
  for (const mk of COURT_MARKERS) {
    if (!originals[mk]) continue;
    const r = replaceSvgAfter(h, mk, originals[mk]); h = r.html;
    console.log('  restore', mk, '->', r.ok);
  }
  // remove the hide + mirror CSS (court keys must show, no flip)
  h = h.replace(/<style id="mba-logo-fix">[\s\S]*?<\/style>/, '');
  fs.writeFileSync(p, h);
}
console.log('\ndone');
