const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 850 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(4000); // let intro + barba init

  // click the Teams nav link (id artistas-link) and follow navigation
  await Promise.all([
    p.waitForNavigation({ timeout: 15000 }).catch(() => {}),
    p.evaluate(() => { const a = document.getElementById('artistas-link'); a && a.click(); })
  ]);
  await p.waitForTimeout(2500);

  const url = p.url();
  const teamsHeroVisible = await p.evaluate(() => {
    const h = document.querySelector('.hero h1');
    return h ? h.innerText.replace(/\s+/g,' ').trim() : '(no hero)';
  });
  const cards = await p.evaluate(() => document.querySelectorAll('.team-card').length);
  await p.screenshot({ path: 'scrape/shots/nav-to-teams.png' });
  console.log(JSON.stringify({ url, teamsHeroVisible, cards, errors: errs.slice(0,4) }, null, 1));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
