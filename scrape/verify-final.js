const { webkit } = require("playwright");
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto("http://localhost:4322/teams.html", { waitUntil: "networkidle", timeout: 60000 });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: "scrape/shots/final-nav-closed.png" });
  await p.click("#menuBtn"); await p.waitForTimeout(700);
  const menuOpen = await p.evaluate(() => document.getElementById("menuOverlay").classList.contains("open"));
  await p.screenshot({ path: "scrape/shots/final-menu-open.png" });
  await p.click("#menuClose"); await p.waitForTimeout(600);
  const menuClosed = await p.evaluate(() => !document.getElementById("menuOverlay").classList.contains("open"));
  await p.evaluate(() => document.querySelector(".main").scrollIntoView()); await p.waitForTimeout(2500);
  const st = await p.evaluate(() => ({
    tiles: document.querySelectorAll(".leaflet-tile-loaded").length,
    ballPins: document.querySelectorAll("img.ball-pin").length,
    redPins: document.querySelectorAll(".red-pin").length,
    brandText: !!document.querySelector(".topnav b"),
    subtitle: document.querySelector(".sub2").textContent
  }));
  await p.screenshot({ path: "scrape/shots/final-map-balls.png" });
  console.log(JSON.stringify({ menuOpen, menuClosed, ...st, errors: errs }, null, 1));
  await b.close();
})().catch(e => { console.error("ERR", e.message); process.exit(1); });
