// NAN'S NEW HOUSE (SANDY BAY): Joan's park home on Sandy Bay, "a luxury residential resort" (gated, over-50s) on
// Thorney Bay Road, Canvey Island. Christmas Day afternoon. Looking down (x along her street, +z toward the road):
//
// Laid out like the aerial photo of her plot (Wave Road in front, Pebble Road behind the green verge), and Nan's house
// itself EXACTLY to the family's own floor plan, 1.35x bigger so it's easy to walk round (drawn looking down, the road
// at the bottom: drawing px -> metres x = (px - 1089) * 0.01284 * 1.35, z = (py - 702.5) * 0.01284 * 1.35 - 1.4, so the
// drawing's right is +x and its bottom is +z).
//   x -27          the way in: barrier, the turquoise SANDY BAY sign, the Sales Office & Car Wash (across)
//   x -27 .. -15   Nan's left-hand neighbour (a Sonata), and the home behind it that fronts Pebble Road
//   x -14.3..-11.2 NAN'S DRIVE down the left of her plot (pale block paving), her silver Nissan Micra parked on it
//   z 7 .. 12.5    Wave Road (tarmac, low pale kerbs, slim anthracite lamp posts), Seafarer Drive off it to the north
//   z -5.5..2.7    NAN'S HOME (x -10.3 .. 10.3), floor up on its chassis (0.65 m). West to east: the mirrored wardrobes |
//                  the RED BEDROOM (back, with its en-suite + walk-in shower) and the YELLOW BEDROOM (front) | the
//                  hall (both bedroom doors straight ahead, the bathroom on the left), the airing cupboard, the
//                  front-door corridor | the KITCHEN-DINER, the hub (L of units, island, the table set for nine
//                  against the sofa) | the LIVING ROOM (Nan's armchair, fire, TV, the French doors on to the deck)
//   z 2.7 .. 5.3   the L-shaped DECKING along the front and down the living room's end (clear glass balustrade);
//                  the decking stairs at its bottom-left up to the FRONT DOOR, stairs off the back of the end strip
//   z -5.5..-14.7  her back garden: grass, two garden SHEDS in the back left-hand corner facing in toward the lawn,
//                  the back door's steps, the washing line; side hedges
//   z -14.7..-15.4 the long back hedge (a little gate at the side path). No home behind her: just the hedge, then
//   z -15.4..-20.6 THE GREEN, the long grass verge along Pebble Road
//   x 14.9 .. 27   Nan's right-hand neighbour (a Sonata); the green carries on behind it
//   x 27 .. 46     the clubhouse (mock-Tudor gable) and its heated pool behind brick piers and railings
//   x 48           the white sea wall, a gate through to the promenade, the revetment, the beach, the estuary
//   z -20.6..-26.2 Pebble Road; across it, a row of homes facing it
import * as THREE from 'three';
import { Kit } from './kit.js';
import { NavGrid } from '../nav.js';
import { sofa } from './furniture.js';
import { part, sph, cyl, merge, vcLambert } from '../geo.js';
import { photoSlot } from '../portraits.js';
import { canvasTex } from '../textures.js';
import { updateOutdoor, pottedPlant } from './outdoor.js';
import { rng, bulb, buildBulbs, lightString, MULTI, WARM, wreath, xmasTree, presents, reindeer, hangryTex, calendarTex, flameTex, blanketTex } from './sandybay_props.js';
import * as TX from './sandybay_tex.js';
import { FL, EAVE, PITCH, C, Bag, roofGeo, roofTrim, porchRoof, placeHomes } from './sandybay_estate.js';
import { nissan } from './nissan.js';
import { L, buildResort, car, metreUV2 } from './sandybay_resort.js';
import * as F from './sandybay_furn.js';

const _skyV = new THREE.Vector3();
const FAM = (n) => './assets/family/' + n + '.glb';

// ---- Nan's home, to the family's floor plan, 1.35x the drawing's own scale (so every room and the hall is roomier:
// about 20.6 m by 8.2 m) and set back 1.4 m on her plot (her front lines up with her neighbours'). PX / PZ turn the
// drawing's metres (x = (px - 1089) * 0.01284, z = (py - 702.5) * 0.01284) into the bigger home's: each value's comment
// is the drawing's pixel it comes from. The furniture stays real-world size, just put in the same spots.
const S = 1.35, ZO = -1.4;
const PX = (x) => x * S, PZ = (z) => z * S + ZO;
const HX0 = PX(-7.625), HX1 = PX(7.625), HZ0 = PZ(-3.05), HZ1 = PZ(3.05), ZC = ZO, WT = 0.14, IH = 2.3, VAULT = 3.45;   // (px 495..1683, py 465..940) IH: walls inside (at the eaves); VAULT: the ridge inside
const XWF = HX0 + 0.575;                // the mirrored wardrobes' fronts (px 540; real-size wardrobes)
const XW = PX(-3.71);                   // the bedrooms | the en-suite, hall and bathroom (px 800)
const ZM = PZ(0);                       // the red bedroom (back) | the yellow bedroom (front) (py 703)
const XS = PX(-2.36), ZE = PZ(-1.355);  // the shower's west wall (px 905); the en-suite | hall wall (py 597): the shower is x XS..XC0, z ZE..ZM
const XC0 = PX(-1.015), XC1 = PX(-0.37);  // the airing cupboard (px 1010..1060, z back..ZM); XC1 is the kitchen's west wall, where the vault starts
const ZBA = PZ(1.125), XBA = PX(-0.95); // the bathroom (py 790, px 1015): x XW..XBA, z ZBA..front; the hall runs along z ZM..ZBA
const XK = PX(0.4), ZK = PZ(1.38);      // the short wall between the front-door corridor and the kitchen's sofa (px 1120, from py 810)
const P1 = PX(3.2);                     // kitchen | living room (px 1338)
const span = (c, w) => ({ a: c - w / 2, b: c + w / 2 });
const DOOR = 1.1;                       // every doorway at least 1.1 m wide
const FD = { x0: span(PX(-0.34), DOOR).a, x1: span(PX(-0.34), DOOR).b };     // THE FRONT DOOR, in the front wall into the corridor (px 1035..1085)
const BKD = { x0: span(PX(0.18), DOOR).a, x1: span(PX(0.18), DOOR).b };      // the back door, top-left of the kitchen (px 1065..1110)
const FRD = { z0: PZ(1.15), z1: PZ(2.4) };                                    // the living room's French doors on to the deck (py 795..890)
const doorZ = (c, w = DOOR) => ({ z0: c - w / 2, z1: c + w / 2 });
const D = { red: doorZ(PZ(-0.55)), yel: doorZ(PZ(0.56)), ens: doorZ(PZ(-2.375)), bath: { x0: span(PX(-2.475), DOOR).a, x1: span(PX(-2.475), DOOR).b }, kl: doorZ(PZ(1.575), 1.2) };   // the inner doorways
const DECK = { x0: PX(-4.03), x1: 13.2, z1: PZ(4.98), zb: PZ(-3.63), endX: HX1 };     // the L of decking: along the front (px 775..1855, py 940..1090) and down the living room's end (from py 420)
const DSTEP = { x0: PX(-3.35) - 0.7, x1: PX(-3.35) + 0.7, z0: DECK.z1, z1: DECK.z1 + 0.9 };   // THE DECKING STAIRS (bottom-left), down toward the road
const BDSTEP = { x0: PX(8.8) - 0.7, x1: PX(8.8) + 0.7, z0: DECK.zb - 0.9, z1: DECK.zb };     // the deck's back stairs, down to the back garden
const BSTEP = { x0: BKD.x0 - 0.1, x1: BKD.x1 + 0.1, z0: HZ0 - 0.9, z1: HZ0 };   // the back door's steps
const LAWN = { x0: -5.0, x1: 10.6, z0: -14.5, z1: -7.45 };                // the back garden's clear lawn (Fling the Family is played on it)
const SHED = { x0: -10.1, x1: -7.85, z0: PZ(-6.75) - 1.85, zm: PZ(-6.75), z1: PZ(-6.75) + 1.85 };   // the two garden sheds (px 493..648, py 57..318), doors east on to the lawn
const DRIVE = { x0: -14.3, x1: -11.2, z0: -10.5 };                        // the drive (the line at px 87, py 145..1180), beside the sheds
const PLOT = { x0: -14.9, x1: 14.85, gate0: 13.3, gate1: 14.45 };         // Nan's plot's sides (hedges), the back gate in the hedge
const GREEN = { x0: -14.4, x1: 24.6, z0: -19.9, z1: -16.1 };              // THE GREEN: the verge behind the back hedge
const HZH = (HZ1 - HZ0) / 2 - 0.1;                                         // the vault's half-span inside (from the ridge over ZC)
const KRUN1 = PZ(-0.02);                                                   // where the kitchen's L of units ends down the living-room wall (px 703)
const ceilAt = (z) => IH + (VAULT - IH) * (1 - Math.min(1, Math.abs(z - ZC) / HZH));   // the vaulted ceiling's height inside at z
const PAINT = { lounge: 0xd8d6d2, kitchen: 0xbdb8b0, hall: 0xc9c2b7, red: 0xeee2dc, redF: 0x8e1b26, yel: 0xf4ebc4, yelF: 0xe2b33a, bath: 0xe9e4da, util: 0xd8d6d2 };

export function buildSandyBay(scene) {
  const BD = L.BOUNDS;
  const k = new Kit(scene, { ...BD, y1: 8 });
  const rnd = rng(2512);
  const W = new Bag();
  const photos = [];
  const R = (x0, z0, x1, z1, h, y, color, opts) => k.box(Math.abs(x1 - x0), h, Math.abs(z1 - z0), (x0 + x1) / 2, y ?? h / 2, (z0 + z1) / 2, color, opts);
  const T = (key, x0, z0, x1, z1, h, y, tile = 1) => W.tbox(key, x1 - x0, h, z1 - z0, (x0 + x1) / 2, y, (z0 + z1) / 2, tile);
  const sign = (text, w, h, x, y, z, ry, opts = {}) => k.label(text, w, h, [x, y, z], Array.isArray(ry) ? ry : [0, ry, 0], opts);
  const note = (text, w, h, x, y, z, ry, bg = '#fffbe8', fg = '#222', size = 40, border = null) => sign(text, w, h, x, y, z, ry, { bg, fg, border, size });
  const yxz = (rx, ry, rz = 0) => { const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), 'XYZ'); return [e.x, e.y, e.z]; };
  // glass: every pane in one transparent mesh
  const glassPos = [];
  const glassQuad = (a, b, c, d) => { for (const p of [a, b, c, a, c, d]) glassPos.push(...p); };
  const glassTri = (a, b, c) => { for (const p of [a, b, c]) glassPos.push(...p); };

  // LIFT: everything built inside fn (at floor level, y = 0) is raised by dy on to the home's floor: the merged parts,
  // the textured bag, the colliders / blockers / spawns, labels and other meshes, lamps, glows, bulbs, lights, glass
  function lift(dy, fn) {
    const n0 = { p: k.parts.length, r: (k.boxRec || []).length, c: k.colliders.length, b: k.blockers.length, s: k.spawns.length, ch: scene.children.length, l: (k.lights || []).length, bu: (k._bulbs || []).length,
      h: k.halos ? k.halos.list.length : 0, po: k.pools ? k.pools.list.length : 0, lamps: new Map([...(k.lamps || new Map())].map(([c, l]) => [c, l.length])), g: glassPos.length,
      W: new Map([...W.lists].map(([key, l]) => [key, l.length])), Wt: W.trim.length };
    fn();
    for (let i = n0.p; i < k.parts.length; i++) k.parts[i].translate(0, dy, 0);
    const rec = k.boxRec || []; for (let i = n0.r; i < rec.length; i++) { rec[i].min[1] += dy; rec[i].max[1] += dy; }
    for (let i = n0.c; i < k.colliders.length; i++) { k.colliders[i].min.y += dy; k.colliders[i].max.y += dy; }
    for (let i = n0.b; i < k.blockers.length; i++) k.blockers[i].y1 = (k.blockers[i].y1 ?? 0.5) + dy;
    for (let i = n0.s; i < k.spawns.length; i++) k.spawns[i].y += dy;
    for (let i = n0.ch; i < scene.children.length; i++) scene.children[i].position.y += dy;
    for (let i = n0.l; i < (k.lights || []).length; i++) k.lights[i].l.position.y += dy;
    for (let i = n0.bu; i < (k._bulbs || []).length; i++) k._bulbs[i][1] += dy;
    if (k.halos) for (let i = n0.h; i < k.halos.list.length; i++) k.halos.list[i][1] += dy;
    if (k.pools) for (let i = n0.po; i < k.pools.list.length; i++) k.pools.list[i][1] += dy;
    for (const [c, l] of k.lamps || []) for (let i = n0.lamps.get(c) || 0; i < l.length; i++) l[i][1] += dy;
    for (let i = n0.g + 1; i < glassPos.length; i += 3) glassPos[i] += dy;
    for (const [key, l] of W.lists) for (let i = n0.W.get(key) || 0; i < l.length; i++) l[i].translate(0, dy, 0);
    for (let i = n0.Wt; i < W.trim.length; i++) W.trim[i].translate(0, dy, 0);
  }

  // ======================================================== SKY (a low winter sun), the ground
  const SUN_DIR = new THREE.Vector3(-6, 4.2, 9).normalize();
  const skyRig = new THREE.Group(); scene.add(skyRig);
  // a big winter sky: a soft gradient (blue overhead, a pale estuary haze at the horizon), the low sun's glow
  const sky = new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), new THREE.ShaderMaterial({
    uniforms: { uZen: { value: new THREE.Color(0x6f9fd8) }, uMid: { value: new THREE.Color(0xa9c4e4) }, uHor: { value: new THREE.Color(0xdfe5ec) }, uLow: { value: new THREE.Color(0xc9d3dc) }, uSun: { value: SUN_DIR.clone() } },
    vertexShader: 'varying vec3 vDir; void main() { vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p; gl_Position.z = p.w * 0.99999; }',
    fragmentShader: `uniform vec3 uZen, uMid, uHor, uLow, uSun; varying vec3 vDir;
      void main() { vec3 d = normalize(vDir); float h = d.y;
        vec3 col = h > 0.0 ? mix(mix(uHor, uMid, smoothstep(0.0, 0.18, h)), uZen, smoothstep(0.15, 0.85, h)) : mix(uHor, uLow, smoothstep(0.0, 0.1, -h));
        float s = max(dot(d, normalize(uSun)), 0.0); col += vec3(1.0, 0.92, 0.78) * (pow(s, 900.0) * 4.0 + pow(s, 40.0) * 0.25 + pow(s, 6.0) * 0.1);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    side: THREE.BackSide, depthWrite: false }));
  sky.renderOrder = -100; sky.frustumCulled = false;
  skyRig.add(sky);
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(34, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), new THREE.MeshBasicMaterial({ map: cloudTex(), side: THREE.BackSide, transparent: true, depthWrite: false, fog: false }));
  clouds.renderOrder = -98; clouds.frustumCulled = false; skyRig.add(clouds);
  sky.onBeforeRender = (r, sc, cam) => { _skyV.setFromMatrixPosition(cam.matrixWorld); if (skyRig.position.distanceToSquared(_skyV) > 1e-6) { skyRig.position.copy(_skyV); skyRig.updateMatrixWorld(true); } };
  // the ground: neat vivid lawn everywhere
  const groundPiece = (x0, z0, x1, z1) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2); W.geo('lawn', metreUV2(g, 2)); };
  groundPiece(-200, -200, 48, 200);

  // ======================================================== the resort round about
  const resort = buildResort(k, scene, W, rnd);

  // ======================================================== NAN'S HOME: the shell
  // an outside wall: a core (painted inside), lap siding outside above the skirting, grey brick-effect skirting below.
  // axis 'x' = along x at z = c (outer face), dir = outward (+1/-1); holes [a0, a1, y0, y1] (absolute y);
  // paintAt(a) = the colour inside at a
  function extWall(axis, c, a0, a1, dir, holes, paintAt, breaks = []) {
    const t = WT, cc = c - dir * t / 2;
    const seg = (s0, s1, y0, y1) => {
      if (s1 - s0 < 0.005 || y1 - y0 < 0.005) return;
      const cuts = [s0, ...breaks.filter(b => b > s0 + 0.01 && b < s1 - 0.01), s1];
      for (let i = 0; i < cuts.length - 1; i++) { const u0 = cuts[i], u1 = cuts[i + 1], m = (u0 + u1) / 2, len = u1 - u0, hh = y1 - y0, my = (y0 + y1) / 2;
        const block = y0 < 0.3 && y1 > 1.5;
        axis === 'x' ? k.box(len, hh, t, m, my, cc, paintAt(m), { collide: true, block }) : k.box(t, hh, len, cc, my, m, paintAt(m), { collide: true, block }); }
      const len = s1 - s0, m = (s0 + s1) / 2, so = c + dir * 0.0125;
      const sy0 = Math.max(y0, 0.7), sy1 = y1;
      if (sy1 > sy0 + 0.005) axis === 'x' ? W.sbox(len, sy1 - sy0, 0.025, m, (sy0 + sy1) / 2, so, 'sidB') : W.sbox(0.025, sy1 - sy0, len, so, (sy0 + sy1) / 2, m, 'sidB');
      const ky1 = Math.min(y1, 0.7);
      if (ky1 > y0 + 0.005) axis === 'x' ? T('skirt', s0, so - 0.0125, s1, so + 0.0125, ky1 - y0, (y0 + ky1) / 2, 0.86) : T('skirt', so - 0.0125, s0, so + 0.0125, s1, ky1 - y0, (y0 + ky1) / 2, 0.86);
    };
    const spans = new Map();
    for (const [s0, s1, y0, y1] of holes) { const key = s0 + '|' + s1; if (!spans.has(key)) spans.set(key, { s0, s1, g: [] }); spans.get(key).g.push([y0, y1]); }
    let a = a0;
    for (const { s0, s1, g } of [...spans.values()].sort((p, q) => p.s0 - q.s0)) { seg(a, s0, 0, EAVE); let y = 0; for (const [y0, y1] of g.sort((p, q) => p[0] - q[0])) { seg(s0, s1, y, y0); y = y1; } seg(s0, s1, y, EAVE); a = s1; }
    seg(a, a1, 0, EAVE);
  }
  // white uPVC (or anthracite) frame + glazing in a hole of an outside wall (absolute y); frosted = obscure glass
  function glaze(axis, c, s0, s1, y0, y1, dir, { frame = C.WHITE, panes = 2, transom = true, sill = true, frosted = false } = {}) {
    const w = s1 - s0, hh = y1 - y0, mid = (s0 + s1) / 2, my = (y0 + y1) / 2, gc = c - dir * 0.05;
    if (frosted) { axis === 'x' ? k.box(w, hh, 0.012, mid, my, gc, 0xe4eaec) : k.box(0.012, hh, w, gc, my, mid, 0xe4eaec); }
    else if (axis === 'x') glassQuad([s0, y0, gc], [s1, y0, gc], [s1, y1, gc], [s0, y1, gc]); else glassQuad([gc, y0, s0], [gc, y0, s1], [gc, y1, s1], [gc, y1, s0]);
    const fb = (len, h, a, y, dd = 0.09, off = 0) => axis === 'x' ? k.box(len, h, dd, a, y, gc + off, frame) : k.box(dd, h, len, gc + off, y, a, frame);
    fb(w + 0.02, 0.07, mid, y1 - 0.035); fb(w + 0.02, 0.07, mid, y0 + 0.035); fb(0.07, hh, s0 + 0.035, my); fb(0.07, hh, s1 - 0.035, my);
    for (let i = 1; i < panes; i++) fb(0.06, hh, s0 + w * i / panes, my, 0.07);
    if (transom) fb(w, 0.05, mid, y1 - hh * 0.27, 0.07);
    if (sill) { axis === 'x' ? k.box(w + 0.12, 0.04, 0.16, mid, y0 - 0.02, c + dir * 0.06, frame) : k.box(0.16, 0.04, w + 0.12, c + dir * 0.06, y0 - 0.02, mid, frame);
      axis === 'x' ? k.box(w, 0.03, 0.2, mid, y0 + 0.015, c - dir * 0.2, 0xf4f4f2) : k.box(0.2, 0.03, w, c - dir * 0.2, y0 + 0.015, mid, 0xf4f4f2); }      // the window board inside
  }
  const byX = (pairs) => (a) => { for (const [x1, col] of pairs) if (a < x1) return col; return pairs[pairs.length - 1][1]; };
  const frontPaint = byX([[XW, PAINT.yel], [XBA, PAINT.bath], [XK, PAINT.hall], [P1, PAINT.kitchen], [99, PAINT.lounge]]);
  const backPaint = byX([[XW, PAINT.red], [XC0, PAINT.bath], [XC1, PAINT.util], [P1, PAINT.kitchen], [99, PAINT.lounge]]);
  const Y = (y) => FL + y;
  // the openings (absolute heights): windows, the front door, the back door, the living room's French doors
  // (the windows sit where the drawing's do, scaled; the kitchen's back window moves along over the sink, clear of the
  // larder and the oven tower beside the back door)
  const WF = { yel: [PX(-6.4), PX(-4.8)], bath: [PX(-2.0), PX(-1.35)], kit: [PX(1.0), PX(2.2)], liv: [PX(4.6), PX(6.3)] };
  const WB = { red: [PX(-6.3), PX(-4.7)], ens: [PX(-2.6), PX(-1.95)], sink: [2.4, 3.5], liv: [PX(4.85), PX(6.2)] };
  const WIN = {
    front: [[...WF.yel, Y(0.9), Y(2.05)], [...WF.bath, Y(1.45), Y(2.05)], [FD.x0, FD.x1, FL, Y(2.08)], [...WF.kit, Y(1.05), Y(2.05)], [...WF.liv, Y(0.95), Y(2.1)]],
    back: [[...WB.red, Y(0.9), Y(2.05)], [...WB.ens, Y(1.45), Y(2.05)], [BKD.x0, BKD.x1, FL, Y(2.08)], [...WB.sink, Y(1.05), Y(2.05)], [...WB.liv, Y(1.0), Y(2.1)]],
    end: [[FRD.z0, FRD.z1, FL, Y(2.1)]],
  };
  extWall('x', HZ1, HX0, HX1, 1, WIN.front, frontPaint, [XW, XBA, XK, P1]);
  extWall('x', HZ0, HX0, HX1, -1, WIN.back, backPaint, [XW, XC0, XC1, P1]);
  extWall('z', HX0, HZ0 + WT, HZ1 - WT, -1, [], (z) => z < ZM ? PAINT.red : PAINT.yel, [ZM]);
  extWall('z', HX1, HZ0 + WT, HZ1 - WT, 1, WIN.end, () => PAINT.lounge);
  // glazing
  glaze('x', HZ1, ...WF.yel, Y(0.9), Y(2.05), 1, { panes: 3 });                                      // the yellow bedroom
  glaze('x', HZ1, ...WF.bath, Y(1.45), Y(2.05), 1, { panes: 1, transom: false, frosted: true });      // the bathroom
  glaze('x', HZ1, ...WF.kit, Y(1.05), Y(2.05), 1, { panes: 2 });                                      // the kitchen, over the sofa
  glaze('x', HZ1, ...WF.liv, Y(0.95), Y(2.1), 1, { panes: 3 });                                       // the living room, over the sofa
  glaze('x', HZ0, ...WB.red, Y(0.9), Y(2.05), -1, { panes: 3 });                                      // the red bedroom
  glaze('x', HZ0, ...WB.ens, Y(1.45), Y(2.05), -1, { panes: 1, transom: false, frosted: true });      // the en-suite
  glaze('x', HZ0, ...WB.sink, Y(1.05), Y(2.05), -1, { panes: 2 });                                    // over the sink
  glaze('x', HZ0, ...WB.liv, Y(1.0), Y(2.1), -1, { panes: 2 });                                       // the living room, over the low unit
  // door frames (white uPVC) round the back door and the French doors; the front door's is anthracite
  const doorFrame = (axis, c, s0, s1, dir, col = C.WHITE) => { const fb = (len, h, a, y) => axis === 'x' ? k.box(len, h, 0.1, a, y, c - dir * 0.05, col) : k.box(0.1, h, len, c - dir * 0.05, y, a, col);
    fb(s1 - s0 + 0.1, 0.07, (s0 + s1) / 2, Y(2.08)); fb(0.06, Y(2.08) - FL, s0 + 0.03, (FL + Y(2.08)) / 2); fb(0.06, Y(2.08) - FL, s1 - 0.03, (FL + Y(2.08)) / 2);
    axis === 'x' ? k.box(s1 - s0, 0.03, 0.2, (s0 + s1) / 2, FL + 0.015, c, 0x5a5c5e) : k.box(0.2, 0.03, s1 - s0, c, FL + 0.015, (s0 + s1) / 2, 0x5a5c5e); };
  doorFrame('x', HZ1, FD.x0, FD.x1, 1, C.ANTH); doorFrame('x', HZ0, BKD.x0, BKD.x1, -1); doorFrame('z', HX1, FRD.z0, FRD.z1, 1);
  // the living room's end gable: a glazed triangle up into the vault over the TV wall
  { const x = HX1 - 0.05, y1 = EAVE, apex = Y(VAULT) - 0.02, hw = 3.1;
    glassTri([x, y1, ZC + hw], [x, y1, ZC - hw], [x, apex, ZC]);
    k.box(0.1, 0.08, hw * 2 + 0.08, x, y1 - 0.02, ZC, C.WHITE);
    for (const s of [-1, 1]) { const len = Math.hypot(hw, apex - y1); k.box(0.1, 0.07, len, x, (y1 + apex) / 2, ZC + s * hw / 2, C.WHITE, { rot: [s * Math.atan2(apex - y1, hw), 0, 0] }); }
    k.box(0.1, apex - y1, 0.06, x, (y1 + apex) / 2, ZC, C.WHITE);
    const xo = HX1 + 0.0125, top = EAVE + (HZ1 - ZC) * PITCH;
    const quad = (a, b, c, d) => { W.stri(a, b, c, 'sidB'); W.stri(a, c, d, 'sidB'); };
    quad([xo, EAVE, HZ1], [xo, EAVE, ZC + hw], [xo, apex, ZC], [xo, top, ZC]);
    quad([xo, EAVE, ZC - hw], [xo, EAVE, HZ0], [xo, top, ZC], [xo, apex, ZC]);
  }
  // the roof: concrete interlocking tiles, charcoal; hipped over the bedroom end, the gable over the living room
  const RF = roofGeo(W, 'roof', HX0, HX1, HZ0, HZ1, { hipL: true, hipR: false });
  { const b = new Bag(); roofTrim(b, RF); k.parts.push(...b.trim); }
  // THE PORCH over the front door: a little gable on slim anthracite posts standing on the decking
  const FDX = (FD.x0 + FD.x1) / 2;
  porchRoof(W, FDX, HZ1 - 0.25, HZ1 + 1.25, 1.7, EAVE - 0.12, 0.8, { posts: true, sidKey: 'sidB' });
  for (const s of [-1, 1]) k.blockers.push({ x0: FDX + s * 0.8 - 0.06, x1: FDX + s * 0.8 + 0.06, z0: HZ1 + 1.14, z1: HZ1 + 1.26, y1: 2.9 });
  // corner boards, gutters' downpipes, a trim line over the grey band
  for (const x of [HX0, HX1]) for (const z of [HZ0, HZ1]) k.box(0.12, EAVE - 0.7, 0.12, x + Math.sign(x) * 0.01, 0.7 + (EAVE - 0.7) / 2, z + Math.sign(z - ZC) * 0.01, C.WHITE);
  for (const [x, z] of [[HX0 + 0.35, HZ1 + 0.1], [HX0 + 0.35, HZ0 - 0.1], [HX1 - 0.4, HZ1 + 0.1], [PX(3.0), HZ0 - 0.1]]) k.cyl(0.04, 0.04, EAVE - 0.25, x, (EAVE - 0.25) / 2, z, C.ANTH, 6);
  for (const z of [HZ0 - 0.03, HZ1 + 0.03]) k.box(HX1 - HX0 + 0.06, 0.04, 0.03, 0, 0.71, z, C.WHITE);
  for (const x of [HX0 - 0.03, HX1 + 0.03]) k.box(0.03, 0.04, HZ1 - HZ0 + 0.06, x, 0.71, ZC, C.WHITE);
  // wall lanterns (anthracite, warm): either side of the front door, by the back door, by the French doors
  const lantern = (x, y, z, nx, nz) => { k.box(0.13, 0.22, 0.13, x + nx * 0.08, y, z + nz * 0.08, 0x1e1f21); k.box(0.09, 0.14, 0.09, x + nx * 0.085, y - 0.01, z + nz * 0.085, 0xffe0a0); k.lamp(x + nx * 0.09, y - 0.01, z + nz * 0.09, 0xffe2a8, 0.0, true); };
  lantern(FD.x0 - 0.2, Y(1.9), HZ1, 0, 1); lantern(FD.x1 + 0.2, Y(1.9), HZ1, 0, 1); lantern(BKD.x1 + 0.2, Y(1.9), HZ0, 0, -1); lantern(HX1, Y(1.9), FRD.z0 - 0.3, 1, 0); lantern(HX1, Y(1.9), FRD.z1 + 0.3, 1, 0);
  // the Christmas wreath by the front door, the house number
  wreath(k, FD.x1 + 0.55, Y(1.5), HZ1 + 0.01, 1, 0.17);
  k.label('17', 0.3, 0.16, [FD.x0 - 0.62, Y(1.62), HZ1 + 0.03], [0, 0, 0], { bg: '#2b2d30', fg: '#ffffff', border: null, size: 80 });
  k.label("JOAN'S", 0.5, 0.12, [FD.x0 - 0.62, Y(1.43), HZ1 + 0.03], [0, 0, 0], { bg: '#2b2d30', fg: '#6dcfcf', border: null, size: 60 });
  // the doormat on the deck outside the front door
  k.box(0.9, 0.012, 0.55, FDX, FL + 0.006, HZ1 + 0.42, 0x4a4a48); note('WIPE YOUR FEET (MICHAEL, THAT MEANS YOU)', 0.8, 0.45, FDX, FL + 0.014, HZ1 + 0.42, [-Math.PI / 2, 0, 0], '#4a4a48', '#f1f1ee', 36);
  k.spawns.push(new THREE.Vector3(FD.x1 + 0.55, FL + 0.1, HZ1 + 0.3));
  // Christmas lights along both eaves and the gable, icicle-white on the front
  lightString(k, [[RF.xa + 0.2, RF.ye - 0.18, RF.zb + 0.1], [RF.xb - 0.2, RF.ye - 0.18, RF.zb + 0.1]], { spacing: 0.2, sag: 0.05, colors: [0xeaf4ff, 0xeaf4ff, 0xffd890], halo: 0.07, wire: null });
  lightString(k, [[RF.xa + 0.2, RF.ye - 0.18, RF.za - 0.1], [RF.xb - 0.2, RF.ye - 0.18, RF.za - 0.1]], { spacing: 0.25, sag: 0.05, colors: MULTI, halo: 0.07, wire: null });
  lightString(k, [[RF.xb + 0.05, RF.ye - 0.05, RF.zb], [RF.xb + 0.05, RF.yr + 0.02, RF.zc], [RF.xb + 0.05, RF.ye - 0.05, RF.za]], { spacing: 0.2, sag: 0.0, colors: WARM, halo: 0.07, wire: null });

  // ======================================================== THE DECKING (L-shaped): dark composite boards, clear glass balustrade
  // along the front of the house (x DECK.x0 .. x1) and down the living room's end (x endX .. x1, from the back corner
  // zb to the front); the decking stairs at its bottom-left corner (the way up to the front door from the path and
  // the drive); stairs off the back of the end strip down to the back garden
  { const { x0, x1, z1, zb, endX } = DECK, FH = FL - 0.04, FC = 0x4a4a4a;
    T('deck', x0, HZ1, x1, z1, 0.04, FL - 0.02, 1); T('deck', endX, zb, x1, HZ1, 0.04, FL - 0.021, 1);
    R(x0, z1, x1, z1 + 0.02, FH, FH / 2, FC); R(x1, zb, x1 + 0.02, z1, FH, FH / 2, FC); R(endX, zb - 0.02, x1, zb, FH, FH / 2, FC); R(x0 - 0.02, HZ1, x0, z1, FH, FH / 2, FC); R(endX - 0.02, zb, endX, HZ0, FH, FH / 2, FC);
    k.colliders.push({ min: new THREE.Vector3(x0, 0, HZ1), max: new THREE.Vector3(x1, FL, z1) }, { min: new THREE.Vector3(endX, 0, zb), max: new THREE.Vector3(x1, FL, HZ1) });
    // the balustrade: clear glass panels, slim black posts and a top rail; gaps for the two flights of stairs
    const runs = [['x', z1, x0, DSTEP.x0], ['x', z1, DSTEP.x1, x1], ['z', x0, HZ1, z1], ['z', x1, zb, z1], ['x', zb, endX, BDSTEP.x0], ['x', zb, BDSTEP.x1, x1], ['z', endX, zb, HZ0]];
    for (const [ax, c, a0, a1] of runs) {
      const n = Math.max(1, Math.round((a1 - a0) / 1.1)), w = (a1 - a0) / n;
      for (let i = 0; i < n; i++) { const s0 = a0 + i * w + 0.03, s1 = a0 + (i + 1) * w - 0.03; ax === 'x' ? glassQuad([s0, FL + 0.06, c], [s1, FL + 0.06, c], [s1, FL + 0.98, c], [s0, FL + 0.98, c]) : glassQuad([c, FL + 0.06, s0], [c, FL + 0.06, s1], [c, FL + 0.98, s1], [c, FL + 0.98, s0]); }
      for (let i = 0; i <= n; i++) { const a = a0 + i * w; ax === 'x' ? k.box(0.04, 1.02, 0.04, a, FL + 0.51, c, 0x1e1f21) : k.box(0.04, 1.02, 0.04, c, FL + 0.51, a, 0x1e1f21); }
      ax === 'x' ? k.box(a1 - a0 + 0.04, 0.04, 0.05, (a0 + a1) / 2, FL + 1.02, c, 0x1e1f21) : k.box(0.05, 0.04, a1 - a0 + 0.04, c, FL + 1.02, (a0 + a1) / 2, 0x1e1f21);
      k.blockers.push(ax === 'x' ? { x0: a0, x1: a1, z0: c - 0.04, z1: c + 0.04, y1: FL + 1.0 } : { x0: c - 0.04, x1: c + 0.04, z0: a0, z1: a1, y1: FL + 1.0 });
      if (a1 - a0 > 0.8) lightString(k, [ax === 'x' ? [a0 + 0.05, FL + 1.0, c] : [c, FL + 1.0, a0 + 0.05], ax === 'x' ? [a1 - 0.05, FL + 1.0, c] : [c, FL + 1.0, a1 - 0.05]], { spacing: 0.18, sag: 0.05, colors: WARM, halo: 0.06, wire: null });
    }
    // THE DECKING STAIRS (bottom-left): three wide composite steps down toward the road, black handrails either side
    for (let i = 0; i < 3; i++) { const za = DSTEP.z0 + i * 0.3, h = FL * (3 - i) / 4; T('deck', DSTEP.x0, za, DSTEP.x1, za + 0.3, h, h / 2, 1); k.colliders.push({ min: new THREE.Vector3(DSTEP.x0, 0, za), max: new THREE.Vector3(DSTEP.x1, h, za + 0.3) }); }
    for (const x of [DSTEP.x0, DSTEP.x1]) { k.blockers.push({ x0: x - 0.03, x1: x + 0.03, z0: DSTEP.z0, z1: DSTEP.z1, y1: FL });
      k.box(0.04, 0.04, Math.hypot(0.9, FL) + 0.05, x, FL * 0.5 + 0.92, (DSTEP.z0 + DSTEP.z1) / 2, 0x1e1f21, { rot: [Math.atan2(FL, 0.9), 0, 0] });
      for (const [z, y0] of [[DSTEP.z0 + 0.02, FL], [DSTEP.z1 - 0.05, 0]]) k.box(0.04, 0.95 + (y0 ? 0 : FL * 0.25), 0.04, x, y0 + (0.95 + (y0 ? 0 : FL * 0.25)) / 2, z, 0x1e1f21); }
    // the back stairs off the end strip, down to the back garden
    for (let i = 0; i < 3; i++) { const zt = BDSTEP.z1 - i * 0.3, h = FL * (3 - i) / 4; T('deck', BDSTEP.x0, zt - 0.3, BDSTEP.x1, zt, h, h / 2, 1); k.colliders.push({ min: new THREE.Vector3(BDSTEP.x0, 0, zt - 0.3), max: new THREE.Vector3(BDSTEP.x1, h, zt) }); }
    for (const x of [BDSTEP.x0, BDSTEP.x1]) k.blockers.push({ x0: x - 0.03, x1: x + 0.03, z0: BDSTEP.z0, z1: BDSTEP.z1, y1: FL });
    // on the deck: a charcoal rattan sofa (covered for winter) and its table on the end strip, pots with clipped bay
    // balls by the front door, a lit reindeer
    { const x = PX(5.4), z = z1 - 0.45; k.box(1.9, 0.62, 0.75, x, FL + 0.31, z, 0x3a3c40, { block: true }); k.box(1.95, 0.06, 0.8, x, FL + 0.64, z, 0x5a5e62);
      for (const s of [-1, 1]) k.box(0.12, 0.85, 0.75, x + s * 0.92, FL + 0.43, z, 0x34363a);
      note('SANDY BAY SOCIAL: SUMMER BBQS AT JOAN\'S (BRING YOUR OWN CHAIR)', 0.5, 0.22, x, FL + 0.68, z, [-Math.PI / 2, 0, 0], '#5ec8c8', '#ffffff', 34);
      k.box(0.6, 0.4, 0.6, x + 1.45, FL + 0.2, z, 0x2e3033, { block: true, collide: true }); k.spawns.push(new THREE.Vector3(x + 1.45, FL + 0.5, z)); }
    for (const [x, z] of [[FD.x0 - 0.42, HZ1 + 0.32], [FD.x1 + 0.3, HZ1 + 0.32], [x1 - 0.35, z1 - 0.35]]) { k.cyl(0.24, 0.2, 0.5, x, FL + 0.25, z, 0x3a3c40, 12); k.cyl(0.02, 0.02, 0.5, x, FL + 0.75, z, 0x5a4030, 5); k.parts.push(part(new THREE.IcosahedronGeometry(0.3, 1), 0x2f5a26, [x, FL + 1.15, z])); k.blockers.push({ x0: x - 0.24, x1: x + 0.24, z0: z - 0.24, z1: z + 0.24, y1: FL + 1.4 });
      bulb(k, x + 0.12, FL + 1.2, z + 0.22, 0xffd890, 0.015, 0.05); bulb(k, x - 0.15, FL + 1.05, z + 0.18, 0xffd890, 0.015, 0.05); }
    reindeer(k, PX(9.1), PZ(3.9), -2.4, 0.8, FL);
  }

  // ======================================================== the plot: the drive (left), the path to the decking stairs, the front lawn
  T('paving', DRIVE.x0, DRIVE.z0, DRIVE.x1, L.ROAD.z0 - 0.15, 0.012, 0.007, 1);                               // NAN'S DRIVE down the left (pale block paving)
  T('slab', DRIVE.x1, DECK.z1 + 0.05, DSTEP.x1 + 0.2, L.ROAD.z0 - 0.15, 0.012, 0.006, 1.2);                     // the path from the drive to the decking stairs (along the deck's front)
  T('slab', DSTEP.x0 - 0.1, DSTEP.z1 - 0.05, DSTEP.x1 + 0.1, DSTEP.z1 + 0.05, 0.012, 0.0062, 1.2);
  T('slab', PLOT.gate0, DECK.z1 + 0.1, PLOT.gate1, L.ROAD.z0 - 0.15, 0.012, 0.006, 1.2);                       // the side path from Wave Road...
  T('slab', PLOT.gate0, L.HEDGE.z0 - 0.1, PLOT.gate1, DECK.z1 + 0.1, 0.012, 0.006, 1.2);                       // ...round to the back gate
  T('slab', BDSTEP.x0, BDSTEP.z0 - 0.9, PLOT.gate0, BDSTEP.z0, 0.012, 0.006, 1.2);                            // off the deck's back stairs to the side path
  T('slab', BSTEP.x0, BSTEP.z0 - 0.9, BSTEP.x1, BSTEP.z0, 0.012, 0.006, 1.2);                                 // off the back door's steps
  // Nan's car: a silver Nissan Micra on the drive, nose toward the road
  { const cx = (DRIVE.x0 + DRIVE.x1) / 2, cz = -0.6; nissan(scene, k, cx, cz, 0, { plate: 'JOAN 1' });
    note('NAN\'S CAR (SHE ONLY DRIVES TO THE CLUBHOUSE. IT\'S 60 METRES.)', 0.6, 0.14, cx + 0.86, 1.0, cz - 0.4, Math.PI / 2, '#ffffff', '#2b2d30', 34); }
  // the front lawn: a light-up reindeer pair, Santa's sign, little solar lights along the path
  reindeer(k, 5.4, 6.15, 0.6, 0.85); reindeer(k, 6.9, 6.3, -0.3, 0.7);
  k.blockers.push({ x0: 4.8, x1: 7.6, z0: 5.75, z1: 6.8, y1: 1.2 });
  { k.box(0.05, 1.0, 0.05, 9.45, 0.5, 6.4, 0x5a4030); sign('SANTA PLEASE STOP HERE (NAN HAS BEEN VERY GOOD. MOSTLY.)', 0.8, 0.4, 9.45, 1.05, 6.43, 0.0, { bg: '#c8102e', fg: '#fff', border: '#ffd84a', size: 44 }); }
  for (let x = DRIVE.x1 + 0.4; x < DSTEP.x0 - 0.2; x += 0.7) { const z = DECK.z1 + 0.12; k.cyl(0.012, 0.012, 0.3, x, 0.15, z, 0x2a2a2a, 5); k.cyl(0.04, 0.035, 0.05, x, 0.32, z, 0x2a2a2a, 8); bulb(k, x, 0.3, z, 0xfff2d0, 0.022, 0.12); }
  // the back garden: grass again (a big clear lawn), the washing line off to the right, TWO GARDEN SHEDS in the back
  // left-hand corner by the drive, facing in toward the garden; hedges round it, the long back hedge with a little gate
  // at the side path (no home behind Nan: just the hedge, then the green)
  const hedge = (x0, z0, x1, z1, h = 1.1) => { T('hedge', x0, z0, x1, z1, h, h / 2, 1); k.blockers.push({ x0, x1, z0, z1, y1: h }); };
  hedge(PLOT.x0 + 0.4, L.HEDGE.z0, PLOT.gate0, L.HEDGE.z1); hedge(PLOT.gate1, L.HEDGE.z0, L.CLUB.x0 - 0.3, L.HEDGE.z1);
  hedge(L.BOUNDS.x0, L.HEDGE_NEXT.z0, PLOT.x0, L.HEDGE_NEXT.z1);                                                       // her left-hand neighbour's back hedge
  hedge(PLOT.x0, L.PEBBLE.z1 + 0.15, PLOT.x0 + 0.4, -2.6, 0.95); hedge(PLOT.x1 - 0.35, L.HEDGE.z1, PLOT.x1, -3.3, 0.95);     // down each side of her garden
  { const gz = (L.HEDGE.z0 + L.HEDGE.z1) / 2;                                                                       // the gate: two posts, a slatted grey gate swung open
    for (const x of [PLOT.gate0 + 0.05, PLOT.gate1 - 0.05]) k.box(0.1, 1.15, 0.1, x, 0.575, gz, 0x4a4c50, { block: true });
    for (let i = 0; i < 7; i++) k.box(0.13, 0.95, 0.03, PLOT.gate1 - 0.12, 0.55, gz - 0.12 - i * 0.15, 0x6a6c70);
    for (const y of [0.25, 0.85]) k.box(0.05, 0.07, 1.05, PLOT.gate1 - 0.1, y, gz - 0.6, 0x55575b);
    k.blockers.push({ x0: PLOT.gate1 - 0.16, x1: PLOT.gate1 - 0.06, z0: gz - 1.15, z1: gz - 0.05, y1: 1.0 }); }
  // THE SHEDS: two modern grey composite garden sheds side by side, their doors and windows on the garden side (+x),
  // apex roofs (charcoal felt) with the gable over the door, on a slab base; a paved apron in front of them
  { const shed = (x0, x1, z0, z1, txt, wr) => {
      const eh = 1.95, rise = 0.42, zm = (z0 + z1) / 2, w = z1 - z0, d = x1 - x0, WALL = 0x6c7177, GROOVE = 0x5e6368, TRIM = 0x2e3135, ROOFC = 0x34373b, DOORC = 0x575c62;
      R(x0 - 0.1, z0 - 0.1, x1 + 0.1, z1 + 0.1, 0.08, 0.04, 0xa4a29b, { collide: true });                              // the slab base
      R(x0, z0, x1, z1, eh, 0.08 + eh / 2, WALL, { block: true });
      for (let z = z0 + 0.15; z < z1 - 0.05; z += 0.15) for (const x of [x0 - 0.006, x1 + 0.006]) k.box(0.012, eh - 0.08, 0.014, x, 0.08 + eh / 2, z, GROOVE);   // the cladding's grooves, front and back
      for (let x = x0 + 0.15; x < x1 - 0.05; x += 0.15) for (const z of [z0 - 0.006, z1 + 0.006]) k.box(0.014, eh - 0.08, 0.012, x, 0.08 + eh / 2, z, GROOVE);
      for (const xf of [x0, x1]) { const g = new THREE.BufferGeometry(), y0 = 0.08 + eh, xx = xf === x1 ? xf + 0.002 : xf - 0.002;
        g.setAttribute('position', new THREE.Float32BufferAttribute(xf === x1 ? [xx, y0, z1, xx, y0, z0, xx, y0 + rise, zm] : [xx, y0, z0, xx, y0, z1, xx, y0 + rise, zm], 3)); g.computeVertexNormals(); k.parts.push(part(g, WALL)); }
      const half = w / 2 + 0.1, slope = Math.atan2(rise, w / 2), len = half / Math.cos(slope);
      for (const s of [-1, 1]) k.box(d + 0.3, 0.05, len, (x0 + x1) / 2 + 0.05, 0.08 + eh + rise / 2 + 0.03, zm + s * (len / 2) * Math.cos(slope), ROOFC, { rot: [s * slope, 0, 0] });
      for (const s of [-1, 1]) k.box(0.04, 0.1, len, x1 + 0.2, 0.08 + eh + rise / 2, zm + s * (len / 2) * Math.cos(slope), TRIM, { rot: [s * slope, 0, 0] });     // the bargeboards over the door
      for (const x of [x0, x1]) for (const z of [z0, z1]) k.box(0.05, eh, 0.05, x, 0.08 + eh / 2, z, TRIM);
      // the door (a tall single door, a black T-hinge, a handle and lock) and a window beside it, both facing the garden
      const dz = zm - w * 0.17, dw = 0.82, wz = zm + w * 0.3;
      k.box(0.05, 1.8, dw, x1 + 0.025, 0.08 + 0.9, dz, DOORC); k.box(0.06, 1.86, 0.05, x1 + 0.03, 0.08 + 0.93, dz - dw / 2, TRIM); k.box(0.06, 1.86, 0.05, x1 + 0.03, 0.08 + 0.93, dz + dw / 2, TRIM); k.box(0.06, 0.05, dw + 0.1, x1 + 0.03, 0.08 + 1.84, dz, TRIM);
      for (const y of [0.45, 1.5]) k.box(0.02, 0.04, 0.32, x1 + 0.055, 0.08 + y, dz - dw / 2 + 0.17, 0x1a1b1d);
      k.box(0.03, 0.05, 0.14, x1 + 0.06, 0.08 + 1.0, dz + dw / 2 - 0.1, 0x9a9ea2); k.box(0.03, 0.04, 0.04, x1 + 0.07, 0.08 + 0.92, dz + dw / 2 - 0.1, 0x2a2c2e);
      k.box(0.05, 0.62, 0.5, x1 + 0.02, 0.08 + 1.35, wz, TRIM); k.box(0.055, 0.52, 0.4, x1 + 0.022, 0.08 + 1.35, wz, 0x7f97a8); k.box(0.06, 0.03, 0.4, x1 + 0.03, 0.08 + 1.35, wz, TRIM);
      k.box(0.1, 0.03, 0.56, x1 + 0.06, 0.08 + 1.03, wz, TRIM);
      k.label(txt, 0.6, 0.2, [x1 + 0.055, 0.08 + 1.35, dz], [0, Math.PI / 2, 0], { bg: '#fffbe8', fg: '#222', border: null, size: 30 });
      if (wr) wreath(k, x1 + 0.05, 0.08 + 1.65, dz, 1, 0.13);
    };
    shed(SHED.x0, SHED.x1, SHED.z0, SHED.zm - 0.05, "SHED 1: GRANDAD'S TOOLS, 40 YEARS OF BISCUIT TINS. TOUCH NOTHING.", false);
    shed(SHED.x0, SHED.x1, SHED.zm + 0.05, SHED.z1, "SHED 2: NAN'S CHRISTMAS DECORATIONS (ALL OF THEM, SINCE 1974)", true);
    // (the wreath sits in shed 2's door's own plane, turned to face the garden)
    T('paving', SHED.x1 + 0.1, SHED.z0 - 0.1, SHED.x1 + 1.1, SHED.z1 + 0.1, 0.012, 0.0072, 1);
    lightString(k, [[SHED.x1 + 0.25, 0.08 + 1.9, SHED.z0], [SHED.x1 + 0.25, 0.08 + 1.9, SHED.z1]], { spacing: 0.22, sag: 0.06, colors: MULTI, halo: 0.07, wire: null });
    R(SHED.x0 + 0.1, SHED.z0 - 0.75, SHED.x0 + 0.7, SHED.z0 - 0.15, 1.05, 0.525, 0x5a5c60, { block: true }); }        // the gas bottles' cover behind them
  { const x = 12.0, z = -10.5; k.cyl(0.05, 0.05, 1.8, x, 0.9, z, 0xc8ccd0, 8); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.3; k.box(1.3, 0.025, 0.025, x + Math.cos(a) * 0.65, 1.75, z + Math.sin(a) * 0.65, 0xc8ccd0, { rot: [0, -a, 0] }); } k.blockers.push({ x0: x - 0.1, x1: x + 0.1, z0: z - 0.1, z1: z + 0.1, y1: 1.8 }); }
  // a few neat round bushes and a cordyline or two along the plot's edges (Canvey's palm trees)
  const cordyline = (x, z, h = 1.6) => { k.cyl(0.07, 0.1, h, x, h / 2, z, 0x6a5440, 6); for (let i = 0; i < 16; i++) { const a = i * 2.4, e = 0.2 + (i % 4) * 0.35; const g = new THREE.ConeGeometry(0.035, 0.75, 3); g.translate(0, 0.37, 0); g.rotateZ(e); g.rotateY(a); k.parts.push(part(g, i % 2 ? 0x4a6a2a : 0x5a7a34, [x, h, z])); } k.blockers.push({ x0: x - 0.15, x1: x + 0.15, z0: z - 0.15, z1: z + 0.15, y1: h + 0.5 }); };
  cordyline(-10.6, 4.4); cordyline(12.6, 6.35, 1.9); cordyline(22.0, 6.6, 2.1); cordyline(-15.0, 4.5, 1.7);
  for (const [x, z, r] of [[-8.4, 3.4, 0.35], [-9.85, 3.3, 0.3], [11.4, 6.25, 0.32], [4.8, HZ0 - 0.45, 0.3], [-4.05, HZ0 - 0.45, 0.28]]) { k.parts.push(part(new THREE.IcosahedronGeometry(r, 1), 0x3a6a2a, [x, r * 0.8, z], [0, 0, 0], [1.2, 0.85, 1.2])); k.blockers.push({ x0: x - r, x1: x + r, z0: z - r, z1: z + r, y1: r * 1.5 }); }
  // THE GREEN behind Nan's hedge: clear grass along Pebble Road, a bench at its far end, a tree, the green's own sign
  { const bx = GREEN.x1 + 0.5, bz = -18.0; for (const s of [-1, 1]) k.box(0.5, 0.45, 0.06, bx, 0.23, bz + s * 0.8, 0x1e1f21); for (let i = 0; i < 4; i++) k.box(0.1, 0.03, 1.7, bx - 0.15 + i * 0.12, 0.46, bz, 0x2e2f31);
    k.blockers.push({ x0: bx - 0.3, x1: bx + 0.3, z0: bz - 0.85, z1: bz + 0.85, y1: 0.9 }); k.seats.push({ x: bx, z: bz - 0.4, yaw: -Math.PI / 2, h: 0.47 }, { x: bx, z: bz + 0.4, yaw: -Math.PI / 2, h: 0.47 });
    { const sx = PLOT.gate1 + 1.4, sz = L.HEDGE.z0 - 0.35, tex = TX.parkSignTex(['The Green', 'NO BALL GAMES. (FAMILY FLINGING: ASK JOAN.)'], { bg: '#4a4e55' });   // just through the gate
      for (const d of [-1, 1]) k.label('green', 1.2, 0.4, [sx, 1.0, sz + d * 0.03], [0, d > 0 ? 0 : Math.PI, 0], { tex });
      for (const x of [sx - 0.45, sx + 0.45]) k.box(0.05, 1.0, 0.05, x, 0.5, sz, 0x26282a); k.blockers.push({ x0: sx - 0.6, x1: sx + 0.6, z0: sz - 0.1, z1: sz + 0.1, y1: 1.2 }); }
    const tx = GREEN.x1 + 1.6, tz = L.HEDGE.z0 - 1.4;
    k.cyl(0.12, 0.18, 2.4, tx, 1.2, tz, 0x7a6a5a, 7); k.parts.push(part(new THREE.IcosahedronGeometry(1.4, 1), 0x4a6a32, [tx, 3.2, tz], [0, 0, 0], [1, 1.1, 1])); k.blockers.push({ x0: tx - 0.2, x1: tx + 0.2, z0: tz - 0.2, z1: tz + 0.2, y1: 3 }); }
  // the back door's steps: three pale steps down to the slab path and the lawn
  for (let i = 0; i < 3; i++) { const h = FL * (3 - i) / 4; R(BSTEP.x0, HZ0 - 0.3 * (i + 1), BSTEP.x1, HZ0 - 0.3 * i, h, h / 2, C.STEP, { collide: true }); }
  for (const x of [BSTEP.x0, BSTEP.x1]) k.blockers.push({ x0: x - 0.03, x1: x + 0.03, z0: BSTEP.z0, z1: BSTEP.z1, y1: FL });

  // ======================================================== INSIDE (built at floor level, lifted on to the floor)
  let hostSeat, quizSeats = [], dinnerSeats = [], STASH, TREE, DRINKS, KETTLE, TVINFO, FRIDGE, ISLAND, LARDER, KCOUNTER, flame = null, flameY = 0;
  const NAMES = ['NAN', 'KAREN', 'PAUL', 'TOMMY', 'CHARLI', 'LISA', 'MICHAEL', 'SOPHIE', 'JIMMY'];
  const TBL = { x: XK + 0.05 + 1.2, z: HZ1 - WT - 1.51, w: 1.6, d: 0.85, h: 0.76 };          // the kitchen table, pulled up to the sofa and extended for nine
  lift(FL, () => {
    const XI0 = HX0 + WT, XI1 = HX1 - WT, ZI0 = HZ0 + WT, ZI1 = HZ1 - WT;       // the inside faces
    const DW = 0.05;      // half a partition
    // ---- floors: greige carpet (living room, bedrooms), light-oak vinyl planks (kitchen, hall, corridor, cupboard), marble-effect tiles (bathrooms)
    T('carpet', P1, ZI0, XI1, ZI1, 0.02, 0.0, 0.5); T('carpet', XI0, ZI0, XW, ZI1, 0.02, 0.0, 0.5);
    T('vinyl', XC1, ZI0, P1, ZI1, 0.02, 0.0, 1.2); T('vinyl', XW, ZE, XS, ZM, 0.02, 0.0, 1.2); T('vinyl', XW, ZM, XC1, ZBA, 0.02, 0.0, 1.2);
    T('vinyl', XBA, ZBA, XC1, ZI1, 0.02, 0.0, 1.2); T('vinyl', XC0, ZI0, XC1, ZM, 0.02, 0.0, 1.2);
    T('marbleB', XW, ZI0, XC0, ZE, 0.021, 0.0, 1); T('marbleB', XS, ZE, XC0, ZM, 0.021, 0.0, 1); T('marbleB', XW, ZBA, XBA, ZI1, 0.021, 0.0, 1);
    // ---- the walls inside: thin partitions (2.3 m, the vaulted rooms get a gable on top)
    const wall = (axis, c, a0, a1, holes, color, t = 0.1, h = IH) => {
      const seg = (s0, s1, y0, y1) => { if (s1 - s0 < 0.01 || y1 - y0 < 0.01) return; const len = s1 - s0, m = (s0 + s1) / 2, block = y0 < 0.3 && y1 > 1.5;
        axis === 'x' ? k.box(len, y1 - y0, t, m, (y0 + y1) / 2, c, color, { collide: true, block }) : k.box(t, y1 - y0, len, c, (y0 + y1) / 2, m, color, { collide: true, block }); };
      let a = a0; for (const [s0, s1, y1] of holes.slice().sort((p, q) => p[0] - q[0])) { seg(a, s0, 0, h); seg(s0, s1, y1 ?? 2.05, h); a = s1; } seg(a, a1, 0, h);
    };
    const skin = (axis, c, a0, a1, side, color, h = IH, y0 = 0) => axis === 'x' ? k.box(a1 - a0, h - y0, 0.006, (a0 + a1) / 2, y0 + (h - y0) / 2, c + side * 0.003, color) : k.box(0.006, h - y0, a1 - a0, c + side * 0.003, y0 + (h - y0) / 2, (a0 + a1) / 2, color);
    // a skin (or a tiled face) along a wall face, round its doorways (holes [a0, a1, lintel])
    const around = (a0, a1, holes, fn) => { let a = a0; for (const [s0, s1, y1 = 2.05] of holes.slice().sort((p, q) => p[0] - q[0])) { if (s0 > a + 0.005) fn(a, s0, 0); fn(s0, s1, y1); a = s1; } if (a1 > a + 0.005) fn(a, a1, 0); };
    const skinH = (axis, c, a0, a1, side, color, holes = []) => around(a0, a1, holes, (s0, s1, y0) => skin(axis, c, s0, s1, side, color, IH, y0));
    const tiles = (axis, c, a0, a1, side, holes = []) => around(a0, a1, holes, (s0, s1, y0) => { const p0 = side > 0 ? c : c - 0.01;
      axis === 'x' ? T('marbleB', s0, p0, s1, p0 + 0.01, IH - y0, y0 + (IH - y0) / 2, 1) : T('marbleB', p0, s0, p0 + 0.01, s1, IH - y0, y0 + (IH - y0) / 2, 1); });
    const gableTop = (x, color, t = 0.12) => { const s = new THREE.Shape(); s.moveTo(-HZH, IH); s.lineTo(HZH, IH); s.lineTo(0, VAULT + 0.04); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false }); g.translate(0, 0, -t / 2); g.rotateY(Math.PI / 2); k.parts.push(part(g, color, [x, 0, ZC])); };
    const hRed = [[D.ens.z0, D.ens.z1], [D.red.z0, D.red.z1]], hYel = [[D.yel.z0, D.yel.z1]];
    // the bedroom wing's spine (bedrooms | en-suite, hall, bathroom): the en-suite's door (from the red bedroom), the two bedroom doors off the hall
    wall('z', XW, ZI0, ZI1, [...hRed, ...hYel], PAINT.hall);
    skinH('z', XW - DW, ZI0, ZM - DW, -1, PAINT.red, hRed); skinH('z', XW - DW, ZM + DW, ZI1, -1, PAINT.yel, hYel);
    tiles('z', XW + DW, ZI0, ZE - DW, 1, [[D.ens.z0, D.ens.z1]]); tiles('z', XW + DW, ZBA + DW, ZI1, 1);
    // red bedroom | yellow bedroom: a deep red feature wall behind the red room's bed, mustard behind the yellow one's
    wall('x', ZM, XI0, XW - DW, [], PAINT.red); skin('x', ZM - DW, XWF, XW - DW, -1, PAINT.redF); skin('x', ZM + DW, XWF, XW - DW, 1, PAINT.yelF);
    // the en-suite's wall along the hall, the shower's walls, the airing cupboard's
    wall('x', ZE, XW + DW, XS + DW, [], PAINT.hall); tiles('x', ZE - DW, XW + DW, XS + DW, -1);
    wall('z', XS, ZE - DW, ZM + DW, [], PAINT.hall); tiles('z', XS + DW, ZE, ZM - DW, 1);
    wall('x', ZM, XS - DW, XC1 + DW, [], PAINT.hall); tiles('x', ZM - DW, XS + DW, XC0 - DW, -1);
    wall('z', XC0, ZI0, ZM - DW, [], PAINT.util); tiles('z', XC0 - DW, ZI0, ZM - DW, -1);
    wall('z', XC1, ZI0, ZM + DW, [], PAINT.kitchen);
    tiles('x', ZI0, XW + DW, XC0 - DW, 1);
    // the bathroom: its door off the hall (on the left as you walk in), its wall along the front-door corridor
    wall('x', ZBA, XW + DW, XBA + DW, [[D.bath.x0, D.bath.x1]], PAINT.hall); tiles('x', ZBA + DW, XW + DW, XBA - DW, 1, [[D.bath.x0, D.bath.x1]]);
    wall('z', XBA, ZBA + DW, ZI1, [], PAINT.hall); tiles('z', XBA - DW, ZBA + DW, ZI1, -1);
    tiles('x', ZI1, XW + DW, XBA - DW, -1);
    // the short wall between the front-door corridor and the kitchen's sofa corner
    wall('z', XK, ZK, ZI1, [], PAINT.kitchen); skin('z', XK - DW, ZK, ZI1, -1, PAINT.hall); k.box(0.1, IH, 0.1, XK, IH / 2, ZK, 0xf4f4f2);
    // P1 (kitchen | living room): a glazed door at the front end
    wall('z', P1, ZI0, ZI1, [[D.kl.z0, D.kl.z1, 2.1]], PAINT.kitchen, 0.12); skinH('z', P1 + 0.06, ZI0, ZI1, 1, PAINT.lounge, [[D.kl.z0, D.kl.z1, 2.1]]);
    gableTop(P1, PAINT.lounge); gableTop(XC1, PAINT.kitchen);
    // ---- ceilings: flat over the bedroom wing; vaulted (white tongue and groove) over the kitchen and living room, an oak beam
    { const m = new THREE.Mesh(new THREE.PlaneGeometry(XC1 - XI0, ZI1 - ZI0), new THREE.MeshLambertMaterial({ color: 0xf3f0e8, emissive: 0x2a2824 })); m.rotation.x = Math.PI / 2; m.position.set((XI0 + XC1) / 2, IH, (ZI0 + ZI1) / 2); scene.add(m); }
    for (const s of [-1, 1]) { const x0 = XC1, x1 = XI1, za = ZC + s * HZH, zr = ZC, g = new THREE.BufferGeometry(), sl = Math.hypot(HZH, VAULT - IH);
      const pos = s < 0 ? [x0, IH, za, x1, IH, za, x1, VAULT, zr, x0, IH, za, x1, VAULT, zr, x0, VAULT, zr] : [x1, IH, za, x0, IH, za, x0, VAULT, zr, x1, IH, za, x0, VAULT, zr, x1, VAULT, zr];
      const uv = []; for (let i = 0; i < 6; i++) { const px = pos[i * 3], py = pos[i * 3 + 1]; uv.push(px, (py - IH) / (VAULT - IH) * sl); }
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
      W.geo('tng', g); }
    k.box(XI1 - XC1, 0.22, 0.16, (XC1 + XI1) / 2, VAULT - 0.08, ZC, F.OAK);
    // skirting (white) round the rooms (gaps at the doorways)
    const skirt = (axis, c, a0, a1, d, gaps = []) => around(a0, a1, gaps.map(([s0, s1]) => [s0, s1, 99]), (s0, s1, y0) => { if (y0 > 9) return; axis === 'x' ? k.box(s1 - s0, 0.1, 0.018, (s0 + s1) / 2, 0.05, c + d * 0.009, 0xf6f6f4) : k.box(0.018, 0.1, s1 - s0, c + d * 0.009, 0.05, (s0 + s1) / 2, 0xf6f6f4); });
    skirt('x', ZI1, P1 + 0.06, XI1, -1); skirt('x', ZI0, P1 + 0.06, XI1, 1); skirt('z', XI1, ZI0, ZI1, -1, [[FRD.z0, FRD.z1]]); skirt('z', P1 + 0.06, ZI0, ZI1, 1, [[D.kl.z0, D.kl.z1]]);
    skirt('z', P1 - 0.06, KRUN1, ZI1, -1, [[D.kl.z0, D.kl.z1]]); skirt('x', ZI1, XK + DW, P1 - 0.06, -1); skirt('z', XK + DW, ZK, ZI1, 1); skirt('z', XC1 + DW, ZI0, ZM + DW, 1); skirt('x', ZI0, XC1 + DW, BKD.x0, 1);
    skirt('x', ZI0, XWF, XW - DW, 1); skirt('x', ZM - DW, XWF, XW - DW, -1); skirt('z', XW - DW, ZI0, ZM - DW, -1, hRed);
    skirt('x', ZI1, XWF, XW - DW, -1); skirt('x', ZM + DW, XWF, XW - DW, 1); skirt('z', XW - DW, ZM + DW, ZI1, -1, hYel);
    skirt('z', XW + DW, ZE + DW, ZBA - DW, 1, [[D.red.z0, D.red.z1], [D.yel.z0, D.yel.z1]]); skirt('x', ZE + DW, XW + DW, XS - DW, 1); skirt('z', XS - DW, ZE + DW, ZM + DW, -1);
    skirt('x', ZM + DW, XS - DW, XC1 + DW, 1); skirt('x', ZBA - DW, XW + DW, XBA + DW, -1, [[D.bath.x0, D.bath.x1]]); skirt('z', XBA + DW, ZBA - DW, ZI1, 1, [[FD.x0, FD.x1]]); skirt('z', XK - DW, ZK, ZI1, -1);
    // ---- LED downlights everywhere, ceiling lights
    for (const [x, z] of [[-6.2, -2.3], [-4.7, -2.3], [-6.2, -0.8], [-4.7, -0.8], [-6.2, 0.8], [-4.7, 0.8], [-6.2, 2.2], [-4.7, 2.2], [-3.0, -0.65], [-2.9, 0.55], [-1.8, 0.55], [-0.65, 0.55], [-0.3, 2.1], [-0.3, 1.2], [-2.4, -2.15], [-1.7, -0.7], [-2.35, 2.0]]) F.downlight(k, PX(x), IH, PZ(x < -4 ? z / S : z));
    for (const x of [0.25, 1.45, 2.6, 4.1, 5.4, 6.7]) for (const s of [-1, 1]) { const z = ZC + s * 2.4; F.downlight(k, PX(x), ceilAt(z), z); }
    k.light(PX(5.4), 2.4, ZC, 0xfff0dc, 3.4, 11); k.light(PX(1.5), 2.4, ZC, 0xfff4e6, 3.0, 10); k.light(PX(-2.2), 2.0, PZ(0.4), 0xfff0dc, 2.0, 8); k.light(PX(-5.4), 2.0, ZC, 0xfff0dc, 1.9, 8);

    // ================================================ THE LIVING ROOM (x 4.4 .. 10.15): Nan's armchair in the back corner by the door
    // from the kitchen side, the long low unit along the back, the fire on the kitchen wall, the TV on the end wall,
    // the 3-seater along the front, the French doors out to the deck
    // the TV on the end wall: a charcoal slatted feature panel behind it, the oak media unit, the TV (a paused film)
    const TVX = XI1 - 0.25, TVZ = PZ(-0.16), TVRY = -Math.PI / 2;
    T('slat', XI1 - 0.04, TVZ - 1.0, XI1, TVZ + 1.0, IH, IH / 2, 0.6);
    F.tvUnit(k, TVX, TVZ, TVRY, 1.8);
    { const w = 1.45, h = 0.83, y = 1.22, sx = XI1 - 0.144; k.box(0.05, h + 0.03, w + 0.03, XI1 - 0.12, y, TVZ, 0x111214); k.box(0.18, 0.02, 0.3, TVX, 0.46, TVZ, 0x111214); k.box(0.05, 0.3, 0.05, XI1 - 0.16, 0.6, TVZ, 0x111214);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.03, h - 0.03), new THREE.MeshBasicMaterial({ map: TX.tvTex(), color: 0xb8b8b8 })); scr.position.set(sx, y, TVZ); scr.rotation.y = TVRY; scene.add(scr); scr.userData.tv = { w: w - 0.03, h: h - 0.03 };
      TVINFO = { x: sx, y: y + FL, z: TVZ, ry: TVRY, w: w - 0.03, h: h - 0.03 };
      k.box(0.09, 0.07, 0.9, TVX - 0.05, 0.5, TVZ, 0x1a1a1c);                // soundbar
      note("REMOTE: NAN'S. ASK. (DON'T.)", 0.24, 0.07, TVX, 0.456, TVZ + 0.6, [-Math.PI / 2, 0, TVRY], '#fffbe8', '#c8102e', 34);
      for (let i = 0; i < 18; i++) { const t = (i / 17 - 0.5) * (w + 0.05); k.parts.push(part(new THREE.IcosahedronGeometry(0.028, 0), i % 2 ? 0xd8b84a : 0xc8102e, [XI1 - 0.13, y + h / 2 + 0.03 - Math.sin(i / 17 * Math.PI) * 0.02, TVZ + t])); }
      k.spawns.push(new THREE.Vector3(TVX, 0.55, TVZ - 0.7)); }
    // the cream electric fireplace on the kitchen wall: the flames, a mantel full of cards, stockings
    { const FZ = PZ(-0.62), fx = P1 + 0.06, Wd = 1.25;
      k.box(0.3, 1.05, Wd, fx + 0.15, 0.525, FZ, 0xefe8d8, { block: true }); k.box(0.36, 0.07, Wd + 0.16, fx + 0.18, 1.085, FZ, 0xf4eee0, { collide: true });
      k.box(0.02, 0.62, 0.8, fx + 0.301, 0.5, FZ, 0x111012); k.box(0.012, 0.66, 0.84, fx + 0.302, 0.5, FZ, 0x2a2a2c);
      k.box(0.36, 0.05, Wd + 0.3, fx + 0.18, 0.025, FZ, 0xd8d2c8);
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.4), new THREE.MeshBasicMaterial({ map: flameTex(), color: 0xffffff })); fl.position.set(fx + 0.315, 0.42, FZ); fl.rotation.y = Math.PI / 2; scene.add(fl); flame = fl;
      k.halo(fx + 0.45, 0.45, FZ, 1.0, 0xff8030); k.pool(fx + 0.9, 0.01, FZ, 1.7, 0xff9040);
      for (let i = 0; i < 12; i++) { const z = FZ - Wd / 2 + 0.08 + i * (Wd - 0.16) / 11, hh = 0.13 + (i % 3) * 0.03, c = [0xf4f0e6, 0xc8102e, 0x1e5a2a, 0x1e3a8a, 0xffffff, 0xd4af37][i % 6]; for (const s of [-1, 1]) k.box(0.005, hh, 0.07, fx + 0.2 + s * 0.02, 1.12 + hh / 2, z + s * 0.03, c, { rot: [0, s * 0.5, 0] }); }
      for (let i = 0; i < 20; i++) k.parts.push(part(new THREE.IcosahedronGeometry(0.045, 0), i % 2 ? 0x1e5a2a : 0x2a6a32, [fx + 0.33, 1.08 - Math.sin(i / 19 * Math.PI) * 0.06, FZ - 0.66 + i * 0.07]));
      lightString(k, [[fx + 0.36, 1.07, FZ - 0.66], [fx + 0.36, 1.07, FZ + 0.66]], { spacing: 0.09, sag: 0.06, colors: [0xffd070, 0xff4040, 0xffd070, 0x60a0ff], wire: null });
      ['JOAN', 'KAREN', 'LISA', 'JIMMY (XXL)'].forEach((nm, i) => { const z = FZ - 0.45 + i * 0.3, big = i === 3 ? 1.35 : 1;
        k.box(0.06, 0.3 * big, 0.13, fx + 0.36, 0.92 - 0.15 * big, z, 0xc8102e); k.box(0.07, 0.07, 0.14, fx + 0.36, 1.0, z, 0xf8f8f8); k.box(0.06, 0.07, 0.13, fx + 0.36, 0.92 - 0.28 * big, z + 0.06, 0xc8102e);
        k.label(nm, 0.12, 0.04, [fx + 0.396, 1.0, z], [0, Math.PI / 2, 0], { bg: '#ffffff', fg: '#c8102e', border: null, size: 44 }); });
      note('TO JOAN, LOVE FROM PAT, MAUREEN, BRENDA, SHEILA, VAL, DOREEN, RON, BRIAN & DOT, AND THE AQUA AEROBICS GIRLS ... (CONTINUED ON BACK)', 0.2, 0.16, fx + 0.215, 1.27, FZ + 0.52, Math.PI / 2, '#fffbe8', '#8a1a1a', 24, '#d4af37');
      fam('z', fx, FZ, 1.75, 0.95, 0.62, 1, ['joan', 'karen', 'lisa'], 'xmas', 'Joan & her girls · Christmas', 0x1e1f21);
      note("MICHAEL: DO NOT DELIVER THE CHRISTMAS CARDS. YOU'RE RETIRED. (LOVE, NAN)", 0.5, 0.18, fx + 0.006, 2.18, FZ, Math.PI / 2, '#c8102e', '#ffffff', 32, '#ffd84a');
      k.spawns.push(new THREE.Vector3(fx + 0.2, 1.15, FZ + 0.55)); }
    // the seats: the 3-seater along the front wall, a pouffe; NAN'S ARMCHAIR angled in the back corner, facing the TV
    const SOFA = 0xcfc4b4, take = (n0) => { for (let i = n0; i < k.seats.length; i++) quizSeats.push({ ...k.seats[i] }); };
    const cushions = (x, z, ry, len, cols) => { const c = Math.cos(ry), s = Math.sin(ry); cols.forEach((col, i) => { const lx = (i / (cols.length - 1) - 0.5) * (len - 0.55), lz = 0.2; k.parts.push(part(new THREE.BoxGeometry(0.4, 0.38, 0.1), col, [x + lx * c + lz * s, 0.66, z - lx * s + lz * c], [-0.3, ry + (i % 2 ? 0.25 : -0.25), 0])); }); };
    const LS = { x: PX(5.44), z: ZI1 - 0.49, len: 2.6 };
    let n0 = k.seats.length; sofa(k, { x: LS.x, z: LS.z, len: LS.len, depth: 0.95, ry: 0, color: SOFA, seats: 3, pillows: 0, throwCol: 0x7a7e82 }); take(n0); cushions(LS.x, LS.z, 0, LS.len, [0x2f6d73, 0xc9a03a, 0x2b3a5a, 0x2f6d73]);
    { const px = PX(4.3), pz = PZ(0.75); k.cyl(0.3, 0.3, 0.38, px, 0.19, pz, 0x2f6d73, 18); k.cyl(0.29, 0.29, 0.03, px, 0.39, pz, 0x3a7d83, 18); k.blockers.push({ x0: px - 0.3, x1: px + 0.3, z0: pz - 0.3, z1: pz + 0.3, y1: 0.4 });
      const s = { x: px, z: pz, yaw: Math.atan2(TVX - px, TVZ - pz), h: 0.4 }; k.seats.push(s); quizSeats.push({ ...s }); }
    const NAN = { x: P1 + 1.0, z: ZI0 + 0.85 }, NANYAW = Math.atan2(TVX - NAN.x, TVZ - NAN.z);
    { const seatN = k.seats.length; sofa(k, { x: NAN.x, z: NAN.z, len: 0.95, depth: 0.9, ry: NANYAW + Math.PI, color: 0x9c8f7e, seats: 1, pillows: 0 }); hostSeat = { ...k.seats[seatN] }; k.seats.splice(seatN, 1); k.seats.push(hostSeat);
      const fx = Math.sin(NANYAW), fz = Math.cos(NANYAW), bt = blanketTex();
      const m1 = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.64, 0.03), new THREE.MeshLambertMaterial({ map: bt })); m1.position.set(NAN.x - fx * 0.3, 0.72, NAN.z - fz * 0.3); m1.rotation.set(...yxz(-0.16, NANYAW)); scene.add(m1);
      const m2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.02), m1.material); m2.position.set(NAN.x + fx * 0.27, 0.36, NAN.z + fz * 0.27); m2.rotation.set(...yxz(0.15, NANYAW)); scene.add(m2);
      k.parts.push(part(new THREE.BoxGeometry(0.42, 0.38, 0.1), 0xc9a03a, [NAN.x - fx * 0.12, 0.65, NAN.z - fz * 0.12], [-0.3, NANYAW, 0]));
      for (const s of [-1, 1]) k.parts.push(part(sph(0.07, 8, 6), 0xe86aa0, [NAN.x + fx * 0.7 + Math.cos(NANYAW) * s * 0.09, 0.035, NAN.z + fz * 0.7 - Math.sin(NANYAW) * s * 0.09], [0, NANYAW, 0], [0.7, 0.45, 1.5]));
      sign("NAN'S CHAIR. RESERVED. FOREVER.", 0.42, 0.12, NAN.x - fx * 0.47, 1.12, NAN.z - fz * 0.47, NANYAW, { bg: '#ffd84a', fg: '#2b2d30', border: '#2b2d30', size: 40 }); }
    // her side table beside it (between the chair and the fire), with THE TIN
    { const sx = P1 + 0.45, sz = PZ(-1.58), h = F.sideTable(k, sx, sz, { r: 0.22 });
      k.cyl(0.12, 0.12, 0.08, sx + 0.03, h + 0.04, sz + 0.02, 0x6a1aa0, 20); k.cyl(0.125, 0.125, 0.02, sx + 0.03, h + 0.085, sz + 0.02, 0xd4af37, 20);   // THE TIN
      k.label("NAN'S", 0.16, 0.06, [sx + 0.03, h + 0.097, sz + 0.02], [-Math.PI / 2, 0, 0], { bg: '#6a1aa0', fg: '#ffd84a', border: null, size: 60 });
      note("NAN'S CHOCOLATE. NOT YOURS. NOT EVEN AT CHRISTMAS.", 0.2, 0.11, sx + 0.06, h + 0.004, sz + 0.16, [-Math.PI / 2, 0, 0.3], '#ffffff', '#c8102e', 30, '#c8102e');
      k.cyl(0.04, 0.035, 0.09, sx - 0.12, h + 0.045, sz - 0.1, 0xf4f4f4, 10); k.cyl(0.034, 0.034, 0.005, sx - 0.12, h + 0.088, sz - 0.1, 0x8a5a3a, 10);
      for (let i = 0; i < 4; i++) k.box(0.05, 0.02, 0.03, sx + 0.12 - i * 0.04, h + 0.01, sz - 0.14, [0x8a1aa0, 0xffd84a, 0x2a8a4a, 0xc8102e][i], { rot: [0, i, 0] });
      STASH = { x: sx + 0.03, y: h + 0.1 + FL, z: sz + 0.02 }; }
    // the long low unit along the back wall (under the window): cards, a lamp, candles
    { const x0 = PX(4.66), x1 = PX(6.37), d = 0.45, h = 0.6, z = ZI0 + d / 2;
      R(x0, ZI0, x1, ZI0 + d, h, h / 2, F.OAK, { block: true, collide: true }); R(x0 + 0.02, ZI0 + d, x1 - 0.02, ZI0 + d + 0.005, 0.06, 0.03, 0x1e1f21);
      for (let i = 0; i < 4; i++) { const a = x0 + (i + 0.5) * (x1 - x0) / 4; k.box((x1 - x0) / 4 - 0.02, h - 0.12, 0.012, a, 0.06 + (h - 0.06) / 2, ZI0 + d + 0.006, i % 3 ? F.OAKD : 0x2c2e31); }
      F.tableLamp(k, x0 + 0.2, h, z); for (let i = 0; i < 10; i++) { const x = x0 + 0.5 + i * 0.1; k.box(0.1, 0.13 + (i % 3) * 0.03, 0.005, x, h + 0.07 + (i % 3) * 0.015, z - (i % 2) * 0.08, [0xf4f0e6, 0xc8102e, 0x1e5a2a, 0x1e3a8a, 0xd4af37][i % 5], { rot: [0, (i % 2 ? 0.3 : -0.3), 0] }); }
      for (let i = 0; i < 3; i++) { k.cyl(0.03, 0.03, 0.14 + i * 0.04, x1 - 0.2 - i * 0.07, h + 0.07 + i * 0.02, z, 0xf4f0e6, 8); bulb(k, x1 - 0.2 - i * 0.07, h + 0.16 + i * 0.04, z, 0xffc060, 0.01, 0.1); }
      k.spawns.push(new THREE.Vector3(x1 - 0.55, h + 0.08, z), new THREE.Vector3(x1 - 0.85, h + 0.08, z));
      note("CARDS FROM SANDY BAY: 61. CARDS FROM THE FAMILY: 4. (THANKS, EVERYONE.)", 0.32, 0.1, x1 - 0.7, h + 0.004, z + 0.12, [-Math.PI / 2, 0, 0], '#fffbe8', '#8a1a1a', 30); }
    const CT = { x: LS.x, z: LS.z - 1.27 };
    F.coffeeTable(k, CT.x, CT.z, 1.0, 0.56);
    k.cyl(0.13, 0.13, 0.12, CT.x - 0.25, 0.48, CT.z, 0x1e5aa8, 16); k.cyl(0.135, 0.135, 0.02, CT.x - 0.25, 0.55, CT.z, 0xd4af37, 16);
    k.label('CELEBRATIONS (THE BOUNTIES ARE LEFT)', 0.2, 0.08, [CT.x - 0.25, 0.565, CT.z], [-Math.PI / 2, 0, 0], { bg: '#1e5aa8', fg: '#ffd84a', border: null, size: 30 });
    k.box(0.24, 0.012, 0.32, CT.x + 0.25, 0.426, CT.z + 0.02, 0xc8102e, { rot: [0, 0.4, 0] }); note('RADIO TIMES XMAS (EVERYTHING CIRCLED BY NAN)', 0.22, 0.28, CT.x + 0.25, 0.434, CT.z + 0.02, [-Math.PI / 2, 0, 0.4], '#c8102e', '#ffffff', 26);
    T('rugL', CT.x - 1.4, CT.z - 1.25, CT.x + 1.4, LS.z - 0.1, 0.012, 0.007, 1);
    // THE TREE in the back corner by the TV, presents round it
    TREE = { x: XI1 - 0.75, z: ZI0 + 0.85 };
    xmasTree(k, TREE.x, TREE.z, { h: 2.3, R: 0.6, rnd });
    { const ps = presents(k, TREE.x - 0.1, TREE.z + 0.15, 9, rnd, 0.55); ps.slice(0, 3).forEach(([x, h, z]) => k.spawns.push(new THREE.Vector3(x, h + 0.06, z)));
      note('TO JIMMY. (ANOTHER JUMPER. SORRY.)', 0.18, 0.09, TREE.x - 0.7, 0.3, TREE.z + 0.35, -0.9, '#ffffff', '#1a3a6a', 30);
      note('TO CHARLI: THE ONE YOU "LITERALLY SAID"', 0.2, 0.09, TREE.x - 0.3, 0.28, TREE.z + 0.7, -0.3, '#ffffff', '#8a1aa0', 30); }
    // the drinks trolley (black and brass) in the front corner by the kitchen door
    { const x = P1 + 0.48, z = ZI1 - 0.3, h = 0.8; DRINKS = { x, y: h + 0.02 + FL, z };
      for (const y of [0.2, h]) k.box(0.7, 0.03, 0.42, x, y, z, 0x2a2a2c, { collide: y > 0.5 }); for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.box(0.025, h, 0.025, x + sx * 0.33, h / 2, z + sz * 0.19, 0xc9a24a);
      k.blockers.push({ x0: x - 0.36, x1: x + 0.36, z0: z - 0.22, z1: z + 0.22, y1: h + 0.05 });
      const bottle = (bx, bz, col, hh, r, neck) => { k.cyl(r, r, hh, bx, h + 0.015 + hh / 2, bz, col, 10); k.cyl(r * 0.4, r * 0.75, hh * 0.35, bx, h + 0.015 + hh + hh * 0.17, bz, col, 8); k.cyl(r * 0.42, r * 0.42, 0.03, bx, h + hh * 1.35 + 0.03, bz, neck, 8); };
      bottle(x - 0.25, z + 0.08, 0x4a2a14, 0.2, 0.045, 0x2a1a10); bottle(x - 0.13, z + 0.1, 0x1e4a2a, 0.24, 0.04, 0xd4af37); bottle(x - 0.02, z + 0.1, 0x1e4a2a, 0.24, 0.04, 0xd4af37); bottle(x + 0.1, z + 0.08, 0xf0d040, 0.18, 0.04, 0xc8102e);
      k.label("BAILEYS (NAN'S)", 0.09, 0.05, [x - 0.25, h + 0.12, z + 0.034], [0, Math.PI, 0], { bg: '#e8dcc0', fg: '#3a1a0a', border: null, size: 40 });
      for (let i = 0; i < 4; i++) { const gx = x + 0.06 + i * 0.07, gz = z - 0.1; k.cyl(0.028, 0.02, 0.11, gx, h + 0.07, gz, 0xe8f6fa, 8); k.cyl(0.025, 0.018, 0.07, gx, h + 0.05, gz, 0xf8e860, 8); }
      for (let i = 0; i < 6; i++) k.cyl(0.033, 0.033, 0.12, x - 0.22 + (i % 3) * 0.075, 0.28, z + (i < 3 ? -0.08 : 0.08), [0xd8b030, 0xc8102e, 0x1e5aa8][i % 3], 8);
      note("THE BAR. BAILEYS IS NAN'S. PROSECCO IS SOPHIE'S. THE SNOWBALL IS A MYSTERY.", 0.36, 0.12, x, h + 0.02, z - 0.205, [-0.4, Math.PI, 0], '#1a1a2a', '#ffd84a', 30);
      k.spawns.push(new THREE.Vector3(x + 0.15, h + 0.08, z)); }
    // curtains (grey, a mustard band) at the windows and the French doors, a lamp, pendants
    F.curtains(k, 'z', XI1, FRD.z0, FRD.z1, -1, 2.27);
    F.curtains(k, 'x', ZI1, ...WF.liv, -1, 2.27);
    F.curtains(k, 'x', ZI0, ...WB.liv, 1, 2.27);
    { const h = F.sideTable(k, XI1 - 0.3, ZI1 - 0.3, { r: 0.21 }); F.tableLamp(k, XI1 - 0.3, h, ZI1 - 0.3); k.spawns.push(new THREE.Vector3(XI1 - 0.35, h + 0.08, ZI1 - 0.2)); }
    pottedPlant(k, XI1 - 0.35, FRD.z0 - 0.4, { s: 0.75, pot: 0x2e3033, rim: 0x3a3c40 });
    F.drumPendant(k, CT.x, CT.z - 0.55, ceilAt(CT.z - 0.55) - 0.04, 2.05, { r: 0.32 }); F.drumPendant(k, PX(4.3), PZ(-1.2), ceilAt(PZ(-1.2)) - 0.04, 2.05, { r: 0.22 });
    note('MIND THE LIGHT, JIMMY', 0.3, 0.08, CT.x, 1.86, CT.z - 0.22, 0, '#ffd84a', '#111', 40);
    // a big modern wall clock, the family on the walls
    { const cz = ZI1 - 0.5, cy = 1.75, cx = P1 + 0.06; k.parts.push(part(cyl(0.22, 0.22, 0.03, 32), 0x1e1f21, [cx + 0.015, cy, cz], [0, 0, Math.PI / 2])); k.label('clock', 0.4, 0.4, [cx + 0.033, cy, cz], [0, Math.PI / 2, 0], { tex: TX.clockTex() }); }
    fam('x', ZI0, PX(4.35), 1.62, 0.36, 0.46, 1, ['michael'], 'studio', 'Michael · 30 years of 1st class post');
    fam('x', ZI1, PX(3.78), 1.62, 0.3, 0.42, -1, ['joan'], 'beach', 'Nan · Sandy Bay summer BBQ');
    // cards on strings, a lit garland over the French doors, the wifi notes
    cardString(k, [PX(4.6), 2.22, ZI0 + 0.03], [PX(6.4), 2.22, ZI0 + 0.03], 'x', 1, rnd, 18); cardString(k, [P1 + 0.08, 2.2, PZ(-1.25)], [P1 + 0.08, 2.2, D.kl.z0 - 0.15], 'z', 1, rnd, 18);
    lightString(k, [[XI1 - 0.12, 2.2, FRD.z0 - 0.3], [XI1 - 0.12, 2.2, FRD.z1 + 0.3]], { spacing: 0.12, sag: 0.1, colors: WARM, halo: 0.06, wire: null });
    for (let i = 0; i < 18; i++) k.parts.push(part(new THREE.IcosahedronGeometry(0.05, 0), i % 2 ? 0x1e5a2a : 0x2a6a32, [XI1 - 0.12, 2.25 - Math.sin(i / 17 * Math.PI) * 0.1, FRD.z0 - 0.3 + i * (FRD.z1 - FRD.z0 + 0.6) / 17]));
    note("JIMMY: THE WIFI IS FOR NAN'S IPAD, NOT YOUR 90GB GAME UPDATE.", 0.36, 0.13, P1 + 0.065, 1.5, PZ(0.45), Math.PI / 2, '#e8ffe0', '#1a5a1a', 30);
    note('WIFI: SANDYBAY60PLUS. NO, NAN DOES NOT KNOW WHERE THE ROUTER IS.', 0.36, 0.14, P1 + 0.065, 1.85, PZ(0.45), Math.PI / 2, '#e0f0ff', '#1a3a8a', 30);
    k.spawns.push(new THREE.Vector3(CT.x + 0.2, 0.5, CT.z - 0.1));

    // ================================================ THE KITCHEN-DINER (x -0.45 .. 4.26): THE HUB. The tall larder beside the
    // back door, the oven tower, the L of units along the back wall and down the living-room wall; the American
    // fridge-freezer on the left-hand wall (the hall side), the island across from it, the table set for nine against
    // the sofa on the front wall
    const WT2 = 0.93, RX = P1 - 0.06, LX = XC1 + DW, HOB = PZ(-1.6);
    const LAR = { x0: BKD.x1 + 0.08, x1: BKD.x1 + 0.68 }, TOW = { x0: LAR.x1, x1: LAR.x1 + 0.6 };    // the larder, then the oven tower, along the back wall
    const FRZ0 = PZ(-0.47) - 0.45;          // the fridge: where it was front-to-back (px 645), now on the opposite wall
    // THE LARDER: a floor-to-ceiling charcoal cupboard next to the back door (one tall door, a long black bar handle)
    { const { x0, x1 } = LAR, w = x1 - x0, m = (x0 + x1) / 2, h = IH - 0.02, f = ZI0 + 0.6;
      F.towerUnit(k, 'x', ZI0, x0, x1, 1, { h, ovens: false });
      k.box(w - 0.01, h - 0.08, 0.02, m, h / 2 + 0.02, f + 0.006, 0x34373b); k.box(0.012, h - 0.12, 0.024, x0 + 0.02, h / 2 + 0.02, f + 0.008, 0x202224);
      k.box(0.025, 0.9, 0.03, x1 - 0.07, 1.05, f + 0.035, 0x111214); for (const y of [0.62, 1.48]) k.box(0.025, 0.025, 0.03, x1 - 0.07, y, f + 0.02, 0x111214);
      k.label('calendar', 0.36, 0.46, [m - 0.02, 1.5, f + 0.02], [0, 0, 0], { tex: calendarTex() });
      note("NAN'S LARDER: 14 TINS OF QUALITY STREET, 1 BROOM, 0 ROOM.", 0.34, 0.1, m - 0.02, 1.15, f + 0.02, 0, '#fffbe8', '#5a2a14', 30); }
    F.towerUnit(k, 'x', ZI0, TOW.x0, TOW.x1, 1);
    F.baseRun(k, 'x', ZI0, TOW.x1, RX, 1);
    F.baseRun(k, 'z', RX, ZI0 + 0.6, KRUN1, -1, { skip: [[HOB - 0.3, HOB + 0.3]] });
    k.box(0.02, 0.86, 0.6, RX - 0.59, 0.49, HOB, 0x111214); k.box(0.022, 0.4, 0.5, RX - 0.592, 0.42, HOB, 0x3a2412); k.box(0.04, 0.02, 0.5, RX - 0.61, 0.73, HOB, F.CHROME); bulb(k, RX - 0.58, 0.42, HOB, 0xffb060, 0.001, 0.45);   // the main oven (lit: the potatoes)
    F.hobAndHood(k, 'z', RX, HOB, -1, WT2);
    T('marbleK', TOW.x1, ZI0, WB.sink[0], ZI0 + 0.012, 0.62, WT2 + 0.31, 1); T('marbleK', WB.sink[1], ZI0, RX, ZI0 + 0.012, 0.62, WT2 + 0.31, 1); T('marbleK', WB.sink[0], ZI0, WB.sink[1], ZI0 + 0.012, 0.11, WT2 + 0.055, 1); T('marbleK', RX - 0.012, ZI0 + 0.6, RX, KRUN1, 0.62, WT2 + 0.31, 1);
    const SINKX = (WB.sink[0] + WB.sink[1]) / 2; k.box(0.8, 0.04, 0.32, SINKX, WT2 + 0.0, ZI0 + 0.25, 0x6a6c6e); k.box(0.68, 0.02, 0.26, SINKX, WT2 + 0.02, ZI0 + 0.25, 0x3a3c3e);   // the sink, a black tap
    k.cyl(0.015, 0.015, 0.3, SINKX, WT2 + 0.15, ZI0 + 0.08, 0x1a1b1d, 6); k.box(0.02, 0.02, 0.2, SINKX, WT2 + 0.3, ZI0 + 0.17, 0x1a1b1d);
    const SHX = RX - 0.33;
    for (const y of [1.42, 1.82]) k.box(0.5, 0.035, 0.26, SHX, y, ZI0 + 0.13, F.OAK);       // open oak shelves in the corner
    for (let i = 0; i < 3; i++) k.cyl(0.04, 0.035, 0.1, SHX - 0.15 + i * 0.15, 1.49, ZI0 + 0.13, [0xf4f4f4, 0x2f6d73, 0xc9a03a][i], 10);
    for (let i = 0; i < 3; i++) k.box(0.07, 0.16, 0.07, SHX - 0.15 + i * 0.15, 1.92, ZI0 + 0.12, [0xd8d0c0, 0xc8c0b0, 0xb8b0a0][i]);
    // the kettle, the toaster, mugs, the cooking on the hob (sprouts, gravy)
    KETTLE = { x: TOW.x1 + 0.2, y: WT2 + 0.12 + FL, z: ZI0 + 0.3 };
    k.cyl(0.09, 0.11, 0.22, KETTLE.x, WT2 + 0.11, KETTLE.z, 0x2a2c2e, 14); k.box(0.04, 0.14, 0.1, KETTLE.x, WT2 + 0.15, KETTLE.z + 0.13, 0x1a1a1a);
    note("KETTLE ON = 4 OF NAN'S FRIENDS ARRIVE WITHIN 4 MINUTES", 0.4, 0.14, SHX, 1.17, ZI0 + 0.015, 0, '#fffbe8', '#222', 30);
    k.box(0.3, 0.18, 0.18, SHX - 0.3, WT2 + 0.09, ZI0 + 0.2, 0x2a2c2e); for (let i = 0; i < 3; i++) k.cyl(0.04, 0.035, 0.1, SHX - 0.5 + i * 0.1, WT2 + 0.05, ZI0 + 0.5, [0xf4f4f4, 0xc8102e, 0x2f6d73][i], 10);
    k.cyl(0.11, 0.11, 0.14, RX - 0.17, WT2 + 0.08, HOB - 0.15, 0xb0b4b8, 14); for (let i = 0; i < 8; i++) k.parts.push(part(sph(0.025, 6, 4), 0x4a8a2a, [RX - 0.17 + Math.cos(i) * 0.05, WT2 + 0.15, HOB - 0.15 + Math.sin(i) * 0.05]));
    k.cyl(0.08, 0.08, 0.12, RX - 0.42, WT2 + 0.07, HOB + 0.15, 0xb0b4b8, 12); k.cyl(0.075, 0.075, 0.01, RX - 0.42, WT2 + 0.13, HOB + 0.15, 0x5a2a14, 12);
    note('GRAVY: KAREN. NO, LISA. NO, KAREN. (NAN IS DOING IT.)', 0.4, 0.13, RX - 0.012, 1.25, HOB, -Math.PI / 2, '#fffbe8', '#5a2a14', 30);
    k.spawns.push(new THREE.Vector3(SHX - 0.6, WT2 + 0.1, ZI0 + 0.4), new THREE.Vector3(RX - 0.35, WT2 + 0.1, HOB - 0.75), new THREE.Vector3(RX - 0.35, WT2 + 0.1, HOB + 0.75));
    // THE FRIDGE on the left-hand wall: magnets and notes (its doors face into the kitchen, toward +x)
    const FR = F.americanFridge(k, 'z', LX, FRZ0, FRZ0 + 0.9, 1);
    { const fx = FR.front, fzm = FRZ0 + 0.45, R2 = Math.PI / 2;
      note('DINNER AT 2. NAN GETS HANGRY AT 2:01', 0.38, 0.2, fx, 1.6, fzm + 0.2, R2, '#fff3c0', '#c8102e', 40, '#c8102e');
      note("SOPHIE'S TRAIN BACK TO LONDON: 6:42 (DON'T MISS IT AGAIN)", 0.36, 0.15, fx, 1.35, fzm - 0.2, R2, '#e0f0ff', '#1a3a8a', 30);
      note("TOMMY: NO 'SYNERGY' AT THE DINNER TABLE", 0.34, 0.12, fx, 1.05, fzm + 0.2, R2, '#ffe6f0', '#6a1a4a', 30);
      note('PAUL: YOU CAN ARGUE WITH THE GRAVY AFTER DINNER. NOT BEFORE.', 0.36, 0.15, fx, 0.8, fzm - 0.2, R2, '#e8ffe0', '#1a5a1a', 30);
      note('CHARLI: YES, YOU LITERALLY SAID THAT', 0.34, 0.12, fx, 0.55, fzm + 0.2, R2, '#fff', '#8a1aa0', 30);
      for (const [dz, y, c] of [[0.35, 1.75, 0xc8102e], [-0.35, 1.5, 0x1e88e5], [0.35, 1.2, 0xffd84a], [-0.35, 0.95, 0x4caf50], [0.35, 0.7, 0xff7a00]]) k.box(0.02, 0.05, 0.05, fx + 0.005, y, fzm + dz, c);
      k.box(0.008, 0.11, 0.16, fx + 0.002, 0.55, fzm - 0.3, 0x7aa0c8); FRIDGE = { x: fx + 0.35, z: fzm }; }
    // the island: charcoal and stone, oak ends, across the kitchen from the fridge (to its right as you face it); the
    // turkey resting on it, the pudding, Lisa's Asda bag
    const IS = { x: FR.front + 1.05 + 0.675, z: FRZ0 + 0.15, w: 1.35, d: 0.85 };
    F.island(k, IS.x, IS.z, IS.w, IS.d, { over: 0.0 }); ISLAND = { x: IS.x, z: IS.z }; LARDER = { x: (LAR.x0 + LAR.x1) / 2, z: ZI0 + 0.3 }; KCOUNTER = { x: SHX - 0.6 };
    { const y = 0.93, x = IS.x - 0.3, z = IS.z - 0.1; k.box(0.46, 0.06, 0.34, x, y + 0.03, z, 0x9aa0a8); k.box(0.42, 0.02, 0.3, x, y + 0.05, z, 0x6a3a14);
      k.parts.push(part(sph(0.16, 14, 10), 0xc0742c, [x, y + 0.15, z], [0, 0, 0], [1.3, 0.85, 1])); for (const s of [-1, 1]) { k.parts.push(part(sph(0.06, 8, 6), 0xb0642a, [x + 0.15, y + 0.12, z + s * 0.1], [0, 0, 0], [1.6, 0.8, 0.8])); k.parts.push(part(cyl(0.012, 0.012, 0.06, 5), 0xf4f0e6, [x + 0.25, y + 0.13, z + s * 0.1], [0, 0, Math.PI / 2])); }
      note('TURKEY IN: 9AM. TURKEY OUT: WHEN NAN SAYS.', 0.36, 0.12, x, y + 0.005, z + 0.27, [-Math.PI / 2, 0, 0], '#fff2e0', '#8a1a1a', 30);
      k.spawns.push(new THREE.Vector3(x, y + 0.32, z));
      const px = IS.x + 0.3, pz = IS.z - 0.2; k.cyl(0.13, 0.12, 0.02, px, y + 0.01, pz, 0xf4f4f4, 14); k.parts.push(part(new THREE.SphereGeometry(0.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0x3a1a0e, [px, y + 0.02, pz])); k.parts.push(part(new THREE.SphereGeometry(0.102, 12, 4, 0, Math.PI * 2, 0, 0.6), 0xf4f0e0, [px, y + 0.02, pz])); for (let i = 0; i < 3; i++) k.parts.push(part(new THREE.IcosahedronGeometry(0.02, 0), i ? 0x1e5a2a : 0xc8102e, [px + (i - 1) * 0.02, y + 0.13, pz]));
      k.spawns.push(new THREE.Vector3(px, y + 0.15, pz), new THREE.Vector3(IS.x + 0.05, y + 0.08, IS.z + 0.28));
      // LISA: the Asda bag for life, and her note
      const ax = IS.x + 0.45, az = IS.z + 0.2; k.box(0.32, 0.36, 0.2, ax, y + 0.18, az, 0x5a9a2a); for (const s of [-1, 1]) k.box(0.02, 0.16, 0.02, ax + s * 0.06, y + 0.42, az, 0x4a8a22);
      k.label('ASDA', 0.24, 0.1, [ax, y + 0.2, az + 0.102], [0, 0, 0], { bg: '#5a9a2a', fg: '#ffffff', border: null, size: 70 });
      k.box(0.08, 0.08, 0.07, ax - 0.05, y + 0.38, az, 0xffd84a); k.box(0.07, 0.12, 0.06, ax + 0.06, y + 0.4, az, 0x8a1a1a);
      note("LISA'S STAFF DISCOUNT APPLIES TO NOTHING HERE", 0.3, 0.12, IS.x - 0.1, y + 0.005, IS.z + 0.3, [-Math.PI / 2, 0, 0], '#fffbe8', '#2a6a1a', 30); }
    for (const x of [IS.x - 0.32, IS.x + 0.32]) F.globePendant(k, x, IS.z, ceilAt(IS.z) - 0.02, 1.75);
    // the KITCHEN SOFA against the front wall, arms each end (the table's pulled up to it for Christmas: four on the sofa)
    const KS = { x: (XK + DW + XK + DW + 2.15) / 2, z: ZI1 - 0.45, len: 2.15 };
    n0 = k.seats.length; sofa(k, { x: KS.x, z: KS.z, len: KS.len, depth: 0.9, ry: 0, color: 0x7f8a8e, seats: 4, pillows: 2 }); const sofaSeats = k.seats.slice(n0); take(n0);
    // THE TABLE, set for nine: the oak table (extended), cross-back chairs along the far side, Nan at the head, the sofa
    // along the near side; a red runner, crackers, crowns, plates, place cards, food
    { const { x: TX, z: TZ, w: TW, d: TD, h: TH } = TBL;
      F.diningTable(k, TX, TZ, TW, TD, { h: TH });
      const s0 = k.seats.length;
      F.crossChair(k, TX - TW / 2 - 0.3, TZ - 0.28, Math.PI / 2, { seat: 0xc9a03a });                              // the head of the table (Nan's)
      for (let i = 0; i < 4; i++) F.crossChair(k, TX - TW / 2 + TW * (i + 0.5) / 4, TZ - TD / 2 - 0.34, 0, i === 3 ? { wood: 0xf2f0ea, seat: 0x9aa0a6 } : undefined);   // (the last one borrowed from Pat next door)
      const chairs = k.seats.slice(s0);
      quizSeats.push(...chairs.slice(1, 3).map(s => ({ ...s })));                                                      // (two of the chairs count for the TV too)
      const all = [chairs[0], chairs[1], chairs[2], chairs[3], chairs[4], ...sofaSeats];
      const clampX = (v) => Math.max(TX - TW / 2 + 0.16, Math.min(TX + TW / 2 - 0.16, v)), clampZ = (v) => Math.max(TZ - TD / 2 + 0.16, Math.min(TZ + TD / 2 - 0.16, v));
      all.forEach((s, n) => { const fx = Math.sin(s.yaw), fz = Math.cos(s.yaw), px = clampX(s.x + fx * 0.46), pz = clampZ(s.z + fz * 0.46);
        dinnerSeats.push({ x: s.x, z: s.z, yaw: s.yaw, h: s.h, name: NAMES[n] });
        k.cyl(0.13, 0.12, 0.015, px, TH + 0.008, pz, 0x4a4e55, 16); k.cyl(0.11, 0.1, 0.012, px, TH + 0.018, pz, 0xffffff, 16);
        k.parts.push(part(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 10, 1, true), [0xffd84a, 0xc8102e, 0x2a8a4a, 0x1e88e5, 0xe86aa0][n % 5], [px, TH + 0.05, pz]));
        const ry = Math.atan2(fx, fz), cx = Math.cos(ry), sx = Math.sin(ry);
        k.box(0.04, 0.04, 0.2, px + cx * 0.15, TH + 0.02, pz - sx * 0.15, n % 2 ? 0xc8102e : 0x1e5a2a, { rot: [0, ry, 0] });
        k.box(0.015, 0.004, 0.15, px - cx * 0.14, TH + 0.004, pz + sx * 0.14, 0xc8ccd0, { rot: [0, ry, 0] });
        k.cyl(0.03, 0.025, 0.11, px + fx * 0.14 + cx * 0.11, TH + 0.055, pz + fz * 0.14 - sx * 0.11, 0xd8eef6, 8);
        k.cyl(0.026, 0.022, 0.05, px + fx * 0.14 + cx * 0.11, TH + 0.03, pz + fz * 0.14 - sx * 0.11, n === 0 ? 0x6a3a1a : n % 3 ? 0xf0e0a0 : 0x8a1a2a, 8);
        k.label(NAMES[n] === 'JIMMY' ? 'JIMMY (THE SOFA. SORRY.)' : NAMES[n] === 'NAN' ? 'NAN (THE BOSS)' : NAMES[n], 0.16, 0.05, [px - fx * 0.13, TH + 0.035, pz - fz * 0.13], yxz(-0.5, ry + Math.PI), { bg: '#ffffff', fg: '#8a1a1a', border: '#d4af37', size: 40 }); });
      const y = TH + 0.004;
      k.cyl(0.15, 0.12, 0.05, TX - 0.18, y + 0.025, TZ + 0.02, 0xf4f4f4, 16); for (let i = 0; i < 12; i++) k.parts.push(part(sph(0.03, 6, 4), 0xd89a3a, [TX - 0.18 + Math.cos(i * 2.4) * 0.08 * (i % 3 / 2 + 0.3), y + 0.07, TZ + 0.02 + Math.sin(i * 2.4) * 0.08 * (i % 3 / 2 + 0.3)], [0, 0, 0], [1.3, 0.9, 1]));
      k.cyl(0.11, 0.09, 0.05, TX + 0.2, y + 0.025, TZ - 0.06, 0xf4f4f4, 14); for (let i = 0; i < 14; i++) k.parts.push(part(sph(0.022, 6, 4), 0x4a8a2a, [TX + 0.2 + Math.cos(i * 2.1) * 0.06 * ((i % 4) / 3), y + 0.06, TZ - 0.06 + Math.sin(i * 2.1) * 0.06 * ((i % 4) / 3)]));
      k.parts.push(part(sph(0.07, 10, 6), 0xf4f4f4, [TX + 0.45, y + 0.05, TZ + 0.04], [0, 0, 0], [1.6, 0.7, 0.9])); k.cyl(0.07, 0.07, 0.005, TX + 0.45, y + 0.085, TZ + 0.04, 0x5a2a14, 10);
      for (let i = 0; i < 3; i++) { const cx = TX - 0.5 + i * 0.06, cz = TZ - 0.05; k.cyl(0.022, 0.022, 0.18 - i * 0.03, cx, y + 0.09 - i * 0.015, cz, 0xc8102e, 8); bulb(k, cx, y + 0.2 - i * 0.03, cz, 0xffc060, 0.012, 0.12); }
      k.cyl(0.035, 0.035, 0.22, TX + 0.05, y + 0.11, TZ + 0.12, 0x3a0a14, 10); k.cyl(0.012, 0.016, 0.08, TX + 0.05, y + 0.26, TZ + 0.12, 0x3a0a14, 6);
      for (const [x, z] of [[TX - 0.18, TZ + 0.02], [TX + 0.2, TZ - 0.06], [TX + 0.45, TZ + 0.04]]) k.spawns.push(new THREE.Vector3(x, TH + 0.1, z));
      note('THE SOFA SIDE: NO ELBOWS ON THE TABLE, NO FEET ON THE SOFA (NAN\'S RULES)', 0.3, 0.12, TX + 0.5, y + 0.002, TZ + 0.3, [-Math.PI / 2, 0, 0], '#fffbe8', '#8a1a1a', 28);
      // a linear pendant over the table
      const ct = ceilAt(TZ) - 0.02; k.box(1.2, 0.06, 0.12, TX, 1.95, TZ, 0x1e1f21); for (const dx of [-0.45, 0, 0.45]) { k.box(0.008, ct - 1.95, 0.008, TX + dx, (ct + 1.95) / 2, TZ, 0x2a2a2a); k.lamp(TX + dx, 1.92, TZ, 0xfff0d0, 0.035, true); }
      k.pool(TX, TH + 0.01, TZ, 1.4, 0xffc070); }
    // the walls: HANGRY-O-METER, BREAK GLASS and the calendar on the airing cupboard's wall, the cards, the photos
    { const xf = XC1 + DW;
      const hz = FRZ0 - 0.6;      // (on the left-hand wall between the fridge and the back door)
      k.parts.push(part(cyl(0.3, 0.3, 0.04, 28), 0x2b2d30, [xf + 0.02, 1.62, hz], [0, 0, Math.PI / 2])); { const m = new THREE.Mesh(new THREE.CircleGeometry(0.27, 32), new THREE.MeshLambertMaterial({ map: hangryTex() })); m.position.set(xf + 0.045, 1.62, hz); m.rotation.y = Math.PI / 2; scene.add(m); }
      note('1:58. TWO MINUTES.', 0.3, 0.06, xf + 0.012, 1.25, hz, Math.PI / 2, '#fffbe8', '#c8102e', 34);
      const bz = hz - 0.75; R(xf, bz - 0.25, xf + 0.02, bz + 0.25, 0.4, 1.55, 0x8a0a1a); R(xf, bz - 0.25, xf + 0.1, bz + 0.25, 0.04, 1.37, 0xc8102e); R(xf, bz - 0.25, xf + 0.1, bz + 0.25, 0.06, 1.72, 0xc8102e); for (const s of [-1, 1]) R(xf, bz + s * 0.23 - 0.02, xf + 0.1, bz + s * 0.23 + 0.02, 0.4, 1.55, 0xc8102e);
      for (let i = 0; i < 18; i++) k.box(0.03, 0.03, 0.05, xf + 0.05, 1.43 + Math.floor(i / 6) * 0.06, bz - 0.18 + (i % 6) * 0.07, [0x8a1aa0, 0xffd84a, 0x2a8a4a, 0xc8102e, 0x1e88e5, 0xff7a00][i % 6], { rot: [(i % 3 - 1) * 0.5, 0, 0] });
      glassQuad([xf + 0.095, 1.37, bz + 0.21], [xf + 0.095, 1.37, bz - 0.21], [xf + 0.095, 1.62, bz - 0.21], [xf + 0.095, 1.62, bz + 0.21]);
      sign('IN CASE OF HANGRY NAN: BREAK GLASS', 0.46, 0.1, xf + 0.105, 1.69, bz, Math.PI / 2, { bg: '#c8102e', fg: '#ffffff', border: null, size: 40 });
      note('(QUALITY STREETS INSIDE. NOT THE COCONUT ONES.)', 0.42, 0.07, xf + 0.012, 1.3, bz, Math.PI / 2, '#ffffff', '#c8102e', 30);
      cardString(k, [XK + 0.2, 2.22, ZI1 - 0.02], [P1 - 0.3, 2.22, ZI1 - 0.02], 'x', -1, rnd, 22);
      sign("NAN'S KITCHEN: OPEN 24 HOURS (FOR TEA)", 0.9, 0.18, RX - 0.005, 2.1, PZ(-0.47), -Math.PI / 2, { bg: '#2b2d30', fg: '#ffffff', border: '#6dcfcf', size: 40 });
      fam('z', XK + DW, PZ(2.35), 1.6, 0.8, 0.56, 1, ['karen', 'paul', 'tommy', 'charli'], 'beach', 'Karen, Paul, Tommy & Charli · Tenerife');
      fam('x', ZI1, WF.kit[1] + 0.45, 1.55, 0.42, 0.55, -1, ['tommy'], 'studio', 'Tommy · Marketing Award (for crisps)');
      fam('z', XK + DW, PZ(1.62), 1.6, 0.3, 0.4, 1, ['charli'], 'studio', 'Charli · "I said that first"');
      fam('x', ZI1, PX(0.7), 1.55, 0.34, 0.42, -1, ['karen', 'lisa'], 'studio', 'Karen & Lisa · already arguing'); }
    // the glazed door into the living room (open, swung back flat against the kitchen side of the wall)
    F.openDoor(k, P1 - 0.07, D.kl.z0 + 0.02, true, -1, D.kl.z1 - D.kl.z0 - 0.05, { glazed: glassQuad, turn: -1.45 });

    // ================================================ THE HALL (two bedroom doors straight ahead, the bathroom on the left),
    // the front-door corridor, the airing cupboard
    { // coat hooks with coats on the shower / cupboard wall, Jimmy's shoes under them, the cupboard's (shut) door
      const z = ZM + DW, hx = PX(-1.85) + 1.85;      // (hx: the hooks' shift along the bigger hall)
      k.box(1.0, 0.08, 0.03, hx - 1.85, 1.75, z + 0.015, F.OAK); for (let i = 0; i < 4; i++) { const x = hx - 2.2 + i * 0.23; k.box(0.02, 0.03, 0.06, x, 1.75, z + 0.04, 0x1a1a1a); k.box(0.3, 0.75, 0.12, x, 1.36, z + 0.08, [0x3a3a5a, 0x8a3a2a, 0x2a4a3a, 0xd8c8a8][i], { rot: [-0.04 * (i % 2 ? 1 : -1), 0, 0] }); }
      for (let i = 0; i < 4; i++) k.box(0.12, 0.08, 0.26, hx - 2.2 + i * 0.22, 0.04, z + 0.16, [0x2a2a2a, 0x8a3a2a, 0xe8e8e8, 0x3a2a1a][i]);
      k.box(0.16, 0.12, 0.36, hx - 1.3, 0.06, z + 0.2, 0x1a1a1a); note("JIMMY'S SHOES (SIZE 13). DO NOT TRIP.", 0.3, 0.1, hx - 1.3, 0.125, z + 0.2, [-Math.PI / 2, 0, 0], '#fffbe8', '#222', 30);
      note('KEYS. GLASSES. PURSE. BUS PASS. CHOCOLATE.', 0.3, 0.2, hx - 1.25, 1.65, z + 0.005, 0, '#fffbe8', '#222', 30);
      const cx = (XC0 + XC1) / 2, cw = XC1 - XC0 - 0.1; k.box(cw, 2.0, 0.035, cx, 1.0, z + 0.018, 0xf7f7f5); k.box(cw - 0.12, 0.7, 0.04, cx, 0.55, z + 0.02, 0xeeeeec); k.box(cw - 0.12, 0.8, 0.04, cx, 1.45, z + 0.02, 0xeeeeec); k.box(0.02, 0.02, 0.1, cx - cw / 2 + 0.07, 1.02, z + 0.06, F.CHROME);
      note('AIRING CUPBOARD. THE CHRISTMAS TINS ARE NOT IN HERE. (THEY ARE.)', 0.3, 0.14, cx, 1.75, z + 0.04, 0, '#ffffff', '#4a4e55', 26);
      // a mirror on the bathroom wall, the big family photo beside the bedroom doors, a string of lights
      k.box(0.55, 0.8, 0.02, PX(-1.5), 1.62, ZBA - DW - 0.01, 0x1e1f21); k.box(0.51, 0.76, 0.015, PX(-1.5), 1.62, ZBA - DW - 0.02, 0xb8c6cc);
      fam('z', XS - DW, PZ(-0.68), 1.55, 0.75, 0.55, -1, ['lisa', 'michael', 'sophie', 'jimmy'], 'xmas', 'Lisa, Michael, Sophie & Jimmy');
      fam('x', ZBA - DW, PX(-3.32), 1.55, 0.3, 0.42, -1, ['sophie'], 'studio', 'Sophie · London (again)');
      lightString(k, [[XS - 0.02, 2.25, ZM + DW + 0.03], [XC1 + 0.02, 2.25, ZM + DW + 0.03]], { spacing: 0.15, sag: 0.06, colors: WARM, wire: null });
      note('BEDROOMS AHEAD. BATHROOM ON THE LEFT. (NAN\'S EN-SUITE IS NAN\'S.)', 0.42, 0.12, XS - DW - 0.012, 2.05, PZ(-0.68), -Math.PI / 2, '#ffffff', '#4a4e55', 28);
      // the front-door corridor: a slim shelf with the cards Michael sorted, a mirror over it
      const kx = XK - DW, sz0 = PZ(1.55), sz1 = sz0 + 0.65; R(kx - 0.2, sz0, kx, sz1, 0.04, 0.84, F.OAK, { collide: true, block: true }); for (const zz of [sz0 + 0.03, sz1 - 0.03]) k.box(0.18, 0.82, 0.025, kx - 0.1, 0.41, zz, 0x1e1f21);
      for (let i = 0; i < 9; i++) k.box(0.15, 0.012, 0.11, kx - 0.1, 0.87 + i * 0.013, sz0 + 0.35, [0xf4f0e6, 0xc8102e, 0xe8e0d0, 0x1e5a2a, 0xf4f0e6][i % 5], { rot: [0, i * 0.12, 0] });
      note('SORTED BY MICHAEL (ALL THE SAME POSTCODE)', 0.32, 0.14, kx - 0.005, 1.15, sz0 + 0.2, -Math.PI / 2, '#ffffff', '#c8102e', 32);
      k.box(0.02, 0.8, 0.55, kx - 0.01, 1.62, sz0 + 0.33, 0x1e1f21); k.box(0.015, 0.76, 0.51, kx - 0.02, 1.62, sz0 + 0.33, 0xb8c6cc);
      k.spawns.push(new THREE.Vector3(kx - 0.1, 0.95, sz0 + 0.5));
      lightString(k, [[XBA + DW + 0.03, 2.25, ZBA + 0.2], [XBA + DW + 0.03, 2.25, ZI1 - 0.1]], { spacing: 0.15, sag: 0.06, colors: WARM, wire: null });
      // the back door (glazed, open back against the cupboard wall), the front door (anthracite, a sandblasted glass
      // strip, open back against the bathroom wall)
      F.openDoor(k, BKD.x0 + 0.02, ZI0, false, 1, DOOR - 0.04, { col: C.WHITE, glazed: glassQuad });
      F.openDoor(k, FD.x0 + 0.02, ZI1, false, -1, DOOR - 0.04, { col: C.ANTH, lever: 0xc8ccd0 });
      k.box(0.045, 1.5, 0.16, FD.x0 + 0.02, 1.15, ZI1 - DOOR / 2, 0xdfe5e8); }
    // the en-suite: toilet, vanity, the walk-in shower (a tray, a glass screen, a rain head)
    { F.toilet(k, 'x', ZI0 - 0.05, PX(-2.14), 1);      // (snug to the wall: room to step round it into the shower)
      F.vanity(k, 'z', XC0 - DW, PZ(-2.4), -1, { w: 0.6 });
      R(XS + DW, ZE, XC0 - DW, ZM - DW, 0.04, 0.02, 0xf4f4f2); k.box(0.3, 0.012, 0.3, (XS + XC0) / 2, 0.045, (ZE + ZM) / 2, 0x9aa0a4);
      k.box(0.65, 2.0, 0.01, XS + DW + 0.33, 1.0, ZE, 0xcfe6ee); k.box(0.03, 2.0, 0.03, XS + DW + 0.66, 1.0, ZE, F.CHROME);
      k.box(0.04, 0.04, 0.35, XC0 - 0.2, 2.1, (ZE + ZM) / 2, F.CHROME); k.cyl(0.12, 0.12, 0.015, XC0 - 0.35, 2.08, (ZE + ZM) / 2, F.CHROME, 16); k.box(0.06, 0.18, 0.1, XC0 - DW - 0.03, 1.1, (ZE + ZM) / 2, F.CHROME);
      note("NAN'S EN-SUITE. KNOCK. THEN KNOCK AGAIN.", 0.36, 0.13, PX(-3.0), 1.75, ZE - DW - 0.012, Math.PI, '#ffffff', '#4a4e55', 30);
      F.radiator(k, 'x', ZE - DW, PX(-3.0), 0.5, -1, { y: 1.0, h: 0.9 });
      k.spawns.push(new THREE.Vector3(XC0 - DW - 0.22, 0.95, PZ(-2.4) + 0.15)); }
    // the bathroom: the bath along the EAST side (the corridor wall; a shower over it, a screen), the basin and vanity on
    // the west side opposite it, the toilet between them on the front wall; the door off the hall, a clear way in
    { F.bath(k, 'z', XBA - DW, ZI1 - 1.7, ZI1, -1); F.toilet(k, 'x', ZI1, (XW + XBA) / 2 - 0.15, -1); F.vanity(k, 'z', XW + DW, ZBA + 1.05, 1, { w: 0.7 });
      k.box(0.02, 0.7, 0.5, XW + DW + 0.025, 1.45, ZBA + 1.05, 0x1e1f21); k.box(0.015, 0.66, 0.46, XW + DW + 0.037, 1.45, ZBA + 1.05, 0xb8c6cc);   // the mirror over the basin
      F.radiator(k, 'z', XW + DW, ZI1 - 0.45, 0.5, 1, { y: 1.0, h: 0.9 });
      k.spawns.push(new THREE.Vector3(XW + DW + 0.25, 0.95, ZBA + 1.25)); }
    // THE RED BEDROOM (Nan's): the double bed (its head against the deep red feature wall), red bedding, a red throw
    // and cushions, red curtains, a red rug; bedsides, the floor-to-ceiling mirrored sliding wardrobes
    { const bx = PX(-5.48), RED = 0xb3142a, DRED = 0x7a1620;
      F.bed(k, bx, ZM - DW - 1.06, Math.PI, { w: 1.5, l: 2.0, head: DRED, duvet: 0xf6efe8, throwCol: RED, pillow: 0xf4e6e6, cushions: [RED, 0xf2e2c8, RED] });
      F.bedside(k, bx - 1.15, ZM - 0.3, Math.PI); k.spawns.push(new THREE.Vector3(bx - 1.15, 0.62, ZM - 0.3), new THREE.Vector3(bx, 0.75, ZM - 1.4));      // (one bedside: the other side's the way in from the hall)
      F.mirrorWardrobe(k, 'z', XI0, ZI0, ZM - DW - 0.01, 1, { depth: XWF - XI0, h: IH, mirror: true }); F.radiator(k, 'x', ZI0, (WB.red[0] + WB.red[1]) / 2, 1.0, 1);
      F.curtains(k, 'x', ZI0, ...WB.red, 1, 2.27, { col: 0xa3182a, col2: 0x6a0f1a });
      k.box(2.2, 0.006, 1.7, bx, 0.016, ZM - 1.45, RED);
      F.framed(k, 'x', ZM - DW, bx, 1.75, 1.0, 0.45, -1, TX.printTex(3));
      note("NAN'S ROOM. THE PRESENTS ARE NOT UNDER THE BED. (THEY ARE.)", 0.42, 0.16, PX(-4.2), 1.4, ZI0 + 0.012, 0, '#ffffff', '#8a1a1a', 30);
      for (let i = 0; i < 3; i++) { const x = bx - 0.5 + i * 0.5; k.parts.push(part(sph(0.05, 8, 6), [0xc8102e, 0xd4af37, 0xc8102e][i], [x, 2.05 - (i % 2) * 0.06, ZM - DW - 0.04])); } }
    // THE YELLOW BEDROOM: a double bed (head against the mustard wall), yellow bedding, cushions and curtains, the
    // mirrored wardrobes, a bedside
    { const bx = PX(-5.52), YEL = 0xf0c02a, DYEL = 0xc9961c;
      F.bed(k, bx, ZM + DW + 1.04, 0, { w: 1.4, l: 1.95, head: DYEL, duvet: 0xfbf3d6, throwCol: YEL, pillow: 0xfff8e0, cushions: [YEL, 0xffffff, YEL] });
      F.bedside(k, bx - 1.1, ZM + 0.3, 0);
      F.mirrorWardrobe(k, 'z', XI0, ZM + DW + 0.01, ZI1, 1, { depth: XWF - XI0, h: IH, mirror: true }); F.radiator(k, 'x', ZI1, (WF.yel[0] + WF.yel[1]) / 2, 1.0, -1);
      F.curtains(k, 'x', ZI1, ...WF.yel, -1, 2.27, { col: 0xe8b830, col2: 0xb88a18 });
      k.box(2.0, 0.004, 0.7, bx, 0.016, ZI1 - 0.6, 0xf2cc4a);
      note("THE SPARE ROOM: SOPHIE'S (IF SHE MISSES THE 6:42)", 0.4, 0.14, PX(-4.25), 1.6, ZI1 - 0.012, Math.PI, '#fff6cc', '#1a3a8a', 30);
      k.spawns.push(new THREE.Vector3(bx, 0.75, ZM + 1.4)); }
    // the inner doors (white panels, chrome levers), open: the bedrooms' back flat against their walls, the en-suite's
    // along its back wall, the bathroom's against the corridor side
    F.openDoor(k, XW - 0.06, D.red.z0 + 0.02, false, -1, DOOR - 0.06); F.openDoor(k, XW - 0.06, D.yel.z1 - 0.02, false, 1, DOOR - 0.06);
    F.openDoor(k, XW + 0.06, D.ens.z0 + 0.02, true, 1, DOOR - 0.06); F.openDoor(k, D.bath.x1 - 0.02, ZBA + 0.06, false, 1, DOOR - 0.06);
    // the French doors: both glazed leaves open out against the house on to the deck
    F.openDoor(k, HX1 + 0.06, FRD.z0, false, -1, (FRD.z1 - FRD.z0) / 2 - 0.02, { glazed: glassQuad }); F.openDoor(k, HX1 + 0.06, FRD.z1, false, 1, (FRD.z1 - FRD.z0) / 2 - 0.02, { glazed: glassQuad });
  });
  // the fire's flames flicker
  flameY = flame ? flame.position.y : 0;

  // ======================================================== build it
  { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(glassPos, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: 0xd8ecf4, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide })); m.renderOrder = 2; scene.add(m); }
  k.parts.push(...W.trim); W.trim = [];
  const mats = buildMats();
  for (const [key] of W.lists) { const g = W.merged(key); if (!g) continue; const mat = mats[key]; if (!mat) { console.warn('sandybay: no material for', key); continue; } const m = new THREE.Mesh(g, mat); m.userData.bag = key; scene.add(m); }
  placeHomes(scene, resort.homes, { siding: { white: mats.sidW, band: mats.sidB, grey: mats.sidG }, roof: mats.roof, trim: vcLambert });
  buildBulbs(k, scene);
  // the outdoor furniture of the whole resort merged in big 30 m tiles (a handful of draws for the street, the club,
  // the sea wall...); the home's own pieces stay in the Kit's finer patches. (Coplanar faces are pulled apart first.)
  { k.zfixed0 = k.separateCoplanar(); const tiles = new Map(), keep = [], c = new THREE.Vector3();
    for (const g of k.parts) { g.computeBoundingBox(); g.boundingBox.getCenter(c);
      if (c.x > HX0 - 1.5 && c.x < DECK.x1 + 1 && c.z > DECK.zb - 1.5 && c.z < DSTEP.z1 + 0.6) { keep.push(g); continue; }
      const key = Math.floor(c.x / 30) + ',' + Math.floor(c.z / 30); (tiles.get(key) || tiles.set(key, []).get(key)).push(g); }
    k.parts = keep; const kept = new Set(keep); k.boxRec = (k.boxRec || []).filter(r => !r.g || r.g.isMesh || kept.has(r.g));
    for (const list of tiles.values()) { const m = new THREE.Mesh(merge(list), vcLambert); m.userData.tile = true; scene.add(m); } }
  const room = k.finish({
    name: "Nan's new house (Sandy Bay)",
    sky: 0xd8e4f0, ground: 0x6a8a5a, hemiI: 1.45, sun: 0xffdcb0, sunI: 2.4, sunPos: [-6, 4.2, 9], ambient: 0.42,
    start: { x: (FD.x0 + FD.x1) / 2, z: HZ1 + 0.75, yaw: 0 },      // on the decking outside the front door, facing in (the corridor, the kitchen beyond)
    spotCount: 30,
  });
  // little pockets nobody can walk to are closed off (nobody's ever put down where they can't walk out of)
  { const n = room.nav, seen = new Uint8Array(n.free.length), st = [n.nearestFree(room.start.x, room.start.z)]; seen[st[0]] = 1;
    while (st.length) { const c = st.pop(), i = c % n.nx, j = Math.floor(c / n.nx); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= n.nx || b >= n.nz) continue; const m = b * n.nx + a; if (n.free[m] && !seen[m]) { seen[m] = 1; st.push(m); } } }
    let shut = 0; for (let m = 0; m < n.free.length; m++) if (n.free[m] && !seen[m]) { const x = n.x0 + ((m % n.nx) + 0.5) * n.cell, z = n.z0 + (Math.floor(m / n.nx) + 0.5) * n.cell; k.blockers.push({ x0: x - 0.01, x1: x + 0.01, z0: z - 0.01, z1: z + 0.01, y1: 0.01, pocket: true }); shut++; }
    if (shut) { room.nav = new NavGrid(room); room.tommySpots = room.nav.sampleSpots(30); }
    room.navShut = shut; }
  // the family start indoors: the park's so big that a random pick of hang-out spots hardly ever lands in the house, so
  // this level's grid always offers a few in the lounge and kitchen first
  { const nav = room.nav, base = nav.sampleSpots.bind(nav), inLiving = (x, z) => x > XC1 + 0.3 && x < HX1 - 0.3 && z > HZ0 + 0.3 && z < HZ1 - 0.3;
    nav.sampleSpots = (n, minGap = 2.2) => {
      const cand = [];
      for (let k2 = 0; k2 < nav.free.length; k2++) { if (!nav.free[k2]) continue; const c = nav.center(k2); if (!inLiving(c.x, c.y)) continue;
        const i = k2 % nav.nx, j = Math.floor(k2 / nav.nx); let ok = true; for (let dj = -1; dj <= 1 && ok; dj++) for (let di = -1; di <= 1; di++) if (!nav.free[(j + dj) * nav.nx + i + di]) { ok = false; break; } if (ok) cand.push(c); }
      const inside = []; for (let t = 0; t < 400 && inside.length < 10 && cand.length; t++) { const p = cand[Math.floor(Math.random() * cand.length)]; if (inside.every(o => o.distanceTo(p) > 1.0)) inside.push(p.clone()); }
      return [...inside, ...base(n, minGap).filter(p => !inLiving(p.x, p.y))].slice(0, Math.max(n, inside.length));
    };
    room.tommySpots = nav.sampleSpots(30); }
  // a low winter sun with soft shadows over Nan's end of the street; a light haze out to the estuary
  room.shadows = true;
  const sun = room.sun; sun.castShadow = true;
  sun.target.position.set(4, 0, 0); scene.add(sun.target); sun.position.set(-10, 9, 15);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 2, far: 80 }); sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.traverse(o => { if (o.isMesh && o !== sky && o !== clouds) { const bigFlat = o.userData.bag && /^(lawn|tarmac|paving|slab|turf|sand|pool|coping|carpet|vinyl|tng|marble|rugL)/.test(o.userData.bag); o.castShadow = !o.material.transparent && !o.isInstancedMesh && !bigFlat; o.receiveShadow = true; } });
  scene.fog = new THREE.Fog(0xd6dee8, 45, 118);
  { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunGlowTex(), color: 0xfff0d8, transparent: true, depthWrite: false, fog: false }));
    sp.position.copy(SUN_DIR).multiplyScalar(28); sp.scale.setScalar(9); sp.renderOrder = -97; sp.frustumCulled = false; skyRig.add(sp);
    room.skyRefs = { sky, sunSprite: sp, clouds }; }
  // raised floors: the home, the L of decking, the decking stairs, the deck's back stairs, the back door's steps
  const inHome = (x, z) => x > HX0 && x < HX1 && z > HZ0 && z < HZ1;
  const stepH = (d) => FL * (3 - Math.min(2, Math.floor(d / 0.3))) / 4;
  room.floorAt = (x, z) => {
    if (inHome(x, z)) return FL;
    if (z >= HZ1 && z < DECK.z1 && x > DECK.x0 && x < DECK.x1) return FL;
    if (x >= DECK.endX && x < DECK.x1 && z > DECK.zb && z < HZ1) return FL;
    if (z >= DSTEP.z0 && z < DSTEP.z1 && x >= DSTEP.x0 && x < DSTEP.x1) return stepH(z - DSTEP.z0);
    if (z > BDSTEP.z0 && z <= BDSTEP.z1 && x >= BDSTEP.x0 && x < BDSTEP.x1) return stepH(BDSTEP.z1 - z);
    if (z > BSTEP.z0 && z <= BSTEP.z1 && x >= BSTEP.x0 && x < BSTEP.x1) return stepH(BSTEP.z1 - z);
    return 0;
  };
  room.indoors = (x, z) => inHome(x, z);
  const baseUpdate = room.update.bind(room);
  room.update = (dt) => { baseUpdate(dt); const t = room.t || 0; updateOutdoor(t); if (flame) { flame.scale.y = 1 + Math.sin(t * 9) * 0.05 + Math.sin(t * 23) * 0.03; flame.position.y = flameY + (flame.scale.y - 1) * 0.2; } };
  // ---- what the game needs to know
  room.zones = {
    lounge: { x0: P1, x1: HX1, z0: HZ0, z1: HZ1 },
    kitchen: { x0: XC1, x1: P1, z0: HZ0, z1: HZ1 },
    hall: { x0: XW, x1: XC1, z0: ZE, z1: ZBA },
    corridor: { x0: XBA, x1: XK, z0: ZBA, z1: HZ1 },
    bathroom: { x0: XW, x1: XBA, z0: ZBA, z1: HZ1 },
    redBedroom: { x0: HX0, x1: XW, z0: HZ0, z1: ZM },
    ensuite: { x0: XW, x1: XC0, z0: HZ0, z1: ZM },
    yellowBedroom: { x0: HX0, x1: XW, z0: ZM, z1: HZ1 },
    bedrooms: { x0: HX0, x1: XW, z0: HZ0, z1: HZ1 },
    deck: { x0: DECK.x0, x1: DECK.x1, z0: DECK.zb, z1: DECK.z1 },
    garden: { x0: PLOT.x0, x1: PLOT.x1, z0: L.HEDGE.z1, z1: HZ0 },
    lawn: { x0: LAWN.x0, x1: LAWN.x1, z0: LAWN.z0, z1: LAWN.z1 },
    sheds: { x0: SHED.x0, x1: SHED.x1, z0: SHED.z0, z1: SHED.z1 },
    drive: { x0: DRIVE.x0, x1: DRIVE.x1, z0: DRIVE.z0, z1: L.ROAD.z0 },
    green: { x0: GREEN.x0, x1: GREEN.x1, z0: GREEN.z0, z1: GREEN.z1 },
    front: { x0: DRIVE.x1, x1: PLOT.gate0, z0: DECK.z1, z1: L.ROAD.z0 },
    road: { x0: BD.x0, x1: 46, z0: L.ROAD.z0, z1: L.ROAD.z1 },
    pool: { x0: L.CLUB.x0, x1: L.CLUB.x1, z0: -6.4, z1: L.CLUB.z1 },
    promenade: { x0: L.SEA_X + L.SEA_T, x1: BD.x1, z0: BD.z0, z1: BD.z1 },
  };
  room.floor = FL;
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  for (const s of [hostSeat, ...quizSeats, ...dinnerSeats]) s.yaw = wrap(s.yaw);
  room.quiz = {
    host: { x: hostSeat.x, z: hostSeat.z, yaw: hostSeat.yaw, h: hostSeat.h },
    seats: quizSeats.map(s => ({ x: s.x, z: s.z, yaw: s.yaw, h: s.h })),
    tv: TVINFO,
    stand: [[6.2, -1.6], [4.9, -0.3], [6.6, 1.2], [3.75, 1.55]].map(([x, z]) => ({ x: PX(x), z: PZ(z) })),
  };
  room.dinner = { seats: dinnerSeats, table: { x: TBL.x, z: TBL.z, w: TBL.w, d: TBL.d, h: TBL.h, y: FL + TBL.h } };
  room.kitchen = { kettle: KETTLE, fridge: FRIDGE, counter: { x: KCOUNTER.x, y: FL + 0.93, z: HZ0 + WT + 0.3 }, island: { x: ISLAND.x, y: FL + 0.93, z: ISLAND.z }, larder: LARDER };
  room.stash = STASH;
  room.tree = { x: TREE.x, z: TREE.z };
  room.drinks = DRINKS;
  room.lawn = LAWN;
  room.gardenStart = { x: LAWN.x0 + 0.5, z: (LAWN.z0 + LAWN.z1) / 2, yaw: -Math.PI / 2 };      // the lawn's left-hand end (by the sheds), flinging down its length; the queue lines up behind toward the house
  room.familyPhotos = photos;
  room.activities = [
    ...quizSeats.slice(0, 5).map(s => ({ x: s.x, z: s.z, yaw: s.yaw, pose: 'sit' })),
    { x: hostSeat.x, z: hostSeat.z, yaw: hostSeat.yaw, pose: 'sit' },
    ...[[6.2, -1.7, -Math.PI / 2, 'drink'], [2.1, 0.0, -Math.PI / 2, 'chat'], [0.05, -2.1, Math.PI, 'phone'], [1.2, 0.05, Math.PI / 2, 'chat'],
      [8.6, 0.4, Math.PI / 2, 'phone'], [3.0, -5.6, Math.PI, 'drink'], [2.0, 3.9, 0, 'chat'], [-2.0, 0.6, -Math.PI / 2, 'chat']].map(([x, z, yaw, pose]) => ({ x: PX(x), z: PZ(z), yaw, pose })),
  ];
  return room;

  // a family photo on a wall (the faces painted from their models). axis 'x' = on a wall along x at z = c, d = which way
  function fam(axis, c, a, y, w, h, d, who, bg, caption, frameCol = 0x1e1f21) {
    if (w < 0.01) return;
    const sl = photoSlot(w > h ? 320 : 240, w > h ? 250 : 320, { who: who.map(FAM), bg, caption }); photos.push(sl);
    if (axis === 'x') { k.box(w + 0.08, h + 0.08, 0.03, a, y, c + d * 0.015, frameCol); k.box(w + 0.02, h + 0.02, 0.005, a, y, c + d * 0.031, 0xf6f2e8); k.label('photo', w - 0.04, h - 0.04, [a, y, c + d * 0.035], [0, d > 0 ? 0 : Math.PI, 0], { tex: sl.tex }); }
    else { k.box(0.03, h + 0.08, w + 0.08, c + d * 0.015, y, a, frameCol); k.box(0.005, h + 0.02, w + 0.02, c + d * 0.031, y, a, 0xf6f2e8); k.label('photo', w - 0.04, h - 0.04, [c + d * 0.035, y, a], [0, d > 0 ? Math.PI / 2 : -Math.PI / 2, 0], { tex: sl.tex }); }
  }
}

// every textured surface's material (the bag's keys)
function buildMats() {
  const lam = (map, o = {}) => new THREE.MeshLambertMaterial({ map, ...o });
  const render = lam(TX.renderTex());
  return {
    sidB: lam(TX.sidingTex({ band: 0.9 })), sidW: lam(TX.sidingTex({ band: 0 })), sidG: lam(TX.sidingTex({ band: 0, base: '#c9cccc' })),
    sid: lam(TX.sidingTex({ band: 0.9 })),
    roof: lam(TX.roofTileTex(), { side: THREE.DoubleSide }), slate: lam(TX.slateTex(), { side: THREE.DoubleSide }),
    lawn: lam(TX.lawnTex()), turf: lam(TX.lawnTex([87, 184, 74], false)), hedge: lam(TX.hedgeTex()),
    paving: lam(TX.pavingTex()), slab: lam(TX.slabTex()), tarmac: lam(TX.tarmacTex()), coping: lam(TX.slabTex([244, 243, 238])),
    render, renderTri: render, brick: lam(TX.brickTex()), skirt: lam(TX.skirtTex()),
    pool: lam(TX.poolTex(), { emissive: 0x0a3a55 }), sand: lam(TX.sandTex()), deck: lam(TX.deckTex()),
    carpet: lam(TX.carpetTex()), vinyl: lam(TX.vinylTex()), slat: lam(TX.slatTex()), tng: lam(TX.tngTex(), { emissive: 0x2a2824 }),
    marbleK: lam(TX.marbleTex({ cols: 1, rows: 2 })), marbleB: lam(TX.marbleTex({ base: '#e6dccb', vein: 'rgba(150,130,105,', cols: 2, rows: 4 })),
    rugL: lam(TX.carpetTex([150, 146, 140])),
  };
}

// Christmas cards hung on a ribbon along a wall: axis 'x' (along x at z) or 'z'; d = which way they face
function cardString(k, a, b, axis, d, rnd, n) {
  const COL = [0xf4f0e6, 0xc8102e, 0x1e5a2a, 0x1e3a8a, 0xffffff, 0xd4af37, 0x8a1a2a];
  if (!n) return;
  k.box(axis === 'x' ? Math.abs(b[0] - a[0]) : 0.006, 0.01, axis === 'z' ? Math.abs(b[2] - a[2]) : 0.006, (a[0] + b[0]) / 2, a[1], (a[2] + b[2]) / 2, 0xc8102e);
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = a[0] + (b[0] - a[0]) * t, z = a[2] + (b[2] - a[2]) * t, w = 0.1 + rnd() * 0.05, h = 0.13 + rnd() * 0.05, c = COL[i % COL.length], y = a[1] - h / 2 - 0.01;
    if (axis === 'x') { k.box(w, h, 0.004, x, y, z + d * 0.004, c, { rot: [0, 0, (rnd() - 0.5) * 0.15] }); k.box(w * 0.5, h * 0.4, 0.003, x, y, z + d * 0.007, [0xffffff, 0xc8102e, 0xd4af37, 0x2a8a4a][i % 4]); }
    else { k.box(0.004, h, w, x + d * 0.004, y, z, c, { rot: [(rnd() - 0.5) * 0.15, 0, 0] }); k.box(0.003, h * 0.4, w * 0.5, x + d * 0.007, y, z, [0xffffff, 0xc8102e, 0xd4af37, 0x2a8a4a][i % 4]); } }
}
function sunGlowTex() {
  return canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,250,235,1)'); gr.addColorStop(0.12, 'rgba(255,240,210,1)'); gr.addColorStop(0.3, 'rgba(255,220,170,0.45)'); gr.addColorStop(1, 'rgba(255,220,170,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
}
// big skies: broad stratocumulus over the estuary
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
        const c = Math.max(0, Math.min(1, (n - 0.54) / 0.18)) * band, sh = 0.8 + 0.2 * Math.min(1, (n - 0.45) * 3);
        const q = (j * W + i) * 4; d[q] = 252 * sh; d[q + 1] = 249 * sh; d[q + 2] = 247 * sh; d[q + 3] = 255 * Math.pow(c, 0.8) * 0.8; } }
    g.putImageData(img, 0, 0);
  }, { mips: true });
}
