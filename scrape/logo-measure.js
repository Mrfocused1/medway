const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  for (const url of ['http://localhost:4322/','http://localhost:4322/teams.html']) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await p.waitForTimeout(3000);
    await p.click('.nav-menu-btn'); await p.waitForTimeout(800);
    const r = await p.evaluate(() => {
      // the fixed brand logo (top-left) — find the visible img inside .nav
      const imgs = [...document.querySelectorAll('.nav img, .nav svg')].filter(i=>{const b=i.getBoundingClientRect();return b.width>10&&b.left<200&&b.top<160;});
      const logo = imgs[0];
      const lr = logo && logo.getBoundingClientRect();
      const home = [...document.querySelectorAll('.nav-menu-link')].find(l=>/HOME/i.test(l.textContent));
      const ht = home && home.querySelector('.integral-120-900-144');
      const hr = ht && ht.getBoundingClientRect();
      return {
        logo: lr && {l:Math.round(lr.left),t:Math.round(lr.top),r:Math.round(lr.right),btm:Math.round(lr.bottom)},
        logoSel: logo && (logo.className||logo.tagName),
        homeText: hr && {l:Math.round(hr.left),t:Math.round(hr.top),fs:getComputedStyle(ht).fontSize}
      };
    });
    console.log(url, JSON.stringify(r));
    await p.close();
  }
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
