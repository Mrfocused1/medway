const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('http://localhost:4322/contact.html', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelector('.c-form').scrollIntoView({block:'start'}));
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'scrape/shots/cm-form.png' });
  await p.evaluate(() => document.querySelector('.c-aff').scrollIntoView({block:'start'}));
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'scrape/shots/cm-aff.png' });
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
