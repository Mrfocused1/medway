const fs = require('fs');
const ROOT = '/Users/paulbridges/Desktop/Medway Basketball Association/site-orange';

// CSS: match home footer scale (12px base) + only-current strikethrough
const CSS = '<style id="mba-footer-fix">' +
  '.footer{font-size:12px !important;}' +
  '.footer .footer-link .strike-img{opacity:0 !important;transition:opacity .2s;}' +
  '.footer .footer-link:hover .strike-img,' +
  '.footer .footer-link.w--current .strike-img,' +
  '.footer .footer-link.current .strike-img{opacity:1 !important;}' +
  '</style>';

// which footer link is current on each page (footer only lists HOME/Teams/Gallery/Venues)
const CURRENT = { 'teams.html': 'artistas-link', 'scores.html': null, 'contact.html': null };

for (const f of ['teams.html', 'scores.html', 'contact.html']) {
  let h = fs.readFileSync(ROOT + '/' + f, 'utf8');

  // inject the footer-fix style once
  if (!h.includes('mba-footer-fix')) h = h.replace('</head>', CSS + '</head>');

  // remove the copied-from-home w--current on the footer HOME link
  h = h.replace('footer-link home-link w-inline-block w--current', 'footer-link home-link w-inline-block');
  h = h.replace(/(footer-link home-link[^"]*)\bw--current\b/, '$1');

  // mark the correct footer link current for this page
  const cur = CURRENT[f];
  if (cur) {
    h = h.replace(new RegExp('(footer-link ' + cur + ' w-inline-block)(?!")'), '$1 w--current')
         .replace('footer-link ' + cur + ' w-inline-block"', 'footer-link ' + cur + ' w-inline-block w--current"');
  }

  fs.writeFileSync(ROOT + '/' + f, h);
  const homeStillCurrent = /footer-link home-link[^"]*w--current/.test(h);
  console.log(f, '| fix css:', h.includes('mba-footer-fix'), '| home no longer current:', !homeStillCurrent, '| current set:', cur ? new RegExp('footer-link ' + cur + '[^"]*w--current').test(h) : 'n/a');
}
