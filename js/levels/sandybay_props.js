// Sandy Bay pieces: park-home shells (cladding, windows, a pitched roof batched with every other roof into one
// mesh), Christmas lights (low-poly instanced bulbs + glow halos), the Christmas tree, presents, gnomes, the
// light-up reindeer, Joan's mobility scooter, lamp posts, benches, the postbox, and the canvas textures
// (cladding, frosty grass, decking, tarmac, the fake flames, the calendar, the HANGRY-O-METER...).
import * as THREE from 'three';
import { part, sph, cyl } from '../geo.js';
import { canvasTex, FONT } from '../textures.js';

export const shade = (c, k) => new THREE.Color(c).multiplyScalar(k).getHex();
export function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

// ---------------------------------------------------------------- lights
// a bulb: a tiny 20-triangle ball, instanced (one draw per colour for the whole level), with a soft halo
const BULB = new THREE.OctahedronGeometry(1, 0);
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
export function bulb(k, x, y, z, color, r = 0.022, halo = 0.1) {
  (k._bulbs = k._bulbs || []).push([x, y, z, r, color]);
  if (halo) k.halo(x, y, z, halo, color);
}
// every bulb in the level: ONE instanced draw (each its own colour)
export function buildBulbs(k, scene) {
  const L = k._bulbs || []; if (!L.length) return null;
  const im = new THREE.InstancedMesh(BULB, new THREE.MeshBasicMaterial({ color: 0xffffff }), L.length), c = new THREE.Color();
  L.forEach(([x, y, z, r, col], i) => { im.setMatrixAt(i, _m4.compose(_v.set(x, y, z), _q.identity(), _s.setScalar(r))); im.setColorAt(i, c.set(col)); });
  im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.computeBoundingSphere(); im.renderOrder = 2; scene.add(im); return im;
}
export const MULTI = [0xff3b3b, 0x3bff6a, 0x3b8bff, 0xffd23b, 0xff5bd8];
export const WARM = [0xffd890];
// a string of lights along a polyline, sagging between the points; a thin dark wire too
export function lightString(k, pts, { spacing = 0.16, colors = MULTI, sag = 0.06, r = 0.02, halo = 0.09, wire = 0x1a2a1a, offset = 0 } = {}) {
  let n = offset;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay, az] = pts[i], [bx, by, bz] = pts[i + 1], len = Math.hypot(bx - ax, by - ay, bz - az), m = Math.max(1, Math.round(len / spacing));
    let px = ax, py = ay, pz = az;
    for (let j = 0; j <= m; j++) {
      const t = j / m, x = ax + (bx - ax) * t, z = az + (bz - az) * t, y = ay + (by - ay) * t - Math.sin(t * Math.PI) * sag;
      if (j < m || i === pts.length - 2) bulb(k, x, y - 0.025, z, colors[n++ % colors.length], r, halo);
      if (wire && j > 0) { const d = Math.hypot(x - px, y - py, z - pz); if (d > 0.01) { const g = new THREE.CylinderGeometry(0.004, 0.004, d, 3); const dir = new THREE.Vector3(x - px, y - py, z - pz).normalize(); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); g.applyQuaternion(q); g.translate((x + px) / 2, (y + py) / 2, (z + pz) / 2); k.parts.push(part(g, wire)); } }
      px = x; py = y; pz = z;
    }
  }
}
// icicle lights hanging off an eave line along x (or z)
export function icicles(k, axis, c, a0, a1, y, { color = 0xeaf4ff, spacing = 0.22, rnd = Math.random } = {}) {
  for (let a = a0; a <= a1; a += spacing) {
    const drops = 1 + Math.floor(rnd() * 3);
    for (let d = 0; d < drops; d++) { const yy = y - 0.06 - d * 0.09; axis === 'x' ? bulb(k, a, yy, c, color, 0.014, 0.06) : bulb(k, c, yy, a, color, 0.014, 0.06); }
  }
  axis === 'x' ? k.box(a1 - a0, 0.01, 0.01, (a0 + a1) / 2, y, c, 0xdde6ee) : k.box(0.01, 0.01, a1 - a0, c, y, (a0 + a1) / 2, 0xdde6ee);
}

// ---------------------------------------------------------------- roofs: every pitched roof in ONE mesh
export class RoofBatch {
  constructor() { this.pos = []; this.uv = []; }
  // a pitched roof over x0..x1, z0..z1 with its ridge along x
  add(x0, x1, z0, z1, eave, rise, ov = 0.3) {
    const zc = (z0 + z1) / 2, half = (z1 - z0) / 2, slope = rise / half;
    const xa = x0 - ov, xb = x1 + ov, za = z0 - ov, zb = z1 + ov, ye = eave - ov * slope, yr = eave + rise;
    this.quad([xa, ye, za], [xb, ye, za], [xb, yr, zc], [xa, yr, zc]);
    this.quad([xb, ye, zb], [xa, ye, zb], [xa, yr, zc], [xb, yr, zc]);
    return { xa, xb, za, zb, ye, yr, zc };
  }
  // a lean-to (one slope, high edge at z = zHigh)
  lean(x0, x1, zLow, zHigh, yLow, yHigh) { this.quad([x0, yLow, zLow], [x1, yLow, zLow], [x1, yHigh, zHigh], [x0, yHigh, zHigh]); }
  quad(a, b, c, d) {
    const L = Math.hypot(d[0] - a[0], d[1] - a[1], d[2] - a[2]);
    const U = [[a[0], 0], [b[0], 0], [c[0], L], [d[0], L]].map(([u, v]) => [u / 1.1, v / 1.1]);
    for (const i of [0, 1, 2, 0, 2, 3]) { const p = [a, b, c, d][i]; this.pos.push(...p); this.uv.push(...U[i]); }
  }
  build(scene, tex) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2)); g.computeVertexNormals();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide })); scene.add(m); return m;
  }
}
// a filled gable triangle (both sides) at x, from z0 to z1, eave to ridge
export function gable(k, x, z0, z1, eave, rise, color) {
  const zc = (z0 + z1) / 2, P = [x, eave, z0, x, eave, z1, x, eave + rise, zc, x, eave, z1, x, eave, z0, x, eave + rise, zc];
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.computeVertexNormals();
  k.parts.push(part(g, color));
}

// ---------------------------------------------------------------- windows on an outside face (no hole: neighbours)
// axis 'x': the face runs along x at z = c, facing dir (+1 = +z). a = centre along the face
export function faceWin(k, axis, c, a, y, w, h, dir, { frame = 0xf6f6f2, glass = 0x33485e, curtain = 0xb04040, net = true, lit = false, sill = true } = {}) {
  const B = (ww, hh, tt, aa, yy, off, col) => axis === 'x' ? k.box(ww, hh, tt, aa, yy, c + dir * off, col) : k.box(tt, hh, ww, c + dir * off, yy, aa, col);
  B(w + 0.12, h + 0.12, 0.05, a, y, 0.025, frame);                       // frame
  B(w, h, 0.02, a, y, 0.05, lit ? 0xffd890 : glass);                      // glass (dark, or lit up warm)
  if (!lit) B(w, h * 0.35, 0.021, a, y + h * 0.3, 0.051, shade(glass, 1.5));   // the sky in the top of the glass
  if (net) B(w * 0.96, h * 0.5, 0.022, a, y - h * 0.18, 0.052, 0xe8e4dc);       // net curtain
  if (curtain != null) for (const s of [-1, 1]) B(w * 0.18, h * 0.95, 0.023, a + s * w * 0.4, y, 0.053, curtain);
  B(0.04, h, 0.03, a, y, 0.065, frame); B(w, 0.04, 0.03, a, y + h * 0.18, 0.065, frame);   // mullion + transom
  if (sill) B(w + 0.2, 0.05, 0.12, a, y - h / 2 - 0.07, 0.06, 0xf0f0ea);
}

// ---------------------------------------------------------------- a whole park home (outside only)
// x0..x1 along the row, z0..z1 deep; front = +1 (door/windows on z1) or -1 (on z0)
export function parkHome(k, roofs, cladTex, o) {
  const { x0, x1, z0, z1, front = 1, eave = 2.55, rise = 1.25, trim = 0xf4f4ee, skirt = 0x8a8a84, door = 0x2a4a6a, doorX = null, curtain = 0xb04040, lights = MULTI, lit = 0, rnd = Math.random, gableCol = 0xeee6d2, plain = null } = o;
  const W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, fz = front > 0 ? z1 : z0;
  if (plain != null) { k.box(W, eave - 0.45, D, cx, 0.45 + (eave - 0.45) / 2, cz, plain, { block: true }); for (let y = 0.6; y < eave; y += 0.2) for (const z of [z0 - 0.004, z1 + 0.004]) k.box(W, 0.012, 0.01, cx, y, z, shade(plain, 0.85)); }
  else k.texBox(W, eave - 0.45, D, cx, 0.45 + (eave - 0.45) / 2, cz, cladTex, { tile: 1.6, collide: true, block: true });
  k.box(W + 0.04, 0.45, D + 0.04, cx, 0.225, cz, skirt, { block: true });                         // the skirting round the chassis
  for (let x = x0 + 0.3; x < x1; x += 0.6) k.box(0.02, 0.4, 0.012, x, 0.22, fz + front * 0.026, shade(skirt, 0.8));   // skirt panel joints
  for (const x of [x0, x1]) { k.box(0.08, eave, 0.08, x, eave / 2, z0, trim); k.box(0.08, eave, 0.08, x, eave / 2, z1, trim); }   // corner trims
  const r = roofs.add(x0, x1, z0, z1, eave, rise);
  gable(k, x0 - 0.001, z0, z1, eave, rise, gableCol); gable(k, x1 + 0.001, z0, z1, eave, rise, gableCol);
  for (const z of [r.za, r.zb]) { k.box(r.xb - r.xa, 0.16, 0.04, cx, r.ye - 0.06, z, trim); k.box(r.xb - r.xa, 0.08, 0.1, cx, r.ye - 0.12, z + (z > cz ? 0.05 : -0.05), 0x2a2a2a); }   // fascia + gutter
  k.box(r.xb - r.xa, 0.08, 0.12, cx, r.yr + 0.03, cz, 0x5a5048);                                    // ridge tiles
  for (const x of [x0 + 0.15, x1 - 0.15]) k.cyl(0.035, 0.035, eave, x, eave / 2, fz + front * 0.06, 0x2a2a2a, 6);   // downpipes
  // the front: door, windows, a little step and canopy
  const dx = doorX ?? (x0 + 1.6);
  const B = (w, h, t, a, y, off, col, opts) => k.box(w, h, t, a, y, fz + front * off, col, opts);
  B(0.95, 2.0, 0.06, dx, 1.0 + 0.3, 0.03, door); B(1.1, 2.1, 0.04, dx, 1.05 + 0.3, 0.02, trim);
  B(0.3, 0.45, 0.065, dx, 1.55, 0.035, shade(door, 1.4));                                          // door glazing
  k.cyl(0.025, 0.025, 0.05, dx + 0.36, 1.25, fz + front * 0.07, 0xd4af37, 6);
  B(1.3, 0.15, 0.5, dx, 0.075, 0.25, 0xb0aaa0, { block: false }); B(1.3, 0.15, 0.35, dx, 0.225, 0.17, 0xb8b2a8);   // two steps
  B(1.4, 0.06, 0.8, dx, 2.55, 0.4, trim);                                                          // canopy
  for (const s of [-1, 1]) B(0.05, 0.05, 0.75, dx + s * 0.65, 2.5, 0.38, trim);
  const wins = [];
  for (let a = x0 + 3.2; a < x1 - 1.0; a += 2.4) wins.push(a);
  for (const a of wins) faceWin(k, 'x', fz, a, 1.45, 1.3, 1.0, front, { curtain, lit: lit && rnd() < lit });
  // back windows too (seen from the gardens behind)
  for (let a = x0 + 1.5; a < x1 - 1.0; a += 3.0) faceWin(k, 'x', front > 0 ? z0 : z1, a, 1.45, 1.0, 0.9, -front, { curtain: null });
  // Christmas lights along the front eave
  if (lights) lightString(k, [[r.xa + 0.1, r.ye - 0.1, fz + front * 0.34], [r.xb - 0.1, r.ye - 0.1, fz + front * 0.34]], { spacing: 0.2, colors: lights, sag: 0.04, halo: 0.08, wire: null });
  // a wreath on the door
  wreath(k, dx, 1.75, fz + front * 0.07, front);
  return { r, dx, fz };
}
export function wreath(k, x, y, z, dir, R = 0.17) {
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; k.parts.push(part(new THREE.IcosahedronGeometry(0.055, 0), i % 2 ? 0x1e5a2a : 0x2a6a32, [x + Math.cos(a) * R, y + Math.sin(a) * R, z + dir * 0.02])); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; k.parts.push(part(sph(0.018, 5, 4), 0xd01818, [x + Math.cos(a) * R, y + Math.sin(a) * R, z + dir * 0.06])); }
  k.box(0.12, 0.08, 0.03, x, y - R, z + dir * 0.06, 0xc8102e);                                   // the bow
}

// ---------------------------------------------------------------- Christmas tree (real-looking: drooping layered branches)
export function xmasTree(k, x, z, { h = 2.05, R = 0.68, rnd = Math.random, lights = true, y0 = 0 } = {}) {
  // a red pot wrapped in gold, the trunk
  k.cyl(0.24, 0.2, 0.32, x, y0 + 0.16, z, 0xa01818, 14); k.cyl(0.25, 0.25, 0.05, x, y0 + 0.3, z, 0xd4af37, 14);
  k.cyl(0.04, 0.05, 0.5, x, y0 + 0.5, z, 0x4a3020, 6);
  const tiers = 9, GREENS = [0x1d4a26, 0x23552c, 0x1a4222, 0x2a5e32];
  for (let t = 0; t < tiers; t++) {
    const f = t / (tiers - 1), yb = y0 + 0.42 + f * (h - 0.62), r = R * (1 - f * 0.88), th = 0.42 - f * 0.12;
    const g = new THREE.ConeGeometry(r, th, 16, 2, true), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const px = p.getX(i), py = p.getY(i), pz = p.getZ(i), ang = Math.atan2(pz, px);
      if (py < -th / 2 + 0.01) { const tip = Math.sin(ang * 8) * 0.5 + 0.5; p.setX(i, px * (0.86 + tip * 0.22)); p.setZ(i, pz * (0.86 + tip * 0.22)); p.setY(i, py - tip * 0.07); } }   // jagged branch tips, drooping
    g.computeVertexNormals(); g.rotateY(t * 0.7);
    k.parts.push(part(g, GREENS[t % 4], [x, yb + th / 2, z]));
    // little sprigs on the tier's edge
    for (let i = 0; i < 6 + Math.round(r * 10); i++) { const a = rnd() * Math.PI * 2, rr = r * (0.75 + rnd() * 0.2); k.parts.push(part(new THREE.ConeGeometry(0.05, 0.14, 4), GREENS[(i + t) % 4], [x + Math.cos(a) * rr, yb + 0.05, z + Math.sin(a) * rr], [Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2])); }
  }
  k.blockers.push({ x0: x - R * 0.8, x1: x + R * 0.8, z0: z - R * 0.8, z1: z + R * 0.8, y1: h });
  // baubles, tinsel, lights, the star
  const BAUB = [0xc8102e, 0xd4af37, 0xc0c8d0, 0x1e4ea8, 0xc8102e, 0x8a1aa0];
  const surf = (f, a, out = 1) => { const r = R * (1 - f * 0.88) * 0.92 * out; return [x + Math.cos(a) * r, y0 + 0.42 + f * (h - 0.62) - 0.02, z + Math.sin(a) * r]; };
  for (let i = 0; i < 34; i++) { const f = rnd() * 0.85, a = rnd() * Math.PI * 2, [bx, by, bz] = surf(f, a), br = 0.035 + rnd() * 0.02; k.parts.push(part(sph(br, 8, 6), BAUB[i % BAUB.length], [bx, by, bz])); k.parts.push(part(cyl(0.008, 0.008, 0.015, 5), 0xd4af37, [bx, by + br, bz])); }
  for (let s = 0; s < 2; s++) for (let i = 0; i < 60; i++) {                                         // two spirals of gold tinsel
    const f = i / 60 * 0.9, a = f * 14 + s * Math.PI, [tx, ty, tz] = surf(f, a, 1.02);
    k.parts.push(part(new THREE.IcosahedronGeometry(0.03, 0), s ? 0xd8b84a : 0xc0c4cc, [tx, ty + 0.05, tz]));
  }
  if (lights) for (let i = 0; i < 70; i++) { const f = i / 70 * 0.92, a = i * 2.4, [lx, ly, lz] = surf(f, a, 0.98); bulb(k, lx, ly + 0.08, lz, [0xffd070, 0xff4040, 0x60a0ff, 0xffd070, 0x70ff90][i % 5], 0.018, 0.09); }
  // the star
  const star = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + Math.PI / 2, rr = i % 2 ? 0.05 : 0.12; i ? star.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : star.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  const sg = new THREE.ExtrudeGeometry(star, { depth: 0.03, bevelEnabled: false }); sg.translate(0, 0, -0.015);
  for (const ry of [0, Math.PI / 2]) k.parts.push(part(sg.clone(), 0xffd84a, [x, y0 + h + 0.06, z], [0, ry, 0]));
  k.halo(x, y0 + h + 0.06, z, 0.5, 0xffe080);
}
// presents: wrapped boxes with ribbons and bows
export function presents(k, x, z, n, rnd, spread = 0.75) {
  const WRAP = [[0xc8102e, 0xd4af37], [0x1e6a3a, 0xc8102e], [0x1e4ea8, 0xf0f0f0], [0xd4af37, 0xc8102e], [0xf0f0f0, 0xc8102e], [0x8a1aa0, 0xd4af37], [0xe86aa0, 0xffffff]];
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd() * 0.4, d = spread * (0.75 + rnd() * 0.35), px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
    const w = 0.2 + rnd() * 0.22, hh = 0.12 + rnd() * 0.22, dd = 0.18 + rnd() * 0.2, [wc, rc] = WRAP[i % WRAP.length], ry = rnd() * 1.2;
    present(k, px, pz, w, hh, dd, wc, rc, ry); out.push([px, hh, pz]);
  }
  return out;
}
export function present(k, x, z, w, h, d, wc, rc, ry = 0, y0 = 0) {
  k.box(w, h, d, x, y0 + h / 2, z, wc, { rot: [0, ry, 0] });
  k.box(w + 0.006, h + 0.006, 0.03, x, y0 + h / 2, z, rc, { rot: [0, ry, 0] }); k.box(0.03, h + 0.006, d + 0.006, x, y0 + h / 2, z, rc, { rot: [0, ry, 0] });
  for (const s of [-1, 1]) k.parts.push(part(new THREE.TorusGeometry(0.03, 0.01, 4, 8), rc, [x + Math.cos(ry) * s * 0.03, y0 + h + 0.025, z - Math.sin(ry) * s * 0.03], [0, ry + Math.PI / 2, 0]));
}

// ---------------------------------------------------------------- garden ornaments
export function gnome(k, x, z, ry = 0, hat = 0xc8102e, coat = 0x1e4ea8, s = 1) {
  const P = (g, c, dx, y, dz) => k.parts.push(part(g, c, [x + dx * s, y * s, z + dz * s], [0, ry, 0]));
  P(cyl(0.11, 0.12, 0.04, 10), 0x7a7a70, 0, 0.02, 0);
  P(cyl(0.07, 0.1, 0.2, 10), coat, 0, 0.14, 0);
  P(sph(0.065, 10, 8), 0xf0c8a8, 0, 0.29, 0);
  const fx = Math.sin(ry), fz = Math.cos(ry);
  P(new THREE.ConeGeometry(0.06, 0.16, 8), 0xf4f4f4, fx * 0.04, 0.22, fz * 0.04);           // beard
  P(sph(0.018, 6, 4), 0xe08070, fx * 0.065, 0.3, fz * 0.065);                                 // nose
  P(new THREE.ConeGeometry(0.07, 0.2, 10), hat, 0, 0.42, 0);                                  // hat
  P(cyl(0.025, 0.025, 0.08, 6), 0x5a3a20, fx * 0.07 + fz * 0.08, 0.16, fz * 0.07 - fx * 0.08); // a little fishing rod / spade handle
}
export function solarLight(k, x, z) { k.cyl(0.012, 0.012, 0.3, x, 0.15, z, 0x2a2a2a, 5); k.cyl(0.05, 0.04, 0.06, x, 0.33, z, 0x2a2a2a, 8); k.cyl(0.05, 0.05, 0.012, x, 0.365, z, 0x1a2a4a, 8); bulb(k, x, 0.31, z, 0xfff2d0, 0.028, 0.18); }
// the light-up reindeer: a white wire frame strung with warm white bulbs, head down grazing
export function reindeer(k, x, z, ry = 0, s = 1, y0 = 0) {
  const c = Math.cos(ry), sn = Math.sin(ry), W = (lx, y, lz) => [x + (lx * c + lz * sn) * s, y0 + y * s, z + (-lx * sn + lz * c) * s];
  const seg = (a, b, col = 0xf4f4f0, r = 0.012) => { const A = W(...a), B = W(...b), d = new THREE.Vector3(B[0] - A[0], B[1] - A[1], B[2] - A[2]); const L = d.length(); const g = new THREE.CylinderGeometry(r, r, L, 4); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())); g.translate((A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2); k.parts.push(part(g, col)); };
  const outline = [[-0.4, 0.62, 0], [-0.2, 0.72, 0], [0.22, 0.72, 0], [0.38, 0.8, 0], [0.48, 0.95, 0], [0.64, 0.97, 0], [0.7, 0.88, 0], [0.48, 0.8, 0], [0.38, 0.55, 0], [0, 0.5, 0], [-0.4, 0.62, 0]];
  for (const dz of [-0.09, 0.09]) for (let i = 0; i < outline.length - 1; i++) { const a = outline[i].slice(), b = outline[i + 1].slice(); a[2] = b[2] = dz; seg(a, b); }
  for (const [lx, dz] of [[-0.3, -0.09], [-0.3, 0.09], [0.32, -0.09], [0.32, 0.09]]) seg([lx, 0.56, dz], [lx + 0.02, 0, dz]);   // legs
  for (const dz of [-0.05, 0.05]) { seg([0.52, 0.97, dz], [0.44, 1.22, dz * 3]); seg([0.47, 1.1, dz * 2], [0.6, 1.18, dz * 3]); seg([0.45, 1.16, dz * 2.5], [0.34, 1.26, dz * 3.5]); }   // antlers
  for (const dz of [-0.09, 0.09]) for (let i = 0; i < outline.length - 1; i++) { const a = outline[i], b = outline[i + 1]; for (let t = 0; t < 1; t += 0.34) { const p = W(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, dz); bulb(k, p[0], p[1], p[2], 0xfff0c8, 0.018, 0.12); } }
  { const p = W(0.72, 0.9, 0); bulb(k, p[0], p[1], p[2], 0xff2020, 0.035, 0.25); }               // a red nose
  if (!y0) k.blockers.push({ x0: x - 0.6 * s, x1: x + 0.6 * s, z0: z - 0.6 * s, z1: z + 0.6 * s, y1: 1.2, soft: true });   // (a decoration: people walk round it, the player slides past)
}
export function birdTable(k, x, z) {
  k.box(0.08, 1.4, 0.08, x, 0.7, z, 0x6a4424, { block: true }); for (const a of [0, 1.57, 3.14, 4.71]) k.box(0.3, 0.04, 0.05, x + Math.cos(a) * 0.12, 0.08, z + Math.sin(a) * 0.12, 0x5a3a20, { rot: [0, a, 0] });
  k.box(0.5, 0.04, 0.5, x, 1.4, z, 0x7a5030, { collide: true }); for (const s of [-1, 1]) { k.box(0.5, 0.04, 0.02, x, 1.43, z + s * 0.24, 0x5a3a20); k.box(0.02, 0.04, 0.5, x + s * 0.24, 1.43, z, 0x5a3a20); }
  for (const s of [-1, 1]) k.box(0.04, 0.4, 0.04, x + s * 0.2, 1.6, z, 0x5a3a20);
  for (const s of [-1, 1]) k.box(0.62, 0.03, 0.38, x, 1.86, z + s * 0.14, 0x3a5a3a, { rot: [s * 0.55, 0, 0] });
  for (let i = 0; i < 9; i++) k.parts.push(part(sph(0.015, 4, 3), [0xd8b070, 0xa07040, 0xe8d8b0][i % 3], [x - 0.15 + (i % 3) * 0.12, 1.435, z - 0.1 + Math.floor(i / 3) * 0.1]));   // seed
  k.cyl(0.07, 0.065, 0.025, x + 0.1, 1.435, z + 0.05, 0xe0c890, 10); k.cyl(0.05, 0.05, 0.012, x + 0.1, 1.452, z + 0.05, 0x5a2a18, 10);   // a mince pie (for the birds, allegedly)
  // a robin on the roof
  k.parts.push(part(sph(0.045, 8, 6), 0x6a4a30, [x + 0.1, 2.02, z], [0, 0, 0], [1.3, 1, 1])); k.parts.push(part(sph(0.03, 8, 6), 0xd84a1a, [x + 0.14, 2.0, z])); k.parts.push(part(sph(0.025, 6, 5), 0x6a4a30, [x + 0.15, 2.07, z]));
}
// a rotary washing line, folded up with its cover on
export function rotaryLine(k, x, z) {
  k.cyl(0.025, 0.025, 2.0, x, 1.0, z, 0xb8bcc0, 8, { block: true });
  k.cyl(0.03, 0.12, 1.1, x, 1.45, z, 0x3a5a7a, 10);                                              // the folded arms in their green-blue cover
  k.cyl(0.015, 0.015, 0.1, x, 2.05, z, 0x222222, 6); k.cyl(0.05, 0.05, 0.03, x, 0.02, z, 0x666666, 10);
  for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4; k.box(0.012, 0.6, 0.012, x + Math.cos(a) * 0.06, 1.15, z + Math.sin(a) * 0.06, 0xb8bcc0, { rot: [Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12] }); }
  for (let i = 0; i < 3; i++) k.box(0.02, 0.06, 0.04, x + 0.08, 1.6 - i * 0.2, z, [0xff6a9a, 0x6aaaff, 0xffd84a][i]);   // pegs left on it
}
// Joan's mobility scooter: faces local -z (ry turns it)
export function scooter(k, x, z, ry = 0) {
  const c = Math.cos(ry), s = Math.sin(ry), P = (g, col, lx, y, lz, rot = [0, 0, 0]) => k.parts.push(part(g, col, [x + lx * c + lz * s, y, z - lx * s + lz * c], [rot[0], ry + rot[1], rot[2]]));
  const BODY = 0xb81a2a, DARK = 0x1a1a1a;
  P(new THREE.BoxGeometry(0.56, 0.12, 1.15), DARK, 0, 0.2, 0.0);                                  // chassis
  P(new THREE.BoxGeometry(0.58, 0.18, 0.4), BODY, 0, 0.32, -0.45, [0.25, 0, 0]);                  // front shroud
  P(new THREE.BoxGeometry(0.6, 0.22, 0.42), BODY, 0, 0.33, 0.42);                                 // rear shroud
  P(new THREE.BoxGeometry(0.52, 0.03, 0.55), 0x2a2a2a, 0, 0.27, -0.05);                           // footplate
  for (const [lx, lz] of [[-0.27, -0.42], [0.27, -0.42], [-0.29, 0.42], [0.29, 0.42]]) { P(cyl(0.12, 0.12, 0.08, 12), DARK, lx, 0.12, lz, [0, 0, Math.PI / 2]); P(cyl(0.06, 0.06, 0.085, 8), 0xb0b0b0, lx, 0.12, lz, [0, 0, Math.PI / 2]); }
  P(cyl(0.035, 0.035, 0.35, 6), 0x2a2a2a, 0, 0.6, 0.25); P(new THREE.BoxGeometry(0.48, 0.1, 0.46), 0x2a2a30, 0, 0.8, 0.25);   // seat post + seat
  P(new THREE.BoxGeometry(0.46, 0.48, 0.09), 0x2a2a30, 0, 1.08, 0.48, [-0.15, 0, 0]);             // backrest
  for (const sx of [-1, 1]) P(new THREE.BoxGeometry(0.05, 0.04, 0.34), 0x3a3a3a, sx * 0.26, 0.93, 0.22);   // armrests
  P(cyl(0.03, 0.035, 0.7, 6), 0x2a2a2a, 0, 0.62, -0.42, [-0.35, 0, 0]);                           // tiller
  P(new THREE.BoxGeometry(0.5, 0.06, 0.12), 0x2a2a2a, 0, 0.96, -0.55); P(new THREE.BoxGeometry(0.2, 0.08, 0.14), BODY, 0, 0.99, -0.53);   // handlebar + console
  // the basket on the front, with tinsel round it
  P(new THREE.BoxGeometry(0.4, 0.24, 0.28), 0x8a8a8a, 0, 0.82, -0.78); P(new THREE.BoxGeometry(0.36, 0.2, 0.24), 0x3a3a3a, 0, 0.84, -0.78);
  for (let i = 0; i < 26; i++) { const t = i / 26, a = t * Math.PI * 2; P(new THREE.IcosahedronGeometry(0.03, 0), i % 2 ? 0xd8b84a : 0xc8102e, Math.cos(a) * 0.22, 0.95 + Math.sin(i * 1.3) * 0.015, -0.78 + Math.sin(a) * 0.16); }
  P(new THREE.BoxGeometry(0.16, 0.12, 0.1), 0x6a1aa0, -0.08, 0.98, -0.76); P(new THREE.BoxGeometry(0.1, 0.07, 0.08), 0xd4af37, 0.1, 0.97, -0.8);   // shopping in the basket
  P(cyl(0.008, 0.008, 1.1, 4), 0xff7a00, 0.24, 1.2, 0.55); P(new THREE.ConeGeometry(0.06, 0.16, 3), 0xff7a00, 0.24, 1.78, 0.55, [0, 0, -Math.PI / 2]);   // the orange safety flag
  P(sph(0.04, 8, 6), 0xffffe0, 0, 0.45, -0.67);                                                    // headlamp
  const hx = Math.abs(c) * 0.34 + Math.abs(s) * 0.62, hz = Math.abs(s) * 0.34 + Math.abs(c) * 0.62;
  k.blockers.push({ x0: x - hx, x1: x + hx, z0: z - hz, z1: z + hz, y1: 1.1 });
  return { plate: [x + 0 * c + 0.64 * s, 0.33, z + 0.64 * c] };
}
export function lampPost(k, x, z, dir = 1) {
  k.cyl(0.07, 0.09, 0.3, x, 0.15, z, 0x1a2a1a, 10, { block: true }); k.cyl(0.04, 0.05, 3.2, x, 1.75, z, 0x1a2a1a, 8);
  k.box(0.04, 0.04, 0.45, x, 3.3, z + dir * 0.2, 0x1a2a1a); k.cyl(0.14, 0.05, 0.12, x, 3.25, z + dir * 0.42, 0x1a2a1a, 10);
  k.lamp(x, 3.17, z + dir * 0.42, 0xffe0a0, 0.07);
  // a garland of tinsel spiralling up it
  for (let i = 0; i < 24; i++) { const a = i * 0.9; k.parts.push(part(new THREE.IcosahedronGeometry(0.035, 0), i % 2 ? 0xc8102e : 0xf4f4f4, [x + Math.cos(a) * 0.06, 0.6 + i * 0.1, z + Math.sin(a) * 0.06])); }
}
export function bench(k, x, z, ry = 0, col = 0x7a5030) {
  const c = Math.cos(ry), s = Math.sin(ry), at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  const rb = (w, h, d, lx, y, lz, cl) => { const [px, pz] = at(lx, lz); k.box(w, h, d, px, y, pz, cl, { rot: [0, ry, 0] }); };
  for (let i = 0; i < 3; i++) rb(1.6, 0.04, 0.12, 0, 0.46, -0.13 + i * 0.13, col);
  for (let i = 0; i < 2; i++) rb(1.6, 0.1, 0.03, 0, 0.66 + i * 0.16, 0.24, col);
  for (const sx of [-0.7, 0.7]) { rb(0.05, 0.46, 0.4, sx, 0.23, 0.02, 0x2a2a2a); rb(0.05, 0.5, 0.04, sx, 0.72, 0.25, 0x2a2a2a); rb(0.05, 0.04, 0.38, sx, 0.66, 0.05, 0x2a2a2a); }
  k.seats.push({ x: at(-0.4, -0.02)[0], z: at(-0.4, -0.02)[1], yaw: ry + Math.PI, h: 0.48 }, { x: at(0.4, -0.02)[0], z: at(0.4, -0.02)[1], yaw: ry + Math.PI, h: 0.48 });
  const hx = Math.abs(c) * 0.82 + Math.abs(s) * 0.3, hz = Math.abs(s) * 0.82 + Math.abs(c) * 0.3;
  k.blockers.push({ x0: x - hx, x1: x + hx, z0: z - hz, z1: z + hz, y1: 0.9 });
  return at(0, 0.27);
}
export function postbox(k, x, z) {
  k.cyl(0.26, 0.26, 1.2, x, 0.6, z, 0xc8102e, 18, { block: true });
  k.cyl(0.27, 0.27, 0.1, x, 0.05, z, 0x111111, 18); k.parts.push(part(new THREE.SphereGeometry(0.27, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xc8102e, [x, 1.2, z]));
  k.box(0.28, 0.04, 0.04, x, 1.05, z + 0.25, 0x111111);
  k.cyl(0.285, 0.285, 0.06, x, 1.2, z, 0xb00e28, 18);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; k.parts.push(part(new THREE.IcosahedronGeometry(0.04, 0), 0xf4f8ff, [x + Math.cos(a) * 0.18, 1.45, z + Math.sin(a) * 0.18])); }   // a cap of snow-ish frost
}

// ---------------------------------------------------------------- textures
export function cladTex(base = '#efe8d4') {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) { const gr = g.createLinearGradient(0, y, 0, y + 32); gr.addColorStop(0, 'rgba(0,0,0,0.16)'); gr.addColorStop(0.2, 'rgba(0,0,0,0)'); gr.addColorStop(0.9, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0.05)'); g.fillStyle = gr; g.fillRect(0, y, w, 32); g.fillStyle = 'rgba(80,70,50,0.35)'; g.fillRect(0, y, w, 2); }
    for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(120,110,80,0.06)' : 'rgba(255,255,255,0.1)'; g.fillRect(Math.random() * w, Math.random() * h, 3, 1); }
  });
}
export function winterRoofTex() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#5a5450'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 22) for (let x = -((y / 22) % 2) * 20; x < w; x += 40) { const v = Math.random() * 16 - 8; g.fillStyle = `rgb(${116 + v},${106 + v},${100 + v})`; g.fillRect(x + 1, y + 1, 38, 19); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x + 1, y + 17, 38, 3); }
    for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(235,242,250,${0.25 + Math.random() * 0.35})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 1.5); }   // frost
  });
}
export function frostGrassTex() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#6f8a5a'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 3400; i++) { g.fillStyle = ['#5e7a48', '#7a9564', '#6a8452', '#86a070', '#9aae8a'][i % 5]; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 3 + Math.random() * 3); }
    for (let i = 0; i < 2200; i++) { g.fillStyle = `rgba(232,240,248,${0.18 + Math.random() * 0.3})`; g.fillRect(Math.random() * w, Math.random() * h, 1, 1 + Math.random() * 2); }   // the frost on the blades
  });
}
export function deckTex() {
  return canvasTex(256, 256, (g, w, h) => {
    for (let y = 0, i = 0; y < h; y += 32, i++) { g.fillStyle = ['#8a6a4a', '#7e6044', '#94724e', '#846446'][i % 4]; g.fillRect(0, y, w, 30); for (let x = 0; x < w; x += 6) { g.fillStyle = 'rgba(40,25,10,0.18)'; g.fillRect(x, y + 4, 3, 22); } g.fillStyle = '#2a1e14'; g.fillRect(0, y + 30, w, 2); }
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(230,238,245,${0.2 + Math.random() * 0.3})`; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
  });
}
export function slabTex(a = '#b8b2a6', b = '#aaa498') {
  return canvasTex(256, 256, (g, w, h) => {
    for (let y = 0; y < h; y += 128) for (let x = 0; x < w; x += 128) { g.fillStyle = ((x + y) / 128) % 2 ? a : b; g.fillRect(x, y, 128, 128); for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(0,0,0,0.07)'; g.fillRect(x + Math.random() * 128, y + Math.random() * 128, 2, 2); } }
    g.strokeStyle = '#7a766c'; g.lineWidth = 3; for (let p = 0; p <= w; p += 128) { g.beginPath(); g.moveTo(p, 0); g.lineTo(p, h); g.stroke(); g.beginPath(); g.moveTo(0, p); g.lineTo(w, p); g.stroke(); }
  });
}
export function tarmacTex() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#4a4a4c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 5000; i++) { const v = 50 + Math.random() * 60; g.fillStyle = `rgb(${v},${v},${v + 3})`; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
    for (let i = 0; i < 900; i++) { g.fillStyle = 'rgba(220,230,240,0.25)'; g.fillRect(Math.random() * w, Math.random() * h, 1, 1); }
  });
}
export function swirlCarpetTex(base = '#7a3a44', a = '#8a4a52', b = '#c8a060') {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2400; i++) { g.fillStyle = Math.random() < 0.5 ? a : 'rgba(0,0,0,0.14)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    g.strokeStyle = b; g.lineWidth = 1.6;
    for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { const ox = x + ((y / 64) % 2) * 32; g.beginPath(); g.arc(ox + 32, y + 32, 16, 0.3, 4.5); g.stroke(); g.beginPath(); g.arc(ox + 32, y + 32, 7, 2, 6.5); g.stroke(); g.beginPath(); g.moveTo(ox + 6, y + 6); g.quadraticCurveTo(ox + 20, y + 22, ox + 8, y + 40); g.stroke(); }
  });
}
export function linoTex() {
  return canvasTex(256, 256, (g, w, h) => {
    for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { g.fillStyle = ((x + y) / 32) % 2 ? '#ece6d6' : '#c4a68a'; g.fillRect(x, y, 32, 32); }
    for (let i = 0; i < 1500; i++) { g.fillStyle = 'rgba(0,0,0,0.05)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, 0, w, h);
  });
}
export function wallpaperTex(base = '#efe4cc', ink = 'rgba(170,120,90,0.35)') {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 2;
    for (let y = 0; y < h; y += 64) for (let x = ((y / 64) % 2) * 32; x < w + 32; x += 64) { for (let p = 0; p < 6; p++) { const a = p / 6 * 6.28; g.beginPath(); g.ellipse(x + Math.cos(a) * 9, y + 32 + Math.sin(a) * 9, 7, 3.5, a, 0, 7); g.fill(); } g.beginPath(); g.moveTo(x, y + 44); g.quadraticCurveTo(x + 12, y + 56, x + 4, y + 70); g.stroke(); }
    for (let x = 0; x < w; x += 32) { g.fillStyle = 'rgba(255,255,255,0.1)'; g.fillRect(x, 0, 12, h); }
  });
}
export function flameTex() {
  return canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#1a0804'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { const x = 14 + i * 28 + Math.random() * 8, fh = 60 + Math.random() * 50, gr = g.createLinearGradient(0, h, 0, h - fh); gr.addColorStop(0, '#fff4b0'); gr.addColorStop(0.3, '#ffb020'); gr.addColorStop(0.7, '#e04010'); gr.addColorStop(1, 'rgba(120,20,0,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(x - 16, h); g.quadraticCurveTo(x - 18, h - fh * 0.5, x, h - fh); g.quadraticCurveTo(x + 16, h - fh * 0.45, x + 16, h); g.fill(); }
    g.fillStyle = '#3a2a22'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(20 + i * 44, h - 8, 26, 10, 0, 0, 7); g.fill(); }   // the fake coal
    g.fillStyle = 'rgba(255,120,30,0.5)'; for (let i = 0; i < 40; i++) g.fillRect(Math.random() * w, h - 16 + Math.random() * 10, 3, 2);
  });
}
export function calendarTex() {
  return canvasTex(512, 640, (g, w, h) => {
    g.fillStyle = '#fffdf6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a6a3a'; g.fillRect(0, 0, w, 200);
    g.fillStyle = '#fff'; for (let i = 0; i < 30; i++) { g.beginPath(); g.arc(Math.random() * w, Math.random() * 190, 2 + Math.random() * 3, 0, 7); g.fill(); }
    g.fillStyle = '#c8102e'; g.beginPath(); g.moveTo(w / 2, 30); g.lineTo(w / 2 + 70, 170); g.lineTo(w / 2 - 70, 170); g.fill();
    g.font = `900 46px ${FONT}`; g.textAlign = 'center'; g.fillStyle = '#111'; g.fillText('DECEMBER', w / 2, 250);
    g.font = '700 20px Arial'; g.fillStyle = '#555'; g.fillText("JOAN'S SOCIAL CALENDAR (FULL)", w / 2, 278);
    const ent = { 1: 'Bingo w/ Pat', 2: 'Coffee w/ Maureen', 3: 'Aqua aerobics w/ the girls', 4: 'Bingo w/ Pat', 5: 'Sherry at Val\'s', 6: 'Xmas fair', 7: 'Brenda 80th!!', 8: 'Bingo', 9: 'Coffee w/ Maureen', 10: 'Aqua aerobics', 11: 'Bingo w/ Pat', 12: 'Line dancing', 13: 'Doreen\'s party', 14: 'Carols @ club', 15: 'Bingo', 16: 'Coffee w/ Sheila', 17: 'Aqua aerobics', 18: 'Bingo w/ Pat', 19: 'Club xmas do', 20: 'Pat\'s (again)', 21: 'Panto trip', 22: 'Bingo', 23: 'Wrap (hide choc)', 24: 'Midnight mass?', 25: 'FAMILY! 2PM SHARP', 26: 'Boxing Day @ club', 27: 'Bingo', 28: 'Lie in (ha)', 29: 'Coffee w/ Maureen', 30: 'Aqua aerobics', 31: 'NYE: 3 parties' };
    const cw = w / 7, ch = 62, top = 300;
    g.font = '700 16px Arial'; g.fillStyle = '#c8102e'; ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].forEach((d, i) => g.fillText(d, cw * i + cw / 2, top - 6));
    g.strokeStyle = '#bbb'; g.lineWidth = 1;
    for (let d = 1; d <= 31; d++) { const i = (d + 0) % 7, r = Math.floor((d + 0) / 7), x = i * cw, y = top + r * ch; g.strokeRect(x + 1, y, cw - 2, ch);
      g.textAlign = 'left'; g.font = '900 15px Arial'; g.fillStyle = d === 25 ? '#c8102e' : '#222'; g.fillText(String(d), x + 4, y + 15);
      const t = ent[d]; if (t) { g.font = '700 11px "Comic Sans MS", Arial'; g.fillStyle = d === 25 ? '#c8102e' : '#1a3a8a'; const words = t.split(' '); let line = '', ly = y + 30; for (const wd of words) { if (g.measureText(line + wd).width > cw - 6) { g.fillText(line, x + 3, ly); line = ''; ly += 12; } line += wd + ' '; } g.fillText(line, x + 3, ly); }
      if (d === 25) { g.strokeStyle = '#c8102e'; g.lineWidth = 3; g.beginPath(); g.ellipse(x + cw / 2, y + ch / 2, cw / 2 - 2, ch / 2 - 2, 0, 0, 7); g.stroke(); g.strokeStyle = '#bbb'; g.lineWidth = 1; } }
  });
}
export function hangryTex() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#fbf6e8'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 4, 0, 7); g.fill();
    g.strokeStyle = '#333'; g.lineWidth = 10; g.stroke();
    const cx = w / 2, cy = h * 0.6, R = 190, zones = [['#4caf50', 'FINE'], ['#cddc39', 'PECKISH'], ['#ff9800', 'HANGRY'], ['#d32f2f', 'DO NOT APPROACH']];
    zones.forEach(([c, t], i) => { const a0 = Math.PI + i * Math.PI / 4, a1 = a0 + Math.PI / 4; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a0, a1); g.closePath(); g.fillStyle = c; g.fill();
      g.save(); g.translate(cx, cy); g.rotate((a0 + a1) / 2 + Math.PI / 2); g.fillStyle = '#111'; g.font = `900 ${i === 3 ? 19 : 24}px ${FONT}`; g.textAlign = 'center'; g.fillText(t, 0, -R + 40); g.restore(); });
    g.fillStyle = '#fbf6e8'; g.beginPath(); g.arc(cx, cy, 70, 0, 7); g.fill();
    g.strokeStyle = '#111'; g.lineWidth = 12; g.lineCap = 'round'; const na = Math.PI + Math.PI * 0.88; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(na) * (R - 20), cy + Math.sin(na) * (R - 20)); g.stroke();
    g.fillStyle = '#111'; g.beginPath(); g.arc(cx, cy, 16, 0, 7); g.fill();
    g.font = `900 36px ${FONT}`; g.textAlign = 'center'; g.fillText('HANGRY-O-METER', cx, 100);
    g.font = '700 24px Arial'; g.fillStyle = '#c8102e'; g.fillText('NAN · LIVE READING · 1:58PM', cx, h - 64);
    g.font = '700 20px Arial'; g.fillStyle = '#333'; g.fillText('(serve the potatoes NOW)', cx, h - 34);
  });
}
export function cardsTex(seed = 1) {
  const r = rng(seed * 31 + 7);
  return canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { const x = i * 56 + 4, cw = 48, chh = 60 + r() * 40, y = h - chh; const bg = ['#c8102e', '#1e5a2a', '#f4f0e6', '#1e3a8a', '#d4af37', '#ffffff'][Math.floor(r() * 6)];
      g.fillStyle = bg; g.fillRect(x, y, cw, chh); g.strokeStyle = 'rgba(0,0,0,0.3)'; g.strokeRect(x, y, cw, chh);
      const k = Math.floor(r() * 4); g.fillStyle = bg === '#ffffff' || bg === '#f4f0e6' ? '#c8102e' : '#fff';
      if (k === 0) { g.beginPath(); g.moveTo(x + cw / 2, y + 10); g.lineTo(x + cw - 8, y + chh - 14); g.lineTo(x + 8, y + chh - 14); g.fill(); }
      else if (k === 1) { g.beginPath(); g.arc(x + cw / 2, y + chh / 2, 12, 0, 7); g.fill(); g.beginPath(); g.arc(x + cw / 2, y + chh / 2 - 16, 8, 0, 7); g.fill(); }
      else if (k === 2) { for (let s = 0; s < 6; s++) { g.beginPath(); g.arc(x + 8 + r() * (cw - 16), y + 8 + r() * (chh - 16), 3, 0, 7); g.fill(); } g.font = '900 9px Arial'; g.textAlign = 'center'; g.fillText('NOEL', x + cw / 2, y + chh / 2); }
      else { g.font = '900 8px Arial'; g.textAlign = 'center'; g.fillText('MERRY', x + cw / 2, y + chh / 2 - 4); g.fillText('XMAS', x + cw / 2, y + chh / 2 + 8); }
    }
  });
}
export function noticeTex() {
  return canvasTex(768, 512, (g, w, h) => {
    g.fillStyle = '#b8864a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { g.fillStyle = 'rgba(80,50,20,0.25)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    const note = (x, y, nw, nh, bg, rot, lines) => { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(4, 4, nw, nh); g.fillStyle = bg; g.fillRect(0, 0, nw, nh); g.fillStyle = '#c8102e'; g.beginPath(); g.arc(nw / 2, 8, 6, 0, 7); g.fill();
      g.fillStyle = '#111'; g.textAlign = 'center'; let ly = 22; lines.forEach(([t, s]) => { ly += s + 6; g.font = `900 ${s}px Arial`; g.fillText(t, nw / 2, ly); }); g.restore(); };
    g.font = `900 40px ${FONT}`; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('RESIDENTS\' NOTICES', w / 2, 44);
    note(24, 70, 230, 160, '#fffbe0', -0.04, [['WHO\'S BUSY', 22], ['Joan: 3 parties booked,', 18], ['0 free evenings', 18], ['Pat: 2 parties', 16], ['Ron: asleep', 16]]);
    note(275, 66, 220, 150, '#e0f4ff', 0.03, [['LINE DANCING', 22], ['FULL', 30], ['(Joan, Maureen', 16], ['& the girls)', 16]]);
    note(515, 74, 230, 170, '#ffe6f0', -0.02, [['LOST', 28], ['Reading glasses', 18], ['(they are on', 18], ['Pat\'s head)', 18]]);
    note(30, 260, 240, 200, '#e8ffe0', 0.02, [['XMAS RAFFLE', 22], ['1st: hamper', 18], ['2nd: Baileys', 18], ['3rd: Brian\'s', 18], ['lights bill', 18]]);
    note(290, 245, 200, 210, '#fff', -0.03, [['AQUA', 26], ['AEROBICS', 26], ['Wed 10am', 18], ['Bring a float', 16], ['& gossip', 16]]);
    note(510, 270, 240, 180, '#fffbe0', 0.04, [['PLEASE', 22], ['do not feed', 18], ['the seagulls', 18], ['(Doreen)', 20]]);
  });
}
// a photo: painted people (no models) with a caption
export function snapTex(caption, people, bg = '#7aa0c8') {
  return canvasTex(320, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, bg); gr.addColorStop(1, shadeCss(bg)); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const n = people.length; people.forEach(([ph, col, hair], i) => { const x = w * (i + 0.5) / n, top = h - 40 - ph * 150; g.fillStyle = col; g.fillRect(x - 24, top + 34, 48, h); g.fillStyle = '#f0c8a8'; g.beginPath(); g.arc(x, top + 18, 18, 0, 7); g.fill(); g.fillStyle = hair; g.beginPath(); g.arc(x, top + 12, 19, Math.PI, 0); g.fill(); g.fillStyle = '#222'; g.fillRect(x - 8, top + 16, 3, 3); g.fillRect(x + 5, top + 16, 3, 3); g.beginPath(); g.arc(x, top + 24, 6, 0.2, Math.PI - 0.2); g.stroke(); });
    g.fillStyle = '#f4f2ec'; g.fillRect(0, h - 34, w, 34); g.fillStyle = '#222'; g.font = '700 16px "Comic Sans MS", Arial'; g.textAlign = 'center'; g.fillText(caption, w / 2, h - 12);
  });
}
function shadeCss(hex) { const c = new THREE.Color(hex).multiplyScalar(0.6); return '#' + c.getHexString(); }
export function blanketTex() {
  return canvasTex(256, 256, (g, w, h) => {
    const C = ['#c8102e', '#f4c430', '#2a8a4a', '#2a5aa8', '#e86aa0', '#f08030', '#8a2aa0', '#f4f4f0'];
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const s = 64, ox = x * s, oy = y * s; g.fillStyle = '#1a1a1a'; g.fillRect(ox, oy, s, s);
      for (let r = 3; r >= 0; r--) { g.fillStyle = C[(x * 3 + y * 5 + r) % C.length]; const p = 4 + (3 - r) * 7; g.fillRect(ox + p, oy + p, s - p * 2, s - p * 2); }
      g.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 40; i++) g.fillRect(ox + Math.random() * s, oy + Math.random() * s, 2, 2); }
  });
}
export function viewTex(seed = 0) {
  // a winter afternoon out of a window: pale sky, park homes with their lights on, a bare tree
  return canvasTex(512, 384, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h * 0.7); sky.addColorStop(0, '#9ab8d8'); sky.addColorStop(1, '#f0e0c8'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 3; i++) { const x = i * 190 - 40 + seed * 30, y = h * 0.56; g.fillStyle = ['#efe8d4', '#e8e4dc', '#f2ead8'][i]; g.fillRect(x, y, 170, 90); g.fillStyle = '#5a524c'; g.beginPath(); g.moveTo(x - 10, y); g.lineTo(x + 85, y - 36); g.lineTo(x + 180, y); g.fill();
      for (let j = 0; j < 2; j++) { g.fillStyle = (i + j + seed) % 2 ? '#ffd890' : '#3a4a5a'; g.fillRect(x + 20 + j * 80, y + 25, 50, 34); }
      for (let j = 0; j < 12; j++) { g.fillStyle = ['#ff3b3b', '#3bff6a', '#3b8bff', '#ffd23b'][j % 4]; g.beginPath(); g.arc(x + j * 15, y + 3, 3, 0, 7); g.fill(); } }
    g.fillStyle = '#b8c4b0'; g.fillRect(0, h * 0.8, w, h * 0.2);
    g.strokeStyle = '#3a3430'; g.lineWidth = 6; g.beginPath(); g.moveTo(420 - seed * 50, h * 0.82); g.lineTo(415 - seed * 50, h * 0.3); g.stroke(); g.lineWidth = 2; for (let i = 0; i < 14; i++) { g.beginPath(); const y = h * 0.32 + i * 12; g.moveTo(417 - seed * 50, y); g.lineTo(417 - seed * 50 + (i % 2 ? 40 : -40), y - 30); g.stroke(); }
  });
}
