const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const bad = [];
  page.on('response', r => { if (r.status() >= 400 && !r.url().includes('google')) bad.push(r.status()+' '+r.url()); });
  page.on('requestfailed', r => { if(!r.url().includes('google')) bad.push('FAIL '+r.url()); });
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(async () => { const h=document.body.scrollHeight; for(let y=0;y<=h;y+=200){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));} });
  await new Promise(r => setTimeout(r, 2000));
  console.log('non-google 4xx/failed:\n' + (bad.join('\n') || 'NONE'));
  await browser.close();
})();
