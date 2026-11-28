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
      <div id="hud-pausemenu" hidden><div class="pm"><div class="pm-ico">⏸️</div><h2>Paused</h2><div class="pm-sub" id="pm-sub"></div>
        <button class="primary" data-p="resume">▶ Back to Nan's</button>
        <button class="row on" data-p="music"><span class="lbl">🎵 Carols</span><span class="sw"></span></button>
        <button class="row on" data-p="mute"><span class="lbl">🔈 Sound</span><span class="sw"></span></button>
        <div class="two"><button data-p="restart">↻ Restart</button><button data-p="menu">🏠 Menu</button></div></div></div>
      <div id="hud-result" hidden><div class="rs"><div class="pm-ico">🏆</div><h1 id="rs-title"></h1><div id="rs-lines"></div><div class="rs-b"><button class="primary" data-r="again">↻ Play again</button><button data-r="menu">🏠 Main menu</button></div></div></div>`;
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
    const mb = m.querySelector('[data-p="music"]'); if (mb && act.musicOn) mb.classList.toggle('on', !!act.musicOn());
    const sb = m.querySelector('[data-p="mute"]'); sb.classList.toggle('on', !this.muted); sb.querySelector('.lbl').textContent = this.muted ? '🔇 Sound' : '🔈 Sound';
    if (act.where) $('#pm-sub').textContent = act.where();
    m.onclick = (e) => { const b = e.target.closest('[data-p]'); if (!b) return; const k = b.dataset.p;
      if (k === 'resume') $('#hud-pause').click(); else if (k === 'music') { b.classList.toggle('on', !!act.music()); } else if (k === 'mute') { this.muted = !this.muted; act.mute(this.muted); b.classList.toggle('on', !this.muted); b.querySelector('.lbl').textContent = this.muted ? '🔇 Sound' : '🔈 Sound'; } else act[k](); };
  }
  result(title, lines, act) {
    const r = $('#hud-result'); r.hidden = false; $('#rs-title').textContent = title;
    $('#rs-lines').innerHTML = lines.map(l => `<div class="rl">${esc(l)}</div>`).join('');
    r.onclick = (e) => { const b = e.target.closest('[data-r]'); if (b) act[b.dataset.r](); };
  }
  update() {}
}
