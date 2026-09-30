import * as T from './vendor/three.module.js';
import { seeded } from './ka-data.js?v=munxl0i1';

const BOARD_TXT = [['KICKOFF ACADEMY', '#0E1F16', '#FFC940'], ['TRAIN HARD · PLAY FAIR', '#FF6B2C', '#0E1F16'], ['GRASSROOTS FOOTBALL', '#F4F1E6', '#0E1F16']];
function boardTextures() {
  const list = BOARD_TXT.map(([txt, bg, fg]) => {
    const cv = document.createElement('canvas'); cv.width = 768; cv.height = 96;
    const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace;
    const draw = () => { const x = cv.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, 768, 96); x.fillStyle = fg; x.font = "900 46px 'Archivo Black', Archivo, sans-serif"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 384, 52); tex.needsUpdate = true; };
    draw(); if (document.fonts) document.fonts.ready.then(draw);
    return tex;
  });
  return list;
}

export function decorate(sc) {
  const S = sc.scene;
  const A = (w, h, d, c, x, y, z, o) => { const m = sc.box(w, h, d, c, x, y, z, o); S.add(m); return m; };
  const M = (geo, c, x, y, z, o) => { const m = sc.mesh(geo, c, x, y, z, o); S.add(m); return m; };
  const flatA = (...a) => { const m = A(...a); m.castShadow = false; return m; };
  const PAVE = '#d8cfbd', JOINT = '#c4baa6', CURB = '#a9a293';

  // Walkway ring + paths to the indoor door and the entrance gate
  const path = (x0, x1, z0, z1, jx) => {
    flatA(x1 - x0, 0.06, z1 - z0, PAVE, (x0 + x1) / 2, 0.03, (z0 + z1) / 2);
    if (jx) for (let x = x0 + 1.4; x < x1; x += 1.4) flatA(0.05, 0.004, z1 - z0, JOINT, x, 0.062, (z0 + z1) / 2);
    else for (let z = z0 + 1.4; z < z1; z += 1.4) flatA(x1 - x0, 0.004, 0.05, JOINT, (x0 + x1) / 2, 0.062, z);
  };
  path(-27.6, 27.6, -18.2, -16.6, true); path(-27.6, 27.6, 16.6, 18.2, true);
  path(-27.6, -25.8, -16.6, 16.6, false); path(25.8, 27.6, -16.6, 16.6, false);
  path(-1.2, 1.2, -23.7, -18.2, false); path(-1.3, 1.3, 18.2, 27.4, false);
  [[0, -18.25, 55.4, 0.12], [0, 18.25, 55.4, 0.12]].forEach(([x, z, w, d]) => A(w, 0.12, d, CURB, x, 0.06, z));
  [[-27.65, 0], [27.65, 0]].forEach(([x, z]) => A(0.12, 0.12, 36.6, CURB, x, 0.06, z));

  // Dugouts (players rest on the home bench at x -3..3, z 15.2)
  const dugout = (cx, seatsX) => {
    const w = seatsX[seatsX.length - 1] - seatsX[0] + 2.2;
    A(w, 0.08, 1.5, '#8d949c', cx, 0.34, 15.75);
    A(w, 1.9, 0.12, '#1E3A5F', cx, 1.3, 16.45);
    [-1, 1].forEach(s => A(0.12, 1.9, 1.5, '#1E3A5F', cx + s * w / 2, 1.3, 15.75));
    const roof = A(w + 0.3, 0.06, 1.8, '#bfe3ee', cx, 2.3, 15.6, { transparent: true, opacity: 0.4 }); roof.rotation.x = -0.12; roof.castShadow = false;
    A(w + 0.3, 0.12, 0.12, '#1E3A5F', cx, 2.22, 14.72);
    seatsX.forEach(x => { A(0.8, 0.12, 0.55, '#FF6B2C', cx + x, 0.94, 15.8); A(0.8, 0.55, 0.08, '#FF6B2C', cx + x, 1.25, 16.1); A(0.1, 0.55, 0.1, '#2a3b33', cx + x, 0.62, 15.8); });
  };
  dugout(0, [-3, -1.8, -0.6, 0.6, 1.8, 3]);
  dugout(12, [-1.8, -0.6, 0.6, 1.8]);
  // technical area markings
  [[-4.8, 4.8], [9.4, 14.6]].forEach(([a, b]) => { flatA(b - a, 0.02, 0.08, '#f4f4ee', (a + b) / 2, 0.312, 14.2); [a, b].forEach(x => flatA(0.08, 0.02, 1.6, '#f4f4ee', x, 0.312, 15.0)); });

  // Advertising boards along the top touchline and behind both goals
  const tex = boardTextures();
  const board = (x, z, rot, len, i) => {
    const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
    g.add(sc.box(len, 0.8, 0.12, '#1a1a1a', 0, 0.72, 0));
    [-len / 2 + 0.2, len / 2 - 0.2].forEach(px => g.add(sc.box(0.1, 0.4, 0.5, '#1a1a1a', px, 0.32, -0.2)));
    const face = new T.Mesh(new T.PlaneGeometry(len - 0.1, 0.72), new T.MeshBasicMaterial({ map: tex[i % tex.length] })); face.position.set(0, 0.72, 0.065); g.add(face);
    S.add(g);
  };
  for (let k = 0; k < 8; k++) board(-21 + k * 6, -16.42, 0, 5.9, k);
  for (let k = 0; k < 5; k++) { board(-25.45, -12 + k * 6, Math.PI / 2, 5.9, k + 1); board(25.45, -12 + k * 6, -Math.PI / 2, 5.9, k + 2); }

  // Corner flags
  [[-24, -15], [24, -15], [-24, 15], [24, 15]].forEach(([x, z]) => {
    M(new T.CylinderGeometry(0.03, 0.03, 1.5, 6), '#ffffff', x, 1.05, z);
    const f = new T.Mesh(new T.PlaneGeometry(0.5, 0.34), new T.MeshStandardMaterial({ color: '#FF6B2C', side: T.DoubleSide })); f.position.set(x + 0.25 * Math.sign(-x), 1.62, z); S.add(f);
  });

  // Lamp posts along the walkway
  [[-28.2, -18.8], [-9, -18.8], [9, -18.8], [28.2, -18.8], [-28.2, 0], [28.2, 0], [-28.2, 18.8], [28.2, 18.8]].forEach(([x, z]) => {
    M(new T.CylinderGeometry(0.08, 0.12, 3.6, 8), '#2a3b33', x, 1.8, z);
    A(0.7, 0.12, 0.7, '#2a3b33', x, 3.66, z);
    A(0.5, 0.08, 0.5, '#fff3b0', x, 3.57, z, { emissive: '#fff3b0', emissiveIntensity: 0.8 });
  });

  // Park benches + bins on the bottom walkway
  [-22, -14, 14, 22].forEach(x => {
    A(1.8, 0.08, 0.45, '#b98a4a', x, 0.5, 18.9); A(1.8, 0.4, 0.06, '#b98a4a', x, 0.82, 19.12);
    [-0.75, 0.75].forEach(d => A(0.08, 0.5, 0.45, '#2a3b33', x + d, 0.25, 18.9));
  });
  [-23.6, 23.6].forEach(x => { M(new T.CylinderGeometry(0.25, 0.22, 0.7, 12), '#2F6FD6', x, 0.35, 18.9); M(new T.CylinderGeometry(0.27, 0.27, 0.06, 12), '#1E3A5F', x, 0.72, 18.9); });

  // Flower beds and bushes
  const rr = seeded(21), FL = ['#FF6B2C', '#FFC940', '#F4F1E6', '#FF8A7A'];
  const bed = (x, z, w, d) => {
    A(w, 0.25, d, '#6b4a2e', x, 0.125, z); A(w + 0.16, 0.3, 0.1, CURB, x, 0.15, z - d / 2); A(w + 0.16, 0.3, 0.1, CURB, x, 0.15, z + d / 2);
    const n = Math.round(w * d * 2.2);
    for (let k = 0; k < n; k++) { const bx = x + (rr() - 0.5) * (w - 0.3), bz = z + (rr() - 0.5) * (d - 0.3); if (rr() < 0.35) M(new T.SphereGeometry(0.28 + rr() * 0.12, 8, 6), ['#2f6b3a', '#3b7a3f'][k % 2], bx, 0.42, bz); else M(new T.SphereGeometry(0.1, 6, 5), FL[k % 4], bx, 0.32, bz); }
  };
  bed(-3, 22.6, 1.4, 6.6); bed(3, 22.6, 1.4, 6.6);
  bed(-31.5, -16.5, 3.2, 1.6); bed(31.5, -16.5, 3.2, 1.6); bed(-31.5, 16.5, 3.2, 1.6); bed(31.5, 16.5, 3.2, 1.6);
  bed(-24, -24.5, 5, 1.4); bed(24, -24.5, 5, 1.4);

  // Entrance gate
  [-2.3, 2.3].forEach(x => { A(0.8, 3.4, 0.8, '#ece5d3', x, 1.7, 26.9); A(0.95, 0.2, 0.95, '#FF6B2C', x, 3.5, 26.9); });
  A(5.4, 0.9, 0.5, '#0E1F16', 0, 3.2, 26.9);
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const gt = new T.CanvasTexture(cv); gt.colorSpace = T.SRGBColorSpace;
  const drawG = () => { const x = cv.getContext('2d'); x.fillStyle = '#0E1F16'; x.fillRect(0, 0, 512, 96); x.fillStyle = '#FFC940'; x.font = "900 44px 'Archivo Black', Archivo, sans-serif"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('KICKOFF ACADEMY', 256, 52); gt.needsUpdate = true; };
  drawG(); if (document.fonts) document.fonts.ready.then(drawG);
  [0.26, -0.26].forEach((dz, i) => { const p = new T.Mesh(new T.PlaneGeometry(5.2, 0.8), new T.MeshBasicMaterial({ map: gt })); p.position.set(0, 3.2, 26.9 + dz); if (i) p.rotation.y = Math.PI; S.add(p); });
}
