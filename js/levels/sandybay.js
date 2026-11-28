// NAN'S NEW HOUSE (SANDY BAY): Joan's park home on Sandy Bay, "a luxury residential resort" (gated, over-50s) on
// Thorney Bay Road, Canvey Island. Christmas Day afternoon. Looking down (x along her street, +z toward the road):
//
// Laid out like the aerial photo of her plot (Wave Road in front, Pebble Road behind the green verge).
//   x -27          the way in: barrier, the turquoise SANDY BAY sign, the Sales Office & Car Wash (across)
//   x -27 .. -15   Nan's left-hand neighbour (a Sonata), and the home behind it that fronts Pebble Road
//   z 7 .. 12.5    Wave Road (tarmac, low pale kerbs, slim anthracite lamp posts), Seafarer Drive off it to the north
//   z -3.05..3.05  NAN'S HOME, "THE RESIDENCE 60x20" (x -9.15 .. 9.15), floor up on its chassis (0.65 m):
//                  master bedroom + en-suite | bathroom, utility / bedroom 2 | study / ENTRANCE HALL (front door) |
//                  KITCHEN-DINER (island, the table set for nine) | LOUNGE with the cathedral window at the +x end
//                  decking round the lounge end with a clear glass balustrade, steps down to her side path
//   z -3 .. -11.8  her back garden: her drive carries on down the side of the house to TWO GARAGES in the back
//                  left-hand corner (up-and-over doors facing the house), her silver Nissan Micra parked on it;
//                  the washing line; side hedges
//   z -11.8..-12.5 the long back hedge (a little gate at the side path). No home behind her: just the hedge, then
//   z -12.5..-20.6 THE GREEN, the long grass verge along Pebble Road (Fling the Family is played down it)
//   x 14.5 .. 26.7 Nan's right-hand neighbour (a Sonata); the green carries on behind it
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

// ---- Nan's home
const HX0 = -9.15, HX1 = 9.15, HZ0 = -3.05, HZ1 = 3.05, WT = 0.14, IH = 2.3, VAULT = 3.0;    // IH: walls inside (at the eaves); VAULT: the ridge inside
const P1 = 3.65, P2 = -0.65;            // kitchen | lounge, hall | kitchen
const DECK = { x0: P1, x1: 11.35, z0: -5.25, z1: HZ1, endX: HX1 };      // the decking: along the back of the lounge and round its end
const DSTEP = { x0: 11.35, x1: 12.25, z0: -0.8, z1: 0.8 };                // steps down off the deck to the side path
const FSTEP = { x0: -2.45, x1: -0.75, land: 4.0, z1: 4.9 };               // the front landing (HZ1 .. land) and steps (land .. z1)
const LAWN = { x0: -13.4, x1: 24.6, z0: -19.9, z1: -13.2 };               // THE GREEN: the verge behind the back hedge, clear grass for Fling the Family
const PLOT = { x0: -14.4, x1: 14.3, gate0: 12.4, gate1: 13.6 };
const GAR = { x0: -13.85, xm: -10.55, x1: -6.5, z0: -11.65, z1: -6.45 };          // Nan's two garages (doors on the z1 side, facing the house)           // Nan's plot's sides (hedges), the back gate in the hedge
const PAINT = { lounge: 0xd8d6d2, kitchen: 0xbdb8b0, hall: 0xc9c2b7, bed: 0xc9c2b7, bed2: 0xd8d6d2, study: 0xd8d6d2, bath: 0xe9e4da, util: 0xd8d6d2 };

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
  const frontPaint = byX([[-7.35, PAINT.bath], [-5.65, PAINT.bed], [-2.45, PAINT.bed2], [P2, PAINT.hall], [P1, PAINT.kitchen], [99, PAINT.lounge]]);
  const backPaint = byX([[-5.65, PAINT.bed], [-4.25, PAINT.bath], [-2.45, PAINT.util], [P2, PAINT.study], [P1, PAINT.kitchen], [99, PAINT.lounge]]);
  const BRK = [-7.35, -5.65, -4.25, -2.45, P2, P1];
  const Y = (y) => FL + y;
  // the openings (absolute heights)
  const WIN = {
    front: [[-8.6, -7.95, Y(1.45), Y(2.05)], [-4.7, -3.3, Y(0.9), Y(2.05)], [-2.15, -1.05, FL, Y(2.08)], [1.0, 3.2, Y(0.85), Y(2.1)], [7.25, 8.65, Y(0.85), Y(2.1)]],
    back: [[-8.3, -6.7, Y(0.9), Y(2.05)], [-5.3, -4.65, Y(1.45), Y(2.05)], [-3.4, -2.55, FL, Y(2.05)], [-2.0, -1.05, Y(1.0), Y(2.05)], [0.8, 1.95, Y(1.05), Y(2.1)], [5.1, 6.7, FL, Y(2.1)], [7.5, 8.55, Y(0.85), Y(2.1)]],
    end: [[-2.3, 2.3, Y(0.0), EAVE - 0.0]],
  };
  extWall('x', HZ1, HX0, HX1, 1, WIN.front, frontPaint, BRK);
  extWall('x', HZ0, HX0, HX1, -1, WIN.back, backPaint, BRK);
  extWall('z', HX0, HZ0 + WT, HZ1 - WT, -1, [], (z) => z > 1.0 ? PAINT.bath : PAINT.bed);
  extWall('z', HX1, HZ0 + WT, HZ1 - WT, 1, WIN.end, () => PAINT.lounge);
  // glazing
  glaze('x', HZ1, -8.6, -7.95, Y(1.45), Y(2.05), 1, { panes: 1, transom: false, frosted: true });
  glaze('x', HZ1, -4.7, -3.3, Y(0.9), Y(2.05), 1, { panes: 2 });
  glaze('x', HZ1, 1.0, 3.2, Y(0.85), Y(2.1), 1, { panes: 3 });
  glaze('x', HZ1, 7.25, 8.65, Y(0.85), Y(2.1), 1, { panes: 2 });
  glaze('x', HZ0, -8.3, -6.7, Y(0.9), Y(2.05), -1, { panes: 2 });
  glaze('x', HZ0, -5.3, -4.65, Y(1.45), Y(2.05), -1, { panes: 1, transom: false, frosted: true });
  glaze('x', HZ0, -2.0, -1.05, Y(1.0), Y(2.05), -1, { panes: 1 });
  glaze('x', HZ0, 0.8, 1.95, Y(1.05), Y(2.1), -1, { panes: 2 });
  glaze('x', HZ0, 7.5, 8.55, Y(0.85), Y(2.1), -1, { panes: 2 });
  // THE CATHEDRAL WINDOW: floor-to-eaves glazing across the lounge end, triangular panes up into the gable
  { const x = HX1 - 0.05, y0 = FL, y1 = EAVE, apex = Y(VAULT) - 0.02;
    glassQuad([x, y0, 2.3], [x, y0, -2.3], [x, y1, -2.3], [x, y1, 2.3]);
    glassTri([x, y1, 2.3], [x, y1, -2.3], [x, apex, 0]);
    for (let i = 0; i <= 4; i++) k.box(0.1, y1 - y0, i % 4 ? 0.06 : 0.08, x, (y0 + y1) / 2, -2.3 + i * 1.15, C.WHITE);
    k.box(0.1, 0.08, 4.68, x, y0 + 0.04, 0, C.WHITE); k.box(0.1, 0.08, 4.68, x, y1 - 0.02, 0, C.WHITE); k.box(0.1, 0.05, 4.6, x, Y(2.0), 0, C.WHITE);
    for (const s of [-1, 1]) { const len = Math.hypot(2.3, apex - y1); k.box(0.1, 0.07, len, x, (y1 + apex) / 2, s * 1.15, C.WHITE, { rot: [s * Math.atan2(apex - y1, 2.3), 0, 0] }); }
    k.box(0.1, apex - y1, 0.06, x, (y1 + apex) / 2, 0, C.WHITE);
    // the siding gable round the glass triangle (outside), and inside the corners up to the vault
    const xo = HX1 + 0.0125, top = EAVE + HZ1 * PITCH;
    const quad = (a, b, c, d) => { W.stri(a, b, c, 'sidB'); W.stri(a, c, d, 'sidB'); };
    quad([xo, EAVE, HZ1], [xo, EAVE, 2.3], [xo, apex, 0], [xo, top, 0]);
    quad([xo, EAVE, -2.3], [xo, EAVE, -HZ1], [xo, top, 0], [xo, apex, 0]);
  }
  // the roof: concrete interlocking tiles, charcoal; hipped over the bedroom end, the gable over the lounge
  const RF = roofGeo(W, 'roof', HX0, HX1, HZ0, HZ1, { hipL: true, hipR: false });
  { const b = new Bag(); roofTrim(b, RF); k.parts.push(...b.trim); }
  // the porch: a little gable over the front door on slim anthracite posts
  porchRoof(W, (FSTEP.x0 + FSTEP.x1) / 2, 1.4, FSTEP.land + 0.05, 1.7, EAVE - 0.12, 0.8, { posts: true, sidKey: 'sidB' });
  for (const x of [-2.4, -0.8]) k.blockers.push({ x0: x - 0.06, x1: x + 0.06, z0: FSTEP.land - 0.06, z1: FSTEP.land + 0.06, y1: 2.9 });
  // corner boards, gutters' downpipes, a trim line over the grey band, the skirting's top
  for (const x of [HX0, HX1]) for (const z of [HZ0, HZ1]) k.box(0.12, EAVE - 0.7, 0.12, x + Math.sign(x) * 0.01, 0.7 + (EAVE - 0.7) / 2, z + Math.sign(z) * 0.01, C.WHITE);
  for (const [x, z] of [[HX0 + 0.35, HZ1 + 0.1], [HX0 + 0.35, HZ0 - 0.1], [HX1 - 0.4, HZ1 + 0.1], [3.4, HZ0 - 0.1]]) k.cyl(0.04, 0.04, EAVE - 0.25, x, (EAVE - 0.25) / 2, z, C.ANTH, 6);
  for (const z of [HZ0 - 0.03, HZ1 + 0.03]) k.box(HX1 - HX0 + 0.06, 0.04, 0.03, 0, 0.71, z, C.WHITE);
  for (const x of [HX0 - 0.03, HX1 + 0.03]) k.box(0.03, 0.04, HZ1 - HZ0 + 0.06, x, 0.71, 0, C.WHITE);
  // wall lanterns (anthracite, warm)
  const lantern = (x, y, z, nx, nz) => { k.box(0.13 + Math.abs(nz) * 0.0, 0.22, 0.13, x + nx * 0.08, y, z + nz * 0.08, 0x1e1f21); k.box(0.09, 0.14, 0.09, x + nx * 0.085, y - 0.01, z + nz * 0.085, 0xffe0a0); k.lamp(x + nx * 0.09, y - 0.01, z + nz * 0.09, 0xffe2a8, 0.0, true); };
  lantern(-2.38, Y(1.9), HZ1, 0, 1); lantern(-0.82, Y(1.9), HZ1, 0, 1); lantern(4.0, Y(1.9), HZ0, 0, -1); lantern(HX1, Y(1.9), 2.75, 1, 0); lantern(HX1, Y(1.9), -2.75, 1, 0);
  // the front door: anthracite composite with a sandblasted glass strip, open into the hall; the house number
  const kFL = { box: (w, h, d, x, y, z, c, o) => k.box(w, h, d, x, y + FL, z, c, o) };      // (a door on the outside walls: heights from the floor)
  F.openDoor(kFL, -2.13, HZ1 - 0.16, false, -1, 1.02, { col: C.ANTH, lever: 0xc8ccd0 });
  k.box(0.045, 1.5, 0.16, -2.13, Y(1.15), HZ1 - 0.16 - 0.55, 0xdfe5e8);
  wreath(k, -2.1, Y(1.62), HZ1 - 0.7, 1, 0.16);
  k.label('17', 0.3, 0.16, [-2.85, Y(1.55), HZ1 + 0.03], [0, 0, 0], { bg: '#2b2d30', fg: '#ffffff', border: null, size: 80 });
  k.label("JOAN'S", 0.5, 0.12, [-2.85, Y(1.36), HZ1 + 0.03], [0, 0, 0], { bg: '#2b2d30', fg: '#6dcfcf', border: null, size: 60 });
  // the French doors out of the lounge onto the deck: glazed, both open, folded right back flat against the outside wall
  F.openDoor(kFL, 5.1, HZ0 - 0.05, true, -1, 0.8, { glazed: (a, b, c, d) => glassQuad(...[a, b, c, d].map(([x, y, z]) => [x, y + FL, z])) });
  F.openDoor(kFL, 6.7, HZ0 - 0.05, true, 1, 0.8, { glazed: (a, b, c, d) => glassQuad(...[a, b, c, d].map(([x, y, z]) => [x, y + FL, z])) });
  // the utility's back door: three little steps down to the slab path
  for (let i = 0; i < 3; i++) { const h = FL * (3 - i) / 4; R(-3.45, HZ0 - 0.3 * (i + 1), -2.5, HZ0 - 0.3 * i, h, h / 2, C.STEP, { block: true }); }
  // the front landing and three steps (pale), black handrails; a doormat
  { const { x0, x1, land, z1 } = FSTEP;
    R(x0, HZ1, x1, land, FL, FL / 2, C.STEP, { collide: true }); R(x0 - 0.02, land - 0.03, x1 + 0.02, land + 0.0, 0.03, FL - 0.015, 0xa9a7a1);
    for (let i = 0; i < 3; i++) { const za = land + i * 0.3, h = FL * (3 - i) / 4; R(x0, za, x1, za + 0.3, h, h / 2, C.STEP, { collide: true }); R(x0, za + 0.27, x1, za + 0.3, 0.012, h + 0.001, 0x9a9892); }
    for (const x of [x0 - 0.03, x1 + 0.03]) { k.box(0.04, 0.04, z1 - HZ1, x, Y(0.92), (HZ1 + z1) / 2 - 0.15, 0x1e1f21, { rot: [Math.atan2(FL * 0.75, z1 - land) * 0.5, 0, 0] });
      for (const z of [land - 0.1, z1 - 0.15]) { const top = z < land ? FL + 0.95 : 0.95; k.box(0.04, top, 0.04, x, top / 2, z, 0x1e1f21); }
      k.blockers.push({ x0: x - 0.05, x1: x + 0.05, z0: HZ1, z1, y1: FL + 0.95 }); }
    k.box(0.9, 0.012, 0.55, -1.6, FL + 0.006, HZ1 + 0.45, 0x4a4a48); note('WIPE YOUR FEET (MICHAEL, THAT MEANS YOU)', 0.8, 0.45, -1.6, FL + 0.014, HZ1 + 0.45, [-Math.PI / 2, 0, 0], '#4a4a48', '#f1f1ee', 36);
    for (const x of [x0 - 0.35, x1 + 0.35]) { k.cyl(0.2, 0.16, 0.42, x, 0.21, land + 0.5, 0x3a3c40, 12); k.cyl(0.02, 0.02, 0.5, x, 0.65, land + 0.5, 0x5a4030, 5); k.parts.push(part(new THREE.IcosahedronGeometry(0.26, 1), 0x2f5a26, [x, 1.0, land + 0.5])); k.blockers.push({ x0: x - 0.2, x1: x + 0.2, z0: land + 0.3, z1: land + 0.7, y1: 1.2 }); bulb(k, x + 0.1, 1.05, land + 0.7, 0xffd890, 0.015, 0.05); bulb(k, x - 0.12, 0.92, land + 0.66, 0xffd890, 0.015, 0.05); }
    k.spawns.push(new THREE.Vector3(x1 + 0.35, FL + 0.1, HZ1 + 0.2));
  }
  // Christmas lights along both eaves and the gable, icicle-white on the front
  lightString(k, [[RF.xa + 0.2, RF.ye - 0.18, RF.zb + 0.1], [RF.xb - 0.2, RF.ye - 0.18, RF.zb + 0.1]], { spacing: 0.2, sag: 0.05, colors: [0xeaf4ff, 0xeaf4ff, 0xffd890], halo: 0.07, wire: null });
  lightString(k, [[RF.xa + 0.2, RF.ye - 0.18, RF.za - 0.1], [RF.xb - 0.2, RF.ye - 0.18, RF.za - 0.1]], { spacing: 0.25, sag: 0.05, colors: MULTI, halo: 0.07, wire: null });
  lightString(k, [[RF.xb + 0.05, RF.ye - 0.05, RF.zb], [RF.xb + 0.05, RF.yr + 0.02, RF.zc], [RF.xb + 0.05, RF.ye - 0.05, RF.za]], { spacing: 0.2, sag: 0.0, colors: WARM, halo: 0.07, wire: null });

  // ======================================================== the deck: dark composite boards, clear glass balustrade
  { const { x0, x1, z0, endX } = DECK;
    T('deck', x0, z0, x1, HZ0, 0.04, FL - 0.02, 1); T('deck', endX, HZ0, x1, HZ1 + 0.3, 0.04, FL - 0.021, 1);
    R(x0, z0 - 0.02, x1, z0, FL - 0.04, (FL - 0.04) / 2, 0x4a4a4a); R(x1, z0, x1 + 0.02, HZ1 + 0.3, FL - 0.04, (FL - 0.04) / 2, 0x4a4a4a); R(endX, HZ1 + 0.3, x1, HZ1 + 0.32, FL - 0.04, (FL - 0.04) / 2, 0x4a4a4a);
    R(x0 - 0.02, z0, x0, HZ0, FL - 0.04, (FL - 0.04) / 2, 0x4a4a4a);
    k.colliders.push({ min: new THREE.Vector3(x0, 0, z0), max: new THREE.Vector3(x1, FL, HZ0) }, { min: new THREE.Vector3(endX, 0, HZ0), max: new THREE.Vector3(x1, FL, HZ1 + 0.3) });
    // the balustrade: clear glass panels, slim black posts and a top rail; a gap for the steps
    const runs = [['x', z0, x0, x1], ['z', x1, z0, DSTEP.z0], ['z', x1, DSTEP.z1, HZ1 + 0.3], ['x', HZ1 + 0.3, endX, x1], ['z', x0, z0, HZ0]];
    for (const [ax, c, a0, a1] of runs) {
      const n = Math.max(1, Math.round((a1 - a0) / 1.1)), w = (a1 - a0) / n;
      for (let i = 0; i < n; i++) { const s0 = a0 + i * w + 0.03, s1 = a0 + (i + 1) * w - 0.03; ax === 'x' ? glassQuad([s0, FL + 0.06, c], [s1, FL + 0.06, c], [s1, FL + 0.98, c], [s0, FL + 0.98, c]) : glassQuad([c, FL + 0.06, s0], [c, FL + 0.06, s1], [c, FL + 0.98, s1], [c, FL + 0.98, s0]); }
      for (let i = 0; i <= n; i++) { const a = a0 + i * w; ax === 'x' ? k.box(0.04, 1.02, 0.04, a, FL + 0.51, c, 0x1e1f21) : k.box(0.04, 1.02, 0.04, c, FL + 0.51, a, 0x1e1f21); }
      ax === 'x' ? k.box(a1 - a0 + 0.04, 0.04, 0.05, (a0 + a1) / 2, FL + 1.02, c, 0x1e1f21) : k.box(0.05, 0.04, a1 - a0 + 0.04, c, FL + 1.02, (a0 + a1) / 2, 0x1e1f21);
      k.blockers.push(ax === 'x' ? { x0: a0, x1: a1, z0: c - 0.04, z1: c + 0.04, y1: FL + 1.0 } : { x0: c - 0.04, x1: c + 0.04, z0: a0, z1: a1, y1: FL + 1.0 });
      lightString(k, [ax === 'x' ? [a0 + 0.05, FL + 1.0, c] : [c, FL + 1.0, a0 + 0.05], ax === 'x' ? [a1 - 0.05, FL + 1.0, c] : [c, FL + 1.0, a1 - 0.05]], { spacing: 0.18, sag: 0.05, colors: WARM, halo: 0.06, wire: null });
    }
    // the steps down to the green
    for (let i = 0; i < 3; i++) { const xa = DSTEP.x0 + i * 0.3, h = FL * (3 - i) / 4; T('deck', xa, DSTEP.z0, xa + 0.3, DSTEP.z1, h, h / 2, 1); k.colliders.push({ min: new THREE.Vector3(xa, 0, DSTEP.z0), max: new THREE.Vector3(xa + 0.3, h, DSTEP.z1) }); }
    for (const z of [DSTEP.z0, DSTEP.z1]) k.blockers.push({ x0: DSTEP.x0, x1: DSTEP.x1, z0: z - 0.03, z1: z + 0.03, y1: FL });
    // on the deck: a charcoal rattan corner sofa (covered for winter), two pots with clipped bay balls, a lit reindeer
    { const x = 9.9, z = -4.55; k.box(1.9, 0.62, 0.75, x - 0.4, FL + 0.31, z, 0x3a3c40, { block: true }); k.box(0.75, 0.62, 1.5, x + 0.9, FL + 0.31, z + 0.75, 0x3a3c40, { block: true });
      k.box(1.95, 0.06, 0.8, x - 0.4, FL + 0.64, z, 0x5a5e62); k.box(0.8, 0.06, 1.55, x + 0.9, FL + 0.64, z + 0.75, 0x5a5e62);
      note('SANDY BAY SOCIAL: SUMMER BBQS AT JOAN\'S (BRING YOUR OWN CHAIR)', 0.5, 0.22, x - 0.4, FL + 0.68, z, [-Math.PI / 2, 0, 0], '#5ec8c8', '#ffffff', 34);
      k.box(0.7, 0.4, 0.7, 8.3, FL + 0.2, z + 0.1, 0x2e3033, { block: true, collide: true }); k.spawns.push(new THREE.Vector3(8.3, FL + 0.5, z + 0.1)); }
    for (const [x, z] of [[11.0, -1.3], [11.0, 1.3], [5.0, -4.85]]) { k.cyl(0.24, 0.2, 0.5, x, FL + 0.25, z, 0x3a3c40, 12); k.cyl(0.02, 0.02, 0.5, x, FL + 0.75, z, 0x5a4030, 5); k.parts.push(part(new THREE.IcosahedronGeometry(0.3, 1), 0x2f5a26, [x, FL + 1.15, z])); k.blockers.push({ x0: x - 0.24, x1: x + 0.24, z0: z - 0.24, z1: z + 0.24, y1: FL + 1.4 }); }
    reindeer(k, 10.6, 2.4, -2.2, 0.8, FL);
  }

  // ======================================================== the plot: front lawn, path, hardstanding, Nan's car, the back
  T('slab', FSTEP.x0, FSTEP.z1, FSTEP.x1, L.ROAD.z0 - 0.15, 0.012, 0.006, 1.2);                          // the path to the road
  T('slab', HX0 - 1.0, HZ1 + 0.4, FSTEP.x0, HZ1 + 1.4, 0.012, 0.006, 1.2);                               // ...and along to the hardstanding
  T('paving', -13.2, -2.6, HX0 - 1.0, L.ROAD.z0 - 0.15, 0.012, 0.007, 1);                                 // Nan's drive off Wave Road...
  T('paving', -13.9, GAR.z1, HX0 - 0.2, -2.6, 0.012, 0.007, 1);                                            // ...carried on down the side of the house...
  T('paving', HX0 - 0.2, GAR.z1, GAR.x1, HZ0 - 1.25, 0.012, 0.007, 1);                                      // ...and widened in front of both garages
  T('slab', HX1 - 0.2, HZ1 + 0.5, PLOT.gate1, HZ1 + 1.5, 0.012, 0.006, 1.2);
  T('slab', DSTEP.x1, DSTEP.z0, PLOT.gate1, DSTEP.z1, 0.012, 0.006, 1.2);                                  // off the deck steps
  T('slab', PLOT.gate0, L.HEDGE.z0 - 0.1, PLOT.gate1, DSTEP.z0, 0.012, 0.006, 1.2);                         // the side path, round to the back gate
  T('slab', HX0, HZ0 - 1.2, P1 - 0.2, HZ0 - 0.2, 0.012, 0.006, 1.2);                                      // round the back
  // Nan's car: a silver Nissan Micra on the drive in front of the garages, nose toward the road
  { const cx = -12.05, cz = -4.35; nissan(scene, k, cx, cz, 0, { plate: 'JOAN 1' });
    note('NAN\'S CAR (SHE ONLY DRIVES TO THE CLUBHOUSE. IT\'S 60 METRES.)', 0.6, 0.14, cx - 0.86, 1.0, cz - 0.4, -Math.PI / 2, '#ffffff', '#2b2d30', 34); }
  // the front lawn: a light-up reindeer pair, Santa's sign, little solar lights along the path
  reindeer(k, 3.6, 5.2, 0.6, 0.85); reindeer(k, 5.0, 5.4, -0.3, 0.7);
  k.blockers.push({ x0: 3.0, x1: 5.6, z0: 4.7, z1: 5.9, y1: 1.2 });
  { k.box(0.05, 1.0, 0.05, 6.6, 0.5, 5.6, 0x5a4030); sign('SANTA PLEASE STOP HERE (NAN HAS BEEN VERY GOOD. MOSTLY.)', 0.8, 0.4, 6.6, 1.05, 5.63, 0.0, { bg: '#c8102e', fg: '#fff', border: '#ffd84a', size: 44 }); }
  for (let z = FSTEP.z1 + 0.3; z < L.ROAD.z0 - 0.3; z += 0.7) for (const x of [FSTEP.x0 - 0.15, FSTEP.x1 + 0.15]) { k.cyl(0.012, 0.012, 0.3, x, 0.15, z, 0x2a2a2a, 5); k.cyl(0.04, 0.035, 0.05, x, 0.32, z, 0x2a2a2a, 8); bulb(k, x, 0.3, z, 0xfff2d0, 0.022, 0.12); }
  // the back garden: neat, a slab path, the washing line, TWO SHEDS in the back left-hand corner; hedges round it, the
  // long back hedge with a little gate at the side path (no home behind Nan: just the hedge, then the green)
  const hedge = (x0, z0, x1, z1, h = 1.1) => { T('hedge', x0, z0, x1, z1, h, h / 2, 1); k.blockers.push({ x0, x1, z0, z1, y1: h }); };
  hedge(PLOT.x0 + 0.4, L.HEDGE.z0, PLOT.gate0, L.HEDGE.z1); hedge(PLOT.gate1, L.HEDGE.z0, L.CLUB.x0 - 0.3, L.HEDGE.z1);
  hedge(L.BOUNDS.x0, L.HEDGE_NEXT.z0, PLOT.x0, L.HEDGE_NEXT.z1);                                                       // her left-hand neighbour's back hedge
  hedge(PLOT.x0, L.PEBBLE.z1 + 0.15, PLOT.x0 + 0.4, -2.6, 0.95); hedge(PLOT.x1 - 0.35, L.HEDGE.z1, PLOT.x1, -3.3, 0.95);     // down each side of her garden (the left one on along the green's end)
  { const gx = (PLOT.gate0 + PLOT.gate1) / 2, gz = (L.HEDGE.z0 + L.HEDGE.z1) / 2;                                   // the gate: two posts, a slatted grey gate swung open
    for (const x of [PLOT.gate0 + 0.05, PLOT.gate1 - 0.05]) k.box(0.1, 1.15, 0.1, x, 0.575, gz, 0x4a4c50, { block: true });
    for (let i = 0; i < 7; i++) k.box(0.13, 0.95, 0.03, PLOT.gate1 - 0.12, 0.55, gz - 0.12 - i * 0.15, 0x6a6c70);
    for (const y of [0.25, 0.85]) k.box(0.05, 0.07, 1.05, PLOT.gate1 - 0.1, y, gz - 0.6, 0x55575b); void gx;
    k.blockers.push({ x0: PLOT.gate1 - 0.16, x1: PLOT.gate1 - 0.06, z0: gz - 1.15, z1: gz - 0.05, y1: 1.0 }); }
  // TWO GARAGES in the back left-hand corner, side by side, their up-and-over doors facing the house and the drive:
  // pale concrete-panel walls, an apex roof of grey sheets with the gable to the front, white ribbed doors, a little
  // side window; the left one a single, the right one a bit wider. The gas bottles' cover beside them.
  { const garage = (x0, x1, z0, z1, { eh = 2.2, rise = 0.55, door = 2.3 } = {}) => {
      const xm = (x0 + x1) / 2, w = x1 - x0, d = z1 - z0, WALL = 0xd9d6cf, PANEL = 0xcfccc4, ROOFC = 0x6a6d70, DOOR = 0xf2f2ee;
      R(x0, z0, x1, z1, eh, eh / 2, WALL, { block: true });
      for (let z = z0 + 0.9; z < z1 - 0.1; z += 0.9) for (const x of [x0 - 0.005, x1 + 0.005]) k.box(0.012, eh - 0.06, 0.02, x, eh / 2, z, PANEL);      // the panel joints down the sides
      for (const zf of [z0, z1]) { const g = new THREE.BufferGeometry(), zz = zf === z1 ? zf + 0.001 : zf - 0.001;
        g.setAttribute('position', new THREE.Float32BufferAttribute(zf === z1 ? [x0, eh, zz, x1, eh, zz, xm, eh + rise, zz] : [x1, eh, zz, x0, eh, zz, xm, eh + rise, zz], 3)); g.computeVertexNormals(); k.parts.push(part(g, WALL)); }
      const half = w / 2 + 0.12, slope = Math.atan2(rise, w / 2), len = half / Math.cos(slope);
      for (const s2 of [-1, 1]) { k.box(len, 0.05, d + 0.3, xm + s2 * (len / 2) * Math.cos(slope), eh + rise / 2 + 0.035, (z0 + z1) / 2, ROOFC, { rot: [0, 0, -s2 * slope] });
        for (let i = 1; i < 6; i++) k.box(0.02, 0.055, d + 0.3, xm + s2 * (len * i / 6) * Math.cos(slope), eh + rise * (1 - i / 6) + 0.05, (z0 + z1) / 2, 0x5c5f62, { rot: [0, 0, -s2 * slope] }); }      // the sheets' ribs
      k.box(w + 0.05, 0.12, 0.06, xm, eh - 0.06, z1 + 0.03, 0xf0efea);                                                      // the fascia over the door
      const dw = Math.min(door, w - 0.4); k.box(dw, 2.0, 0.05, xm, 1.0, z1 + 0.02, DOOR);                                    // the up-and-over door...
      for (let y = 0.15; y < 2.0; y += 0.13) k.box(dw - 0.04, 0.025, 0.06, xm, y, z1 + 0.035, 0xdedcd6);                     // ...ribbed...
      k.box(0.16, 0.06, 0.04, xm, 0.95, z1 + 0.07, 0x9a9ea2); k.box(0.04, 0.04, 0.03, xm, 0.95, z1 + 0.09, 0x2a2c2e);         // ...handle and lock
      for (const x of [xm - dw / 2 - 0.04, xm + dw / 2 + 0.04]) k.box(0.06, 2.05, 0.06, x, 1.025, z1 + 0.02, 0xe8e6e0);
      k.box(0.05, 0.55, 0.85, x1 + 0.01, 1.45, (z0 + z1) / 2 + 0.6, 0xf2f2ee); k.box(0.055, 0.45, 0.75, x1 + 0.012, 1.45, (z0 + z1) / 2 + 0.6, 0x7f97a8);   // a side window
      R(x0 - 0.05, z1, x1 + 0.05, z1 + 0.15, 0.04, 0.02, 0xbab8b2);                                                         // the threshold
    };
    garage(GAR.x0, GAR.xm - 0.1, GAR.z0, GAR.z1, { door: 2.3 });
    garage(GAR.xm + 0.1, GAR.x1, GAR.z0, GAR.z1, { door: 2.7, rise: 0.62 });
    note("NAN'S GARAGE: CHRISTMAS DECS, GRANDAD'S TOOLS, 40 YEARS OF BISCUIT TINS. TOUCH NOTHING.", 0.62, 0.16, (GAR.x0 + GAR.xm) / 2, 1.55, GAR.z1 + 0.07, 0, '#fffbe8', '#222', 30);
    R(GAR.x1 + 0.3, GAR.z0 + 0.1, GAR.x1 + 1.2, GAR.z0 + 0.7, 1.05, 0.525, 0x5a5c60, { block: true }); }
  { const x = 0.5, z = -6.0; k.cyl(0.05, 0.05, 1.8, x, 0.9, z, 0xc8ccd0, 8); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.3; k.box(1.3, 0.025, 0.025, x + Math.cos(a) * 0.65, 1.75, z + Math.sin(a) * 0.65, 0xc8ccd0, { rot: [0, -a, 0] }); } k.blockers.push({ x0: x - 0.1, x1: x + 0.1, z0: z - 0.1, z1: z + 0.1, y1: 1.8 }); }
  // a few neat round bushes and a cordyline or two along the plot's edges (Canvey's palm trees)
  const cordyline = (x, z, h = 1.6) => { k.cyl(0.07, 0.1, h, x, h / 2, z, 0x6a5440, 6); for (let i = 0; i < 16; i++) { const a = i * 2.4, e = 0.2 + (i % 4) * 0.35; const g = new THREE.ConeGeometry(0.035, 0.75, 3); g.translate(0, 0.37, 0); g.rotateZ(e); g.rotateY(a); k.parts.push(part(g, i % 2 ? 0x4a6a2a : 0x5a7a34, [x, h, z])); } k.blockers.push({ x0: x - 0.15, x1: x + 0.15, z0: z - 0.15, z1: z + 0.15, y1: h + 0.5 }); };
  cordyline(-9.8, 4.2); cordyline(9.9, 4.6, 1.9); cordyline(22.0, 6.6, 2.1); cordyline(-15.0, 4.5, 1.7);
  for (const [x, z, r] of [[-8.2, 3.6, 0.35], [8.7, 3.7, 0.35], [-4.5, -3.7, 0.3], [1.5, -3.6, 0.3]]) { k.parts.push(part(new THREE.IcosahedronGeometry(r, 1), 0x3a6a2a, [x, r * 0.8, z], [0, 0, 0], [1.2, 0.85, 1.2])); k.blockers.push({ x0: x - r, x1: x + r, z0: z - r, z1: z + r, y1: r * 1.5 }); }
  // THE GREEN behind Nan's hedge: clear grass along Pebble Road, a bench at its far end, a tree, the green's own sign
  { const bx = LAWN.x1 + 0.5, bz = -15.0; for (const s of [-1, 1]) k.box(0.5, 0.45, 0.06, bx, 0.23, bz + s * 0.8, 0x1e1f21); for (let i = 0; i < 4; i++) k.box(0.1, 0.03, 1.7, bx - 0.15 + i * 0.12, 0.46, bz, 0x2e2f31);
    k.blockers.push({ x0: bx - 0.3, x1: bx + 0.3, z0: bz - 0.85, z1: bz + 0.85, y1: 0.9 }); k.seats.push({ x: bx, z: bz - 0.4, yaw: -Math.PI / 2, h: 0.47 }, { x: bx, z: bz + 0.4, yaw: -Math.PI / 2, h: 0.47 });
    { const sx = PLOT.gate1 + 1.4, sz = L.HEDGE.z0 - 0.35, tex = TX.parkSignTex(['The Green', 'NO BALL GAMES. (FAMILY FLINGING: ASK JOAN.)'], { bg: '#4a4e55' });   // just through the gate
      for (const d of [-1, 1]) k.label('green', 1.2, 0.4, [sx, 1.0, sz + d * 0.03], [0, d > 0 ? 0 : Math.PI, 0], { tex });
      for (const x of [sx - 0.45, sx + 0.45]) k.box(0.05, 1.0, 0.05, x, 0.5, sz, 0x26282a); k.blockers.push({ x0: sx - 0.6, x1: sx + 0.6, z0: sz - 0.1, z1: sz + 0.1, y1: 1.2 }); }
    const tx = LAWN.x1 + 1.6, tz = L.HEDGE.z0 - 1.4;
    k.cyl(0.12, 0.18, 2.4, tx, 1.2, tz, 0x7a6a5a, 7); k.parts.push(part(new THREE.IcosahedronGeometry(1.4, 1), 0x4a6a32, [tx, 3.2, tz], [0, 0, 0], [1, 1.1, 1])); k.blockers.push({ x0: tx - 0.2, x1: tx + 0.2, z0: tz - 0.2, z1: tz + 0.2, y1: 3 }); }

  // ======================================================== INSIDE (built at floor level, lifted on to the floor)
  let hostSeat, quizSeats = [], dinnerSeats = [], STASH, TREE, DRINKS, KETTLE, TVINFO, flame = null, flameY = 0;
  const NAMES = ['NAN', 'KAREN', 'PAUL', 'TOMMY', 'CHARLI', 'LISA', 'MICHAEL', 'SOPHIE', 'JIMMY'];
  const TBL = { x: 1.9, z: 1.72, w: 2.2, d: 0.92, h: 0.76 };
  lift(FL, () => {
    const XI0 = HX0 + WT, XI1 = HX1 - WT, ZI0 = HZ0 + WT, ZI1 = HZ1 - WT;       // the inside faces
    // ---- floors: greige carpet (lounge, bedrooms), light-oak vinyl planks (kitchen, hall, study, utility, bathrooms)
    T('carpet', P1, ZI0, XI1, ZI1, 0.02, 0.0, 0.5);
    T('vinyl', P2, ZI0, P1, ZI1, 0.02, 0.0, 1.2); T('vinyl', -5.65, ZI0, P2, ZI1, 0.02, 0.0, 1.2);
    T('carpet', XI0, ZI0, -5.65, ZI1, 0.02, 0.0, 0.5); T('carpet', -5.65, 0.6, -2.45, ZI1, 0.021, 0.0, 0.5);
    T('marbleB', XI0, 1.0, -7.35, ZI1, 0.021, 0.0, 1);
    // ---- the walls inside: thin partitions (2.3 m, the vaulted rooms get a gable on top)
    const wall = (axis, c, a0, a1, holes, color, t = 0.1, h = IH) => {
      const seg = (s0, s1, y0, y1) => { if (s1 - s0 < 0.01 || y1 - y0 < 0.01) return; const len = s1 - s0, m = (s0 + s1) / 2, block = y0 < 0.3 && y1 > 1.5;
        axis === 'x' ? k.box(len, y1 - y0, t, m, (y0 + y1) / 2, c, color, { collide: true, block }) : k.box(t, y1 - y0, len, c, (y0 + y1) / 2, m, color, { collide: true, block }); };
      let a = a0; for (const [s0, s1, y1] of holes.slice().sort((p, q) => p[0] - q[0])) { seg(a, s0, 0, h); seg(s0, s1, y1 ?? 2.05, h); a = s1; } seg(a, a1, 0, h);
    };
    const skin = (axis, c, a0, a1, side, color, h = IH, y0 = 0) => axis === 'x' ? k.box(a1 - a0, h - y0, 0.006, (a0 + a1) / 2, y0 + (h - y0) / 2, c + side * 0.003, color) : k.box(0.006, h - y0, a1 - a0, c + side * 0.003, y0 + (h - y0) / 2, (a0 + a1) / 2, color);
    const gableTop = (x, color, t = 0.12) => { const s = new THREE.Shape(); s.moveTo(-2.95, IH); s.lineTo(2.95, IH); s.lineTo(0, VAULT + 0.04); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false }); g.translate(0, 0, -t / 2); g.rotateY(Math.PI / 2); k.parts.push(part(g, color, [x, 0, 0])); };
    // P1 (kitchen | lounge), glazed double doors toward the back
    wall('z', P1, ZI0, ZI1, [[-2.05, -0.45, 2.1]], PAINT.kitchen, 0.12); skin('z', P1 + 0.06, ZI0, -2.05, 1, PAINT.lounge); skin('z', P1 + 0.06, -0.45, ZI1, 1, PAINT.lounge); skin('z', P1 + 0.06, -2.05, -0.45, 1, PAINT.lounge, IH, 2.1);
    gableTop(P1, PAINT.lounge);
    // P2 (hall | kitchen), glazed double doors into the hall
    wall('z', P2, ZI0, ZI1, [[0.35, 1.95, 2.1]], PAINT.kitchen, 0.12); skin('z', P2 - 0.06, -0.6, 0.35, -1, PAINT.hall); skin('z', P2 - 0.06, 1.95, ZI1, -1, PAINT.hall); skin('z', P2 - 0.06, 0.35, 1.95, -1, PAINT.hall, IH, 2.1); skin('z', P2 - 0.06, ZI0, -0.6, -1, PAINT.study);
    gableTop(P2, PAINT.kitchen);
    // the bedroom wing: hall / study, the corridor, bedroom 2, utility, bathroom, the master + en-suite
    wall('z', -2.45, 0.6, ZI1, [], PAINT.hall); skin('z', -2.5, 0.6, ZI1, -1, PAINT.bed2);
    wall('z', -2.45, ZI0, -0.6, [], PAINT.study); skin('z', -2.5, ZI0, -0.6, -1, PAINT.util);
    wall('x', -0.6, -2.45, P2, [[-1.85, -0.8]], PAINT.hall); skin('x', -0.65, -2.45, -1.85, -1, PAINT.study); skin('x', -0.65, -0.8, P2, -1, PAINT.study); skin('x', -0.65, -1.85, -0.8, -1, PAINT.study, IH, 2.05);
    wall('x', 0.6, -5.65, -2.45, [[-3.6, -2.55]], PAINT.hall); skin('x', 0.65, -5.65, -3.6, 1, PAINT.bed2); skin('x', 0.65, -2.55, -2.45, 1, PAINT.bed2); skin('x', 0.65, -3.6, -2.55, 1, PAINT.bed2, IH, 2.05);
    wall('x', -0.6, -5.65, -2.45, [[-5.5, -4.45], [-3.55, -2.5]], PAINT.hall);
    wall('z', -4.25, ZI0, -0.6, [], PAINT.util); skin('z', -4.3, ZI0, -0.65, -1, PAINT.bath);
    wall('z', -5.65, ZI0, ZI1, [[-0.55, 0.55]], PAINT.bed); skin('z', -5.6, -0.6, 0.6, 1, PAINT.hall, IH, 2.05);
    wall('x', 1.0, XI0, -7.35, [], PAINT.bed); wall('z', -7.35, 1.0, ZI1, [[1.4, 2.45]], PAINT.bed);
    // tiles in the bathrooms (beige marble effect), the bath end and the en-suite
    T('marbleB', -5.6, ZI0, -5.59, -0.65, IH, IH / 2, 1); T('marbleB', -5.59, ZI0 + 0.0, -4.3, ZI0 + 0.01, IH, IH / 2, 1); T('marbleB', -4.31, ZI0, -4.3, -0.65, IH, IH / 2, 1);
    T('marbleB', XI0, ZI1 - 0.01, -7.4, ZI1, IH, IH / 2, 1); T('marbleB', XI0, 1.05, XI0 + 0.01, ZI1, IH, IH / 2, 1); T('marbleB', XI0, 1.05, -7.4, 1.06, IH, IH / 2, 1); T('marbleB', -7.41, 1.05, -7.4, 1.4, IH, IH / 2, 1); T('marbleB', -7.41, 2.45, -7.4, ZI1, IH, IH / 2, 1); T('marbleB', -7.41, 1.4, -7.4, 2.45, IH - 2.05, (IH + 2.05) / 2, 1);      // (not across the en-suite's doorway)
    // ---- ceilings: flat over the bedroom wing; vaulted (white tongue and groove) over the kitchen and lounge, an oak beam
    { const m = new THREE.Mesh(new THREE.PlaneGeometry(P2 - XI0, ZI1 - ZI0), new THREE.MeshLambertMaterial({ color: 0xf3f0e8, emissive: 0x2a2824 })); m.rotation.x = Math.PI / 2; m.position.set((XI0 + P2) / 2, IH, 0); scene.add(m); }
    for (const s of [-1, 1]) { const x0 = P2, x1 = XI1, za = s * 2.95, g = new THREE.BufferGeometry(), sl = Math.hypot(2.95, VAULT - IH);
      const pos = s < 0 ? [x0, IH, za, x1, IH, za, x1, VAULT, 0, x0, IH, za, x1, VAULT, 0, x0, VAULT, 0] : [x1, IH, za, x0, IH, za, x0, VAULT, 0, x1, IH, za, x0, VAULT, 0, x1, VAULT, 0];
      const uv = []; for (let i = 0; i < 6; i++) { const px = pos[i * 3], py = pos[i * 3 + 1]; uv.push(px, (py - IH) / (VAULT - IH) * sl); }
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
      W.geo('tng', g); }
    k.box(XI1 - P2, 0.22, 0.16, (P2 + XI1) / 2, VAULT - 0.08, 0, F.OAK);
    // skirting (white) round every room, a little coving line at the wing's ceiling
    const skirt = (axis, c, a0, a1, d) => axis === 'x' ? k.box(a1 - a0, 0.1, 0.018, (a0 + a1) / 2, 0.05, c + d * 0.009, 0xf6f6f4) : k.box(0.018, 0.1, a1 - a0, c + d * 0.009, 0.05, (a0 + a1) / 2, 0xf6f6f4);
    skirt('x', ZI1, P1 + 0.06, XI1, -1); skirt('x', ZI0, P1 + 0.06, 5.1, 1); skirt('x', ZI0, 6.7, XI1, 1); skirt('z', XI1, ZI0, -2.3, -1); skirt('z', XI1, 2.3, ZI1, -1); skirt('z', P1 + 0.06, ZI0, -2.05, 1); skirt('z', P1 + 0.06, -0.45, ZI1, 1);
    skirt('x', ZI1, P2 + 0.06, P1 - 0.06, -1); skirt('x', ZI0, P2 + 0.06, P1 - 0.06, 1); skirt('z', P1 - 0.06, ZI0, -2.05, -1); skirt('z', P1 - 0.06, -0.45, ZI1, -1); skirt('z', P2 + 0.06, ZI0, 0.35, 1); skirt('z', P2 + 0.06, 1.95, ZI1, 1);
    skirt('z', P2 - 0.06, -0.55, 0.35, -1); skirt('z', P2 - 0.06, 1.95, ZI1, -1); skirt('x', ZI1, -2.4, -2.05, -1); skirt('x', ZI1, -0.95, P2 - 0.06, -1); skirt('z', -2.4, 0.65, ZI1, 1);
    skirt('x', 0.55, -5.6, -3.6, -1); skirt('x', -0.55, -4.45, -3.55, 1); skirt('x', -0.55, -2.5, -1.85, 1); skirt('x', -0.55, -0.8, P2 - 0.06, 1);
    // ---- LED downlights everywhere, ceiling lights
    for (const [x, z] of [[-8.2, -1.6], [-6.6, -1.6], [-7.0, 1.8], [-8.2, 2.0], [-4.0, 1.8], [-3.3, 0.0], [-4.9, 0.0], [-1.55, 1.8], [-1.55, 0.2], [-1.55, -1.8], [-3.3, -1.8], [-5.0, -1.8]]) F.downlight(k, x, IH, z);
    for (const x of [0.2, 1.4, 2.6, 4.4, 5.7, 7.0, 8.3]) for (const s of [-1, 1]) { const z = s * 1.8, y = IH + (VAULT - IH) * (1 - 1.8 / 2.95); F.downlight(k, x, y, z); }
    k.light(6.4, 2.2, 0.0, 0xfff0dc, 3.0, 9); k.light(1.6, 2.2, 0.2, 0xfff4e6, 2.6, 8); k.light(-4.0, 2.0, 0.0, 0xfff0dc, 1.8, 7);

    // ================================================ THE LOUNGE (x 4.41 .. 9.01)
    // the feature wall: vertical charcoal slats behind the TV, the oak TV unit, the TV (dark: a paused film)
    T('slat', 4.9, ZI1 - 0.04, 7.0, ZI1, IH, IH / 2, 0.6);
    const TVX = 5.95, TVZ = ZI1 - 0.25;
    F.tvUnit(k, TVX, TVZ, Math.PI, 1.9);
    { const w = 1.45, h = 0.83, y = 1.22; k.box(w + 0.03, h + 0.03, 0.05, TVX, y, ZI1 - 0.12, 0x111214); k.box(0.3, 0.02, 0.18, TVX, 0.46, TVZ, 0x111214); k.box(0.05, 0.3, 0.05, TVX, 0.6, ZI1 - 0.16, 0x111214);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.03, h - 0.03), new THREE.MeshBasicMaterial({ map: TX.tvTex(), color: 0xb8b8b8 })); scr.position.set(TVX, y, ZI1 - 0.144); scr.rotation.y = Math.PI; scene.add(scr); scr.userData.tv = { w: w - 0.03, h: h - 0.03 };
      TVINFO = { x: TVX, y: y + FL, z: ZI1 - 0.144, ry: Math.PI, w: w - 0.03, h: h - 0.03 };
      k.box(0.9, 0.07, 0.09, TVX, 0.5, TVZ + 0.05, 0x1a1a1c);                // soundbar
      note("REMOTE: NAN'S. ASK. (DON'T.)", 0.24, 0.07, TVX + 0.6, 0.456, TVZ, [-Math.PI / 2, 0, Math.PI], '#fffbe8', '#c8102e', 34);
      for (let i = 0; i < 18; i++) { const t = (i / 17 - 0.5) * (w + 0.05); k.parts.push(part(new THREE.IcosahedronGeometry(0.028, 0), i % 2 ? 0xd8b84a : 0xc8102e, [TVX + t, y + h / 2 + 0.03 - Math.sin(i / 17 * Math.PI) * 0.02, ZI1 - 0.13])); }
      k.spawns.push(new THREE.Vector3(TVX - 0.7, 0.55, TVZ)); }
    // the electric fireplace: a cream freestanding surround on P1, the flames, a mantel full of cards, stockings
    { const FZ = 1.6, fx = P1 + 0.06, Wd = 1.25;
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
    // the seats: a 3-seater facing the TV, a 2-seater across the cathedral end, an armchair, a pouffe, a spare chair
    const SOFA = 0xcfc4b4, take = (n0) => { for (let i = n0; i < k.seats.length; i++) quizSeats.push({ ...k.seats[i] }); };
    const cushions = (x, z, ry, len, cols) => { const c = Math.cos(ry), s = Math.sin(ry); cols.forEach((col, i) => { const lx = (i / (cols.length - 1) - 0.5) * (len - 0.55), lz = 0.2; k.parts.push(part(new THREE.BoxGeometry(0.4, 0.38, 0.1), col, [x + lx * c + lz * s, 0.66, z - lx * s + lz * c], [-0.3, ry + (i % 2 ? 0.25 : -0.25), 0])); }); };
    let n0 = k.seats.length; sofa(k, { x: 7.35, z: -0.9, len: 2.05, depth: 0.92, ry: Math.PI, color: SOFA, seats: 3, pillows: 0 }); take(n0); cushions(7.35, -0.9, Math.PI, 2.05, [0x2f6d73, 0xc9a03a, 0x2b3a5a, 0x2f6d73]);
    n0 = k.seats.length; sofa(k, { x: 8.5, z: 0.95, len: 1.5, depth: 0.88, ry: Math.PI / 2, color: SOFA, seats: 2, pillows: 0, throwCol: 0x7a7e82 }); take(n0); cushions(8.5, 0.95, Math.PI / 2, 1.5, [0xc9a03a, 0x2b3a5a]);
    n0 = k.seats.length; sofa(k, { x: 7.65, z: 2.3, len: 0.95, depth: 0.86, ry: Math.atan2(7.0 - 7.65, 0.85 - 2.3) + Math.PI, color: 0xb8ae9e, seats: 1, pillows: 0 }); take(n0);
    { const px = 5.5, pz = 2.05; k.cyl(0.3, 0.3, 0.38, px, 0.19, pz, 0x2f6d73, 18); k.cyl(0.29, 0.29, 0.03, px, 0.39, pz, 0x3a7d83, 18); k.blockers.push({ x0: px - 0.3, x1: px + 0.3, z0: pz - 0.3, z1: pz + 0.3, y1: 0.4 });
      const s = { x: px, z: pz, yaw: Math.atan2(TVX - px, TVZ - pz), h: 0.4 }; k.seats.push(s); quizSeats.push({ ...s }); }
    n0 = k.seats.length; F.crossChair(k, 4.3, -2.5, Math.atan2(6.5 - 4.3, 0.5 + 2.5)); take(n0);
    // NAN'S ARMCHAIR by the fire (a throw over it), her side table with THE TIN, the lamp, her slippers
    const NAN = { x: 4.75, z: -0.3 }, NANYAW = Math.atan2(TVX - NAN.x, TVZ - NAN.z);
    { const seatN = k.seats.length; sofa(k, { x: NAN.x, z: NAN.z, len: 1.0, depth: 0.92, ry: NANYAW + Math.PI, color: 0x9c8f7e, seats: 1, pillows: 0 }); hostSeat = { ...k.seats[seatN] }; k.seats.splice(seatN, 1); k.seats.push(hostSeat);
      const fx = Math.sin(NANYAW), fz = Math.cos(NANYAW), bt = blanketTex();
      const m1 = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.64, 0.03), new THREE.MeshLambertMaterial({ map: bt })); m1.position.set(NAN.x - fx * 0.3, 0.72, NAN.z - fz * 0.3); m1.rotation.set(...yxz(-0.16, NANYAW)); scene.add(m1);
      const m2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.02), m1.material); m2.position.set(NAN.x + fx * 0.27, 0.36, NAN.z + fz * 0.27); m2.rotation.set(...yxz(0.15, NANYAW)); scene.add(m2);
      k.parts.push(part(new THREE.BoxGeometry(0.42, 0.38, 0.1), 0xc9a03a, [NAN.x - fx * 0.12, 0.65, NAN.z - fz * 0.12], [-0.3, NANYAW, 0]));
      for (const s of [-1, 1]) k.parts.push(part(sph(0.07, 8, 6), 0xe86aa0, [NAN.x + fx * 0.7 + Math.cos(NANYAW) * s * 0.09, 0.035, NAN.z + fz * 0.7 - Math.sin(NANYAW) * s * 0.09], [0, NANYAW, 0], [0.7, 0.45, 1.5]));
      sign("NAN'S CHAIR. RESERVED. FOREVER.", 0.42, 0.12, NAN.x - fx * 0.47, 1.12, NAN.z - fz * 0.47, NANYAW, { bg: '#ffd84a', fg: '#2b2d30', border: '#2b2d30', size: 40 }); }
    { const sx = 4.0, sz = 0.5, h = F.sideTable(k, sx, sz, { r: 0.24 });
      k.cyl(0.12, 0.12, 0.08, sx + 0.05, h + 0.04, sz - 0.04, 0x6a1aa0, 20); k.cyl(0.125, 0.125, 0.02, sx + 0.05, h + 0.085, sz - 0.04, 0xd4af37, 20);   // THE TIN
      k.label("NAN'S", 0.16, 0.06, [sx + 0.05, h + 0.097, sz - 0.04], [-Math.PI / 2, 0, 0], { bg: '#6a1aa0', fg: '#ffd84a', border: null, size: 60 });
      note("NAN'S CHOCOLATE. NOT YOURS. NOT EVEN AT CHRISTMAS.", 0.2, 0.11, sx - 0.05, h + 0.004, sz + 0.13, [-Math.PI / 2, 0, 0.3], '#ffffff', '#c8102e', 30, '#c8102e');
      k.cyl(0.04, 0.035, 0.09, sx - 0.12, h + 0.045, sz - 0.1, 0xf4f4f4, 10); k.cyl(0.034, 0.034, 0.005, sx - 0.12, h + 0.088, sz - 0.1, 0x8a5a3a, 10);
      for (let i = 0; i < 4; i++) k.box(0.05, 0.02, 0.03, sx + 0.12 - i * 0.04, h + 0.01, sz + 0.12, [0x8a1aa0, 0xffd84a, 0x2a8a4a, 0xc8102e][i], { rot: [0, i, 0] });
      STASH = { x: sx + 0.05, y: h + 0.1 + FL, z: sz - 0.04 }; }
    const CT = { x: 7.0, z: 0.85 };
    F.coffeeTable(k, CT.x, CT.z, 1.0, 0.56);
    k.cyl(0.13, 0.13, 0.12, CT.x - 0.25, 0.48, CT.z, 0x1e5aa8, 16); k.cyl(0.135, 0.135, 0.02, CT.x - 0.25, 0.55, CT.z, 0xd4af37, 16);
    k.label('CELEBRATIONS (THE BOUNTIES ARE LEFT)', 0.2, 0.08, [CT.x - 0.25, 0.565, CT.z], [-Math.PI / 2, 0, 0], { bg: '#1e5aa8', fg: '#ffd84a', border: null, size: 30 });
    k.box(0.24, 0.012, 0.32, CT.x + 0.25, 0.426, CT.z + 0.02, 0xc8102e, { rot: [0, 0.4, 0] }); note('RADIO TIMES XMAS (EVERYTHING CIRCLED BY NAN)', 0.22, 0.28, CT.x + 0.25, 0.434, CT.z + 0.02, [-Math.PI / 2, 0, 0.4], '#c8102e', '#ffffff', 26);
    T('rugL', 5.6, -0.3, 8.2, 2.05, 0.012, 0.007, 1);
    // THE TREE in the corner by the cathedral glass, presents round it
    TREE = { x: 8.35, z: -2.25 };
    xmasTree(k, TREE.x, TREE.z, { h: 2.3, R: 0.62, rnd });
    { const ps = presents(k, TREE.x - 0.1, TREE.z + 0.1, 9, rnd, 0.6); ps.slice(0, 3).forEach(([x, h, z]) => k.spawns.push(new THREE.Vector3(x, h + 0.06, z)));
      note('TO JIMMY. (ANOTHER JUMPER. SORRY.)', 0.18, 0.09, TREE.x - 0.75, 0.3, TREE.z + 0.35, -0.9, '#ffffff', '#1a3a6a', 30);
      note('TO CHARLI: THE ONE YOU "LITERALLY SAID"', 0.2, 0.09, TREE.x - 0.4, 0.28, TREE.z + 0.7, -0.3, '#ffffff', '#8a1aa0', 30); }
    // the drinks trolley (black and brass) by the doors to the kitchen
    { const x = 7.25, z = -2.55, h = 0.8; DRINKS = { x, y: h + 0.02 + FL, z };
      for (const y of [0.2, h]) k.box(0.7, 0.03, 0.42, x, y, z, 0x2a2a2c, { collide: y > 0.5 }); for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.box(0.025, h, 0.025, x + sx * 0.33, h / 2, z + sz * 0.19, 0xc9a24a);
      k.blockers.push({ x0: x - 0.36, x1: x + 0.36, z0: z - 0.22, z1: z + 0.22, y1: h + 0.05 });
      const bottle = (bx, bz, col, hh, r, neck) => { k.cyl(r, r, hh, bx, h + 0.015 + hh / 2, bz, col, 10); k.cyl(r * 0.4, r * 0.75, hh * 0.35, bx, h + 0.015 + hh + hh * 0.17, bz, col, 8); k.cyl(r * 0.42, r * 0.42, 0.03, bx, h + hh * 1.35 + 0.03, bz, neck, 8); };
      bottle(x - 0.25, z - 0.08, 0x4a2a14, 0.2, 0.045, 0x2a1a10); bottle(x - 0.13, z - 0.1, 0x1e4a2a, 0.24, 0.04, 0xd4af37); bottle(x - 0.02, z - 0.1, 0x1e4a2a, 0.24, 0.04, 0xd4af37); bottle(x + 0.1, z - 0.08, 0xf0d040, 0.18, 0.04, 0xc8102e);
      k.label("BAILEYS (NAN'S)", 0.09, 0.05, [x - 0.25, h + 0.12, z - 0.034], [0, 0, 0], { bg: '#e8dcc0', fg: '#3a1a0a', border: null, size: 40 });
      for (let i = 0; i < 4; i++) { const gx = x + 0.06 + i * 0.07, gz = z + 0.1; k.cyl(0.028, 0.02, 0.11, gx, h + 0.07, gz, 0xe8f6fa, 8); k.cyl(0.025, 0.018, 0.07, gx, h + 0.05, gz, 0xf8e860, 8); }
      for (let i = 0; i < 6; i++) k.cyl(0.033, 0.033, 0.12, x - 0.22 + (i % 3) * 0.075, 0.28, z + (i < 3 ? -0.08 : 0.08), [0xd8b030, 0xc8102e, 0x1e5aa8][i % 3], 8);
      note("THE BAR. BAILEYS IS NAN'S. PROSECCO IS SOPHIE'S. THE SNOWBALL IS A MYSTERY.", 0.36, 0.12, x, h + 0.02, z + 0.205, [-0.4, 0, 0], '#1a1a2a', '#ffd84a', 30);
      k.spawns.push(new THREE.Vector3(x + 0.15, h + 0.08, z)); }
    // curtains (grey, a mustard band) at the cathedral window and the French doors, a radiator, lamps, pendants
    F.curtains(k, 'z', XI1, -2.3, 2.3, -1, 2.27);
    F.curtains(k, 'x', ZI0, 5.1, 6.7, 1, 2.27);
    F.curtains(k, 'x', ZI1, 7.25, 8.65, -1, 2.27);
    F.radiator(k, 'x', ZI1, 7.95, 1.1, -1);
    pottedPlant(k, 8.68, 2.6, { s: 0.85, pot: 0x2e3033, rim: 0x3a3c40 });
    { const h = F.sideTable(k, 8.68, -0.15, { r: 0.21 }); F.tableLamp(k, 8.68, h, -0.15); k.spawns.push(new THREE.Vector3(8.62, h + 0.08, -0.05)); }
    F.drumPendant(k, CT.x, CT.z, VAULT - 0.1, 2.05, { r: 0.32 }); F.drumPendant(k, 5.3, 0.6, VAULT - 0.25, 2.05, { r: 0.22 });
    note('MIND THE LIGHT, JIMMY', 0.3, 0.08, CT.x, 1.86, CT.z + 0.33, 0, '#ffd84a', '#111', 40);
    // a big modern wall clock, prints, the family on the walls
    { const cx = 7.0, cy = 1.7; k.parts.push(part(cyl(0.29, 0.29, 0.03, 32), 0x1e1f21, [cx, cy, ZI0 + 0.015], [Math.PI / 2, 0, 0])); k.label('clock', 0.54, 0.54, [cx, cy, ZI0 + 0.033], [0, 0, 0], { tex: TX.clockTex() }); }
    fam('x', ZI0, 4.4, 1.6, 0.42, 0.55, 1, ['michael'], 'studio', 'Michael · 30 years of 1st class post');
    fam('x', ZI1, 4.3, 1.6, 0.36, 0.46, -1, ['joan'], 'beach', 'Nan · Sandy Bay summer BBQ');
    // cards on strings, a lit garland across the cathedral window, the wifi notes
    cardString(k, [P1 + 0.08, 2.1, -0.3], [P1 + 0.08, 2.1, 2.75], 'z', 1, rnd, 16); cardString(k, [5.2, 2.15, ZI1 - 0.03], [7.0, 2.15, ZI1 - 0.03], 'x', -1, rnd, 0);
    lightString(k, [[XI1 - 0.12, 2.2, -2.3], [XI1 - 0.12, 2.2, 2.3]], { spacing: 0.12, sag: 0.12, colors: WARM, halo: 0.06, wire: null });
    for (let i = 0; i < 34; i++) k.parts.push(part(new THREE.IcosahedronGeometry(0.05, 0), i % 2 ? 0x1e5a2a : 0x2a6a32, [XI1 - 0.12, 2.25 - Math.sin(i / 33 * Math.PI) * 0.12, -2.3 + i * 4.6 / 33]));
    note("JIMMY: THE WIFI IS FOR NAN'S IPAD, NOT YOUR 90GB GAME UPDATE.", 0.36, 0.13, P1 + 0.065, 1.45, 0.2, Math.PI / 2, '#e8ffe0', '#1a5a1a', 30);
    note('WIFI: SANDYBAY60PLUS. NO, NAN DOES NOT KNOW WHERE THE ROUTER IS.', 0.36, 0.14, P1 + 0.065, 1.45, 2.6, Math.PI / 2, '#e0f0ff', '#1a3a8a', 30);
    k.spawns.push(new THREE.Vector3(CT.x + 0.2, 0.5, CT.z - 0.1));

    // ================================================ THE KITCHEN-DINER (x -0.59 .. 4.29)
    // the back run: tower (oven + microwave), base units with the sink under the window, the hob and its angled hood,
    // the black American fridge-freezer; stone worktops, marble-effect splashback, open oak shelves
    const WT2 = 0.93;
    F.towerUnit(k, 'x', ZI0, P2 + 0.06, P2 + 0.66, 1);
    const HOB = 2.3;
    F.baseRun(k, 'x', ZI0, P2 + 0.66, 2.65, 1, { skip: [[HOB - 0.3, HOB + 0.3]] });
    const FR = F.americanFridge(k, 'x', ZI0, 2.68, 3.58, 1);
    k.box(0.6, 0.86, 0.02, HOB, 0.49, ZI0 + 0.59, 0x111214); k.box(0.5, 0.4, 0.022, HOB, 0.42, ZI0 + 0.592, 0x3a2412); k.box(0.5, 0.02, 0.04, HOB, 0.73, ZI0 + 0.61, F.CHROME); bulb(k, HOB, 0.42, ZI0 + 0.58, 0xffb060, 0.001, 0.45);   // the main oven (lit: the potatoes)
    F.hobAndHood(k, 'x', ZI0, HOB, 1, WT2);
    T('marbleK', P2 + 0.66, ZI0, 2.66, ZI0 + 0.012, 0.62, WT2 + 0.31, 1);
    k.box(1.0, 0.04, 0.32, 1.38, WT2 + 0.0, ZI0 + 0.25, 0x6a6c6e); k.box(0.86, 0.02, 0.26, 1.38, WT2 + 0.02, ZI0 + 0.25, 0x3a3c3e);   // the sink, a black tap
    k.cyl(0.015, 0.015, 0.3, 1.38, WT2 + 0.15, ZI0 + 0.08, 0x1a1b1d, 6); k.box(0.02, 0.02, 0.2, 1.38, WT2 + 0.3, ZI0 + 0.17, 0x1a1b1d);
    for (const y of [1.42, 1.82]) { k.box(0.68, 0.035, 0.26, 0.38, y, ZI0 + 0.13, F.OAK); }       // open oak shelves
    for (let i = 0; i < 4; i++) k.cyl(0.04, 0.035, 0.1, 0.14 + i * 0.15, 1.49, ZI0 + 0.13, [0xf4f4f4, 0x2f6d73, 0xc9a03a, 0xf4f4f4][i], 10);
    for (let i = 0; i < 4; i++) k.box(0.07, 0.16, 0.07, 0.14 + i * 0.15, 1.92, ZI0 + 0.12, [0xd8d0c0, 0xc8c0b0, 0xb8b0a0, 0x9a8f80][i]);
    // the kettle, the toaster, a bread bin, mugs, the cooking on the hob (sprouts, gravy)
    KETTLE = { x: 0.3, y: WT2 + 0.12 + FL, z: ZI0 + 0.3 };
    k.cyl(0.09, 0.11, 0.22, 0.3, WT2 + 0.11, ZI0 + 0.3, 0x2a2c2e, 14); k.box(0.04, 0.14, 0.1, 0.3, WT2 + 0.15, ZI0 + 0.43, 0x1a1a1a);
    note("KETTLE ON = 4 OF NAN'S FRIENDS ARRIVE WITHIN 4 MINUTES", 0.4, 0.16, 0.35, WT2 + 0.42, ZI0 + 0.015, 0, '#fffbe8', '#222', 30);
    k.box(0.3, 0.18, 0.18, 0.62, WT2 + 0.09, ZI0 + 0.2, 0x2a2c2e); for (let i = 0; i < 3; i++) k.cyl(0.04, 0.035, 0.1, 2.75 - 0.75 + i * 0.1 - 0.1, WT2 + 0.05, ZI0 + 0.5, [0xf4f4f4, 0xc8102e, 0x2f6d73][i], 10);
    k.cyl(0.11, 0.11, 0.14, HOB - 0.15, WT2 + 0.08, ZI0 + 0.17, 0xb0b4b8, 14); for (let i = 0; i < 8; i++) k.parts.push(part(sph(0.025, 6, 4), 0x4a8a2a, [HOB - 0.15 + Math.cos(i) * 0.05, WT2 + 0.15, ZI0 + 0.17 + Math.sin(i) * 0.05]));
    k.cyl(0.08, 0.08, 0.12, HOB + 0.15, WT2 + 0.07, ZI0 + 0.42, 0xb0b4b8, 12); k.cyl(0.075, 0.075, 0.01, HOB + 0.15, WT2 + 0.13, ZI0 + 0.42, 0x5a2a14, 12);
    note('GRAVY: KAREN. NO, LISA. NO, KAREN. (NAN IS DOING IT.)', 0.4, 0.13, HOB, 1.25, ZI0 + 0.012, 0, '#fffbe8', '#5a2a14', 30);
    k.spawns.push(new THREE.Vector3(0.6, WT2 + 0.1, ZI0 + 0.4), new THREE.Vector3(1.75, WT2 + 0.1, ZI0 + 0.45), new THREE.Vector3(2.5, WT2 + 0.1, ZI0 + 0.4));
    // LISA: the Asda bag for life on the worktop, and her note
    { const x = 2.45, z = -1.15, y = 0.93; k.box(0.32, 0.36, 0.2, x, y + 0.18, z, 0x5a9a2a); for (const s of [-1, 1]) k.box(0.02, 0.16, 0.02, x + s * 0.06, y + 0.42, z, 0x4a8a22);
      k.label('ASDA', 0.24, 0.1, [x, y + 0.2, z + 0.102], [0, 0, 0], { bg: '#5a9a2a', fg: '#ffffff', border: null, size: 70 });
      k.box(0.08, 0.08, 0.07, x - 0.05, y + 0.38, z, 0xffd84a); k.box(0.07, 0.12, 0.06, x + 0.06, y + 0.4, z, 0x8a1a1a);
      note("LISA'S STAFF DISCOUNT APPLIES TO NOTHING HERE", 0.3, 0.12, x, y + 0.005, z + 0.27, [-Math.PI / 2, 0, 0], '#fffbe8', '#2a6a1a', 30); }
    // the fridge: magnets and notes
    { const fz = FR.front;
      note('DINNER AT 2. NAN GETS HANGRY AT 2:01', 0.4, 0.2, 2.9, 1.6, fz, 0, '#fff3c0', '#c8102e', 40, '#c8102e');
      note("SOPHIE'S TRAIN BACK TO LONDON: 6:42 (DON'T MISS IT AGAIN)", 0.38, 0.15, 3.35, 1.35, fz, 0, '#e0f0ff', '#1a3a8a', 30);
      note("TOMMY: NO 'SYNERGY' AT THE DINNER TABLE", 0.34, 0.12, 2.9, 1.05, fz, 0, '#ffe6f0', '#6a1a4a', 30);
      note('PAUL: YOU CAN ARGUE WITH THE GRAVY AFTER DINNER. NOT BEFORE.', 0.38, 0.15, 3.35, 0.8, fz, 0, '#e8ffe0', '#1a5a1a', 30);
      note('CHARLI: YES, YOU LITERALLY SAID THAT', 0.34, 0.12, 2.9, 0.55, fz, 0, '#fff', '#8a1aa0', 30);
      for (const [x, y, c] of [[2.75, 1.75, 0xc8102e], [3.5, 1.5, 0x1e88e5], [2.75, 1.2, 0xffd84a], [3.5, 0.95, 0x4caf50], [2.75, 0.7, 0xff7a00]]) k.box(0.05, 0.05, 0.02, x, y, fz + 0.005, c);
      k.box(0.16, 0.11, 0.008, 3.45, 0.55, fz + 0.002, 0x7aa0c8); }
    // the island: charcoal and stone, oak ends, two grey bar stools, the turkey resting on it, the pudding
    const IX = 1.75, IZ = -0.95;
    F.island(k, IX, IZ, 2.0, 0.92, { over: 0.3 });
    F.barStool(k, 1.25, -0.15, Math.PI); F.barStool(k, 2.25, -0.15, Math.PI);
    { const y = 0.93, x = 1.2, z = -1.05; k.box(0.46, 0.06, 0.34, x, y + 0.03, z, 0x9aa0a8); k.box(0.42, 0.02, 0.3, x, y + 0.05, z, 0x6a3a14);
      k.parts.push(part(sph(0.16, 14, 10), 0xc0742c, [x, y + 0.15, z], [0, 0, 0], [1.3, 0.85, 1])); for (const s of [-1, 1]) { k.parts.push(part(sph(0.06, 8, 6), 0xb0642a, [x + 0.15, y + 0.12, z + s * 0.1], [0, 0, 0], [1.6, 0.8, 0.8])); k.parts.push(part(cyl(0.012, 0.012, 0.06, 5), 0xf4f0e6, [x + 0.25, y + 0.13, z + s * 0.1], [0, 0, Math.PI / 2])); }
      note('TURKEY IN: 9AM. TURKEY OUT: WHEN NAN SAYS.', 0.36, 0.12, x, y + 0.005, z + 0.3, [-Math.PI / 2, 0, 0], '#fff2e0', '#8a1a1a', 30);
      k.spawns.push(new THREE.Vector3(x, y + 0.32, z));
      const px = 1.95; k.cyl(0.13, 0.12, 0.02, px, y + 0.01, z, 0xf4f4f4, 14); k.parts.push(part(new THREE.SphereGeometry(0.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0x3a1a0e, [px, y + 0.02, z])); k.parts.push(part(new THREE.SphereGeometry(0.102, 12, 4, 0, Math.PI * 2, 0, 0.6), 0xf4f0e0, [px, y + 0.02, z])); for (let i = 0; i < 3; i++) k.parts.push(part(new THREE.IcosahedronGeometry(0.02, 0), i ? 0x1e5a2a : 0xc8102e, [px + (i - 1) * 0.02, y + 0.13, z]));
      k.spawns.push(new THREE.Vector3(px, y + 0.15, z), new THREE.Vector3(1.55, y + 0.08, -0.72), new THREE.Vector3(2.3, y + 0.08, -0.72)); }
    for (const x of [1.1, 1.75, 2.4]) F.globePendant(k, x, IZ, IH + (VAULT - IH) * (1 - 0.95 / 2.95), 1.75);
    // THE TABLE, set for nine: an oak table (extended), cross-back chairs, a red runner, crackers, crowns, plates, food
    { const { x: TX, z: TZ, w: TW, d: TD, h: TH } = TBL, s0 = k.seats.length;
      F.diningTable(k, TX, TZ, TW, TD, { h: TH });
      for (let i = 0; i < 4; i++) { const x = TX - TW / 2 + TW * (i + 0.5) / 4; F.crossChair(k, x, TZ - TD / 2 - 0.34, 0); F.crossChair(k, x, TZ + TD / 2 + 0.34, Math.PI); }
      F.crossChair(k, TX + TW / 2 + 0.36, TZ, -Math.PI / 2, { seat: 0xc9a03a });                                   // the head of the table (Nan's)
      const all = k.seats.slice(s0);
      // place order: the head (Nan) first, then round the table
      const order = [8, 0, 2, 4, 6, 7, 5, 3, 1];
      order.forEach((si, n) => { const s = all[si], fx = Math.sin(s.yaw), fz = Math.cos(s.yaw), px = s.x + fx * 0.46, pz = s.z + fz * 0.46;
        dinnerSeats.push({ x: s.x, z: s.z, yaw: s.yaw, h: s.h, name: NAMES[n] });
        k.cyl(0.13, 0.12, 0.015, px, TH + 0.008, pz, 0x4a4e55, 16); k.cyl(0.11, 0.1, 0.012, px, TH + 0.018, pz, 0xffffff, 16);
        k.parts.push(part(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 10, 1, true), [0xffd84a, 0xc8102e, 0x2a8a4a, 0x1e88e5, 0xe86aa0][n % 5], [px, TH + 0.05, pz]));
        const ry = Math.atan2(fx, fz), cx = Math.cos(ry), sx = Math.sin(ry);
        k.box(0.04, 0.04, 0.24, px + cx * 0.17, TH + 0.02, pz - sx * 0.17, n % 2 ? 0xc8102e : 0x1e5a2a, { rot: [0, ry, 0] });
        for (const e of [-1, 1]) k.box(0.03, 0.03, 0.04, px + cx * 0.17 + sx * e * 0.13, TH + 0.02, pz - sx * 0.17 + cx * e * 0.13, 0xd4af37, { rot: [0, ry, 0] });
        k.box(0.015, 0.004, 0.17, px - cx * 0.16, TH + 0.004, pz + sx * 0.16, 0xc8ccd0, { rot: [0, ry, 0] }); k.box(0.015, 0.004, 0.17, px + cx * 0.16, TH + 0.004, pz - sx * 0.16, 0xc8ccd0, { rot: [0, ry, 0] });
        k.cyl(0.03, 0.025, 0.11, px + fx * 0.16 + cx * 0.13, TH + 0.055, pz + fz * 0.16 - sx * 0.13, 0xd8eef6, 8);
        k.cyl(0.026, 0.022, 0.05, px + fx * 0.16 + cx * 0.13, TH + 0.03, pz + fz * 0.16 - sx * 0.13, n === 0 ? 0x6a3a1a : n % 3 ? 0xf0e0a0 : 0x8a1a2a, 8);
        k.label(NAMES[n] === 'JIMMY' ? 'JIMMY (TALL CHAIR)' : NAMES[n] === 'NAN' ? 'NAN (THE BOSS)' : NAMES[n], 0.16, 0.05, [px - fx * 0.15, TH + 0.035, pz - fz * 0.15], yxz(-0.5, ry + Math.PI), { bg: '#ffffff', fg: '#8a1a1a', border: '#d4af37', size: 40 }); });
      const y = TH + 0.004;
      k.cyl(0.16, 0.13, 0.05, TX - 0.75, y + 0.025, TZ, 0xf4f4f4, 16); for (let i = 0; i < 12; i++) k.parts.push(part(sph(0.03, 6, 4), 0xd89a3a, [TX - 0.75 + Math.cos(i * 2.4) * 0.09 * (i % 3 / 2 + 0.3), y + 0.07, TZ + Math.sin(i * 2.4) * 0.09 * (i % 3 / 2 + 0.3)], [0, 0, 0], [1.3, 0.9, 1]));
      k.cyl(0.12, 0.1, 0.05, TX - 0.35, y + 0.025, TZ + 0.1, 0xf4f4f4, 14); for (let i = 0; i < 14; i++) k.parts.push(part(sph(0.022, 6, 4), 0x4a8a2a, [TX - 0.35 + Math.cos(i * 2.1) * 0.07 * ((i % 4) / 3), y + 0.06, TZ + 0.1 + Math.sin(i * 2.1) * 0.07 * ((i % 4) / 3)]));
      R(TX + 0.45, TZ - 0.12, TX + 0.81, TZ + 0.12, 0.03, y + 0.015, 0xf4f4f4); for (let i = 0; i < 8; i++) { k.cyl(0.018, 0.018, 0.08, TX + 0.49 + (i % 4) * 0.09, y + 0.05, TZ - 0.05 + Math.floor(i / 4) * 0.1, 0xc86a5a, 6); k.box(0.04, 0.03, 0.035, TX + 0.49 + (i % 4) * 0.09, y + 0.05, TZ - 0.05 + Math.floor(i / 4) * 0.1, 0xe8b080); }
      k.cyl(0.11, 0.09, 0.045, TX + 0.95, y + 0.022, TZ - 0.05, 0xf4f4f4, 14); for (let i = 0; i < 10; i++) k.box(0.015, 0.015, 0.07, TX + 0.95 + Math.cos(i) * 0.05, y + 0.055, TZ - 0.05 + Math.sin(i) * 0.04, 0xff8a1a, { rot: [0, i, 0] });
      k.parts.push(part(sph(0.07, 10, 6), 0xf4f4f4, [TX + 0.2, y + 0.05, TZ + 0.2], [0, 0, 0], [1.6, 0.7, 0.9])); k.cyl(0.07, 0.07, 0.005, TX + 0.2, y + 0.085, TZ + 0.2, 0x5a2a14, 10);
      for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; k.parts.push(part(new THREE.IcosahedronGeometry(0.035, 0), i % 3 ? 0x1e5a2a : 0x2a6a32, [TX - 0.02 + Math.cos(a) * 0.13, y + 0.025, TZ - 0.15 + Math.sin(a) * 0.13])); }
      for (let i = 0; i < 3; i++) { const a = i / 3 * 6.28, cx = TX - 0.02 + Math.cos(a) * 0.06, cz = TZ - 0.15 + Math.sin(a) * 0.06; k.cyl(0.022, 0.022, 0.18 - i * 0.03, cx, y + 0.09 - i * 0.015, cz, 0xc8102e, 8); bulb(k, cx, y + 0.2 - i * 0.03, cz, 0xffc060, 0.012, 0.12); }
      k.cyl(0.035, 0.035, 0.22, TX - 1.0, y + 0.11, TZ + 0.25, 0x3a0a14, 10); k.cyl(0.012, 0.016, 0.08, TX - 1.0, y + 0.26, TZ + 0.25, 0x3a0a14, 6);
      for (const [x, z] of [[TX - 0.75, TZ], [TX + 0.63, TZ], [TX - 0.35, TZ + 0.1], [TX + 0.95, TZ - 0.05]]) k.spawns.push(new THREE.Vector3(x, TH + 0.1, z));
      // a linear pendant over the table
      k.box(1.6, 0.06, 0.12, TX, 1.95, TZ, 0x1e1f21); for (const dx of [-0.6, 0, 0.6]) { k.box(0.008, VAULT - 0.4 - 1.95, 0.008, TX + dx * 1.2, (VAULT - 0.4 + 1.95) / 2, TZ, 0x2a2a2a); k.lamp(TX + dx, 1.92, TZ, 0xfff0d0, 0.035, true); }
      k.pool(TX, TH + 0.01, TZ, 1.6, 0xffc070);
      k.spawns.push(new THREE.Vector3(TX + 0.35, TH + 0.1, TZ - 0.25), new THREE.Vector3(TX - 0.55, TH + 0.1, TZ + 0.25)); }
    // the walls: HANGRY-O-METER, BREAK GLASS, the calendar, the cards, a big print
    { const xf = P2 + 0.06;
      k.parts.push(part(cyl(0.33, 0.33, 0.04, 28), 0x2b2d30, [xf + 0.02, 1.65, -1.15], [0, 0, Math.PI / 2])); { const m = new THREE.Mesh(new THREE.CircleGeometry(0.3, 32), new THREE.MeshLambertMaterial({ map: hangryTex() })); m.position.set(xf + 0.045, 1.65, -1.15); m.rotation.y = Math.PI / 2; scene.add(m); }
      const bz = 2.45; R(xf, bz - 0.25, xf + 0.02, bz + 0.25, 0.4, 1.55, 0x8a0a1a); R(xf, bz - 0.25, xf + 0.13, bz + 0.25, 0.04, 1.37, 0xc8102e); R(xf, bz - 0.25, xf + 0.13, bz + 0.25, 0.06, 1.72, 0xc8102e); for (const s of [-1, 1]) R(xf, bz + s * 0.23 - 0.02, xf + 0.13, bz + s * 0.23 + 0.02, 0.4, 1.55, 0xc8102e);
      for (let i = 0; i < 18; i++) k.box(0.03, 0.03, 0.05, xf + 0.06, 1.43 + Math.floor(i / 6) * 0.06, bz - 0.18 + (i % 6) * 0.07, [0x8a1aa0, 0xffd84a, 0x2a8a4a, 0xc8102e, 0x1e88e5, 0xff7a00][i % 6], { rot: [(i % 3 - 1) * 0.5, 0, 0] });
      glassQuad([xf + 0.125, 1.37, bz + 0.21], [xf + 0.125, 1.37, bz - 0.21], [xf + 0.125, 1.62, bz - 0.21], [xf + 0.125, 1.62, bz + 0.21]);
      sign('IN CASE OF HANGRY NAN: BREAK GLASS', 0.46, 0.1, xf + 0.135, 1.69, bz, Math.PI / 2, { bg: '#c8102e', fg: '#ffffff', border: null, size: 40 });
      note('(QUALITY STREETS INSIDE. NOT THE COCONUT ONES.)', 0.42, 0.07, xf + 0.012, 1.3, bz, Math.PI / 2, '#ffffff', '#c8102e', 30);
      k.label('calendar', 0.5, 0.62, [xf + 0.012, 1.5, -0.2], [0, Math.PI / 2, 0], { tex: calendarTex() });
      note('1:58. TWO MINUTES.', 0.3, 0.06, xf + 0.012, 1.25, -1.15, Math.PI / 2, '#fffbe8', '#c8102e', 34);
      cardString(k, [0.9, 2.15, ZI1 - 0.02], [3.3, 2.15, ZI1 - 0.02], 'x', -1, rnd, 16);
      sign("NAN'S KITCHEN: OPEN 24 HOURS (FOR TEA)", 1.1, 0.2, P1 - 0.065, 2.12, 1.75, -Math.PI / 2, { bg: '#2b2d30', fg: '#ffffff', border: '#6dcfcf', size: 40 });
      fam('z', P1 - 0.06, 1.75, 1.55, 0.95, 0.66, -1, ['karen', 'paul', 'tommy', 'charli'], 'beach', 'Karen, Paul, Tommy & Charli · Tenerife');
      fam('z', P1 - 0.06, 0.35, 1.5, 0.42, 0.55, -1, ['tommy'], 'studio', 'Tommy · Marketing Award (for crisps)');
      fam('x', ZI1, 0.2, 1.5, 0.42, 0.55, -1, ['charli'], 'studio', 'Charli · "I said that first"');
      fam('x', ZI1, 0.3, 1.95, 0.5, 0.4, -1, ['karen', 'lisa'], 'studio', 'Karen & Lisa · already arguing');
      F.radiator(k, 'x', ZI1, 2.1, 1.6, -1, { y: 0.36, h: 0.4 }); }
    // the glazed double doors (lounge and hall), open
    // (swung right back, almost flat against the kitchen side of the wall, so nothing sticks out into the way)
    for (const [hz, turn] of [[-2.05, -1.48], [-0.45, 1.48]]) F.openDoor(k, P1 - 0.08, hz, true, -1, 0.78, { glazed: glassQuad, turn });
    for (const [hz, turn] of [[0.35, 1.48], [1.95, -1.48]]) F.openDoor(k, P2 + 0.08, hz, true, 1, 0.78, { glazed: glassQuad, turn });

    // ================================================ THE ENTRANCE HALL (x -2.45 .. -0.65), the study, the wing
    { // coat hooks with coats, the shoe bench (Jimmy's size 13s), a mirror, the console with the cards Michael sorted
      const wx = -2.4;
      k.box(0.03, 0.08, 0.9, wx + 0.015, 1.75, 2.0, F.OAK); for (let i = 0; i < 4; i++) { const z = 1.67 + i * 0.22; k.box(0.06, 0.03, 0.02, wx + 0.04, 1.75, z, 0x1a1a1a); k.box(0.14, 0.75, 0.3, wx + 0.08, 1.36, z, [0x3a3a5a, 0x8a3a2a, 0x2a4a3a, 0xd8c8a8][i], { rot: [0, 0, 0.04 * (i % 2 ? 1 : -1)] }); }
      R(wx, 1.55, wx + 0.36, 2.5, 0.45, 0.225, F.OAK, { block: true, collide: true }); for (let i = 0; i < 4; i++) k.box(0.26, 0.08, 0.12, wx + 0.18, 0.12, 1.7 + i * 0.2, [0x2a2a2a, 0x8a3a2a, 0xe8e8e8, 0x3a2a1a][i]);
      k.box(0.34, 0.12, 0.14, wx + 0.18, 0.5, 2.25, 0x1a1a1a); note("JIMMY'S SHOES (SIZE 13). DO NOT TRIP.", 0.3, 0.1, wx + 0.18, 0.455, 1.9, [-Math.PI / 2, 0, Math.PI / 2], '#fffbe8', '#222', 30);
      note('KEYS. GLASSES. PURSE. BUS PASS. CHOCOLATE.', 0.3, 0.2, wx + 0.005, 1.95, 2.6, Math.PI / 2, '#fffbe8', '#222', 30);
      const cx = P2 - 0.06; R(cx - 0.34, 2.0, cx, 2.62, 0.05, 0.82, F.OAK, { collide: true, block: true }); for (const z of [2.03, 2.59]) k.box(0.3, 0.8, 0.03, cx - 0.17, 0.4, z, 0x1e1f21);
      k.box(0.2, 0.06, 0.18, cx - 0.17, 0.875, 2.45, 0xe8e0d0); for (let i = 0; i < 9; i++) k.box(0.11, 0.012, 0.16, cx - 0.17, 0.85 + i * 0.013, 2.15, [0xf4f0e6, 0xc8102e, 0xe8e0d0, 0x1e5a2a, 0xf4f0e6][i % 5], { rot: [0, i * 0.12, 0] });
      note('SORTED BY MICHAEL (ALL THE SAME POSTCODE)', 0.32, 0.14, cx - 0.005, 1.15, 2.3, -Math.PI / 2, '#ffffff', '#c8102e', 32);
      k.box(0.02, 0.8, 0.55, cx - 0.01, 1.62, 2.3, 0x1e1f21); k.box(0.015, 0.76, 0.51, cx - 0.02, 1.62, 2.3, 0xb8c6cc);
      fam('z', cx, -0.1, 1.55, 0.75, 0.55, -1, ['lisa', 'michael', 'sophie', 'jimmy'], 'xmas', 'Lisa, Michael, Sophie & Jimmy');
      fam('z', -2.4, 0.95, 1.55, 0.36, 0.46, 1, ['sophie'], 'studio', 'Sophie · London (again)');
      lightString(k, [[-2.38, 2.25, 0.7], [-2.38, 2.25, 2.85]], { spacing: 0.15, sag: 0.06, colors: WARM, wire: null });
      k.spawns.push(new THREE.Vector3(cx - 0.17, 0.95, 2.3)); }
    // the study: a wall-hung desk under the window, a chair, blinds, Nan's club paperwork
    { F.desk(k, 'x', ZI0, -1.52, 1, { w: 1.3 }); k.box(0.95, 0.5, 0.03, -1.52, 1.85, ZI0 + 0.08, 0xe6e2da);
      for (let i = 0; i < 5; i++) k.box(0.2, 0.012, 0.28, -1.95 + i * 0.05, 0.77 + i * 0.012, ZI0 + 0.3, [0xffffff, 0xffd84a, 0xc8102e, 0xffffff, 0x5ec8c8][i], { rot: [0, i * 0.2, 0] });
      note("NAN'S OFFICE: CLUB ROTA, BINGO, 40 CARDS STILL TO WRITE", 0.42, 0.16, -1.52, 1.45, ZI0 + 0.012, 0, '#ffffff', '#4a4e55', 30);
      k.box(0.3, 1.8, 0.8, -2.25, 0.9, -1.65, 0xeceae6, { block: true }); for (let y = 0.4; y < 1.8; y += 0.4) for (let i = 0; i < 6; i++) k.box(0.2, 0.25, 0.04 + (i % 2) * 0.02, -2.2, y + 0.13, -1.95 + i * 0.1, [0x2a4a6a, 0xc8a050, 0x8a2a2a, 0x3a6a3a, 0xd8d0c0, 0x4a4e55][i]);
      fam('z', P2 - 0.06, -1.8, 1.55, 0.36, 0.46, -1, ['jimmy'], 'studio', 'Jimmy (had to crouch)');
      k.spawns.push(new THREE.Vector3(-1.2, 0.85, ZI0 + 0.3)); }
    // bedroom 2: a double bed, a bedside, a mirrored wardrobe
    { F.bed(k, -4.62, 2.16, Math.PI / 2, { w: 1.2, l: 1.9 }); F.bedside(k, -5.33, 1.15, Math.PI / 2); F.mirrorWardrobe(k, 'z', -2.5, 1.75, 2.9, -1, { depth: 0.5 });
      note("THE SPARE ROOM: SOPHIE'S (IF SHE MISSES THE 6:42)", 0.4, 0.14, -4.65, 1.9, ZI1 - 0.01, Math.PI, '#ffffff', '#1a3a8a', 30); F.radiator(k, 'x', ZI1, -4.0, 1.0, -1); }
    // the utility: washing machine + dryer, a sink unit, the back door (open, flat against the outside wall)
    { F.baseRun(k, 'z', -4.2, ZI0 + 0.05, -1.2, 1, { skip: [[ZI0, -1.6]] });
      for (const [z, c] of [[-2.55, 0x9ab0c0], [-1.95, 0x3a3c40]]) { k.box(0.02, 0.82, 0.58, -3.6, 0.45, z, 0xf4f4f2); k.parts.push(part(cyl(0.2, 0.2, 0.02, 16), c, [-3.585, 0.48, z], [0, 0, Math.PI / 2])); }
      F.openDoor(k, -3.4, HZ0 - 0.05, true, -1, 0.85, { col: C.ANTH, lever: 0xc8ccd0 });
      note('THE UTILITY: WHERE THE CHRISTMAS TINS ARE HIDDEN (TOP SHELF. JIMMY CAN REACH IT. DON\'T TELL HIM.)', 0.5, 0.18, -3.9, 1.75, -0.66, Math.PI, '#ffffff', '#4a4e55', 28); }
    // the bathroom: bath with shower + screen, vanity + LED mirror, toilet
    { F.bath(k, 'z', -5.6, ZI0 + 0.02, ZI0 + 1.72, 1); F.vanity(k, 'z', -4.3, -1.3, -1, { w: 0.6 }); F.toilet(k, 'x', ZI0, -4.65, 1); }
    // the master bedroom: the bed against the end wall, bedsides, the mirrored sliding wardrobes, the en-suite
    { F.bed(k, -8.0, -0.95, Math.PI / 2, { w: 1.6, l: 2.0 }); F.bedside(k, -8.75, -2.15, Math.PI / 2); F.bedside(k, -8.75, 0.25, Math.PI / 2); k.spawns.push(new THREE.Vector3(-8.7, 0.62, 0.15), new THREE.Vector3(-7.4, 0.75, -0.95));
      F.mirrorWardrobe(k, 'z', -5.7, ZI0, -0.65, -1); F.radiator(k, 'x', ZI0, -6.0, 0.7, 1);
      F.framed(k, 'z', XI0, -0.95, 1.75, 1.0, 0.5, 1, TX.printTex(3));
      note("NAN'S ROOM. THE PRESENTS ARE NOT UNDER THE BED. (THEY ARE.)", 0.42, 0.16, -6.2, 1.3, ZI0 + 0.012, 0, '#ffffff', '#4a4e55', 30);
      F.toilet(k, 'z', XI0, 1.6, 1); F.vanity(k, 'x', ZI1, -8.4, -1, { w: 0.55 });
      k.box(0.9, 2.0, 0.01, -7.85, 1.0, 1.1, 0xcfe6ee); }
    // the inner doors (white panels, chrome levers), all open, swung back as far as each room lets them: the spare
    // room's flat to its wall, the study's back to its side wall, the utility's flat to the study wall, the bathroom's
    // flat to the corridor wall (it opens out: the bath and vanity are behind it), the master's and en-suite's square
    F.openDoor(k, -1.83, -0.62, false, -1, 1.0, { turn: 0.55 }); F.openDoor(k, -3.6, 0.62, false, 1, 1.0, { turn: -1.48 }); F.openDoor(k, -2.52, -0.62, false, -1, 1.0);
    F.openDoor(k, -4.45, -0.53, true, 1, 0.88);
    F.openDoor(k, -5.65, -0.55, true, -1, 1.0); F.openDoor(k, -7.35, 1.4, true, 1, 1.0);
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
      if (c.x > HX0 - 1.5 && c.x < DECK.x1 + 1 && c.z > DECK.z0 - 0.5 && c.z < FSTEP.z1 + 0.5) { keep.push(g); continue; }
      const key = Math.floor(c.x / 30) + ',' + Math.floor(c.z / 30); (tiles.get(key) || tiles.set(key, []).get(key)).push(g); }
    k.parts = keep; const kept = new Set(keep); k.boxRec = (k.boxRec || []).filter(r => !r.g || r.g.isMesh || kept.has(r.g));
    for (const list of tiles.values()) { const m = new THREE.Mesh(merge(list), vcLambert); m.userData.tile = true; scene.add(m); } }
  const room = k.finish({
    name: "Nan's new house (Sandy Bay)",
    sky: 0xd8e4f0, ground: 0x6a8a5a, hemiI: 1.45, sun: 0xffdcb0, sunI: 2.4, sunPos: [-6, 4.2, 9], ambient: 0.42,
    start: { x: -1.55, z: 1.55, yaw: -Math.PI / 2 },
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
  { const nav = room.nav, base = nav.sampleSpots.bind(nav), inLiving = (x, z) => x > P2 + 0.3 && x < HX1 - 0.3 && z > HZ0 + 0.3 && z < HZ1 - 0.3;
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
  // raised floors: the home, the deck, the front landing and the steps
  const inHome = (x, z) => x > HX0 && x < HX1 && z > HZ0 && z < HZ1;
  room.floorAt = (x, z) => {
    if (inHome(x, z)) return FL;
    if (z > DECK.z0 && z < HZ0 && x > DECK.x0 && x < DECK.x1) return FL;
    if (x > DECK.endX && x < DECK.x1 && z >= HZ0 && z < HZ1 + 0.3) return FL;
    if (z > DSTEP.z0 && z < DSTEP.z1 && x >= DSTEP.x0 && x < DSTEP.x1) return FL * (3 - Math.floor((x - DSTEP.x0) / 0.3)) / 4;
    if (x > FSTEP.x0 && x < FSTEP.x1 && z >= HZ1) { if (z < FSTEP.land) return FL; if (z < FSTEP.z1) return FL * (3 - Math.floor((z - FSTEP.land) / 0.3)) / 4; }
    return 0;
  };
  room.indoors = (x, z) => inHome(x, z);
  const baseUpdate = room.update.bind(room);
  room.update = (dt) => { baseUpdate(dt); const t = room.t || 0; updateOutdoor(t); if (flame) { flame.scale.y = 1 + Math.sin(t * 9) * 0.05 + Math.sin(t * 23) * 0.03; flame.position.y = flameY + (flame.scale.y - 1) * 0.2; } };
  // ---- what the game needs to know
  room.zones = {
    lounge: { x0: P1, x1: HX1, z0: HZ0, z1: HZ1 },
    kitchen: { x0: P2, x1: P1, z0: HZ0, z1: HZ1 },
    hall: { x0: -2.45, x1: P2, z0: -0.6, z1: FSTEP.z1 },
    bedrooms: { x0: HX0, x1: -2.45, z0: HZ0, z1: HZ1 },
    deck: { x0: DECK.x0, x1: DECK.x1, z0: DECK.z0, z1: HZ1 + 0.3 },
    garden: { x0: PLOT.x0, x1: PLOT.x1, z0: L.HEDGE.z1, z1: HZ0 },
    green: { x0: LAWN.x0, x1: LAWN.x1, z0: LAWN.z0, z1: LAWN.z1 },
    front: { x0: -13.2, x1: 12, z0: HZ1, z1: L.ROAD.z0 },
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
    stand: [{ x: 6.2, z: -2.0 }, { x: 8.2, z: -1.7 }, { x: 6.3, z: 1.75 }, { x: 4.95, z: 1.0 }],
  };
  room.dinner = { seats: dinnerSeats, table: { x: TBL.x, z: TBL.z, w: TBL.w, d: TBL.d, h: TBL.h, y: FL + TBL.h } };
  room.kitchen = { kettle: KETTLE, fridge: { x: 3.13, z: -1.9 }, counter: { x: 1.4, y: FL + 0.93, z: HZ0 + WT + 0.3 }, island: { x: 1.75, y: FL + 0.93, z: -0.95 } };
  room.stash = STASH;
  room.tree = { x: TREE.x, z: TREE.z };
  room.drinks = DRINKS;
  room.lawn = LAWN;
  room.gardenStart = { x: LAWN.x0 + 1.2, z: -18.6, yaw: -Math.PI / 2 };      // the green's left-hand end, flinging down its length
  room.familyPhotos = photos;
  room.activities = [
    ...quizSeats.slice(0, 5).map(s => ({ x: s.x, z: s.z, yaw: s.yaw, pose: 'sit' })),
    { x: hostSeat.x, z: hostSeat.z, yaw: hostSeat.yaw, pose: 'sit' },
    { x: 6.0, z: -2.1, yaw: Math.PI / 2, pose: 'drink' }, { x: 3.1, z: 0.2, yaw: Math.PI / 2, pose: 'chat' },
    { x: 0.6, z: -1.6, yaw: Math.PI, pose: 'phone' }, { x: 3.0, z: 0.35, yaw: -Math.PI / 2, pose: 'chat' },
    { x: 10.2, z: -1.5, yaw: -Math.PI / 2, pose: 'phone' }, { x: 7.0, z: -4.3, yaw: Math.PI, pose: 'drink' },
    { x: -1.5, z: 5.6, yaw: 0, pose: 'chat' },
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
