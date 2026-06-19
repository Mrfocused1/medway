const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  // homepage big 3D ball near top
  let p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(5000);
  for (const y of [0, 300, 600]) {
    await p.evaluate(v=>window.scrollTo(0,v), y);
    await p.waitForTimeout(900);
    await p.screenshot({ path:`scrape/shots/ball-home-${y}.png` });
  }
  await p.close();
  // contact ball
  p = await b.newPage({ viewport: { width: 1280, height: 700 } });
  await p.goto('http://localhost:4322/contact.html', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2000);
  await p.screenshot({ path:'scrape/shots/ball-contact.png', clip:{x:640,y:0,width:640,height:560} });
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
