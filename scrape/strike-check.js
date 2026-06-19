const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  for (const [url,name] of [['http://localhost:4322/','home'],['http://localhost:4322/teams.html','teams'],['http://localhost:4322/scores.html','scores'],['http://localhost:4322/contact.html','contact']]) {
    for (const vw of [1440, 390]) {
      const p = await b.newPage({ viewport: { width: vw, height: 844 } });
      await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await p.waitForTimeout(vw===1440?2500:3500);
      await p.click('.nav-menu-btn'); await p.waitForTimeout(700);
      const r = await p.evaluate(()=>{
        const links=[...document.querySelectorAll('.nav-menu-link')];
        const struck=links.filter(l=>{const im=l.querySelector('img');return im&&+getComputedStyle(im).opacity>0.5;}).map(l=>l.textContent.replace(/\s+/g,' ').trim().slice(0,8));
        return {labels:links.map(l=>l.textContent.replace(/\s+/g,' ').trim().slice(0,8)), struck};
      });
      console.log(name, vw, '| links:', r.labels.join(','), '| struck:', r.struck.join(',')||'(none)');
      await p.close();
    }
  }
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
