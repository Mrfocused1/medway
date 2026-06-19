const { webkit } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage();
  let hdrs=null; const ops=[];
  p.on('request', r => { if(/spectator\.playhq\.com\/graphql/.test(r.url())){ if(!hdrs) hdrs=r.headers(); try{ops.push(JSON.parse(r.postData()||'{}').operationName);}catch(e){} } });
  await p.goto('https://www.playhq.com/basketball-victoria/org/knox-basketball-association-inc/senior-domestic-summer-202425/teams/threefrows/9f6a5ef9/ladder',{waitUntil:'networkidle',timeout:60000}).catch(()=>{});
  await p.waitForTimeout(4000);
  fs.writeFileSync('/tmp/phq-hdrs.json', JSON.stringify(hdrs,null,1));
  console.log('ops:', ops.join(','));
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
