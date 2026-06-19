const fs = require('fs');
const ROOT = '/Users/paulbridges/Desktop/Medway Basketball Association/site-orange';

function anchorAt(h, start) { // start at '<a'
  let depth = 0; const re = /<a\b|<\/a>/g; re.lastIndex = start; let m;
  while ((m = re.exec(h))) { if (m[0] === '</a>') { depth--; if (depth === 0) return h.slice(start, re.lastIndex); } else depth++; }
  return null;
}

// clone the Scores menu link to make a Contact link, inserted right after Scores
function injectContact(html) {
  if (html.includes('href="contact.html"')) return html;
  const si = html.indexOf('href="scores.html"');
  if (si < 0) return html;
  const aStart = html.lastIndexOf('<a', si);
  const scoresLink = anchorAt(html, aStart);
  if (!scoresLink) return html;
  let contactLink = scoresLink
    .replace('href="scores.html"', 'href="contact.html"')
    .replace(/>Scores</, '>Contact<')
    .replace(/\bw--current\b/g, '')
    .replace(/\bcurrent\b/g, '')
    .replace(/\saria-current="page"/g, '');
  if (!/class="[^"]*\bprevent\b/.test(contactLink)) contactLink = contactLink.replace(/class="/, 'class="prevent ');
  return html.slice(0, aStart + scoresLink.length) + contactLink + html.slice(aStart + scoresLink.length);
}

for (const f of ['index.html', 'teams.html', 'scores.html', 'contact.html']) {
  let h = fs.readFileSync(ROOT + '/' + f, 'utf8');
  h = injectContact(h);
  fs.writeFileSync(ROOT + '/' + f, h);
  console.log(f, 'has Contact link:', h.includes('href="contact.html"'));
}

// on contact.html: unmark Scores current, mark Contact current
let c = fs.readFileSync(ROOT + '/contact.html', 'utf8');
c = c.replace('href="scores.html" class="prevent current ', 'href="scores.html" class="prevent ');
c = c.replace('href="contact.html" class="prevent ', 'href="contact.html" class="prevent current ');
fs.writeFileSync(ROOT + '/contact.html', c);
console.log('contact current marked:', /href="contact.html" class="prevent current /.test(c), '| scores no longer current:', !/href="scores.html" class="prevent current /.test(c));
