const { webkit } = require("playwright");
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:4322/teams.html", { waitUntil: "networkidle", timeout: 60000 });
  await p.waitForTimeout(2000);
  const g = (s) => p.evaluate((sel) => {
    const e = document.querySelector(sel); if (!e) return null;
    const c = getComputedStyle(e); const r = e.getBoundingClientRect();
    return { h: Math.round(r.height), overflow: c.overflow, lineHeight: c.lineHeight, fontSize: c.fontSize, padT: c.paddingTop, padB: c.paddingBottom, alignItems: c.alignItems, display: c.display };
  }, s);
  console.log("btn", JSON.stringify(await g(".nav-menu-btn")));
  console.log("text", JSON.stringify(await g(".nav-menu-btn-text.menu")));
  console.log("inner", JSON.stringify(await g(".nav-menu-btn-text.menu .integral-18-700-18")));
  await b.close();
})().catch(e => { console.error("ERR", e.message); process.exit(1); });
