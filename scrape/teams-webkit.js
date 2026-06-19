const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 850 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.goto('http://localhost:4322/teams.html', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(3000);

  // 1) story ball pinned (Safari overflow:clip + sticky test)
  const story = await p.evaluate(() => document.querySelector('.story').offsetTop);
  const range = await p.evaluate(() => document.querySelector('.story').offsetHeight - window.innerHeight);
  for (const f of [0.4, 0.6]) { await p.evaluate(y => window.scrollTo(0, y), story + range * f); await p.waitForTimeout(1300); }
  await p.screenshot({ path: 'scrape/shots/teams-wk-story.png' });
  const stickyTop = await p.evaluate(() => Math.round(document.querySelector('.story .sticky').getBoundingClientRect().top));

  // 2) search filter test
  await p.evaluate(() => { const s = document.getElementById('search'); s.value = 'maidstone'; s.dispatchEvent(new Event('input')); });
  await p.waitForTimeout(400);
  const shown = await p.evaluate(() => [...document.querySelectorAll('.team-card')].filter(c => !c.classList.contains('hide')).length);
  await p.evaluate(() => { const s = document.getElementById('search'); s.value = ''; s.dispatchEvent(new Event('input')); });

  // 3) map: tiles + fly-to a team
  await p.evaluate(() => document.getElementById('map-sec').scrollIntoView());
  await p.waitForTimeout(1500);
  await p.evaluate(() => window.focusTeam && window.focusTeam('Canterbury Kings'));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'scrape/shots/teams-wk-map.png' });
  const tiles = await p.evaluate(() => document.querySelectorAll('.leaflet-tile-loaded').length);

  console.log(JSON.stringify({ stickyTop_shouldBe0: stickyTop, search_maidstone_count: shown, mapTilesLoaded: tiles, errors: errs.slice(0,5) }, null, 1));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
