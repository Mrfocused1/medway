const puppeteer=require("puppeteer");
(async()=>{
const b=await puppeteer.launch({headless:"new",args:["--no-sandbox","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]});
const p=await b.newPage();await p.setViewport({width:1440,height:850});
await p.goto("http://localhost:4322/teams.html",{waitUntil:"networkidle2",timeout:60000});
await new Promise(r=>setTimeout(r,3000));
await p.evaluate(()=>window.scrollTo(0,document.querySelector(".ticker").offsetTop-300));
await new Promise(r=>setTimeout(r,700));await p.screenshot({path:"scrape/shots/teams-ticker.png"});
const top=await p.evaluate(()=>document.querySelector(".story").offsetTop);
const range=await p.evaluate(()=>document.querySelector(".story").offsetHeight-window.innerHeight);
for(const f of [0.3,0.5,0.75]){ await p.evaluate((y)=>window.scrollTo(0,y),top+range*f); await new Promise(r=>setTimeout(r,1300)); }
await p.screenshot({path:"scrape/shots/teams-story2.png"});
const px=await p.evaluate(()=>{const c=document.getElementById("ballCanvas");const x=c.getContext("2d");try{const d=x.getImageData(350,350,1,1).data;return [d[0],d[1],d[2],d[3]];}catch(e){return "taint";}});
console.log("ball center pixel:",JSON.stringify(px));
await b.close();
})().catch(e=>{console.error("ERR",e.message);process.exit(1)});
