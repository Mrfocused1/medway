const { chromium } = require('playwright');
const fs = require('fs');
const TEAM='a2ed1548'; // Collingwood 86ers (Autumn 2026, recent)
const TF=`query teamFixture($teamID: ID!){ discoverTeamFixture(teamID:$teamID){ fixture{ games{ id home{ ... on DiscoverTeam{name} ... on ProvisionalTeam{name} } away{ ... on DiscoverTeam{name} ... on ProvisionalTeam{name} } result{ winner{value} home{ statistics{ count type{value} } } away{ statistics{ count type{value} } } } status{value} date allocation{ court{ name venue{ name suburb } } } } } } }`;
(async () => {
  const b = await chromium.launch({ args:['--disable-blink-features=AutomationControlled'] });
  const ctx = await b.newContext({ viewport:{width:1366,height:1600}, userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36', locale:'en-AU' });
  const p = await ctx.newPage();
  const caps={};
  p.on('response', async res=>{ if(/spectator\.playhq\.com\/graphql/.test(res.url())){ try{ const op=JSON.parse(res.request().postData()||'{}').operationName; if(!caps[op]) caps[op]=await res.json(); }catch(e){} } });
  const base='https://www.playhq.com/basketball-victoria/org/collingwood-basketball-association/senior-domestic-sunday-autumn-2026/teams/86ers/a2ed1548';
  await p.goto(base+'/ladder',{waitUntil:'load',timeout:60000}).catch(()=>{});
  await p.waitForTimeout(2000);
  for(const t of ['Allow all','Accept all','Accept']){ try{ const el=p.getByRole('button',{name:t}).first(); if(await el.isVisible().catch(()=>false)){ await el.click(); break; } }catch(e){} }
  await p.waitForTimeout(6000);
  // in-page fetch for fixtures/results
  const fx = await p.evaluate(async ([q,team])=>{
    try{
      const r= await fetch('https://spectator.playhq.com/graphql',{method:'POST',headers:{'content-type':'application/json','tenant':'basketball-victoria'},body:JSON.stringify({operationName:'teamFixture',query:q,variables:{teamID:team}})});
      return {status:r.status, body: await r.text()};
    }catch(e){ return {error:String(e)}; }
  },[TF,TEAM]);
  fs.writeFileSync('/tmp/phq-cw.json', JSON.stringify(caps,null,1));
  fs.writeFileSync('/tmp/phq-fx.json', fx.body||JSON.stringify(fx));
  console.log('nav ops:', Object.keys(caps).join(',')||'none');
  console.log('in-page fetch status:', fx.status, fx.error||'');
  if(caps.teamLadder){ const t=caps.teamLadder.data.discoverTeam; console.log('LADDER grade:', t.grade.name, '| teams:', t.grade.ladder[0].standings.length); }
  console.log('fixture body head:', (fx.body||'').slice(0,300));
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
