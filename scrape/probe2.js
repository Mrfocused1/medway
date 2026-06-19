const { webkit } = require("playwright");
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:4322/teams.html", { waitUntil: "networkidle", timeout: 60000 });
  await p.waitForTimeout(1500);
  await p.click(".nav-menu-btn"); await p.waitForTimeout(900);
  const g = (s) => p.evaluate((sel) => {
    const e = document.querySelector(sel); if (!e) return null;
    const c = getComputedStyle(e); const r = e.getBoundingClientRect();
    return { tag:e.tagName, cls:e.className, h: Math.round(r.height), top:Math.round(r.top), overflow: c.overflow, lineHeight: c.lineHeight, fontSize: c.fontSize, padT: c.paddingTop, mTop:c.marginTop };
  }, s);
  console.log("link", JSON.stringify(await g(".nav-menu-link")));
  console.log("linkText", JSON.stringify(await g(".nav-menu-link .integral-120-900-144")));
  // first link inner heading element
  console.log("firstHeadingChild", JSON.stringify(await p.evaluate(()=>{
    const l=document.querySelector(".nav-menu-link"); if(!l) return null;
    const kids=[...l.children].map(k=>({tag:k.tagName,cls:k.className,oh:getComputedStyle(k).overflow,lh:getComputedStyle(k).lineHeight,fs:getComputedStyle(k).fontSize,h:Math.round(k.getBoundingClientRect().height)}));
    return kids;
  })));
  await b.close();
})().catch(e=>{console.error("ERR",e.message);process.exit(1);});
