// Point the orange clone's basketball animation at the locally-rendered PNG frames.
const fs = require('fs');
const p = '/Users/paulbridges/Desktop/Medway Basketball Association/site-orange/index.html';
let h = fs.readFileSync(p, 'utf8');

// 1) ball-embed: swap the GitHub frame source -> local orange PNG frames
h = h.replace(
  'url-start="https://raw.githubusercontent.com/psantos-duall/artdunk-assets/main/webp/ball_sequence"',
  'url-start="assets/ball-orange/ball_sequence"'
);
h = h.replace('url-end=".webp"', 'url-end=".png"');

// 2) placeholder <img> (shown before JS) -> orange frame 000
h = h.replace(
  /assets\/cdn\/cdn\.prod\.website-files\.com_[^"']*ball_sequence000(-p-500)?\.webp/g,
  'assets/ball-orange/ball_sequence000.png'
);

fs.writeFileSync(p, h);
const okSrc = h.includes('url-start="assets/ball-orange/ball_sequence"');
const okEnd = h.includes('url-end=".png"');
console.log('patched url-start:', okSrc, '| url-end .png:', okEnd,
  '| placeholder repointed:', h.includes('assets/ball-orange/ball_sequence000.png'));
