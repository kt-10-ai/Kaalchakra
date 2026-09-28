import type { Episode } from "../types";
import { all, choice, fx, gain, has, hasAny, is, line, puzzle, say, search, set, stat, statAt, sus, talk, trust, when } from "../dsl";

/**
 * Chapter 5 — मध्याह्न · Noon: The Counting House.
 *
 * Calendar used throughout (and by the ledgers in e41/e43): the queen died on
 * the 9th of Kartik, in the 16th year of Bhanusen's reign (six years ago; the
 * Accession was Year 1, twenty-two years ago). The six villages burned on
 * 14 & 22 Kartik, 3 & 17 Margashirsha, 2 & 11 Pausha of Year 16.
 * Bhairav's strongbox opens to 9-1-6: her death day.
 */
export const CHAPTER_5: Episode[] = [
  // ───────────────────────────── 41 ─────────────────────────────
  {
    n: 41,
    id: "e041-the-official-ledger",
    chapter: 5,
    title: "राजकोष की बही · The Official Ledger",
    location: "treasury",
    objective: "Go to the counting house and read the remission ledger",
    cast: ["bhairav"],
    beats: [
      say("The counting house is the coolest room in the fortress. Thick walls, one high window, and the smell of lamp oil and damp paper. Somewhere behind the shelves a clerk is counting under his breath and losing his place."),
      when(
        is("stoodWith", "bhairav"),
        [
          line("bhairav", "Prince. You stood with me this morning. I have been trying all day to decide whether that was a kindness or a warning."),
          say("He brings the book himself, without being asked. That is how I know it frightens him."),
        ],
        [
          line("bhairav", "The remission book. You asked to see it, and a prince may see what he likes. I only ask that you see it quickly."),
          say("He sets it on the slope of the reading desk with both hands, the way a man sets down something hot."),
        ],
      ),
      line("bhairav", "Every grain the crown forgives is written there. Flood, fever, hail, fire. The king's mercy, in columns."),
      say("My mother died on the ninth of Kartik, in the sixteenth year of my father's reign. I was fourteen. I know the date the way I know the number of my own fingers."),
      puzzle(
        {
          kind: "ledger",
          title: "The Remission Book",
          prompt:
            "The treasury's record of forgiven tax. Find the villages remitted as “burned by Meghadurg riders” in the year my mother died — the sixteenth year of the reign. Select every such entry, and nothing else.",
          columns: ["Year", "Date", "Village", "Silver", "Cause"],
          rows: [
            ["14", "2 Shravan", "Rampura", "40", "Granary fire — lightning"],
            ["16", "14 Kartik", "Kheri", "120", "Burned by Meghadurg riders"],
            ["16", "20 Ashvin", "Jhalod", "35", "Fever; fields unworked"],
            ["16", "22 Kartik", "Dhanpur", "95", "Burned by Meghadurg riders"],
            ["16", "3 Margashirsha", "Sirsa Ghat", "150", "Burned by Meghadurg riders"],
            ["17", "14 Kartik", "Kheri", "60", "Burned — second year forgiven"],
            ["16", "17 Margashirsha", "Umri", "80", "Burned by Meghadurg riders"],
            ["16", "1 Pausha", "Barkot", "25", "Flood on the lower terraces"],
            ["16", "2 Pausha", "Palasbani", "110", "Burned by Meghadurg riders"],
            ["16", "11 Pausha", "Tilwara", "70", "Burned by Meghadurg riders"],
          ],
          answer: [1, 3, 4, 6, 8, 9],
          hint: "Year 16 only — Kheri appears twice, and the second time is the following year. Six villages, six fires.",
        },
        [
          fx(gain("burned-remission")),
          say("Six villages. Kheri, Dhanpur, Sirsa Ghat, Umri, Palasbani, Tilwara. The first burned five days after my mother died, the last before the year turned. Two fires a month, as regular as rent."),
          say("I say the dates over to myself until they stop being ink. Fourteen and twenty-two Kartik. Three and seventeen Margashirsha. Two and eleven Pausha."),
          line("bhairav", "A terrible winter. Everyone remembers it."),
          say("He says it the way a man recites a prayer he learned for an examination."),
        ],
        [
          line("bhairav", "Prince — the Minister's clerk will want the book back before the meal. Forgive me."),
          say("He closes it on my fingers, gently, and takes it away. I remember the word “riders” more than once, and a winter's worth of dates, and none of them clearly."),
        ],
      ),
      choice("Bhairav is still hovering at my elbow, wiping his palms on his sash.", [
        {
          label: "“Who wrote “Meghadurg riders”? You, or someone who told you to?”",
          detail: "Watch his hands.",
          fx: all(sus(1), stat({ renown: 1 })),
          then: [
            line("bhairav", "I write what the Chancery sends me, prince. I am a pen. Pens are not asked their opinion."),
            say("His hands go into his sleeves and stay there."),
          ],
        },
        {
          label: "Thank him, and admire the neatness of the columns",
          detail: "A frightened man likes to be praised for the thing he is proud of.",
          fx: all(trust("bhairav", 1), sus(-1)),
          then: [
            line("bhairav", "My father ruled those lines. Forty years in this room. He said a crooked column was a lie told by a lazy man."),
            say("He almost smiles. Then he remembers what is in the columns and stops."),
          ],
        },
      ]),
    ],
  },

  // ───────────────────────────── 42 ─────────────────────────────
  {
    n: 42,
    id: "e042-bhairavs-strongbox",
    chapter: 5,
    title: "भैरव की तिजोरी · Bhairav's Strongbox",
    location: "treasury",
    objective: "Stay in the counting house while Bhairav is called away",
    cast: ["bhairav"],
    beats: [
      say("A runner at the door, out of breath: the king dines at noon, the silver plate must be counted out to the hall, and the Thakur must sign for every piece himself."),
      line("bhairav", "Every piece. As though I might pocket a spoon. Prince, I — you'll forgive me. Don't touch anything. I mean it kindly."),
      say("He sweeps his papers into a drawer and locks it. He glances at the iron box under the window, then at the abacus, then at me. Then he goes, and I hear his slippers slap all the way down the passage."),
      search(
        "The counting house, empty. The clerk behind the shelves has gone with him. I have perhaps as long as it takes a nervous man to count forty pieces of silver twice.",
        [
          {
            id: "abacus",
            label: "The abacus",
            required: true,
            reply: [
              say("A teak frame, twenty rods, the beads worn pale by his father's thumbs and then his. Every rod pushed home — except three, at the far right."),
              say("Nine beads on the first. One on the next. Six on the last. Bhairav clears his frame the way other men wash their hands. He cleared everything else before he left. Not these."),
            ],
          },
          {
            id: "box",
            label: "The iron strongbox",
            required: true,
            reply: [
              say("Bolted to the floor under the window. Old iron, newer lock: three brass dials, each marked nought to nine, stiff with use."),
              say("On the lid, a worn Lakshmi and the words “What is counted is kept.” The brass on the dials is bright where a thumb has turned them this morning."),
            ],
          },
          {
            id: "desk",
            label: "His desk",
            reply: [
              say("A half-eaten laddoo on a leaf. A letter folded small, in a child's round hand: “Baba, the parrot said your name again.” His seal, in a cup, as if he could not bear to keep it on his finger."),
            ],
          },
          {
            id: "door",
            label: "The door",
            reply: [
              say("No bolt on the inside. The passage is quiet. Somewhere below, silver rings on stone, and Bhairav's voice says “thirty-one, thirty-two” in a tone of great suffering."),
            ],
          },
        ],
        "A frightened man keeps the number he cannot forget where he can see it.",
      ),
      puzzle(
        {
          kind: "code",
          title: "The Strongbox",
          prompt: "Three brass dials. What would Bhairav set, every morning, without writing it down?",
          answer: "916",
          hint: "The three rods he did not clear: nine, one, six. Or think of a date — the ninth of Kartik, in the sixteenth year.",
        },
        [
          fx(set("secondLedger")),
          say("Nine. One. Six. The lock gives with a sound like a knuckle cracking."),
          say("The ninth of Kartik, in the sixteenth year. The day my mother died. He turns it every morning and every night. I don't know yet whether that is guilt or merely memory, and whether there is a difference in a treasurer."),
          say("Inside: a purse, a second seal, and a slim book bound in green cloth, its corners soft with handling. Not the book I was shown."),
        ],
        [
          fx(set("strongboxShut")),
          say("The dials will not give. I have turned them so often that my thumb is sore and they are no longer where he left them — which he will notice, being the kind of man who notices."),
          say("I set them back to nought and step away from the window."),
        ],
      ),
    ],
  },

  // ───────────────────────────── 43 ─────────────────────────────
  {
    n: 43,
    id: "e043-the-third-company",
    chapter: 5,
    title: "तीसरी टुकड़ी · The Third Company",
    location: "treasury",
    objective: "Read what Bhairav keeps under lock",
    cast: [],
    beats: [
      when(
        is("secondLedger"),
        [
          say("The green book is written in the same neat hand as the official one. The same ruled columns, his father's lines. It records money going out, where the other records money forgiven."),
          when(
            has("burned-remission"),
            [say("The remission dates are still in my mouth. Fourteen and twenty-two Kartik. Three and seventeen Margashirsha. Two and eleven Pausha. All the sixteenth year.")],
            [say("The official book is still on the reading desk where he left it. I don't need to read it carefully this time. Fourteen and twenty-two Kartik. Three and seventeen Margashirsha. Two and eleven Pausha. The burned villages. All the sixteenth year.")],
          ),
          puzzle(
            {
              kind: "ledger",
              title: "The Green Book",
              prompt:
                "Bhairav's private ledger. The six villages burned on 14 & 22 Kartik, 3 & 17 Margashirsha, 2 & 11 Pausha of the sixteenth year. Select the payments made “for clearing” on those same six dates — nothing else.",
              columns: ["Year", "Date", "Paid to", "Silver", "Entry"],
              rows: [
                ["16", "14 Kartik", "Third Company", "300", "For clearing"],
                ["16", "9 Kartik", "Third Company", "40", "Escort, western road"],
                ["16", "22 Kartik", "Third Company", "250", "For clearing"],
                ["16", "22 Kartik", "Third Company", "18", "Fodder and remounts"],
                ["16", "3 Margashirsha", "Third Company", "320", "For clearing"],
                ["16", "5 Margashirsha", "House of Jaswant", "500", "Advance against new lands"],
                ["16", "17 Margashirsha", "Third Company", "280", "For clearing"],
                ["16", "2 Pausha", "Third Company", "300", "For clearing"],
                ["16", "11 Pausha", "Third Company", "260", "For clearing"],
                ["16", "4 Magha", "Chancery", "90", "Couriers' wages, sealed post"],
              ],
              answer: [0, 2, 4, 6, 7, 8],
              hint: "Match each burning date to a payment “for clearing”. The twenty-second of Kartik has two entries; only one is for clearing.",
            },
            [
              fx(gain("soldiers-bounty")),
              say("Six payments. Six fires. The same days, to the day. Silver to the Senapati's Third Company, for clearing, on every date the remission book says Meghadurg's riders came."),
              say("There is no line that says what was cleared. There doesn't need to be. Kheri was cleared. Tilwara was cleared. They were cleared so thoroughly that the crown forgave them their tax."),
              say("And one more line I didn't look for. The ninth of Kartik: forty silver to the Third Company, for an escort on the western road. The day she died. The escort my father says died to a man at the ford."),
              say("Dead men are not usually paid."),
              choice("The green book is open in my hands. Bhairav will be back before the silver is counted twice.", [
                {
                  label: "Commit the page to memory, line by line",
                  detail: "Slow. Leaves no mark.",
                  fx: stat({ cunning: 1 }),
                  then: [say("I read it three times, the way Vidyadhar taught me to learn a verse: once for the sense, once for the sound, once with my eyes shut.")],
                },
                {
                  label: "Put it back exactly as it was and close the lid",
                  detail: "Be gone from the box when he comes in.",
                  fx: sus(-1),
                  then: [say("Book, purse, seal. Dials to nought. My heart is making more noise than the lock.")],
                },
              ]),
            ],
            [
              say("The columns swim. Too many dates, too much silver, and a clock in my head counting a frightened man's footsteps."),
              say("I know there is something here. Payments to the Third Company, more than once, that winter. I can't make them sit still long enough to be proof."),
              fx(set("ledgerHalfRead")),
            ],
          ),
        ],
        [
          say("The strongbox sits under the window, shut, with its Lakshmi and its motto. What is counted is kept."),
          choice("Whatever is inside, I have not earned it.", [
            {
              label: "Try the lid with a knife from his desk",
              detail: "Iron against iron. It will leave a scratch.",
              fx: sus(1),
              then: [
                say("The blade skids and leaves a bright line across the Lakshmi's face. The lid does not move."),
                say("I have made a mark and learned nothing. That is a kind of lesson."),
              ],
            },
            {
              label: "Leave it, and read the official ledger again instead",
              detail: "What is written openly is sometimes enough.",
              fx: stat({ cunning: 1 }),
              then: [
                say("Six fires, two a month, like rent. Whoever writes a lie that regular is not afraid of being asked about it. Or is very sure no one will ask."),
              ],
            },
          ]),
        ],
      ),
    ],
  },

  // ───────────────────────────── 44 ─────────────────────────────
  {
    n: 44,
    id: "e044-bhairav-returns",
    chapter: 5,
    title: "भैरव लौटता है · Bhairav Returns",
    location: "treasury",
    objective: "Face Thakur Bhairav when he comes back",
    cast: ["bhairav"],
    beats: [
      say("Slippers in the passage, quicker than they went. He comes in counting under his breath and stops counting."),
      when(
        is("secondLedger"),
        [
          say("He looks at the dials before he looks at me. They are at nought. He always leaves them at nought. He knows."),
          line("bhairav", "Ah. Ah, prince."),
          say("He sits down on his own stool as though his knees have been cut. His turban is crooked. Up close he smells of cardamom and sweat."),
          line("bhairav", "I have three daughters. The eldest is to be married in Phalgun. I tell you that not for pity. I tell you so you understand what I am weighing."),
        ],
        [
          say("He looks at the strongbox, then at the abacus, then at me, the same order as before."),
          line("bhairav", "You didn't touch anything. Good. Good."),
          say("He says it twice, the way you say a thing to make it true."),
        ],
      ),
      choice("Thakur Bhairav, Treasurer of Vajragarh, is waiting to learn what kind of prince I am.", [
        {
          label: "Tell him he belongs to you now",
          detail: "He will do what you say. He will never forgive it.",
          requires: hasAny("soldiers-bounty", "burned-remission"),
          lockedReason: "You have nothing to hold over him yet.",
          fx: all(stat({ ruthlessness: 2 }), trust("bhairav", -3), set("bhairavWay", "owned")),
          then: [
            say("I tell him what I read, and in which book. I tell him quietly. I have watched my father do this."),
            line("bhairav", "And what will you have of me, prince? Silver? Silence? A daughter?"),
            say("It is meant as a joke. Neither of us laughs. When I leave he is sitting very still with his hands flat on the desk, like a man holding down a lid."),
          ],
        },
        {
          label: "Swear you will not speak of his books",
          detail: "A promise to a frightened man. Keep it, and he may keep you.",
          fx: all(trust("bhairav", 2), set("bhairavWay", "sworn")),
          then: [
            line("bhairav", "Swear it on something. Not the wheel. Swear it on your mother."),
            say("I do. He closes his eyes."),
            line("bhairav", "The silver was sent down from the Chancery with the orders already written. I only signed. I tell myself that every morning, when I turn the dials."),
          ],
        },
        {
          label: "Tear the page out and walk past him",
          detail: "Proof in ink. The whole fortress will know by the afternoon bell that it is gone.",
          requires: has("soldiers-bounty"),
          lockedReason: "You haven't found the page that matters.",
          fx: all(gain("ledger-page"), sus(2), set("bhairavWay", "page")),
          then: [
            say("It comes away with a sound like cloth. His father's ruled lines, torn down the middle."),
            line("bhairav", "Prince, that is a treasury book. That is — they will ask me where it went."),
            say("Then he will have to decide what to tell them. I fold the page into my sash and do not run. Running is what guilty men do in corridors."),
          ],
        },
      ]),
    ],
  },

  // ───────────────────────────── 45 ─────────────────────────────
  {
    n: 45,
    id: "e045-the-noon-meal",
    chapter: 5,
    title: "दोपहर का भोजन · The Noon Meal",
    location: "hall",
    objective: "Go to the throne hall. The king dines with his sons.",
    cast: ["bhanusen", "ranadhir"],
    beats: [
      say("A low table on the dais, three cushions, the silver Bhairav counted laid out in rows. The hall is empty except for us and two servants with water jugs who do not exist."),
      say("My father breaks the bread himself and puts the first piece on my plate. He has not done that since I was small. Ranadhir, across from me, watches the bread and not me."),
      when(
        is("firstBell", "asked"),
        [line("bhanusen", "You asked a question in my court this morning. It was a good question. Eat. A man who asks questions should not do it hungry.")],
        [line("bhanusen", "Eat. It will be a long afternoon, and you have not eaten since the bell.")],
      ),
      when(
        is("dress", "plain"),
        [line("bhanusen", "You are dressed for a road. Or for a stable. Your mother used to wear a dark shawl to the kitchens so the cooks would forget who she was.")],
        [],
      ),
      say("Ranadhir reaches for the salt. His fingers — I notice his fingers, and then my father speaks, and I stop noticing anything."),
      line("bhanusen", "Have you visited the prisoner?"),
      say("Pleasantly. The way he would ask whether I had seen the new foals."),
      choice("My father is tearing a piece of bread into smaller and smaller pieces, waiting.", [
        {
          label: "“Yes. Twice.”",
          detail: "The truth. He probably knows it already.",
          fx: all(sus(1), stat({ renown: 1 }), set("toldKingTruth")),
          then: [
            line("bhanusen", "Twice. Good. A man should look at a thing before he ends it. What did she say to you?"),
            line("bhanusen", "No — don't tell me. Keep it. It will be the last thing anyone keeps of her."),
          ],
        },
        {
          label: "“No. I've been in the archive most of the morning.”",
          detail: "A lie to the king. It needs to be a good one. (Believed at Cunning 5)",
          fx: set("liedToKing"),
          then: [
            when(
              statAt("cunning", 5),
              [
                say("I say it the way I would say it if it were true — bored, a little put upon. I mention Vidyadhar's cough. Details make a lie heavier, and heavier things are believed."),
                line("bhanusen", "Vidyadhar. He taught your mother to read the old script. She was better at it than he was, he says. He's lying. She was much better."),
                say("He believes me. Or he wants me to think so. At this table they are the same thing."),
              ],
              [
                fx(sus(2)),
                line("bhanusen", "You have your mother's face when you lie. It goes perfectly still, as though it has been painted on."),
                say("He eats a piece of bread. He does not say anything else about it, which is worse than if he had."),
              ],
            ),
          ],
        },
        {
          label: "Say nothing",
          detail: "Let the silence sit.",
          fx: all(sus(-1), set("ranadhirCovered")),
          then: [
            say("I open my mouth and nothing is in it."),
            line("ranadhir", "He was at the stables. He likes horses, Father. He always has. He'd rather talk to a horse than to a Minister."),
            line("bhanusen", "So would I. Horses are honest about what they want."),
            say("Ranadhir goes back to his plate. He did not look at me when he said it. He didn't need to. He knew exactly where I had been."),
          ],
        },
      ]),
      line("bhanusen", "Your mother would have eaten nothing today. She never ate before a hard thing. She said it made her kinder, being hungry. I never saw the sense in it."),
      choice("He turns his cup a quarter-turn on the cloth. “Tell me, Arunveer. Do you think the courier is guilty?”", [
        {
          label: "“I think she was riding east.”",
          detail: "Say what you know. Not what it means.",
          requires: hasAny("chaya-said-east", "new-horseshoes"),
          lockedReason: "You don't know that for certain.",
          fx: all(sus(1), stat({ renown: 1 })),
          then: [
            line("bhanusen", "East. Then she was coming back for more. It is a strange spy who comes home, but I have known stranger."),
            say("Across the table, Ranadhir sets down his cup very carefully, as though it has become full."),
          ],
        },
        {
          label: "“I think it is for the court to say.”",
          detail: "The answer a careful son gives.",
          fx: sus(-1),
          then: [
            line("bhanusen", "The court will say what the court is told. You are learning. I'm not sure I like it."),
          ],
        },
        {
          label: "“I think it doesn't matter to you whether she is.”",
          detail: "True, perhaps. Dangerous, certainly.",
          fx: all(sus(2), stat({ renown: 1, ruthlessness: 1 })),
          then: [
            say("For a moment the only sound is the servant's jug, not pouring."),
            line("bhanusen", "No. It doesn't. I am glad one of my sons has understood something today."),
          ],
        },
      ]),
    ],
  },

  // ───────────────────────────── 46 ─────────────────────────────
  {
    n: 46,
    id: "e046-the-kings-story",
    chapter: 5,
    title: "राजा की कथा · The King's Story",
    location: "hall",
    objective: "Hear the king speak of the queen",
    cast: ["bhanusen", "ranadhir"],
    beats: [
      say("The servants take the plates. My father does not rise. He wipes his fingers one at a time on a cloth, and then he tells us how our mother died, as though we might not have heard."),
      line("bhanusen", "You were fourteen. You had the fever. Ranadhir was old enough to stand beside me. I have never told it to you properly, Arunveer. Today seems the day."),
      when(
        has("closed-pyre"),
        [
          puzzle(
            {
              kind: "testimony",
              title: "The King's Account",
              witness: "bhanusen",
              prompt:
                "My father tells the story of the western road. He is not on trial. Nobody in this hall has ever questioned him. If I present anything, I am doing it at his own table.",
              statements: [
                {
                  text: "Riders came out of the tree line at the ford. Twenty of them, perhaps more, in Meghadurg grey.",
                  press: "“Ugrasen's men counted the hoofprints afterward. Twenty-two. I remember the number because I had it cut into a stone, and then I had the stone broken.”",
                },
                {
                  text: "Her escort died where they stood. Brave men. I pension their widows still.",
                  press: "“Bhairav sends the silver every Kartik. Ask him, if you like. You seem to be asking everyone everything today.”",
                },
                {
                  text: "They brought her to me before the night was out. I held her one last time before the pyre.",
                  press: "“She was cold. I remember that. The road is cold in Kartik.”",
                  breaks: "closed-pyre",
                },
                {
                  text: "I lit the pyre with my own hand. A husband's duty. Your brother stood beside me.",
                  press: "Ranadhir, without looking up: “I stood beside him.”",
                },
              ],
              hint: "Sumitra told you who was allowed to see the queen's face before the fire.",
            },
            [
              fx(set("kingStory", "pressed"), sus(3), stat({ renown: 1 })),
              say("I tell him what Sumitra told me. That the body came wrapped. That the pyre was lit closed, by his order, before anyone saw her face. That a man cannot hold one last time what he would not let his own servants look at."),
              say("His face does not change. I had imagined it would. I had imagined, for six years, some version of this, and in all of them his face changed."),
              line("bhanusen", "Your mother was soft, and it killed her."),
              say("That is all. He does not say which part of the story was untrue. He does not say that any of it was."),
              line("ranadhir", "Father. The Rani of Sonkot has been waiting since the bell. She'll take it as an insult."),
              line("bhanusen", "Let her. No — you're right. You are usually right."),
              say("He stands. The cloth stays on the table, folded in four. Ranadhir does not look at me as he follows. He has saved me from something, or from someone, and he wants me to know it wasn't a kindness."),
            ],
            [
              fx(set("kingStory", "silent")),
              say("I let it go by. All of it. The riders, the widows, the pyre. I sit and nod as though I am hearing a hymn."),
              line("bhanusen", "There. Now you know. Now you will have something to think of at sunset."),
            ],
          ),
        ],
        [
          line("bhanusen", "Riders out of the trees at the ford. Her escort cut down where they stood. They brought her to me before the night was out, and I held her one last time, and I lit her pyre with my own hand."),
          say("It is a good story. It has been told so often that it has worn smooth, like a stair."),
          choice("He is watching me to see what I will do with it.", [
            {
              label: "Ask him why he never let anyone see her",
              detail: "A guess. You have no proof, only an unease.",
              fx: all(sus(2), set("kingStory", "silent")),
              then: [
                line("bhanusen", "Because I loved her, and I would not have her looked at. Is that so strange? You'll understand when you have a wife. Or perhaps you won't."),
              ],
            },
            {
              label: "Thank him for telling it",
              detail: "Bow your head. Keep your questions for someone who will answer them.",
              fx: all(sus(-1), set("kingStory", "silent")),
              then: [line("bhanusen", "Don't thank me. It isn't a gift.")],
            },
          ]),
        ],
      ),
    ],
  },

  // ───────────────────────────── 47 ─────────────────────────────
  {
    n: 47,
    id: "e047-after-the-meal",
    chapter: 5,
    title: "भोजन के बाद · After the Meal",
    location: "courtyard",
    objective: "Leave the hall by the colonnade",
    cast: ["ranadhir"],
    beats: [
      say("The colonnade is white with noon. Pigeons in the carved eaves, a water-carrier asleep against a pillar. I have gone ten paces from the hall doors when a hand closes on my arm above the elbow, hard enough to bruise."),
      line("ranadhir", "Are you trying to die? Is that it? Is it a thing you've decided, and nobody told me?"),
      talk(
        "ranadhir",
        "He has pulled me behind a pillar. Up close, in daylight, he looks as though he hasn't slept. His voice is very low and very even, which is how he sounds when he is most angry.",
        [
          {
            id: "fingers",
            label: "His fingers",
            required: true,
            reply: [
              say("I look down at the hand on my arm. The first two fingers of his writing hand are stained — not the soot-black of the Chancery, which every clerk in the fortress wears. Blue-green. Like river water over stone."),
              fx(gain("ranadhir-ink")),
              say("He sees me see it. He lets go of my arm and puts both hands behind his back, like a boy at lessons."),
              line("ranadhir", "Don't look at me like that. It's ink. Princes write things. Perhaps you've heard."),
            ],
          },
          {
            id: "covered",
            label: "“You covered for me.”",
            requires: is("ranadhirCovered"),
            reply: [
              line("ranadhir", "I stopped you making a fool of us both at Father's table. Don't dress it up."),
              line("ranadhir", "Next time you open your mouth and nothing comes out, I will let him watch."),
            ],
          },
          {
            id: "rescued",
            label: "“You stopped him. At the table.”",
            requires: is("kingStory", "pressed"),
            reply: [
              line("ranadhir", "I stopped you. You accused the king of lying about his wife's death, at his own table, on the day he's handing you his sword."),
              line("ranadhir", "Do you know what he does with men who ask him that? He doesn't do anything. He simply stops seeing them. And then one day they're gone, and nobody can remember when."),
            ],
          },
          {
            id: "lied",
            label: "“He knew I lied, didn't he.”",
            requires: is("liedToKing"),
            reply: [
              line("ranadhir", "He knows everything. It's never the question whether he knows. It's the question whether he's decided to mind."),
            ],
          },
          {
            id: "nilkanth",
            label: "“Nilkanth.”",
            requires: has("nilkanth"),
            reply: [
              say("He goes still. Not the stillness of someone surprised — the stillness of someone who has been waiting for a blow and is making sure not to flinch when it lands."),
              line("ranadhir", "A lullaby. Grow up."),
              say("He says it the way you would slap a sleepwalker. Kindly, almost."),
            ],
          },
          {
            id: "why",
            label: "“Why do you care what happens to me?”",
            reply: [
              line("ranadhir", "Because if you disgrace yourself, you disgrace the house, and the house is going to be mine."),
              say("It is a good answer. It is exactly the answer he would give. I don't know why I don't believe it."),
            ],
          },
        ],
        "A clerk comes round the pillar with an armful of scrolls, sees us, and goes back the way he came. Ranadhir straightens his sleeve. “Do what he asks,” he says. “For once in your life, do the easy thing.” Then he walks away without hurrying.",
      ),
    ],
  },

  // ───────────────────────────── 48 ─────────────────────────────
  {
    n: 48,
    id: "e048-river-ink",
    chapter: 5,
    title: "नदी की स्याही · River Ink",
    location: "archive",
    objective: "Take what you have to Vidyadhar in the archive",
    cast: ["vidyadhar"],
    beats: [
      say("Vidyadhar is at the south window, where the light is best, with a lens the size of a coin screwed into one eye. He hears me on the stair and says my name before I have reached the top. He always has."),
      when(
        hasAny("ash-fragment", "cipher-lines"),
        [
          line("vidyadhar", "You've brought me something that smells of smoke. Give it here. Gently — ash is only paper that has given up."),
          say("He tilts the burned scrap to the window and turns it until the light runs along the strokes. Then he does something I have never seen him do: he wets a fingertip, touches the edge of a letter, and tastes it."),
          line("vidyadhar", "Blue-green. You can't see it for the scorch, but it is. River ink. They press it from a reed that grows only on the far bank — the Meghadurg bank. It is bitter. It never quite dries."),
        ],
        [
          line("vidyadhar", "The Minister's clerk brought me a burned scrap this morning to put a name to. He didn't say where it came from. He didn't have to; it stank of the Chancery brazier."),
          line("vidyadhar", "River ink, I told him. Blue-green, pressed from the reed that grows only on the Meghadurg bank. He wrote it down and went away pale."),
        ],
      ),
      fx(gain("river-ink")),
      line("vidyadhar", "Nobody at this court writes in it. Nobody should be able to get it. Your mother used it, once, for a year, when she was learning their script. She said the colour made her homesick for a place she had never been."),
      say("I sit on the stool I sat on at seven. It is lower than I remember."),
      puzzle(
        {
          kind: "deduce",
          title: "Two Colours",
          prompt: "Two things I have seen today, the same colour. I don't want to put them together. Put them together.",
          slots: [
            { q: "What ink was the letter to Nilkanth written in?", answer: "river-ink" },
            { q: "Whose fingers carried that ink today?", answer: "ranadhir-ink" },
          ],
          hint: "Vidyadhar named the ink. You saw its colour again at noon, on a hand at the king's table.",
        },
        [
          fx(set("inkMatched"), stat({ cunning: 1 })),
          say("Blue-green on the ash. Blue-green on my brother's writing hand, at our father's table, an hour ago."),
          say("It proves nothing. A man can stain his fingers any number of ways. I say that to myself several times, and each time it weighs a little less."),
          line("vidyadhar", "You've gone quiet. You went quiet like that when you were small and had worked out a sum before I'd finished writing it. You never liked the answers you got that way."),
        ],
        [
          say("I don't do it. I sit with both things in my hands and I don't let them touch."),
          line("vidyadhar", "Whatever it is, prince, it will still be there when you're ready to look at it. Ink is patient."),
        ],
      ),
      choice("Vidyadhar is waiting, his lens still in his eye, the ash on the sill between us.", [
        {
          label: "Tell him what you saw at the table",
          detail: "He taught you letters. He may teach you this.",
          fx: trust("vidyadhar", 1),
          then: [
            say("I tell him. He takes the lens out of his eye and polishes it for a long time on his sleeve."),
            line("vidyadhar", "Your brother came to me once, at twelve, and asked me to teach him the river script. I refused. He never asked again. I have always wondered who taught him instead."),
          ],
        },
        {
          label: "Say nothing and take the ash back",
          detail: "Some things you do not say aloud even in the archive.",
          fx: sus(-1),
          then: [line("vidyadhar", "Good. Walls in this fortress have been listening since before I was born. Go carefully.")],
        },
      ]),
    ],
  },

  // ───────────────────────────── 49 ─────────────────────────────
  {
    n: 49,
    id: "e049-ranadhirs-rooms",
    chapter: 5,
    title: "रणधीर के कक्ष · Ranadhir's Rooms",
    location: "ranadhir",
    objective: "Go to the west wing while your brother is with the Rani",
    cast: [],
    beats: [
      say("The west wing is quieter than ours. Ranadhir's door is not locked. It has never been locked; he says a man with a lock on his door is a man with something to hide, and says it loudly, so that everyone knows he has nothing."),
      say("His steward is at the far end of the passage, arguing with a washerwoman about starch. I have as long as that argument lasts."),
      search(
        "His rooms are neat the way a barracks is neat. A bed made hard. A rack of swords. Everything square to everything else, as though he expected to be inspected.",
        [
          {
            id: "table",
            label: "The table by the bed",
            required: true,
            reply: [
              say("A comb. A razor. A small stoppered bottle of dark glass. I know what it is before I lift the stopper, because I have smelled it on him since he was fifteen and I was nine and he let me borrow his horse."),
              say("Sandalwood. Pure, not temple smoke. The bottle is a third empty. Some of it is on my fingers now."),
              fx(set("sawOil")),
            ],
          },
          {
            id: "hook",
            label: "The belt hook by the door",
            required: true,
            reply: [
              say("His ceremonial belt, and on it, in a velvet sheath, the heir's token. A bronze wheel on a chain. It opens every lower cell without a question asked."),
              say("There are three such tokens in Vajragarh. My father's. The Minister's. This one. I have always known that. I have never before needed to count them."),
              fx(gain("king-token")),
            ],
          },
          {
            id: "writing",
            label: "The writing box",
            required: true,
            reply: [
              say("Reed pens, cut fine. Chancery-black ink in a horn. Sealing wax. No brass wheel — I lift the tray to be sure, and there is nothing beneath it but a folded list of horses."),
              say("And pushed to the back, a small clay pot, its lid crusted shut. When I crack it the inside is dried and cracked like a riverbed. Blue-green."),
              fx(set("sawInk")),
            ],
          },
          {
            id: "window",
            label: "The window",
            reply: [
              say("It faces west. Of course it does. From here you can see the dungeon roof, the gate, and the whole of the western road running down into the haze, pale as a parting in hair."),
              say("On the sill, a wooden horse with three legs. I carved it when I was eight and gave it to him and he laughed at it. He has kept it on his sill for twelve years."),
            ],
          },
          {
            id: "bed",
            label: "Under the bed",
            reply: [
              say("Boots. A second pair of boots, still muddy — the red mud of the lower stair, not the yard. He wore them last night and did not give them to be cleaned."),
            ],
          },
        ],
        "Down the passage, the argument about starch is ending. The washerwoman is winning.",
      ),
      choice("The ink pot is still in my hand.", [
        {
          label: "Put everything back exactly as it was",
          detail: "Leave the room as if no one had been in it.",
          fx: sus(-1),
          then: [
            say("Pot to the back of the box. Stopper in the bottle. The horse turned the way it was, with the broken leg to the wall. I close the door the way I found it, not quite shut."),
          ],
        },
        {
          label: "Take the ink pot",
          detail: "Something to show, if it comes to showing. He will know it's gone.",
          fx: all(set("tookInk"), sus(1)),
          then: [
            say("It goes into my sash beside everything else I am carrying today. It weighs almost nothing."),
            say("At the end of the passage the steward turns and sees me come out of the door. He bows. He will tell my brother before the bell. I bow back, because what else is there to do."),
          ],
        },
      ]),
    ],
  },

  // ───────────────────────────── 50 ─────────────────────────────
  {
    n: 50,
    id: "e050-two-kinds-of-smoke",
    chapter: 5,
    title: "दो प्रकार का धुआँ · Two Kinds of Smoke",
    location: "temple",
    objective: "Go to the temple and clear your head",
    cast: ["devashrava"],
    beats: [
      say("The temple is thick with smoke, the way it was this morning. The sword's stand is ready before the image, empty. A boy is sweeping the steps with a broom taller than he is."),
      say("I came here to stop thinking. Instead I breathe in, and the smoke gets into the back of my throat, and I put my hand to my face, and my fingers still smell of my brother's bottle."),
      talk(
        "devashrava",
        "Devashrava is feeding the fire with chips from a basket, a pinch at a time. He looks up when I come in and then looks down very quickly, as though I were a debt.",
        [
          {
            id: "smoke",
            label: "“What do you burn here?”",
            required: true,
            reply: [
              line("devashrava", "Sandalwood chips, and agar resin to carry them. Always both. The resin is what you smell — sweet, dark. The sandal on its own would hardly rise."),
              say("I hold out my hand to him. He leans over it, courteously, the way he would bless it, and sniffs."),
              line("devashrava", "That isn't from here. That's oil. Pressed, pure. Nobody burns it — it's worn. There is only one man at court who wears it, and he has worn it since he was a boy."),
              fx(gain("sandal-oil")),
            ],
          },
          {
            id: "karan",
            label: "“Would a gaoler know the difference?”",
            requires: has("dungeon-visitor"),
            reply: [
              line("devashrava", "Karan? He's been down that stair so long he can smell rain on the far side of the mountain. He knows smoke from oil. Everyone who has ever stood in this temple does."),
            ],
          },
          {
            id: "sword",
            label: "“Is the blessing ready?”",
            reply: [
              line("devashrava", "The words are ready. The words are always ready, prince. It is the priest who is not."),
              when(
                is("priestTold"),
                [line("devashrava", "You know why. You made me say it this morning. I have been saying it to myself since.")],
                [],
              ),
            ],
          },
        ],
        "The boy has finished the steps and started on them again. The priest goes back to the fire.",
      ),
      puzzle(
        {
          kind: "deduce",
          title: "The Last Watch",
          prompt: "Someone came down the dungeon stair at the last watch, sent the gaoler away, and opened cell three. I lay out what I know as if it concerned a stranger.",
          slots: [
            { q: "What let him past the gaoler without a question?", answer: "king-token" },
            { q: "What did the gaoler smell on him?", answer: ["sandal-oil", "dungeon-visitor"] },
            { q: "How did he open the cell?", answer: ["missing-key", "dungeon-visitor"] },
          ],
          hint: "Three tokens open the lower cells. One of their bearers wears pure sandalwood oil, not temple smoke. And the key was gone from Karan's ring for an hour.",
        },
        [
          fx(set("suspectsBrother"), stat({ cunning: 1 })),
          say("A token only three men carry. An oil only one man wears. A key taken and put back by someone who knew the stair in the dark."),
          say("The balcony. The ink. The boots with the red mud of the lower stair."),
          say("I try the other two names. My father, who has never in his life gone down a stair himself when he could send a man. Kaushal, who smells of ink and nothing else. It keeps coming back to the same place, like water finding the lowest point of a floor."),
          say("My brother went down to her cell at the last watch. I don't know what he did there. I don't know which side of any door he is on. I am standing in a temple and I cannot remember a single prayer."),
        ],
        [
          fx(set("refusedConclusion")),
          say("I don't finish it. I stand in the smoke and let the pieces lie where they are, not touching."),
          say("It is not because I can't see the shape. It is because I can."),
        ],
      ),
      choice("Devashrava is watching me over the fire.", [
        {
          label: "Ask him to pray for your brother",
          detail: "Without saying why.",
          fx: trust("devashrava", 1),
          then: [
            line("devashrava", "I pray for both of you every morning. Your mother asked me to, before — before. I have never missed a day."),
            say("He says it as though it has cost him something to tell me. Perhaps it has."),
          ],
        },
        {
          label: "Wash your hands in the temple basin and go",
          detail: "Get the smell off. It won't help.",
          fx: sus(-1),
          then: [say("The water is cold and smells of marigolds. My fingers still smell of him when I reach the courtyard.")],
        },
      ]),
    ],
  },
];

