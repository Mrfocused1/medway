const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:4322/scores.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  // wait for load event then sample quickly
  await p.waitForLoadState('load');
  const samples = [];
  for (const t of [120, 350, 700, 1500]) {
    await p.waitForTimeout(t - (samples.length?[120,350,700,1500][samples.length-1]:0));
    const v = await p.evaluate(() => {
      const els = [...document.querySelectorAll('.stat-number')].map(e=>e.textContent.trim());
      const ls = [...document.querySelectorAll('.leader .ls')].map(e=>e.textContent.trim());
      return { stat: els, leaders: ls };
    });
    samples.push({ t, ...v });
  }
  console.log(JSON.stringify(samples, null, 1));
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
