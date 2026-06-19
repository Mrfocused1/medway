const fs = require('fs');
const ROOT = '/Users/paulbridges/Desktop/Medway Basketball Association/site-orange';
const home = fs.readFileSync(ROOT + '/index.html', 'utf8');

function blockDiv(h, marker) {
  const at = h.indexOf(marker); if (at < 0) return null;
  const start = h.lastIndexOf('<div', at);
  let depth = 0; const re = /<div\b|<\/div>/g; re.lastIndex = start; let m;
  while ((m = re.exec(h))) { if (m[0] === '</div>') { depth--; if (depth === 0) return h.slice(start, re.lastIndex); } else depth++; }
  return null;
}
function anchorAt(h, start) { // start at '<a'
  let depth = 0; const re = /<a\b|<\/a>/g; re.lastIndex = start; let m;
  while ((m = re.exec(h))) { if (m[0] === '</a>') { depth--; if (depth === 0) return h.slice(start, re.lastIndex); } else depth++; }
  return null;
}

const navBlock = blockDiv(home, 'class="nav "') || blockDiv(home, 'class="nav"');
let menuBlock = blockDiv(home, 'class="nav-menu-wrap"');
if (!navBlock || !menuBlock) throw new Error('blocks not found');

// build a "Scores" menu link by cloning the existing Teams link inside the menu
function makeScoresLink(menuHtml) {
  const ti = menuHtml.indexOf('href="teams.html"');
  const aStart = menuHtml.lastIndexOf('<a', ti);
  const teamsLink = anchorAt(menuHtml, aStart);
  if (!teamsLink) return null;
  let s = teamsLink
    .replace('href="teams.html"', 'href="scores.html"')
    .replace(/>Teams</, '>Scores<')
    .replace(/\bw--current\b/g, '')
    .replace(/\saria-current="page"/g, '');
  if (!/class="[^"]*\bprevent\b/.test(s)) s = s.replace(/class="/, 'class="prevent ');
  return { teamsLink, aStart, scoresLink: s };
}

// inserts the Scores link right after the Teams link in a page's menu (and ensures prevent on teams link)
function injectScores(html) {
  const ti = html.indexOf('href="teams.html"');
  if (ti < 0) return html;
  const aStart = html.lastIndexOf('<a', ti);
  const teamsLink = anchorAt(html, aStart);
  if (!teamsLink || html.includes('href="scores.html"')) return html;
  const r = makeScoresLink(html);
  if (!r) return html;
  return html.slice(0, aStart + teamsLink.length) + r.scoresLink + html.slice(aStart + teamsLink.length);
}

// 1) add Scores to home + teams menus
let homeOut = injectScores(home);
fs.writeFileSync(ROOT + '/index.html', homeOut);
let teams = fs.readFileSync(ROOT + '/teams.html', 'utf8');
teams = injectScores(teams);
fs.writeFileSync(ROOT + '/teams.html', teams);

// 2) build the menu block for scores.html (with Scores link added, marked current)
let menuForScores = injectScores('<x>' + menuBlock + '</x>').slice(3, -4); // reuse injector on the block
// mark Scores as current in the scores page menu
menuForScores = menuForScores.replace('href="scores.html" class="prevent', 'href="scores.html" class="prevent current ');

// 3) inject nav + menu + toggle CSS/JS into scores.html
let scores = fs.readFileSync(ROOT + '/scores.html', 'utf8');
const css = `<style id="mba-home-menu">
  .nav{position:fixed;top:0;left:0;right:0;z-index:1200;} .nav,.nav *{mix-blend-mode:normal !important;}
  .nav-menu-logo,.nav-menu-other-logos{display:none !important;}
  .nav-menu-wrap{position:fixed;inset:0;z-index:1100;pointer-events:none;} body.menu-open .nav-menu-wrap{pointer-events:auto;}
  .nav-menu{position:fixed !important;inset:0 !important;height:100vh !important;transform:translate(0,100%);transition:transform .55s cubic-bezier(.76,0,.24,1) !important;}
  body.menu-open .nav-menu{transform:translate(0,0%) !important;}
  .nav-menu-btn-text.close{display:none;} body.menu-open .nav-menu-btn-text.menu{display:none;} body.menu-open .nav-menu-btn-text.close{display:flex;}
  body.menu-open{overflow:hidden;}
  @media(max-width:640px){.nav-menu-link .integral-120-900-144{font-size:10.5vw !important;line-height:.92 !important;}}
</style>`;
const js = `<script>(function(){var btn=document.querySelector('.nav-menu-btn');if(!btn)return;
  btn.addEventListener('click',function(){document.body.classList.toggle('menu-open');});
  document.querySelectorAll('.nav-menu-link, .nav-menu a').forEach(function(a){a.addEventListener('click',function(){document.body.classList.remove('menu-open');});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')document.body.classList.remove('menu-open');});})();<\/script>`;
scores = scores.replace('<!--NAVMENU-->', navBlock + '\n' + menuForScores);
scores = scores.replace('</head>', css + '</head>');
scores = scores.replace('</body>', js + '</body>');
fs.writeFileSync(ROOT + '/scores.html', scores);

console.log('home has Scores link:', homeOut.includes('href="scores.html"'));
console.log('teams has Scores link:', teams.includes('href="scores.html"'));
console.log('scores nav injected:', scores.includes('nav-menu-wrap') && scores.includes('href="scores.html"'));
