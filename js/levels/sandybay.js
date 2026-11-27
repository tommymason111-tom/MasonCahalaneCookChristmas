// NAN'S NEW HOUSE (SANDY BAY): Joan's park home on Sandy Bay residents' park, Christmas Day afternoon.
// Looking down (x to the right, +z toward the road at the front):
//
//   z 16 .. 24     across the road: Brian & Dot's (the OTT lights), the SOCIAL CLUB, another home
//   z 12.5 .. 14.5 the far pavement: park sign, benches, the club's notice board, postbox, lamp posts
//   z 7.5 .. 12.5  the private road (5 MPH), a speed bump
//   z 3.5 .. 7     Nan's front garden: porch with steps, ramp and handrail, JOAN'S RIDE, a little hedge
//   z -3.5 .. 3.5  NAN'S PARK HOME (x -7 .. 7): bedroom | bathroom | hall along the front (x -7 .. -0.5),
//                  the kitchen-diner behind them, the big LOUNGE on the right (x -0.5 .. 7) with the bay window
//   z -7 .. -3.5   the CONSERVATORY off the back of the lounge (x 1 .. 6.6), patio behind the kitchen
//   z -9.2 .. -7   decking
//   z -17.6 .. -9.2 the lawn (a clear 10 x 7 m in the middle), shed, washing line, gnomes, the reindeer
//   either side    Pat & Ron's (left) and Maureen's (right), fenced off
import * as THREE from 'three';
import { Kit } from './kit.js';
import { NavGrid } from '../nav.js';
import { sofa, unitFronts, wheelieBin } from './furniture.js';
import { leafyHedge, leafyBall, pottedPlant } from './outdoor.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { part, sph, cyl, merge, vcLambert } from '../geo.js';
import { photoSlot } from '../portraits.js';
import { canvasTex } from '../textures.js';
import {
  shade, rng, bulb, buildBulbs, lightString, icicles, MULTI, RoofBatch, gable, faceWin, parkHome, wreath, xmasTree, presents, present, gnome, solarLight, reindeer, birdTable, rotaryLine, scooter, lampPost, bench, postbox,
  cladTex, winterRoofTex, frostGrassTex, deckTex, slabTex, tarmacTex, swirlCarpetTex, linoTex, wallpaperTex, flameTex, calendarTex, hangryTex, noticeTex, blanketTex,
} from './sandybay_props.js';

const _skyV = new THREE.Vector3();
const FACE = { 'z+': 0, 'z-': Math.PI, 'x+': Math.PI / 2, 'x-': -Math.PI / 2 };
const FAM = (n) => './assets/family/' + n + '.glb';

export function buildSandyBay(scene) {
  const B = { x0: -20, x1: 20, z0: -18, z1: 14.5 };
  const k = new Kit(scene, { ...B, y1: 8 });
  const rnd = rng(2512);
  const R = (x0, z0, x1, z1, h, y, color, opts) => k.box(Math.abs(x1 - x0), h, Math.abs(z1 - z0), (x0 + x1) / 2, y ?? h / 2, (z0 + z1) / 2, color, opts);
  const yxz = (rx, ry, rz = 0) => { const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), 'XYZ'); return [e.x, e.y, e.z]; };   // (lean back, then turn: as XYZ angles)
  const sign = (text, w, h, x, y, z, face, opts = {}) => k.label(text, w, h, [x, y, z], Array.isArray(face) ? face : [0, typeof face === 'string' ? FACE[face] : face, 0], opts);
  const note = (text, w, h, x, y, z, face, bg = '#fffbe8', fg = '#222', size = 40, border = null) => sign(text, w, h, x, y, z, face, { bg, fg, border, size });
  const WHITE = 0xf6f6f2, MAGNOLIA = 0xf1e8d6, SAGE = 0xdfe6cf, CREAM = 0xf3ead6, SKIRT = 0xfafaf6, OAK = 0x8a5a32, DARKOAK = 0x5a3a20, GOLD = 0xd4af37, RED = 0xc8102e, GREEN = 0x1e5a2a;
  const CLAD = cladTex(), ROOFT = winterRoofTex(), roofs = new RoofBatch(), photos = [];
  const glassMat = new THREE.MeshLambertMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
  const glassPos = [];
  const glassQuad = (a, b, c, d) => { for (const p of [a, b, c, a, c, d]) glassPos.push(...p); };
  const texMats = new Map();
  // a textured box at any angle (blankets, rugs...)
  const texRot = (w, h, d, x, y, z, rot, tex, tile = 0) => { const key = tex.uuid; if (!texMats.has(key)) texMats.set(key, new THREE.MeshLambertMaterial({ map: tex })); const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), texMats.get(key)); m.position.set(x, y, z); m.rotation.set(...yxz(...rot)); scene.add(m); return m; };

  // ---------------- walls with holes (from Lewis's house) ----------------
  function wallRun(axis, c, a0, a1, h, holes = [], { tex = null, color = MAGNOLIA, inColor = null, inSign = 0, t = 0.16, tile = 1.6 } = {}) {
    const seg = (s0, s1, y0, y1) => {
      if (s1 - s0 < 0.01 || y1 - y0 < 0.01) return;
      const len = s1 - s0, mid = (s0 + s1) / 2, hh = y1 - y0, my = (y0 + y1) / 2;
      const w = axis === 'x' ? len : t, d = axis === 'x' ? t : len, x = axis === 'x' ? mid : c, z = axis === 'x' ? c : mid;
      if (tex) k.texBox(w, hh, d, x, my, z, tex, { tile, collide: true, block: y0 < 0.5 });
      else k.box(w, hh, d, x, my, z, color, { collide: true, block: y0 < 0.5 });
      if (inColor != null && CEIL - y0 > 0.01) { const o = inSign * (t / 2 + 0.006); k.box(axis === 'x' ? len : 0.01, Math.min(hh, CEIL - y0), axis === 'x' ? 0.01 : len, axis === 'x' ? mid : c + o, y0 + Math.min(hh, CEIL - y0) / 2, axis === 'x' ? c + o : mid, inColor); }
    };
    const spans = new Map();
    for (const [s0, s1, y0, y1] of holes) { const key = s0 + '|' + s1; if (!spans.has(key)) spans.set(key, { s0, s1, g: [] }); spans.get(key).g.push([y0, y1]); }
    let a = a0;
    for (const { s0, s1, g } of [...spans.values()].sort((p, q) => p.s0 - q.s0)) { seg(a, s0, 0, h); let y = 0; for (const [y0, y1] of g.sort((p, q) => p[0] - q[0])) { seg(s0, s1, y, y0); y = y1; } seg(s0, s1, y, h); a = s1; }
    seg(a, a1, 0, h);
  }
  // glazing + a white uPVC frame in a hole (glass into the shared glass mesh)
  function glaze(axis, c, s0, s1, y0, y1, { frame = WHITE, bars = 1, sill = true, transom = true } = {}) {
    const w = s1 - s0, hh = y1 - y0, mid = (s0 + s1) / 2, my = (y0 + y1) / 2;
    if (axis === 'x') glassQuad([s0, y0, c], [s1, y0, c], [s1, y1, c], [s0, y1, c]); else glassQuad([c, y0, s0], [c, y0, s1], [c, y1, s1], [c, y1, s0]);
    const fb = (len, h, a, y, dd = 0.1) => axis === 'x' ? k.box(len, h, dd, a, y, c, frame) : k.box(dd, h, len, c, y, a, frame);
    fb(w + 0.1, 0.07, mid, y1); fb(w + 0.1, 0.07, mid, y0); fb(0.07, hh, s0, my); fb(0.07, hh, s1, my);
    for (let i = 1; i <= bars; i++) fb(0.05, hh, s0 + w * i / (bars + 1), my, 0.06);
    if (transom) fb(w, 0.05, mid, y1 - hh * 0.28, 0.06);
    if (sill) axis === 'x' ? k.box(w + 0.2, 0.04, 0.36, mid, y0 - 0.02, c, frame) : k.box(0.36, 0.04, w + 0.2, c, y0 - 0.02, mid, frame);
  }
  // a closed door drawn on a wall face: axis 'x' = wall along x at z = c; dir = which side it's on
  function doorFace(axis, c, a0, a1, dir, { color = WHITE, h = 2.0, handle = 0xc9a24a } = {}) {
    const w = a1 - a0, m = (a0 + a1) / 2;
    const P = (ww, hh, tt, aa, y, off, col) => axis === 'x' ? k.box(ww, hh, tt, aa, y, c + dir * off, col) : k.box(tt, hh, ww, c + dir * off, y, aa, col);
    P(w, h, 0.04, m, h / 2, 0.05, color);
    for (const [py, ph] of [[0.55, 0.7], [1.45, 0.75]]) for (const s of [-1, 1]) P(w * 0.36, ph, 0.012, m + s * w * 0.22, py, 0.075, shade(color, 0.94));
    P(0.12, 0.025, 0.025, a1 - 0.13, 1.0, 0.1, handle); P(0.05, 0.05, 0.02, a1 - 0.08, 1.0, 0.08, handle);
    for (const a of [a0 - 0.035, a1 + 0.035]) P(0.07, h + 0.05, 0.02, a, (h + 0.05) / 2, 0.06, SKIRT);
    P(w + 0.14, 0.07, 0.02, m, h + 0.05, 0.06, SKIRT);
  }
  // an open doorway's architraves (both faces)
  function arch(axis, c, a0, a1, h = 2.05, tt = 0.1) {
    for (const d of [-1, 1]) { const off = d * (tt / 2 + 0.01);
      if (axis === 'x') { k.box(0.07, h, 0.02, a0 - 0.035, h / 2, c + off, SKIRT); k.box(0.07, h, 0.02, a1 + 0.035, h / 2, c + off, SKIRT); k.box(a1 - a0 + 0.14, 0.07, 0.02, (a0 + a1) / 2, h + 0.035, c + off, SKIRT); }
      else { k.box(0.02, h, 0.07, c + off, h / 2, a0 - 0.035, SKIRT); k.box(0.02, h, 0.07, c + off, h / 2, a1 + 0.035, SKIRT); k.box(0.02, 0.07, a1 - a0 + 0.14, c + off, h + 0.035, (a0 + a1) / 2, SKIRT); } }
  }
  // skirting + coving along an inside wall face (d = the room's side)
  function trim(axis, c, a0, a1, d, coving = true) {
    const len = a1 - a0, mid = (a0 + a1) / 2;
    if (axis === 'x') { k.box(len, 0.12, 0.02, mid, 0.06, c + d * 0.01, SKIRT); if (coving) k.box(len, 0.07, 0.05, mid, CEIL - 0.035, c + d * 0.025, SKIRT); }
    else { k.box(0.02, 0.12, len, c + d * 0.01, 0.06, mid, SKIRT); if (coving) k.box(0.05, 0.07, len, c + d * 0.025, CEIL - 0.035, mid, SKIRT); }
  }
  const radiator = (axis, c, a, w, d, y = 0.45) => { for (let i = 0; i < Math.round(w / 0.07); i++) { const p = a - w / 2 + i * 0.07 + 0.035; axis === 'x' ? k.box(0.05, 0.55, 0.06, p, y, c + d * 0.06, 0xf4f4f2) : k.box(0.06, 0.55, 0.05, c + d * 0.06, y, p, 0xf4f4f2); } };
  const socket = (axis, c, a, y, d) => axis === 'x' ? k.box(0.14, 0.08, 0.012, a, y, c + d * 0.006, 0xf8f8f8) : k.box(0.012, 0.08, 0.14, c + d * 0.006, y, a, 0xf8f8f8);
  const fam = (axis, c, a, y, w, h, d, who, bg, caption, frameCol = 0x2a1a10) => {
    const sl = photoSlot(w > h ? 320 : 240, w > h ? 250 : 320, { who: who.map(FAM), bg, caption }); photos.push(sl);
    if (axis === 'x') { k.box(w + 0.1, h + 0.1, 0.03, a, y, c + d * 0.015, frameCol); k.box(w + 0.02, h + 0.02, 0.005, a, y, c + d * 0.031, 0xf6f2e8); k.label('photo', w - 0.04, h - 0.04, [a, y, c + d * 0.035], [0, d > 0 ? 0 : Math.PI, 0], { tex: sl.tex }); }
    else { k.box(0.03, h + 0.1, w + 0.1, c + d * 0.015, y, a, frameCol); k.box(0.005, h + 0.02, w + 0.02, c + d * 0.031, y, a, 0xf6f2e8); k.label('photo', w - 0.04, h - 0.04, [c + d * 0.035, y, a], [0, d > 0 ? Math.PI / 2 : -Math.PI / 2, 0], { tex: sl.tex }); }
  };
  // a standing photo frame (on a shelf / the mantel / the cabinet), facing direction ry (0 = +z)
  const standPhoto = (x, y, z, ry, w, h, who, bg, caption, frameCol = GOLD) => {
    const sl = photoSlot(w > h ? 320 : 240, w > h ? 250 : 320, { who: who.map(FAM), bg, caption }); photos.push(sl);
    const fx = Math.sin(ry), fz = Math.cos(ry);
    k.box(w + 0.04, h + 0.04, 0.02, x, y + h / 2 + 0.02, z, frameCol, { rot: yxz(-0.12, ry) });
    k.label('photo', w - 0.02, h - 0.02, [x + fx * 0.013, y + h / 2 + 0.02, z + fz * 0.013], yxz(-0.12, ry), { tex: sl.tex });
  };

  // ======================================================== SKY (a low winter sun) + the world beyond
  const SUN_DIR = new THREE.Vector3(-7, 4.2, -9).normalize();
  const skyRig = new THREE.Group(); scene.add(skyRig);
  const sky = new Sky(); sky.scale.setScalar(30); sky.renderOrder = -100; sky.frustumCulled = false;
  sky.material.uniforms.turbidity.value = 3.2; sky.material.uniforms.rayleigh.value = 1.6;
  sky.material.uniforms.mieCoefficient.value = 0.004; sky.material.uniforms.mieDirectionalG.value = 0.86; sky.material.uniforms.sunPosition.value.copy(SUN_DIR);
  sky.material.fragmentShader = sky.material.fragmentShader.replace('#include <tonemapping_fragment>', 'gl_FragColor.rgb *= 0.42;\n#include <tonemapping_fragment>');
  skyRig.add(sky);
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(34, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), new THREE.MeshBasicMaterial({ map: cloudTex(), side: THREE.BackSide, transparent: true, depthWrite: false, fog: false }));
  clouds.renderOrder = -98; clouds.frustumCulled = false; skyRig.add(clouds);
  sky.onBeforeRender = (r, sc, cam) => { _skyV.setFromMatrixPosition(cam.matrixWorld); if (skyRig.position.distanceToSquared(_skyV) > 1e-6) { skyRig.position.copy(_skyV); skyRig.updateMatrixWorld(true); } };
  const GRASS = frostGrassTex();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshLambertMaterial({ color: 0x8aa07a }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01; scene.add(ground);
  // distant trees: bare winter oaks and a few dark pines
  for (const [x, z, s, bare] of [[-30, -30, 1.4, 1], [-12, -34, 1.2, 0], [6, -33, 1.5, 1], [24, -28, 1.3, 1], [34, -6, 1.2, 0], [-36, 4, 1.4, 1], [-30, 30, 1.3, 0], [30, 30, 1.5, 1], [20, 34, 1.2, 0], [-8, 36, 1.4, 1], [38, 14, 1.3, 1]]) {
    if (bare) { k.cyl(0.18 * s, 0.3 * s, 4 * s, x, 2 * s, z, 0x4a4038, 7); for (let i = 0; i < 7; i++) { const a = i * 0.9 + s, L = (1.8 + (i % 3) * 0.6) * s; const g = new THREE.CylinderGeometry(0.03 * s, 0.1 * s, L, 5); g.translate(0, L / 2, 0); g.rotateZ(0.7 + (i % 2) * 0.3); g.rotateY(a); k.parts.push(part(g, 0x4a4038, [x, (2.6 + (i % 4) * 0.5) * s, z])); } }
    else { k.cyl(0.15 * s, 0.2 * s, 1.5 * s, x, 0.75 * s, z, 0x4a3020, 6); for (let i = 0; i < 4; i++) k.parts.push(part(new THREE.ConeGeometry((1.8 - i * 0.4) * s, 1.8 * s, 9), [0x1e3a22, 0x24442a, 0x1a3420][i % 3], [x, (1.6 + i * 1.1) * s, z])); }
  }

  // ======================================================== NAN'S PARK HOME (x -7..7, z -3.5..3.5)
  const HX0 = -7, HX1 = 7, HZ0 = -3.5, HZ1 = 3.5, CEIL = 2.4, EAVE = 2.55, RISE = 1.35;
  // floors
  { const ct = swirlCarpetTex('#6a2a34', '#74343c', '#8a6a48'); k.floor(-0.5, HZ0, HX1, HZ1, ct, 0.004, 0.9); k.floor(2.0, HZ1 - 0.1, 5.0, HZ1 + 0.62, ct, 0.0041, 0.9); }   // lounge (and the bay)
  k.floor(HX0, HZ0, -0.5, 0.6, linoTex(), 0.004, 1.1);                                                      // kitchen-diner
  k.floor(-2.0, 0.6, -0.5, HZ1, swirlCarpetTex('#3a4a6a', '#4a5a7a', '#a89060'), 0.004, 1.0);              // hall
  k.floor(HX0, 0.6, -2.0, HZ1, swirlCarpetTex('#6a5a7a', '#7a6a8a', '#c8b8a0'), 0.004, 1.2);              // bedroom + bathroom (seen through the nets)
  // outer walls: cream lap cladding outside, painted inside
  wallRun('x', HZ1, HX0 - 0.08, -2.0, EAVE, [[-6.2, -4.6, 0.95, 2.0], [-3.2, -2.5, 1.35, 2.0]], { tex: CLAD, inColor: 0xe8e0f0, inSign: -1 });
  wallRun('x', HZ1, -2.0, -0.5, EAVE, [[-1.75, -0.75, 0, 2.05]], { tex: CLAD, inColor: CREAM, inSign: -1 });
  wallRun('x', HZ1, -0.5, HX1 + 0.08, EAVE, [[2.0, 5.0, 0, 2.2]], { tex: CLAD, inColor: MAGNOLIA, inSign: -1 });
  wallRun('x', HZ0, HX0 - 0.08, -0.5, EAVE, [[-6.0, -4.8, 1.0, 2.0], [-3.4, -2.0, 0.9, 2.0]], { tex: CLAD, inColor: SAGE, inSign: 1 });
  wallRun('x', HZ0, -0.5, HX1 + 0.08, EAVE, [[3.2, 4.6, 0, 2.1]], { tex: CLAD, inColor: MAGNOLIA, inSign: 1 });
  wallRun('z', HX0, HZ0, 0.6, EAVE, [], { tex: CLAD, inColor: SAGE, inSign: 1 });
  wallRun('z', HX0, 0.6, HZ1, EAVE, [[1.4, 2.6, 1.0, 2.0]], { tex: CLAD, inColor: 0xe8e0f0, inSign: 1 });
  wallRun('z', HX1, HZ0, HZ1, EAVE, [], { tex: CLAD, inColor: MAGNOLIA, inSign: -1 });
  glaze('x', HZ1, -6.2, -4.6, 0.95, 2.0); glaze('x', HZ1, -3.2, -2.5, 1.35, 2.0, { bars: 0 });
  glaze('x', HZ0, -6.0, -4.8, 1.0, 2.0, { bars: 0 }); glaze('x', HZ0, -3.4, -2.0, 0.9, 2.0);
  glaze('z', HX0, 1.4, 2.6, 1.0, 2.0, { bars: 0 });
  // net curtains in the bedroom and bathroom windows (frosted glass in the bathroom)
  const lace = laceTex();
  const netAt = (axis, c, a0, a1, y0, y1, d) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(a1 - a0, y1 - y0), new THREE.MeshLambertMaterial({ map: lace, color: 0xf4f2ea, side: THREE.DoubleSide })); if (axis === 'x') m.position.set((a0 + a1) / 2, (y0 + y1) / 2, c + d * 0.07); else { m.position.set(c + d * 0.07, (y0 + y1) / 2, (a0 + a1) / 2); m.rotation.y = Math.PI / 2; } scene.add(m); };
  netAt('x', HZ1, -6.2, -4.6, 0.95, 2.0, -1); netAt('z', HX0, 1.4, 2.6, 1.0, 2.0, 1);
  R(-3.2, HZ1 - 0.1, -2.5, HZ1 - 0.08, 0.65, 1.67, 0xdfe8ee);                                              // bathroom: frosted
  R(-6.1, HZ1 - 0.14, -4.7, HZ1 - 0.12, 0.9, 1.25, 0xe0d0e8); R(-6.95, 1.5, -6.93, 2.5, 0.9, 1.25, 0xe0d0e8);   // bedroom blinds half down behind the nets
  // interior walls
  const IW = 0.1;
  wallRun('x', 0.6, HX0, -0.5, CEIL, [[-1.9, -0.6, 0, 2.1]], { color: CREAM, t: IW });
  wallRun('z', -3.6, 0.6, HZ1, CEIL, [], { color: 0xe8e0f0, t: IW });
  wallRun('z', -2.0, 0.6, HZ1, CEIL, [], { color: CREAM, t: IW });
  wallRun('z', -0.5, HZ0, HZ1, CEIL, [[-3.0, -1.0, 0, 2.15], [2.25, 3.35, 0, 2.0]], { color: MAGNOLIA, t: IW });
  k.box(0.012, CEIL, 4.06, -0.556, CEIL / 2, -1.45, SAGE); k.box(4.06 - 0.06, CEIL, 0.012, -2.78, CEIL / 2, 0.544, SAGE);   // kitchen-side paint (sage)
  arch('z', -0.5, -3.0, -1.0, 2.15); arch('z', -0.5, 2.25, 3.35, 2.0); arch('x', 0.6, -1.9, -0.6, 2.1);
  doorFace('x', 0.6, -6.1, -5.25, -1, { color: 0xf4f0e6 });                                                 // bedroom door (kitchen side, shut)
  doorFace('z', -2.0, 1.55, 2.4, 1, { color: 0xf4f0e6 });                                                   // bathroom door (hall side, shut)
  // ceiling + the roof (pitched, ridge along the length, frosty grey tiles)
  { const cm = new THREE.Mesh(new THREE.PlaneGeometry(HX1 - HX0, HZ1 - HZ0), new THREE.MeshLambertMaterial({ color: 0xf6f2ea, emissive: 0x3a362e })); cm.rotation.x = Math.PI / 2; cm.position.set(0, CEIL, 0); scene.add(cm); }
  const RR = roofs.add(HX0, HX1, HZ0, HZ1, EAVE, RISE, 0.32);
  gable(k, HX0 - 0.085, HZ0, HZ1, EAVE, RISE, 0xeee6d2); gable(k, HX1 + 0.085, HZ0, HZ1, EAVE, RISE, 0xeee6d2);
  for (const x of [HX0 - 0.09, HX1 + 0.09]) for (const s of [-1, 1]) { const ang = Math.atan2(RISE, 3.5), L = Math.hypot(3.5 + 0.32, RISE + 0.32 * RISE / 3.5); k.box(0.04, 0.18, L, x, EAVE + RISE / 2 - 0.12, s * (3.5 + 0.32) / 2, WHITE, { rot: [s * ang, 0, 0] }); }   // barge boards
  for (const z of [RR.za, RR.zb]) { k.box(RR.xb - RR.xa, 0.18, 0.04, 0, RR.ye - 0.07, z, WHITE); k.box(RR.xb - RR.xa, 0.09, 0.12, 0, RR.ye - 0.13, z + Math.sign(z) * 0.06, 0x2a2a2a); }   // fascias + gutters
  k.box(RR.xb - RR.xa, 0.08, 0.13, 0, RR.yr + 0.03, 0, 0x5a5048);                                          // ridge
  k.box(0.5, 0.9, 0.5, -4.5, RR.yr + 0.1, 0.8, 0xb8b0a0); k.cyl(0.08, 0.08, 0.25, -4.5, RR.yr + 0.65, 0.8, 0x8a5a3a, 8);   // a flue
  // the TV aerial (with tinsel), a satellite dish
  k.cyl(0.015, 0.015, 1.3, 3.8, RR.yr + 0.65, 0, 0x9a9a9a, 6); for (let i = 0; i < 6; i++) k.box(0.01, 0.01, 0.5 - i * 0.05, 3.65 + i * 0.07, RR.yr + 1.25, 0, 0x9a9a9a); k.box(0.45, 0.012, 0.012, 3.8, RR.yr + 1.25, 0, 0x9a9a9a);
  k.parts.push(part(new THREE.SphereGeometry(0.3, 12, 6, 0, Math.PI * 2, 0, 0.9), 0xe8e8e8, [7.45, 2.1, -2.5], [0, 0, -Math.PI / 2 + 0.3])); k.box(0.3, 0.05, 0.05, 7.25, 2.1, -2.5, 0x9a9a9a);
  // skirting / chassis panel round the bottom, corner trims, downpipes
  for (const [x0, z0, x1, z1] of [[HX0 - 0.1, HZ1 + 0.06, HX1 + 0.1, HZ1 + 0.1], [HX0 - 0.1, HZ0 - 0.1, HX1 + 0.1, HZ0 - 0.06], [HX0 - 0.1, HZ0 - 0.1, HX0 - 0.06, HZ1 + 0.1], [HX1 + 0.06, HZ0 - 0.1, HX1 + 0.1, HZ1 + 0.1]]) R(x0, z0, x1, z1, 0.32, 0.16, 0x9a968c);
  for (const x of [HX0 - 0.09, HX1 + 0.09]) for (const z of [HZ0 - 0.09, HZ1 + 0.09]) k.box(0.09, EAVE, 0.09, x, EAVE / 2, z, WHITE);
  for (const [x, z] of [[-6.8, HZ1 + 0.16], [6.8, HZ1 + 0.16], [-6.8, HZ0 - 0.16], [0.7, HZ0 - 0.16]]) k.cyl(0.035, 0.035, EAVE - 0.1, x, (EAVE - 0.1) / 2, z, 0x2a2a2a, 6);
  // Christmas lights along both front and back eaves, icicles on the front
  icicles(k, 'x', RR.zb - 0.02, RR.xa + 0.1, RR.xb - 0.1, RR.ye - 0.2, { rnd });
  lightString(k, [[RR.xa + 0.1, RR.ye - 0.12, RR.za + 0.02], [RR.xb - 0.1, RR.ye - 0.12, RR.za + 0.02]], { spacing: 0.25, sag: 0.05, halo: 0.08, wire: null });
  k.label('17', 0.22, 0.14, [-2.3, 1.7, HZ1 + 0.095], [0, 0, 0], { bg: '#1e3a6a', fg: '#ffffff', border: null, size: 70 });
  k.label("JOAN'S", 0.5, 0.14, [-2.3, 1.48, HZ1 + 0.095], [0, 0, 0], { bg: '#1e3a6a', fg: '#ffd84a', border: null, size: 60 });
  sign('SANTA PLEASE STOP HERE (NAN HAS BEEN VERY GOOD. MOSTLY.)', 1.2, 0.5, HX1 + 0.1, 1.5, 1.6, 'x+', { bg: '#c8102e', fg: '#fff', border: '#ffd84a', size: 44 });

  // ---------------- the bay window (lounge, front)
  { const X0 = 2.0, X1 = 5.0, ZB = HZ1 + 0.7, T = 0.12;
    R(X0, ZB - T, X1, ZB, 0.75, 0.375, 0xe6dec8, { collide: true, block: true }); k.texBox(X1 - X0 + 0.04, 0.75, 0.02, (X0 + X1) / 2, 0.375, ZB + 0.01, CLAD, { tile: 1.6 });
    for (const x of [X0, X1]) { R(x - T / 2, HZ1, x + T / 2, ZB, 0.75, 0.375, 0xe6dec8, { block: true }); R(x - T / 2, HZ1, x + T / 2, ZB, 0.25, 2.25, 0xe6dec8); }
    R(X0, ZB - T, X1, ZB, 0.25, 2.225, 0xe6dec8); R(X0 - 0.1, HZ1, X1 + 0.1, ZB + 0.1, 0.06, 2.38, WHITE);        // header + the bay's little flat roof
    roofs.lean(X0 - 0.12, X1 + 0.12, ZB + 0.12, HZ1 + 0.08, 2.4, 2.75);
    glaze('x', ZB - 0.06, X0 + 0.06, X1 - 0.06, 0.78, 2.1, { bars: 2 }); glaze('z', X0, HZ1 + 0.08, ZB - 0.12, 0.78, 2.1, { bars: 0, sill: false }); glaze('z', X1, HZ1 + 0.08, ZB - 0.12, 0.78, 2.1, { bars: 0, sill: false });
    k.box(X1 - X0 - 0.1, 0.004, ZB - HZ1 - 0.1, (X0 + X1) / 2, 2.1, (HZ1 + ZB) / 2, 0xf6f2ea);           // bay ceiling
    k.box(X1 - X0 + 0.2, 0.04, 0.32, (X0 + X1) / 2, 0.77, ZB - 0.22, WHITE);                                // the wide sill inside
    // nets + curtains tied back, fairy lights along the top of the bay
    const net = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0 - 0.2, 0.7), new THREE.MeshLambertMaterial({ map: lace, color: 0xf6f4ee, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })); net.position.set((X0 + X1) / 2, 1.15, ZB - 0.1); scene.add(net);
    for (const s of [-1, 1]) { k.box(0.34, 2.05, 0.08, (X0 + X1) / 2 + s * 1.75, 1.18, HZ1 - 0.12, 0x6a1a2a); k.box(0.38, 0.06, 0.1, (X0 + X1) / 2 + s * 1.75, 1.05, HZ1 - 0.13, GOLD); }
    k.box(X1 - X0 + 1.0, 0.04, 0.04, (X0 + X1) / 2, 2.28, HZ1 - 0.12, 0xc8a050);
    lightString(k, [[X0 + 0.1, 2.15, ZB - 0.12], [X1 - 0.1, 2.15, ZB - 0.12]], { spacing: 0.12, sag: 0.08, colors: [0xffd070, 0xff4040, 0x60a0ff, 0x70ff90] });
    for (let i = 0; i < 5; i++) { const x = X0 + 0.45 + i * 0.52; k.cyl(0.035, 0.04, 0.1, x, 0.84, ZB - 0.2, [0xc8102e, GOLD, 0xf4f4f4, GREEN, RED][i], 8); }   // candles/ornaments on the sill
    k.box(0.4, 0.3, 0.02, 3.5, 1.45, ZB - 0.09, 0xffd84a); bulb(k, 3.5, 1.45, ZB - 0.07, 0xffe080, 0.03, 0.4);   // a glowing star in the window
  }

  // ---------------- porch: decking platform, steps, ramp + handrail, canopy, a wreath on the door
  { const PX0 = -2.6, PX1 = 0.1, PZ1 = HZ1 + 1.4, DK = 0x7a6a5a;
    R(PX0, HZ1 + 0.1, PX1, PZ1, 0.05, 0.025, DK);
    for (let x = PX0 + 0.07; x < PX1; x += 0.14) R(x - 0.06, HZ1 + 0.1, x + 0.06, PZ1, 0.012, 0.055, shade(DK, 0.9 + (Math.round(x * 7) % 3) * 0.06));
    R(PX0 + 0.3, PZ1, PX1 - 0.3, PZ1 + 0.35, 0.03, 0.015, 0x9a8a7a);                                           // a step down
    // the ramp off the left side, with a handrail along it
    R(-4.4, HZ1 + 0.2, PX0, HZ1 + 1.1, 0.03, 0.015, 0x8a8a84); R(-4.4, HZ1 + 0.2, -4.3, HZ1 + 1.1, 0.012, 0.006, 0xd8c020);
    for (const x of [-4.3, -3.45, PX0 + 0.05]) { k.box(0.05, 0.95, 0.05, x, 0.475, HZ1 + 1.15, 0xe8e8e4, { block: true }); }
    R(-4.32, HZ1 + 1.13, PX0 + 0.06, HZ1 + 1.17, 0.05, 0.92, 0xe8e8e4, { block: true }); R(-4.32, HZ1 + 1.13, PX0 + 0.06, HZ1 + 1.17, 0.03, 0.5, 0xe8e8e4);
    for (const z of [HZ1 + 0.2, PZ1]) k.box(0.05, 0.95, 0.05, PX1 - 0.05, 0.475, z, 0xe8e8e4, { block: true });
    R(PX1 - 0.07, HZ1 + 0.2, PX1 - 0.03, PZ1, 0.05, 0.92, 0xe8e8e4, { block: true });
    k.blockers.push({ x0: -4.4, x1: PX0 + 0.1, z0: HZ1 + 1.1, z1: HZ1 + 1.2, y1: 1 });
    // the canopy over the door: a little pitched roof on two white posts
    for (const x of [-2.25, -0.25]) k.box(0.08, 2.35, 0.08, x, 1.175, HZ1 + 1.15, WHITE, { block: true });
    k.box(2.3, 0.12, 1.3, -1.25, 2.36, HZ1 + 0.65, WHITE);
    for (const s of [-1, 1]) k.box(1.2, 0.05, 1.3, -1.25 + s * 0.55, 2.62, HZ1 + 0.65, 0x5a5048, { rot: [0, 0, -s * 0.45] });
    { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-2.35, 2.42, HZ1 + 1.3, -0.15, 2.42, HZ1 + 1.3, -1.25, 2.88, HZ1 + 1.3, -0.15, 2.42, HZ1 + 1.3, -2.35, 2.42, HZ1 + 1.3, -1.25, 2.88, HZ1 + 1.3], 3)); g.computeVertexNormals(); k.parts.push(part(g, WHITE)); }
    lightString(k, [[-2.35, 2.35, HZ1 + 1.32], [-1.25, 2.85, HZ1 + 1.34], [-0.15, 2.35, HZ1 + 1.32]], { spacing: 0.12, sag: 0.0, halo: 0.08, wire: null });
    // the front door, swung open into the hall (hinged on the left), a wreath on it, a doormat
    R(-1.74, HZ1 - 1.0, -1.69, HZ1 - 0.06, 2.0, 1.0, 0x8a1a24);
    for (const y of [0.55, 1.45]) R(-1.69, HZ1 - 0.9, -1.67, HZ1 - 0.16, 0.6, y, 0x9a2a30);
    k.box(0.03, 0.14, 0.03, -1.66, 1.0, HZ1 - 0.9, GOLD);
    wreath(k, -1.66, 1.6, HZ1 - 0.53, 1, 0.16);
    k.box(0.9, 0.012, 0.55, -1.25, 0.006, HZ1 + 0.45, 0x6a4a2a); note('WIPE YOUR FEET (MICHAEL, THAT MEANS YOU)', 0.8, 0.45, -1.25, 0.014, HZ1 + 0.45, [-Math.PI / 2, 0, 0], '#6a4a2a', '#f4e0b0', 36);
    k.spawns.push(new THREE.Vector3(-0.3, 0.12, HZ1 + 0.7));
    // planters with little conifers either side of the step, a light-up penguin
    for (const x of [PX0 + 0.25, PX1 - 0.3]) { k.cyl(0.18, 0.15, 0.32, x, 0.21, PZ1 - 0.25, 0x3a3a3a, 10); k.parts.push(part(new THREE.ConeGeometry(0.17, 0.6, 8), 0x2a4a2a, [x, 0.67, PZ1 - 0.25])); bulb(k, x, 0.75, PZ1 - 0.1, 0xffd070, 0.02, 0.08); bulb(k, x + 0.08, 0.55, PZ1 - 0.2, 0xff4040, 0.02, 0.08); }
  }
  // the light-up penguin on the front lawn
  { const x = 3.2, z = 6.0; k.parts.push(part(sph(0.22, 10, 8), 0x1a1a22, [x, 0.4, z], [0, 0, 0], [1, 1.4, 1])); k.parts.push(part(sph(0.16, 10, 8), 0xf4f4f4, [x, 0.38, z + 0.1], [0, 0, 0], [1, 1.4, 0.8])); k.parts.push(part(sph(0.14, 10, 8), 0x1a1a22, [x, 0.8, z])); k.parts.push(part(new THREE.ConeGeometry(0.05, 0.12, 6), 0xff9a1a, [x, 0.78, z + 0.16], [Math.PI / 2, 0, 0])); k.parts.push(part(new THREE.ConeGeometry(0.12, 0.22, 8), RED, [x, 0.98, z])); k.parts.push(part(sph(0.04, 6, 4), 0xffffff, [x, 1.1, z]));
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; bulb(k, x + Math.cos(a) * 0.24, 0.4 + Math.sin(i * 1.7) * 0.2, z + Math.sin(a) * 0.24, 0xbfe4ff, 0.015, 0.1); }
    k.blockers.push({ x0: x - 0.25, x1: x + 0.25, z0: z - 0.25, z1: z + 0.25, y1: 1.1 }); }
  // Joan's mobility scooter, parked by the ramp
  { scooter(k, -5.0, 4.35, -Math.PI / 2);
    sign("JOAN'S RIDE", 0.36, 0.1, -5.0 - 0.635, 0.36, 4.35, 'x-', { bg: '#ffd84a', fg: '#111', border: '#111', size: 60 });
    note('TOP SPEED 4MPH. NAN DOES 6.', 0.36, 0.09, -4.75, 0.33, 4.35 + 0.305, 'z+', '#c8102e', '#ffffff', 34);
    note('TOP SPEED 4MPH. NAN DOES 6.', 0.36, 0.09, -4.75, 0.33, 4.35 - 0.305, 'z-', '#c8102e', '#ffffff', 34); }

  // ======================================================== HALL (x -2 .. -0.5, z 0.6 .. 3.5)
  trim('z', -1.945, 0.65, HZ1 - 0.09, 1); trim('z', -0.555, 0.65, 2.18, -1); trim('z', -0.555, 3.42, HZ1 - 0.09, -1, true); trim('x', 0.655, -1.95, -1.9, 1);
  radiator('z', -0.555, 1.1, 0.7, -1);
  // coat hooks with the coats on, a shoe rack, the mirror, a shelf with the landline and the "sorted" cards
  k.box(0.03, 0.08, 0.9, -1.93, 1.75, 2.95, DARKOAK);
  for (let i = 0; i < 4; i++) { const z = 2.62 + i * 0.22; k.box(0.06, 0.03, 0.02, -1.9, 1.75, z, GOLD); k.box(0.14, 0.75, 0.3, -1.86, 1.36, z, [0x3a3a5a, 0xa0402a, 0x2a4a3a, 0xd8c8a8][i], { rot: [0, 0, 0.04 * (i % 2 ? 1 : -1)] }); }
  k.box(0.12, 0.08, 0.06, -1.84, 1.82, 3.24, 0xc8102e);                                                    // a hat
  R(-1.93, 2.55, -1.65, 3.4, 0.25, 0.125, DARKOAK, { block: true }); for (let i = 0; i < 4; i++) k.box(0.12, 0.08, 0.26, -1.82, 0.29, 2.68 + i * 0.2, [0x2a2a2a, 0x8a3a2a, 0xe8e8e8, 0x3a2a1a][i]);   // shoes (Jimmy's are the size 13s)
  k.box(0.14, 0.12, 0.34, -1.82, 0.31, 3.25, 0x1a1a1a);
  note("JIMMY'S SHOES (SIZE 13). DO NOT TRIP.", 0.3, 0.12, -1.64, 0.3, 2.98, 'x+', '#fffbe8', '#222', 30);
  k.box(0.02, 0.7, 0.5, -0.565, 1.5, 1.55, 0xc8a050); k.box(0.01, 0.62, 0.42, -0.575, 1.5, 1.55, 0xb8d0dc);   // mirror
  R(-0.9, 0.62, -0.56, 1.0, 0.04, 0.95, DARKOAK, { collide: true }); for (const z of [0.66, 0.96]) k.box(0.3, 0.02, 0.02, -0.72, 0.85, z, DARKOAK);
  k.box(0.18, 0.06, 0.2, -0.72, 1.0, 0.75, 0xe8e0d0); k.box(0.06, 0.05, 0.2, -0.72, 1.06, 0.75, 0xd8d0c0);  // the landline
  for (let i = 0; i < 9; i++) k.box(0.16, 0.012, 0.11, -0.72, 0.98 + i * 0.013, 0.9, [0xf4f0e6, 0xc8102e, 0xe8e0d0, 0x1e5a2a, 0xf4f0e6][i % 5], { rot: [0, i * 0.12, 0] });   // the cards Michael sorted
  note('SORTED BY MICHAEL (ALL THE SAME POSTCODE)', 0.32, 0.14, -0.575, 1.18, 0.84, 'x-', '#ffffff', '#c8102e', 32);
  note("JOAN'S FRIENDS (VOL. 4)", 0.12, 0.17, -0.72, 0.99, 0.75, [-Math.PI / 2, 0, 0], '#6a1a2a', '#ffd84a', 26);
  sign('BATHROOM. KNOCK LOUDLY: NAN\'S HEARING AID IS ON THE SIDE', 0.5, 0.3, -1.9, 1.55, 1.97, 'x+', { bg: '#ffffff', fg: '#1a3a6a', border: '#1a3a6a', size: 40 });
  sign('MIND YOUR HEAD JIMMY', 0.9, 0.16, -0.44, 2.2, 2.8, 'x+', { bg: '#ffd84a', fg: '#111', border: '#111', size: 60 });
  sign('MIND YOUR HEAD JIMMY', 0.9, 0.16, -0.56, 2.2, 2.8, 'x-', { bg: '#ffd84a', fg: '#111', border: '#111', size: 60 });
  k.lamp(-1.25, 2.3, 2.0, 0xfff2dc, 0.09); k.cyl(0.1, 0.14, 0.12, -1.25, 2.33, 2.0, 0xf4ecd8, 12);
  lightString(k, [[-1.95, 2.3, 0.7], [-1.95, 2.3, 3.4]], { spacing: 0.15, sag: 0.06 });
  note('KEYS. GLASSES. PURSE. BUS PASS. CHOCOLATE.', 0.3, 0.2, -1.93, 1.95, 3.3, 'x+', '#fffbe8', '#222', 30);

  // ======================================================== KITCHEN-DINER (x -7 .. -0.5, z -3.5 .. 0.6)
  const TOP = 0x3a3a3e, UNIT = 0xf4f0e6, WT = 0.92;
  trim('x', HZ0 + 0.086, -4.1, -0.56, 1); trim('x', 0.545, -6.4, -1.9, -1); trim('z', -0.565, -3.42, -3.0, -1); trim('z', -0.565, -1.0, 0.55, -1);
  // the units: an L along the end wall and under the window
  R(HX0 + 0.08, -3.42, -6.35, -1.35, 0.88, 0.44, UNIT, { block: true }); R(HX0 + 0.08, -0.65, -6.35, -0.05, 0.88, 0.44, UNIT, { block: true });
  R(-6.35, -3.42, -4.1, -2.82, 0.88, 0.44, UNIT, { block: true });
  unitFronts(k, 'z', -6.35, -2.82, -1.35, 1, UNIT); unitFronts(k, 'z', -6.35, -0.65, -0.05, 1, UNIT); unitFronts(k, 'x', -2.82, -6.35, -4.1, 1, UNIT);
  R(HX0 + 0.08, -3.42, -6.32, -1.35, 0.04, WT - 0.02, TOP, { collide: true }); R(HX0 + 0.08, -0.65, -6.32, -0.05, 0.04, WT - 0.02, TOP, { collide: true }); R(-6.35, -3.42, -4.08, -2.8, 0.04, WT - 0.02, TOP, { collide: true });
  // splashback tiles, wall cupboards
  { const SPL = canvasTex(128, 128, (g, w, h) => { for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { g.fillStyle = (x + y) % 64 ? '#f4f0e8' : '#e8f0e4'; g.fillRect(x, y, 32, 32); } g.strokeStyle = '#c8c4b8'; g.lineWidth = 2; for (let p = 0; p <= w; p += 32) { g.beginPath(); g.moveTo(p, 0); g.lineTo(p, h); g.stroke(); g.beginPath(); g.moveTo(0, p); g.lineTo(w, p); g.stroke(); } g.fillStyle = '#5a8a4a'; g.beginPath(); g.arc(48, 48, 6, 0, 7); g.fill(); });
    k.texBox(0.008, 0.55, 4.0, HX0 + 0.085, WT + 0.28, -1.5, SPL, { tile: 0.3 }); k.texBox(2.3, 0.55, 0.008, -5.25, WT + 0.28, HZ0 + 0.085, SPL, { tile: 0.3 }); }
  for (const z of [-3.1, -2.45, -1.8]) { k.box(0.34, 0.7, 0.62, HX0 + 0.25, 1.85, z, UNIT); k.box(0.01, 0.12, 0.02, HX0 + 0.425, 1.62, z + 0.25, 0x9aa0a6); }
  for (const x of [-4.4]) { k.box(0.6, 0.7, 0.34, x, 1.85, HZ0 + 0.25, UNIT); k.box(0.12, 0.01, 0.02, x + 0.22, 1.62, HZ0 + 0.425, 0x9aa0a6); }
  // the sink under the window, the tap, washing-up liquid, a plant on the sill
  R(-5.8, -3.35, -5.0, -2.88, 0.03, WT + 0.005, 0xb8bcc0); R(-5.75, -3.3, -5.05, -2.92, 0.02, WT - 0.06, 0x6a7078);
  k.cyl(0.02, 0.02, 0.28, -5.4, WT + 0.14, -3.3, 0xd0d0d0, 6); k.box(0.02, 0.02, 0.18, -5.4, WT + 0.27, -3.22, 0xd0d0d0);
  k.cyl(0.03, 0.03, 0.2, -5.0, WT + 0.1, -3.32, 0x3ac83a, 8); k.cyl(0.05, 0.04, 0.09, -5.7, 1.06, -3.38, 0xc86a3a, 8); k.parts.push(part(new THREE.IcosahedronGeometry(0.08, 0), RED, [-5.7, 1.16, -3.38]));   // a poinsettia on the sill
  k.box(0.3, 0.4, 0.02, -4.82, 0.6, -2.81, 0xf4f4f4); note('KEEP CALM AND ASK NAN', 0.28, 0.32, -4.82, 0.6, -2.795, 'z+', '#e8f0ff', '#1a3a8a', 34);   // tea towel on the cupboard door
  // the kettle, toaster, bread bin, mugs, the tin of biscuits
  k.cyl(0.1, 0.12, 0.24, -4.45, WT + 0.12, -3.15, 0xe8e8ea, 14); k.box(0.04, 0.16, 0.12, -4.45, WT + 0.16, -3.0, 0x2a2a2a); k.box(0.2, 0.02, 0.2, -4.45, WT + 0.005, -3.15, 0x2a2a2a);
  note('KETTLE ON = 4 OF NAN\'S FRIENDS ARRIVE WITHIN 4 MINUTES', 0.42, 0.18, -4.45, 1.35, HZ0 + 0.1, 'z+', '#fffbe8', '#222', 30);
  k.box(0.3, 0.18, 0.18, -6.7, WT + 0.09, -2.0, 0xc8102e); k.box(0.24, 0.01, 0.04, -6.7, WT + 0.185, -2.0, 0x222222);
  k.box(0.36, 0.22, 0.26, -6.72, WT + 0.11, -1.6, 0xd8c8a8);
  for (let i = 0; i < 4; i++) { k.cyl(0.04, 0.035, 0.1, -6.05 + i * 0.12, WT + 0.05, -3.1, [0xf4f4f4, RED, 0x2a5aa8, 0xffd84a][i], 10); }
  // LISA: the Asda bag for life on the counter, and her note
  { const x = -6.7, z = -0.35; k.box(0.32, 0.36, 0.2, x, WT + 0.18, z, 0x5a9a2a); k.box(0.33, 0.06, 0.21, x, WT + 0.33, z, 0x4a8a22); for (const s of [-1, 1]) k.box(0.02, 0.16, 0.02, x, WT + 0.44, z + s * 0.06, 0x4a8a22);
    k.label('ASDA', 0.24, 0.1, [x + 0.162, WT + 0.2, z], [0, Math.PI / 2, 0], { bg: '#5a9a2a', fg: '#ffffff', border: null, size: 70 });
    k.box(0.08, 0.08, 0.07, x, WT + 0.38, z - 0.03, 0xffd84a); k.box(0.07, 0.12, 0.06, x, WT + 0.4, z + 0.05, 0x8a1a1a);   // shopping poking out
    note("LISA'S STAFF DISCOUNT APPLIES TO NOTHING HERE", 0.36, 0.22, HX0 + 0.095, 1.35, -0.35, 'x+', '#fffbe8', '#2a6a1a', 30); }
  // the cooker: hob, oven (lit, potatoes roasting), the turkey resting on top in its tin, pans of sprouts and gravy
  { const z = -1.0, x = -6.7, CK = 0xf4f4f0;
    R(HX0 + 0.08, z - 0.32, -6.38, z + 0.32, 0.9, 0.45, CK, { block: true }); R(HX0 + 0.08, z - 0.32, -6.36, z + 0.32, 0.02, 0.91, 0x1a1a1a, { collide: true });
    k.box(0.02, 0.45, 0.5, -6.37, 0.45, z, 0x1a1a1a); k.box(0.012, 0.3, 0.38, -6.362, 0.45, z, 0xffa040); bulb(k, -6.35, 0.45, z, 0xffb060, 0.001, 0.5);   // the oven, glowing
    k.box(0.03, 0.03, 0.46, -6.33, 0.73, z, 0xc0c0c0); k.box(0.02, 0.12, 0.6, -6.37, 0.84, z, 0xe0e0dc);
    for (let i = 0; i < 4; i++) k.cyl(0.02, 0.02, 0.02, -6.36, 0.84, z - 0.2 + i * 0.13, 0x2a2a2a, 8);
    for (let i = 0; i < 4; i++) k.parts.push(part(sph(0.05, 6, 4), 0xd8a040, [-6.6, 0.42, z - 0.12 + i * 0.08]));   // roast potatoes in the oven
    // pans
    k.cyl(0.11, 0.11, 0.14, -6.85, 0.99, z - 0.16, 0xb0b4b8, 14); for (let i = 0; i < 8; i++) k.parts.push(part(sph(0.025, 6, 4), 0x4a8a2a, [-6.85 + Math.cos(i) * 0.05, 1.06, z - 0.16 + Math.sin(i) * 0.05]));   // sprouts
    k.box(0.22, 0.02, 0.03, -6.68, 0.99, z - 0.16, 0x2a2a2a);
    k.cyl(0.08, 0.08, 0.12, -6.85, 0.98, z + 0.18, 0xb0b4b8, 12); k.cyl(0.075, 0.075, 0.01, -6.85, 1.04, z + 0.18, 0x5a2a14, 12);   // gravy
    // the extractor hood, and a sign about the turkey
    k.box(0.5, 0.15, 0.62, HX0 + 0.33, 1.68, z, 0xc8ccd0); k.box(0.24, 0.6, 0.3, HX0 + 0.2, 2.05, z, 0xc8ccd0);
    note('GRAVY: KAREN. NO, LISA. NO, KAREN. (NAN IS DOING IT.)', 0.36, 0.14, HX0 + 0.1, 1.32, z - 0.62, 'x+', '#fffbe8', '#5a2a14', 30);
    note('TURKEY IN: 9AM. TURKEY OUT: WHEN NAN SAYS.', 0.4, 0.2, HX0 + 0.1, 1.32, z, 'x+', '#fff2e0', '#8a1a1a', 34);
    k.spawns.push(new THREE.Vector3(-6.75, 1.0, z));
  }
  // the turkey: out to rest on the worktop by the cooker, in its tin, foil half off
  { const x = -6.68, z = -1.85, y = WT; k.box(0.46, 0.06, 0.34, x, y + 0.03, z, 0x9aa0a8); k.box(0.42, 0.02, 0.3, x, y + 0.05, z, 0x6a3a14);
    k.parts.push(part(sph(0.16, 14, 10), 0xc0742c, [x, y + 0.15, z], [0, 0, 0], [1.3, 0.85, 1])); for (const s of [-1, 1]) { k.parts.push(part(sph(0.06, 8, 6), 0xb0642a, [x + 0.15, y + 0.12, z + s * 0.1], [0, 0, 0], [1.6, 0.8, 0.8])); k.parts.push(part(cyl(0.012, 0.012, 0.06, 5), 0xf4f0e6, [x + 0.25, y + 0.13, z + s * 0.1], [0, 0, Math.PI / 2])); }
    k.parts.push(part(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI, 0, Math.PI / 2), 0xd8dce0, [x - 0.05, y + 0.12, z], [0, -Math.PI / 2, 0], [1.2, 0.9, 1]));   // the foil tent, half off
    k.spawns.push(new THREE.Vector3(x, y + 0.32, z)); }
  // the fridge-freezer, covered in magnets and notes
  { const x0 = HX0 + 0.08, x1 = -6.33, z0 = -0.02, z1 = 0.52, H = 1.85, FX = x1;
    R(x0, z0, x1, z1, H, H / 2, 0xf4f4f4, { block: true, collide: true }); k.box(0.012, 0.012, z1 - z0 - 0.02, FX + 0.006, 1.15, (z0 + z1) / 2, 0xb0b0b0);
    k.box(0.03, 0.5, 0.03, FX + 0.02, 1.45, z0 + 0.06, 0xc8c8c8); k.box(0.03, 0.35, 0.03, FX + 0.02, 0.85, z0 + 0.06, 0xc8c8c8);
    note('DINNER AT 2. NAN GETS HANGRY AT 2:01', 0.42, 0.2, FX + 0.012, 1.6, 0.27, 'x+', '#fff3c0', '#c8102e', 40, '#c8102e');
    note("SOPHIE'S TRAIN BACK TO LONDON: 6:42 (DON'T MISS IT AGAIN)", 0.42, 0.16, FX + 0.012, 1.33, 0.25, 'x+', '#e0f0ff', '#1a3a8a', 32);
    note("TOMMY: NO 'SYNERGY' AT THE DINNER TABLE", 0.36, 0.12, FX + 0.012, 0.98, 0.28, 'x+', '#ffe6f0', '#6a1a4a', 30);
    note('PAUL: THE QUIZMASTER IS ALWAYS RIGHT. YES, EVEN THAT ONE.', 0.4, 0.16, FX + 0.012, 0.72, 0.27, 'x+', '#e8ffe0', '#1a5a1a', 30);
    note('CHARLI: YES, YOU LITERALLY SAID THAT', 0.36, 0.12, FX + 0.012, 0.46, 0.26, 'x+', '#fff', '#8a1aa0', 30);
    for (const [y, z, c] of [[1.78, 0.05, RED], [1.75, 0.45, 0x1e88e5], [1.18, 0.07, 0xffd84a], [1.12, 0.46, 0x4caf50], [0.85, 0.47, 0xff7a00], [0.3, 0.1, 0x8a1aa0], [0.28, 0.42, RED]]) k.box(0.02, 0.05, 0.05, FX + 0.012, y, z, c);
    k.box(0.02, 0.16, 0.12, FX + 0.012, 0.22, 0.27, 0xd8c8a8); k.box(0.022, 0.13, 0.1, FX + 0.014, 0.22, 0.27, 0x7aa0c8);   // a postcard from Benidorm
  }
  // the dining table, set for nine: cloth, runner, crackers, crowns, plates, glasses, the food
  const TX = -3.0, TZ = -1.45, TW = 2.6, TD = 1.0, TH = 0.76;
  const seat0 = k.seats.length;
  k.table(TX, TZ, TW, TD, { chairs: 4, h: TH, top: OAK, legs: DARKOAK, chairColor: DARKOAK, seat: 0xc8102e, cloth: 0xf4f0e6, spots: 3 });
  k.chair(TX - TW / 2 - 0.35, TZ, -Math.PI / 2, DARKOAK, 0xd4af37);                                          // the head of the table (Nan's)
  const dinnerSeats = k.seats.slice(seat0).map(s => ({ ...s }));
  R(TX - TW / 2 + 0.05, TZ - 0.18, TX + TW / 2 - 0.05, TZ + 0.18, 0.004, TH + 0.003, 0xa01828);               // red runner
  const NAMES = ['NAN', 'KAREN', 'PAUL', 'TOMMY', 'CHARLI', 'LISA', 'MICHAEL', 'SOPHIE', 'JIMMY'];
  // order the place cards: head first, then round the table
  const order = [dinnerSeats.length - 1, ...dinnerSeats.slice(0, -1).map((_, i) => i)];
  order.forEach((si, n) => {
    const s = dinnerSeats[si], fx = Math.sin(s.yaw), fz = Math.cos(s.yaw), px = s.x + fx * 0.48, pz = s.z + fz * 0.48;
    k.cyl(0.12, 0.11, 0.015, px, TH + 0.008, pz, 0xffffff, 16); k.cyl(0.09, 0.09, 0.004, px, TH + 0.017, pz, 0xe8f0f4, 14);   // plate
    k.parts.push(part(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 10, 1, true), [0xffd84a, RED, 0x2a8a4a, 0x1e88e5, 0xe86aa0][n % 5], [px, TH + 0.045, pz]));   // a paper crown on the plate
    const ry = Math.atan2(fx, fz), cx = Math.cos(ry), sx = Math.sin(ry);
    k.box(0.04, 0.04, 0.24, px + cx * 0.16, TH + 0.02, pz - sx * 0.16, n % 2 ? RED : GREEN, { rot: [0, ry, 0] });   // cracker
    for (const e of [-1, 1]) k.box(0.03, 0.03, 0.04, px + cx * 0.16 + sx * e * 0.13, TH + 0.02, pz - sx * 0.16 + cx * e * 0.13, GOLD, { rot: [0, ry, 0] });
    k.box(0.015, 0.004, 0.17, px - cx * 0.15, TH + 0.004, pz + sx * 0.15, 0xc0c0c0, { rot: [0, ry, 0] }); k.box(0.015, 0.004, 0.17, px + cx * 0.15 + fx * 0.02, TH + 0.004, pz - sx * 0.15 + fz * 0.02, 0xc0c0c0, { rot: [0, ry, 0] });   // knife + fork
    k.cyl(0.03, 0.025, 0.11, px + fx * 0.16 + cx * 0.13, TH + 0.055, pz + fz * 0.16 - sx * 0.13, 0xd8eef6, 8);                // glass
    k.cyl(0.026, 0.022, 0.05, px + fx * 0.16 + cx * 0.13, TH + 0.03, pz + fz * 0.16 - sx * 0.13, n === 0 ? 0x6a3a1a : n % 3 ? 0xf0e0a0 : 0x8a1a2a, 8);   // ...with a drink in
    k.label(NAMES[n] === 'JIMMY' ? 'JIMMY (TALL CHAIR)' : NAMES[n] === 'NAN' ? 'NAN (THE BOSS)' : NAMES[n], 0.16, 0.05, [px - fx * 0.15, TH + 0.035, pz - fz * 0.15], yxz(-0.5, ry + Math.PI), { bg: '#ffffff', fg: '#8a1a1a', border: '#d4af37', size: 40 });
  });
  // the food down the middle
  { const y = TH + 0.004;
    k.cyl(0.16, 0.13, 0.05, TX - 0.85, y + 0.025, TZ, 0xf4f4f4, 16); for (let i = 0; i < 12; i++) k.parts.push(part(sph(0.03, 6, 4), 0xd89a3a, [TX - 0.85 + Math.cos(i * 2.4) * 0.09 * (i % 3 / 2 + 0.3), y + 0.07, TZ + Math.sin(i * 2.4) * 0.09 * (i % 3 / 2 + 0.3)], [0, 0, 0], [1.3, 0.9, 1]));   // roast potatoes
    k.cyl(0.12, 0.1, 0.05, TX - 0.45, y + 0.025, TZ + 0.12, 0xf4f4f4, 14); for (let i = 0; i < 14; i++) k.parts.push(part(sph(0.022, 6, 4), 0x4a8a2a, [TX - 0.45 + Math.cos(i * 2.1) * 0.07 * ((i % 4) / 3), y + 0.06, TZ + 0.12 + Math.sin(i * 2.1) * 0.07 * ((i % 4) / 3)]));   // sprouts
    R(TX + 0.5, TZ - 0.12, TX + 0.86, TZ + 0.12, 0.03, y + 0.015, 0xf4f4f4); for (let i = 0; i < 8; i++) { k.cyl(0.018, 0.018, 0.08, TX + 0.54 + (i % 4) * 0.09, y + 0.05, TZ - 0.05 + Math.floor(i / 4) * 0.1, 0xc86a5a, 6); k.box(0.04, 0.03, 0.035, TX + 0.54 + (i % 4) * 0.09, y + 0.05, TZ - 0.05 + Math.floor(i / 4) * 0.1, 0xe8b080); }   // pigs in blankets
    k.cyl(0.11, 0.09, 0.045, TX + 1.0, y + 0.022, TZ - 0.05, 0xf4f4f4, 14); for (let i = 0; i < 10; i++) k.box(0.015, 0.015, 0.07, TX + 1.0 + Math.cos(i) * 0.05, y + 0.055, TZ - 0.05 + Math.sin(i) * 0.04, 0xff8a1a, { rot: [0, i, 0] });   // carrots
    // the gravy boat
    k.parts.push(part(sph(0.07, 10, 6), 0xf4f4f4, [TX + 0.25, y + 0.05, TZ + 0.2], [0, 0, 0], [1.6, 0.7, 0.9])); k.cyl(0.05, 0.05, 0.01, TX + 0.25, y + 0.002, TZ + 0.2, 0xf4f4f4, 10); k.box(0.06, 0.02, 0.03, TX + 0.36, y + 0.08, TZ + 0.2, 0xf4f4f4); k.cyl(0.07, 0.07, 0.005, TX + 0.25, y + 0.085, TZ + 0.2, 0x5a2a14, 10);
    // the centrepiece: a holly ring with three red candles (lit)
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; k.parts.push(part(new THREE.IcosahedronGeometry(0.035, 0), i % 3 ? 0x1e5a2a : 0x2a6a32, [TX - 0.05 + Math.cos(a) * 0.13, y + 0.025, TZ - 0.12 + Math.sin(a) * 0.13])); if (i % 3 === 0) k.parts.push(part(sph(0.012, 5, 4), RED, [TX - 0.05 + Math.cos(a) * 0.13, y + 0.06, TZ - 0.12 + Math.sin(a) * 0.13])); }
    for (let i = 0; i < 3; i++) { const a = i / 3 * 6.28; const cx = TX - 0.05 + Math.cos(a) * 0.06, cz = TZ - 0.12 + Math.sin(a) * 0.06; k.cyl(0.022, 0.022, 0.18 - i * 0.03, cx, y + 0.09 - i * 0.015, cz, RED, 8); bulb(k, cx, y + 0.2 - i * 0.03, cz, 0xffc060, 0.012, 0.12); }
    // salt + pepper, a bottle of red, the cranberry sauce, a Christmas pudding waiting
    k.cyl(0.02, 0.02, 0.07, TX + 0.75, y + 0.035, TZ + 0.25, 0xf4f4f4, 8); k.cyl(0.02, 0.02, 0.07, TX + 0.8, y + 0.035, TZ + 0.25, 0x3a3a3a, 8);
    k.cyl(0.035, 0.035, 0.22, TX - 1.1, y + 0.11, TZ + 0.25, 0x3a0a14, 10); k.cyl(0.012, 0.016, 0.08, TX - 1.1, y + 0.26, TZ + 0.25, 0x3a0a14, 6);
    k.cyl(0.05, 0.04, 0.05, TX + 0.25, y + 0.025, TZ - 0.22, 0x9a1a2a, 10);
    for (const [x, z] of [[TX - 0.85, TZ], [TX + 0.68, TZ], [TX - 0.45, TZ + 0.12], [TX + 1.0, TZ - 0.05]]) k.spawns.push(new THREE.Vector3(x, TH + 0.1, z));
  }
  // the Christmas pudding on the worktop
  { const x = -5.4, z = -2.95 + 0.05; k.cyl(0.13, 0.12, 0.02, x + 0.6, WT + 0.01, z, 0xf4f4f4, 14); k.parts.push(part(new THREE.SphereGeometry(0.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0x3a1a0e, [x + 0.6, WT + 0.02, z])); k.parts.push(part(new THREE.SphereGeometry(0.102, 12, 4, 0, Math.PI * 2, 0, 0.6), 0xf4f0e0, [x + 0.6, WT + 0.02, z])); for (let i = 0; i < 3; i++) k.parts.push(part(new THREE.IcosahedronGeometry(0.02, 0), i ? GREEN : RED, [x + 0.6 + (i - 1) * 0.02, WT + 0.13, z]));
    k.spawns.push(new THREE.Vector3(x + 0.6, WT + 0.15, z), new THREE.Vector3(-6.7, WT + 0.1, -2.7), new THREE.Vector3(-4.9, WT + 0.1, -3.1)); }
  // on the walls: the HANGRY-O-METER, the BREAK GLASS box, the calendar, a clock, the Christmas cards on a string
  { const zf = 0.545;
    k.parts.push(part(cyl(0.33, 0.33, 0.04, 28), 0x8a6a3a, [-4.45, 1.62, zf - 0.02], [Math.PI / 2, 0, 0])); { const m = new THREE.Mesh(new THREE.CircleGeometry(0.3, 32), new THREE.MeshLambertMaterial({ map: hangryTex() })); m.position.set(-4.45, 1.62, zf - 0.045); m.rotation.y = Math.PI; scene.add(m); }
    // IN CASE OF HANGRY NAN: BREAK GLASS (Quality Street inside)
    const bx = -3.35; R(bx - 0.25, zf - 0.02, bx + 0.25, zf, 0.4, 1.55, 0x8a0a1a); R(bx - 0.25, zf - 0.13, bx + 0.25, zf, 0.04, 1.37, RED); R(bx - 0.25, zf - 0.13, bx + 0.25, zf, 0.06, 1.72, RED); for (const sx of [-1, 1]) R(bx + sx * 0.23 - 0.02, zf - 0.13, bx + sx * 0.23 + 0.02, zf, 0.4, 1.55, RED);
    for (let i = 0; i < 18; i++) k.box(0.05, 0.03, 0.03, bx - 0.18 + (i % 6) * 0.07, 1.43 + Math.floor(i / 6) * 0.06, zf - 0.06, [0x8a1aa0, 0xffd84a, 0x2a8a4a, RED, 0x1e88e5, 0xff7a00][i % 6], { rot: [0, 0, (i % 3 - 1) * 0.5] });
    glassQuad([bx - 0.21, 1.37, zf - 0.125], [bx + 0.21, 1.37, zf - 0.125], [bx + 0.21, 1.62, zf - 0.125], [bx - 0.21, 1.62, zf - 0.125]);
    sign('IN CASE OF HANGRY NAN: BREAK GLASS', 0.46, 0.1, bx, 1.69, zf - 0.135, 'z-', { bg: '#c8102e', fg: '#ffffff', border: null, size: 40 });
    k.box(0.03, 0.12, 0.03, bx + 0.32, 1.45, zf - 0.03, 0x8a8a8a); k.box(0.1, 0.03, 0.04, bx + 0.32, 1.52, zf - 0.03, 0x5a5a5a);   // the little hammer
    note('(QUALITY STREETS INSIDE. NOT THE COCONUT ONES.)', 0.42, 0.07, bx, 1.3, zf - 0.012, 'z-', '#ffffff', '#c8102e', 30);
    k.label('calendar', 0.52, 0.65, [-2.35, 1.5, zf - 0.012], [0, Math.PI, 0], { tex: calendarTex() }); k.box(0.54, 0.03, 0.02, -2.35, 1.835, zf - 0.01, 0x8a1a1a);
    k.parts.push(part(cyl(0.15, 0.15, 0.04, 20), 0x1a1a1a, [-5.0, 2.05, zf - 0.02], [Math.PI / 2, 0, 0])); { const m = new THREE.Mesh(new THREE.CircleGeometry(0.13, 24), new THREE.MeshLambertMaterial({ map: clockTex() })); m.position.set(-5.0, 2.05, zf - 0.045); m.rotation.y = Math.PI; scene.add(m); }
    note('1:58. TWO MINUTES.', 0.3, 0.06, -5.0, 1.84, zf - 0.012, 'z-', '#fffbe8', '#c8102e', 34);
    sign("NAN'S KITCHEN: OPEN 24 HOURS (FOR TEA)", 1.0, 0.22, -3.0, 2.12, HZ0 + 0.1, 'z+', { bg: '#f4ecd8', fg: '#2a5a3a', border: '#2a5a3a', size: 40 });
    // the cards on a string across the dining window wall
    cardString(k, [-3.9, 2.0, HZ0 + 0.11], [-1.5, 2.0, HZ0 + 0.11], 'x', 1, rnd, 14);
    cardString(k, [-0.57, 1.95, -0.95], [-0.57, 1.95, 0.45], 'z', -1, rnd, 8);
  }
  // pendant light over the table, a radiator, sockets, a pelmet + curtains at the dining window
  k.cyl(0.008, 0.008, 0.5, TX, CEIL - 0.25, TZ, 0x222222, 4); k.cyl(0.08, 0.28, 0.2, TX, CEIL - 0.55, TZ, 0xd8b870, 18); k.lamp(TX, CEIL - 0.62, TZ, 0xfff0d0, 0.06); k.pool(TX, TH + 0.01, TZ, 1.4, 0xffc070);
  radiator('x', HZ0 + 0.086, -1.2, 0.8, 1);
  { const dt = canvasTex(256, 192, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a6ad8'; g.lineWidth = 4; g.strokeRect(70, 120, 60, 60); g.beginPath(); g.moveTo(60, 120); g.lineTo(100, 90); g.lineTo(140, 120); g.stroke();
      g.strokeStyle = '#c8102e'; g.beginPath(); g.moveTo(190, 180); g.lineTo(190, 20); g.stroke(); g.beginPath(); g.arc(190, 14, 10, 0, 7); g.stroke(); g.beginPath(); g.moveTo(190, 60); g.lineTo(165, 90); g.moveTo(190, 60); g.lineTo(215, 90); g.stroke();
      g.fillStyle = '#ffd400'; g.beginPath(); g.arc(30, 30, 18, 0, 7); g.fill(); g.fillStyle = '#111'; g.font = '700 15px "Comic Sans MS", Arial'; g.fillText('MR JIMMY', 160, 40); g.fillText('(TALLER THAN', 14, 70); g.fillText('THE SCHOOL)', 14, 88); g.fillText('from Year 3 xx', 20, 186); });
    k.label('drawing', 0.4, 0.3, [-1.0, 1.45, HZ0 + 0.094], [0, 0, 0.04], { tex: dt }); k.box(0.03, 0.03, 0.01, -1.0, 1.6, HZ0 + 0.096, 0xd8b84a); }
  for (const [axis, c, a, d] of [['x', HZ0 + 0.086, -4.3, 1], ['z', HX0 + 0.085, -2.2, 1], ['x', 0.545, -1.5, -1]]) socket(axis, c, a, WT + 0.2, d);
  for (const s of [-1, 1]) k.box(0.3, 1.6, 0.06, -2.7 + s * 0.85, 1.4, HZ0 + 0.15, 0x2a5a3a); k.box(2.1, 0.12, 0.08, -2.7, 2.15, HZ0 + 0.15, 0x2a5a3a);
  k.light(TX, 2.2, TZ, 0xfff0d8, 3.2, 7); k.light(-5.6, 2.2, -1.6, 0xfff4e8, 2.2, 5);

  // ======================================================== LOUNGE (x -0.5 .. 7, z -3.5 .. 3.5): the quiz room
  trim('x', HZ0 + 0.086, -0.44, 3.2, 1); trim('x', HZ0 + 0.086, 4.6, HX1 - 0.09, 1); trim('z', HX1 - 0.086, HZ0 + 0.09, HZ1 - 0.09, -1); trim('x', HZ1 - 0.086, -0.44, 2.0, -1); trim('x', HZ1 - 0.086, 5.0, HX1 - 0.09, -1);
  trim('z', -0.445, HZ0 + 0.09, -3.0, 1); trim('z', -0.445, -1.0, 2.25, 1); trim('z', -0.445, 3.35, HZ1 - 0.09, 1);
  // a feature wall (regency stripes behind the fire), a dado rail
  k.texBox(0.008, CEIL - 0.1, HZ1 - HZ0 - 0.2, HX1 - 0.09, 0.05 + (CEIL - 0.1) / 2, 0, wallpaperTex('#e8d8c0', 'rgba(150,90,80,0.35)'), { tile: 0.8 });
  // the rug
  k.box(3.4, 0.012, 2.6, 3.4, 0.01, -0.3, 0x2a3a5a); k.box(3.2, 0.013, 2.4, 3.4, 0.011, -0.3, 0xc8b890); k.box(2.6, 0.014, 1.8, 3.4, 0.012, -0.3, 0x8a2a3a);
  // ---- the TV in the corner on its unit (screen plain and dark: the quiz is drawn on it)
  const TVX = 6.3, TVZ = -2.8, TVY = 1.2, TVW = 1.62, TVH = 0.92, TVR = -Math.PI / 4;
  { const f = [-Math.SQRT1_2, Math.SQRT1_2];
    k.box(1.5, 0.52, 0.45, 6.33, 0.26, -2.83, 0x3a2a1e, { rot: [0, TVR, 0] }); k.box(1.54, 0.03, 0.48, 6.33, 0.535, -2.83, 0x2a1e14, { rot: [0, TVR, 0] });
    k.blockers.push({ x0: 5.65, x1: HX1, z0: HZ0, z1: -2.15, y1: 0.55 }); k.colliders.push({ min: new THREE.Vector3(5.9, 0.5, -3.3), max: new THREE.Vector3(6.8, 0.56, -2.4) });
    for (const s of [-1, 1]) k.box(0.62, 0.36, 0.01, 6.33 + f[0] * 0.231 + s * 0.37 * Math.SQRT1_2, 0.26, -2.83 + f[1] * 0.231 + s * 0.37 * Math.SQRT1_2, 0x4a3426, { rot: [0, TVR, 0] });   // doors
    k.box(TVW + 0.04, TVH + 0.04, 0.05, TVX, TVY, TVZ, 0x111111, { rot: [0, TVR, 0] });
    k.box(0.08, 0.3, 0.05, TVX + 0.03, 0.7, TVZ - 0.03, 0x1a1a1a, { rot: [0, TVR, 0] }); k.box(0.45, 0.02, 0.25, TVX + 0.0, 0.56, TVZ - 0.0, 0x1a1a1a, { rot: [0, TVR, 0] });
    k.box(0.9, 0.07, 0.09, 6.33 + f[0] * 0.15, 0.59, -2.83 + f[1] * 0.15, 0x222222, { rot: [0, TVR, 0] });                                // soundbar
    k.box(0.3, 0.05, 0.22, 6.58, 0.58, -2.95, 0x2a2a2a, { rot: [0, TVR + 0.2, 0] }); k.box(0.04, 0.01, 0.01, 6.5, 0.61, -2.88, 0x3aff3a);   // the TV box
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(TVW - 0.04, TVH - 0.04), new THREE.MeshBasicMaterial({ color: 0x0b0e14 }));
    scr.position.set(TVX + f[0] * 0.027, TVY, TVZ + f[1] * 0.027); scr.rotation.y = TVR; scene.add(scr); scr.userData.tv = { w: TVW - 0.04, h: TVH - 0.04 };
    // tinsel draped along the top of the TV, cards stood on the unit
    for (let i = 0; i < 20; i++) { const t = (i / 19 - 0.5) * TVW; k.parts.push(part(new THREE.IcosahedronGeometry(0.03, 0), i % 2 ? 0xd8b84a : 0xc8102e, [TVX + Math.SQRT1_2 * t, TVY + TVH / 2 + 0.03 - Math.sin((i / 19) * Math.PI) * 0.02, TVZ + Math.SQRT1_2 * t])); }
    note('REMOTE: NAN\'S. ASK.', 0.24, 0.07, 6.33 + f[0] * 0.235, 0.6, -2.83 + f[1] * 0.235, -Math.PI / 4, '#fffbe8', '#c8102e', 34);
    this_room_tv = { x: scr.position.x, y: TVY, z: scr.position.z, ry: TVR, w: TVW - 0.04, h: TVH - 0.04 };
  }
  // ---- NAN'S THRONE: her armchair by the telly, the crocheted blanket, the side table with her chocolate
  const NAN = { x: 6.25, z: -1.3 }, NANYAW = Math.atan2(3.0 - NAN.x, 0.3 - NAN.z);     // facing the room
  const seatN = k.seats.length;
  sofa(k, { x: NAN.x, z: NAN.z, len: 0.98, depth: 0.92, ry: NANYAW - Math.PI, color: 0xa85a6a, seats: 1, pillows: 1 });
  const hostSeat = { ...k.seats[seatN] };
  { const fx = Math.sin(NANYAW), fz = Math.cos(NANYAW), bt = blanketTex();
    texRot(0.62, 0.66, 0.03, NAN.x - fx * 0.3, 0.72, NAN.z - fz * 0.3, [-0.16, NANYAW, 0], bt);                // over the back
    texRot(0.6, 0.02, 0.52, NAN.x - fx * 0.02, 0.475, NAN.z - fz * 0.02, [0, NANYAW, 0], bt);                   // ...and on the seat
    texRot(0.6, 0.3, 0.02, NAN.x + fx * 0.26, 0.36, NAN.z + fz * 0.26, [0.15, NANYAW, 0], bt);                  // ...over the front
    k.box(0.04, 0.9, 0.04, NAN.x + 0.42, 0.45, NAN.z + 0.5, 0x5a3a20, { rot: [0.1, 0, -0.12] }); k.box(0.14, 0.04, 0.04, NAN.x + 0.39, 0.9, NAN.z + 0.5, 0x5a3a20);   // walking stick
    for (const s of [-1, 1]) k.parts.push(part(sph(0.07, 8, 6), 0xe86aa0, [NAN.x + fx * 0.65 + s * 0.09, 0.04, NAN.z + fz * 0.65], [0, NANYAW, 0], [0.7, 0.45, 1.5]));   // her slippers
    sign("NAN'S THRONE. RESERVED. FOREVER.", 0.42, 0.12, NAN.x - fx * 0.45, 1.15, NAN.z - fz * 0.45, NANYAW, { bg: '#ffd84a', fg: '#6a1a2a', border: '#6a1a2a', size: 40 });
  }
  const SIDE = { x: 6.5, z: -0.42 };
  k.cyl(0.24, 0.24, 0.03, SIDE.x, 0.56, SIDE.z, 0x6a4428, 18, { collide: true }); k.cyl(0.03, 0.04, 0.54, SIDE.x, 0.27, SIDE.z, 0x5a3a20, 8); k.cyl(0.16, 0.18, 0.03, SIDE.x, 0.015, SIDE.z, 0x5a3a20, 12);
  k.blockers.push({ x0: SIDE.x - 0.24, x1: SIDE.x + 0.24, z0: SIDE.z - 0.24, z1: SIDE.z + 0.24, y1: 0.58 });
  k.cyl(0.12, 0.12, 0.08, SIDE.x + 0.04, 0.615, SIDE.z - 0.04, 0x6a1aa0, 20); k.cyl(0.125, 0.125, 0.02, SIDE.x + 0.04, 0.66, SIDE.z - 0.04, 0xd4af37, 20);   // THE TIN
  k.label("NAN'S", 0.16, 0.06, [SIDE.x + 0.04, 0.672, SIDE.z - 0.04], [-Math.PI / 2, 0, Math.PI / 2], { bg: '#6a1aa0', fg: '#ffd84a', border: null, size: 60 });
  note("NAN'S CHOCOLATE. NOT YOURS. NOT EVEN AT CHRISTMAS.", 0.22, 0.12, SIDE.x - 0.17, 0.65, SIDE.z + 0.06, -Math.PI / 2 + 0.3, '#ffffff', '#c8102e', 32, '#c8102e');
  k.cyl(0.04, 0.035, 0.09, SIDE.x - 0.08, 0.62, SIDE.z + 0.13, 0xf4f4f4, 10); k.cyl(0.034, 0.034, 0.005, SIDE.x - 0.08, 0.66, SIDE.z + 0.13, 0x8a5a3a, 10);   // a cup of tea
  k.box(0.12, 0.015, 0.05, SIDE.x + 0.05, 0.585, SIDE.z + 0.15, 0x2a2a2a);                                    // glasses case
  for (let i = 0; i < 4; i++) k.box(0.05, 0.02, 0.03, SIDE.x - 0.12 + i * 0.05, 0.585, SIDE.z - 0.15, [0x8a1aa0, 0xffd84a, 0x2a8a4a, RED][i], { rot: [0, i, 0] });   // the wrappers
  const STASH = { x: SIDE.x + 0.04, y: 0.68, z: SIDE.z - 0.04 };
  // ---- the electric fire: a cream surround, the fake flames, the mantel covered in cards, stockings, a big photo
  { const FZ = 0.8, FXw = HX1 - 0.09;
    R(FXw - 0.18, FZ - 0.68, FXw, FZ + 0.68, 1.04, 0.52, 0xece4d4, { block: true }); R(FXw - 0.22, FZ - 0.78, FXw, FZ + 0.78, 0.07, 1.07, 0xf4ecdc, { collide: true });
    R(FXw - 0.19, FZ - 0.4, FXw - 0.17, FZ + 0.4, 0.5, 0.42, 0x1a1210); R(FXw - 0.2, FZ - 0.44, FXw - 0.18, FZ + 0.44, 0.04, 0.69, 0xc9a24a);
    R(FXw - 0.55, FZ - 0.8, FXw, FZ + 0.8, 0.05, 0.025, 0xd8d0c4, { block: true });                          // hearth
    { const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.38), new THREE.MeshBasicMaterial({ map: flameTex(), color: 0xffffff })); fl.position.set(FXw - 0.205, 0.38, FZ); fl.rotation.y = -Math.PI / 2; scene.add(fl); fl.userData.flame = true; this_flame = fl; }
    k.halo(FXw - 0.3, 0.4, FZ, 1.1, 0xff8030); k.pool(FXw - 0.8, 0.01, FZ, 1.8, 0xff9040);
    k.light(FXw - 0.6, 0.6, FZ, 0xff9a40, 2.4, 4.5, 0.5);
    // the cards on the mantel: open cards stood up in a row (two leaves each)
    for (let i = 0; i < 13; i++) { const z = FZ - 0.7 + i * 0.11, y = 1.105, hh = 0.13 + (i % 3) * 0.03, c = [0xf4f0e6, RED, GREEN, 0x1e3a8a, 0xffffff, GOLD][i % 6];
      for (const s of [-1, 1]) k.box(0.005, hh, 0.07, FXw - 0.12 + s * 0.02, y + hh / 2, z + s * 0.03, c, { rot: [0, s * 0.5, 0] }); }
    note('TO JOAN, LOVE FROM PAT, MAUREEN, BRENDA, SHEILA, VAL, DOREEN, RON, BRIAN & DOT ... (CONTINUED ON BACK)', 0.22, 0.16, FXw - 0.105, 1.21, FZ + 0.72, -Math.PI / 2, '#fffbe8', '#8a1a1a', 26, '#d4af37');
    // a garland along the mantel with lights
    for (let i = 0; i < 22; i++) k.parts.push(part(new THREE.IcosahedronGeometry(0.045, 0), i % 2 ? 0x1e5a2a : 0x2a6a32, [FXw - 0.22, 1.06 - Math.sin(i / 21 * Math.PI) * 0.06, FZ - 0.76 + i * 0.072]));
    lightString(k, [[FXw - 0.25, 1.05, FZ - 0.76], [FXw - 0.25, 1.05, FZ + 0.76]], { spacing: 0.1, sag: 0.06, colors: [0xffd070, 0xff4040, 0xffd070, 0x60a0ff], wire: null });
    // stockings hanging off the mantel, with names
    ['JOAN', 'LISA', 'KAREN', 'JIMMY (XXL)'].forEach((nm, i) => { const z = FZ - 0.5 + i * 0.33, big = i === 3 ? 1.35 : 1;
      k.box(0.06, 0.32 * big, 0.14, FXw - 0.26, 0.88 - 0.16 * big, z, RED); k.box(0.07, 0.07, 0.15, FXw - 0.26, 0.98, z, 0xf8f8f8); k.box(0.06, 0.08, 0.14, FXw - 0.26, 0.88 - 0.3 * big, z + 0.07, RED);
      k.label(nm, 0.13, 0.045, [FXw - 0.296, 0.98, z], [0, -Math.PI / 2, 0], { bg: '#ffffff', fg: '#c8102e', border: null, size: 44 }); });
    fam('z', FXw - 0.005, FZ, 1.75, 0.9, 0.6, -1, ['joan', 'karen', 'lisa'], 'xmas', 'Joan & her girls · Christmas', GOLD);
    note('MICHAEL: DO NOT DELIVER THE CHRISTMAS CARDS. YOU\'RE RETIRED.', 0.5, 0.2, FXw - 0.005, 2.22, FZ, 'x-', '#c8102e', '#ffffff', 34, '#ffd84a');
  }
  // ---- the glass display cabinet of ornaments, photos on top
  { const CZ0 = 2.3, CZ1 = 3.3, CX0 = HX1 - 0.5, CX1 = HX1 - 0.09, H = 1.75, W = OAK;
    R(CX0, CZ0, CX1, CZ1, 0.3, 0.15, W, { block: true }); R(CX0, CZ0, CX1, CZ1, 0.05, H - 0.025, W, { collide: true }); R(CX1 - 0.02, CZ0, CX1, CZ1, H, H / 2, 0x6a4428);
    for (const z of [CZ0 + 0.02, CZ1 - 0.02]) R(CX0, z - 0.02, CX1, z + 0.02, H, H / 2, W);
    k.box(0.03, H - 0.35, 0.03, CX0 + 0.015, 0.3 + (H - 0.35) / 2, (CZ0 + CZ1) / 2, W);
    glassQuad([CX0, 0.3, CZ0 + 0.04], [CX0, 0.3, CZ1 - 0.04], [CX0, H - 0.05, CZ1 - 0.04], [CX0, H - 0.05, CZ0 + 0.04]);
    glassQuad([CX0, 0.3, CZ0 + 0.04], [CX1, 0.3, CZ0 + 0.04], [CX1, H - 0.05, CZ0 + 0.04], [CX0, H - 0.05, CZ0 + 0.04]);
    k.blockers.push({ x0: CX0, x1: CX1, z0: CZ0, z1: CZ1, y1: H });
    for (const y of [0.72, 1.12]) R(CX0 + 0.03, CZ0 + 0.04, CX1 - 0.03, CZ1 - 0.04, 0.015, y, 0xdfeef4);
    const ORN = [0xf4f4f4, 0x6a9ad8, 0xd8b070, 0xe86aa0, 0x8ad8a0, GOLD, 0xf4e0c0];
    for (const y of [0.31, 0.73, 1.13]) for (let i = 0; i < 6; i++) { const z = CZ0 + 0.14 + i * 0.145, c = ORN[(i + Math.round(y * 10)) % ORN.length], kind = (i + Math.round(y * 7)) % 4, x = CX0 + 0.2;
      if (kind === 0) { k.cyl(0.03, 0.04, 0.12, x, y + 0.06, z, c, 8); k.parts.push(part(sph(0.03, 8, 6), c, [x, y + 0.15, z])); }          // a figurine
      else if (kind === 1) { k.cyl(0.035, 0.02, 0.14, x, y + 0.07, z, 0xe8f4fa, 8); }                                                     // a crystal glass
      else if (kind === 2) { k.parts.push(part(sph(0.05, 10, 8), c, [x, y + 0.05, z], [0, 0, 0], [1, 1.2, 1])); }                       // a toby jug / bauble
      else { k.box(0.02, 0.1, 0.08, x + 0.08, y + 0.05, z, GOLD, { rot: [0, 0, -0.15] }); } }
    standPhoto(CX0 + 0.22, H, CZ0 + 0.28, -Math.PI / 2, 0.22, 0.17, ['sophie'], 'studio', 'Sophie, London (again)');
    standPhoto(CX0 + 0.22, H, CZ0 + 0.72, -Math.PI / 2, 0.17, 0.24, ['jimmy'], 'studio', 'Jimmy (had to crouch)');
    lightString(k, [[CX0 - 0.01, H - 0.05, CZ0 + 0.05], [CX0 - 0.01, H - 0.05, CZ1 - 0.05]], { spacing: 0.1, sag: 0.03, colors: [0xffd890], wire: null });
  }
  // ---- the seats: 3-seat sofa along the left wall, 2-seater in front of the bay, the other armchair, a pouffe, two dining chairs
  const quizSeats = [];
  const take = (n0) => { for (let i = n0; i < k.seats.length; i++) quizSeats.push({ ...k.seats[i] }); };
  const SOFA_C = 0x4a5a3a;
  let n0 = k.seats.length; sofa(k, { x: 1.3, z: 0.35, len: 2.3, depth: 0.88, ry: -Math.PI / 2, color: SOFA_C, seats: 3, pillows: 2, throwCol: 0x8a2a2a }); take(n0);
  n0 = k.seats.length; sofa(k, { x: 3.4, z: 2.12, len: 1.75, depth: 0.88, ry: -0.18, color: SOFA_C, seats: 2, pillows: 2 }); take(n0);
  n0 = k.seats.length; sofa(k, { x: 5.25, z: 2.12, len: 0.95, depth: 0.88, ry: -0.3, color: SOFA_C, seats: 1, pillows: 1 }); take(n0);
  { const px = 2.6, pz = 0.4; k.cyl(0.27, 0.27, 0.36, px, 0.2, pz, 0x8a6a4a, 16); k.cyl(0.275, 0.275, 0.05, px, 0.4, pz, 0x9a7a5a, 16); k.cyl(0.27, 0.25, 0.04, px, 0.02, pz, 0x5a3a20, 16);
    k.blockers.push({ x0: px - 0.27, x1: px + 0.27, z0: pz - 0.27, z1: pz + 0.27, y1: 0.42 }); const s = { x: px, z: pz, yaw: Math.atan2(TVX - px, TVZ - pz), h: 0.43 }; k.seats.push(s); quizSeats.push({ ...s });
    k.box(0.22, 0.012, 0.3, px + 0.05, 0.43, pz + 0.05, 0xc8102e, { rot: [0, 0.4, 0] }); note('RADIO TIMES XMAS (CIRCLED BY NAN)', 0.2, 0.26, px + 0.05, 0.438, pz + 0.05, [-Math.PI / 2, 0, 0.4], '#c8102e', '#ffffff', 26); }
  for (const [cx, cz] of [[5.72, 0.62], [2.05, -2.35]]) { n0 = k.seats.length; const yaw = Math.atan2(TVX - cx, TVZ - cz); k.chair(cx, cz, yaw - Math.PI, DARKOAK, 0xc8102e); k.blockers.push({ x0: cx - 0.24, x1: cx + 0.24, z0: cz - 0.24, z1: cz + 0.24, y1: 0.95 }); take(n0); }
  // (in team order: Team Karen on the big sofa + the pouffe, Team Lisa on the 2-seater, the armchair and a dining chair; a spare chair)
  { const q = quizSeats.slice(); quizSeats.length = 0; quizSeats.push(q[0], q[1], q[2], q[6], q[3], q[4], q[5], q[7], q[8]); }
  // ...a nest of tables with a lamp by the sofa, a magazine rack, a standard lamp in the corner
  { const tx = 1.3, tz = -1.18; R(tx - 0.24, tz - 0.2, tx + 0.24, tz + 0.2, 0.55, 0.275, 0x6a4428, { block: true, collide: true }); R(tx - 0.2, tz - 0.16, tx + 0.2, tz + 0.16, 0.02, 0.2, 0x5a3a20); k.cyl(0.07, 0.09, 0.05, tx - 0.08, 0.58, tz, 0x8a8a8a, 12); k.cyl(0.012, 0.012, 0.28, tx - 0.08, 0.74, tz, GOLD, 6); k.cyl(0.09, 0.15, 0.2, tx - 0.08, 0.96, tz, 0xf4ecd8, 16); k.lamp(tx - 0.08, 0.92, tz, 0xffe2a8, 0.04);
    k.spawns.push(new THREE.Vector3(tx + 0.12, 0.62, tz)); }
  // behind the sofa: a sideboard along the wall (the good china, the drinks Nan hides from the conservatory)
  { R(-0.44, -0.6, -0.04, 1.6, 0.8, 0.4, 0x6a4428, { block: true, collide: true }); R(-0.46, -0.62, -0.02, 1.62, 0.03, 0.815, 0x5a3a20, { collide: true });
    for (let i = 0; i < 4; i++) { const z = -0.32 + i * 0.55; k.box(0.012, 0.6, 0.5, -0.035, 0.38, z, 0x7a5030); k.cyl(0.015, 0.015, 0.02, -0.025, 0.55, z, GOLD, 6); }
    for (let i = 0; i < 6; i++) k.box(0.03, 0.1 + (i % 2) * 0.05, 0.035, -0.3, 0.88 + (i % 2) * 0.025, -0.45 + i * 0.12, [0xf4f0e6, RED, GREEN, 0x1e3a8a, 0xffffff, GOLD][i], { rot: [0, 0.3 * (i % 3 - 1), 0] });   // more cards
    k.cyl(0.11, 0.08, 0.08, -0.24, 0.87, 0.55, 0xd8eef4, 14); for (let i = 0; i < 6; i++) k.parts.push(part(sph(0.03, 6, 4), [0xff8a1a, 0xd62828, 0xffd84a, 0x9ccc3a][i % 4], [-0.24 + Math.cos(i) * 0.05, 0.92, 0.55 + Math.sin(i) * 0.05]));   // a bowl of satsumas
    k.parts.push(part(new THREE.ConeGeometry(0.12, 0.35, 10), 0x1e5a2a, [-0.24, 1.0, 1.25])); for (let i = 0; i < 8; i++) bulb(k, -0.24 + Math.cos(i * 1.9) * 0.08, 0.88 + (i % 4) * 0.06, 1.25 + Math.sin(i * 1.9) * 0.08, 0xffd070, 0.012, 0.06);   // a little tabletop tree
    k.spawns.push(new THREE.Vector3(-0.24, 0.92, 0.2)); }
  k.cyl(0.015, 0.015, 1.55, 1.75, 0.78, 3.15, 0xc9a24a, 6); k.cyl(0.14, 0.17, 0.04, 1.75, 0.02, 3.15, 0xc9a24a, 12); k.cyl(0.16, 0.24, 0.3, 1.75, 1.62, 3.15, 0xf0dcb8, 14); k.lamp(1.75, 1.55, 3.15, 0xffe0a0, 0.06);
  k.blockers.push({ x0: 1.55, x1: 1.95, z0: 2.95, z1: 3.35, y1: 1.7 });
  // ---- THE TREE in the bay, presents round it
  const TREE = { x: 3.5, z: 3.86 };
  xmasTree(k, TREE.x, TREE.z, { h: 2.05, R: 0.66, rnd });
  { const ps = presents(k, TREE.x, TREE.z - 0.05, 9, rnd, 0.62); ps.slice(0, 3).forEach(([x, h, z]) => k.spawns.push(new THREE.Vector3(x, h + 0.06, z)));
    note('TO JIMMY. (ANOTHER JUMPER. SORRY.)', 0.18, 0.09, TREE.x - 0.55, 0.3, TREE.z - 0.55, -0.8, '#ffffff', '#1a3a6a', 30);
    note('TO CHARLI: THE ONE YOU "LITERALLY SAID"', 0.2, 0.09, TREE.x + 0.62, 0.28, TREE.z - 0.5, 0.8, '#ffffff', '#8a1aa0', 30); }
  // ---- the walls: family photos, the quiz board, the banner, the cards on strings, a clock, the wi-fi note
  fam('z', -0.445, 0.35, 1.5, 1.0, 0.68, 1, ['karen', 'paul', 'tommy', 'charli'], 'beach', 'Karen, Paul, Tommy & Charli · Tenerife');
  fam('z', -0.445, -0.65, 1.48, 0.42, 0.55, 1, ['tommy'], 'studio', 'Tommy · Marketing Award (for crisps)', 0x111111);
  fam('z', -0.445, 1.35, 1.48, 0.42, 0.55, 1, ['charli'], 'studio', 'Charli · "I said that first"', 0x111111);
  fam('x', HZ0 + 0.086, 1.3, 1.5, 0.8, 0.6, 1, ['lisa', 'michael', 'sophie', 'jimmy'], 'xmas', 'Lisa, Michael, Sophie & Jimmy');
  fam('x', HZ1 - 0.086, 0.3, 1.6, 0.45, 0.58, -1, ['michael'], 'studio', 'Michael · 30 years of 1st class post', 0x2a1a10);
  fam('x', HZ1 - 0.086, 1.15, 1.6, 0.6, 0.48, -1, ['joan'], 'beach', 'Nan · Sandy Bay summer BBQ');
  fam('x', HZ1 - 0.086, 6.1, 1.62, 0.55, 0.45, -1, ['karen', 'lisa'], 'studio', 'Karen & Lisa · already arguing', GOLD);
  sign('MERRY CHRISTMAS FROM SANDY BAY!', 1.9, 0.2, 3.9, 2.27, HZ0 + 0.1, 'z+', { bg: '#c8102e', fg: '#ffd84a', border: '#ffd84a', size: 60 });
  cardString(k, [-0.43, 2.05, -0.8], [-0.43, 2.05, 2.15], 'z', 1, rnd, 18); cardString(k, [0.0, 2.08, HZ0 + 0.11], [3.0, 2.08, HZ0 + 0.11], 'x', 1, rnd, 16);
  cardString(k, [5.0, 2.1, HZ1 - 0.11], [6.8, 2.1, HZ1 - 0.11], 'x', -1, rnd, 10);
  note("JIMMY: THE WIFI IS FOR NAN'S IPAD, NOT YOUR 90GB GAME UPDATE.", 0.4, 0.14, -0.035, 1.12, -0.25, 'x+', '#e8ffe0', '#1a5a1a', 30);
  note('WIFI: SANDYBAY60PLUS. NO, NAN DOES NOT KNOW WHERE THE ROUTER IS.', 0.4, 0.16, -0.435, 1.15, -1.25, 'x+', '#e0f0ff', '#1a3a8a', 30);
  // the quiz board on an easel by the telly
  { const ex = 5.05, ez = -3.05, ry = -0.35;
    for (const s of [-1, 1]) k.box(0.04, 1.7, 0.04, ex + Math.cos(ry) * s * 0.35, 0.85, ez - Math.sin(ry) * s * 0.35, DARKOAK, { rot: yxz(-0.08, ry) });
    k.box(0.04, 1.7, 0.04, ex - Math.sin(ry) * 0.25, 0.8, ez - Math.cos(ry) * 0.25, DARKOAK, { rot: yxz(0.25, ry) });
    k.box(0.9, 0.7, 0.03, ex, 1.35, ez, 0xf8f8f8, { rot: yxz(-0.08, ry) });
    k.label("NAN'S BIG CHRISTMAS QUIZ\n1. NAN IS ALWAYS RIGHT\n2. PAUL: NO ARGUING WITH THE QUIZMASTER\n3. CHARLI: YOU DID NOT 'LITERALLY SAY THAT'\n4. NO PHONES (TOMMY. SOPHIE.)\n5. LOSERS WASH UP", 0.84, 0.64, [ex + Math.sin(ry) * 0.02, 1.35, ez + Math.cos(ry) * 0.02], yxz(-0.08, ry), { bg: '#ffffff', fg: '#1a3a8a', border: '#c8102e', size: 34 });
    k.blockers.push({ x0: ex - 0.4, x1: ex + 0.4, z0: ez - 0.3, z1: ez + 0.2, y1: 1.7 });
    k.box(0.5, 0.03, 0.05, ex, 0.98, ez + 0.08, DARKOAK, { rot: [0, ry, 0] }); for (let i = 0; i < 3; i++) k.box(0.1, 0.015, 0.015, ex - 0.12 + i * 0.12, 1.0, ez + 0.09, [0x111111, RED, 0x1e88e5][i], { rot: [0, ry, 0] });
  }
  // a clock, radiator, sockets, the ceiling light, paper chains and tinsel round the ceiling, fairy lights
  k.parts.push(part(cyl(0.18, 0.18, 0.04, 20), GOLD, [-0.425, 2.05, -2.0], [0, 0, Math.PI / 2])); { const m = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), new THREE.MeshLambertMaterial({ map: clockTex() })); m.position.set(-0.4, 2.05, -2.0); m.rotation.y = Math.PI / 2; scene.add(m); }
  radiator('x', HZ0 + 0.086, 2.25, 1.4, 1); radiator('x', HZ1 - 0.086, 5.8, 1.0, -1);
  for (const [axis, c, a, d] of [['x', HZ0 + 0.086, 0.6, 1], ['z', HX1 - 0.086, -0.2, -1], ['z', -0.445, -1.6, 1], ['x', HZ1 - 0.086, 1.5, -1]]) socket(axis, c, a, 0.3, d);
  { const LX = 3.3, LZ = -0.2; k.cyl(0.008, 0.008, 0.3, LX, CEIL - 0.15, LZ, 0xc9a24a, 4); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; k.cyl(0.006, 0.006, 0.3, LX + Math.cos(a) * 0.12, CEIL - 0.36, LZ + Math.sin(a) * 0.12, 0xc9a24a, 4); k.cyl(0.05, 0.07, 0.1, LX + Math.cos(a) * 0.24, CEIL - 0.5, LZ + Math.sin(a) * 0.24, 0xf4e8d0, 10); k.lamp(LX + Math.cos(a) * 0.24, CEIL - 0.52, LZ + Math.sin(a) * 0.24, 0xfff0d0, 0.035, false); }
    k.halo(LX, CEIL - 0.5, LZ, 0.9, 0xffe0b0);
    k.light(LX, 2.1, LZ, 0xfff0d8, 3.4, 9); k.light(1.2, 1.9, -2.2, 0xffe8c8, 1.5, 5);
    // paper chains from the corners to the light
    for (const [cx, cz] of [[-0.4, -3.4], [-0.4, 3.4], [6.9, -3.4], [6.9, 3.4]]) { const n = 80; for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = cx + (LX - cx) * t, z = cz + (LZ - cz) * t, y = CEIL - 0.05 - Math.sin(t * Math.PI) * 0.25 - t * 0.12; k.box(0.045, 0.028, 0.006, x, y, z, [RED, 0x2a8a4a, 0xffd84a, 0x1e88e5, 0xe86aa0][i % 5], { rot: [0, Math.atan2(LX - cx, LZ - cz) + (i % 2 ? Math.PI / 2 : 0), 0] }); } }
    // tinsel along the coving
    const tin = (x0, z0, x1, z1, col) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.round(L / 0.07); for (let i = 0; i < n; i++) { const t = i / n; k.parts.push(part(new THREE.IcosahedronGeometry(0.03, 0), i % 3 ? col : 0xe8e8f0, [x0 + (x1 - x0) * t, CEIL - 0.1 - Math.abs(Math.sin(t * L * 1.4)) * 0.05, z0 + (z1 - z0) * t])); } };
    tin(-0.4, HZ0 + 0.13, 6.88, HZ0 + 0.13, 0xd8b84a); tin(6.88, HZ0 + 0.13, 6.88, HZ1 - 0.13, 0xc8102e); tin(-0.4, HZ1 - 0.13, 6.88, HZ1 - 0.13, 0xd8b84a); tin(-0.4, HZ0 + 0.13, -0.4, HZ1 - 0.13, 0x2a8a4a);
    tin(-6.9, HZ0 + 0.13, -0.6, HZ0 + 0.13, 0xc8102e); tin(-6.9, 0.48, -0.6, 0.48, 0xd8b84a);
  }
  lightString(k, [[-0.38, 2.28, HZ0 + 0.1], [6.85, 2.28, HZ0 + 0.1], [6.85, 2.28, HZ1 - 0.1], [5.0, 2.28, HZ1 - 0.1]], { spacing: 0.2, sag: 0.08 });
  lightString(k, [[2.0, 2.28, HZ1 - 0.1], [-0.38, 2.28, HZ1 - 0.1], [-0.38, 2.28, HZ0 + 0.1]], { spacing: 0.2, sag: 0.08, offset: 2 });
  // knitting basket by Nan's chair, a box of Celebrations, a tub of Quality Street by the sofa
  k.cyl(0.16, 0.13, 0.22, 6.55, 0.11, -2.05, 0xb8905a, 12); k.parts.push(part(sph(0.06, 8, 6), 0xe86aa0, [6.52, 0.24, -2.02])); k.parts.push(part(sph(0.05, 8, 6), 0x6a9ad8, [6.6, 0.23, -2.1]));
  k.blockers.push({ x0: 6.39, x1: 6.71, z0: -2.21, z1: -1.89, y1: 0.3 });
  k.cyl(0.13, 0.13, 0.12, 1.75, 0.07, -1.45, 0x1e5aa8, 16); k.cyl(0.135, 0.135, 0.02, 1.75, 0.14, -1.45, GOLD, 16); k.spawns.push(new THREE.Vector3(1.75, 0.2, -1.45));
  k.label('CELEBRATIONS (THE BOUNTIES ARE LEFT)', 0.2, 0.08, [1.75, 0.155, -1.45], [-Math.PI / 2, 0, 0], { bg: '#1e5aa8', fg: '#ffd84a', border: null, size: 30 });
  k.blockers.push({ x0: 1.6, x1: 1.9, z0: -1.6, z1: -1.3, y1: 0.15 });

  // ======================================================== CONSERVATORY (x 1 .. 6.6, z -7 .. -3.5)
  const CX0 = 1.0, CX1 = 6.6, CZ0 = -7.0, CZ1 = HZ0, CW = 0.62, YH = 2.62, YL = 2.22;
  k.floor(CX0, CZ0, CX1, CZ1, slabTex('#d8c8b0', '#cfbea4'), 0.004, 0.6);
  { const BR = 0xa05a3a, DT = 0.2;
    // dwarf walls (brick), with a gap for the door to the garden
    wallRun('x', CZ0, CX0 - DT / 2, 3.4, CW, [], { color: BR, t: DT }); wallRun('x', CZ0, 4.6, CX1 + DT / 2, CW, [], { color: BR, t: DT });
    wallRun('z', CX0, CZ0, CZ1, CW, [], { color: BR, t: DT }); wallRun('z', CX1, CZ0, CZ1, CW, [], { color: BR, t: DT });
    for (const [a, b, c, ax] of [[CX0, 3.4, CZ0, 'x'], [4.6, CX1, CZ0, 'x'], [CZ0, CZ1, CX0, 'z'], [CZ0, CZ1, CX1, 'z']]) ax === 'x' ? k.box(b - a + 0.04, 0.05, 0.3, (a + b) / 2, CW + 0.025, c, WHITE) : k.box(0.3, 0.05, b - a + 0.04, c, CW + 0.025, (a + b) / 2, WHITE);
    for (let y = 0.075; y < CW; y += 0.075) { k.box(CX1 - CX0, 0.01, 0.012, (CX0 + CX1) / 2, y, CZ0 - DT / 2 - 0.004, 0xd8cbb4); }
    // glass: the back (low side) and both ends, sloping up to the house; white frames
    const yAt = (z) => YL + (YH - YL) * (z - CZ0) / (CZ1 - CZ0);
    const paneX = (a0, a1) => { glassQuad([a0, CW + 0.05, CZ0], [a1, CW + 0.05, CZ0], [a1, YL, CZ0], [a0, YL, CZ0]); };
    for (let x = CX0; x < 3.4 - 0.01; x += 0.8) paneX(x, Math.min(3.4, x + 0.8)); for (let x = 4.6; x < CX1 - 0.01; x += 0.67) paneX(x, Math.min(CX1, x + 0.67));
    for (const xx of [CX0, CX1]) for (let z = CZ0; z < CZ1 - 0.01; z += 0.7) { const z1 = Math.min(CZ1, z + 0.7); glassQuad([xx, CW + 0.05, z], [xx, CW + 0.05, z1], [xx, yAt(z1), z1], [xx, yAt(z), z]); k.box(0.07, yAt(z) - CW, 0.07, xx, (yAt(z) + CW) / 2, z, WHITE); }
    for (const x of [CX0, 1.8, 2.6, 3.4, 4.6, 5.27, 5.94, CX1]) k.box(0.07, YL - CW, 0.07, x, (YL + CW) / 2, CZ0, WHITE);
    k.box(CX1 - CX0 + 0.1, 0.1, 0.12, (CX0 + CX1) / 2, YL, CZ0, WHITE); k.box(CX1 - CX0 + 0.1, 0.06, 0.07, (CX0 + CX1) / 2, 1.85, CZ0, WHITE);
    for (const xx of [CX0, CX1]) { const L = Math.hypot(CZ1 - CZ0, YH - YL); k.box(0.1, 0.1, L, xx, (YH + YL) / 2, (CZ0 + CZ1) / 2, WHITE, { rot: [-Math.atan2(YH - YL, CZ1 - CZ0), 0, 0] }); }
    // the roof: polycarbonate panels on white glazing bars
    glassQuad([CX0, YL + 0.05, CZ0 - 0.1], [CX1, YL + 0.05, CZ0 - 0.1], [CX1, YH + 0.05, CZ1], [CX0, YH + 0.05, CZ1]);
    { const L = Math.hypot(CZ1 - CZ0 + 0.1, YH - YL), ang = -Math.atan2(YH - YL, CZ1 - CZ0); for (let x = CX0; x <= CX1 + 0.01; x += 0.7) k.box(0.06, 0.09, L, x, (YH + YL) / 2 + 0.05, (CZ0 + CZ1) / 2 - 0.05, WHITE, { rot: [ang, 0, 0] }); }
    k.box(CX1 - CX0 + 0.2, 0.08, 0.12, (CX0 + CX1) / 2, YL, CZ0 - 0.14, 0x2a2a2a);                         // gutter
    // the door to the garden, swung open
    for (const z of [CZ0 - 0.05, CZ0 - 1.15]) k.box(0.06, 2.05, 0.08, 4.6, 1.025, z, WHITE); for (const y of [0.05, 0.62, 2.0]) k.box(0.06, y === 0.62 ? 0.06 : 0.1, 1.18, 4.6, y, CZ0 - 0.6, WHITE); k.box(0.07, 0.5, 1.1, 4.6, 0.32, CZ0 - 0.6, 0xf0f0ea); glassQuad([4.63, 0.2, CZ0 - 1.15], [4.63, 0.2, CZ0 - 0.05], [4.63, 1.95, CZ0 - 0.05], [4.63, 1.95, CZ0 - 1.15]);
    k.blockers.push({ x0: 4.55, x1: 4.68, z0: CZ0 - 1.2, z1: CZ0, y1: 2 });
    for (const x of [3.4, 4.6]) k.box(0.08, 2.1, 0.12, x, 1.05, CZ0, WHITE); k.box(1.28, 0.1, 0.12, 4.0, 2.1, CZ0, WHITE); glassQuad([3.4, 2.15, CZ0], [4.6, 2.15, CZ0], [4.6, YL, CZ0], [3.4, YL, CZ0]);
    // the French doors from the lounge, both open
    for (const [hx, s] of [[3.2, 1], [4.6, -1]]) { k.box(0.6, 2.05, 0.05, hx + s * 0.08, 1.025, HZ0 - 0.32, WHITE, { rot: [0, s * 1.35, 0] }); }
    k.blockers.push({ x0: 3.0, x1: 3.35, z0: HZ0 - 0.65, z1: HZ0 - 0.05, y1: 2 }, { x0: 4.45, x1: 4.8, z0: HZ0 - 0.65, z1: HZ0 - 0.05, y1: 2 });
    arch('x', HZ0, 3.2, 4.6, 2.1, 0.16);
    // pleated blinds along part of the roof, fairy lights along the bars
    for (let x = CX0 + 0.05; x < CX1 - 0.6; x += 1.4) { const L = Math.hypot(1.6, (YH - YL) * 1.6 / 3.5); k.box(0.62, 0.02, L, x + 0.35, YH - (YH - YL) * 0.5 / 3.5 - 0.32, CZ1 - 1.25, 0xe8dcc0, { rot: [-Math.atan2(YH - YL, CZ1 - CZ0), 0, 0] }); }
    for (const x of [1.7, 3.1, 4.5, 5.9]) lightString(k, [[x, YH - 0.05, CZ1 - 0.1], [x, YL + 0.02, CZ0 + 0.1]], { spacing: 0.18, sag: 0.04, colors: [0xffd890], halo: 0.07, wire: null });
    lightString(k, [[CX0 + 0.1, YL - 0.05, CZ0 + 0.08], [CX1 - 0.1, YL - 0.05, CZ0 + 0.08]], { spacing: 0.15, sag: 0.1 });
    k.light(3.9, 2.0, -5.2, 0xfff0e0, 2.2, 6);
  }
  // wicker 2-seater + two wicker chairs round a glass coffee table; plants in the corners
  { const WK = 0xc8a060;
    sofa(k, { x: 6.05, z: -5.25, len: 1.55, depth: 0.8, ry: Math.PI / 2, color: WK, seats: 2, pillows: 2 });
    sofa(k, { x: 5.0, z: -6.42, len: 0.85, depth: 0.78, ry: 0.4, color: WK, seats: 1, pillows: 1 });
    sofa(k, { x: 2.45, z: -6.4, len: 0.85, depth: 0.78, ry: -0.5, color: WK, seats: 1, pillows: 1 });
    for (let i = 0; i < 12; i++) k.box(0.012, 0.25, 0.012, 6.05 - 0.28, 0.22, -5.95 + i * 0.12, shade(WK, 0.8));   // the weave
    k.cyl(0.32, 0.32, 0.02, 5.05, 0.45, -5.15, 0xd8eef6, 20, { collide: true }); k.cyl(0.03, 0.03, 0.44, 5.05, 0.22, -5.15, 0xc8a060, 6); k.cyl(0.22, 0.22, 0.02, 5.05, 0.1, -5.15, 0xc8a060, 14);
    k.blockers.push({ x0: 4.73, x1: 5.37, z0: -5.47, z1: -4.83, y1: 0.47 });
    k.box(0.25, 0.015, 0.2, 5.0, 0.47, -5.1, 0xf4e0c0); k.spawns.push(new THREE.Vector3(5.05, 0.55, -5.15));
    pottedPlant(k, 6.2, -3.95, { s: 0.85, pot: 0xb86a3a }); pottedPlant(k, 1.4, -3.95, { s: 0.75, pot: 0xd8d0c0, kind: 'bush' }); pottedPlant(k, 1.35, -6.6, { s: 0.7, pot: 0xb86a3a });
    k.parts.push(part(cyl(0.12, 0.1, 0.18, 10), 0xc8102e, [6.3, 0.09, -6.7])); for (let i = 0; i < 7; i++) { const a = i * 0.9; k.parts.push(part(new THREE.IcosahedronGeometry(0.07, 0), i % 2 ? RED : 0xa00c20, [6.3 + Math.cos(a) * 0.1, 0.27 + (i % 3) * 0.03, -6.7 + Math.sin(a) * 0.1])); }   // a poinsettia
    sign('THE CONSERVATORY: 30°C IN JUNE. -2°C NOW. WEAR A CARDIGAN.', 0.5, 0.26, CX1 - 0.12, 1.4, -4.4, 'x-', { bg: '#ffffff', fg: '#1a3a6a', border: '#6a9ad8', size: 34 });
    k.box(0.04, 0.4, 0.06, CX1 - 0.14, 1.4, -4.85, 0xf4f4f4); k.box(0.042, 0.3, 0.012, CX1 - 0.15, 1.4, -4.85, 0x1e88e5);   // a thermometer
  }
  // THE DRINKS TABLE: Baileys, Prosecco (one in an ice bucket), Advocaat for the Snowballs, lemonade, cans, glasses, nibbles
  const DRINKS = { x: 1.7, y: 0.82, z: -5.2 };
  { const x = 1.7, z = -5.2, TH2 = 0.76;
    R(x - 0.33, z - 0.75, x + 0.33, z + 0.75, 0.04, TH2 - 0.02, 0x6a4428, { collide: true, block: true }); R(x - 0.35, z - 0.77, x + 0.35, z + 0.77, 0.2, TH2 - 0.12, 0xc8102e);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.box(0.04, TH2 - 0.05, 0.04, x + sx * 0.28, (TH2 - 0.05) / 2, z + sz * 0.7, 0x4a3020);
    const bottle = (bx, bz, col, h, r, neck = 0x1a1a1a) => { k.cyl(r, r, h, bx, TH2 + h / 2, bz, col, 10); k.cyl(r * 0.4, r * 0.75, h * 0.35, bx, TH2 + h + h * 0.17, bz, col, 8); k.cyl(r * 0.42, r * 0.42, 0.03, bx, TH2 + h * 1.35 + 0.015, bz, neck, 8); };
    bottle(x - 0.15, z - 0.55, 0x4a2a14, 0.2, 0.045, 0x2a1a10); bottle(x - 0.05, z - 0.6, 0x4a2a14, 0.2, 0.045, 0x2a1a10);                                  // Baileys
    k.label("BAILEYS (NAN'S)", 0.08, 0.05, [x + 0.0, TH2 + 0.1, z - 0.55], [0, Math.PI / 2, 0], { bg: '#e8dcc0', fg: '#3a1a0a', border: null, size: 40 });
    for (let i = 0; i < 3; i++) { bottle(x - 0.15 + i * 0.1, z - 0.2, 0x1e4a2a, 0.24, 0.04, GOLD); }                                                       // Prosecco
    k.cyl(0.11, 0.09, 0.2, x + 0.18, TH2 + 0.1, z - 0.3, 0xc0c4c8, 14); k.cyl(0.04, 0.04, 0.26, x + 0.18, TH2 + 0.18, z - 0.3, 0x1e4a2a, 10); k.cyl(0.015, 0.015, 0.03, x + 0.18, TH2 + 0.33, z - 0.3, GOLD, 6);   // ...one on ice
    bottle(x - 0.12, z + 0.12, 0xf0d040, 0.18, 0.04, 0xc8102e); bottle(x + 0.0, z + 0.12, 0xe8f4ff, 0.26, 0.04, 0x3aa03a);                               // Advocaat, lemonade
    k.label('ADVOCAAT (SNOWBALLS)', 0.09, 0.05, [x + 0.035, TH2 + 0.09, z + 0.12], [0, Math.PI / 2, 0], { bg: '#f0d040', fg: '#5a1a0a', border: null, size: 40 });
    for (let i = 0; i < 4; i++) { const gx = x + 0.15, gz = z + 0.02 + i * 0.09; k.cyl(0.03, 0.022, 0.12, gx, TH2 + 0.06, gz, 0xe8f6fa, 8); k.cyl(0.027, 0.02, 0.08, gx, TH2 + 0.045, gz, 0xf8e860, 8); k.parts.push(part(sph(0.012, 5, 4), RED, [gx, TH2 + 0.125, gz])); }   // Snowballs, cherries on
    for (let i = 0; i < 8; i++) k.cyl(0.033, 0.033, 0.12, x - 0.15 + (i % 4) * 0.075, TH2 + 0.06 + Math.floor(i / 4) * 0.12, z + 0.45, [0xd8b030, 0xc8102e, 0xd8b030, 0x1e5aa8][i % 4], 8);   // cans (stacked)
    k.cyl(0.12, 0.08, 0.07, x + 0.1, TH2 + 0.035, z + 0.6, 0xf4f4f4, 14); for (let i = 0; i < 10; i++) k.box(0.035, 0.005, 0.03, x + 0.1 + Math.cos(i) * 0.05, TH2 + 0.075, z + 0.6 + Math.sin(i * 1.3) * 0.05, 0xf0c060, { rot: [i, i * 2, 0] });   // crisps
    sign("THE BAR. BAILEYS IS NAN'S. PROSECCO IS SOPHIE'S. THE SNOWBALL IS A MYSTERY.", 0.6, 0.3, CX0 + 0.04, 1.2, z, 'x+', { bg: '#1a1a2a', fg: '#ffd84a', border: '#d4af37', size: 36 });
    lightString(k, [[x - 0.34, TH2 - 0.05, z - 0.76], [x - 0.34, TH2 - 0.05, z + 0.76]], { spacing: 0.1, sag: 0.03, colors: [0xffd890, 0xff4040] });
    for (const dz of [-0.4, 0.3, 0.6]) k.spawns.push(new THREE.Vector3(x, TH2 + 0.08, z + dz));
  }

  // ======================================================== OUTSIDE: patio, decking, the garden
  k.floor(-8.5, -9.2, 8.5, -3.6, slabTex(), 0.003, 1.0);                                                     // patio slabs behind the house
  k.floor(0.3, -9.2, 7.5, CZ0 - 0.05, deckTex(), 0.006, 1.3);                                                // the decking off the conservatory
  k.floor(-8.5, -17.6, 8.5, -9.2, GRASS, 0.002, 2.2);                                                       // the lawn
  k.floor(-8.5, 3.6, 8.5, 7.0, GRASS, 0.002, 2.2);                                                          // the front lawn
  k.floor(-8.5, -3.6, -7.0, 3.6, slabTex('#a8a296', '#9e988c'), 0.0035, 0.9);                         // the side path (left)
  k.floor(7.0, -3.6, 8.5, 3.6, slabTex('#a8a296', '#9e988c'), 0.0035, 0.9);
  k.floor(-1.85, 3.6, -0.65, 7.5, slabTex('#c0b8a8', '#b4ac9c'), 0.0045, 0.6);                               // the front path
  k.floor(-6.0, 3.6, -2.6, 5.2, slabTex('#a8a296', '#9e988c'), 0.0042, 0.9);                                 // scooter hardstanding
  for (let x = 0.3; x < 7.5; x += 0.4) k.box(0.02, 0.06, 0.04, x, 0.03, -9.2, 0x5a4030);                    // the deck's edge board
  R(0.3, -9.24, 7.5, -9.16, 0.07, 0.035, 0x6a4a34);
  // the fences round the garden (close-boarded, 1.3m), the side gates
  const boards = (x0, z0, x1, z1, h = 1.3, col = 0x8a5a32, posts = 0x5a3a20) => {
    const along = Math.abs(x1 - x0) > Math.abs(z1 - z0), L = Math.hypot(x1 - x0, z1 - z0), n = Math.round(L / 0.15);
    R(Math.min(x0, x1) - (along ? 0 : 0.04), Math.min(z0, z1) - (along ? 0.04 : 0), Math.max(x0, x1) + (along ? 0 : 0.04), Math.max(z0, z1) + (along ? 0.04 : 0), h, h / 2, shade(col, 0.85), { collide: true, block: true });
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, c = shade(col, 0.9 + ((i * 7) % 5) * 0.05); along ? k.box(0.14, h, 0.1, x, h / 2, z, c) : k.box(0.1, h, 0.14, x, h / 2, z, c); }
    for (let t = 0; t <= L + 0.01; t += 1.8) { const x = x0 + (x1 - x0) * Math.min(1, t / L), z = z0 + (z1 - z0) * Math.min(1, t / L); k.box(0.1, h + 0.12, 0.1, x, (h + 0.12) / 2, z, posts); }
    along ? k.box(L, 0.04, 0.14, (x0 + x1) / 2, h + 0.02, (z0 + z1) / 2, posts) : k.box(0.14, 0.04, L, (x0 + x1) / 2, h + 0.02, (z0 + z1) / 2, posts);
  };
  boards(-8.5, -17.6, 8.5, -17.6); boards(-8.5, -17.6, -8.5, 3.6); boards(8.5, -17.6, 8.5, 3.6);
  // left side gate: across the side path, swung open back against the fence (the way round to the garden)
  k.box(0.05, 1.3, 1.25, -8.4, 0.65, -4.35, 0x7a4e2a); for (const y of [0.3, 1.05]) k.box(0.03, 0.1, 1.2, -8.36, y, -4.35, 0x5a3a20); k.blockers.push({ x0: -8.46, x1: -8.33, z0: -5.0, z1: -3.7, y1: 1.3 });
  for (const x of [-8.45, -7.14]) k.box(0.12, 1.45, 0.12, x, 0.72, -3.7, 0x5a3a20);
  // right side: a shut gate, the bins
  R(7.08, -4.0, 8.46, -3.94, 1.3, 0.65, 0x7a4e2a, { block: true, collide: true }); k.box(0.12, 0.03, 0.03, 7.3, 1.0, -3.92, 0x111111);
  wheelieBin(k, { x: 7.75, z: 1.6, ry: Math.PI / 2, col: 0x2a2a2a }); wheelieBin(k, { x: 7.75, z: 2.5, ry: Math.PI / 2, col: 0x1e5a2a }); wheelieBin(k, { x: 7.75, z: 0.7, ry: Math.PI / 2, col: 0x2a5aa8 });
  k.blockers.push({ x0: 7.05, x1: 8.5, z0: -3.9, z1: 3.6, y1: 1.2 });
  note('BINS: TUESDAY. NOT CHRISTMAS WEEK. ASK PAT.', 0.4, 0.14, 7.36, 1.15, 2.5, 'x-', '#fffbe8', '#222', 30);
  // the patio: a bench under the kitchen window, pots, the bird table
  { const at = bench(k, -2.7, -4.25, 0, 0x6a4a2a);
    for (const [x, z, s] of [[-6.7, -4.1, 0.7], [-0.6, -4.1, 0.6]]) pottedPlant(k, x, z, { s, pot: 0x8a5a3a, kind: 'bush' });
    note('NAN\'S SMOKING BENCH (SHE QUIT IN 1987. SHE SITS HERE ANYWAY.)', 0.36, 0.14, -2.7, 0.85, -4.0, 0, '#ffffff', '#2a4a2a', 30); }
  // the decking: a little bistro set (frosty), a chiminea
  { k.cyl(0.32, 0.32, 0.03, 6.3, 0.72, -8.2, 0x2a2a2a, 16, { collide: true }); k.cyl(0.025, 0.025, 0.7, 6.3, 0.36, -8.2, 0x2a2a2a, 6); k.blockers.push({ x0: 5.98, x1: 6.62, z0: -8.52, z1: -7.88, y1: 0.74 });
    k.chair(5.6, -8.3, -Math.PI / 2 + 0.2, 0x2a2a2a); k.chair(6.9, -7.7, Math.PI / 2 + 0.5, 0x2a2a2a);
    k.cyl(0.08, 0.25, 0.5, 1.2, 0.25, -8.4, 0x8a4a2a, 12); k.cyl(0.07, 0.08, 0.5, 1.2, 0.75, -8.4, 0x8a4a2a, 10); k.blockers.push({ x0: 0.95, x1: 1.45, z0: -8.65, z1: -8.15, y1: 1 });
    k.spawns.push(new THREE.Vector3(6.3, 0.8, -8.2)); }
  // THE LAWN: keep the middle clear (x -7 .. 3.4, z -16.6 .. -9.6). Round the edges: gnomes, solar lights,
  // the bird table, the light-up reindeer, the washing line, the shed, borders
  const LAWN = { x0: -7.0, x1: 3.4, z0: -16.6, z1: -9.6 };
  for (let x = -6.8; x <= 3.3; x += 1.45) solarLight(k, x, -9.4);
  for (let z = -10.3; z >= -16.4; z -= 1.5) solarLight(k, 3.75, z);
  for (let z = -10.3; z >= -16.4; z -= 1.5) solarLight(k, -7.35, z);
  for (const [x, z, ry, h, c] of [[-7.9, -10.2, 1.2, RED, 0x1e4ea8], [-7.95, -14.4, 1.6, 0x1e5a2a, RED], [-6.2, -17.15, 0.2, RED, 0x2a8a4a], [-1.8, -17.1, 0, 0x1e4ea8, RED], [2.4, -17.15, -0.3, RED, 0xffd84a], [4.4, -12.3, -1.3, RED, 0x1e4ea8], [7.7, -9.8, -1.8, 0xffd84a, RED]]) { gnome(k, x, z, ry, h, c, 1.2); k.blockers.push({ x0: x - 0.15, x1: x + 0.15, z0: z - 0.15, z1: z + 0.15, y1: 0.6 }); }
  note('GNOME SWEET GNOME', 0.3, 0.1, -1.8, 0.14, -16.95, 0, '#f4ecd8', '#2a4a2a', 40);
  // a Santa hat on every gnome
  for (const [x, z] of [[-7.9, -10.2], [-7.95, -14.4], [-6.2, -17.15], [-1.8, -17.1], [2.4, -17.15], [4.4, -12.3], [7.7, -9.8]]) k.parts.push(part(sph(0.03, 6, 4), 0xffffff, [x, 0.75, z]));
  birdTable(k, -7.6, -12.3);
  note('BIRD TABLE. THE MINCE PIE IS FOR THE ROBIN. YES, MICHAEL, ONLY THE ROBIN.', 0.4, 0.18, -7.6, 1.08, -12.25, Math.PI / 2, '#ffffff', '#6a3a1a', 30);
  reindeer(k, 5.6, -10.4, -0.6, 1.1);
  note('RUDOLPH. FROM ASDA. LISA\'S DISCOUNT: 0%.', 0.4, 0.12, 5.4, 0.3, -9.75, -0.3, '#5a9a2a', '#ffffff', 32);
  reindeer(k, 6.9, -11.6, -1.2, 0.75);
  rotaryLine(k, 6.3, -13.6);
  note('NO WASHING OUT. IT\'S CHRISTMAS.', 0.34, 0.12, 6.3, 1.05, -13.56, 0, '#ffffff', '#1a3a6a', 32);
  // the shed in the corner, a wreath on its door
  { const SX0 = 5.6, SX1 = 8.3, SZ0 = -17.4, SZ1 = -15.4, SH = 1.95, SR = 0.5;
    R(SX0, SZ0, SX1, SZ1, SH, SH / 2, 0x6a7a5a, { collide: true, block: true });
    for (let y = 0.1; y < SH; y += 0.13) k.box(SX1 - SX0 + 0.02, 0.012, 0.012, (SX0 + SX1) / 2, y, SZ1 + 0.008, 0x56664a);
    roofs.add(SX0, SX1, SZ0, SZ1, SH, SR, 0.15); gable(k, SX0 - 0.002, SZ0, SZ1, SH, SR, 0x6a7a5a); gable(k, SX1 + 0.002, SZ0, SZ1, SH, SR, 0x6a7a5a);
    k.box(0.8, 1.75, 0.04, 6.4, 0.875, SZ1 + 0.025, 0x5a6a4a); k.box(0.08, 0.03, 0.03, 6.72, 1.0, SZ1 + 0.05, 0x222222); wreath(k, 6.4, 1.45, SZ1 + 0.03, 1, 0.13);
    k.box(0.6, 0.5, 0.04, 7.6, 1.2, SZ1 + 0.025, 0x2a3a4a); k.box(0.64, 0.04, 0.1, 7.6, 0.93, SZ1 + 0.06, 0xf0f0ea);
    note("SANTA'S WORKSHOP (NAN'S SHED. STAY OUT.)", 0.6, 0.16, 6.95, 1.85, SZ1 + 0.03, 0, '#c8102e', '#ffffff', 34);
    lightString(k, [[SX0 - 0.1, SH - 0.08, SZ1 + 0.18], [SX1 + 0.1, SH - 0.08, SZ1 + 0.18]], { spacing: 0.15, sag: 0.06 }); }
  // borders along the back and left fences: frosty shrubs, a holly with berries, a bare little tree
  for (let x = -7.6; x < 5.2; x += 1.3) leafyBall(k, x + rnd() * 0.3, 0.35, -17.2 + rnd() * 0.1, 0.32 + rnd() * 0.12, { n: 30 });
  R(-8.45, -17.55, 5.4, -16.75, 0.05, 0.025, 0x4a3a2a);
  { const x = 7.4, z = -9.9; leafyBall(k, x, 0.9, z + 0.3, 0.55, { n: 60 }); for (let i = 0; i < 16; i++) k.parts.push(part(sph(0.025, 5, 4), RED, [x + Math.cos(i * 2.3) * 0.5, 0.9 + Math.sin(i * 1.7) * 0.45, z + 0.3 + Math.sin(i * 2.3) * 0.5])); k.blockers.push({ x0: x - 0.55, x1: x + 0.55, z0: z - 0.25, z1: z + 0.85, y1: 1.5 }); }
  { const x = -6.6, z = -17.0; k.cyl(0.06, 0.1, 1.6, x, 0.8, z, 0x5a4a3a, 6); for (let i = 0; i < 6; i++) { const g = new THREE.CylinderGeometry(0.01, 0.035, 0.9, 4); g.translate(0, 0.45, 0); g.rotateZ(0.6 + (i % 2) * 0.3); g.rotateY(i * 1.1); k.parts.push(part(g, 0x5a4a3a, [x, 1.2 + (i % 3) * 0.2, z])); }
    for (let i = 0; i < 14; i++) bulb(k, x + Math.cos(i * 2.1) * 0.35, 1.3 + (i % 5) * 0.12, z + Math.sin(i * 2.1) * 0.35, [0xffd070, 0x60a0ff][i % 2], 0.02, 0.12); }
  note('NO BALL GAMES. (FLINGING RELATIVES: PERMITTED.)', 0.6, 0.22, -3.5, 0.95, -17.5, 0, '#ffffff', '#c8102e', 36, '#c8102e');
  k.box(0.06, 0.95, 0.06, -3.5, 0.47, -17.45, 0x5a3a20);

  // ======================================================== THE FRONT: hedge, fence, the road, the park
  // a low privet hedge along the front with a gap for the path (and a little gate, open)
  const picket = (x0, x1, z) => { for (let x = x0 + 0.05; x < x1; x += 0.13) { k.box(0.07, 0.8, 0.025, x, 0.4, z, WHITE); k.parts.push(part(new THREE.ConeGeometry(0.05, 0.08, 4), WHITE, [x, 0.84, z], [0, Math.PI / 4, 0], [1, 1, 0.36])); }
    for (const y of [0.25, 0.62]) k.box(x1 - x0, 0.07, 0.03, (x0 + x1) / 2, y, z - 0.03, 0xe8e8e2); for (let x = x0; x <= x1 + 0.01; x += 1.8) k.box(0.09, 0.95, 0.09, Math.min(x, x1), 0.475, z - 0.02, 0xf0f0ea);
    k.blockers.push({ x0, x1, z0: z - 0.07, z1: z + 0.04, y1: 0.9 }); };
  picket(-8.5, -2.05, 6.9); picket(-0.45, 8.5, 6.9);
  for (const [x, z] of [[-7.8, 6.3], [-5.2, 6.35], [5.6, 6.3], [7.8, 6.35]]) { leafyBall(k, x, 0.32, z, 0.32, { n: 26 }); k.blockers.push({ x0: x - 0.32, x1: x + 0.32, z0: z - 0.32, z1: z + 0.32, y1: 0.6 }); }
  for (const x of [-2.05, -0.45]) k.box(0.12, 1.0, 0.12, x, 0.5, 6.85, WHITE);
  for (let i = 0; i < 6; i++) { const t = 0.06 + i * 0.13; k.box(0.07, 0.8, 0.025, -0.45 - Math.sin(1.3) * 0.0 - Math.cos(-1.3) * 0 + 0 * t, 0.45, 6.85 - t, WHITE); } k.box(0.03, 0.07, 0.75, -0.47, 0.3, 6.45, 0xe8e8e2); k.box(0.03, 0.07, 0.75, -0.47, 0.68, 6.45, 0xe8e8e2); k.blockers.push({ x0: -0.65, x1: -0.4, z0: 6.1, z1: 6.85, y1: 0.9 });
  lightString(k, [[-8.4, 0.88, 7.07], [-2.1, 0.88, 7.07]], { spacing: 0.25, sag: 0.0, halo: 0.07, wire: null }); lightString(k, [[-0.4, 0.88, 7.07], [8.4, 0.88, 7.07]], { spacing: 0.25, sag: 0.0, halo: 0.07, wire: null, offset: 1 });
  // the road + kerbs + pavements, a speed bump, white lines
  k.floor(B.x0, 7.05, B.x1, 7.55, slabTex('#b8b4ac', '#b0aca4'), 0.004, 0.6);
  k.floor(B.x0, 7.55, B.x1, 12.5, tarmacTex(), 0.003, 2.0);
  k.floor(B.x0, 12.5, B.x1, B.z1 + 0.3, slabTex('#b8b4ac', '#b0aca4'), 0.004, 0.6);
  for (const z of [7.55, 12.5]) R(B.x0, z - 0.06, B.x1, z + 0.06, 0.06, 0.03, 0x9a9690);
  for (let x = B.x0 + 1; x < B.x1; x += 3) R(x, 9.98, x + 1.6, 10.06, 0.004, 0.006, 0xf4f4f0);
  { const bx = 3.5; R(bx - 0.4, 7.6, bx + 0.4, 12.45, 0.07, 0.035, 0x3a3a3c); for (let z = 7.8; z < 12.4; z += 0.55) k.box(0.4, 0.075, 0.18, bx, 0.035, z, 0xf0d020, { rot: [0, 0.6, 0] });
    k.label('SLOW', 1.4, 0.6, [bx - 1.6, 0.008, 9.0], [-Math.PI / 2, 0, -Math.PI / 2], { bg: '#4a4a4c', fg: '#f4f4f0', border: null, size: 90 });
    k.label('5', 0.8, 0.8, [bx - 1.6, 0.008, 11.2], [-Math.PI / 2, 0, -Math.PI / 2], { bg: '#4a4a4c', fg: '#f4f4f0', border: null, size: 120 });
    k.box(0.06, 2.1, 0.06, bx + 0.9, 1.05, 12.9, 0x8a8a8a, { block: true }); sign('SLOW: RESIDENTS CROSSING (EVENTUALLY)', 0.7, 0.45, bx + 0.9, 1.8, 12.87, 'z-', { bg: '#ffffff', fg: '#111', border: '#c8102e', size: 40 });
  }
  // THE PARK SIGN on the far pavement, lamp posts, benches, the postbox, a grit bin
  { const sx = -11.5, sz = 13.75; for (const d of [-1.3, 1.3]) k.box(0.12, 2.3, 0.12, sx + d, 1.15, sz, 0xf4f4f0, { block: true });
    k.box(2.9, 1.25, 0.08, sx, 1.75, sz, 0x1e3a6a);
    k.label("SANDY BAY\nRESIDENTS' PARK\nPLEASE DRIVE AT 5 MPH", 2.8, 1.15, [sx, 1.75, sz - 0.045], [0, Math.PI, 0], { bg: '#1e3a6a', fg: '#ffffff', border: '#ffd84a', size: 64 });
    k.label('MOBILITY SCOOTERS 4 MPH (JOAN: 6)', 2.2, 0.22, [sx, 0.96, sz - 0.045], [0, Math.PI, 0], { bg: '#ffd84a', fg: '#111', border: null, size: 50 });
    k.box(2.9, 0.06, 0.12, sx, 2.4, sz, 0xf4f4f4); lightString(k, [[sx - 1.45, 2.42, sz - 0.08], [sx + 1.45, 2.42, sz - 0.08]], { spacing: 0.12, sag: 0, wire: null });
    k.blockers.push({ x0: sx - 1.45, x1: sx + 1.45, z0: sz - 0.06, z1: sz + 0.06, y1: 2.4 });
    sign("SANDY BAY: AVERAGE AGE 74. AVERAGE GOSSIP SPEED: INSTANT.", 0.9, 0.35, -17.5, 1.5, 13.6, 'z-', { bg: '#ffffff', fg: '#1e3a6a', border: '#1e3a6a', size: 40 });
    k.box(0.06, 1.4, 0.06, -17.5, 0.7, 13.65, 0x8a8a8a, { block: true });
  }
  for (const [x, z, d] of [[-14, 7.3, 1], [-3.5, 12.9, -1], [9, 7.3, 1], [17, 12.9, -1]]) lampPost(k, x, z, d);
  { const at1 = bench(k, -6.2, 13.85, 0, 0x6a4a2a); k.box(0.3, 0.06, 0.01, -6.2, 0.82, 14.11, GOLD); note('FOR ALL THE NATTERS. LOVE, SANDY BAY RESIDENTS.', 0.3, 0.06, -6.2, 0.82, 14.105, Math.PI, '#d4af37', '#2a1a0a', 30);
    bench(k, 11.5, 13.85, 0, 0x6a4a2a); }
  postbox(k, 14.5, 13.4); note('LAST POST 4PM. MICHAEL HAS ALREADY CHECKED IT. THREE TIMES.', 0.3, 0.15, 14.5, 0.95, 13.13, Math.PI, '#ffffff', '#c8102e', 30);
  { k.box(0.8, 0.6, 0.55, 18.5, 0.3, 13.6, 0xf0c020, { block: true }); k.box(0.84, 0.08, 0.6, 18.5, 0.62, 13.55, 0xe0b010, { rot: [0.15, 0, 0] }); note('GRIT BIN (ALSO PAT\'S GOSSIP DROP-OFF)', 0.6, 0.2, 18.5, 0.35, 13.32, Math.PI, '#f0c020', '#111', 34); }
  // THE CLUB's notice board on the pavement
  { const nx = 6.2, nz = 14.1; for (const d of [-0.55, 0.55]) k.box(0.08, 1.9, 0.08, nx + d, 0.95, nz, 0x5a3a20, { block: true });
    k.box(1.3, 0.9, 0.08, nx, 1.4, nz, 0x5a3a20); k.label('notices', 1.2, 0.8, [nx, 1.4, nz - 0.045], [0, Math.PI, 0], { tex: noticeTex() });
    k.box(1.4, 0.06, 0.2, nx, 1.9, nz - 0.04, 0x3a2a1a); k.blockers.push({ x0: nx - 0.65, x1: nx + 0.65, z0: nz - 0.06, z1: nz + 0.06, y1: 1.9 }); }
  // the road's ends: a hedge and a NO THROUGH ROAD sign at the right, the park's entrance barrier on the left
  leafyHedge(k, 19.4, 7.0, 20.0, 14.5, 1.3, { step: 0.26 });
  { k.box(0.1, 1.0, 0.1, -19.6, 0.5, 8.0, 0xf4f4f4); k.box(0.12, 0.12, 4.4, -19.6, 0.95, 10.2, 0xf4f4f4, { block: true }); for (let i = 0; i < 6; i++) k.box(0.125, 0.125, 0.35, -19.6, 0.95, 8.3 + i * 0.75, RED); k.blockers.push({ x0: -20, x1: -19.4, z0: 7.0, z1: 14.5, y1: 1.2 });
    sign('SANDY BAY. RESIDENTS ONLY. (AND THEIR VERY LOUD FAMILIES ON CHRISTMAS DAY)', 1.2, 0.4, -19.55, 1.5, 13.3, 'x+', { bg: '#ffffff', fg: '#1e3a6a', border: '#1e3a6a', size: 36 }); k.box(0.06, 1.4, 0.06, -19.6, 0.7, 13.3, 0x8a8a8a); }
  sign('NO THROUGH ROAD (UNLESS YOU\'RE SANTA)', 0.8, 0.4, 19.35, 1.6, 10.0, 'x-', { bg: '#ffffff', fg: '#1e3a6a', border: '#c8102e', size: 40 });
  // a car or two parked on the road (the family's)
  car(k, -8.5, 8.6, 0x2a4a8a, 'LISA'); car(k, 12.5, 8.6, 0xb8b8bc, 'KAREN');

  // ======================================================== THE NEIGHBOURS
  const nbrClad = (col) => cladTex(col);
  const PAT = nbrClad('#efe6d0'), MAU = nbrClad('#e6eef0'), OTT = nbrClad('#f4ecd8'), REAR = nbrClad('#ece4d4');
  // either side: Pat & Ron's (left), Maureen's (right), fenced off with their own front hedges
  parkHome(k, roofs, PAT, { x0: -22.5, x1: -9.5, z0: -3.5, z1: 3.5, doorX: -11.3, door: 0x1e5a2a, curtain: 0x8a2a3a, rnd, lit: 0.4, lights: [0xffd890] });
  parkHome(k, roofs, MAU, { x0: 9.5, x1: 22.5, z0: -3.5, z1: 3.5, doorX: 11.0, door: 0x6a1a2a, curtain: 0x2a4a6a, rnd, lit: 0.4, lights: MULTI });
  sign("PAT & RON'S. POP IN FOR A SHERRY.", 0.9, 0.22, -11.3, 2.0, 3.62, 'z+', { bg: '#1e5a2a', fg: '#ffffff', border: '#d4af37', size: 40 });
  sign("MAUREEN'S. YES, I CAN SEE YOU, JOAN.", 0.9, 0.22, 11.0, 2.0, 3.62, 'z+', { bg: '#6a1a2a', fg: '#ffffff', border: '#d4af37', size: 40 });
  leafyHedge(k, -20, 6.7, -8.6, 7.05, 0.7, { step: 0.2, r: 0.12 }); leafyHedge(k, 8.6, 6.7, 19.4, 7.05, 0.7, { step: 0.2, r: 0.12 });
  k.blockers.push({ x0: B.x0, x1: -8.5, z0: B.z0, z1: 7.05, y1: 2 }, { x0: 8.5, x1: B.x1, z0: B.z0, z1: 7.05, y1: 2 });
  // their gardens: a conservatory roof on Pat's, a trampoline-free lawn, a light-up snowman at Maureen's
  for (const [x, z] of [[-13.5, 5.3], [13.5, 5.3]]) { k.parts.push(part(sph(0.35, 10, 8), 0xf8f8f8, [x, 0.35, z])); k.parts.push(part(sph(0.24, 10, 8), 0xf8f8f8, [x, 0.85, z])); k.parts.push(part(new THREE.ConeGeometry(0.05, 0.16, 6), 0xff7a00, [x, 0.85, z + 0.26], [Math.PI / 2, 0, 0])); k.cyl(0.18, 0.2, 0.04, x, 1.08, z, 0x1a1a1a, 12); k.cyl(0.12, 0.12, 0.18, x, 1.18, z, 0x1a1a1a, 12);
    for (let i = 0; i < 14; i++) bulb(k, x + Math.cos(i * 0.9) * 0.36, 0.3 + (i % 7) * 0.12, z + Math.sin(i * 0.9) * 0.36, 0xcfe8ff, 0.016, 0.1); }
  // ACROSS THE ROAD: Brian & Dot's (visible from space), the Social Club, another home
  { const o = parkHome(k, roofs, OTT, { x0: -15, x1: -2, z0: 16, z1: 23, front: -1, doorX: -4.0, door: 0xc8102e, curtain: 0xc8102e, rnd, lit: 0.8, lights: MULTI });
    const r = o.r;
    // lights EVERYWHERE: roof edges, ridge, windows, walls, the hedge; an inflatable Santa, reindeer on the roof, a giant sign
    lightString(k, [[r.xa, r.ye, r.za - 0.02], [r.xa, r.yr, (r.za + r.zb) / 2], [r.xb, r.yr, (r.za + r.zb) / 2], [r.xb, r.ye, r.za - 0.02]], { spacing: 0.2, sag: 0, colors: MULTI, halo: 0.1, wire: null, offset: 3 });
    for (let y = 0.6; y < 2.4; y += 0.35) lightString(k, [[-15, y, 15.95], [-2, y, 15.95]], { spacing: 0.3, sag: 0.05, colors: [[0xff3b3b, 0x3bff6a], [0x3b8bff, 0xffd23b], [0xff5bd8, 0xffffff]][Math.round(y * 3) % 3], halo: 0.08, wire: null });
    icicles(k, 'x', r.za + 0.01, r.xa, r.xb, r.ye - 0.12, { rnd, spacing: 0.18 });
    for (let x = -14.7; x < -2.2; x += 0.45) { if (Math.abs(x + 4.0) < 0.6) continue; const col = [0xff3b3b, 0x3bff6a, 0x3b8bff, 0xffd23b, 0xff5bd8, 0xffffff][Math.floor((x + 15) / 0.45) % 6]; for (let y = 2.35; y > 0.6; y -= 0.22) bulb(k, x, y, 15.93, col, 0.02, 0.11); }   // curtain lights down the whole front
    for (let i = 0; i < 8; i++) { const sx = -14 + i * 1.6, sy = r.yr + 0.25; for (let a = 0; a < 5; a++) { const an = a / 5 * Math.PI * 2 + Math.PI / 2; bulb(k, sx + Math.cos(an) * 0.25, sy + Math.sin(an) * 0.25, 19.5, 0xffe060, 0.03, 0.3); bulb(k, sx + Math.cos(an + 0.63) * 0.11, sy + Math.sin(an + 0.63) * 0.11, 19.5, 0xffe060, 0.025, 0.2); } }   // light-up stars along the ridge

    k.label('MERRY XMAS FROM BRIAN & DOT (VISIBLE FROM SPACE)', 4.0, 0.7, [-8.5, 3.1, 15.3], [0, Math.PI, 0], { bg: '#c8102e', fg: '#ffd84a', border: '#ffffff', size: 70, glow: true });
    for (const d of [-1.9, 1.9]) k.box(0.06, 3.4, 0.06, -8.5 + d, 1.7, 15.35, 0x2a2a2a);
    // the inflatable Santa (and his sleigh) on the lawn
    { const x = -12.5, z = 15.0; k.parts.push(part(sph(0.55, 12, 10), RED, [x, 0.65, z], [0, 0, 0], [1, 1.2, 0.9])); k.parts.push(part(sph(0.32, 12, 10), 0xf0c8a8, [x, 1.5, z])); k.parts.push(part(sph(0.3, 10, 8), 0xffffff, [x, 1.35, z - 0.12], [0, 0, 0], [1, 0.8, 0.7])); k.parts.push(part(new THREE.ConeGeometry(0.3, 0.5, 12), RED, [x, 1.9, z])); k.parts.push(part(sph(0.08, 6, 4), 0xffffff, [x, 2.15, z])); k.box(1.1, 0.12, 0.92, x, 0.75, z, 0x1a1a1a); k.box(0.22, 0.14, 0.94, x, 0.75, z, GOLD); }
    { const x = -6.0, z = 15.0; k.box(1.6, 0.5, 0.8, x, 0.4, z, RED); k.box(1.7, 0.08, 0.85, x, 0.68, z, GOLD); for (const s of [-1, 1]) k.box(1.9, 0.06, 0.06, x, 0.08, z + s * 0.35, GOLD); presents(k, x, z, 4, rnd, 0.0).forEach(() => {}); }
    for (let i = 0; i < 4; i++) reindeer(k, -13 + i * 1.6, 19.5 - 0.9, -Math.PI / 2, 0.7, r.yr - 0.45);
    // Santa's legs sticking out of the chimney
    k.box(0.6, 1.0, 0.6, -5.0, r.yr + 0.2, 19.5, 0xa05a3a); k.box(0.12, 0.45, 0.14, -5.08, r.yr + 0.92, 19.5, RED); k.box(0.12, 0.45, 0.14, -4.92, r.yr + 0.92, 19.5, RED); k.box(0.14, 0.1, 0.24, -5.08, r.yr + 1.18, 19.45, 0x1a1a1a); k.box(0.14, 0.1, 0.24, -4.92, r.yr + 1.18, 19.45, 0x1a1a1a);
    leafyHedge(k, -15, 14.6, -2.5, 15.0, 0.75, { step: 0.26 });
    lightString(k, [[-15, 0.78, 14.55], [-2.5, 0.78, 14.55]], { spacing: 0.2, sag: 0, colors: MULTI, halo: 0.08, wire: null, offset: 2 });
  }
  parkHome(k, roofs, PAT, { x0: -30, x1: -17, z0: 16, z1: 23, front: -1, doorX: -19, door: 0x2a2a4a, rnd, lit: 0.3, lights: [0xcfe8ff] });
  leafyHedge(k, -20, 14.6, -15.5, 15.0, 0.75, { step: 0.26 });
  // the SOCIAL CLUB: a long low brick building with a big sign, lit windows, a Christmas tree outside
  { const X0 = 1.0, X1 = 17.0, Z0 = 16.5, Z1 = 25, EV = 3.2, BRK = 0xa05a3a;
    R(X0, Z0, X1, Z1, EV, EV / 2, BRK, { block: true });
    for (let y = 0.15; y < EV; y += 0.15) k.box(X1 - X0 + 0.01, 0.012, 0.012, (X0 + X1) / 2, y, Z0 - 0.006, 0xc8b8a0);
    const r = roofs.add(X0, X1, Z0, Z1, EV, 1.8, 0.4); gable(k, X0 - 0.001, Z0, Z1, EV, 1.8, BRK); gable(k, X1 + 0.001, Z0, Z1, EV, 1.8, BRK);
    k.box(X1 - X0 + 0.8, 0.2, 0.05, (X0 + X1) / 2, r.ye - 0.08, r.za, WHITE);
    for (let x = X0 + 1.5; x < X1 - 1; x += 2.2) { if (Math.abs(x - 9) < 1.5) continue; faceWin(k, 'x', Z0, x, 1.6, 1.5, 1.2, -1, { lit: true, curtain: 0xc8102e, net: false }); }
    k.box(2.4, 2.3, 0.06, 9.0, 1.15, Z0 - 0.03, 0x3a2a1a); k.box(1.0, 2.0, 0.07, 8.45, 1.0, Z0 - 0.05, 0xffd890); k.box(1.0, 2.0, 0.07, 9.55, 1.0, Z0 - 0.05, 0xffd890);   // double doors, lit
    k.box(3.4, 0.12, 1.6, 9.0, 2.6, Z0 - 0.8, WHITE); for (const d of [-1.6, 1.6]) k.box(0.1, 2.6, 0.1, 9.0 + d, 1.3, Z0 - 1.55, WHITE);
    k.label('SANDY BAY SOCIAL CLUB', 6.5, 0.7, [9.0, 3.6, r.za - 0.03], [0, Math.PI, 0], { bg: '#1e3a6a', fg: '#ffd84a', border: '#ffffff', size: 80 });
    k.label('BINGO TUES & THURS · QUIZ FRI · CAROLS XMAS EVE', 4.6, 0.32, [9.0, 2.95, Z0 - 1.62], [0, Math.PI, 0], { bg: '#ffffff', fg: '#c8102e', border: null, size: 60 });
    k.box(6.6, 0.8, 0.06, 9.0, 3.6, r.za + 0.0, 0x1e3a6a);
    lightString(k, [[r.xa, r.ye - 0.1, r.za - 0.05], [r.xb, r.ye - 0.1, r.za - 0.05]], { spacing: 0.25, sag: 0.08, colors: MULTI, halo: 0.08, wire: null });
    xmasTree(k, 14.5, 15.6, { h: 3.4, R: 1.1, rnd });
    k.label('CHRISTMAS DAY: CLOSED. (JOAN IS AT HOME. FOR ONCE.)', 1.6, 0.3, [9.0, 1.75, Z0 - 0.1], [0, Math.PI, 0], { bg: '#ffffff', fg: '#1e3a6a', border: '#c8102e', size: 40 });
  }
  // further along both rows and across the road: more park homes (plain, far away), lights on
  for (const [x0, z0, f, col] of [[-36.5, -3.5, 1, 0xece6d8], [23.5, -3.5, 1, 0xe8ecec], [18.5, 16, -1, 0xf0e8d8], [-44, 16, -1, 0xe8e4dc], [32, 16, -1, 0xece6d8]]) parkHome(k, roofs, null, { x0, x1: x0 + 13, z0, z1: z0 + 7, front: f, plain: col, rnd, lit: 0.5, lights: x0 > 30 || x0 < -40 ? null : MULTI });
  // behind the back fence: the next row of park homes, seen from their back gardens
  parkHome(k, roofs, REAR, { x0: -15, x1: -2, z0: -27, z1: -20, front: -1, doorX: -13, rnd, lights: null });
  parkHome(k, roofs, REAR, { x0: 2, x1: 15, z0: -27, z1: -20, front: -1, doorX: 13, rnd, lights: null });
  for (const [x, z] of [[-8, -19], [8, -19]]) { lightString(k, [[x - 4, 1.2, z], [x + 4, 1.2, z]], { spacing: 0.3, sag: 0.1, wire: null }); }
  for (const x of [-12, -4, 5, 12]) k.box(0.1, 1.3, 2.5, x, 0.65, -18.9, 0x7a5030);
  // trees along the back
  for (const [x, z, s] of [[-18, -21, 1.0], [18, -20, 1.2], [0.5, -19.5, 0.8]]) { k.cyl(0.12 * s, 0.2 * s, 3 * s, x, 1.5 * s, z, 0x4a4038, 7); for (let i = 0; i < 6; i++) { const g = new THREE.CylinderGeometry(0.02 * s, 0.07 * s, 1.6 * s, 5); g.translate(0, 0.8 * s, 0); g.rotateZ(0.6 + (i % 2) * 0.35); g.rotateY(i * 1.05); k.parts.push(part(g, 0x4a4038, [x, (2 + (i % 3) * 0.5) * s, z])); } }
  leafyBall(k, -16, 2.2, -16, 1.4); k.cyl(0.15, 0.2, 1.6, -16, 0.8, -16, 0x4a3020, 6);
  leafyBall(k, 16, 2.0, -12, 1.2); k.cyl(0.15, 0.2, 1.4, 16, 0.7, -12, 0x4a3020, 6);

  // ======================================================== build it
  { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(glassPos, 3)); g.computeVertexNormals(); const m = new THREE.Mesh(g, glassMat); m.renderOrder = 2; scene.add(m); }
  roofs.build(scene, ROOFT);
  buildBulbs(k, scene);
  // everything beyond the walkable area (neighbours' far sides, across the road, the row behind, distant trees) merged
  // into a few big meshes: the same picture for a handful of draws
  { const far = { n: [], s: [], w: [], e: [] }, keep = [], bb = new THREE.Box3(), c = new THREE.Vector3();
    for (const g of k.parts) { g.computeBoundingBox(); g.boundingBox.getCenter(c); const side = c.z > B.z1 + 0.5 ? 'n' : c.z < B.z0 - 0.5 ? 's' : c.x < B.x0 - 0.5 ? 'w' : c.x > B.x1 + 0.5 ? 'e' : null; (side ? far[side] : keep).push(g); }
    k.parts = keep;
    for (const list of Object.values(far)) if (list.length) { const m = new THREE.Mesh(merge(list), vcLambert); scene.add(m); } }
  const room = k.finish({
    name: "Nan's new house (Sandy Bay)",
    sky: 0xd8e4f0, ground: 0x7a8a6a, hemiI: 1.45, sun: 0xffdcb0, sunI: 2.4, sunPos: [-7, 4.2, -9], ambient: 0.4,
    start: { x: -1.25, z: 2.85, yaw: 0 },
    spotCount: 30,
  });
  // little pockets nobody can walk to (behind the sofa in the bay, between the bins...) are closed off, so nobody is
  // ever put down where they can't walk out of
  { const n = room.nav, seen = new Uint8Array(n.free.length), st = [n.nearestFree(room.start.x, room.start.z)]; seen[st[0]] = 1;
    while (st.length) { const c = st.pop(), i = c % n.nx, j = Math.floor(c / n.nx); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= n.nx || b >= n.nz) continue; const m = b * n.nx + a; if (n.free[m] && !seen[m]) { seen[m] = 1; st.push(m); } } }
    let shut = 0; for (let m = 0; m < n.free.length; m++) if (n.free[m] && !seen[m]) { const x = n.x0 + ((m % n.nx) + 0.5) * n.cell, z = n.z0 + (Math.floor(m / n.nx) + 0.5) * n.cell; k.blockers.push({ x0: x - 0.01, x1: x + 0.01, z0: z - 0.01, z1: z + 0.01, y1: 0.01, pocket: true }); shut++; }
    if (shut) { room.nav = new NavGrid(room); room.tommySpots = room.nav.sampleSpots(30); } }
  // a low winter sun with soft shadows; a light haze
  room.shadows = true;
  const sun = room.sun; sun.castShadow = true;
  sun.target.position.set(0, 0, -2); scene.add(sun.target); sun.position.set(-14, 9, -17);
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 2, far: 70 }); sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.traverse(o => { if (o.isMesh && o !== sky && o !== ground && o !== clouds) { o.castShadow = !o.material.transparent && !o.isInstancedMesh; o.receiveShadow = true; } });
  ground.receiveShadow = true;
  scene.fog = new THREE.Fog(0xd8e0ea, 28, 70);
  { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunGlowTex(), color: 0xfff0d8, transparent: true, depthWrite: false, fog: false }));
    sp.position.copy(SUN_DIR).multiplyScalar(28); sp.scale.setScalar(9); sp.renderOrder = -97; sp.frustumCulled = false; skyRig.add(sp);
    room.skyRefs = { sky, sunSprite: sp, clouds }; }
  const IN = [[HX0, HZ0, HX1, HZ1], [2.0, HZ1, 5.0, HZ1 + 0.7], [-2.35, HZ1, -0.15, HZ1 + 1.25], [CX0, CZ0, CX1, CZ1]];
  room.indoors = (x, z) => IN.some(([a, b, c, d]) => x > a && x < c && z > b && z < d);
  // the fire's flames flicker (the texture slides about a little)
  const baseUpdate = room.update.bind(room);
  room.update = (dt) => { baseUpdate(dt); const t = room.t || 0; if (this_flame) { this_flame.scale.y = 1 + Math.sin(t * 9) * 0.05 + Math.sin(t * 23) * 0.03; this_flame.position.y = 0.38 + (this_flame.scale.y - 1) * 0.19; } };
  // ---- what the game needs to know
  room.zones = {
    lounge: { x0: -0.5, x1: HX1, z0: HZ0, z1: HZ1 + 0.7 },
    kitchen: { x0: HX0, x1: -0.5, z0: HZ0, z1: 0.6 },
    conservatory: { x0: CX0, x1: CX1, z0: CZ0, z1: CZ1 },
    hall: { x0: -2.0, x1: -0.5, z0: 0.6, z1: HZ1 + 1.4 },
    garden: { x0: -8.5, x1: 8.5, z0: -17.6, z1: -3.5 },
    road: { x0: B.x0, x1: B.x1, z0: 7.05, z1: B.z1 },
  };
  room.quiz = {
    host: { x: hostSeat.x, z: hostSeat.z, yaw: hostSeat.yaw, h: hostSeat.h },
    seats: quizSeats.map(s => ({ x: s.x, z: s.z, yaw: s.yaw, h: s.h })),
    tv: this_room_tv,
    stand: [{ x: 3.0, z: -0.9 }, { x: 4.2, z: 0.2 }, { x: 4.4, z: -1.5 }, { x: 3.4, z: 0.9 }],
  };
  room.dinner = { seats: order.map(i => ({ x: dinnerSeats[i].x, z: dinnerSeats[i].z, yaw: dinnerSeats[i].yaw, h: dinnerSeats[i].h, name: NAMES[order.indexOf(i)] })), table: { x: TX, z: TZ, w: TW, d: TD, h: TH } };
  room.kitchen = { kettle: { x: -4.45, y: WT + 0.12, z: -3.15 }, fridge: { x: -6.6, z: 0.25 }, counter: { x: -5.6, y: WT, z: -3.1 } };
  room.stash = STASH;
  room.tree = { x: TREE.x, z: TREE.z };
  room.drinks = DRINKS;
  room.lawn = LAWN;
  room.gardenStart = { x: -1.8, z: -9.0, yaw: 0 };
  room.familyPhotos = photos;
  room.activities = [
    ...quizSeats.slice(0, 5).map(s => ({ x: s.x, z: s.z, yaw: s.yaw, pose: 'sit' })),
    { x: hostSeat.x, z: hostSeat.z, yaw: hostSeat.yaw, pose: 'sit' },
    { x: 2.6, z: -5.0, yaw: -Math.PI / 2, pose: 'drink' }, { x: 2.7, z: -4.4, yaw: -Math.PI / 2 - 0.5, pose: 'chat' },
    { x: -5.6, z: -2.3, yaw: Math.PI, pose: 'phone' }, { x: -5.3, z: -0.4, yaw: -Math.PI / 2, pose: 'chat' },
    { x: -1.2, z: -8.6, yaw: Math.PI, pose: 'phone' }, { x: 5.0, z: -8.0, yaw: 0.6, pose: 'drink' },
    { x: -1.25, z: 5.8, yaw: 0, pose: 'chat' },
  ];
  return room;

  // (filled in above)
  var this_room_tv, this_flame;
}

// Christmas cards hung on a ribbon along a wall: axis 'x' (along x at z) or 'z'; d = which way they face
function cardString(k, a, b, axis, d, rnd, n) {
  const COL = [0xf4f0e6, 0xc8102e, 0x1e5a2a, 0x1e3a8a, 0xffffff, 0xd4af37, 0x8a1a2a];
  k.box(axis === 'x' ? Math.abs(b[0] - a[0]) : 0.006, 0.01, axis === 'z' ? Math.abs(b[2] - a[2]) : 0.006, (a[0] + b[0]) / 2, a[1], (a[2] + b[2]) / 2, 0xc8102e);
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = a[0] + (b[0] - a[0]) * t, z = a[2] + (b[2] - a[2]) * t, w = 0.1 + rnd() * 0.05, h = 0.13 + rnd() * 0.05, c = COL[i % COL.length], y = a[1] - h / 2 - 0.01;
    if (axis === 'x') { k.box(w, h, 0.004, x, y, z + d * 0.004, c, { rot: [0, 0, (rnd() - 0.5) * 0.15] }); k.box(w * 0.5, h * 0.4, 0.003, x, y, z + d * 0.007, [0xffffff, 0xc8102e, 0xd4af37, 0x2a8a4a][i % 4]); }
    else { k.box(0.004, h, w, x + d * 0.004, y, z, c, { rot: [(rnd() - 0.5) * 0.15, 0, 0] }); k.box(0.003, h * 0.4, w * 0.5, x + d * 0.007, y, z, [0xffffff, 0xc8102e, 0xd4af37, 0x2a8a4a][i % 4]); } }
}
// a parked car: faces +x
function car(k, x, z, col, plate) {
  const dark = shade(col, 0.6);
  k.box(4.0, 0.6, 1.75, x, 0.55, z, col, { block: true }); k.box(2.2, 0.55, 1.6, x - 0.2, 1.1, z, col);
  k.box(2.1, 0.45, 1.62, x - 0.2, 1.12, z, 0x2a3a4a); k.box(0.05, 0.45, 1.5, x + 0.92, 1.1, z, 0x3a4a5a, { rot: [0, 0, -0.5] });
  for (const dx of [-1.3, 1.3]) for (const dz of [-0.85, 0.85]) k.cyl(0.32, 0.32, 0.22, x + dx, 0.32, z + dz, 0x1a1a1a, 14);
  k.box(0.05, 0.12, 0.5, x + 2.0, 0.55, z, 0xf8f8f0); k.box(0.05, 0.12, 0.5, x - 2.0, 0.55, z, 0xf8d020);
  for (const s of [-1, 1]) { k.box(0.06, 0.12, 0.25, x + 2.0, 0.72, z + s * 0.6, 0xfff8e0); k.box(0.06, 0.12, 0.25, x - 2.0, 0.72, z + s * 0.6, 0xc81010); }
  k.box(4.02, 0.04, 1.77, x, 0.86, z, dark);
  k.box(1.6, 0.04, 1.4, x - 0.2, 1.4, z, 0xf8f8ff);                                                         // a frost on the roof
  k.label(plate + ' 1', 0.5, 0.11, [x - 2.03, 0.55, z], [0, -Math.PI / 2, 0], { bg: '#f8d020', fg: '#111', border: null, size: 70 });
}
function laceTex() {
  return canvasTex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(248,246,240,0.7)'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 2;
    for (let y = 8; y < h; y += 24) for (let x = (y / 24 % 2) * 12; x < w; x += 24) { g.beginPath(); g.arc(x, y, 7, 0, 7); g.stroke(); }
    for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(w / 2, h * 0.45, 30 + i * 14, 50 + i * 16, 0, 0, 7); g.stroke(); }
  });
}
function clockTex() {
  return canvasTex(128, 128, (g) => { g.fillStyle = '#fbf8f0'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill();
    g.fillStyle = '#222'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; g.fillRect(64 + Math.sin(a) * 50 - 2, 64 - Math.cos(a) * 50 - 5, 4, 10); }
    g.strokeStyle = '#111'; g.lineWidth = 5; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + 30, 64 + 16); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 - 10, 64 - 44); g.stroke(); });
}
function sunGlowTex() {
  return canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,250,235,1)'); gr.addColorStop(0.12, 'rgba(255,240,210,1)'); gr.addColorStop(0.3, 'rgba(255,220,170,0.45)'); gr.addColorStop(1, 'rgba(255,220,170,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
}
// a winter sky's clouds: broader, greyer stratocumulus
function cloudTex() {
  const W = 1024, H = 256, N = 48, M = 12;
  const grid = (n, m, seed) => { const a = new Float32Array(n * m); let x = seed; for (let i = 0; i < a.length; i++) { x = (x * 16807) % 2147483647; a[i] = x / 2147483647; } return a; };
  const oct = [[N, M, 11, 1], [N * 2, M * 2, 23, 0.5], [N * 4, M * 4, 37, 0.25], [N * 8, M * 8, 51, 0.125]].map(([n, m, s, a]) => ({ n, m, a, g: grid(n, m + 1, s) }));
  const val = (o, u, v) => { const x = u * o.n, y = v * o.m, x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const g = o.g, n = o.n, at = (i, j) => g[(j % (o.m + 1)) * n + ((i % n) + n) % n];
    return (at(x0, y0) * (1 - sx) + at(x0 + 1, y0) * sx) * (1 - sy) + (at(x0, y0 + 1) * (1 - sx) + at(x0 + 1, y0 + 1) * sx) * sy; };
  return canvasTex(W, H, (g) => {
    const img = g.createImageData(W, H), d = img.data;
    for (let j = 0; j < H; j++) { const v = j / H, band = Math.min(1, v / 0.3) * Math.min(1, (1 - v) / 0.2);
      for (let i = 0; i < W; i++) { const u = i / W; let n = 0; for (const o of oct) n += val(o, u, v * 0.9) * o.a; n /= 1.875;
        const c = Math.max(0, Math.min(1, (n - 0.52) / 0.18)) * band, sh = 0.78 + 0.2 * Math.min(1, (n - 0.45) * 3);
        const q = (j * W + i) * 4; d[q] = 250 * sh; d[q + 1] = 246 * sh; d[q + 2] = 244 * sh; d[q + 3] = 255 * Math.pow(c, 0.8) * 0.85; } }
    g.putImageData(img, 0, 0);
  }, { mips: true });
}
