const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const out = {};
  const errs = [];
  // ---- TEAMS menu (should match home: clean links) ----
  let p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', e => errs.push('teams:' + e.message));
  await p.goto('http://localhost:4322/teams.html', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2500);
  await p.click('.nav-menu-btn'); await p.waitForTimeout(800);
  await p.screenshot({ path: 'scrape/shots/rev-teams-menu.png' });
  out.teamsMenu = await p.evaluate(() => {
    const links = [...document.querySelectorAll('.nav-menu-link')];
    const visibleStrikes = links.filter(l => { const im = l.querySelector('img'); return im && +getComputedStyle(im).opacity > 0.1; }).length;
    return { links: links.length, visibleStrikes, hasScores: !!document.querySelector('.nav-menu a[href="scores.html"]') };
  });
  await p.close();
  // ---- SCORES page ----
  p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', e => errs.push('scores:' + e.message));
  p.on('requestfailed', r => { if (!/google/.test(r.url())) errs.push('scoresREQ:' + r.url().split('/').pop()); });
  await p.goto('http://localhost:4322/scores.html', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: 'scrape/shots/rev-scores-top.png' });
  await p.evaluate(() => window.scrollTo(0, document.querySelector('.s-main').offsetTop));
  await p.waitForTimeout(600);
  await p.screenshot({ path: 'scrape/shots/rev-scores-main.png' });
  out.scores = await p.evaluate(() => ({
    matches: document.querySelectorAll('.match').length,
    standings: document.querySelectorAll('#standings tr').length,
    leaders: document.querySelectorAll('.leader').length,
    navMenu: !!document.querySelector('.nav-menu-btn')
  }));
  // open scores menu + navigate to teams
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
  await p.click('.nav-menu-btn'); await p.waitForTimeout(700);
  await p.screenshot({ path: 'scrape/shots/rev-scores-menu.png' });
  out.scoresMenuCurrent = await p.evaluate(() => { const a = document.querySelector('.nav-menu a[href="scores.html"]'); return a ? a.className.includes('current') : false; });
  await p.close();
  // ---- HOME menu has Scores ----
  p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(3500);
  out.homeHasScores = await p.evaluate(() => !!document.querySelector('.nav-menu a[href="scores.html"]'));
  await p.close();

  console.log(JSON.stringify({ ...out, errors: errs.slice(0, 6) }, null, 1));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
