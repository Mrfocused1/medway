const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  for (const [port,tag] of [[4321,'GREY'],[4322,'ORANGE']]) {
    const p = await b.newPage(); await p.setViewport({width:1440,height:900});
    await p.goto('http://localhost:'+port+'/',{waitUntil:'networkidle2',timeout:60000});
    await new Promise(r=>setTimeout(r,2500));
    await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
    await new Promise(r=>setTimeout(r,1200));
    const info = await p.evaluate(() => {
      const out = [];
      const els = document.querySelectorAll('img, canvas, [class*="ball"], [class*="bola"], [class*="basket"]');
      els.forEach(e => {
        const r = e.getBoundingClientRect();
        const cs = getComputedStyle(e);
        const visible = r.width>2 && r.height>2 && cs.display!=='none' && cs.visibility!=='hidden' && +cs.opacity>0.05;
        // only report things in/near the footer viewport
        if (r.bottom > -200 && r.top < window.innerHeight+400) {
          out.push({
            tag: e.tagName.toLowerCase(),
            cls: (e.className||'').toString().slice(0,40),
            src: (e.currentSrc||e.src||'').split('/').slice(-1)[0].slice(0,40),
            broken: e.tagName==='IMG' ? (e.complete && e.naturalWidth===0) : null,
            w: Math.round(r.width), h: Math.round(r.height),
            disp: cs.display, vis: cs.visibility, op: cs.opacity,
            visible
          });
        }
      });
      return out;
    });
    console.log('\n===== '+tag+' (footer) =====');
    info.filter(x=>/ball|bola|basket|canvas|sequence/i.test(x.cls+x.src+x.tag)).forEach(x=>console.log(JSON.stringify(x)));
    await p.close();
  }
  await b.close();
})();
