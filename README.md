# Christmas Day at Nan's 🎄

A family Christmas party game for **Meta Quest 3** (WebXR) that also plays on **phones, tablets and computers**.
It's Christmas Day. Everyone's round Nan's. Dinner's at two, and Nan gets hangry at 2:01.

It's set up like *The Mason Family Boxing Day Quiz* and runs on *Ronnie Simulator*'s engine: the same ragdolls, walking
and running, physics, hands, food and detailed levels.

## Play it

It's a static website with no build step. Host the folder anywhere that serves HTTPS (GitHub Pages works):

1. On GitHub: **Settings → Pages → Deploy from a branch → `main` / (root) → Save**.
2. Open the Pages address on the Quest 3 browser and press **PLAY IN VR**, or on anything else press **PLAY ON THIS SCREEN**.

Local test: `python3 -m http.server 8000` in this folder, then open `http://localhost:8000` (WebXR needs HTTPS or localhost).

## Starting a game

1. **Title** → PLAY.
2. **Who are you?** Any of the nine:
   - **Team Karen**: Tommy, Charli, Karen, Paul
   - **Team Lisa**: Lisa, Michael, Sophie, Jimmy
   - **The Quizmaster**: Joan (Nan). Play as her and you read the questions while the teams answer.
3. **Which house?**
   - **Nan's new house (Sandy Bay)**: her park home among the over-60s (and all her friends), with a lounge, kitchen-diner,
     conservatory, a little garden and the neighbours' lights.
   - **Nan's old house (Tewkes Road)**: the family home where Karen and Lisa grew up, with the front room, the gas fire,
     the dining room, the kitchen, a long back garden and the height marks on the door frame.
4. **What are we playing?** (below), then a quick summary, and you're in.

## Game modes

| Mode | What it is |
|---|---|
| 🎄 Nan's Christmas Quiz | Everyone into the lounge. Nan reads from her armchair and the questions come up on the TV. Four rounds: Christmas; Telly, Film & Music; General Knowledge; and the Family Round. Charli whispers the right answer (mostly), Paul insists on the wrong one and appeals every loss (sometimes Nan gives him half a point to shut him up), and Lisa says "Michael." a lot. If Nan gets too hungry she stops the quiz until someone brings her chocolate. Winners dance; then the results and awards. |
| ⚡ Quick Quiz | Two short rounds: Christmas and the Family Round. |
| 🍫 Feed Nan | Three minutes. Nan's Hangry-o-Meter keeps rising, faster as the afternoon goes on. She tells you what she wants (Quality Street, a mince pie, a Baileys...). Get it to her: hold it and tap her, throw it to her (she catches it), or hold it to her face in VR. |
| 🚀 Fling the Family | Out in the garden. Everyone queues up; launch them down the lawn (tap when the power bar's high, or grab and throw in VR). Furthest fling wins. |
| 🎁 Free Roam | No quiz, no timer. Eat everything, pull crackers (a BANG and a terrible joke), annoy Michael. |

## The family

| | Who | |
|---|---|---|
| 😎 | **Tommy** | Karen and Paul's son. Marketing in London. Could rebrand Christmas. |
| 📱 | **Charli** | Tommy's sister. Knows every answer; nobody listens. "I literally said that." |
| 🍷 | **Karen** | Joan's daughter, Lisa's sister. Not getting involved. Getting involved. |
| 🙋 | **Paul** | Karen's husband. Argues every answer. |
| 🛒 | **Lisa** | Joan's daughter, Karen's sister. Works at Asda. Looks after Michael, who annoys her. |
| ✉️ | **Michael** | Lisa's husband. Retired postman; still can't walk past a letterbox. |
| 🍸 | **Sophie** | Lisa and Michael's daughter. Works in London, out with the girls every weekend. |
| 🎮 | **Jimmy** | Lisa and Michael's son. Very tall. PC gamer. Works in a school where the kids think he's a legend. |
| 👵 | **Joan (Nan)** | The quizmaster. Lives at Sandy Bay with half the over-60s of Essex as her mates. Loves chocolate. Gets HANGRY. |

Their lines, heights and models are in `js/xmas/family.js`. Change anything to make it truer (or ruder).

## Controls

| | |
|---|---|
| **Quest (controllers)** | Grip: grab food or people. Let go mid-swing: throw. Bring food to your mouth to eat. Swing into someone: slap. Left stick: walk. Right stick: turn. Quiz: point at an answer on the TV and pull the trigger. |
| **Quest (hands)** | Pinch to grab, the rest as above. |
| **Phone / tablet** | Joystick: walk. Drag: look. Tap food: pick it up. EAT / PULL / DRINK, THROW. Tap a person: nudge them (in Feed Nan, with food in your hand: give it to Nan; in Fling: launch them). Quiz: tap an answer card. |
| **Computer** | WASD / arrows, drag to look, click to pick up, E to eat, F or Space to throw. |

## Edit the quiz

`js/xmas/questions.js`: one question per line, `[question, right answer, wrong, wrong, wrong, optional quip]`. A quip is
`"Name: what they say"` and that person says it after the answer is revealed.

## The 3D models

The models are in `assets/family/`. Tommy, Charli, Karen and Paul are their real scans. Lisa, Michael, Sophie, Jimmy and Joan are
detailed procedural stand-ins (built by `tools/makefamily.html`) until real models are made.

**For the best models** (detailed, and no smearing when they move): a photo of each person standing in an A-pose (arms
30-45° out, hands open, feet apart), turned into a textured 3D model (Tripo, Meshy, Rodin), then **rigged** (the tool's
auto-rig, or Mixamo) and exported as a GLB with its skeleton. A rigged model keeps its own skin weights in the game,
so elbows, knees and shoulders bend cleanly. Upload them to `assets/incoming/` with the person's name.

## Code map

```
index.html            the page: menus, HUD, touch controls (styles)
js/xmas/              this game: menu, main loop, family, quiz, questions, Feed Nan + Fling, HUD, Christmas food
js/levels/            the houses (sandybay.js, tewkes.js) and the level kit
js/*.js               Ronnie Simulator's engine: ragdolls, gait, characters, player, hands, food, physics, audio, quality
assets/family/        the family's 3D models;  assets/hands/: hand models (WebXR Input Profiles, MIT)
tools/                model maker, model and level viewers
```
