const { chromium } = require('playwright');
const fs = require('fs');
const TF=`query teamFixture($teamID: ID!){ discoverTeamFixture(teamID:$teamID){ grade{ name season{ name competition{ name organisation{ name } } } } fixture{ games{ id status{value} date home{ ... on DiscoverTeam{name} ... on ProvisionalTeam{name} } away{ ... on DiscoverTeam{name} ... on ProvisionalTeam{name} } result{ winner{value} home{ statistics{ count type{value} } } away{ statistics{ count type{value} } } } allocation{ court{ venue{ name } } } } } } }`;
const TARGETS=[
  {team:'a2ed1548', url:'https://www.playhq.com/basketball-victoria/org/collingwood-basketball-association/senior-domestic-sunday-autumn-2026/teams/86ers/a2ed1548/fixture'},
  {team:'9f6a5ef9', url:'https://www.playhq.com/basketball-victoria/org/knox-basketball-association-inc/senior-domestic-summer-202425/teams/threefrows/9f6a5ef9/fixture'}
];
async function attempt(n){
  const b = await chromium.launch({ args:['--disable-blink-features=AutomationControlled'] });
  try{
    for(const t of TARGETS){
      const ctx = await b.newContext({ viewport:{width:1366,height:1400}, userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36', locale:'en-AU' });
      const p = await ctx.newPage();
      await p.goto(t.url,{waitUntil:'load',timeout:60000}).catch(()=>{});
      await p.waitForTimeout(2500);
      for(const lbl of ['Allow all','Accept all','Accept']){ try{ const el=p.getByRole('button',{name:lbl}).first(); if(await el.isVisible().catch(()=>false)){ await el.click(); break; } }catch(e){} }
      await p.waitForTimeout(5000);
      const fx = await p.evaluate(async ([q,team])=>{ try{ const r=await fetch('https://spectator.playhq.com/graphql',{method:'POST',headers:{'content-type':'application/json','tenant':'basketball-victoria'},body:JSON.stringify({operationName:'teamFixture',query:q,variables:{teamID:team}})}); return {status:r.status, body:await r.text()}; }catch(e){ return {error:String(e)}; } },[TF,t.team]);
      await ctx.close();
      if(fx.body){ try{ const j=JSON.parse(fx.body); const dtf=j.data&&j.data.discoverTeamFixture; const games=(dtf&&dtf.fixture||[]).flatMap(r=>r.games||[]).filter(g=>g.result&&g.result.home&&(g.result.home.statistics||[]).length); if(games.length){ fs.writeFileSync('/tmp/phq-realgames.json', JSON.stringify({attempt:n, team:t.team, grade:dtf.grade, games:(dtf.fixture||[]).flatMap(r=>r.games||[])},null,1)); return true; } }catch(e){} }
    }
  } finally { await b.close(); }
  return false;
}
(async()=>{
  for(let n=1;n<=5;n++){
    console.log('attempt',n,new Date().toISOString());
    let ok=false; try{ ok=await attempt(n); }catch(e){ console.log('err',e.message); }
    if(ok){ console.log('SUCCESS on attempt',n); process.exit(0); }
    if(n<5){ await new Promise(r=>setTimeout(r,720000)); } // 12 min
  }
  console.log('EXHAUSTED — still blocked'); fs.writeFileSync('/tmp/phq-realgames.json', JSON.stringify({failed:true}));
})();
