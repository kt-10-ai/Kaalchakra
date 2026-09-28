import type { Episode } from "../types";
import { choice, fx, gain, has, is, line, puzzle, say, search, set, stat, sus, talk, trust, when } from "../dsl";

// ─────────────────────────────────────────────────────────────────────────────
// Chapter 2 — प्रातः सभा · The Morning Court
// ─────────────────────────────────────────────────────────────────────────────


export const CHAPTER_2: Episode[] = [
  // ── 11 ─────────────────────────────────────────────────────────────────────
  {
    n: 11,
    id: "e011-three-lords",
    chapter: 2,
    title: "तीन सामंत · Three Lords",
    location: "hall",
    objective: "Speak with the lords before the court sits",
    cast: ["jaswant", "padmavati", "bhairav", "kaushal", "ranadhir"],
    beats: [
      say(
        "An hour before the court sits, the hall belongs to the lords. They stand in knots along the pillars and drink hot milk from brass cups the pages carry round, and each of them is deciding, in public, what to think.",
      ),
      say("Three of them matter this morning. I was taught which three before I could ride."),
      search(
        "Along the pillars:",
        [
          {
            id: "jaswant",
            label: "Rao Jaswant, loud by the east pillar",
            required: true,
            reply: [
              say("A big man in rust-red, with a hill lord's moustache and a voice built for shouting across valleys. He is telling the pages how many riders he killed the year the queen died. The number is larger than last year."),
              line("jaswant", "Highness! Your mother's avenger salutes you. Today we hang a Meghadurg spy — well, you'll do better than hang her. With the king's own sword. I envy you."),
              line("jaswant", "I'd have done it for nothing, you know. I'd have done it on the ford."),
            ],
          },
          {
            id: "padmavati",
            label: "Rani Padmavati, alone in the window",
            required: true,
            reply: [
              say("The widow of Sonkot, in plum and old gold. Her house moves salt; her husband is ten years dead and she has been more dangerous every year since. She looks at me as if pricing a caravan."),
              line("padmavati", "The younger prince, awake before the birds. The whole palace says so. How very unlike you."),
              line("padmavati", "A courier is a thing that goes back and forth, Highness. It is always worth asking which way she was going, and for whom. My drivers ask it of each other every day."),
            ],
          },
          {
            id: "bhairav",
            label: "Thakur Bhairav, counting on his fingers",
            required: true,
            reply: [
              say("The treasurer, green turban, wet at the temples in a cold hall. His lips move while he waits. He is counting something, and he does not stop when I reach him."),
              line("bhairav", "Highness. A trial costs, you know. Guards, lamps, the priests' fee for the blessing. Nobody thinks of it. Eighty-four silver for the day, I make it. And what does it buy? One woman fewer."),
              line("bhairav", "Forgive me. I talk figures when I'm frightened. Not frightened. Tired. I talk figures when I'm tired."),
            ],
          },
        ],
        "Kaushal is watching me move from pillar to pillar. Ranadhir is watching Kaushal. The page with the milk tray is watching all three of us, and pretending to watch the milk.",
      ),
      choice("The heralds are lining up. When the court sits, you will stand somewhere, and everyone will see where.", [
        {
          label: "Beside Rao Jaswant",
          detail: "The hawk. The loudest grief in the hall.",
          fx: (s) => set("stoodWith", "jaswant")(trust("jaswant", 1)(s)),
          then: [
            say("I take the place at Jaswant's shoulder. He claps my back hard enough to rattle my teeth, and his men shuffle to make room, pleased. To the hall I am now the son who wants vengeance."),
          ],
        },
        {
          label: "Beside Rani Padmavati",
          detail: "Cool, commercial, curious about you.",
          fx: (s) => set("stoodWith", "padmavati")(trust("padmavati", 1)(s)),
          then: [
            say("I cross to her window. She moves her skirts an inch to give me room and does not look round. Several of the lords notice. They will be wondering all morning what I bought."),
            line("padmavati", "Brave. Or careless. I'll decide by noon."),
          ],
        },
        {
          label: "Beside Thakur Bhairav",
          detail: "Anxious, and not the kind of man anyone watches.",
          fx: (s) => set("stoodWith", "bhairav")(trust("bhairav", 1)(s)),
          then: [
            say("I stand at Bhairav's elbow. He looks at me with the naked alarm of a man who has found a tiger in his counting house, and then — slowly — something like gratitude. Nobody stands with the treasurer."),
          ],
        },
      ]),
    ],
  },

  // ── 12 ─────────────────────────────────────────────────────────────────────
  {
    n: 12,
    id: "e012-the-charge",
    chapter: 2,
    title: "अभियोग · The Charge",
    location: "hall",
    objective: "Take your place in the hall",
    cast: ["bhanusen", "kaushal", "chaya", "ranadhir", "jaswant", "padmavati", "bhairav", "vikram"],
    beats: [
      say(
        "They bring her in through the great doors in chains, and make her kneel on the bare stone between the throne and the court. There is a circle cut into the floor there. I never knew what it was for.",
      ),
      say(
        (s) =>
          has("chaya-said-east")(s)
            ? "She kneels as if kneeling were her idea. Her eyes go once along the lords, and once to me — and stay there for the length of a breath. I told her about her horse. She has not forgotten."
            : "She kneels as if kneeling were her idea. Her eyes go once along the lords, pass over me without stopping, and settle on the throne.",
      ),
      line("kaushal", "The charge. That Chaya, once courier of this house, dismissed from its service, did carry the secrets of the realm out of Vajragarh to the court of Shailendra of Meghadurg, our enemy."),
      line("kaushal", "She was taken on the western road with a courier's satchel. The satchel was received at the Chancery sealed — and found empty. Proof, my lords, that she had already delivered what she carried."),
      fx(gain("satchel-empty")),
      say("A murmur along the walls, satisfied. An empty bag, and everyone in the hall agrees it is full of guilt. I think of the satchel Vikram carried unopened to the Minister's own hand."),
      choice("Kaushal lets the murmur run, then rolls the scroll shut.", [
        {
          label: "\"An empty satchel proves nothing.\"",
          detail: "Say it clearly enough to be written down.",
          fx: (s) => sus(1)(stat({ renown: 1 })(s)),
          then: [
            say("It comes out steadier than I feel. Heads turn along the wall."),
            line("kaushal", "It proves, Highness, that it is empty. The court may draw its own conclusions. That is what courts are for."),
            line("bhanusen", "Let the boy speak when he has something to hold in his hand. Go on, Mantri."),
            say("Chaya does not look round. But her shoulders, I think, come down a finger's width."),
          ],
        },
        {
          label: "Hold your tongue",
          detail: "Watch. Listen. It is too early to show your hand.",
          fx: stat({ cunning: 1 }),
          then: [
            say("I say nothing. I watch who is pleased. Jaswant, loudly. Bhairav, not at all. Ranadhir, on the steps, not moving. Kaushal, who is not pleased either — he is only finished, the way a man is finished with a letter."),
          ],
        },
        {
          label: "Whisper to the lord beside you",
          detail: "Share the doubt with one person. Quietly.",
          fx: (s) => {
            const w = s.flags.stoodWith;
            return w === "jaswant" || w === "padmavati" || w === "bhairav" ? trust(w, 1)(s) : s;
          },
          then: [
            when(
              is("stoodWith", "jaswant"),
              [
                say("I murmur to Jaswant that an empty bag is a strange kind of proof. He frowns at me, then at the bag, as if it had been rude to him."),
                line("jaswant", "Empty or full, she's from over the river. But — ha. You think like a lawyer, Highness. I'll keep an eye on the Mantri for you."),
              ],
            ),
            when(
              is("stoodWith", "padmavati"),
              [
                say("I say it under my breath, without turning my head. She does not turn hers either."),
                line("padmavati", "In my trade, when a sealed crate arrives empty, we do not hang the driver. We ask who held the key. Well said, Highness. Quietly said. Better."),
              ],
            ),
            when(
              is("stoodWith", "bhairav"),
              [
                say("I whisper it. Bhairav starts as if I had pinched him, then nods very fast."),
                line("bhairav", "An empty chest is recorded as empty. It is not recorded as robbed until someone counts. Nobody counted. I'd have counted."),
              ],
            ),
          ],
        },
      ]),
    ],
  },

  // ── 13 ─────────────────────────────────────────────────────────────────────
  {
    n: 13,
    id: "e013-vikrams-testimony",
    chapter: 2,
    title: "विक्रम की गवाही · Captain Vikram's Testimony",
    location: "hall",
    objective: "Hear Captain Vikram's testimony",
    cast: ["bhanusen", "kaushal", "chaya", "vikram", "ranadhir", "jaswant", "padmavati", "bhairav"],
    beats: [
      say(
        "Vikram comes forward to the circle with his helmet under his arm, scrubbed and shaved and still grey under the eyes. He does not look at the prisoner. He looks at a point on the wall above the throne, the way soldiers do.",
      ),
      line("bhanusen", "The prince may question the witness. He will have to learn how, sooner or later."),
      say("It is meant as a small humiliation. It is also, I realise, a door left open."),
      puzzle(
        {
          kind: "testimony",
          title: "The Captain's Account",
          witness: "vikram",
          prompt:
            "Vikram gives the account of the arrest. Press him on anything that sounds thin. If one of his statements is contradicted by something in your Case Book, present it.",
          statements: [
            {
              text: "We took her at the western ford at dusk, three days ago, on the warrant I carried.",
              press: "The warrant was given me some days before. I was told to wait at the ford. I waited. That is a soldier's work, Highness — waiting where you're told.",
            },
            {
              text: "She was riding west, toward Meghadurg, when we took her.",
              breaks: "new-horseshoes",
              press: "West. It was dusk. She was at the ford. Where else would a spy be going, Highness, but home to her masters?",
            },
            {
              text: "Her satchel was sealed with the courier's knot. I delivered it unopened into the Minister's own hand.",
              press: "Unopened. I'll swear it on the wheel. What happened to it after it left my hand is not a soldier's business.",
            },
            {
              text: "She did not resist. She gave up her knife and came quietly.",
              press: "Hilt first. Like a gift. I've taken thieves who fought harder over a chicken.",
            },
          ],
          hint: "Her horse was shod in Meghadurg a week ago at most. A horse is shod where it has been, not where it is going.",
        },
        [
          say("I tell the court about the mare: river shoes, bright nails, a week old. A horse is shod where it has been. The hall is very quiet."),
          say("Vikram's eyes come down off the wall. He looks at me, and then — for the first time — at Chaya."),
          line("vikram", "She was on our bank. The Vajragarh bank. Her mare was blown, coming off the river road, and she was riding… east. Into the country. I wrote west because the warrant said west. I wrote what I was told she'd be doing."),
          say("A sound along the walls like wind in a pine wood. Padmavati turns her head a quarter of an inch, toward me."),
          line("kaushal", "Direction is immaterial. A spy returning for more is a spy nonetheless. The captain may stand down."),
          fx(set("vikramBroken"), stat({ renown: 1 }), sus(1), trust("padmavati", 1)),
          say("Vikram steps back to his place. His face is the colour of a man who has just found out what he was used for."),
        ],
        [
          say("I have nothing to put against him that the court would hear. Vikram finishes his account in a flat, practised voice, bows, and steps back to his place."),
          line("kaushal", "The court has heard the captain. We move on."),
          say("Chaya does not look at me. That is somehow worse than if she had."),
        ],
      ),
    ],
  },

  // ── 14 ─────────────────────────────────────────────────────────────────────
  {
    n: 14,
    id: "e014-the-minister-answers",
    chapter: 2,
    title: "मंत्री का उत्तर · The Minister Answers",
    location: "hall",
    objective: "Stand before the Minister",
    cast: ["bhanusen", "kaushal", "chaya", "ranadhir", "jaswant", "padmavati", "bhairav"],
    beats: [
      say(
        (s) =>
          s.flags.vikramBroken
            ? "Kaushal lets the captain's words settle, and then turns them over as gently as a cook turns a flatbread. He does not look at me while he does it."
            : "Kaushal waits until the captain is back at the wall, and then walks a slow half-circle around the kneeling woman, as if showing her to the court from every side.",
      ),
      line("kaushal", "My lords. Whether she was going or coming is a question for geographers. A spy returning for more is still a spy. Vajragarh does not open its gate wider because a thief is walking in rather than out."),
      say("It is a good line. I can see it go into the lords like a nail into soft wood."),
      choice("He has finished. There is a space before the next witness, and the king is watching you use it.", [
        {
          label: "Press him: the early warrant",
          detail: "\"How did you know she was coming?\"",
          requires: has("early-warrant"),
          lockedReason: "You have nothing to press him with.",
          fx: (s) => sus(2)(stat({ renown: 1 })(s)),
          then: [
            say("I say it to him directly, across the circle. The warrant in the captain's belt six days. Three days before anyone had seen her. How did the Minister know she was coming, and on what road, and on what horse?"),
            say("Kaushal turns and considers me with real interest, like a man who has found a coin in the street and is deciding whether it is his."),
            line("kaushal", "Vajragarh has friends, Highness. Some of them are even on the other side of the river. It is my duty to keep them. It is not my duty to name them in open court."),
            say("On the steps, Ranadhir looks down at his own hands."),
          ],
        },
        {
          label: "Ask to see the satchel",
          detail: "An empty bag can still be looked at.",
          fx: (s) => gain("cut-lining")(sus(1)(s)),
          then: [
            say("I ask the king — not the Minister — if the court may see the satchel it has heard so much about. Kaushal opens his mouth."),
            line("bhanusen", "Let him look. Let him learn what an empty bag feels like."),
            say("A clerk brings it. Good dark leather, a courier's bag, the old knot cut clean. Empty, as promised. I put my hand inside it as though I expected nothing."),
            say("The lining under my fingers has a ridge in it. I turn the bag to the light. The inner seam has been slit a hand's length and stitched back up — roughly, with thread two shades too pale. Something was sewn in there. It isn't now."),
            say("I hand the satchel back to the clerk without a word. Kaushal watches me do it. I do not look at him, which he will also notice."),
          ],
        },
        {
          label: "Let it lie",
          detail: "Not yet. Not in front of everyone.",
          fx: sus(-1),
          then: [
            say("I let it lie. Kaushal inclines his head to me, very slightly, as if I had returned something he'd dropped. The court moves on to the reading of her dismissal, which takes a long time and says nothing."),
          ],
        },
      ]),
      line("bhanusen", "Enough for the morning. The court will sit again in the afternoon. Take her down."),
    ],
  },

  // ── 15 ─────────────────────────────────────────────────────────────────────
  {
    n: 15,
    id: "e015-recess",
    chapter: 2,
    title: "विराम · Recess",
    location: "courtyard",
    objective: "The court has recessed. Go out into the courtyard",
    cast: ["ranadhir"],
    beats: [
      say(
        "Full morning in the courtyard, and the frost gone to wet. The lords stream out talking. I am halfway to the well when a hand closes on my elbow and steers me, without apparent effort, into the shade of the colonnade.",
      ),
      say("Ranadhir. He smells, as he always has, of sandalwood, and he is smiling for anyone who might be looking, and his eyes are not smiling at all."),
      line("ranadhir", "Do what Father asks. For once."),
      talk(
        "ranadhir",
        (s) =>
          s.flags.firstBell === "asked"
            ? "You asked him a question in front of the whole court this morning. He will remember that longer than anything else you do today. So will they."
            : s.flags.firstBell === "looked"
              ? "And don't look at me in the hall. Whatever you think you're looking for, you won't find it on my face."
              : "You bowed well this morning. Keep bowing. It's the only thing in this house anyone ever forgave you for.",
        [
          {
            id: "balcony",
            label: "Where were you at the last watch?",
            requires: has("balcony-watcher"),
            reply: [
              line("ranadhir", "Asleep."),
              say("He says it at once, without blinking, the way you say something you have said to yourself several times already. I saw him on the balcony. He knows I saw him. He says it anyway."),
              line("ranadhir", "You should try it. Sleep. It makes men less stupid."),
              fx(trust("ranadhir", -1)),
            ],
          },
          {
            id: "know-her",
            label: "Do you know her?",
            reply: [
              line("ranadhir", "I know what she is."),
              say("He does not say what that is. He looks across the courtyard at the dungeon stair, and then very deliberately away."),
            ],
          },
          {
            id: "refuse",
            label: "What happens if I refuse?",
            required: true,
            reply: [
              line("ranadhir", "Then I'll be the only son he has."),
              say("There is nothing in his voice at all. Not a threat. Not a warning. Just arithmetic, spoken aloud by a man who has already done the sum."),
            ],
          },
          {
            id: "vikram",
            label: "You heard Vikram. She was riding east.",
            requires: is("vikramBroken"),
            reply: [
              line("ranadhir", "I heard a tired captain change his story because a prince embarrassed him in front of the lords. So did Father. So did Kaushal. Congratulations."),
              line("ranadhir", "Every clever thing you say in that hall today, somebody writes down. Remember that."),
            ],
          },
          {
            id: "brother",
            label: "\"Ranadhir. It's me.\"",
            reply: [
              say("For a moment — less than a moment — the hand on my elbow tightens, not to hurt. Then it lets go."),
              line("ranadhir", "I know who you are. That's the trouble."),
              fx(trust("ranadhir", 1)),
            ],
          },
        ],
        "He straightens my collar, which does not need straightening, and walks back out into the sun, and is at once laughing at something Jaswant has said.",
      ),
    ],
  },

  // ── 16 ─────────────────────────────────────────────────────────────────────
  {
    n: 16,
    id: "e016-nandinis-network",
    chapter: 2,
    title: "नंदिनी का जाल · Nandini's Network",
    location: "chambers",
    objective: "Go back to your rooms. Nandini is waiting",
    cast: ["nandini"],
    beats: [
      say("My rooms. The bed made, the shutters open, a cup of water on the sill with a cloth over it against the dust. Nandini is sitting on the floor by the door, mending a sandal strap, and gets up the moment I come in."),
      line("nandini", "The whole palace is talking about the horseshoes. Or the satchel. Or you. Mostly you."),
      when(
        (s) => s.flags.brazier !== "interrupted",
        [
          line("nandini", "The Minister's clerk came asking what time you woke. I told him you slept like a stone till the bell and I had to throw water on you. He wrote it down. He writes everything down."),
          fx(sus(-1)),
        ],
        [
          line("nandini", "The Minister's clerk came asking what time you woke. I said I didn't know. He said the Mantri already did. He was polite about it, which was worse."),
        ],
      ),
      line(
        "nandini",
        "Highness — the servants see everything and nobody sees them. The water-carriers, the lamp boys, the girls who do the floors. If you want eyes somewhere today, I can put them there. One place. More than one and someone notices.",
      ),
      choice("Where should the servants watch?", [
        {
          label: "The Minister's door",
          detail: "Who goes in to Kaushal, and who comes out.",
          fx: set("watch", "kaushal"),
          then: [line("nandini", "The Chancery. Good. The lamp boy there owes me for a thing I didn't tell his mother.")],
        },
        {
          label: "Ranadhir's door",
          detail: "Where your brother goes, and when.",
          fx: set("watch", "ranadhir"),
          then: [
            say("She hesitates. Only a moment."),
            line("nandini", "The heir's wing. I'll ask Gauri, she does his floors. She won't like it. Nobody likes watching the heir."),
          ],
        },
        {
          label: "The dungeon stair",
          detail: "Who goes down to cell three, and who comes up.",
          fx: set("watch", "stair"),
          then: [line("nandini", "The stair. The water boy goes down four times a day anyway. I'll have him ask Karan's guards what they saw last night, too. Guards love to complain.")],
        },
      ]),
      line("nandini", "I'll tell you what they've seen when there's something to tell. Eat something, Highness. You haven't. I can see you haven't."),
    ],
  },

  // ── 17 ─────────────────────────────────────────────────────────────────────
  {
    n: 17,
    id: "e017-sandalwood-smoke",
    chapter: 2,
    title: "चंदन का धुआँ · Sandalwood Smoke",
    location: "temple",
    objective: "Go to the temple. The Rajpurohit is preparing the rite",
    cast: ["devashrava"],
    beats: [
      say(
        "The temple is thick with smoke — sandalwood and agar resin, heaped on the coals in the brass bowls until the lamps are only smudges of gold in a brown haze. It gets into the throat and stays.",
      ),
      say(
        "Rajpurohit Devashrava is at the altar laying out the things for the sunset rite: the ghee, the red thread, the silver dish on which the king's sword will lie to be blessed. His hands are old and very steady. His face is not.",
      ),
      talk(
        "devashrava",
        "Highness. You come to pray for a steady arm, I suppose. They all will, tonight. The lords pray for your steadiness as if it were theirs.",
        [
          {
            id: "bless",
            label: "Will you bless an execution?",
            required: true,
            reply: [
              line("devashrava", "I will bless a sword. What it is used for is between the hand and the gods. That is the rule, and it is a comfortable rule, and I have been sheltering under it for thirty years."),
              line("devashrava", "Don't look at me like that. You have your mother's way of looking."),
            ],
          },
          {
            id: "seal",
            label: "Our seal. Why does the wheel have seven spokes?",
            reply: [
              say("His hands stop over the silver dish. He doesn't look up. The smoke drifts between us, and for a long moment he says nothing at all."),
              line("devashrava", "That is a question for the Chancery, Highness. The temple only keeps the rites. The rites are… written down."),
              say("He goes back to the red thread. His fingers tie a knot, and pick it out, and tie it again."),
              fx(trust("devashrava", -1)),
            ],
          },
          {
            id: "nilkanth",
            label: "Nilkanth — a god's name. Found in a Minister's brazier.",
            requires: has("nilkanth"),
            reply: [
              line("devashrava", "Nilkanth. The blue-throated. He who drank the poison churned up from the ocean and held it in his throat, so the world should not die of it."),
              line("devashrava", "A strange name to find in a brazier. A god's name is not a secret. But a man who writes it on a letter is not writing to a god."),
              say("He looks at me through the smoke, and for a moment the priest goes out of his face and an old frightened man looks out of it instead."),
              line("devashrava", "Be careful whose throat you are pointing at, Highness. Holding poison is the whole of that god's story."),
              fx(trust("devashrava", 1)),
            ],
          },
          {
            id: "smoke",
            label: "The smoke is heavy today.",
            reply: [
              line("devashrava", "Sandalwood and agar. For a day of blood, the resin — it covers much. We burn more of it on hard days. The king's treasurer complains of the cost."),
              say("Sandalwood smoke, burnt, is a heavy, sweet, dirty thing. It is nothing like the clean sandalwood oil my brother has worn since he was fifteen. I don't know why I think of that. I think of it."),
            ],
          },
        ],
      ),
      choice("The bell-boy is lighting the noon lamps. Pilgrims are coming in from the lower town.", [
        {
          label: "Kneel and pray where you can be seen",
          detail: "A dutiful son, preparing for a hard evening. Let the lower town see it.",
          fx: sus(-1),
          then: [
            say("I kneel on the cold stone in front of the altar and close my eyes. I don't pray. I count the pilgrims' footsteps behind me, and I let them see the king's son on his knees before his duty."),
            line("devashrava", "If anyone asks, Highness, you were here all morning. I'll swear it. It would not be the worst thing I have sworn to."),
          ],
        },
        {
          label: "Leave before the crowd",
          detail: "Out the side door, into clean air.",
          then: [say("I go out by the side door, coughing. The smoke comes with me in my clothes and my hair, and for the rest of the day I smell like a funeral.")],
        },
      ]),
    ],
  },

  // ── 18 ─────────────────────────────────────────────────────────────────────
  {
    n: 18,
    id: "e018-the-kings-sword",
    chapter: 2,
    title: "राजा की तलवार · The King's Sword",
    location: "barracks",
    objective: "Find the Senapati in the barracks",
    cast: ["ugrasen"],
    beats: [
      say(
        "The barracks yard, noon heat off the stones, and the rasp of steel on a whetstone that you can hear from the gate. Senapati Ugrasen sits on an upturned drum in the shade of the armoury wall with my father's sword across his knees.",
      ),
      say(
        "He does it himself. He has men for this — a dozen who would kill to be trusted with that blade — and he does it himself, long slow strokes, testing the edge on his thumbnail, spitting on the stone.",
      ),
      line("ugrasen", "Highness. Come to see what you'll be carrying? It's a good sword. Your grandfather's smith. It doesn't need an edge. I'm giving it one anyway."),
      talk(
        "ugrasen",
        "He does not stop sharpening while he talks. He doesn't look up, either.",
        [
          {
            id: "why-me",
            label: "Why must it be me?",
            required: true,
            reply: [
              line("ugrasen", "Because he said so. Because Ranadhir's already been blooded — on the border, at sixteen — and you haven't. Because your father thinks you are your mother's son."),
              line("ugrasen", "I'll tell you what he said to me, since nobody else will. 'If the boy cannot end one life, he has no business with a crown.' His words, Highness. Not mine."),
              say("So it is not about her. It was never about her. She is a whetstone. I am the blade he is testing."),
              fx(gain("king-test")),
            ],
          },
          {
            id: "villages",
            label: "You fought the riders the year my mother died. The burned villages.",
            reply: [
              say("The whetstone stops. For the first time he looks up at me, and his eyes are flat and grey as the stone."),
              line("ugrasen", "Don't."),
              say("Just that. Then the stone again, a little harder than before."),
            ],
          },
          {
            id: "first",
            label: "Do you remember your first?",
            reply: [
              line("ugrasen", "I remember all of them. That is the part they don't tell you. You think you'll forget the first and you forget the fortieth. The first stays."),
            ],
          },
        ],
      ),
      choice("He holds the sword up to the light and turns it. The edge is a single silver hair.", [
        {
          label: "\"Show me a clean stroke.\"",
          detail: "If it has to be done, it will not be done badly.",
          fx: (s) => set("swordLesson", "learned")(trust("ugrasen", 1)(stat({ ruthlessness: 1 })(s))),
          then: [
            say("He looks at me a long moment. Then he stands, and puts the hilt in my hands, and comes behind me and moves my feet with his boot, like a dance master."),
            line("ugrasen", "Not the arms. The hips. You don't lift it — you let it fall, and you go with it. The neck is softer than you think. The fear is harder. Again."),
            say("I cut the air twice. The sword is heavier than it looks and lighter than I feared. My arms know what to do with it before I have decided to let them, and that is the worst thing I learn all day."),
            line("ugrasen", "Good. You'll not make a mess of her. That's a mercy, whatever else it is."),
          ],
        },
        {
          label: "Refuse to touch it",
          detail: "Keep your hands off his sword until you have no choice.",
          fx: (s) => set("swordLesson", "refused")(trust("ugrasen", -1)(stat({ renown: 1 })(s))),
          then: [
            say("He holds the hilt out to me. I put my hands behind my back."),
            line("ugrasen", "Suit yourself. At sunset it'll be heavier. They always are, when you haven't held them."),
            say("One of his men in the yard saw. By evening the barracks will be saying the younger prince wouldn't touch the sword. Some of them will say it with contempt. Not all."),
          ],
        },
      ]),
    ],
  },

  // ── 19 ─────────────────────────────────────────────────────────────────────
  {
    n: 19,
    id: "e019-the-queens-door",
    chapter: 2,
    title: "रानी का द्वार · The Queen's Door",
    location: "garden",
    objective: "Go to your mother's sealed garden",
    cast: [],
    beats: [
      say(
        "My mother's garden has been shut for six years, and it has not waited for anyone's permission. Jasmine over the paths, the channel choked with leaves, the stone bench gone green. A peacock screams somewhere behind the wall and makes me start like a thief.",
      ),
      say(
        "Her apartments open onto the garden by four doors, and each was sealed the week she died — a cord across the latch, a disc of wax over the cord, the royal wheel pressed into it. I have walked past them a thousand times. I have never once looked closely.",
      ),
      puzzle(
        {
          kind: "seal",
          title: "Four Seals",
          prompt:
            "The chamberlain's seal-cutters set twelve dots around every rim. Six years of sun makes red wax go pale and crack; it never makes it go darker. A seal pressed in a hurry sits off-centre. Which door's seal has been broken and remade?",
          seals: [
            { label: "The terrace door", spokes: 8, cut: 2, wax: "#9c3a2c", border: 12, cracked: true },
            { label: "The bath-house door", spokes: 8, cut: 2, wax: "#a4483a", border: 12 },
            { label: "The study door", spokes: 8, cut: 2, wax: "#5e1410", border: 11, smudged: true },
            { label: "The bedchamber door", spokes: 8, cut: 2, wax: "#b0584a", border: 12, cracked: true },
          ],
          answer: 2,
          hint: "Count the dots on each rim. Only one door has the wrong number, and its wax is darker than the rest — fresh wax.",
        },
        [
          say("The study door. The wax is a shade darker than the others, still with a little shine to it, and pressed a finger's width off the latch as if by someone looking over his shoulder. Eleven dots around the rim. Every other door has twelve."),
          say("Someone has been inside my mother's rooms. Recently. And had a seal to press when they came out, though not the right seal — a copy, or a hurry."),
          fx(gain("queen-door-resealed")),
          say("I slide my knife under the wax. It comes away in one piece, soft as a fresh date. I keep it."),
        ],
        [
          say("I choose wrong. The seal I prise off the terrace door is six years old; it crumbles to red dust in my hand, and behind me, on the path, a gardener's rake stops."),
          say("I stand very still in the jasmine. After a long moment the rake starts again, going away. He will tell someone. Gardeners always tell someone."),
          fx(sus(1)),
          say("Then, standing close enough to see, I find it: the study door. Darker wax, pressed off-centre, eleven dots instead of twelve. Somebody has been in, and resealed it after."),
          fx(gain("queen-door-resealed")),
        ],
      ),
    ],
  },

  // ── 20 ─────────────────────────────────────────────────────────────────────
  {
    n: 20,
    id: "e020-what-the-room-kept",
    chapter: 2,
    title: "कमरे ने जो रखा · What the Room Kept",
    location: "garden",
    objective: "Go inside your mother's rooms",
    cast: [],
    beats: [
      say(
        "Inside, it is cool and dim and smells of dust and, under the dust, faintly, of her — vetiver, and lamp oil, and the camphor she put in the chests against moths. Six years. The smell has waited.",
      ),
      say("Light comes through the lattice in small bright diamonds. There are footprints in the dust on the floor, going to the desk and back. Not mine. Larger than mine."),
      search(
        "Her study, as she left it:",
        [
          {
            id: "desk",
            label: "Her writing desk",
            required: true,
            reply: [
              say("Her desk: an inkstand, dry; a stack of blank leaves gone yellow; a sand-shaker; her reed pens in a cup. Everything grey with six years of dust."),
              say("Except one place. At the top right corner, where her hand would fall, there is a clean ring in the dust the size of my palm. Something round lay there, for six years, until a few days ago."),
              say("I know what it was. I would know it blind. Her brass wheel — two rings of letters, one turning inside the other. She let me hold it when I was good. It is gone."),
              fx(gain("missing-wheel")),
            ],
          },
          {
            id: "chair",
            label: "The low chair beside the desk",
            required: true,
            reply: [
              say("My chair. A child's chair, carved with parrots, pushed against the wall where they left it. I sat in it at seven, with a slate on my knees, and she taught me my letters — and then, once, a game."),
              say("The wheel in her lap. My small hand on the inner ring. Her voice, amused and very patient:"),
              say("'Turn the wheel once around for every spoke, little one. Eight spokes, eight letters on. A whole wheel.'"),
              say("I did not understand what she meant by a whole wheel. I thought it was only a thing mothers said. I am not certain, now, that it was."),
              fx(gain("queen-lesson")),
            ],
          },
          {
            id: "wardrobe",
            label: "The cedar wardrobe",
            reply: [
              say("Her clothes, in rows, in muslin. The court saris. The mourning white she wore for her own father. The riding things."),
              say("Her travelling cloak is not here. The dark-green one with the silver clasp, that she wore on every road. The hook is empty."),
              say("She died on the road, of course. She would have been wearing it. There is no reason for the empty hook to feel like anything at all."),
            ],
          },
          {
            id: "window",
            label: "The west window",
            reply: [
              say("Her window looks west, over the garden wall and the lower town and the long brown fall of the passes, to where the road goes down into haze toward the river country."),
              say("She chose these rooms. Ranadhir told me once. Of all the rooms in Vajragarh she chose the ones that looked toward Meghadurg."),
            ],
          },
          {
            id: "footprints",
            label: "The footprints in the dust",
            reply: [
              say("A man's feet, soft-soled — indoor slippers, not boots. To the desk, a long stand there, and straight back to the door. Whoever it was knew exactly what he had come for, and did not look at anything else."),
              say("Nothing else in the room was touched. That is the part I cannot forgive: he did not even look at her things."),
            ],
          },
        ],
        "I sit, at last, in the parrot chair. My knees come up nearly to my chin. I stay there longer than I should, until the diamonds of light have moved a hand's width across the floor.",
      ),
      say("I don't weep. I was taught not to, in this house. I put the chair back exactly where it was, against the wall, and go out through the study door, and press the dead wax back over the cord with my thumb."),
    ],
  },
];
