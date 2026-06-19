const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(4000);
  await p.evaluate(()=>{const c=document.querySelector('.arte-card-list'); if(c) c.scrollIntoView({block:'center'});});
  await p.waitForTimeout(1200);
  const r = await p.evaluate(()=>{
    const cards=[...document.querySelectorAll('.arte-card')].map((c,i)=>{const r=c.getBoundingClientRect();const z=getComputedStyle(c.closest('.arte-card-item')).zIndex;return {i,l:Math.round(r.left),r:Math.round(r.right),z};});
    // estimate the center (top z) card range and how much of each side card is uncovered
    return { docW:document.documentElement.scrollWidth, vw:innerWidth, cards };
  });
  console.log(JSON.stringify(r));
  await p.screenshot({ path: 'scrape/shots/fan2.png' });
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
