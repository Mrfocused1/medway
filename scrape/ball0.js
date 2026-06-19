const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(5500);
  const f = await p.evaluate(()=>{const c=document.querySelector('.ball-embed canvas, .basketball-container canvas');return c?getComputedStyle(c).filter:'none';});
  console.log('canvas filter:', f);
  await p.screenshot({ path:'scrape/shots/ball-top.png' });
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
