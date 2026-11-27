// NAN'S CHRISTMAS QUIZ: everyone into the lounge, Nan reads the questions from her armchair, the TV shows them, and
// you answer for your team (tap a card on a phone, point at the TV and pull the trigger in VR).
// Team Karen (Tommy, Charli, Karen, Paul) v Team Lisa (Lisa, Michael, Sophie, Jimmy). Charli whispers the right answer
// (mostly), Paul insists on the wrong one, Lisa says "Michael." a lot, and if Nan gets too hungry she stops the quiz
// until someone brings her chocolate.
import * as THREE from 'three';
import { FAMILY, TEAMS } from './family.js';
import { ROUNDS, ROUND_INTROS } from './questions.js';
import { NanHunger } from './games.js';
import { canvasTex } from '../textures.js';

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const ANSWER_T = 20, REVEAL_T = 6;
const _v = new THREE.Vector3(), _ray = new THREE.Raycaster(), _m = new THREE.Matrix4();

export class Quiz {
  constructor(game, { quick = false } = {}) {
    this.g = game; this.quick = quick;
    const per = quick ? 4 : 5;
    const rounds = quick ? [ROUNDS[0], ROUNDS[3]] : ROUNDS;
    this.rounds = rounds.map(r => ({ ...r, qs: shuffle(r.qs).slice(0, per) }));
    this.ri = 0; this.qi = -1; this.state = 'gather'; this.t = 0;
    this.score = { karen: 0, lisa: 0 };
    this.myTeam = FAMILY[game.me].team === 'host' ? null : FAMILY[game.me].team;
    this.hunger = new NanHunger(game, { rate: 1 / 160, start: 0.3 });
    this.stats = { pauls: 0, halfPoints: 0, michaels: 0, fed: 0 };
    this.hunger.onFed = () => { this.stats.fed++; if (this.state === 'hangry') { this.state = 'question'; this.g.hud.toast('Nan: "Right. Where were we?"', 3); } };
    this.buildTV();
    game.hud.objective(this.myTeam ? 'Go to the lounge for the quiz!' : "You're the quizmaster! Go and sit in your armchair.");
    game.hud.scores(this.score);
  }
  start() { this.started = true; this.t = 0; }

  // ---------------- the TV ----------------
  buildTV() {
    const tv = this.g.room.quiz && this.g.room.quiz.tv; if (!tv) return;
    this.canvas = document.createElement('canvas'); this.canvas.width = 1024; this.canvas.height = 576;
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.SRGBColorSpace;
    const m = this.screen = new THREE.Mesh(new THREE.PlaneGeometry(tv.w, tv.h), new THREE.MeshBasicMaterial({ map: this.tex, toneMapped: false }));
    m.position.set(tv.x, tv.y, tv.z); m.rotation.y = tv.ry || 0; m.translateZ(0.006); m.userData.live = true;
    this.g.scene.add(m); this.drawTV();
  }
  drawTV() {
    if (!this.canvas) return;
    const g = this.canvas.getContext('2d'), W = 1024, H = 576, q = this.cur;
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#5a0f18'); bg.addColorStop(1, '#1a0508'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc((i * 263) % W, (i * 151) % H, 2 + (i % 3), 0, 7); g.fill(); }      // snow
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#ffd76a'; g.font = '900 34px Georgia, serif'; g.fillText("🎄 NAN'S CHRISTMAS QUIZ 🎄", W / 2, 34);
    // scores along the bottom
    g.font = '900 30px Arial Black, Arial'; g.fillStyle = TEAMS.karen.color; g.fillRect(0, H - 56, W / 2, 56); g.fillStyle = TEAMS.lisa.color; g.fillRect(W / 2, H - 56, W / 2, 56);
    g.fillStyle = '#fff'; g.fillText(`TEAM KAREN  ${fmt(this.score.karen)}`, W / 4, H - 28); g.fillText(`TEAM LISA  ${fmt(this.score.lisa)}`, W * 3 / 4, H - 28);
    if (this.state === 'gather' || !q) {
      g.font = '900 54px Georgia, serif'; g.fillStyle = '#fff'; g.fillText(this.state === 'final' ? this.finalText || '' : 'Take your seats!', W / 2, H / 2 - 20);
      g.font = '28px Arial'; g.fillStyle = '#ffd76a'; g.fillText(this.state === 'final' ? '' : 'Quiz starts when everyone is in the lounge', W / 2, H / 2 + 40);
    } else {
      g.font = '700 22px Arial'; g.fillStyle = '#ffd76a'; g.fillText(`${this.round.icon}  ${this.round.name.toUpperCase()}  ·  QUESTION ${this.qi + 1} OF ${this.round.qs.length}`, W / 2, 78);
      g.fillStyle = '#fff'; wrap(g, q.q, W / 2, 140, W - 100, 42, '800 38px Arial');
      this.tiles = [];
      for (let i = 0; i < 4; i++) {
        const x = 40 + (i % 2) * (W / 2 - 20), y = 230 + Math.floor(i / 2) * 130, w = W / 2 - 60, h = 112;
        const rev = this.state === 'reveal' || this.state === 'final', right = rev && i === q.right;
        const mine = this.myPick === i;
        g.fillStyle = right ? '#2fae4e' : rev && mine ? '#b02a2a' : mine ? '#1c5ac8' : 'rgba(255,255,255,0.12)'; rr(g, x, y, w, h, 18); g.fill();
        g.strokeStyle = mine ? '#ffd76a' : 'rgba(255,255,255,0.4)'; g.lineWidth = mine ? 6 : 2; rr(g, x, y, w, h, 18); g.stroke();
        g.fillStyle = '#ffd76a'; g.font = '900 36px Arial Black, Arial'; g.textAlign = 'left'; g.fillText('ABCD'[i], x + 22, y + h / 2);
        g.fillStyle = '#fff'; g.textAlign = 'center'; wrap(g, q.answers[i], x + w / 2 + 18, y + h / 2 - (q.answers[i].length > 26 ? 15 : 0), w - 90, 32, '700 28px Arial');
        this.tiles.push({ x: x / W, y: y / H, w: w / W, h: h / H });
        if (rev) { const tk = q.teamPicks; g.font = '700 18px Arial'; g.textAlign = 'right';
          const tags = []; if (tk.karen === i) tags.push('KAREN'); if (tk.lisa === i) tags.push('LISA'); if (tags.length) { g.fillStyle = '#fff'; g.fillText(tags.join(' · '), x + w - 14, y + h - 16); } g.textAlign = 'center'; }
      }
      if (this.state === 'question') { g.fillStyle = '#ffd76a'; g.font = '900 30px Arial Black, Arial'; g.fillText('⏱ ' + Math.max(0, Math.ceil(this.t)), W - 70, 78); }
      if (this.state === 'hangry') { g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillRect(0, 0, W, H); g.fillStyle = '#ff5a36'; g.font = '900 52px Georgia, serif'; g.fillText('NAN IS HANGRY', W / 2, H / 2 - 40); g.fillStyle = '#fff'; g.font = '30px Arial'; g.fillText('Quiz paused until someone brings her chocolate', W / 2, H / 2 + 30); }
    }
    this.tex.needsUpdate = true;
  }

  // ---------------- seating ----------------
  seats() {
    const q = this.g.room.quiz || {}; const list = (q.seats || []).slice();
    const order = [...TEAMS.karen.members, ...TEAMS.lisa.members];
    const out = {}; let i = 0; for (const id of order) { if (id === this.g.me) { i++; continue; } if (list[i]) out[id] = list[i]; i++; }
    if (q.host) out.joan = q.host;
    return out;
  }
  sitEveryone() {
    if (!this._seats) this._seats = this.seats();
    for (const c of this.g.cast) { const s = this._seats[c.id]; if (!s) continue; c.active = false; if (!c.down && (c.state === 'idle' || c.state === 'enter')) c.backTo(s.x, s.z, s.yaw, true); }
  }
  inLounge() { const z = this.g.room.zones && this.g.room.zones.lounge, h = this.g.player.head; return !z || (h.x > z.x0 && h.x < z.x1 && h.z > z.z0 && h.z < z.z1); }

  // ---------------- the flow ----------------
  update(dt) {
    if (!this.started) return;
    const g = this.g; this.t -= dt; if (this.state !== 'final') this.sitEveryone();
    this.hunger.update(dt, this.state !== 'question' && this.state !== 'reveal');
    g.hud.hangry(this.hunger.v, this.hunger.v > 0.5 ? this.hunger.wantLabel : '');
    if (this.state === 'gather') {
      this.gatherT = (this.gatherT || 0) + dt;
      if (this.inLounge() || this.gatherT > 45) { this.state = 'intro'; this.t = 4; g.say('joan', 'quizStart', 5); g.hud.objective(this.myTeam ? `You're on ${TEAMS[this.myTeam].name}` : "You're the quizmaster"); g.sfx('fanfare', null, 0.7); }
      return;
    }
    if (this.state === 'intro' && this.t <= 0) return this.nextQuestion();
    if (this.state === 'roundIntro' && this.t <= 0) { this.qi = -1; return this.nextQuestion(); }
    if (this.state === 'question') {
      g.hud.timer(this.t);
      if ((this._tvT = (this._tvT || 0) - dt) <= 0) { this._tvT = 0.5; this.drawTV(); }
      this.teamChatter(dt);
      this.vrPoint();
      // Nan too hungry to carry on
      if (this.hunger.on && this.hunger.v >= 1) { this.state = 'hangry'; g.say('joan', 'hangry', 6); g.hud.toast("😡 Nan's stopped the quiz! Bring her something to eat (tap her while holding it, or throw it to her)", 6); this.drawTV(); return; }
      if (this.t <= 0 || (this.myPick != null && this.t > 3 && this.myTeam)) { if (this.myPick != null && this.t > 3) this.t = Math.min(this.t, 3); if (this.t <= 0) this.reveal(); }
      return;
    }
    if (this.state === 'hangry') { if (this.hunger.v < 0.7) { this.state = 'question'; this.drawTV(); } return; }
    if (this.state === 'reveal' && this.t <= 0) {
      if (this.qi + 1 < this.round.qs.length) return this.nextQuestion();
      if (this.ri + 1 < this.rounds.length) { this.ri++; this.qi = -1; this.state = 'roundIntro'; this.t = 5; const intro = ROUND_INTROS[this.round.id]; g.say('joan', pick(intro), 5); g.hud.hideCard(); g.hud.toast(`${this.round.icon} ${this.round.name}`, 4); this.drawTV(); return; }
      return this.final();
    }
  }
  get round() { return this.rounds[this.ri]; }
  nextQuestion() {
    const g = this.g; this.qi++;
    if (this.qi === 0 && this.ri === 0) { g.say('joan', pick(ROUND_INTROS[this.round.id]), 5); }
    const raw = this.round.qs[this.qi], answers = shuffle(raw.slice(1, 5));
    this.cur = { q: raw[0], answers, right: answers.indexOf(raw[1]), quip: raw[5], teamPicks: {} };
    this.myPick = null; this.state = 'question'; this.t = ANSWER_T; this.chatT = 2 + Math.random() * 3; this.whispered = false;
    setTimeout(() => { const j = g.who('joan'); if (j && this.state === 'question') j.say(this.cur.q, 4); }, 300);
    g.hud.card({ round: `${this.round.icon} ${this.round.name} · Q${this.qi + 1}/${this.round.qs.length}`, q: this.cur.q, answers, pick: this.myTeam ? (i) => this.choose(i) : null });
    if (!this.myTeam) g.hud.whisper('You read the questions. The teams answer on their own.');
    this.drawTV(); g.sfx('ding', null, 0.6);
  }
  choose(i) { if (this.state !== 'question' || this.myPick != null) return; this.myPick = i; this.g.sfx('tap', null, 0.8); this.drawTV(); this.g.hud.picked(i); }
  // your teammates help (or don't): Charli whispers the right one most of the time, Paul insists on whatever he thinks
  teamChatter(dt) {
    const g = this.g, q = this.cur; this.chatT -= dt; if (this.chatT > 0 || this.whispered || !this.myTeam) return;
    this.whispered = true;
    const mates = TEAMS[this.myTeam].members.filter(id => id !== g.me && g.who(id));
    const helper = mates.includes('charli') ? 'charli' : mates.includes('jimmy') && this.round.id === 'telly' ? 'jimmy' : pick(mates);
    const good = Math.random() < (helper === 'charli' ? 0.8 : 0.6), idx = good ? q.right : pick([0, 1, 2, 3].filter(i => i !== q.right));
    const line = helper === 'charli' ? `Psst. It's ${'ABCD'[idx]}. ${q.answers[idx]}. I literally know this.` : `I reckon it's ${'ABCD'[idx]}... ${q.answers[idx]}?`;
    g.say(helper, line, 4); g.hud.whisper(`${FAMILY[helper].name}: "${'ABCD'[idx]}, ${q.answers[idx]}"`);
    if (mates.includes('paul') && helper !== 'paul') setTimeout(() => { if (this.state !== 'question') return; const pidx = Math.random() < 0.35 ? q.right : pick([0, 1, 2, 3].filter(i => i !== q.right));
      g.say('paul', `No, no, it's ${'ABCD'[pidx]}. Trust me. ${q.answers[pidx]}.`, 4); this.stats.pauls++; }, 3000);
    if (mates.includes('michael') && Math.random() < 0.4) setTimeout(() => { if (this.state !== 'question') return; g.say('michael', `Ooh, I know this one. ...No I don't.`, 3); setTimeout(() => g.say('lisa', 'michael', 4), 1500); this.stats.michaels++; }, 5000);
  }
  // in the headset: point a controller at an answer on the TV and pull the trigger
  vrPoint() {
    const g = this.g; if (!g.renderer.xr.isPresenting || !this.screen || !this.myTeam || this.myPick != null || !this.tiles) return;
    for (const h of g.player.hands) {
      if (!h.ctrl || !h.source || h.isHand) continue;
      const gp = h.source.gamepad, down = !!(gp && gp.buttons[0] && gp.buttons[0].pressed);
      _m.identity().extractRotation(h.ctrl.matrixWorld); _ray.ray.origin.setFromMatrixPosition(h.ctrl.matrixWorld); _ray.ray.direction.set(0, 0, -1).applyMatrix4(_m);
      const hit = _ray.intersectObject(this.screen, false)[0];
      if (hit && hit.uv && down && !h._quizDown) { const u = hit.uv.x, v = 1 - hit.uv.y; const i = this.tiles.findIndex(t => u > t.x && u < t.x + t.w && v > t.y && v < t.y + t.h); if (i >= 0) { this.choose(i); h.pulse && h.pulse(0.8, 60); } }
      h._quizDown = down;
    }
  }
  aiPick(team) {
    const q = this.cur, fam = this.round.family, base = fam ? 0.7 : this.round.id === 'telly' && team === 'lisa' ? 0.65 : 0.55;
    return Math.random() < base ? q.right : pick([0, 1, 2, 3].filter(i => i !== q.right));
  }
  reveal() {
    const g = this.g, q = this.cur; this.state = 'reveal'; this.t = REVEAL_T;
    for (const team of ['karen', 'lisa']) q.teamPicks[team] = team === this.myTeam ? (this.myPick ?? -1) : this.aiPick(team);
    const pts = { karen: 0, lisa: 0 };
    for (const team of ['karen', 'lisa']) if (q.teamPicks[team] === q.right) pts[team] = 1;
    // Paul appeals a wrong answer: now and then Nan gives half a point just to shut him up
    if (!pts.karen && g.who('paul') && Math.random() < 0.6) { setTimeout(() => g.say('paul', 'argue', 5), 1200); this.stats.pauls++;
      if (Math.random() < 0.25) { pts.karen = 0.5; this.stats.halfPoints++; setTimeout(() => g.say('joan', 'Oh, go on then. Half a point. Just to shut you up, Paul.', 5), 3200); } }
    this.score.karen += pts.karen; this.score.lisa += pts.lisa;
    g.hud.reveal(q.right, [this.myPick, q.teamPicks.karen, q.teamPicks.lisa].filter(x => x != null && x >= 0));
    g.hud.scores(this.score);
    const mine = this.myTeam ? q.teamPicks[this.myTeam] === q.right : null;
    g.say('joan', `It's ${'ABCD'[q.right]}... ${q.answers[q.right]}!`, 5);
    setTimeout(() => { if (q.quip) { const who = q.quip.split(':')[0].trim().toLowerCase(); if (g.who(who)) g.say(who, q.quip.slice(q.quip.indexOf(':') + 1).trim().replace(/^'|'$/g, ''), 4); } }, 2200);
    // the teams react
    for (const team of ['karen', 'lisa']) { const ids = TEAMS[team].members.filter(id => g.who(id) && id !== 'paul'); if (!ids.length) continue; const id = pick(ids);
      setTimeout(() => g.say(id, pts[team] ? 'right' : 'wrong', 3), 1200 + Math.random() * 1200); }
    if (mine === true) { g.sfx('cheer', null, 0.6); g.words.show('CORRECT!', g.player.head.clone().addScaledVector(g.player.fwd, 1.2), '#2fae4e', 0.25, 1.4); }
    else if (mine === false) g.sfx('aww', null, 0.6);
    if (!pts.lisa && g.who('lisa') && g.who('michael') && Math.random() < 0.4) { setTimeout(() => g.say('lisa', 'michael', 4), 2600); this.stats.michaels++; }
    this.drawTV();
  }
  final() {
    const g = this.g, s = this.score, win = s.karen === s.lisa ? null : s.karen > s.lisa ? 'karen' : 'lisa';
    this.state = 'final'; this.finalText = win ? `${TEAMS[win].name} WIN!` : "IT'S A DRAW!"; this.drawTV(); g.hud.hideCard();
    g.say('joan', win ? `And the winners of Nan's Christmas Quiz are... ${TEAMS[win].name}! Now, where's my pudding?` : "It's a draw! Nobody wins. Everybody washes up.", 6);
    // the winners celebrate (Paul celebrates regardless)
    for (const c of g.cast) if ((win && FAMILY[c.id].team === win) || c.id === 'paul') { c.seated = false; c.dancing = true; }
    g.sfx('fanfare', null, 1);
    const youWon = this.myTeam && win === this.myTeam;
    const awards = [`🎄 ${this.finalText}  ${fmt(s.karen)} – ${fmt(s.lisa)}`,
      this.myTeam ? (youWon ? 'You won the Christmas Cup! 🏆' : win ? 'You lost. Nan still loves you. Probably.' : 'A draw. Everybody washes up.') : 'Quizmaster Joan: "Same again next year."',
      `🙋 Paul disputed ${this.stats.pauls} answer${this.stats.pauls === 1 ? '' : 's'}${this.stats.halfPoints ? ` and won ${this.stats.halfPoints} half-point${this.stats.halfPoints === 1 ? '' : 's'}` : ''}`,
      `🍫 Nan was fed ${this.stats.fed} time${this.stats.fed === 1 ? '' : 's'}`, `✉️ "Michael." said ${this.stats.michaels} time${this.stats.michaels === 1 ? '' : 's'}`];
    setTimeout(() => g.over("NAN'S CHRISTMAS QUIZ", awards), 6000);
  }
  onTapPerson(c) { return this.hunger.onTapPerson(c); }
  onHitWith(c, it) { return this.hunger.onHitWith(c, it); }
}

function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function wrap(g, text, x, y, maxW, lh, font) {
  g.font = font; const words = String(text).split(' '), lines = []; let ln = '';
  for (const w of words) { const t = ln ? ln + ' ' + w : w; if (g.measureText(t).width > maxW && ln) { lines.push(ln); ln = w; } else ln = t; } if (ln) lines.push(ln);
  lines.slice(0, 3).forEach((l, i) => g.fillText(l, x, y + i * lh - (Math.min(3, lines.length) - 1) * lh / 2 + (lines.length > 1 ? lh / 2 : 0)));
}
const fmt = (n) => Number.isInteger(n) ? String(n) : n.toFixed(1);
