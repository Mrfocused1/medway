const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const OUT = path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push('REQFAIL ' + r.url()));

  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2500));

  // capture full-page sections by scrolling
  const total = await page.evaluate(() => document.body.scrollHeight);
  const vh = 900;
  let i = 0;
  for (let y = 0; y < total; y += vh) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await new Promise(r => setTimeout(r, 900));
    await page.screenshot({ path: path.join(OUT, 'clone-' + String(i).padStart(2,'0') + '.png') });
    i++;
    if (i > 14) break;
  }
  console.log('pageHeight', total, 'shots', i);
  console.log('ERRORS:', errors.slice(0, 30).join('\n'));
  await browser.close();
})();
