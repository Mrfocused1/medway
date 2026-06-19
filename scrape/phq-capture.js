const { webkit } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  const captures = [];
  let tenantHdr = null;
  p.on('response', async (res) => {
    const u = res.url();
    if (/spectator\.playhq\.com\/graphql|api\.playhq\.com\/graphql/.test(u)) {
      try {
        const req = res.request();
        const h = req.headers();
        if (h.tenant) tenantHdr = h.tenant;
        const body = await res.json();
        captures.push({ status: res.status(), op: (JSON.parse(req.postData()||'{}').operationName)||'?', data: body });
      } catch (e) {}
    }
  });
  const base = 'https://www.playhq.com/basketball-victoria/org/knox-basketball-association-inc/senior-domestic-summer-202425/teams/threefrows/9f6a5ef9';
  for (const tab of ['/ladder', '/fixture']) {
    await p.goto(base + tab, { waitUntil: 'networkidle', timeout: 60000 }).catch(()=>{});
    await p.waitForTimeout(3500);
  }
  fs.writeFileSync('/tmp/phq-data.json', JSON.stringify({ tenantHdr, ops: captures.map(c=>c.op), captures }, null, 1));
  console.log('tenant header:', tenantHdr);
  console.log('ops captured:', captures.map(c=>c.op).join(', '));
  console.log('total captures:', captures.length);
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
