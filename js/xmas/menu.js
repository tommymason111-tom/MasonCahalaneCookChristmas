// The front end, set up like the Boxing Day quiz: title → who are you? → which house? → what are we playing? →
// a quick summary → in. Resolves window.xmasMenu with { me, place, mode }.
// Quick start for testing: ?go=1&me=tommy&place=sandybay&mode=roam
import { FAMILY, TEAMS } from './family.js';

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
const screens = ['title', 'who', 'where', 'what', 'summary'];
function show(id) { for (const s of screens) $('#sc-' + s).hidden = s !== id; $('#menu').scrollTop = 0; blip(); }
function blip() { try { const a = blip.ctx || (blip.ctx = new (window.AudioContext || window.webkitAudioContext)()); const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.value = 660 + Math.random() * 200; g.gain.setValueAtTime(0.05, a.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.15); o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + 0.16); } catch (e) {} }

function drawWho() {
  $('#who-list').innerHTML = GROUPS.map(g => `<div class="grp"><h3 style="--c:${g.color}">${g.name}</h3><div class="cards">${g.ids.map(id => { const f = FAMILY[id];
    return `<button class="pc${id === sel.me ? ' sel' : ''}" data-id="${id}" style="--c:${f.color}"><span class="em">${f.emoji}</span><b>${f.name}</b><i>${f.role}</i></button>`; }).join('')}</div></div>`).join('');
  $('#who-blurb').textContent = FAMILY[sel.me].blurb;
}
function drawWhere() { $('#where-list').innerHTML = PLACES.map(p => `<button class="bc${p.id === sel.place ? ' sel' : ''}" data-id="${p.id}"><span class="em">${p.ico}</span><b>${p.name}</b><u>${p.sub}</u><i>${p.desc}</i></button>`).join(''); }
function drawWhat() {
  $('#what-list').innerHTML = MODES.map(m => { const off = m.noJoan && sel.me === 'joan';
    return `<button class="bc${m.id === sel.mode ? ' sel' : ''}${off ? ' off' : ''}" data-id="${m.id}" ${off ? 'disabled' : ''}><span class="em">${m.ico}</span><b>${m.name}</b><i>${off ? "You can't feed yourself, Nan. Well, you can. That's the problem." : m.desc}</i></button>`; }).join('');
}
function go() {
  try { localStorage.setItem('xm_menu', JSON.stringify(sel)); } catch (e) {}
  const f = FAMILY[sel.me], p = PLACES.find(x => x.id === sel.place), m = MODES.find(x => x.id === sel.mode);
  const team = TEAMS[f.team].name;
  $('#sum').innerHTML = `<div class="sline"><span class="em">${f.emoji}</span> You're <b>${f.name}</b> (${team})</div><div class="sline"><span class="em">${p.ico}</span> ${p.name} · ${p.sub}</div><div class="sline"><span class="em">${m.ico}</span> ${m.name}</div>
    <div class="teams">${Object.values(TEAMS).map(t => `<div style="--c:${t.color}"><b>${t.name.toUpperCase()}</b>${t.members.map(id => FAMILY[id].name).join(' · ')}</div>`).join('')}</div>`;
  show('summary');
  setTimeout(() => { $('#menu').hidden = true; $('#loadscreen').hidden = false; tips(); resolve({ ...sel }); }, q.get('go') ? 0 : 2600);
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
    $('#ready-av').textContent = f.emoji; $('#ready-av').style.setProperty('--c', f.color); $('#ready-who').textContent = `You're ${f.name}`; $('#ready-what').textContent = `${m.ico} ${m.name} · ${p.ico} ${p.sub}`; } };

if (q.get('go')) go(); else show('title');
