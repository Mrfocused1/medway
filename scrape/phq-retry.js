const { webkit } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport:{width:1280,height:1000} });
  const caps={}; let hdrs=null;
  p.on('request', r=>{ if(/spectator\.playhq\.com\/graphql/.test(r.url()) && !hdrs) hdrs=r.headers(); });
  p.on('response', async res=>{ if(/spectator\.playhq\.com\/graphql/.test(res.url())){ try{ const op=JSON.parse(res.request().postData()||'{}').operationName; caps[op]=await res.json(); }catch(e){} } });
  // load ladder (reliably fires) then the grade fixtures page
  const base='https://www.playhq.com/basketball-victoria/org/knox-basketball-association-inc/senior-domestic-summer-202425/teams/threefrows/9f6a5ef9';
  await p.goto(base+'/ladder',{waitUntil:'networkidle',timeout:60000}).catch(()=>{});
  await p.waitForTimeout(3000);
  fs.writeFileSync('/tmp/phq-hdrs.json', JSON.stringify(hdrs,null,1));
  console.log('ops:', Object.keys(caps).join(',')||'none', '| got headers:', !!hdrs);
  if(hdrs) console.log('HEADERS:', JSON.stringify(hdrs));
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
