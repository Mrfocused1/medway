// Swap EVERY ART DUNK brand mark for the new MBA logo, in both site/ and site-orange/.
// Targets are identified by the ART DUNK marks' distinctive viewBoxes so we don't
// touch icons, the ball-path, or the (different-brand) Underdogs logos.
const fs = require('fs');
const path = require('path');

const ROOT = '/Users/paulbridges/Desktop/Medway Basketball Association';
const SRC_SVG = '/Users/paulbridges/Downloads/MBA Basketball.svg';

// ART DUNK logo viewBoxes: nav mark, tall intro/menu lockup, mobile menu, footer "trans" mark
const TARGET_VIEWBOXES = ['0 0 372 287', '0 0 495 777', '0 0 428 431', '0 0 115 89'];

// new logo inner <svg> (strip xml decl + doctype), made to fill container w/o stretching
let raw = fs.readFileSync(SRC_SVG, 'utf8');
let svg = raw.slice(raw.indexOf('<svg'));
svg = svg.slice(0, svg.lastIndexOf('</svg>') + 6);
svg = svg.replace(/<svg/, '<svg preserveAspectRatio="xMidYMid meet"')
         .replace(/width="[^"]*"/, 'width="100%"')
         .replace(/height="[^"]*"/, 'height="100%"');

function swapByViewBox(html, vb) {
  let count = 0, idx = 0;
  while (true) {
    const needle = 'viewBox="' + vb + '"';
    const vbPos = html.indexOf(needle, idx);
    if (vbPos < 0) break;
    const svgStart = html.lastIndexOf('<svg', vbPos);
    const svgEnd = html.indexOf('</svg>', vbPos);
    if (svgStart < 0 || svgEnd < 0) { idx = vbPos + needle.length; continue; }
    html = html.slice(0, svgStart) + svg + html.slice(svgEnd + 6);
    idx = svgStart + svg.length;     // continue after the inserted logo
    count++;
  }
  return { html, count };
}

for (const site of ['site', 'site-orange']) {
  const dir = path.join(ROOT, site);
  fs.copyFileSync(SRC_SVG, path.join(dir, 'assets', 'mba-logo.svg'));
  const p = path.join(dir, 'index.html');
  let h = fs.readFileSync(p, 'utf8');
  console.log('\n' + site + ':');
  for (const vb of TARGET_VIEWBOXES) {
    const r = swapByViewBox(h, vb); h = r.html;
    console.log('  viewBox', vb, '->', r.count, 'swapped');
  }
  fs.writeFileSync(p, h);
}
console.log('\ndone');
