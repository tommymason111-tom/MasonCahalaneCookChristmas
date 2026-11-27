// The on-screen bits (phones, tablets, computers): the objective line, Nan's hangry meter, toasts, the pause
// menu and the end screen. In the headset the same things are shown on the TV and on floating panels instead.

const $ = (s) => document.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export class Hud {
  constructor({ me, mode, onPause }) {
    this.me = me;
    const root = this.root = document.createElement('div'); root.id = 'hud';
    root.innerHTML = `
      <div id="hud-top">
        <div id="hud-obj"></div>
      </div>
      <div id="hud-hangry" hidden><div class="hl">🍫 NAN'S HANGRY-O-METER</div><div class="hbar"><i id="hangry-fill"></i></div><div id="hangry-want"></div></div>
      <button id="hud-pause" aria-label="Pause">❚❚</button>
      <div id="hud-toast"></div>
      <div id="hud-pausemenu" hidden><div class="pm"><h2>PAUSED</h2><button data-p="resume">▶ RESUME</button><button data-p="music">🎵 CAROLS: ON</button><button data-p="mute">🔈 SOUND: ON</button><button data-p="restart">↻ RESTART</button><button data-p="menu">🏠 MAIN MENU</button></div></div>
      <div id="hud-result" hidden><div class="rs"><h1 id="rs-title"></h1><div id="rs-lines"></div><div class="rs-b"><button data-r="again">↻ PLAY AGAIN</button><button data-r="menu">🏠 MAIN MENU</button></div></div></div>`;
    document.body.appendChild(root);
    $('#hud-pause').addEventListener('click', () => onPause());
    this.muted = false;
  }
  show(on) { this.root.classList.toggle('on', on); }
  setMode(mode) { $('#hud-hangry').hidden = mode !== 'hangry'; }
  objective(t) { const o = $('#hud-obj'); if (o.textContent !== t) o.textContent = t; }
  hangry(v, want) { $('#hangry-fill').style.width = Math.round(Math.max(0, Math.min(1, v)) * 100) + '%'; $('#hud-hangry').classList.toggle('red', v > 0.75);
    const w = $('#hangry-want'); const t = want ? 'Nan wants: ' + want : ''; if (w.textContent !== t) w.textContent = t; }
  toast(text, secs = 3) { const t = $('#hud-toast'); t.textContent = text; t.classList.add('on'); clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('on'), secs * 1000); }
  pause(on, act) {
    const m = $('#hud-pausemenu'); m.hidden = !on; if (!on) return;
    const mb = m.querySelector('[data-p="music"]'); if (mb && act.musicOn) mb.textContent = act.musicOn() ? '🎵 CAROLS: ON' : '🎵 CAROLS: OFF';
    m.onclick = (e) => { const b = e.target.closest('[data-p]'); if (!b) return; const k = b.dataset.p;
      if (k === 'resume') $('#hud-pause').click(); else if (k === 'music') { b.textContent = act.music() ? '🎵 CAROLS: ON' : '🎵 CAROLS: OFF'; } else if (k === 'mute') { this.muted = !this.muted; act.mute(this.muted); b.textContent = this.muted ? '🔇 SOUND: OFF' : '🔈 SOUND: ON'; } else act[k](); };
  }
  result(title, lines, act) {
    const r = $('#hud-result'); r.hidden = false; $('#rs-title').textContent = title;
    $('#rs-lines').innerHTML = lines.map(l => `<div class="rl">${esc(l)}</div>`).join('');
    r.onclick = (e) => { const b = e.target.closest('[data-r]'); if (b) act[b.dataset.r](); };
  }
  update() {}
}
