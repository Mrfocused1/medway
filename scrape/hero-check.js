const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(4500);
  await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(500);
  await p.screenshot({ path:'scrape/shots/hero-nologo.png' });
  const v = await p.evaluate(()=>{const l=document.querySelector('.nav-logo-wrap');return l?getComputedStyle(l).display:'none-found';});
  console.log('nav-logo-wrap display:', v);
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
