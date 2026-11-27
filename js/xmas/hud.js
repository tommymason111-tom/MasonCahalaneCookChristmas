// The on-screen bits (phones, tablets, computers): scoreboard, Nan's hangry meter, the quiz card, toasts, the pause
// menu and the end screen. In the headset the same things are shown on the TV and on floating panels instead.
import { FAMILY, TEAMS } from './family.js';

const $ = (s) => document.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export class Hud {
  constructor({ me, mode, onPause }) {
    this.me = me;
    const root = this.root = document.createElement('div'); root.id = 'hud';
    root.innerHTML = `
      <div id="hud-top">
        <div id="hud-score" hidden><div class="ts t-karen"><b>TEAM KAREN</b><span id="sc-karen">0</span></div><div class="ts t-lisa"><b>TEAM LISA</b><span id="sc-lisa">0</span></div></div>
        <div id="hud-obj"></div>
      </div>
      <div id="hud-hangry" hidden><div class="hl">🍫 NAN'S HANGRY-O-METER</div><div class="hbar"><i id="hangry-fill"></i></div><div id="hangry-want"></div></div>
      <button id="hud-pause" aria-label="Pause">❚❚</button>
      <div id="hud-toast"></div>
      <div id="quiz-card" hidden>
        <div class="qc-top"><span id="qc-round"></span><span id="qc-timer"></span></div>
        <div id="qc-q"></div>
        <div id="qc-whisper"></div>
        <div id="qc-answers"></div>
      </div>
      <div id="hud-pausemenu" hidden><div class="pm"><h2>PAUSED</h2><button data-p="resume">▶ RESUME</button><button data-p="mute">🔈 SOUND: ON</button><button data-p="restart">↻ RESTART</button><button data-p="menu">🏠 MAIN MENU</button></div></div>
      <div id="hud-result" hidden><div class="rs"><h1 id="rs-title"></h1><div id="rs-lines"></div><div class="rs-b"><button data-r="again">↻ PLAY AGAIN</button><button data-r="menu">🏠 MAIN MENU</button></div></div></div>`;
    document.body.appendChild(root);
    $('#hud-pause').addEventListener('click', () => onPause());
    this.muted = false;
  }
  show(on) { this.root.classList.toggle('on', on); }
  setMode(mode) { $('#hud-score').hidden = !(mode === 'quiz' || mode === 'quick'); $('#hud-hangry').hidden = mode !== 'hangry' && !(mode === 'quiz' || mode === 'quick'); }
  objective(t) { const o = $('#hud-obj'); if (o.textContent !== t) o.textContent = t; }
  scores(s) { $('#sc-karen').textContent = fmt(s.karen); $('#sc-lisa').textContent = fmt(s.lisa); }
  hangry(v, want) { $('#hangry-fill').style.width = Math.round(Math.max(0, Math.min(1, v)) * 100) + '%'; $('#hud-hangry').classList.toggle('red', v > 0.75);
    const w = $('#hangry-want'); const t = want ? 'Nan wants: ' + want : ''; if (w.textContent !== t) w.textContent = t; }
  toast(text, secs = 3) { const t = $('#hud-toast'); t.textContent = text; t.classList.add('on'); clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('on'), secs * 1000); }
  // the quiz card: a question and four answers to tap (pick = null: just showing, e.g. you're the quizmaster)
  card({ round, q, answers, whisper, pick }) {
    this.cardPick = pick; $('#quiz-card').hidden = false; $('#quiz-card').className = '';
    $('#qc-round').textContent = round; $('#qc-q').textContent = q; $('#qc-whisper').textContent = whisper || '';
    $('#qc-answers').innerHTML = answers.map((a, i) => `<button class="qa" data-i="${i}"><b>${'ABCD'[i]}</b>${esc(a)}</button>`).join('');
    $('#qc-answers').querySelectorAll('.qa').forEach(b => b.addEventListener('click', () => { if (!this.cardPick) return; const i = +b.dataset.i; const f = this.cardPick; this.cardPick = null; this.picked(i); f(i); }));
    $('#quiz-card').classList.toggle('host', !pick);
  }
  whisper(t) { $('#qc-whisper').textContent = t || ''; }
  picked(i) { $('#qc-answers').querySelectorAll('.qa').forEach((b, j) => b.classList.toggle('mine', j === i)); $('#quiz-card').classList.add('locked'); }
  timer(t) { const e = $('#qc-timer'); const s = t > 0 ? '⏱ ' + Math.ceil(t) : ''; if (e.textContent !== s) e.textContent = s; }
  reveal(right, picks) { $('#qc-answers').querySelectorAll('.qa').forEach((b, j) => { b.classList.toggle('right', j === right); b.classList.toggle('wrong', j !== right && picks.includes(j)); }); $('#quiz-card').classList.add('revealed'); }
  hideCard() { $('#quiz-card').hidden = true; this.cardPick = null; }
  pause(on, act) {
    const m = $('#hud-pausemenu'); m.hidden = !on; if (!on) return;
    m.onclick = (e) => { const b = e.target.closest('[data-p]'); if (!b) return; const k = b.dataset.p;
      if (k === 'resume') $('#hud-pause').click(); else if (k === 'mute') { this.muted = !this.muted; act.mute(this.muted); b.textContent = this.muted ? '🔇 SOUND: OFF' : '🔈 SOUND: ON'; } else act[k](); };
  }
  result(title, lines, act) {
    this.hideCard(); const r = $('#hud-result'); r.hidden = false; $('#rs-title').textContent = title;
    $('#rs-lines').innerHTML = lines.map(l => `<div class="rl">${esc(l)}</div>`).join('');
    r.onclick = (e) => { const b = e.target.closest('[data-r]'); if (b) act[b.dataset.r](); };
  }
  update() {}
}
const fmt = (n) => Number.isInteger(n) ? String(n) : n.toFixed(1);
