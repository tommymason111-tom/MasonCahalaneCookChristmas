# Christmas Day at Nan's: notes for Claude

A family Christmas party game in plain HTML and JavaScript (three.js r170 and cannon-es from a CDN, no build step) for the
Meta Quest browser (WebXR), phones and computers. It's set up like the Mason Family Boxing Day Quiz (title → who are you →
which house → what to play → summary → in) and built on Ronnie Simulator's engine (its ragdolls, gait, physics, hands,
food and level kit), so it looks and moves like Ronnie Simulator. Read `README.md` for what's in the game.

## Branch and versions

- Work on `main`. Commit and push everything. Don't open pull requests unless asked.

## The family (real people: keep the jokes affectionate)

- Team Karen: Tommy, Charli, Karen, Paul. Team Lisa: Lisa, Michael, Sophie, Jimmy. Joan (Nan) is the quizmaster.
- Karen and Lisa are sisters; Joan is their mum. Lisa works at Asda and looks after Michael, who annoys her. Michael is a
  retired postman who had a brain injury: never joke about the injury. Sophie works in London and goes out with her
  girlfriends. Jimmy is very tall, loves games and his PC, and works in a school where the kids love him. Joan is shorter,
  gets hangry, loves chocolate and lives at Sandy Bay (an over-50s/60s park) with lots of friends there.
- Who they are, their lines, models and heights: `js/xmas/family.js`.

## Where things are

- `index.html`: the page, menus, HUD styles, touch-control styles.
- `js/xmas/menu.js`: the front end. `?go=1&me=tommy&place=sandybay&mode=quiz` skips straight in.
- `js/xmas/main.js`: builds the house, the family, food, touch/VR controls, eating, hits, the loop. `window.XM` is the
  debug object (`XM.sim(dt)`, `XM.cast`, `XM.player`, `XM.room`, `XM.mode`, `XM.THREE`).
- `js/xmas/quiz.js`: Nan's Christmas Quiz (seating, the TV, Charli's whispers, Paul's appeals, Nan going hangry, the final).
  `js/xmas/questions.js`: the question bank (`[question, right, wrong, wrong, wrong, optional quip "Name: words"]`).
- `js/xmas/games.js`: `NanHunger` (Nan's hangry meter, used by every mode), Feed Nan (`hangry`), Fling the Family (`fling`).
- `js/xmas/hud.js`: scoreboard, hangry meter, quiz card, toasts, pause, results (phone/computer; in VR the TV shows it).
- `js/xmas/xfood.js`: the Christmas food and drink (added to `config.js` FOODS and `foods.js` EXTRA_GEO).
- `js/levels/sandybay.js` (Nan's new house) and `js/levels/tewkes.js` (Nan's old house): built with `js/levels/kit.js`.
  Each returns the room object plus `zones`, `quiz { host, seats, tv, stand }`, `dinner`, `kitchen`, `stash`, `tree`,
  `drinks`, `lawn`, `gardenStart`, `start`, `indoors()`.
- Engine (from Ronnie Simulator): `ragdoll.js` (models skinned onto 11 bodies; `rigMap` maps a rigged model's bones by name),
  `character.js`, `squad.js` (SquadMember: the family are registered into SQUAD), `gait.js`, `player.js`, `touch.js`,
  `hands.js`, `foods.js`, `physics.js`, `audio.js` (all sound is synthesised), `quality.js`, `perf.js`.

## Models

- `assets/family/<id>.glb`. Tommy, Charli, Karen and Paul are scans (Karen/Charli/Paul from the Boxing Day quiz,
  meshopt-compressed, 1 unit tall: `fit: true` scales them; their joints are marked in family.js with `bindFromMarks`).
  Lisa, Michael, Sophie, Jimmy and Joan are procedural, made by `tools/makefamily.html` (run `LIB=<three package dir>
  node tools/makefamily.mjs`) as RIGGED GLBs: the game uses their own skin weights (`rigMap`), and their joints go in
  `js/xmas/procbinds.js`.
- A rigged model (Mixamo, Meshy/Tripo auto-rig, Character Creator) dropped in keeps its own weights. It still needs its
  `bind` joints in family.js (shoulder, elbow, fingertip, hips, knees, neck, top of head, in metres on the model).
- Views: `tools/scanview.html?m=<id>` (a model front-on with a grid), `tools/levelview.html?place=<id>&cam=x,y,z&look=x,y,z`.

## Rules from the owner

- Don't lower visual quality to fix performance. Find a smarter fix.
- Never commit copyrighted songs or audio files.

## Testing

Headless Chromium with Playwright (pre-installed: `require('playwright')`), launched with
`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`. Route the `three@0.170.0` and `cannon-es@0.20.0` CDN
requests to local copies (`npm pack three@0.170.0 cannon-es@0.20.0`) and serve the repo. Load
`index.html?go=1&me=tommy&place=sandybay&mode=quiz`, wait for `body.ready`, click `#play-flat`, then
`XM.renderer.setAnimationLoop(null)` and step with `XM.sim(1/30)`. Test on a phone held upright first (390×844 with touch),
then the Quest (WebXR emulator), then PC. Run `node --check` on changed files and look for page errors.
