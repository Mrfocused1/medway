const { webkit } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await webkit.launch();
  const ctx = await b.newContext({ viewport:{width:1280,height:1400}, userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15', locale:'en-AU' });
  const p = await ctx.newPage();
  const caps={};
  p.on('response', async res=>{ if(/spectator\.playhq\.com\/graphql/.test(res.url())){ try{ const op=JSON.parse(res.request().postData()||'{}').operationName; if(!caps[op]) caps[op]=await res.json(); }catch(e){} } });
  const base='https://www.playhq.com/basketball-victoria/org/knox-basketball-association-inc/senior-domestic-summer-202425/teams/threefrows/9f6a5ef9';
  await p.goto(base+'/fixture',{waitUntil:'load',timeout:60000}).catch(()=>{});
  await p.waitForTimeout(3000);
  // dismiss Cookie Information consent (try several)
  for(const t of ['Allow all','Accept all','Allow selection','Accept']){ try{ const el=await p.getByRole('button',{name:t}).first(); if(await el.isVisible().catch(()=>false)){ await el.click(); break; } }catch(e){} }
  await p.waitForTimeout(2000);
  // click Fixture tab explicitly
  try{ const fx=await p.getByText('Fixture',{exact:true}).first(); if(await fx.isVisible().catch(()=>false)) await fx.click(); }catch(e){}
  await p.waitForTimeout(6000);
  fs.writeFileSync('/tmp/phq-caps.json', JSON.stringify(caps,null,1));
  console.log('ops:', Object.keys(caps).join(',')||'none');
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
