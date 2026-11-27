// Canvas textures for Nan's old house (Tewkes Road): flowery wallpaper, a swirly Axminster carpet, frosty grass,
// pebbledash, lino, the gas fire, the Hangry-O-Meter, a Quality Street "sewing kit" tin, neighbours' windows with
// a Christmas tree in them... all drawn at load time, no image files.
import * as THREE from 'three';
import { canvasTex } from '../textures.js';

let _seed = 12345;
const rnd = () => (_seed = (_seed * 16807) % 2147483647) / 2147483647;
const once = (f) => { let t = null; return () => t || (t = f()); };

// cream wallpaper with trailing pink cabbage roses and gold pinstripes (the front room)
export const roseWallTex = once(() => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#efe3c8'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 64) { g.fillStyle = 'rgba(190,150,80,0.35)'; g.fillRect(x + 30, 0, 2, h); g.fillRect(x + 35, 0, 1, h); }
  const rose = (x, y, r) => {
    for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(90,120,60,0.85)'; g.save(); g.translate(x, y); g.rotate(i * 2.1 + 0.4); g.beginPath(); g.ellipse(r * 1.5, 0, r * 0.9, r * 0.38, 0, 0, 7); g.fill(); g.restore(); }
    g.fillStyle = '#c8687a'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.strokeStyle = '#9a3a4e'; g.lineWidth = 1.5; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x, y, r * (0.85 - i * 0.25), i, i + 4.2); g.stroke(); }
    g.fillStyle = '#e8a0aa'; g.beginPath(); g.arc(x - r * 0.25, y - r * 0.3, r * 0.3, 0, 7); g.fill();
  };
  g.strokeStyle = 'rgba(100,130,70,0.7)'; g.lineWidth = 2;
  for (let y = -20; y < h + 20; y += 128) { g.beginPath(); g.moveTo(0, y + 40); g.bezierCurveTo(64, y, 128, y + 90, 256, y + 40); g.stroke(); }
  for (const [x, y, r] of [[40, 40, 13], [170, 70, 11], [105, 150, 14], [230, 190, 12], [20, 220, 10], [150, 245, 9]]) rose(x, y, r);
  for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(200,120,130,0.5)'; g.beginPath(); g.arc(rnd() * w, rnd() * h, 2, 0, 7); g.fill(); }
}));
// a dark green regency stripe with little gold fleurs (the back room)
export const stripeWallTex = once(() => canvasTex(128, 256, (g, w, h) => {
  g.fillStyle = '#3e5a46'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#4c6c54'; g.fillRect(0, 0, 40, h); g.fillStyle = 'rgba(214,180,100,0.7)'; g.fillRect(40, 0, 3, h); g.fillRect(84, 0, 3, h);
  for (let y = 16; y < h; y += 64) { g.fillStyle = '#c8a860'; g.beginPath(); g.moveTo(64, y); g.lineTo(70, y + 10); g.lineTo(64, y + 20); g.lineTo(58, y + 10); g.fill(); g.beginPath(); g.arc(64, y + 26, 2.5, 0, 7); g.fill(); }
}));
// magnolia woodchip (the hall and stairs)
export const woodchipTex = once(() => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#f1e8d2'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) { const v = rnd(); g.fillStyle = v < 0.5 ? 'rgba(150,130,90,0.18)' : 'rgba(255,255,250,0.5)'; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2.5, 1 + rnd() * 2); }
}));
// embossed anaglypta under the dado (painted cream)
export const anaglyptaTex = once(() => canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 16; x < w; x += 32) { g.strokeStyle = 'rgba(255,255,245,0.8)'; g.lineWidth = 2; g.beginPath(); g.arc(x + 1, y + 1, 9, 0, 7); g.stroke(); g.strokeStyle = 'rgba(140,120,80,0.35)'; g.beginPath(); g.arc(x, y, 9, 0, 7); g.stroke(); }
}));
// a 1970s Axminster: deep red with gold and green swirling medallions
export function axminsterTex(base = '#6a1a1e', a = '#c8962e', b = '#2e4a32', c = '#a83a2a') {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,0.15)' : 'rgba(255,200,150,0.06)'; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
    const med = (x, y) => {
      g.strokeStyle = a; g.lineWidth = 5; for (let i = 0; i < 6; i++) { const t = i / 6 * Math.PI * 2; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + Math.cos(t) * 30, y + Math.sin(t) * 30, x + Math.cos(t + 0.8) * 46, y + Math.sin(t + 0.8) * 46, x + Math.cos(t + 1.2) * 34, y + Math.sin(t + 1.2) * 34); g.stroke(); }
      g.fillStyle = b; for (let i = 0; i < 8; i++) { const t = i / 8 * Math.PI * 2; g.beginPath(); g.ellipse(x + Math.cos(t) * 18, y + Math.sin(t) * 18, 9, 4, t, 0, 7); g.fill(); }
      g.fillStyle = c; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); g.fillStyle = a; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill();
    };
    med(64, 64); med(192, 192); med(192, 64); med(64, 192);
    g.strokeStyle = 'rgba(200,150,46,0.5)'; g.lineWidth = 2; for (const [x, y] of [[128, 0], [0, 128], [128, 256], [256, 128], [128, 128]]) { g.beginPath(); g.arc(x, y, 14, 0, 7); g.stroke(); }
  });
}
// the stair runner pattern is a colour, but the hall runner on the floor gets a border and a pattern
export const hallRunnerTex = once(() => canvasTex(128, 256, (g, w, h) => {
  g.fillStyle = '#7a2230'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8962e'; g.fillRect(8, 0, 5, h); g.fillRect(w - 13, 0, 5, h);
  for (let y = 20; y < h; y += 48) { g.strokeStyle = '#c8962e'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, y); g.lineTo(w / 2 + 22, y + 16); g.lineTo(w / 2, y + 32); g.lineTo(w / 2 - 22, y + 16); g.closePath(); g.stroke(); g.fillStyle = '#2e4a32'; g.beginPath(); g.arc(w / 2, y + 16, 6, 0, 7); g.fill(); }
}));
// kitchen lino: brown and cream "tiles"
export const linoTex = once(() => canvasTex(256, 256, (g, w, h) => {
  for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.fillStyle = ((x + y) / 64) % 2 ? '#d8c8a0' : '#8a5a34'; g.fillRect(x, y, 64, 64); g.fillStyle = ((x + y) / 64) % 2 ? '#8a5a34' : '#d8c8a0'; g.beginPath(); g.arc(x + 32, y + 32, 9, 0, 7); g.fill(); }
  for (let i = 0; i < 900; i++) { g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(rnd() * w, rnd() * h, 3, 3); }
}));
// kitchen wall tiles: white with the odd brown "harvest" motif tile
export const kitchenTileTex = once(() => canvasTex(256, 256, (g, w, h) => {
  for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) {
    g.fillStyle = '#f4f0e6'; g.fillRect(x, y, 32, 32);
    if ((x * 7 + y * 3) % 11 === 0) { g.fillStyle = '#a0602a'; g.beginPath(); g.ellipse(x + 16, y + 18, 7, 9, 0, 0, 7); g.fill(); g.fillStyle = '#5a8a2a'; g.fillRect(x + 15, y + 6, 2, 6); }
    g.strokeStyle = '#c8c0b0'; g.lineWidth = 1.5; g.strokeRect(x, y, 32, 32);
  }
}));
// frosty grass: green with a white sugar frost, a bit thinner where the sun's been on it
export const frostGrassTex = once(() => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#5f7f48'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 4000; i++) { g.fillStyle = ['#4e6e3a', '#6a8a50', '#587a42', '#7a9a62'][i % 4]; g.fillRect(rnd() * w, rnd() * h, 1.5, 3 + rnd() * 3); }
  for (let i = 0; i < 5200; i++) { g.fillStyle = `rgba(235,242,250,${0.25 + rnd() * 0.45})`; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 1.5, 1 + rnd() * 2); }
  for (let i = 0; i < 8; i++) { const x = rnd() * w, y = rnd() * h, r = 20 + rnd() * 30, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(230,238,245,0.35)'); gr.addColorStop(1, 'rgba(230,238,245,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
}));
// pebbledash render (the top half of the 1930s houses)
export const pebbledashTex = once(() => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#d8cfbc'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 7000; i++) { const v = 150 + Math.floor(rnd() * 90); g.fillStyle = `rgb(${v},${v - 8},${v - 22})`; g.beginPath(); g.arc(rnd() * w, rnd() * h, 0.8 + rnd() * 1.6, 0, 7); g.fill(); }
}));
// frosty roof tiles (concrete interlocking, white in the shade)
export const frostRoofTex = once(() => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#5a4a44'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 21) for (let x = -((y / 21) % 2) * 16; x < w; x += 32) { const v = rnd() * 16 - 8; g.fillStyle = `rgb(${104 + v},${86 + v},${78 + v})`; g.fillRect(x + 1, y + 1, 30, 18); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x + 1, y + 17, 30, 3); }
  for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(232,238,246,${0.2 + rnd() * 0.4})`; g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); }
}));
export const pavingTex = once(() => canvasTex(256, 256, (g, w, h) => {
  for (let y = 0; y < h; y += 128) for (let x = 0; x < w; x += 128) { const v = 160 + Math.floor(rnd() * 24); g.fillStyle = `rgb(${v},${v - 4},${v - 10})`; g.fillRect(x, y, 128, 128); for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(0,0,0,0.07)'; g.fillRect(x + rnd() * 128, y + rnd() * 128, 2, 2); } }
  g.strokeStyle = '#6a6660'; g.lineWidth = 3; for (let p = 0; p <= w; p += 128) { g.beginPath(); g.moveTo(p, 0); g.lineTo(p, h); g.stroke(); g.beginPath(); g.moveTo(0, p); g.lineTo(w, p); g.stroke(); }
  for (let i = 0; i < 900; i++) { g.fillStyle = 'rgba(240,245,250,0.3)'; g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); }
}));
export const tarmacTex = once(() => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#3c3d40'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { const v = 40 + Math.floor(rnd() * 60); g.fillStyle = `rgb(${v},${v},${v + 3})`; g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); }
  for (let i = 0; i < 600; i++) { g.fillStyle = 'rgba(220,228,236,0.25)'; g.fillRect(rnd() * w, rnd() * h, 1.2, 1.2); }
}));
export const gravelTex = once(() => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#b8ab92'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 4000; i++) { const v = 120 + Math.floor(rnd() * 110); g.fillStyle = `rgb(${v},${v - 8},${v - 24})`; g.beginPath(); g.arc(rnd() * w, rnd() * h, 1 + rnd() * 2.2, 0, 7); g.fill(); }
}));
// white lace net curtains (see-through)
export const laceTex = once(() => canvasTex(256, 256, (g, w, h) => {
  g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(250,248,242,0.62)'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 2;
  for (let y = 8; y < h; y += 24) for (let x = (y / 24 % 2) * 12; x < w; x += 24) { g.beginPath(); g.arc(x, y, 7, 0, 7); g.stroke(); g.beginPath(); g.arc(x, y, 2, 0, 7); g.stroke(); }
  for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 8, h); g.stroke(); }
  for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(w / 2, h * 0.45, 30 + i * 14, 50 + i * 16, 0, 0, 7); g.stroke(); }
}));
export const frostedGlassTex = once(() => canvasTex(128, 256, (g, w, h) => {
  g.fillStyle = '#c8d4d0'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? '255,255,255' : '120,140,135'},0.3)`; g.beginPath(); g.arc(rnd() * w, rnd() * h, 1 + rnd() * 3, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 3; for (let y = 20; y < h; y += 40) { g.beginPath(); g.moveTo(10, y); g.quadraticCurveTo(w / 2, y + 20, w - 10, y); g.stroke(); }
}));
// someone else's front window at Christmas: warm room, a tree with lights, curtains open
export function xmasWindowTex(v = 0) {
  return canvasTex(128, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, ['#3a2a22', '#2a2a3a', '#3a3222'][v % 3]); gr.addColorStop(1, ['#6a4a2a', '#4a3a4a', '#5a4a2a'][v % 3]); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,220,150,0.25)'; g.beginPath(); g.arc(w * 0.5, h * 0.15, 30, 0, 7); g.fill();
    if (v % 2 === 0) { const tx = v % 4 ? w * 0.3 : w * 0.7; g.fillStyle = '#1e3a22'; g.beginPath(); g.moveTo(tx, h * 0.25); g.lineTo(tx + 28, h * 0.95); g.lineTo(tx - 28, h * 0.95); g.fill();
      for (let i = 0; i < 22; i++) { const t = rnd(), x = tx + (rnd() - 0.5) * 50 * t, y = h * 0.28 + t * h * 0.65; g.fillStyle = ['#ffd84a', '#ff4a4a', '#6ab8ff', '#7aff7a', '#ffffff'][i % 5]; g.beginPath(); g.arc(x, y, 2.4, 0, 7); g.fill(); } }
    g.fillStyle = ['#7a2a2a', '#c8b89a', '#3a4a6a'][v % 3]; g.fillRect(0, 0, 16, h); g.fillRect(w - 16, 0, 16, h);
    g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, 0, w, h * 0.4);
  });
}
// the view out of a window (by day): frosty garden or the street
export function gardenViewTex() {
  return canvasTex(256, 192, (g, w, h) => {
    const s = g.createLinearGradient(0, 0, 0, h * 0.6); s.addColorStop(0, '#8ab4dc'); s.addColorStop(1, '#e8e4dc'); g.fillStyle = s; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7a5a3a'; g.fillRect(0, h * 0.5, w, h * 0.1); g.fillStyle = '#8a9a80'; g.fillRect(0, h * 0.6, w, h * 0.4);
    for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(240,244,250,0.5)'; g.fillRect(rnd() * w, h * 0.6 + rnd() * h * 0.4, 2, 1); }
  });
}
// the gas fire's radiants, glowing
export const fireTex = once(() => canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#1a0c06'; g.fillRect(0, 0, w, h);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 3; r++) { const x = 8 + c * 30, y = 30 + r * 30, gr = g.createLinearGradient(x, y + 26, x, y); gr.addColorStop(0, '#ff5a10'); gr.addColorStop(0.6, '#ffb040'); gr.addColorStop(1, '#ffe8a0'); g.fillStyle = gr; g.fillRect(x, y, 22, 26); g.fillStyle = 'rgba(80,20,0,0.5)'; for (let k = 0; k < 4; k++) g.fillRect(x, y + 5 + k * 6, 22, 1.5); }
  g.fillStyle = '#4a9aff'; for (let x = 6; x < w - 6; x += 8) { g.beginPath(); g.ellipse(x, 120, 3, 5, 0, 0, 7); g.fill(); }
}));
export function clockFaceTex(roman = true) {
  return canvasTex(128, 128, (g) => {
    g.fillStyle = '#fbf6e8'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.strokeStyle = '#8a6a2a'; g.lineWidth = 4; g.stroke();
    g.fillStyle = '#222'; g.font = '700 15px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const N = roman ? ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'] : ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
    N.forEach((t, i) => { const a = i / 12 * Math.PI * 2; g.fillText(t, 64 + Math.sin(a) * 47, 64 - Math.cos(a) * 47); });
    // ten to two (nearly dinner!)
    g.strokeStyle = '#111'; g.lineWidth = 5; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.sin(1.9 / 12 * 6.283) * 26, 64 - Math.cos(1.9 / 12 * 6.283) * 26); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.sin(50 / 60 * 6.283) * 40, 64 - Math.cos(50 / 60 * 6.283) * 40); g.stroke();
  });
}
// THE HANGRY-O-METER: a big gauge with the needle in the red
export const hangryTex = once(() => canvasTex(512, 420, (g, w, h) => {
  g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2a2a'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#c62828'; g.font = '900 46px Arial Black, Arial'; g.textAlign = 'center'; g.fillText("NAN'S HANGRY-O-METER", w / 2, 60);
  const cx = w / 2, cy = 330, R = 200, bands = [['#4caf50', 'FED'], ['#cddc39', 'PECKISH'], ['#ffc107', 'WHERE\'S MY DINNER'], ['#ff7043', 'HANGRY'], ['#b71c1c', 'DO NOT APPROACH']];
  bands.forEach(([c, t], i) => { const a0 = Math.PI + i * Math.PI / 5, a1 = a0 + Math.PI / 5; g.fillStyle = c; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a0, a1); g.closePath(); g.fill();
    g.save(); g.translate(cx, cy); g.rotate((a0 + a1) / 2 + Math.PI / 2); g.fillStyle = '#111'; g.font = `900 ${t.length > 10 ? 17 : 22}px Arial`; g.fillText(t, 0, -R + 40); g.restore(); });
  g.fillStyle = '#fffaf0'; g.beginPath(); g.arc(cx, cy, 70, 0, 7); g.fill();
  const na = Math.PI * 1.88; g.strokeStyle = '#111'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(na) * (R - 20), cy + Math.sin(na) * (R - 20)); g.stroke();
  g.fillStyle = '#111'; g.beginPath(); g.arc(cx, cy, 16, 0, 7); g.fill();
  g.font = '700 22px Arial'; g.fillText('CURRENT READING: 1:58pm', cx, cy + 60);
}));
// the purple Quality Street tin, relabelled SEWING KIT in biro
export const tinTex = once(() => canvasTex(512, 128, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5a1a8a'); gr.addColorStop(1, '#3a0a5a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) { g.fillStyle = ['#ffd400', '#ff4a8a', '#4ad8ff', '#7aff4a', '#ff8a1a'][i % 5]; g.beginPath(); g.ellipse(20 + i * 19, i % 2 ? 22 : 106, 9, 6, i, 0, 7); g.fill(); }
  g.fillStyle = '#fffbe8'; g.fillRect(130, 34, 250, 60); g.strokeStyle = '#1a3aa8'; g.lineWidth = 3; g.strokeRect(130, 34, 250, 60);
  g.fillStyle = '#1a3aa8'; g.font = 'italic 700 38px "Comic Sans MS", cursive'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SEWING KIT', 255, 66);
}));
// the green bag-for-life
export const bagTex = once(() => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#2e8a3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 64px Arial Black, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ASDA', w / 2, 90);
  g.font = '900 24px Arial'; g.fillText('BAG FOR LIFE', w / 2, 140); g.font = '700 17px Arial'; g.fillText("(LISA'S. ALL 46 OF THEM)", w / 2, 180);
}));
// a Christmas card front: robin / tree / snowman / holly on one of a few colours
export function cardTex(v) {
  return canvasTex(64, 96, (g, w, h) => {
    g.fillStyle = ['#b71c1c', '#1b5e20', '#0d2a5a', '#f4f0e6', '#6a1b4a'][v % 5]; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#d4af37'; g.lineWidth = 3; g.strokeRect(3, 3, w - 6, h - 6);
    const k = v % 4;
    if (k === 0) { g.fillStyle = '#6a4a2a'; g.beginPath(); g.arc(32, 52, 16, 0, 7); g.fill(); g.fillStyle = '#e8401a'; g.beginPath(); g.arc(36, 56, 9, 0, 7); g.fill(); g.fillStyle = '#111'; g.fillRect(20, 46, 3, 3); }
    else if (k === 1) { g.fillStyle = '#2e7d32'; g.beginPath(); g.moveTo(32, 18); g.lineTo(50, 74); g.lineTo(14, 74); g.fill(); g.fillStyle = '#ffd400'; g.beginPath(); g.arc(32, 18, 5, 0, 7); g.fill(); }
    else if (k === 2) { g.fillStyle = '#fff'; g.beginPath(); g.arc(32, 62, 15, 0, 7); g.arc(32, 38, 10, 0, 7); g.fill(); g.fillStyle = '#ff7a1a'; g.fillRect(32, 37, 7, 3); }
    else { g.fillStyle = '#2e7d32'; g.beginPath(); g.ellipse(24, 48, 12, 6, 0.6, 0, 7); g.ellipse(40, 48, 12, 6, -0.6, 0, 7); g.fill(); g.fillStyle = '#d32f2f'; g.beginPath(); g.arc(32, 52, 5, 0, 7); g.fill(); }
    g.fillStyle = v % 5 === 3 ? '#b71c1c' : '#fff'; g.font = '700 10px Georgia'; g.textAlign = 'center'; g.fillText('Merry Xmas', 32, 88);
  });
}
// the display cabinet's back: patterned mirror-ish with plates
export const cabinetBackTex = once(() => canvasTex(128, 256, (g, w, h) => {
  g.fillStyle = '#d8d0c0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(rnd() * w, rnd() * h, 2, 8); }
}));
// a wreath for front doors
export const wreathTex = once(() => canvasTex(128, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) { const a = rnd() * Math.PI * 2, r = 34 + rnd() * 22; g.fillStyle = ['#1e4a22', '#2a5a2a', '#3a6a30'][i % 3]; g.beginPath(); g.ellipse(64 + Math.cos(a) * r, 64 + Math.sin(a) * r, 9, 4, a + 1.2, 0, 7); g.fill(); }
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28, r = 46; g.fillStyle = '#c62828'; g.beginPath(); g.arc(64 + Math.cos(a) * r, 64 + Math.sin(a) * r, 4.5, 0, 7); g.fill(); }
  g.fillStyle = '#c62828'; g.beginPath(); g.moveTo(64, 102); g.lineTo(44, 92); g.lineTo(44, 120); g.closePath(); g.fill(); g.beginPath(); g.moveTo(64, 102); g.lineTo(84, 92); g.lineTo(84, 120); g.closePath(); g.fill();
}));
// street sign: white with black capitals, a red borough line
export function streetSignTex(name, sub) {
  return canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = '#f8f8f4'; g.fillRect(0, 0, w, h); g.strokeStyle = '#111'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#111'; g.font = '700 62px "Helvetica Neue", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(name, w / 2, 54);
    g.fillStyle = '#c62828'; g.font = '700 22px Arial'; g.fillText(sub, w / 2, 102);
  });
}
// a number plate
export function carPlateTex(t) {
  return canvasTex(256, 56, (g, w, h) => { g.fillStyle = '#f7d117'; g.fillRect(0, 0, w, h); g.fillStyle = '#111'; g.font = '700 38px "Arial Narrow", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, w / 2, h / 2 + 2); });
}
export { THREE };
