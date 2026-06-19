const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const errs = [];
  const out = {};

  // ---- HOME menu (logo not covering HOME, no competitions) ----
  let p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', e => errs.push('home:' + e.message));
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(3500);
  await p.click('.nav-menu-btn'); await p.waitForTimeout(900);
  await p.screenshot({ path: 'scrape/shots/v-home-menu.png' });
  out.home = await p.evaluate(() => {
    const links = [...document.querySelectorAll('.nav-menu-link-wrap a')].map(a => a.textContent.replace(/\s+/g, ' ').trim().slice(0, 18));
    const home = [...document.querySelectorAll('.nav-menu-link')].find(l => /HOME/i.test(l.textContent));
    const logo = document.querySelector('.nav .nav-logo, .nav img, .brand');
    const hr = home ? home.getBoundingClientRect() : null;
    const lr = logo ? logo.getBoundingClientRect() : null;
    return {
      links, hasCompetitions: links.some(t => /ompeti/i.test(t)),
      homeTop: hr && Math.round(hr.top), logoBottom: lr && Math.round(lr.bottom),
      overlap: hr && lr ? (lr.bottom > hr.top + 6) : null,
      cta: document.body.innerHTML.includes('View all competitions')
    };
  });
  await p.close();

  // ---- TEAMS menu (no cropped letters, no competitions) ----
  p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', e => errs.push('teams:' + e.message));
  await p.goto('http://localhost:4322/teams.html', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2500);
  await p.click('.nav-menu-btn'); await p.waitForTimeout(900);
  await p.screenshot({ path: 'scrape/shots/v-teams-menu.png' });
  out.teams = await p.evaluate(() => {
    const links = [...document.querySelectorAll('.nav-menu-link')];
    // detect top-crop: text element top above its link box top
    const cropped = links.filter(l => {
      const t = l.querySelector('.integral-120-900-144'); if (!t) return false;
      return t.getBoundingClientRect().top < l.getBoundingClientRect().top - 2 && getComputedStyle(l).overflow === 'hidden';
    }).length;
    return {
      labels: links.map(l => l.textContent.replace(/\s+/g, ' ').trim().slice(0, 16)),
      croppedClipped: cropped,
      overflow: links[0] && getComputedStyle(links[0]).overflow
    };
  });
  await p.close();

  // ---- SCORES hero (logo not covering title; bottom gradient) + countup ----
  p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', e => errs.push('scores:' + e.message));
  await p.goto('http://localhost:4322/scores.html', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2800);
  await p.screenshot({ path: 'scrape/shots/v-scores-top.png' });
  out.scores = await p.evaluate(() => {
    const title = document.querySelector('.s-title');
    const logo = document.querySelector('.nav img, .nav-logo, .brand');
    const tr = title && title.getBoundingClientRect();
    const lr = logo && logo.getBoundingClientRect();
    const nums = [...document.querySelectorAll('.stat-number')].map(e => e.textContent.trim());
    return {
      titleTop: tr && Math.round(tr.top), logoBottom: lr && Math.round(lr.bottom),
      overlap: tr && lr ? lr.bottom > tr.top + 6 : null,
      statNumbers: nums
    };
  });
  await p.close();

  // ---- CONTACT desktop ----
  p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', e => errs.push('contact:' + e.message));
  await p.goto('http://localhost:4322/contact.html', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2000);
  await p.screenshot({ path: 'scrape/shots/v-contact-desktop.png', fullPage: true });
  out.contact = await p.evaluate(() => ({
    hero: !!document.querySelector('.c-hero'),
    form: !!document.querySelector('.c-form'),
    aff: !!document.querySelector('.c-aff'),
    title: document.querySelector('.c-title') ? document.querySelector('.c-title').textContent.trim() : null,
    ballLoaded: (() => { const i = document.querySelector('.c-hero-ball'); return i ? (i.complete && i.naturalWidth > 0) : false; })(),
    docTitle: document.title
  }));
  // open menu, check Contact current
  await p.click('.nav-menu-btn'); await p.waitForTimeout(800);
  out.contact.currentLink = await p.evaluate(() => {
    const a = document.querySelector('.nav-menu a[href="contact.html"], .nav-menu-link[href="contact.html"]');
    return a ? a.className : null;
  });
  await p.close();

  // ---- CONTACT mobile ----
  p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('http://localhost:4322/contact.html', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'scrape/shots/v-contact-mobile.png', fullPage: true });
  await p.close();

  console.log(JSON.stringify({ ...out, errors: errs.slice(0, 8) }, null, 1));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
