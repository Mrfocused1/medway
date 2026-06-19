const { webkit } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await webkit.launch();
  const ctx = await b.newContext({ viewport:{width:1280,height:1600}, userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15' });
  const p = await ctx.newPage();
  const caps = {}; let hdrs=null;
  p.on('request', r=>{ if(/spectator\.playhq\.com\/graphql/.test(r.url()) && !hdrs) hdrs=r.headers(); });
  p.on('response', async res=>{ if(/spectator\.playhq\.com\/graphql/.test(res.url())){ try{ const op=JSON.parse(res.request().postData()||'{}').operationName; caps[op]=await res.json(); }catch(e){} } });
  const base='https://www.playhq.com/basketball-victoria/org/knox-basketball-association-inc/senior-domestic-summer-202425/teams/threefrows/9f6a5ef9';
  await p.goto(base+'/fixture',{waitUntil:'load',timeout:60000}).catch(()=>{});
  await p.waitForTimeout(2500);
  // accept cookies
  for (const sel of ['#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll','#CybotCookiebotDialogBodyButtonAccept','button:has-text("Allow all")','text=Allow all']) {
    const el = await p.$(sel); if (el) { await el.click().catch(()=>{}); break; }
  }
  await p.waitForTimeout(7000);
  await p.screenshot({path:'scrape/shots/phq-fixture2.png',fullPage:true}).catch(()=>{});
  fs.writeFileSync('/tmp/phq-hdrs.json', JSON.stringify(hdrs,null,1));
  fs.writeFileSync('/tmp/phq-caps.json', JSON.stringify(caps,null,1));
  console.log('ops:', Object.keys(caps).join(',')||'none', '| hdr keys:', hdrs?Object.keys(hdrs).join(','):'none');
  if(caps.teamFixture){ const rounds=caps.teamFixture.data.discoverTeamFixture.fixture; let g; for(const r of rounds){const x=(r.games||[]).find(y=>y.result&&y.result.home&&(y.result.home.statistics||[]).length); if(x){g=x;break;}} console.log('SAMPLE GAME:', JSON.stringify(g,null,1).slice(0,1100)); }
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
