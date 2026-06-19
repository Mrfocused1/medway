const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT = path.join(__dirname, '..', 'site');
const ASSETS = path.join(OUT, 'assets', 'cdn');
fs.mkdirSync(ASSETS, { recursive: true });

const URL = 'https://betclic-artdunk.webflow.io';
const seen = new Set();
const captured = new Set();

function download(url) {
  return new Promise((resolve) => {
    const clean = url.split('#')[0];
    if (captured.has(clean)) return resolve();
    captured.add(clean);
    // local filename = path after domain, flattened
    let name;
    try {
      const u = new URL(clean);
      name = (u.hostname + u.pathname).replace(/[^a-zA-Z0-9._-]/g, '_');
    } catch { return resolve(); }
    const dest = path.join(ASSETS, name);
    const file = fs.createWriteStream(dest);
    https.get(clean, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) { file.close(); fs.unlinkSync(dest); return resolve(); }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', () => resolve());
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const urls = [];
  page.on('response', (resp) => {
    const u = resp.url();
    if ((u.includes('website-files.com') || u.includes('cloudfront.net')) && !seen.has(u)) {
      seen.add(u);
      urls.push(u);
    }
  });

  console.log('loading...');
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 120000 });

  // scroll the full page slowly to trigger lazy loading + sequence frames
  console.log('scrolling...');
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 80) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 1000));
  });
  await new Promise(r => setTimeout(r, 3000));

  // save rendered html
  const html = await page.content();
  fs.writeFileSync(path.join(__dirname, 'rendered.html'), html);

  console.log('captured ' + urls.length + ' asset urls');
  fs.writeFileSync(path.join(__dirname, 'asset-urls.txt'), urls.sort().join('\n'));

  // download all
  for (const u of urls) await download(u);
  console.log('downloaded ' + captured.size + ' files');

  await browser.close();
})();
