const fs = require('fs');
const P = '/Users/paulbridges/Desktop/Medway Basketball Association/site-orange/scores.html';
let h = fs.readFileSync(P, 'utf8');

// keep everything before the first <script> (= clean head + body + footer from doc1)
const cut = h.indexOf('<script>');
if (cut < 0) throw new Error('no <script> found');
const prefix = h.slice(0, cut).replace(/\s+$/, '');

// real data (Knox BA — Thursday Men 8, Summer 2024/25, via PlayHQ)
const SUM = [
  {t:"BBB",p:21,w:18,l:3,pf:805,pa:622,diff:183,pts:57},
  {t:"Richard Wads",p:21,w:16,l:5,pf:963,pa:740,diff:223,pts:53},
  {t:"JetBLACKS",p:21,w:14,l:7,pf:661,pa:648,diff:13,pts:49},
  {t:"Pinky’s",p:21,w:13,l:8,pf:730,pa:661,diff:69,pts:47},
  {t:"Austrapean",p:20,w:9,l:9,pf:713,pa:662,diff:51,pts:43},
  {t:"Aquaholics",p:21,w:6,l:11,pf:653,pa:688,diff:-35,pts:37},
  {t:"Pink Panthers",p:21,w:7,l:14,pf:610,pa:739,diff:-129,pts:35},
  {t:"Simon",p:21,w:6,l:14,pf:645,pa:805,diff:-160,pts:34},
  {t:"Threefrows",p:21,w:5,l:15,pf:540,pa:689,diff:-149,pts:32},
  {t:"Y.E.S. Tigers",p:21,w:4,l:17,pf:541,pa:761,diff:-220,pts:29}
];
const STAND = SUM.map(s => ({t:s.t,p:s.p,w:s.w,l:s.l,pts:s.pts}));
const TS = [["Richard Wads",100,"45.9"],["BBB",83,"38.3"],["Austrapean",78,"35.6"],["Pinky's",76,"34.8"],["JetBLACKS",69,"31.5"],["Aquaholics",68,"31.1"]];

const script = `<script>
const ini = n => n.split(/\\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
/* REAL data via PlayHQ — Knox Basketball Association, Senior Domestic, Thursday Men 8 (Summer 2024/25) */
const SUM = ${JSON.stringify(SUM)};
document.getElementById('matches').innerHTML = SUM.map(m=>\`
  <article class="match">
    <div class="match-main">
      <div class="mt">\${m.t.replace(' ','<br>')}</div>
      <div class="badge"><span class="ini">\${ini(m.t)}</span></div>
      <div class="sc">\${m.w}</div>
      <div><div class="stat-final">W \\u2013 L</div><div class="mdate">\${m.p} games</div></div>
      <div><div class="sc">\${m.l}</div></div>
    </div>
    <div class="match-meta"><span><i>\\u25ce</i>\${m.pf} PF</span><span><i>\\u229d</i>\${m.pa} PA</span><span><i>\\u00b1</i>\${m.diff>0?'+':''}\${m.diff}</span><button class="stats-btn">\${m.pts} pts</button></div>
  </article>\`).join('');

const STAND = ${JSON.stringify(STAND)};
document.getElementById('standings').innerHTML = STAND.map((s,i)=>\`
  <tr class="\${i===0?'top':''}"><td>\${i+1}</td><td class="tn">\${s.t}</td><td>\${s.p}</td><td>\${s.w}</td><td>\${s.l}</td><td>\${s.pts}</td></tr>\`).join('');

const TS = ${JSON.stringify(TS)};
document.getElementById('tstats').innerHTML = TS.map(([l,w,v])=>\`
  <div class="trow"><span>\${l}</span><div class="bar"><span style="width:\${w}%"></span></div><strong>\${v}</strong></div>\`).join('');
</script>
<script>(function(){var btn=document.querySelector('.nav-menu-btn');if(!btn)return;
  btn.addEventListener('click',function(){document.body.classList.toggle('menu-open');});
  document.querySelectorAll('.nav-menu-link, .nav-menu a').forEach(function(a){a.addEventListener('click',function(){document.body.classList.remove('menu-open');});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')document.body.classList.remove('menu-open');});})();</script>
<script src="assets/js/countup.js"></script>
</body>
</html>
`;

fs.writeFileSync(P, prefix + '\n' + script);
const out = fs.readFileSync(P, 'utf8');
console.log('bodies:', (out.match(/<body/g)||[]).length, '| html tags:', (out.match(/<html/g)||[]).length, '| scripts:', (out.match(/<script/g)||[]).length);
console.log('matches/standings/tstats ids:', (out.match(/id="matches"/g)||[]).length, (out.match(/id="standings"/g)||[]).length, (out.match(/id="tstats"/g)||[]).length);
console.log('len:', out.length);
