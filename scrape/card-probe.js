const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(3500);
  const r = await p.evaluate(() => {
    const list = document.querySelector('.arte-card-list');
    const col = document.querySelector('.arte-card-col');
    const cards = [...document.querySelectorAll('.arte-card')];
    const cs = el => el ? getComputedStyle(el) : null;
    return {
      listDisplay: cs(list)&&cs(list).display,
      listFlex: cs(list)&&cs(list).flexDirection,
      listW: list&&Math.round(list.getBoundingClientRect().width),
      colDisplay: cs(col)&&cs(col).display,
      cardBase: cs(cards[0])&&cs(cards[0]).fontSize,
      cards: cards.map(c=>{const r=c.getBoundingClientRect();return {l:Math.round(r.left),t:Math.round(r.top),w:Math.round(r.width)};}),
      itemPos: [...document.querySelectorAll('.arte-card-item')].map(i=>getComputedStyle(i).position+'/'+getComputedStyle(i).display)
    };
  });
  console.log(JSON.stringify(r,null,1));
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
