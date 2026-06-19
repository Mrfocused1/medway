const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const logs = [];
  page.on('console', m => logs.push('['+m.type()+'] ' + m.text().slice(0,300)));
  page.on('pageerror', e => logs.push('[PAGEERROR] ' + e.message));
  page.on('requestfailed', r => { if(!r.url().includes('google')) logs.push('[REQFAIL] '+r.url()); });
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 7000));
  const info = await page.evaluate(() => ({
    gsap: typeof window.gsap,
    jQuery: typeof window.jQuery,
    loadScript: !!(window.jQuery && window.jQuery.loadScript),
    barba: typeof window.barba,
    loadEmbed: (document.querySelector('.load-embed')||{}).className || '(none)',
    pageLoadTransform: (() => { const e=document.querySelector('.page-load'); return e?getComputedStyle(e).transform:'(none)'; })(),
    pageLoadClass: (document.querySelector('.page-load')||{}).className || '(none)',
    ballCanvas: !!document.querySelector('canvas'),
    canvasCount: document.querySelectorAll('canvas').length,
  }));
  console.log(JSON.stringify(info, null, 2));
  console.log('--- LOGS ---\n' + logs.join('\n'));
  await browser.close();
})();
