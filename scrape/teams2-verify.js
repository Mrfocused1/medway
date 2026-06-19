const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const errs = [];
  // ---- DESKTOP ----
  let p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.goto('http://localhost:4322/teams.html', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(3000);
  await p.screenshot({ path: 'scrape/shots/t2-desktop-top.png' });
  await p.evaluate(() => document.querySelector('.main').scrollIntoView());
  await p.waitForTimeout(2500);
  await p.screenshot({ path: 'scrape/shots/t2-desktop-main.png' });
  await p.evaluate(() => document.querySelector('.bottom').scrollIntoView());
  await p.waitForTimeout(800);
  await p.screenshot({ path: 'scrape/shots/t2-desktop-bottom.png' });
  // filter test
  await p.evaluate(() => { const s=document.getElementById('fTown'); s.value='Maidstone'; s.dispatchEvent(new Event('input')); });
  await p.waitForTimeout(400);
  const state = await p.evaluate(() => ({
    cards: document.querySelectorAll('.team-card').length,
    shown: [...document.querySelectorAll('.team-card')].filter(c=>!c.classList.contains('hide')).length,
    count: document.getElementById('count').textContent,
    tiles: document.querySelectorAll('.leaflet-tile-loaded').length,
    pins: document.querySelectorAll('.red-pin').length,
    feat: document.querySelectorAll('.feat-card').length,
    locs: document.querySelectorAll('.loc-row').length
  }));
  await p.close();
  // ---- MOBILE ----
  p = await b.newPage({ viewport: { width: 390, height: 844 } });
  p.on('pageerror', e => errs.push('MOB PAGEERR ' + e.message));
  await p.goto('http://localhost:4322/teams.html', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: 'scrape/shots/t2-mobile-top.png', fullPage:false });
  await p.evaluate(() => document.querySelector('.main').scrollIntoView());
  await p.waitForTimeout(2000);
  await p.screenshot({ path: 'scrape/shots/t2-mobile-main.png' });
  await p.close();
  console.log(JSON.stringify({ ...state, errors: errs.slice(0,6) }, null, 1));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
