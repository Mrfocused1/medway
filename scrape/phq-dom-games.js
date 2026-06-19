const { webkit } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await webkit.launch();
  const ctx = await b.newContext({ viewport:{width:1280,height:2200}, userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15', locale:'en-AU' });
  const p = await ctx.newPage();
  const caps={};
  p.on('response', async res=>{ if(/spectator\.playhq\.com\/graphql/.test(res.url())){ try{ const op=JSON.parse(res.request().postData()||'{}').operationName; if(!caps[op]) caps[op]=await res.json(); }catch(e){} } });
  await p.goto('https://www.playhq.com/basketball-victoria/org/collingwood-basketball-association/senior-domestic-sunday-autumn-2026/teams/86ers/a2ed1548/fixture',{waitUntil:'load',timeout:60000}).catch(()=>{});
  await p.waitForTimeout(2500);
  for(const t of ['Allow all','Accept all','Accept']){ try{ const el=p.getByRole('button',{name:t}).first(); if(await el.isVisible().catch(()=>false)){ await el.click(); break; } }catch(e){} }
  await p.waitForTimeout(8000);
  await p.screenshot({path:'scrape/shots/phq-dom.png',fullPage:true}).catch(()=>{});
  const text = await p.evaluate(()=>document.body.innerText);
  fs.writeFileSync('/tmp/phq-cw.json', JSON.stringify(caps,null,1));
  fs.writeFileSync('/tmp/phq-domtext.txt', text);
  console.log('ops:', Object.keys(caps).join(',')||'none');
  console.log('--- rendered fixture text ---');
  console.log(text.slice(0, 2200));
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
