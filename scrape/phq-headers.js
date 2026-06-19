const { webkit } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage();
  let hdrs=null, fixtureCap=null;
  p.on('request', r => { if(/spectator\.playhq\.com\/graphql/.test(r.url()) && !hdrs){ hdrs=r.headers(); } });
  p.on('response', async res => {
    if(/spectator\.playhq\.com\/graphql/.test(res.url())){
      try{ const op=(JSON.parse(res.request().postData()||'{}').operationName); if(op==='teamFixture'){ fixtureCap=await res.json(); } }catch(e){}
    }
  });
  const base='https://www.playhq.com/basketball-victoria/org/knox-basketball-association-inc/senior-domestic-summer-202425/teams/threefrows/9f6a5ef9';
  await p.goto(base+'/fixture',{waitUntil:'domcontentloaded',timeout:60000}).catch(()=>{});
  await p.waitForTimeout(9000);
  fs.writeFileSync('/tmp/phq-hdrs.json', JSON.stringify(hdrs,null,1));
  if(fixtureCap) fs.writeFileSync('/tmp/phq-tf.json', JSON.stringify(fixtureCap,null,1));
  console.log('captured headers keys:', hdrs?Object.keys(hdrs).join(','):'none');
  console.log('teamFixture captured:', !!fixtureCap);
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
