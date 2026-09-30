export const SAVE_KEY = 'kickoff-academy-v2';
export const PW = 48, PD = 30, MAXL = 5, SQUAD_MAX = 10, MATCH_T = 60;
export const DIVS = {
  1: { name: 'Premier Division', base: 82, mult: 14 },
  2: { name: 'Championship', base: 66, mult: 6 },
  3: { name: 'League One', base: 50, mult: 2.5 },
  4: { name: 'Sunday League', base: 32, mult: 1 },
};
export const ST = {
  cones: { name: 'Cone Drill', stat: 'DRI', cost: 150, color: '#FFC940', tag: 'DRI', desc: 'Players weave cones to train dribbling' },
  wall: { name: 'Shooting Wall', stat: 'SHO', cost: 250, color: '#FF8A5B', tag: 'SHO', desc: 'Target practice trains shooting' },
  track: { name: 'Sprint Track', stat: 'PAC', cost: 200, color: '#6FE39A', tag: 'PAC', desc: 'Sprints and hurdles train pace' },
  gym: { name: 'Gym', stat: 'PHY', cost: 400, color: '#8FC7FF', tag: 'PHY', desc: 'Weights train physical strength' },
  stands: { name: 'Stands', cost: 300, color: '#D7D0BF', tag: 'SEAT', desc: '+150 seats for home matches per level' },
  food: { name: 'Food Stall', cost: 350, color: '#F4F1E6', tag: 'FOOD', desc: 'Home fans spend money on match day' },
  futsal: { name: 'Futsal Court', stat: 'ALL', pad: 'All 4 stats', cost: 1500, color: '#FFC940', tag: 'ALL', desc: 'Small-sided games train PAC, SHO, DRI and PHY a little' },
  video: { name: 'Video Room', stat: 'VIS', cost: 1200, color: '#C9A7FF', tag: 'VIS', desc: 'Trains vision. +0.6 tactics bonus per level' },
  pool: { name: 'Pool', stat: 'STA', cost: 1800, color: '#7FD6E8', tag: 'STA', desc: 'Trains stamina and speeds up recovery' },
  passing: { name: 'Passing Wall', stat: 'PAS', cost: 300, color: '#F7A8C8', tag: 'PAS', desc: 'Rebound boards train passing' },
  keeper: { name: 'Goalkeeper Area', stat: 'ALL', pad: 'GK only', cost: 350, color: '#FFE08A', tag: 'GK', desc: 'Trains goalkeepers. Each level: -6% goals conceded' },
  youth: { name: 'Youth Corner', pad: 'Finds talent', cost: 500, color: '#6FE39A', tag: 'YTH', desc: 'Local kids train here. Sometimes a free talent joins your scout list' },
  clinic: { name: 'Physio Clinic', train: true, pad: 'Recovery', cost: 1600, color: '#FF8A7A', tag: 'MED', desc: 'Heals injuries fast and lowers injury risk' },
};
export const ORDER = ['cones', 'wall', 'track', 'gym', 'stands', 'food'];
export const PITCH = {
  grass: { name: 'Grass', cost: 200, per: 1, desc: 'Better turf. +1 team strength per level' },
  lines: { name: 'Line markings', cost: 120, per: 0.4, desc: 'Crisp lines. +0.4 strength per level' },
  goals: { name: 'Goals & nets', cost: 180, per: 0.6, desc: 'Proper goals. +0.6 strength per level' },
  lights: { name: 'Floodlights', cost: 500, per: 0.4, desc: '+12% attendance, +0.4 strength per level' },
};
export const STAFF = {
  coach: { name: 'Coach', cost: 300, desc: '+20% training gains per level' },
  scout: { name: 'Scout', cost: 300, desc: 'Better prospects. Level 3 adds a 4th option' },
  physio: { name: 'Physio', cost: 300, desc: '-12% fatigue and faster recovery per level' },
  keeper: { name: 'Groundskeeper', cost: 300, desc: '+15% pitch strength bonus per level' },
};
export const STATC = { PAC: '#6FE39A', SHO: '#FF8A5B', DRI: '#FFC940', PHY: '#8FC7FF', VIS: '#C9A7FF', STA: '#7FD6E8', PAS: '#F7A8C8', ALL: '#F4F1E6' };
const FIRST = ['Leo','Marco','Jamal','Theo','Kai','Luca','Sami','Noah','Ravi','Owen','Diego','Finn','Mateo','Ade','Yusuf','Rio','Ezra','Tomas','Ilya','Joel','Hugo','Nico','Amir','Callum','Zane','Bruno','Kofi','Dani','Emil','Jonah','Mason','Eli','Oscar','Rafael','Kenji','Arjun','Malik','Luis','Stefan','Jakub','Mikkel','Aiden','Tariq','Idris','Felipe','Andrés','Marcel','Pavel','Ibrahim','Samuel','Kwame','Yann','Pierre','Enzo','Gianni','Matteo','Lorenzo','Sven','Lars','Anders','Oliver','Harry','Jack','Charlie','George','Alfie','Archie','Ethan','Lucas','Liam','Tyler','Cole','Reece','Jaden','Marcus','Dylan','Ryan','Connor','Declan','Seán','Cian','Rory','Ewan','Fraser','Rhys','Owain','Dafydd','Hiroshi','Takumi','Min-jun','Ji-ho','Wei','Hao','Minh','Arash','Omar','Karim','Youssef','Bilal','Emre','Can','Deniz','Burak','Nikola','Luka','Marko','Dusan','Viktor','Oleksandr','Bogdan','Milan','Tomasz','Kacper','Filip','Jonas','Lukas','Elias','Thiago','Gabriel','Mateus','Caio','Joaquín','Santiago','Emiliano','Sebastián','Álvaro','Iker','Pau','Xavi','Nuno','Tiago','Rui','Chidi','Emeka','Tunde','Sékou','Moussa','Bakary','Yaw','Kojo','Tendai','Thabo','Sipho','Kagiso','Ayo','Femi'];
const LAST = ['Silva','Okafor','Reyes','Hart','Novak','Brennan','Costa','Mensah','Park','Lindqvist','Duarte','Walsh','Moreau','Adeyemi','Kowalski','Rossi','Byrne','Haddad','Sato','Vidal','Ferris','Quinn','Okoro','Varga','Blake','Soto','Mori','Kane','Bauer','Nkemelu','Hughes','Fletcher','Barnes','Doyle','Carroll','Murphy','Kelly','Gallagher','McKenna','Doherty','Griffiths','Pritchard','Morgan','Evans','Campbell','Fraser','Robertson','Sinclair','Whitaker','Holloway','Ashworth','Pemberton','Thornton','Radcliffe','Kingsley','Marsh','Stone','Rowe','Lane','Frost','Fernández','García','Martínez','Navarro','Herrera','Moreno','Castillo','Ortega','Delgado','Ramos','Pereira','Santos','Oliveira','Almeida','Carvalho','Rocha','Barbosa','Moretti','Ricci','Esposito','Conti','Bruno','Galli','Lombardi','Marchetti','Dubois','Lefèvre','Girard','Fontaine','Mercier','Schneider','Weber','Hoffmann','Krüger','Vogel','Brandt','de Jong','Bakker','Visser','van Dijk','Janssen','Peeters','Nielsen','Hansen','Eriksen','Berg','Johansson','Virtanen','Nowak','Wiśniewski','Horvat','Kovačević','Petrović','Jovanović','Popescu','Ionescu','Yilmaz','Demir','Kaya','Şahin','Diallo','Traoré','Koné','Camara','Touré','Ba','Sarr','Ndiaye','Osei','Boateng','Asante','Owusu','Eze','Nwosu','Balogun','Adebayo','Mwangi','Otieno','Dlamini','Nkosi','Tanaka','Suzuki','Kim','Lee','Nguyen','Tran','Chen','Wang','Rahman','Khan'];
const CLUBS = ['Riverside Rovers','Old Mill Athletic','Harbour Town','Northgate United','Ashford Wanderers','Brick Lane FC','Pinewood City','Castle Park','Eastfield Rangers','Saltmarsh Albion','Hillcrest Town','Kingsbury Villa','Lakeside Dynamo','Foxhall Orient','Granite City','Westbrook Borough','Copper Hill','Marsh End United','Stonebridge FC','Oakvale Athletic'];
export const POS = ['GK', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD'];
export const SKIN = ['#f1c9a5', '#d9a47a', '#b57a50', '#8a5634', '#5e3a22'];
export const SLOTS = [];
export const IX = 0, IZ = -110;
const H = Math.PI / 2, GX = 24 - 0.75 - 1.9;
[['cones', -10, 0, 0], ['track', -8, -10.5, H], ['wall', -GX, 0, H], ['gym', -8, 10.5, 0],
 ['youth', 8, 10.5, 0], ['keeper', GX, 0, -H], ['off', 8, -10.5, -H], ['passing', 9, -1, 0]]
  .forEach(([type, x, z, r]) => SLOTS.push({ x, z, r, kind: type === 'off' ? 'off' : 'drill', type }));
['stands', 'food', 'stands', 'stands'].forEach((t, j) => SLOTS.push({ x: [-15, -5, 5, 15][j], z: -21, r: 0, kind: 'venue', type: t }));
[-6, 6].forEach((z, j) => SLOTS.push({ x: -30.5, z, r: Math.PI / 2, kind: 'venue', type: j ? 'food' : 'stands' }));
[-6, 6].forEach((z, j) => SLOTS.push({ x: 30.5, z, r: -Math.PI / 2, kind: 'venue', type: j ? 'stands' : 'food' }));
SLOTS.push({ x: IX - 11, z: IZ - 4, r: 0, kind: 'indoor', type: 'futsal', w: 16, d: 12 });
SLOTS.push({ x: IX + 8, z: IZ - 9.5, r: 0, kind: 'indoor', type: 'video', w: 7, d: 7 });
SLOTS.push({ x: IX + 16.5, z: IZ - 9.5, r: 0, kind: 'indoor', type: 'clinic', w: 7, d: 7 });
SLOTS.push({ x: IX + 12, z: IZ + 3.5, r: 0, kind: 'indoor', type: 'pool', w: 14, d: 8 });

export const rnd = (a, b) => a + Math.random() * (b - a);
export const ri = (a, b) => Math.floor(rnd(a, b + 1));
export const pickA = a => a[Math.floor(Math.random() * a.length)];
export const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const fmt = n => { n = Math.round(n); const s = n < 0 ? '-' : ''; n = Math.abs(n); if (n >= 1e6) return s + '$' + (n / 1e6).toFixed(2) + 'M'; if (n >= 1e5) return s + '$' + (n / 1e3).toFixed(0) + 'k'; if (n >= 1e4) return s + '$' + (n / 1e3).toFixed(1) + 'k'; return s + '$' + n.toLocaleString('en-US'); };
export const ord = n => n + (['th', 'st', 'nd', 'rd'][((n % 100) - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');
export const ovr = p => (p.PAC + p.SHO + p.DRI + p.PHY + (p.VIS ?? p.PHY) + (p.STA ?? p.PHY) + (p.PAS ?? p.DRI)) / 7;
export const pois = l => { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; };
export const seeded = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
export const hash = s => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
export const cap = (L, t) => Math.min(t === 'clinic' || t === 'video' || t === 'pool' ? 3 : 4, L >= 4 ? 4 : L >= 2 ? 3 : 2);
export const stCost = (t, L) => Math.round(ST[t].cost * Math.pow(1.7, L));
export const pitchCost = (k, L) => Math.round(PITCH[k].cost * Math.pow(1.9, L));
export const staffCost = (k, L) => Math.round(STAFF[k].cost * Math.pow(2.1, L));
export const trainGain = L => 0.9 * (1 + 0.25 * (L - 1));

const usedNames = new Set();
function uniqueName() {
  for (let i = 0; i < 30; i++) { const n = pickA(FIRST) + ' ' + pickA(LAST); if (!usedNames.has(n)) { usedNames.add(n); if (usedNames.size > 400) usedNames.clear(); return n; } }
  return pickA(FIRST) + ' ' + pickA(LAST);
}
export function makePlayer(base, pos, potBonus = 0) {
  const s = () => Math.max(5, Math.round(base + rnd(-6, 6)));
  const p = { id: Math.random().toString(36).slice(2, 9), name: uniqueName(), pos, PAC: s(), SHO: s(), DRI: s(), PHY: s(), VIS: s(), STA: s(), PAS: s(), fat: 0, inj: 0 };
  p.pot = Math.min(96, Math.round(ovr(p) + rnd(12, 32) + potBonus));
  return p;
}
export function newLeague(div, season) {
  const names = shuffle(CLUBS).slice(0, 7);
  const teams = [{ id: 0, name: 'Kickoff Academy', str: 0, me: true }].concat(names.map((n, i) => ({ id: i + 1, name: n, str: DIVS[div].base + rnd(-8, 8) + Math.min(5, (season - 1) * 0.6) })));
  teams.forEach(t => Object.assign(t, { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }));
  let arr = shuffle([0, 1, 2, 3, 4, 5, 6, 7]); const schedule = [];
  for (let r = 0; r < 7; r++) {
    const pairs = [];
    for (let i = 0; i < 4; i++) { const a = arr[i], b = arr[7 - i]; pairs.push((r + i) % 2 ? [a, b] : [b, a]); }
    schedule.push(pairs);
    arr = [arr[0], arr[7]].concat(arr.slice(1, 7));
  }
  return { div, season, teams, schedule, md: 0 };
}
export const sortTable = L => L.teams.slice().sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf);

export function newGame() {
  const g = { v: 1, money: 600, squad: POS.map(p => makePlayer(25, p)), builds: {}, pitch: { grass: 0, lines: 0, goals: 0, lights: 0 }, staff: { coach: 0, scout: 0, physio: 0, keeper: 0 }, league: newLeague(4, 1), timer: MATCH_T, recruits: [], seenIntro: false, tut: 0, refreshes: 0 };
  genRecruits(g);
  return g;
}
export function genRecruits(g) {
  const d = DIVS[g.league.div], sc = g.staff.scout, n = sc >= 3 ? 4 : 3;
  g.recruits = Array.from({ length: n }, () => {
    const p = makePlayer(d.base - 6 + 3 * sc + rnd(-4, 4), pickA(POS), sc * 2);
    const o = ovr(p); p.cost = Math.round(o * o * 0.45 * (1 + (p.pot - o) / 60));
    return p;
  });
}
export function starters(g) {
  const k = p => (p.inj > 0 ? -1000 : 0) + ovr(p) - p.fat * 0.15;
  const s = g.squad.slice().sort((a, b) => k(b) - k(a));
  if (g.manual) {
    const picked = (g.lineup || []).map(id => g.squad.find(p => p.id === id)).filter(p => p && !(p.inj > 0)).slice(0, 7);
    return picked.concat(s.filter(p => !picked.includes(p))).slice(0, 7);
  }
  const gk = s.find(p => p.pos === 'GK' && !(p.inj > 0));
  return (gk ? [gk].concat(s.filter(p => p !== gk)) : s).slice(0, 7);
}
export function pitchBonus(g) {
  let b = 0; for (const k in PITCH) b += PITCH[k].per * g.pitch[k];
  return b * (1 + 0.15 * g.staff.keeper);
}
export function teamStrength(g) {
  const st = starters(g); if (!st.length) return 0;
  const avg = st.reduce((s, p) => { const stam = Math.max(0.3, Math.min(1, 1 - ((p.STA || 30) - 30) / 200)); return s + ovr(p) * (1 - p.fat / 500 * stam) * (p.inj > 0 ? 0.6 : 1); }, 0) / st.length;
  return avg + pitchBonus(g) * 1.0 + tacticsBonus(g) - (st.some(p => p.pos === 'GK') ? 0 : 6);
}
export function bestLevel(g, type) { let l = 0; for (const k in g.builds) if (g.builds[k].type === type) l = Math.max(l, g.builds[k].level); return l; }
export function tacticsBonus(g) { return 0.35 * bestLevel(g, 'video'); }
export function seats(g) {
  let s = 80; for (const k in g.builds) if (g.builds[k].type === 'stands') s += 150 * g.builds[k].level;
  return s;
}
export function foodLevel(g) {
  let s = 0; for (const k in g.builds) if (g.builds[k].type === 'food') s += g.builds[k].level;
  return s;
}
export function nextFixture(g) {
  const L = g.league; if (L.md >= 7) return null;
  const pr = L.schedule[L.md].find(p => p[0] === 0 || p[1] === 0);
  const home = pr[0] === 0, opp = L.teams[home ? pr[1] : pr[0]];
  return { home, opp };
}
export function winProb(my, their) {
  const d = my - their; return 1 / (1 + Math.exp(-d / 5));
}
function simScore(a, b, ka = 0, kb = 0) {
  const d = 1.2 * Math.tanh((a - b) / 12);
  return [pois(Math.max(0.2, 1.4 + d * 0.9) * (1 - kb)), pois(Math.max(0.2, 1.4 - d * 0.9) * (1 - ka))];
}
function applyRes(t1, t2, g1, g2) {
  t1.p++; t2.p++; t1.gf += g1; t1.ga += g2; t2.gf += g2; t2.ga += g1;
  if (g1 > g2) { t1.w++; t2.l++; t1.pts += 3; } else if (g1 < g2) { t2.w++; t1.l++; t2.pts += 3; } else { t1.d++; t2.d++; t1.pts++; t2.pts++; }
}
export function playMatchday(g) {
  const L = g.league, fx = nextFixture(g); if (!fx) return null;
  const my = teamStrength(g), d = DIVS[L.div];
  let mine = null; const kp = 0.06 * bestLevel(g, 'keeper');
  L.schedule[L.md].forEach(([h, a]) => {
    const th = L.teams[h], ta = L.teams[a];
    const sh = h === 0 ? my : th.str + (h !== 0 && a !== 0 ? 0 : 0), sa = a === 0 ? my : ta.str;
    const [gh, ga] = simScore(sh + 1.5, sa, h === 0 ? kp : 0, a === 0 ? kp : 0);
    applyRes(th, ta, gh, ga);
    if (h === 0 || a === 0) mine = { home: h === 0, gh, ga, opp: h === 0 ? ta : th };
  });
  L.md++;
  const myGoals = mine.home ? mine.gh : mine.ga, theirGoals = mine.home ? mine.ga : mine.gh;
  const res = myGoals > theirGoals ? 'W' : myGoals < theirGoals ? 'L' : 'D';
  const st = starters(g);
  const scorers = [];
  const weights = st.map(p => (p.pos === 'FWD' ? 4 : p.pos === 'MID' ? 2.2 : p.pos === 'DEF' ? 0.8 : 0.05) * (p.SHO + 10));
  const tw = weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < myGoals; i++) { let r = Math.random() * tw, j = 0; while (r > weights[j]) { r -= weights[j]; j++; } scorers.push(st[Math.min(j, st.length - 1)].name.split(' ')[1] + " " + ri(3, 90) + "'"); }
  const rows = [];
  const prize = Math.round((res === 'W' ? 340 : res === 'D' ? 140 : 60) * d.mult);
  rows.push({ label: res === 'W' ? 'Win bonus' : res === 'D' ? 'Draw bonus' : 'Appearance fee', val: fmt(prize) });
  let total = prize;
  if (mine.home) {
    const pop = Math.min(1, 0.45 + 0.05 * sortTableIdx(g) + 0.12 * g.pitch.lights + (res === 'W' ? 0.1 : 0));
    const crowd = Math.round(seats(g) * Math.min(1, pop));
    const tix = Math.round(crowd * 1.2 * d.mult);
    rows.push({ label: 'Tickets · ' + crowd.toLocaleString('en-US') + ' fans', val: fmt(tix) });
    total += tix;
    const fl = foodLevel(g);
    if (fl) { const food = Math.round(crowd * 1.5 * fl * d.mult); rows.push({ label: 'Food stall sales', val: fmt(food) }); total += food; }
  } else rows.push({ label: 'Away game · no ticket money', val: '$0' });
  const fatAdd = 26 * (1 - 0.12 * g.staff.physio);
  g.squad.forEach(p => { if (st.includes(p)) p.fat = Math.min(100, p.fat + fatAdd); });
  const injuries = [], cl = bestLevel(g, 'clinic');
  st.forEach(p => { const ch = Math.max(0.01, 0.06 * (1 + p.fat / 100) * (1 - 0.12 * cl) * (1 - ((p.STA || 30) - 30) / 250)); if (!(p.inj > 0) && Math.random() < ch) { p.inj = Math.round(rnd(60, 140)); injuries.push(p.name); } });
  g.money += total;
  genRecruits(g);
  const yl = bestLevel(g, 'youth');
  if (yl && Math.random() < 0.12 + 0.08 * yl) { const y = makePlayer(d.base - 12, pickA(POS), 16 + 3 * yl); y.cost = 0; y.youth = true; g.recruits.unshift(y); rows.push({ label: 'Youth talent: ' + y.name + ' (free in Scout)', val: 'FREE' }); }
  return { res, home: mine.home, myGoals, theirGoals, opp: mine.opp.name, rows, total, scorers, injuries, md: L.md };
}
function sortTableIdx(g) {
  const idx = sortTable(g.league).findIndex(t => t.me); return Math.max(0, 7 - idx) / 7 * 2;
}
export function endSeason(g) {
  const L = g.league, pos = sortTable(L).findIndex(t => t.me) + 1;
  let div = L.div, outcome;
  if (pos <= 2 && div > 1) { div--; outcome = 'Promoted to ' + DIVS[div].name + '!'; }
  else if (pos === 1 && div === 1) outcome = 'Premier Division champions!';
  else if (pos >= 7 && div < 4) { div++; outcome = 'Relegated to ' + DIVS[div].name; }
  else outcome = 'Staying in ' + DIVS[div].name;
  const bonus = Math.round((9 - pos) * 120 * DIVS[L.div].mult);
  g.money += bonus;
  g.league = newLeague(div, L.season + 1);
  genRecruits(g);
  return { pos, outcome, bonus, up: div < L.div, down: div > L.div, season: L.season };
}

export function quickSession(g, secs) {
  const t = Math.max(0, secs) * 0.6; if (t < 1) return null;
  const coach = 1 + 0.2 * g.staff.coach, stations = [];
  for (const k in g.builds) { const b = g.builds[k], d = ST[b.type]; if (d && d.stat && (SLOTS[k].kind !== 'indoor' || g.indoorOpen)) stations.push(b); }
  const st = starters(g); let gained = 0;
  g.squad.forEach(p => {
    if (!(p.inj > 0) && stations.length) {
      const n = Math.floor(t / 7 + Math.random());
      for (let i = 0; i < n; i++) { const b = stations[Math.floor(Math.random() * stations.length)], s = ST[b.type].stat, room = p.pot - (p[s] || 0), gn = Math.max(0, Math.min(room, trainGain(b.level) * coach * Math.max(0.15, Math.min(1, room / 15)))); p[s] = Math.round(((p[s] || 0) + gn) * 100) / 100; gained += gn; }
    }
    if (p.inj > 0) p.inj = Math.max(0, p.inj - t * (1 + 0.25 * g.staff.physio));
    if (st.includes(p)) p.fat = Math.max(0, p.fat - t * 3 * (1 + 0.25 * g.staff.physio));
  });
  return gained;
}
