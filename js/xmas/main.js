// CHRISTMAS DAY AT NAN'S: the game.
// The menu (menu.js) picks who you are, which house and what to play; this builds the house, brings the family in,
// and runs the loop. The engine underneath (ragdolls, gait, physics, hands, food, level kit) is Ronnie Simulator's.
import * as THREE from 'three';
import { TUNING } from '../config.js';
import { ItemManager } from '../foods.js';
import { Character } from '../character.js';
import { Crumbs, Words, Tint } from '../fx.js';
import { Player } from '../player.js';
import { initAudio, sfx, setListener, setAmbience, setMuted } from '../audio.js';
import { createPhysics } from '../physics.js';
import { setupTouch } from '../touch.js';
import { preloadModels, FLOOR } from '../ragdoll.js';
import { SQUAD, SquadMember } from '../squad.js';
import { mergeMaterialGroups, atlasSigns } from '../perf.js';
import * as quality from '../quality.js';
import { buildSandyBay } from '../levels/sandybay.js';
import { buildTewkesRoad } from '../levels/tewkes.js';
import { FAMILY, FAMILY_IDS, TEAMS, HOST } from './family.js';
import { addChristmasFood, XMAS_SPREAD, SWEETS } from './xfood.js';
import { Quiz } from './quiz.js';
import { Hangry, Fling } from './games.js';
import { Hud } from './hud.js';

addChristmasFood();
// the family join the squad list, so they're built exactly like Ronnie Simulator's characters
for (const id of FAMILY_IDS) { const f = FAMILY[id]; SQUAD[id] = { ...f, look: { skin: 0xf1c3a5, top: 0xaa2222, bottom: 0x222233 }, body: { h: f.h }, title: '', fail: '' }; }

const SEL = await window.xmasMenu;      // { me, place, mode }
const ME = SEL.me;
const MODEL_LOAD = preloadModels(FAMILY_IDS.filter(id => id !== ME).map(id => FAMILY[id].model));
window.__ls && window.__ls('family');
await Promise.race([MODEL_LOAD, new Promise(r => setTimeout(r, 25000))]);
window.__ls && window.__ls('house');
await new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));

// ---------------- renderer / scene ----------------
const renderer = new THREE.WebGLRenderer({ antialias: quality.antialias(), powerPreference: 'high-performance' });
renderer.setPixelRatio(quality.pixelRatio());
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
renderer.xr.setFoveation(1);
document.getElementById('app').appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb8c8e0);
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 120);

const BUILD = { sandybay: buildSandyBay, tewkes: buildTewkesRoad };
const room = (BUILD[SEL.place] || buildSandyBay)(scene);
room.placeId = SEL.place;
atlasSigns(scene); mergeMaterialGroups(scene);
FLOOR.at = room.floorAt || null;
if (room.shadows) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
quality.attach({ renderer, scene, camera, room });
room.camera = camera;
room.start = room.start || { x: 0, z: 0, yaw: 0 };

// ---------------- you ----------------
const player = new Player(renderer, scene, camera);
player.rig.position.set(room.start.x, 0, room.start.z);
player.rig.rotation.y = room.start.yaw;
const items = new ItemManager(scene, room);
{ const before = scene.onBeforeRender; scene.onBeforeRender = function (r, sc, cam, ...a) { if (before) before.call(this, r, sc, cam, ...a); try { items.syncDraw(cam); } catch (e) {} }; }
player.items = items;
const physics = createPhysics(room);
player.setPhysics(physics);
player.room = room;

// the Christmas spread: food on every table and counter
{ const spots = (room.spawns || []).slice().sort(() => Math.random() - 0.5); let i = 0;
  for (const s of spots) items.spawn(XMAS_SPREAD[i++ % XMAS_SPREAD.length], s);
  items.minFood = Math.min(60, spots.length); items.respawnDelay = 6; }
// Nan's chocolate tin
if (room.stash) for (let i = 0; i < 5; i++) items.spawn(['qstreet', 'celebration', 'qstreet', 'choc', 'qstreet'][i], new THREE.Vector3(room.stash.x + (i - 2) * 0.035, room.stash.y + 0.03, room.stash.z));

// ---------------- the family ----------------
const cast = []; player.cast = cast;
const gameStub = { running: true };
const spots = (room.tommySpots || []).slice();
FAMILY_IDS.filter(id => id !== ME).forEach((id, i) => {
  const s = spots[(i * 3) % Math.max(1, spots.length)] || { x: room.start.x + i * 0.6, y: room.start.z - 2 };
  const c = new SquadMember(scene, room, physics, id, [s.x, s.y, Math.random() * 6], gameStub);
  c.fam = FAMILY[id];
  cast.push(c);
});
const who = (id) => cast.find(c => c.id === id) || null;
Character.hearers = () => [player.head];

// ---------------- effects ----------------
const crumbs = new Crumbs(scene);
const words = new Words(scene); words.camera = camera;
const tint = new Tint(camera);
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _q = new THREE.Quaternion();

// ---------------- the game ----------------
const hud = new Hud({ me: ME, mode: SEL.mode, place: SEL.place, onPause: () => setPaused(!paused) });
const G = { time: 0, over: false };
const ctx = { head: player.head, fwd: player.fwd, player, items };
const game = { scene, camera, renderer, room, player, items, cast, who, words, crumbs, tint, hud, sfx, me: ME, G, physics,
  say: (id, bank, pri) => { const c = who(id); return c ? c.say(bank, pri) : false; },
  over: (title, lines) => gameOver(title, lines) };
let mode = null;
if (SEL.mode === 'quiz' || SEL.mode === 'quick') mode = new Quiz(game, { quick: SEL.mode === 'quick' });
else if (SEL.mode === 'hangry') mode = new Hangry(game);
else if (SEL.mode === 'fling') mode = new Fling(game);
hud.setMode(SEL.mode);
window.XM = { game, mode, cast, player, room, scene, renderer, camera, items, sim: (dt) => frame(dt) };

// ---------------- eating ----------------
const SNACK_WORDS = { mincepie: ['MINCE PIE!', 'FESTIVE!'], pigblanket: ['PIGGY!', 'BLANKET!'], roastie: ['CRUNCH!', 'ROASTIE!'], turkeyleg: ['GOBBLE!', 'TURKEY!'], pudding: ['PUD!', 'BRANDY!'],
  qstreet: ['THE PURPLE ONE!', 'QUALITY!'], celebration: ['CELEBRATE!', 'MINI!'], selectbox: ['SELECTION!', 'ALL OF IT!'], sprout: ['SPROUT?!', 'WHY?!'], choc: ['CHOC!'], sausageroll: ['ROLL!'] };
let lastBite = -1;
function mouthGap(it) {
  it.obj.updateMatrixWorld(true); _a.setFromMatrixPosition(it.obj.matrixWorld);
  return Math.max(0, _a.distanceTo(player.mouth) - it.radius * 0.8);
}
function bite(it, hand) {
  if (G.time - lastBite < TUNING.biteCooldown) return;
  lastBite = G.time;
  const at = _b.copy(player.head).addScaledVector(player.fwd, 0.7);
  if (it.def.cracker) { pullCracker(it); return; }
  if (it.def.prop) return;
  it.bitesLeft--;
  const fx = _a.copy(player.mouth).addScaledVector(player.fwd, 0.12);
  sfx(it.def.drink ? 'slurp' : 'chomp', fx, 1);
  if (!it.def.drink) crumbs.burst(fx, ['#d9a05b', '#8a5a2a', '#f2d8a0'], 22, 1.4, player.fwd);
  const w = SNACK_WORDS[it.type] || ['NOM!', 'MMMM!'];
  words.show(w[Math.floor(Math.random() * w.length)], at.add({ x: 0, y: 0.05, z: 0 }), '#ffd400', 0.12, 1.0, 'eat');
  hand && hand.pulse && hand.pulse(0.9, 70);
  mode && mode.onAte && mode.onAte(it);
  if (it.type === 'sprout' && Math.random() < 0.6) setTimeout(() => { const c = cast[Math.floor(Math.random() * cast.length)]; c && c.say("Who actually EATS the sprouts?", 3); }, 600);
  if (it.bitesLeft <= 0) {
    setTimeout(() => sfx('gulp', null, 1), 220);
    for (const h of player.hands) if (h.held === it) h.held = null; if (player.flatHolder && player.flatHolder.held === it) player.flatHolder.held = null;
    items.remove(it); items.queueRespawn(it.type);
  } else it.obj.scale.setScalar(0.55 + 0.45 * it.eatFraction);
}
// a cracker: pull it (EAT with it in your hand, or bring it to your mouth in VR): BANG, a hat, a joke
const CRACKER_JOKES = ['What do you call Santa\'s helpers? Subordinate Clauses.', 'Why did the turkey join the band? It had the drumsticks.', 'What do snowmen eat for breakfast? Frosties.',
  'Who hides in the bakery at Christmas? A mince spy.', 'What do you get if you eat Christmas decorations? Tinsel-itis.', 'Why is Michael like a Christmas card? He turns up at the wrong house.',
  'What does Nan call a late dinner? A declaration of war.', 'What\'s Jimmy\'s favourite carol? "O Come All Ye Tall".', 'How does Lisa get to work? On the Asda-bus.'];
function pullCracker(it) {
  sfx('popout', it.pos, 1); sfx('crowd_laugh', null, 0.4);
  crumbs.burst(it.pos.clone(), ['#ff3030', '#ffd400', '#30c060', '#ffffff'], 40, 2.2);
  words.show('BANG!', it.pos.clone().add({ x: 0, y: 0.25, z: 0 }), '#ff3030', 0.2, 1.2);
  for (const h of player.hands) if (h.held === it) h.held = null; if (player.flatHolder && player.flatHolder.held === it) player.flatHolder.held = null;
  items.remove(it); items.queueRespawn('cracker');
  hud.toast('🎉 ' + CRACKER_JOKES[Math.floor(Math.random() * CRACKER_JOKES.length)], 5);
  const near = cast.filter(c => c.pos.distanceTo(player.head) < 5); if (near.length) setTimeout(() => near[0].say(['Groan.', 'That is TERRIBLE.', 'Hahaha! No.', 'Put your hat on!'][Math.floor(Math.random() * 4)], 3), 1200);
}

// thrown things hit people (light ones shove, hard ones knock them flat); sweets thrown to Nan are caught and eaten
function hits() {
  for (let i = items.items.length - 1; i >= 0; i--) {
    const it = items.items[i];
    if (it.dead || it.heldBy || it.resting || !it.thrownByPlayer || it.vel.lengthSq() < 1.2) continue;
    _b.addVectors(it.prev, it.pos).multiplyScalar(0.5);
    let part = null, c = null;
    for (const x of cast) { part = x.partAt(it.pos, it.radius + 0.04) || x.partAt(_b, it.radius + 0.04); if (part) { c = x; break; } }
    if (!part) continue;
    if (mode && mode.onHitWith && mode.onHitWith(c, it)) continue;      // (Feed Nan: she catches it)
    _a.copy(it.vel).multiplyScalar(it.def.mass * 6);
    const res = c.hitBy(part, it.pos, _a, false);
    sfx('splat', it.pos, res === 'ko' ? 1 : 0.6);
    words.show(res === 'ko' ? ['WALLOP!', 'SPLAT!', 'POW!'][Math.floor(Math.random() * 3)] : 'SPLAT!', it.pos.clone().add({ x: 0, y: 0.25, z: 0 }), res === 'ko' ? '#ff5a36' : '#ff9a36', res === 'ko' ? 0.25 : 0.16, 1.1);
    it.vel.multiplyScalar(-0.25); it.thrownByPlayer = false;
  }
}
// VR: swinging a hand into someone
function slaps() {
  for (const h of player.hands) {
    if (!h.tracked || h.held || h.heldPart || h.speed < 1.4) continue;
    for (const c of cast) { const part = c.partAt(h.pos, 0.09); if (!part) continue;
      const res = c.slap(part, h.pos, h.vel); if (res) { sfx(res === 'ko' ? 'punch' : 'slap', h.pos, 1); words.show(res === 'ko' ? 'WALLOP!' : 'SLAP!', h.pos.clone().add({ x: 0, y: 0.25, z: 0 }), '#ff5a36', 0.2, 1); h.pulse(1, 80); }
      break; }
  }
}

// ---------------- phone / tablet / computer ----------------
const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
const touch = setupTouch({
  canvas: renderer.domElement,
  onUserGesture: () => initAudio(),
  onMove: (x, z) => { if (player.flatMode) { player.flatMove.x = x; player.flatMove.z = z; } },
  onLook: (dx, dy) => { if (!player.flatMode || G.over) return; player.flatYaw -= dx; player.flatPitch = THREE.MathUtils.clamp(player.flatPitch - dy, -1.35, 1.35); },
  onEat: () => { const h = player.flatHolder?.held; if (!h) return; if (h.def.cracker) { pullCracker(h); return; } player.flatEat(); },
  onThrow: () => player.flatThrow(),
  onEmote: () => {},
  onZoom: () => false,
  onSprint: () => { player.sprint = !player.sprint; return player.sprint; },
  onTap: (x, y) => {
    if (!player.flatMode || G.over) return;
    ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const ray = raycaster.ray, reach = 3;
    let best = null, bd = Infinity;
    for (const it of items.items) { if (it.heldBy || it.dead) continue;
      const along = _a.subVectors(it.pos, ray.origin).dot(ray.direction);
      if (along > 0 && along < bd && ray.distanceSqToPoint(it.pos) < (it.radius + 0.07) ** 2) { bd = along; best = it; } }
    let part = null, c = null;
    for (const x2 of cast) for (const p of x2.rag.list) { const b = p.body.position; _b.set(b.x, b.y, b.z);
      const along = _a.subVectors(_b, ray.origin).dot(ray.direction);
      if (along > 0 && along < bd && ray.distanceSqToPoint(_b) < (p.radius + 0.05) ** 2) { bd = along; part = p; c = x2; best = null; } }
    if (part) {
      if (bd > reach + (mode && mode.tapReach || 0)) { touch.hint(`Get closer to ${c.name}!`); return; }
      if (mode && mode.onTapPerson && mode.onTapPerson(c, part, ray)) return;      // (give Nan a sweet, fling someone)
      const pos = part.body.position; _b.set(pos.x, pos.y, pos.z);
      const res = c.slap(part, _b, _a.copy(ray.direction).multiplyScalar(4.2));
      if (res) { sfx(res === 'ko' ? 'punch' : 'slap', _b, 1); words.show(res === 'ko' ? 'WALLOP!' : 'NUDGE!', _b.clone().add({ x: 0, y: 0.3, z: 0 }), '#ff5a36', 0.22, 1); }
      return;
    }
    if (!best) return;
    if (bd > reach) { touch.hint('Too far — walk closer'); return; }
    player.flatGrab(best);
  },
});
function updateTouchUI() {
  const held = player.flatHolder?.held, eat = document.getElementById('btn-eat');
  if (!eat) return;
  const label = !held ? 'EAT' : held.def.cracker ? 'PULL' : held.def.drink ? 'DRINK' : held.def.prop ? '—' : 'EAT';
  if (eat.textContent !== label) eat.textContent = label;
  eat.classList.toggle('off', !held || (held.def.prop && !held.def.cracker));
  document.getElementById('btn-throw')?.classList.toggle('off', !held);
}
// keyboard on a computer: WASD / arrows to walk (touch.js), E eat, F / space throw, mouse drag to look
function startFlat() {
  initAudio();
  document.body.classList.add('flat', 'playing');
  player.enterFlat();
  touch.show(true);
  hud.show(true);
  mode && mode.start && mode.start();
}

// ---------------- VR ----------------
const vrBtn = document.getElementById('enter-vr');
(async () => {
  if (!('xr' in navigator)) return;
  const ok = await navigator.xr.isSessionSupported('immersive-vr').catch(() => false);
  if (!ok) return;
  vrBtn.hidden = false;
  let session = null;
  vrBtn.addEventListener('click', async () => {
    initAudio();
    if (session) { session.end(); return; }
    try {
      session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] });
      session.addEventListener('end', () => { session = null; document.body.classList.remove('in-vr'); });
      await renderer.xr.setSession(session);
      if (player.flatMode) { player.flatDrop(); player.flatMode = false; if (player.flatGrip) player.flatGrip.visible = false; touch.show(false); }
      document.body.classList.add('in-vr', 'playing');
      hud.show(true); mode && mode.start && !mode.started && mode.start();
    } catch (err) { hud.toast('Could not start VR: ' + err.message, 4); session = null; }
  });
})();
document.getElementById('play-flat').addEventListener('click', () => { document.getElementById('ready-screen').hidden = true; startFlat(); });
if (vrBtn) vrBtn.addEventListener('click', () => { document.getElementById('ready-screen').hidden = true; });

function fitCamera() {
  const aspect = window.innerWidth / window.innerHeight; camera.aspect = aspect;
  const hHalf = Math.tan(THREE.MathUtils.degToRad(37.5));
  camera.fov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(2 * Math.atan(hHalf / aspect)), 60, 100);
  camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight);
}
fitCamera(); window.addEventListener('resize', fitCamera);

// ---------------- pause & the end ----------------
let paused = false;
function setPaused(on) { paused = on; document.body.classList.toggle('paused', on); hud.pause(on, { restart: () => location.reload(), menu: () => { location.href = location.pathname; }, mute: (m) => setMuted(m) }); }
function gameOver(title, lines) {
  if (G.over) return; G.over = true;
  hud.result(title, lines, { again: () => location.reload(), menu: () => { location.href = location.pathname; } });
  sfx('victory', null, 1);
}

// ---------------- the loop ----------------
const clock = new THREE.Clock();
setAmbience('garden', () => player.head);
const menuCam = new THREE.PerspectiveCamera(60, 1, 0.05, 120); let menuT = 0, menuSpot = 0;
document.body.classList.add('ready');
window.__ls && window.__ls('go');
function frame(simDt) {
  const dt = simDt ?? Math.min(clock.getDelta(), 0.05);
  const xr = renderer.xr.isPresenting;
  if (paused && simDt == null && !xr) { renderer.render(scene, camera); return; }
  G.time += dt;
  // waiting on the ready screen: a slow look round the house
  if (!xr && !player.flatMode && simDt == null) {
    menuT -= dt; const sp = room.tommySpots || [];
    if (menuT <= 0 && sp.length) { menuT = 6; menuSpot = (menuSpot + 7) % sp.length; const s = sp[menuSpot]; menuCam.position.set(s.x, 1.6, s.y); menuCam.userData.yaw = Math.random() * 6.28; }
    menuCam.userData.yaw = (menuCam.userData.yaw || 0) + dt * 0.08; menuCam.rotation.set(-0.1, menuCam.userData.yaw, 0, 'YXZ');
    if (menuCam.aspect !== camera.aspect) { menuCam.aspect = camera.aspect; menuCam.fov = camera.fov; menuCam.updateProjectionMatrix(); }
    room.camera = menuCam; room.update && room.update(dt); room.camera = camera;
    for (const c of cast) c.update(dt, { head: menuCam.position, fwd: _a.set(0, 0, -1) });
    renderer.render(scene, menuCam); return;
  }
  player.update(dt, G.time); player.updateFace(dt);
  for (const h of player.flatMode ? [player.flatHolder] : player.hands) { const it = h && h.held; if (!it || it.dead) continue; if (mouthGap(it) < TUNING.mouthRadius) bite(it, h); }
  items.update(dt);
  hits(); if (xr) slaps();
  physics.step(dt);
  if (room.nav) room.nav.spent = 0;
  for (const c of cast) c.update(dt, ctx);
  // nobody walks through anybody (or you)
  for (let i = 0; i < cast.length; i++) {
    const a = cast[i].rag; if (a.mode === 'ragdoll' || cast[i].seated) continue;
    const dxp = a.root.x - player.head.x, dzp = a.root.z - player.head.z, dp = Math.hypot(dxp, dzp);
    if (dp < 0.45 && dp > 1e-3) { a.root.x += dxp / dp * (0.45 - dp); a.root.z += dzp / dp * (0.45 - dp); }
    for (let j = i + 1; j < cast.length; j++) { const b = cast[j].rag; if (b.mode === 'ragdoll' || cast[j].seated) continue;
      const dx = b.root.x - a.root.x, dz = b.root.z - a.root.z, d = Math.hypot(dx, dz);
      if (d < 0.55 && d > 1e-3) { const p = (0.55 - d) / 2 / d; a.root.x -= dx * p; a.root.z -= dz * p; b.root.x += dx * p; b.root.z += dz * p; } }
  }
  if (mode && !G.over) mode.update(dt);
  crumbs.update(dt); words.update(dt); tint.update(dt);
  room.update && room.update(dt);
  setListener(player.head, player.fwd, _b.set(0, 1, 0).applyQuaternion(camera.getWorldQuaternion(_q)));
  if (player.flatMode) updateTouchUI();
  hud.update(dt, mode);
  quality.frame && quality.frame(simDt, false, camera);
  if (simDt == null) renderer.render(scene, camera);
}
renderer.setAnimationLoop(() => { try { frame(); } catch (e) { console.error('frame', e); } });
