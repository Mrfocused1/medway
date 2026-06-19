// Map Medway Basketball content into the :4322 (site-orange) shell.
const fs = require('fs');
const p = '/Users/paulbridges/Desktop/Medway Basketball Association/site-orange/index.html';
let h = fs.readFileSync(p, 'utf8');

// literal global replace
const rep = (from, to) => { h = h.split(from).join(to); };

// --- marquee + card artist names -> team names (each appears many times for the loop) ---
const teams = [
  ['Mariana a Miserável', 'Bromley Fury'],
  ['Kruella D&#x27;Enfer', 'Eltham Eagles'],
  ['Tiago Evangelista', 'Guru Nanak'],
  ['João Varela', 'Bexley Tigers'],
  ['Vai Dar Pitanga', 'Maidstone Warriors'],
  ['Maria Imaginário', 'Kent Panthers'],
  ['Tamara Alves', 'Tonbridge Knights'],
  ['Hélio Bray', 'Kent Tigers'],
  ['Arashida', 'Sevenoaks Suns'],
  ['Confeere', 'Bromley Phoenix'],
  ['Fiumani', 'Canterbury Kings'],
  ['Ruído', 'Dartford Vets'],
];
teams.forEach(([a, b]) => rep(a, b));

// --- card sub-labels (the artwork names) -> competitions ---
rep('Peguei trinquei', 'Medway Cup');
rep('BALANCE II', 'Play-Offs');
rep('>PLAY<', '>Medway Plate<');     // narrow match so we don't hit other words
rep('750,00 €', '2025/26');

// --- hero headline ---
rep('12 Artistas', 'Medway Basketball');
rep('24 BOLAS DE ARTE', 'Association');

// --- visible intro line ---
rep('Um projeto Liga Betclic com curadoria Underdogs.',
    'All that is happening in basketball in the Medway area.');

// --- fusao split header: "UMA FUSÃO ENTRE / ARTE E DESPORTO" ---
rep('UMA FUSÃO', 'GRASSROOTS');
rep('>ENTRE<', '>BASKETBALL<');
rep('>ARTE<', '>SINCE<');
rep('E DESPORTO', '1947');

// --- description paragraph ---
rep('Vinte e quatro bolas foram entregues a doze artistas selecionados pela Underdogs para que fossem transformadas em obras de arte.',
    'Founded in 1947, the Medway Basketball Association runs league, cup and plate competitions across two divisions for teams from across Medway and Kent.');

// --- button ---
rep('Conhecer os artistas', 'Meet the teams');

// --- meta / footer brand line + title ---
rep('Um projeto Liga Betclic com curadoria e seleção artística da Underdogs.',
    'Medway Basketball Association — basketball across the Medway area since 1947.');
rep('<title>ArtDunk</title>', '<title>Medway Basketball Association</title>');
rep('content="ArtDunk"', 'content="Medway Basketball Association"');

fs.writeFileSync(p, h);

// report leftovers
const left = ['Artistas','BOLAS DE ARTE','Liga Betclic','Underdogs','Vinte e quatro','Kruella','Arashida','Conhecer']
  .map(s => [s, h.split(s).length - 1]).filter(x => x[1] > 0);
console.log('done. remaining placeholder hits:', JSON.stringify(left));
