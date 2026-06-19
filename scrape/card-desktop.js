const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(3500);
  await p.evaluate(()=>{const c=document.querySelector('.arte-card'); if(c) c.scrollIntoView({block:'center'});});
  await p.waitForTimeout(1200);
  const r = await p.evaluate(()=>{
    const items=[...document.querySelectorAll('.arte-card-item')];
    return items.map((it,i)=>{
      const cs=getComputedStyle(it); const r=it.getBoundingClientRect();
      const card=it.querySelector('.arte-card'); const ccs=card&&getComputedStyle(card);
      return {i, pos:cs.position, transform:cs.transform.slice(0,60), left:cs.left, top:cs.top, rot:(ccs&&ccs.transform||'').slice(0,40),
        box:{l:Math.round(r.left),t:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)}};
    });
  });
  console.log(JSON.stringify(r,null,1));
  await b.screenshot?.();
  await p.screenshot({path:'scrape/shots/dt-cards.png', clip:{x:0,y:200,width:1440,height:560}});
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
