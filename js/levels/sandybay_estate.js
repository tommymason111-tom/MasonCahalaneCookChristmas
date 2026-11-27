// Sandy Bay, the estate: the modern park homes (Sonata 40x20, Sofia 45x20, Majestic 50x20, Residence 60x20: one
// geometry per model, instanced along the streets), and the shared pieces they and Nan's home are built from (lap
// siding boxes mapped in metres, hipped / gabled tiled roofs). Each home model is three meshes: the siding (one canvas
// texture), the tiled roof, and everything else in vertex colours (skirting, white uPVC / anthracite windows, doors,
// steps, decking, glass balustrades, wall lanterns, gutters).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { part, cyl } from '../geo.js';
import { SIDING_Y0, SIDING_H, SIDING_W } from './sandybay_tex.js';

export const FL = 0.65;                       // the floor of a park home: up on its chassis, three steps up
export const EAVE = FL + 2.42;                // top of the walls (the eaves line)
export const PITCH = Math.tan(22 * Math.PI / 180);
export const C = {
  WHITE: 0xf5f5f3, SIDE: 0xf1f1ee, GREYSIDE: 0xbfc3c4, ANTH: 0x2b2d30, SKIRT: 0x76797b, GLASS: 0x34424e, GLASS2: 0x7f97a8,
  DECK: 0x5c5c5c, BALU: 0xbcd4da, STEP: 0xb9b7b1, ROOF: 0x3f4246, KERB: 0xbdbdb8, LAMP: 0xffe3a8,
};

// ---------------------------------------------------------------- geometry bags
// siding: UVs in metres (u along the wall, v up it, both scaled to the siding picture), so every wall's boards line up
export function sidingUV(g) {
  const p = g.attributes.position, n = g.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { const ax = Math.abs(n.getX(i)), az = Math.abs(n.getZ(i)); const u = az > 0.5 ? p.getX(i) : ax > 0.5 ? p.getZ(i) : p.getX(i);
    uv[i * 2] = u / SIDING_W; uv[i * 2 + 1] = (p.getY(i) - SIDING_Y0) / SIDING_H; }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g;
}
// planar UVs in metres for any flat-ish geometry (floors, paths, render): u = x or z, v = z or y, by the face normal
export function metreUV(g, tile = 1) {
  const p = g.attributes.position, n = g.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), nz = Math.abs(n.getZ(i));
    let u, v; if (ny >= nx && ny >= nz) { u = p.getX(i); v = p.getZ(i); } else if (nz >= nx) { u = p.getX(i); v = p.getY(i); } else { u = p.getZ(i); v = p.getY(i); }
    uv[i * 2] = u / tile; uv[i * 2 + 1] = v / tile; }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g;
}
const nonIdx = (g) => g.index ? g.toNonIndexed() : g;
export class Bag {
  constructor() { this.lists = new Map(); this.trim = []; }
  add(key, g) { g = nonIdx(g); for (const a of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(a)) g.deleteAttribute(a); (this.lists.get(key) || this.lists.set(key, []).get(key)).push(g); return g; }
  // a siding box (world-mapped boards)
  sbox(w, h, d, x, y, z, key = 'sid') { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); return this.add(key, sidingUV(nonIdx(g))); }
  // a textured box mapped in metres (tile = metres per picture)
  tbox(key, w, h, d, x, y, z, tile = 1, rotY = 0) { const g = new THREE.BoxGeometry(w, h, d); if (rotY) g.rotateY(rotY); g.translate(x, y, z); return this.add(key, metreUV(nonIdx(g), tile)); }
  // a flat triangle (one side, the normal from the winding) with siding UVs
  stri(a, b, c, key = 'sid') { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c], 3)); g.computeVertexNormals(); return this.add(key, sidingUV(g)); }
  geo(key, g) { return this.add(key, g); }
  box(w, h, d, x, y, z, col, rot = null) { this.trim.push(part(new THREE.BoxGeometry(w, h, d), col, [x, y, z], rot || [0, 0, 0])); }
  cyl(rt, rb, h, x, y, z, col, seg = 8, rot = null) { this.trim.push(part(cyl(rt, rb, h, seg), col, [x, y, z], rot || [0, 0, 0])); }
  part(g, col, pos = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) { this.trim.push(part(g, col, pos, rot, scl)); }
  merged(key) { const L = this.lists.get(key); if (!L || !L.length) return null; const g = mergeGeometries(L, false); L.forEach(x => x.dispose()); g.computeBoundingSphere(); return g; }
  mergedTrim() { if (!this.trim.length) return null; const g = mergeGeometries(this.trim, false); this.trim.forEach(x => x.dispose()); g.computeBoundingSphere(); return g; }
}

// ---------------------------------------------------------------- roofs
// a tiled roof over x0..x1, z0..z1, ridge along x; eave = the height at the wall line, slope = rise per metre,
// ov = overhang; hipL / hipR = hipped (else gabled) at that end. UVs in metres up the slope. Returns the lines.
export function roofGeo(bag, key, x0, x1, z0, z1, { eave = EAVE, slope = PITCH, ov = 0.35, hipL = true, hipR = true } = {}) {
  const xa = x0 - ov, xb = x1 + ov, za = z0 - ov, zb = z1 + ov, zc = (z0 + z1) / 2, hd = (zb - za) / 2, ye = eave - ov * slope, yr = ye + hd * slope;
  const rxa = hipL ? xa + hd : xa, rxb = hipR ? xb - hd : xb, k = Math.sqrt(1 + slope * slope);
  const P = [], U = [];
  const tri = (a, b, c, ua, ub, uc) => { P.push(...a, ...b, ...c); U.push(...ua, ...ub, ...uc); };
  // front slope (faces +z), back slope (faces -z)
  const F = [[xa, ye, zb], [xb, ye, zb], [rxb, yr, zc], [rxa, yr, zc]], Fu = F.map(p => [p[0], (zb - p[2]) * k]);
  tri(F[0], F[1], F[2], Fu[0], Fu[1], Fu[2]); tri(F[0], F[2], F[3], Fu[0], Fu[2], Fu[3]);
  const Bk = [[xb, ye, za], [xa, ye, za], [rxa, yr, zc], [rxb, yr, zc]], Bu = Bk.map(p => [-p[0], (p[2] - za) * k]);
  tri(Bk[0], Bk[1], Bk[2], Bu[0], Bu[1], Bu[2]); tri(Bk[0], Bk[2], Bk[3], Bu[0], Bu[2], Bu[3]);
  if (hipL) tri([xa, ye, za], [xa, ye, zb], [rxa, yr, zc], [za, 0], [zb, 0], [zc, hd * k]);
  if (hipR) tri([xb, ye, zb], [xb, ye, za], [rxb, yr, zc], [-zb, 0], [-za, 0], [-zc, hd * k]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.computeVertexNormals();
  bag.add(key, g);
  // the roof's thickness at the edges (a dark tile edge under the eaves / verges)
  return { xa, xb, za, zb, zc, ye, yr, rxa, rxb, hd, slope, hipL, hipR };
}
// fascias, gutters, ridge and hip caps, verge boards for a roof made by roofGeo (trim into a bag)
export function roofTrim(bag, r, { fascia = C.WHITE, gutter = C.ANTH, ridge = 0x34373b } = {}) {
  const { xa, xb, za, zb, zc, ye, yr, rxa, rxb, hd, slope } = r, L = xb - xa;
  for (const z of [za, zb]) { const s = Math.sign(z - zc); bag.box(L, 0.2, 0.04, (xa + xb) / 2, ye - 0.08, z + s * 0.01, fascia); bag.box(L + 0.04, 0.1, 0.12, (xa + xb) / 2, ye - 0.12, z + s * 0.08, gutter); }
  for (const [on, x] of [[r.hipL, xa], [r.hipR, xb]]) { const s = x < (xa + xb) / 2 ? -1 : 1;
    if (on) { bag.box(0.04, 0.2, zb - za, x + s * 0.01, ye - 0.08, zc, fascia); bag.box(0.12, 0.1, zb - za + 0.04, x + s * 0.08, ye - 0.12, zc, gutter);
      for (const zz of [za, zb]) { const dx = (s > 0 ? rxb : rxa) - x, dz = zc - zz, dy = yr - ye, len = Math.hypot(dx, dz, dy), g = new THREE.BoxGeometry(0.16, 0.1, len);
        const dir = new THREE.Vector3(dx, dy, dz).normalize(); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir)); bag.part(g, ridge, [x + dx / 2, ye + dy / 2 + 0.04, zz + dz / 2]); } }
    else { const len = Math.hypot(hd, hd * slope), ang = Math.atan2(hd * slope, hd);       // white verge boards up the gable
      for (const sz of [-1, 1]) bag.box(0.05, 0.22, len, x + s * 0.02, ye + hd * slope / 2 - 0.06, zc + sz * hd / 2, fascia, [sz * ang, 0, 0]); } }
  bag.box(rxb - rxa + 0.1, 0.14, 0.24, (rxa + rxb) / 2, yr + 0.03, zc, ridge);
  return r;
}

// a small gabled roof with its ridge along z (a porch / dormer over a front door): centre x, from z0 (into the main
// roof) to z1 (the front), w wide, eave height, slope; a boarded white gable at the front, slim anthracite posts
export function porchRoof(bag, x, z0, z1, w, eave, slope, { posts = false, key = 'roof', fascia = C.WHITE, sidKey = 'sid' } = {}) {
  const t = new Bag(), len = z1 - z0, r = roofGeo(t, 'r', -len / 2, len / 2, -w / 2, w / 2, { eave, slope, ov: 0.12, hipL: false, hipR: false });
  roofTrim(t, r, { fascia });
  const tf = (g) => { g.rotateY(-Math.PI / 2); g.translate(x, 0, (z0 + z1) / 2); return g; };
  bag.add(key, tf(t.merged('r'))); bag.trim.push(tf(t.mergedTrim()));
  const rise = w / 2 * slope, zf = z1 + 0.005;
  bag.stri([x - w / 2, eave, zf], [x + w / 2, eave, zf], [x, eave + rise, zf], sidKey);
  bag.box(w + 0.1, 0.16, 0.06, x, eave - 0.06, z1 + 0.02, fascia);
  if (posts) for (const s of [-1, 1]) bag.box(0.08, eave, 0.08, x + s * (w / 2 - 0.05), eave / 2, z1 - 0.05, C.ANTH);
  return { rise };
}

// ---------------------------------------------------------------- windows & doors (vertex colours)
// a window in the plane of a wall: axis 'x' = in a wall along x (faces ±z), dir = which way out; a, y = centre
export function bagWindow(bag, axis, c, a, y, w, h, dir, { frame = C.WHITE, panes = 2, transom = true, glass = C.GLASS, sky = C.GLASS2, depth = 0.08 } = {}) {
  const B = (ww, hh, dd, aa, yy, off, col) => axis === 'x' ? bag.box(ww, hh, dd, aa, yy, c + dir * off, col) : bag.box(dd, hh, ww, c + dir * off, yy, aa, col);
  B(w, h * 0.55, 0.02, a, y - h * 0.225, 0.0, glass); B(w, h * 0.45, 0.02, a, y + h * 0.275, 0.0, sky);           // glass: dark below, the sky's reflection above
  B(w + 0.1, 0.07, depth, a, y + h / 2 + 0.02, 0.02, frame); B(w + 0.1, 0.07, depth, a, y - h / 2 - 0.02, 0.02, frame);
  B(0.07, h, depth, a - w / 2 - 0.02, y, 0.02, frame); B(0.07, h, depth, a + w / 2 + 0.02, y, 0.02, frame);
  for (let i = 1; i < panes; i++) B(0.06, h, depth * 0.8, a - w / 2 + w * i / panes, y, 0.025, frame);
  if (transom) B(w, 0.05, depth * 0.8, a, y + h / 2 - h * 0.28, 0.025, frame);
  B(w + 0.16, 0.04, 0.12, a, y - h / 2 - 0.06, 0.06, frame);                       // sill
}

// ---------------------------------------------------------------- a whole park home (for the neighbours)
// L = length (x), W = width (z). ends: 'hip' | 'gable' | 'cathedral' (left = -x end, right = +x end). Front at +z.
export const MODELS = {
  sonata: { L: 12.19, ends: ['hip', 'hip'], siding: 'white', frame: C.WHITE, deck: null, porch: false },
  sofia: { L: 13.72, ends: ['hip', 'cathedral'], siding: 'band', frame: C.ANTH, deck: 'right', porch: false },
  majestic: { L: 15.24, ends: ['cathedral', 'hip'], siding: 'grey', frame: C.WHITE, deck: 'left', porch: true },
  residence: { L: 18.29, ends: ['hip', 'cathedral'], siding: 'band', frame: C.WHITE, deck: 'right', porch: true },
};
export function homeModel(spec) {
  const L = spec.L, W = 6.1, hx = L / 2, hz = W / 2, bag = new Bag(), fr = spec.frame;
  // skirting (grey brick effect, in colour here), the siding shell, corner boards, a trim line over the grey band
  bag.box(L - 0.04, 0.7, W - 0.04, 0, 0.35, 0, C.SKIRT);
  for (const s of [-1, 1]) { bag.box(L, 0.012, 0.012, 0, 0.66, s * (hz - 0.01), 0x606366); }
  bag.sbox(L, EAVE - 0.7, W, 0, 0.7 + (EAVE - 0.7) / 2, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.box(0.1, EAVE - 0.7, 0.1, sx * (hx + 0.005), 0.7 + (EAVE - 0.7) / 2, sz * (hz + 0.005), C.WHITE);
  // the roof (gabled ends get a siding triangle; a cathedral end glazing up into it)
  const r = roofTrim(bag, roofGeo(bag, 'roof', -hx, hx, -hz, hz, { hipL: spec.ends[0] === 'hip', hipR: spec.ends[1] === 'hip' }));
  const rise = hz * PITCH;
  for (const [end, s] of [[spec.ends[0], -1], [spec.ends[1], 1]]) {
    const x = s * hx;
    if (end !== 'hip') bag.stri(s > 0 ? [x, EAVE, hz] : [x, EAVE, -hz], s > 0 ? [x, EAVE, -hz] : [x, EAVE, hz], [x, EAVE + rise, 0]);
    if (end === 'cathedral') {            // full-height glazing with triangular panes above
      const B = (w, h, d, z, y, col) => bag.box(d, h, w, x + s * 0.02, y, z, col);
      B(4.0, EAVE - FL - 0.05, 0.02, 0, FL + (EAVE - FL) / 2, C.GLASS); B(4.0, 0.8, 0.021, 0, EAVE - 0.5, C.GLASS2);
      for (let i = 0; i <= 4; i++) B(0.07, EAVE - FL, 0.08, -2.0 + i, FL + (EAVE - FL) / 2, fr);
      B(4.1, 0.08, 0.08, 0, FL + 0.02, fr); B(4.1, 0.08, 0.08, 0, EAVE - 0.02, fr);
      const g = new THREE.BufferGeometry(), y0 = EAVE + 0.04, top = EAVE + rise * 0.62, x2 = x + s * 0.025;
      g.setAttribute('position', new THREE.Float32BufferAttribute(s > 0 ? [x2, y0, 2.0, x2, y0, -2.0, x2, top, 0] : [x2, y0, -2.0, x2, y0, 2.0, x2, top, 0], 3)); g.computeVertexNormals(); bag.part(g, C.GLASS2);
      for (const sz of [-1, 1]) { const len = Math.hypot(2.0, top - y0); bag.box(0.08, 0.07, len, x + s * 0.03, (y0 + top) / 2, sz * 1.0, fr, [sz * Math.atan2(top - y0, 2.0), 0, 0]); }
      bag.box(0.08, top - y0, 0.06, x + s * 0.03, (y0 + top) / 2, 0, fr);
    } else {                                // an end window
      bagWindow(bag, 'z', x, -0.9, FL + 1.45, 1.2, 1.1, s, { frame: fr, panes: 2 });
    }
  }
  // the front: a door near one end with three steps, windows along; the back: windows
  const doorX = spec.ends[0] === 'cathedral' ? hx - 3.6 : -hx + 3.6;
  const B = (w, h, d, x, y, z, col) => bag.box(w, h, d, x, y, z, col);
  B(1.0, 2.05, 0.06, doorX, FL + 1.03, hz + 0.02, C.ANTH); B(0.18, 1.5, 0.065, doorX - 0.2, FL + 1.15, hz + 0.02, 0xd7dde0);   // composite door, sandblasted glass strip
  B(1.14, 0.07, 0.08, doorX, FL + 2.08, hz + 0.03, fr); for (const s of [-1, 1]) B(0.07, 2.1, 0.08, doorX + s * 0.54, FL + 1.05, hz + 0.03, fr);
  for (let i = 0; i < 3; i++) B(1.5, FL - i * FL / 3, 0.32, doorX, (FL - i * FL / 3) / 2, hz + 0.16 + i * 0.3, C.STEP);
  for (const s of [-1, 1]) { B(0.04, 0.95, 0.04, doorX + s * 0.78, FL + 0.48 - 0.25, hz + 0.6, C.ANTH); B(0.04, 0.04, 0.9, doorX + s * 0.78, FL + 0.7, hz + 0.5, C.ANTH); }
  for (const s of [-1, 1]) { B(0.12, 0.2, 0.1, doorX + s * 0.8, FL + 1.85, hz + 0.06, 0x1e1f21); B(0.08, 0.12, 0.06, doorX + s * 0.8, FL + 1.83, hz + 0.1, C.LAMP); }
  for (const s of [-1, 1]) { bag.cyl(0.19, 0.15, 0.4, doorX + s * 1.15, 0.2, hz + 1.05, 0x3a3c40, 10); bag.cyl(0.02, 0.02, 0.4, doorX + s * 1.15, 0.6, hz + 1.05, 0x5a4030, 5); bag.part(new THREE.IcosahedronGeometry(0.24, 1), 0x2f5a26, [doorX + s * 1.15, 0.92, hz + 1.05]); }
  for (let i = 0; i < 5; i++) { const x = -hx + 1.2 + i * (L - 2.4) / 4; if (Math.abs(x - doorX) < 1.6) continue; bag.part(new THREE.IcosahedronGeometry(0.28, 1), [0x3a6a2a, 0x4a7a32, 0x355f26][i % 3], [x, 0.22, hz + 0.45], [0, i, 0], [1.3, 0.8, 1.1]); }   // a few neat shrubs along the front
  if (spec.porch) porchRoof(bag, doorX, hz - 1.2, hz + 1.05, 2.0, EAVE - 0.1, 0.65, { posts: true });
  const wins = [];
  for (let x = -hx + 1.6; x < hx - 1.2; x += 2.6) if (Math.abs(x - doorX) > 1.4) wins.push(x);
  for (const x of wins) bagWindow(bag, 'x', hz, x, FL + 1.45, 1.4, 1.15, 1, { frame: fr, panes: 3 });
  for (let x = -hx + 1.8; x < hx - 1.2; x += 3.1) bagWindow(bag, 'x', -hz, x, FL + 1.5, 1.1, 1.0, -1, { frame: fr, panes: 2 });
  // decking at one end with a clear glass balustrade
  if (spec.deck) { const s = spec.deck === 'right' ? 1 : -1, x0 = s * hx, x1 = s * (hx + 2.2), xm = (x0 + x1) / 2;
    B(2.2, FL, W + 0.6, xm, FL / 2, -0.3, C.DECK); B(2.22, 0.03, W + 0.62, xm, FL + 0.005, -0.3, 0x666666);
    B(0.02, 0.95, W + 0.6, x1, FL + 0.5, -0.3, C.BALU); B(2.2, 0.95, 0.02, xm, FL + 0.5, -hz - 0.6, C.BALU);
    B(0.05, 0.05, W + 0.65, x1, FL + 1.0, -0.3, 0x1e1f21); B(2.2, 0.05, 0.05, xm, FL + 1.0, -hz - 0.6, 0x1e1f21);
    for (let z = -hz - 0.6; z <= hz + 0.01; z += 1.2) B(0.05, 1.0, 0.05, x1, FL + 0.5, z, 0x1e1f21); }
  for (const x of [-hx + 0.3, hx - 0.3]) bag.cyl(0.04, 0.04, EAVE - 0.3, x, (EAVE - 0.3) / 2, -hz - 0.08, C.ANTH, 6);   // downpipes
  return { L, W, doorX, eaveFront: hz + 0.35, siding: spec.siding, sid: bag.merged('sid'), roof: bag.merged('roof'), trim: bag.mergedTrim(), roofInfo: r };
}

// all the neighbours: one instanced mesh per model per material. list: [{ model, x, z, ry }]
export function placeHomes(scene, list, mats) {
  const byModel = new Map();
  for (const h of list) (byModel.get(h.model) || byModel.set(h.model, []).get(h.model)).push(h);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1), up = new THREE.Vector3(0, 1, 0), out = [];
  for (const [name, hs] of byModel) {
    const M = homeModel(MODELS[name]);
    for (const [geo, mat] of [[M.sid, mats.siding[M.siding]], [M.roof, mats.roof], [M.trim, mats.trim]]) {
      if (!geo) continue;
      const im = new THREE.InstancedMesh(geo, mat, hs.length);
      hs.forEach((h, i) => im.setMatrixAt(i, m4.compose(new THREE.Vector3(h.x, 0, h.z), q.setFromAxisAngle(up, h.ry || 0), one)));
      im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); im.userData.homes = true; scene.add(im); out.push(im);
    }
    for (const h of hs) h.M = M;
  }
  return out;
}
// a point on a placed home (local x, y, z) in the world
export function homePoint(h, lx, ly, lz) { const c = Math.cos(h.ry || 0), s = Math.sin(h.ry || 0); return [h.x + lx * c + lz * s, ly, h.z - lx * s + lz * c]; }
