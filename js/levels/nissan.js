// Nan's car: a silver Nissan Micra (the rounded five-door hatchback), built properly rather than from three boxes: a
// curved body shell (the side profile pulled across the car's width and rounded off at the edges), a glasshouse with
// black pillars, wheel arches, five-spoke alloys on proper tyres, swept-back headlights, tall tail lights up the
// tailgate, the black grille with the chrome Nissan badge, door mirrors, door handles and shut lines, wipers, a rear
// spoiler lip, number plates (white front, yellow back) and a little Christmas wreath on the grille.
// nissan(scene, k, x, z, ry): x, z = the middle of the car on the ground; ry = which way the nose points (0 = +z).
import * as THREE from 'three';
import { part } from '../geo.js';

const L = 3.83, W = 1.66, ROOF = 1.47, WHEEL_R = 0.3, AXLE = 1.24, TRACK = 0.71;

export function nissan(scene, k, x, z, ry, { color = 0xaeb2b8, plate = 'JOAN 1', block = true } = {}) {
  const M = new THREE.Matrix4().makeRotationY(ry).setPosition(x, 0, z);
  const body = [], glass = [], trim = [];
  const put = (list, g, col, pos = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) => { const p = part(g, col, pos, rot, scl); p.applyMatrix4(M); list.push(p); };

  // ---- the body shell up to the window line: the side profile (front at +z), extruded across the width, rounded edges
  const ext = (pts, width, bevT, bevS, segs = 3) => { const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: width - 2 * bevT, bevelEnabled: true, bevelThickness: bevT, bevelSize: bevS, bevelSegments: segs, curveSegments: 6 });
    g.translate(0, 0, -(width - 2 * bevT) / 2); g.rotateY(-Math.PI / 2); g.computeVertexNormals(); return g; };      // (shape x = along the car = +z; the extrusion = across = x)
  put(body, ext([[-1.9, 0.28], [1.88, 0.28], [1.915, 0.44], [1.9, 0.62], [1.78, 0.76], [1.35, 0.86], [0.95, 0.96], [-0.4, 0.985], [-1.84, 1.0], [-1.91, 0.72], [-1.915, 0.42]], W, 0.07, 0.05), color);
  // ---- the glasshouse: a little narrower than the body (the sides lean in), dark glass all round; the roof on top
  const CW = W - 0.17;
  put(glass, ext([[0.95, 0.93], [0.32, 1.39], [-0.2, 1.44], [-0.95, 1.45], [-1.5, 1.39], [-1.71, 1.23], [-1.84, 0.96]], CW, 0.05, 0.03, 2), 0x18222c);
  put(body, ext([[0.36, 1.375], [-0.2, 1.43], [-0.95, 1.44], [-1.52, 1.38], [-1.56, 1.42], [-0.95, 1.49], [-0.2, 1.48], [0.3, 1.43]], CW + 0.02, 0.04, 0.02, 2), color);
  for (const s of [-1, 1]) {
    const px = s * (CW / 2 + 0.006);
    put(body, new THREE.BoxGeometry(0.03, 0.78, 0.075), color, [px, 1.16, 0.635], [-0.94, 0, 0]);                         // the A pillar (body colour)
    put(trim, new THREE.BoxGeometry(0.03, 0.44, 0.09), 0x111214, [px, 1.2, -0.36]);                                       // the B pillar (black)
    put(body, new THREE.BoxGeometry(0.03, 0.55, 0.22), color, [px, 1.175, -1.6], [0.67, 0, 0]);                           // the C pillar
    put(trim, new THREE.BoxGeometry(0.02, 0.022, 2.6), 0x0e0f10, [s * (W / 2 - 0.02), 0.99, -0.45]);                     // the window line seal
  }
  // ---- wheel arches (black liners), tyres, five-spoke alloys, centre caps
  for (const az of [AXLE, -AXLE]) for (const s of [-1, 1]) {
    put(trim, new THREE.CylinderGeometry(WHEEL_R + 0.07, WHEEL_R + 0.07, 0.06, 20, 1, false, 0, Math.PI), 0x161718, [s * (W / 2 - 0.02), WHEEL_R + 0.02, az], [0, 0, Math.PI / 2]);
    const tyre = new THREE.TorusGeometry(WHEEL_R - 0.07, 0.075, 8, 22); put(trim, tyre, 0x1a1a1b, [s * TRACK, WHEEL_R, az], [0, Math.PI / 2, 0], [1, 1, 1.4]);
    put(trim, new THREE.CylinderGeometry(WHEEL_R - 0.1, WHEEL_R - 0.1, 0.17, 18), 0x141414, [s * TRACK, WHEEL_R, az], [0, 0, Math.PI / 2]);
    const face = s * (TRACK + 0.09);
    put(trim, new THREE.CylinderGeometry(0.205, 0.205, 0.02, 20), 0xbfc3c8, [face - s * 0.01, WHEEL_R, az], [0, 0, Math.PI / 2]);            // the rim
    put(trim, new THREE.CylinderGeometry(0.16, 0.16, 0.022, 20), 0x2a2c2e, [face, WHEEL_R, az], [0, 0, Math.PI / 2]);                        // the gaps between spokes
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; put(trim, new THREE.BoxGeometry(0.03, 0.05, 0.17), 0xd4d8dc, [face + s * 0.004, WHEEL_R + Math.cos(a) * 0.085, az + Math.sin(a) * 0.085], [a, 0, 0]); }
    put(trim, new THREE.CylinderGeometry(0.045, 0.045, 0.03, 12), 0x8a8e92, [face + s * 0.008, WHEEL_R, az], [0, 0, Math.PI / 2]);           // the centre cap
  }

  // ---- the front: headlights swept back into the wings, the grille, the chrome badge, bumper, fog lights, plate
  for (const s of [-1, 1]) {
    put(trim, new THREE.BoxGeometry(0.42, 0.13, 0.3), 0xe8eef2, [s * 0.52, 0.74, 1.73], [0.35, s * -0.35, 0]);
    put(trim, new THREE.BoxGeometry(0.2, 0.08, 0.05), 0xffffff, [s * 0.55, 0.75, 1.875]);                                  // the bulb behind the lens
    put(trim, new THREE.BoxGeometry(0.16, 0.025, 0.05), 0xffb030, [s * 0.68, 0.71, 1.84], [0, s * -0.4, 0]);                 // the indicator
    put(trim, new THREE.CylinderGeometry(0.05, 0.05, 0.03, 14), 0xf2f2e8, [s * 0.6, 0.42, 1.905], [Math.PI / 2, 0, 0]);       // fog light
  }
  put(trim, new THREE.BoxGeometry(0.56, 0.17, 0.05), 0x141516, [0, 0.62, 1.9]);                                             // the grille
  put(trim, new THREE.BoxGeometry(0.62, 0.025, 0.055), 0xd8dce0, [0, 0.715, 1.9]);                                          // its chrome top bar (the V)
  for (const s of [-1, 1]) put(trim, new THREE.BoxGeometry(0.26, 0.022, 0.055), 0xd8dce0, [s * 0.13, 0.6, 1.905], [0, 0, s * 0.42]);
  put(trim, new THREE.TorusGeometry(0.055, 0.009, 6, 18), 0xe4e8ec, [0, 0.64, 1.935]);                                      // the Nissan badge: a chrome ring...
  put(trim, new THREE.BoxGeometry(0.14, 0.028, 0.012), 0xe4e8ec, [0, 0.64, 1.937]);                                          // ...with the bar across
  put(trim, new THREE.BoxGeometry(1.2, 0.07, 0.05), 0x1a1b1c, [0, 0.33, 1.88]);                                             // lower bumper vent
  // a little Christmas wreath on the grille (Nan)
  put(trim, new THREE.TorusGeometry(0.1, 0.03, 6, 14), 0x1f5a2a, [0.42, 0.53, 1.92]); put(trim, new THREE.SphereGeometry(0.025, 6, 4), 0xc81e1e, [0.42, 0.44, 1.94]);

  // ---- the back: tall tail lights up the tailgate, the spoiler lip, the tailgate shut line, a handle, the bumper
  for (const s of [-1, 1]) {
    put(trim, new THREE.BoxGeometry(0.11, 0.42, 0.06), 0xb3121c, [s * 0.69, 1.08, -1.86], [0.2, 0, 0]);
    put(trim, new THREE.BoxGeometry(0.06, 0.12, 0.065), 0xf0f0f0, [s * 0.69, 0.95, -1.875], [0.2, 0, 0]);                     // the reversing light
    put(trim, new THREE.BoxGeometry(0.1, 0.035, 0.065), 0xff9a20, [s * 0.69, 1.2, -1.865], [0.2, 0, 0]);
  }
  put(trim, new THREE.BoxGeometry(1.3, 0.05, 0.16), color, [0, 1.42, -1.5], [-0.15, 0, 0]);                                  // the roof spoiler lip
  put(trim, new THREE.BoxGeometry(1.3, 0.012, 0.012), 0x2a2c2e, [0, 0.96, -1.89]);
  put(trim, new THREE.BoxGeometry(0.16, 0.03, 0.03), 0xd8dce0, [0, 0.9, -1.905]);                                            // the tailgate handle (chrome)
  put(trim, new THREE.TorusGeometry(0.045, 0.008, 6, 16), 0xe4e8ec, [0, 1.12, -1.89], [0, Math.PI, 0]);                       // the badge on the back
  put(trim, new THREE.BoxGeometry(1.3, 0.06, 0.05), 0x1a1b1c, [0, 0.36, -1.9]);                                              // the rear diffuser strip
  put(trim, new THREE.CylinderGeometry(0.025, 0.025, 0.1, 8), 0x55585c, [0.45, 0.25, -1.9], [Math.PI / 2, 0, 0]);             // the exhaust

  // ---- the sides: door shut lines, handles, mirrors (body colour with black bases, indicator repeaters), side skirts
  for (const s of [-1, 1]) {
    const fx = s * (W / 2 + 0.003);
    for (const dz of [0.92, -0.37, -1.35]) put(trim, new THREE.BoxGeometry(0.008, 0.62, 0.01), 0x2a2c2e, [fx, 0.65, dz]);
    put(trim, new THREE.BoxGeometry(0.008, 0.01, 2.27), 0x3a3c3e, [fx, 0.34, -0.21]);
    for (const dz of [0.15, -0.85]) put(trim, new THREE.BoxGeometry(0.03, 0.03, 0.15), 0xb8bcc0, [s * (W / 2 + 0.01), 0.9, dz]);
    put(trim, new THREE.BoxGeometry(0.06, 0.06, 0.16), 0x141516, [s * (W / 2 + 0.03), 1.0, 0.82]);
    put(body, new THREE.BoxGeometry(0.17, 0.12, 0.1), color, [s * (W / 2 + 0.11), 1.06, 0.8], [0, s * 0.2, 0]);
    put(trim, new THREE.BoxGeometry(0.1, 0.02, 0.02), 0xff9a20, [s * (W / 2 + 0.13), 1.02, 0.85]);
    put(trim, new THREE.BoxGeometry(0.05, 0.08, 2.0), 0x1d1e20, [s * (W / 2 - 0.02), 0.3, -0.06]);
  }
  // wipers resting at the bottom of the windscreen, the aerial on the roof
  for (const s of [-0.3, 0.32]) put(trim, new THREE.BoxGeometry(0.55, 0.015, 0.02), 0x0f1011, [s, 0.99, 0.88], [0, 0.1, 0]);
  put(trim, new THREE.CylinderGeometry(0.008, 0.012, 0.22, 6), 0x111111, [0, 1.56, -1.15], [-0.5, 0, 0]);

  // ---- materials: a metallic-looking silver (sharp highlights), dark glass, the trim in its own colours
  const mk = (list, mat) => { if (!list.length) return; const g = mergeAll(list); const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; m.matrixAutoUpdate = false; m.updateMatrix(); scene.add(m); };
  mk(body, new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 90, specular: 0x9a9ea4 }));
  mk(glass, new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 120, specular: 0xbfd0e0 }));
  mk(trim, new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 50, specular: 0x444444 }));

  // number plates: white on the front, yellow on the back
  const at = (lx, y, lz) => { const v = new THREE.Vector3(lx, y, lz).applyMatrix4(M); return [v.x, v.y, v.z]; };
  k.label(plate, 0.52, 0.11, at(0, 0.47, 1.925), [0, ry, 0], { bg: '#f6f6f2', fg: '#111', border: null, size: 70 });
  k.label(plate, 0.52, 0.11, at(0, 0.7, -1.925), [0, ry + Math.PI, 0], { bg: '#f8d020', fg: '#111', border: null, size: 70 });

  if (block) { const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry)), hx = s * L / 2 + c * W / 2 + 0.05, hz = c * L / 2 + s * W / 2 + 0.05; k.blockers.push({ x0: x - hx, x1: x + hx, z0: z - hz, z1: z + hz, y1: 1.4 }); }
  return { at };
}

function mergeAll(list) {
  let n = 0; for (const g of list) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3); let o = 0;
  for (const g of list) { if (!g.attributes.normal) g.computeVertexNormals(); pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); col.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g;
}
