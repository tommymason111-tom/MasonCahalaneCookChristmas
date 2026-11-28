// DEVELOPER MODE (Settings cog -> DEVELOPER MODE, the code, then a house): a test bench, the way Ronnie Simulator's is.
// It's free roam (Nan's hunger doesn't run unless you start a game from here), with a green terminal-style DEV
// button at the bottom of the screen that opens the panel:
//   📍 PLACES  jump anywhere: every room and bit of garden the house has (its zones), plus the street
//   👪 FAMILY  pick anyone: bring them to you, make them say something (any of their own lines), fling them, line
//              everyone up in front of you
//   🍗 FOOD    any food or drink in the game straight into your hand (or in front of you in VR)
//   🛠️ TOOLS   walk through walls, walking speed, slow motion, a stats readout (frame rate, draw calls, triangles),
//              the quality tier, carols on/off
//   🔊 SOUNDS  every sound effect by name, with a search box
//   🎮 GAMES   start Feed Nan or Fling the Family here (developer mode stays on), switch house or who you are; in
//              Feed Nan, set Nan's hunger and the clock
// Nothing here changes the game itself; leaving developer mode is just going back to the menu.
import { FOODS } from '../config.js';
import { FAMILY, FAMILY_IDS } from './family.js';
import { SOUND_NAMES, sfx, initAudio } from '../audio.js';
import * as quality from '../quality.js';

const PLACE_NAMES = { lounge: '🛋️ Lounge', kitchen: '🍳 Kitchen', dinner: '🍽️ Dining', hall: '🚪 Hall', study: '💻 Study', bed2: '🛏️ Spare room', bed: '🛏️ Nan\'s room', master: '🛏️ Nan\'s room',
  bath: '🛁 Bathroom', util: '🧺 Utility', utility: '🧺 Utility', deck: '🎄 Deck (front door)', garden: '🌳 Back garden', green: '🟩 The Green', front: '🏡 Front garden', road: '🛣️ Wave Road', pool: '🏊 Clubhouse pool',
  frontroom: '📺 Front room', backroom: '🍽️ Back room', loo: '🚽 Loo', street: '🛣️ The street', patio: '🪴 Patio' };

export function startDev(XM) {
  window.__devMode = true;
  document.body.classList.add('devmode');
  const { player, room, cast, items, game } = XM;
  const st = document.createElement('style'); st.textContent = `
  #dev-btn { position: fixed; left: 50%; bottom: max(14px, env(safe-area-inset-bottom)); transform: translateX(-50%); z-index: 72; font: 900 15px 'Courier New', monospace; letter-spacing: 1px; color: #39ff14; background: rgba(0,10,2,0.92);
    border: 2px solid #39ff14; border-radius: 12px; padding: 10px 18px; box-shadow: 0 0 18px rgba(57,255,20,0.55); cursor: pointer; }
  body.paused #dev-btn, body.paused #dev-panel, body.in-vr #dev-btn, body:not(.playing) #dev-btn, body:not(.playing) #dev-panel, body:not(.playing) #dev-badge, body:not(.playing) #dev-stats { display: none !important; }
  #dev-panel { position: fixed; left: 50%; bottom: calc(max(14px, env(safe-area-inset-bottom)) + 56px); transform: translateX(-50%); width: min(94vw, 560px); max-height: min(60vh, 520px); z-index: 72; display: none; flex-direction: column;
    background: rgba(0,10,2,0.95); border: 2px solid #39ff14; border-radius: 12px; box-shadow: 0 0 30px rgba(57,255,20,0.45), inset 0 0 40px rgba(57,255,20,0.08); color: #b8ffb0; font: 700 14px 'Courier New', monospace; overflow: hidden; }
  #dev-panel::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0 2px, transparent 2px 4px); }
  #dev-panel.on { display: flex; }
  #dev-panel .dv-tabs { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 10px 6px; }
  #dev-panel .dv-tabs button { flex: 1 1 28%; font: 900 13px 'Courier New', monospace; padding: 9px 4px; border-radius: 10px; border: 2px solid #39ff14; background: transparent; color: #39ff14; cursor: pointer; }
  #dev-panel .dv-tabs button.on { background: #39ff14; color: #111; }
  #dev-panel .dv-body { overflow-y: auto; padding: 4px 10px 12px; -webkit-overflow-scrolling: touch; }
  #dev-panel h5 { margin: 10px 2px 6px; color: #39ff14; font: 900 13px 'Courier New', monospace; letter-spacing: 1px; text-shadow: 0 0 6px #39ff14; } #dev-panel h5::before { content: '> '; }
  #dev-panel .dv-row { display: flex; flex-wrap: wrap; gap: 6px; }
  #dev-panel .dv-chip, #dev-panel .dv-act { font: 800 13px 'Courier New', monospace; padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(57,255,20,0.45); background: rgba(57,255,20,0.06); color: #c8ffc0; cursor: pointer; text-align: left; }
  #dev-panel .dv-chip.on { border-color: #39ff14; background: #39ff14; color: #001a00; box-shadow: 0 0 12px #39ff14; }
  #dev-panel .dv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 160px), 1fr)); gap: 6px; }
  #dev-panel .dv-act:active, #dev-panel .dv-chip:active { transform: scale(0.97); }
  #dev-panel .dv-note { color: #6fdf6a; font-weight: 600; font-size: 12px; margin: 2px 2px 6px; } #dev-panel .dv-note::before { content: '// '; }
  #dev-panel .dv-search { width: 100%; box-sizing: border-box; font: 800 14px 'Courier New', monospace; padding: 9px 10px; margin: 2px 0 6px; border-radius: 6px; border: 1px solid #39ff14; background: rgba(0,0,0,0.6); color: #b8ffb0; }
  #dev-stats { position: fixed; left: max(10px, env(safe-area-inset-left)); bottom: calc(max(14px, env(safe-area-inset-bottom)) + 150px); z-index: 71; pointer-events: none; font: 700 12px/1.35 'Courier New', monospace; color: #39ff14;
    background: rgba(0,10,2,0.8); border: 1px solid #39ff14; border-radius: 8px; padding: 6px 8px; white-space: pre; text-shadow: 0 0 4px #39ff14; }
  #dev-badge { position: fixed; top: max(62px, calc(env(safe-area-inset-top) + 58px)); right: max(12px, env(safe-area-inset-right)); z-index: 71; pointer-events: none; font: 900 11px 'Courier New', monospace; color: #001a00; background: #39ff14;
    padding: 3px 7px; border-radius: 6px; box-shadow: 0 0 12px #39ff14; letter-spacing: 1px; }`;
  document.head.appendChild(st);

  const btn = document.createElement('button'); btn.id = 'dev-btn'; btn.textContent = '>_ DEV';
  const panel = document.createElement('div'); panel.id = 'dev-panel';
  const badge = document.createElement('div'); badge.id = 'dev-badge'; badge.textContent = 'DEV MODE';
  document.body.append(btn, panel, badge);
  const stop = (e) => e.stopPropagation();
  for (const ev of ['pointerdown', 'touchstart', 'mousedown', 'wheel']) panel.addEventListener(ev, stop, { passive: true });
  btn.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); panel.classList.toggle('on'); if (panel.classList.contains('on')) draw(); });

  const TABS = [['places', '📍 PLACES'], ['family', '👪 FAMILY'], ['food', '🍗 FOOD'], ['tools', '🛠️ TOOLS'], ['sounds', '🔊 SOUNDS'], ['games', '🎮 GAMES']];
  let tab = 'places', who = cast[0] ? cast[0].id : null, soundQ = '';
  const T = { ghost: false, speed: 1, slow: 1, stats: false };
  const say = (t) => { try { game.hud && game.hud.toast(t, 2.2); } catch (e) {} };
  const front = (d = 1.3) => { const h = player.head, f = player.fwd; return { x: h.x + f.x * d, z: h.z + f.z * d, yaw: Math.atan2(h.x - (h.x + f.x * d), h.z - (h.z + f.z * d)) }; };

  // ---- the places: the house's own zones (their middles), plus where the game starts and the garden start
  const places = () => {
    const out = [], Z = room.zones || {};
    for (const [k, z] of Object.entries(Z)) if (z && Number.isFinite(z.x0)) out.push([k, PLACE_NAMES[k] || ('📍 ' + k), (z.x0 + z.x1) / 2, (z.z0 + z.z1) / 2]);
    if (room.start) out.unshift(['start', '🎬 Where you start', room.start.x, room.start.z]);
    if (room.gardenStart) out.push(['gstart', '🚀 Fling start', room.gardenStart.x, room.gardenStart.z]);
    if (room.placeId === 'sandybay') out.push(['garage', '🚗 Sheds & Nan\'s car', Z.sheds ? (Z.sheds.x0 + Z.drive.x1) / 2 : -9.2, Z.sheds ? Z.sheds.z1 + 0.6 : -5.4], ['pebble', '🛣️ Pebble Road', 6, -23.3], ['sea', '🌊 The sea wall', 50.6, 0]);
    return out;
  };
  const jump = (x, z) => { player.rig.position.x = x; player.rig.position.z = z; player.resetHandHistory && player.resetHandHistory(); };

  const H = { places() {
      return `<div class="dv-note">jump straight there</div><div class="dv-grid">${places().map(([k, n]) => `<button class="dv-act" data-place="${k}">${n}</button>`).join('')}</div>`; },
    family() {
      return `<h5>WHO</h5><div class="dv-row">${cast.map(c => `<button class="dv-chip${c.id === who ? ' on' : ''}" data-who="${c.id}">${(FAMILY[c.id] && FAMILY[c.id].emoji) || '🙂'} ${c.name}</button>`).join('')}</div>
        <h5>DO</h5><div class="dv-grid"><button class="dv-act" data-fam="bring">🧲 Bring them here</button><button class="dv-act" data-fam="talk">💬 Say a line</button><button class="dv-act" data-fam="fling">🚀 Fling them</button><button class="dv-act" data-fam="lineup">👪 Line everyone up</button></div>`; },
    food() {
      const ids = Object.keys(FOODS).filter(k => !FOODS[k].hidden);
      const xmas = ids.filter(k => FOODS[k].xmas), rest = ids.filter(k => !FOODS[k].xmas);
      const b = (k) => `<button class="dv-act" data-food="${k}">${FOODS[k].label || k}</button>`;
      return `<div class="dv-note">straight into your hand</div><h5>CHRISTMAS</h5><div class="dv-grid">${xmas.map(b).join('')}</div><h5>EVERYTHING ELSE</h5><div class="dv-grid">${rest.map(b).join('')}</div>`; },
    tools() {
      const chips = (k, vals, lab) => vals.map(v => `<button class="dv-chip${T[k] === v ? ' on' : ''}" data-tool="${k}" data-v="${v}">${lab(v)}</button>`).join('');
      const q = quality.quality.choice || '';
      return `<h5>WALK THROUGH WALLS</h5><div class="dv-row">${chips('ghost', [false, true], v => v ? 'ON' : 'OFF')}</div>
        <h5>WALKING SPEED</h5><div class="dv-row">${chips('speed', [1, 2, 4], v => v + '×')}</div>
        <h5>SLOW MOTION</h5><div class="dv-row">${chips('slow', [1, 0.5, 0.25], v => v === 1 ? 'OFF' : v + '×')}</div>
        <h5>STATS</h5><div class="dv-row">${chips('stats', [false, true], v => v ? 'ON' : 'OFF')}</div>
        <h5>QUALITY</h5><div class="dv-row">${['auto', 'ultra', 'high', 'medium', 'low'].map(t => `<button class="dv-chip${t === q ? ' on' : ''}" data-q="${t}">${t.toUpperCase()}</button>`).join('')}</div>
        <div class="dv-note">MEDIUM is what a Quest gets</div>`; },
    sounds() {
      const list = SOUND_NAMES.filter(n => !soundQ || n.includes(soundQ.toLowerCase()));
      return `<input class="dv-search" id="dv-sq" placeholder="search ${SOUND_NAMES.length} sounds" value="${soundQ}"><div class="dv-grid">${list.map(n => `<button class="dv-act" data-snd="${n}">▶ ${n}</button>`).join('')}</div>`; },
    games() {
      const m = XM.mode, hg = m && m.hunger;
      return `<h5>START A GAME HERE</h5><div class="dv-grid"><button class="dv-act" data-go="hangry">🍫 Feed Nan</button><button class="dv-act" data-go="fling">🚀 Fling the Family</button><button class="dv-act" data-go="roam">🎁 Free Roam</button></div>
        <h5>HOUSE</h5><div class="dv-grid"><button class="dv-act" data-house="sandybay">🏡 Sandy Bay</button><button class="dv-act" data-house="tewkes">🏠 Tewkes Road</button></div>
        <h5>PLAY AS</h5><div class="dv-row">${FAMILY_IDS.map(id => `<button class="dv-chip${id === game.me ? ' on' : ''}" data-me="${id}">${FAMILY[id].emoji} ${FAMILY[id].name}</button>`).join('')}</div>
        ${hg ? `<h5>NAN'S HUNGER</h5><div class="dv-row">${[0, 0.5, 0.8, 1].map(v => `<button class="dv-chip" data-hunger="${v}">${Math.round(v * 100)}%</button>`).join('')}</div>
        <h5>CLOCK</h5><div class="dv-row"><button class="dv-chip" data-clock="60">+1 MIN</button><button class="dv-chip" data-clock="-60">−1 MIN</button><button class="dv-chip" data-clock="end">END NOW</button></div>` : '<div class="dv-note">start Feed Nan to set Nan\'s hunger and the clock</div>'}`; },
  };
  function draw() {
    panel.innerHTML = `<div class="dv-tabs">${TABS.map(([k, n]) => `<button class="${k === tab ? 'on' : ''}" data-tab="${k}">${n}</button>`).join('')}</div><div class="dv-body">${H[tab]()}</div>`;
    const sq = panel.querySelector('#dv-sq'); if (sq) sq.addEventListener('input', () => { soundQ = sq.value; const pos = sq.selectionStart; draw(); const s2 = panel.querySelector('#dv-sq'); s2.focus(); s2.setSelectionRange(pos, pos); });
  }
  const relaunch = (over) => { const q = new URLSearchParams(location.search); const cur = { me: game.me, place: room.placeId, mode: q.get('mode') || 'roam', ...over };
    try { sessionStorage.setItem('xm_dev', '1'); } catch (e) {} location.href = location.pathname + `?go=1&me=${cur.me}&place=${cur.place}&mode=${cur.mode}`; };

  panel.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return; initAudio();
    const d = b.dataset;
    if (d.tab) { tab = d.tab; draw(); return; }
    if (d.place) { const p = places().find(x => x[0] === d.place); if (p) { jump(p[2], p[3]); say('📍 ' + p[1]); } return; }
    if (d.who) { who = d.who; draw(); return; }
    if (d.fam) { const c = cast.find(x => x.id === who);
      if (d.fam === 'lineup') { cast.forEach((c2, i) => { const f = front(1.6 + 0.0), s = (i - (cast.length - 1) / 2) * 0.75, px = -player.fwd.z, pz = player.fwd.x; c2.rag.placeAt(f.x + px * s, f.z + pz * s, f.yaw); }); say('👪 Everyone lined up'); return; }
      if (!c) return;
      if (d.fam === 'bring') { const f = front(); c.rag.placeAt(f.x, f.z, f.yaw); say('🧲 ' + c.name); }
      if (d.fam === 'talk') { const banks = Object.keys(c.banks || {}); const bank = banks[Math.floor(Math.random() * banks.length)]; if (bank) c.say(bank, 5); }
      if (d.fam === 'fling') { c.knockOut('launched'); const f = player.fwd; for (const pt of c.rag.list) pt.body.velocity.set(f.x * 9, 6, f.z * 9); sfx('punch', c.pos, 1); }
      return; }
    if (d.food) { const f = front(0.6), it = items.spawn(d.food, { x: f.x, y: player.head.y - 0.2, z: f.z });
      if (it && player.flatMode && player.flatGrab) player.flatGrab(it); say('🍗 ' + (FOODS[d.food].label || d.food)); return; }
    if (d.tool) { const k = d.tool, v = d.v === 'true' ? true : d.v === 'false' ? false : +d.v; T[k] = v;
      if (k === 'ghost') player.ghost = v; if (k === 'speed') player.speedMul = v; if (k === 'slow') window.__timeScale = v; if (k === 'stats') stats.style.display = v ? 'block' : 'none';
      draw(); return; }
    if (d.q) { const r = quality.setChoice(d.q); say('✨ Quality: ' + d.q.toUpperCase() + (r && r.nextGame ? ' (characters change next game)' : '')); draw(); return; }
    if (d.snd) { sfx(d.snd, null, 1); return; }
    if (d.go) return relaunch({ mode: d.go });
    if (d.house) return relaunch({ place: d.house });
    if (d.me) return relaunch({ me: d.me, mode: d.me === 'joan' && (new URLSearchParams(location.search).get('mode') === 'hangry') ? 'roam' : undefined });
    if (d.hunger) { const h = XM.mode && XM.mode.hunger; if (h) { h.v = +d.hunger; say('🍫 Nan\'s hunger ' + Math.round(h.v * 100) + '%'); } return; }
    if (d.clock) { const m = XM.mode; if (m && 't' in m) { if (d.clock === 'end') m.t = 0.01; else m.t = Math.max(1, m.t + +d.clock); say('⏱️ ' + Math.ceil(m.t) + 's left'); } return; }
  });

  // ---- the stats readout: frame rate, draw calls, triangles, where you're standing
  const stats = document.createElement('div'); stats.id = 'dev-stats'; stats.style.display = 'none'; document.body.appendChild(stats);
  let n = 0, t0 = performance.now(), fps = 0;
  const tick = () => { n++; const t = performance.now(); if (t - t0 >= 500) { fps = Math.round(n * 1000 / (t - t0)); n = 0; t0 = t;
      if (T.stats) { const r = XM.renderer.info.render, p = player.rig.position; stats.textContent = `FPS   ${fps}\nDRAWS ${r.calls}\nTRIS  ${(r.triangles / 1000).toFixed(0)}k\nTIER  ${(quality.quality.tier || '').toUpperCase()}\nXZ    ${p.x.toFixed(1)}, ${p.z.toFixed(1)}`; } }
    requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  say('>_ DEVELOPER MODE: tap DEV at the bottom');
}
