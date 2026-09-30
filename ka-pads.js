import * as T from './vendor/three.module.js';
import { sfx } from './ka-audio.js?v=munxl0i1';
import { IX, IZ, SLOTS, ST, PITCH, STAFF, MAXL, stCost, pitchCost, staffCost, fmt, genRecruits } from './ka-data.js?v=munxl0i1';

const onPitch = (x, z) => Math.abs(x) < 25.2 && Math.abs(z) < 16.2;
const groundY = (x, z) => ((onPitch(x, z) || (Math.abs(x - IX) < 22.4 && Math.abs(z - IZ) < 15.4)) ? 0.3 : 0);
const SPEED = 10, HOLD = 1.0;

export class Manager {
  constructor(sc) {
    this.sc = sc; const g = this.fig = new T.Group();
    const legL = sc.box(0.26, 0.66, 0.28, '#1E3A5F', -0.16, 0.33, 0), legR = sc.box(0.26, 0.66, 0.28, '#1E3A5F', 0.16, 0.33, 0);
    [legL, legR].forEach(l => { l.geometry.translate(0, -0.33, 0); l.position.y = 0.66; g.add(l); });
    g.add(sc.box(0.66, 0.72, 0.4, '#2F6FD6', 0, 1.02, 0));
    g.add(sc.box(0.68, 0.1, 0.42, '#F4F1E6', 0, 1.2, 0));
    g.add(sc.mesh(new T.SphereGeometry(0.27, 16, 14), '#e6b58c', 0, 1.64, 0));
    g.add(sc.mesh(new T.CylinderGeometry(0.29, 0.29, 0.14, 16), '#FF6B2C', 0, 1.8, 0));
    g.add(sc.box(0.36, 0.05, 0.3, '#FF6B2C', 0, 1.75, 0.28));
    const clip = sc.box(0.36, 0.46, 0.05, '#c9a36b', 0.44, 1.0, 0.22); clip.rotation.y = -0.3; g.add(clip);
    g.add(sc.box(0.28, 0.34, 0.02, '#ffffff', 0.44, 1.0, 0.25));
    const ring = new T.Mesh(new T.RingGeometry(0.7, 0.9, 32), new T.MeshBasicMaterial({ color: '#FFC940', transparent: true, opacity: 0.8 }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.04; g.add(ring);
    g.scale.setScalar(1.2);
    g.userData = { legL, legR };
    const s = sc.getG().mgr || { x: 0, z: 19 };
    g.position.set(s.x, groundY(s.x, s.z), s.z);
    sc.scene.add(g);
    this.dir = null; this.target = null; this.phase = 0; this.moving = false;
  }
  update(dt) {
    const f = this.fig, u = f.userData; let vx = 0, vz = 0;
    if (this.dir) { vx = this.dir.x * SPEED; vz = this.dir.z * SPEED; this.target = null; }
    else if (this.target) {
      const dx = this.target.x - f.position.x, dz = this.target.z - f.position.z, d = Math.hypot(dx, dz);
      if (d < 0.2) this.target = null; else { const s = Math.min(1, d / 1.2); vx = dx / d * SPEED * s; vz = dz / d * SPEED * s; }
    }
    const sp = Math.hypot(vx, vz); this.moving = sp > 0.3;
    if (this.moving) {
      const B = f.position.z < -60 ? [IX - 21.4, IX + 21.4, IZ - 14.4, IZ + 14.9] : [-35, 35, -26.2, 26.2];
      f.position.x = Math.max(B[0], Math.min(B[1], f.position.x + vx * dt));
      f.position.z = Math.max(B[2], Math.min(B[3], f.position.z + vz * dt));
      const want = Math.atan2(vx, vz); let d = want - f.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.rotation.y += d * Math.min(1, dt * 14);
      this.phase += dt * 13; const sw = Math.sin(this.phase) * 0.7; u.legL.rotation.x = sw; u.legR.rotation.x = -sw;
    } else { u.legL.rotation.x *= 0.8; u.legR.rotation.x *= 0.8; }
    const gy = groundY(f.position.x, f.position.z);
    f.position.y += (gy + (this.moving ? Math.abs(Math.sin(this.phase)) * 0.1 : 0) - f.position.y) * Math.min(1, dt * 20);
    const g = this.sc.getG(); g.mgr = { x: +f.position.x.toFixed(2), z: +f.position.z.toFixed(2) };
  }
}

export class Pads {
  constructor(sc) { this.sc = sc; this.items = {}; this.group = new T.Group(); sc.scene.add(this.group); this.coinT = 0; this.coins = []; this.dwell = 0; this.activeKey = null; }

  defs() {
    const sc = this.sc, g = sc.getG(), out = [];
    SLOTS.forEach((s, i) => {
      if (s.kind === 'off' || (s.kind === 'indoor' && !g.indoorOpen)) return;
      const b = g.builds[i];
      if (!b) {
        const t = s.type, big = s.kind === 'drill' ? 3.4 : 3.2;
        out.push({ key: 'b' + i, x: s.x, z: s.z, size: big, cost: stCost(t, 0), title: ST[t].name, sub: ST[t].pad || (ST[t].stat ? 'Trains ' + ST[t].stat : null), color: ST[t].color,
          buy: () => { g.builds[i] = { type: t, level: 1 }; sc.refreshSlot(i); } });
      } else if (b.level < MAXL) {
        const off = (s.d || 5.6) / 2 + 1.3, x = s.x + Math.sin(s.r) * off, z = s.z + Math.cos(s.r) * off;
        out.push({ key: 'u' + i + '_' + b.level, x, z, size: 2.2, cost: stCost(b.type, b.level), title: 'Upgrade to L' + (b.level + 1), color: '#6FE39A', small: true,
          buy: () => { b.level++; sc.refreshSlot(i); } });
      }
    });
    const px = [-18, -10, 10, 18];
    Object.keys(PITCH).forEach((k, j) => {
      const L = g.pitch[k]; if (L >= MAXL) return;
      out.push({ key: 'p' + k + L, x: px[j], z: 19.6, size: 2.6, cost: pitchCost(k, L), title: PITCH[k].name + ' L' + (L + 1), sub: 'Pitch', color: '#6FE39A', buy: () => { g.pitch[k]++; sc.refreshPitch(); } });
    });
    Object.keys(STAFF).forEach((k, j) => {
      const L = g.staff[k]; if (L >= MAXL) return;
      out.push({ key: 's' + k + L, x: px[j], z: 24, size: 2.6, cost: staffCost(k, L), title: (L ? STAFF[k].name + ' L' + (L + 1) : 'Hire ' + STAFF[k].name), sub: 'Staff', color: '#8FC7FF', buy: () => { g.staff[k]++; if (k === 'scout') genRecruits(g); } });
    });
    return out;
  }

  makePad(d) {
    const sc = this.sc, gr = new T.Group(), h = d.size / 2, y = groundY(d.x, d.z) + 0.03;
    gr.position.set(d.x, y, d.z);
    const base = new T.Mesh(new T.PlaneGeometry(d.size, d.size), new T.MeshBasicMaterial({ color: '#0E1F16', transparent: true, opacity: 0.35 }));
    base.rotation.x = -Math.PI / 2; gr.add(base);
    const fill = new T.Mesh(new T.PlaneGeometry(d.size, d.size), new T.MeshBasicMaterial({ color: '#FFC940', transparent: true, opacity: 0.75 }));
    fill.rotation.x = -Math.PI / 2; fill.position.y = 0.01; fill.scale.set(0.0001, 0.0001, 1); gr.add(fill);
    const L = d.size * 0.3, w = 0.16, cm = { emissive: '#ffffff', emissiveIntensity: 0.3 };
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => {
      gr.add(sc.box(L, 0.06, w, '#ffffff', sx * (h - L / 2), 0.03, sz * h, cm));
      gr.add(sc.box(w, 0.06, L, '#ffffff', sx * h, 0.03, sz * (h - L / 2), cm));
    });
    this.group.add(gr);
    const el = document.createElement('div');
    Object.assign(el.style, { position: 'absolute', left: 0, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', pointerEvents: 'none', willChange: 'transform', font: "800 12px Archivo, sans-serif", color: '#F4F1E6', whiteSpace: 'nowrap' });
    sc.floatEl.appendChild(el);
    return { gr, fill, el };
  }

  update(dt, paused) {
    const sc = this.sc, g = sc.getG(); g.padPaid = g.padPaid || {};
    const defs = this.defs(), keys = new Set(defs.map(d => d.key));
    for (const k in this.items) if (!keys.has(k)) { this.group.remove(this.items[k].gr); this.items[k].el.remove(); delete this.items[k]; }
    const m = sc.manager.fig.position; let active = null;
    defs.forEach(d => {
      const it = this.items[d.key] || (this.items[d.key] = this.makePad(d));
      const paid = g.padPaid[d.key] || 0, frac = Math.min(1, paid / d.cost);
      it.fill.scale.set(Math.max(0.0001, frac), Math.max(0.0001, frac), 1);
      const inside = Math.abs(m.x - d.x) < d.size / 2 + 0.2 && Math.abs(m.z - d.z) < d.size / 2 + 0.2;
      if (inside) active = d;
      const afford = g.money + paid >= d.cost;
      const hold = inside && !this.lock && this.activeKey === d.key ? Math.min(1, Math.max(0, this.dwell) / HOLD) : 0, pct = paid > 0 ? 100 : Math.round(hold * 20) * 5;
      const coin = `<span style="width:20px;height:20px;border-radius:50%;background:#FFC940;box-shadow:inset 0 -2px 0 #C8941E;display:grid;place-items:center;font-size:12px">$</span>`;
      const icon = pct > 0 && pct < 100 ? `<span style="width:26px;height:26px;margin:-3px;border-radius:50%;background:conic-gradient(#2FBF6A ${pct}%, rgba(14,31,22,.18) 0);display:grid;place-items:center">${coin}</span>` : coin;
      const locked = inside && this.lock ? `<div style="font-size:11px;color:#FFC940;text-shadow:0 1px 0 #000">Step off to buy again</div>` : '';
      const html = `${d.sub ? `<div style="font-size:10px;letter-spacing:.1em;color:#A9BDB0;text-shadow:0 1px 0 #000">${d.sub.toUpperCase()}</div>` : ''}<div style="padding:3px 9px;border-radius:8px;background:rgba(14,31,22,.9);font-size:${d.small ? 11 : 12}px">${d.title}</div><div style="display:flex;align-items:center;gap:5px;padding:4px 10px 4px 5px;border-radius:10px;background:#F4F1E6;color:#0E1F16;box-shadow:0 3px 0 rgba(0,0,0,.3);font:900 ${d.small ? 13 : 15}px Archivo">${icon}<span style="color:${afford ? '#0E1F16' : '#C0392B'}">${fmt(d.cost - paid)}</span></div>${locked}`;
      if (it.el._h !== html) { it.el.innerHTML = html; it.el._h = html; }
      const p = sc.worldToScreen(d.x, groundY(d.x, d.z) + 0.2, d.z - d.size / 2 - 0.2);
      const vis = p.z < 1 && p.x > -120 && p.x < sc.el.clientWidth + 120 && p.y > -80 && p.y < sc.el.clientHeight + 80;
      it.el.style.display = vis ? 'flex' : 'none';
      if (vis) it.el.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-100%) scale(${(inside ? 1.12 : 1) * (sc.uiScale || 1)})`;
    });
    if (paused) return;
    if (!active) this.lock = false;
    if (!active || (this.activeKey !== active.key)) { this.dwell = 0; this.activeKey = active ? active.key : null; }
    if (active && !this.lock) {
      this.dwell += dt;
      if (this.dwell > HOLD && g.money > 0) {
        const dur = Math.min(2.5, 0.9 + active.cost / 2500), rate = active.cost / dur;
        const paid = g.padPaid[active.key] || 0, amt = Math.min(g.money, active.cost - paid, rate * dt);
        g.money -= amt; g.padPaid[active.key] = paid + amt;
        this.coinT -= dt; if (this.coinT <= 0) { this.coinT = 0.08; this.spawnCoin(m, active); sfx('coin', { pitch: (g.padPaid[active.key] || 0) / active.cost }); }
        if (g.padPaid[active.key] >= active.cost - 0.01) {
          delete g.padPaid[active.key]; active.buy(); sfx(active.key[0] === 'b' ? 'build' : 'upgrade');
          sc.floatText(active.x, 2.5, active.z, active.key[0] === 'b' ? 'Built!' : 'Upgraded!', '#FFC940');
          sc.onTap({ changed: true }); this.dwell = 0; this.lock = true;
        }
      }
    }
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i]; c.t += dt * 3.2; const t = Math.min(1, c.t);
      c.m.position.lerpVectors(c.a, c.b, t); c.m.position.y += Math.sin(t * Math.PI) * 1.6; c.m.rotation.y += dt * 10;
      if (t >= 1) { this.group.remove(c.m); this.coins.splice(i, 1); }
    }
  }
  spawnCoin(m, d) {
    if (!this.coinGeo) { this.coinGeo = new T.CylinderGeometry(0.2, 0.2, 0.07, 14); this.coinMat = new T.MeshStandardMaterial({ color: '#FFC940', emissive: '#C8941E', emissiveIntensity: 0.3, metalness: 0.3, roughness: 0.4 }); }
    const c = new T.Mesh(this.coinGeo, this.coinMat); c.rotation.x = Math.PI / 2;
    const a = new T.Vector3(m.x, m.y + 2, m.z), b = new T.Vector3(d.x + (Math.random() - 0.5) * d.size * 0.6, groundY(d.x, d.z) + 0.1, d.z + (Math.random() - 0.5) * d.size * 0.6);
    this.group.add(c); this.coins.push({ m: c, a, b, t: 0 });
  }
}
