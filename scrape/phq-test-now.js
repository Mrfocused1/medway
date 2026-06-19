const { chromium } = require('playwright');
const fs = require('fs');
const TF=`query teamFixture($teamID: ID!){ discoverTeamFixture(teamID:$teamID){ fixture{ games{ id status{value} date home{ ... on DiscoverTeam{name} ... on ProvisionalTeam{name} } away{ ... on DiscoverTeam{name} ... on ProvisionalTeam{name} } result{ winner{value} home{ statistics{ count type{value} } } away{ statistics{ count type{value} } } } allocation{ court{ venue{ name } } } } } } }`;
(async () => {
  const b = await chromium.launch({ args:['--disable-blink-features=AutomationControlled'] });
  const ctx = await b.newContext({ viewport:{width:1366,height:1400}, userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36', locale:'en-AU' });
  const p = await ctx.newPage();
  const caps={};
  p.on('response', async res=>{ if(/spectator\.playhq\.com\/graphql/.test(res.url())){ try{ const op=JSON.parse(res.request().postData()||'{}').operationName; if(!caps[op]) caps[op]=await res.json(); }catch(e){} } });
  await p.goto('https://www.playhq.com/basketball-victoria/org/knox-basketball-association-inc/senior-domestic-summer-202425/teams/threefrows/9f6a5ef9/ladder',{waitUntil:'load',timeout:60000}).catch(()=>{});
  await p.waitForTimeout(2500);
  for(const t of ['Allow all','Accept all','Accept']){ try{ const el=p.getByRole('button',{name:t}).first(); if(await el.isVisible().catch(()=>false)){ await el.click(); break; } }catch(e){} }
  await p.waitForTimeout(6000);
  const fx = await p.evaluate(async ([q,team])=>{ try{ const r=await fetch('https://spectator.playhq.com/graphql',{method:'POST',headers:{'content-type':'application/json','tenant':'basketball-victoria'},body:JSON.stringify({operationName:'teamFixture',query:q,variables:{teamID:team}})}); return {status:r.status, body:await r.text()}; }catch(e){ return {error:String(e)}; } },[TF,'9f6a5ef9']);
  fs.writeFileSync('/tmp/phq-test.json', JSON.stringify({nav:Object.keys(caps), ladderOK:!!caps.teamLadder, fx},null,1));
  console.log('BLOCK CLEARED?', caps.teamLadder?'YES (ladder loaded)':'NO (no nav ops)', '| in-page fetch status:', fx.status||fx.error);
  if(fx.body){ try{ const j=JSON.parse(fx.body); const games=(j.data&&j.data.discoverTeamFixture&&j.data.discoverTeamFixture.fixture||[]).flatMap(r=>r.games||[]); console.log('GAMES RETURNED:', games.length); if(games[0]) console.log('sample:', JSON.stringify(games.find(g=>g.result&&g.result.home&&(g.result.home.statistics||[]).length)||games[0]).slice(0,400)); }catch(e){ console.log('body:', fx.body.slice(0,200)); } }
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
