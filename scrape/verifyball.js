const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new',
    args: ['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 760 });
  await page.goto('http://localhost:4321/ball-viewer.html', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 5000));
  const info = await page.evaluate(async () => {
    const mv = document.getElementById('mv');
    const out = { loaded: mv.loaded, modelVisible: mv.modelIsVisible };
    try {
      const dim = mv.getDimensions && mv.getDimensions();
      out.dimensions = dim;
    } catch(e) { out.dimErr = e.message; }
    // read the internal canvas pixels to see if anything was drawn
    const cv = mv.shadowRoot && mv.shadowRoot.querySelector('canvas');
    if (cv) {
      out.canvas = { w: cv.width, h: cv.height };
      try {
        const data = mv.toDataURL ? mv.toDataURL('image/png') : null;
        if (data) {
          // decode brightness by sampling: load into an offscreen and count non-dark px
          const img = new Image();
          await new Promise(res => { img.onload = res; img.onerror = res; img.src = data; });
          const c = document.createElement('canvas'); c.width = 80; c.height = 55;
          const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, 80, 55);
          const px = ctx.getImageData(0,0,80,55).data;
          let lit=0, orangey=0, n=px.length/4;
          for (let i=0;i<px.length;i+=4){
            const r=px[i],g=px[i+1],b=px[i+2];
            if (r+g+b > 90) lit++;
            if (r>110 && g>40 && g<170 && b<110 && r>g && g>b) orangey++;
          }
          out.litPct = Math.round(100*lit/n);
          out.orangePct = Math.round(100*orangey/n);
        }
      } catch(e){ out.pxErr = e.message; }
    }
    return out;
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
