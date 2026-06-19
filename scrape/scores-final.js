const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const errs=[]; const p = await b.newPage({ viewport: { width: 1440, height: 1200 } });
  p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:4322/scores.html', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2500);
  const r = await p.evaluate(()=>({
    seasonCards:[...document.querySelectorAll('#matches .match')].length,
    firstCard: (document.querySelector('#matches .match')||{}).innerText?.replace(/\s+/g,' ').trim().slice(0,80),
    standings:[...document.querySelectorAll('#standings tr')].length,
    tstats:[...document.querySelectorAll('#tstats .trow')].length,
    stats:[...document.querySelectorAll('.stat-number')].map(e=>e.textContent),
    docHeight: document.body.scrollHeight
  }));
  console.log(JSON.stringify({...r, errors:errs.slice(0,3)},null,1));
  await p.screenshot({ path:'scrape/shots/scores-fixed.png', fullPage:true });
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
