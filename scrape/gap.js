const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(4500);
  const r = await p.evaluate(()=>{
    const sels=['.hero','.hero-title','.hero-subheader','.hero-subheader-content','.hero-subheader-anchor','.hero-images','.hero-image-left','.hero-image-right','.the-basketball','.basketball-container','.basketball-spacer'];
    const out={};
    for(const s of sels){ const e=document.querySelector(s); if(e){ const c=getComputedStyle(e); const b=e.getBoundingClientRect(); out[s]={top:Math.round(b.top),bottom:Math.round(b.bottom),h:Math.round(b.height),mt:c.marginTop,mb:c.marginBottom,pt:c.paddingTop,pb:c.paddingBottom,minH:c.minHeight}; } }
    // what's the subheader text bottom vs images top (the gap)
    const sub=document.querySelector('.hero-subheader-content .biotif-36-700-50');
    const imgs=document.querySelector('.hero-images');
    out._gap = sub&&imgs ? Math.round(imgs.getBoundingClientRect().top - sub.getBoundingClientRect().bottom) : null;
    return out;
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
