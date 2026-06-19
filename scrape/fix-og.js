const fs = require('fs');
const ROOT = '/Users/paulbridges/Desktop/Medway Basketball Association/site-orange';
const DOMAIN = 'https://medwaybasketballassociation.site';
const IMG = DOMAIN + '/assets/img/hero-action.jpg';

// ---------- index.html ----------
let h = fs.readFileSync(ROOT + '/index.html', 'utf8');
// swap old ARTDUNK share image (og:image + twitter:image) -> Medway image (absolute)
h = h.replace(/content="assets\/cdn\/[^"]*Share_20_1_\.png"/g, `content="${IMG}"`);
// fix canonical
h = h.replace(/<link href="https:\/\/www\.artdunk\.pt" rel="canonical"\/>/, `<link href="${DOMAIN}/" rel="canonical"/>`);
// drop the old webflow domain attribute
h = h.replace(/ data-wf-domain="betclic-artdunk\.webflow\.io"/, ' data-wf-domain="medwaybasketballassociation.site"');
// add og:url if missing (after og:type)
if (!/property="og:url"/.test(h)) {
  h = h.replace(/<meta property="og:type" content="website"\/>/, `<meta property="og:url" content="${DOMAIN}/"/><meta property="og:type" content="website"/>`);
}
fs.writeFileSync(ROOT + '/index.html', h);
console.log('index: image fixed', h.includes(IMG), '| canonical', h.includes(`${DOMAIN}/" rel="canonical"`), '| og:url', /og:url/.test(h), '| no artdunk', !/artdunk/i.test(h));

// ---------- teams / scores / contact ----------
const META = {
  'teams.html':   { t: 'Teams — Medway Basketball Association', d: 'Find your local basketball club across Medway & Kent — teams, divisions and venues.', u: DOMAIN + '/teams.html' },
  'scores.html':  { t: 'Scores & Results — Medway Basketball Association', d: 'Latest match results, standings and stats across the MBA.', u: DOMAIN + '/scores.html' },
  'contact.html': { t: 'Contact — Medway Basketball Association', d: 'Get in touch with the Medway Basketball Association — basketball in the Medway area since 1947.', u: DOMAIN + '/contact.html' }
};
for (const f of Object.keys(META)) {
  let p = fs.readFileSync(ROOT + '/' + f, 'utf8');
  if (/property="og:image"/.test(p)) { console.log(f, 'already has og — skipping'); continue; }
  const m = META[f];
  const block =
    `<meta name="description" content="${m.d}"/>` +
    `<meta property="og:title" content="${m.t}"/>` +
    `<meta property="og:description" content="${m.d}"/>` +
    `<meta property="og:image" content="${IMG}"/>` +
    `<meta property="og:url" content="${m.u}"/>` +
    `<meta property="og:type" content="website"/>` +
    `<meta name="twitter:card" content="summary_large_image"/>` +
    `<meta name="twitter:title" content="${m.t}"/>` +
    `<meta name="twitter:description" content="${m.d}"/>` +
    `<meta name="twitter:image" content="${IMG}"/>`;
  // insert right after the <title>...</title>
  p = p.replace(/(<title>[^<]*<\/title>)/, `$1${block}`);
  fs.writeFileSync(ROOT + '/' + f, p);
  console.log(f, 'og added:', /property="og:image"/.test(p));
}
