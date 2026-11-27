// Nan's hunger (in every game: Joan gets HANGRY), FEED NAN (keep her fed for three minutes) and FLING THE FAMILY
// (launch everyone down the garden; the furthest fling wins).
import * as THREE from 'three';
import { FOODS } from '../config.js';
import { FAMILY } from './family.js';
import { SWEETS } from './xfood.js';

const _v = new THREE.Vector3(), _w = new THREE.Vector3();
const WANTS = ['qstreet', 'celebration', 'mincepie', 'choc', 'baileys', 'selectbox', 'sherry', 'pigblanket', 'roastie', 'pudding'];
const label = (t) => (FOODS[t] && FOODS[t].label) || t;

// ---------------- Nan's hunger: a meter that creeps up; feed her to bring it down ----------------
export class NanHunger {
  constructor(game, { rate = 1 / 150, start = 0.25 } = {}) {
    this.g = game; this.v = start; this.rate = rate; this.want = WANTS[Math.floor(Math.random() * 4)]; this.fed = 0; this.lineT = 0; this.melt = false;
    this.on = game.me !== 'joan';
  }
  get joan() { return this.g.who('joan'); }
  edible(it) { return it && !it.dead && FOODS[it.type] && !it.def.prop && !it.def.veg; }
  update(dt, paused = false) {
    if (!this.on) return;
    if (!paused) this.v = Math.min(1.05, this.v + this.rate * dt);
    const j = this.joan; if (!j) return;
    this.lineT -= dt;
    if (this.v > 0.75 && this.lineT <= 0) { this.lineT = 9 + Math.random() * 6; j.say('hangry', 4); }
    // VR: hold something tasty up to her face and she has it
    for (const h of this.g.player.hands) if (h.tracked && this.edible(h.held) && j.headPos(_v).distanceTo(h.held.pos) < 0.4) this.feed(h.held);
  }
  // she eats it: the right thing knocks a big chunk off, any sweet a good bit, anything else a little
  feed(it) {
    const g = this.g, j = this.joan; if (!j || !this.edible(it)) return false;
    for (const h of g.player.hands) if (h.held === it) h.held = null; if (g.player.flatHolder && g.player.flatHolder.held === it) g.player.flatHolder.held = null;
    const head = j.headPos(_v).clone();
    const wanted = it.type === this.want, sweet = SWEETS.includes(it.type);
    const drop = wanted ? 0.45 : sweet ? 0.25 : 0.12;
    this.v = Math.max(0, this.v - drop); this.fed++;
    g.items.remove(it); g.items.queueRespawn(it.type, 4);
    g.sfx('chomp', head, 1); g.crumbs.burst(head, ['#6a3a1a', '#d4a21a', '#ffffff'], 26, 1.4);
    g.words.show(wanted ? 'JUST WHAT SHE WANTED!' : sweet ? 'NAN IS PLEASED!' : 'NAN ATE IT ANYWAY', head.clone().add({ x: 0, y: 0.35, z: 0 }), wanted ? '#ffd400' : '#ffffff', 0.18, 1.4);
    j.say('fed', 4);
    if (wanted || Math.random() < 0.5) this.want = WANTS[Math.floor(Math.random() * WANTS.length)];
    this.onFed && this.onFed(it, wanted);
    return true;
  }
  // sweets thrown to Nan: she catches them
  onHitWith(c, it) { if (!this.on || c.id !== 'joan' || !this.edible(it)) return false; return this.feed(it); }
  // phone: holding food, tap Nan to hand it to her
  onTapPerson(c) { const it = this.g.player.flatHolder && this.g.player.flatHolder.held; if (!this.on || c.id !== 'joan' || !this.edible(it)) return false; return this.feed(it); }
  get wantLabel() { return this.on ? label(this.want) : ''; }
}

// ---------------- FEED NAN: three minutes, keep her from going full hangry ----------------
export class Hangry {
  constructor(game) {
    this.g = game; this.t = 180; this.hunger = new NanHunger(game, { rate: 1 / 40, start: 0.35 }); this.score = 0;
    this.hunger.onFed = (it, wanted) => { this.score += wanted ? 3 : 1; };
    this.g.hud.objective('FEED NAN! Bring her what she wants before she goes full HANGRY');
  }
  start() { this.started = true; const j = this.hunger.joan; if (j) { const q = this.g.room.quiz; if (q && q.host) { j.active = false; this.seat = q.host; } j.say('hangry', 5); } this.g.hud.toast('🍫 Nan is getting HANGRY. Find her what she asks for: tap her (or throw it) to give it to her!', 6); }
  update(dt) {
    if (!this.started) return;
    const h = this.hunger; this.t -= dt;
    h.rate = 1 / Math.max(20, 55 - (180 - this.t) * 0.15);      // (she gets hungrier faster as the afternoon goes on)
    h.update(dt);
    const j = h.joan; if (j && this.seat && !j.down) j.backTo(this.seat.x, this.seat.z, this.seat.yaw, true);
    this.g.hud.hangry(h.v, h.wantLabel);
    this.g.hud.objective(`FEED NAN · ${Math.max(0, Math.ceil(this.t))}s · fed ${h.fed}`);
    if (h.v >= 1) return this.end(false);
    if (this.t <= 0) this.end(true);
  }
  onTapPerson(c) { return this.hunger.onTapPerson(c); }
  onHitWith(c, it) { return this.hunger.onHitWith(c, it); }
  end(won) {
    const j = this.hunger.joan;
    if (!won && j) { j.say("THAT'S IT! NOBODY IS GETTING ANY PRESENTS!", 6); for (const c of this.g.cast) if (c !== j && c.pos.distanceTo(j.pos) < 4) setTimeout(() => c.knockOut && c.knockOut('hit'), 400 + Math.random() * 900); }
    this.g.over(won ? 'NAN SURVIVED CHRISTMAS 🎄' : 'NAN WENT FULL HANGRY 😡', [
      won ? 'You kept Nan fed for the whole afternoon.' : 'Nan has gone full hangry. Everyone has been told off. Even Jimmy.',
      `Treats delivered: ${this.hunger.fed}`, `Points: ${this.score}`, won ? 'Nan: "Ooh, you ARE good to me."' : 'Nan: "And you can tell Michael to stop laughing."']);
  }
}

// ---------------- FLING THE FAMILY: the garden, everyone queues up, you launch them down the lawn ----------------
export class Fling {
  constructor(game) {
    this.g = game; this.queue = game.cast.slice(); this.results = []; this.cur = null; this.flying = null; this.power = 0; this.pt = 0; this.tapReach = 2;
    const r = game.room, L = r.lawn || { x0: -3, x1: 3, z0: -8, z1: -2 };
    this.lawn = L; const gs = r.gardenStart || { x: (L.x0 + L.x1) / 2, z: L.z1 + 1, yaw: 0 };
    this.start0 = gs;
    // which way down the lawn: from the start spot towards the lawn's far side
    const cx = (L.x0 + L.x1) / 2, cz = (L.z0 + L.z1) / 2; this.dir = new THREE.Vector3(cx - gs.x, 0, cz - gs.z); if (this.dir.lengthSq() < 0.01) this.dir.set(0, 0, -1); this.dir.normalize();
    game.hud.objective('FLING THE FAMILY · tap whoever is in front of you to launch them');
  }
  start() {
    this.started = true; const p = this.g.player, s = this.start0;
    p.rig.position.set(s.x, 0, s.z); p.flatYaw = Math.atan2(-this.dir.x, -this.dir.z) - p.rig.rotation.y;
    // everyone lines up beside you
    const side = new THREE.Vector3(-this.dir.z, 0, this.dir.x);
    this.queue.forEach((c, i) => { c.active = false; const q = _v.set(s.x, 0, s.z).addScaledVector(side, 1.2 + i * 0.6).addScaledVector(this.dir, -0.6); c.spot = { x: q.x, z: q.z }; c.goTo(q.x, q.z, 1.2); });
    this.next();
  }
  next() {
    this.cur = this.queue.shift() || null;
    if (!this.cur) return this.finish();
    const s = this.start0, at = _v.set(s.x, 0, s.z).addScaledVector(this.dir, 1.1); this.at = { x: at.x, z: at.z };
    this.cur.goTo(at.x, at.z, 1.3);
    this.g.hud.toast(`${this.cur.name} is up!`, 2);
  }
  update(dt) {
    if (!this.started) return;
    const g = this.g; this.pt += dt; this.power = 0.5 - 0.5 * Math.cos(this.pt * 3.2);
    if (this.cur && !this.flying) {
      const c = this.cur; if (c.state === 'idle' && !c.down) { c.faceYaw = Math.atan2(g.player.head.x - c.pos.x, g.player.head.z - c.pos.z); if (Math.hypot(c.rag.root.x - this.at.x, c.rag.root.z - this.at.z) > 0.3) c.backTo(this.at.x, this.at.z, c.faceYaw); }
      // VR: grabbed and let go = launched by hand
      if (c.state === 'grabbed') this.wasGrabbed = true; else if (this.wasGrabbed && c.down) { this.wasGrabbed = false; this.launched(c); }
      const bars = Math.round(this.power * 10); g.hud.objective(`FLING THE FAMILY · ${c.name} · POWER ${'▮'.repeat(bars)}${'▯'.repeat(10 - bars)}`);
    }
    if (this.flying) {
      const f = this.flying, c = f.c; f.t += dt;
      const p = c.rag.pos('pelvis', _w); let sp = 0; for (const pt of c.rag.list) { const v = pt.body.velocity; sp = Math.max(sp, Math.hypot(v.x, v.y, v.z)); }
      f.still = sp < 0.6 ? f.still + dt : 0;
      if ((f.still > 0.5 && f.t > 1) || f.t > 7) {
        const d = Math.hypot(p.x - f.x, p.z - f.z); this.results.push({ name: c.name, d });
        g.words.show(d.toFixed(1) + ' m!', p.clone().add({ x: 0, y: 0.8, z: 0 }), '#ffd400', 0.3, 2);
        g.sfx(d > 6 ? 'cheer' : 'crowd_ooh', null, 0.7);
        const fan = g.cast.find(x => x !== c && !x.down); fan && fan.say(d > 6 ? 'What a fling!' : 'Is that it?', 3);
        c.active = false; this.flying = null; this.cur = null; setTimeout(() => { if (c.spot) c.goTo(c.spot.x, c.spot.z, 1); }, 2500);
        setTimeout(() => this.next(), 900);
      }
    }
  }
  onTapPerson(c) {
    if (c !== this.cur || this.flying) return true;
    c.knockOut('launched');
    const v = 5 + this.power * 11, up = 3.5 + this.power * 4;
    for (const pt of c.rag.list) pt.body.velocity.set(this.dir.x * v, up, this.dir.z * v);
    this.g.sfx('punch', c.pos, 1); this.g.words.show(this.power > 0.85 ? 'MEGA FLING!' : 'FLING!', c.pos.clone().add({ x: 0, y: 1, z: 0 }), '#ff5a36', 0.28, 1.2);
    this.launched(c); return true;
  }
  launched(c) { const p = c.rag.pos('pelvis', _w); this.flying = { c, x: this.at ? this.at.x : p.x, z: this.at ? this.at.z : p.z, t: 0, still: 0 }; }
  finish() {
    const r = this.results.slice().sort((a, b) => b.d - a.d), tot = r.reduce((s, x) => s + x.d, 0);
    this.g.over('FLING THE FAMILY 🚀', [`Furthest fling: ${r[0] ? r[0].name + ' — ' + r[0].d.toFixed(1) + ' m' : '—'}`, ...r.slice(1, 4).map(x => `${x.name}: ${x.d.toFixed(1)} m`), `Total: ${tot.toFixed(1)} m`, 'Nan: "You\'ll be clearing that lawn up."']);
  }
}
