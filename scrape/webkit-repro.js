const { webkit } = require('playwright');

(async () => {
  const browser = await webkit.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 800 } });
  await page.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3500);

  // scroll the ticker into view
  await page.evaluate(() => {
    const e = document.querySelector('.mba-ticker-text');
    if (e) window.scrollTo(0, window.scrollY + e.getBoundingClientRect().top - 280);
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'scrape/shots/webkit-ticker.png' });

  // computed style chain for the ticker ball img + ancestors
  const info = await page.evaluate(() => {
    const img = document.querySelector('img.liga-betclic-svg');
    if (!img) return { err: 'no ticker img' };
    const props = ['filter','mixBlendMode','opacity','webkitFilter','backdropFilter','isolation','backgroundColor','backgroundBlendMode'];
    const chain = [];
    let el = img, depth = 0;
    while (el && el !== document.documentElement && depth < 9) {
      const c = getComputedStyle(el);
      const row = { tag: el.tagName.toLowerCase(), cls: (el.className||'').toString().slice(0,34) };
      props.forEach(p => { const v = c[p]; if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '1' && v !== 'rgba(0, 0, 0, 0)') row[p] = v; });
      chain.push(row);
      el = el.parentElement; depth++;
    }
    // sample the rendered img pixel via canvas (WebKit's actual decode)
    let px = null;
    try {
      const cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight;
      const ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(cv.width/2, cv.height/2, 1, 1).data; px = [d[0],d[1],d[2],d[3]];
    } catch (e) { px = 'taint:' + e.message; }
    return { src: (img.currentSrc||img.src).split('/').pop(), centerPixel: px, chain };
  });
  console.log(JSON.stringify(info, null, 1));
  await browser.close();
})();
