const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const out = {};
  for (const [url,name] of [['http://localhost:4322/','home'],['http://localhost:4322/teams.html','teams'],['http://localhost:4322/scores.html','scores'],['http://localhost:4322/contact.html','contact']]) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await p.waitForTimeout(2500);
    await p.evaluate(() => { const f=document.querySelector('.footer'); if(f) f.scrollIntoView({block:'end'}); });
    await p.waitForTimeout(700);
    const info = await p.evaluate(() => {
      const f=document.querySelector('.footer'); if(!f) return {found:false};
      const r=f.getBoundingClientRect();
      const imgs=[...f.querySelectorAll('img')];
      return { found:true, h:Math.round(r.height), w:Math.round(r.width),
        imgs:imgs.length, imgsLoaded:imgs.filter(i=>i.complete&&i.naturalWidth>0).length,
        links:[...f.querySelectorAll('a')].length,
        text:f.innerText.replace(/\s+/g,' ').trim().slice(0,80) };
    });
    out[name]={...info,errors:errs.slice(0,3)};
    await p.screenshot({ path:'scrape/shots/foot-'+name+'.png', clip:{x:0,y:Math.max(0,900-Math.min(900,info.h||500)),width:1440,height:Math.min(900,info.h||500)} }).catch(()=>{});
    await p.close();
  }
  console.log(JSON.stringify(out,null,1));
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
