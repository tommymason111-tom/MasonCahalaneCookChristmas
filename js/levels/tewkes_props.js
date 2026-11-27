// Props for Nan's old house: a merged batch of flat panes (glass, nets, window views, roofs), fairy lights (one
// instanced draw for every bulb, twinkling), a proper real-looking Christmas tree, paper chains, presents, cars,
// lamp posts, garden gnomes, a light-up reindeer.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { part } from '../geo.js';

let seed = 777; export const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const shade = (c, k) => new THREE.Color(c).multiplyScalar(k).getHex();

// ---- flat panes sharing a material, merged into one mesh per material (glass, nets, roofs, gables...)
export class Quads {
  constructor(scene) { this.scene = scene; this.m = new Map(); this.meshes = []; }
  geo(mat, g) { (this.m.get(mat) || this.m.set(mat, []).get(mat)).push(g); }
  // a w x h plane centred at (x, y, z), turned ry (its front, +z, then faces (sin ry, cos ry)), tilted rx first; tile: UVs in metres
  add(mat, w, h, x, y, z, ry = 0, rx = 0, tile = 0) {
    const g = new THREE.PlaneGeometry(w, h);
    if (tile) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / tile, uv.getY(i) * h / tile); }
    g.rotateX(rx); g.rotateY(ry); g.translate(x, y, z); this.geo(mat, g); return g;
  }
  build() {
    for (const [mat, list] of this.m) { const g = mergeGeometries(list.map(x => x.index ? x.toNonIndexed() : x), false); list.forEach(x => x.dispose()); g.computeBoundingSphere(); const mesh = new THREE.Mesh(g, mat); this.scene.add(mesh); this.meshes.push(mesh); }
    this.m.clear(); return this.meshes;
  }
}

// ---- fairy lights: every bulb in ONE instanced draw (unlit, so they glow), a soft halo round some, and a slow twinkle
export const BULBS = [0xff3030, 0x30ff50, 0x3080ff, 0xffd030, 0xff40ff, 0xffffff];
export class FairyLights {
  constructor(k) { this.k = k; this.list = []; }
  add(x, y, z, color, size = 0.018, halo = true) { this.list.push([x, y, z, color, size]); if (halo) this.k.halo(x, y, z, size * 7, color); }
  // a string of bulbs along a sagging curve from a to b (sag metres at the middle); colors cycle (or one colour)
  string(a, b, n, { sag = 0.05, colors = BULBS, size = 0.018, halo = true, off = 0 } = {}) {
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, s = sag * 4 * t * (1 - t);
      this.add(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - s, a[2] + (b[2] - a[2]) * t, colors[(i + off) % colors.length], size, halo && i % 2 === 0); }
  }
  build(scene) {
    if (!this.list.length) return;
    const geo = new THREE.IcosahedronGeometry(1, 0), mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const im = new THREE.InstancedMesh(geo, mat, this.list.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), c = new THREE.Color();
    this.base = [];
    this.list.forEach(([x, y, z, col, sz], i) => { im.setMatrixAt(i, m4.compose(v.set(x, y, z), q, s.set(sz, sz * 1.4, sz))); c.set(col); im.setColorAt(i, c); this.base.push(c.clone()); });
    im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.frustumCulled = false; scene.add(im); this.mesh = im;
    this.ph = this.list.map(() => rnd() * 6.28);
  }
  update(t) {
    if (!this.mesh) return;
    if ((this._t = (this._t || 0) + 1) % 3) return;              // (a twinkle doesn't need every frame)
    const c = new THREE.Color();
    for (let i = 0; i < this.base.length; i += 1) { const k = 0.55 + 0.45 * Math.max(0, Math.sin(t * 1.7 + this.ph[i])); c.copy(this.base[i]).multiplyScalar(k); this.mesh.setColorAt(i, c); }
    this.mesh.instanceColor.needsUpdate = true;
  }
}

// a thin stick between two points (branches, chains, poles)
export function stick(k, a, b, r0, r1, col, seg = 6) {
  const d = new THREE.Vector3().subVectors(b, a), L = d.length(); if (L < 1e-4) return;
  const g = new THREE.CylinderGeometry(r1, r0, L, seg); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
  k.parts.push(part(g, col, [(a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2]));
}
// a box oriented along a direction (paper chain links, tinsel)
function linkBox(k, p, dir, len, w, t, col, roll = 0) {
  const g = new THREE.BoxGeometry(t, len, w); g.rotateY(roll);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()));
  k.parts.push(part(g, col, [p.x, p.y, p.z]));
}

// ---- a real-looking Christmas tree (a Nordmann fir): trunk, tiers of drooping branches thick with needles, baubles,
// tinsel spirals, a string of fairy lights round and round, a gold star on top, presents underneath, in a red pot
export function christmasTree(k, fl, x, z, { h = 2.15, r = 0.72, base = 0.32 } = {}) {
  const GREENS = [0x1e3a24, 0x24452a, 0x2a5030, 0x1a3420, 0x2e5634, 0x203e26];
  // the pot (a red bucket wrapped in gold foil)
  k.cyl(0.24, 0.19, base, x, base / 2, z, 0xb01e24, 16); k.cyl(0.25, 0.25, 0.04, x, base - 0.01, z, 0xd4af37, 16);
  k.cyl(0.03, 0.045, h * 0.6, x, base + h * 0.3, z, 0x5a3a22, 8);
  k.blockers.push({ x0: x - r * 0.8, x1: x + r * 0.8, z0: z - r * 0.8, z1: z + r * 0.8, y1: h + base });
  const top = base + h, y0 = base + 0.18;
  // branches: whorls up the trunk, each branch a drooping stick with needle clumps along it
  const tiers = 9;
  for (let t = 0; t < tiers; t++) {
    const f = t / (tiers - 1), y = y0 + (top - 0.25 - y0) * f, R = r * (1 - f * 0.88) + 0.05, n = Math.max(5, Math.round(12 - f * 6));
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + t * 0.7 + rnd() * 0.3, len = R * (0.85 + rnd() * 0.25);
      const p0 = new THREE.Vector3(x, y, z), p1 = new THREE.Vector3(x + Math.cos(a) * len, y - len * 0.22, z + Math.sin(a) * len);
      stick(k, p0, p1, 0.012, 0.005, 0x4a3018, 4);
      const clumps = Math.max(2, Math.round(len / 0.11));
      for (let c = 1; c <= clumps; c++) { const u = c / clumps, p = p0.clone().lerp(p1, u); p.y += 0.02;
        const g = new THREE.IcosahedronGeometry(1, 0), s = 0.07 + (1 - u) * 0.05 + R * 0.06; g.scale(s * 1.5, s * 0.55, s * 1.5); g.rotateY(a + rnd()); g.rotateZ((rnd() - 0.5) * 0.6);
        k.parts.push(part(g, shade(GREENS[Math.floor(rnd() * GREENS.length)], 0.85 + rnd() * 0.35), [p.x, p.y, p.z])); }
    }
    // a fuzzy core of needles between the tiers, so you can't see through to the trunk
    const g = new THREE.ConeGeometry(R * 0.72, (top - y0) / tiers * 1.6, 9, 1, true); k.parts.push(part(g, GREENS[t % GREENS.length], [x, y + 0.02, z]));
  }
  { const g = new THREE.ConeGeometry(0.12, 0.34, 7); k.parts.push(part(g, GREENS[2], [x, top - 0.12, z])); }
  // the star
  { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, rr = i % 2 ? 0.045 : 0.11; sh[i ? 'lineTo' : 'moveTo'](Math.sin(a) * rr, Math.cos(a) * rr); }
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.025, bevelEnabled: false }); g.translate(0, 0, -0.0125); k.parts.push(part(g, 0xffd84a, [x, top + 0.1, z], [0, 0.6, 0]));
    k.lamp(x, top + 0.1, z, 0xfff0a0, 0.03); k.halo(x, top + 0.1, z, 0.5, 0xffe080); }
  // where a point on the tree's skin is (height y, angle a), pushed out a bit
  const skin = (y, a, out = 0.02) => { const f = (y - y0) / (top - 0.25 - y0), R = Math.max(0.08, r * (1 - f * 0.88) + 0.05) * 0.95 + out; return new THREE.Vector3(x + Math.cos(a) * R, y - R * 0.12, z + Math.sin(a) * R); };
  // baubles: old-fashioned glass ones in red, gold, blue, silver, a few long drops
  const BAUB = [0xc62828, 0xd4af37, 0x1e4aa8, 0xc0c0c8, 0x8a1a5a, 0x2e7d32];
  for (let i = 0; i < 46; i++) { const y = y0 + 0.05 + rnd() * (top - y0 - 0.35), a = rnd() * Math.PI * 2, p = skin(y, a, 0.0); const rr = 0.028 + rnd() * 0.018;
    if (i % 9 === 0) { const g = new THREE.ConeGeometry(rr * 0.8, rr * 4, 8); g.rotateX(Math.PI); k.parts.push(part(g, BAUB[i % BAUB.length], [p.x, p.y - rr * 2, p.z])); }
    else k.parts.push(part(new THREE.SphereGeometry(rr, 8, 6), BAUB[i % BAUB.length], [p.x, p.y - rr, p.z]));
    k.parts.push(part(new THREE.CylinderGeometry(0.007, 0.007, 0.012, 6), 0xd4af37, [p.x, p.y + 0.004, p.z])); }
  // tinsel: three loose spirals (gold, silver, red), each a run of short twisted strips
  for (const [col, ph] of [[0xe8c040, 0], [0xd8dce4, 2.1], [0xc62828, 4.2]]) {
    let prev = null; const N = 70;
    for (let i = 0; i <= N; i++) { const u = i / N, y = y0 + 0.08 + u * (top - y0 - 0.45), a = ph + u * Math.PI * 2 * 3.2, p = skin(y, a, 0.035);
      if (prev) { const d = p.clone().sub(prev); linkBox(k, prev.clone().add(p).multiplyScalar(0.5), d, d.length() + 0.01, 0.045, 0.012, shade(col, 0.85 + (i % 3) * 0.12), i * 0.9); }
      prev = p; }
  }
  // fairy lights: one long string spiralling up, multicoloured
  for (let i = 0; i < 110; i++) { const u = i / 110, y = y0 + u * (top - y0 - 0.3), a = u * Math.PI * 2 * 5.5 + 1, p = skin(y, a, 0.015); fl.add(p.x, p.y, p.z, BULBS[i % 5], 0.014, i % 2 === 0); }
  k.halo(x, base + h * 0.45, z, 1.6, 0xffc890);                          // the whole tree glowing softly
  return { top };
}

// a wrapped present with a ribbon cross and a bow
export function present(k, x, z, w, h, d, col, ribbon, ry = 0) {
  const c = Math.cos(ry), s = Math.sin(ry), P = (bw, bh, bd, lx, y, lz, cl) => k.box(bw, bh, bd, x + lx * c + lz * s, y, z - lx * s + lz * c, cl, { rot: ry ? [0, ry, 0] : null });
  P(w, h, d, 0, h / 2, 0, col); P(w + 0.004, h + 0.004, 0.025, 0, h / 2, 0, ribbon); P(0.025, h + 0.004, d + 0.004, 0, h / 2, 0, ribbon);
  for (const a of [-0.6, 0.6]) k.box(0.05, 0.025, 0.02, x, h + 0.012, z, ribbon, { rot: [0, ry + a, 0.4] });
}

// a paper chain hung between two points: links of alternating colours, each turned 90° to the last
export function paperChain(k, a, b, { sag = 0.35, cols = [0xd32f2f, 0x2e7d32, 0xfbc02d, 0x1565c0, 0x8e24aa, 0xff7043], link = 0.055 } = {}) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B), n = Math.round(L / link);
  const at = (t) => new THREE.Vector3().lerpVectors(A, B, t).add(new THREE.Vector3(0, -sag * 4 * t * (1 - t), 0));
  for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, p0 = at(t0), p1 = at(t1), mid = p0.clone().add(p1).multiplyScalar(0.5), d = p1.clone().sub(p0);
    const col = cols[i % cols.length];
    // a link: a flat loop seen as two thin strips either side of the line
    const g1 = new THREE.BoxGeometry(0.004, link * 1.25, 0.022), g2 = new THREE.BoxGeometry(0.004, link * 1.25, 0.022);
    const off = i % 2 ? new THREE.Vector3(0.011, 0, 0) : new THREE.Vector3(0, 0, 0.011);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    if (i % 2) { g1.rotateY(Math.PI / 2); g2.rotateY(Math.PI / 2); }
    g1.translate(off.x, 0, off.z); g2.translate(-off.x, 0, -off.z); g1.applyQuaternion(q); g2.applyQuaternion(q);
    k.parts.push(part(g1, col, [mid.x, mid.y, mid.z])); k.parts.push(part(g2, col, [mid.x, mid.y, mid.z])); }
}

// ---- a parked car (a hatchback or a saloon), frost on the windscreen, number plates
export function car(k, x, z, ry, col, { kind = 'hatch', frost = true } = {}) {
  const c = Math.cos(ry), s = Math.sin(ry);
  const P = (g, cl, lx, y, lz, rot = [0, 0, 0]) => k.parts.push(part(g, cl, [x + lx * c + lz * s, y, z - lx * s + lz * c], [rot[0], ry + rot[1], rot[2]]));
  const B = (w, h, d, lx, y, lz, cl, rot) => P(new THREE.BoxGeometry(w, h, d), cl, lx, y, lz, rot);
  const L = kind === 'hatch' ? 3.9 : 4.6, W = 1.75, GL = 0x2a3440, FR = 0xe8eef4;
  B(W, 0.55, L, 0, 0.55, 0, col); B(W - 0.04, 0.16, L - 0.1, 0, 0.3, 0, 0x1a1a1a);          // body, sills
  const cabL = kind === 'hatch' ? 2.0 : 2.1, cabZ = kind === 'hatch' ? 0.35 : 0.1;
  B(W - 0.14, 0.5, cabL, 0, 1.06, cabZ, col);                                                   // cabin
  B(W - 0.1, 0.42, 0.04, 0, 1.04, cabZ - cabL / 2 - 0.12, frost ? FR : GL, [-0.6, 0, 0]);       // windscreen (frosted over)
  B(W - 0.1, 0.4, 0.04, 0, 1.04, cabZ + cabL / 2 + 0.06, frost ? 0xd8e0e8 : GL, [kind === 'hatch' ? 0.3 : 0.6, 0, 0]);
  for (const sx of [-1, 1]) B(0.02, 0.36, cabL - 0.2, sx * (W / 2 - 0.06), 1.08, cabZ, GL);    // side windows
  B(W - 0.12, 0.02, cabL, 0, 1.32, cabZ, frost ? 0xe8eef4 : col);                               // frosty roof
  for (const lz of [-L / 2 + 0.7, L / 2 - 0.7]) for (const sx of [-1, 1]) { const g = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 14); g.rotateZ(Math.PI / 2); P(g, 0x151515, sx * (W / 2 - 0.08), 0.32, lz); const h = new THREE.CylinderGeometry(0.18, 0.18, 0.23, 10); h.rotateZ(Math.PI / 2); P(h, 0x9a9aa0, sx * (W / 2 - 0.08), 0.32, lz); }
  for (const sx of [-1, 1]) { B(0.32, 0.12, 0.03, sx * 0.6, 0.7, -L / 2 - 0.005, 0xfff6d8); B(0.32, 0.12, 0.03, sx * 0.6, 0.7, L / 2 + 0.005, 0xc62828); B(0.06, 0.06, 0.18, sx * (W / 2 + 0.03), 0.95, cabZ - cabL / 2 + 0.1, col); }
  B(0.52, 0.12, 0.02, 0, 0.5, -L / 2 - 0.01, 0xf4f4f0); B(0.52, 0.12, 0.02, 0, 0.5, L / 2 + 0.01, 0xf7d117);   // plates
  const hx = Math.abs(c) * W / 2 + Math.abs(s) * L / 2, hz = Math.abs(s) * W / 2 + Math.abs(c) * L / 2;
  k.blockers.push({ x0: x - hx, x1: x + hx, z0: z - hz, z1: z + hz, y1: 1.35 });
  k.colliders.push({ min: new THREE.Vector3(x - hx * 0.9, 0, z - hz * 0.9), max: new THREE.Vector3(x + hx * 0.9, 0.85, z + hz * 0.9) });
}

// a street lamp: a grey column, a swan-neck arm, a lantern (on: it's getting dark by four)
export function lampPost(k, x, z, ry) {
  const c = Math.cos(ry), s = Math.sin(ry);
  k.cyl(0.08, 0.1, 0.5, x, 0.25, z, 0x6a6e72, 10); k.cyl(0.055, 0.075, 5.2, x, 2.6, z, 0x7a7e82, 10, { block: true });
  const ax = x + s * 0.7, az = z + c * 0.7;
  stick(k, new THREE.Vector3(x, 5.1, z), new THREE.Vector3(ax, 5.35, az), 0.04, 0.035, 0x7a7e82, 6);
  k.box(0.45, 0.1, 0.25, ax, 5.3, az, 0x5a5e62, { rot: [0, ry, 0] }); k.box(0.38, 0.05, 0.2, ax, 5.23, az, 0xfff2c8, { rot: [0, ry, 0] });
  k.lamp(ax, 5.2, az, 0xffe2a0, 0.06); k.pool(ax, 0.01, az, 2.6, 0xffc070);
}

// a garden gnome: hat, beard, a fishing rod or a lantern
export function gnome(k, x, z, ry, hat = 0xc62828, coat = 0x1e5aa8, s = 1) {
  k.cyl(0.075 * s, 0.09 * s, 0.16 * s, x, 0.08 * s, z, coat, 10);
  k.parts.push(part(new THREE.SphereGeometry(0.06 * s, 8, 6), 0xf0c8a0, [x, 0.2 * s, z]));
  k.parts.push(part(new THREE.ConeGeometry(0.055 * s, 0.1 * s, 8), 0xf4f4f0, [x + Math.sin(ry) * 0.035 * s, 0.155 * s, z + Math.cos(ry) * 0.035 * s], [Math.PI + 0.3, ry, 0]));
  k.parts.push(part(new THREE.ConeGeometry(0.065 * s, 0.17 * s, 8), hat, [x, 0.31 * s, z], [0.15, ry, 0]));
  k.box(0.06 * s, 0.035 * s, 0.03 * s, x - 0.03 * s, 0.015, z + 0.04 * s, 0x2a1a10); k.box(0.06 * s, 0.035 * s, 0.03 * s, x + 0.03 * s, 0.015, z + 0.04 * s, 0x2a1a10);
}

// the light-up reindeer: a wire-frame deer wrapped in white lights (head up, antlers)
export function reindeer(k, fl, x, z, ry, s = 1) {
  const c = Math.cos(ry), s2 = Math.sin(ry), W = (lx, y, lz) => new THREE.Vector3(x + (lx * c + lz * s2) * s, y * s, z + (-lx * s2 + lz * c) * s);
  const WIRE = 0xd8d8d0, segs = [
    [[-0.35, 0.75, 0], [0.35, 0.78, 0]], [[-0.35, 0.75, 0], [-0.4, 0.0, 0.1]], [[-0.35, 0.75, 0], [-0.32, 0.0, -0.1]], [[0.35, 0.78, 0], [0.38, 0.0, 0.1]], [[0.35, 0.78, 0], [0.3, 0.0, -0.1]],
    [[0.35, 0.78, 0], [0.5, 1.15, 0]], [[0.5, 1.15, 0], [0.7, 1.1, 0]], [[0.5, 1.15, 0], [0.45, 1.45, 0.08]], [[0.5, 1.15, 0], [0.42, 1.42, -0.08]], [[0.45, 1.45, 0.08], [0.33, 1.55, 0.12]], [[0.42, 1.42, -0.08], [0.3, 1.52, -0.12]],
    [[-0.35, 0.75, 0], [-0.48, 0.85, 0]], [[-0.3, 0.55, 0], [0.32, 0.55, 0]]];
  for (const [a, b] of segs) { const A = W(...a), B = W(...b); stick(k, A, B, 0.008, 0.008, WIRE, 4); const n = Math.max(2, Math.round(A.distanceTo(B) / 0.07));
    for (let i = 0; i <= n; i++) { const p = A.clone().lerp(B, i / n); fl.add(p.x, p.y, p.z, 0xfff6e0, 0.012, i % 2 === 0); } }
  const n = W(0.7, 1.1, 0); fl.add(n.x, n.y, n.z, 0xff2020, 0.03, true);           // Rudolph's nose
  k.blockers.push({ x0: x - 0.5 * s, x1: x + 0.5 * s, z0: z - 0.5 * s, z1: z + 0.5 * s, y1: 1.5 * s });
}
