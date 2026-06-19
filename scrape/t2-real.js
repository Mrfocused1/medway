const { webkit } = require("playwright");
(async () => {
  const b = await webkit.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto("http://localhost:4322/teams.html", { waitUntil: "networkidle", timeout: 60000 });
  await p.waitForTimeout(2500);
  const total = await p.evaluate(() => document.querySelectorAll(".team-card").length);
  await p.evaluate(() => { const s = document.getElementById("fDiv"); s.value = "Division One"; s.dispatchEvent(new Event("input")); });
  await p.waitForTimeout(300);
  const d1 = await p.evaluate(() => document.getElementById("count").textContent);
  await p.evaluate(() => { const s = document.getElementById("fDiv"); s.value = "Division Two"; s.dispatchEvent(new Event("input")); });
  await p.waitForTimeout(300);
  const d2 = await p.evaluate(() => document.getElementById("count").textContent);
  const opts = await p.evaluate(() => ({
    div: [...document.getElementById("fDiv").options].map(o => o.text),
    age: [...document.getElementById("fAge").options].map(o => o.text),
    gender: [...document.getElementById("fGender").options].map(o => o.text),
    towns: [...document.getElementById("fTown").options].length - 1
  }));
  await p.evaluate(() => { const s = document.getElementById("fDiv"); s.value = ""; s.dispatchEvent(new Event("input")); });
  await p.screenshot({ path: "scrape/shots/t2-real.png" });
  console.log(JSON.stringify({ total, divOne: d1, divTwo: d2, opts, errors: errs }, null, 1));
  await b.close();
})().catch(e => { console.error("ERR", e.message); process.exit(1); });
