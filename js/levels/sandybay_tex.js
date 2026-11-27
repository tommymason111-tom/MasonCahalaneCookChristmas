// Sandy Bay's canvas textures: everything drawn in code (no image files). The materials of a modern park home and a
// manicured resort: engineered-wood lap siding (white over a light-grey band), concrete interlocking roof tiles,
// composite decking, greige carpet, light-oak vinyl planks, charcoal slatted panelling, white tongue-and-groove,
// marble-effect tiles, artificial turf and lawn, block paving, tarmac, the white sea wall, sand, the Sandy Bay sign.
import * as THREE from 'three';
import { canvasTex, FONT } from '../textures.js';

let _s = 12345;
const R = () => (_s = (_s * 16807) % 2147483647) / 2147483647;
const seed = (n) => { _s = n; };
const rgb = (c, k = 1, a = 1) => { const v = new THREE.Color(c); return `rgba(${Math.round(v.r * 255 * k)},${Math.round(v.g * 255 * k)},${Math.round(v.b * 255 * k)},${a})`; };
const rep = (t, clampV = false) => { t.wrapS = THREE.RepeatWrapping; t.wrapT = clampV ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping; return t; };
const speckle = (g, w, h, n, cols, sz = 2) => { for (let i = 0; i < n; i++) { g.fillStyle = cols[i % cols.length]; g.fillRect(R() * w, R() * h, sz, sz); } };

// ---------------------------------------------------------------- the home's outside
// LAP SIDING ("CanExel"): one picture covers a wall from the skirting (y = 0.7) to 3.7 m above it, 2 m wide (repeats
// across). Boards 150 mm, each with the shadow line of the board above. band = the height (m) of light-grey boards at
// the bottom (0 = all white); base / grey = the colours.
export const SIDING_Y0 = 0.7, SIDING_H = 3.7, SIDING_W = 2.0;
export function sidingTex({ band = 0.9, base = '#f1f1ee', grey = '#bfc3c4' } = {}) {
  seed(band * 100 + 7);
  const W = 256, H = 1024, px = H / SIDING_H, bh = 0.15 * px;
  return rep(canvasTex(W, H, (g) => {
    for (let i = 0; i * bh < H + bh; i++) {
      const yb = H - i * bh, col = i * 0.15 < band - 0.01 ? grey : base;
      g.fillStyle = col; g.fillRect(0, yb - bh, W, bh);
      const gr = g.createLinearGradient(0, yb - bh, 0, yb);                     // each board leans out at its bottom edge
      gr.addColorStop(0, 'rgba(0,0,0,0.20)'); gr.addColorStop(0.12, 'rgba(0,0,0,0.05)'); gr.addColorStop(0.7, 'rgba(255,255,255,0.0)'); gr.addColorStop(0.94, 'rgba(255,255,255,0.10)'); gr.addColorStop(1, 'rgba(0,0,0,0.10)');
      g.fillStyle = gr; g.fillRect(0, yb - bh, W, bh);
      g.fillStyle = 'rgba(40,40,45,0.38)'; g.fillRect(0, yb - bh, W, 2);         // the shadow under the board above
      for (let j = 0; j < 14; j++) { g.fillStyle = R() < 0.5 ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.05)'; g.fillRect(R() * W, yb - bh + 3 + R() * (bh - 6), 20 + R() * 60, 1); }   // the faint embossed grain
      if (i % 3 === 1) { const x = (i * 97) % W; g.fillStyle = 'rgba(0,0,0,0.10)'; g.fillRect(x, yb - bh, 1, bh); }   // a butt joint now and then
    }
  }), true);
}
// grey brick-effect skirting round the chassis
export function skirtTex() {
  seed(31);
  return rep(canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#5f6264'; g.fillRect(0, 0, w, h);
    const bw = 64, bh = 21;
    for (let r = 0; r < h / bh; r++) for (let c = -1; c < w / bw + 1; c++) { const x = c * bw + (r % 2) * bw / 2, y = r * bh, v = R() * 22 - 11;
      g.fillStyle = `rgb(${132 + v},${135 + v},${138 + v})`; g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
      g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x + 2, y + 2, bw - 4, 2); }
    speckle(g, w, h, 500, ['rgba(0,0,0,0.12)', 'rgba(255,255,255,0.08)']);
  }));
}
// CONCRETE INTERLOCKING ROOF TILES, charcoal: 1 m square, 4 courses of 250 mm, tiles 333 mm wide (in line, not staggered)
export function roofTileTex(base = [63, 66, 70]) {
  seed(77);
  return rep(canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = `rgb(${base.join(',')})`; g.fillRect(0, 0, w, h);
    const ch = h / 4, cw = w / 3;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      const x = c * cw, y = r * ch, v = R() * 12 - 6;
      const gr = g.createLinearGradient(0, y, 0, y + ch); gr.addColorStop(0, `rgb(${base[0] - 14 + v},${base[1] - 14 + v},${base[2] - 13 + v})`); gr.addColorStop(0.85, `rgb(${base[0] + 8 + v},${base[1] + 8 + v},${base[2] + 9 + v})`); gr.addColorStop(1, `rgb(${base[0] + 16 + v},${base[1] + 16 + v},${base[2] + 17 + v})`);
      g.fillStyle = gr; g.fillRect(x + 1, y, cw - 2, ch);
      // the interlock: a raised roll down one side of each tile, a channel down the other
      g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(x + cw * 0.62, y, cw * 0.1, ch); g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x + cw * 0.72, y, 3, ch);
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x, y, 2, ch);
      g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(x, y + ch - 7, cw, 7);       // the shadow of this tile's nose on the course below
      g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(x, y + ch - 10, cw, 3);
    }
    speckle(g, w, h, 2600, ['rgba(255,255,255,0.06)', 'rgba(0,0,0,0.10)', 'rgba(140,150,150,0.08)'], 2);
  }));
}
// natural slate (the clubhouse), slate grey
export function slateTex() {
  seed(91);
  return rep(canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#3f4044'; g.fillRect(0, 0, w, h);
    const ch = h / 6, cw = w / 4;
    for (let r = 0; r < 6; r++) for (let c = -1; c < 5; c++) { const x = c * cw + (r % 2) * cw / 2, y = r * ch, v = R() * 16 - 8;
      g.fillStyle = `rgb(${77 + v},${78 + v},${82 + v})`; g.fillRect(x + 2, y, cw - 3, ch - 3);
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(x, y + ch - 4, cw, 4); }
    speckle(g, w, h, 1500, ['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.1)']);
  }));
}
// COMPOSITE DECKING: dark grey boards 140 mm wide along u (1 m square), grooved edges, an embossed woodgrain
export function deckTex(base = [92, 92, 92]) {
  seed(55);
  return rep(canvasTex(512, 512, (g, w, h) => {
    const n = 7, bw = h / n;
    for (let i = 0; i < n; i++) { const y = i * bw, v = R() * 10 - 5;
      g.fillStyle = `rgb(${base[0] + v},${base[1] + v},${base[2] + v + 1})`; g.fillRect(0, y, w, bw);
      for (let j = 0; j < 40; j++) { g.strokeStyle = R() < 0.5 ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.06)'; g.lineWidth = 1 + R(); const yy = y + 4 + R() * (bw - 8); g.beginPath(); g.moveTo(0, yy); g.bezierCurveTo(w * 0.3, yy + R() * 4 - 2, w * 0.7, yy + R() * 4 - 2, w, yy); g.stroke(); }
      for (let k = 0; k < 4; k++) { const yy = y + bw * (0.2 + k * 0.2); g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(0, yy, w, 2); }   // the ribbed top
      g.fillStyle = 'rgba(15,15,15,0.85)'; g.fillRect(0, y + bw - 4, w, 4);      // the gap between boards
      g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(0, y, w, 2);
      if (i % 3 === 0) { g.fillStyle = 'rgba(10,10,10,0.6)'; g.fillRect((i * 173) % w, y, 3, bw); }
    }
  }));
}

// ---------------------------------------------------------------- inside
// greige carpet (0.5 m square): a soft twist pile
export function carpetTex(base = [184, 176, 164]) {
  seed(3);
  return rep(canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = `rgb(${base.join(',')})`; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { const v = R() * 34 - 17; g.fillStyle = `rgba(${base[0] + v},${base[1] + v},${base[2] + v - 2},0.55)`; g.fillRect(R() * w, R() * h, 1.5, 1.5); }
    for (let i = 0; i < 400; i++) { g.fillStyle = 'rgba(90,80,70,0.12)'; g.fillRect(R() * w, R() * h, 2, 1); }
  }));
}
// light-oak-effect vinyl planks: 1.2 m square tile, planks 180 mm x 1.2 m staggered, grain and knots
export function vinylTex() {
  seed(17);
  return rep(canvasTex(512, 512, (g, w, h) => {
    const n = 7, ph = h / n, cols = [[185, 146, 95], [192, 154, 102], [176, 138, 88], [198, 160, 108], [181, 142, 92]];
    for (let r = 0; r < n; r++) { const off = [0, 0.5, 0.25, 0.75, 0.4, 0.9, 0.15][r] * w;
      for (let s = -1; s < 2; s++) { const x0 = off + s * w, c = cols[(r * 3 + s + 5) % cols.length];
        g.fillStyle = `rgb(${c.join(',')})`; g.fillRect(x0, r * ph, w, ph);
        for (let j = 0; j < 26; j++) { g.strokeStyle = `rgba(${R() < 0.5 ? '110,75,40' : '220,190,140'},${0.10 + R() * 0.15})`; g.lineWidth = 0.6 + R() * 1.4; const yy = r * ph + 2 + R() * (ph - 4); g.beginPath(); g.moveTo(x0, yy); g.bezierCurveTo(x0 + w * 0.3, yy + R() * 6 - 3, x0 + w * 0.6, yy + R() * 6 - 3, x0 + w, yy + R() * 4 - 2); g.stroke(); }
        if (R() < 0.5) { const kx = x0 + R() * w, ky = r * ph + ph / 2; g.fillStyle = 'rgba(100,60,25,0.35)'; g.beginPath(); g.ellipse(kx, ky, 6, 3, 0, 0, 7); g.fill(); }
        g.fillStyle = 'rgba(60,40,20,0.45)'; g.fillRect(x0, r * ph, 2, ph); }
      g.fillStyle = 'rgba(60,40,20,0.4)'; g.fillRect(0, r * ph, w, 2); g.fillStyle = 'rgba(255,240,210,0.15)'; g.fillRect(0, r * ph + 2, w, 1); }
  }));
}
// charcoal vertical slatted acoustic panel (0.6 m square): oak-less, matt charcoal slats on black felt
export function slatTex(slat = [84, 87, 92]) {
  seed(23);
  return rep(canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#121214'; g.fillRect(0, 0, w, h);
    const n = 10, sw = w / n;
    for (let i = 0; i < n; i++) { const x = i * sw, v = R() * 8 - 4, gr = g.createLinearGradient(x, 0, x + sw * 0.72, 0);
      gr.addColorStop(0, `rgb(${slat[0] + 14 + v},${slat[1] + 14 + v},${slat[2] + 14 + v})`); gr.addColorStop(0.5, `rgb(${slat[0] + v},${slat[1] + v},${slat[2] + v})`); gr.addColorStop(1, `rgb(${slat[0] - 12 + v},${slat[1] - 12 + v},${slat[2] - 12 + v})`);
      g.fillStyle = gr; g.fillRect(x + sw * 0.14, 0, sw * 0.72, h);
      for (let j = 0; j < 8; j++) { g.fillStyle = 'rgba(255,255,255,0.03)'; g.fillRect(x + sw * 0.14 + R() * sw * 0.6, R() * h, 1, 30 + R() * 60); } }
  }));
}
// white tongue-and-groove ceiling boards (1 m square), boards 100 mm
export function tngTex(base = '#f6f3ec') {
  return rep(canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += h / 10) { g.fillStyle = 'rgba(120,105,80,0.22)'; g.fillRect(0, y, w, 2); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(0, y + 2, w, 1); }
  }));
}
// marble-effect tiles: white/beige marble with soft grey veins. cols x rows tiles in the 1 m square
export function marbleTex({ base = '#f2efe9', vein = 'rgba(120,118,115,', cols = 2, rows = 4, grout = 'rgba(150,145,135,0.6)' } = {}) {
  seed(cols * 13 + rows);
  return rep(canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 30; i++) { const gr = g.createRadialGradient(R() * w, R() * h, 0, R() * w, R() * h, 60 + R() * 120); gr.addColorStop(0, 'rgba(255,255,255,0.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    for (let i = 0; i < 9; i++) { let x = R() * w, y = R() * h; g.strokeStyle = vein + (0.15 + R() * 0.3) + ')'; g.lineWidth = 0.6 + R() * 1.8; g.beginPath(); g.moveTo(x, y);
      for (let j = 0; j < 14; j++) { x += R() * 50 - 15; y += R() * 40 - 20; g.lineTo(x, y); } g.stroke(); }
    g.fillStyle = grout; for (let c = 0; c <= cols; c++) g.fillRect(c * w / cols - 1, 0, 2, h); for (let r = 0; r <= rows; r++) g.fillRect(0, r * h / rows - 1, w, 2);
  }));
}
// a feature wallpaper-free paint finish is plain colour; this is the grey shiplap (horizontal boards, 1 m square)
export function shiplapTex(base = [188, 186, 180]) {
  return rep(canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = `rgb(${base.join(',')})`; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += h / 6) { g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(0, y, w, 3); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, y + 3, w, 1); }
  }));
}

// ---------------------------------------------------------------- the grounds
// a neat, vivid green lawn (looks almost artificial), 2 m square with faint mower stripes
export function lawnTex(base = [95, 168, 58], stripes = true) {
  seed(base[0]);
  return rep(canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = `rgb(${base.join(',')})`; g.fillRect(0, 0, w, h);
    if (stripes) { g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(0, 0, w / 2, h); }
    for (let i = 0; i < 5200; i++) { const v = R() * 40 - 20; g.fillStyle = `rgba(${base[0] + v},${base[1] + v * 1.2},${base[2] + v * 0.6},0.7)`; g.fillRect(R() * w, R() * h, 1, 2 + R() * 2); }
  }));
}
// block paving (stretcher bond, 200 x 100 mm), pale grey; 1 m square
export function pavingTex(base = [185, 183, 177]) {
  seed(9);
  return rep(canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = 'rgb(140,138,132)'; g.fillRect(0, 0, w, h);
    const bw = w / 5, bh = h / 10;
    for (let r = 0; r < 10; r++) for (let c = -1; c < 6; c++) { const x = c * bw + (r % 2) * bw / 2, y = r * bh, v = R() * 18 - 9;
      g.fillStyle = `rgb(${base[0] + v},${base[1] + v},${base[2] + v})`; g.fillRect(x + 1.5, y + 1.5, bw - 3, bh - 3); }
    speckle(g, w, h, 1200, ['rgba(0,0,0,0.07)', 'rgba(255,255,255,0.08)'], 1.5);
  }));
}
// pale concrete slabs (600 mm), 1.2 m square
export function slabTex(base = [214, 210, 200]) {
  seed(4);
  return rep(canvasTex(256, 256, (g, w, h) => {
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { const v = R() * 10 - 5; g.fillStyle = `rgb(${base[0] + v},${base[1] + v},${base[2] + v})`; g.fillRect(c * w / 2, r * h / 2, w / 2, h / 2); }
    speckle(g, w, h, 2500, ['rgba(0,0,0,0.06)', 'rgba(255,255,255,0.1)'], 1.5);
    g.fillStyle = 'rgba(90,88,80,0.5)'; g.fillRect(0, 0, w, 2); g.fillRect(0, h / 2 - 1, w, 2); g.fillRect(0, 0, 2, h); g.fillRect(w / 2 - 1, 0, 2, h);
  }));
}
// dark tarmac (4 m square)
export function tarmacTex() {
  seed(66);
  return rep(canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#3e3f41'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 16000, ['rgba(90,90,92,0.6)', 'rgba(20,20,22,0.5)', 'rgba(120,118,112,0.35)'], 1.5);
    for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(25,25,27,0.35)'; g.lineWidth = 1; g.beginPath(); let x = R() * w, y = R() * h; g.moveTo(x, y); for (let j = 0; j < 8; j++) { x += R() * 40 - 20; y += R() * 40 - 20; g.lineTo(x, y); } g.stroke(); }
  }));
}
// smooth white-painted concrete (the sea wall), 2 m square: faint board marks and weathering
export function renderTex(base = [242, 242, 238]) {
  seed(13);
  return rep(canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = `rgb(${base.join(',')})`; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 1800, ['rgba(0,0,0,0.025)', 'rgba(255,255,255,0.4)'], 2);
    for (let y = 0; y < h; y += 64) { g.fillStyle = 'rgba(0,0,0,0.03)'; g.fillRect(0, y, w, 1); }
  }));
}
export function sandTex() {
  seed(29);
  return rep(canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#e2c17e'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 9) { g.strokeStyle = 'rgba(160,120,60,0.12)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.05 + y) * 3); g.stroke(); }
    speckle(g, w, h, 4000, ['rgba(255,255,255,0.18)', 'rgba(120,90,50,0.16)', 'rgba(80,70,60,0.12)'], 1.5);
  }));
}
// a clipped hedge (privet), 1 m square
export function hedgeTex(base = [52, 92, 40]) {
  seed(41);
  return rep(canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = `rgb(${base[0] - 22},${base[1] - 30},${base[2] - 18})`; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 3200; i++) { const v = R() * 50 - 22; g.fillStyle = `rgb(${base[0] + v},${base[1] + v * 1.3},${base[2] + v * 0.5})`; g.beginPath(); g.ellipse(R() * w, R() * h, 3 + R() * 3, 2 + R() * 2, R() * 3, 0, 7); g.fill(); }
  }));
}
// red-orange facing brick (the clubhouse piers), 1 m square
export function brickTex(base = [168, 87, 58]) {
  seed(37);
  return rep(canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#d8cfc0'; g.fillRect(0, 0, w, h);
    const bw = w / 4.4, bh = h / 13.3;
    for (let r = 0; r < 14; r++) for (let c = -1; c < 6; c++) { const x = c * bw + (r % 2) * bw / 2, y = r * bh, v = R() * 26 - 13;
      g.fillStyle = `rgb(${base[0] + v},${base[1] + v * 0.7},${base[2] + v * 0.5})`; g.fillRect(x + 2, y + 2, bw - 4, bh - 4); }
    speckle(g, w, h, 900, ['rgba(0,0,0,0.12)'], 2);
  }));
}
// the pool's water (looked at from above: turquoise with caustic ripples)
export function poolTex() {
  seed(61);
  return rep(canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#3fa7d6'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(220,250,255,${0.15 + R() * 0.2})`; g.lineWidth = 1 + R() * 2; g.beginPath(); const x = R() * w, y = R() * h; g.moveTo(x, y); g.bezierCurveTo(x + 20, y - 10, x + 30, y + 14, x + 50, y + 2); g.stroke(); }
  }));
}

// ---------------------------------------------------------------- signs
// the scallop shell (a fan of ribs) at (cx, cy), radius r
function shell(g, cx, cy, r, col) {
  g.save(); g.fillStyle = col; g.strokeStyle = col;
  g.beginPath(); g.moveTo(cx, cy + r * 0.08);
  for (let i = 0; i <= 9; i++) { const a = Math.PI * (1.08 + i * 0.84 / 9) - 0.0, a2 = a + Math.PI * 0.84 / 18; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.95); if (i < 9) g.quadraticCurveTo(cx + Math.cos(a2) * r * 1.07, cy + Math.sin(a2) * r * 1.02, cx + Math.cos(a + Math.PI * 0.84 / 9) * r, cy + Math.sin(a + Math.PI * 0.84 / 9) * r * 0.95); }
  g.closePath(); g.fill();
  g.globalCompositeOperation = 'destination-out'; g.lineWidth = r * 0.035;
  for (let i = 1; i < 9; i++) { const a = Math.PI * (1.08 + i * 0.84 / 9); g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r * 0.97, cy + Math.sin(a) * r * 0.93); g.stroke(); }
  g.globalCompositeOperation = 'source-over';
  g.fillRect(cx - r * 0.22, cy, r * 0.44, r * 0.12); g.beginPath(); g.moveTo(cx - r * 0.32, cy + r * 0.12); g.lineTo(cx + r * 0.32, cy + r * 0.12); g.lineTo(cx + r * 0.2, cy + r * 0.24); g.lineTo(cx - r * 0.2, cy + r * 0.24); g.fill();
  g.restore();
}
const SERIF = '"Georgia", "Times New Roman", serif';
// the SANDY BAY sign: turquoise, the white shell above the serif wordmark, a strapline
export function logoTex({ w = 1024, h = 640, bg = '#5ec8c8', fg = '#ffffff', line = 'A luxury residential resort', sub = '' } = {}) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = Math.max(4, w * 0.006); g.strokeRect(w * 0.03, h * 0.04, w * 0.94, h * 0.92);
    shell(g, w / 2, h * 0.36, h * 0.2, fg);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `400 ${Math.round(h * 0.16)}px ${SERIF}`; const t = 'SANDY BAY'; g.save(); g.translate(w / 2, h * 0.58);
    const sp = h * 0.02; let tw = 0; for (const c of t) tw += g.measureText(c).width + sp; let x = -tw / 2; for (const c of t) { const cw = g.measureText(c).width; g.fillText(c, x + cw / 2, 0); x += cw + sp; } g.restore();
    g.font = `italic 400 ${Math.round(h * 0.075)}px ${SERIF}`; g.fillText(line, w / 2, h * 0.75);
    if (sub) { g.font = `700 ${Math.round(h * 0.06)}px Arial`; g.fillText(sub, w / 2, h * 0.87); }
  });
}
// a plain modern sign in the park's style: slate grey (or turquoise) panel, white serif / sans caps
export function parkSignTex(lines, { w = 768, h = 256, bg = '#4a4e55', fg = '#ffffff', shellCol = '#6dcfcf', serif = true } = {}) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = shellCol; g.fillRect(0, h - h * 0.06, w, h * 0.06);
    const sh = h * 0.28; shell(g, h * 0.36, h * 0.52, sh, shellCol);
    g.fillStyle = fg; g.textAlign = 'left'; g.textBaseline = 'middle';
    const L = Array.isArray(lines) ? lines : [lines], n = L.length;
    L.forEach((t, i) => { const big = i === 0, size = big ? h * (n > 1 ? 0.26 : 0.34) : h * 0.14; g.font = `${big ? 400 : 700} ${Math.round(size)}px ${big && serif ? SERIF : 'Arial'}`;
      let s = size; while (g.measureText(t).width > w - h * 0.8 && s > 10) { s -= 2; g.font = `${big ? 400 : 700} ${Math.round(s)}px ${big && serif ? SERIF : 'Arial'}`; }
      g.fillText(t, h * 0.72, h * (n === 1 ? 0.5 : 0.36 + i * 0.3)); });
  });
}
// a street name plate (white, black letters, the shell)
export function streetTex(name) {
  return canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1a1a1a'; g.lineWidth = 6; g.strokeRect(5, 5, w - 10, h - 10);
    shell(g, 56, 70, 34, '#5ec8c8');
    g.fillStyle = '#1a1a1a'; g.font = `400 54px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(name.toUpperCase(), w / 2 + 34, h / 2 + 2);
  });
}
// a big modern wall clock face (white, slim black hands and batons)
export function clockTex() {
  return canvasTex(256, 256, (g, w) => {
    g.fillStyle = '#f7f6f2'; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 2, 0, 7); g.fill();
    g.fillStyle = '#1e1e20'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.save(); g.translate(w / 2 + Math.sin(a) * w * 0.4, w / 2 - Math.cos(a) * w * 0.4); g.rotate(a); g.fillRect(-2, -10, 4, i % 3 ? 14 : 22); g.restore(); }
    g.strokeStyle = '#1e1e20'; g.lineCap = 'round'; g.lineWidth = 7; g.beginPath(); g.moveTo(w / 2, w / 2); g.lineTo(w / 2 + w * 0.2, w / 2 + w * 0.08); g.stroke();       // ~1:58
    g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, w / 2); g.lineTo(w / 2 - w * 0.06, w / 2 - w * 0.36); g.stroke();
    g.fillStyle = '#c8102e'; g.fillRect(w / 2 - 1, w / 2 - w * 0.38, 2, w * 0.44);
    g.font = '700 14px Arial'; g.textAlign = 'center'; g.fillStyle = '#888'; g.fillText("NAN O'CLOCK", w / 2, w * 0.7);
  });
}
// the view on the telly: a Christmas film, paused
export function tvTex() {
  return canvasTex(512, 288, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#0d1a3a'); sky.addColorStop(1, '#3a4a7a'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.fillStyle = '#eef4ff'; g.fillRect(0, h * 0.78, w, h * 0.22);
    for (let i = 0; i < 70; i++) { g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(R() * w, R() * h * 0.8, 1 + R() * 2, 0, 7); g.fill(); }
    g.fillStyle = '#5a2a1a'; g.fillRect(w * 0.55, h * 0.45, w * 0.3, h * 0.33); g.fillStyle = '#e8e8f0'; g.beginPath(); g.moveTo(w * 0.52, h * 0.47); g.lineTo(w * 0.7, h * 0.28); g.lineTo(w * 0.88, h * 0.47); g.fill();
    g.fillStyle = '#ffd36a'; g.fillRect(w * 0.6, h * 0.55, w * 0.06, h * 0.08); g.fillRect(w * 0.74, h * 0.55, w * 0.06, h * 0.08);
    g.fillStyle = '#1a3a1a'; g.beginPath(); g.moveTo(w * 0.2, h * 0.3); g.lineTo(w * 0.3, h * 0.78); g.lineTo(w * 0.1, h * 0.78); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(0, h - 26, w, 26); g.fillStyle = '#fff'; g.font = '700 15px Arial'; g.fillText('❚❚  PAUSED · NAN HAS GONE TO FIND THE CHOCOLATES', 14, h - 9);
  });
}
// a framed abstract print (modern greige/teal/mustard shapes)
export function printTex(seedN = 1) {
  seed(seedN * 101);
  return canvasTex(256, 320, (g, w, h) => {
    g.fillStyle = '#efebe4'; g.fillRect(0, 0, w, h);
    const C = ['#2f6d73', '#d9a441', '#b8ad9e', '#3a3d42', '#c9826b'];
    for (let i = 0; i < 5; i++) { g.fillStyle = C[(i + seedN) % C.length]; g.globalAlpha = 0.85; g.beginPath(); const x = 40 + R() * 170, y = 50 + R() * 220, r = 30 + R() * 60; if (i % 2) g.arc(x, y, r, 0, 7); else g.ellipse(x, y, r * 1.3, r * 0.6, R() * 3, 0, 7); g.fill(); }
    g.globalAlpha = 1; g.strokeStyle = '#3a3d42'; g.lineWidth = 3; g.beginPath(); g.moveTo(30, 260); g.bezierCurveTo(90, 180, 160, 300, 226, 120); g.stroke();
  });
}
export { FONT };
