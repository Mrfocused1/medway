const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: 'scrape/shots/mob-hero.png' });
  // measure hero title + page horizontal overflow
  const m = await p.evaluate(() => {
    const a = [...document.querySelectorAll('span')].find(e=>/association/i.test(e.textContent)&&e.children.length===0);
    const ar = a&&a.getBoundingClientRect();
    return { vw:innerWidth, docW:document.documentElement.scrollWidth, assocRight: ar&&Math.round(ar.right), assocFs: a&&getComputedStyle(a).fontSize };
  });
  console.log('HERO', JSON.stringify(m));
  // find the three cards (arte-card photo-card)
  const cards = await p.evaluate(() => {
    const cs=[...document.querySelectorAll('.arte-card.photo-card, .arte-card')];
    return cs.slice(0,6).map(c=>{const r=c.getBoundingClientRect();return {cls:c.className.slice(0,40),w:Math.round(r.width),h:Math.round(r.height),t:Math.round(r.top)};});
  });
  console.log('CARDS', JSON.stringify(cards));
  // scroll to first card section and shoot
  await p.evaluate(()=>{const c=document.querySelector('.arte-card.photo-card, .arte-card'); if(c) c.scrollIntoView({block:'center'});});
  await p.waitForTimeout(800);
  await p.screenshot({ path: 'scrape/shots/mob-cards.png' });
  // open menu
  await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(400);
  await p.click('.nav-menu-btn'); await p.waitForTimeout(900);
  await p.screenshot({ path: 'scrape/shots/mob-menu.png' });
  const menu = await p.evaluate(() => {
    const home=[...document.querySelectorAll('.nav-menu-link')].find(l=>/HOME/i.test(l.textContent));
    const ht=home&&home.querySelector('.integral-120-900-144');
    const logo=[...document.querySelectorAll('.nav img, .nav svg')].filter(i=>{const b=i.getBoundingClientRect();return b.width>10&&b.left<200&&b.top<160;})[0];
    const x=document.querySelector('.nav-menu-btn, .nav-menu-btn-text.close, [class*="close"]');
    const closeText=document.querySelector('.nav-menu-btn-text.close');
    const bb=el=>el&&(r=>({l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right),b:Math.round(r.bottom),w:Math.round(r.width),h:Math.round(r.height)}))(el.getBoundingClientRect());
    return { homeTextTop: ht&&Math.round(ht.getBoundingClientRect().top), logo:bb(logo), closeBtn:bb(x), closeText:bb(closeText), vw:innerWidth };
  });
  console.log('MENU', JSON.stringify(menu));
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
