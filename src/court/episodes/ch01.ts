import type { Episode } from "../types";
import {
  choice,
  coin,
  fx,
  gain,
  has,
  is,
  line,
  puzzle,
  say,
  search,
  set,
  stat,
  supply,
  sus,
  talk,
  trust,
  when,
} from "../dsl";

// ─────────────────────────────────────────────────────────────────────────────
// Chapter 1 — रात्रि का अंतिम पहर · The Last Watch (before dawn)
// ─────────────────────────────────────────────────────────────────────────────


export const CHAPTER_1: Episode[] = [
  // ── 1 ──────────────────────────────────────────────────────────────────────
  {
    n: 1,
    id: "e001-the-iron-bell",
    chapter: 1,
    title: "लोहे का घंटा · The Iron Bell",
    location: "chambers",
    objective: "Wake. Nandini is at the door",
    cast: ["nandini"],
    beats: [
      say(
        "The iron bell. Not the temple bell, which is bronze and pleased with itself — the iron one above the gate, which rings for fire, for the dead, and for prisoners. It rings three times and stops. (Space, to go on.)",
      ),
      say(
        "I am awake before the third stroke fades. I think I have been awake for an hour, lying in the dark, listening to the fortress breathe through its stones.",
      ),
      line("nandini", "Highness. You're awake. Good — I didn't want to be the one who shook you."),
      say(
        "Nandini, with a clay lamp cupped in one hand so the flame won't reach the ceiling. Sixteen, barefoot on cold stone, and already dressed. I have never once in four years managed to wake before her.",
      ),
      line(
        "nandini",
        "They've brought someone in at the gate. A woman, under guard — Captain Vikram's men, back from the western ford. The grooms are saying she's a royal courier.",
      ),
      say(
        "A courier at the last watch, in irons. Couriers come in by daylight with the post, and are given bread and a bench in the kitchens. Nobody rings the iron bell for the post.",
      ),
      line(
        "nandini",
        "And this. You left it under the bolster again. I've kept your notes in it since you were small enough to write on the walls instead — every name, every thing you swore you'd remember.",
      ),
      say(
        "My Case Book. Soft goatskin, the corners gone round with handling, her small neat hand beside my bad one on half the pages. Whatever I learn today, she will see it goes in here. (Press C to open it.)",
      ),
      choice("She holds out two things over her arm and waits. Which will you wear?", [
        {
          label: "Court silks",
          detail: "The saffron and the gold. If the court is awake, let it see its prince.",
          fx: (s) => set("dress", "silk")(stat({ renown: 1 })(s)),
          then: [
            say(
              "The silks. They are cold from the chest and they smell of camphor, and they make me stand the way my father's tailors intended. If anyone sees me tonight, they will see a prince, and they will remember it.",
            ),
            line("nandini", "You'll be seen from the far side of the courtyard in that. I suppose that's the point."),
          ],
        },
        {
          label: "The plain dark cloak",
          detail: "Wool the colour of the hour. A man nobody looks at twice.",
          fx: (s) => set("dress", "plain")(stat({ cunning: 1 })(s)),
          then: [
            say(
              "The dark cloak. Wool, undyed, the one I wear to the stables. In it I am a servant's height and a servant's shape, and nobody on the walls will think to wonder why the second son is out before the birds.",
            ),
            line("nandini", "Good. Half the palace will be at its windows. Better they see a groom."),
          ],
        },
      ]),
      line(
        "nandini",
        "Vikram's men will walk her across the courtyard to the dungeon stair. If you want to see her face, you'll have to be there before they are.",
      ),
      say(
        "She has chalked it on the slate by my door, the way she chalks every day's errands for me: Courtyard. The slate is always right. I have learned to go where it says. (The line at the top of your sight is the slate. Walk there.)",
      ),
    ],
  },

  // ── 2 ──────────────────────────────────────────────────────────────────────
  {
    n: 2,
    id: "e002-torches-in-the-courtyard",
    chapter: 1,
    title: "आँगन में मशालें · Torches in the Courtyard",
    location: "courtyard",
    objective: "Go down to the courtyard before the guards cross it",
    cast: ["chaya", "vikram", "ranadhir"],
    beats: [
      say(
        "The courtyard at the last watch: frost on the flagstones, the well-rope stiff with it, and six torches coming through the gate arch in pairs. The smoke goes straight up. There is no wind at all.",
      ),
      say(
        "She walks between them with her hands bound in front of her. A woman of perhaps thirty-five, a courier's dark coat, a red scarf gone brown with road dust. She walks like someone who has come further today than any of the men guarding her.",
      ),
      say(
        "Halfway across, she stops — the guards stop with her, as if she were the one leading — and she lifts her face to the east balcony.",
      ),
      say(
        "My brother is standing there. Ranadhir, in a night robe, with no lamp. For a moment the torchlight finds him. Then he takes one step back, and the dark has him again, as if he had never been there.",
      ),
      fx(gain("balcony-watcher")),
      choice("The guards are moving again. What do you do?", [
        {
          label: "Step into the torchlight",
          detail: "Let her see that someone in this house is awake and looking.",
          fx: set("courtyardStance", "seen"),
          then: [
            say(
              (s) =>
                s.flags.dress === "silk"
                  ? "I walk out of the colonnade into the light. The silks catch it like a struck lamp. Every guard's head turns, and then, slowly, hers."
                  : "I walk out of the colonnade into the light and push the hood back, so there is no mistaking whose face it is. The guards straighten. Then, slowly, she turns her head.",
            ),
            say(
              "She looks at me for exactly as long as it takes to know who I am. Nothing in her face changes. Then she nods — once, very slightly, the way you acknowledge someone who has kept an appointment.",
            ),
          ],
        },
        {
          label: "Stay in the shadow and watch who else is watching",
          detail: "She is not the only thing moving in the courtyard tonight.",
          fx: set("courtyardStance", "watched"),
          then: [
            say(
              "I stay behind the pillar and let my eyes go along the windows instead. The fortress has a great many windows and most of them are dark. Most.",
            ),
            say(
              "In the Chancery, on the north side, one lamp. A shape behind the lattice: turbaned, still, not pretending to be anything but awake. Mantri Kaushal, watching the prisoner cross the courtyard the way a man watches a parcel he has paid for arrive.",
            ),
            say(
              "Two men at their windows at the last watch. One stepped back when he was seen. The other didn't bother.",
            ),
          ],
        },
        {
          label: "Follow the guards to the dungeon stair",
          detail: "Keep to the colonnade. See where they take her.",
          fx: set("courtyardStance", "followed"),
          then: [
            say(
              "I keep to the colonnade, a pillar behind them, and I am at the head of the dungeon stair when they reach it. The torchlight goes down the steps ahead of her like water.",
            ),
            say(
              "At the bottom, the gaoler's voice, thick with sleep: 'Which one.' And Vikram, very tired: 'Three. The Minister said three.' A door. A bolt. Then only the torches coming back up, and me flat against the wall to let them pass.",
            ),
          ],
        },
      ]),
      say(
        "The last torch goes. The frost on the flagstones shows where she walked — a line of dark prints, smaller than the soldiers', already filling in with white.",
      ),
    ],
  },

  // ── 3 ──────────────────────────────────────────────────────────────────────
  {
    n: 3,
    id: "e003-captain-vikram",
    chapter: 1,
    title: "कप्तान विक्रम · Captain Vikram",
    location: "courtyard",
    objective: "Speak to Captain Vikram in the courtyard",
    cast: ["vikram"],
    beats: [
      say(
        "Captain Vikram is at the well, drinking straight from the bucket, with his helmet under his arm. There is mud to his thighs and three days of the western road on his face.",
      ),
      talk(
        "vikram",
        (s) =>
          s.flags.courtyardStance === "followed"
            ? "Highness. You were on the stair just now. I saw the edge of you. I'd take it kindly if the prince didn't follow my men in the dark — they're tired, and tired men draw steel at shadows."
            : s.flags.courtyardStance === "seen"
              ? "Highness. You gave my men a turn, stepping out like that. The prisoner too, I think. Though she's hard to turn."
              : "Highness. I didn't see you there. I suppose that was the idea.",
        [
          {
            id: "where",
            label: "Where did you take her?",
            required: true,
            reply: [
              line(
                "vikram",
                "The western ford, at dusk, three days ago. She was riding west. Toward Meghadurg. We had her before she reached the water.",
              ),
              line("vikram", "Three days back at a walk, because the Minister wanted her brought in whole. Now I've said it I can go to bed."),
              fx(gain("arrest-report")),
            ],
          },
          {
            id: "carried",
            label: "What was she carrying?",
            required: true,
            reply: [
              line(
                "vikram",
                "A courier's satchel. Sealed — the old courier's knot, wax over it. I didn't open it. I'm not paid to read. I put it into the Minister's own hand an hour ago.",
              ),
              say("He says it with a certain pride. An unopened satchel is a clean conscience, for a soldier."),
            ],
          },
          {
            id: "warrant",
            label: "Whose warrant were you riding on? And since when?",
            required: true,
            reply: [
              line(
                "vikram",
                "The Minister's, with the proper seal. Carried it in my belt six days. Watch the western ford, a woman courier, a bay mare with a white foot. We sat in the reeds three days before she came.",
              ),
              say("He hears it a moment after I do. His jaw sets."),
              line("vikram", "Which is to say the Minister is very well informed, Highness. As a Minister should be. I'd not repeat that at court."),
              say(
                "Six days. The warrant for her arrest was signed three days before anyone had laid eyes on her. Somebody knew she was coming, and which road, and what horse.",
              ),
              fx(gain("early-warrant")),
            ],
          },
          {
            id: "resist",
            label: "Did she fight you?",
            reply: [
              line(
                "vikram",
                "No. She asked which of us was in charge, and then she gave me her knife, hilt first, like a gift. Seven of us, and she made it feel like she'd arrested us.",
              ),
            ],
          },
          {
            id: "rest",
            label: "You've been three days in the saddle. Go and sleep, Captain.",
            reply: [
              line("vikram", "I will. After I've written it down, and after the Minister's read what I've written. That's the order of things."),
              say("But something in his shoulders lets go. Nobody at court has told him to sleep in some years, I think."),
              fx(trust("vikram", 1)),
            ],
          },
        ],
        "He puts his helmet back on to leave, which is unnecessary, and a kind of dignity.",
      ),
      say("Her horse will be in the stables. Horses don't lie, and nobody thinks to ask them."),
    ],
  },

  // ── 4 ──────────────────────────────────────────────────────────────────────
  {
    n: 4,
    id: "e004-the-stable-boy",
    chapter: 1,
    title: "अस्तबल का लड़का · The Stable Boy",
    location: "stables",
    objective: "Find the courier's horse in the stables",
    cast: ["moti"],
    beats: [
      say(
        "The stables are the only warm place in Vajragarh before dawn. Horse-breath, straw, the lamp on its hook swinging a little each time something shifts in the stalls.",
      ),
      say(
        "Moti is rubbing down a bay mare with a twist of straw, talking to her in the voice he uses for horses and small children. She is lathered to the shoulder and trembling. One white foot.",
      ),
      line("moti", "Highness! You're up early. Or late. She's the prisoner's. They rode her into the ground and then walked her for three days, which is worse. Look at her."),
      search(
        "Moti holds the lamp for me without being asked. The mare turns her head to watch what I do.",
        [
          {
            id: "hooves",
            label: "The hooves",
            required: true,
            reply: [
              say(
                "I lift the near forefoot. The shoe is wrong. Broad, flat, the nails set in a straight line with square heads — nothing like the narrow toe-clipped iron our smiths hammer for mountain stone.",
              ),
              line("moti", "That's not ours. That's river-country work, that is. Flat shoes for flat roads. You'd lame a horse in a week on our passes with those."),
              say(
                "The nail heads are bright. Not a scratch of rust, hardly any wear. A week at most. She was shod in Meghadurg, and recently — and then someone rode her back toward us.",
              ),
              fx(gain("new-horseshoes")),
            ],
          },
          {
            id: "saddlebags",
            label: "The saddlebags",
            reply: [
              say(
                "Hanging on the stall post. Empty — emptied, the buckles left undone by someone in a hurry. But the bottoms are packed with dry river reed, the way you pad a bag so a flask won't knock.",
              ),
              say("There is no river reed on our side of the mountains. There are no rivers on our side of the mountains worth the name."),
            ],
          },
          {
            id: "chatter",
            label: "Let Moti talk",
            reply: [
              line("moti", "Her name's Kesar. It's stitched on the girth, see. Couriers name their horses. My da says that's how you tell a courier from a soldier — soldiers number theirs."),
              line("moti", "She was the Queen's courier once, Sumitra says. The one they sent away. Sumitra cried in the bread this morning when she heard, and pretended it was the onions. We don't have onions in the bread."),
            ],
          },
        ],
      ),
      choice("Moti has stopped rubbing the mare to look at you, hopeful and pretending not to be.", [
        {
          label: "Press a coin into his hand",
          detail: "For the mare's sake. Oats, and a blanket.",
          requires: coin(1),
          lockedReason: "Your purse is empty.",
          fx: (s) => trust("moti", 1)(supply({ coin: -1 })(s)),
          then: [
            line("moti", "For her? I'll get her the good oats. The Senapati's oats. He'll never know. Thank you, Highness."),
            say("One copper fewer. It is the easiest coin I will spend today, and I suspect I will remember it."),
          ],
        },
        {
          label: "Thank him and go",
          detail: "Coin at court is coin you won't have later.",
          then: [line("moti", "She'll be all right. I'll sit up with her."), say("He will, too. He'll sit up with her till the bell.")],
        },
      ]),
    ],
  },

  // ── 5 ──────────────────────────────────────────────────────────────────────
  {
    n: 5,
    id: "e005-karans-ring",
    chapter: 1,
    title: "करण का छल्ला · Karan's Ring",
    location: "dungeon",
    objective: "Go down the dungeon stair",
    cast: ["karan"],
    beats: [
      say(
        "Forty-one steps down, each one wetter than the last. At the bottom, the guardroom: a brazier, a stool, a clay jug, and Karan the gaoler, with his ring of keys across his knees like a cat.",
      ),
      say(
        "He counts them with his thumb as I come in. Eleven keys. He counts them the way other men tell prayer beads — without looking, without stopping, all night.",
      ),
      line("karan", "No, Highness. Nobody goes down the row before first bell. That's the rule since before your father. I'd not break it for the Senapati and I'll not break it for you."),
      choice("Karan does not get up.", [
        {
          label: "Order him, as a prince",
          detail: "The rule is older than your father. You are your father's son.",
          fx: (s) => set("karanWay", "ordered")(sus(1)(stat({ renown: 1 })(s))),
          then: [
            say(
              (s) =>
                s.flags.dress === "silk"
                  ? "I say his name, and my father's, and stand in the light so the silks do the rest. He looks at the gold at my collar for a long moment."
                  : "I push back my hood and say his name, and my father's. In the stable cloak it sounds thinner than I mean it to. But he knows the voice.",
            ),
            line("karan", "As the prince commands. I'll be asked about it. I'll say the prince commanded. You understand me."),
            say("I understand him. By first bell, somebody upstairs will know I was down here."),
          ],
        },
        {
          label: "Put a coin on his stool",
          detail: "Every rule at court has a price. This one is cheap.",
          requires: coin(1),
          lockedReason: "Your purse is empty.",
          fx: (s) => set("karanWay", "bribed")(supply({ coin: -1 })(s)),
          then: [
            say("I set the copper on the stool beside him. He looks at it without touching it, the way you look at a thing you are about to decide you never saw."),
            line("karan", "Must've been there all night, that. Go on, then. Quiet. Three's at the end. Don't touch the bars, they're filthy."),
          ],
        },
        {
          label: "Sit down and share his wine",
          detail: "He has been down here alone since the iron bell.",
          fx: (s) => set("karanWay", "wine")(stat({ cunning: 1 })(s)),
          then: [
            say("I pull the other stool over and hold out my hand for the jug. He stares. Then he laughs, once, like a dog coughing, and gives it me."),
            say("The wine is sour enough to strip a blade. We drink it in turns. He tells me about his knees, and his daughter in the lower town, who does not visit."),
            line("karan", "Everybody wants cell three tonight, you know. Everybody. Go on — go and look at her, you've earned it drinking that. Don't tell her I said so."),
          ],
        },
      ]),
      say("The key ring clinks. Eleven keys. He does not look at them as he chooses one."),
    ],
  },

  // ── 6 ──────────────────────────────────────────────────────────────────────
  {
    n: 6,
    id: "e006-cell-three",
    chapter: 1,
    title: "तीसरी कोठरी · Cell Three",
    location: "dungeon",
    objective: "Speak to the prisoner in cell three",
    cast: ["chaya", "karan"],
    beats: [
      say(
        "Cell three is at the end of the row, where the rock sweats. She is sitting on the bench against the back wall with her bound hands in her lap, as though she were waiting for a ferry.",
      ),
      talk(
        "chaya",
        (s) => {
          const a =
            s.flags.courtyardStance === "seen"
              ? "The one in the torchlight. I wondered how long you'd be. "
              : s.flags.courtyardStance === "followed"
                ? "You were on the stair. You breathe loudly for a prince. "
                : "Arunveer. You've grown. ";
          const b =
            s.flags.dress === "silk"
              ? "And in silk, at this hour. Did you dress for me, or for whoever's watching you come down here?"
              : "And dressed as nobody. Sensible. Someone taught you something.";
          return a + b;
        },
        [
          {
            id: "who",
            label: "Who are you?",
            required: true,
            reply: [
              line("chaya", "Chaya. I carried the royal post for ten years. Then I didn't. Ask your father why — he signed it."),
              say("She knows my name and I did not know hers. I am beginning to understand that this will be the shape of the whole day."),
            ],
          },
          {
            id: "spy",
            label: "Were you spying for Meghadurg?",
            required: true,
            reply: [
              line("chaya", "Ask whoever emptied my satchel what was in it."),
              say("Not a denial. Not anything. She says it the way you hand someone a key and walk off before they find the door."),
            ],
          },
          {
            id: "which-way",
            label: "Which way were you riding?",
            required: true,
            reply: [line("chaya", "Which way are you?"), say("She waits, to see if I have an answer. I don't. She seems to find that unsurprising, and not unkind.")],
          },
          {
            id: "shoes",
            label: "Show: Meghadurg Horseshoes",
            requires: has("new-horseshoes"),
            reply: [
              say("I tell her about the mare's feet. Broad river shoes. Bright nails. A week old at most."),
              say("For the first time something moves in her face. Not fear. Something closer to approval."),
              line("chaya", "I was coming home."),
              line("chaya", "Kesar hates those shoes. Tell the boy to take them off her before she goes lame on your stones."),
              fx(gain("chaya-said-east"), trust("chaya", 1)),
            ],
          },
          {
            id: "hurt",
            label: "Have they hurt you?",
            reply: [
              line("chaya", "Not yet. They're saving it. They want everyone to see."),
              say("She says it with no more weight than a weather report."),
            ],
          },
        ],
        "Behind me the gaoler coughs. The rule is the rule. She has already turned her face to the wall, as though I had simply stopped being interesting.",
      ),
    ],
  },

  // ── 7 ──────────────────────────────────────────────────────────────────────
  {
    n: 7,
    id: "e007-the-ministers-brazier",
    chapter: 1,
    title: "मंत्री की अंगीठी · The Minister's Brazier",
    location: "chancery",
    objective: "Go to the Chancery — the Minister's lamp is still lit",
    cast: ["kaushal"],
    beats: [
      say(
        (s) =>
          s.flags.courtyardStance === "watched"
            ? "The lamp I saw from the courtyard is still burning. Through the gap in the shutter, the Chancery: shelves of rolled charters, the great seal in its box, and a brass brazier with the lid off."
            : "There is a lamp in the Chancery — there shouldn't be, at this hour. Through the gap in the shutter: shelves of rolled charters, the great seal in its box, and a brass brazier with the lid off.",
      ),
      say(
        "Mantri Kaushal sits beside it in his night shawl with a stack of papers on his knee. He takes one, holds it to the lamp, reads it to the end. Then he feeds it to the coals and watches it go. Then the next.",
      ),
      say(
        "He is in no hurry at all. That is the part that stays with me. A man burning evidence in a panic would be almost reassuring.",
      ),
      fx(gain("burning-at-dawn")),
      choice("There are perhaps a dozen sheets left on his knee.", [
        {
          label: "Open the shutter and step in",
          detail: "Stop him now, while there's something left to stop.",
          fx: (s) => set("brazier", "interrupted")(sus(2)(s)),
          then: [
            say("I push the shutter wide. He doesn't start. He lays the sheet in his hand face-down on the stack, and closes the lid of the brazier with the tongs, gently, like a man covering a sleeping child."),
            line("kaushal", "Highness. You keep a soldier's hours. I did not know that about you."),
            line("kaushal", "Old correspondence. The Chancery chokes on paper if it is not thinned. Shall I have a boy bring you something warm? No? Then good night — or good morning. I will remember that you rise early."),
            say("He takes the rest of the stack with him when he goes. He does not hurry about that, either."),
          ],
        },
        {
          label: "Wait in the dark until he leaves",
          detail: "Let him finish. See what he leaves behind.",
          fx: (s) => set("brazier", "waited")(stat({ cunning: 1 })(s)),
          then: [
            say("I stand with my back to the cold wall and count his sheets by the flare of each one through the shutter. Eleven. Twelve. My feet go numb. The sky over the east wall goes the colour of slate."),
            say("At last he rises, stretches like an old man, and goes out by the inner door without looking back. He does not close the brazier. Why would he. Nobody is awake."),
          ],
        },
        {
          label: "Send Nandini with a false summons",
          detail: "'The king asks for the Mantri.' A lie with her name on it.",
          fx: (s) => set("brazier", "nandini")(trust("nandini", 1)(s)),
          then: [
            say("She is at my elbow before I have finished whispering it — she has been following me all night, of course. She listens, nods, and goes round to the Chancery door."),
            line("nandini", "Mantri-ji. Forgive me. The king is asking for you — in the small room. Now, he said."),
            say("Kaushal rises at once. He leaves the last sheets under a paperweight and the brazier open. The king does not like to wait. Nobody knows that better than his Minister."),
            say("She comes back pale and very pleased with herself. When he reaches the small room he will find nobody. He will ask who sent the girl."),
            line("nandini", "He'll think it was a page playing tricks. Pages do. I'll make sure one of them gets blamed."),
          ],
        },
      ]),
      say("The Chancery is empty. The coals in the brazier are still ticking as they cool."),
    ],
  },

  // ── 8 ──────────────────────────────────────────────────────────────────────
  {
    n: 8,
    id: "e008-ash",
    chapter: 1,
    title: "राख · Ash",
    location: "chancery",
    objective: "Search the Minister's brazier",
    cast: [],
    beats: [
      say(
        (s) =>
          s.flags.brazier === "interrupted"
            ? "He closed the lid on it, and the coals kept eating under the brass. What's left is mostly grey. I lift it out a flake at a time with the tongs and my own held breath."
            : "The coals are down to a red eye. Most of what he fed them is gone to a soft grey fur, but the last sheet went in whole, and the edges of it didn't take.",
      ),
      say(
        "Five pieces of one sheet, brittle, brown at the rims, one still warm. I lay them on the Minister's own desk and bend over them like a boy over his lesson.",
      ),
      when(
        is("brazier", "interrupted"),
        [
          puzzle(
            {
              kind: "order",
              title: "What the Coals Kept",
              prompt:
                "Five scraps of one sheet, badly burned. Put them in order, top of the sheet to bottom. A letter's address comes first. A word torn across two scraps still has to join. Couriers number their lines in the margin — a numeral or two survived. A courier closes a letter with a small drawn circle.",
              pieces: [
                "(the top edge, scorched) …r Nilk…th, by the cour…",
                "…ier's ha… — i. BPM Z… EMAB AB…",
                "…GA WXMV. BMTT VQTS…",
                "…IVBP BPM J… IASA YC…ABQWVA — iii. OMB P…",
                "…MNWZM BPM EP…T BCZVA ○",
              ],
              hint: "The address line is the top. 'cour…' joins '…ier's'. Where a word breaks at one scrap's end, the next scrap begins with the rest of it — 'AB…' and '…GA', 'VQTS…' and '…IVBP'. The circle ends the letter.",
            },
            [
              say("It fits. A ragged sheet a hand wide, most of it holes, but the lines run true: an address in a clear courier's hand, and under it three lines of letters that make no words at all."),
              say("'…for Nilkanth, by the courier's hand.' And then the gibberish. Not gibberish — too regular for that. The same short groups recur. BPM, three times. A cipher, turned on a wheel."),
              fx(gain("ash-fragment", "cipher-lines", "nilkanth")),
            ],
            [
              say("The pieces won't sit together; they crumble at my fingers when I force them. I get only what can be read without fitting: a name, and lines of letters that make no words."),
              say("Nilkanth. And letters in groups — BPM, BPM, BPM — too regular to be nonsense. A cipher, turned on a wheel."),
              fx(gain("cipher-lines", "nilkanth")),
            ],
          ),
        ],
        [
          puzzle(
            {
              kind: "order",
              title: "What the Coals Kept",
              prompt:
                "Five half-burned scraps of one sheet. Put them in order, top of the sheet to bottom. A letter's address comes first. A word torn across two scraps still has to join. The courier numbered the lines in the margin. A courier closes a letter with a small drawn circle.",
              pieces: [
                "(the top edge) For Nilkanth, by the cour…",
                "…ier's hand. — i. BPM ZWIL EMAB ABIGA WXMV.",
                "ii. BMTT VQTSIVBP BPM JWG…",
                "…IASA YCMABQWVA. — iii. OMB PQU WCB",
                "JMNWZM BPM EPMMT BCZVA. ○",
              ],
              hint: "The address goes at the top. 'cour…' joins '…ier's hand'. Then the margin numerals, i, ii, iii. The circle closes the letter.",
            },
            [
              say("It fits. A ragged sheet a hand wide, the lines running true: an address in a clear courier's hand, and under it three lines of letters that make no words at all."),
              say("'For Nilkanth, by the courier's hand.' And then the gibberish. Not gibberish — too regular. The same short groups recur. BPM, three times. A cipher, turned on a wheel."),
              fx(gain("ash-fragment", "cipher-lines", "nilkanth")),
            ],
            [
              say("The pieces won't sit together; they crumble when I force them. I get only what can be read without fitting: a name, and lines of letters that make no words."),
              say("Nilkanth. And letters in groups — BPM, BPM, BPM — too regular to be nonsense. A cipher, turned on a wheel."),
              fx(gain("cipher-lines", "nilkanth")),
            ],
          ),
        ],
      ),
      say(
        "Nilkanth. I turn it over in my mouth without saying it. It is not a name at court. I know every name at court — I was made to learn them, with their fathers, at six. Nobody here is called that.",
      ),
      say("I fold what I have into my kerchief and put it inside my coat against my chest, where it feels warmer than it can possibly be."),
    ],
  },

  // ── 9 ──────────────────────────────────────────────────────────────────────
  {
    n: 9,
    id: "e009-sumitra-in-the-kitchens",
    chapter: 1,
    title: "रसोई में सुमित्रा · Sumitra in the Kitchens",
    location: "kitchens",
    objective: "Go to the kitchens. Sumitra will be at the dough",
    cast: ["sumitra"],
    beats: [
      say(
        "The kitchens, before dawn: the ovens just lit, the long table white with flour, and Sumitra at the end of it with her sleeves pinned back, kneading as if the dough had said something about her mother.",
      ),
      say(
        "She was my mother's nurse before she was mine, and my mother's before that. When the queen died they sent her down here. She says she prefers bread. Bread, she says, does what it's told.",
      ),
      talk(
        "sumitra",
        (s) =>
          s.flags.brazier === "nandini"
            ? "Arun. Sit. You look like a ghost's apprentice. And tell that girl of yours that if she sends the Minister running about in his shawl again, she'll do it without my blessing. She told me. Of course she told me."
            : "Arun. Sit. You look like a ghost's apprentice. Nobody sleeps in this house tonight, and the ones who pretend to are the worst of all.",
        [
          {
            id: "courier",
            label: "The courier they brought in. Do you know her?",
            required: true,
            reply: [
              line("sumitra", "Chaya. Of course I know her. She carried your mother's private letters for years — the ones that didn't go through the Chancery. In and out of this kitchen door, with mud to her knees."),
              line("sumitra", "They sent her off four years ago. Two years after. For a letter she wouldn't burn, is what the gate said. I never asked whose letter. You learn not to."),
              fx(gain("chaya-queens-courier")),
            ],
          },
          {
            id: "mother",
            label: "Tell me about my mother.",
            reply: [
              line("sumitra", "What's to tell that you don't know. She was stubborn, and she was clever, and she couldn't make bread to save her life. Burnt every loaf she touched. She said it was the oven's politics."),
              say("She laughs, and the laugh goes wrong in the middle, and she hits the dough very hard."),
              line("sumitra", "Six years. It's a long time to still be angry at a road."),
            ],
          },
          {
            id: "name",
            label: "Have you ever heard the name Nilkanth?",
            requires: has("nilkanth"),
            reply: [
              say("The dough slips out of her hands and goes down on the floor with a soft sound. She doesn't pick it up. She looks at me as though I have said something from the other side of a wall."),
              line("sumitra", "Where did you hear that."),
              line("sumitra", "It's the lullaby. Nilkanth, the blue-throated one — the god who drank the poison so the world could live, and held it in his throat. She sang it to you. To both of you, one on each knee. Nobody else in this house would know it for a name."),
              fx(gain("nilkanth-lullaby")),
              choice("She is still staring at the dough on the floor.", [
                {
                  label: "Pick it up for her, and say nothing",
                  detail: "She has said more than she meant to.",
                  fx: trust("sumitra", 1),
                  then: [
                    say("I pick up the dough and brush the floor off it and put it back in her hands. She holds it a while. Then she folds it once, and again, and begins to knead."),
                    line("sumitra", "Don't say that name where the walls are thin, Arun. It's a bedtime word. It isn't for daylight."),
                  ],
                },
                {
                  label: "Press her: who else knew the song?",
                  detail: "Someone at court wrote it on a letter.",
                  then: [
                    line("sumitra", "You. Your brother. Her. Me. The rest are dead or never were. Now let me get on, the bread won't wait for princes."),
                    say("She picks the dough up herself and slaps it back on the board. She does not look at me again until I've gone."),
                  ],
                },
              ]),
            ],
          },
          {
            id: "hungry",
            label: "Is there anything to eat?",
            reply: [
              say("She breaks the end off yesterday's loaf, spreads it with ghee from the pot with her thumb, and puts it in my hand without a word, exactly as she did when I was five."),
              say("It is the best thing I have eaten in a year. It usually is."),
            ],
          },
        ],
        "The first light is grey in the high windows. Somewhere above us, the court is being woken for the bell.",
      ),
    ],
  },

  // ── 10 ─────────────────────────────────────────────────────────────────────
  {
    n: 10,
    id: "e010-the-first-bell",
    chapter: 1,
    title: "पहला घंटा · The First Bell",
    location: "hall",
    objective: "The first bell. Go to the throne hall",
    cast: ["bhanusen", "kaushal", "ranadhir", "jaswant", "padmavati", "bhairav", "ugrasen", "devashrava", "vikram"],
    beats: [
      say(
        "The bronze bell this time. Dawn comes in through the high east windows of the hall in long bars and lies across the floor like planks. The lords arrive in ones and twos and stand along the walls where their fathers stood.",
      ),
      say(
        (s) =>
          s.flags.dress === "silk"
            ? "I take my place at the foot of the steps. In the saffron silk I look as if I dressed for this, and I think some of them believe I did."
            : "I take my place at the foot of the steps in the stable cloak. There is no time to change. Rao Jaswant looks at the wool and then at my face, and says something behind his hand that makes the man beside him smile.",
      ),
      say(
        "Ranadhir is already on the steps, one below the throne, in white. He does not look at me. Mantri Kaushal stands at the king's left with a scroll, freshly shaved, as if he had slept the whole night through.",
      ),
      say(
        "My father comes in last, by the small door behind the throne, and sits, and the whole hall is quiet before he has finished sitting. He never needs to ask for it.",
      ),
      line("bhanusen", "A courier of this house was taken on the western road carrying what was not hers to carry. She will be tried today, in this hall, before all of you."),
      line("bhanusen", "At sunset my son Arunveer will carry out the sentence. With my own sword."),
      say(
        "He does not raise his voice. He does not look at me. He doesn't need to: every other face in the hall turns, like wheat in a wind, and finds me at the foot of the steps.",
      ),
      say("The sentence. Not the verdict. He said the sentence, and no one in the hall so much as blinks at the difference."),
      choice("The silence is waiting for something from you.", [
        {
          label: "Bow",
          detail: "Low, and slowly. Give them the obedient son.",
          fx: (s) => set("firstBell", "bowed")(sus(-1)(s)),
          then: [
            say("I bow. Low, and slow, the way I was taught at seven with a rod behind my knees. When I straighten, the faces have turned back to the throne. A good son is not interesting to look at."),
            line("bhanusen", "Good."),
            say("One word. It lands on me like a hand on the shoulder, and I cannot tell whether it is praise or a door closing."),
          ],
        },
        {
          label: "\"And if the court finds her innocent?\"",
          detail: "Say it aloud. In front of all of them.",
          fx: (s) => set("firstBell", "asked")(sus(2)(stat({ renown: 1 })(s))),
          then: [
            say("My voice is louder in the hall than I expected. It goes up into the roof beams and stays there."),
            line("bhanusen", "Then you will have nothing to do."),
            say("He says it pleasantly. A few of the lords laugh, a moment too late, the way you laugh when you are not sure you were meant to. Kaushal writes something down."),
            say("Ranadhir, on the steps, closes his eyes for exactly as long as it takes to breathe out."),
          ],
        },
        {
          label: "Look at Ranadhir",
          detail: "He is the heir. He should be the one they're looking at.",
          fx: set("firstBell", "looked"),
          then: [
            say("I look up at my brother. He is not looking at me, or at our father, or at the court. He is watching the great doors at the end of the hall, as if he were expecting someone to come through them."),
            say("Nobody comes through them. After a while he notices me noticing, and his face closes like a book."),
          ],
        },
      ]),
      line("bhanusen", "The court will sit within the hour. Bring the prisoner."),
    ],
  },
];
