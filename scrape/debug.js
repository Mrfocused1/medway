const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const logs = [];
  page.on('console', m => logs.push('['+m.type()+'] ' + m.text()));
  page.on('pageerror', e => logs.push('[PAGEERROR] ' + e.message));
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 6000));
  const info = await page.evaluate(() => {
    const q = s => document.querySelector(s);
    const cls = s => { const e=q(s); return e ? e.className : '(none)'; };
    const sty = s => { const e=q(s); if(!e) return '(none)'; const c=getComputedStyle(e); return {disp:c.display,opacity:c.opacity,vis:c.visibility,pos:c.position,z:c.zIndex,h:e.offsetHeight}; };
    return {
      bodyOverflow: getComputedStyle(document.body).overflow,
      htmlOverflow: getComputedStyle(document.documentElement).overflow,
      scrollH: document.body.scrollHeight,
      pageLoad: { cls: cls('.page-load'), sty: sty('.page-load') },
      foucHide: cls('.fouc-hide'),
      hasBarba: !!q('[data-barba]'),
      sections: [...document.querySelectorAll('section, .section, [class*="section"]')].slice(0,12).map(e=>e.className),
      smoothWrapper: sty('.smooth-wrapper') ,
      bodyClasses: document.body.className,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  console.log('--- LOGS ---'); console.log(logs.join('\n'));
  await browser.close();
})();
