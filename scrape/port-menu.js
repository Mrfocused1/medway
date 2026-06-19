const fs = require('fs');
const ROOT = '/Users/paulbridges/Desktop/Medway Basketball Association/site-orange';
const home = fs.readFileSync(ROOT + '/index.html', 'utf8');

// balanced <div> extractor from the <div ...marker...>
function block(h, marker) {
  const at = h.indexOf(marker); if (at < 0) return null;
  const start = h.lastIndexOf('<div', at);
  let depth = 0; const re = /<div\b|<\/div>/g; re.lastIndex = start; let m;
  while ((m = re.exec(h))) { if (m[0] === '</div>') { depth--; if (depth === 0) return h.slice(start, re.lastIndex); } else depth++; }
  return null;
}
const navBlock = block(home, 'class="nav "') || block(home, 'class="nav"');
const menuBlock = block(home, 'class="nav-menu-wrap"');
if (!navBlock || !menuBlock) throw new Error('could not extract nav/menu blocks');

let t = fs.readFileSync(ROOT + '/teams.html', 'utf8');

// 1) replace teams' custom nav + menu-overlay (everything from <nav class="topnav"> up to <!-- HERO -->)
const navStart = t.indexOf('<nav class="topnav">');
const heroMark = t.indexOf('<!-- HERO -->');
if (navStart < 0 || heroMark < 0) throw new Error('teams nav/hero markers not found');
t = t.slice(0, navStart) + navBlock + '\n' + menuBlock + '\n\n' + t.slice(heroMark);

// 2) swap my custom menu JS IIFE for the home-style toggle
const jsStart = t.indexOf('/* ---------------- SLIDE-OUT MENU ---------------- */');
if (jsStart >= 0) {
  const jsEnd = t.indexOf('})();', jsStart) + 5;
  const newJs = `/* ---------------- SLIDE-OUT MENU (home-page parity) ---------------- */
(function(){
  const btn=document.querySelector('.nav-menu-btn');
  if(!btn) return;
  btn.addEventListener('click',()=>document.body.classList.toggle('menu-open'));
  document.querySelectorAll('.nav-menu-link, .nav-menu a').forEach(a=>a.addEventListener('click',()=>document.body.classList.remove('menu-open')));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.body.classList.remove('menu-open');});
})();`;
  t = t.slice(0, jsStart) + newJs + t.slice(jsEnd);
}

// 3) CSS to drive the slide + button state (Webflow IX2 isn't loaded here)
const css = `<style id="mba-home-menu">
  .nav{position:fixed;top:0;left:0;right:0;z-index:1200;}
  .nav,.nav *{mix-blend-mode:normal !important;}
  .nav-menu-wrap{position:fixed;inset:0;z-index:1100;pointer-events:none;}
  body.menu-open .nav-menu-wrap{pointer-events:auto;}
  .nav-menu{position:fixed !important;inset:0 !important;height:100vh !important;transform:translate(0,100%);transition:transform .55s cubic-bezier(.76,0,.24,1) !important;}
  body.menu-open .nav-menu{transform:translate(0,0%) !important;}
  .nav-menu-btn-text.close{display:none;}
  body.menu-open .nav-menu-btn-text.menu{display:none;}
  body.menu-open .nav-menu-btn-text.close{display:flex;}
  body.menu-open{overflow:hidden;}
</style>`;
if (!t.includes('id="mba-home-menu"')) t = t.replace('</head>', css + '</head>');

fs.writeFileSync(ROOT + '/teams.html', t);
console.log('ported home menu. nav', navBlock.length, 'menu', menuBlock.length, 'chars. teams size', t.length);
