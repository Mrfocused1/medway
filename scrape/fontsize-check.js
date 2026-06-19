const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  for (const [url,name] of [['http://localhost:4322/','home'],['http://localhost:4322/teams.html','teams']]) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await p.waitForTimeout(2500);
    const r = await p.evaluate(() => {
      const cs = el => el ? getComputedStyle(el).fontSize : null;
      return {
        html: getComputedStyle(document.documentElement).fontSize,
        body: cs(document.body),
        footer: cs(document.querySelector('.footer')),
        rightHeader: cs(document.querySelector('.footer .integral-53-900-39')),
        footerLink: cs(document.querySelector('.footer .integral-35-700-41'))
      };
    });
    console.log(name, JSON.stringify(r));
    await p.close();
  }
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
