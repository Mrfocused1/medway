const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  for (const w of [390, 360, 480]) {
    const p = await b.newPage({ viewport: { width: w, height: 800 } });
    await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
    await p.waitForTimeout(4000);
    const r = await p.evaluate(()=>{
      const el=[...document.querySelectorAll('.hero-subheader-content .biotif-36-700-50, .hero-subheader .biotif-36-700-50')][0];
      if(!el) return null;
      const cs=getComputedStyle(el); const rect=el.getBoundingClientRect();
      const lh=parseFloat(cs.lineHeight)||parseFloat(cs.fontSize)*1.2;
      return { fs:cs.fontSize, lh:cs.lineHeight, w:Math.round(rect.width), h:Math.round(rect.height), lines:Math.round(rect.height/lh), parentW:Math.round(el.parentElement.getBoundingClientRect().width), maxW:cs.maxWidth, textAlign:cs.textAlign };
    });
    console.log(w, JSON.stringify(r));
    await p.close();
  }
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
