const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  // desktop
  let p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto('http://localhost:4322/scores.html', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2500);
  await p.evaluate(()=>document.querySelector('.s-main').scrollIntoView());
  await p.waitForTimeout(600);
  await p.screenshot({ path:'scrape/shots/sl-desktop.png' });
  await p.close();
  // mobile
  p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('http://localhost:4322/scores.html', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2500);
  await p.screenshot({ path:'scrape/shots/sl-mobile.png', fullPage:true });
  const meta = await p.evaluate(()=>({
    docW: document.documentElement.scrollWidth, vw: innerWidth,
    cardMeta: (document.querySelector('.match-meta')||{}).innerText
  }));
  console.log(JSON.stringify(meta));
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
