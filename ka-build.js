import * as T from './vendor/three.module.js';
// Returns a THREE.Group for a station at level L. c = scene helper with box/mesh.
const LINE = '#f4f4ee';
function flat(c, g, w, d, x, z, col = LINE) { const m = c.box(w, 0.02, d, col, x, 0.012, z); m.castShadow = false; g.add(m); return m; }
function outline(c, g, w, d) { flat(c, g, w, 0.08, 0, -d / 2); flat(c, g, w, 0.08, 0, d / 2); flat(c, g, 0.08, d, -w / 2, 0); flat(c, g, 0.08, d, w / 2, 0); }
function cone(c, g, x, z, s = 1) {
  g.add(c.mesh(new T.CylinderGeometry(0.26 * s, 0.28 * s, 0.04, 14), '#FF6B2C', x, 0.02, z));
  g.add(c.mesh(new T.ConeGeometry(0.19 * s, 0.55 * s, 14), '#FF6B2C', x, 0.04 + 0.275 * s, z));
  g.add(c.mesh(new T.CylinderGeometry(0.1 * s, 0.13 * s, 0.07 * s, 14), '#ffffff', x, 0.04 + 0.3 * s, z));
}
function ballBag(c, g, x, z) {
  g.add(c.mesh(new T.SphereGeometry(0.5, 14, 10), '#0E1F16', x, 0.48, z, { transparent: true, opacity: 0.35 }));
  [[-0.18, 0.25, 0], [0.18, 0.25, 0.05], [0, 0.25, -0.2], [0, 0.6, 0]].forEach(([a, y, d]) => g.add(c.mesh(new T.SphereGeometry(0.19, 12, 10), '#ffffff', x + a, y, z + d)));
}
const banTex = {};
function bannerTex(kind) {
  if (banTex[kind]) return banTex[kind];
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 224; const x = cv.getContext('2d');
  x.fillStyle = '#FF6B2C'; x.fillRect(0, 0, 128, 224); x.strokeStyle = '#fff'; x.lineWidth = 5; x.strokeRect(9, 9, 110, 206);
  x.fillStyle = '#fff'; x.lineWidth = 9; x.lineCap = 'round'; x.lineJoin = 'round';
  const Ln = pts => { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(p => x.lineTo(p[0], p[1])); x.stroke(); };
  const Ci = (cx, cy, r, fill = true) => { x.beginPath(); x.arc(cx, cy, r, 0, 7); fill ? x.fill() : x.stroke(); };
  if (kind === 'track') { Ci(76, 62, 12); Ln([[72, 80], [58, 122]]); Ln([[69, 90], [90, 104], [100, 92]]); Ln([[69, 90], [50, 98], [38, 114]]); Ln([[58, 122], [80, 138], [76, 164]]); Ln([[58, 122], [44, 146], [26, 144]]); }
  if (kind === 'cones') { x.beginPath(); x.moveTo(36, 150); x.lineTo(56, 72); x.lineTo(76, 150); x.closePath(); x.fill(); x.fillRect(28, 146, 56, 10); Ci(92, 146, 13); x.fillStyle = '#FF6B2C'; Ci(92, 146, 5); }
  if (kind === 'wall') { x.lineWidth = 7; Ln([[24, 124], [24, 70], [104, 70], [104, 124]]); x.lineWidth = 5; x.beginPath(); x.moveTo(44, 168); x.quadraticCurveTo(40, 110, 82, 92); x.stroke(); Ln([[70, 88], [84, 91], [78, 104]]); Ci(44, 172, 12); }
  if (kind === 'gym') { Ln([[34, 116], [94, 116]]); x.fillRect(24, 92, 14, 48); x.fillRect(90, 92, 14, 48); x.fillRect(14, 102, 10, 28); x.fillRect(104, 102, 10, 28); }
  x.font = '900 20px Archivo, sans-serif'; x.textAlign = 'center'; x.fillText({ track: 'SPRINT', cones: 'DRIBBLE', wall: 'SHOOT', gym: 'POWER' }[kind], 64, 200);
  const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace; banTex[kind] = tex; return tex;
}
function banner(c, g, kind, x, z) {
  const b = new T.Group(); b.position.set(x, 0, z);
  [-0.42, 0.42].forEach(px => { b.add(c.box(0.06, 2.0, 0.06, '#1a1a1a', px, 1.0, 0)); b.add(c.box(0.1, 0.08, 0.5, '#1a1a1a', px, 0.04, 0)); });
  b.add(c.box(0.92, 1.56, 0.05, '#FF6B2C', 0, 1.2, 0));
  const face = new T.Mesh(new T.PlaneGeometry(0.88, 1.52), new T.MeshStandardMaterial({ map: bannerTex(kind), roughness: 0.8 })); face.position.set(0, 1.2, 0.03); b.add(face);
  g.add(b);
}
let tmr = null;
function timerTex() { if (!tmr) { const cv = document.createElement('canvas'); cv.width = 160; cv.height = 72; const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace; tmr = { cv, tex }; } return tmr.tex; }
function timer(c, g, x, z) {
  const t = new T.Group(); t.position.set(x, 0, z); t.rotation.y = -0.35;
  [0, 2.1, 4.2].forEach(a => { const l = c.box(0.04, 1.2, 0.04, '#1a1a1a', Math.sin(a) * 0.25, 0.55, Math.cos(a) * 0.25); l.rotation.set(Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35); t.add(l); });
  t.add(c.box(0.05, 0.4, 0.05, '#1a1a1a', 0, 1.25, 0));
  t.add(c.box(1.05, 0.55, 0.22, '#1a1a1a', 0, 1.6, 0));
  const face = new T.Mesh(new T.PlaneGeometry(0.92, 0.42), new T.MeshBasicMaterial({ map: timerTex() })); face.position.set(0, 1.6, 0.115); t.add(face);
  g.add(t);
}
let scr = null, lastTick = -1;
export function screenTex() {
  if (!scr) { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 144; const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace; scr = { cv, tex, last: -1 }; }
  return scr.tex;
}
export function tickScreens(t) {
  if (t - lastTick < 0.08) return; lastTick = t;
  if (tmr) { const x = tmr.cv.getContext('2d'); x.fillStyle = '#0b0b0b'; x.fillRect(0, 0, 160, 72); x.fillStyle = '#E6FF3A'; x.font = 'bold 46px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; const s = Math.floor(t * 10) % 600; x.fillText('0' + Math.floor(s / 100) + ':' + String(Math.floor(s / 10) % 10) + (s % 10), 80, 38); tmr.tex.needsUpdate = true; }
  if (!scr) return;
  const x = scr.cv.getContext('2d'); x.fillStyle = '#2d6a3a'; x.fillRect(0, 0, 256, 144);
  x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 2; x.strokeRect(8, 8, 240, 128); x.beginPath(); x.moveTo(128, 8); x.lineTo(128, 136); x.stroke(); x.beginPath(); x.arc(128, 72, 18, 0, 7); x.stroke();
  const O = [], Bl = [];
  for (let i = 0; i < 5; i++) { O.push([50 + i * 34 + 14 * Math.sin(t * 0.7 + i), 72 + 42 * Math.sin(t * 0.5 + i * 1.3)]); Bl.push([70 + i * 32 + 12 * Math.sin(t * 0.6 + i * 2), 72 + 40 * Math.cos(t * 0.45 + i)]); }
  x.setLineDash([5, 4]); x.strokeStyle = '#FFC940'; x.beginPath(); x.moveTo(O[1][0], O[1][1]); x.lineTo(O[3][0], O[3][1]); x.stroke(); x.setLineDash([]);
  Bl.forEach(([a, c]) => { x.fillStyle = '#8FC7FF'; x.beginPath(); x.arc(a, c, 6, 0, 7); x.fill(); });
  O.forEach(([a, c]) => { x.fillStyle = '#FF6B2C'; x.beginPath(); x.arc(a, c, 6, 0, 7); x.fill(); });
  const u = (t * 0.5) % 1; x.fillStyle = '#fff'; x.beginPath(); x.arc(O[1][0] + (O[3][0] - O[1][0]) * u, O[1][1] + (O[3][1] - O[1][1]) * u, 3.5, 0, 7); x.fill();
  x.fillStyle = 'rgba(14,31,22,.8)'; x.fillRect(8, 8, 74, 16); x.fillStyle = '#FFC940'; x.font = 'bold 11px sans-serif'; x.fillText('ANALYSIS', 13, 20);
  scr.tex.needsUpdate = true;
}

export function makeBuilding(c, type, L, w = 5.6, d = 5.6) {
  const g = new T.Group();
  const B = (...a) => { const m = c.box(...a); g.add(m); return m; };
  const M = (...a) => { const m = c.mesh(...a); g.add(m); return m; };
  if (!['futsal', 'video', 'pool', 'clinic', 'cones', 'wall', 'track', 'gym', 'passing', 'keeper', 'youth', 'off'].includes(type)) B(5.6, 0.2, 5.6, { cones: '#5c9a55', wall: '#7b8a74', track: '#b9523a', gym: '#8d949c', stands: '#6f7580', food: '#b89a6e' }[type], 0, 0.1, 0);
  if (type === 'passing') {
    outline(c, g, 5.8, 5.8);
    const n = Math.min(4, 1 + L);
    for (let k = 0; k < 4; k++) {
      const x = (k - 1.5) * 1.35;
      if (k < n) { B(1.0, 0.45, 0.1, '#b98a4a', x, 0.3, -1.95); B(1.1, 0.06, 0.5, '#1a1a1a', x, 0.03, -1.8); B(0.08, 0.4, 0.35, '#1a1a1a', x - 0.5, 0.2, -1.85); B(0.08, 0.4, 0.35, '#1a1a1a', x + 0.5, 0.2, -1.85); }
      flat(c, g, 0.5, 0.06, x, 1.9, '#F7A8C8');
    }
    [-2.6, 2.6].forEach(x => [-2.6, 2.6].forEach(z => cone(c, g, x, z, 0.8)));
    if (L >= 3) ballBag(c, g, 2.3, 2.4);
    if (L >= 5) [-2.0, 2.0].forEach(x => { B(0.36, 1.5, 0.2, '#FFC940', x, 0.9, -0.3); M(new T.SphereGeometry(0.18, 10, 8), '#FFC940', x, 1.8, -0.3); });
  }
  if (type === 'keeper') {
    for (let i = 0; i < 5; i++) M(new T.SphereGeometry(0.2, 12, 10), '#ffffff', -1 + i * 0.5, 0.2, 4.7);
    cone(c, g, -2.2, 4.2, 0.7); cone(c, g, 2.2, 4.2, 0.7);
    if (L >= 2) [-1.6, 1.6].forEach(x => B(1.4, 0.12, 1.0, '#2F6FD6', x, 0.06, -0.8));
    if (L >= 3) { B(0.06, 1.2, 0.06, '#1a1a1a', -0.9, 0.6, 2.7); B(0.06, 1.2, 0.06, '#1a1a1a', 0.9, 0.6, 2.7); const nt = B(1.8, 1.1, 0.03, '#e8e8e8', 0, 0.65, 2.6, { transparent: true, opacity: 0.55 }); nt.rotation.x = -0.35; }
    if (L >= 4) { for (let k = 0; k < 6; k++) flat(c, g, 0.9, 0.06, -2.4, 0.4 + k * 0.4, '#FFE08A'); flat(c, g, 0.06, 2.1, -2.85, 1.4, '#FFE08A'); flat(c, g, 0.06, 2.1, -1.95, 1.4, '#FFE08A'); }
    if (L >= 5) { B(0.8, 0.7, 0.8, '#2a3b33', 2.4, 0.35, 5.0); M(new T.CylinderGeometry(0.18, 0.18, 0.5, 12), '#9aa3ad', 2.4, 0.95, 4.8); }
  }
  if (type === 'youth') {
    B(5.6, 0.04, 5.6, '#4f9a4d', 0, 0.02, 0); outline(c, g, 5.4, 5.4);
    [-2.4, 2.4].forEach(z => { B(0.06, 0.8, 0.06, '#ffffff', -0.8, 0.4, z); B(0.06, 0.8, 0.06, '#ffffff', 0.8, 0.4, z); B(1.66, 0.06, 0.06, '#ffffff', 0, 0.8, z); B(1.6, 0.75, 0.03, '#e8e8e8', 0, 0.4, z + (z > 0 ? 0.3 : -0.3), { transparent: true, opacity: 0.4 }); });
    const spots = [[-1.2, -1.0], [1.0, -0.6], [-0.4, 0.8], [1.4, 1.3], [-1.6, 1.5], [0.3, -1.7], [2.0, -0.2], [-2.0, 0.1]];
    const nK = Math.min(8, 2 + Math.round(L * 1.2));
    for (let i = 0; i < nK; i++) {
      const [x, z] = spots[i], kid = new T.Group(), col = i % 2 ? '#8FC7FF' : '#FFC940';
      kid.add(c.box(0.16, 0.42, 0.18, '#1a1a1a', -0.1, 0.21, 0)); kid.add(c.box(0.16, 0.42, 0.18, '#1a1a1a', 0.1, 0.21, 0));
      kid.add(c.box(0.42, 0.46, 0.26, col, 0, 0.66, 0)); kid.add(c.mesh(new T.SphereGeometry(0.17, 12, 10), ['#f1c9a5', '#b57a50', '#d9a47a', '#8a5634'][i % 4], 0, 1.04, 0));
      kid.position.set(x, 0, z); kid.rotation.y = i * 1.7; g.add(kid);
    }
    M(new T.SphereGeometry(0.16, 12, 10), '#ffffff', 0.2, 0.16, 0.1);
    if (L >= 3) ballBag(c, g, 2.3, 2.3);
    if (L >= 4) { B(2.0, 0.1, 0.45, '#b98a4a', -1.2, 0.45, 2.5); [-2.0, -0.4].forEach(x => B(0.1, 0.45, 0.4, '#1a1a1a', x, 0.22, 2.5)); }
  }
  if (type === 'cones') {
    outline(c, g, 5.8, 5.8);
    const n = 4 + L * 2;
    for (let k = 0; k < n; k++) cone(c, g, -2.2 + 4.4 * k / (n - 1), k % 2 ? 0.2 : -1.2, 0.85);
    [-2.7, 2.7].forEach(x => g.add(c.mesh(new T.CylinderGeometry(0.2, 0.28, 0.06, 14), '#FFC940', x, 0.04, -0.5)));
    if (L >= 2) { [1.6, 2.2].forEach(z => flat(c, g, 4.4, 0.07, 0, z, '#FFC940')); for (let k = 0; k <= 8; k++) flat(c, g, 0.07, 0.6, -2.2 + k * 0.55, 1.9, '#FFC940'); }
    if (L >= 3) for (let k = 0; k < L - 1; k++) { const x = -2 + k * 1.3; g.add(c.mesh(new T.CylinderGeometry(0.035, 0.035, 1.5, 8), k % 2 ? '#FF5B5B' : '#FFC940', x, 0.77, -2.35)); g.add(c.mesh(new T.CylinderGeometry(0.16, 0.18, 0.05, 12), '#1a1a1a', x, 0.03, -2.35)); }
    ballBag(c, g, 2.55, 2.5);
    banner(c, g, 'cones', -2.75, -2.95);
  }
  if (type === 'wall') {
    // Sits in front of the real goal: local -z is the goal line, crossbar at y 2.6.
    const n = Math.min(5, 1 + L);
    for (let k = 0; k < n; k++) {
      const x = n === 1 ? 0 : -1.8 + 3.6 * k / (n - 1), y = 1.1 + (k % 2) * 0.9;
      g.add(c.mesh(new T.TorusGeometry(0.42, 0.06, 8, 24), k % 2 ? '#FFC940' : '#FF6B2C', x, y, -1.9));
      const cord = 2.6 - (y + 0.42); g.add(c.box(0.02, cord, 0.02, '#1a1a1a', x, y + 0.42 + cord / 2, -1.9));
    }
    for (let k = 0; k < Math.min(L + 1, 5); k++) g.add(c.mesh(new T.SphereGeometry(0.2, 12, 10), '#ffffff', -2 + k * 0.55, 0.2, 2.9));
    ballBag(c, g, 2.7, 2.7);
    banner(c, g, 'wall', -3.9, -0.8);
    if (L >= 4) banner(c, g, 'wall', 3.9, -0.8);
    if (L >= 3) [-1.2, 1.2].forEach(x => { g.add(c.box(0.5, 1.5, 0.12, '#2F6FD6', x, 0.95, 0.1)); g.add(c.mesh(new T.SphereGeometry(0.2, 10, 8), '#2F6FD6', x, 1.9, 0.1)); g.add(c.box(0.05, 0.25, 0.05, '#1a1a1a', x, 0.1, 0.1)); });
  }
  if (type === 'track') {
    const n = L >= 3 ? 4 : 3, lw = 4.4 / n;
    for (let i = 0; i <= n; i++) flat(c, g, 0.08, 5.6, -2.2 + i * lw, 0);
    flat(c, g, 4.48, 0.14, 0, 2.8); flat(c, g, 4.48, 0.08, 0, -2.8);
    [-2.45, 2.45].forEach(x => [-2.8, -0.95, 0.95, 2.8].forEach(z => cone(c, g, x, z, 0.85)));
    if (L >= 2) for (let h = 0; h < L - 1; h++) { const hz = -1.5 + h * 1.0; [-2.2, 2.2].forEach(x => g.add(c.box(0.06, 0.55, 0.06, '#ffffff', x, 0.28, hz))); g.add(c.box(4.4, 0.08, 0.06, '#FF6B2C', 0, 0.55, hz)); }
    banner(c, g, 'track', -2.75, -3.15); banner(c, g, 'track', 2.75, -3.15);
    timer(c, g, 3.25, -2.3);
    if (L >= 5) timer(c, g, -3.25, 2.4);
  }
  if (type === 'gym') {
    const mat = c.box(5.4, 0.04, 4.8, '#2b2f33', 0, 0.02, 0.1); mat.castShadow = false; g.add(mat);
    [[-1.3, -1.95], [-1.3, -1.35], [1.3, -1.95], [1.3, -1.35]].forEach(([x, z]) => g.add(c.box(0.1, 2.3, 0.1, '#9aa3ad', x, 1.15, z)));
    [-1.3, 1.3].forEach(x => g.add(c.box(0.1, 0.1, 0.7, '#9aa3ad', x, 2.3, -1.65)));
    g.add(c.box(2.7, 0.1, 0.1, '#9aa3ad', 0, 2.3, -1.95));
    const rod = c.mesh(new T.CylinderGeometry(0.035, 0.035, 3.0, 8), '#c9ced4', 0, 1.45, -1.35); rod.rotation.z = Math.PI / 2; g.add(rod);
    [-1.2, 1.2].forEach(x => { const p = c.mesh(new T.CylinderGeometry(0.24, 0.24, 0.08, 16), '#2a3b33', x * 1.05, 1.45, -1.35); p.rotation.z = Math.PI / 2; g.add(p); });
    for (let k = 0; k < 2 + L; k++) { const x = -2.4 + k * 0.38; g.add(c.mesh(new T.SphereGeometry(0.15, 12, 10), '#2a3b33', x, 0.19, 2.2)); g.add(c.mesh(new T.TorusGeometry(0.08, 0.025, 6, 12), '#2a3b33', x, 0.37, 2.2)); }
    if (L >= 2) { g.add(c.box(0.5, 0.7, 1.6, '#9aa3ad', 2.3, 0.37, -0.6)); for (let k = 0; k < 4; k++) { const d = c.mesh(new T.CylinderGeometry(0.09, 0.09, 0.45, 10), '#2a3b33', 2.3, 0.8, -1.2 + k * 0.4); d.rotation.z = Math.PI / 2; g.add(d); } }
    if (L >= 3) { g.add(c.box(0.5, 0.12, 1.3, '#FF6B2C', -2.2, 0.48, -0.4)); [-0.9, 0.1].forEach(z => g.add(c.box(0.4, 0.42, 0.08, '#2a3b33', -2.2, 0.22, z))); }
    if (L >= 4) [1.4, 1.9, 2.4].forEach(z => g.add(c.mesh(new T.SphereGeometry(0.22, 12, 10), '#8FC7FF', 2.3, 0.26, z)));
    if (L >= 5) { g.add(c.box(0.8, 0.6, 0.6, '#FFC940', -2.3, 0.34, 1.2)); g.add(c.box(0.6, 0.4, 0.5, '#FFC940', -2.3, 0.84, 1.2)); }
    banner(c, g, 'gym', -2.95, -2.7);
  }
  if (type === 'stands') {
    const n = Math.min(6, 1 + L);
    for (let k = 0; k < n; k++) {
      const ht = (k + 1) * 0.42, z = 2.2 - k * 0.72;
      B(5.2, ht, 0.72, '#d7d0bf', 0, 0.2 + ht / 2, z);
      for (let s = 0; s < 8; s++) B(0.42, 0.22, 0.32, s % 2 ? '#F4F1E6' : '#FF6B2C', -2.2 + s * 0.63, 0.2 + ht + 0.11, z);
    }
    if (L >= 4) { B(5.6, 0.12, 2.4, '#2a3b33', 0, 0.3 + n * 0.42 + 1.2, 2.2 - (n - 1) * 0.72 + 0.6); }
  }
  if (type === 'food') {
    B(3.4, 1.6, 2, '#F4F1E6', 0, 1, -0.8);
    B(3.2, 0.5, 0.08, '#2a3b33', 0, 1.3, 0.22);
    const aw = B(3.8, 0.12, 1.2, '#FF6B2C', 0, 1.95, 0.4); aw.rotation.x = 0.35;
    B(3.6, 0.5, 0.2, '#FFC940', 0, 2.2, -0.8);
    for (let k = 0; k < Math.min(L, 4); k++) {
      const x = -1.8 + k * 1.2;
      M(new T.CylinderGeometry(0.45, 0.45, 0.06, 14), '#ffffff', x, 0.85, 2);
      M(new T.CylinderGeometry(0.06, 0.06, 0.65, 6), '#2a3b33', x, 0.5, 2);
    }
  }
  if (type === 'futsal') {
    B(w, 0.2, d, '#2657B0', 0, 0.1, 0); B(w - 1.2, 0.02, d - 1.2, '#3c85e6', 0, 0.21, 0);
    const iw = w - 1.6, id = d - 1.6, lc = '#ffffff';
    [[0, id / 2, iw, 0.1], [0, -id / 2, iw, 0.1], [iw / 2, 0, 0.1, id], [-iw / 2, 0, 0.1, id], [0, 0, 0.1, id]].forEach(q => B(q[2], 0.02, q[3], lc, q[0], 0.225, q[1]));
    const ring = new T.Mesh(new T.RingGeometry(1.4, 1.52, 40), c.mat('#ffffff')); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.23; g.add(ring);
    [-1, 1].forEach(s => {
      const gx = s * (iw / 2 - 1.2); [[gx, 2, 0.1, 4], [gx, -2, 0.1, 4]].forEach(q => B(2.4, 0.02, 0.1, lc, s * (iw / 2 - 1.2), 0.225, q[1]));
      B(0.1, 0.02, 4.1, lc, s * (iw / 2 - 2.4), 0.225, 0);
      const px = s * (iw / 2 + 0.1);
      [-1.5, 1.5].forEach(z => B(0.12, 1.6, 0.12, '#ffffff', px, 1.0, z)); B(0.12, 0.12, 3.1, '#ffffff', px, 1.8, 0);
      if (L >= 2) { const net = new T.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, side: T.DoubleSide }); const bk = new T.Mesh(new T.PlaneGeometry(3, 1.6), net); bk.position.set(px + s * 0.6, 1.0, 0); bk.rotation.y = Math.PI / 2; g.add(bk); }
    });
    [[0, -d / 2 + 0.1, w, 0.15], [w / 2 - 0.1, 0, 0.15, d], [-w / 2 + 0.1, 0, 0.15, d]].forEach(q => B(q[2], 0.55, q[3], '#ece5d3', q[0], 0.47, q[1]));
    [[-w / 4, d / 2 - 0.1], [w / 4, d / 2 - 0.1]].forEach(q => B(w / 2 - 1.5, 0.35, 0.15, '#ece5d3', q[0], 0.37, q[1]));
    if (L >= 3) { B(4, 0.4, 0.6, '#FF6B2C', 0, 0.4, d / 2 + 0.6); }
    if (L >= 4) { B(3.2, 1.3, 0.2, '#0E1F16', 0, 2.3, -d / 2 + 0.1); B(2.6, 0.6, 0.05, '#FFC940', 0, 2.3, -d / 2 + 0.22, { emissive: '#FFC940', emissiveIntensity: 0.6 }); }
    if (L >= 5) for (let k = 0; k < 8; k++) B(0.5, 0.7, 0.04, k % 2 ? '#FF6B2C' : '#FFC940', -w / 2 + 1 + k * (w - 2) / 7, 1.2, -d / 2 + 0.2);
  }
  if (type === 'video') {
    B(w, 0.2, d, '#3a2f4a', 0, 0.1, 0);
    B(4.8, 2.8, 0.15, '#1a1a1a', 0, 1.8, -d / 2 + 0.4);
    const sc = new T.Mesh(new T.PlaneGeometry(4.4, 2.48), new T.MeshBasicMaterial({ map: screenTex() })); sc.position.set(0, 1.8, -d / 2 + 0.49); g.add(sc);
    const chair = (x, z) => { B(0.9, 0.12, 0.8, '#FF6B2C', x, 0.62, z); B(0.9, 0.8, 0.12, '#FF6B2C', x, 1.0, z + 0.42); B(0.12, 0.42, 0.12, '#2a3b33', x, 0.4, z); };
    [-1.6, 0, 1.6].forEach(x => chair(x, 1.3));
    if (L >= 3) [-1.6, 0, 1.6].forEach(x => chair(x, 2.8));
    if (L >= 2) { B(0.6, 0.3, 0.5, '#9aa3ad', 0, 2.9, 2.2); }
    if (L >= 4) { B(1.4, 1.6, 0.1, '#ffffff', w / 2 - 0.7, 1.0, -1.2); }
    if (L >= 5) { const pl = c.mesh(new T.CylinderGeometry(0.3, 0.24, 0.5, 10), '#b98a4a', -w / 2 + 0.6, 0.45, -d / 2 + 0.8); g.add(pl); M(new T.SphereGeometry(0.45, 10, 8), '#3b7a3f', -w / 2 + 0.6, 1.0, -d / 2 + 0.8); }
  }
  if (type === 'clinic') {
    B(w, 0.2, d, '#e9f0ee', 0, 0.1, 0);
    [-2.2, 0, 2.2].forEach(x => { B(1.1, 0.5, 2.3, '#ffffff', x, 0.45, 0); B(1.0, 0.1, 2.2, '#8FC7FF', x, 0.75, 0); B(0.7, 0.12, 0.4, '#ffffff', x, 0.86, -0.85); });
    B(w - 0.6, 1.6, 0.4, '#ffffff', 0, 1.0, -d / 2 + 0.35);
    B(1, 1, 0.1, '#ffffff', 0, 2.4, -d / 2 + 0.3); B(0.7, 0.2, 0.05, '#FF5B5B', 0, 2.4, -d / 2 + 0.37); B(0.2, 0.7, 0.05, '#FF5B5B', 0, 2.4, -d / 2 + 0.37);
    if (L >= 2) { B(1.6, 0.6, 1.1, '#ffffff', 2.3, 0.5, 2.55); B(1.4, 0.04, 0.9, '#7FD6E8', 2.3, 0.81, 2.55, { transparent: true, opacity: 0.9 }); }
    if (L >= 3) M(new T.SphereGeometry(0.4, 14, 12), '#FF6B2C', -2.4, 0.6, 2.6);
    if (L >= 4) { B(1.4, 1.0, 0.4, '#2a3b33', -0.4, 0.7, 2.9); }
    if (L >= 5) { const pl = M(new T.CylinderGeometry(0.3, 0.24, 0.5, 10), '#b98a4a', w / 2 - 0.5, 0.45, -1.8); M(new T.SphereGeometry(0.45, 10, 8), '#3b7a3f', w / 2 - 0.5, 1.0, -1.8); }
  }
  if (type === 'pool') {
    B(w, 0.2, d, '#e6ecee', 0, 0.1, 0);
    B(w - 1.6, 0.06, d - 1.6, '#2e9cc4', 0, 0.2, 0, { transparent: true, opacity: 0.92 });
    [-1.05, 1.05].forEach(z => { for (let k = 0; k < 12; k++) B((w - 1.6) / 12 - 0.05, 0.07, 0.1, k % 2 ? '#ffffff' : '#FF5B5B', -(w - 1.6) / 2 + ((k + 0.5) * (w - 1.6)) / 12, 0.25, z); });
    if (L >= 2) [-2.1, 0, 2.1].forEach(z => { B(0.5, 0.35, 0.6, '#2a3b33', -w / 2 + 0.45, 0.37, z); B(0.5, 0.35, 0.6, '#2a3b33', w / 2 - 0.45, 0.37, z); });
    if (L >= 3) { B(0.8, 2.2, 0.8, '#FFC940', w / 2 - 0.5, 1.3, -d / 2 - 0.3); }
    if (L >= 4) for (let k = 0; k < 10; k++) B(0.4, 0.5, 0.04, k % 2 ? '#FF6B2C' : '#F4F1E6', -w / 2 + 1.2 + k * (w - 2.4) / 9, 2.4, 0);
    if (L >= 5) [-3, -1, 1, 3].forEach(x => { B(0.8, 0.25, 1.6, '#FF6B2C', x, 0.45, d / 2 + 1.1); });
  }
  return g;
}
