// Nan's new house (Sandy Bay) — placeholder: a bare room until the real level is built.
import { Kit, carpetTex } from './kit.js';

export function buildSandyBay(scene) {
  const k = new Kit(scene, { x0: -5, x1: 5, z0: -5, z1: 5, y1: 2.5 });
  k.floor(-5, -5, 5, 5, carpetTex());
  k.perimeter();
  k.ceiling();
  return k.finish({ name: "Nan's new house (Sandy Bay)", start: { x: 0, z: 2, yaw: 0 } });
}
