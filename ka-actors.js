import * as T from './vendor/three.module.js';
import { SLOTS, ST, SKIN, STATC, cap, trainGain, hash, rnd, IX, IZ, starters } from './ka-data.js?v=munxl0i1';
import { sfx } from './ka-audio.js?v=munxl0i1';

const BENCH = [-3, -1.8, -0.6, 0.6, 1.8, 3];
const SPEED = 4.2, TRAIN_T = 6.5, BASE_Y = 0.5;
const tri = x => { const f = x - Math.floor(x); return f < 0.5 ? f * 2 : 2 - f * 2; };
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const lerp = (a, b, t) => a + (b - a) * t;
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const isIn = z => z < -60;
const baseY = slot => (SLOTS[slot].kind === 'indoor' ? 0.5 : 0.31);
const CORE = ['PAC', 'SHO', 'DRI', 'PHY'];

function conesPos(t, k, L) {
  const n = 4 + L * 2, sp = 4.4 / (n - 1), x = -2.5 + 5 * ease(tri((t + k * 2.1) / 7));
  return { x, z: -0.5 - Math.cos(Math.PI * (x + 2.2) / sp), ci: Math.round((x + 2.2) / sp) };
}
function trackPos(t, k, L) {
  const n = L >= 3 ? 4 : 3;
  return { z: -2.5 + 5.0 * ease(tri((t + k * 0.9) / 3.4)), x: -2.2 + 4.4 * ((k % n) + 0.5) / n };
}

// Local-space pose for a player at a station. y values are relative to the station base.
function pose(type, k, t, L) {
  const P = { lx: 0, lz: 0, y: 0, rot: 0, legL: 0, legR: 0, armL: 0, armR: 0, ball: null, bar: null, ev: null, key: null };
  if (type === 'cones') {
    const a = conesPos(t, k, L), b = conesPos(t + 0.05, k, L), dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz) || 1e-4, sp = d / 0.05;
    const f = Math.min(1, sp / 2), sw = Math.sin(t * 13) * 0.75 * f;
    Object.assign(P, { lx: a.x, lz: a.z, rot: Math.atan2(dx, dz), legL: sw, legR: -sw, armL: -sw * 0.8, armR: sw * 0.8, y: Math.abs(Math.sin(t * 13)) * 0.08 * f });
    P.ball = { x: a.x + dx / d * 0.5, y: 0.2, z: a.z + dz / d * 0.5, spin: sp };
    P.key = 'c' + a.ci; P.ev = 'touch';
  }
  if (type === 'wall') {
    const n = Math.min(5, 1 + L), per = 1.9, tt = t + k * 0.63, cyc = Math.floor(tt / per), ph = tt / per - cyc;
    const j = (cyc + k * 2) % n, tx = n === 1 ? 0 : -1.8 + 3.6 * j / (n - 1), ty = 1.1 + (j % 2) * 0.9;
    const px = (k - 1) * 1.7, pz = 2.4, rot = Math.atan2(tx - px, -1.6 - pz);
    const foot = { x: px + Math.sin(rot) * 0.45, y: 0.2, z: pz + Math.cos(rot) * 0.45 }, tgt = { x: tx, y: ty, z: -1.45 };
    Object.assign(P, { lx: px, lz: pz, rot });
    if (ph < 0.25) { const u = ease(ph / 0.25); P.legR = -1.0 * u; P.armL = 0.5 * u; P.armR = -0.4 * u; }
    else if (ph < 0.34) { const u = (ph - 0.25) / 0.09; P.legR = lerp(-1.0, 1.3, u); P.armL = 0.5; P.armR = -0.4; P.y = 0.06 * u; }
    else { const u = cl((ph - 0.34) / 0.3); P.legR = lerp(1.3, 0, u); P.armL = lerp(0.5, 0, u); P.armR = lerp(-0.4, 0, u); P.y = 0.06 * (1 - u); }
    let ball = { ...foot, spin: 0 };
    if (ph >= 0.3 && ph < 0.46) { const u = (ph - 0.3) / 0.16; ball = { x: lerp(foot.x, tgt.x, u), y: lerp(foot.y, tgt.y, u) + Math.sin(u * Math.PI) * 0.5, z: lerp(foot.z, tgt.z, u), spin: 10 }; }
    else if (ph >= 0.46 && ph < 0.85) { const u = (ph - 0.46) / 0.39; ball = { x: lerp(tgt.x, foot.x, u), y: 0.2 + (tgt.y - 0.2) * (1 - u) * Math.abs(Math.cos(u * Math.PI * 1.5)), z: lerp(tgt.z, foot.z, u), spin: 5 }; }
    P.ball = ball; P.hitAt = tgt;
    P.key = 'w' + cyc + (ph >= 0.3 ? 'k' : '') + (ph >= 0.46 ? 'h' : ''); P.ev = ph >= 0.46 ? 'hit' : ph >= 0.3 ? 'kick' : null;
  }
  if (type === 'track') {
    const a = trackPos(t, k, L), b = trackPos(t + 0.04, k, L), dz = b.z - a.z, sp = Math.abs(dz) / 0.04, f = Math.min(1, sp / 3);
    const sw = Math.sin(t * 17) * 0.95 * f;
    Object.assign(P, { lx: a.x, lz: a.z, rot: dz >= 0 ? 0 : Math.PI, legL: sw, legR: -sw, armL: -sw * 1.1, armR: sw * 1.1, y: Math.abs(Math.sin(t * 17)) * 0.1 * f });
    let passed = 0, nH = 0;
    if (L >= 2) for (let h = 0; h < L - 1; h++) {
      const hx = -1.5 + h * 1.0, d = Math.abs(a.z - hx); nH++;
      if (d < 0.55) { const u = 1 - (d / 0.55) ** 2; P.y += 1.0 * u; P.legL = lerp(sw, 1.2, u); P.legR = lerp(-sw, -0.7, u); P.armL = lerp(P.armL, -1.4, u); P.armR = lerp(P.armR, 0.6, u); }
      if (hx < a.z) passed++;
    }
    P.key = 't' + passed; P.ev = nH ? 'land' : null;
  }
  if (type === 'gym') {
    const per = 2.4, tt = t + k * 0.8, cyc = Math.floor(tt / per), ph = tt / per - cyc;
    let crouch = 0, press = 0;
    if (ph < 0.28) crouch = ease(ph / 0.28);
    else if (ph < 0.45) crouch = 1 - ease((ph - 0.28) / 0.17);
    else if (ph < 0.62) press = ease((ph - 0.45) / 0.17);
    else if (ph < 0.8) press = 1;
    else press = 1 - ease((ph - 0.8) / 0.2);
    const th = lerp(-2.4, -3.08, press);
    Object.assign(P, { lx: (k - 1) * 1.45, lz: 1.2, rot: 0, y: -0.3 * crouch, legL: -1.0 * crouch, legR: -1.0 * crouch, armL: th, armR: th });
    P.bar = { y: 1.2 - 0.62 * Math.cos(th), z: -0.62 * Math.sin(th), shake: press === 1 ? Math.sin(t * 40) * 0.015 : 0 };
    P.key = 'g' + cyc + (ph >= 0.62 ? 'u' : ''); P.ev = ph >= 0.62 ? 'lift' : null;
  }
  if (type === 'futsal') {
    const w = 0.55, t2 = t * w + k * 2.1, pos = q => ({ x: 5.2 * Math.sin(q), z: 2.9 * Math.sin(2 * q) });
    const a = pos(t2), b = pos(t2 + 0.03), dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz) || 1e-4, sw = Math.sin(t * 14) * 0.8;
    Object.assign(P, { lx: a.x, lz: a.z, rot: Math.atan2(dx, dz), legL: sw, legR: -sw, armL: -sw * 0.8, armR: sw * 0.8, y: Math.abs(Math.sin(t * 14)) * 0.08 });
    P.ball = { x: a.x + dx / d * 0.5, y: 0.2, z: a.z + dz / d * 0.5, spin: d / (0.03 / w) };
    P.key = 'f' + Math.floor(t2 / (Math.PI / 2)); P.ev = 'touch';
  }
  if (type === 'video') {
    const ph = (t + k * 1.7) % 5;
    Object.assign(P, { lx: (k - 1) * 1.6, lz: 1.3, rot: Math.PI, y: -0.2, legL: -1.45, legR: -1.45, armR: -0.9 + Math.sin(t * 6) * 0.08, armL: ph < 1 ? -2.9 : -0.35 });
  }
  if (type === 'pool') {
    const tt = t + k * 1.3, x = -4.6 + 9.2 * ease(tri(tt / 7)), x2 = -4.6 + 9.2 * ease(tri((tt + 0.04) / 7)), dir = x2 >= x ? 1 : -1;
    Object.assign(P, { lx: x - dir * 0.95, lz: -2.1 + k * 2.1, rot: dir * Math.PI / 2, y: 0.03, tilt: Math.PI / 2, legL: Math.sin(t * 18) * 0.35, legR: -Math.sin(t * 18) * 0.35, armL: -((t * 6) % (Math.PI * 2)), armR: -((t * 6 + Math.PI) % (Math.PI * 2)) });
    P.key = 'p' + dir; P.ev = 'splash';
  }
  if (type === 'passing') {
    const per = 1.5, tt = t + k * 0.37, cyc = Math.floor(tt / per), ph = tt / per - cyc, px = (k - 1.5) * 1.35, pz = 1.5, bz = -1.72;
    const foot = { x: px, y: 0.2, z: pz - 0.45 };
    Object.assign(P, { lx: px, lz: pz, rot: Math.PI });
    if (ph < 0.18) P.legR = -0.8 * ease(ph / 0.18);
    else if (ph < 0.26) P.legR = lerp(-0.8, 0.9, (ph - 0.18) / 0.08);
    else P.legR = lerp(0.9, 0, cl((ph - 0.26) / 0.3));
    P.armL = -P.legR * 0.4; P.armR = P.legR * 0.3;
    let ball = { ...foot, spin: 0 };
    if (ph >= 0.24 && ph < 0.5) { const u = (ph - 0.24) / 0.26; ball = { x: px, y: 0.2, z: lerp(foot.z, bz, u), spin: 9 }; }
    else if (ph >= 0.5 && ph < 0.85) { const u = (ph - 0.5) / 0.35; ball = { x: px, y: 0.2, z: lerp(bz, foot.z, ease(u)), spin: 6 }; }
    P.ball = ball; P.hitAt = { x: px, y: 0.3, z: bz };
    P.key = 'pa' + cyc + (ph >= 0.24 ? 'k' : '') + (ph >= 0.5 ? 'h' : ''); P.ev = ph >= 0.5 ? 'touch' : ph >= 0.24 ? 'kick' : null;
  }
  if (type === 'keeper') {
    const per = 2.4, tt = t + k * 1.1, cyc = Math.floor(tt / per), ph = tt / per - cyc, side = cyc % 2 ? 1 : -1, ox = (k % 2 ? 1 : -1) * Math.min(k, 1) * 0.4;
    Object.assign(P, { lx: ox, lz: -0.9 + k * 0.5, rot: 0, y: -0.12, legL: -0.5, legR: -0.5, armL: -0.9, armR: -0.9 });
    if (ph >= 0.38 && ph < 0.58) { const u = ease((ph - 0.38) / 0.2); P.lx = ox + side * 1.25 * u; P.y = 0.55 * Math.sin(u * Math.PI); P.armL = P.armR = -2.9; P.legL = side > 0 ? -0.2 : 0.5; P.legR = side > 0 ? 0.5 : -0.2; }
    else if (ph >= 0.58 && ph < 0.75) { P.lx = ox + side * 1.25; P.y = 0; P.armL = P.armR = -1.6; }
    else if (ph >= 0.75) { const u = ease((ph - 0.75) / 0.25); P.lx = ox + side * 1.25 * (1 - u); P.y = 0; P.armL = P.armR = lerp(-2.6, -0.9, u); }
    const hand = { x: ox + side * 1.25, y: 1.05, z: P.lz + 0.35 };
    if (ph >= 0.3 && ph < 0.55) { const u = (ph - 0.3) / 0.25; P.ball = { x: lerp(side * 0.3, hand.x, u), y: lerp(0.2, hand.y, u) + Math.sin(u * Math.PI) * 0.6, z: lerp(5.2, hand.z, u), spin: 10 }; }
    else if (ph >= 0.55 && ph < 0.75) P.ball = { ...hand, spin: 0 };
    else if (ph >= 0.75 && ph < 0.95) { const u = (ph - 0.75) / 0.2; P.ball = { x: lerp(hand.x, 0, u), y: lerp(hand.y, 0.2, u) + Math.sin(u * Math.PI) * 1.2, z: lerp(hand.z, 5.2, u), spin: 4 }; }
    P.key = 'k' + cyc + (ph >= 0.3 ? 's' : '') + (ph >= 0.55 ? 'c' : ''); P.ev = ph >= 0.55 ? 'touch' : ph >= 0.3 ? 'kick' : null;
  }
  if (type === 'clinic') {
    Object.assign(P, { lx: (k - 1) * 2.2, lz: 1.0, rot: 0, y: 0.8 + Math.sin(t * 2) * 0.01, tilt: -Math.PI / 2, armL: -0.1, armR: -0.1 });
  }
  return P;
}

export class Actors {
  constructor(sc) { this.sc = sc; this.group = new T.Group(); sc.scene.add(this.group); this.map = {}; this.bursts = []; this.sync(); }

  makeFigure(p) {
    const sc = this.sc, g = new T.Group(), h = hash(p.id);
    const kit = p.pos === 'GK' ? '#FFC940' : '#FF6B2C', skin = SKIN[h % SKIN.length], hair = ['#2a1d14', '#5a3a1e', '#1a1a1a', '#b98a4a'][h % 4];
    const legL = sc.box(0.22, 0.6, 0.24, '#F4F1E6', -0.14, 0.3, 0), legR = sc.box(0.22, 0.6, 0.24, '#F4F1E6', 0.14, 0.3, 0);
    [legL, legR].forEach(l => { l.geometry.translate(0, -0.3, 0); l.position.y = 0.6; l.add(sc.box(0.24, 0.12, 0.32, '#1a1a1a', 0, -0.56, 0.04)); g.add(l); });
    g.add(sc.box(0.56, 0.62, 0.34, kit, 0, 0.92, 0));
    g.add(sc.box(0.6, 0.12, 0.36, '#0E1F16', 0, 0.64, 0));
    g.add(sc.box(0.2, 0.2, 0.02, '#F4F1E6', 0, 1.0, -0.18));
    const mkArm = x => { const arm = sc.box(0.16, 0.56, 0.18, kit, x, 1.2, 0); arm.geometry.translate(0, -0.28, 0); arm.add(sc.box(0.15, 0.14, 0.16, skin, 0, -0.6, 0)); g.add(arm); return arm; };
    const armL = mkArm(-0.37), armR = mkArm(0.37);
    g.add(sc.mesh(new T.SphereGeometry(0.22, 14, 12), skin, 0, 1.44, 0));
    g.add(sc.mesh(new T.SphereGeometry(0.235, 14, 12, 0, Math.PI * 2, 0, Math.PI / 2.1), hair, 0, 1.47, -0.02));
    const bar = new T.Group();
    const rod = sc.mesh(new T.CylinderGeometry(0.035, 0.035, 1.4, 8), '#9aa3ad'); rod.rotation.z = Math.PI / 2; bar.add(rod);
    [-0.58, 0.58].forEach(x => { const pl = sc.mesh(new T.CylinderGeometry(0.2, 0.2, 0.08, 16), '#2a3b33', x, 0, 0); pl.rotation.z = Math.PI / 2; bar.add(pl); });
    bar.visible = false; g.add(bar);
    g.scale.setScalar(1.15); g.rotation.order = 'YXZ';
    g.userData = { legL, legR, armL, armR, bar };
    return g;
  }

  makeBall() {
    const sc = this.sc, b = sc.mesh(new T.SphereGeometry(0.2, 16, 12), '#ffffff');
    const band = new T.Mesh(new T.TorusGeometry(0.2, 0.03, 6, 20), sc.mat('#1a1a1a')); b.add(band);
    const band2 = band.clone(); band2.rotation.y = Math.PI / 2; b.add(band2);
    b.visible = false; this.group.add(b); return b;
  }

  sync() {
    const g = this.sc.getG(), ids = new Set(g.squad.map(p => p.id));
    for (const id in this.map) if (!ids.has(id)) { this.group.remove(this.map[id].fig); this.group.remove(this.map[id].ball); delete this.map[id]; }
    g.squad.forEach(p => {
      if (this.map[p.id]) return;
      const fig = this.makeFigure(p); fig.position.set(rnd(-16, 16), 0.3, rnd(-3, 3)); this.group.add(fig);
      this.map[p.id] = { fig, ball: this.makeBall(), mode: 'idle', t: rnd(0, 1.5), phase: rnd(0, 6) };
    });
  }

  resetSlot(i) { for (const id in this.map) { const a = this.map[id]; if (a.slot === i) { a.mode = 'idle'; a.slot = null; a.t = 0.3; } } }

  toWorld(slot, lx, lz) {
    const s = SLOTS[slot], c = Math.cos(s.r), sn = Math.sin(s.r);
    return { x: s.x + lx * c + lz * sn, z: s.z - lx * sn + lz * c };
  }

  routeTo(a, x, z) {
    const from = isIn(a.fig.position.z), to = isIn(z), pts = [];
    if (from !== to) { if (!from) pts.push({ x: 0, z: -23.6 }, { tp: { x: IX, z: IZ + 12.6 } }); else pts.push({ x: IX, z: IZ + 14.7 }, { tp: { x: 0, z: -21.6 } }); }
    pts.push({ x, z });
    const f = pts.shift(); a.tx = f.x; a.tz = f.z; a.route = pts; a.mode = 'walk';
  }

  goTrain(a, slot) {
    const g = this.sc.getG(), b = g.builds[slot], used = new Set(Object.values(this.map).filter(o => o.slot === slot).map(o => o.spot));
    const spot = [0, 1, 2, 3].find(k => !used.has(k)), P = pose(b.type, spot, 0, b.level), w = this.toWorld(slot, P.lx, P.lz);
    Object.assign(a, { slot, spot, next: 'train' }); this.routeTo(a, w.x, w.z);
  }

  choose(p, a) {
    const g = this.sc.getG(), occ = {};
    Object.values(this.map).forEach(o => { if (o.slot != null) occ[o.slot] = (occ[o.slot] || 0) + 1; });
    const usable = k => SLOTS[k].kind !== 'indoor' || g.indoorOpen;
    const free = type => { for (const k in g.builds) { const b = g.builds[k]; if (b.type === type && usable(k) && (occ[k] || 0) < cap(b.level, b.type)) return +k; } return null; };
    const inj = p.inj > 0, pre = g.timer < 12 && starters(g).includes(p) && p.fat > 10;
    if (inj || p.fat > 65 || pre) {
      let sl = free('clinic'); if (sl == null && !inj) sl = free('pool');
      if (sl != null) return this.goTrain(a, sl);
      const used = new Set(Object.values(this.map).filter(o => o.bench != null).map(o => o.bench));
      const b = BENCH.findIndex((_, k) => !used.has(k));
      if (b >= 0) { a.bench = b; a.next = 'rest'; return this.routeTo(a, BENCH[b], 15.2); }
      if (inj || pre) { a.next = 'wait'; return this.routeTo(a, rnd(-8, 8), 13.5); }
    }
    let best = null, bestScore = -1;
    for (const k in g.builds) {
      const b = g.builds[k], st = ST[b.type].stat; if (!st || !usable(k)) continue;
      if (b.type === 'keeper' && p.pos !== 'GK') continue;
      if ((occ[k] || 0) >= cap(b.level, b.type)) continue;
      const room = st === 'ALL' ? CORE.reduce((s, c) => s + p.pot - p[c], 0) / 4 : p.pot - (p[st] || 0);
      if (room <= 0.3) continue;
      const score = room + rnd(0, 6) + b.level + (b.type === 'keeper' ? 12 : 0);
      if (score > bestScore) { bestScore = score; best = +k; }
    }
    if (best != null) return this.goTrain(a, best);
    a.next = 'wait';
    if (isIn(a.fig.position.z)) this.routeTo(a, IX + rnd(-3, 3), IZ + rnd(8, 12)); else this.routeTo(a, rnd(-20, 20), rnd(-3, 3));
  }

  finishTrain(p, a) {
    const g = this.sc.getG(), b = g.builds[a.slot]; if (!b) return;
    const pos = a.fig.position, coach = (1 + 0.2 * g.staff.coach + 0.1 * g.staff.physio), L = b.level, fac = room => Math.max(0.15, Math.min(1, room / 15));
    if (false) { p.fat = Math.max(0, p.fat - 30 * (1 + 0.15 * L)); this.sc.floatText(pos.x, 2.4, pos.z, p.inj > 0 ? 'Treating ' + Math.ceil(p.inj) + 's' : 'Fit again', '#FF8A7A'); this.emit('pop', pos.x, pos.z); return; }
    if (b.type === 'futsal' || b.type === 'keeper' || b.type === 'clinic') {
      let tot = 0; CORE.forEach(c => { const room = p.pot - p[c], gn = Math.max(0, Math.min(room, trainGain(L) * (b.type === 'keeper' ? 0.6 : 0.35) * coach * fac(room))); p[c] = Math.round((p[c] + gn) * 100) / 100; tot += gn; });
      p.fat = Math.min(100, p.fat + 6 * (1 - 0.12 * g.staff.physio));
      this.sc.floatText(pos.x, 2.4, pos.z, '+' + (tot / 4).toFixed(1) + ' ALL', STATC.ALL); this.emit('pop', pos.x, pos.z); return;
    }
    const st = ST[b.type].stat, room = p.pot - (p[st] || 0);
    const gain = Math.max(0, Math.min(room, trainGain(L) * coach * fac(room)));
    p[st] = Math.round(((p[st] || 0) + gain) * 100) / 100;
    if (b.type === 'pool') p.fat = Math.max(0, p.fat - 15); else p.fat = Math.min(100, p.fat + 7 * (1 - 0.12 * g.staff.physio));
    this.sc.floatText(pos.x, 2.4, pos.z, '+' + gain.toFixed(1) + ' ' + st, STATC[st]);
    this.emit('pop', pos.x, pos.z);
  }

  emit(name, x, z) { const v = this.sc.proxVol ? this.sc.proxVol(x, z) : 0; if (v > 0.04) sfx(name, { vol: v }); }

  burst(slot, at) {
    const w = this.toWorld(slot, at.x, at.z);
    const m = new T.Mesh(new T.RingGeometry(0.15, 0.3, 20), new T.MeshBasicMaterial({ color: '#FFF3B0', transparent: true, side: T.DoubleSide }));
    m.position.set(w.x, baseY(slot) + at.y, w.z + 0.08); m.rotation.y = SLOTS[slot].r; this.group.add(m); this.bursts.push({ m, t: 0 });
  }

  update(dt) {
    const g = this.sc.getG();
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i]; b.t += dt; const u = b.t / 0.35;
      b.m.scale.setScalar(1 + u * 2.5); b.m.material.opacity = Math.max(0, 1 - u);
      if (u >= 1) { this.group.remove(b.m); b.m.geometry.dispose(); b.m.material.dispose(); this.bursts.splice(i, 1); }
    }
    const preSet = new Set(g.timer < 12 ? starters(g) : []);
    for (const p of g.squad) {
      const a = this.map[p.id]; if (!a) continue;
      const f = a.fig, u = f.userData; a.phase += dt;
      let showBall = false, showBar = false; f.rotation.x = 0;
      if (p.inj > 0 && a.mode !== 'rest' && a.mode !== 'train') p.inj = Math.max(0, p.inj - dt * 0.3);
      if (a.mode !== 'rest') p.fat = Math.max(0, p.fat - dt * 0.25 * (1 + 0.25 * g.staff.physio) * (preSet.has(p) && a.mode !== 'train' ? 20 : 1));
      if (a.mode === 'idle') { a.t -= dt; if (a.t <= 0) this.choose(p, a); }
      if (a.mode === 'walk') {
        const dx = a.tx - f.position.x, dz = a.tz - f.position.z, d = Math.hypot(dx, dz);
        if (d < 0.15 && a.route && a.route.length) {
          let nx = a.route.shift(); if (nx.tp) { f.position.set(nx.tp.x, 0.3, nx.tp.z); nx = a.route.shift(); }
          if (nx) { a.tx = nx.x; a.tz = nx.z; }
        } else if (d < 0.15) {
          a.mode = a.next; a.t = a.next === 'wait' ? rnd(1, 3) : 0; a.tt = 0; a.lastKey = null;
        } else {
          const s = Math.min(d, SPEED * dt * (1 - p.fat / 300) * (p.inj > 0 ? 0.55 : 1));
          f.position.x += dx / d * s; f.position.z += dz / d * s;
          f.rotation.y = Math.atan2(dx, dz);
          const sw = Math.sin(a.phase * 12) * 0.6;
          u.legL.rotation.x = sw; u.legR.rotation.x = -sw; u.armL.rotation.x = -sw * 0.8; u.armR.rotation.x = sw * 0.8;
          const onBase = SLOTS.some((sl, i) => sl.kind === 'indoor' && g.builds[i] && Math.abs(f.position.x - sl.x) < (sl.w || 5.6) / 2 && Math.abs(f.position.z - sl.z) < (sl.d || 5.6) / 2);
          f.position.y = (onBase ? BASE_Y : 0.3) + Math.abs(Math.sin(a.phase * 12)) * 0.08;
        }
      }
      if (a.mode === 'train') {
        const b = g.builds[a.slot];
        if (!b) { a.mode = 'idle'; a.slot = null; a.t = 0.2; }
        else {
          a.tt += dt;
          const P = pose(b.type, a.spot, a.tt, b.level), w = this.toWorld(a.slot, P.lx, P.lz);
          f.position.set(w.x, baseY(a.slot) + P.y, w.z);
          f.rotation.y = P.rot + SLOTS[a.slot].r; f.rotation.x = P.tilt || 0;
          if (b.type === 'clinic') { if (p.inj > 0) p.inj = Math.max(0, p.inj - dt * (3 + b.level) * (1 + 0.2 * g.staff.physio)); p.fat = Math.max(0, p.fat - dt * 4); }
          if (b.type === 'pool') p.fat = Math.max(0, p.fat - dt * 2);
          u.legL.rotation.x = P.legL; u.legR.rotation.x = P.legR; u.armL.rotation.x = P.armL; u.armR.rotation.x = P.armR;
          if (P.ball) { showBall = true; const bw = this.toWorld(a.slot, P.ball.x, P.ball.z); a.ball.position.set(bw.x, baseY(a.slot) + P.ball.y, bw.z); a.ball.rotation.x += dt * (P.ball.spin || 0) * 3; }
          if (P.bar) { showBar = true; u.bar.position.set(0, P.bar.y + P.bar.shake, P.bar.z); }
          if (P.key !== a.lastKey) {
            if (P.ev && a.lastKey != null) { this.emit(P.ev, w.x, w.z); if (P.ev === 'hit') this.burst(a.slot, P.hitAt); }
            a.lastKey = P.key;
          }
          if (a.tt >= TRAIN_T) { this.finishTrain(p, a); a.slot = null; a.mode = 'idle'; a.t = rnd(0.2, 0.8); u.armL.rotation.x = u.armR.rotation.x = 0; }
        }
      }
      if (a.mode === 'wait') {
        a.t -= dt; u.legL.rotation.x = u.legR.rotation.x = 0;
        u.armL.rotation.x = -0.2 + Math.sin(a.phase * 3) * 0.1; u.armR.rotation.x = -0.2 - Math.sin(a.phase * 3) * 0.1;
        f.position.y = 0.3 + Math.abs(Math.sin(a.phase * 3)) * 0.05;
        if (a.t <= 0) { a.mode = 'idle'; a.t = 0; }
      }
      if (a.mode === 'rest') {
        f.rotation.y = Math.PI; f.position.y = 0.5; u.legL.rotation.x = u.legR.rotation.x = -1.3; u.armL.rotation.x = u.armR.rotation.x = -0.4;
        p.fat = Math.max(0, p.fat - dt * 5 * (1 + 0.25 * g.staff.physio));
        if (p.inj > 0) p.inj = Math.max(0, p.inj - dt * (1 + 0.25 * g.staff.physio));
        if (p.fat < 12 && !(p.inj > 0)) { a.mode = 'idle'; a.bench = null; a.t = 0.3; u.legL.rotation.x = u.legR.rotation.x = 0; u.armL.rotation.x = u.armR.rotation.x = 0; }
      }
      a.ball.visible = showBall; u.bar.visible = showBar;
    }
  }
}
