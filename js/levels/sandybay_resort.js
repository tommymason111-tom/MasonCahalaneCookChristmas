// Sandy Bay, the resort round Nan's home: the grounds and streets, the entrance off Thorney Bay Road (barrier, the
// turquoise SANDY BAY sign, Thorney Bay Reception, the Sales Office & Car Wash), the CLUBHOUSE (slate roof, mock-Tudor
// front gable, the brick-pier terrace) and its HEATED POOL, the white SEA WALL with the promenade, the stepped
// revetment, the beach and the estuary, the drainage creek with its reeds and little bridges, lamp posts, street
// names, and row after row of neighbours' park homes (instanced).
import * as THREE from 'three';
import { part, sph, cyl } from '../geo.js';
import { bulb, lightString, MULTI, WARM, xmasTree, reindeer, shade } from './sandybay_props.js';
import { waterMaterial } from './outdoor.js';
import * as TX from './sandybay_tex.js';
import { FL, EAVE, C, Bag, roofGeo, roofTrim, porchRoof, bagWindow, homePoint, MODELS } from './sandybay_estate.js';

// ---- the layout (x along Nan's street, +z toward the road in front of her home)
export const L = {
  ROAD: { z0: 7.0, z1: 12.5, x0: -46, x1: 46 },
  GATE_X: -27, SEA_X: 48.0, SEA_T: 0.8, PROM: 4.0,
  BOUNDS: { x0: -27, x1: 52.7, z0: -9.5, z1: 15.3 },
  CLUB: { x0: 22.4, x1: 46.0, z0: -9.5, z1: 6.2 },            // the pool garden (the clubhouse behind it)
  POOL: { x0: 29.0, x1: 41.0, z0: -3.0, z1: 3.0 },
  N1Z: 19.25,                                                   // across the road: the homes' middle line
};
const WHITE = 0xf5f5f3, ANTH = 0x2b2d30, BLACK = 0x1c1d1f, TURQ = 0x5ec8c8, SLATE = 0x4a4e55;

export function buildResort(k, scene, W, rnd) {
  const R = (x0, z0, x1, z1, h, y, color, opts) => k.box(Math.abs(x1 - x0), h, Math.abs(z1 - z0), (x0 + x1) / 2, y ?? h / 2, (z0 + z1) / 2, color, opts);
  const T = (key, x0, z0, x1, z1, h, y, tile) => W.tbox(key, x1 - x0, h, z1 - z0, (x0 + x1) / 2, y, (z0 + z1) / 2, tile);
  const flat = (key, x0, z0, x1, z1, y = 0.006, tile = 1) => T(key, x0, z0, x1, z1, 0.012, y, tile);
  const B = L.BOUNDS, RD = L.ROAD;
  const homes = [];

  // ================================================= roads, kerbs, paths
  flat('tarmac', RD.x0 - 8, RD.z0, RD.x1, RD.z1, 0.008, 4);                                    // Nan's street (Shore Drive)
  flat('tarmac', 40.0, 5.6, 46.6, 14.0, 0.009, 4);                                             // the turning head by the sea wall
  flat('tarmac', 5.21, RD.z1, 11.21, 70, 0.0085, 4);                                           // Seafarer Drive, off to the north
  flat('tarmac', -31.5, -30.1, 46, -24.6, 0.008, 4); flat('tarmac', -31.5, 38.4, 46, 43.9, 0.008, 4);   // the next streets (Coastal Drive, Clearwater Drive)
  flat('tarmac', -38.0, -90, -31.5, 90, 0.0075, 4);                                            // Thorney Bay Road
  const kerb = (x0, z0, x1, z1) => R(x0, z0, x1, z1, 0.1, 0.05, C.KERB);
  kerb(RD.x0 - 8, RD.z0 - 0.15, 40, RD.z0); kerb(RD.x0 - 8, RD.z1, 5.21, RD.z1 + 0.15); kerb(11.21, RD.z1, 40, RD.z1 + 0.15);
  kerb(5.06, RD.z1, 5.21, 70); kerb(11.21, RD.z1, 11.36, 70);
  for (const z of [-30.25, -24.6, 38.25, 43.9]) kerb(-31.5, z, 46, z + 0.15);
  kerb(40, 5.45, 46.6, 5.6); kerb(40, 14.0, 46.6, 14.15);
  // the road markings: SLOW, 5 MPH, a give-way at Seafarer Drive, a speed table
  for (const [x, t] of [[-20, 'SLOW'], [30, '5']]) k.label(t, t === '5' ? 1.2 : 2.6, 1.0, [x, 0.02, (RD.z0 + RD.z1) / 2 + 1.2], [-Math.PI / 2, 0, Math.PI / 2], { bg: '#3e3f41', fg: '#f4f4ee', border: null, size: 130 });
  for (let x = 5.6; x < 10.9; x += 0.6) R(x, RD.z1 + 0.25, x + 0.35, RD.z1 + 0.4, 0.004, 0.016, 0xf4f4ee);
  R(-8.0, RD.z0, -6.8, RD.z1, 0.07, 0.035, 0x56585a); for (let z = RD.z0 + 0.4; z < RD.z1; z += 0.9) R(-7.7, z, -7.1, z + 0.35, 0.005, 0.073, 0xf4f4ee);   // speed table

  // ================================================= the entrance (Thorney Bay Road end)
  { const gx = L.GATE_X - 0.6;
    // the barrier: a post, the white arm with red bands across the way in, the control box
    k.box(0.35, 1.05, 0.35, gx, 0.52, RD.z1 + 0.4, 0xe8e8e4, { block: true }); k.box(0.3, 0.3, 0.25, gx, 1.15, RD.z1 + 0.4, 0xe8e8e4);
    for (let i = 0; i < 9; i++) k.box(0.1, 0.1, 0.6, gx, 0.98, RD.z1 + 0.05 - i * 0.6 - 0.3, i % 2 ? 0xc8102e : 0xf8f8f8);
    k.box(0.6, 1.2, 0.5, gx - 0.6, 0.6, RD.z0 - 0.7, 0x4a4e55, { block: true }); k.box(0.3, 0.2, 0.05, gx - 0.6, 1.0, RD.z0 - 0.44, 0x2a8a4a);
    // the SANDY BAY sign: a turquoise panel (white shell, the wordmark) between two white rendered piers, both faces
    const sx = gx - 1.2, sz = RD.z1 + 3.6, logo = TX.logoTex({ sub: 'THORNEY BAY ROAD · CANVEY ISLAND' });
    R(sx - 0.35, sz - 1.9, sx + 0.35, sz - 1.4, 1.9, 0.95, 0xf2f1ec); R(sx - 0.35, sz + 1.4, sx + 0.35, sz + 1.9, 1.9, 0.95, 0xf2f1ec);
    for (const z of [sz - 1.65, sz + 1.65]) R(sx - 0.4, z - 0.3, sx + 0.4, z + 0.3, 0.06, 1.93, 0xe0ded8);
    R(sx - 0.12, sz - 1.4, sx + 0.12, sz + 1.4, 1.5, 1.05, TURQ); R(sx - 0.3, sz - 1.4, sx + 0.3, sz + 1.4, 0.3, 0.15, 0x8a8c88);
    for (const d of [-1, 1]) k.label('logo', 2.7, 1.45, [sx + d * 0.125, 1.08, sz], [0, d * Math.PI / 2, 0], { tex: logo });
    for (const d of [-1, 1]) for (let i = 0; i < 7; i++) k.box(0.3, 0.25, 0.3, sx + d * 0.0, 0.12, sz - 1.2 + i * 0.4, 0x3a6a2a);    // little box hedges at its feet
    // the fence line either side of the way in (dark railings on a low wall)
    for (const [z0, z1] of [[B.z0, RD.z0 - 1.0], [RD.z1 + 1.0, sz - 2.0]]) { R(gx - 0.1, z0, gx + 0.1, z1, 0.4, 0.2, 0xe6e4de, { block: true }); R(gx - 0.03, z0, gx + 0.03, z1, 0.04, 1.3, BLACK, { block: true }); for (let z = z0; z < z1; z += 0.15) k.box(0.02, 0.9, 0.02, gx, 0.85, z, BLACK); }
    k.blockers.push({ x0: gx - 0.2, x1: gx + 0.2, z0: RD.z0 - 1.0, z1: RD.z1 + 1.0, y1: 1.2 });       // (the barrier's down: nobody wanders out on to Thorney Bay Road)
    // a turquoise "Welcome" panel on the inside, and the park rules in slate grey
    k.label('welcome', 1.6, 0.55, [gx + 0.9, 1.4, RD.z0 - 1.0], [0, Math.PI / 2, 0], { tex: TX.parkSignTex(['Welcome to Sandy Bay', 'RESIDENTS & GUESTS ONLY · 5 MPH · DOGS ON LEADS'], { bg: '#4a4e55' }) });
    for (const z of [RD.z0 - 1.25, RD.z0 - 0.75]) k.box(0.06, 1.15, 0.06, gx + 0.88, 0.58, z, BLACK);
    k.label("SANDY BAY CHRISTMAS: 'NO VISITORS' PARKING AFTER 2PM. JOAN'S FAMILY, PARK AT THE CLUBHOUSE.", 1.1, 0.4, [gx + 0.9, 0.85, RD.z0 - 1.0], [0, Math.PI / 2, 0], { bg: '#ffffff', fg: '#4a4e55', border: '#5ec8c8', size: 36 });
  }
  // ---- Thorney Bay Reception (Nan's side, by the gate)
  { const x0 = -24.0, x1 = -16.5, z0 = -4.5, z1 = 2.0, ev = 3.0, b = new Bag();
    R(x0, z0, x1, z1, ev, ev / 2, 0xeeeeea, { block: true });
    W.sbox(x1 - x0 + 0.02, ev - 0.4, z1 - z0 + 0.02, (x0 + x1) / 2, 0.4 + (ev - 0.4) / 2, (z0 + z1) / 2, 'sidW');
    R(x0 - 0.02, z0 - 0.02, x1 + 0.02, z1 + 0.02, 0.4, 0.2, 0x8a8c8e);
    const r = roofGeo(W, 'roof', x0, x1, z0, z1, { eave: ev, slope: 0.42, hipL: true, hipR: true }); roofTrim(b, r);
    k.parts.push(...b.trim);
    // big anthracite-framed glazing + glass doors on the front, a turquoise fascia sign
    for (const [a, w] of [[-22.3, 2.4], [-18.3, 2.2]]) bagWindow({ box: (w2, h, d, x, y, z, col) => k.box(w2, h, d, x, y, z, col) }, 'x', z1, a, 1.55, w, 1.6, 1, { frame: ANTH, panes: 3, transom: false });
    k.box(1.6, 2.2, 0.05, -20.3, 1.1, z1 + 0.02, C.GLASS); k.box(1.75, 0.08, 0.08, -20.3, 2.22, z1 + 0.04, ANTH); for (const s of [-1, 0, 1]) k.box(0.06, 2.2, 0.08, -20.3 + s * 0.8, 1.1, z1 + 0.04, ANTH);
    k.label('reception', 3.6, 0.6, [-20.3, 2.75, z1 + 0.08], [0, 0, 0], { tex: TX.parkSignTex(['Thorney Bay Reception', 'SANDY BAY · OPEN 9-5 · CLOSED CHRISTMAS DAY'], { bg: '#5ec8c8', shellCol: '#ffffff' }) });
    lightString(k, [[r.xa + 0.2, r.ye - 0.15, r.zb + 0.08], [r.xb - 0.2, r.ye - 0.15, r.zb + 0.08]], { spacing: 0.3, sag: 0.08, colors: WARM, halo: 0.07, wire: null });
    xmasTree(k, -16.9, 3.4, { h: 2.6, R: 0.85, rnd });
    flat('paving', -26.6, 2.0, -15.5, RD.z0 - 0.15, 0.012, 1);                                   // the car park
    for (let x = -26.0; x < -16; x += 2.5) R(x - 0.05, 2.6, x + 0.05, RD.z0 - 0.8, 0.004, 0.02, 0xf4f4ee);
  }
  // ---- across the road: the Sales Office & Car Wash
  { const x0 = -25.5, x1 = -19.0, z0 = 16.4, z1 = 22.0, ev = 3.0;
    R(x0, z0, x1, z1, ev, ev / 2, 0xeeeeea, { block: true }); W.sbox(x1 - x0 + 0.02, ev - 0.4, z1 - z0 + 0.02, (x0 + x1) / 2, 0.4 + (ev - 0.4) / 2, (z0 + z1) / 2, 'sidG');
    const b = new Bag(), r = roofGeo(W, 'roof', x0, x1, z0, z1, { eave: ev, slope: 0.42 }); roofTrim(b, r); k.parts.push(...b.trim);
    k.box(4.0, 1.7, 0.05, -22.25, 1.45, z0 - 0.02, C.GLASS); for (let i = 0; i <= 4; i++) k.box(0.06, 1.8, 0.08, -24.25 + i, 1.45, z0 - 0.04, ANTH);
    k.label('sales', 4.4, 0.55, [-22.25, 2.68, z0 - 0.08], [0, Math.PI, 0], { tex: TX.parkSignTex(['Sales Office & Car Wash', 'NEW HOMES FROM THE SONATA TO THE RESIDENCE · ASK INSIDE'], { bg: '#4a4e55' }) });
    // the car wash: a canopy on slim posts over a bay, a jet-wash unit, a hose
    const cx0 = -18.0, cx1 = -12.5, cz0 = 16.2, cz1 = 21.5;
    for (const x of [cx0, cx1]) for (const z of [cz0, cz1]) k.box(0.12, 3.0, 0.12, x, 1.5, z, 0x9aa0a6);
    R(cx0 - 0.2, cz0 - 0.2, cx1 + 0.2, cz1 + 0.2, 0.25, 3.1, 0xe8e8e4); R(cx0 - 0.22, cz0 - 0.22, cx1 + 0.22, cz0 - 0.18, 0.3, 3.1, TURQ);
    k.label('carwash', 3.0, 0.28, [(cx0 + cx1) / 2, 3.1, cz0 - 0.235], [0, Math.PI, 0], { bg: '#5ec8c8', fg: '#ffffff', border: null, size: 70 });
    flat('paving', cx0, cz0, cx1, cz1, 0.012, 1); k.box(0.6, 1.4, 0.4, cx1 - 0.5, 0.7, cz1 - 0.5, 0x2a4a7a);
  }

  // ================================================= the CLUBHOUSE and its heated pool
  { const CL = L.CLUB, P = L.POOL, X0 = 23.0, X1 = 46.0, Z0 = -17.5, Z1 = -8.6, ev = 3.2, BRK = 0xa8573a;
    // the building: render over a brick plinth, big anthracite windows, a slate roof with flush skylights
    R(X0, Z0, X1, Z1, ev, ev / 2, 0xf0eee8, { block: true });
    T('render', X0 - 0.02, Z0 - 0.02, X1 + 0.02, Z1 + 0.02, ev - 0.55, 0.55 + (ev - 0.55) / 2, 2);
    T('brick', X0 - 0.04, Z0 - 0.04, X1 + 0.04, Z1 + 0.04, 0.55, 0.275, 1);
    const b = new Bag(), r = roofGeo(W, 'slate', X0, X1, Z0, Z1, { eave: ev, slope: 0.62, ov: 0.4, hipL: true, hipR: true }); roofTrim(b, r, { fascia: 0xf2f2ee, ridge: 0x3a3b3e }); k.parts.push(...b.trim);
    for (let x = X0 + 3; x < X1 - 2; x += 3.2) { const z = Z1 - 1.6, y = ev + (Z1 + 0.4 - z) * 0.0 + 1.0; void y;
      const g = new THREE.BoxGeometry(1.0, 0.03, 1.3); g.rotateX(Math.atan(0.62)); k.parts.push(part(g, 0x2a3440, [x, ev + 0.62 * 1.95 + 0.02, Z1 - 1.55])); }          // the skylights, flush in the slates
    for (let x = X0 + 1.5; x < X1 - 1; x += 2.6) { if (x > 31.0 && x < 38.0) continue; k.box(1.8, 1.7, 0.05, x, 1.65, Z1 + 0.03, C.GLASS); k.box(1.8, 0.8, 0.051, x, 2.1, Z1 + 0.03, C.GLASS2); for (const s of [-1, 0, 1]) k.box(0.06, 1.8, 0.08, x + s * 0.9, 1.65, Z1 + 0.05, ANTH); k.box(1.9, 0.07, 0.09, x, 2.52, Z1 + 0.05, ANTH); k.box(1.9, 0.07, 0.09, x, 0.78, Z1 + 0.05, ANTH); }
    // the front gable (projecting, mock-Tudor timbering in it), the entrance doors, the sign
    const gx0 = 31.4, gx1 = 37.6, gz = Z1 + 1.6, gm = (gx0 + gx1) / 2, rise = (gx1 - gx0) / 2 * 0.75;
    R(gx0, Z1, gx1, gz, ev, ev / 2, 0xf4f2ec, { block: true }); T('brick', gx0 - 0.03, Z1, gx1 + 0.03, gz + 0.03, 0.55, 0.275, 1);
    porchRoof(W, gm, Z1 - 2.6, gz + 0.3, gx1 - gx0 + 0.3, ev, 0.75, { key: 'slate', sidKey: 'renderTri' });
    const tb = W.trim; k.parts.push(...tb.splice(0, tb.length));
    { const zf = gz + 0.33, y0 = ev, w = gx1 - gx0 + 0.3;          // black and white timbering on the gable face
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([gm - w / 2, y0, zf, gm + w / 2, y0, zf, gm, y0 + rise * 1.05, zf], 3)); g.computeVertexNormals(); k.parts.push(part(g, 0xfaf8f2));
      for (let i = -3; i <= 3; i++) { const x = gm + i * 0.48, top = y0 + rise * 1.05 * (1 - Math.abs(i * 0.48) / (w / 2)); if (top - y0 > 0.1) k.box(0.12, top - y0, 0.04, x, (y0 + top) / 2, zf + 0.02, 0x1a1a1a); }
      k.box(w - 0.1, 0.16, 0.05, gm, y0 + 0.08, zf + 0.025, 0x1a1a1a);
      for (const s of [-1, 1]) { const g2 = new THREE.BoxGeometry(0.12, Math.hypot(w / 2, rise) * 0.62, 0.04); g2.rotateZ(s * 0.95); k.parts.push(part(g2, 0x1a1a1a, [gm + s * w * 0.2, y0 + rise * 0.36, zf + 0.03])); }
      for (const s of [-1, 1]) { const len = Math.hypot(w / 2, rise * 1.05); k.box(len + 0.2, 0.24, 0.06, gm + s * w / 4, y0 + rise * 0.53, zf + 0.04, 0xf4f4f0, { rot: [0, 0, -s * Math.atan2(rise * 1.05, w / 2)] }); }
      // the doors, the timber band on the front of the gable
      k.box(2.2, 2.3, 0.05, gm, 1.15, gz + 0.03, C.GLASS); for (const s of [-1, 0, 1]) k.box(0.08, 2.3, 0.08, gm + s * 1.1, 1.15, gz + 0.05, ANTH); k.box(2.3, 0.08, 0.08, gm, 2.32, gz + 0.05, ANTH);
      for (const s of [-1, 1]) { k.box(1.0, 1.4, 0.05, gm + s * 2.15, 1.6, gz + 0.03, C.GLASS); k.box(1.1, 0.07, 0.08, gm + s * 2.15, 2.33, gz + 0.05, ANTH); k.box(1.1, 0.07, 0.08, gm + s * 2.15, 0.88, gz + 0.05, ANTH); }
      k.box(gx1 - gx0, 0.2, 0.06, gm, 2.75, gz + 0.04, 0x1a1a1a); for (let x = gx0 + 0.3; x < gx1; x += 0.6) k.box(0.1, 0.36, 0.05, x, 2.95, gz + 0.04, 0x1a1a1a);
      k.label('club', 3.8, 0.75, [gm, 3.9, zf + 0.09], [0, 0, 0], { tex: TX.logoTex({ w: 1024, h: 420, line: 'The Clubhouse' }) });
      lightString(k, [[gm - w / 2 + 0.1, y0 + 0.05, zf + 0.1], [gm, y0 + rise * 1.05, zf + 0.1], [gm + w / 2 - 0.1, y0 + 0.05, zf + 0.1]], { spacing: 0.25, sag: 0, colors: WARM, halo: 0.07, wire: null });
    }
    lightString(k, [[r.xa + 0.3, r.ye - 0.15, r.zb + 0.1], [gx0 - 0.3, r.ye - 0.15, r.zb + 0.1]], { spacing: 0.35, sag: 0.1, colors: MULTI, halo: 0.07, wire: null });
    lightString(k, [[gx1 + 0.3, r.ye - 0.15, r.zb + 0.1], [r.xb - 0.3, r.ye - 0.15, r.zb + 0.1]], { spacing: 0.35, sag: 0.1, colors: MULTI, halo: 0.07, wire: null, offset: 2 });
    // the terrace in front of it (paving), the brick piers with planters and dark railings between
    flat('slab', X0, Z1, X1, -6.4, 0.013, 1.2);
    const piers = (x0, x1, z, gap = null, h = 1.0) => {
      for (let x = x0; x <= x1 + 0.01; x += 2.6) { if (gap && x > gap[0] && x < gap[1]) continue;
        T('brick', x - 0.22, z - 0.22, x + 0.22, z + 0.22, h, h / 2, 1); k.blockers.push({ x0: x - 0.22, x1: x + 0.22, z0: z - 0.22, z1: z + 0.22, y1: h + 0.4 });
        k.box(0.5, 0.06, 0.5, x, h + 0.03, z, 0xdedad0); k.box(0.42, 0.24, 0.42, x, h + 0.18, z, 0x2e2f31); k.parts.push(part(new THREE.IcosahedronGeometry(0.2, 1), 0x3e6a2a, [x, h + 0.38, z], [0, 0, 0], [1.1, 0.7, 1.1]));
        for (let i = 0; i < 4; i++) k.parts.push(part(sph(0.04, 6, 4), [0xc8102e, 0xf4f4f4, 0xc8102e, 0xffd84a][i], [x + Math.cos(i * 1.6) * 0.14, h + 0.45, z + Math.sin(i * 1.6) * 0.14]));    // winter pansies / cyclamen
        const nx = x + 2.6; if (nx <= x1 + 0.01 && !(gap && nx > gap[0] && nx < gap[1])) { k.box(2.16, 0.04, 0.04, x + 1.3, 0.95, z, BLACK); k.box(2.16, 0.04, 0.04, x + 1.3, 0.15, z, BLACK); for (let t = 0.12; t < 2.1; t += 0.13) k.box(0.02, 0.8, 0.02, x + 0.22 + t, 0.55, z, BLACK); k.blockers.push({ x0: x, x1: nx, z0: z - 0.05, z1: z + 0.05, y1: 1.0 }); }
      } };
    piers(X0 + 0.4, X1 - 0.4, -6.4, [32.0, 36.5]);
    piers(CL.x0 + 0.4, CL.x1 - 0.4, CL.z1, [24.5, 27.5]);             // along the street (the gate gap near the green)
    // the side railings (the green on one side, the sea wall's path on the other), on a low hedge
    for (const x of [CL.x0, CL.x1]) { T('hedge', x - 0.3, CL.z0, x + 0.3, CL.z1 - 0.3, 0.9, 0.45, 1); k.blockers.push({ x0: x - 0.3, x1: x + 0.3, z0: CL.z0, z1: CL.z1 - 0.3, y1: 0.9 }); }
    // artificial turf all round the pool, the pool (white coping, turquoise water, steps, a chrome ladder)
    { const c0 = P.x0 - 0.35, c1 = P.x1 + 0.35, d0 = P.z0 - 0.35, d1 = P.z1 + 0.35;
      flat('turf', CL.x0 + 0.3, -6.4, CL.x1 - 0.3, d0, 0.012, 2); flat('turf', CL.x0 + 0.3, d1, CL.x1 - 0.3, CL.z1 - 0.25, 0.012, 2);
      flat('turf', CL.x0 + 0.3, d0, c0, d1, 0.012, 2); flat('turf', c1, d0, CL.x1 - 0.3, d1, 0.012, 2);
      T('coping', c0, d0, c1, P.z0, 0.07, 0.035, 1); T('coping', c0, P.z1, c1, d1, 0.07, 0.035, 1); T('coping', c0, P.z0, P.x0, P.z1, 0.07, 0.035, 1); T('coping', P.x1, P.z0, c1, P.z1, 0.07, 0.035, 1); }
    { const g = new THREE.PlaneGeometry(P.x1 - P.x0, P.z1 - P.z0); g.rotateX(-Math.PI / 2); g.translate((P.x0 + P.x1) / 2, 0.03, (P.z0 + P.z1) / 2); metreUV2(g, 3); W.geo('pool', g); }
    k.box(P.x1 - P.x0, 0.012, 0.15, (P.x0 + P.x1) / 2, 0.026, (P.z0 + P.z1) / 2, 0x2a6a9a);          // a lane line on the bottom, seen through
    for (let i = 0; i < 3; i++) k.box(1.6, 0.02, 0.28, P.x0 + 1.2, 0.025, P.z0 + 0.3 + i * 0.3, 0x7ac8e8);
    for (const s of [-1, 1]) { k.box(0.04, 0.9, 0.04, P.x1 - 1.0 + s * 0.25, 0.45, P.z1 + 0.15, 0xd8dde0); k.box(0.04, 0.04, 0.3, P.x1 - 1.0 + s * 0.25, 0.9, P.z1 + 0.02, 0xd8dde0); }
    k.blockers.push({ x0: P.x0 - 0.3, x1: P.x1 + 0.3, z0: P.z0 - 0.3, z1: P.z1 + 0.3, y1: 0.6 });
    k.label('HEATED POOL · CLOSED FOR WINTER · OPENS MAY. (JOAN: NO, NOT EVEN FOR A DARE.)', 1.6, 0.4, [P.x0 - 0.9, 1.2, (P.z0 + P.z1) / 2], [0, -Math.PI / 2, 0], { bg: '#ffffff', fg: '#4a4e55', border: '#5ec8c8', size: 38 });
    k.box(0.06, 1.3, 0.06, P.x0 - 0.88, 0.65, (P.z0 + P.z1) / 2 + 0.6, BLACK); k.box(0.06, 1.3, 0.06, P.x0 - 0.88, 0.65, (P.z0 + P.z1) / 2 - 0.6, BLACK);
    // rows of charcoal rattan sun loungers with grey cushions, closed parasols between
    const lounger = (x, z, ry) => { const c = Math.cos(ry), s = Math.sin(ry), at = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
      const P2 = (w, h, d, lx, y, lz, col, rx = 0) => { const [px, pz] = at(lx, lz); k.box(w, h, d, px, y, pz, col, { rot: [rx, ry, 0] }); };
      P2(0.7, 0.14, 1.95, 0, 0.3, 0, 0x2f2d2c); P2(0.62, 0.07, 1.3, 0, 0.4, 0.3, 0xb8b8b4); P2(0.62, 0.07, 0.65, 0, 0.62, -0.72, 0xb8b8b4, -0.75); P2(0.7, 0.1, 0.7, 0, 0.55, -0.8, 0x2f2d2c, -0.75);
      for (const a of [-0.3, 0.3]) for (const b2 of [-0.85, 0.85]) P2(0.06, 0.24, 0.06, a, 0.12, b2, 0x252423);
      const hx = Math.abs(c) * 0.36 + Math.abs(s) * 1.0, hz = Math.abs(s) * 0.36 + Math.abs(c) * 1.0; k.blockers.push({ x0: x - hx, x1: x + hx, z0: z - hz, z1: z + hz, y1: 0.7 }); };
    const parasol = (x, z, col) => { k.cyl(0.25, 0.3, 0.12, x, 0.06, z, 0x2a2a2a, 10); k.cyl(0.025, 0.025, 2.4, x, 1.2, z, 0x3a3a3a, 6); k.parts.push(part(new THREE.CylinderGeometry(0.11, 0.05, 1.4, 8), col, [x, 1.75, z])); k.cyl(0.02, 0.02, 0.15, x, 2.5, z, 0x3a3a3a, 5); k.blockers.push({ x0: x - 0.25, x1: x + 0.25, z0: z - 0.25, z1: z + 0.25, y1: 2.4 }); };
    for (let x = 29.4; x < 41; x += 1.5) lounger(x, 4.75, Math.PI);
    for (let x = 29.4; x < 41; x += 1.5) lounger(x, -4.55, 0);
    for (const x of [28.6, 32.1, 35.1, 38.1, 41.6]) { parasol(x, 4.75, x > 35 ? 0x23304a : 0x2c2d30); parasol(x + 0.1, -4.55, x > 35 ? 0x2c2d30 : 0x23304a); }
    // a Christmas tree on the terrace, outdoor heaters, a bench or two
    xmasTree(k, 26.5, -7.4, { h: 3.0, R: 1.0, rnd });
    for (const x of [30.2, 39.4]) { k.cyl(0.25, 0.28, 0.08, x, 0.04, -7.3, 0x5a5c5e, 10); k.cyl(0.05, 0.05, 2.1, x, 1.05, -7.3, 0x5a5c5e, 6); k.cyl(0.45, 0.2, 0.25, x, 2.2, -7.3, 0x6a6c6e, 12); k.blockers.push({ x0: x - 0.3, x1: x + 0.3, z0: -7.6, z1: -7.0, y1: 2.3 }); }
  }

  // ================================================= the SEA WALL, the promenade, the beach and the estuary
  { const X = L.SEA_X, T2 = L.SEA_T, H = 2.8, gz0 = 8.2, gz1 = 11.4, PX0 = X + T2, PX1 = PX0 + L.PROM;
    for (const [z0, z1] of [[-90, gz0], [gz1, 90]]) { T('render', X, z0, X + T2, z1, H, H / 2, 2); k.blockers.push({ x0: X, x1: X + T2, z0: Math.max(z0, B.z0 - 1), z1: Math.min(z1, B.z1 + 1), y1: H }); }
    for (const [z0, z1] of [[-90, gz0], [gz1, 90]]) R(X - 0.05, z0, X + T2 + 0.05, z1, 0.08, H + 0.04, 0xe6e6e2);   // the coping on top
    for (let z = -88; z < 90; z += 6) if (z < gz0 - 0.2 || z > gz1 + 0.2) k.box(0.01, H - 0.1, 0.02, X + T2 + 0.006, H / 2, z, 0xd8d8d4);   // the panel joints
    // the flood gate (open, swung back against the wall), the opening's steel frame
    k.box(0.15, H, 0.25, X + T2 / 2, H / 2, gz0 - 0.1, 0x7a8288); k.box(0.15, H, 0.25, X + T2 / 2, H / 2, gz1 + 0.1, 0x7a8288);
    k.box(0.2, 2.2, 3.2, X - 0.15, 1.1, gz0 - 1.7, 0x6a747a, { block: true }); for (let i = 0; i < 4; i++) k.box(0.22, 0.08, 3.1, X - 0.15, 0.3 + i * 0.6, gz0 - 1.7, 0x58626a);
    k.label('FLOOD GATE 7 · KEEP CLEAR · CANVEY SEA DEFENCES', 1.4, 0.3, [X - 0.26, 1.7, gz0 - 1.7], [0, -Math.PI / 2, 0], { bg: '#ffd84a', fg: '#111111', border: '#111111', size: 40 });
    // the promenade (pale paving) along the foot of the wall, benches, terracotta pots with clipped bay trees
    flat('slab', PX0, -90, PX1, 90, 0.012, 1.2); flat('slab', X - 1.5, gz0, PX0, gz1, 0.013, 1.2);
    for (let z = -60; z < 60; z += 7.5) {
      if (Math.abs(z - (gz0 + gz1) / 2) < 3) continue;
      const pot = (zz) => { k.cyl(0.32, 0.24, 0.55, PX0 + 0.45, 0.275, zz, 0xb5653a, 12); k.cyl(0.34, 0.34, 0.05, PX0 + 0.45, 0.55, zz, 0xc27245, 12); k.cyl(0.03, 0.03, 0.8, PX0 + 0.45, 0.9, zz, 0x5a4030, 5); k.parts.push(part(new THREE.IcosahedronGeometry(0.42, 1), 0x2f5a26, [PX0 + 0.45, 1.55, zz])); k.blockers.push({ x0: PX0 + 0.13, x1: PX0 + 0.77, z0: zz - 0.32, z1: zz + 0.32, y1: 1.9 }); };
      pot(z - 1.4); pot(z + 1.4);
      // a dark bench (anthracite frame, dark slats) between the pots, facing the sea
      const bz = z; for (const s of [-1, 1]) k.box(0.5, 0.45, 0.06, PX0 + 0.5, 0.23, bz + s * 0.8, 0x1e1f21);
      for (let i = 0; i < 4; i++) k.box(0.1, 0.03, 1.7, PX0 + 0.3 + i * 0.12, 0.46, bz, 0x2e2f31); for (let i = 0; i < 3; i++) k.box(0.03, 0.09, 1.7, PX0 + 0.18, 0.62 + i * 0.12, bz, 0x2e2f31, { rot: [0, 0, 0.15] });
      k.seats.push({ x: PX0 + 0.55, z: bz - 0.4, yaw: Math.PI / 2, h: 0.47 }, { x: PX0 + 0.55, z: bz + 0.4, yaw: Math.PI / 2, h: 0.47 });
      k.blockers.push({ x0: PX0 + 0.12, x1: PX0 + 0.78, z0: bz - 0.85, z1: bz + 0.85, y1: 0.9 });
    }
    // the railing at the top of the revetment
    R(PX1 - 0.03, -90, PX1 + 0.03, 90, 0.05, 1.05, 0x5a6066); R(PX1 - 0.02, -90, PX1 + 0.02, 90, 0.03, 0.55, 0x5a6066);
    for (let z = -88; z < 90; z += 2.0) k.box(0.05, 1.05, 0.05, PX1, 0.53, z, 0x5a6066);
    for (let z = -60; z < 60; z += 15) { k.box(0.6, 0.14, 0.04, PX1 + 0.04, 0.8, z, 0xffffff); }
    // the stepped revetment (buff concrete) down to the golden sand, the sand, the estuary out to the sky
    const steps = 6, dy = 1.7 / steps, dx = 0.6;
    for (let i = 0; i < steps; i++) { const y1 = -i * dy, x0 = PX1 + 0.05 + i * dx; R(x0, -90, x0 + dx, 90, 0.6, y1 - 0.3, i % 2 ? 0xc9b48e : 0xd2bf9a); }
    { const x0 = PX1 + 0.05 + steps * dx, g = new THREE.PlaneGeometry(26, 180, 1, 1); g.rotateX(-Math.PI / 2); g.translate(x0 + 13, 0, 0);
      const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, -1.62 - (p.getX(i) - x0) * 0.016); g.computeVertexNormals(); metreUV2(g, 3); W.geo('sand', g); }
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), waterMaterial({ deep: 0x5b6a7c, shallow: 0x8a98a8, flow: 0.03, scale: 0.35, sun: [-0.5, 0.35, 0.75] }));
    sea.rotation.x = -Math.PI / 2; sea.position.set(PX1 + 12 + 210, -1.8, 0); scene.add(sea);
    // groynes (dark timber) running out into the water, and a ship far off down the Thames
    for (const z of [-40, -10, 22, 52]) R(PX1 + 4, z - 0.2, PX1 + 30, z + 0.2, 0.7, -1.4, 0x4a3a2a);
    { const x = 118, z = -48, s = 1.0; R(x - 22 * s, z - 3 * s, x + 22 * s, z + 3 * s, 5 * s, 1 * s, 0x2a2e36); R(x - 22 * s, z - 3.05 * s, x + 22 * s, z + 3.05 * s, 1.2 * s, -0.2 * s, 0x8a2a24);
      for (let i = 0; i < 6; i++) R(x - 16 * s + i * 4.6 * s, z - 2.6 * s, x - 12.4 * s + i * 4.6 * s, z + 2.6 * s, 3 * s, 5 * s, [0xb0402a, 0x2a5a8a, 0xc8a030, 0x3a7a4a, 0xb0402a, 0x6a6a6a][i]);
      R(x + 15 * s, z - 2.8 * s, x + 21 * s, z + 2.8 * s, 6 * s, 6 * s, 0xf0f0ec); }
    // Southend's pier and the Kent shore: a long low line across the horizon
    R(110, -95, 113, 95, 0.8, 1.2, 0x8a94a0);
  }

  // ================================================= outside the park: Thorney Bay Road's verges, trees, Canvey's houses
  { const tree = (x, z, s = 1) => { k.cyl(0.12 * s, 0.18 * s, 2.6 * s, x, 1.3 * s, z, 0x6a5a4a, 6); k.parts.push(part(new THREE.IcosahedronGeometry(1.5 * s, 1), [0x4a6a32, 0x557a3a, 0x3e5e2c][Math.abs(Math.round(x + z)) % 3], [x, 3.4 * s, z], [0, x, 0], [1, 1.15, 1])); };
    for (let z = -60; z < 70; z += 7) { if (Math.abs(z - 9.75) < 6) continue; tree(-40.5, z + (Math.abs(z) % 3), 0.9 + (Math.abs(z) % 5) * 0.08); }
    for (let z = -60; z < 70; z += 9) if (Math.abs(z - 9.75) > 8) T('hedge', -29.6, z, -28.6, z + 8.6, 1.4, 0.7, 1);
    flat('tarmac', -46, 7.0, -38.0, 12.5, 0.008, 4);       // the road on into Canvey
    // a row of Canvey chalet bungalows across Thorney Bay Road (brick, tiled roofs)
    for (let i = 0; i < 9; i++) { const z = -52 + i * 13, x0 = -56, x1 = -46; if (Math.abs(z + 3.25 - 9.75) < 6) continue;
      T('brick', x0, z, x1, z + 7.5, 2.7, 1.35, 1); const r = roofGeo(W, 'roof', x0, x1, z, z + 7.5, { eave: 2.7, slope: 0.7, ov: 0.3 }); void r;
      for (const dz of [1.6, 5.2]) k.box(0.06, 1.1, 1.3, x1 + 0.02, 1.5, z + dz, 0x34424e); k.box(0.06, 2.0, 0.9, x1 + 0.02, 1.0, z + 3.4, [0x8a1a1e, 0x1e2a44, 0x2a5a3a][i % 3]); }
  }

  // ================================================= the creek (behind Nan's back hedge)
  { const zc = -12.6, pts = []; for (let x = -45; x <= 23.5; x += 1.5) pts.push([x, zc + Math.sin(x * 0.11) * 0.7 + Math.sin(x * 0.27) * 0.25]);
    const water = [], bank = [];
    for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
      water.push(x0, -0.55, z0 - 0.9, x1, -0.55, z1 - 0.9, x1, -0.55, z1 + 0.9, x0, -0.55, z0 - 0.9, x1, -0.55, z1 + 0.9, x0, -0.55, z0 + 0.9);
      for (const s of [-1, 1]) { const a0 = [x0, -0.6, z0 + s * 0.85], a1 = [x1, -0.6, z1 + s * 0.85], b0 = [x0, 0.0, s > 0 ? -9.6 : -15.0], b1 = [x1, 0.0, s > 0 ? -9.6 : -15.0];
        if (s > 0) bank.push(...a0, ...b0, ...b1, ...a0, ...b1, ...a1); else bank.push(...a0, ...a1, ...b1, ...a0, ...b1, ...b0); } }
    const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(water, 3)); wg.computeVertexNormals();
    scene.add(new THREE.Mesh(wg, waterMaterial({ deep: 0x2e4a3a, shallow: 0x5a7a62, flow: 0.02, scale: 0.8, sun: [-0.5, 0.35, 0.75] })));
    const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(bank, 3)); bg.computeVertexNormals(); metreUV2(bg, 2); W.geo('lawn', bg);
    // (the creek's dug out of the ground: the lawn there is a strip each side; the ground plane has a hole cut: see main)
    // reeds along the banks, two little timber footbridges
    for (let i = 0; i < pts.length; i += 1) { const [x, z] = pts[i]; for (const s of [-1, 1]) if ((i * 7 + (s > 0 ? 3 : 0)) % 5 < 3) for (let j = 0; j < 5; j++) {
      const rx = x + (rnd() - 0.5) * 1.2, rz = z + s * (0.75 + rnd() * 0.35), h = 0.9 + rnd() * 0.6; k.parts.push(part(new THREE.ConeGeometry(0.025, h, 3), rnd() < 0.5 ? 0x8a8a4a : 0x6a7a3a, [rx, -0.55 + h / 2, rz], [(rnd() - 0.5) * 0.3, 0, (rnd() - 0.5) * 0.3]));
      if (j === 0) k.parts.push(part(cyl(0.03, 0.03, 0.14, 5), 0x5a3a1e, [rx, -0.55 + h + 0.02, rz])); } }
    for (const bx of [-18, 10]) { const z = zc + Math.sin(bx * 0.11) * 0.7 + Math.sin(bx * 0.27) * 0.25;
      R(bx - 0.7, -15.0, bx + 0.7, -9.6, 0.12, 0.06, 0x7a6a58);
      for (const s of [-1, 1]) { R(bx + s * 0.68 - 0.03, -15.0, bx + s * 0.68 + 0.03, -9.6, 0.06, 1.0, 0x5a4a3a); for (let t = -15.0; t <= -9.5; t += 1.35) k.box(0.07, 0.9, 0.07, bx + s * 0.68, 0.55, t, 0x5a4a3a); } void z; }
  }

  // ================================================= the edges of the walkable bit (festive, not fences)
  { // Seafarer Drive closed for the carol singers: red and white barrier boards on A-frames, a sign
    const z = B.z1 - 0.25;
    for (const [x0, x1] of [[5.4, 7.6], [8.8, 11.0]]) { for (const x of [x0 + 0.1, x1 - 0.1]) for (const s of [-1, 1]) k.box(0.05, 1.05, 0.05, x, 0.5, z + s * 0.18, 0xf4f4f0, { rot: [s * 0.18, 0, 0] });
      for (const y of [0.85, 0.45]) for (let i = 0; i < 6; i++) k.box((x1 - x0) / 6, 0.18, 0.03, x0 + (i + 0.5) * (x1 - x0) / 6, y, z, (i + (y > 0.6 ? 0 : 1)) % 2 ? 0xc8102e : 0xf8f8f8); }
    k.box(0.9, 0.45, 0.9, 8.2, 0.225, z + 0.1, 0x3a3c40); xmasTree(k, 8.2, z + 0.1, { h: 1.9, R: 0.55, rnd, y0: 0.45 });
    lightString(k, [[5.4, 0.95, z - 0.03], [11.0, 0.95, z - 0.03]], { spacing: 0.22, sag: 0.04, colors: MULTI, halo: 0.07, wire: null });
    for (const x of [5.6, 7.4]) k.box(0.05, 1.45, 0.05, x, 0.72, z, 0x26282a); k.label('SEAFARER DRIVE CLOSED 2-5PM: SANDY BAY CAROL SINGERS (JOAN ON DESCANT)', 2.0, 0.32, [6.5, 1.3, z - 0.03], [0, Math.PI, 0], { bg: '#ffffff', fg: '#c8102e', border: '#2a5a3a', size: 40 });
    // the promenade's ends: groups of terracotta pots with clipped bays
    for (const pz of [B.z0 + 0.4, B.z1 - 0.4]) for (let i = 0; i < 6; i++) { const px = L.SEA_X + L.SEA_T + 0.4 + i * 0.66; k.cyl(0.3, 0.22, 0.5, px, 0.25, pz, 0xb5653a, 12); k.parts.push(part(new THREE.IcosahedronGeometry(0.32, 1), 0x2f5a26, [px, 0.85, pz])); }
  }

  // ================================================= lamp posts, bollard lights, street names
  const lampPost = (x, z, face) => { k.cyl(0.06, 0.08, 4.6, x, 2.3, z, 0x26282a, 8); k.box(0.12, 0.08, 0.55, x, 4.6, z + face * 0.22, 0x26282a); k.box(0.1, 0.02, 0.32, x, 4.555, z + face * 0.32, 0xfff4d8); k.cyl(0.14, 0.16, 0.3, x, 0.15, z, 0x26282a, 8); k.blockers.push({ x0: x - 0.12, x1: x + 0.12, z0: z - 0.12, z1: z + 0.12, y1: 4.6 }); };
  for (let x = -22; x < 44; x += 13) { lampPost(x, RD.z0 - 0.55, 1); }
  for (let x = -15.5; x < 44; x += 13) { if (x > 4.5 && x < 12) continue; lampPost(x, RD.z1 + 0.55, -1); }
  const bollard = (x, z) => { k.cyl(0.08, 0.08, 0.8, x, 0.4, z, 0x26282a, 8); k.cyl(0.081, 0.081, 0.1, x, 0.68, z, 0xfff0cc, 8); k.blockers.push({ x0: x - 0.1, x1: x + 0.1, z0: z - 0.1, z1: z + 0.1, y1: 0.8 }); };
  for (let z = -6; z < 6; z += 3.0) bollard(L.SEA_X - 1.2, z);
  const street = (name, x, z, ry) => { for (const s of [-1, 1]) k.box(0.06, 0.9, 0.06, x + Math.cos(ry) * s * 0.55, 0.45, z - Math.sin(ry) * s * 0.55, 0x26282a); k.box(1.25, 0.32, 0.04, x, 0.9, z, 0xffffff, { rot: [0, ry, 0] });
    for (const d of [-1, 1]) k.label(name, 1.2, 0.3, [x + Math.sin(ry) * d * 0.025, 0.9, z + Math.cos(ry) * d * 0.025], [0, ry + (d < 0 ? Math.PI : 0), 0], { tex: TX.streetTex(name) }); };
  street('Shore Drive', -14.5, RD.z0 - 0.6, 0); street('Seafarer Drive', 12.2, RD.z1 + 0.9, 0); street('Shore Drive', 4.4, RD.z1 + 0.9, 0);

  // ================================================= the neighbours' homes (rows of them, instanced)
  const row = (z, ry, x0, x1, pattern, opts = {}) => { let x = x0, i = 0;
    for (;;) { const m = pattern[i % pattern.length], Lm = MODELS[m].L; if (x + Lm > x1) break;
      homes.push({ model: m, x: x + Lm / 2, z, ry, lights: opts.lights ? rnd() < opts.lights : false, near: !!opts.near }); x += Lm + 6.0; i++; } };
  // across the road (fronts facing Nan's street)
  homes.push({ model: 'sofia', x: -1.65, z: L.N1Z, ry: Math.PI, lights: true, near: true, noDrive: true }, { model: 'majestic', x: 18.83, z: L.N1Z, ry: Math.PI, lights: true, near: true }, { model: 'sonata', x: 38.5, z: L.N1Z, ry: Math.PI, lights: true, near: true });
  row(31.35, 0, -29, 46, ['sonata', 'majestic', 'sofia', 'residence'], { lights: 0.5 });           // their back-to-back neighbours (fronts on Clearwater Drive)
  row(50.95, Math.PI, -29, 46, ['majestic', 'sonata', 'residence', 'sofia'], { lights: 0.4 });
  row(-18.05, Math.PI, -29, 21, ['residence', 'sofia', 'sonata', 'majestic'], { lights: 0.6 });    // behind the creek (backs toward Nan's)
  row(-36.65, 0, -29, 46, ['sonata', 'sofia', 'majestic', 'residence'], { lights: 0.4 });
  // every home: block paving for one car beside it, a slab path to the steps, a car on some
  const CARS = [0x1e2a44, 0xd8d8d4, 0x8a1a1e, 0x3a3c40, 0x6a7a8a, 0xf4f4f0];
  homes.forEach((h, n) => { const M = MODELS[h.model], hx = M.L / 2, doorX = M.ends[0] === 'cathedral' ? hx - 3.6 : -hx + 3.6;
    const [ax, , az] = homePoint(h, -hx - 3.2, 0, 3.05 + 4.0), [bx, , bz] = homePoint(h, -hx - 0.2, 0, -2.5);
    if (!h.noDrive) flat('paving', Math.min(ax, bx), Math.min(az, bz), Math.max(ax, bx), Math.max(az, bz), 0.011, 1);
    const [px0, , pz0] = homePoint(h, doorX - 0.55, 0, 3.05 + 1.0), [px1, , pz1] = homePoint(h, doorX + 0.55, 0, 3.05 + 4.0);
    flat('slab', Math.min(px0, px1), Math.min(pz0, pz1), Math.max(px0, px1), Math.max(pz0, pz1), 0.012, 1.2);
    if (n % 3 !== 2 && !h.noDrive) { const [cx, , cz] = homePoint(h, -hx - 1.7, 0, 1.6); car(k, cx, cz, h.ry + Math.PI / 2, CARS[n % CARS.length], h.near); }
    if (h.lights) { const p0 = homePoint(h, -hx - 0.2, EAVE - 0.2, 3.05 + 0.42), p1 = homePoint(h, hx + 0.2, EAVE - 0.2, 3.05 + 0.42);
      lightString(k, [p0, p1], { spacing: h.near ? 0.22 : 0.4, sag: 0.06, colors: n % 2 ? MULTI : WARM, halo: h.near ? 0.08 : 0, wire: null }); }
    if (h.near && n % 2 === 0) { const [rx, , rz] = homePoint(h, doorX + 2.5, 0, 3.05 + 2.0); reindeer(k, rx, rz, h.ry + 0.4, 0.75); }
  });
  return { homes };
}

// a parked car (faces along ry: 0 = +x), simple and tidy; near ones block
export function car(k, x, z, ry, col, block = false) {
  const c = Math.cos(ry), s = Math.sin(ry), P = (w, h, d, lx, y, lz, cl) => k.box(w, h, d, x + lx * c, y, z - lx * s, cl, { rot: [0, ry, 0] });
  P(4.1, 0.62, 1.78, 0, 0.55, 0, col); P(2.3, 0.56, 1.6, -0.25, 1.1, 0, col); P(2.2, 0.46, 1.64, -0.25, 1.12, 0, 0x2a3440);
  for (const dx of [-1.35, 1.35]) for (const dz of [-0.85, 0.85]) k.parts.push(part(cyl(0.33, 0.33, 0.24, 12), 0x161616, [x + dx * c + dz * s, 0.33, z - dx * s + dz * c], [Math.PI / 2, ry, 0]));
  P(0.06, 0.12, 1.5, 2.05, 0.62, 0, 0xf4f4ee); P(0.06, 0.12, 1.5, -2.05, 0.62, 0, 0xa01818);
  if (block) { const hx = Math.abs(c) * 2.1 + Math.abs(s) * 0.9, hz = Math.abs(s) * 2.1 + Math.abs(c) * 0.9; k.blockers.push({ x0: x - hx, x1: x + hx, z0: z - hz, z1: z + hz, y1: 1.4 }); }
}
// planar metre UVs for a flat (y-up) geometry
export function metreUV2(g, tile = 1) { const p = g.attributes.position, uv = new Float32Array(p.count * 2); for (let i = 0; i < p.count; i++) { uv[i * 2] = p.getX(i) / tile; uv[i * 2 + 1] = p.getZ(i) / tile; } g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g; }
