const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.goto('http://localhost:4322/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  // capture the intro very early (a few frames)
  for (const t of [200, 600, 1200]) { await p.waitForTimeout(t-(t===200?0:[200,600,1200][[200,600,1200].indexOf(t)-1])); await p.screenshot({ path:`scrape/shots/intro-${t}.png` }); }
  const info = await p.evaluate(()=>{
    const pl=document.querySelector('.page-load');
    const logo=document.querySelector('.page-load .artdunk-logo-trans');
    return { hasPageLoad:!!pl, pageLoadDisplay: pl?getComputedStyle(pl).display:'-', logoDisplay: logo?getComputedStyle(logo).display:'no-logo' };
  });
  console.log(JSON.stringify(info));
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
