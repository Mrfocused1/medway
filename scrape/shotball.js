const puppeteer = require('puppeteer');
const path = require('path');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 760, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  page.on('requestfailed', r => { if(!r.url().includes('google-analytics')) errs.push('REQFAIL ' + r.url()); });
  await page.goto('http://localhost:4321/ball-viewer.html', { waitUntil: 'networkidle2', timeout: 60000 });
  // wait for model-viewer to load + render a few rotation frames
  await new Promise(r => setTimeout(r, 4500));
  await page.screenshot({ path: path.join(__dirname, 'shots', 'ball-a.png') });
  // stop spin via JS rotate to a different angle for a second view
  await page.evaluate(() => { const mv=document.getElementById('mv'); mv.removeAttribute('auto-rotate'); mv.cameraOrbit='60deg 60deg 2.2m'; });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(__dirname, 'shots', 'ball-b.png') });
  console.log('errors:', errs.length ? errs.join('\n') : 'none');
  await browser.close();
})();
