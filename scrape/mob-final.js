const { webkit } = require('playwright');
(async () => {
  const b = await webkit.launch();
  // HOME mobile: menu + cards
  let p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(4000);
  // cards
  await p.evaluate(()=>{const c=document.querySelector('.arte-card'); if(c) c.scrollIntoView({block:'center'});});
  await p.waitForTimeout(1000);
  await p.screenshot({ path: 'scrape/shots/f-cards.png' });
  const cards = await p.evaluate(()=>[...document.querySelectorAll('.arte-card')].map(c=>{const r=c.getBoundingClientRect();return {l:Math.round(r.left),w:Math.round(r.width)};}));
  // menu
  await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(400);
  await p.click('.nav-menu-btn'); await p.waitForTimeout(900);
  await p.screenshot({ path: 'scrape/shots/f-menu.png' });
  const menu = await p.evaluate(()=>{
    const links=[...document.querySelectorAll('.nav-menu-link')];
    const boxes=links.map(l=>{const r=l.getBoundingClientRect();const t=l.querySelector('.integral-120-900-144');return {txt:l.textContent.replace(/\s+/g,' ').trim().slice(0,8),top:Math.round(r.top),bottom:Math.round(r.bottom)};});
    // overlap check: any link whose top < previous bottom
    let overlaps=0; for(let i=1;i<boxes.length;i++){ if(boxes[i].top < boxes[i-1].bottom-2) overlaps++; }
    const logo=[...document.querySelectorAll('.nav img, .nav svg')].filter(i=>{const b=i.getBoundingClientRect();return b.width>10&&b.left<200&&b.top<160;})[0];
    const lb=logo&&Math.round(logo.getBoundingClientRect().bottom);
    const x=document.querySelector('.nav-menu-btn'); const xr=x.getBoundingClientRect();
    const struck=links.filter(l=>{const im=l.querySelector('img');return im&&+getComputedStyle(im).opacity>0.1;}).map(l=>l.textContent.trim().slice(0,8));
    return {boxes,overlaps,logoBottom:lb,homeTop:boxes[0]&&boxes[0].top,xBtn:{l:Math.round(xr.left),r:Math.round(xr.right),t:Math.round(xr.top),b:Math.round(xr.bottom)},vw:innerWidth,struck};
  });
  await p.close();
  console.log('CARDS', JSON.stringify(cards));
  console.log('MENU', JSON.stringify(menu,null,1));
  // CONTACT ball
  p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:4322/contact.html', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2000);
  await p.screenshot({ path: 'scrape/shots/f-contact.png', clip:{x:0,y:0,width:1440,height:560} });
  await p.close();
  await b.close();
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
