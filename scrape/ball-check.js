const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(4500);
  // scroll a bit to reveal the 3D ball mid-sequence
  await p.evaluate(()=>window.scrollTo(0, window.innerHeight*1.2));
  await p.waitForTimeout(1500);
  await p.screenshot({ path:'scrape/shots/ball-home.png' });
  const fil = await p.evaluate(()=>{
    const c=document.querySelector('.ball-embed canvas, .basketball-container canvas');
    const t=document.querySelector('.arte-logos-scroll-track img');
    return { canvasFilter: c?getComputedStyle(c).filter:'no-canvas', tickerFilter: t?getComputedStyle(t).filter:'no-ticker' };
  });
  console.log(JSON.stringify(fil));
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
