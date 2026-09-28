import type { Episode } from "../types";
import { all, choice, fx, gain, has, hasAny, is, line, not, puzzle, say, set, stat, sus, talk, trust, when } from "../dsl";

/**
 * Chapter 4 — रानी का उपवन · The Queen's Garden (late morning). Episodes 31–40.
 *
 * The lullaby (e32) is sung in five verses. In order, its counts are
 * eight spokes, seven hills, one river, two sons — the iron box (e33) opens
 * to 8-7-1-2. The last verse gives the hiding place: under the blue stone,
 * where the river bends (the blue tile at the bend of the garden channel).
 */
export const CHAPTER_4: Episode[] = [
  // ── 31 ──────────────────────────────────────────────────────────────
  {
    n: 31,
    id: "e031-the-sealed-garden",
    chapter: 4,
    title: "बंद उपवन · The Sealed Garden",
    location: "garden",
    objective: "Go back to the queen's garden",
    cast: ["sumitra"],
    beats: [
      say("By daylight the garden is worse. The paths have gone under grass, the fountain is full of leaves, and the jasmine has climbed the wall and thrown itself over the other side as if it wanted to leave."),
      say("Except one bed, by the water channel. Tulsi, marigold, a row of green chillies. Weeded. Watered this morning. The earth is still dark."),
      say("Sumitra is on her knees in it with her sari tucked up, pulling at nothing, because there is nothing left to pull. She does not get up when she hears me. She has not got up for anyone in years except my mother."),
      line("sumitra", "Nobody comes in here. That is the whole of the reason I do. Sit on the wall, if you're sitting. Don't tread on the chillies. They were hers."),
      talk(
        "sumitra",
        "She goes on working while she talks, which is how she has always said the things she cannot say sitting still.",
        [
          {
            id: "bed",
            label: "You keep her bed",
            required: true,
            reply: [
              line("sumitra", "Six years. Every second morning, before the ovens. The king sealed the doors. He did not seal the dirt. Nobody thought to."),
              line("sumitra", "She grew chillies in a queen's garden and the lords' wives laughed at her behind their fans. She said a garden you can't eat is a garden that's lying to you."),
              say("I remember the smell of them drying on her windowsill. I had forgotten that I remembered it."),
            ],
          },
          {
            id: "lastday",
            label: "Her last day",
            required: true,
            reply: [
              line("sumitra", "She was up before me. That never happened. She was sitting on this wall in her travelling cloak with her hands in her lap, looking at the water, when I came out with the lamp."),
              line("sumitra", "She said, “Sumitra, if the boys ask you anything, answer them.” I said, which boys, as if there were others. She laughed. Then she went to the stables, and then she went west, and then she was brought back."),
              say("Her hands stop in the earth for a moment. Then they go on."),
              line("sumitra", "She went to both your doors first. She didn't wake you. I know because I was behind her with the lamp."),
            ],
          },
          {
            id: "left",
            label: "Did she leave anything?",
            required: true,
            reply: [
              line("sumitra", "She left something, if you ever asked the right question."),
              say("She looks at me, and waits, the way she used to wait at the kitchen door until I remembered to wash my hands."),
              when(
                not(has("nilkanth-lullaby")),
                [
                  line("sumitra", "That isn't it. That's only asking."),
                  say("I try three questions. She shakes her head at each, patiently. On the fourth I ask, without meaning anything by it, what she used to sing us to sleep with."),
                  line("sumitra", "Ah. There. Closer than you know."),
                ],
              ),
            ],
          },
          {
            id: "nilkanth",
            label: "Nilkanth",
            requires: has("nilkanth-lullaby"),
            reply: [
              say("I say it the way she said it to me before dawn, low, as the name of the one who swallowed the poison."),
              say("She sits back on her heels. Her face does something I have seen only once before, on the day they brought my mother home."),
              line("sumitra", "That's the question. She said you'd come with that word in your mouth, and I'd know. I didn't believe her. She was always right about you two, and I never once believed her."),
              fx(trust("sumitra", 1), set("askedRightQuestion")),
            ],
          },
          {
            id: "chaya",
            label: "Chaya",
            requires: has("chaya-queens-courier"),
            reply: [
              line("sumitra", "She used to come through this garden by the back gate, with her boots in her hand so the gravel wouldn't talk. My lady would meet her here, by the water. Never in the rooms."),
              line("sumitra", "The walls in there had ears. The water didn't."),
            ],
          },
        ],
        "She wipes her hands on her sari and looks at the channel, where the water runs slow and brown toward the far wall.",
      ),
    ],
  },

  // ── 32 ──────────────────────────────────────────────────────────────
  {
    n: 32,
    id: "e032-the-lullaby",
    chapter: 4,
    title: "लोरी · The Lullaby",
    location: "garden",
    objective: "Hear Sumitra sing the queen's lullaby",
    cast: ["sumitra"],
    beats: [
      line("sumitra", "She made me learn it the week you were born. Not the song — everyone knows the song. Her verses. She put them in a different order every night so neither of you would learn them properly."),
      line("sumitra", "“One day they'll need to know it the right way round,” she said. I thought she meant for their own children."),
      say("She sings. Her voice is thin now and cracks on the high notes, and she doesn't care. She sings the verses as they come to her, not as they were made."),
      say("I remember every word, and not one of them in order. My mother's trick worked. It has worked for twenty years."),
      puzzle(
        {
          kind: "order",
          title: "The Queen's Lullaby",
          prompt:
            "Five verses, sung out of order. My mother built her songs like chains: each verse begins with the word the last one ended on. The first verse is the one that begins with “Hush.” Put them the right way round.",
          pieces: [
            "Hush now, the wheel has eight spokes turning — eight roads out, and eight roads home.",
            "Home lies over the seven hills, where the blue-throated one keeps watch.",
            "He keeps watch where the one river bends, and drinks what would poison the world.",
            "What would poison the world, he swallows, so that my two sons may sleep.",
            "Sleep, my two, and if you lose me, look under the blue stone, where the river bends.",
          ],
          hint: "Follow the joins: “home” — “Home lies”; “keeps watch” — “He keeps watch”; “poison the world” — “What would poison the world”; “sleep” — “Sleep, my two.”",
        },
        [
          say("I say it back to her the right way round. Hush, home, watch, poison, sleep. The last line lands in my chest like a stone into a well."),
          say("“If you lose me, look under the blue stone, where the river bends.”"),
          line("sumitra", "Twenty years I sang that. I never once heard it."),
          say("We both look at the channel. It runs straight along the terrace, and then, by the far wall, under the old neem, it bends."),
          fx(gain("lullaby-verse"), stat({ cunning: 1 })),
        ],
        [
          say("The verses slide over each other. Hills, spokes, sons, a river. I have it three ways and none of them is right."),
          line("sumitra", "She always ended on the stone. I know that much. Whatever order she began in, she ended on the blue stone. I thought it was only a pretty word to sleep on."),
          say("A blue stone. A river. There is only one river in this garden, and it is a gutter a hand deep."),
          fx(set("lullabyMuddled")),
        ],
      ),
      when(
        has("nilkanth-lullaby"),
        [say("And in the middle of it, the blue-throated one, keeping watch. Nilkanth. The name from the Minister's brazier, sung to me before I could talk. Somebody out there is using my mother's lullaby as a name. I do not know who. I know it was not chosen by accident.")],
      ),
    ],
  },

  // ── 33 ──────────────────────────────────────────────────────────────
  {
    n: 33,
    id: "e033-beneath-the-blue-stone",
    chapter: 4,
    title: "नीले पत्थर के नीचे · Beneath the Blue Stone",
    location: "garden",
    objective: "Find the blue stone where the channel bends",
    cast: ["sumitra"],
    beats: [
      when(
        has("lullaby-verse"),
        [say("The bend is under the neem, where the channel turns toward the wall. The tiles there are the old red clay, all but one. One is blue — Meghadurg glaze, the colour of a jay's wing — and so furred with moss that I have walked past it a thousand times.")],
        [
          say("I walk the channel on my knees, turning tiles with a knife, while Sumitra watches the terrace door. It takes too long. Once a gardener's boy puts his head over the wall and goes away again, too quickly."),
          say("Under the neem, where the channel turns, one tile is blue under its moss. I would never have found it if I hadn't been looking for a colour."),
          fx(sus(1)),
        ],
      ),
      say("It lifts. Under it, packed in sand gone hard as brick, an iron box the size of a prayer book. Rust has eaten the corners. The lock has not rusted at all. Someone oiled it, once, very well."),
      say("Four brass dials on the lid, nought to nine. Scratched into the iron beside them, in a hand I know, three words: “as I sang it.”"),
      puzzle(
        {
          kind: "code",
          title: "The Iron Box",
          prompt:
            "Four dials. “As I sang it.” Her lullaby is full of numbers. Set them in the order the verses go.",
          answer: "8712",
          hint: "Count through the lullaby in its true order: the wheel's spokes, the hills, the river, the sons. Eight, seven, one, two.",
        },
        [
          say("Eight. Seven. One. Two. The dials are stiff and then, all at once, not. The lid comes up with a sound like a breath let out."),
          say("Oilcloth. Inside the oilcloth, a letter folded in three and sealed with plain wax — no wheel on it, only the print of a thumb. On the outside, one word: “Arun.”"),
          say("It is her hand. I know it before I read a single word, the way I would know her step in a corridor."),
          line("sumitra", "I'll watch the door. Read it. Don't read it aloud."),
          say("“Arun. If you are reading this, you asked the right question, and I am not there to be proud of you. Be proud on my behalf. You are allowed that. You were always too careful to allow yourself anything.”"),
          say("“If they tell you I died, do not believe the manner of it.”"),
          say("I read that line three times. It does not change. The ink is six years old and brown at the edges and it does not change."),
          say("“Believe the love. That part is true, whatever else they tell you, and they will tell you a great deal.”"),
          say("“Ask Vidyadhar about the night of the Accession. He will pretend not to hear you. Ask him twice.”"),
          say("“And look after your brother — he is braver than he lets anyone see.”"),
          say("That is the end of it. No blessing. No name at the bottom. She never signed anything she could not afford to have found."),
          say("The manner of it. Not the fact. I tell myself it means the riders — that she knew who would kill her and knew they would lie about it. That is what it means. It has to be what it means."),
          say("And my brother. Braver than he lets anyone see. Ranadhir, who has not said a kind word to me in six years, and who stepped back into the dark this morning when a prisoner looked up."),
          fx(gain("queens-box-letter")),
          choice("Sumitra is still at the door, with her back to me, so that I can have my face to myself.", [
            {
              label: "Read her the line about Ranadhir",
              then: [
                say("I read her only that. She does not turn around."),
                line("sumitra", "She said that to me too. The winter he was nine and broke his arm on the wall and didn't cry until his father had gone. Brave where nobody could see. She thought it was the most dangerous kind."),
                fx(trust("sumitra", 1)),
              ],
            },
            {
              label: "Fold it inside your shirt and say nothing",
              then: [
                say("I fold it along her folds and put it against my skin, where the knife goes on a journey. Some things are not for sharing, even with the people who deserve them."),
                fx(stat({ cunning: 1 })),
              ],
            },
          ]),
        ],
        [
          say("I turn the dials until my fingers are raw. Nothing. The lock does not so much as click. Whatever she sang, I am singing it wrong."),
          line("sumitra", "Put the stone back. Put it back, Arun. It has kept six years. It will keep one more day, if you let it."),
          say("I put the stone back and press the moss down over it with my thumb, and hate myself very precisely."),
          fx(set("boxShut")),
        ],
      ),
    ],
  },

  // ── 34 ──────────────────────────────────────────────────────────────
  {
    n: 34,
    id: "e034-her-hand-or-not",
    chapter: 4,
    title: "लिखावट · Her Hand, Or Not",
    location: "garden",
    objective: "Compare the burned letter's hand against the others",
    cast: ["sumitra"],
    beats: [
      say("Something has been sitting wrong in me since the Chancery. I spread the burned pages on the garden wall and weight them with pebbles, and I look at the hand instead of the words."),
      say("It is neat. Upright. Every letter stands by itself, like soldiers who have been told not to touch. And the N in Nilkanth has a loop at the top, a small closed loop, the way my mother made hers."),
      line("sumitra", "You're thinking it's her."),
      say("I don't answer, which is an answer."),
      say("I have what I have. A note in my mother's hand that Sumitra has kept in her blouse for six years. The copy of the charge Kaushal's clerk pressed on every lord in the hall this morning. The hunting licence my brother signed for me last winter, still in my belt-purse. And, from the bundle Sumitra carries everywhere, a letter she has never answered."),
      line("sumitra", "From the courier. The month they dismissed her. She wanted me to speak to the king for her. I didn't. I was afraid. There, now you know that about me too."),
      puzzle(
        {
          kind: "hand",
          title: "Whose Hand?",
          prompt:
            "The burned letter's hand. Don't be fooled by a loop that anyone could have been taught. Look at the habits a hand can't help: whether the letters join, how a line ends, how the writer closes a page.",
          sample: {
            text: "for Nilkanth, by the courier's hand ·/· BPM ZWIL MMAB ABIGA WXMV ·/· BMTT VQTSIVBP ·/·",
            hand: "chaya",
          },
          candidates: [
            {
              label: "My mother — a note to Sumitra",
              text: "Sumitra — the chillies want water before noon, not after, whatever the gardener says. Nothing else matters today. Nothing.",
              hand: "queen",
            },
            {
              label: "Mantri Kaushal — the charge",
              text: "CHARGE, laid before the Throne: that the courier CHAYA did carry the secrets of the Realm to the Enemy. By order — Kaushal, Mntr., Keeper of Seals.",
              hand: "kaushal",
            },
            {
              label: "Ranadhir — a hunting licence",
              text: "Let the bearer hunt the north slopes through the cold months, two birds a week and no deer. R.",
              hand: "ranadhir",
            },
            {
              label: "Chaya — her plea to Sumitra",
              text: "Mother Sumitra ·/· I ask nothing for myself ·/· only that someone tell the king I burned nothing that was not mine to burn ·/· Chaya ·/·",
              hand: "chaya",
            },
          ],
          answer: 3,
          hint: "My mother's N loops too, but her letters run together. Kaushal writes in capitals and shortens his titles. Ranadhir signs with a single letter. Only one hand stands each letter apart and closes every line with the courier's mark: ·/·",
        },
        [
          say("The little stroke at the end of every line — dot, slash, dot. The courier's mark: a line ended here, nothing was added after. Chaya's plea has it. The burned letter has it. My mother's note does not."),
          say("It is Chaya's hand. Copied. That is what couriers do with ciphered letters — they write them out again in their own hand so that no clerk can match the original to the writer. It protects the writer. It damns the courier."),
          say("So whoever wrote to Nilkanth, it wasn't her. She only carried it. And whoever wrote it first made their N the way my mother taught — and Chaya, copying faithfully, copied the loop."),
          say("My mother taught that loop at her desk. She taught it to exactly two boys."),
          fx(gain("courier-copy"), stat({ cunning: 1 })),
        ],
        [
          say("I look until the letters stop being letters. The loop pulls my eye every time, back to the same answer I do not want."),
          line("sumitra", "That's not her. Arun. That's not her hand, whatever the N does. She ran every word into the next. She couldn't help it. She wrote like she talked."),
          say("I believe her. I just don't know whose it is instead."),
        ],
      ),
      say("Sumitra folds the courier's plea and puts it back in her bundle, carefully, the way you put away something you have failed."),
    ],
  },

  // ── 35 ──────────────────────────────────────────────────────────────
  {
    n: 35,
    id: "e035-the-closed-pyre",
    chapter: 4,
    title: "बंद चिता · The Closed Pyre",
    location: "kitchens",
    objective: "Walk Sumitra back to the kitchens",
    cast: ["sumitra"],
    beats: [
      say("The kitchens at the end of the morning are loud with the noon meal: pots, cleavers, a boy crying over onions who is not crying over onions. Sumitra takes me to the flour store, where the noise comes through the wall as a kind of weather."),
      say("She sits on a sack. She has never sat in front of me in my life."),
      line("sumitra", "They told the court I washed her for the fire. The women came to me afterward and held my hands and said how brave, how brave, to wash your own lady."),
      line("sumitra", "I never washed anyone. They brought her in wrapped, on a board, in the Senapati's own cloak. I asked to see her face. I was told the king had ordered it. I was told the riders had left nothing a woman should see."),
      line("sumitra", "They lit it closed. By his order. Before I had even got my shawl off. And I stood there and let the women call me brave for a thing I never did."),
      fx(gain("closed-pyre")),
      when(
        has("queens-box-letter"),
        [say("Do not believe the manner of it. The letter is against my skin and I can feel the fold of it every time I breathe.")],
      ),
      choice("She is looking at her own hands in her lap.", [
        {
          label: "Take her hands",
          then: [
            say("I take her hands. They are floury and hard and smaller than I remember. She lets me, for a moment, and then she takes them back to wipe her eyes, briskly, as though they were a bench that needed it."),
            line("sumitra", "Enough. You're a prince. Princes don't sit in the flour store holding the cook's hands."),
            line("sumitra", "She'd have done it. She'd have done exactly that."),
            fx(trust("sumitra", 1)),
          ],
        },
        {
          label: "“What else did you see? Anything.”",
          then: [
            line("sumitra", "I've said too much for one life."),
            say("She gets up. It takes her two tries. She goes back into the noise without looking at me, and I understand that I have spent something I will not get back."),
            fx(trust("sumitra", -1), set("pressedSumitra")),
          ],
        },
      ]),
    ],
  },

  // ── 36 ──────────────────────────────────────────────────────────────
  {
    n: 36,
    id: "e036-bread-for-a-journey",
    chapter: 4,
    title: "यात्रा की रोटी · Bread for a Journey",
    location: "kitchens",
    objective: "Speak to Sumitra before you leave the kitchens",
    cast: ["sumitra"],
    beats: [
      say("When I come out of the flour store she is at the long table, kneading, as though none of it happened. There is a second lump of dough beside the first, set apart, a darker flour with fennel through it."),
      line("sumitra", "That one's not for the hall."),
      say("She doesn't say who it is for. She shapes it into flat rounds, the thick kind soldiers carry, the kind that keeps a week in a saddlebag if you don't let it get wet."),
      line("sumitra", "I'll bake these and wrap them. For a journey. If anyone should happen to go on one. You needn't say anything. I'm only an old woman baking too much bread."),
      when(
        has("queens-box-letter"),
        [say("The road west stays open. Get him out before the wheel turns. And now an old nurse baking for a road nobody has mentioned. Everyone in this fortress seems to know where I am going except me.")],
        [say("Nobody has said anything to me about a journey. I notice that I am not surprised.")],
      ),
      choice("The rounds sit in a row on the board, pale and heavy.", [
        {
          label: "“Wrap them. I'll come for them.”",
          fx: all(set("sumitraBread"), trust("sumitra", 1)),
          then: [
            line("sumitra", "Good. I'll put them with the salt, where nobody looks. If nobody goes anywhere, I'll feed them to the dogs and never mention it."),
            say("She goes back to kneading. Her shoulders have come down an inch."),
          ],
        },
        {
          label: "“I'm not going anywhere.”",
          fx: stat({ renown: 1 }),
          then: [
            line("sumitra", "No. Of course you're not."),
            say("She bakes them anyway. I watch her do it and say nothing, and neither of us believes me."),
          ],
        },
      ]),
    ],
  },

  // ── 37 ──────────────────────────────────────────────────────────────
  {
    n: 37,
    id: "e037-rani-padmavati",
    chapter: 4,
    title: "रानी पद्मावती · Rani Padmavati",
    location: "courtyard",
    objective: "Find Rani Padmavati in the colonnade",
    cast: ["padmavati"],
    beats: [
      say("The colonnade is the one cool place in the courtyard at this hour, and Rani Padmavati walks it the way other people pace a cell: end to end, turning neatly, her women a respectful twelve steps behind."),
      when(
        is("stoodWith", "padmavati"),
        [line("padmavati", "Prince. You stood beside me this morning and didn't once try to borrow money. I have been wondering all morning what you want instead.")],
        [line("padmavati", "Prince Arunveer. You chose other company this morning. I noticed. I notice most things; it is cheaper than being surprised.")],
      ),
      say("She dismisses her women with two fingers. They go twelve more steps back. We walk."),
      talk(
        "padmavati",
        "She walks with her hands folded inside her sleeves, and she looks at the columns as we pass as if she were pricing them.",
        [
          {
            id: "caravans",
            label: "Your caravans",
            required: true,
            reply: [
              line("padmavati", "Salt. Sonkot salt, down the western road to the river towns, every new moon for ten years. Forty mules, twelve drivers. The drivers are paid by the load, so they notice anything that slows them down."),
              line("padmavati", "Do you know how many Meghadurg riders my drivers have seen on the western road in ten years, prince? You'll enjoy this. None. Not one. Not a horse, not a hoofprint, not a campfire."),
              line("padmavati", "And yet the Rao tells us every season the road is thick with them. One of us is very unlucky."),
              fx(gain("padmavati-caravans")),
            ],
          },
          {
            id: "want",
            label: "What do you want, Rani?",
            required: true,
            reply: [
              line("padmavati", "Peace. You needn't look so disappointed. It's not a virtue, it's arithmetic. Salt moves west. Cloth and rice move east. War moves nothing but widows, and I have been one of those; the margins are terrible."),
              line("padmavati", "Every lord in that hall who wants the courier dead wants her dead because it makes the war easier to sell. I would like the war to stay on the shelf."),
            ],
          },
          {
            id: "chaya",
            label: "Did you know the courier?",
            requires: has("chaya-queens-courier"),
            reply: [
              line("padmavati", "Your mother used her for letters to me, now and again. Nothing treasonous — recipes, gossip, the price of indigo. She was the only courier in Vajragarh who never once read what she carried. I checked. I tried to pay her to."),
              fx(trust("padmavati", 1)),
            ],
          },
          {
            id: "jaswant",
            label: "Rao Jaswant",
            reply: [
              line("padmavati", "Loud. Loyal. Rich, lately. Ask him about his fields, prince. He loves to talk about his fields. It is almost the only subject on which he is not lying, and even there you should count the acres yourself."),
            ],
          },
        ],
        "At the end of the colonnade she turns, neatly, and her women turn with her, twelve steps behind.",
      ),
      choice("She is waiting to see what I do with what she has given me.", [
        {
          label: "“You've told me more than you meant to.”",
          then: [
            line("padmavati", "I've told you exactly as much as I meant to. It's the only kind of generosity I can afford. Remember that I was generous, prince. I may send you the bill."),
            fx(trust("padmavati", 1)),
          ],
        },
        {
          label: "Thank her, formally, and take your leave",
          then: [
            say("I bow the correct depth for a Rani of Sonkot. She returns it one finger shallower, which is correct for a second son, and smiles as if we had both passed an examination."),
            fx(sus(-1)),
          ],
        },
      ]),
    ],
  },

  // ── 38 ──────────────────────────────────────────────────────────────
  {
    n: 38,
    id: "e038-rao-jaswant",
    chapter: 4,
    title: "राव जसवंत · Rao Jaswant",
    location: "barracks",
    objective: "Find Rao Jaswant at the barracks",
    cast: ["jaswant"],
    beats: [
      say("Rao Jaswant has borrowed the Senapati's practice yard and a dozen of the younger officers, and is telling them about the winter of the raids with his sword out, drawing the western road in the dust with its point."),
      line("jaswant", "— and at Sirsa Ghat they'd left nothing. Nothing. Not a goat. So we rode them down to the river and we did not stop. For the queen, I said. For Rani Mrinalini. Every one of us said it."),
      say("The officers are young enough to believe him. He sees me over their heads and his face does the thing hill lords' faces do for a king's son: opens, and locks."),
      line("jaswant", "Prince! Come and hear how your mother was avenged. You were too young for it at the time."),
      talk(
        "jaswant",
        "He sends the officers off with a slap on each back and sheathes his sword with a great deal of ceremony.",
        [
          {
            id: "raids",
            label: "The raids you avenged",
            required: true,
            reply: [
              line("jaswant", "Six villages, burned in one winter. Our border. Our people. The riders came at night, in the river dialect, cursing us. My men and I rode the ford every week until spring."),
              say("I ask how many riders he caught. He takes a moment too long."),
              line("jaswant", "They're quick, the river men. Quick and cowardly. They don't stand."),
            ],
          },
          {
            id: "fields",
            label: "Your fields",
            required: true,
            reply: [
              line("jaswant", "Ah — now that's a happier story. The king granted me the lands of the six villages the next year. Nobody else would farm them, so near the border. I said I would. For the queen."),
              line("jaswant", "Good black soil, once you've cleared the ash off. I have wheat there now to the height of a man's chest. Say what you like about fire, prince. It's honest to the ground."),
              fx(gain("jaswant-land")),
            ],
          },
          {
            id: "caravans",
            label: "Padmavati's drivers have never seen a rider",
            requires: has("padmavati-caravans"),
            reply: [
              line("jaswant", "Padmavati's drivers are paid to see salt. They'd drive through a battle if the mules were willing."),
              say("He laughs. Nobody else is there to laugh with him, and he stops."),
              fx(sus(1)),
            ],
          },
          {
            id: "chaya",
            label: "The courier",
            reply: [
              line("jaswant", "A Meghadurg spy in your mother's own household. Think of it. She carried the queen's letters, and six years later she's carrying our secrets west. Hang her from the gate. Better — let the prince do it, as the king says. Let the realm see his hand is steady."),
            ],
          },
        ],
      ),
      choice("He is waiting for me to say what a son says to the man who avenged his mother.", [
        {
          label: "Flatter him",
          detail: "“The realm owes you, Rao.”",
          fx: trust("jaswant", 1),
          then: [
            line("jaswant", "It does. It does, prince, and it's good to hear it said by one of her blood. Come and see the wheat at harvest. I'll show you where Kheri stood."),
            say("He means it kindly. That is the worst of it."),
          ],
        },
        {
          label: "Provoke him",
          detail: "“My mother's blood bought you good fields.”",
          fx: all(stat({ renown: 1 }), trust("jaswant", -2), sus(1), set("provokedJaswant")),
          then: [
            say("The yard goes quiet. Somewhere a practice post creaks in the wind."),
            line("jaswant", "Say that in the hall, boy. Say it in front of your father. I would very much like to hear what he answers."),
            say("He walks away without bowing. Two of the young officers saw it. By noon, everyone will have."),
          ],
        },
        {
          label: "Leave without answering",
          then: [say("I nod to him as I would to a wall, and go. He watches me the whole way across the yard. I can feel him deciding what I am.")],
        },
      ]),
    ],
  },

  // ── 39 ──────────────────────────────────────────────────────────────
  {
    n: 39,
    id: "e039-thakur-bhairav",
    chapter: 4,
    title: "ठाकुर भैरव · Thakur Bhairav",
    location: "treasury",
    objective: "Visit Thakur Bhairav in the counting house",
    cast: ["bhairav"],
    beats: [
      say("The counting house door is open for air. Thakur Bhairav is at his desk in his shirtsleeves, stacking silver into towers of ten and knocking them over again with his elbow, which is not like him."),
      say("There is sweat at his hairline. It is not warm in here. It is the coolest room in the fortress."),
      line("bhairav", "Prince. Forgive me. The king dines at noon and I have to find forty pieces of plate that were all accounted for yesterday and are not now. They are never stolen. They only hide."),
      talk(
        "bhairav",
        "He keeps one hand on the abacus while he talks, pushing beads up and down without looking at them, as though they were prayer beads.",
        [
          {
            id: "tax",
            label: "The border villages' tax",
            required: true,
            reply: [
              line("bhairav", "The — which villages? There are a great many villages, prince."),
              say("I say: the six that burned the year my mother died."),
              say("A bead goes up. It does not come down."),
              line("bhairav", "Remitted. The king forgave them. Everyone knows. It was a hard winter. Why would the prince want — it's all in the remission book. It's all quite correct."),
            ],
          },
          {
            id: "ledgers",
            label: "Your ledgers",
            required: true,
            reply: [
              line("bhairav", "The official books are open to any prince of the blood. That is the law. I will show you the remission book with pleasure. With real pleasure. After the plate. After the meal."),
              say("He says “the official books” as though there were some other kind, and then hears himself say it, and goes a little grey."),
              line("bhairav", "There is only the one kind. I mean — the books. The books are open."),
              fx(set("askedRemission")),
            ],
          },
          {
            id: "trial",
            label: "The trial",
            reply: [
              line("bhairav", "I don't have opinions about trials. I have opinions about silver. The Minister's writ runs through this room like a draught; I keep my papers weighted and my head down."),
              when(
                is("stoodWith", "bhairav"),
                [line("bhairav", "You stood with me this morning. I haven't thanked you. I'm not sure yet whether I should.")],
              ),
            ],
          },
          {
            id: "villages",
            label: "Show: Jaswant's Fields",
            requires: has("jaswant-land"),
            reply: [
              line("bhairav", "The grant? Yes. It came through this room. Every grant does. The Rao pays a very small rent for very good land. That is not my business either. Almost nothing in this room is my business, prince. I only count it."),
              fx(trust("bhairav", -1), sus(1)),
            ],
          },
        ],
        "He has pushed nine beads up on one rod without noticing. He sees me looking, and clears them with his thumb.",
      ),
      choice("He wants me gone. He wants it so badly he is almost polite about it.", [
        {
          label: "Leave him to his plate",
          fx: all(trust("bhairav", 1), sus(-1)),
          then: [
            line("bhairav", "Thank you. Truly. After the meal, prince. The book will be here. It is always here. That's the trouble with books."),
          ],
        },
        {
          label: "Sit down on his bench and wait, pleasantly",
          fx: all(stat({ cunning: 1 }), trust("bhairav", -1)),
          then: [
            say("I sit. He counts. He loses count twice. I learn more from the way he glances at the iron strongbox under the window — three times in the length of a hundred coins — than I would from any book he chose to show me."),
          ],
        },
      ]),
    ],
  },

  // ── 40 ──────────────────────────────────────────────────────────────
  {
    n: 40,
    id: "e040-what-i-know",
    chapter: 4,
    title: "जो मैं जानता हूँ · What I Know",
    location: "chambers",
    objective: "Return to your rooms and set the case in order",
    cast: ["nandini"],
    beats: [
      say("My rooms have been swept while I was out, and the bed made, and my morning cup taken away. Everything is exactly where it was. That is how I know people have been in them."),
      say("Nandini comes in with a jug of water and my Case Book under her arm, the one she has kept since I was a boy who wrote down the names of birds. She sets both on the table and does not leave."),
      line("nandini", "You've been in the garden. You've got her moss on your knees. Drink that. Then tell me what you know, and I'll write it down, and then you'll know it."),
      when(
        has("queens-box-letter"),
        [say("I do not tell her about the letter. It is against my skin, and it can stay there.")],
      ),
      puzzle(
        {
          kind: "deduce",
          title: "The Case So Far",
          prompt:
            "Midday is close. Before the afternoon court, set down what I can prove — not what I fear. Answer each question from the Case Book.",
          slots: [
            { q: "Which way was she riding when they took her?", answer: ["new-horseshoes", "chaya-said-east"] },
            { q: "What did the Minister burn before first bell?", answer: ["ash-fragment", "burning-at-dawn", "decoded-fragment"] },
            { q: "To whom was the burned letter written?", answer: "nilkanth" },
          ],
          hint: "Her horse was shod in river country a week ago, and she told you she was coming home. You watched the brazier yourself. And the address line named one name.",
        },
        [
          say("Nandini writes it in her careful, round hand, and reads it back to me."),
          line("nandini", "One. She was riding east, home, not west. Her horse had Meghadurg shoes and she said she was coming home."),
          line("nandini", "Two. The Minister burned letters before dawn, reading each one first. One of them was in cipher, and it said the road west stays open and the boy asks questions."),
          line("nandini", "Three. It was written to someone called Nilkanth. Nobody at court is called Nilkanth."),
          say("Laid out in her hand, it is not a case against a spy. It is a case against whoever wanted her silenced — and whoever that is knew she was coming before any guard on the border had seen her."),
          when(
            hasAny("courier-copy", "queens-box-letter"),
            [say("And under all of it, the thing I have not said aloud: a looped N, a lullaby, and my mother telling me to look after my brother. I do not ask Nandini to write that down.")],
          ),
          fx(stat({ cunning: 1 })),
        ],
        [
          say("I start three times and each time the story comes out as a list of things I am afraid of. Nandini puts the pen down."),
          line("nandini", "That's not what you know. That's what you think. Start again after you've eaten."),
        ],
      ),
      say("Outside, the noon drum starts in the barracks, slow, and the shadows in the courtyard have drawn in under the walls. The king dines at noon. He will expect both his sons."),
      choice("Nandini is waiting, the jug in her hands.", [
        {
          label: "“Keep the book hidden until tonight.”",
          then: [
            line("nandini", "It's been hidden since you were nine. You just never looked for it."),
            fx(trust("nandini", 1)),
          ],
        },
        {
          label: "“Burn the pages if anyone comes asking.”",
          fx: stat({ ruthlessness: 1 }),
          then: [
            line("nandini", "Like the Minister does."),
            say("She says it without any expression at all, and it stays in the room after she has gone."),
          ],
        },
      ]),
    ],
  },
];
