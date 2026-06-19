const fs = require('fs');
const ROOT = '/Users/paulbridges/Desktop/Medway Basketball Association/site-orange';

// --- extract home footer <div class="footer">...</div> ---
let home = fs.readFileSync(ROOT + '/index.html', 'utf8');
const at = home.indexOf('class="footer"');
const start = home.lastIndexOf('<div', at);
let depth = 0; const re = /<div\b|<\/div>/g; re.lastIndex = start; let m, end;
while ((m = re.exec(home))) { if (m[0] === '</div>') { depth--; if (depth === 0) { end = re.lastIndex; break; } } else depth++; }
let footer = home.slice(start, end);

// --- clean the footer: fix leftover external links + add prevent to internal links ---
footer = footer
  .replace(/href="https:\/\/www\.betclic\.pt\/"/g, 'href="index.html"')
  .replace(/href="https:\/\/www\.under-dogs\.net\/"/g, 'href="teams.html"')
  .replace(/href="https:\/\/www\.fpb\.pt\/competicao\/"/g, 'href="scores.html"')
  .replace(/href="\/"/g, 'href="index.html"');

// add `prevent ` to any internal (.html) anchor that lacks it
footer = footer.replace(/<a\b([^>]*?)href="([^"]*\.html)"([^>]*)>/g, (full, pre, href, post) => {
  if (/\bprevent\b/.test(full)) return full;
  if (/class="/.test(full)) return full.replace(/class="/, 'class="prevent ');
  return `<a${pre}href="${href}"${post ? post : ''} class="prevent">`.replace('> class="prevent">', ' class="prevent">');
});

// --- write cleaned footer back into home ---
home = home.slice(0, start) + footer + home.slice(end);
fs.writeFileSync(ROOT + '/index.html', home);
console.log('home footer cleaned; internal links w/ prevent:', (footer.match(/prevent/g) || []).length);

// --- replace the stub <footer ...>...</footer> on the other pages ---
for (const f of ['teams.html', 'scores.html', 'contact.html']) {
  let h = fs.readFileSync(ROOT + '/' + f, 'utf8');
  const fi = h.indexOf('<footer');
  if (fi < 0) { console.log(f, 'no <footer> found, skipping'); continue; }
  const fe = h.indexOf('</footer>', fi) + '</footer>'.length;
  h = h.slice(0, fi) + footer + h.slice(fe);
  fs.writeFileSync(ROOT + '/' + f, h);
  console.log(f, 'footer replaced with home footer:', h.includes('class="footer"'), '| old stub gone:', !/class="s?-?foot"/.test(h));
}
