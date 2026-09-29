import * as T from './vendor/three.module.js';

export class Guide {
  constructor(sc) {
    this.sc = sc; this.target = null; this.t = 0;
    const m = new T.MeshStandardMaterial({ color: '#FFC940', emissive: '#FFC940', emissiveIntensity: 0.6 });
    const g = this.arrow = new T.Group();
    const cone = new T.Mesh(new T.ConeGeometry(0.7, 1.2, 16), m); cone.rotation.x = Math.PI; cone.position.y = 0.6; g.add(cone);
    const stem = new T.Mesh(new T.CylinderGeometry(0.25, 0.25, 1.1, 12), m); stem.position.y = 1.75; g.add(stem);
    g.visible = false; sc.scene.add(g);
    const sh = new T.Shape(); sh.moveTo(0, 0.9); sh.lineTo(0.6, 0); sh.lineTo(0.28, 0); sh.lineTo(0, 0.42); sh.lineTo(-0.28, 0); sh.lineTo(-0.6, 0); sh.closePath();
    const cm = new T.Mesh(new T.ShapeGeometry(sh), new T.MeshBasicMaterial({ color: '#FFC940', transparent: true, opacity: 0.95, side: T.DoubleSide }));
    cm.rotation.x = -Math.PI / 2; cm.position.z = -2.0;
    this.chev = new T.Group(); this.chev.add(cm); this.chev.visible = false; sc.scene.add(this.chev);
  }
  update(dt) {
    this.t += dt; const tg = this.target;
    this.arrow.visible = this.chev.visible = !!tg; if (!tg) return;
    this.arrow.position.set(tg.x, 3.2 + Math.abs(Math.sin(this.t * 3)) * 0.8, tg.z); this.arrow.rotation.y += dt * 2;
    const m = this.sc.manager.fig.position, dx = tg.x - m.x, dz = tg.z - m.z, d = Math.hypot(dx, dz);
    this.chev.visible = d > 4;
    this.chev.position.set(m.x, m.y + 0.08, m.z); this.chev.rotation.y = Math.atan2(-dx, -dz);
    this.chev.children[0].position.z = -2.0 - Math.sin(this.t * 5) * 0.25;
  }
}
