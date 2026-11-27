// NAN'S OLD HOUSE — TEWKES ROAD. Christmas Day afternoon at the house where Joan ("Nan") lived for decades and
// Karen and Lisa grew up: a 1930s red-brick semi (pebbledash upstairs) on an ordinary Essex street, frost on the
// grass, low winter sun, decorated the way it's always been decorated.
//
// Looking down (x to the right, +z toward the road):
//   z -20.5 .. -7.4  the back garden: patio by the house, a long frosty lawn kept clear (x -3.95..3.15,
//                    z -17.4..-7.85), the shed, the greenhouse (broken, 1989), the rotary line, the bird bath
//   z -5.2 .. -1.5   the single-storey KITCHEN extension (x -1..3.8), the patio round its side
//   z -1.5 .. 3.4    the BACK ROOM (dining, x -3.2..1.3): Christmas dinner for 9, the serving hatch to the kitchen
//   z 3.4 .. 9.3     the FRONT ROOM (lounge, x -3.2..1.3): bay window with the tree in it, gas fire, Nan's chair,
//                    the suite and chairs facing the TV in the corner (the quiz)
//   x 1.3 .. 3.8     the HALL all the way down the side: front door, stairs (gated), under-stairs cupboard, the loo,
//                    the low door to the kitchen ("MIND YOUR HEAD JIMMY")
//   x -4.6 .. -3.2   the side passage, front garden to back garden
//   z 8.5 .. 12      the front garden, low brick wall and gate; z 12..22.4 the pavement and TEWKES ROAD
import * as THREE from 'three';
import { Kit, brickTex, woodTex } from './kit.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { sofa, unitFronts, wheelieBin, fenceTex } from './furniture.js';
import { leafyBall, terrace } from './outdoor.js';
import { part, sph, merge, vcLambert } from '../geo.js';
import { photoSlot } from '../portraits.js';
import * as TX from './tewkes_tex.js';
import * as BGU from 'three/addons/utils/BufferGeometryUtils.js';
import { Quads, FairyLights, christmasTree, present, paperChain, tinsel, car, lampPost, gnome, reindeer, stick, rnd, BULBS } from './tewkes_props.js';

const _skyV = new THREE.Vector3();
const FAM = (n) => `./assets/family/${n}.glb`;

export function buildTewkesRoad(scene) {
  const B = { x0: -12, x1: 12, z0: -21, z1: 22.4 };
  const k = new Kit(scene, { ...B, y1: 9 });
  const Q = new Quads(scene), fl = new FairyLights(k), photos = [];
  const R = (x0, z0, x1, z1, h, y, color, opts) => k.box(Math.abs(x1 - x0), h, Math.abs(z1 - z0), (x0 + x1) / 2, y ?? h / 2, (z0 + z1) / 2, color, opts);
  const PI = Math.PI, LAMPC = 0xffe6b8;
  // chairs/sofas: ry so it faces (tx, tz); a person's yaw facing (tx, tz)
  const faceRy = (x, z, tx, tz) => Math.atan2(-(tx - x), -(tz - z));
  const yawTo = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);

  // ---------------- materials and textures ----------------
  const BRICK = brickTex(), DASH = TX.pebbledashTex(), FENCE = fenceTex();
  const WHITE = 0xf4f2ec, PAINT = 0xefe6d4, SKIRT = 0xf6f2e8, OAK = 0x6a4022, MAHOG = 0x5a2a1a, BRASS = 0xc9a24a;
  const glassMat = new THREE.MeshBasicMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
  const laceMat = new THREE.MeshLambertMaterial({ map: TX.laceTex(), transparent: true, depthWrite: false, side: THREE.DoubleSide });
  const frostMat = new THREE.MeshLambertMaterial({ map: TX.frostedGlassTex(), side: THREE.DoubleSide });
  const darkGlass = new THREE.MeshLambertMaterial({ map: skyGlassTex(), color: 0xffffff });
  const xmasWin = [0, 1, 2, 3].map(v => new THREE.MeshBasicMaterial({ map: TX.xmasWindowTex(v), color: 0xd8d0c4 }));
  const roofMat = new THREE.MeshLambertMaterial({ map: rep(TX.frostRoofTex()), side: THREE.DoubleSide });
  const dashMat = new THREE.MeshLambertMaterial({ map: rep(TX.pebbledashTex()), side: THREE.DoubleSide });
  const ceilMat = new THREE.MeshLambertMaterial({ color: 0xf2ece0, emissive: 0x4a4236 });
  const brickMat = new THREE.MeshLambertMaterial({ map: rep(brickTex()), side: THREE.DoubleSide });
  const wreathMat = new THREE.MeshLambertMaterial({ map: TX.wreathTex(), alphaTest: 0.5, side: THREE.DoubleSide });

  // ---------------- walls with holes, wallpaper, trim ----------------
  // holes: [s0, s1, y0, y1] along the wall. Segments round them; ones touching the floor block people, and a
  // window's column blocks at full height too (you can't climb out of the window, even in VR)
  function rects(a0, a1, y0, y1, holes) {
    const out = [], push = (s0, s1, b0, b1) => { if (s1 - s0 > 0.004 && b1 - b0 > 0.004) out.push([s0, s1, b0, b1]); };
    const spans = new Map();
    for (const [s0, s1, h0, h1] of holes) { if (s1 <= a0 || s0 >= a1 || h1 <= y0 || h0 >= y1) continue; const a = Math.max(s0, a0), b = Math.min(s1, a1), key = a + '|' + b; if (!spans.has(key)) spans.set(key, { s0: a, s1: b, g: [] }); spans.get(key).g.push([Math.max(h0, y0), Math.min(h1, y1)]); }
    let a = a0;
    for (const { s0, s1, g } of [...spans.values()].sort((p, q) => p.s0 - q.s0)) { push(a, s0, y0, y1); let y = y0; for (const [h0, h1] of g.sort((p, q) => p[0] - q[0])) { push(s0, s1, y, h0); y = h1; } push(s0, s1, y, y1); a = s1; }
    push(a, a1, y0, y1);
    return out;
  }
  function wall(axis, c, a0, a1, y0, y1, holes = [], { t = 0.12, color = PAINT, tex = null, tile = 0.9, block = true } = {}) {
    for (const [s0, s1, b0, b1] of rects(a0, a1, y0, y1, holes)) {
      const len = s1 - s0, mid = (s0 + s1) / 2, hh = b1 - b0, my = (b0 + b1) / 2;
      const w = axis === 'x' ? len : t, d = axis === 'x' ? t : len, x = axis === 'x' ? mid : c, z = axis === 'x' ? c : mid, bl = block && b0 < 0.5;
      if (tex) k.texBox(w, hh, d, x, my, z, tex, { tile: tex === BRICK ? 0.6 : tile, collide: true, block: bl }); else k.box(w, hh, d, x, my, z, color, { collide: true, block: bl });
    }
    if (block && y0 < 0.5) for (const [s0, s1, h0] of holes) if (h0 > 0.3 && s1 > a0 && s0 < a1) k.blockers.push(axis === 'x' ? { x0: s0, x1: s1, z0: c - t / 2, z1: c + t / 2, y1: 2.4 } : { x0: c - t / 2, x1: c + t / 2, z0: s0, z1: s1, y1: 2.4 });
  }
  // a thin finish on a wall's face f (paper, paint or tiles), dir = the side the room is on
  function skin(axis, f, a0, a1, y0, y1, holes, dir, look, tile = 0.7) {
    const T0 = 0.008, c = f + dir * T0 / 2;
    for (const [s0, s1, b0, b1] of rects(a0, a1, y0, y1, holes)) {
      const len = s1 - s0, mid = (s0 + s1) / 2, hh = b1 - b0, my = (b0 + b1) / 2;
      const w = axis === 'x' ? len : T0, d = axis === 'x' ? T0 : len, x = axis === 'x' ? mid : c, z = axis === 'x' ? c : mid;
      if (typeof look === 'number') k.box(w, hh, d, x, my, z, look); else k.texBox(w, hh, d, x, my, z, look, { tile });
    }
  }
  // skirting board, picture rail / dado, coving along a face (not across doorways)
  function trim(axis, f, a0, a1, dir, holes = [], { dado = 0, rail = 0, ceil = 2.5, cove = true } = {}) {
    const run = (y0, y1, dep, ht, y, col) => { for (const [s0, s1] of rects(a0, a1, y0, y1, holes.filter(h => h[2] < y1 && h[3] > y0)).map(r => [r[0], r[1]])) {
      const len = s1 - s0, mid = (s0 + s1) / 2; axis === 'x' ? k.box(len, ht, dep, mid, y, f + dir * dep / 2, col) : k.box(dep, ht, len, f + dir * dep / 2, y, mid, col); } };
    run(0, 0.14, 0.02, 0.14, 0.07, SKIRT);
    if (dado) run(dado - 0.03, dado + 0.03, 0.025, 0.05, dado, OAK);
    if (rail) run(rail - 0.03, rail + 0.03, 0.02, 0.04, rail, SKIRT);
    if (cove) run(ceil - 0.08, ceil, 0.05, 0.07, ceil - 0.035, SKIRT);
  }
  // door architrave round an opening (both faces of a wall of thickness t)
  function arch(axis, c, s0, s1, h = 2.05, t = 0.12, col = SKIRT) {
    for (const d of [-1, 1]) { const off = d * (t / 2 + 0.01);
      if (axis === 'x') { k.box(0.07, h, 0.02, s0 - 0.035, h / 2, c + off, col); k.box(0.07, h, 0.02, s1 + 0.035, h / 2, c + off, col); k.box(s1 - s0 + 0.14, 0.07, 0.02, (s0 + s1) / 2, h + 0.035, c + off, col); }
      else { k.box(0.02, h, 0.07, c + off, h / 2, s0 - 0.035, col); k.box(0.02, h, 0.07, c + off, h / 2, s1 + 0.035, col); k.box(0.02, 0.07, s1 - s0 + 0.14, c + off, h + 0.035, (s0 + s1) / 2, col); } }
    axis === 'x' ? k.box(s1 - s0, 0.02, t + 0.01, (s0 + s1) / 2, h + 0.01, c, col) : k.box(t + 0.01, 0.02, s1 - s0, c, h + 0.01, (s0 + s1) / 2, col);   // the head lining
    for (const a of [s0 + 0.01, s1 - 0.01]) axis === 'x' ? k.box(0.02, h, t + 0.01, a, h / 2, c, col) : k.box(t + 0.01, h, 0.02, c, h / 2, a, col);     // and the jambs
  }
  // a sign on a wall face: axis = the wall's direction, f = its face, dir = the way the sign faces, a = along, y = up
  function wsign(axis, f, dir, a, y, w, h, text, opts = {}) {
    const o = opts.off ?? 0.012, board = opts.board;
    const pos = axis === 'x' ? [a, y, f + dir * o] : [f + dir * o, y, a], ry = axis === 'x' ? (dir > 0 ? 0 : PI) : (dir > 0 ? PI / 2 : -PI / 2);
    if (board != null) axis === 'x' ? k.box(w + 0.05, h + 0.05, 0.015, a, y, f + dir * 0.0075, board) : k.box(0.015, h + 0.05, w + 0.05, f + dir * 0.0075, y, a, board);
    const m = k.label(text, w, h, board != null ? (axis === 'x' ? [a, y, f + dir * 0.017] : [f + dir * 0.017, y, a]) : pos, [0, ry, opts.tilt || 0], opts); return m;
  }
  // a framed family photo (painted from their own 3D scans once those load)
  function photo(axis, f, dir, a, y, w, h, who, bg, caption, frame = 0x2a1a10) {
    const sl = photoSlot(w > h ? 320 : 240, w > h ? 250 : 320, { who: who.map(FAM), bg, caption }); photos.push(sl);
    const ry = axis === 'x' ? (dir > 0 ? 0 : PI) : (dir > 0 ? PI / 2 : -PI / 2);
    if (axis === 'x') { k.box(w + 0.08, h + 0.08, 0.025, a, y, f + dir * 0.0125, frame); k.box(w + 0.01, h + 0.01, 0.004, a, y, f + dir * 0.027, 0xf6f2e8); k.label('photo', w - 0.04, h - 0.04, [a, y, f + dir * 0.03], [0, ry, 0], { tex: sl.tex }); }
    else { k.box(0.025, h + 0.08, w + 0.08, f + dir * 0.0125, y, a, frame); k.box(0.004, h + 0.01, w + 0.01, f + dir * 0.027, y, a, 0xf6f2e8); k.label('photo', w - 0.04, h - 0.04, [f + dir * 0.03, y, a], [0, ry, 0], { tex: sl.tex }); }
  }
  // a standing photo frame on a surface
  function standPhoto(x, y, z, ry, w, h, who, bg, caption, frame = BRASS) {
    const sl = photoSlot(w > h ? 320 : 240, w > h ? 250 : 320, { who: who.map(FAM), bg, caption }); photos.push(sl);
    const fx = Math.sin(ry), fz = Math.cos(ry);
    k.box(w + 0.03, h + 0.03, 0.015, x, y + h / 2 + 0.015, z, frame, { rot: [-0.12, ry, 0] });
    k.label('photo', w, h, [x + fx * 0.009, y + h / 2 + 0.015, z + fz * 0.009], [-0.12, ry, 0], { tex: sl.tex });
  }
  // a window: glazing (see-through), white frame, bars, sill, nets and/or curtains, in a hole in a wall
  function glaze(axis, c, s0, s1, y0, y1, { frame = WHITE, nets = 0, netSide = 1, bars = 1, sill = true, t = 0.25 } = {}) {
    const w = s1 - s0, hh = y1 - y0, mid = (s0 + s1) / 2, my = (y0 + y1) / 2;
    Q.add(glassMat, w, hh, axis === 'x' ? mid : c, my, axis === 'x' ? c : mid, axis === 'x' ? 0 : PI / 2);
    const fb = (len, h, a, y, dep = 0.07) => axis === 'x' ? k.box(len, h, dep, a, y, c, frame) : k.box(dep, h, len, c, y, a, frame);
    fb(w + 0.1, 0.07, mid, y1 - 0.02); fb(w + 0.1, 0.07, mid, y0 + 0.02); fb(0.07, hh, s0 + 0.02, my); fb(0.07, hh, s1 - 0.02, my);
    for (let i = 1; i <= bars; i++) fb(0.05, hh, s0 + w * i / (bars + 1), my); fb(w, 0.04, mid, y1 - hh * 0.28, 0.06);
    if (sill) { axis === 'x' ? k.box(w + 0.16, 0.04, t + 0.12, mid, y0 - 0.02, c, frame) : k.box(t + 0.12, 0.04, w + 0.16, c, y0 - 0.02, mid, frame); }
    if (t > 0.15) { for (const a of [s0 + 0.01, s1 - 0.01]) axis === 'x' ? k.box(0.02, hh, t + 0.01, a, my, c, WHITE) : k.box(t + 0.01, hh, 0.02, c, my, a, WHITE); axis === 'x' ? k.box(w, 0.02, t + 0.01, mid, y1 - 0.01, c, WHITE) : k.box(t + 0.01, 0.02, w, c, y1 - 0.01, mid, WHITE); }
    if (nets) { const o = netSide * (t / 2 - 0.03); Q.add(laceMat, w - 0.04, hh - 0.06, axis === 'x' ? mid : c + o, my, axis === 'x' ? c + o : mid, axis === 'x' ? 0 : PI / 2);
      axis === 'x' ? k.box(w, 0.015, 0.015, mid, y1 - 0.03, c + o, 0xe8e8e8) : k.box(0.015, 0.015, w, c + o, y1 - 0.03, mid, 0xe8e8e8); }
  }
  // a window on a solid wall face (other houses, upstairs): frame, glass picture, sill; face at f, outward dir
  function appliedWin(axis, f, dir, a, y, w, h, mat = darkGlass, { nets = true, frame = WHITE, bars = 1, lights = null } = {}) {
    const ry = axis === 'x' ? (dir > 0 ? 0 : PI) : (dir > 0 ? PI / 2 : -PI / 2), P = (o) => axis === 'x' ? [a, y, f + dir * o] : [f + dir * o, y, a];
    Q.add(mat, w, h, ...P(0.012), ry);
    if (nets) Q.add(laceMat, w - 0.04, h - 0.04, ...P(0.02), ry);
    const fb = (len, hh, da, dy, dep = 0.06) => { const [x, yy, z] = P(0.03); axis === 'x' ? k.box(len, hh, dep, x + da, yy + dy, z, frame) : k.box(dep, hh, len, x, yy + dy, z + da, frame); };
    fb(w + 0.1, 0.06, 0, h / 2 + 0.02); fb(w + 0.1, 0.06, 0, -h / 2 - 0.02); fb(0.06, h, -w / 2 - 0.02, 0); fb(0.06, h, w / 2 + 0.02, 0);
    for (let i = 1; i <= bars; i++) fb(0.045, h, -w / 2 + w * i / (bars + 1), 0); fb(w, 0.04, 0, h * 0.22);
    { const [x, yy, z] = P(0.07); axis === 'x' ? k.box(w + 0.2, 0.05, 0.14, x, yy - h / 2 - 0.06, z, 0xd8d4cc) : k.box(0.14, 0.05, w + 0.2, x, yy - h / 2 - 0.06, z, 0xd8d4cc); }
    if (lights) { const [x, yy, z] = P(0.05); for (let i = 0; i < 4; i++) { const ax = (axis === 'x'); fl.string(ax ? [x - w / 2 - 0.05, yy + h / 2 + 0.06, z] : [x, yy + h / 2 + 0.06, z - w / 2 - 0.05], ax ? [x + w / 2 + 0.05, yy + h / 2 + 0.06, z] : [x, yy + h / 2 + 0.06, z + w / 2 + 0.05], Math.round(w * 6), { sag: 0.06, colors: lights, halo: true }); break; } }
  }
  // flat polygon floors with UVs in metres (several polygons, one mesh)
  function polyFloor(polys, tex, y, tile) {
    const geos = polys.map(pts => { const sh = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z))); const g = new THREE.ShapeGeometry(sh); g.rotateX(-PI / 2);
      const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / tile, p.getZ(i) / tile); g.translate(0, y, 0); return g; });
    const t = tex.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping;
    const m = new THREE.Mesh(mergeG(geos), new THREE.MeshLambertMaterial({ map: t, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 })); scene.add(m); return m;
  }
  function mergeG(list) { const g = list.length === 1 ? list[0] : (() => { const all = list.map(x => x.index ? x.toNonIndexed() : x); return BGU.mergeGeometries(all, false); })(); g.computeBoundingSphere(); return g; }

  // ======================================================== SKY, SUN, THE WIDER WORLD
  const SUN_DIR = new THREE.Vector3(-0.62, 0.4, -0.68).normalize();      // a low winter sun in the south-west, over the back gardens
  const skyRig = new THREE.Group(); scene.add(skyRig);
  const sky = new Sky(); sky.scale.setScalar(30); sky.renderOrder = -100; sky.frustumCulled = false;
  Object.assign(sky.material.uniforms.turbidity, { value: 3.2 }); sky.material.uniforms.rayleigh.value = 1.6;
  sky.material.uniforms.mieCoefficient.value = 0.004; sky.material.uniforms.mieDirectionalG.value = 0.85; sky.material.uniforms.sunPosition.value.copy(SUN_DIR);
  sky.material.fragmentShader = sky.material.fragmentShader.replace('#include <tonemapping_fragment>', 'gl_FragColor.rgb *= 0.4;\n#include <tonemapping_fragment>');
  skyRig.add(sky);
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(34, 32, 16, 0, PI * 2, 0, PI * 0.52), new THREE.MeshBasicMaterial({ map: cloudTex(), side: THREE.BackSide, transparent: true, depthWrite: false, fog: false }));
  clouds.renderOrder = -98; clouds.frustumCulled = false; skyRig.add(clouds);
  sky.onBeforeRender = (r, sc, cam) => { _skyV.setFromMatrixPosition(cam.matrixWorld); if (skyRig.position.distanceToSquared(_skyV) > 1e-6) { skyRig.position.copy(_skyV); skyRig.updateMatrixWorld(true); } };
  const ground = k.floor(-70, -70, 70, 70, TX.frostGrassTex(), -0.004, 2.2);

  // ======================================================== FLOORS
  const HX0 = -3.2, HX1 = 3.8, HZB = -1.5, HZF = 8.5, CEIL = 2.5, TOP = 5.3, WT = 0.25, KX0 = -1.0, KZ0 = -5.2, KCEIL = 2.4, KH = 2.75;
  const iX0 = HX0 + WT / 2, iX1 = HX1 - WT / 2, iZB = HZB + WT / 2, iZF = HZF - WT / 2;
  polyFloor([[[-3.2, 3.4], [1.3, 3.4], [1.3, 8.5], [0.2, 8.5], [-0.4, 9.3], [-2.0, 9.3], [-2.6, 8.5], [-3.2, 8.5]]], TX.axminsterTex(), 0.008, 1.1);       // the front room's Axminster (into the bay)
  polyFloor([[[-3.2, -1.5], [1.3, -1.5], [1.3, 3.4], [-3.2, 3.4]]], TX.axminsterTex('#3a2a1a', '#b8862e', '#6a4a2a', '#8a5a2a'), 0.0081, 1.1);   // the back room
  polyFloor([[[1.3, -1.5], [3.8, -1.5], [3.8, 8.5], [1.3, 8.5]]], TX.axminsterTex('#6a1e2a', '#c8962e', '#24402a', '#8a2a3a'), 0.0082, 0.8);       // the hall (fitted, the same as the stairs)
  polyFloor([[[KX0, KZ0], [HX1, KZ0], [HX1, HZB], [KX0, HZB]]], TX.linoTex(), 0.0083, 0.6);                                                   // kitchen lino
  // outside: the patio + side passage + the path to the front door + both pavements, all paving slabs; the road
  polyFloor([[[-4.6, -7.4], [3.8, -7.4], [3.8, KZ0], [KX0, KZ0], [KX0, HZB], [HX0, HZB], [HX0, 8.5], [-4.6, 8.5]],
    [[2.2, 8.5], [3.3, 8.5], [3.3, 12.0], [2.2, 12.0]], [[-40, 12.0], [40, 12.0], [40, 14.2], [-40, 14.2]], [[-40, 20.2], [40, 20.2], [40, 22.6], [-40, 22.6]],
    [[6.4, 8.5], [7.4, 8.5], [7.4, 12.0], [6.4, 12.0]], [[-9.2, 8.5], [-8.2, 8.5], [-8.2, 12.0], [-9.2, 12.0]], [[-15.9, 8.5], [-14.9, 8.5], [-14.9, 12.0], [-15.9, 12.0]], [[10.7, 8.5], [11.9, 8.5], [11.9, 12.0], [10.7, 12.0]]], TX.pavingTex(), 0.004, 1.4);
  polyFloor([[[-40, 14.35], [40, 14.35], [40, 20.05], [-40, 20.05]]], TX.tarmacTex(), 0.003, 2.0);
  polyFloor([[[-4.55, -20.45], [3.75, -20.45], [3.75, -17.5], [-4.55, -17.5]], [[-4.55, -17.5], [-4.0, -17.5], [-4.0, -7.4], [-4.55, -7.4]], [[3.2, -17.5], [3.75, -17.5], [3.75, -7.4], [3.2, -7.4]]], TX.gravelTex(), 0.0035, 1.0);   // the borders (frosty bark chips)

  // ======================================================== THE HOUSE SHELL
  // outer walls: red brick up to the first floor, pebbledash above, two storeys; a single-storey kitchen at the back
  const FRONT_HOLES = [[-2.6, 0.2, 0, 2.3], [2.2, 3.2, 0, 2.1]];
  const BACK_HOLES = [[-2.7, -1.5, 0.9, 2.1], [-0.6, 0.4, 0.95, 1.55], [1.75, 2.8, 0, 1.95]];
  wall('x', HZF, HX0 - 0.125, HX1, 0, 2.6, FRONT_HOLES, { tex: BRICK, t: WT }); wall('x', HZF, HX0 - 0.125, HX1, 2.6, TOP, [], { tex: DASH, t: WT, tile: 1.2 });
  wall('x', HZB, HX0 - 0.125, HX1, 0, 2.6, BACK_HOLES, { tex: BRICK, t: WT }); wall('x', HZB, HX0 - 0.125, HX1, 2.6, TOP, [], { tex: DASH, t: WT, tile: 1.2 });
  wall('z', HX0, HZB, HZF, 0, 2.6, [], { tex: BRICK, t: WT }); wall('z', HX0, HZB, HZF, 2.6, TOP, [], { tex: DASH, t: WT, tile: 1.2 });
  k.box(0.04, 0.06, HZF - HZB + 0.25, HX0 - 0.14, 2.6, (HZB + HZF) / 2, 0xe8e2d4); k.box(HX1 - HX0 + 0.25, 0.06, 0.04, (HX0 + HX1) / 2, 2.6, HZF + 0.14, 0xe8e2d4); k.box(HX1 - HX0 + 0.25, 0.06, 0.04, (HX0 + HX1) / 2, 2.6, HZB - 0.14, 0xe8e2d4);   // the line where brick meets render
  // the party wall (next door's on the other side)
  wall('z', HX1, KZ0, HZB, 0, KH, [], { tex: BRICK, t: WT }); wall('z', HX1, HZB, HZF, 0, TOP, [], { tex: BRICK, t: WT });
  // the kitchen extension
  wall('x', KZ0, KX0 - 0.125, HX1, 0, KH, [[-0.2, 1.2, 1.05, 2.05], [2.05, 3.05, 0, 2.05]], { tex: BRICK, t: WT });
  wall('z', KX0, KZ0, HZB, 0, KH, [], { tex: BRICK, t: WT });
  // inside walls (painted plaster)
  wall('x', 3.4, HX0, 1.3, 0, CEIL, [[-2.25, -1.15, 0, 2.05]]);                         // front room | back room (the door's propped open)
  wall('z', 1.3, HZB, HZF, 0, CEIL, [[1.0, 2.0, 0, 2.05], [6.25, 7.3, 0, 2.05]]);       // rooms | hall
  wall('z', 2.7, 0.4, 3.4, 0, CEIL); wall('x', 0.4, 2.64, HX1, 0, CEIL);                  // the downstairs loo
  arch('x', 3.4, -2.25, -1.15); arch('z', 1.3, 1.0, 2.0); arch('z', 1.3, 6.25, 7.3); arch('x', HZB, 1.75, 2.8, 1.95, WT); arch('x', HZF, 2.2, 3.2, 2.1, WT, WHITE);
  // ceilings (an open stairwell over the stairs, up to the landing)
  for (const [x0, z0, x1, z1, y] of [[HX0, HZB, 2.75, HZF, CEIL], [2.75, HZB, HX1, 2.5, CEIL], [2.75, 6.9, HX1, HZF, CEIL], [-2.6, HZF, 0.2, 9.35, 2.32], [KX0, KZ0, HX1, HZB, KCEIL], [2.75, 2.5, HX1, 6.9, 5.0]])
    Q.add(ceilMat, x1 - x0, z1 - z0, (x0 + x1) / 2, y, (z0 + z1) / 2, 0, PI / 2);

  // ---- wallpaper and trim, room by room
  const ROSE = TX.roseWallTex(), STRIPE = TX.stripeWallTex(), CHIP = TX.woodchipTex(), ANAG = TX.anaglyptaTex(), KT = TX.kitchenTileTex();
  // front room: roses all over, a picture rail
  skin('z', iX0, 3.46, 5.3, 0, CEIL, [], 1, ROSE, 0.55); skin('z', iX0, 6.9, iZF, 0, CEIL, [], 1, ROSE, 0.55);
  skin('x', iZF, iX0, 1.24, 0, CEIL, [[-2.6, 0.2, 0, 2.3]], -1, ROSE, 0.55);
  skin('z', 1.24, 3.46, iZF, 0, CEIL, [[6.25, 7.3, 0, 2.05]], -1, ROSE, 0.55);
  skin('x', 3.46, iX0, 1.24, 0, CEIL, [[-2.25, -1.15, 0, 2.05]], 1, ROSE, 0.55);
  trim('z', iX0, 3.46, 5.3, 1, [], { rail: 2.1 }); trim('z', iX0, 6.9, iZF, 1, [], { rail: 2.1 }); trim('x', iZF, iX0, 1.24, -1, [[-2.6, 0.2, 0, 2.3]], { rail: 2.1 });
  trim('z', 1.24, 3.46, iZF, -1, [[6.25, 7.3, 0, 2.05]], { rail: 2.1 }); trim('x', 3.46, iX0, 1.24, 1, [[-2.25, -1.15, 0, 2.05]], { rail: 2.1 });
  // back room: green regency stripe over a dado, cream anaglypta under it
  const DH = [[-2.7, -1.5, 0.9, 2.1], [-0.6, 0.4, 0.95, 1.55]];
  for (const [axis, f, a0, a1, dir, holes] of [['z', iX0, iZB, 3.34, 1, []], ['x', iZB, iX0, 1.24, 1, DH], ['x', 3.34, iX0, 1.24, -1, [[-2.25, -1.15, 0, 2.05]]], ['z', 1.24, iZB, 3.34, -1, [[1.0, 2.0, 0, 2.05]]]]) {
    skin(axis, f, a0, a1, 0.93, CEIL, holes, dir, STRIPE, 0.6); skin(axis, f, a0, a1, 0, 0.93, holes, dir, ANAG, 0.4); trim(axis, f, a0, a1, dir, holes, { dado: 0.93, rail: 2.1 }); }
  // hall: magnolia woodchip, anaglypta under the dado; up the stairwell too
  for (const [axis, f, a0, a1, dir, holes] of [['z', 1.36, iZB, iZF, 1, [[1.0, 2.0, 0, 2.05], [6.25, 7.3, 0, 2.05]]], ['x', iZF, 1.36, iX1, -1, [[2.2, 3.2, 0, 2.1]]], ['x', iZB, 1.36, iX1, 1, [[1.75, 2.8, 0, 1.95]]], ['z', iX1, iZB, 0.34, -1, []], ['z', 2.64, 0.4, 3.4, -1, []], ['x', 0.34, 2.64, iX1, -1, []]]) {
    skin(axis, f, a0, a1, 0.93, CEIL, holes, dir, CHIP, 0.8); skin(axis, f, a0, a1, 0, 0.93, holes, dir, ANAG, 0.4); trim(axis, f, a0, a1, dir, holes, { dado: 0.93 }); }
  skin('z', iX1, 3.3, iZF, 0, 5.0, [], -1, CHIP, 0.8); skin('z', iX1, 2.47, 3.3, CEIL, 5.0, [], -1, CHIP, 0.8);                                                                  // up the stairs (the party wall)
  wall('z', 2.72, 2.5, 6.9, CEIL, 5.0, [], { color: PAINT, t: 0.06, block: false }); wall('x', 6.93, 2.72, iX1, CEIL, 5.0, [], { color: PAINT, t: 0.06, block: false });   // the stairwell's sides above the ceiling
  wall('x', 2.47, 2.72, iX1, CEIL, 5.0, [[2.95, 3.55, 2.5, 4.5]], { color: PAINT, t: 0.06, block: false });
  // kitchen: painted primrose, tiles behind the worktops
  const KP = 0xf2e6a8;
  for (const [axis, f, a0, a1, dir, holes] of [['z', KX0 + WT / 2, KZ0 + WT / 2, HZB - WT / 2, 1, []], ['z', iX1, KZ0 + WT / 2, HZB - WT / 2, -1, []], ['x', KZ0 + WT / 2, KX0 + WT / 2, iX1, 1, [[-0.2, 1.2, 1.05, 2.05], [2.05, 3.05, 0, 2.05]]], ['x', HZB - WT / 2, KX0 + WT / 2, iX1, -1, [[-0.6, 0.4, 0.95, 1.55], [1.75, 2.8, 0, 1.95]]]]) {
    skin(axis, f, a0, a1, 0, KCEIL, holes, dir, KP); trim(axis, f, a0, a1, dir, holes, { ceil: KCEIL }); }
  skin('x', KZ0 + WT / 2 + 0.008, KX0 + WT / 2, 1.95, 0.92, 1.45, [[-0.2, 1.2, 1.05, 2.05]], 1, KT, 0.3); skin('z', KX0 + WT / 2 + 0.008, KZ0 + WT / 2, -1.7, 0.92, 1.45, [], 1, KT, 0.3); skin('z', iX1 - 0.008, -4.4, -2.45, 0.92, 1.45, [], -1, KT, 0.3);

  // ======================================================== THE FRONT ROOM (the quiz)
  // ---- the bay window: three faces of glass on a low brick wall, nets, heavy curtains, a little tiled roof outside
  const BAY = [[-2.6, 8.5], [-2.0, 9.3], [-0.4, 9.3], [0.2, 8.5]];
  for (let i = 0; i < 3; i++) {
    const [ax, az] = BAY[i], [bx, bz] = BAY[i + 1], len = Math.hypot(bx - ax, bz - az), ang = Math.atan2(-(bz - az), bx - ax), mx = (ax + bx) / 2, mz = (az + bz) / 2;
    const nx = -Math.sin(ang), nz = -Math.cos(ang);                      // (the inward normal)
    const bw = k.texBox(len + 0.06, 0.78, 0.22, mx, 0.39, mz, BRICK, { tile: 0.6 }); bw.rotation.y = ang; k.boxRec.pop();
    k.box(len - 0.02, 0.76, 0.01, mx + nx * 0.116, 0.39, mz + nz * 0.116, PAINT, { rot: [0, ang, 0] }); k.box(len - 0.02, 0.13, 0.02, mx + nx * 0.12, 0.07, mz + nz * 0.12, SKIRT, { rot: [0, ang, 0] });
    k.box(len + 0.12, 0.05, 0.36, mx, 0.8, mz, WHITE, { rot: [0, ang, 0] });                                    // sill (deep, inside and out)
    k.box(len + 0.06, 0.2, 0.22, mx, 2.3, mz, WHITE, { rot: [0, ang, 0] });                                     // the head board
    Q.add(glassMat, len - 0.06, 1.4, mx, 1.52, mz, ang);
    for (const t of [-0.5, 0.5]) k.box(0.07, 1.42, 0.09, mx + Math.cos(ang) * t * (len - 0.05), 1.52, mz - Math.sin(ang) * t * (len - 0.05), WHITE, { rot: [0, ang, 0] });
    if (i === 1) for (const t of [-1 / 6, 1 / 6]) k.box(0.05, 1.42, 0.07, mx + t * len, 1.52, mz, WHITE);
    k.box(len - 0.05, 0.05, 0.08, mx, 1.9, mz, WHITE, { rot: [0, ang, 0] });
    Q.add(laceMat, len - 0.1, 1.34, mx + nx * 0.07, 1.5, mz + nz * 0.07, ang);                                  // nets
  }
  for (const x of [-2.59, 0.19]) k.box(0.02, 2.3, WT + 0.01, x, 1.15, HZF, PAINT); for (const x of [-2.5, 0.1]) k.box(0.14, 0.78, 0.3, x, 0.39, HZF + 0.2, PAINT); k.box(2.8, 0.02, WT + 0.01, -1.2, 2.29, HZF, PAINT);
  k.blockers.push({ x0: -2.8, x1: -1.85, z0: 8.85, z1: 9.5, y1: 2.4 }, { x0: -2.05, x1: -0.35, z0: 9.2, z1: 9.5, y1: 2.4 }, { x0: -0.55, x1: 0.4, z0: 8.85, z1: 9.5, y1: 2.4 });
  for (const [cx, s] of [[-2.75, 1], [0.35, -1]]) { k.box(0.34, 2.15, 0.1, cx, 1.18, 8.31, 0x6a1a2a); k.box(0.4, 0.07, 0.12, cx + s * 0.02, 1.05, 8.3, 0x5a1420); for (let i = 0; i < 4; i++) k.box(0.05, 2.1, 0.12, cx - 0.12 + i * 0.08, 1.2, 8.3, 0x7a2232); }   // velvet curtains, tied back
  k.box(3.5, 0.2, 0.14, -1.2, 2.36, 8.3, 0x6a1a2a); for (let i = 0; i < 14; i++) k.box(0.22, 0.05, 0.15, -2.85 + i * 0.25, 2.24, 8.3, i % 2 ? 0x7a2232 : 0x5a1420);   // pelmet with a fringe
  // the bay's roof outside (tiles, lead flashing)
  Q.add(roofMat, 3.3, 1.12, -1.2, 2.62, 8.98, 0, -PI / 2 + 0.55, 0.9); k.box(3.3, 0.05, 0.08, -1.2, 2.94, 8.6, 0x5a5a5e); k.box(3.2, 0.12, 0.06, -1.2, 2.38, 9.42, WHITE);

  // ---- the chimney breast and the gas fire with its wooden surround, the mantelpiece full of cards
  R(HX0, 5.3, -2.7, 6.9, CEIL, CEIL / 2, PAINT, { block: true, collide: true });
  skin('z', -2.7, 5.3, 6.9, 0, CEIL, [], 1, ROSE, 0.55); skin('x', 5.3, iX0, -2.7, 0, CEIL, [], -1, ROSE, 0.55); skin('x', 6.9, iX0, -2.7, 0, CEIL, [], 1, ROSE, 0.55);
  trim('x', 5.3, iX0, -2.7, -1, [], { rail: 2.1 }); trim('x', 6.9, iX0, -2.7, 1, [], { rail: 2.1 }); trim('z', -2.7, 5.3, 6.9, 1, [[5.45, 6.75, 0, 1.2]], { rail: 2.1 });
  R(-2.7, 5.4, -2.25, 6.8, 0.05, 0.025, 0x8a7a62, { block: true });                                                    // tiled hearth
  for (const z of [5.42, 6.62]) R(-2.7, z, -2.58, z + 0.16, 1.12, 0.56, OAK);                                           // pilasters
  R(-2.74, 5.32, -2.46, 6.88, 0.06, 1.15, MAHOG, { collide: true }); R(-2.7, 5.36, -2.5, 6.84, 0.05, 1.1, OAK);            // the mantelshelf
  R(-2.7, 5.58, -2.68, 6.62, 1.05, 0.58, 0xc8b490);                                                                  // the fire's marble-ish back panel
  R(-2.68, 5.78, -2.57, 6.42, 0.62, 0.42, 0xb08a4a); R(-2.6, 5.82, -2.555, 6.38, 0.08, 0.7, 0xd8b868);                   // the gas fire: brass frame, top grille
  k.label('gas fire', 0.56, 0.4, [-2.552, 0.38, 6.1], [0, PI / 2, 0], { tex: TX.fireTex(), glow: true });
  k.light(-2.25, 0.45, 6.1, 0xff7a30, 1.4, 3.0, 0.3); k.halo(-2.45, 0.38, 6.1, 0.9, 0xff8030); k.pool(-2.1, 0.01, 6.1, 1.4, 0xff9040);
  for (const z of [5.83, 6.37]) k.cyl(0.012, 0.012, 0.03, -2.555, 0.18, z, 0x222222, 6);                                  // the knobs
  // on the mantelpiece: the carriage clock in the middle, Christmas cards all along, a pair of china dogs, candlesticks
  { const my = 1.18;
    k.box(0.1, 0.14, 0.14, -2.6, my + 0.07, 6.1, BRASS); k.box(0.11, 0.015, 0.15, -2.6, my + 0.145, 6.1, 0xd8b868); k.box(0.012, 0.04, 0.08, -2.6, my + 0.17, 6.1, BRASS);
    k.label('carriage clock', 0.085, 0.085, [-2.548, my + 0.075, 6.1], [0, PI / 2, 0], { tex: TX.clockFaceTex() });
    let ci = 0;
    for (const z of [5.42, 5.55, 5.7, 5.86, 6.32, 6.48, 6.62, 6.76]) { const tall = ci % 2 ? 0.16 : 0.13, ry = PI / 2 + (ci % 3 - 1) * 0.25;
      k.box(0.004, tall, 0.11, -2.6, my + tall / 2, z, 0xf4f0e6, { rot: [0, ry - PI / 2, 0.15] });
      k.label('card', 0.1, tall - 0.01, [-2.56 + Math.sin(ci) * 0.005, my + tall / 2, z], [0, ry, 0.12], { tex: TX.cardTex(ci) }); ci++; }
    for (const z of [5.95, 6.25]) { k.cyl(0.03, 0.035, 0.11, -2.62, my + 0.055, z, 0xf4f4f0, 8); k.parts.push(part(sph(0.03, 8, 6), 0xf4f4f0, [-2.6, my + 0.13, z])); k.box(0.02, 0.025, 0.02, -2.57, my + 0.12, z, 0x111111); }   // china dogs
    for (const z of [5.36, 6.84]) { k.cyl(0.03, 0.04, 0.2, -2.6, my + 0.1, z, BRASS, 8); k.cyl(0.012, 0.012, 0.14, -2.6, my + 0.27, z, 0xc62828, 6); }
    fl.string([-2.47, 1.13, 5.34], [-2.47, 1.13, 6.86], 18, { sag: 0.08 });
    tinsel(k, [-2.46, 1.12, 5.34], [-2.46, 1.12, 6.86], 0xe8c040, { sag: 0.07 });   // tinsel along the front
    // the big gilt mirror over it
    k.box(0.04, 0.72, 1.05, -2.69, 1.72, 6.1, 0xb08a3a); k.box(0.01, 0.62, 0.95, -2.665, 1.72, 6.1, 0xb8c8cc);
    // cards on ribbons down each side of the breast
    for (const [x0, z, dir] of [[-2.9, 5.29, -1], [-2.9, 6.91, 1]]) { k.box(0.02, 1.0, 0.004, x0, 1.6, z, 0xc62828);
      for (let i = 0; i < 5; i++) k.label('card', 0.11, 0.15, [x0, 2.0 - i * 0.2, z + dir * 0.006], [0, dir > 0 ? 0 : PI, 0], { tex: TX.cardTex(i + (dir > 0 ? 5 : 9)) }); }
  }
  wsign('z', -2.7, 1, 6.1, 2.25, 0.6, 0.14, 'NO, YOU CAN\'T TURN THE FIRE UP. — NAN', { bg: '#fffaf0', fg: '#6a1a2a', border: '#b08a3a', size: 52 });

  // ---- Nan's armchair (her throne), side table, the "sewing kit" tin
  const NAN = { x: -2.3, z: 7.55 }, nanRy = faceRy(NAN.x, NAN.z, 0.3, 5.3);
  sofa(k, { x: NAN.x, z: NAN.z, len: 0.95, depth: 0.9, ry: nanRy, color: 0x8a4a5a, seats: 1, pillows: 1 });
  const hostSeat = k.seats[k.seats.length - 1];
  { const c = Math.cos(nanRy), s = Math.sin(nanRy), at = (lx, lz) => [NAN.x + lx * c + lz * s, NAN.z - lx * s + lz * c];
    const [ax, az] = at(0, 0.36); k.box(0.42, 0.3, 0.01, ax, 0.84, az, 0xf4f0e4, { rot: [-0.16, nanRy, 0] });            // the lace antimacassar
    const [px, pz] = at(0, -0.62); k.box(0.36, 0.1, 0.3, px, 0.05, pz, 0x6a3a4a, { rot: [0, nanRy, 0] });                // her footstool... well, her slippers' stool
    for (const sx of [-0.08, 0.08]) { const [qx, qz] = at(sx, -0.62); k.box(0.09, 0.06, 0.22, qx, 0.13, qz, 0xd8a0b0, { rot: [0, nanRy, 0] }); } }
  const ST = { x: -2.88, z: 7.08 };
  k.cyl(0.18, 0.18, 0.03, ST.x, 0.6, ST.z, MAHOG, 18, { collide: true, block: true }); k.cyl(0.025, 0.035, 0.58, ST.x, 0.3, ST.z, MAHOG, 8); k.cyl(0.14, 0.16, 0.03, ST.x, 0.015, ST.z, MAHOG, 12);
  const stash = { x: ST.x + 0.02, y: 0.71, z: ST.z + 0.02 };
  { const tin = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.09, 24, 1, true), new THREE.MeshLambertMaterial({ map: TX.tinTex() })); tin.position.set(stash.x, 0.66, stash.z); tin.rotation.y = 0.8; scene.add(tin);
    k.cyl(0.103, 0.103, 0.015, stash.x, 0.71, stash.z, 0x5a1a8a, 24); k.cyl(0.07, 0.07, 0.004, stash.x, 0.719, stash.z, 0xd4af37, 18); }
  k.label("NAN'S CHOCOLATE. NOT YOURS. NOT EVEN AT CHRISTMAS.", 0.14, 0.1, [ST.x + 0.08, 0.63, ST.z - 0.13], [-PI / 2 + 0.25, 0.4, 0], { bg: '#fffbe8', fg: '#1a3aa8', border: null, size: 48 });
  k.box(0.1, 0.012, 0.07, ST.x - 0.07, 0.62, ST.z - 0.1, 0x222222); k.cyl(0.025, 0.022, 0.07, ST.x - 0.1, 0.65, ST.z + 0.1, 0xf4e0c0, 10);   // the remote (hers), a sherry glass
  k.spawns.push(new THREE.Vector3(ST.x + 0.06, 0.66, ST.z + 0.08));
  wsign('z', iX0, 1, 7.6, 1.6, 0.42, 0.34, "NAN'S CHAIR.\nSIT IN IT AND YOU'RE OUT OF THE WILL.", { bg: '#f4ecd8', fg: '#6a1a2a', border: '#8a6a3a', size: 50, board: 0x8a6a3a });

  // ---- the TV in the corner (a plain dark screen: the quiz goes on it) on a corner unit
  const TVP = { x: -2.6, z: 3.85 }, tvYaw = yawTo(TVP.x, TVP.z, -0.1, 5.7), fx = Math.sin(tvYaw), fz = Math.cos(tvYaw);
  k.box(0.8, 0.52, 0.5, TVP.x - fx * 0.08, 0.26, TVP.z - fz * 0.08, 0x4a2a16, { rot: [0, tvYaw, 0], collide: true }); k.blockers.push({ x0: iX0, x1: -2.2, z0: 3.46, z1: 4.3, y1: 0.55 });
  k.box(0.7, 0.012, 0.42, TVP.x - fx * 0.08, 0.3, TVP.z - fz * 0.08, 0x3a2010, { rot: [0, tvYaw, 0] });                      // shelf inside
  k.box(0.36, 0.06, 0.25, TVP.x - fx * 0.08, 0.36, TVP.z - fz * 0.08, 0x1a1a1a, { rot: [0, tvYaw, 0] });                      // the box (Freeview)
  const TVW = 1.12, TVH = 0.64, TVY = 0.6 + 0.04 + TVH / 2 + 0.02;
  k.box(TVW + 0.04, TVH + 0.04, 0.05, TVP.x, TVY, TVP.z, 0x151515, { rot: [0, tvYaw, 0] });
  k.box(0.08, 0.1, 0.05, TVP.x - fx * 0.02, 0.58, TVP.z - fz * 0.02, 0x151515, { rot: [0, tvYaw, 0] }); k.box(0.4, 0.015, 0.22, TVP.x - fx * 0.02, 0.53, TVP.z - fz * 0.02, 0x151515, { rot: [0, tvYaw, 0] });
  const scr = { x: TVP.x + fx * 0.028, y: TVY, z: TVP.z + fz * 0.028 };
  { const g = new THREE.PlaneGeometry(TVW, TVH), m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x0a0b0d })); m.position.set(scr.x, scr.y, scr.z); m.rotation.y = tvYaw; scene.add(m); m.userData.tv = { w: TVW, h: TVH }; }
  k.label("JIMMY'S PS5 — BROUGHT 'JUST IN CASE'", 0.3, 0.06, [TVP.x + fx * 0.17, 0.4, TVP.z + fz * 0.17], [0, tvYaw, 0], { bg: '#111', fg: '#7ab8ff', border: null, size: 46 });
  k.box(0.08, 0.2, 0.2, TVP.x + fx * 0.02 + 0.18, 0.43, TVP.z + fz * 0.02 - 0.05, 0xf0f0f0, { rot: [0, tvYaw, 0] });
  k.box(0.22, 0.3, 0.02, -2.95, 0.66, 4.25, 0x1a1a1a, { rot: [0, 0.3, 0] }); k.label('RADIO TIMES — XMAS DOUBLE ISSUE (CIRCLED IN BIRO: EVERYTHING)', 0.2, 0.28, [-2.94, 0.66, 4.262], [0, 0.3, 0], { bg: '#c62828', fg: '#fff', border: null, size: 44 });

  // ---- the three-piece suite, extra dining chairs pulled in: everyone facing the telly and Nan
  const quizSeats = [];
  const seatMark = () => k.seats.length, takeSeats = (from) => { for (let i = from; i < k.seats.length; i++) quizSeats.push(k.seats[i]); };
  let m0 = seatMark();
  sofa(k, { x: 0.79, z: 5.05, len: 2.0, depth: 0.88, ry: PI / 2, color: 0x9a7a52, seats: 3, pillows: 2, throwCol: 0x8a2a2a });
  sofa(k, { x: 0.45, z: 7.8, len: 0.95, depth: 0.88, ry: faceRy(0.45, 7.8, -2.4, 5.2), color: 0x9a7a52, seats: 1, pillows: 1 });
  sofa(k, { x: -0.35, z: 4.3, len: 0.95, depth: 0.88, ry: faceRy(-0.35, 4.3, -2.3, 6.4), color: 0x9a7a52, seats: 1, pillows: 1 });
  for (const [x, z, col, cush] of [[-0.75, 5.0, 0x4a2a16, 0x6a1a2a], [-0.75, 5.8, 0x4a2a16, 0x6a1a2a], [-1.05, 7.45, 0xc8a06a, 0xd8c8a0]]) k.chair(x, z, faceRy(x, z, -2.5, 5.6), col, cush);
  takeSeats(m0);
  wsign('z', 1.24, -1, 5.05, 1.55, 1.0, 0.62, "NAN'S QUIZ RULES\n1. NAN'S ANSWER IS RIGHT\n2. PAUL MAY ARGUE ONCE\n3. 'I LITERALLY SAID THAT' AFTER THE ANSWER DOES NOT COUNT, CHARLI\n4. NO PHONES (TOMMY)", { bg: '#fff8e7', fg: '#1a1a1a', border: '#c0392b', size: 52, board: 0xb08a3a });
  wsign('z', 1.24, -1, 7.85, 1.62, 0.5, 0.62, 'THE CRYING BOY\n(PAUL, WHEN HE\'S WRONG AT THE QUIZ)', { bg: '#3a2a1a', fg: '#f4e8c8', border: '#b08a3a', size: 46, board: 0xb08a3a });

  // ---- the glass display cabinet: Nan's ornaments and the family photos
  { const x0 = 0.32, x1 = 1.22, z0 = 3.46, z1 = 3.86, H = 1.7, xc = (x0 + x1) / 2;
    R(x0, z0, x1, z1, 0.3, 0.15, MAHOG, { block: true, collide: true }); R(x0, z0, x1, z1, 0.05, H - 0.025, MAHOG, { collide: true });
    for (const x of [x0 + 0.02, x1 - 0.02]) R(x - 0.02, z0, x + 0.02, z1, H - 0.3, 0.3 + (H - 0.3) / 2, MAHOG);
    k.label('cabinet', x1 - x0 - 0.06, H - 0.36, [xc, 0.3 + (H - 0.36) / 2, z0 + 0.012], [0, 0, 0], { tex: TX.cabinetBackTex() });
    for (const y of [0.72, 1.12]) R(x0 + 0.04, z0 + 0.02, x1 - 0.04, z1 - 0.02, 0.012, y, 0xd8eef4);
    Q.add(glassMat, x1 - x0 - 0.06, H - 0.36, xc, 0.3 + (H - 0.36) / 2, z1 - 0.01); k.box(0.012, 0.06, 0.012, xc + 0.03, 1.0, z1, BRASS);
    // ornaments: ladies in crinolines, a shire horse, crystal, a Charles & Di plate, Blackpool souvenirs
    const ORN = [0xf4f0f8, 0xe8d0e0, 0xc8d8f0, 0xf0e0c0, 0xd0e8d8];
    for (const [y, n] of [[0.32, 5], [0.73, 5], [1.13, 4]]) for (let i = 0; i < n; i++) { const x = x0 + 0.1 + i * (x1 - x0 - 0.2) / (n - 1), col = ORN[(i + Math.round(y * 10)) % 5];
      if ((i + y * 10) % 3 < 1) { k.cyl(0.035, 0.06, 0.12, x, y + 0.06, z0 + 0.22, col, 10); k.parts.push(part(sph(0.025, 8, 6), 0xf0d8c8, [x, y + 0.15, z0 + 0.22])); }
      else if ((i + y * 10) % 3 < 2) { k.cyl(0.11, 0.11, 0.012, x, y + 0.12, z0 + 0.06, col, 18); k.box(0.008, 0.11, 0.03, x, y + 0.05, z0 + 0.1, 0x8a6a3a); }
      else k.cyl(0.03, 0.03, 0.09, x, y + 0.045, z0 + 0.25, 0xe8f4f8, 8); }
    standPhoto(xc - 0.22, H, z0 + 0.2, 0, 0.18, 0.22, ['karen', 'lisa'], 'studio', 'Karen & Lisa');
    standPhoto(xc + 0.18, H, z0 + 0.22, -0.2, 0.22, 0.18, ['sophie', 'jimmy', 'tommy', 'charli'], 'xmas', 'The grandkids');
    k.spawns.push(new THREE.Vector3(xc, H + 0.06, z0 + 0.3));
  }
  photo('x', 3.46, 1, -0.4, 1.65, 0.55, 0.42, ['joan'], 'studio', 'Joan · Nan · the boss');

  // ---- the Christmas tree in the bay, presents under it
  const TREE = { x: -1.2, z: 8.62 };
  christmasTree(k, fl, TREE.x, TREE.z, { h: 1.85, r: 0.52, base: 0.3 });
  { const PCOL = [[0xc62828, 0xffd84a], [0x1e5aa8, 0xf4f4f4], [0x2e7d32, 0xc62828], [0xf4f0e6, 0xc62828], [0x8e24aa, 0xffd84a], [0xd4af37, 0x1e5aa8]];
    const P = [[-1.85, 8.55, 0.32, 0.22, 0.26, 0.3], [-1.5, 8.2, 0.24, 0.16, 0.2, -0.4], [-0.65, 8.3, 0.36, 0.14, 0.28, 0.6], [-0.4, 8.75, 0.22, 0.28, 0.22, 0.1], [-1.0, 8.15, 0.18, 0.12, 0.18, 0.9], [-1.95, 9.0, 0.26, 0.18, 0.26, -0.2], [-0.5, 9.1, 0.3, 0.2, 0.2, 0.4], [-1.25, 8.05, 0.2, 0.2, 0.2, -0.7]];
    P.forEach(([x, z, w, h, d, ry], i) => present(k, x, z, w, h, d, PCOL[i % 6][0], PCOL[i % 6][1], ry));
    k.label("TO NAN, FROM MICHAEL (WRAPPED IN A ROYAL MAIL SACK, AGAIN)", 0.2, 0.08, [-0.65, 0.145, 8.3], [-PI / 2, 0.6, 0], { bg: '#fffbe8', fg: '#c62828', border: null, size: 44 });
    k.label('TO JIMMY. MIND YOUR HEAD OPENING IT.', 0.16, 0.07, [-1.85, 0.225, 8.55], [-PI / 2, 0.3, 0], { bg: '#fffbe8', fg: '#1e5aa8', border: null, size: 44 }); }
  // fairy lights round the bay
  for (let i = 0; i < 3; i++) { const [ax, az] = BAY[i], [bx, bz] = BAY[i + 1], n = 16, inx = i === 0 ? 0.08 : i === 2 ? -0.08 : 0, inz = i === 1 ? -0.1 : -0.06;
    fl.string([ax + inx, 2.2, az + inz], [bx + inx, 2.2, bz + inz], n, { sag: 0.06, off: i * 3 }); }

  // ---- the ceiling: a frilly shade, PAPER CHAINS from every corner, tinsel on the picture rail
  const LC = { x: -0.95, z: 5.9 };
  k.cyl(0.06, 0.06, 0.04, LC.x, CEIL - 0.02, LC.z, WHITE, 12); k.cyl(0.008, 0.008, 0.16, LC.x, CEIL - 0.1, LC.z, 0xd8d0c0, 4);
  k.cyl(0.14, 0.24, 0.2, LC.x, CEIL - 0.28, LC.z, 0xf0d8b0, 16); k.cyl(0.25, 0.25, 0.03, LC.x, CEIL - 0.39, LC.z, 0xd8b088, 16);
  k.lamp(LC.x, CEIL - 0.31, LC.z, LAMPC, 0.06); k.light(LC.x, 2.1, LC.z, 0xffe2b8, 3.2, 7.5);
  for (const [x, z] of [[iX0 + 0.05, 3.52], [1.18, 3.52], [1.18, iZF - 0.05], [iX0 + 0.05, iZF - 0.05], [-0.95, 3.52], [-0.95, iZF - 0.05]]) paperChain(k, [x, CEIL - 0.05, z], [LC.x, CEIL - 0.08, LC.z], { sag: 0.28 });
  for (const [a, b, col] of [[[iX0 + 0.04, 2.12, 3.5], [iX0 + 0.04, 2.12, 5.28], 0xe8c040], [[iX0 + 0.04, 2.12, 6.92], [iX0 + 0.04, 2.12, 8.33], 0xd8dce4], [[1.2, 2.12, 3.5], [1.2, 2.12, 6.2], 0xc62828], [[-2.7, 2.12, 3.5], [1.2, 2.12, 3.5], 0x2e9a4a]]) tinsel(k, a, b, col, { sag: 0.12 });
  const STAND = [{ x: -1.75, z: 4.85 }, { x: -1.75, z: 5.75 }, { x: -1.25, z: 6.45 }, { x: 0.45, z: 6.65 }];

  // ======================================================== THE BACK ROOM (Christmas dinner for nine)
  const TB = { x: -0.95, z: 0.95, w: 2.1, d: 1.0, h: 0.76 };
  k.table(TB.x, TB.z, TB.w, TB.d, { h: TB.h, top: MAHOG, legs: 0x3a1a10, chairs: 0, cloth: 0xf6f2ea, spots: 3 });
  k.box(TB.w + 0.02, 0.004, 0.32, TB.x, TB.h + 0.002, TB.z, 0xb01e24);                                          // the red runner
  const dinnerSeats = []; m0 = seatMark();
  const DCH = [[0x3a1a10, 0x8a2a3a], [0x3a1a10, 0x8a2a3a], [0x3a1a10, 0x8a2a3a], [0xc8a06a, null], [0x3a1a10, 0x8a2a3a], [0x3a1a10, 0x8a2a3a], [0xe8e8e2, null], [0x3a1a10, 0x8a2a3a]];
  const DX = [-1.75, -1.2, -0.65, -0.1];
  DX.forEach((x, i) => { k.chair(x, TB.z - TB.d / 2 - 0.3, PI, ...DCH[i]); k.chair(x, TB.z + TB.d / 2 + 0.3, 0, ...DCH[i + 4]); });
  k.chair(TB.x - TB.w / 2 - 0.33, TB.z, -PI / 2, 0x5a2a1a, 0xd4af37);                                            // the head of the table: Nan's
  for (let i = m0; i < k.seats.length; i++) dinnerSeats.push(k.seats[i]);
  // the places: plate, crown on it, cracker, glass, knife and fork, at every seat
  const CRACK = [0xc62828, 0x2e7d32, 0xd4af37, 0x1e5aa8, 0x8e24aa, 0xc0c0c8];
  dinnerSeats.forEach((s, i) => { const fx2 = Math.sin(s.yaw), fz2 = Math.cos(s.yaw), px = s.x + fx2 * 0.42, pz = s.z + fz2 * 0.42, rx = fz2, rz = -fx2;
    k.cyl(0.13, 0.11, 0.012, px, TB.h + 0.006, pz, 0xfafaf6, 20); k.cyl(0.1, 0.1, 0.004, px, TB.h + 0.013, pz, 0xe8e0d0, 18);
    { const cc = [0xffd84a, 0xc62828, 0x2e7d32, 0x1e5aa8, 0xff7ab0][i % 5]; k.parts.push(part(new THREE.CylinderGeometry(0.07, 0.072, 0.035, 12, 1, true), cc, [px, TB.h + 0.035, pz]));
      for (let j = 0; j < 6; j++) { const a = j / 6 * PI * 2; k.parts.push(part(new THREE.ConeGeometry(0.02, 0.03, 3), cc, [px + Math.cos(a) * 0.07, TB.h + 0.067, pz + Math.sin(a) * 0.07], [0, -a, 0], [1, 1, 0.25])); } }   // a paper crown, waiting
    { const g = new THREE.CylinderGeometry(0.022, 0.022, 0.24, 10); g.rotateZ(PI / 2); g.rotateY(Math.atan2(rz, rx) * -1); k.parts.push(part(g, CRACK[i % 6], [px + fx2 * 0.17, TB.h + 0.024, pz + fz2 * 0.17])); }
    for (const sd of [-1, 1]) k.box(0.015, 0.006, 0.2, px + rx * sd * 0.17, TB.h + 0.004, pz + rz * sd * 0.17, 0xc8c8cc, { rot: [0, s.yaw, 0] });
    const gx = px + rx * 0.2 + fx2 * 0.12, gz = pz + rz * 0.2 + fz2 * 0.12; k.cyl(0.03, 0.03, 0.005, gx, TB.h + 0.003, gz, 0xdde8ee, 10); k.cyl(0.004, 0.004, 0.08, gx, TB.h + 0.045, gz, 0xdde8ee, 6); k.cyl(0.035, 0.022, 0.07, gx, TB.h + 0.12, gz, 0xdde8ee, 10); k.cyl(0.03, 0.02, 0.03, gx, TB.h + 0.1, gz, 0x8a1a2a, 10); });
  // the food down the middle: roast potatoes, sprouts, pigs in blankets, carrots, the gravy boat, cranberry, stuffing, a holly centrepiece
  { const y = TB.h, cz = TB.z;
    const dish = (x, z, r, col) => { k.cyl(r, r * 0.8, 0.06, x, y + 0.03, z, col, 18); };
    dish(-1.7, cz, 0.15, 0xf4f0e6); for (let i = 0; i < 12; i++) k.parts.push(part(sph(0.032, 6, 4), [0xd8a040, 0xc89030, 0xe0b050][i % 3], [-1.7 + Math.cos(i * 2.4) * 0.08 * (i % 3 ? 1 : 0.4), y + 0.075, cz + Math.sin(i * 2.4) * 0.08 * (i % 3 ? 1 : 0.4)], [i, i * 2, 0], [1, 0.8, 1.2]));
    k.cyl(0.11, 0.08, 0.08, -1.3, y + 0.04, cz + 0.04, 0xf4f0e6, 16); for (let i = 0; i < 14; i++) k.parts.push(part(sph(0.02, 6, 4), [0x4a7a2a, 0x5a8a34, 0x3a6a24][i % 3], [-1.3 + Math.cos(i * 2.1) * 0.06 * ((i % 4) / 3), y + 0.085, cz + 0.04 + Math.sin(i * 2.1) * 0.06 * ((i % 4) / 3)]));
    k.box(0.3, 0.02, 0.18, -0.6, y + 0.01, cz - 0.02, 0xf4f0e6); for (let i = 0; i < 10; i++) { const g = new THREE.CylinderGeometry(0.014, 0.014, 0.07, 8); g.rotateZ(PI / 2); k.parts.push(part(g, 0xc87850, [-0.71 + (i % 5) * 0.055, y + 0.034, cz - 0.06 + Math.floor(i / 5) * 0.08])); k.box(0.03, 0.03, 0.03, -0.71 + (i % 5) * 0.055, y + 0.035, cz - 0.06 + Math.floor(i / 5) * 0.08, 0xa04a3a); }
    dish(-0.25, cz + 0.05, 0.1, 0xf4f0e6); for (let i = 0; i < 8; i++) k.box(0.012, 0.012, 0.07, -0.25 + Math.cos(i) * 0.04, y + 0.07, cz + 0.05 + Math.sin(i) * 0.03, 0xff7a1a, { rot: [0, i * 0.8, 0] });
    { const g = new THREE.SphereGeometry(0.07, 12, 8); g.scale(1.6, 0.7, 0.9); k.parts.push(part(g, 0xf4f0e6, [0.05, y + 0.06, cz - 0.05])); k.box(0.06, 0.02, 0.03, 0.17, y + 0.09, cz - 0.05, 0xf4f0e6); k.cyl(0.05, 0.05, 0.01, 0.05, y + 0.085, cz - 0.05, 0x5a2a10, 12);   // gravy boat
      k.label('GRAVY (NAN\'S. GRANULES. DON\'T TELL)', 0.13, 0.05, [0.05, y + 0.17, cz - 0.05], [0, PI, 0], { bg: '#fffbe8', fg: '#5a2a10', border: null, size: 44 }); }
    k.cyl(0.05, 0.04, 0.05, -1.0, y + 0.025, cz + 0.28, 0xf4f0e6, 12); k.cyl(0.044, 0.044, 0.005, -1.0, y + 0.05, cz + 0.28, 0x9a1020, 12);   // cranberry
    // the centrepiece: a holly ring with three red candles, lit
    for (let i = 0; i < 12; i++) { const a = i / 12 * PI * 2; k.box(0.08, 0.01, 0.035, -1.0 + Math.cos(a) * 0.11, y + 0.015, cz - 0.25 + Math.sin(a) * 0.11, 0x1e4a22, { rot: [0, -a, 0.3] }); if (i % 3 === 0) k.parts.push(part(sph(0.012, 6, 4), 0xd01020, [-1.0 + Math.cos(a) * 0.1, y + 0.03, cz - 0.25 + Math.sin(a) * 0.1])); }
    for (let i = 0; i < 3; i++) { const a = i * 2.1, cx = -1.0 + Math.cos(a) * 0.045, czz = cz - 0.25 + Math.sin(a) * 0.045; k.cyl(0.018, 0.018, 0.16 + i * 0.03, cx, y + 0.08 + i * 0.015, czz, 0xb01020, 8); k.lamp(cx, y + 0.18 + i * 0.03, czz, LAMPC, 0.012); }
    for (const [x, col] of [[-0.95, 0x5a0a1a], [0.2, 0xe8d890]]) { k.cyl(0.035, 0.035, 0.22, x, y + 0.11, cz + 0.32, col, 10); k.cyl(0.013, 0.02, 0.08, x, y + 0.26, cz + 0.32, col, 8); }
    k.spawns.push(new THREE.Vector3(-1.5, y + 0.12, cz + 0.25), new THREE.Vector3(-0.45, y + 0.12, cz + 0.22));
  }
  // the pendant light over the table
  k.cyl(0.008, 0.008, 0.6, TB.x, CEIL - 0.3, TB.z, 0x8a6a3a, 4); k.cyl(0.1, 0.3, 0.22, TB.x, CEIL - 0.7, TB.z, 0xd8c090, 16); k.lamp(TB.x, CEIL - 0.75, TB.z, LAMPC, 0.06); k.light(TB.x, 1.8, TB.z, 0xffe0b0, 3.0, 7);
  for (const [x, z] of [[iX0 + 0.05, iZB + 0.05], [1.18, iZB + 0.05], [1.18, 3.28], [iX0 + 0.05, 3.28]]) paperChain(k, [x, CEIL - 0.05, z], [TB.x, CEIL - 0.1, TB.z], { sag: 0.25, cols: [0xd32f2f, 0xfbc02d, 0x2e7d32, 0xf4f4f4] });
  // the sideboard with the drinks on it (Nan's bar)
  const SB = { x0: -0.95, x1: 1.15, z0: 2.9, z1: 3.34 };
  R(SB.x0, SB.z0, SB.x1, SB.z1, 0.82, 0.41 + 0.04, MAHOG, { block: true, collide: true }); R(SB.x0 - 0.02, SB.z0 - 0.02, SB.x1 + 0.02, SB.z1, 0.03, 0.865, 0x4a1a10, { collide: true });
  for (let i = 0; i < 4; i++) { const x = SB.x0 + 0.27 + i * 0.52; R(x - 0.24, SB.z0 - 0.012, x + 0.24, SB.z0, 0.6, 0.42, 0x6a3420); k.cyl(0.015, 0.015, 0.02, x + (i % 2 ? -0.18 : 0.18), 0.5, SB.z0 - 0.02, BRASS, 8); }
  R(SB.x0, SB.z0, SB.x1, SB.z1, 0.08, 0.04, 0x2a1008);
  const drinks = { x: 0.1, y: 0.88, z: 3.12 };
  { const bottle = (x, z, col, h = 0.28, r = 0.04, label = null) => { k.cyl(r, r, h, x, 0.88 + h / 2, z, col, 12); k.cyl(r * 0.4, r * 0.8, 0.07, x, 0.88 + h + 0.035, z, col, 8); if (label) k.box(r * 1.6, h * 0.35, 0.004, x, 0.88 + h * 0.45, z - r - 0.002, label); };
    bottle(-0.7, 3.12, 0x3a1a10, 0.3, 0.04, 0xf4e8c8); bottle(-0.55, 3.15, 0x2a1408, 0.26, 0.045, 0xe8d8b0);       // Baileys, sherry
    bottle(-0.4, 3.12, 0xf8e060, 0.24, 0.04, 0x2a5aa8);                                                     // Advocaat
    bottle(0.5, 3.15, 0x1e5a2a, 0.3, 0.038, 0xf4f0e6); bottle(0.65, 3.12, 0xc8a050, 0.27, 0.045, 0x1a1a1a);    // wine, whisky (Paul's)
    for (let i = 0; i < 6; i++) { const x = -0.15 + (i % 3) * 0.09, z = 3.05 + Math.floor(i / 3) * 0.1; k.cyl(0.025, 0.02, 0.06, x, 0.88 + 0.1, z, 0xdde8ee, 8); k.cyl(0.004, 0.004, 0.06, x, 0.91, z, 0xdde8ee, 4); }   // Babycham glasses
    k.box(0.36, 0.22, 0.25, 0.95, 0.99, 3.12, 0x8a6a4a); k.label('SELECTION BOX (MICHAEL\'S. HE HID IT HERE. WE KNOW.)', 0.3, 0.16, [0.95, 0.99, 2.99], [0, PI, 0], { bg: '#c62828', fg: '#fff', border: '#ffd84a', size: 44 }); }
  wsign('x', 3.34, -1, 0.1, 1.45, 0.8, 0.3, "THE BAR. NAN'S RULES: ONE SHERRY. (FINE, TWO.)", { bg: '#2a1408', fg: '#ffd84a', border: '#d4af37', size: 52 });
  k.spawns.push(new THREE.Vector3(-0.2, 0.95, 3.12), new THREE.Vector3(0.3, 0.95, 3.12));
  // the serving hatch (little doors open)
  { const y0 = 0.95, y1 = 1.55; for (const hx of [-0.88, 0.68]) { k.box(0.5, 0.58, 0.025, hx, (y0 + y1) / 2, iZB + 0.03, 0x8a5a32); k.box(0.38, 0.44, 0.01, hx, (y0 + y1) / 2, iZB + 0.045, 0x9a6a3a); }
    k.box(1.08, 0.04, 0.32, -0.1, y0 - 0.02, HZB, 0x6a4022, { collide: true }); for (const x of [-0.59, 0.39]) k.box(0.02, y1 - y0, WT + 0.01, x, (y0 + y1) / 2, HZB, SKIRT); k.box(1.0, 0.02, WT + 0.01, -0.1, y1 - 0.01, HZB, SKIRT); k.box(1.08, 0.05, 0.27, -0.1, y1 + 0.02, HZB, SKIRT); for (const x of [-0.62, 0.42]) k.box(0.04, 0.62, 0.27, x, (y0 + y1) / 2, HZB, SKIRT);
    wsign('x', iZB, 1, -0.1, 1.72, 0.9, 0.13, 'SERVING HATCH. NOT A LETTERBOX, MICHAEL.', { bg: '#fffaf0', fg: '#b71c1c', border: null, size: 52 });
    k.spawns.push(new THREE.Vector3(-0.1, 1.0, HZB)); }
  glaze('x', HZB, -2.7, -1.5, 0.9, 2.1, { nets: 1, netSide: 1, bars: 1 });
  for (const [x, s] of [[-2.85, 1], [-1.35, -1]]) k.box(0.28, 2.0, 0.08, x, 1.2, iZB + 0.08, 0x2e4a3a); k.box(1.8, 0.04, 0.04, -2.1, 2.25, iZB + 0.1, BRASS);
  for (let i = 0; i < 14; i++) k.box(0.05, 0.55, 0.06, -2.85 + i * 0.07, 0.45, iZB + 0.06, 0xf4f4f2);   // radiator under the window
  // on the walls: Karen & Lisa's school photos, the unsolved case, the clock, a calendar
  photo('z', iX0, 1, 0.2, 1.62, 0.36, 0.46, ['karen'], 'studio', 'Karen · school photo 1984', 0x8a6a3a);
  photo('z', iX0, 1, 0.75, 1.62, 0.36, 0.46, ['lisa'], 'studio', 'Lisa · school photo 1986', 0x8a6a3a);
  wsign('z', iX0, 1, 1.7, 1.55, 0.62, 0.5, "WHO BROKE THE GREENHOUSE? (1989)\nCASE STILL OPEN.\nSUSPECTS: KAREN, LISA.\nNAN KNOWS.", { bg: '#f8f4e0', fg: '#222', border: '#c62828', size: 48, board: 0xc8a070 });
  wsign('z', iX0, 1, 2.55, 1.6, 0.38, 0.5, 'DECEMBER\n25: EVERYONE HERE 1PM\nDINNER 2PM SHARP\nQUIZ 4PM\nSOPHIE\'S TRAIN 6:42', { bg: '#fffef6', fg: '#333', border: '#2e7d32', size: 46 });
  k.cyl(0.17, 0.17, 0.04, iX0 + 0.02, 1.95, -0.65, 0x3a1a10, 20); k.label('clock', 0.3, 0.3, [iX0 + 0.045, 1.95, -0.65], [0, PI / 2, 0], { tex: TX.clockFaceTex(false) });
  wsign('x', iZB, 1, -2.1, 2.3, 0.62, 0.1, 'PAPER HATS ARE COMPULSORY. YES, PAUL, YOU TOO.', { bg: '#c62828', fg: '#fff', border: null, size: 48 });
  fl.string([iX0 + 0.05, 2.2, -1.2], [iX0 + 0.05, 2.2, 3.2], 30, { sag: 0.1 });

  // ======================================================== THE HALL
  // the front door (open, swung back against the stairs side), frosted glass, letterbox, the joke over it
  { const DX0 = 2.2, DX1 = 3.2, h = 2.08;
    k.box(0.05, h, DX1 - DX0, DX1 - 0.03, h / 2, HZF - 0.12 - (DX1 - DX0) / 2, 0x1e4a32);                                      // the door, open
    Q.add(frostMat, 0.6, 0.55, DX1 - 0.058, 1.55, HZF - 0.62, -PI / 2); Q.add(frostMat, 0.6, 0.55, DX1 - 0.002, 1.55, HZF - 0.62, PI / 2);
    k.box(0.06, 0.05, 0.28, DX1 - 0.03, 0.95, HZF - 0.62, BRASS); k.cyl(0.03, 0.03, 0.06, DX1 - 0.065, 1.0, HZF - 0.96, BRASS, 8);
    k.label("MICHAEL: YOU DON'T WORK HERE ANY MORE", 0.36, 0.12, [DX1 - 0.06, 1.13, HZF - 0.62], [0, -PI / 2, 0], { bg: '#fff8e7', fg: '#b71c1c', border: '#b71c1c', size: 48 });
    k.label('SHUT THAT DOOR! WERE YOU BORN IN A BARN?', 0.44, 0.1, [DX1 - 0.06, 1.95, HZF - 0.62], [0, -PI / 2, 0], { bg: '#fff8e7', fg: '#222', border: null, size: 48 });
    Q.add(wreathMat, 0.4, 0.4, -1.2, 1.95, 9.34, 0);
    k.box(1.2, 0.012, 0.6, 2.7, 0.012, HZF - 0.5, 0x5a4a32); k.label('WIPE YOUR FEET', 0.8, 0.3, [2.7, 0.02, HZF - 0.5], [-PI / 2, 0, 0], { bg: '#5a4a32', fg: '#d8c8a0', border: null, size: 60 });
    R(DX0 - 0.1, HZF + 0.13, DX1 + 0.1, HZF + 0.55, 0.12, 0.06, 0xb8b0a4, { collide: true });                                 // the front step
  }
  // the telephone table (a gossip bench) by the door: the old landline, Nan's address book
  { const x0 = 1.36, x1 = 1.82;
    R(x0, 7.4, x1, 7.95, 0.04, 0.72, OAK, { collide: true, block: true }); for (const z of [7.44, 7.91]) R(x1 - 0.06, z - 0.02, x1 - 0.02, z + 0.02, 0.7, 0.35, OAK); R(x0, 7.4, x1, 7.95, 0.02, 0.3, OAK);
    R(x0, 7.95, x1, 8.36, 0.08, 0.44, 0x7a2a3a, { block: true }); R(x0, 7.95, x0 + 0.06, 8.36, 0.4, 0.62, OAK); R(x0, 7.95, x1, 8.36, 0.04, 0.38, OAK); R(x0, 7.95, x1, 7.99, 0.62, 0.31, OAK);
    k.seats.push({ x: 1.62, z: 8.15, yaw: PI / 2, h: 0.48 });
    k.box(0.2, 0.08, 0.22, 1.58, 0.78, 7.62, 0xe8dcc0); k.box(0.06, 0.05, 0.2, 1.58, 0.84, 7.62, 0xe8dcc0, { rot: [0, 0, 0.3] }); k.box(0.12, 0.004, 0.1, 1.62, 0.825, 7.6, 0x8a8478);   // the phone: cream, push-button
    { const g = new THREE.TorusGeometry(0.03, 0.006, 4, 10); k.parts.push(part(g, 0xe8dcc0, [1.47, 0.78, 7.7], [PI / 2, 0, 0])); }
    k.box(0.14, 0.03, 0.2, 1.6, 0.755, 7.84, 0x2a4a2a); k.label("NAN'S ADDRESS BOOK (HALF THESE PEOPLE ARE DEAD)", 0.13, 0.18, [1.6, 0.772, 7.84], [-PI / 2, PI / 2, 0], { bg: '#2a4a2a', fg: '#e8d8a0', border: null, size: 44 });
    k.box(0.1, 0.01, 0.14, 1.5, 0.745, 7.5, 0xfffbe8);
    k.spawns.push(new THREE.Vector3(1.6, 0.8, 7.5)); }
  // coats piled on the hooks (soft: you can push past them)
  { k.box(0.025, 0.08, 1.3, 1.375, 1.72, 4.85, OAK); const COATS = [0x1a2a4a, 0x6a3a1a, 0x2a2a2a, 0x7a1a2a, 0x3a5a3a, 0xc8a878, 0x1a1a1a, 0x4a4a6a];
    for (let i = 0; i < 8; i++) { const z = 4.3 + i * 0.16, col = COATS[i], L = 0.75 + (i % 3) * 0.12, cx = 1.44 + (i % 2) * 0.04;
      { const g = new THREE.CylinderGeometry(0.08, 0.15, L, 8); g.scale(0.7, 1, 1.25); k.parts.push(part(g, col, [cx, 1.64 - L / 2, z], [0, 0, 0.05 * (i % 2 ? 1 : -1)])); }
      k.parts.push(part(sph(0.07, 8, 6), col, [cx - 0.02, 1.66, z], [0, 0, 0], [1, 0.8, 1.3]));
      for (const sd of [-1, 1]) k.box(0.06, L * 0.7, 0.05, cx, 1.62 - L * 0.35, z + sd * 0.11, new THREE.Color(col).multiplyScalar(0.85).getHex(), { rot: [sd * 0.08, 0, 0] }); }
    k.box(0.06, 0.6, 0.06, 1.48, 1.3, 5.45, 0xc62828, { rot: [0.3, 0, 0] }); k.parts.push(part(sph(0.07, 8, 6), 0xd8d8d0, [1.44, 1.82, 4.5]));   // a scarf, a bobble hat on top
    for (let i = 0; i < 6; i++) k.box(0.12, 0.08, 0.28, 1.45 + (i % 2) * 0.13, 0.04, 4.35 + Math.floor(i / 2) * 0.32, [0x111111, 0x5a3a1a, 0xf4f4f4, 0x2a2a6a][i % 4], { rot: [0, 0.2 * (i % 2 ? 1 : -1), 0] });
    k.label("LISA'S BAG FOR LIFE", 0.24, 0.24, [1.523, 0.3, 4.0], [0, PI / 2, 0], { tex: TX.bagTex() }); k.box(0.12, 0.32, 0.28, 1.46, 0.17, 4.0, 0x2e8a3a); }
  // the DOOR FRAME WITH THE HEIGHT MARKS (the lounge door, hall side): pencil lines and names from 1972 on
  { const fx3 = 1.36 + 0.012, zL = 6.25 - 0.035, zR = 7.3 + 0.035;
    const marks = [
      [zL, -1, 1.02, 'LISA age 4'], [zL, -1, 1.14, 'KAREN age 6'], [zL, -1, 1.26, 'LISA 8'], [zL, -1, 1.33, 'KAREN 9'], [zL, -1, 1.42, 'LISA 10 (ON TIPTOES)'], [zL, -1, 1.5, 'KAREN 12'], [zL, -1, 1.57, 'LISA 13'], [zL, -1, 1.64, 'KAREN 16 — DONE GROWING'], [zL, -1, 2.0, 'MICHAEL (STOOD ON A CHAIR)'],
      [zR, 1, 1.06, 'SOPHIE 5'], [zR, 1, 1.13, 'CHARLI 6'], [zR, 1, 1.21, 'TOMMY 7'], [zR, 1, 1.28, 'JIMMY 7'], [zR, 1, 1.36, 'SOPHIE 10'], [zR, 1, 1.42, 'CHARLI 10 (I LITERALLY SAID 1.43)'], [zR, 1, 1.49, 'TOMMY 11'], [zR, 1, 1.55, 'NAN. STILL.'], [zR, 1, 1.9, 'JIMMY 14 — TALLER THAN EVERYONE']];
    for (const [z, side, y, name] of marks) { k.box(0.004, 0.006, 0.07, fx3 + 0.008, y, z, 0x555555); k.box(0.004, 0.006, 0.05, fx3 - 0.004, y, z + side * 0.06, 0x666666);
      const w = Math.min(0.56, 0.07 + name.length * 0.0175); k.label(name, w, 0.042, [fx3, y + 0.012, z + side * (0.07 + w / 2)], [0, PI / 2, 0], { bg: '#f1e8d2', fg: name.startsWith('KAREN') || name.startsWith('LISA') ? '#4a5a8a' : '#2a2a2a', border: null, size: Math.round(0.03 * 512 / w) }); }
    wsign('z', 1.36, 1, 6.78, 2.25, 0.5, 0.08, 'DO NOT PAINT THIS DOOR FRAME. EVER. — NAN', { bg: '#fffaf0', fg: '#b71c1c', border: null, size: 48 });
  }
  // the stairs (13 steps up the party wall, a patterned runner, brass rods), banister, the stair gate, the landing door
  { const X0 = 2.75, X1 = iX1, Z0 = 6.9, ST2 = 0.27, RI = 0.19, N = 13;
    for (let i = 0; i < N; i++) { const zf = Z0 - i * ST2; R(X0, zf - ST2, X1, zf, RI * (i + 1), RI * (i + 1) / 2, i % 2 ? 0xd8d0c0 : 0xccc4b2, { collide: true });
      k.box(0.62, 0.012, ST2 - 0.01, 3.21, RI * (i + 1) + 0.006, zf - ST2 / 2, 0x7a2230); k.box(0.62, RI, 0.012, 3.21, RI * i + RI / 2, zf + 0.006, 0x7a2230);
      for (const x of [2.93, 3.49]) k.box(0.02, 0.014, ST2 - 0.01, x, RI * (i + 1) + 0.013, zf - ST2 / 2, 0xc8962e);
      k.box(0.03, 0.014, ST2 * 0.4, 3.21, RI * (i + 1) + 0.013, zf - ST2 / 2, 0x2e4a32);
      k.box(0.68, 0.016, 0.016, 3.21, RI * i + 0.02, zf + 0.012, 0xc8a050); k.box(X1 - X0 + 0.02, 0.025, 0.03, (X0 + X1) / 2, RI * (i + 1) + 0.0, zf + 0.012, 0xf0ece4); }
    k.blockers.push({ x0: 2.68, x1: HX1, z0: Z0 - N * ST2, z1: 7.12, y1: 2.6 });
    // the landing at the top, and the bedroom door (shut)
    R(X0, 2.5, X1, Z0 - N * ST2, 0.1, RI * N - 0.05, 0xd8d0c0); k.box(X1 - X0, 0.01, Z0 - N * ST2 - 2.5, (X0 + X1) / 2, RI * N + 0.006, (2.5 + Z0 - N * ST2) / 2, 0x7a2230);
    k.box(0.62, 2.0, 0.04, 3.25, RI * N + 1.0, 2.52, 0xf4f0e8); k.cyl(0.025, 0.025, 0.05, 3.48, RI * N + 0.95, 2.55, BRASS, 8);
    k.label("KAREN AND LISA'S ROOM: KNOCK", 0.42, 0.3, [3.25, RI * N + 1.45, 2.546], [0, 0, 0], { bg: '#ffd1e8', fg: '#8a1a5a', border: '#8a1a5a', size: 40 });
    k.label('(IT STILL HAS THE BROS POSTERS UP)', 0.42, 0.08, [3.25, RI * N + 1.2, 2.546], [0, 0, 0], { bg: '#f4f0e8', fg: '#555', border: null, size: 46 });
    k.cyl(0.06, 0.12, 0.12, 3.2, 4.85, 4.7, 0xf0e0c0, 12); k.lamp(3.2, 4.8, 4.7, LAMPC, 0.04);
    // banister: newel, handrail, spindles; tinsel wound round the rail
    const rail = (z) => RI * (Z0 - z) / ST2 + 0.92, zc = 3.4;
    k.box(0.06, 0.06, Math.hypot(Z0 + 0.06 - zc, rail(zc) - rail(Z0 + 0.06)), 2.76, (rail(zc) + rail(Z0 + 0.06)) / 2, (zc + Z0 + 0.06) / 2, OAK, { rot: [Math.atan2(rail(zc) - rail(Z0 + 0.06), Z0 + 0.06 - zc), 0, 0] });
    k.box(0.06, 0.06, zc - 2.5, 2.76, rail(zc), (zc + 2.5) / 2, OAK); for (let z = zc - 0.07; z > 2.55; z -= 0.135) k.box(0.03, 0.88, 0.03, 2.76, RI * N + 0.44, z, 0xf4f0e8);
    k.box(0.1, 1.15, 0.1, 2.76, 0.575, Z0 + 0.08, OAK, { block: true }); k.box(0.13, 0.08, 0.13, 2.76, 1.19, Z0 + 0.08, OAK); k.parts.push(part(sph(0.05, 8, 6), OAK, [2.76, 1.27, Z0 + 0.08]));
    for (let z = Z0 - 0.07; z > zc + 0.1; z -= 0.135) { const st = Math.floor((Z0 - z) / ST2); const yb = RI * (st + 1), yt = rail(z) - 0.03; k.box(0.03, yt - yb, 0.03, 2.76, (yb + yt) / 2, z, 0xf4f0e8); }
    tinsel(k, [2.76, rail(Z0) + 0.04, Z0], [2.76, rail(zc) + 0.04, zc], 0xc62828, { sag: 0, r: 0.035 }); tinsel(k, [2.76, rail(Z0) + 0.02, Z0 - 0.05], [2.76, rail(zc) + 0.02, zc - 0.05], 0xe8c040, { sag: 0, r: 0.035 });
    // the panelled side under the stairs, with the cupboard door
    for (let i = 0; i < N; i++) { const zf = Z0 - i * ST2, h = RI * (i + 1) - 0.18; if (h > 0.05) R(X0 - 0.03, zf - ST2, X0, zf, h, h / 2, 0xf0ece4); }
    R(X0 - 0.045, 4.15, X0 - 0.03, 4.9, 1.38, 0.7, 0xe8e2d6); for (const y of [0.4, 1.05]) R(X0 - 0.055, 4.22, X0 - 0.045, 4.83, 0.5, y, 0xf4f0e8); k.cyl(0.02, 0.02, 0.03, X0 - 0.06, 0.75, 4.25, BRASS, 8);
    k.label("UNDER THE STAIRS: HOOVER, XMAS DECS, 1994 YELLOW PAGES, MICHAEL'S OLD POST BAG (STILL FULL)", 0.5, 0.34, [X0 - 0.058, 1.2, 4.52], [0, -PI / 2, 0], { bg: '#fffaf0', fg: '#222', border: '#c62828', size: 44 });
    // the stair gate at the bottom
    R(2.8, 6.98, X1, 7.0, 0.03, 0.85, WHITE); R(2.8, 6.98, X1, 7.0, 0.03, 0.08, WHITE); for (let x = 2.86; x < X1 - 0.02; x += 0.07) R(x - 0.01, 6.98, x + 0.01, 7.0, 0.78, 0.46, WHITE);
    k.label("UPSTAIRS SHUT FOR CHRISTMAS. NAN'S ORDERS.", 0.62, 0.14, [3.22, 0.62, 7.015], [0, 0, 0], { bg: '#fff8e7', fg: '#b71c1c', border: '#b71c1c', size: 48 });
    // photos up the stairs wall
    photo('z', iX1, -1, 6.2, 1.75, 0.4, 0.32, ['karen', 'paul'], 'studio', 'Karen & Paul'); photo('z', iX1, -1, 5.3, 2.15, 0.4, 0.32, ['lisa', 'michael'], 'beach', 'Lisa & Michael');
    photo('z', iX1, -1, 4.4, 2.6, 0.32, 0.4, ['jimmy'], 'studio', 'Jimmy (had to stand him further back)');
  }
  // the loo door (shut) and the lobby by the kitchen door
  { R(2.62, 1.4, 2.64, 2.2, 1.98, 0.99, 0xf4f0e8); for (const y of [0.5, 1.4]) R(2.612, 1.48, 2.62, 2.12, 0.6, y, 0xfaf8f2); k.cyl(0.02, 0.02, 0.03, 2.6, 1.0, 2.1, BRASS, 8); arch('z', 2.7, 1.4, 2.2, 1.98);
    wsign('z', 2.62, -1, 1.8, 1.62, 0.5, 0.3, 'LOO. JIGGLE THE HANDLE.\nTHE GUEST TOWEL IS NOT FOR USE. NOT EVEN BY GUESTS.', { bg: '#e8f4f8', fg: '#1a3a5a', border: '#1a3a5a', size: 46 });
    wsign('x', iZB, 1, 2.28, 2.2, 0.9, 0.16, 'MIND YOUR HEAD JIMMY', { bg: '#ffd400', fg: '#111', border: '#111', size: 44 });
    for (let i = 0; i < 9; i++) R(3.05 + i * 0.07, iZB + 0.02, 3.1 + i * 0.07, iZB + 0.1, 0.55, 0.45, 0xf4f4f2);       // radiator
    for (let i = 0; i < 11; i++) R(1.37, 2.3 + i * 0.07, 1.43, 2.35 + i * 0.07, 0.55, 0.45, 0xf4f4f2); R(1.36, 2.25, 1.55, 3.1, 0.03, 0.8, OAK, { collide: true });   // radiator, a shelf on it
    for (let i = 0; i < 7; i++) k.label('card', 0.09, 0.13, [1.47 + (i % 2) * 0.03, 0.88, 2.33 + i * 0.11], [0, PI / 2 + (i % 3 - 1) * 0.3, 0], { tex: TX.cardTex(i + 3) });
    k.cyl(0.07, 0.06, 0.1, 1.46, 0.865, 3.0, 0xc62828, 10); k.parts.push(part(sph(0.1, 8, 6), 0xc8102e, [1.46, 1.0, 3.0], [0, 0, 0], [1, 0.6, 1]));   // a poinsettia
    k.box(0.03, 0.7, 0.5, 1.375, 1.55, 2.68, 0xb08a3a); k.box(0.01, 0.62, 0.42, 1.392, 1.55, 2.68, 0xb8c8cc);   // the hall mirror
    k.spawns.push(new THREE.Vector3(1.47, 0.86, 2.6));
    k.light(2.4, 2.2, 3.0, 0xffe8c8, 2.2, 6); k.cyl(0.1, 0.16, 0.14, 2.0, CEIL - 0.25, 3.0, 0xf0d8b0, 12); k.lamp(2.0, CEIL - 0.28, 3.0, LAMPC, 0.04);
    fl.string([1.4, 2.42, -1.2], [1.4, 2.42, 8.3], 50, { sag: 0.12 });
    paperChain(k, [1.4, CEIL - 0.05, -1.3], [1.4, CEIL - 0.05, 2.4], { sag: 0.2 }); paperChain(k, [2.65, CEIL - 0.05, -1.3], [2.65, CEIL - 0.05, 0.3], { sag: 0.15 });
  }

  // ======================================================== THE KITCHEN (extension)
  const UNIT = 0xc8965a, TOPC = 0x7a5a3a, kZ0 = KZ0 + WT / 2, kX0 = KX0 + WT / 2;
  // under the window: sink run; down the left: the cooker; down the right: worktop, washing machine; fridge by the door
  R(kX0, kZ0, 1.95, kZ0 + 0.6, 0.88, 0.44, UNIT, { block: true }); unitFronts(k, 'x', kZ0 + 0.6, kX0, 1.95, 1, UNIT, [[0.15, 0.85]]); R(kX0, kZ0, 1.97, kZ0 + 0.62, 0.04, 0.9, TOPC, { collide: true });
  R(0.15, kZ0 + 0.6, 0.85, kZ0 + 0.61, 0.7, 0.45, 0xb8865a);
  R(0.18, kZ0 + 0.08, 0.82, kZ0 + 0.5, 0.02, 0.91, 0xb8bcc0); R(0.2, kZ0 + 0.1, 0.48, kZ0 + 0.48, 0.015, 0.905, 0x8a9098); R(0.52, kZ0 + 0.1, 0.8, kZ0 + 0.48, 0.015, 0.905, 0x8a9098);   // the stainless sink, two bowls
  k.cyl(0.015, 0.015, 0.22, 0.5, 1.02, kZ0 + 0.06, 0xc8c8cc, 6); k.box(0.02, 0.02, 0.14, 0.5, 1.12, kZ0 + 0.12, 0xc8c8cc); k.box(0.08, 0.16, 0.06, 0.3, 1.0, kZ0 + 0.06, 0x2a8a3a); k.box(0.06, 0.2, 0.05, 0.72, 1.02, kZ0 + 0.06, 0xf4d040);   // tap, washing-up liquid, Fairy
  for (let i = 0; i < 6; i++) k.cyl(0.11, 0.11, 0.012, 1.25 + (i % 3) * 0.05, 0.98 + Math.floor(i / 3) * 0.0, kZ0 + 0.25, 0xf4f0e6, 16);   // plates waiting
  for (let i = 0; i < 5; i++) k.cyl(0.1, 0.1, 0.01, 1.08 + i * 0.03, 1.02, kZ0 + 0.3, 0xf4f0e6, 14);
  glaze('x', KZ0, -0.2, 1.2, 1.05, 2.05, { nets: 0, bars: 1 }); k.box(1.5, 0.3, 0.06, 0.5, 1.92, kZ0 + 0.06, 0xf0d890); for (let i = 0; i < 7; i++) k.box(0.2, 0.06, 0.07, -0.1 + i * 0.2, 1.75, kZ0 + 0.06, i % 2 ? 0xf0d890 : 0xd8b860);   // a café curtain
  R(kX0, kZ0 + 0.6, kX0 + 0.6, -3.3, 0.88, 0.44, UNIT, { block: true }); R(kX0, -2.7, kX0 + 0.6, -1.7, 0.88, 0.44, UNIT, { block: true });
  unitFronts(k, 'z', kX0 + 0.6, kZ0 + 0.62, -3.3, 1, UNIT); unitFronts(k, 'z', kX0 + 0.6, -2.7, -1.7, 1, UNIT);
  R(kX0, kZ0 + 0.6, kX0 + 0.62, -3.3, 0.04, 0.9, TOPC, { collide: true }); R(kX0, -2.7, kX0 + 0.62, -1.7, 0.04, 0.9, TOPC, { collide: true });
  // the cooker (with an eye-level grill) and the TURKEY, resting
  { const cx = kX0 + 0.3, cz = -3.0;
    R(cx - 0.3, cz - 0.3, cx + 0.3, cz + 0.3, 0.9, 0.45, 0xf0ece0, { block: true, collide: true }); R(cx + 0.29, cz - 0.24, cx + 0.31, cz + 0.24, 0.5, 0.4, 0x2a2a2a); R(cx + 0.31, cz - 0.2, cx + 0.33, cz + 0.2, 0.02, 0.7, 0xc8c8cc);
    for (const [dx, dz] of [[-0.13, -0.13], [0.13, -0.13], [-0.13, 0.13], [0.13, 0.13]]) k.cyl(0.08, 0.08, 0.012, cx + dx, 0.906, cz + dz, 0x2a2a2a, 14);
    R(cx - 0.3, cz - 0.3, cx - 0.22, cz + 0.3, 0.75, 1.27, 0xf0ece0); R(cx - 0.3, cz - 0.3, cx + 0.05, cz + 0.3, 0.2, 1.55, 0xf0ece0); R(cx + 0.05, cz - 0.27, cx + 0.06, cz + 0.27, 0.1, 1.55, 0x2a2a2a);   // the eye-level grill
    for (let i = 0; i < 4; i++) k.cyl(0.02, 0.02, 0.03, cx + 0.31, 0.82, cz - 0.15 + i * 0.1, 0x222222, 8);
    k.box(0.5, 0.06, 0.36, cx + 0.02, 0.95, cz, 0x6a6a70);                                                                   // the roasting tin
    { const g = new THREE.SphereGeometry(0.17, 16, 10); g.scale(1.25, 0.72, 1.0); k.parts.push(part(g, 0xc8782a, [cx + 0.02, 1.07, cz]));
      for (const sz of [-1, 1]) { const d = new THREE.SphereGeometry(0.06, 8, 6); d.scale(1.6, 0.8, 0.8); k.parts.push(part(d, 0xb8682a, [cx + 0.2, 1.06, cz + sz * 0.09], [0, sz * 0.4, 0.2])); k.cyl(0.012, 0.012, 0.05, cx + 0.3, 1.07, cz + sz * 0.11, 0xf4f0e8, 6); }
      k.box(0.42, 0.005, 0.3, cx + 0.02, 1.2, cz, 0xd8dce0, { rot: [0, 0, 0.15] }); }
    k.label('TURKEY. 7KG. IN SINCE 6AM. DO NOT TOUCH.', 0.3, 0.1, [cx + 0.335, 0.6, cz], [0, PI / 2, 0], { bg: '#fffbe8', fg: '#b71c1c', border: null, size: 48 });
    k.box(0.02, 0.4, 0.2, cx + 0.34, 0.5, cz + 0.12, 0xe8e0c8); k.label('I SURVIVED CHRISTMAS AT NAN\'S', 0.18, 0.36, [cx + 0.352, 0.5, cz + 0.12], [0, PI / 2, 0], { bg: '#e8e0c8', fg: '#b71c1c', border: '#2e7d32', size: 44 });   // tea towel
    for (let i = 0; i < 3; i++) { k.cyl(0.09, 0.08, 0.1, cx + 0.0 + 0.0, 0.96 + i * 0, -1.95 - i * 0.22, 0x8a8a90, 14); }
  }
  // the right-hand side: worktop with the kettle, toaster, bread bin, microwave; the washing machine; the twin-tub by the back door
  R(iX1 - 0.6, -4.4, iX1, -2.45, 0.88, 0.44, UNIT, { block: true }); unitFronts(k, 'z', iX1 - 0.6, -4.4, -2.45, -1, UNIT, [[-3.1, -2.5]]); R(iX1 - 0.62, -4.4, iX1, -2.45, 0.04, 0.9, TOPC, { collide: true });
  R(iX1 - 0.6, -3.08, iX1 - 0.58, -2.52, 0.82, 0.43, 0xf4f4f2); { const g = new THREE.CylinderGeometry(0.17, 0.17, 0.03, 18); g.rotateZ(PI / 2); k.parts.push(part(g, 0x9aa0a8, [iX1 - 0.6, 0.45, -2.8])); const g2 = new THREE.CylinderGeometry(0.13, 0.13, 0.034, 18); g2.rotateZ(PI / 2); k.parts.push(part(g2, 0x2a3a4a, [iX1 - 0.6, 0.45, -2.8])); }   // washing machine
  const kettle = { x: iX1 - 0.3, y: 0.92, z: -3.6 }, counter = { x: iX1 - 0.32, y: 0.94, z: -3.95 };
  k.cyl(0.08, 0.09, 0.2, kettle.x, kettle.y + 0.1, kettle.z, 0xe8e8e8, 14); k.box(0.03, 0.12, 0.1, kettle.x + 0.1, kettle.y + 0.12, kettle.z, 0xd8d8d8); k.cyl(0.015, 0.02, 0.06, kettle.x - 0.1, kettle.y + 0.16, kettle.z, 0xe8e8e8, 6);
  k.label("KETTLE'S ALWAYS ON", 0.18, 0.05, [kettle.x - 0.105, kettle.y + 0.1, kettle.z], [0, -PI / 2, 0], { bg: '#e8e8e8', fg: '#333', border: null, size: 44 });
  for (let i = 0; i < 6; i++) { k.cyl(0.04, 0.035, 0.09, iX1 - 0.25 + (i % 2) * 0.1, 0.965, -3.3 + Math.floor(i / 2) * 0.11, [0xf4f4f4, 0xc62828, 0x1e5aa8, 0xffd84a, 0x2e7d32, 0xf4f4f4][i], 10); }   // mugs lined up
  k.box(0.3, 0.2, 0.22, iX1 - 0.3, 1.02, -4.25, 0xb8862e); k.box(0.24, 0.16, 0.16, iX1 - 0.3, 1.0, -2.75, 0xc8c8cc);   // bread bin, toaster
  k.box(0.45, 0.28, 0.34, iX1 - 0.25, 1.62, -3.4, 0xe8e8e8); k.box(0.3, 0.2, 0.01, iX1 - 0.43, 1.62, -3.45, 0x1a1a1a);   // microwave on a shelf
  R(iX1 - 0.4, -3.75, iX1, -3.05, 0.03, 1.46, OAK);
  k.label('ASDA', 0.24, 0.22, [iX1 - 0.424, 1.06, -3.95], [0, -PI / 2, 0], { tex: TX.bagTex() }); k.box(0.2, 0.3, 0.28, iX1 - 0.32, 1.06, -3.95, 0x2e8a3a);   // a bag for life of sprouts
  k.label("LISA'S STAFF DISCOUNT APPLIES TO NOTHING HERE", 0.36, 0.14, [iX1 - 0.022, 1.32, -3.95], [0, -PI / 2, 0], { bg: '#2e8a3a', fg: '#fff', border: '#ffd84a', size: 48 });
  { const x0 = iX1 - 0.56, z0 = kZ0 + 0.05;                                                                              // the twin-tub, still going
    R(x0, z0, iX1 - 0.02, z0 + 0.52, 0.85, 0.43, 0xf4f0e6, { block: true, collide: true }); R(x0, z0, iX1 - 0.02, z0 + 0.52, 0.04, 0.87, 0x9a9aa0);
    R(x0 - 0.005, z0 + 0.05, x0, z0 + 0.47, 0.18, 0.72, 0x2a8ac8); k.label('TWIN-TUB (1979). STILL GOING.', 0.38, 0.12, [x0 - 0.008, 0.72, z0 + 0.26], [0, -PI / 2, 0], { bg: '#2a8ac8', fg: '#fff', border: null, size: 48 }); }
  // the fridge-freezer by the door, covered in magnets and notes
  { const x0 = iX1 - 0.62, z0 = -2.42, z1 = -1.68, H = 1.75;
    R(x0, z0, iX1, z1, H, H / 2, 0xf0ece0, { block: true, collide: true }); R(x0 - 0.01, z0 + 0.02, x0, z1 - 0.02, 0.006, 1.12, 0xc8c4b8); R(x0 - 0.03, z1 - 0.09, x0 - 0.01, z1 - 0.06, 0.4, 1.35, 0xc8c8cc); R(x0 - 0.03, z1 - 0.09, x0 - 0.01, z1 - 0.06, 0.3, 0.8, 0xc8c8cc);
    const F = (z, y, w, h, text, bg, fg) => k.label(text, w, h, [x0 - 0.013, y, z], [0, -PI / 2, (rnd() - 0.5) * 0.12], { bg, fg, border: null, size: 44 });
    F(-2.2, 1.55, 0.2, 0.12, "SOPHIE'S TRAIN BACK TO LONDON: 6:42", '#fff8b0', '#222'); F(-1.93, 1.5, 0.2, 0.14, "TOMMY: NO SAYING 'SYNERGY' AT THE TABLE", '#d8f0ff', '#1a3a6a');
    F(-2.25, 1.25, 0.2, 0.12, "PAUL: THE ANSWER IS NOT 'IT DEPENDS'", '#ffe0e0', '#8a1a1a'); F(-1.95, 1.22, 0.18, 0.1, '"I LITERALLY SAID THAT" — CHARLI, EVERY YEAR', '#f0e0ff', '#5a1a8a');
    F(-2.1, 0.95, 0.26, 0.2, "JIMMY'S KIDS AT SCHOOL MADE HIM A CARD: 'BEST MR EVER'. HE PRETENDS HE'S NOT CHUFFED.", '#fffef6', '#222');
    F(-2.2, 0.65, 0.18, 0.18, 'TO NAN LOVE FROM TOMMY AGE 5 (A REINDEER, APPARENTLY)', '#fff', '#c62828');
    [[-2.2, 1.62], [-1.93, 1.58], [-2.25, 1.32], [-1.95, 1.28], [-2.1, 1.06], [-2.2, 0.75], [-1.85, 0.85], [-1.8, 0.6], [-2.35, 0.45], [-1.9, 1.75]].forEach(([z, y], i) => k.box(0.014, 0.035, 0.045, x0 - 0.016, y, z, [0xc62828, 0xffd84a, 0x2e7d32, 0x1e5aa8, 0xff7ab0, 0xff8a1a][i % 6]));
    k.spawns.push(new THREE.Vector3(iX1 - 0.3, H + 0.05, -2.05)); }
  const fridge = { x: iX1 - 0.31, z: -2.05 };
  // wall cupboards, the HANGRY-O-METER, the break-glass box, the clock
  for (let i = 0; i < 2; i++) { const z = -4.5 + i * 0.6; R(kX0, z - 0.29, kX0 + 0.34, z + 0.29, 0.7, 1.85, UNIT); k.box(0.02, 0.1, 0.02, kX0 + 0.35, 1.6, z + 0.2, 0x8a6a3a); }
  for (let i = 0; i < 2; i++) { const x = kX0 + 0.25 + i * 0.6; if (x + 0.29 > -0.2) break; R(x - 0.29, kZ0, x + 0.29, kZ0 + 0.34, 0.7, 1.85, UNIT); }
  R(1.3, kZ0, 1.95, kZ0 + 0.34, 0.7, 1.85, UNIT);
  k.label('hangry-o-meter', 0.6, 0.49, [kX0 + 0.016, 1.72, -2.15], [0, PI / 2, 0], { tex: TX.hangryTex() });
  k.box(0.012, 0.55, 0.68, kX0 + 0.009, 1.72, -2.15, 0x2a2a2a);
  { const x = iX1 - 0.04, z = -4.75; k.box(0.08, 0.36, 0.3, x, 1.55, z, 0xc62828); k.box(0.01, 0.26, 0.22, x - 0.042, 1.53, z, 0xbfe4ff);
    for (let i = 0; i < 9; i++) k.box(0.02, 0.03, 0.05, x - 0.01, 1.43 + (i % 3) * 0.07, z - 0.07 + Math.floor(i / 3) * 0.07, [0xffd400, 0xff4a8a, 0x4ad8ff, 0x7aff4a, 0xff8a1a, 0x8e24aa][i % 6], { rot: [0.5, 0, 0.3 * i] });
    k.label('IN CASE OF HANGRY NAN: BREAK GLASS (QUALITY STREET INSIDE)', 0.32, 0.1, [x - 0.048, 1.78, z], [0, -PI / 2, 0], { bg: '#c62828', fg: '#fff', border: null, size: 46 }); k.box(0.02, 0.08, 0.02, x - 0.04, 1.3, z + 0.17, 0xb0b0b0); }
  wsign('x', HZB - WT / 2, -1, -0.1, 1.85, 0.8, 0.22, 'DINNER AT 2. NAN GETS HANGRY AT 2:01.', { bg: '#fffaf0', fg: '#c62828', border: '#c62828', size: 40 });
  wsign('x', HZB - WT / 2, -1, 2.28, 2.12, 0.8, 0.14, 'JIMMY: STILL MINDING YOUR HEAD? GOOD.', { bg: '#ffd400', fg: '#111', border: null, size: 52 });
  k.cyl(0.13, 0.13, 0.03, kX0 + 0.01, 2.0, -3.0, 0xc62828, 18); k.label('clock', 0.22, 0.22, [kX0 + 0.03, 2.0, -3.0], [0, PI / 2, 0], { tex: TX.clockFaceTex(false) });
  arch('x', KZ0, 2.05, 3.05, 2.05, WT, WHITE);
  // the back door (open to the garden), a pedal bin, the strip light
  { k.box(1.0, 2.05, 0.05, 2.89, 1.025, KZ0 - 0.6, 0xf4f4f0, { rot: [0, -1.25, 0] }); Q.add(glassMat, 0.6, 0.8, 2.89 - 0.03 * 0.95, 1.5, KZ0 - 0.6 + 0.03 * 0.32, -1.25); }
  k.cyl(0.14, 0.13, 0.42, 1.2, 0.21, -1.85, 0xf4f4f4, 14, { block: true }); k.cyl(0.145, 0.145, 0.03, 1.2, 0.43, -1.85, 0xd8d8d8, 14);
  k.box(1.2, 0.06, 0.12, 1.4, KCEIL - 0.04, -3.4, 0xf4f4f4); k.box(1.15, 0.04, 0.06, 1.4, KCEIL - 0.09, -3.4, 0xf8fcff); k.halo(1.4, KCEIL - 0.1, -3.4, 0.8, 0xe8f0ff);
  k.light(1.4, 2.1, -3.4, 0xf4f4ff, 2.6, 6);
  paperChain(k, [kX0 + 0.05, KCEIL - 0.04, -1.7], [iX1 - 0.05, KCEIL - 0.04, kZ0 + 0.05], { sag: 0.25 });
  // tea, coffee and sugar canisters, a radio, the Christmas cake, mince pies cooling, the pudding
  for (let i = 0; i < 3; i++) { k.cyl(0.06, 0.06, 0.16, -0.65 + i * 0.15, 0.98, kZ0 + 0.18, 0xd8c8a0, 12); k.cyl(0.062, 0.062, 0.03, -0.65 + i * 0.15, 1.07, kZ0 + 0.18, 0x6a4a2a, 12); }
  k.label('TEA · COFFEE · SUGAR (ALL TEA)', 0.44, 0.06, [-0.5, 0.95, kZ0 + 0.245], [0, 0, 0], { bg: '#d8c8a0', fg: '#3a2a1a', border: null, size: 48 });
  k.box(0.26, 0.15, 0.1, -0.6, 0.995, -2.3, 0x8a1a1a); k.cyl(0.04, 0.04, 0.012, -0.6 + 0.0, 0.995, -2.25, 0xc8c8c8, 12); k.box(0.004, 0.25, 0.004, -0.5, 1.15, -2.3, 0xc0c0c0);   // the radio
  k.cyl(0.13, 0.13, 0.1, -0.58, 0.97, -3.95, 0xf8f4ec, 18); k.cyl(0.131, 0.131, 0.02, -0.58, 0.93, -3.95, 0xc62828, 18); k.parts.push(part(new THREE.ConeGeometry(0.02, 0.06, 6), 0x2e7d32, [-0.58, 1.05, -3.95]));   // the Christmas cake (iced, a robin on it... well, a tree)
  k.box(0.36, 0.01, 0.26, 1.55, 0.925, kZ0 + 0.3, 0xa0a0a8); for (let i = 0; i < 9; i++) k.cyl(0.035, 0.03, 0.025, 1.43 + (i % 3) * 0.12, 0.943, kZ0 + 0.2 + Math.floor(i / 3) * 0.1, 0xd8a050, 10);   // mince pies
  k.parts.push(part(sph(0.08, 12, 8), 0x4a2410, [-0.5, 0.98, -4.3], [0, 0, 0], [1, 0.8, 1])); k.parts.push(part(sph(0.05, 10, 6), 0xf8f4ec, [-0.5, 1.03, -4.3], [0, 0, 0], [1, 0.3, 1])); k.box(0.04, 0.01, 0.015, -0.5, 1.06, -4.3, 0x2e7d32);   // the pudding
  k.label('PUDDING. NAN WILL SET FIRE TO IT. STAND BACK.', 0.26, 0.06, [-0.5, 0.95, -4.18], [0, PI / 2 - 0.2, 0], { bg: '#fffbe8', fg: '#b71c1c', border: null, size: 44 });
  for (const v of [[0.6, 0.98, kZ0 + 0.3], [kX0 + 0.3, 0.98, -4.0], [kX0 + 0.3, 0.98, -2.2], [iX1 - 0.32, 0.98, -4.3]]) k.spawns.push(new THREE.Vector3(...v));

  // ======================================================== OUTSIDE THE HOUSE: brick details, roof, chimney
  // the main roof: one gable roof over both halves of the semi (ours + next door), frosty tiles, a chimney stack each end
  const NEXT = { x0: HX1, x1: 10.6 };
  roofGable(HX0 - 0.125, NEXT.x1, HZB, HZF, [[HX0 + 0.2, 6.1], [NEXT.x1 - 0.2, 6.1]]);
  // TV aerial
  { const y = TOP + 3.1; k.cyl(0.015, 0.015, 1.4, 1.0, y + 0.7, 3.5, 0x9a9a9a, 6); for (let i = 0; i < 6; i++) k.box(0.012, 0.012, 0.5 - i * 0.05, 0.85 + i * 0.06, y + 1.3, 3.5, 0x9a9a9a); k.box(0.42, 0.015, 0.015, 1.0, y + 1.3, 3.5, 0x9a9a9a); }
  // the kitchen's lean-to roof
  Q.add(roofMat, HX1 - KX0 + 0.3, Math.hypot(HZB - KZ0 + 0.25, 0.8), (KX0 + HX1) / 2, KH + 0.4, (KZ0 + HZB) / 2 - 0.125, 0, -PI / 2 - Math.atan2(0.8, HZB - KZ0 + 0.25), 1.0);
  k.box(HX1 - KX0 + 0.3, 0.12, 0.12, (KX0 + HX1) / 2, KH - 0.04, KZ0 - 0.3, 0x2a2a2a); k.box(HX1 - KX0 + 0.3, 0.16, 0.03, (KX0 + HX1) / 2, KH + 0.0, KZ0 - 0.26, WHITE);
  { const sh = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(HZB - KZ0 + 0.125, 0), new THREE.Vector2(0, 0.78)]);
    for (const x of [KX0 - 0.13, HX1 + 0.005]) { const g = new THREE.ShapeGeometry(sh), uv = g.attributes.uv, p = g.attributes.position; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 0.6, p.getY(i) / 0.6); g.rotateY(PI / 2); g.translate(x, KH, HZB); Q.geo(brickMat, g); } }
  // our front: upstairs windows (nets), the porch canopy, the house number, the wreath, icicle lights along the gutter
  appliedWin('x', HZF + 0.125, 1, -1.3, 3.95, 2.0, 1.2, darkGlass, { bars: 2 }); appliedWin('x', HZF + 0.125, 1, 2.7, 4.0, 0.8, 1.0, darkGlass, { bars: 0 });
  appliedWin('x', HZB - 0.125, -1, -1.8, 3.95, 1.5, 1.15, darkGlass, { bars: 1 }); appliedWin('x', HZB - 0.125, -1, 2.1, 4.0, 0.8, 0.9, frostMat, { bars: 0, nets: false });
  appliedWin('z', HX0 - 0.125, -1, 1.5, 4.0, 0.7, 0.9, frostMat, { bars: 0, nets: false });
  glaze('x', HZF, 2.2, 3.2, 2.1, 2.1, { sill: false });
  { k.box(1.6, 0.08, 0.9, 2.7, 2.62, HZF + 0.5, WHITE); Q.add(roofMat, 1.7, 0.95, 2.7, 2.78, HZF + 0.55, 0, -PI / 2 + 0.3, 0.9); for (const x of [2.0, 3.4]) k.box(0.06, 0.3, 0.5, x, 2.42, HZF + 0.38, WHITE);
    k.label('23', 0.2, 0.14, [2.7, 2.32, HZF + 0.13], [0, 0, 0], { bg: '#f4f2ec', fg: '#1a1a1a', border: null, size: 70 });
    k.label('SANTA: PLEASE STOP HERE (NAN HAS BEEN GOOD. MOSTLY.)', 0.5, 0.32, [1.2, 0.7, 11.0], [0, 0.2, 0], { bg: '#c62828', fg: '#fff', border: '#ffd84a', size: 52 }); k.box(0.04, 0.6, 0.04, 1.2, 0.3, 10.98, 0x6a4a2a);
    icicles(HX0 - 0.3, NEXT.x0 + 0.1, HZF + 0.42, 0xf4f8ff, 44);
    fl.string([-2.7, 2.62, 9.5], [0.3, 2.62, 9.5], 20, { sag: 0.02 });
  }
  // next door (the other half): their own bay, door, windows; tasteful white lights
  houseFace(NEXT.x0, NEXT.x1, HZF, 1, { door: [NEXT.x1 - 1.4, NEXT.x1 - 0.4], bay: [NEXT.x0 + 0.6, NEXT.x0 + 3.4], up: [[NEXT.x0 + 1.9, 2.0], [NEXT.x1 - 0.9, 0.8]], lights: [0xfff6e0], v: 1 });
  houseBack(NEXT.x0, NEXT.x1, HZB, -1, { v: 2 });
  k.texBox(NEXT.x1 - NEXT.x0, 2.6, HZF - HZB, (NEXT.x0 + NEXT.x1) / 2 + 0.0, 1.3, (HZB + HZF) / 2, BRICK, { tile: 0.6, collide: true, block: true });
  k.texBox(NEXT.x1 - NEXT.x0, TOP - 2.6, HZF - HZB, (NEXT.x0 + NEXT.x1) / 2, 2.6 + (TOP - 2.6) / 2, (HZB + HZF) / 2, DASH, { tile: 1.2 });
  // their extension (a conservatory, naturally)
  { const x0 = 6.0, x1 = 10.4, z0 = -4.4; R(x0, z0, x1, HZB, 0.6, 0.3, 0xf4f4f0, { block: true }); Q.add(glassMat, x1 - x0, 1.7, (x0 + x1) / 2, 1.45, z0); Q.add(glassMat, HZB - z0, 1.7, x0, 1.45, (z0 + HZB) / 2, PI / 2);
    for (let x = x0; x <= x1 + 0.01; x += 0.73) k.box(0.06, 1.75, 0.06, x, 1.48, z0, WHITE); for (let z = z0; z <= HZB; z += 0.73) k.box(0.06, 1.75, 0.06, x0, 1.48, z, WHITE);
    Q.add(glassMat, x1 - x0, HZB - z0 + 0.2, (x0 + x1) / 2, 2.65, (z0 + HZB) / 2, 0, -PI / 2 + 0.2); k.box(x1 - x0, 0.08, 0.1, (x0 + x1) / 2, 2.35, z0, WHITE); k.blockers.push({ x0, x1, z0, z1: HZB, y1: 2.6 }); }

  // ======================================================== THE BACK GARDEN
  // fences round it (close-boarded, concrete posts and gravel boards), a trellis on top by the house
  const fence = (x0, z0, x1, z1, h = 1.8) => {
    const along = Math.abs(x1 - x0) > Math.abs(z1 - z0), len = along ? x1 - x0 : z1 - z0;
    k.texBox(along ? len : 0.04, h, along ? 0.04 : len, (x0 + x1) / 2, h / 2 + 0.15, (z0 + z1) / 2, FENCE, { tile: 0.9, collide: true, block: true });
    along ? k.box(len, 0.15, 0.05, (x0 + x1) / 2, 0.075, z0, 0x9a968e) : k.box(0.05, 0.15, len, x0, 0.075, (z0 + z1) / 2, 0x9a968e);
    along ? k.box(len, 0.04, 0.1, (x0 + x1) / 2, h + 0.17, z0, 0x5a3a20) : k.box(0.1, 0.04, len, x0, h + 0.17, (z0 + z1) / 2, 0x5a3a20);
    for (let t = 0; t <= len + 0.01; t += 1.83) along ? k.box(0.1, h + 0.25, 0.1, x0 + t, (h + 0.25) / 2, z0, 0x9a968e) : k.box(0.1, h + 0.25, 0.1, x0, (h + 0.25) / 2, z0 + t, 0x9a968e);
  };
  fence(-4.6, -20.5, 3.8, -20.5); fence(-4.6, -20.5, -4.6, 7.9); fence(3.8, -20.5, 3.8, KZ0);
  k.blockers.push({ x0: B.x0, x1: -4.6, z0: B.z0, z1: 8.4, y1: 2 }, { x0: 3.8, x1: B.x1, z0: B.z0, z1: HZB, y1: 2 }, { x0: NEXT.x1, x1: B.x1, z0: HZB, z1: 8.4, y1: 2 });   // (the neighbours' gardens: not ours)
  // the side gate (open, against the fence)
  k.box(0.05, 1.8, 1.25, -4.54, 1.05, 7.2, 0x7a4e2a); for (const y of [0.4, 1.6]) k.box(0.03, 0.1, 1.2, -4.5, y, 7.2, 0x5a3a20); k.box(0.04, 2.0, 0.1, HX0 - 0.17, 1.0, 7.9, 0x9a968e);
  // the side passage: the gas meter box, a hose reel, a water butt, Michael's old Royal Mail bike
  k.box(0.04, 0.5, 0.4, HX0 - 0.145, 0.9, 5.0, 0xe8e4d8); k.label('GAS', 0.2, 0.08, [HX0 - 0.167, 1.05, 5.0], [0, -PI / 2, 0], { bg: '#e8e4d8', fg: '#c62828', border: null, size: 60 });
  { const g = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 14); g.rotateZ(PI / 2); k.parts.push(part(g, 0x2e7d32, [HX0 - 0.19, 0.8, 1.5])); }
  k.cyl(0.28, 0.25, 0.9, -1.45, 0.45, -1.95, 0x1e5a2a, 14, { block: true }); k.cyl(0.29, 0.29, 0.03, -1.45, 0.91, -1.95, 0x1a4a22, 14);
  { const bx = -4.5, P2 = (a, b) => stick(k, new THREE.Vector3(bx, a[0], a[1]), new THREE.Vector3(bx, b[0], b[1]), 0.015, 0.015, 0xc62828, 6);
    for (const z of [2.2, 3.2]) { const g = new THREE.TorusGeometry(0.3, 0.025, 6, 16); g.rotateY(PI / 2); k.parts.push(part(g, 0x1a1a1a, [bx, 0.3, z])); }
    P2([0.3, 2.2], [0.75, 2.6]); P2([0.75, 2.6], [0.3, 3.2]); P2([0.75, 2.6], [0.85, 3.05]); P2([0.3, 3.2], [0.8, 3.1]); P2([0.8, 3.1], [0.95, 3.05]); P2([0.75, 2.6], [0.85, 2.5]);
    k.box(0.3, 0.25, 0.35, bx, 0.75, 2.05, 0xc62828); k.label("MICHAEL'S OLD POST BIKE. HE STILL OILS IT.", 0.4, 0.1, [bx + 0.03, 1.05, 2.7], [0, PI / 2, 0], { bg: '#fff8e7', fg: '#c62828', border: null, size: 48 }); }
  // the patio: a bench, pots, a bird feeder; the light-up reindeer; washing on the rotary line; gnomes all round
  { const bx = -2.4, bz = -6.7;
    for (const sx of [-0.7, 0.7]) { k.box(0.06, 0.45, 0.45, bx + sx, 0.225, bz, 0x2a2a2a); k.box(0.06, 0.4, 0.06, bx + sx, 0.65, bz + 0.2, 0x2a2a2a); }
    for (let i = 0; i < 4; i++) k.box(1.5, 0.03, 0.08, bx, 0.45, bz - 0.15 + i * 0.1, 0x8a6a4a); for (let i = 0; i < 3; i++) k.box(1.5, 0.08, 0.03, bx, 0.6 + i * 0.12, bz + 0.22, 0x8a6a4a);
    k.box(1.5, 0.01, 0.4, bx, 0.47, bz, 0xe8eef4);                                                                     // frost on the seat
    k.blockers.push({ x0: bx - 0.78, x1: bx + 0.78, z0: bz - 0.25, z1: bz + 0.27, y1: 0.85 }); k.seats.push({ x: bx - 0.4, z: bz - 0.05, yaw: PI, h: 0.47 }, { x: bx + 0.4, z: bz - 0.05, yaw: PI, h: 0.47 });
    for (const [x, z, s] of [[-4.1, -5.6, 0.9], [-1.3, -5.0, 0.7], [3.2, -6.9, 0.8], [-4.2, -2.0, 0.8]]) { k.cyl(0.2 * s, 0.15 * s, 0.35 * s, x, 0.175 * s, z, 0xa0583a, 12, { block: true }); leafyBall(k, x, 0.45 * s, z, 0.25 * s, { n: 22, r: 0.08 }); }
    k.cyl(0.02, 0.02, 1.6, -3.9, 0.8, -4.0, 0x2a2a2a, 6); k.cyl(0.05, 0.05, 0.25, -3.9, 1.3, -3.85, 0xb0b8c0, 8); k.cyl(0.07, 0.07, 0.015, -3.9, 1.65, -3.85, 0x2a2a2a, 10);
    reindeer(k, fl, -3.6, -6.4, 0.5, 1.0); reindeer(k, fl, 2.6, -6.5, -0.7, 0.7);
    k.label('RUDOLPH (BOUGHT 1998, ONE LEG FIXED WITH GAFFER TAPE)', 0.4, 0.12, [-3.6, 0.32, -6.0], [0, 0.4, 0], { bg: '#fffaf0', fg: '#b71c1c', border: null, size: 46 });
    fl.string([KX0 - 0.15, KH - 0.1, KZ0 - 0.2], [HX1 - 0.1, KH - 0.1, KZ0 - 0.2], 40, { sag: 0.1 });
    fl.string([HX0 - 0.15, 2.4, HZB - 0.15], [KX0 - 0.15, 2.4, HZB - 0.15], 16, { sag: 0.08 });
    k.box(0.9, 0.12, 0.4, 2.55, 0.06, KZ0 - 0.32, 0xb8b0a4, { collide: true });
  }
  // the lawn: wide open (you get flung about on it); the borders round it, the shed, the greenhouse, the line, the bird bath
  const LAWN = { x0: -3.95, x1: 3.15, z0: -17.4, z1: -7.85 };
  for (let z = -17.2; z < -7.6; z += 0.75 + rnd() * 0.4) { leafyBall(k, -4.3, 0.3, z, 0.25 + rnd() * 0.12, { n: 24, r: 0.09 }); if (rnd() < 0.7) leafyBall(k, 3.5, 0.28, z + 0.3, 0.22 + rnd() * 0.1, { n: 20, r: 0.08 }); }
  for (let i = 0; i < 9; i++) { const sd = i % 2 ? -4.35 : 3.5, z = -8.4 - i * 1.0; gnome(k, sd, z, sd < 0 ? PI / 2 : -PI / 2, [0xc62828, 0x2e7d32, 0x1e5aa8][i % 3], [0x1e5aa8, 0xc62828, 0xd4a020][i % 3], 1.7 + (i % 3) * 0.2); }
  k.label('GNOME ALONE', 0.22, 0.08, [3.5, 0.62, -12.4], [0, -PI / 2, 0], { bg: '#fffaf0', fg: '#2e7d32', border: '#c62828', size: 48 }); k.box(0.02, 0.5, 0.02, 3.5, 0.3, -12.4, 0x6a4a2a);
  k.label("SANTA: PRESENTS ROUND THE BACK PLEASE. THE CHIMNEY'S GAS.", 0.36, 0.2, [-4.35, 0.6, -15.4], [0, PI / 2, 0], { bg: '#c62828', fg: '#fff', border: '#ffd84a', size: 46 }); k.box(0.02, 0.5, 0.02, -4.35, 0.25, -15.4, 0x6a4a2a);
  // the shed
  { const x0 = 0.9, x1 = 3.6, z0 = -20.35, z1 = -18.3, H = 1.95;
    k.texBox(x1 - x0, H, z1 - z0, (x0 + x1) / 2, H / 2, (z0 + z1) / 2, woodTex('#6a4a2a'), { tile: 0.8, collide: true, block: true });
    const ang = 0.45, half = (z1 - z0) / 2 + 0.12, sl = half / Math.cos(ang); for (const sd of [-1, 1]) k.box(x1 - x0 + 0.2, 0.04, sl, (x0 + x1) / 2, H + Math.tan(ang) * half / 2, (z0 + z1) / 2 + sd * half / 2, 0x3a3a3e, { rot: [sd * ang, 0, 0] });
    for (const sd of [-1, 1]) k.box(x1 - x0 + 0.22, 0.008, sl, (x0 + x1) / 2, H + Math.tan(ang) * half / 2 + 0.024, (z0 + z1) / 2 + sd * half / 2, 0xdce4ec, { rot: [sd * ang, 0, 0] });   // frost on the felt
    k.box(0.8, 1.75, 0.04, 1.5, 0.88, z1 + 0.02, 0x5a3a20); k.box(0.04, 0.12, 0.06, 1.8, 0.95, z1 + 0.05, 0x2a2a2a); appliedWin('x', z1, 1, 2.8, 1.3, 0.8, 0.5, darkGlass, { nets: false, bars: 1, frame: 0x5a3a20 });
    k.label("SHED. CONTENTS: FORTY YEARS OF 'THAT MIGHT COME IN HANDY'", 0.6, 0.22, [1.5, 1.45, z1 + 0.045], [0, 0, 0], { bg: '#e8dcc0', fg: '#3a2a1a', border: '#3a2a1a', size: 48 }); }
  // the greenhouse: aluminium and glass, one pane smashed (1989)
  { const x0 = -4.4, x1 = -2.5, z0 = -20.3, z1 = -18.85, H = 1.9, AL = 0xb8bcc0;
    R(x0, z0, x1, z1, 0.25, 0.125, 0x9a5a3a, { block: true });
    for (const [a, b] of [[x0, z1], [x1, z1], [x0, z0], [x1, z0]]) k.box(0.04, H, 0.04, a, H / 2, b, AL);
    for (const x of [x0 + 0.475, x0 + 0.95, x0 + 1.425]) k.box(0.025, H, 0.025, x, H / 2, z1, AL);
    Q.add(glassMat, x1 - x0, H - 0.3, (x0 + x1) / 2, 0.25 + (H - 0.3) / 2, z1); Q.add(glassMat, z1 - z0, H - 0.3, x1, 0.25 + (H - 0.3) / 2, (z0 + z1) / 2, PI / 2);
    for (const sd of [-1, 1]) { Q.add(glassMat, x1 - x0, 0.9, (x0 + x1) / 2, H + 0.25, (z0 + z1) / 2 + sd * 0.35, 0, sd > 0 ? -PI / 2 + 0.7 : -PI / 2 - 0.7); k.box(x1 - x0, 0.03, 0.03, (x0 + x1) / 2, H + 0.52, (z0 + z1) / 2, AL); }
    k.box(0.45, 0.6, 0.006, x0 + 0.95 + 0.24, 1.2, z1 + 0.01, 0x3a3a3a);                                                     // the hole (still taped over with a bin bag)
    for (let i = 0; i < 4; i++) k.box(0.02, 0.3, 0.004, x0 + 1.15 + i * 0.05, 1.2, z1 + 0.014, 0xc8c8b8, { rot: [0, 0, 0.4 - i * 0.3] });
    k.label('WHO BROKE THE GREENHOUSE? (1989) CASE STILL OPEN', 0.5, 0.16, [x0 + 0.5, 1.6, z1 + 0.015], [0, 0, 0], { bg: '#fff8e7', fg: '#b71c1c', border: '#b71c1c', size: 48 });
    for (let i = 0; i < 5; i++) k.cyl(0.07, 0.05, 0.12, x0 + 0.3 + i * 0.3, 0.31, z0 + 0.3, 0xa0583a, 10); }
  // the rotary washing line (frozen washing on it: Michael's Christmas jumper, some very large pants)
  { const wx = -1.4, wz = -19.3; k.cyl(0.025, 0.03, 1.85, wx, 0.92, wz, 0xc8c8cc, 8, { block: true });
    for (let i = 0; i < 4; i++) { const a = i * PI / 2 + 0.3; stick(k, new THREE.Vector3(wx, 1.6, wz), new THREE.Vector3(wx + Math.cos(a) * 1.0, 1.8, wz + Math.sin(a) * 1.0), 0.012, 0.01, 0xc8c8cc, 4); }
    for (const r of [0.45, 0.75, 0.98]) for (let i = 0; i < 4; i++) { const a0 = i * PI / 2 + 0.3, a1 = a0 + PI / 2; stick(k, new THREE.Vector3(wx + Math.cos(a0) * r, 1.62 + r * 0.18, wz + Math.sin(a0) * r), new THREE.Vector3(wx + Math.cos(a1) * r, 1.62 + r * 0.18, wz + Math.sin(a1) * r), 0.003, 0.003, 0xe8e8e8, 3); }
    const W = [[0.75, 0.6, 0xc62828, 0.55, 0.6], [0.75, 2.2, 0xf4f4f4, 0.4, 0.3], [0.98, 3.8, 0x1e5aa8, 0.3, 0.7], [0.45, 5.0, 0x2e7d32, 0.25, 0.25]];
    for (const [r, a, col, w, h] of W) { const x = wx + Math.cos(a) * r, z = wz + Math.sin(a) * r; k.box(w, h, 0.02, x, 1.74 + r * 0.18 - h / 2, z, col, { rot: [0, -a + PI / 2, 0] }); }
    k.label('MICHAEL\'S XMAS JUMPER (FROZEN STIFF)', 0.4, 0.1, [wx + Math.cos(0.6) * 0.75, 1.62, wz + Math.sin(0.6) * 0.75 + 0.02], [0, -0.6 + PI / 2, 0], { bg: '#fffaf0', fg: '#c62828', border: null, size: 44 }); }
  // the bird bath (frozen over)
  { const bx = 0.3, bz = -18.2; k.cyl(0.12, 0.16, 0.06, bx, 0.03, bz, 0x9a968e, 12, { block: true }); k.cyl(0.06, 0.08, 0.6, bx, 0.36, bz, 0x9a968e, 10); k.cyl(0.26, 0.12, 0.1, bx, 0.7, bz, 0x9a968e, 18); k.cyl(0.22, 0.22, 0.01, bx, 0.75, bz, 0xdce8f0, 18);
    k.parts.push(part(sph(0.04, 8, 6), 0x6a4a2a, [bx + 0.12, 0.8, bz])); k.parts.push(part(sph(0.025, 8, 6), 0xd84a1a, [bx + 0.14, 0.79, bz + 0.03])); }   // a robin
  // a holly bush and a conifer in the corners; trees over the back fence
  leafyBall(k, 3.3, 0.9, -17.9, 0.5, { n: 60, r: 0.1 }); for (let i = 0; i < 10; i++) k.parts.push(part(sph(0.025, 6, 4), 0xd01020, [3.3 + Math.cos(i * 2.3) * 0.45, 0.9 + Math.sin(i * 1.7) * 0.4, -17.9 + Math.sin(i * 2.3) * 0.45]));
  for (const [x, z, s] of [[-8, -24, 1.3], [6, -25, 1.1], [-14, -12, 1.2], [14, -15, 1.4], [16, 3, 1.2]]) { k.cyl(0.2 * s, 0.28 * s, 3 * s, x, 1.5 * s, z, 0x4a3a2a, 8); for (const [dy, r] of [[3.4, 1.3], [4.4, 1.0]]) leafyBall(k, x, dy * s, z, r * s, { n: 30, r: 0.35 }); }
  // the neighbours' gardens over the fences (a trampoline, a shed, a snowman they built this morning)
  { const tx = -8.2, tz = -11; k.cyl(1.4, 1.4, 0.05, tx, 0.75, tz, 0x111111, 24); for (let q = 0; q < 6; q++) k.box(0.04, 0.75, 0.04, tx + Math.cos(q) * 1.4, 0.37, tz + Math.sin(q) * 1.4, 0x888888);
    k.box(2.0, 2.0, 1.6, -9.0, 1.0, -18.5, 0x5a6a4a); for (const [x, z] of [[7.5, -12]]) { k.parts.push(part(sph(0.45, 12, 8), 0xf4f8fc, [x, 0.4, z])); k.parts.push(part(sph(0.3, 12, 8), 0xf4f8fc, [x, 1.05, z])); k.parts.push(part(sph(0.2, 10, 6), 0xf4f8fc, [x, 1.5, z])); } }
  // fences round the neighbours' gardens too (so the view goes on)
  for (const x of [-11.4, 10.6]) fence(x, -20.5, x, HZB);
  terrace(k, scene, { ox: 15, oz: -31, ry: PI, n: 6, w: 5.0, D: 7.5, eave: 5.2, garden: 10, brick: BRICK, seed: 5 });

  // ======================================================== THE FRONT GARDEN, THE STREET
  // low brick walls round the front gardens, a gate (ours open), the bins, a conifer
  const lowWall = (x0, z0, x1, z1) => { const along = Math.abs(x1 - x0) > Math.abs(z1 - z0); k.texBox(along ? x1 - x0 : 0.22, 0.6, along ? 0.22 : z1 - z0, (x0 + x1) / 2, 0.3, (z0 + z1) / 2, BRICK, { tile: 0.6, collide: true, block: true }); along ? k.box(x1 - x0 + 0.04, 0.06, 0.28, (x0 + x1) / 2, 0.63, (z0 + z1) / 2, 0xb8b0a4) : k.box(0.28, 0.06, z1 - z0 + 0.04, (x0 + x1) / 2, 0.63, (z0 + z1) / 2, 0xb8b0a4); };
  lowWall(-4.6, 12, 2.2, 12); lowWall(3.3, 12, 6.4, 12); lowWall(7.4, 12, 10.7, 12); lowWall(-4.6, 8.6, -4.6, 12); lowWall(3.8, 8.6, 3.8, 12); lowWall(11.9, 12, 12.4, 12);
  lowWall(-8.2, 12, -4.6, 12); lowWall(-12.4, 12, -9.2, 12); lowWall(-11.4, 8.6, -11.4, 12);
  for (const x of [2.15, 3.35, 6.35, 7.45, -8.15, -9.25]) { k.texBox(0.3, 0.8, 0.3, x, 0.4, 12, BRICK, { tile: 0.6, block: true }); k.box(0.36, 0.06, 0.36, x, 0.83, 12, 0xb8b0a4); }
  k.box(0.05, 0.85, 1.0, 2.27, 0.5, 11.45, 0x1a1a1a); for (let z = 11.0; z < 11.95; z += 0.09) k.box(0.02, 0.75, 0.02, 2.27, 0.48, z, 0x1a1a1a);      // our gate, open (wrought iron)
  k.box(0.95, 0.85, 0.05, 6.9, 0.48, 12, 0x1a1a1a, { block: true }); k.box(1.0, 0.85, 0.05, -8.7, 0.48, 12, 0x1a1a1a, { block: true });          // theirs, shut
  k.blockers.push({ x0: 3.9, x1: 10.6, z0: 8.6, z1: 11.9, y1: 0.6 }, { x0: -11.3, x1: -4.7, z0: 8.6, z1: 11.9, y1: 0.6 });          // (their front gardens)
  wheelieBin(k, { x: -3.5, z: 11.35, ry: 0, col: 0x1a1a1a }); wheelieBin(k, { x: -2.8, z: 11.35, ry: 0, col: 0x2e6a2a }); wheelieBin(k, { x: -2.1, z: 11.35, ry: 0, col: 0x2a4a8a });
  k.label('BINS: NOT TILL THE 27TH. GOOD LUCK.', 0.5, 0.12, [-2.8, 0.75, 11.75], [0, 0, 0], { bg: '#fffaf0', fg: '#222', border: null, size: 48 });
  k.cyl(0.05, 0.08, 0.4, -4.1, 0.2, 9.5, 0x4a3a2a, 6); k.parts.push(part(new THREE.ConeGeometry(0.4, 1.4, 10), 0x2a4a2a, [-4.1, 1.05, 9.5])); for (let i = 0; i < 14; i++) fl.add(-4.1 + Math.cos(i * 1.3) * (0.08 + i * 0.022), 1.65 - i * 0.08, 9.5 + Math.sin(i * 1.3) * (0.08 + i * 0.022), BULBS[i % 5], 0.012, true);
  k.blockers.push({ x0: -4.5, x1: -3.7, z0: 9.1, z1: 9.9, y1: 1.7 });
  // the kerbs, the white lines down the road, the drain
  k.box(80, 0.13, 0.15, 0, 0.065, 14.28, 0xa8a49c); k.box(80, 0.13, 0.15, 0, 0.065, 20.12, 0xa8a49c);
  for (let x = -38; x < 38; x += 4) k.box(2.0, 0.006, 0.12, x, 0.008, 17.2, 0xe8e8e0);
  k.box(0.5, 0.01, 0.3, 4.2, 0.006, 14.55, 0x222222);
  // the street sign (and one across the road), lamp posts, parked cars (everyone's here)
  { const sign = streetSign(); for (const [x, z, ry] of [[-5.4, 12.16, 0], [5.0, 20.36, PI]]) { for (const dx of [-0.55, 0.55]) k.box(0.06, 1.0, 0.06, x + dx * Math.cos(ry), 0.5, z, 0x2a2a2a); k.box(1.25, 0.32, 0.04, x, 1.0, z, 0x2a2a2a); k.label('TEWKES ROAD', 1.2, 0.28, [x, 1.0, z + (ry ? -0.025 : 0.025)], [0, ry, 0], { tex: sign }); } }
  lampPost(k, -7.5, 13.9, 0); lampPost(k, 7.0, 13.9, 0); lampPost(k, 0.5, 20.55, PI);
  car(k, -6.8, 15.3, PI / 2, 0xb8bcc4, { kind: 'saloon' }); car(k, 6.6, 15.3, PI / 2, 0xa01a1a); car(k, 0.6, 15.3, PI / 2, 0x1e3a6a); car(k, -4.0, 19.05, -PI / 2, 0xf4f4f0); car(k, 8.6, 19.05, -PI / 2, 0x2a2a2a, { kind: 'saloon' });
  k.label("PAUL'S CAR. ASK HIM ABOUT THE MPG. (DON'T.)", 0.6, 0.16, [-6.8 - 0.3, 1.05, 15.3 - 0.8], [0, PI, 0], { bg: '#fffaf0', fg: '#222', border: null, size: 48 });
  k.label("LISA & MICHAEL'S. PARKED BY MICHAEL. (TWO WHEELS ON THE KERB.)", 0.6, 0.18, [6.6, 1.05, 15.3 - 0.8], [0, PI, 0], { bg: '#fffaf0', fg: '#222', border: null, size: 48 });
  k.label("TOMMY'S HIRE CAR FROM LONDON. 'IT'S AN INVESTMENT.'", 0.6, 0.16, [0.6, 1.05, 15.3 - 0.8], [0, PI, 0], { bg: '#fffaf0', fg: '#222', border: null, size: 48 });
  // ROAD CLOSED at both ends (nobody's going anywhere: it's Christmas)
  for (const [x, txt] of [[-11.7, "ROAD CLOSED. NAN'S HAVING CHRISTMAS."], [11.7, 'ROAD CLOSED. GO ROUND. (THERE IS NO ROUND.)']]) {
    for (let z = 12.4; z < 22.2; z += 2.0) { k.box(0.1, 1.0, 1.9, x, 0.7, z + 0.95, 0xf4f4f4, { block: true }); for (let i = 0; i < 4; i++) k.box(0.11, 0.24, 0.22, x, 0.7, z + 0.2 + i * 0.47, 0xd01818); k.box(0.4, 0.06, 0.1, x, 0.03, z + 0.15, 0x2a2a2a); k.box(0.4, 0.06, 0.1, x, 0.03, z + 1.75, 0x2a2a2a);
      fl.add(x, 1.25, z + 0.95, 0xffa000, 0.03, true); }
    k.label(txt, 1.6, 0.45, [x + (x < 0 ? 0.06 : -0.06), 1.5, 17.2], [0, x < 0 ? PI / 2 : -PI / 2, 0], { bg: '#d01818', fg: '#fff', border: '#fff', size: 44 }); for (const dz of [-0.6, 0.6]) k.box(0.06, 1.5, 0.06, x, 0.75, 17.2 + dz, 0x2a2a2a); }
  k.blockers.push({ x0: -12.4, x1: 12.4, z0: 22.4, z1: 23, y1: 1 });
  // the rest of our side of the street: the next pairs of semis (one with the full works), and the houses across the road
  houseRow(-19.4, -5.8, 2, HZF, 1, 10, { v: 3, lights: [[0xff3030, 0x30ff50, 0x3080ff, 0xffd030], [0xfff6e0]] });
  houseRow(12.0, 25.6, 2, HZF, 1, 10, { v: 5, lights: [[0x80c8ff], [0xff3030, 0x30ff50]] });
  houseRow(-26, 26, 9, 25.6, -1, 8, { v: 7, ott: 4, lights: [[0xffffff], [0xff3030, 0x30ff50, 0x3080ff], [0xffd030], null, null, [0x3080ff, 0xffffff], [0xff40ff, 0x30ff50], [0xffd030, 0xff3030], [0xfff6e0]] });
  for (const [x0, x1] of [[-5.8, -4.6], [10.6, 12.0]]) { k.box(x1 - x0, 1.8, 0.06, (x0 + x1) / 2, 1.0, 7.9, 0x7a4e2a, { block: true }); k.box(x1 - x0, 0.1, 0.08, (x0 + x1) / 2, 0.5, 7.94, 0x5a3a20); }   // their side gates, shut
  for (const [x, z] of [[-9.5, 10.5], [14.5, 10.5], [-15, 10.2]]) leafyBall(k, x, 0.6, z, 0.6, { n: 40, r: 0.14 });


  // ======================================================== OTHER PEOPLE'S HOUSES
  // icicle lights along a gutter
  function icicles(x0, x1, z, col, n, y = TOP - 0.36) { for (let i = 0; i < n; i++) { const x = x0 + (i + 0.5) * (x1 - x0) / n, drop = [1, 2, 3, 1, 2][i % 5]; for (let j = 0; j < drop; j++) fl.add(x, y - j * 0.09, z, col, 0.02, j === 0 && i % 2 === 0); } }
  // a gable roof over a row of houses (eaves on the front and back walls), bargeboards, gutters and fascias, chimney stacks
  function roofGable(xa, xb, zB, zF, chimneys = [], rise = 3.1) {
    const zm = (zB + zF) / 2, hw = (zF - zB) / 2, ov = 0.35, run = hw + ov, drop = rise * run / hw, sl = Math.hypot(run, drop), ang = Math.atan2(rise, hw), x0 = xa - 0.3, x1 = xb + 0.3;
    for (const sd of [-1, 1]) Q.add(roofMat, x1 - x0, sl, (x0 + x1) / 2, TOP + rise - drop / 2, zm + sd * run / 2, 0, sd > 0 ? -PI / 2 + ang : -PI / 2 - ang, 1.0);
    k.box(x1 - x0, 0.14, 0.18, (x0 + x1) / 2, TOP + rise + 0.03, zm, 0x5a4a44);
    const gs = new THREE.Shape([new THREE.Vector2(-hw, 0), new THREE.Vector2(hw, 0), new THREE.Vector2(0, rise)]);
    for (const gx of [xa, xb]) { const g = new THREE.ShapeGeometry(gs), uv = g.attributes.uv, p = g.attributes.position; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 1.2, p.getY(i) / 1.2); g.rotateY(PI / 2); g.translate(gx, TOP, zm); Q.geo(dashMat, g);
      for (const sd of [-1, 1]) k.box(0.05, 0.22, sl, gx + (gx === xa ? -0.33 : 0.33), TOP + rise - drop / 2 - 0.08, zm + sd * run / 2, WHITE, { rot: [sd > 0 ? ang : -ang, 0, 0] }); }
    for (const sd of [-1, 1]) { const z = zm + sd * (run - 0.04), y = TOP + rise - drop - 0.1; k.box(x1 - x0, 0.2, 0.04, (x0 + x1) / 2, y + 0.05, z, WHITE); k.box(x1 - x0, 0.1, 0.12, (x0 + x1) / 2, y - 0.08, z + sd * 0.07, 0x2a2a2a); }
    for (const [cx, cz] of chimneys) { const roofY = TOP + rise * (1 - Math.abs(cz - zm) / hw), top = roofY + 1.0; k.texBox(0.7, top - TOP + 0.3, 1.2, cx, (TOP - 0.3 + top) / 2, cz, BRICK, { tile: 0.6 }); k.box(0.8, 0.1, 1.3, cx, top, cz, 0x8a8478);
      for (const dz of [-0.28, 0.28]) k.cyl(0.1, 0.12, 0.35, cx, top + 0.22, cz + dz, 0xb86a3a, 10); }
  }
  // a house front: a bay (glowing room with a tree in it), the front door with its porch, the upstairs windows, the lights
  function houseFace(x0, x1, zf, dir, { door, bay, up, lights = null, v = 0, ott = false }) {
    const F = (o) => zf + dir * o, ry = dir > 0 ? 0 : PI, mat = xmasWin[v % 4];
    if (bay) { const [a, b] = bay, mid = (a + b) / 2, w = b - a, d = 0.7;
      k.texBox(w, 0.75, d, mid, 0.375, F(d / 2), BRICK, { tile: 0.6, block: true, collide: true }); k.box(w + 0.1, 0.05, d + 0.1, mid, 0.78, F(d / 2), WHITE);
      Q.add(mat, w - 0.08, 1.4, mid, 1.5, F(d + 0.005), ry); for (const [sx, s2] of [[a, -1], [b, 1]]) Q.add(xmasWin[(v + 1) % 4], d - 0.08, 1.4, sx + s2 * 0.005, 1.5, F(d / 2), s2 > 0 ? PI / 2 : -PI / 2);
      Q.add(laceMat, w - 0.12, 1.3, mid, 1.5, F(d + 0.012), ry);
      for (const t of [0, 0.25, 0.5, 0.75, 1]) k.box(0.06, 1.42, 0.06, a + 0.03 + t * (w - 0.06), 1.5, F(d), WHITE); for (const y of [0.8, 2.22, 1.92]) k.box(w + 0.02, 0.05, 0.06, mid, y, F(d), WHITE);
      for (const sx of [a, b]) { k.box(0.06, 1.42, 0.06, sx, 1.5, F(0.03), WHITE); k.box(0.06, 0.05, d, sx, 2.22, F(d / 2), WHITE); }
      k.box(w + 0.1, 0.22, d + 0.1, mid, 2.36, F(d / 2), WHITE); Q.add(roofMat, w + 0.2, 0.95, mid, 2.62, F(d / 2 + 0.05), ry, -PI / 2 + 0.55, 0.9);
      if (lights) fl.string([a, 2.28, F(d + 0.06)], [b, 2.28, F(d + 0.06)], Math.round(w * 7), { sag: 0.05, colors: lights, size: 0.022 }); }
    if (door) { const [a, b] = door, mid = (a + b) / 2; const DC = [0xf4f4f0, 0x1a3a6a, 0x6a1a24, 0x1e4a32, 0x2a2a2a][v % 5];
      k.box(b - a + 0.12, 2.2, 0.08, mid, 1.1, F(0.02), WHITE); k.box(b - a - 0.02, 2.05, 0.05, mid, 1.03, F(0.05), DC); Q.add(frostMat, (b - a) * 0.5, 0.5, mid, 1.55, F(0.08), ry);
      k.box(0.2, 0.04, 0.03, mid, 0.95, F(0.08), BRASS); k.box(b - a + 0.3, 0.12, 0.45, mid, 0.06, F(0.25), 0xb8b0a4);
      Q.add(wreathMat, 0.36, 0.36, mid, 1.25, F(0.09), ry);
      k.box(b - a + 0.6, 0.08, 0.75, mid, 2.5, F(0.4), WHITE); Q.add(roofMat, b - a + 0.7, 0.8, mid, 2.64, F(0.42), ry, -PI / 2 + 0.3, 0.9);
      k.label(String(21 + v * 2), 0.16, 0.12, [mid, 2.28, F(0.07)], [0, ry, 0], { bg: '#f4f2ec', fg: '#1a1a1a', border: null, size: 60 }); }
    for (const [cx, w] of up || []) appliedWin('x', zf, dir, cx, 3.95, w, 1.1, darkGlass, { bars: w > 1.2 ? 2 : 0 });
    if (lights) icicles(x0 + 0.05, x1 - 0.05, F(0.42), lights[0], Math.round((x1 - x0) * 5));
    if (ott) {   // THE ONE ACROSS THE ROAD: every surface lit, inflatables, a sleigh, a star the size of a car
      for (let r = 0; r < 7; r++) fl.string([x0 + 0.2, 5.0 - r * 0.38, F(0.06)], [x1 - 0.2, 4.85 - r * 0.38, F(0.06)], 34, { sag: 0.14, colors: [BULBS[r % 5], BULBS[(r + 2) % 5], 0xffffff], halo: true, off: r, size: 0.028 });
      for (let i = 0; i < 12; i++) { const a = i / 12 * PI * 2; fl.string([(x0 + x1) / 2, 7.2, F(0.4)], [(x0 + x1) / 2 + Math.sin(a) * 0.9, 7.2 + Math.cos(a) * 0.9, F(0.4)], 6, { sag: 0, colors: [0xffd030], halo: true, size: 0.035 }); }
      for (let i = 0; i < 2; i++) for (let t = 0; t < 1; t += 0.05) { const xx = x0 + 0.1 + i * (x1 - x0 - 0.2); fl.add(xx, 0.2 + t * 4.8, F(0.08), t * 20 % 2 < 1 ? 0xff3030 : 0x30ff50, 0.03, true); }   // up both corners
      for (let i = 0; i < 6; i++) { const cxx = x0 + 0.5 + i * (x1 - x0 - 1.0) / 5, czz = F(0.9 + (i % 2) * 0.15); stick(k, new THREE.Vector3(cxx, 0, czz), new THREE.Vector3(cxx, 0.7, czz), 0.025, 0.025, 0xf4f4f4, 6); stick(k, new THREE.Vector3(cxx, 0.7, czz), new THREE.Vector3(cxx + 0.15, 0.8, czz), 0.025, 0.025, 0xd01818, 6);
        for (let j = 0; j < 6; j++) fl.add(cxx, 0.1 + j * 0.13, czz + dir * 0.03, j % 2 ? 0xff2020 : 0xffffff, 0.022, j % 2 === 0); }   // light-up candy canes along the path
      reindeer(k, fl, (x0 + x1) / 2 - 0.4, F(3.1), dir > 0 ? PI / 2 : -PI / 2, 0.9); reindeer(k, fl, (x0 + x1) / 2 + 0.6, F(3.1), dir > 0 ? PI / 2 : -PI / 2, 0.9);
      k.lamp((x0 + x1) / 2, 7.2, F(0.4), LAMPC, 0.12); k.halo((x0 + x1) / 2, 7.2, F(0.4), 3.2, 0xffe080);
      const gx = (x0 + x1) / 2, gz = F(2.0);
      k.parts.push(part(sph(0.7, 14, 10), 0xf8fbff, [gx - 1.6, 0.7, gz])); k.parts.push(part(sph(0.5, 14, 10), 0xf8fbff, [gx - 1.6, 1.75, gz])); k.parts.push(part(sph(0.35, 12, 8), 0xf8fbff, [gx - 1.6, 2.5, gz])); k.cyl(0.32, 0.32, 0.08, gx - 1.6, 2.78, gz, 0x111111, 14); k.cyl(0.2, 0.2, 0.4, gx - 1.6, 3.0, gz, 0x111111, 14);
      k.parts.push(part(sph(0.75, 14, 10), 0xd01818, [gx + 1.5, 0.75, gz])); k.parts.push(part(sph(0.45, 14, 10), 0xf0c8a0, [gx + 1.5, 1.85, gz])); k.parts.push(part(new THREE.ConeGeometry(0.42, 0.7, 12), 0xd01818, [gx + 1.5, 2.5, gz])); k.parts.push(part(sph(0.4, 12, 8), 0xf8f8f8, [gx + 1.5, 1.6, gz + dir * 0.3]));
      k.box(1.8, 0.5, 0.8, gx, 0.45, gz + dir * 0.6, 0xc01818); k.box(1.9, 0.08, 0.1, gx, 0.08, gz + dir * 0.2, 0xd4af37); k.box(1.9, 0.08, 0.1, gx, 0.08, gz + dir * 1.0, 0xd4af37);
      fl.string([gx - 0.9, 0.72, gz + dir * 0.2], [gx + 0.9, 0.72, gz + dir * 0.2], 14, { sag: 0, colors: [0xffd030] });
      k.box(3.7, 0.6, 0.04, gx, 2.95, F(0.73), 0x2a2a2a); k.label('MERRY CHRISTMAS TEWKES ROAD!!!', 3.6, 0.5, [gx, 2.95, F(0.755)], [0, ry, 0], { bg: '#c01818', fg: '#ffe060', border: '#ffe060', size: 70, glow: true });
      k.label("SANTA STOP HERE. (NOT AT NAN'S. SHE'S ON THE LIST.)", 1.4, 0.4, [gx, 3.4, F(0.08)], [0, ry, 0], { bg: '#0a1a3a', fg: '#ffd84a', border: '#ffd84a', size: 44, glow: true });
      k.label('NUMBER 30. THEIR ELECTRICITY BILL HAS ITS OWN POSTCODE.', 1.1, 0.24, [gx + 1.5, 0.75, F(2.4)], [0, ry, 0], { bg: '#fffaf0', fg: '#c62828', border: '#c62828', size: 48 }); k.box(0.04, 0.7, 0.04, gx + 1.5, 0.35, F(2.39), 0x6a4a2a);
    }
  }
  // the back of somebody else's house (seen from our garden): windows, a back door
  function houseBack(x0, x1, zb, dir, { v = 0 } = {}) {
    const w = x1 - x0; appliedWin('x', zb, dir, x0 + w * 0.3, 3.95, 1.3, 1.1, darkGlass, { bars: 1 }); appliedWin('x', zb, dir, x0 + w * 0.75, 4.0, 0.8, 0.9, frostMat, { nets: false, bars: 0 });
    appliedWin('x', zb, dir, x0 + w * 0.3, 1.5, 1.6, 1.15, xmasWin[(v + 2) % 4], { bars: 2, nets: false }); k.box(0.95, 2.1, 0.06, x0 + w * 0.75, 1.05, zb + dir * 0.03, 0xf4f4f0);
    k.cyl(0.04, 0.04, TOP - 0.2, x0 + 0.15, (TOP - 0.2) / 2, zb + dir * 0.12, 0x1a1a1a, 8);
  }
  // a row of houses: brick downstairs, pebbledash up, one roof; doors and bays mirrored in pairs
  function houseRow(x0, x1, n, zf, dir, D, { v = 0, lights = [], ott = -1 } = {}) {
    const w = (x1 - x0) / n, zb = zf - dir * D, zc = (zf + zb) / 2;
    k.texBox(x1 - x0, 2.6, D, (x0 + x1) / 2, 1.3, zc, BRICK, { tile: 0.6, collide: true, block: true });
    k.texBox(x1 - x0, TOP - 2.6, D, (x0 + x1) / 2, 2.6 + (TOP - 2.6) / 2, zc, DASH, { tile: 1.2 });
    k.box(x1 - x0 + 0.04, 0.06, 0.04, (x0 + x1) / 2, 2.6, zf + dir * 0.02, 0xe8e2d4);
    const chim = []; for (let i = 0; i <= n; i += 2) chim.push([Math.min(x1 - 0.4, Math.max(x0 + 0.4, x0 + i * w)), zc + dir * 1.5]);
    roofGable(x0, x1, Math.min(zf, zb), Math.max(zf, zb), chim);
    const PAINTS = [0xf4f0e6, 0xe8dcc0, 0xdcd4c8, 0xf0e8d8, 0xc8d4d0];
    for (let i = 0; i < n; i++) { const a = x0 + i * w, b = a + w, m = i % 2 === 0, hv = (v * 7 + i * 3) % 5;
      if (hv === 1 || hv === 3) k.box(w - 0.02, 2.58, 0.012, (a + b) / 2, 1.3, zf + dir * 0.007, PAINTS[(v + i) % 5]);        // some have rendered the bottom half too
      if (hv === 2) k.box(w - 0.02, 2.6, 0.012, (a + b) / 2, 3.95, zf + dir * 0.007, [0xf4f0e6, 0xe8d8b8, 0xd8e0d0][i % 3]);  // ...or painted the pebbledash
      const door = m ? [a + 0.35, a + 1.3] : [b - 1.3, b - 0.35], bay = m ? [b - 3.0, b - 0.4] : [a + 0.4, a + 3.0], up = m ? [[a + 0.82, 0.8], [b - 1.7, 1.9]] : [[b - 0.82, 0.8], [a + 1.7, 1.9]];
      houseFace(a, b, zf, dir, { door, bay, up, lights: lights[i] || null, v: v + i, ott: i === ott });
      if (dir > 0) houseBack(a, b, zb, -dir, { v: v + i });
      const gz = zf + dir * 2.6; if (dir < 0) { k.texBox(w - 1.2, 0.6, 0.22, (a + b) / 2 - 0.5 + (m ? 0.5 : -0.1), 0.3, zf + dir * 3.0, BRICK, { tile: 0.6 }); leafyBall(k, (a + b) / 2 + (m ? -1.2 : 1.2), 0.5, gz, 0.5, { n: 30, r: 0.12 }); }
    }
  }

  // ======================================================== FINISH
  Q.build();
  // DRAWING IT CHEAPLY: the furniture and fittings inside the house are merged one room at a time (seen from the lounge
  // you don't pay for the kitchen) and never cast the sun's shadow (they're under the roof: the shadow map skips them);
  // everything outside is merged in big 24m blocks. (The kit would otherwise cut the whole lot into 12m squares.)
  const interiorMeshes = new Set();
  { const groups = new Map(), c = new THREE.Vector3();
    const room = (x, z, y) => (y < 2.6 && x > HX0 - 0.05 && x < HX1 + 0.05 && z > KZ0 - 0.05 && z < 9.45) ? (z < HZB ? 'kitchen' : x > 1.3 ? 'hall' : z < 3.4 ? 'dining' : 'lounge') : null;
    for (const g of k.parts) { g.computeBoundingBox(); g.boundingBox.getCenter(c); const r = room(c.x, c.z, c.y), key = r || ('out' + Math.floor((c.x + 12) / 24) + ',' + Math.floor((c.z + 12) / 24));
      (groups.get(key) || groups.set(key, []).get(key)).push(g); }
    for (const [key, list] of groups) { const m = new THREE.Mesh(merge(list), vcLambert); m.name = 'tewkes ' + key; scene.add(m); if (!key.startsWith('out')) interiorMeshes.add(m); }
    k.parts = []; }
  fl.build(scene);
  const room = k.finish({
    name: "Nan's old house (Tewkes Road)",
    sky: 0xd8e4f4, ground: 0x7a8a6a, hemiI: 1.25, sun: 0xffd8a8, sunI: 2.4, sunPos: [SUN_DIR.x * 30, SUN_DIR.y * 30, SUN_DIR.z * 30], ambient: 0.42,
    start: { x: 2.55, z: 7.55, yaw: 0 },
    board: { x: iX0 + 0.02, y: 1.5, z: 1.0, ry: PI / 2 },
    startFood: ['mince', 'cookie', 'can', 'crisps', 'chicken', 'sausageroll', 'cookie', 'can', 'pizza', 'burger'],
    spotCount: 30,
  });
  // low winter sun with long soft shadows, a cold haze down the road
  room.shadows = true;
  const sun = room.sun; sun.castShadow = true; sun.target.position.set(0, 0, 0); scene.add(sun.target); sun.position.copy(SUN_DIR).multiplyScalar(30);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 2, far: 70 }); sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  // the textured walls, roofs and fences: merged by material in 24m blocks (kit.js made 8m ones)
  { const groups = new Map(), c = new THREE.Vector3(), skip = new Set([sky, clouds, ground]);
    scene.updateMatrixWorld(true);
    for (const o of [...scene.children]) { if (!o.isMesh || o.isInstancedMesh || skip.has(o) || o.userData.sign || o.userData.tv || interiorMeshes.has(o) || Array.isArray(o.material) || o.material === vcLambert || !o.geometry.attributes.uv || o.geometry.morphAttributes.position) continue;
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); c.copy(o.geometry.boundingBox.getCenter(new THREE.Vector3())).applyMatrix4(o.matrixWorld);
      const key = o.material.uuid + ':' + Math.floor((c.x + 12) / 24) + ',' + Math.floor((c.z + 12) / 24); (groups.get(key) || groups.set(key, []).get(key)).push(o); }
    for (const list of groups.values()) { if (list.length < 2) continue;
      const geos = list.map(o => { const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(o.matrixWorld); for (const a of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(a)) g.deleteAttribute(a); if (!g.attributes.normal) g.computeVertexNormals(); g.clearGroups(); return g; });
      const g = BGU.mergeGeometries(geos, false); if (!g) continue; g.computeBoundingSphere();
      const m = new THREE.Mesh(g, list[0].material); m.renderOrder = list[0].renderOrder; scene.add(m); for (const o of list) { scene.remove(o); o.geometry.dispose(); } } }
  // who casts the sun's shadow: the outside of things (walls, roofs, fences, trees, cars, people), not the furniture under the
  // roof, the wallpaper, floors, ceilings, glass, nets or signs
  const NOSHADOW = new Set([ceilMat, laceMat, glassMat]), INSIDE_TEX = new Set([ROSE, STRIPE, CHIP, ANAG, KT].map(t => t.uuid));
  scene.traverse(o => { if (!o.isMesh || o === sky || o === clouds) return; o.receiveShadow = true;
    const m = o.material, inside = interiorMeshes.has(o) || NOSHADOW.has(m) || (m.map && INSIDE_TEX.has(m.map.uuid)) || o.userData.sign || o.userData.tv || m.polygonOffset;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox, away = bb.min.z > 22.4 || bb.min.x > 12.2;      // (across the road / up the street: their shadows fall away from us)
    o.castShadow = !inside && !away && !m.transparent && !(m.isMeshBasicMaterial && !m.map); });
  ground.castShadow = false; ground.receiveShadow = true;
  scene.fog = new THREE.Fog(0xd4dae2, 26, 62);
  { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunGlowTex(), color: 0xffe8c8, transparent: true, depthWrite: false, fog: false }));
    sp.position.copy(SUN_DIR).multiplyScalar(28); sp.scale.setScalar(8); sp.renderOrder = -97; sp.frustumCulled = false; skyRig.add(sp);
    room.skyRefs = { sky, sunSprite: sp, clouds }; }
  const IN = [[HX0, HZB, HX1, HZF], [KX0, KZ0, HX1, HZB], [-2.6, HZF, 0.2, 9.35], [0.9, -20.35, 3.6, -18.3], [-4.4, -20.3, -2.5, -18.85], [6.0, -4.4, 10.4, HZB]];
  room.indoors = (x, z) => IN.some(([a, b, c, d]) => x > a && x < c && z > b && z < d);
  const baseUpdate = room.update.bind(room); let shT = 0;
  room.update = (dt) => { baseUpdate(dt); fl.update(room.t);
    if ((shT -= dt) <= 0) { shT = 1; scene.traverse(o => { if ((o.isSkinnedMesh || (o.isMesh && o.parent && o.parent.isBone)) && !o.userData.shad) { o.castShadow = true; o.userData.shad = true; } }); } };

  // ---- what the game needs to know about the place
  room.zones = {
    lounge: { x0: HX0, x1: 1.3, z0: 3.4, z1: 9.3 }, hall: { x0: 1.3, x1: HX1, z0: HZB, z1: HZF }, dining: { x0: HX0, x1: 1.3, z0: HZB, z1: 3.4 },
    kitchen: { x0: KX0, x1: HX1, z0: KZ0, z1: HZB }, garden: { x0: -4.6, x1: 3.8, z0: -20.5, z1: KZ0 }, front: { x0: -4.6, x1: 3.8, z0: HZF, z1: 12 }, road: { x0: B.x0, x1: B.x1, z0: 12, z1: B.z1 },
  };
  room.quiz = {
    host: { x: hostSeat.x, z: hostSeat.z, yaw: hostSeat.yaw, h: hostSeat.h },
    seats: quizSeats.map(s => ({ x: s.x, z: s.z, yaw: s.yaw, h: s.h })),
    tv: { x: scr.x, y: scr.y, z: scr.z, ry: tvYaw, w: TVW, h: TVH },          // (a PlaneGeometry at (x, y, z) with rotation.y = ry faces the room)
    stand: STAND,
  };
  room.dinner = { seats: dinnerSeats.map(s => ({ x: s.x, z: s.z, yaw: s.yaw, h: s.h })), table: { x: TB.x, z: TB.z, w: TB.w, d: TB.d, h: TB.h } };
  room.kitchen = { kettle: { x: kettle.x, y: kettle.y, z: kettle.z }, fridge, counter };
  room.stash = stash; room.tree = { x: TREE.x, z: TREE.z }; room.drinks = drinks;
  room.lawn = LAWN; room.gardenStart = { x: 0.6, z: -6.6, yaw: 0 };
  room.familyPhotos = photos;
  room.fairyLights = fl;
  // free roam: where people hang about (each sitting spot snapped onto its seat)
  room.activities = [
    { x: hostSeat.x, z: hostSeat.z, yaw: hostSeat.yaw, pose: 'sit' }, ...quizSeats.slice(0, 4).map(s => ({ x: s.x, z: s.z, yaw: s.yaw, pose: 'sit' })),
    { x: -1.6, z: 6.3, yaw: yawTo(-1.6, 6.3, -2.6, 6.1), pose: 'drink' }, { x: 0.2, z: 2.3, yaw: 0, pose: 'drink' }, { x: 2.0, z: -3.4, yaw: Math.PI / 2, pose: 'chat' },
    { x: 1.6, z: -2.9, yaw: PI / 2, pose: 'phone' }, { x: 2.4, z: 6.5, yaw: PI, pose: 'chat' }, { x: -0.5, z: -6.4, yaw: PI, pose: 'phone' }, { x: 2.7, z: 10.5, yaw: 0, pose: 'phone' },
  ];
  return room;
}

// ---- little texture helpers
function rep(t) { t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function skyGlassTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#9ab4cc'); gr.addColorStop(0.45, '#4a5a6a'); gr.addColorStop(1, '#2a3038'); g.fillStyle = gr; g.fillRect(0, 0, 64, 128);
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(0, 30); g.lineTo(64, 0); g.lineTo(64, 20); g.lineTo(0, 50); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function streetSign() { return TX.streetSignTex('TEWKES ROAD', 'ESSEX · NO HAWKERS · NO CIRCULARS · NO REINDEER'); }
function sunGlowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,245,1)'); gr.addColorStop(0.14, 'rgba(255,245,215,1)'); gr.addColorStop(0.35, 'rgba(255,225,170,0.4)'); gr.addColorStop(1, 'rgba(255,225,170,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// thin high winter cloud (a few streaks of cirrus and low grey-white puffs toward the horizon)
function cloudTex() {
  const W = 512, H = 128, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  let s = 99; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 70; i++) { const x = r() * W, y = H * (0.35 + r() * 0.55), w = 30 + r() * 90, h = 4 + r() * 10 * (y / H); const gr = g.createRadialGradient(x, y, 0, x, y, w); gr.addColorStop(0, `rgba(255,252,248,${0.25 + r() * 0.35})`); gr.addColorStop(1, 'rgba(255,252,248,0)'); g.fillStyle = gr; g.save(); g.translate(x, y); g.scale(1, h / w); g.beginPath(); g.arc(0, 0, w, 0, 7); g.fill(); g.restore(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t;
}
