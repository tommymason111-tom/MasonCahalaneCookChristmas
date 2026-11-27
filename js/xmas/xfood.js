// Christmas food and drink: added to the game's food list (config.js FOODS) and shapes (foods.js EXTRA_GEO).
// Built the same way as the rest of the food: shaped pieces with their colours painted on the vertices.
import * as THREE from 'three';
import { FOODS } from '../config.js';
import { EXTRA_GEO } from '../foods.js';
import { part, merge, cyl, sph, box } from '../geo.js';

const lathe = (pts, seg = 24) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
let SEED = 7; const rnd = () => { SEED = (SEED * 16807) % 2147483647; return (SEED - 1) / 2147483646; };

export const XFOODS = {
  mincepie:   { label: 'Mince pie', chonk: 10, bites: 2, radius: 0.04, mass: 0.08, xmas: true },
  pigblanket: { label: 'Pig in blanket', chonk: 8, bites: 1, radius: 0.03, mass: 0.04, xmas: true },
  roastie:    { label: 'Roast potato', chonk: 9, bites: 1, radius: 0.035, mass: 0.06, xmas: true },
  turkeyleg:  { label: 'Turkey leg', chonk: 16, bites: 3, radius: 0.06, mass: 0.3, xmas: true },
  pudding:    { label: 'Christmas pudding', chonk: 18, bites: 3, radius: 0.06, mass: 0.4, xmas: true },
  qstreet:    { label: 'Quality Street', chonk: 6, bites: 1, radius: 0.025, mass: 0.02, xmas: true, sweet: true },
  celebration:{ label: 'Celebrations', chonk: 6, bites: 1, radius: 0.025, mass: 0.02, xmas: true, sweet: true },
  selectbox:  { label: 'Selection box', chonk: 20, bites: 4, radius: 0.08, mass: 0.3, xmas: true, sweet: true },
  cracker:    { label: 'Christmas cracker', chonk: 0, bites: 1, radius: 0.04, mass: 0.05, prop: true, cracker: true },
  prosecco:   { label: 'Glass of Prosecco', chonk: 8, bites: 1, radius: 0.035, mass: 0.2, drink: true, booze: true },
  baileys:    { label: 'Baileys', chonk: 12, bites: 1, radius: 0.035, mass: 0.2, drink: true, booze: true },
  sherry:     { label: "Nan's sherry", chonk: 8, bites: 1, radius: 0.03, mass: 0.15, drink: true, booze: true },
};
// what lies about the house on Christmas Day
export const XMAS_SPREAD = ['mincepie', 'pigblanket', 'roastie', 'turkeyleg', 'pudding', 'qstreet', 'celebration', 'selectbox', 'sausageroll', 'choc', 'sprout', 'cracker', 'prosecco', 'baileys', 'beer'];
export const SWEETS = ['qstreet', 'celebration', 'choc', 'selectbox', 'mincepie'];      // what Nan wants when she's hangry

const QS_COLS = [0x7a2a9a, 0xd4a21a, 0xc81e2a, 0x1e8a3a, 0x1e5ac8, 0xe07a1a];
const GEO = {
  mincepie() {
    const p = [];
    p.push(part(lathe([[0, -0.018], [0.034, -0.018], [0.04, -0.008], [0.042, 0.006], [0.038, 0.012], [0, 0.012]], 18), 0xd99a4e));      // fluted case
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; p.push(part(box(0.008, 0.024, 0.006), 0xc9883e, [Math.cos(a) * 0.04, -0.004, Math.sin(a) * 0.04], [0, -a, 0])); }
    p.push(part(cyl(0.036, 0.038, 0.006, 18), 0xe8b468, [0, 0.014, 0]));      // lid
    const star = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.009 : 0.022, a = i / 10 * Math.PI * 2; i ? star.lineTo(Math.cos(a) * r, Math.sin(a) * r) : star.moveTo(r, 0); }
    const sg = new THREE.ExtrudeGeometry(star, { depth: 0.003, bevelEnabled: false }); sg.rotateX(-Math.PI / 2);
    p.push(part(sg, 0xf2cf8a, [0, 0.017, 0]));
    p.push(part(cyl(0.016, 0.016, 0.002, 10), 0x5a1e10, [0, 0.0175, 0]));      // mincemeat peeping through
    for (let i = 0; i < 14; i++) p.push(part(new THREE.IcosahedronGeometry(0.0022, 0), 0xffffff, [(rnd() - 0.5) * 0.06, 0.021, (rnd() - 0.5) * 0.06]));      // icing sugar
    return merge(p);
  },
  pigblanket() {
    const s = new THREE.CapsuleGeometry(0.012, 0.04, 4, 10); s.rotateZ(Math.PI / 2);
    const p = [part(s, 0xb0603a, [0, 0, 0])];
    for (let i = 0; i < 3; i++) p.push(part(new THREE.TorusGeometry(0.0135, 0.004, 6, 12), 0xc04a3a, [-0.016 + i * 0.016, 0, 0], [0, Math.PI / 2 + 0.3, 0]));      // bacon wrapped round
    return merge(p);
  },
  roastie() {
    const g = new THREE.IcosahedronGeometry(0.03, 1); const pa = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i); v.multiply({ x: 1.2, y: 0.8, z: 1 }); v.multiplyScalar(0.9 + Math.sin(v.x * 140 + v.z * 90) * 0.08); pa.setXYZ(i, v.x, v.y, v.z); }
    g.computeVertexNormals(); const q = part(g, 0xd89a3a);
    const c = q.attributes.color; for (let i = 0; i < c.count; i++) { v.fromBufferAttribute(q.attributes.position, i); const k = v.y > 0.008 ? 0.75 : 1; c.setXYZ(i, c.getX(i) * k, c.getY(i) * k * 0.95, c.getZ(i) * k * 0.8); }
    return merge([q]);
  },
  turkeyleg() {
    const meat = sph(0.038, 14, 10); const p = [part(meat, 0xb8763a, [0.02, 0, 0], [0, 0, 0], [1.5, 1, 1])];
    p.push(part(cyl(0.009, 0.011, 0.07, 10), 0xf0e6d2, [-0.06, 0, 0], [0, 0, Math.PI / 2]), part(sph(0.014, 8, 6), 0xf6efe2, [-0.095, 0, 0]));      // the bone
    p.push(part(sph(0.03, 10, 8), 0x9a5a28, [0.035, 0.012, 0], [0, 0, 0], [1.2, 0.6, 0.9]));      // crispy skin on top
    return merge(p);
  },
  pudding() {
    const p = [part(lathe([[0, -0.04], [0.05, -0.04], [0.058, -0.01], [0.05, 0.025], [0.03, 0.045], [0, 0.05]], 22), 0x3a1e10)];
    for (let i = 0; i < 18; i++) { const a = rnd() * 6.28, y = -0.03 + rnd() * 0.06, r = 0.05 - Math.max(0, y) * 0.5; p.push(part(sph(0.004, 5, 4), 0x1a0a06, [Math.cos(a) * r, y, Math.sin(a) * r])); }      // fruit
    p.push(part(lathe([[0, 0.052], [0.03, 0.045], [0.045, 0.03], [0.05, 0.018], [0.046, 0.016], [0.028, 0.034], [0, 0.04]], 22), 0xfff6e2));      // brandy butter / custard top
    p.push(part(box(0.03, 0.002, 0.014), 0x1e6a2a, [-0.008, 0.058, 0], [0, 0.5, 0.3]), part(box(0.03, 0.002, 0.014), 0x1e6a2a, [0.01, 0.058, 0.004], [0, -0.5, -0.3]));      // holly
    for (const [x, z] of [[0, -0.004], [0.006, 0.004], [-0.004, 0.006]]) p.push(part(sph(0.005, 6, 5), 0xd01a1a, [x, 0.062, z]));
    return merge(p);
  },
  qstreet() {      // the purple one (everyone's favourite), wrapped: a twist each end
    const col = QS_COLS[Math.floor(rnd() * QS_COLS.length)], p = [part(sph(0.016, 12, 8), col, [0, 0, 0], [0, 0, 0], [1.3, 0.8, 1])];
    for (const s of [-1, 1]) p.push(part(new THREE.ConeGeometry(0.012, 0.022, 8), col, [s * 0.028, 0, 0], [0, 0, s * Math.PI / 2]));
    return merge(p);
  },
  celebration() {
    const p = [part(box(0.05, 0.016, 0.02), [0xc81e2a, 0x1a1a1a, 0x5a2a8a, 0xd4a21a][Math.floor(rnd() * 4)])];
    p.push(part(box(0.054, 0.012, 0.016), 0xe8e8e8, [0, 0, 0], [0, 0, 0], [1, 0.5, 0.6]));      // crimped ends
    p.push(part(box(0.022, 0.0165, 0.0205), 0xf2d24a));      // the logo band
    return merge(p);
  },
  selectbox() {
    const p = [part(box(0.16, 0.025, 0.11), 0xc81e2a), part(box(0.162, 0.004, 0.112), 0xf2f2f2, [0, 0.013, 0])];
    for (let i = 0; i < 6; i++) p.push(part(box(0.04, 0.012, 0.03), [0x5a2a8a, 0x1a1a1a, 0xd4a21a, 0x1e8a3a, 0xe07a1a, 0x1e5ac8][i], [-0.05 + (i % 3) * 0.05, 0.02, -0.025 + Math.floor(i / 3) * 0.05]));
    p.push(part(box(0.06, 0.002, 0.03), 0x2a6a2a, [0.04, 0.0135, 0.035]));
    return merge(p);
  },
  cracker() {
    const col = [0xc81e2a, 0x1e7a3a, 0xd4a21a, 0x1e5ac8][Math.floor(rnd() * 4)], p = [part(cyl(0.017, 0.017, 0.12, 14), col, [0, 0, 0], [0, 0, Math.PI / 2])];
    for (const s of [-1, 1]) { p.push(part(cyl(0.012, 0.017, 0.018, 14), 0xf2d24a, [s * 0.068, 0, 0], [0, 0, Math.PI / 2]), part(cyl(0.017, 0.011, 0.03, 14), col, [s * 0.092, 0, 0], [0, 0, Math.PI / 2])); }
    p.push(part(cyl(0.0175, 0.0175, 0.04, 14), 0xf6f0e2, [0, 0, 0], [0, 0, Math.PI / 2]));      // the band
    return merge(p);
  },
  prosecco() {
    const G = 0xd8ecf2, p = [part(cyl(0.028, 0.03, 0.004, 16), G, [0, -0.09, 0]), part(cyl(0.004, 0.004, 0.07, 8), G, [0, -0.055, 0])];
    p.push(part(lathe([[0.004, -0.02], [0.016, -0.01], [0.022, 0.03], [0.024, 0.07]], 16), G));
    p.push(part(lathe([[0, -0.016], [0.015, -0.008], [0.02, 0.03], [0.021, 0.05], [0, 0.05]], 16), 0xf2e08a));
    return merge(p);
  },
  baileys() {
    const p = [part(lathe([[0, -0.04], [0.032, -0.04], [0.034, 0.03], [0.036, 0.035]], 16), 0xd8ecf2)];
    p.push(part(lathe([[0, -0.036], [0.03, -0.036], [0.031, 0.015], [0, 0.015]], 16), 0xd8b48a));
    for (let i = 0; i < 3; i++) p.push(part(box(0.018, 0.018, 0.018), 0xeef8ff, [(i - 1) * 0.014, 0.012, (i % 2) * 0.01], [0.3 * i, 0.5, 0]));      // ice
    return merge(p);
  },
  sherry() {
    const G = 0xd8ecf2, p = [part(cyl(0.022, 0.024, 0.004, 14), G, [0, -0.06, 0]), part(cyl(0.004, 0.004, 0.04, 8), G, [0, -0.04, 0])];
    p.push(part(lathe([[0.004, -0.02], [0.02, -0.005], [0.024, 0.02], [0.022, 0.04]], 14), G), part(lathe([[0, -0.016], [0.019, -0.004], [0.022, 0.02], [0, 0.02]], 14), 0x8a3a12));
    return merge(p);
  },
};

let done = false;
export function addChristmasFood() {
  if (done) return; done = true;
  Object.assign(FOODS, XFOODS);
  for (const [k, fn] of Object.entries(GEO)) EXTRA_GEO[k] = fn;
}
