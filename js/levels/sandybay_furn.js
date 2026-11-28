// Sandy Bay furniture: the modern, high-spec pieces of Nan's park home, made of boxes and cylinders (vertex colours,
// merged by the Kit). Everything's built at floor level (y = 0); the house lifts the lot on to its raised floor.
// Faces: ry is the way a piece faces (0 = toward +z), as the Kit's chairs (theirs: 0 = toward -z; noted where used).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { part, sph, cyl } from '../geo.js';

export const OAK = 0xb98a4e, OAKD = 0x9a7040, CHAR = 0x3a3d42, STONE = 0x8e8f8c, CHROME = 0xd2d6da, BLK = 0x1a1b1d, WHITE = 0xf7f7f5;
const rbox = (w, h, d, r = 0.04) => new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
// local -> world helpers for a piece at (x, z) facing ry (local +z = the front)
function frame(x, z, ry) { const c = Math.cos(ry), s = Math.sin(ry); return { at: (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c], c, s }; }
function rotBlock(k, x, z, ry, w, d, y1) { const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)), hx = c * w / 2 + s * d / 2, hz = s * w / 2 + c * d / 2; k.blockers.push({ x0: x - hx, x1: x + hx, z0: z - hz, z1: z + hz, y1 }); }
function P(k, f, ry, geo, col, lx, y, lz, rot = [0, 0, 0], scl = [1, 1, 1]) { const [px, pz] = f.at(lx, lz); k.parts.push(part(geo, col, [px, y, pz], [rot[0], ry + rot[1], rot[2]], scl)); }
function Bx(k, f, ry, w, h, d, lx, y, lz, col, rx = 0) { P(k, f, ry, new THREE.BoxGeometry(w, h, d), col, lx, y, lz, [rx, 0, 0]); }

// a cross-back oak dining chair (an upholstered oatmeal seat), facing ry; records the seat
export function crossChair(k, x, z, ry, { wood = OAK, seat = 0xd9cfc0 } = {}) {
  const f = frame(x, z, ry), B = (w, h, d, lx, y, lz, col, rx = 0) => Bx(k, f, ry, w, h, d, lx, y, lz, col, rx);
  B(0.44, 0.04, 0.44, 0, 0.44, 0, wood); B(0.4, 0.05, 0.38, 0, 0.485, 0.01, seat);
  for (const a of [-0.19, 0.19]) { B(0.04, 0.44, 0.04, a, 0.22, 0.19, wood); B(0.04, 0.9, 0.04, a, 0.45, -0.2, wood, -0.05); }
  B(0.42, 0.06, 0.03, 0, 0.88, -0.215, wood);
  for (const s of [-1, 1]) { const g = new THREE.BoxGeometry(0.035, 0.46, 0.022); g.rotateZ(s * 0.68); P(k, f, ry, g, wood, 0, 0.66, -0.21); }
  B(0.36, 0.03, 0.03, 0, 0.14, 0.19, wood);
  k.seats.push({ x, z, yaw: ry, h: 0.51 });
}
// a dining table (oak top, splayed legs), its top a food spot
export function diningTable(k, x, z, w, d, { h = 0.76, top = OAK, cloth = null, runner = 0xa01828 } = {}) {
  k.box(w, 0.045, d, x, h - 0.0225, z, top, { collide: true, block: true });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.box(0.07, h - 0.045, 0.07, x + sx * (w / 2 - 0.12), (h - 0.045) / 2, z + sz * (d / 2 - 0.1), OAKD);
  for (const sz of [-1, 1]) k.box(w - 0.3, 0.07, 0.03, x, h - 0.08, z + sz * (d / 2 - 0.08), OAKD);
  if (cloth) k.box(w + 0.02, 0.006, d + 0.02, x, h + 0.003, z, cloth);
  if (runner) k.box(w - 0.1, 0.004, 0.34, x, h + 0.006, z, runner);
}
// a bar stool: grey upholstered seat with a low back, black legs and foot ring. Faces ry. Seat 0.72.
export function barStool(k, x, z, ry, { seat = 0x8c8e90 } = {}) {
  const f = frame(x, z, ry), B = (w, h, d, lx, y, lz, col, rx = 0) => Bx(k, f, ry, w, h, d, lx, y, lz, col, rx);
  P(k, f, ry, rbox(0.42, 0.09, 0.4, 0.04), seat, 0, 0.72, 0); P(k, f, ry, rbox(0.4, 0.22, 0.06, 0.03), seat, 0, 0.88, -0.18, [-0.15, 0, 0]);
  for (const a of [-0.16, 0.16]) for (const b of [-0.15, 0.15]) B(0.025, 0.68, 0.025, a, 0.34, b, BLK);
  for (const b of [-0.15, 0.15]) B(0.34, 0.02, 0.02, 0, 0.26, b, BLK); for (const a of [-0.16, 0.16]) B(0.02, 0.02, 0.32, a, 0.26, 0, BLK);
  k.blockers.push({ x0: x - 0.21, x1: x + 0.21, z0: z - 0.21, z1: z + 0.21, y1: 0.95 });
  k.seats.push({ x, z, yaw: ry, h: 0.765 });
}
// kitchen base units along a wall: matt charcoal slab doors, black bar handles, the stone worktop. axis 'x' = the run
// goes along x with its back on the wall at z = c, the fronts facing dir (+1 / -1).
export function baseRun(k, axis, c, a0, a1, dir, { depth = 0.6, h = 0.9, top = STONE, col = CHAR, skip = [], wt = 0.03 } = {}) {
  const len = a1 - a0, m = (a0 + a1) / 2, cz = c + dir * depth / 2;
  const B = (w, hh, d, aa, y, off, cl, opts) => axis === 'x' ? k.box(w, hh, d, aa, y, c + dir * off, cl, opts) : k.box(d, hh, w, c + dir * off, y, aa, cl, opts);
  B(len, h - 0.1, depth - 0.05, m, 0.1 + (h - 0.1) / 2, (depth - 0.05) / 2, col, { block: true });
  B(len, 0.1, depth - 0.1, m, 0.05, (depth - 0.1) / 2, 0x161718);
  B(len + 0.01, wt, depth + 0.02, m, h + wt / 2, (depth + 0.02) / 2, top, { collide: true });
  B(len + 0.01, wt, 0.01, m, h + wt / 2, depth + 0.02, 0x6e6f6c);
  const n = Math.max(1, Math.round(len / 0.6)), w = len / n;
  for (let i = 0; i < n; i++) { const a = a0 + w * (i + 0.5); if (skip.some(([s0, s1]) => a > s0 && a < s1)) continue;
    B(w - 0.006, 0.76, 0.02, a, 0.1 + 0.39, depth - 0.04, col); B(0.006, 0.78, 0.022, a - w / 2, 0.49, depth - 0.04, 0x202224);
    B(w * 0.6, 0.016, 0.03, a, h - 0.07, depth - 0.01, BLK); B(w - 0.006, 0.005, 0.022, a, h - 0.14, depth - 0.035, 0x202224); }
  void cz;
}
// a tall unit (oven + microwave stacked, or a larder) on a wall, fronts facing dir
export function towerUnit(k, axis, c, a0, a1, dir, { h = 2.2, depth = 0.6, col = CHAR, ovens = true } = {}) {
  const m = (a0 + a1) / 2, w = a1 - a0, B = (ww, hh, d, aa, y, off, cl, opts) => axis === 'x' ? k.box(ww, hh, d, aa, y, c + dir * off, cl, opts) : k.box(d, hh, ww, c + dir * off, y, aa, cl, opts);
  B(w, h, depth, m, h / 2, depth / 2, col, { block: true });
  if (ovens) { B(w - 0.06, 0.6, 0.02, m, 0.95, depth + 0.005, 0x111214); B(w - 0.16, 0.36, 0.022, m, 0.92, depth + 0.006, 0x3a2a1e); B(w - 0.1, 0.03, 0.04, m, 1.2, depth + 0.03, CHROME);
    B(w - 0.06, 0.4, 0.02, m, 1.5, depth + 0.005, 0x111214); B(w * 0.5, 0.24, 0.022, m - w * 0.1, 1.5, depth + 0.006, 0x26303a); B(0.12, 0.3, 0.022, m + w * 0.33, 1.5, depth + 0.006, 0x2a2c2e);
    B(w - 0.006, 0.6, 0.02, m, 1.98, depth + 0.004, col); B(w - 0.006, 0.55, 0.02, m, 0.38, depth + 0.004, col); B(w * 0.5, 0.016, 0.03, m, 0.62, depth + 0.02, BLK); B(w * 0.5, 0.016, 0.03, m, 1.71, depth + 0.02, BLK); }
}
// a black American fridge-freezer (two doors, water dispenser), its back on the wall
export function americanFridge(k, axis, c, a0, a1, dir, { h = 1.79, depth = 0.72 } = {}) {
  const m = (a0 + a1) / 2, w = a1 - a0, B = (ww, hh, d, aa, y, off, cl, opts) => axis === 'x' ? k.box(ww, hh, d, aa, y, c + dir * off, cl, opts) : k.box(d, hh, ww, c + dir * off, y, aa, cl, opts);
  B(w, h, depth, m, h / 2, depth / 2, 0x1c1d1f, { block: true, collide: true });
  B(0.006, h - 0.06, 0.02, m, h / 2, depth + 0.005, 0x0a0a0b);
  for (const s of [-1, 1]) B(0.025, 0.7, 0.04, m + s * 0.05, 1.05, depth + 0.03, 0x7a7d80);
  B(0.2, 0.3, 0.01, m - w * 0.25, 1.15, depth + 0.006, 0x2c2e30); B(0.14, 0.02, 0.012, m - w * 0.25, 1.32, depth + 0.008, 0x58c8ff);
  return { front: c + dir * (depth + 0.012) };
}
// an induction hob in a worktop and the angled black glass extractor above it
export function hobAndHood(k, axis, c, a, dir, wt = 0.93) {
  const B = (ww, hh, d, aa, y, off, cl, rot) => axis === 'x' ? k.box(ww, hh, d, aa, y, c + dir * off, cl, rot ? { rot } : undefined) : k.box(d, hh, ww, c + dir * off, y, aa, cl, rot ? { rot } : undefined);
  B(0.6, 0.01, 0.52, a, wt + 0.005, 0.3, 0x0c0c0e);
  for (const [dx, dz, r] of [[-0.15, 0.18, 0.1], [0.15, 0.18, 0.08], [-0.15, 0.42, 0.08], [0.15, 0.42, 0.1]]) { const pz = c + dir * dz; axis === 'x' ? k.cyl(r, r, 0.004, a + dx, wt + 0.011, pz, 0x2a2a2e, 16) : k.cyl(r, r, 0.004, pz, wt + 0.011, a + dx, 0x2a2a2e, 16); }
  B(0.6, 0.4, 0.05, a, 1.75, 0.08, 0x141416); B(0.6, 0.04, 0.38, a, 1.56, 0.22, 0x141416);
  const tilt = 0.55; if (axis === 'x') k.box(0.6, 0.48, 0.02, a, 1.72, c + dir * 0.25, 0x0e0f11, { rot: [dir * tilt, 0, 0] }); else k.box(0.02, 0.48, 0.6, c + dir * 0.25, 1.72, a, 0x0e0f11, { rot: [0, 0, -dir * tilt] });
  B(0.25, 0.6, 0.25, a, 2.25, 0.14, 0x141416);
}
// the island: charcoal slab doors on the kitchen side, an oak-clad end, stone top with an overhang for stools
export function island(k, x, z, w, d, { over = 0.28, top = STONE, col = CHAR, wt = 0.03, h = 0.9 } = {}) {
  const bd = d - over;      // the cabinet depth (the overhang is on +z)
  k.box(w, h - 0.1, bd, x, 0.1 + (h - 0.1) / 2, z - over / 2, col, { block: true }); k.box(w - 0.06, 0.1, bd - 0.06, x, 0.05, z - over / 2, 0x161718);
  k.box(w + 0.04, wt, d + 0.02, x, h + wt / 2, z, top, { collide: true, block: true });
  const n = Math.round(w / 0.5), cw = w / n;
  for (let i = 0; i < n; i++) { const a = x - w / 2 + cw * (i + 0.5); k.box(cw - 0.006, 0.76, 0.02, a, 0.49, z - over / 2 - bd / 2 - 0.01, col); k.box(cw * 0.6, 0.016, 0.03, a, h - 0.07, z - over / 2 - bd / 2 - 0.03, BLK); }
  for (const s of [-1, 1]) k.box(0.04, h, d, x + s * (w / 2 + 0.0), h / 2, z, OAK);
  k.box(w, 0.6, 0.02, x, 0.5, z + d / 2 - over - 0.01, 0x2c2f33);          // the panel under the overhang
}
// a modern TV: slim black panel on an oak media unit (screen plain dark; the picture is set by the level)
export function tvUnit(k, x, z, ry, w = 1.8, { h = 0.45, d = 0.42 } = {}) {
  const f = frame(x, z, ry), B = (ww, hh, dd, lx, y, lz, col) => Bx(k, f, ry, ww, hh, dd, lx, y, lz, col);
  B(w, h - 0.08, d, 0, 0.08 + (h - 0.08) / 2, 0, OAK); B(w - 0.04, 0.08, d - 0.06, 0, 0.04, -0.02, 0x1e1f21);
  for (let i = 0; i < 3; i++) B(w / 3 - 0.02, h - 0.14, 0.012, -w / 3 + i * w / 3, 0.08 + (h - 0.08) / 2, d / 2 + 0.003, i === 1 ? 0x2c2e31 : OAKD);
  k.colliders.push({ min: new THREE.Vector3(x - (Math.abs(Math.cos(ry)) * w + Math.abs(Math.sin(ry)) * d) / 2, h - 0.02, z - (Math.abs(Math.sin(ry)) * w + Math.abs(Math.cos(ry)) * d) / 2), max: new THREE.Vector3(x + (Math.abs(Math.cos(ry)) * w + Math.abs(Math.sin(ry)) * d) / 2, h, z + (Math.abs(Math.sin(ry)) * w + Math.abs(Math.cos(ry)) * d) / 2) });
  rotBlock(k, x, z, ry, w, d, h);
  return f;
}
// an oak coffee table (a lower shelf), its top a food spot
export function coffeeTable(k, x, z, w, d, { h = 0.42 } = {}) {
  k.box(w, 0.04, d, x, h - 0.02, z, OAK, { collide: true, block: true }); k.box(w - 0.1, 0.025, d - 0.1, x, 0.12, z, OAKD);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.box(0.05, h - 0.04, 0.05, x + sx * (w / 2 - 0.06), (h - 0.04) / 2, z + sz * (d / 2 - 0.06), OAKD);
  k.spawns.push(new THREE.Vector3(x - w * 0.2, h + 0.08, z), new THREE.Vector3(x + w * 0.22, h + 0.08, z));
}
// a round side table (oak top, black stem): returns the top height
export function sideTable(k, x, z, { r = 0.26, h = 0.56 } = {}) {
  k.cyl(r, r, 0.03, x, h - 0.015, z, OAK, 20, { collide: true }); k.cyl(0.025, 0.025, h - 0.03, x, (h - 0.03) / 2, z, BLK, 6); k.cyl(r * 0.6, r * 0.65, 0.02, x, 0.01, z, BLK, 16);
  k.blockers.push({ x0: x - r, x1: x + r, z0: z - r, z1: z + r, y1: h });
  return h;
}
// a table lamp: ceramic base, oatmeal drum shade, a glow
export function tableLamp(k, x, y, z, { base = 0x5a6a70, shade = 0xe8dfcf } = {}) {
  k.parts.push(part(sph(0.09, 12, 8), base, [x, y + 0.1, z], [0, 0, 0], [1, 1.2, 1])); k.cyl(0.01, 0.01, 0.18, x, y + 0.28, z, CHROME, 5);
  k.cyl(0.15, 0.17, 0.2, x, y + 0.43, z, shade, 18); k.lamp(x, y + 0.4, z, 0xffe2b0, 0.05);
}
// an oatmeal drum pendant on a cord from the ceiling at height top
export function drumPendant(k, x, z, top, y, { r = 0.26, col = 0xe2d8c6 } = {}) {
  k.cyl(0.006, 0.006, top - y - 0.12, x, (top + y + 0.12) / 2, z, 0x2a2a2a, 4); k.cyl(0.05, 0.05, 0.03, x, top - 0.015, z, WHITE, 10);
  k.parts.push(part(new THREE.CylinderGeometry(r, r, 0.26, 24, 1, true), col, [x, y, z])); k.cyl(r - 0.01, r - 0.01, 0.005, x, y - 0.12, z, 0xf8f0e0, 20);
  k.lamp(x, y - 0.05, z, 0xffe8c0, 0.06, true);
}
// a glass globe pendant
export function globePendant(k, x, z, top, y) {
  k.cyl(0.005, 0.005, top - y - 0.12, x, (top + y + 0.12) / 2, z, 0x2a2a2a, 4); k.cyl(0.04, 0.04, 0.03, x, top - 0.015, z, BLK, 10);
  k.cyl(0.035, 0.035, 0.05, x, y + 0.12, z, BLK, 10); k.parts.push(part(sph(0.12, 14, 10), 0xd8e8ee, [x, y, z])); k.lamp(x, y, z, 0xffe6b0, 0.035, true);
}
// a slim white panel radiator on a wall (axis 'x' = along x at z = c, d = the room's side)
export function radiator(k, axis, c, a, w, d, { y = 0.42, h = 0.5 } = {}) {
  const B = (ww, hh, t, aa, yy, off, col) => axis === 'x' ? k.box(ww, hh, t, aa, yy, c + d * off, col) : k.box(t, hh, ww, c + d * off, yy, aa, col);
  B(w, h, 0.06, a, y, 0.06, 0xf4f4f2); for (let i = 1; i < Math.round(w / 0.08); i++) B(0.006, h - 0.04, 0.005, a - w / 2 + i * 0.08, y, 0.092, 0xdcdcd8);
  B(0.03, 0.06, 0.03, a + w / 2 + 0.02, y - h / 2 - 0.02, 0.05, CHROME);
}
// a white panel door (open, swung against a wall): from hinge (hx, hz), leaf along +-x / +-z, w wide
export function openDoor(k, hx, hz, alongX, sign, w, { col = WHITE, h = 2.03, lever = CHROME, glazed = false } = {}) {
  const cx = alongX ? hx + sign * w / 2 : hx, cz = alongX ? hz : hz + sign * w / 2;
  if (glazed) {       // a white frame round a big pane of glass (glazed = the level's glass-quad function)
    const B = (ww, hh, a, y) => alongX ? k.box(ww, hh, 0.045, a, y, cz, col) : k.box(0.045, hh, ww, cx, y, a, col), m = alongX ? cx : cz;
    B(w, 0.12, m, 0.06 + 0.1); B(w, 0.12, m, h - 0.06); B(0.1, h, m - w / 2 + 0.05, h / 2); B(0.1, h, m + w / 2 - 0.05, h / 2); B(w, 0.18, m, 0.09);
    const a0 = m - w / 2 + 0.1, a1 = m + w / 2 - 0.1, y0 = 0.22, y1 = h - 0.12;
    if (typeof glazed === 'function') alongX ? glazed([a0, y0, cz], [a1, y0, cz], [a1, y1, cz], [a0, y1, cz]) : glazed([cx, y0, a0], [cx, y0, a1], [cx, y1, a1], [cx, y1, a0]);
  } else alongX ? k.box(w, h, 0.04, cx, h / 2, cz, col) : k.box(0.04, h, w, cx, h / 2, cz, col);
  if (!glazed) for (const [py, ph] of [[0.55, 0.7], [1.45, 0.8]]) alongX ? k.box(w - 0.24, ph, 0.046, cx, py, cz, 0xeeeeec) : k.box(0.046, ph, w - 0.24, cx, py, cz, 0xeeeeec);
  const ex = alongX ? hx + sign * (w - 0.08) : hx, ez = alongX ? hz : hz + sign * (w - 0.08);
  for (const s of [-1, 1]) alongX ? k.box(0.12, 0.02, 0.02, ex - sign * 0.04, 1.02, ez + s * 0.04, lever) : k.box(0.02, 0.02, 0.12, ex + s * 0.04, 1.02, ez - sign * 0.04, lever);
}
// floor-length curtains (pleated) either side of an opening on a chrome pole. axis 'x' = on a wall along x at z = c,
// d = the room side; a0..a1 = the opening
export function curtains(k, axis, c, a0, a1, d, top, { col = 0x8f9396, col2 = 0xc9a03a } = {}) {
  const B = (w, h, t, a, y, off, cl) => axis === 'x' ? k.box(w, h, t, a, y, c + d * off, cl) : k.box(t, h, w, c + d * off, y, a, cl);
  B(a1 - a0 + 0.8, 0.025, 0.025, (a0 + a1) / 2, top, 0.12, CHROME);
  for (const a of [a0 - 0.4, a1 + 0.4]) B(0.05, 0.05, 0.05, a, top, 0.12, CHROME);
  for (const [s, e] of [[a0 - 0.38, a0 + 0.12], [a1 - 0.12, a1 + 0.38]]) { const n = 6, w = (e - s) / n;
    for (let i = 0; i < n; i++) B(w * 1.05, top - 0.03, 0.04 + (i % 2) * 0.03, s + w * (i + 0.5), (top - 0.03) / 2 + 0.015, 0.1 + (i % 2) * 0.015, i % 2 ? col : new THREE.Color(col).multiplyScalar(0.88).getHex());
    B(e - s, 0.18, 0.09, (s + e) / 2, top - 0.12, 0.11, col2); }       // a mustard band at the top
}
// a double bed: upholstered taupe headboard, white bedding, a grey throw and cushions. The head against a wall;
// ry = the way the foot points (0 = +z)
export function bed(k, x, z, ry, { w = 1.5, l = 2.0, head = 0x9d9184 } = {}) {
  const f = frame(x, z, ry), B = (ww, h, d, lx, y, lz, col, rx = 0) => Bx(k, f, ry, ww, h, d, lx, y, lz, col, rx);
  B(w + 0.06, 0.3, l, 0, 0.17, 0, head); B(w, 0.24, l - 0.06, 0, 0.42, 0.02, 0xf4f2ee);
  P(k, f, ry, rbox(w + 0.02, 0.1, l - 0.4, 0.05), 0xf7f6f3, 0, 0.56, 0.18);                     // the duvet
  P(k, f, ry, rbox(w + 0.06, 0.06, 0.55, 0.03), 0x6e7275, 0, 0.6, l / 2 - 0.42);               // a grey throw
  for (const s of [-1, 1]) P(k, f, ry, rbox(w / 2 - 0.08, 0.14, 0.38, 0.06), 0xfafaf8, s * w / 4, 0.62, -l / 2 + 0.32, [-0.5, 0, 0]);
  for (const [s, col] of [[-1, 0x2f6d73], [0, 0xc9a03a], [1, 0x2f6d73]]) P(k, f, ry, rbox(0.36, 0.3, 0.1, 0.05), col, s * 0.36, 0.72, -l / 2 + 0.55, [-0.4, 0, 0]);
  P(k, f, ry, rbox(w + 0.3, 1.25, 0.12, 0.05), head, 0, 0.72, -l / 2 - 0.04);                   // the headboard
  for (let i = -2; i <= 2; i++) B(0.012, 0.95, 0.02, i * (w + 0.3) / 5.4, 0.78, -l / 2 + 0.03, new THREE.Color(head).multiplyScalar(0.85).getHex());   // its stitched panels
  rotBlock(k, x, z, ry, w + 0.3, l + 0.1, 0.7);
  { const b = k.blockers[k.blockers.length - 1]; k.colliders.push({ min: new THREE.Vector3(b.x0 + 0.05, 0, b.z0 + 0.05), max: new THREE.Vector3(b.x1 - 0.05, 0.6, b.z1 - 0.05) }); }   // (things dropped on it land on the duvet)
}
// an oak-effect bedside unit (two drawers), a lamp on it
export function bedside(k, x, z, ry, { lamp = true } = {}) {
  const f = frame(x, z, ry), B = (w, h, d, lx, y, lz, col) => Bx(k, f, ry, w, h, d, lx, y, lz, col);
  B(0.45, 0.5, 0.4, 0, 0.3, 0, OAK); B(0.45, 0.05, 0.4, 0, 0.03, 0, 0x2a2a2a);
  for (const y of [0.2, 0.42]) { B(0.42, 0.005, 0.01, 0, y + 0.1, 0.2, OAKD); B(0.12, 0.012, 0.02, 0, y, 0.205, BLK); }
  k.colliders.push({ min: new THREE.Vector3(x - 0.22, 0.5, z - 0.2), max: new THREE.Vector3(x + 0.22, 0.55, z + 0.2) });
  k.blockers.push({ x0: x - 0.24, x1: x + 0.24, z0: z - 0.24, z1: z + 0.24, y1: 0.55 });
  if (lamp) tableLamp(k, x, 0.55, z, { base: 0x9aa0a4 });
}
// mirrored sliding wardrobes along a wall (axis 'x' = along x at z = c, d = the room side)
// mirror: floor-to-ceiling mirrored sliding doors (bright silver-grey glass in slim frames, soft streaks of 'reflection')
export function mirrorWardrobe(k, axis, c, a0, a1, d, { h = 2.25, depth = 0.62, mirror = false } = {}) {
  const B = (w, hh, t, a, y, off, col, opts) => axis === 'x' ? k.box(w, hh, t, a, y, c + d * off, col, opts) : k.box(t, hh, w, c + d * off, y, a, col, opts);
  const m = (a0 + a1) / 2, len = a1 - a0;
  B(len, h, depth, m, h / 2, depth / 2, 0xe8e6e2, { block: true });
  if (mirror) {
    const n = Math.max(2, Math.round(len / 0.95)), w = len / n, FR = 0x7e858a;
    for (let i = 0; i < n; i++) { const a = a0 + w * (i + 0.5), off = depth + 0.006 + (i % 2) * 0.028;
      B(w + 0.01, h - 0.05, 0.016, a, h / 2, off, FR);                                                    // the slim frame (it shows round the glass)
      B(w - 0.05, h - 0.13, 0.012, a, h / 2, off + 0.006, i % 2 ? 0xd9e2e7 : 0xd0dade);                  // the mirror glass
      for (const [u, sw, col] of [[-0.22, 0.09, 0xeef4f7], [-0.08, 0.035, 0xe8eff3], [0.18, 0.06, 0xc4ced4]]) B(w * sw * 2, h - 0.2, 0.004, a + u * w, h / 2 + 0.02, off + 0.013, col);    // soft streaks
    }
    B(len, 0.05, 0.07, m, h - 0.025, depth + 0.035, FR); B(len, 0.05, 0.07, m, 0.025, depth + 0.035, FR);     // the top and bottom tracks
    return;
  }
  const n = Math.max(2, Math.round(len / 0.9)), w = len / n;
  for (let i = 0; i < n; i++) { const a = a0 + w * (i + 0.5); B(w - 0.03, h - 0.12, 0.02, a, h / 2, depth + 0.01 + (i % 2) * 0.03, i % 2 ? 0xb9c8d0 : 0xa9bac4); B(w - 0.01, h - 0.08, 0.015, a, h / 2, depth + 0.004 + (i % 2) * 0.03, 0x9aa0a4); }
  B(len, 0.04, 0.06, m, h - 0.02, depth + 0.03, 0x9aa0a4); B(len, 0.04, 0.06, m, 0.02, depth + 0.03, 0x9aa0a4);
}
// a white bath along a wall with a chrome shower over it and a glass screen; axis 'z' = along z at x = c, d = room side
export function bath(k, axis, c, a0, a1, d) {
  const m = (a0 + a1) / 2, len = a1 - a0, B = (w, h, t, a, y, off, col, opts) => axis === 'x' ? k.box(w, h, t, a, y, c + d * off, col, opts) : k.box(t, h, w, c + d * off, y, a, col, opts);
  B(len, 0.56, 0.72, m, 0.28, 0.36, 0xf8f8f6, { block: true }); B(len - 0.14, 0.04, 0.56, m, 0.55, 0.36, 0xe4eef2);
  B(0.04, 1.4, 0.04, a1 - 0.25, 1.4, 0.06, CHROME); B(0.2, 0.02, 0.2, a1 - 0.25, 2.1, 0.16, CHROME); B(0.12, 0.12, 0.06, a1 - 0.25, 1.0, 0.04, CHROME);
  B(0.8, 1.4, 0.01, a1 - 0.45, 1.27, 0.72, 0xcfe6ee);       // the glass screen
  B(0.03, 1.4, 0.03, a1 - 0.06, 1.27, 0.72, CHROME);
}
// a grey gloss vanity unit + basin, an LED mirror above (axis/c/d as above; a = centre)
export function vanity(k, axis, c, a, d, { w = 0.7 } = {}) {
  const B = (ww, h, t, aa, y, off, col, opts) => axis === 'x' ? k.box(ww, h, t, aa, y, c + d * off, col, opts) : k.box(t, h, ww, c + d * off, y, aa, col, opts);
  B(w, 0.5, 0.42, a, 0.55, 0.21, 0x8a8e92, { block: true }); B(w + 0.02, 0.06, 0.45, a, 0.83, 0.225, 0xf8f8f6, { collide: true }); B(w * 0.6, 0.02, 0.28, a, 0.86, 0.24, 0xe6eef0);
  B(0.03, 0.14, 0.03, a, 0.93, 0.07, CHROME); B(0.03, 0.03, 0.12, a, 0.99, 0.12, CHROME);
  B(w - 0.06, 0.7, 0.02, a, 1.5, 0.012, 0xb8c6cc); B(w - 0.02, 0.74, 0.012, a, 1.5, 0.006, 0xfaf6ea); k.lamp(axis === 'x' ? a : c + d * 0.03, 1.5, axis === 'x' ? c + d * 0.03 : a, 0xfff6e0, 0.0, false);
}
// a close-coupled toilet against a wall
export function toilet(k, axis, c, a, d) {
  const B = (ww, h, t, aa, y, off, col) => axis === 'x' ? k.box(ww, h, t, aa, y, c + d * off, col) : k.box(t, h, ww, c + d * off, y, aa, col);
  B(0.38, 0.38, 0.18, a, 0.6, 0.09, 0xf8f8f6); B(0.36, 0.4, 0.5, a, 0.2, 0.42, 0xf6f6f4); B(0.38, 0.03, 0.46, a, 0.42, 0.44, 0xfafafa);
  k.blockers.push(axis === 'x' ? { x0: a - 0.2, x1: a + 0.2, z0: Math.min(c, c + d * 0.7), z1: Math.max(c, c + d * 0.7), y1: 0.8 } : { x0: Math.min(c, c + d * 0.7), x1: Math.max(c, c + d * 0.7), z0: a - 0.2, z1: a + 0.2, y1: 0.8 });
}
// a wall-hung desk with a chair, a laptop
export function desk(k, axis, c, a, d, { w = 1.2 } = {}) {
  const B = (ww, h, t, aa, y, off, col, opts) => axis === 'x' ? k.box(ww, h, t, aa, y, c + d * off, col, opts) : k.box(t, h, ww, c + d * off, y, aa, col, opts);
  B(w, 0.04, 0.55, a, 0.74, 0.275, OAK, { collide: true, block: true }); B(w, 0.16, 0.45, a, 0.64, 0.225, 0xeceae6);
  B(0.34, 0.012, 0.24, a, 0.766, 0.3, 0x3a3c40); B(0.34, 0.22, 0.012, a, 0.88, 0.17, 0x2a2c30);
  const cx = axis === 'x' ? a : c + d * 0.85, cz = axis === 'x' ? c + d * 0.85 : a;
  k.cyl(0.24, 0.26, 0.08, cx, 0.47, cz, 0x4a4e55, 14); k.cyl(0.03, 0.03, 0.4, cx, 0.24, cz, BLK, 6); k.cyl(0.28, 0.28, 0.02, cx, 0.03, cz, BLK, 5);
  axis === 'x' ? k.box(0.44, 0.42, 0.06, cx, 0.75, cz + d * 0.22, 0x4a4e55) : k.box(0.06, 0.42, 0.44, cx + d * 0.22, 0.75, cz, 0x4a4e55);
  k.seats.push({ x: cx, z: cz, yaw: axis === 'x' ? (d > 0 ? Math.PI : 0) : (d > 0 ? -Math.PI / 2 : Math.PI / 2), h: 0.5 });
}
// a picture frame (black) holding a texture, flat on a wall (axis/c/d as above)
export function framed(k, axis, c, a, y, w, h, d, tex, { frameCol = 0x1e1f21, mount = 0xf6f4ee } = {}) {
  if (axis === 'x') { k.box(w + 0.06, h + 0.06, 0.03, a, y, c + d * 0.015, frameCol); k.box(w + 0.01, h + 0.01, 0.005, a, y, c + d * 0.031, mount); k.label('art', w - 0.08, h - 0.08, [a, y, c + d * 0.035], [0, d > 0 ? 0 : Math.PI, 0], { tex }); }
  else { k.box(0.03, h + 0.06, w + 0.06, c + d * 0.015, y, a, frameCol); k.box(0.005, h + 0.01, w + 0.01, c + d * 0.031, y, a, mount); k.label('art', w - 0.08, h - 0.08, [c + d * 0.035, y, a], [0, d > 0 ? Math.PI / 2 : -Math.PI / 2, 0], { tex }); }
}
// a low LED downlight in a ceiling (a bright disc)
export function downlight(k, x, y, z) { k.cyl(0.05, 0.05, 0.01, x, y - 0.005, z, 0xe8e8e4, 12); k.lamp(x, y - 0.012, z, 0xfff6e6, 0.035, false); }
