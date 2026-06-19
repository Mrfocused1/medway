const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  for (const [url,name] of [['http://localhost:4322/','home'],['http://localhost:4322/teams.html','teams']]) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await p.waitForTimeout(3000);
    await p.click('.nav-menu-btn'); await p.waitForTimeout(900);
    await p.screenshot({ path: 'scrape/shots/m-'+name+'.png', clip:{x:0,y:0,width:720,height:600} });
    await p.close();
  }
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
