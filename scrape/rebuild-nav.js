const fs = require('fs');
const ROOT = '/Users/paulbridges/Desktop/Medway Basketball Association/site-orange';

function anchorSpan(h, aStart) {
  let depth = 0; const re = /<a\b|<\/a>/g; re.lastIndex = aStart; let m;
  while ((m = re.exec(h))) { if (m[0] === '</a>') { depth--; if (depth === 0) return [aStart, re.lastIndex]; } else depth++; }
  return null;
}

// page -> which link is current
const CUR = { 'index.html': 'index.html', 'teams.html': 'teams.html', 'scores.html': 'scores.html', 'contact.html': 'contact.html' };

// grab a strike-img tag to reuse in footer links
let homeSrc = fs.readFileSync(ROOT + '/index.html', 'utf8');
const STRIKE = (homeSrc.match(/<img[^>]*class="strike-img"[^>]*>/) || [''])[0];

function footerLink(href, cls, label, current) {
  const curCls = current ? ' w--current' : '';
  const aria = current ? ' aria-current="page"' : '';
  return `<div class="footer-link-wrap"><a href="${href}"${aria} class="prevent footer-link ${cls} w-inline-block${curCls}"><div class="integral-35-700-41">${label}</div>${STRIKE}</a><div class="hor-sep"></div></div>`;
}

for (const f of ['index.html', 'teams.html', 'scores.html', 'contact.html']) {
  let h = fs.readFileSync(ROOT + '/' + f, 'utf8');
  const curHref = CUR[f];

  // ---------- MENU ----------
  const ws = h.indexOf('nav-menu-link-wrap');
  const wrapStart = h.lastIndexOf('<div', ws);
  // segment end: end of the link-wrap div (find matching close)
  let d = 0; const dre = /<div\b|<\/div>/g; dre.lastIndex = wrapStart; let dm, wrapEnd;
  while ((dm = dre.exec(h))) { if (dm[0] === '</div>') { d--; if (d === 0) { wrapEnd = dre.lastIndex; break; } } else d++; }
  let menu = h.slice(wrapStart, wrapEnd);

  // remove Gallery + Venues menu anchors
  for (const label of ['Gallery', 'Venues']) {
    const li = menu.indexOf('>' + label + '<');
    if (li >= 0) {
      const aStart = menu.lastIndexOf('<a', li);
      const span = anchorSpan(menu, aStart);
      if (span) menu = menu.slice(0, span[0]) + menu.slice(span[1]);
    }
  }
  // reset all current markers on menu links, then set the right one
  menu = menu.replace(/\s*aria-current="page"/g, '')
             .replace(/\bw--current\b/g, '')
             .replace(/\bcurrent\b/g, '')
             .replace(/class="\s+/g, 'class="').replace(/\s+"/g, '"');
  // set current on the link matching this page
  menu = menu.replace(new RegExp('(<a[^>]*href="' + curHref.replace('.', '\\.') + '"[^>]*class="[^"]*)(")'),
                      '$1 w--current$2');
  h = h.slice(0, wrapStart) + menu + h.slice(wrapEnd);

  // ---------- FOOTER ----------
  const flwFirst = h.indexOf('<div class="footer-link-wrap">');
  const outerIdx = h.indexOf('footer-outer-link-wrap');
  if (flwFirst >= 0 && outerIdx > flwFirst) {
    const outerStart = h.lastIndexOf('<div', outerIdx);
    const newFooter =
      footerLink('index.html', 'home-link', 'HOME', curHref === 'index.html') +
      footerLink('teams.html', 'artistas-link', 'Teams', curHref === 'teams.html') +
      footerLink('scores.html', 'scores-link', 'Scores', curHref === 'scores.html') +
      footerLink('contact.html', 'contact-link', 'Contact', curHref === 'contact.html');
    h = h.slice(0, flwFirst) + newFooter + h.slice(outerStart);
  }

  fs.writeFileSync(ROOT + '/' + f, h);

  // report
  const seg = h.slice(h.indexOf('nav-menu-link-wrap'), h.indexOf('nav-menu-link-wrap') + 4000);
  const menuLabels = [...seg.matchAll(/class="[^"]*nav-menu-link[^"]*"[^>]*>\s*<div[^>]*>([^<]+)</g)].map(m => m[1]);
  const menuCur = (seg.match(/nav-menu-link[^"]*w--current|w--current[^"]*nav-menu-link/g) || []).length;
  const footSeg = h.slice(h.indexOf('footer-link-wrap'), h.indexOf('footer-outer-link-wrap'));
  const footLabels = [...footSeg.matchAll(/integral-35-700-41">([^<]+)</g)].map(m => m[1]);
  const footCur = (footSeg.match(/w--current/g) || []).length;
  console.log(f, '| menu:', menuLabels.join(','), '(cur=' + menuCur + ')', '| footer:', footLabels.join(','), '(cur=' + footCur + ')');
}
