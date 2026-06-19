const fs = require('fs');
const ROOT = '/Users/paulbridges/Desktop/Medway Basketball Association/site-orange';

function anchorAt(h, start) {
  let depth = 0; const re = /<a\b|<\/a>/g; re.lastIndex = start; let m;
  while ((m = re.exec(h))) { if (m[0] === '</a>') { depth--; if (depth === 0) return [start, re.lastIndex]; } else depth++; }
  return null;
}

// remove the "competitions" menu link (case-insensitive, any accenting)
function removeCompetitions(h) {
  const m = h.match(/>\s*[Cc]ompeti[a-zA-Zç]*\s*</);
  if (!m) return h;
  const labelIdx = m.index;
  const aStart = h.lastIndexOf('<a', labelIdx);
  if (aStart < 0) return h;
  const span = anchorAt(h, aStart);
  if (!span) return h;
  return h.slice(0, span[0]) + h.slice(span[1]);
}

const PUSH = '.nav-menu-content{padding-top:72px !important;}@media(max-width:640px){.nav-menu-content{padding-top:58px !important;}}';
const COUNTUP = '<script src="assets/js/countup.js"></script>';

for (const f of ['index.html', 'teams.html', 'scores.html', 'contact.html']) {
  let h = fs.readFileSync(ROOT + '/' + f, 'utf8');
  const hadComp = /[Cc]ompeti/.test(h);
  h = removeCompetitions(h);

  // push menu links down so the fixed logo no longer covers HOME
  if (!h.includes('mba-menu-push')) {
    h = h.replace('</head>', '<style id="mba-menu-push">' + PUSH + '</style></head>');
  }

  // include count-up script once
  if (!h.includes('assets/js/countup.js')) {
    h = h.replace('</body>', COUNTUP + '</body>');
  }

  fs.writeFileSync(ROOT + '/' + f, h);
  console.log(f, '| competitions removed:', hadComp && !/[Cc]ompeti/.test(h), '| push:', h.includes('mba-menu-push'), '| countup:', h.includes('countup.js'));
}
