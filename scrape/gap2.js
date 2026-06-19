const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(4500);
  const r = await p.evaluate(()=>{
    const sub=document.querySelector('.hero-subheader-content .biotif-36-700-50');
    const img=document.querySelector('.hero-image-right');
    const ball=document.querySelector('.basketball-container');
    const hero=document.querySelector('.hero');
    const bb=e=>e?Math.round(e.getBoundingClientRect().top):null;
    return { subBottom:sub?Math.round(sub.getBoundingClientRect().bottom):null, imgTop:bb(img), ballTop:bb(ball), heroBottom:hero?Math.round(hero.getBoundingClientRect().bottom):null };
  });
  console.log(JSON.stringify(r));
  await p.screenshot({ path:'scrape/shots/gap-after.png' });
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
