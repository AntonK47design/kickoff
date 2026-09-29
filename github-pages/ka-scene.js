import * as T from './vendor/three.module.js';
import { PW, PD, SLOTS, ST, cap, seeded, IX, IZ } from './ka-data.js';
import { makeBuilding, tickScreens } from './ka-build.js';
import { Actors } from './ka-actors.js';
import { Manager, Pads } from './ka-pads.js';
import { decorate } from './ka-deco.js';
import { Guide } from './ka-guide.js';
import { sfx } from './ka-audio.js';

export class GameScene {
  constructor(el, floatEl, getG, onTap) {
    this.el = el; this.floatEl = floatEl; this.getG = getG; this.onTap = onTap;
    this._m = {}; this.selSlot = null; this.t = 0;
    const R = this.renderer = new T.WebGLRenderer({ antialias: true });
    R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap; R.outputColorSpace = T.SRGBColorSpace;
    el.appendChild(R.domElement);
    Object.assign(R.domElement.style, { display: 'block', width: '100%', height: '100%', touchAction: 'none' });
    const S = this.scene = new T.Scene();
    S.background = new T.Color('#1d3b2a'); S.fog = new T.Fog('#1d3b2a', 60, 120);
    this.camera = new T.PerspectiveCamera(42, 1, 0.5, 300);
    this.hemi = new T.HemisphereLight('#fff6e0', '#244a30', 1.1); S.add(this.hemi);
    const D = new T.DirectionalLight('#fff1d0', 2.1); D.position.set(-24, 55, 30); D.castShadow = true;
    D.shadow.mapSize.set(2048, 2048);
    Object.assign(D.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 160 });
    D.shadow.bias = -0.0005; S.add(D); S.add(D.target); this.sun = D;
    this.buildWorld();
    this.slotGroups = SLOTS.map(s => { const gr = new T.Group(); gr.position.set(s.x, s.kind !== 'venue' ? 0.3 : 0, s.z); gr.rotation.y = s.r; S.add(gr); return gr; });
    const mk = this.marker = new T.Group(); const gm = { emissive: '#FFC940', emissiveIntensity: 0.8 };
    [[0, 3.1, 6.6, 0.25], [0, -3.1, 6.6, 0.25], [3.1, 0, 0.25, 6.6], [-3.1, 0, 0.25, 6.6]].forEach(b => mk.add(this.box(b[2], 0.16, b[3], '#FFC940', b[0], 0.3, b[1], gm)));
    mk.visible = false; S.add(mk);
    const mkL = () => { const d = document.createElement('div'); Object.assign(d.style, { position: 'absolute', left: '0', top: '0', display: 'none', flexDirection: 'column', alignItems: 'center', gap: '3px', color: '#F4F1E6', font: "800 13px Archivo, sans-serif", whiteSpace: 'nowrap', pointerEvents: 'none', willChange: 'transform' }); floatEl.appendChild(d); return d; };
    this.doorOut = mkL(); this.doorIn = mkL();
    this.fade = document.createElement('div'); Object.assign(this.fade.style, { position: 'absolute', inset: '0', background: '#0E1F16', opacity: '0', transition: 'opacity .2s', pointerEvents: 'none' }); floatEl.appendChild(this.fade);
    this.labels = SLOTS.map(() => { const d = document.createElement('div'); Object.assign(d.style, { position: 'absolute', left: '0', top: '0', display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px 4px 5px', borderRadius: '999px', background: 'rgba(14,31,22,.88)', color: '#F4F1E6', font: "800 12px Archivo, sans-serif", whiteSpace: 'nowrap', boxShadow: '0 2px 0 rgba(0,0,0,.3)', willChange: 'transform' }); floatEl.appendChild(d); return d; });
    SLOTS.forEach((_, i) => this.refreshSlot(i));
    this.refreshPitch();
    this.actors = new Actors(this);
    this.manager = new Manager(this);
    this.pads = new Pads(this);
    this.guide = new Guide(this);
    this.camT = this.manager.fig.position.clone();
    this.joy = document.createElement('div'); Object.assign(this.joy.style, { position: 'absolute', left: 0, top: 0, width: '110px', height: '110px', marginLeft: '-55px', marginTop: '-55px', borderRadius: '50%', border: '3px solid rgba(255,255,255,.55)', background: 'rgba(14,31,22,.25)', display: 'none', pointerEvents: 'none' });
    this.knob = document.createElement('div'); Object.assign(this.knob.style, { position: 'absolute', left: '50%', top: '50%', width: '48px', height: '48px', marginLeft: '-24px', marginTop: '-24px', borderRadius: '50%', background: '#FFC940', boxShadow: '0 3px 0 #B8861B' });
    this.joy.appendChild(this.knob); floatEl.appendChild(this.joy);
    this.ray = new T.Raycaster();
    const cv = R.domElement;
    cv.addEventListener('contextmenu', e => e.preventDefault());
    cv.addEventListener('pointerdown', e => { if (this.down) return; this.down = { x: e.clientX, y: e.clientY, id: e.pointerId, joy: false }; try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
    cv.addEventListener('pointermove', e => {
      const d = this.down; if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y, dist = Math.hypot(dx, dy);
      if (!d.joy && dist > 12) { d.joy = true; const r = cv.getBoundingClientRect(); this.joy.style.display = 'block'; this.joy.style.transform = 'translate(' + (d.x - r.left) + 'px,' + (d.y - r.top) + 'px)'; }
      if (d.joy) { const k = Math.min(1, dist / 50), nx = dx / (dist || 1), ny = dy / (dist || 1); this.manager.dir = { x: nx * k, z: ny * k }; this.knob.style.transform = 'translate(' + nx * Math.min(dist, 44) + 'px,' + ny * Math.min(dist, 44) + 'px)'; }
    });
    const end = e => { const d = this.down; if (!d || d.id !== e.pointerId) return; this.down = null; this.manager.dir = null; this.joy.style.display = 'none'; this.knob.style.transform = ''; if (!d.joy && e.type === 'pointerup') this.tapAt(e.clientX, e.clientY); };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    this.onResize = () => this.resize(); window.addEventListener('resize', this.onResize); this.resize();
    this.last = performance.now();
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      const now = performance.now(), dt = Math.min(0.1, (now - this.last) / 1000); this.last = now;
      this.update(dt); R.render(S, this.camera);
    };
    loop();
  }
  dispose() { this.labels.forEach(l => l.remove()); this.doorOut.remove(); this.doorIn.remove(); this.fade.remove(); this.joy.remove(); for (const k in this.pads.items) this.pads.items[k].el.remove(); cancelAnimationFrame(this.raf); window.removeEventListener('resize', this.onResize); this.renderer.dispose(); this.renderer.domElement.remove(); }

  mat(c, o) { const k = c + (o ? JSON.stringify(o) : ''); if (!this._m[k]) this._m[k] = new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.85, metalness: 0 }, o || {})); return this._m[k]; }
  mesh(geo, c, x = 0, y = 0, z = 0, o) { const m = new T.Mesh(geo, this.mat(c, o)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; }
  box(w, h, d, c, x, y, z, o) { return this.mesh(new T.BoxGeometry(w, h, d), c, x, y, z, o); }

  buildWorld() {
    const S = this.scene;
    const gnd = new T.Mesh(new T.PlaneGeometry(300, 300), this.mat('#2d5f37')); gnd.rotation.x = -Math.PI / 2; gnd.receiveShadow = true; S.add(gnd);
    const yard = new T.Mesh(new T.PlaneGeometry(72, 54), this.mat('#3f7d47')); yard.rotation.x = -Math.PI / 2; yard.position.y = 0.02; yard.receiveShadow = true; S.add(yard);
    [[0, -27.4, 73, 0.8], [-19.6, 27.4, 34.2, 0.8], [19.6, 27.4, 34.2, 0.8]].forEach(h => S.add(this.box(h[2], 0.9, h[3], '#24502d', h[0], 0.45, h[1])));
    [[-36.4, 0], [36.4, 0]].forEach(h => S.add(this.box(0.8, 0.9, 54, '#24502d', h[0], 0.45, h[1])));
    const rr = seeded(7);
    for (let i = 0; i < 160; i++) {
      const x = (rr() - 0.5) * 190, z = (rr() - 0.5) * 150;
      if (Math.abs(x) < 39 && Math.abs(z) < 30) continue;
      const t = new T.Group();
      t.add(this.mesh(new T.CylinderGeometry(0.22, 0.28, 1.2, 6), '#6b4a2e', 0, 0.6, 0));
      t.add(this.mesh(new T.ConeGeometry(1.5, 3.4, 7), ['#2f6b3a', '#3b7a3f', '#285c33'][i % 3], 0, 2.8, 0));
      t.position.set(x, 0, z); t.scale.setScalar(0.8 + rr() * 0.9); S.add(t);
    }
    const base = this.box(PW + 2.4, 0.3, PD + 2.4, '#3b8743', 0, 0.15, 0); base.userData.pitch = true; S.add(base);
    const c = this.pitchCanvas = document.createElement('canvas'); c.width = 1024; c.height = 640;
    this.pitchTex = new T.CanvasTexture(c); this.pitchTex.colorSpace = T.SRGBColorSpace; this.pitchTex.anisotropy = 8;
    const top = new T.Mesh(new T.PlaneGeometry(PW, PD), new T.MeshStandardMaterial({ map: this.pitchTex, roughness: 0.95 }));
    top.rotation.x = -Math.PI / 2; top.position.y = 0.305; top.receiveShadow = true; top.userData.pitch = true; S.add(top);
    this.pitchGroup = new T.Group(); S.add(this.pitchGroup);
    const A = (w, h, dd, c, x, y, z, o) => { const m = this.box(w, h, dd, c, x, y, z, o); S.add(m); return m; };
    A(4.2, 3.4, 3, '#ece5d3', 0, 1.7, -25.2); A(4.6, 0.35, 3.4, '#FF6B2C', 0, 3.55, -25.2);
    this.doorMesh = A(1.8, 2.4, 0.1, '#4a5a52', 0, 1.2, -23.68);
    [-1.45, 1.45].forEach(x => A(0.8, 0.8, 0.06, '#9fd2e0', x, 2.2, -23.68));
    A(2.4, 0.04, 1.2, '#FF6B2C', 0, 0.02, -22.9);
    A(44.8, 0.3, 30.8, '#d9c7a3', IX, 0.15, IZ);
    for (let k = 0; k < 14; k++) A(44.6, 0.01, 0.04, '#c9b58f', IX, 0.305, IZ - 15 + k * 2.2);
    A(44.8, 3.2, 0.4, '#ece5d3', IX, 1.9, IZ - 15.2); A(44.8, 0.2, 0.5, '#FF6B2C', IX, 3.6, IZ - 15.2);
    for (let k = 0; k < 7; k++) A(3.2, 1.2, 0.05, '#9fd2e0', IX - 18 + k * 6, 2.2, IZ - 14.98);
    [-1, 1].forEach(sx => { A(0.4, 2.2, 30.8, '#ece5d3', IX + sx * 22.2, 1.4, IZ); A(0.5, 0.2, 30.8, '#FF6B2C', IX + sx * 22.2, 2.6, IZ); });
    A(20.2, 0.9, 0.4, '#ece5d3', IX - 12.3, 0.75, IZ + 15.2); A(20.2, 0.9, 0.4, '#ece5d3', IX + 12.3, 0.75, IZ + 15.2);
    A(3.4, 0.04, 1.4, '#FF6B2C', IX, 0.32, IZ + 14.2);
    [[3.5, 7], [9, 15.5], [17.5, 22]].forEach(([a, b]) => A(b - a, 1.0, 0.25, '#ece5d3', IX + (a + b) / 2, 0.8, IZ - 5.4));
    A(0.25, 1.0, 9.8, '#ece5d3', IX + 12.25, 0.8, IZ - 10.3);
    decorate(this);
  }

  resize() {
    const w = this.el.clientWidth, h = this.el.clientHeight; if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    const a = w / h; this.camera.aspect = a;
    this.camF = a < 1 ? 1.35 + (1 - a) * 0.6 : Math.max(1, 1.5 / a);
    this.camera.updateProjectionMatrix();
  }

  drawPitch() {
    const g = this.getG(), x = this.pitchCanvas.getContext('2d'), W = 1024, H = 640, gl = g.pitch.grass, ll = g.pitch.lines;
    x.fillStyle = ['#86994c', '#66a046', '#56a444', '#49a842', '#3eab40', '#35ae3f'][gl]; x.fillRect(0, 0, W, H);
    const r = seeded(3);
    if (gl === 0) { for (let i = 0; i < 34; i++) { x.fillStyle = 'rgba(130,100,60,.35)'; x.beginPath(); x.ellipse(r() * W, r() * H, 20 + r() * 50, 10 + r() * 25, r() * 3, 0, 7); x.fill(); } }
    else { const n = 8 + gl * 2, sw = W / n; x.fillStyle = `rgba(255,255,255,${0.035 + 0.014 * gl})`; for (let i = 1; i < n; i += 2) x.fillRect(i * sw, 0, sw, H); }
    x.strokeStyle = `rgba(255,255,255,${ll ? 0.7 + 0.06 * ll : 0.3})`; x.fillStyle = x.strokeStyle; x.lineWidth = ll ? 5 + ll * 0.6 : 4;
    x.setLineDash(ll ? [] : [22, 14]);
    const m = 24; x.strokeRect(m, m, W - 2 * m, H - 2 * m);
    x.beginPath(); x.moveTo(W / 2, m); x.lineTo(W / 2, H - m); x.stroke();
    x.beginPath(); x.arc(W / 2, H / 2, 78, 0, 7); x.stroke();
    x.beginPath(); x.arc(W / 2, H / 2, 6, 0, 7); x.fill();
    [[m, 1], [W - m, -1]].forEach(([gx, s]) => { x.strokeRect(s > 0 ? gx : gx - 150, H / 2 - 160, 150, 320); x.strokeRect(s > 0 ? gx : gx - 50, H / 2 - 75, 50, 150); });
    this.pitchTex.needsUpdate = true;
  }

  refreshPitch() {
    const P = this.getG().pitch, G = this.pitchGroup; this.drawPitch();
    while (G.children.length) G.remove(G.children[0]);
    const GS = 1.3, gl = P.goals, pc = gl === 0 ? '#c9a36b' : '#ffffff', t = gl >= 3 ? 0.17 : 0.12;
    const net = new T.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.18 + 0.06 * gl, side: T.DoubleSide, roughness: 1 });
    const GG = new T.Group(); GG.scale.set(1, GS, GS); GG.position.y = 0.3 * (1 - GS); G.add(GG);
    [-1, 1].forEach(s => {
      const G = GG, gx = s * (PW / 2 - 0.75);
      [-2.4, 2.4].forEach(z => G.add(this.box(t, 2, t, pc, gx, 1.3, z)));
      G.add(this.box(t, t, 4.8 + t, pc, gx, 2.3, 0));
      if (gl >= 1) {
        const bx = gx + s * 1.3;
        const back = new T.Mesh(new T.PlaneGeometry(4.8, 1.9), net); back.position.set(bx, 1.3, 0); back.rotation.y = Math.PI / 2; G.add(back);
        const topN = new T.Mesh(new T.PlaneGeometry(1.3, 4.8), net); topN.rotation.x = -Math.PI / 2; topN.position.set(gx + s * 0.65, 2.3, 0); G.add(topN);
        [-2.4, 2.4].forEach(z => { const sd = new T.Mesh(new T.PlaneGeometry(1.3, 2), net); sd.position.set(gx + s * 0.65, 1.3, z); G.add(sd); });
      }
    });
    const lv = P.lights, poles = [[-26.4, -17.2], [26.4, 17.2], [26.4, -17.2], [-26.4, 17.2]].slice(0, lv === 0 ? 0 : lv === 1 ? 2 : 4);
    poles.forEach(([px, pz]) => {
      const pole = new T.Group(), h = 9 + lv * 0.4;
      pole.add(this.mesh(new T.CylinderGeometry(0.14, 0.2, h, 8), '#9aa3ad', 0, h / 2, 0));
      const head = new T.Group(); head.add(this.box(1.8, 1, 0.3, '#2a3b33'));
      head.add(this.box(1.6, 0.8, 0.06, '#fffbe0', 0, 0, 0.18, { emissive: '#fff3b0', emissiveIntensity: 0.4 + 0.3 * lv }));
      head.position.y = h + 0.2; head.rotation.x = 0.5; pole.add(head);
      pole.position.set(px, 0, pz); pole.rotation.y = Math.atan2(-px, -pz); G.add(pole);
    });
    this.hemi.intensity = 1.1 + 0.07 * lv;
    G.traverse(o => { o.userData.pitch = true; });
  }

  refreshSlot(i) {
    const gr = this.slotGroups[i]; while (gr.children.length) gr.remove(gr.children[0]); gr.userData.plus = null;
    const b = this.getG().builds[i];
    if (!b) {
      const sl = SLOTS[i], W = sl.w || 5.4, Dd = sl.d || 5.4;
      gr.add(this.box(W, 0.1, Dd, sl.kind === 'indoor' ? '#c4ad84' : '#4b9152', 0, 0.05, 0));
      [[0, Dd / 2 - 0.05, W, 0.12], [0, -Dd / 2 + 0.05, W, 0.12], [W / 2 - 0.05, 0, 0.12, Dd], [-W / 2 + 0.05, 0, 0.12, Dd]].forEach(f => gr.add(this.box(f[2], 0.06, f[3], '#dfe9d8', f[0], 0.12, f[1])));
      const plus = new T.Group(), pm = { emissive: '#FFC940', emissiveIntensity: 0.5 };
      plus.add(this.box(1.5, 0.14, 0.36, '#FFC940', 0, 0, 0, pm)); plus.add(this.box(0.36, 0.14, 1.5, '#FFC940', 0, 0, 0, pm));
      plus.visible = false;
    } else gr.add(makeBuilding(this, b.type, b.level, SLOTS[i].w, SLOTS[i].d));
    gr.traverse(o => { o.userData.slot = i; });
  }

  walkTo(x, z) { this.manager.target = { x, z }; this.tapMark({ x, z }); }

  setSelected(i) {
    this.selSlot = i;
    if (i == null) { this.marker.visible = false; return; }
    const s = SLOTS[i], sw = Math.abs(Math.sin(s.r)) > 0.5; this.mBase = [((sw ? s.d : s.w) || 5.8) / 6.2, ((sw ? s.w : s.d) || 5.8) / 6.2]; this.marker.position.set(s.x, s.kind !== 'venue' ? 0.05 : 0, s.z); this.marker.visible = true;
  }

  tapAt(cx, cy) {
    const r = this.renderer.domElement.getBoundingClientRect();
    const v = new T.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(v, this.camera);
    const p = new T.Vector3();
    if (!this.ray.ray.intersectPlane(new T.Plane(new T.Vector3(0, 1, 0), -0.3), p)) return;
    const hit = SLOTS.findIndex(sl => { const sw = Math.abs(Math.sin(sl.r)) > 0.5, hw = ((sw ? sl.d : sl.w) || 5.8) / 2, hd = ((sw ? sl.w : sl.d) || 5.8) / 2; return Math.abs(p.x - sl.x) < hw && Math.abs(p.z - sl.z) < hd; });
    if (hit >= 0) { sfx('click'); return this.onTap({ slot: hit }); }
    const B = this.manager.fig.position.z < -60 ? [IX - 21.4, IX + 21.4, IZ - 14.4, IZ + 14.9] : [-35, 35, -26.2, 26.2];
    this.manager.target = { x: Math.max(B[0], Math.min(B[1], p.x)), z: Math.max(B[2], Math.min(B[3], p.z)) };
    this.tapMark(p); this.onTap({ walk: true });
  }

  proxVol(x, z) { if (!this.camT) return 0; const d = Math.hypot(x - this.camT.x, z - this.camT.z); return Math.max(0, 1 - d / 24); }

  tapMark(p) {
    sfx('tap');
    if (!this.tm) { this.tm = new T.Mesh(new T.RingGeometry(0.4, 0.6, 24), new T.MeshBasicMaterial({ color: '#FFC940', transparent: true })); this.tm.rotation.x = -Math.PI / 2; this.scene.add(this.tm); }
    this.tm.position.set(p.x, ((Math.abs(p.x) < 25.2 && Math.abs(p.z) < 16.2) || p.z < -60 ? 0.3 : 0) + 0.05, p.z); this.tmT = 0.6;
  }

  worldToScreen(x, y, z) {
    const v = new T.Vector3(x, y, z).project(this.camera);
    return { x: (v.x + 1) / 2 * this.el.clientWidth, y: (1 - v.y) / 2 * this.el.clientHeight, z: v.z };
  }

  floatText(x, y, z, text, color) {
    const p = this.worldToScreen(x, y, z), d = document.createElement('div');
    Object.assign(d.style, { position: 'absolute', left: p.x + 'px', top: p.y + 'px', transform: 'translate(-50%,-50%)', font: "800 13px Archivo, sans-serif", color, textShadow: '0 2px 0 rgba(0,0,0,.45)', whiteSpace: 'nowrap', transition: 'transform 1.1s ease-out, opacity 1.1s ease-in', opacity: '1' });
    d.textContent = text; d.style.fontSize = Math.round(13 * (this.uiScale || 1)) + 'px'; this.floatEl.appendChild(d);
    requestAnimationFrame(() => { d.style.transform = 'translate(-50%,-190%)'; d.style.opacity = '0'; });
    setTimeout(() => d.remove(), 1200);
  }

  update(dt) {
    if (this.frozen) return;
    this.t += dt;
    this.slotGroups.forEach(gr => { const p = gr.userData.plus; if (p) { p.position.y = 0.35 + Math.sin(this.t * 3) * 0.12; p.rotation.y += dt * 0.8; } });
    if (this.marker.visible) { const k = 1 + Math.sin(this.t * 5) * 0.03, mb = this.mBase || [1, 1]; this.marker.scale.set(mb[0] * k, 1, mb[1] * k); }
    this.actors.update(dt);
    if (!this.paused) this.manager.update(dt);
    this.pads.update(dt, this.paused);
    this.guide.update(dt);
    if (!this.paused) this.doorCheck(dt);
    tickScreens(this.t);
    const mp = this.manager.fig.position, f = this.camF || 1;
    this.camT.x += (mp.x - this.camT.x) * Math.min(1, dt * 6); this.camT.z += (mp.z - this.camT.z) * Math.min(1, dt * 6);
    const ins = this.camT.z < -60, cx = ins ? Math.max(IX - 12, Math.min(IX + 12, this.camT.x)) : Math.max(-20, Math.min(20, this.camT.x)), cz = ins ? Math.max(IZ - 7, Math.min(IZ + 5, this.camT.z)) : Math.max(-18, Math.min(16, this.camT.z));
    this.camera.position.set(cx, 21 * f, cz + 15 * f); this.camera.lookAt(cx, 0, cz - 0.5);
    this.sun.position.set(cx - 24, 55, cz + 30); this.sun.target.position.set(cx, 0, cz);
    if (this.tm) { this.tmT -= dt; this.tm.visible = this.tmT > 0; this.tm.scale.setScalar(1 + (0.6 - this.tmT)); this.tm.material.opacity = Math.max(0, this.tmT / 0.6); }
    this.updateLabels();
  }

  updateLabels() {
    const g = this.getG(), occ = {};
    for (const id in this.actors.map) { const a = this.actors.map[id]; if (a.slot != null && a.mode === 'train') occ[a.slot] = (occ[a.slot] || 0) + 1; }
    SLOTS.forEach((s, i) => {
      const el = this.labels[i], b = g.builds[i];
      let html;
      if (!b) { el.style.display = 'none'; return; }
      {
        const d = ST[b.type], extra = (d.stat || d.train) ? ` <span style="color:#FFC940">${occ[i] || 0}/${cap(b.level)}</span>` : '';
        html = `<span style="height:18px;min-width:18px;padding:0 5px;border-radius:9px;background:${d.color};color:#0E1F16;display:grid;place-items:center;font:900 10px Archivo">${b.level >= 5 ? 'MAX' : 'L' + b.level}</span>${d.name}${extra}`;
      }
      if (el._h !== html) { el.innerHTML = html; el._h = html; }
      const h = b ? (s.kind === 'drill' ? 3.0 : b.type === 'stands' ? 3.6 : 2.4) : 1.2;
      const p = this.worldToScreen(s.x, (s.kind === 'indoor' ? 3 : h) + (s.kind !== 'venue' ? 0.3 : 0), s.z - (s.d ? s.d / 2 - 0.8 : 0));
      el.style.display = p.z < 1 && p.x > -150 && p.x < this.el.clientWidth + 150 && p.y > -60 && p.y < this.el.clientHeight + 60 ? 'flex' : 'none'; el.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-100%) scale(${this.uiScale || 1})`;
      el.style.opacity = this.selSlot === i ? '1' : b ? '.95' : '.75';
    });
    const open = !!g.indoorOpen;
    [[this.doorOut, 0, 4.4, -23.8, 'Indoor Centre', open ? 'Walk in' : 'Unlocks in League One'], [this.doorIn, IX, 2.2, IZ + 15.2, 'Exit to pitch', null]].forEach(([el, x, y, z, t1, t2]) => {
      const html = '<div style="padding:4px 10px;border-radius:8px;background:rgba(14,31,22,.9)">' + t1 + '</div>' + (t2 ? '<div style="font-size:11px;color:' + (open ? '#6FE39A' : '#FFC940') + ';text-shadow:0 1px 0 #000">' + t2 + '</div>' : '');
      if (el._h !== html) { el.innerHTML = html; el._h = html; }
      const p = this.worldToScreen(x, y, z), vis = p.z < 1 && p.x > -150 && p.x < this.el.clientWidth + 150 && p.y > -60 && p.y < this.el.clientHeight + 60;
      el.style.display = vis ? 'flex' : 'none'; if (vis) el.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px) translate(-50%,-100%) scale(' + (this.uiScale || 1) + ')';
    });
    this.doorMesh.material = open ? this.mat('#FFC940', { emissive: '#FFC940', emissiveIntensity: 0.35 }) : this.mat('#4a5a52');
  }

  doorCheck(dt) {
    const g = this.getG(), m = this.manager.fig.position;
    if (this.tpCd > 0) { this.tpCd -= dt; return; }
    const inside = m.z < -60;
    if (!inside && g.indoorOpen && Math.abs(m.x) < 1.5 && m.z < -23.2) this.teleport(IX, IZ + 12.6);
    else if (inside && Math.abs(m.x - IX) < 2.2 && m.z > IZ + 14.5) this.teleport(0, -21.4);
  }
  teleport(x, z) {
    this.tpCd = 0.9; sfx('door'); this.fade.style.opacity = '1';
    setTimeout(() => { const f = this.manager.fig; f.position.set(x, z < -60 ? 0.3 : 0, z); this.manager.target = null; this.camT.set(x, 0, z); this.fade.style.opacity = '0'; }, 200);
  }
}
