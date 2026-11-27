// A little music box in the corner: public-domain carols played note by note on a synthesised bell (nothing recorded,
// no audio files). Quiet, through the game's music bus, and switched off in the pause menu.
import { audioCtx, musicBus } from '../audio.js';

// [midi note, beats] (0 = a rest)
const TUNES = {
  'Jingle Bells': { bpm: 200, n: [[64,1],[64,1],[64,2],[64,1],[64,1],[64,2],[64,1],[67,1],[60,1.5],[62,0.5],[64,4],[65,1],[65,1],[65,1.5],[65,0.5],[65,1],[64,1],[64,1],[64,0.5],[64,0.5],[64,1],[62,1],[62,1],[64,1],[62,2],[67,2],
    [64,1],[64,1],[64,2],[64,1],[64,1],[64,2],[64,1],[67,1],[60,1.5],[62,0.5],[64,4],[65,1],[65,1],[65,1.5],[65,0.5],[65,1],[64,1],[64,1],[64,0.5],[64,0.5],[67,1],[67,1],[65,1],[62,1],[60,4],[0,2]] },
  'Deck the Halls': { bpm: 170, n: [[67,1.5],[65,0.5],[64,1],[62,1],[60,1],[62,1],[64,1],[60,1],[62,0.5],[64,0.5],[65,0.5],[62,0.5],[64,1.5],[62,0.5],[60,1],[59,1],[60,2],
    [67,1.5],[65,0.5],[64,1],[62,1],[60,1],[62,1],[64,1],[60,1],[62,0.5],[64,0.5],[65,0.5],[62,0.5],[64,1.5],[62,0.5],[60,1],[59,1],[60,2],[0,2]] },
  'We Wish You a Merry Christmas': { bpm: 180, n: [[60,1],[65,1],[65,0.5],[67,0.5],[65,0.5],[64,0.5],[62,1],[62,1],[62,1],[67,1],[67,0.5],[69,0.5],[67,0.5],[65,0.5],[64,1],[60,1],[60,1],[69,1],[69,0.5],[70,0.5],[69,0.5],[67,0.5],[65,1],[62,1],[60,0.5],[60,0.5],[62,1],[67,1],[64,1],[65,3],[0,2]] },
  'Silent Night': { bpm: 110, n: [[67,1.5],[69,0.5],[67,1],[64,3],[67,1.5],[69,0.5],[67,1],[64,3],[74,2],[74,1],[71,3],[72,2],[72,1],[67,3],[69,2],[69,1],[72,1.5],[71,0.5],[69,1],[67,1.5],[69,0.5],[67,1],[64,3],[0,2]] },
};
const ORDER = Object.keys(TUNES);

export class Carols {
  constructor() { this.on = true; this.ti = Math.floor(Math.random() * ORDER.length); this.ni = 0; this.next = 0; this.vol = 0.16; }
  get title() { return ORDER[this.ti]; }
  toggle(on = !this.on) { this.on = on; return on; }
  // called every frame: schedules the next few notes ahead of time
  update() {
    const ctx = audioCtx(); if (!ctx || !this.on || ctx.state !== 'running') return;
    const mb = musicBus(), out = mb && mb.out; if (!out) return;
    if (this.next < ctx.currentTime) this.next = ctx.currentTime + 0.1;
    while (this.next < ctx.currentTime + 0.6) {
      const tune = TUNES[ORDER[this.ti]], [m, beats] = tune.n[this.ni], dur = beats * 60 / tune.bpm;
      if (m) this.bell(ctx, out, m, this.next, dur);
      this.next += dur; this.ni++;
      if (this.ni >= tune.n.length) { this.ni = 0; this.ti = (this.ti + 1) % ORDER.length; this.next += 1.5; }
    }
  }
  bell(ctx, out, midi, t, dur) {
    const f = 440 * Math.pow(2, (midi - 69) / 12), g = ctx.createGain(); g.connect(out);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(this.vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.5, dur * 1.6));
    for (const [mul, a, type] of [[1, 1, 'sine'], [2, 0.35, 'sine'], [3.01, 0.12, 'triangle'], [0.5, 0.25, 'sine']]) {      // (a music box: a bright bell with a soft low note under it)
      const o = ctx.createOscillator(), og = ctx.createGain(); o.type = type; o.frequency.value = f * mul; og.gain.value = a; o.connect(og).connect(g); o.start(t); o.stop(t + Math.max(0.6, dur * 1.7)); }
  }
}
