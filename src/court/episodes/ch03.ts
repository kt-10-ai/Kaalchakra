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
  set,
  stat,
  supply,
  sus,
  talk,
  trust,
  trusts,
  when,
} from "../dsl";

/**
 * Chapter 3 — अभिलेखागार · The Archive (morning). Episodes 21–30.
 *
 * Dating convention used here: the archive counts years "of the Wheel".
 * This is year 341. The Accession was 319 (the month of Kartik).
 */
export const CHAPTER_3: Episode[] = [
  // ── 21 ──────────────────────────────────────────────────────────────
  {
    n: 21,
    id: "e021-old-vidyadhar",
    chapter: 3,
    title: "वृद्ध विद्याधर · Old Vidyadhar",
    location: "archive",
    objective: "Go down to the archive and find Vidyadhar",
    cast: ["vidyadhar"],
    beats: [
      say("The archive is under the Chancery, down eleven steps worn into shallow bowls. It smells of lamp oil and dust and the sweetish rot of old palm leaf. Nobody comes here who does not have to."),
      say("Vidyadhar is where he has always been, at the long table under the one window, his face a hand's width from the page. He reads the way other men listen at doors."),
      when(
        is("dress", "silk"),
        [line("vidyadhar", "Silk. I hear it on the stair. Either the prince has come down to be flattered, or he has come down to be seen coming. Sit, Arunveer.")],
        [line("vidyadhar", "Soft boots. Dark wool. You came down quietly. Good. You used to take this stair three at a time and fall on the last one. Sit, Arunveer.")],
      ),
      talk(
        "vidyadhar",
        "He sets his reading stone on the page to keep his place, which means I have the whole of his attention. It is not a small thing to have.",
        [
          {
            id: "lessons",
            label: "Her lessons",
            required: true,
            reply: [
              line("vidyadhar", "She brought you down those steps on her hip before you could walk them. She taught you the letters. I taught you to sit still long enough to learn them. Neither of us fully succeeded."),
              line("vidyadhar", "You wrote your first ka backward for a month. She said it was facing the right way from where the letter stood. She was like that. She would argue for anything that couldn't argue for itself."),
              say("He smiles at the page, not at me. I understand that the page is where he keeps her."),
              fx(trust("vidyadhar", 1)),
            ],
          },
          {
            id: "wheel",
            label: "Show: The Cipher Lines",
            requires: has("cipher-lines"),
            reply: [
              say("I put the scorched lines on the table. He brings them to his good eye and holds them there a long time."),
              line("vidyadhar", "A wheel. Of course it is a wheel. Hers was brass, the width of a palm. Two rings — the outer fixed, the inner turning. She kept it close. On her desk, in her sleeve when she travelled. I never once saw it out of her reach."),
              line("vidyadhar", "Whoever wrote this was taught by her. Or by someone she taught."),
              when(has("missing-wheel"), [say("I think of the clean ring in the dust on her desk, the width of a palm, and I do not tell him. Not yet.")]),
            ],
          },
          {
            id: "charters",
            label: "The old charters",
            required: true,
            reply: [
              line("vidyadhar", "Charters. Wax and ink and dead men's promises. What does a prince want with those, on the morning of a trial?"),
              say("I tell him I want to see the royal seal as it was before I was born. He is quiet for the length of a breath."),
              line("vidyadhar", "They are in the long chest. I will show you, if you will read them for me. My eyes stop at the edges now. Everything I look at has a fog around it, like a thing half remembered."),
            ],
          },
          {
            id: "nilkanth",
            label: "The name Nilkanth",
            requires: has("nilkanth"),
            reply: [
              say("I say it clearly. He turns a page that does not need turning."),
              line("vidyadhar", "Hm? The lamp wants trimming."),
              say("I say it again."),
              line("vidyadhar", "I heard you the first time. I am old, Arunveer, not deaf. And I am old because there are a great many things I have not heard."),
            ],
          },
        ],
        "He gets up and feels his way along the shelves by touch, counting under his breath, and drags out a chest with a lid the colour of dried blood.",
      ),
    ],
  },

  // ── 22 ──────────────────────────────────────────────────────────────
  {
    n: 22,
    id: "e022-the-eight-spokes",
    chapter: 3,
    title: "आठ तीलियाँ · The Eight Spokes",
    location: "archive",
    objective: "Read the old charters with Vidyadhar",
    cast: ["vidyadhar"],
    beats: [
      say("The chest breathes out when he opens it. Charters rolled on cedar rods, each tied with a cord the colour of its century. The wax hangs from them on silk tags like fruit."),
      line("vidyadhar", "The archive counts in years of the Wheel, from the founding of the fortress. This is the three hundred and forty-first. Every grant that ever carried a king's wax is in here, if the mice have been merciful."),
      say("I choose five, from the top and the bottom and the middle, and lay them in the window light. Our wheel is on every one. It is not the same wheel on every one."),
      puzzle(
        {
          kind: "seal",
          title: "The Charter Seals",
          prompt:
            "Five charters, five royal seals, laid out in no order. On the oldest, the wheel is whole. At some point the wheel loses a spoke. Count carefully — old wax cracks, and a crack is not a cut. Which is the FIRST charter sealed with a seven-spoked wheel?",
          seals: [
            { label: "Wheel-year 327 · mill rights, Sonkot", spokes: 8, cut: 5, wax: "#7a1f1a", border: 12 },
            { label: "Wheel-year 312 · the salt-road toll", spokes: 8, wax: "#8a2a1a", border: 16 },
            { label: "Wheel-year 319 · a pardon, sealed in Kartik", spokes: 8, cut: 5, wax: "#6e1a18", border: 12 },
            { label: "Wheel-year 318 · a hill lord confirmed", spokes: 8, wax: "#8a2a1a", border: 16, cracked: true },
            { label: "Wheel-year 340 · a treaty of wells", spokes: 8, cut: 5, wax: "#7a1f1a", border: 12 },
          ],
          answer: 2,
          hint: "Put them in order of year: 312, 318, 319, 327, 340. The seal of 318 is cracked across a spoke, but every spoke is still there. The first wheel truly missing one is the answer. (This is year 341. Count back twenty-two.)",
        },
        [
          say("Three hundred and eighteen: whole. The wax has split across one spoke, but it is whole. Three hundred and nineteen: seven. The gap is clean, deliberate, cut into the brass before it ever touched wax."),
          say("And the rim changes with it. Sixteen dots around the old wheel, twelve around the new. Nobody cut a spoke from the old seal. Somebody made a new one."),
          line("vidyadhar", "Three nineteen. Twenty-two years ago. The year of the Accession."),
          fx(gain("old-charters"), stat({ cunning: 1 })),
        ],
        [
          say("The wheels begin to swim. Seven, eight, a crack that might be a cut. I give up and read him the years instead."),
          line("vidyadhar", "Give them here. My eyes are bad. My thumbs are not."),
          say("He runs his thumb around each wheel like a man reading a face in the dark, and stops on one. Three nineteen. But he has to call the under-clerk down from the Chancery to fetch the index to be sure, and the under-clerk has a mouth."),
          line("vidyadhar", "The year of the Accession. Twenty-two years ago."),
          fx(gain("old-charters"), sus(1)),
        ],
      ),
      choice("He is rolling the charters up again, slowly, tighter than they need to be.", [
        {
          label: "Ask him what the Accession was",
          then: [
            line("vidyadhar", "The day your father took the throne. The old king had no son living. Your father had been his general. That is what the chronicles say, and the chronicles are very sure of themselves."),
            line("vidyadhar", "Ask me no more of it down here, Arunveer. The floor of the Chancery is thin."),
            fx(set("askedAccession")),
          ],
        },
        {
          label: "Say nothing, and help him tie the cords",
          then: [
            say("I tie the cords. He lets me. Neither of us says anything, and I think, from the way his shoulders come down, that he is grateful."),
            fx(trust("vidyadhar", 1)),
          ],
        },
      ]),
    ],
  },

  // ── 23 ──────────────────────────────────────────────────────────────
  {
    n: 23,
    id: "e023-the-wheel",
    chapter: 3,
    title: "चक्र · The Wheel",
    location: "archive",
    objective: "Break the cipher from the Minister's brazier",
    cast: ["vidyadhar"],
    beats: [
      say("I lay the three burned lines flat under the reading stone. Vidyadhar reaches under the table without looking and comes up with a wheel of pale pine, the letters burned into it with a hot needle."),
      line("vidyadhar", "She had me carve this for you when you were seven. You lost it twice and cried both times. The brass one was hers. This one was always yours."),
      say("The inner ring still sticks at the same letter it stuck at when I was seven. I turn it past, the way I learned to."),
      puzzle(
        {
          kind: "cipher",
          title: "The Queen's Wheel",
          prompt: (s) =>
            s.clues.includes("queen-lesson")
              ? "The three lines from the brazier. Turn the inner ring until the letters make words. I know how many places she would turn it. She told me at her desk, when I was seven."
              : "The three lines from the brazier. Turn the inner ring until the letters make words. A royal wheel. A royal key, perhaps.",
          plain: "THE ROAD WEST STAYS OPEN. TELL NILKANTH THE BOY ASKS QUESTIONS. GET HIM OUT BEFORE THE WHEEL TURNS.",
          shift: 8,
          hint: (s) =>
            s.clues.includes("queen-lesson")
              ? "Her lesson: “Turn the wheel once around for every spoke. Eight spokes, eight letters on. A whole wheel.” Turn it eight."
              : "The old royal wheel, before the Accession, had eight spokes. Try turning it eight.",
        },
        [
          say("The ring clicks round and the letters fall into words the way a key falls into its wards. I read them once in my head and once aloud, very low."),
          say("“The road west stays open. Tell Nilkanth the boy asks questions. Get him out before the wheel turns.”"),
          line("vidyadhar", "When the wheel turns. In the old court speech it means when a reign changes hands. Or when a sentence is carried out. She would have liked that. One phrase, two doors."),
          fx(gain("decoded-fragment"), stat({ cunning: 1 })),
        ],
        [
          say("The ring goes round and round and nothing comes up but nonsense. Vidyadhar takes the page, holds it to his good eye, and turns my wheel with a thumb that knows it better than I do."),
          line("vidyadhar", "My eyes give out halfway. There is a line here. “…the boy asks questions…” The rest of it is fog."),
          fx(set("partialDecode")),
        ],
      ),
      choice("Vidyadhar is waiting to hear the rest. His face says he would rather not.", [
        {
          label: "Tell him everything it says",
          then: [
            say("I tell him. When I say the name, he closes his eyes."),
            line("vidyadhar", "Then I have heard nothing. Remember that I have heard nothing. It will matter to someone later."),
            fx(trust("vidyadhar", 1)),
          ],
        },
        {
          label: "Keep it to yourself",
          then: [
            say("I fold the paper and put it in my sleeve. He hears the paper fold. He nods, as if I have passed a test he did not want me to sit."),
            line("vidyadhar", "Good. You learned something down here after all."),
            fx(stat({ cunning: 1 })),
          ],
        },
      ]),
    ],
  },

  // ── 24 ──────────────────────────────────────────────────────────────
  {
    n: 24,
    id: "e024-the-boy-asks-questions",
    chapter: 3,
    title: "प्रश्न पूछता बालक · The Boy Asks Questions",
    location: "archive",
    objective: "Decide what the letter means",
    cast: ["vidyadhar"],
    beats: [
      say((s) =>
        s.clues.includes("decoded-fragment")
          ? "The boy asks questions. Get him out before the wheel turns. I read it until the words stop being words and start being shapes again."
          : "The boy asks questions. That is all I have of it, and it is enough to keep reading until the words stop being words."),
      say("The Minister read this. He read every sheet before he fed it to the brazier. Whatever the boy means, Kaushal knows it too, and he knew it before I did."),
      choice("Who is “the boy”?", [
        {
          label: "Me. I am the one asking questions.",
          fx: set("boyTheory", "me"),
          then: [
            say("I have been asking questions since the last watch. Someone reported that before I had asked any. Someone wants me out — of the fortress, or out of the way. The letter does not say which, and the difference is the whole of my life."),
            fx(stat({ cunning: 1 })),
          ],
        },
        {
          label: "Ranadhir. Someone is protecting the heir.",
          fx: set("boyTheory", "ranadhir"),
          then: [
            say("The heir. Someone on the far side of the river writing to have him got out before a reign changes hands. It fits, if I stand it on its head. My brother has never in his life asked a question he did not already know the answer to."),
          ],
        },
        {
          label: "A code word. It could mean anything.",
          fx: set("boyTheory", "code"),
          then: [
            say("A courier's letter, a cipher, a name out of a lullaby. The boy could be a shipment, a garrison, a horse. I tell myself so, and it is comfortable, and I do not believe it."),
            line("vidyadhar", "Your mother liked codes that were not codes. She said a secret hides best in plain speech, where nobody bothers to look for one."),
          ],
        },
      ]),
      line("vidyadhar", "When she was cross she called you both “the boy”. Where has the boy gone. Who let the boy near the ink. Whichever of you had the honey on his face."),
      say("He means it kindly. It is the least comforting thing anyone has said to me today."),
    ],
  },

  // ── 25 ──────────────────────────────────────────────────────────────
  {
    n: 25,
    id: "e025-the-mourning-story",
    chapter: 3,
    title: "शोक की कथा · The Mourning Story",
    location: "chancery",
    objective: "Leave the archive by the Chancery stair",
    cast: ["kaushal"],
    beats: [
      say("At the top of the archive stair the Minister is waiting, hands folded into his sleeves, as though he had been passing and happened to stop for a quarter of an hour."),
      when(
        is("brazier", "interrupted"),
        [line("kaushal", "Twice before noon, Prince. First at my brazier and now at my stair. I shall begin to believe you are fond of me.")],
        [line("kaushal", "Prince. The archive is a dull place on a morning like this one. Walk with me. My knees prefer company on the long corridor.")],
      ),
      say("His ink is black, the Chancery soot-black, and there is none of it on his fingers. He is a man who has clerks for his fingers."),
      talk(
        "kaushal",
        "We walk the long corridor at his pace, which is slow, and which he has chosen so that I cannot pretend to be in a hurry.",
        [
          {
            id: "trial",
            label: "The trial",
            required: true,
            reply: [
              line("kaushal", "It will be a short afternoon. The king dislikes long ones. The evidence is simple and the sentence is simpler. You need not trouble yourself with anything but the last part."),
              line("kaushal", "The last part is the only part anyone will remember. I say that as a friend."),
            ],
          },
          {
            id: "seven",
            label: "Why does our wheel have seven spokes?",
            requires: has("old-charters"),
            reply: [
              line("kaushal", "In mourning. When the old king died, your father ordered a spoke cut from the wheel, so that the realm would remember its loss every time it pressed wax."),
              line("kaushal", "A tender thought, from a man not famous for them. I was a junior clerk. I remember the cutting. The brass smoked."),
              say("He says it without a hitch, the way men say things they have said so often that the words have worn smooth."),
              fx(gain("mourning-story"), sus(1)),
            ],
          },
          {
            id: "lining",
            label: "The satchel's lining was cut",
            requires: has("cut-lining"),
            reply: [
              line("kaushal", "Couriers sew things into linings. Coins. Love letters. Lice. My clerks are thorough, and clumsy. I will have one of them flogged, if it would please you."),
              say("He waits, courteously, to learn whether it would please me."),
              fx(sus(1)),
            ],
          },
          {
            id: "warrant",
            label: "The warrant was signed before she was seen",
            requires: has("early-warrant"),
            reply: [
              line("kaushal", "Vajragarh has friends in many places. Some of them write to me before things happen. That is what friends are for, Prince. You would be surprised how many of them there are."),
              fx(sus(1)),
            ],
          },
          {
            id: "brazier",
            label: "Your brazier, this morning",
            requires: has("burning-at-dawn"),
            reply: [
              line("kaushal", "The Chancery burns what the law says must be burned. The law is quite particular. I could lend you a copy."),
              line("kaushal", "I read everything before I burn it. It is a habit I recommend. One learns so much, and then one has nothing left to carry."),
              fx(sus(2)),
            ],
          },
        ],
        "At the Chancery door he stops. “Your mother asked questions too,” he says. “A remarkable woman. Mind the third step down; it has killed a clerk.”",
      ),
      choice("He is waiting for me to go first.", [
        {
          label: "Bow, and go",
          fx: sus(-1),
          then: [say("I bow as a prince bows to a Minister, which is to say slightly. He returns it exactly, to the width of a hair.")],
        },
        {
          label: "Wait, and make him go first",
          fx: stat({ renown: 1 }),
          then: [
            say("I do not move. After a moment he inclines his head, smiling, and goes in ahead of me like a man letting a child win at dice."),
            fx(sus(1)),
          ],
        },
      ]),
    ],
  },

  // ── 26 ──────────────────────────────────────────────────────────────
  {
    n: 26,
    id: "e026-the-temple-register",
    chapter: 3,
    title: "मंदिर की पंजी · The Temple Register",
    location: "temple",
    objective: "Find the priests' register of royal rites in the temple",
    cast: ["devashrava"],
    beats: [
      say("The temple smoke has thinned since dawn, but it lives in the walls. Devashrava is at the far altar with his back to me, laying out the brass things he will need at sunset. The sword's stand is already there. It is empty."),
      say("The register of royal rites sits on its own stone lectern by the door, chained to it like a dog. The chain is long enough to read by. It is not long enough to leave with."),
      say((s) =>
        s.clues.includes("mourning-story")
          ? "Kaushal says the spoke was cut in mourning. Mourning comes after a death. If the priests wrote down both days, the order of them will say whether he is lying."
          : "Everyone at court has heard it said that the spoke was cut in mourning for the old king. Mourning comes after a death. If the priests wrote down both days, the order of them will say whether it is true."),
      puzzle(
        {
          kind: "ledger",
          title: "Rites of the Year 319",
          prompt:
            "The priests' register for the year of the Accession. Select the TWO entries that, read together, prove the spoke was not cut in mourning.",
          columns: ["Date, year 319", "Rite", "For", "Officiant"],
          rows: [
            ["2 Ashvin", "Offering at the end of the rains", "The realm", "Devashrava"],
            ["19 Ashvin", "Blessing of the western granaries", "The treasury", "Devashrava"],
            ["4 Kartik", "Consecration of the royal seal, newly cut — seven spokes", "The throne", "Devashrava"],
            ["5 Kartik", "Purification of the royal apartments", "The palace", "Devashrava"],
            ["7 Kartik", "Funeral rites of the old king; the pyre lit", "The old king and his line", "Devashrava"],
            ["12 Kartik", "Coronation of King Bhanusen", "The throne", "Devashrava"],
            ["20 Kartik", "Thirteenth-day rites for the old king", "The old king", "Devashrava"],
            ["3 Margashirsha", "First charters sealed under the new wheel", "The Chancery", "Kaushal, witness"],
          ],
          answer: [2, 4],
          hint: "Find the day the seven-spoked seal was made, and the day the old king was first mourned. If the seal comes first, it was not cut in mourning.",
        },
        [
          say("The fourth of Kartik: a new seal consecrated, seven spokes. The seventh of Kartik: the old king's funeral, the pyre lit. Three days. The seal was cut before he was mourned — before, for all this page will tell me, anyone had been told that he was dead."),
          say("And on the fifth, between the two, the priests purified the royal apartments. I do not know what one purifies a room of. I know what my grandmother would have said."),
          say("Every entry is in the same careful hand. The officiant's name is the same on every line. Devashrava was a young man then. He wrote all of it down, and then he lived beside it for twenty-two years."),
          fx(gain("temple-register"), stat({ cunning: 1 })),
        ],
        [
          say("Dates and rites and the names of the dead. I turn back and forth until the months run together and a novice comes to trim the lamp and looks at me too long."),
          fx(sus(1)),
        ],
      ),
      choice("Devashrava's hands have stopped moving at the altar. He has not turned round.", [
        {
          label: "Close the register gently and step away",
          fx: sus(-1),
          then: [say("I close it the way Vidyadhar taught me to close old books, with the flat of my hand, so it makes no sound. When the priest turns, I am looking at the empty sword stand.")],
        },
        {
          label: "Leave it open at the page",
          fx: set("registerLeftOpen"),
          then: [say("I leave it open at Kartik of three-nineteen and walk to the altar. Behind me I hear him cross to the lectern. I hear him stop.")],
        },
      ]),
    ],
  },

  // ── 27 ──────────────────────────────────────────────────────────────
  {
    n: 27,
    id: "e027-the-priests-fear",
    chapter: 3,
    title: "पुरोहित का भय · The Priest's Fear",
    location: "temple",
    objective: "Speak to the Rajpurohit",
    cast: ["devashrava"],
    beats: [
      when(
        is("registerLeftOpen"),
        [
          say("Devashrava stands at the lectern with his hand flat on the open page, as if to keep it from speaking. He is an old man, and this morning he looks it."),
          line("devashrava", "You left this open. Your mother used to do that. Leave a book open on a table so that the next person would have to decide whether to read it."),
        ],
        [
          say("Devashrava turns from the altar with a lamp in either hand. The flames lean when he sees my face, because his hands have moved."),
          line("devashrava", "Prince. If you are here for the blessing, it is not until sunset. If you are here for something else, I would rather you were here for the blessing."),
        ],
      ),
      when(
        has("temple-register"),
        [say("I tell him what I read. The fourth of Kartik. The seventh. The three days in between.")],
        [say("I ask him about the year of the Accession, and the seal, and whether it was truly cut in mourning. It is enough. His throat moves.")],
      ),
      choice("He is frightened. The question is what I do with his fear.", [
        {
          label: "Threaten him",
          detail: "Frighten him more than they did",
          then: [
            say("I step close enough to smell the camphor in his robe. I tell him that I will say the dates aloud in my father's hall this afternoon, and say whose hand wrote them."),
            line("devashrava", "You would not. You are her son. You would not."),
            say("I say nothing. It turns out that is the cruellest thing I know how to say."),
            line("devashrava", "There was a night. The old king's line did not end in its bed."),
            say("He sits down on the altar step as if his knees have been cut. He will say nothing more, and I can see in his face that nothing I could do would make him."),
            fx(stat({ ruthlessness: 2 }), sus(1), gain("accession-night"), set("priestTold"), trust("devashrava", -1)),
          ],
        },
        {
          label: "Reassure him",
          detail: "Tell him you will not use his name",
          fx: trust("devashrava", 2),
          then: [
            say("I tell him I will not say his name in the hall. I tell him he blessed my naming, and my brother's, and I have not forgotten either."),
            say("He looks at me a long time. Then he reaches past me and closes the register with the flat of his hand."),
            line("devashrava", "Ask the archivist about the night of the Accession. Ask him gently. He was braver than I was, that year, and it has cost him his eyes."),
          ],
        },
        {
          label: "Leave it",
          then: [
            say("I bow to him, and to the god, and go. At the door I look back. He is standing where I left him, holding both lamps, as if he has forgotten what they are for."),
          ],
        },
      ]),
    ],
  },

  // ── 28 ──────────────────────────────────────────────────────────────
  {
    n: 28,
    id: "e028-nandini-reports",
    chapter: 3,
    title: "नंदिनी का समाचार · Nandini Reports",
    location: "chambers",
    objective: "Return to your rooms. Nandini has news",
    cast: ["nandini"],
    beats: [
      say("Nandini is waiting in my rooms with my own notes on her knee, tied with a kitchen string, and ink on two of her fingers because she has been adding to them. She stands when I come in, and then remembers she has decided not to do that any more."),
      when(
        is("watch", "kaushal"),
        [
          line("nandini", "Rao Jaswant went into the Chancery before the first bell. Not by the front. By the clerks' door, with his hood up, as if anyone could miss Rao Jaswant."),
          line("nandini", "Hari was mopping the passage. He heard “the villages” twice. And once, the Minister said, “the boy's question.” Then someone shut the inner door."),
          say("The villages. Six of them, burned the year my mother died. And the boy's question. I have heard that phrase already today, in a dead man's cipher."),
          fx(set("heardJaswantKaushal")),
        ],
      ),
      when(
        is("watch", "ranadhir"),
        [
          line("nandini", "Your brother left his rooms at the last watch. With a lamp, alone, toward the dungeon stair. He came back an hour later."),
          line("nandini", "His man brought a basin. Mohan says he washed his hands a long while, like a physician. And his belt — Mohan says the heir's token was on it when he went, and in his hand when he came back."),
          say("An hour. A lamp. The dungeon stair. And the one token in the palace that opens the lower cells, besides my father's and the Minister's."),
          fx(gain("king-token")),
        ],
      ),
      when(
        is("watch", "stair"),
        [
          line("nandini", "A man went down the dungeon stair at the last watch. Hooded. Old Bindu on the lamps saw a royal token in his hand. It caught the light. She wouldn't swear to whose."),
          line("nandini", "Then Karan came up to the guardroom, swearing, and sat there with his boots off for the best part of an hour. Nobody sends Karan off his stair."),
          say("A royal token. There are only three of those that open the lower cells without question."),
          fx(gain("king-token")),
        ],
      ),
      when(
        (s) => s.flags.watch === undefined,
        [line("nandini", "I didn't know which door you wanted watched, so I watched all of them, and saw nothing on any. I'm sorry. Next time tell me which.")],
      ),
      line("nandini", "And there is a man asking the kitchen girls which way you went this morning. I don't know his name. He has the Chancery's shoes."),
      choice("She is watching me the way she used to watch me climb the walls when she was nine and I was thirteen.", [
        {
          label: "Thank her",
          fx: trust("nandini", 1),
          then: [
            say("I thank her properly, as though she were a lord who had done me a service. She goes red to the ears and busies herself with the water jug."),
            line("nandini", "I'll keep them watching. They like it. Nobody ever asks the lamp-women anything."),
          ],
        },
        {
          label: "Tell her to stop",
          fx: sus(-1),
          then: [
            say("I tell her to call her people off. Fewer eyes on the doors, fewer eyes on her. She hears what I mean and hates it."),
            line("nandini", "Because of the man with the Chancery shoes. Yes, Highness."),
            fx(trust("nandini", -1), set("nandiniStood")),
          ],
        },
      ]),
    ],
  },

  // ── 29 ──────────────────────────────────────────────────────────────
  {
    n: 29,
    id: "e029-karan-remembers",
    chapter: 3,
    title: "करण की स्मृति · Karan Remembers",
    location: "dungeon",
    objective: "Go down to the gaol and question Karan",
    cast: ["karan"],
    beats: [
      say("The gaol is colder at mid-morning than it was at the last watch, because the torches have been let burn down to save oil. Karan sits on his stool at the foot of the stair, his ring of keys across his knees like a sleeping cat."),
      when(
        is("karanWay", "ordered"),
        [line("karan", "Highness. Come to give me more orders? I've still got the last lot. I keep them in a box.")],
      ),
      when(
        is("karanWay", "bribed"),
        [line("karan", "Highness. Twice in a morning. You'll have me thinking I'm a man worth visiting. Or worth paying.")],
      ),
      when(
        is("karanWay", "wine"),
        [line("karan", "Highness. There's none left, before you ask. I finished it after you went. Sit, sit — the stool on the left doesn't wobble.")],
      ),
      talk(
        "karan",
        "He does not get up. It is not insolence. He has been sitting on that stool since the last watch and I think his knees have stopped listening to him.",
        [
          {
            id: "visitor",
            label: "Someone came down in the night",
            required: true,
            reply: [
              line("karan", "At the last watch. Someone came down that stair with a royal token held out in front like a lamp, and told me to go up to the guardroom and sit there till I was sent for."),
              line("karan", "Didn't see a face. Hood, and the torch behind him. But I smelled him. Sandalwood. Not the temple stuff — oil. Like a wedding. Like a rich man's wedding."),
              fx(gain("dungeon-visitor")),
            ],
          },
          {
            id: "keys",
            label: "Your keys",
            required: true,
            reply: [
              say("His hand closes over the ring before he answers."),
              line("karan", "I swear on my mother, Highness, this ring never left my belt. But when I came down again I counted, the way I always count. Cell three's key wasn't on it. An hour I sat in that guardroom. By first bell it was back, on the right hook, turned the right way."),
              line("karan", "I didn't tell the Minister. I'm telling you because you're not the Minister."),
              fx(gain("missing-key")),
            ],
          },
          {
            id: "tokens",
            label: "Who carries a royal token?",
            required: true,
            reply: [
              line("karan", "One that opens the lower cells and no questions asked? Three. The king. The Minister. The heir. That's the whole list. You're not on it, Highness, no offence meant."),
              fx(gain("king-token")),
            ],
          },
          {
            id: "coin",
            label: "Press a coin into his hand",
            requires: coin(1),
            reply: [
              say("I put a coin in his palm. He looks at it, and at me, and closes his hand."),
              line("karan", "He was tall. Taller than me by a hand. And he didn't hurry. Stood at the top of the stair like a man who's never once had to wait for a door to be opened."),
              fx(supply({ coin: -1 }), trust("karan", 1)),
            ],
          },
          {
            id: "wine",
            label: "Ask what else he noticed",
            requires: is("karanWay", "wine"),
            reply: [
              line("karan", "Since you drank with me. He hummed, going back up. Low. Some child's tune. I remember thinking — that's a man who's done either a kindness or a murder, and he doesn't yet know which."),
              fx(trust("karan", 1), set("karanHum")),
            ],
          },
        ],
        "He goes back to counting his keys. He counts them twice.",
      ),
      choice("Karan has told me more than he should. He knows it.", [
        {
          label: "Tell him no one will hear it from you",
          fx: trust("karan", 1),
          then: [line("karan", "They'll hear it anyway, Highness. They always do. But I'll sleep better on the lie.")],
        },
        {
          label: "Tell him to say nothing to the Minister, or else",
          fx: stat({ ruthlessness: 1 }),
          then: [
            say("He looks at me with no expression at all. It is the look men in this palace keep for my father."),
            fx(trust("karan", -1)),
          ],
        },
      ]),
    ],
  },

  // ── 30 ──────────────────────────────────────────────────────────────
  {
    n: 30,
    id: "e030-cell-three-again",
    chapter: 3,
    title: "तीसरी कोठरी, फिर · Cell Three, Again",
    location: "dungeon",
    objective: "Visit the prisoner in cell three",
    cast: ["chaya", "karan"],
    beats: [
      say("She is sitting exactly as she was at dawn, back to the wall, knees drawn up, hands loose. Someone has given her a cup of water and she has not drunk it. She is keeping it."),
      when(
        is("dress", "silk"),
        [line("chaya", "The silk again. You'll have it ruined down here. The damp gets into the gold thread and it never comes out.")],
        [line("chaya", "Still in wool. I'd started to think you meant it.")],
      ),
      talk(
        "chaya",
        "Karan has gone to the far end of the passage and is making a noise with his keys so that we will know exactly how far away he is. It is almost courteous.",
        [
          {
            id: "wheel",
            label: "So you can read her wheel",
            requires: has("decoded-fragment"),
            reply: [
              say("I say the three lines to her, very low, without the name."),
              say("She looks at me differently afterward. Not warmer. More carefully, the way you look at a horse you had thought was a mule."),
              line("chaya", "Eight on. She taught you that too. I wondered whether she'd had time."),
              fx(trust("chaya", 1)),
            ],
          },
          {
            id: "visitor",
            label: "Who came to you last night?",
            required: true,
            reply: [
              when(
                trusts("chaya", 2),
                [
                  say("She is quiet for a long while. Then:"),
                  line("chaya", "Someone who could not be seen doing it."),
                  say("She will not say more. I do not think it is to protect herself."),
                ],
                [line("chaya", "No one. Gaols are very quiet places, Highness. That's the whole point of them.")],
              ),
            ],
          },
          {
            id: "lining",
            label: "Show: The Cut Lining",
            requires: has("cut-lining"),
            reply: [
              line("chaya", "Then you know more than the court does. Keep it that way until it's worth something. It is not worth anything yet."),
            ],
          },
          {
            id: "nilkanth",
            label: "Nilkanth",
            requires: has("nilkanth"),
            reply: [
              say("Her head comes up so fast it knocks the wall."),
              line("chaya", "Don't say that here. These walls have Karan in them, and Karan has a Minister. Don't say it anywhere. Not until you have to."),
            ],
          },
        ],
      ),
      choice("She has asked me for nothing. That is somehow worse. What do I promise her?", [
        {
          label: "“I'll get you out.”",
          fx: set("promisedChaya", "free"),
          then: [
            line("chaya", "Don't promise things your father owns. Everything in this building is his, including the air and including you."),
            say("She says it gently, which I did not expect, and it lands harder for that."),
          ],
        },
        {
          label: "Promise nothing",
          fx: set("promisedChaya", "nothing"),
          then: [
            say("I tell her I will not promise what I may not be able to do."),
            line("chaya", "Good. That one I can believe. You'd be surprised how few people at this court have ever said it to me."),
            fx(trust("chaya", 1)),
          ],
        },
        {
          label: "“The truth will be said aloud in that hall.”",
          fx: set("promisedChaya", "truth"),
          then: [
            line("chaya", "Aloud. In that hall. In front of him."),
            say("She considers it the way a soldier considers a bridge."),
            line("chaya", "That is the most dangerous thing anyone has offered me this week. Very well. I'll hold you to it."),
            fx(trust("chaya", 1), stat({ renown: 1 })),
          ],
        },
      ]),
      say("When I go, she lifts the cup of water an inch, as though to toast me, and puts it down again untouched."),
    ],
  },
];
