const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(3500);
  const r = await p.evaluate(() => ({
    countupLoaded: !!window.__cuLoaded || !![...document.scripts].find(s=>/countup\.js/.test(s.src)),
    introGone: !document.querySelector('.intro, .loader') || getComputedStyle(document.body).overflow !== 'hidden'
  }));
  console.log(JSON.stringify({ errors: errs, ...r }));
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
