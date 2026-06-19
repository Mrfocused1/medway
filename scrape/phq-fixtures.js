const { webkit } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 1200 } });
  const caps = [];
  p.on('response', async (res) => {
    if (/spectator\.playhq\.com\/graphql/.test(res.url())) {
      try { const op=(JSON.parse(res.request().postData()||'{}').operationName)||'?'; const data=await res.json(); caps.push({op,data}); } catch(e){}
    }
  });
  const base = 'https://www.playhq.com/basketball-victoria/org/knox-basketball-association-inc/senior-domestic-summer-202425/teams/threefrows/9f6a5ef9';
  await p.goto(base + '/fixture', { waitUntil: 'networkidle', timeout: 60000 }).catch(()=>{});
  await p.waitForTimeout(5000);
  await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight)).catch(()=>{});
  await p.waitForTimeout(3000);
  // try clicking a completed game link to load game centre (scores)
  const gameLink = await p.$('a[href*="/game-centre/"], a[href*="/game/"]');
  if (gameLink) { await gameLink.click().catch(()=>{}); await p.waitForTimeout(4000); }
  fs.writeFileSync('/tmp/phq-fx.json', JSON.stringify(caps,null,1));
  console.log('ops:', caps.map(c=>c.op).join(', '));
  const tf = caps.find(c=>c.op==='teamFixture');
  if (tf) {
    const dtf = tf.data.data.discoverTeamFixture;
    const rounds = dtf.fixture||[];
    console.log('rounds:', rounds.length);
    // print one game raw to see score structure
    for (const r of rounds){ if(r.games && r.games.length){ console.log('SAMPLE GAME:', JSON.stringify(r.games[0]).slice(0,1200)); break; } }
  }
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
