// The front end, set up like the Boxing Day quiz: title → who are you? → which house? → what are we playing? →
// a quick summary → in. Resolves window.xmasMenu with { me, place, mode }.
// Quick start for testing: ?go=1&me=tommy&place=sandybay&mode=roam
import { FAMILY, TEAMS } from './family.js';

// the game's version (bump this with each update: then run  python3 tools/stamp.py)
export const GAME_VERSION = '1.6.0';
// when each update came out (UK time)
const GAME_WHEN = { '1.6.0': '2026-11-28T11:50', '1.5.1': '2026-11-28T11:15', '1.5.0': '2026-11-28T10:40', '1.4.0': '2026-11-28T10:33', '1.3.0': '2026-11-27T22:02', '1.2.0': '2026-11-27T17:04', '1.1.0': '2026-11-27T16:02', '1.0.0': '2026-11-27T15:51' };
// what's new (newest first): shown under the settings cog
const GAME_UPDATES = [
  ['1.6.0', ['⚙️ A settings cog on the title screen: the version you\'re playing, when it came out and every update', '🔄 The game always runs the newest version: open it and it moves itself onto the latest update',
    '🛠️ DEVELOPER MODE (behind a code): jump to any room, bring, fling or line up the family, any food in your hand, walk through walls, slow motion, a stats readout, every sound, and start any game from there',
    '⏩ No more "Here\'s the plan" screen: straight from Let\'s go to loading']],
  ['1.5.1', ["🚪 Nan's front door is at the lounge end, out onto the decking, like the aerial photo (the road side has a window now)", '👪 Who are you?: just the names, four to a row, so everyone fits on a phone']],
  ['1.5.0', ['🎄 A new look: a winter night sky, frosted cards, fairy lights; nothing cut off on a phone any more', '🏠 A new loading screen: Nan\'s bungalow lighting up, Santa\'s sleigh, a candy-cane bar; the snow keeps falling while it loads', '⏸️ A new pause screen with switches for carols and sound']],
  ['1.4.0', ["🚗 Two garages at the bottom of Nan's garden, her drive down to them and her silver Nissan Micra on it", '🚪 Every door open, swung back against the wall; nothing drawn across a doorway', '🍮 Food you pick up always shows in your hand (the pudding and the selection box used to vanish)', '🟢 The EAT button doesn\'t flicker any more']],
  ['1.3.0', ["🗺️ Nan's plot laid out like the aerial photo: neighbours either side on Wave Road, the long hedge, the green along Pebble Road (Fling the Family is played down it)", '🥽 Quest: the family at full detail up close, sharper on a Quest 3']],
  ['1.2.0', ['🏡 Sandy Bay rebuilt like the real park: Nan\'s modern park home, the streets, the clubhouse and pool, the sea wall']],
  ['1.1.0', ['🎁 No quiz: three games, Feed Nan, Fling the Family and Free Roam', '👪 The Masons, the Cahalanes and the Cooks']],
  ['1.0.0', ["🎄 Christmas Day at Nan's: the family, Nan's new house at Sandy Bay and her old house on Tewkes Road"]],
];


const PLACES = [
  { id: 'sandybay', ico: '🏡', name: "Nan's new house", sub: 'Sandy Bay', desc: 'Nan\'s park home at Sandy Bay, where half the over-60s of Essex are her best friends. Lounge, kitchen-diner, the garden with her garages and her silver Micra, the green out the back, and the neighbours\' lights.' },
  { id: 'tewkes', ico: '🏠', name: "Nan's old house", sub: 'Tewkes Road', desc: 'The family home where Karen and Lisa grew up. Front room with the gas fire, the dining room, the kitchen, the long back garden, and the height marks on the door frame.' },
];
const MODES = [
  { id: 'hangry', ico: '🍫', name: 'Feed Nan', desc: 'Three minutes. Nan is getting HANGRY. Find what she wants and get it to her before she blows.', noJoan: true },
  { id: 'fling', ico: '🚀', name: 'Fling the Family', desc: 'Out in the garden. Everyone queues up; launch them down the lawn. Furthest fling wins.' },
  { id: 'roam', ico: '🎁', name: 'Free Roam', desc: 'No timer. Wander round, eat everything, pull crackers, annoy Michael.' },
];
const GROUPS = [
  { name: 'The Masons', color: TEAMS.mason.color, ids: TEAMS.mason.members },
  { name: 'The Cahalanes', color: TEAMS.cahalane.color, ids: TEAMS.cahalane.members },
  { name: 'Nan (Joan Cook)', color: TEAMS.cook.color, ids: TEAMS.cook.members },
];

const $ = (s) => document.querySelector(s);
const q = new URLSearchParams(location.search);
let saved = {}; try { saved = JSON.parse(localStorage.getItem('xm_menu') || '{}'); } catch (e) {}
const sel = { me: q.get('me') || saved.me || 'tommy', place: q.get('place') || saved.place || 'sandybay', mode: q.get('mode') || saved.mode || 'hangry' };
if (!FAMILY[sel.me]) sel.me = 'tommy';
if (!PLACES.some(p => p.id === sel.place)) sel.place = 'sandybay';
if (!MODES.some(m => m.id === sel.mode)) sel.mode = 'hangry';
if (sel.me === 'joan' && sel.mode === 'hangry') sel.mode = 'roam';

let resolve; window.xmasMenu = new Promise(r => { resolve = r; });
const screens = ['title', 'who', 'where', 'what'];
function show(id) { for (const s of screens) $('#sc-' + s).hidden = s !== id; $('#menu').scrollTop = 0; blip(); }
function blip() { try { const a = blip.ctx || (blip.ctx = new (window.AudioContext || window.webkitAudioContext)()); const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.value = 660 + Math.random() * 200; g.gain.setValueAtTime(0.05, a.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.15); o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + 0.16); } catch (e) {} }

function drawWho() {
  $('#who-list').innerHTML = GROUPS.map(g => `<div class="grp"><h3 style="--c:${g.color}">${g.name}</h3><div class="cards">${g.ids.map(id => { const f = FAMILY[id];
    return `<button class="pc${id === sel.me ? ' sel' : ''}" data-id="${id}" style="--c:${f.color}"><span class="em">${f.emoji}</span><b>${f.name}</b></button>`; }).join('')}</div></div>`).join('');
  $('#who-blurb').textContent = FAMILY[sel.me].blurb;
}
function drawWhere() { $('#where-list').innerHTML = PLACES.map(p => `<button class="bc${p.id === sel.place ? ' sel' : ''}" data-id="${p.id}"><span class="em">${p.ico}</span><b>${p.name}</b><u>${p.sub}</u><i>${p.desc}</i></button>`).join(''); }
function drawWhat() {
  $('#what-list').innerHTML = MODES.map(m => { const off = m.noJoan && sel.me === 'joan';
    return `<button class="bc${m.id === sel.mode ? ' sel' : ''}${off ? ' off' : ''}" data-id="${m.id}" ${off ? 'disabled' : ''}><span class="em">${m.ico}</span><b>${m.name}</b><i>${off ? "You can't feed yourself, Nan. Well, you can. That's the problem." : m.desc}</i></button>`; }).join('');
}
function go() {
  try { localStorage.setItem('xm_menu', JSON.stringify(sel)); } catch (e) {}
  $('#menu').hidden = true; $('#loadscreen').hidden = false; tips(); resolve({ ...sel });      // (straight to loading)
}

$('#who-list').addEventListener('click', (e) => { const b = e.target.closest('.pc'); if (!b) return; sel.me = b.dataset.id; if (sel.me === 'joan' && sel.mode === 'hangry') sel.mode = 'roam'; drawWho(); blip(); });
$('#where-list').addEventListener('click', (e) => { const b = e.target.closest('.bc'); if (!b) return; sel.place = b.dataset.id; drawWhere(); blip(); });
$('#what-list').addEventListener('click', (e) => { const b = e.target.closest('.bc'); if (!b || b.disabled) return; sel.mode = b.dataset.id; drawWhat(); blip(); });
$('#btn-play').addEventListener('click', () => { drawWho(); show('who'); });
$('#who-next').addEventListener('click', () => { drawWhere(); show('where'); });
$('#where-back').addEventListener('click', () => { drawWho(); show('who'); });
$('#where-next').addEventListener('click', () => { drawWhat(); show('what'); });
$('#what-back').addEventListener('click', () => { drawWhere(); show('where'); });
$('#what-next').addEventListener('click', go);

// the loading screen: its steps and the candy-cane bar (main.js ticks them off), a new tip every few seconds
const TIPS = ['Tip: hold a sweet and tap Nan to give it to her. She WILL get hangry.', 'Tip: pull a cracker with EAT. The jokes do not get better.',
  'Tip: in Fling the Family, everyone queues up on the green. Furthest fling wins.', 'Tip: tap someone to give them a nudge. Michael will notice.',
  "Tip: Nan's car is on the drive. She only drives it to the clubhouse. It's 60 metres.", 'Tip: the Quality Street are in the tin. The purple ones are already gone.'];
let tipT = 0; function tips() { let i = Math.floor(Math.random() * TIPS.length); $('#ls-tip').textContent = TIPS[i]; clearInterval(tipT); tipT = setInterval(() => { i = (i + 1) % TIPS.length; $('#ls-tip').textContent = TIPS[i]; }, 3800); }
window.__ls = (k) => { const order = ['family', 'house', 'go'], i = order.indexOf(k); document.querySelectorAll('#ls-steps li').forEach((li, j) => { li.classList.toggle('done', j < i || k === 'go'); li.classList.toggle('now', j === i && k !== 'go'); });
  $('#ls-fill').style.width = ({ family: '30%', house: '68%', go: '100%' })[k] || '8%';
  if (k === 'go') { clearInterval(tipT); $('#loadscreen').hidden = true; $('#ready-screen').hidden = false; const f = FAMILY[sel.me], p = PLACES.find(x => x.id === sel.place), m = MODES.find(x => x.id === sel.mode);
    $('#ready-av').textContent = f.emoji; $('#ready-av').style.setProperty('--c', f.color); $('#ready-who').textContent = DEV ? '>_ DEVELOPER MODE' : `You're ${f.name}`; $('#ready-what').textContent = `${m.ico} ${m.name} · ${p.ico} ${p.sub}`; } };

// ---------------------------------------------------------------- the settings cog: version, updates, developer mode
const when = (v) => { const w = GAME_WHEN[v]; if (!w) return ''; const d = new Date(w + ':00Z');
  return d.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Europe/London' }).replace(/ (am|pm)$/, '$1'); };
$('#set-version').textContent = 'v' + GAME_VERSION; $('#set-date').textContent = when(GAME_VERSION); $('#title-ver').textContent = 'v' + GAME_VERSION;
$('#set-updates').innerHTML = GAME_UPDATES.map(([v, list]) => `<div class="upd"><b>v${v}${when(v) ? ` <i>${when(v)}</i>` : ''}</b><ul>${list.map(t => `<li>${t}</li>`).join('')}</ul></div>`).join('');
const openSet = (on) => { $('#settings').hidden = !on; if (on) blip(); };
$('#cog').addEventListener('click', () => openSet(true));
for (const id of ['#set-x', '#set-close']) $(id).addEventListener('click', () => openSet(false));
$('#settings').addEventListener('click', (e) => { if (e.target.id === 'settings') openSet(false); });      // (a tap outside the box closes it)
// developer mode is behind a code. Get it wrong once and it's locked on this device for good (like Ronnie Simulator)
{ const LOCK = 'xm_dev_locked', locked = () => { try { return localStorage.getItem(LOCK) === '1'; } catch (e) { return false; } };
  const showLocked = () => { const b = $('#set-dev'); b.classList.add('locked'); b.disabled = true; b.textContent = '🔒 DEVELOPER MODE LOCKED'; $('#dev-code').hidden = true; };
  if (locked()) showLocked();
  $('#set-dev').addEventListener('click', () => { if (locked()) return showLocked(); $('#dev-code').hidden = false; $('#dev-msg').textContent = ''; const i = $('#dev-pin'); i.value = ''; setTimeout(() => i.focus(), 50); });
  const tryCode = () => { if (locked()) return showLocked(); const v = $('#dev-pin').value.trim(); if (!v) return;
    if (v.toUpperCase() === 'SPROUT') { $('#dev-code').hidden = true; $('#dev-maps').hidden = false; $('#dev-msg').textContent = ''; blip(); try { $('#dev-pin').blur(); setTimeout(() => $('#dev-maps').scrollIntoView({ behavior: 'smooth', block: 'center' }), 60); } catch (e) {} return; }
    try { localStorage.setItem(LOCK, '1'); } catch (e) {} showLocked(); $('#dev-msg').textContent = 'WRONG CODE. DEVELOPER MODE IS NOW LOCKED.'; };
  // ...then which house to test in (as whoever you last picked; Free Roam)
  $('#dev-maps').innerHTML = '<div class="dv-maps-h">&gt;_ CHOOSE A HOUSE</div>' + [['sandybay', '🏡', 'SANDY BAY'], ['tewkes', '🏠', 'TEWKES ROAD']].map(([id, ic, nm]) => `<button data-map="${id}"><b>${ic}</b>${nm}</button>`).join('');
  $('#dev-maps').addEventListener('click', (e) => { const b = e.target.closest('[data-map]'); if (!b) return; try { sessionStorage.setItem('xm_dev', '1'); } catch (er) {} location.href = location.pathname + `?go=1&me=${sel.me}&place=${b.dataset.map}&mode=roam`; });
  $('#dev-go').addEventListener('click', tryCode); $('#dev-pin').addEventListener('keydown', (e) => { if (e.key === 'Enter') tryCode(); }); }
// developer mode only lasts while you're in it: back at the title screen (a normal start) it's off
if (!q.get('go')) { try { sessionStorage.removeItem('xm_dev'); } catch (e) {} }
const DEV = (() => { try { return sessionStorage.getItem('xm_dev') === '1' && localStorage.getItem('xm_dev_locked') !== '1'; } catch (e) { return false; } })();
if (DEV) document.body.classList.add('devmode');

if (q.get('go')) go(); else show('title');
