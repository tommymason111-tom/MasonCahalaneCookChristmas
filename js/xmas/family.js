// THE FAMILY: the nine people at Nan's for Christmas Day.
//
// Three families round Nan's:
//   The Masons: Tommy, Charli, Karen, Paul      The Cahalanes: Lisa, Michael, Sophie, Jimmy      The Cooks: Joan (Nan)
// Karen (Mason) and Lisa (Cahalane) are sisters; Joan Cook is their mum.
//
// Every entry is a squad-style definition (see js/squad.js SquadMember): the game registers them into SQUAD so they get
// the same ragdoll, gait, seating, speech bubbles and physics as everyone in Ronnie Simulator.
//
// MODELS: Tommy, Charli, Karen and Paul are their real 3D scans (from the Boxing Day quiz). Lisa, Michael, Sophie, Jimmy
// and Joan are procedural for now (tools/makefamily.html builds them; their joints are in procbinds.js). To swap in a
// real model, drop a GLB in assets/family/<id>.glb and set its `bind` (where the shoulders, elbows, hands, hips and knees
// are, in metres on the model; see boundDefs in js/ragdoll.js). `fit: true` scales whatever size the model is to `h`.
import { PROC_BINDS } from './procbinds.js';

// joints from marks measured on a front-on picture of a scan, in fractions of the person's height
// (arms: shoulder, elbow, fingertip as [x, y, z forward]; left side, mirrored for the right)
function bindFromMarks(h, m, o = {}) {
  const f = (v) => Math.round(v * h * 1000) / 1000, P = (p) => [f(p[0]), f(p[1]), f(p[2] || 0)];
  const g = o.girth || 1;
  return { sh: P(m.sh), el: P(m.el), ha: P(m.ha), hipX: f(o.hipX || 0.056), hipY: f(o.hipY || 0.50), kneeY: f(o.kneeY || 0.275), neckY: f(o.neckY || 0.835), topY: f(1.0), headZ: f(o.headZ || 0),
    chestW: f(0.1 * g), chestD: f(0.072 * g), pelvisW: f(0.088 * g), arm: f(0.03 * g), leg: f(0.045 * g) };
}

export const TEAMS = {
  mason: { name: 'The Masons', short: 'MASON', color: '#d23b3b', members: ['tommy', 'charli', 'karen', 'paul'] },
  cahalane: { name: 'The Cahalanes', short: 'CAHALANE', color: '#2f8a4a', members: ['lisa', 'michael', 'sophie', 'jimmy'] },
  cook: { name: 'The Cooks', short: 'COOK', color: '#e6b422', members: ['joan'] },
};

const H = { tommy: 1.80, paul: 1.80, karen: 1.62, charli: 1.65, lisa: 1.60, michael: 1.77, sophie: 1.66, jimmy: 1.98, joan: 1.52 };

export const FAMILY = {
  tommy: {
    name: 'Tommy', role: "Karen and Paul's son · marketing in London", team: 'mason', color: '#3a7bd5', voicePitch: 1.0, emoji: '😎',
    model: './assets/family/tommy.glb', modelBody: { h: H.tommy, fit: true },
    blurb: 'Works in marketing in London. Thinks he could rebrand Christmas. Gets wound up by his dad every single year.',
    banks: {
      greet: ['Merry Christmas, Nan! I got the early train. Well, the second train.', "Right, who's on the Prosecco? Cahalanes, I'm looking at you."],
      chatter: ["In London we'd call this a team-building exercise.", 'I do marketing, Nan. I could rebrand Christmas for you. "Nan-ta Claus."', 'Dad. DAD. It\'s not your turn.', "Jimmy, mate, you don't have to duck in EVERY doorway. Oh. You do.",
        'Sophie, which line are you getting back? Same. We could share a train and not talk.', 'Nan, how many friends have you GOT round here? The whole street waved at me.', "Michael's been here ten minutes and he's already got the remote. How?",
        "Dad's like a pop-up ad. You close him and he comes straight back.", 'Charli, stop filming me eating.', 'Has anyone seen the Quality Street? Oh. Nan.'],
      right: ['Easy. EASY.', "That's the London education, that.", 'Write it down, Charli. Big letters.'],
      wrong: ["That's what Dad said. I only wrote it because he wouldn't stop.", "Hang on, that's a badly worded question."],
      hit: ['Not the face, I\'ve got a Teams call on the 27th!', 'Oi!', 'I\'ve got work on Monday!'],
      slap: ['DAD! Did you see that?!'], grabbed: ['Put me down, I\'m twenty-something years old!'], launched: ['NOT THE TRAINERS—'],
    },
  },
  charli: {
    name: 'Charli', role: "Tommy's sister", team: 'mason', color: '#e05a9a', voicePitch: 1.25, emoji: '📱',
    model: './assets/family/charli.glb', modelBody: { h: H.charli, fit: true, bind: bindFromMarks(H.charli, { sh: [0.109, 0.830], el: [0.120, 0.654], ha: [0.125, 0.511] }, { girth: 0.92 }) },
    blurb: 'Says everything first. Nobody listens. Films everything for the group chat.',
    banks: {
      greet: ['Merry Christmas! Everyone stand still, I need one photo. ONE.', 'Nan! You look lovely! Is that new? It\'s the same one. Still lovely.'],
      chatter: ['I literally said that.', 'Dad, sit DOWN.', "I'm putting this on the group chat.", 'Did anyone film that?', "Sophie, what are you doing for New Year's? Can I come? I'm coming.",
        "Michael, that's the fourth mince pie. I'm counting.", 'Jimmy, can you reach the angel on the tree? Course you can.', "Nan's friends have a better social life than me.", "Lisa, is the Asda discount real? Asking for Mum."],
      right: ['I SAID THAT!', 'I literally said that. Nobody listens to me.', 'Told you so.'],
      wrong: ['That was Tommy. I said the other one.', "Don't look at me."],
      hit: ['I\'m telling Mum!', 'TOMMY!', 'Did anyone film that?'], slap: ['Right. That\'s going on the group chat.'], grabbed: ['Put me DOWN!'], launched: ['MUUUUM—'],
    },
  },
  karen: {
    name: 'Karen', role: "Joan's daughter · Tommy and Charli's mum", team: 'mason', color: '#a8325a', voicePitch: 1.05, emoji: '🍷',
    model: './assets/family/karen.glb', modelBody: { h: H.karen, fit: true, bind: bindFromMarks(H.karen, { sh: [0.109, 0.814, 0], el: [0.122, 0.825, 0.142], ha: [0.140, 0.857, 0.262] }) },
    blurb: "Lisa's sister and Joan's daughter. Not getting involved. Getting involved.",
    banks: {
      greet: ['Happy Christmas, Mum! Lisa, you\'re early. You\'re never early.', "Hello, hello! Paul, take the coats. PAUL."],
      chatter: ['Paul.', "I'm not getting involved.", 'Can we just have ONE nice Christmas?', 'Lisa, remember when you broke the greenhouse and blamed me? 1989. I remember.', 'Mum, have you eaten? You\'re getting that look.',
        'Has anyone seen my bag?', "Michael, give Lisa the remote. Michael. MICHAEL.", 'Jimmy, you were THIS big. Now look at you. Mind the light.', 'Sophie, are you eating properly in London? You look thin. You look lovely. Eat something.'],
      warn: ['Paul.', 'Paul. Enough.', 'PAUL.'],
      right: ['Oh! I knew that!', 'See, Paul? I do know things.'], wrong: ['I wasn\'t getting involved anyway.', "Don't blame me, I said I wasn't getting involved."],
      hit: ['Tommy! I\'m your MOTHER!', 'Not the wine!'], slap: ["Right, that's it, I'm getting involved."], grabbed: ['Put me down! Mum, tell him!'], launched: ['NOT THE PROSECCOOO—'],
    },
  },
  paul: {
    name: 'Paul', role: "Karen's husband · Tommy and Charli's dad", team: 'mason', color: '#c0392b', voicePitch: 0.6, emoji: '🙋', heavy: true,
    model: './assets/family/paul.glb', modelBody: { h: H.paul, fit: true, girth: 1.25, bind: bindFromMarks(H.paul, { sh: [0.14, 0.80], el: [0.31, 0.807], ha: [0.495, 0.81] }, { girth: 1.2, hipX: 0.062 }) },
    blurb: "Argues about everything: the telly, the turkey, the rules of Monopoly. Was right once in 2009 and hasn't let it go.",
    banks: {
      greet: ["Merry Christmas, Joan! Where's the pigs in blankets? I'm joking. Where are they?", 'Michael! Michael. Has Lisa let you out?'],
      chatter: ["That's what I said!", "The turkey's a bit dry. I'm just saying.", "I'm not arguing, I'm explaining why I'm right.", 'Joan, you gave the Cahalanes the bigger roasties. I\'ve noticed.', 'Jimmy, how\'s the weather up there?',
        'Michael, you used to deliver to this road! Did they ever tip you? No? I\'m not surprised.', 'Who\'s eaten all the pigs in blankets? Oh. Me.', "Sophie, London prices! Eight pound for a pint! I'd move back.", 'Tommy, put the phone away. What? I\'m looking at the football.'],
      argue: ["That's what I put!", 'Half a point for the spirit of the answer!', "I'm appealing that.", "It's the same thing!", 'Joan, that\'s a typo on YOUR sheet.'],
      right: ['YES! Write it down! Big letters!', 'Told you. TOLD you. Karen, tell them I told them.'], wrong: ["That's what I put. Basically.", "I'm appealing that."],
      hit: ['Oi! My back!', "That's assault, that is. Karen, did you see that?", 'I meant to do that.'], slap: ['Mind the telly!'], grabbed: ["Put me DOWN! I'm a big man!"], launched: ['KAAAAREN—'],
    },
  },
  lisa: {
    name: 'Lisa', role: "Joan's daughter · Karen's sister · works at Asda", team: 'cahalane', color: '#2f8a4a', voicePitch: 1.1, emoji: '🛒',
    model: './assets/family/lisa.glb', modelBody: { h: H.lisa, fit: true, bind: PROC_BINDS.lisa.bind },
    blurb: "Works at Asda. Looks after Michael, who annoys her. Karen's little sister (and don't she know it).",
    banks: {
      greet: ['Merry Christmas, Mum! I\'ve brought the stuff from Asda. Michael, carry the bags. Michael. MICHAEL.', 'Karen! You\'re LATE. Oh, we\'re early. Still.'],
      chatter: ['Michael, leave it.', 'Michael. What did I JUST say.', "I've done forty hours at Asda this week, I'm not doing the washing up.", "That's Asda's own. Nobody can tell. Paul, can you tell? See.",
        'Karen, you broke that greenhouse and you know it.', 'Mum, put the chocolate down, dinner\'s in ten minutes. Fine. ONE.', 'Jimmy, sit down, the kids at school aren\'t watching.', 'Sophie, text me when you get to the station. And when you get home. And in the morning.',
        'Michael, stop telling Paul about the round. Nobody wants to hear about the round.', "Every Christmas! Every single Christmas, Michael."],
      michael: ['Michael.', 'MICHAEL.', 'Michael, leave it.', 'For God\'s sake, Michael.', "Don't encourage him, Paul."],
      right: ['Yes! Thank you! I KNEW it.', 'See, Karen? I\'m the clever one.'], wrong: ['Michael wrote that.', "That's Michael's handwriting."],
      hit: ['I\'ve been on my feet all week!', 'Oi! I work at Asda, I\'ll get you barred!'], slap: ['MICHAEL! Was that you?'], grabbed: ['Put me down! Karen, tell your son!'], launched: ['MICHAAAAEL—'],
    },
  },
  michael: {
    name: 'Michael', role: "Lisa's husband · retired postman", team: 'cahalane', color: '#d35400', voicePitch: 0.8, emoji: '✉️', heavy: true,
    model: './assets/family/michael.glb', modelBody: { h: H.michael, fit: true, girth: 1.15, bind: PROC_BINDS.michael.bind },
    blurb: "Lisa's husband. Used to be a postman and still can't walk past a letterbox. Winds Lisa up for sport.",
    banks: {
      greet: ['Merry Christmas! Special delivery! It\'s me. I\'m the delivery.', 'Joan! Signed for, first class. Give us a kiss.'],
      chatter: ['I did this road for eleven years, you know. Number 42 had a dog. Still got the scar on my trainer.', 'Lisa. Lisa. LISA. ...nothing, just checking.', 'First class, this turkey.',
        'Paul, do you want to hear about the Tuesday round? Course you do.', 'I\'m not annoying, I\'m enthusiastic.', "Jimmy, you're taller than the postbox now. Taller than me. Taller than the bloke who did the airmail.",
        'I could do the cards, Joan. Sort them by postcode. I\'ve still got the touch.', 'Return to sender! That\'s Elvis, that is, Sophie. Look him up.', 'Who\'s having that last pig in blanket? Nobody? Delivered.', 'Lisa says I wind her up. I say I keep her young.'],
      right: ['Signed, sealed, DELIVERED!', 'First class answer, that.'], wrong: ['Must\'ve got lost in the post.', "That's Lisa's fault."],
      hit: ['Oi! I\'ve had worse from a Jack Russell.', 'Return to sender!'], slap: ['Lisa! He hit me! LISA!'], grabbed: ['Handle with care! FRAGILE!'], launched: ['AIRMAAAAIL—'],
    },
  },
  sophie: {
    name: 'Sophie', role: "Lisa and Michael's daughter · works in London", team: 'cahalane', color: '#8e44ad', voicePitch: 1.3, emoji: '🍸',
    model: './assets/family/sophie.glb', modelBody: { h: H.sophie, fit: true, girth: 0.92, bind: PROC_BINDS.sophie.bind },
    blurb: 'Works in London and goes out with the girls every weekend. Has a train to catch. Will miss it.',
    banks: {
      greet: ['Merry Christmas! I can only stay till six, I\'m seeing the girls. Okay, half six.', 'Nan! The girls say hi. Well, they don\'t know you. They\'d say hi.'],
      chatter: ["The girls are in Shoreditch and I'm pulling crackers in my Nan's living room. Love it. Honestly.", 'Dad. Stop. Stop telling the postman story.', 'My train\'s at 6:42. Someone remind me at six. Nobody will.',
        'Charli, send me that video. No, the OTHER one.', 'Tommy, we work in London and we\'ve never once met up. Iconic.', 'Jimmy, stop playing on your phone. Oh, it\'s a Switch. Same thing.', "In London, this would be forty quid a head.", 'Nan, your friends are the party. Maureen\'s doing shots.'],
      right: ['Easy. Pub quiz Tuesdays with the girls, babe.', 'YES. Put it in the group chat.'], wrong: ['That\'s a London thing, you wouldn\'t get it.', 'Dad said it.'],
      hit: ['My NAILS!', 'I literally just did my hair!'], slap: ['Mum! MUM!'], grabbed: ['Put me down, I\'ve got a train to catch!'], launched: ['I\'LL MISS MY TRAAAAIN—'],
    },
  },
  jimmy: {
    name: 'Jimmy', role: "Lisa and Michael's son · works in a school", team: 'cahalane', color: '#16a085', voicePitch: 0.75, emoji: '🎮',
    model: './assets/family/jimmy.glb', modelBody: { h: H.jimmy, fit: true, girth: 0.95, bind: PROC_BINDS.jimmy.bind },
    blurb: 'Very tall. Lives on his PC. Works in a school, where all the kids think he is a legend.',
    banks: {
      greet: ['Merry Christmas, Nan. *ducks under the door frame* Every year. Every single year.', 'Alright everyone. Has anyone seen the Wi-Fi password?'],
      chatter: ['Nan, what\'s the Wi-Fi? "Joan123"? Nan, that\'s not safe.', 'I\'ve got a raid at eight. I\'m not missing the raid.', 'The kids at school made me a card. It says "Mr Jimmy is the best". It\'s on the fridge at home. It\'s staying there.',
        'Mind the light. Mind the light. Ow.', 'I could build Nan a gaming PC. She\'d smash Fortnite.', "Year 4 think I'm famous because I can reach the top shelf.", 'Dad, that story was eleven minutes long.', 'Can we do a quiz round on games? We\'d win. I\'d win.', 'If anyone needs anything off a high shelf, I\'m here all day.'],
      right: ['GG. Easy.', 'Clutch.', 'That\'s a W.'], wrong: ['Lag.', 'That\'s a skill issue. On Dad\'s part.'],
      hit: ['Ow! I\'m a teacher! Well, I work in a school!', 'Lag! That was lag!'], slap: ['Bro. Not the glasses. I don\'t have glasses. Still.'], grabbed: ['How are you lifting me? I\'m six foot six!'], launched: ['RAGE QUIIIIT—'],
    },
  },
  joan: {
    name: 'Joan', role: "Nan · Joan Cook · Karen and Lisa's mum", team: 'cook', color: '#e6b422', voicePitch: 1.15, emoji: '👵',
    model: './assets/family/joan.glb', modelBody: { h: H.joan, fit: true, girth: 1.05, bind: PROC_BINDS.joan.bind },
    blurb: "Nan. Lives at Sandy Bay with half the over-60s of Essex as her mates. Loves chocolate. Gets HANGRY.",
    banks: {
      greet: ['Hello, my darlings! Merry Christmas! Come in, come in, mind the step.', "There they are! Shoes off, it's a new carpet. It's not new. Shoes off."],
      chatter: ["Pat from number 9 says hello. And Maureen. And Brenda. And Dot. And Pam. And Val.", "Who's touched my chocolates?", "Dinner's at two. Not five past. TWO.", 'I\'ve got bingo Tuesday, aqua aerobics Wednesday and Maureen\'s birthday Thursday. I\'m very busy.',
        'Lisa, take that chocolate off me before I eat the lot. ...No, give it back.', "Karen, you've always been like this. Since you were six.", 'Jimmy, you were the smallest baby on the ward. Look at you now. Mind the light.',
        'Michael, you can sort the cards if you stop talking about the round.', 'Sophie, have you got a boyfriend? A girlfriend? A cat? Anything?', 'Tommy, what is it you DO in London? Marketing? Is that the shops?'],
      hangry: ['I am STARVING. Where is my DINNER?', 'Nobody talk to me until there are roast potatoes in front of me.', "Where's the chocolate. Someone get me the chocolate. NOW.", 'If one more person says "five more minutes" about that turkey...'],
      fed: ['Ooh, lovely. Now I\'m a nice Nan again.', 'Mmm. That\'s better. Who wants a cuddle?', 'Oh you are good to me.'],
      right: ['Correct! Ooh, aren\'t you clever.', 'That\'s right, darling.', 'Yes! Point to them.'], wrong: ['No, darling. Bless you.', 'Wrong! Lovely try though.', "No. And Paul, don't start."],
      hit: ['OI! I\'m eighty-something!', 'Do that again and you\'re out of the will.'], slap: ['You\'re not too old for a clip round the ear!'], grabbed: ['Put your Nan DOWN!'], launched: ['MY CHOCOLAAAATES—'],
    },
  },
};
export const FAMILY_IDS = Object.keys(FAMILY);
export const PLAYERS = FAMILY_IDS;       // anyone can be played, Nan too
for (const id of FAMILY_IDS) FAMILY[id].h = H[id];
