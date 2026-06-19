const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto('http://localhost:4322/scores.html', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2500);
  const r = await p.evaluate(()=>({
    standings:[...document.querySelectorAll('#standings tr')].map(tr=>tr.innerText.replace(/\s+/g,' ').trim()),
    stats:[...document.querySelectorAll('.stat-number')].map(e=>e.textContent),
    teamstats:[...document.querySelectorAll('.trow')].map(t=>t.innerText.replace(/\s+/g,' ').trim())
  }));
  console.log(JSON.stringify(r,null,1));
  await p.evaluate(()=>document.querySelector('.s-main').scrollIntoView());
  await p.waitForTimeout(800);
  await p.screenshot({ path:'scrape/shots/scores-real.png', clip:{x:0,y:0,width:1440,height:1000} });
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
