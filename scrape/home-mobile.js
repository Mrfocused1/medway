const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: 'scrape/shots/hm-1.png' });
  // info about hero heading
  const info = await p.evaluate(() => {
    const find = txt => [...document.querySelectorAll('h1,h2,div,span')].find(e => e.children.length===0 && /association/i.test(e.textContent));
    const a = find();
    const r = a && a.getBoundingClientRect();
    const cs = a && getComputedStyle(a);
    // hero containers
    const hero = document.querySelector('.hero, .hero-section, [class*="hero"], .header, .home-header');
    return {
      assocText: a && a.textContent.trim().slice(0,40),
      assocClass: a && a.className,
      assocBox: r && {l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right),b:Math.round(r.bottom),w:Math.round(r.width)},
      assocFontSize: cs && cs.fontSize,
      vw: window.innerWidth,
      heroClass: hero && hero.className,
      heroBox: hero && (h=>({h:Math.round(h.height),t:Math.round(h.top),b:Math.round(h.bottom)}))(hero.getBoundingClientRect())
    };
  });
  console.log(JSON.stringify(info,null,1));
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
