const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  for (const [url,name] of [['http://localhost:4322/','home'],['http://localhost:4322/teams.html','teams'],['http://localhost:4322/scores.html','scores'],['http://localhost:4322/contact.html','contact']]) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    const errs=[]; p.on('pageerror',e=>errs.push(e.message));
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await p.waitForTimeout(2500);
    await p.evaluate(()=>{const f=document.querySelector('.footer'); if(f) f.scrollIntoView({block:'end'});});
    await p.waitForTimeout(700);
    const r = await p.evaluate(()=>{
      const fl=[...document.querySelectorAll('.footer .footer-link')];
      return { links:fl.map(a=>a.textContent.replace(/\s+/g,' ').trim()), struck:fl.filter(a=>{const im=a.querySelector('.strike-img');return im&&+getComputedStyle(im).opacity>0.5;}).map(a=>a.textContent.replace(/\s+/g,' ').trim()) };
    });
    if(name==='teams') await p.screenshot({path:'scrape/shots/ff-teams.png',clip:{x:0,y:420,width:1440,height:480}});
    console.log(name,'| footer links:',r.links.join(','),'| struck:',r.struck.join(',')||'(none)','| errors:',errs.slice(0,2).join(';')||'none');
    await p.close();
  }
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
