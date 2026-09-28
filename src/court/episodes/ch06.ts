import { all, choice, coin, fx, gain, has, hasAny, is, line, or, puzzle, say, search, set, stat, statAt, supply, sus, talk, trust, trusts, when } from "../dsl";
import type { CharId, Cond, CourtState, Episode } from "../types";

/**
 * Chapter 6 — सेना और प्राचीर · The Barracks & the Walls (early afternoon).
 *
 * Flags set here: ugrasenSpeaks (e52), lostWatcher true|false (e54),
 * padmavatiDeal (e59). Local flags: bholaWay, ugrasenWay, walls, deskWay,
 * stewardOrdered, exileDecided, sunsetPlan, afternoonPlace, alliesAtBell.
 */

const ALLY_IDS: CharId[] = ["padmavati", "ugrasen", "devashrava", "bhairav", "vikram", "jaswant", "vidyadhar", "sumitra", "nandini"];
const allyCount = (s: CourtState) => ALLY_IDS.filter((id) => (s.trust[id] ?? 0) >= 2).length;
const alliesAt =
  (n: number): Cond =>
  (s) =>
    allyCount(s) >= n;

const HALL: CharId[] = ["bhanusen", "kaushal", "chaya", "ranadhir", "jaswant", "padmavati", "bhairav", "ugrasen", "devashrava", "vikram"];

export const CHAPTER_6: Episode[] = [
  // ───────────────────────────── 51 ─────────────────────────────
  {
    n: 51,
    id: "e051-the-third-company",
    chapter: 6,
    title: "तीसरी टुकड़ी · The Third Company",
    location: "barracks",
    objective: "Find the old soldiers of the Third Company in the barracks",
    cast: ["bhola"],
    beats: [
      say("The barracks yard is empty at this hour. The men who are not on the walls are asleep, or pretending to be. The sun sits directly on the practice sand and nobody is fool enough to stand on it."),
      say("In the shade of the armoury wall an old soldier sits on an upturned bucket with a clay cup and a jar of arrack between his feet. Grey beard, a Third Company badge sewn on crooked, the look of a man who has been drinking since the noon gong and intends to keep at it."),
      when(
        hasAny("soldiers-bounty", "ledger-page"),
        [say("The Third Company. Paid “for clearing,” on six dates, in Bhairav's careful hand. I did not come here by accident.")],
        [say("Ugrasen's old company. Everyone at court knows the name; no one at court says what it did. I did not come here by accident either.")],
      ),
      line("bhola", "A prince. In the barracks. At noon. Either somebody's died or somebody's going to. Sit, sit — no, not the bucket, that's mine. The step. Princes like steps."),
      talk(
        "bhola",
        "His name is Bhola. He tells me so twice, and then asks mine, and then laughs at himself for asking.",
        [
          {
            id: "company",
            label: "“You were Third Company?”",
            required: true,
            reply: [
              line("bhola", "Thirty-one years. Rode with the Senapati when he was only a captain and still had all his teeth. We were the best company in the hills. Then we were the quiet company. Then we were a badge on old men."),
              say("He picks at the crooked stitches on his shoulder as if they itch."),
            ],
          },
          {
            id: "winter",
            label: "“The winter my mother died.”",
            required: true,
            reply: [
              say("His cup stops halfway to his mouth, and stays there."),
              line("bhola", "Bad winter. Cold. We were out a lot. Hunting riders. That's what we were told to say, and that's what I say."),
              say("He drinks. He does not look at me while he does it, and I understand that he has said this sentence many times, and that it has never once gone down easily."),
            ],
          },
          {
            id: "bounty",
            label: "Show: Payment for Clearing",
            requires: hasAny("soldiers-bounty", "ledger-page"),
            reply: [
              line("bhola", "Clearing. Ha. That's a treasurer's word. Soldiers didn't call it that."),
              line("bhola", "Silver came to every man, you know. Two extra months. My wife bought a buffalo with it. Good buffalo. Died last year. I was glad."),
            ],
          },
          {
            id: "ugrasen",
            label: "“What sort of man is the Senapati?”",
            reply: [
              line("bhola", "The kind that goes first. Always. Into water, into fire. Into anything. He went first that winter too. I'll say that for him. I'll always say that."),
            ],
          },
        ],
        "He fills his cup to the brim and looks into it the way a man looks down a well.",
      ),
      choice("He is close to it. Something is sitting just behind his teeth.", [
        {
          label: "Pour him another, and one for yourself",
          detail: "A coin to the barracks cook for a fresh jar.",
          requires: coin(1),
          lockedReason: "You have no coin left to spend.",
          fx: all(supply({ coin: -1 }), set("bholaWay", "drink"), gain("soldier-confession")),
          then: [
            say("The cook brings the new jar without being asked twice. Bhola watches me drink from it, and something in him loosens when I don't cough."),
            line("bhola", "No marks on us. That was the order. Grey cloaks, no badges, horses from the remount lines with the brands rubbed over with ash."),
            line("bhola", "And we were to shout. In the river talk. Meghadurg words, so anyone who lived would say it was them. The captain taught us the words himself. I still know them. I say them in my sleep, my wife says."),
          ],
        },
        {
          label: "Say nothing. Sit with him in the shade",
          detail: "Let the silence do the asking.",
          fx: all(stat({ cunning: 1 }), set("bholaWay", "waited"), gain("soldier-confession")),
          then: [
            say("I sit on the step. A kite turns over the yard. He fills his cup again and forgets to drink it."),
            line("bhola", "Unmarked cloaks. Grey. And the Senapati said, when you ride in, you shout in the river dialect. So they hear Meghadurg. So they tell it that way, the ones that tell anything."),
            line("bhola", "There weren't many that told anything."),
          ],
        },
        {
          label: "“You will tell me, soldier. That is an order.”",
          detail: "He has obeyed orders all his life. It is how this happened.",
          fx: all(stat({ ruthlessness: 1 }), sus(1), set("bholaWay", "ordered"), gain("soldier-confession")),
          then: [
            say("He stands, because he was taught to stand. The cup goes over in the dust."),
            line("bhola", "Yes, prince. We rode out in unmarked cloaks, prince. We were ordered to shout in the river dialect while we did it, prince. Is there anything else, prince."),
            say("There is not. He stands at attention until I leave the yard, and a boy on the wall sees him doing it, and will remember."),
          ],
        },
      ]),
      say("Six villages. Kheri, Dhanpur, Sirsa Ghat. Umri, Palasbani, Tilwara. The riders who burned them spoke Meghadurg, and slept afterwards in the barracks of Vajragarh."),
    ],
  },

  // ───────────────────────────── 52 ─────────────────────────────
  {
    n: 52,
    id: "e052-the-senapatis-shame",
    chapter: 6,
    title: "सेनापति की लज्जा · The Senapati's Shame",
    location: "barracks",
    objective: "Find Senapati Ugrasen in the armoury",
    cast: ["ugrasen"],
    beats: [
      say("Ugrasen is in the armoury where I left him this morning. The king's sword lies across his knees on an oiled cloth, finished. He has nothing left to do to it and is doing it anyway."),
      when(
        is("swordLesson", "learned"),
        [line("ugrasen", "Prince. Come to practise the stroke again? Your wrist was good this morning. Better than your brother's at your age. Don't tell him.")],
        [line("ugrasen", "Prince. You wouldn't touch it this morning. You're welcome to go on not touching it. It's sharp enough without you.")],
      ),
      say("Then he sees my face, and he sets the whetstone down on the bench, very carefully, the way one sets down something that might go off."),
      when(
        hasAny("soldier-confession", "soldiers-bounty", "ledger-page"),
        [
          talk(
            "ugrasen",
            "He does not ask what I want. He waits for me to say it. He is a soldier; he knows the sound of a man walking up to the line.",
            [
              {
                id: "bhola",
                label: "Show: Bhola's Story",
                requires: has("soldier-confession"),
                reply: [
                  line("ugrasen", "Bhola. He drinks because of it. I don't, because of it. We've each chosen our way of carrying it, and his is louder."),
                  line("ugrasen", "Don't punish him for talking. He's been waiting six years for someone to ask."),
                ],
              },
              {
                id: "bounty",
                label: "Show: Payment for Clearing",
                requires: hasAny("soldiers-bounty", "ledger-page"),
                reply: [
                  line("ugrasen", "Bhairav writes everything down. His father did. They think if it's in a column it's been forgiven."),
                  when(has("ledger-page"), [say("I hold the torn page where he can see it. He does not reach for it. He reads it from where he sits, all of it, as though it were a list of the dead. It is.")]),
                ],
              },
              {
                id: "admit",
                label: "“Did you burn them?”",
                required: true,
                reply: [
                  say("For a long moment the only sound is the oil ticking in the lamp."),
                  line("ugrasen", "I burned them. On your father's order. The riders your mother supposedly died to avenge were mine."),
                  fx(gain("ugrasen-guilt")),
                  say("Supposedly. He did not mean to say that word. I watch him hear himself say it, and decide not to take it back."),
                ],
              },
              {
                id: "why",
                label: "“Why?”",
                required: true,
                reply: [
                  line("ugrasen", "A queen was dead on the western road. The court wanted riders. The king wanted a war he could call just, when he was ready for one. And those six villages sat on land a certain hill lord had wanted for twenty years."),
                  line("ugrasen", "I was told it would be quick. It was. That's the worst thing I can say about it."),
                ],
              },
              {
                id: "test",
                label: "“And now he wants me to learn to do the same.”",
                requires: has("king-test"),
                reply: [
                  line("ugrasen", "Yes. That's what the test is. Not the woman. Whether you'll do a thing because he said it. I passed it, twenty-two years ago, and again six years ago, and look at me."),
                ],
              },
            ],
            "He wipes the sword once more, from the guard to the point, and lays the cloth over it like a sheet over a face.",
          ),
          choice("The Senapati of Vajragarh sits in front of me with his confession in the air between us, and waits to be told what it will cost him.", [
            {
              label: "“Say it at sunset. In the hall, where it counts.”",
              detail: "Ask him to stand up in court.",
              requires: or(trusts("ugrasen", 1), is("swordLesson", "learned")),
              lockedReason: "He does not trust you enough to stake his neck on you.",
              fx: all(set("ugrasenSpeaks", true), set("ugrasenWay", "speak"), trust("ugrasen", 1)),
              then: [
                say("He looks at the sword for a long time."),
                line("ugrasen", "If it comes to it. If you stand up first, and if it will save her and not just shame me. I won't throw away the army's good name for a speech. But if it will turn the thing — I'll stand."),
                line("ugrasen", "I've gone first into everything else. I suppose I can go second into this."),
              ],
            },
            {
              label: "“I will not say your name.”",
              detail: "Promise silence. He has carried it long enough without your help.",
              fx: all(set("ugrasenWay", "silence"), trust("ugrasen", 2)),
              then: [
                say("He nods, once, and does not thank me. I think a thank-you would have been too much like being forgiven."),
                line("ugrasen", "Then here is something for nothing. Whatever your father tells you at sunset, he's already decided it. He doesn't hand out his own sword to see what happens. He knows what happens."),
              ],
            },
            {
              label: "“Speak for her at sunset, or I will speak about you.”",
              detail: "A threat. He has faced worse, but not from a child he taught to hold a spear.",
              fx: all(set("ugrasenWay", "threat"), trust("ugrasen", -3), sus(1), stat({ ruthlessness: 1 })),
              then: [
                say("He stands. He is taller than I remember, and I remember him as very tall."),
                line("ugrasen", "Then speak, prince. See who believes the second son over the Senapati on the day his father has chosen to test him. Go on. I'll wait."),
                say("He sits down again and picks up the whetstone. The interview is over. I have made an enemy of the one man in this fortress who knew how to go first."),
              ],
            },
          ]),
        ],
        [
          line("ugrasen", "You've a question in you. Ask it or don't. I've a sword to finish."),
          choice("I have nothing to put in front of him but a suspicion.", [
            {
              label: "“The burned villages.”",
              fx: all(trust("ugrasen", -1), sus(1)),
              then: [line("ugrasen", "I told you this morning. Don't. I'll tell you once more, because I liked your mother. Don't.")],
            },
            {
              label: "Leave him to the sword",
              fx: sus(-1),
              then: [say("He does not watch me go. The whetstone starts again before I reach the door.")],
            },
          ]),
        ],
      ),
    ],
  },

  // ───────────────────────────── 53 ─────────────────────────────
  {
    n: 53,
    id: "e053-the-walls",
    chapter: 6,
    title: "प्राचीर · The Walls",
    location: "walls",
    objective: "Climb to the western rampart",
    cast: ["nandini"],
    beats: [
      say("The western rampart is the highest place in Vajragarh that a prince may stand without asking. The wind up here never stops. It smells of iron, and of snow that has not fallen yet."),
      say("Below, the western road goes down the mountain in switchbacks, pale as a scar, and loses itself in the haze where the river is. Beyond the river there is Meghadurg. You cannot see it. Everyone looks anyway."),
      when(
        has("soldier-confession"),
        [say("Somewhere down there, below the third bend, are six places where villages used to be. From this height they look like nothing. Green, grown over. That was the point.")],
        [say("Somewhere below the third bend there were villages once. Now there are fields, and they belong to Rao Jaswant.")],
      ),
      say("Nandini comes up the stair two at a time, holding her scarf against the wind, and stops beside me and pretends to look at the view. She is breathing hard, and she is trying not to."),
      line("nandini", "Prince. There's a man going round the servants. Polite. Chancery grey. Asking where you've been since first bell. The laundry, the kitchens, the lamp boys. He's asking everybody."),
      when(
        or(is("brazier", "interrupted"), is("kingStory", "pressed")),
        [line("nandini", "He had a list. He knew about the Chancery this morning already. He wanted the rest.")],
        [line("nandini", "He doesn't know much yet. He wanted to. He had a very clean list and not much on it.")],
      ),
      talk(
        "nandini",
        "The wind takes half of what she says and I have to lean close for the rest.",
        [
          {
            id: "told",
            label: "“What did they tell him?”",
            required: true,
            reply: [
              line("nandini", "The laundry told him you'd changed your clothes, which you haven't. The kitchen told him nothing, because Sumitra was standing there. The lamp boys told him everything, because he gave them a copper each."),
              line("nandini", "I'll talk to the lamp boys."),
            ],
          },
          {
            id: "you",
            label: "“Did he ask you?”",
            reply: [
              line("nandini", "He asked me first. I told him you'd been in your rooms all morning with a headache and a book of verses. He wrote it down. He didn't believe it. He wrote it down anyway."),
            ],
          },
          {
            id: "road",
            label: "“Look at the road, Nandini.”",
            reply: [
              say("She looks. I don't know why I asked her to."),
              line("nandini", "It's a long road. I've never been down it. My mother says nobody who goes down it comes back the same."),
            ],
          },
        ],
      ),
      choice("The wind drags at my sleeves. Below me the whole western road lies in the sun, going away.", [
        {
          label: "Go on. There is not enough day left to hide in",
          detail: "Keep moving; let them count.",
          fx: all(set("walls", "on"), stat({ renown: 1 })),
          then: [
            line("nandini", "Then go fast. And don't go anywhere twice."),
            say("It is good advice. I think she has been giving it to herself for years."),
          ],
        },
        {
          label: "Lie low a while. Let the questions go cold",
          detail: "Stand on the wall like a bored prince until the bell.",
          fx: all(set("walls", "low"), sus(-1)),
          then: [
            say("I stand at the parapet and look at the view like a man with a headache and a book of verses. A guard passes twice. The second time he nods to me as though I were furniture. Good."),
          ],
        },
      ]),
    ],
  },

  // ───────────────────────────── 54 ─────────────────────────────
  {
    n: 54,
    id: "e054-the-watcher",
    chapter: 6,
    title: "पीछा · The Watcher",
    location: "walls",
    objective: "Leave the walls without being followed",
    cast: ["nandini"],
    beats: [
      say("When I come down off the rampart there is a man at the foot of the stair, reading a notice about the price of fodder. It has been on that wall for a month. He is reading it very closely."),
      say("Grey coat. Ink on his cuff. Chancery. When I cross the yard he finishes the notice. When I turn into the passage he finds he has business in the passage."),
      say("Kaushal does not have me followed by a fool. That is almost a compliment."),
      choice("He is ten paces behind me and in no hurry at all. I have to lose him before I go anywhere that matters.", [
        {
          label: "Through the kitchens",
          detail: "Steam, knives, and Sumitra, who hates the Chancery.",
          then: [
            when(
              or(statAt("cunning", 6), trusts("sumitra", 2)),
              [
                say("I go in by the bread door and out by the well door. Between the two, Sumitra sees me, sees him, and upends a basin of onion water across the flags in front of the ovens."),
                line("sumitra", "Mind the floor, sir. Mind the floor. Oh, your good coat. Sit, sit, let me find a cloth. Don't go — I'll find a cloth."),
                say("By the time she has found a cloth, and a second cloth, and her opinion of the Chancery, I am two courtyards away."),
                fx(set("lostWatcher", true), trust("sumitra", 1)),
              ],
              [
                say("The kitchens are hot and full and loud, and none of it helps. Every cook turns to look at the prince, and every turned head points at me like a finger."),
                say("When I come out by the well door, he is there already, drinking a cup of water he did not need."),
                fx(set("lostWatcher", false), sus(2)),
              ],
            ),
          ],
        },
        {
          label: "Into the temple crowd",
          detail: "The noon offerings are ending. Everyone will be leaving at once.",
          then: [
            when(
              statAt("cunning", 6),
              [
                say("I go in with the tail of the crowd, take a marigold garland from a boy, and come out the other side with it round my neck and my head bowed, behind a widow with a very large umbrella."),
                say("He is still standing inside, looking for a prince. There isn't one. There is only a pilgrim with flowers, going down the lower steps at a pilgrim's pace."),
                fx(set("lostWatcher", true), stat({ cunning: 1 })),
              ],
              [
                say("I go in with the crowd, and the crowd does what crowds do when a prince walks into them: it parts. I stand in the middle of a clear circle of bowing heads, as visible as a lamp."),
                say("Across the circle, the grey coat bows too, courteously. He does not hurry. He has no need to."),
                fx(set("lostWatcher", false), sus(2)),
              ],
            ),
          ],
        },
        {
          label: "Across the stable yard",
          detail: "Horses, carts, and a stable boy who knows every gap in the fence.",
          then: [
            when(
              or(statAt("cunning", 6), trusts("moti", 2)),
              [
                say("Moti sees me coming, sees the grey coat behind me, and without a word leads a hay cart out across the yard at the slowest walk any horse has ever managed."),
                say("I go under the fence rail behind the farrier's forge, the way I went at nine when I was hiding from lessons. It is smaller than it was. So is Moti's grin."),
                fx(set("lostWatcher", true), trust("moti", 1)),
              ],
              [
                say("The yard is wide and open and hot, and there is nowhere in it to be but in plain sight. I walk all the way across it with the grey coat walking all the way across it behind me."),
                say("At the far gate I look back. He lifts a hand, pleasantly, as though we were old friends."),
                fx(set("lostWatcher", false), sus(2)),
              ],
            ),
          ],
        },
        {
          label: "Let Nandini draw him off",
          detail: "She offered. She's been waiting for you to let her.",
          requires: trusts("nandini", 2),
          lockedReason: "Nandini would do it, but you have not given her reason to believe you'd let her.",
          fx: all(set("lostWatcher", true), trust("nandini", 1)),
          then: [
            say("She walks straight at him with a stack of folded linen higher than her head, and walks straight into him. The linen goes everywhere. So do her apologies, loudly, with his name in them. She has somehow learned his name."),
            say("When he has finished helping her pick up the Minister's own bedsheets from the flags, I am gone."),
          ],
        },
        {
          label: "Turn round and greet him",
          detail: "If you cannot lose him, at least let him know you know.",
          fx: all(set("lostWatcher", false), sus(1), stat({ renown: 1 })),
          then: [
            line("arun", "You've been very patient. Tell the Mantri I'm going to the gate, and then to the stables. It will save you the walk."),
            say("He bows. He does not deny anything. He walks behind me to the gate, and then to the stables, precisely as instructed, like a man who has been given a gift."),
          ],
        },
      ]),
      when(
        is("lostWatcher", true),
        [say("For the first time since the last watch, nobody knows where I am. It lasts perhaps an hour. I intend to spend every part of it.")],
        [say("Whatever I do this afternoon, Kaushal will have it written down before I have finished doing it. I will have to be quick, or I will have to be lucky.")],
      ),
    ],
  },

  // ───────────────────────────── 55 ─────────────────────────────
  {
    n: 55,
    id: "e055-vikram-at-the-gate",
    chapter: 6,
    title: "द्वार पर विक्रम · Vikram at the Gate",
    location: "gate",
    objective: "Find Captain Vikram at the main gate",
    cast: ["vikram"],
    beats: [
      say("The gate passage is a tunnel through twenty feet of mountain, and it is cool in there even now. Vikram's border guard stands at the outer arch, spears grounded, faces turned to the road."),
      when(
        is("vikramBroken"),
        [
          say("Vikram sees me coming and his jaw sets. This morning I made him say, in front of the king, that he had written what he was told rather than what he saw. A man does not forgive that quickly. Sometimes he is grateful for it, later, and does not forgive it then either."),
          line("vikram", "Prince. Come to see where I keep my lies? I keep them in the guardroom. Along with my report."),
        ],
        [
          say("Vikram is at the guardroom table with a ledger of the day's traffic. He stands when he sees me, the way a tired man stands: all at once, to get it over with."),
          line("vikram", "Prince. The road's quiet. Salt carts and a goatherd. You didn't come for the road."),
        ],
      ),
      talk(
        "vikram",
        "The guardroom smells of leather and cold tea. A map of the western fords is pinned to the wall with a knife.",
        [
          {
            id: "morning",
            label: "“About this morning.”",
            requires: is("vikramBroken"),
            reply: [
              line("vikram", "You made me look a fool before the king. You also made me say the truth before the king, which I have not done in a while. I haven't decided which one to thank you for."),
              line("vikram", "She was riding east. I'll say it again if anyone asks. Nobody has."),
              fx(trust("vikram", 1)),
            ],
          },
          {
            id: "warrant",
            label: "“Show me your copy of the warrant.”",
            required: true,
            reply: [
              line("vikram", "Captains keep a copy. For exactly this sort of afternoon."),
              say("He unlocks a box under the table and hands me a folded sheet. The Minister's seal, seven spokes, the date — three days before she was seen at the ford. And beneath the seal, a second mark, a signature I have seen on every hunting permit in the west wing."),
              say("Ranadhir. Heir of Vajragarh. Countersigned."),
              fx(gain("heir-countersign")),
            ],
          },
          {
            id: "usual",
            label: "“Does my brother sign arrest warrants?”",
            required: true,
            reply: [
              line("vikram", "The heir countersigns everything the Minister sends out under the wheel. Usually."),
              say("He hears the word as he says it, and so do I."),
              line("vikram", "Usually he signs where the clerk has marked with a dot. This one he signed without a dot. Higher up. Like a man who'd read it first."),
            ],
          },
          {
            id: "west",
            label: "“Who told you to write west?”",
            reply: [
              line("vikram", "The warrant did. “Apprehend the courier Chaya on the western road, riding to Meghadurg.” It told me where she'd be and which way she'd be going. It was right about the first."),
            ],
          },
          {
            id: "chaya",
            label: "“Did she say anything, when you took her?”",
            reply: [
              line("vikram", "She asked what day it was. Then she asked if the court was sitting. When I said yes she laughed, once. Then she held out her wrists."),
            ],
          },
        ],
        "He takes the warrant back, folds it along its old creases, and locks it away again.",
      ),
      choice("Vikram's hand is still on the lid of the box.", [
        {
          label: "“Keep that safe. Someone may ask to burn it.”",
          detail: "Treat him as an honest officer.",
          fx: all(trust("vikram", 1), set("vikramKeeps", true)),
          then: [
            line("vikram", "Someone has already asked. A man in grey, an hour ago, wanting to borrow it for the Chancery's files. I told him the Chancery has the original. He didn't like that."),
            line("vikram", "It stays in the box, prince."),
          ],
        },
        {
          label: "Salute him, soldier to soldier, and go",
          detail: "Say nothing he'll have to repeat.",
          fx: sus(-1),
          then: [say("He returns the salute properly, heels together, the way he would to his Senapati. It is the first time he has done that to me.")],
        },
      ]),
    ],
  },

  // ───────────────────────────── 56 ─────────────────────────────
  {
    n: 56,
    id: "e056-a-horse-for-the-prince",
    chapter: 6,
    title: "राजकुमार का घोड़ा · A Horse for the Prince",
    location: "stables",
    objective: "Go down to the stables",
    cast: ["moti"],
    beats: [
      say("The stables are dim and warm and loud with flies. The courier's mare is still in the end stall, rested now, her new shoes clean. Someone has been feeding her carrots. I can guess who."),
      say("In the next stall Moti is working on the grey. My grey — the tall one with the bad temper and the good wind, the one I have ridden since I was twelve. He is combing out its mane in the middle of the afternoon, which nobody does, and oiling the saddle, which nobody does either."),
      talk(
        "moti",
        "He sees me and goes on combing, faster, as though he's been caught at something.",
        [
          {
            id: "grey",
            label: "“What are you doing with my horse?”",
            required: true,
            reply: [
              line("moti", "Getting him ready, my lord. Fed and watered and shod and the long saddle on. For the prince, for a long road, at the gate by dusk. That's what I was told."),
              line("moti", "I was told this morning. Before the bell. Before anybody went in to the court at all."),
              fx(gain("horse-readied")),
              say("Before the trial. Before anyone had asked me to do anything. Somewhere in this fortress someone knew, at dawn, that I would need a horse by dusk."),
            ],
          },
          {
            id: "bags",
            label: "“Is anything packed?”",
            reply: [
              line("moti", "Nothing, my lord. Empty bags. The order said nothing in them. I thought that was strange. Who sends a horse on a long road with nothing in the bags?"),
              say("Someone who means the rider to arrive with nothing."),
            ],
          },
          {
            id: "mare",
            label: "“And her mare?”",
            reply: [
              line("moti", "She's to be sold. Tomorrow. To anyone. I've been giving her carrots so whoever buys her knows somebody loved her."),
            ],
          },
        ],
      ),
      choice("Moti has stopped combing. He is looking at me the way he did when I was twelve and fell off the grey the first time.", [
        {
          label: "Press a coin into his hand",
          detail: "For the carrots, and for telling you.",
          requires: coin(1),
          lockedReason: "You have no coin left.",
          fx: all(supply({ coin: -1 }), trust("moti", 1)),
          then: [
            line("moti", "My lord, you don't have to — "),
            say("I close his fingers over it. He puts it inside his shirt, against his skin, where the grooms won't find it. Coin I will not have on a long road. It is the best thing I have bought today."),
          ],
        },
        {
          label: "“Who gave the order?”",
          detail: "The name matters more than the horse.",
          fx: set("stewardOrdered", true),
          then: [
            line("moti", "The heir's steward, my lord. The one who argues with the laundry. He came down himself at first light, and he stood right there and watched me write it on the slate, and then he wiped it off and said remember it instead."),
            say("My brother's steward. My brother's warrant. My brother's balcony. I stand in the smell of hay and oil and add them up, and I do not like the sum."),
          ],
        },
      ]),
    ],
  },

  // ───────────────────────────── 57 ─────────────────────────────
  {
    n: 57,
    id: "e057-the-ministers-desk",
    chapter: 6,
    title: "मंत्री की मेज़ · The Minister's Desk",
    location: "chancery",
    objective: "Get into the Chancery while the Minister is with the king",
    cast: [],
    beats: [
      say("Kaushal is with my father. Everyone knows it; the whole east wing has gone quiet in the way it does when those two are in a room together, as though the fortress itself were holding its breath."),
      when(
        is("lostWatcher", true),
        [say("Nobody follows me up the Chancery stair. The clerk's stool is empty; the clerk has gone to eat. The door is shut but not barred.")],
        [say("Behind me, at the foot of the stair, the grey coat stops to retie a sandal that does not need it. I have as long as it takes him to decide to come up.")],
      ),
      say("The Minister's room is as bare as a cell. A desk, a brazier cold now, a shelf of registers and a window facing the hall. The desk has one drawer, and the drawer has a lock, and the lock is new."),
      choice("A brass lock, clean and oiled. It was put there this year.", [
        {
          label: "Pick it with a pin from your sash",
          detail: "Slow, quiet, and only if your hands are cleverer than his locksmith.",
          requires: statAt("cunning", 6),
          lockedReason: "Your hands are not clever enough for this lock. (Cunning 6)",
          fx: set("deskWay", "picked"),
          then: [say("It takes four tries and most of my patience. On the fifth the lever gives with a sound like a tongue clicking. Nothing is scratched. He will never know.")],
        },
        {
          label: "Send Nandini for the clerk's spare key",
          detail: "She knows where the clerk keeps everything, including his wine.",
          requires: trusts("nandini", 2),
          lockedReason: "You would need to trust Nandini, and she you, further than you do.",
          fx: all(set("deskWay", "key"), trust("nandini", 1)),
          then: [
            say("She is gone for less time than it takes me to read the spines on the shelf, and comes back with a small key on a red thread, still warm from wherever he keeps it."),
            line("nandini", "Inside his left boot, under the bench. He'll never think anyone would touch that boot. Nobody ever should."),
          ],
        },
        {
          label: "Force it with the Minister's own letter knife",
          detail: "Fast and loud. He will know by evening.",
          fx: all(set("deskWay", "forced"), sus(3)),
          then: [say("The knife goes in under the lip and the drawer comes out with a crack like a knuckle, and a splinter of teak skitters across the floor. There is no hiding that. I don't try.")],
        },
      ]),
      search(
        "The drawer is very tidy. Kaushal files his secrets the way other men fold their linen.",
        [
          {
            id: "draft",
            label: "The sheet on top, under a paperweight",
            required: true,
            reply: [
              say("A clean draft in a clerk's hand, dated this morning. Not yesterday — today, before first bell. Before I was told anything. Before anyone stood in the hall."),
              say("“The prince Arunveer, having refused the king's justice, shall be sent west with nothing…” and then a gap, where a name is to be filled in, and then the words “and not return without it.”"),
              fx(gain("king-draft")),
              say("Having refused. It is written in the past tense. They have already decided what I will do. They only need me to do it."),
            ],
          },
          {
            id: "margin",
            label: "The note in the margin",
            required: true,
            reply: [
              say("Beside the gap, in a different ink and a narrower hand: Kaushal's. I have seen it on the charge this morning, every downstroke like a nail."),
              say("“The errand to Meghadurg — as the heir proposed.”"),
              fx(gain("heir-proposed")),
              say("My brother suggested it. My brother sat at our father's table at noon and ate from the same dish and said I liked horses, and he had already proposed where I would ride one."),
            ],
          },
          {
            id: "list",
            label: "A list beneath it",
            reply: [
              say("Names, posts and times. Six men of the Chancery guard to the main gate “for tonight.” The captain of the gate to be relieved at dusk. At the bottom, one line struck through so hard the nib has torn the paper. I cannot read what was under it."),
            ],
          },
          {
            id: "seal",
            label: "The seal in its box",
            reply: [
              say("The Minister's working seal. Seven spokes. I press my thumb to the gap where the eighth should be, and it fits exactly, the way a key fits the lock it was cut for."),
            ],
          },
        ],
        "Somewhere below, a door opens in the hall passage and voices come out of it. One of them is my father's, and it is laughing.",
      ),
      when(
        is("deskWay", "forced"),
        [say("I put the sheets back in the broken drawer, in their order, and push it as shut as it will go. It is a small, pointless courtesy, and I do it anyway, and then I leave by the servants' stair.")],
        [say("I put the sheets back in their order and lock the drawer behind them. The paperweight goes back where it was. I leave the room exactly as bare as I found it.")],
      ),
    ],
  },

  // ───────────────────────────── 58 ─────────────────────────────
  {
    n: 58,
    id: "e058-arithmetic",
    chapter: 6,
    title: "गणित · Arithmetic",
    location: "chambers",
    objective: "Go back to your rooms and think",
    cast: ["nandini"],
    beats: [
      say("My rooms are exactly as I left them at the last watch. The bed unmade. A cup of water gone warm. I sit on the edge of the bed in my boots, which Nandini hates, and she does not say anything, which is how I know she has seen my face."),
      say("Vidyadhar used to say that a sum is only frightening until you have written it down. After that it is merely true."),
      puzzle(
        {
          kind: "deduce",
          title: "Arithmetic",
          prompt: "What happens at sunset? Not what the court says. What has already been arranged. Lay it out.",
          slots: [
            { q: "What is the execution for?", answer: "king-test" },
            { q: "What waits at the gate by dusk?", answer: "horse-readied" },
            { q: "What was written before the trial began?", answer: "king-draft" },
          ],
          hint: "Ugrasen told you what the king wants from the sword. Moti told you what was ordered at dawn. The Minister's drawer told you the rest.",
        },
        [
          fx(set("exileDecided"), stat({ cunning: 1 })),
          say("The sword is not for her. It is for me: a test I am meant to fail, because a king who wanted me to pass would not have written the sentence first."),
          say("The horse is saddled for a long road. The bags are empty. The draft says west, with nothing, and not return without it."),
          say("The trial is a play, and I have read the last page. Whatever I prove this afternoon, at sunset my father will hand me his sword, and I will set it down, and the gate will open."),
          line("nandini", "Prince? You laughed."),
          say("Did I. I suppose it is funny, a little. All day I have been trying to save her, and all day they have been packing for me."),
        ],
        [
          say("I sit with the pieces and they will not lie flat. A sword, a horse, a sheet of paper. Each one means something. Together they mean something I cannot yet make myself read."),
          line("nandini", "You should drink some water. You look like a man doing sums in his head."),
        ],
      ),
      choice("The bell for the afternoon court will ring within the hour.", [
        {
          label: "Prepare for the road, quietly",
          detail: "A cloak, boots, what can be carried. Tell no one why.",
          fx: all(set("preparing", true), set("sunsetPlan", "road")),
          then: [
            say("I take down the old riding cloak, the plain one, and roll it tight and put it under the bed. Boots. The knife I use for fruit. A flint."),
            line("nandini", "Where are you going?"),
            line("arun", "Nowhere yet."),
            say("She looks at the cloak under the bed, and at me, and goes to fetch a second flint without being asked."),
          ],
        },
        {
          label: "Plan to confront the king",
          detail: "If the ending is written, you can at least make him read it aloud.",
          fx: all(set("sunsetPlan", "confront"), stat({ renown: 1 })),
          then: [
            say("I walk the floor and say the words over. The draft. The horse. The test. I say them to the wall until they stop shaking."),
            line("nandini", "He'll only look at you. He never shouts. That's worse."),
            say("She is right. I say them anyway."),
          ],
        },
        {
          label: "Tell no one. Not even yourself",
          detail: "Keep your face still. You'll need it still.",
          fx: all(set("sunsetPlan", "silent"), sus(-1)),
          then: [say("I wash my face in the warm water, and tell Nandini I have a headache and a book of verses, and she laughs at me, and for a moment it is an ordinary afternoon.")],
        },
      ]),
    ],
  },

  // ───────────────────────────── 59 ─────────────────────────────
  {
    n: 59,
    id: "e059-the-ranis-price",
    chapter: 6,
    title: "रानी का मूल्य · The Rani's Price",
    location: "courtyard",
    objective: "Rani Padmavati is waiting for you in the colonnade",
    cast: ["padmavati"],
    beats: [
      say("Rani Padmavati is walking the colonnade in the shade, slowly, the way she does everything. Two maids follow her at a distance that has been measured. When she sees me she dismisses them with one finger, and they go further than they need to."),
      when(
        is("stoodWith", "padmavati"),
        [line("padmavati", "Prince. You stood by me this morning. People noticed. I noticed them noticing. Walk with me, and let them notice a little more.")],
        [line("padmavati", "Prince. You didn't stand by me this morning. I hold no grudge. I only mention it so you'll know I keep count. Walk with me.")],
      ),
      talk(
        "padmavati",
        "She walks on the shaded side and leaves me the sun. I do not think it is an accident.",
        [
          {
            id: "want",
            label: "“What do you want, Rani?”",
            required: true,
            reply: [
              line("padmavati", "What I have always wanted. Salt going west and silver coming east, and nobody burning my carts in between. Peace, in other words. Peace is very good for business, and war is very good for Rao Jaswant."),
            ],
          },
          {
            id: "caravans",
            label: "“Your caravans never saw a rider.”",
            requires: has("padmavati-caravans"),
            reply: [
              line("padmavati", "Not one, in ten years. Not before the queen died and not after. My drivers can smell a raiding party a day off. They smelled nothing that winter but smoke."),
            ],
          },
          {
            id: "villages",
            label: "“It was the Third Company.”",
            requires: hasAny("soldier-confession", "ugrasen-guilt"),
            reply: [
              say("She does not stop walking, and she does not look surprised. She looks, for a moment, very tired."),
              line("padmavati", "I've known for six years, prince. Knowing is cheap. Proving is dear. Saying is the dearest thing there is, at this court."),
              fx(trust("padmavati", 1)),
            ],
          },
          {
            id: "offer",
            label: "“You didn't send your maids away to talk about salt.”",
            required: true,
            reply: [
              line("padmavati", "No. At sunset, when the lords are asked, I will speak for the courier. Mercy. I will say it plainly and let the king see me say it. It will cost me."),
              line("padmavati", "In return — if you are ever sent west, and I think you may be — you will carry a letter for me to the salt guild at the river crossing. You will put it in the guildmaster's hand and no one else's."),
            ],
          },
          {
            id: "why",
            label: "“Why do you think I'll be sent west?”",
            requires: or(has("horse-readied"), has("king-draft")),
            reply: [
              line("padmavati", "Because a grey horse is being groomed in the middle of the afternoon, and everyone in this fortress with eyes has seen it. And because I have known your father for thirty years, and he never gives a gift without knowing where it will be used."),
            ],
          },
        ],
      ),
      choice("She stops at the end of the colonnade, where the shade runs out, and waits.", [
        {
          label: "Accept. Her voice at sunset, your hand on the road",
          detail: "A lord for the courier, and a letter you cannot read.",
          fx: all(set("padmavatiDeal", true), trust("padmavati", 2)),
          then: [
            line("padmavati", "Good. You'll get the letter at the gate, if there's a gate. If there isn't, burn my name out of your memory and I will do the same for yours."),
            say("She holds out her hand, palm down, as a Rani does. I take it, and bow over it, and she presses it once — hard, like a merchant closing a price."),
          ],
        },
        {
          label: "Refuse. You will not carry what you cannot read",
          detail: "You have had enough of sealed things today.",
          fx: set("padmavatiDeal", false),
          then: [
            line("padmavati", "A pity. You are the first honest prince I have met, and honesty is so badly paid."),
            line("padmavati", "I may still speak at sunset. It depends on the weather. Good afternoon, prince."),
          ],
        },
      ]),
    ],
  },

  // ───────────────────────────── 60 ─────────────────────────────
  {
    n: 60,
    id: "e060-the-afternoon-bell",
    chapter: 6,
    title: "दोपहर की घंटी · The Afternoon Bell",
    location: "hall",
    objective: "The bell is ringing. Go to the throne hall",
    cast: HALL,
    beats: [
      say("The iron bell again. It rang for her at the last watch, and for the court at first light, and now it rings a third time, and the whole fortress turns towards the hall like water towards a drain."),
      say("The court comes in by rank, as it did this morning. It is not the same court. It has been talking since noon."),
      when(alliesAt(1), [say("I walk in along the wall, and as I pass, some of them look at me. Not all. Enough to count.")], [say("I walk in along the wall, and as I pass, nobody looks at me at all. It is so thorough that it must be deliberate.")]),
      when(trusts("padmavati", 2), [say("Rani Padmavati inclines her head a finger's breadth. From her, that is a speech.")]),
      when(trusts("jaswant", 2), [say("Rao Jaswant claps me on the shoulder as I pass, too hard, and says “Good lad” loud enough for the steps to hear. He thinks I am on his side. I let him.")]),
      when(trusts("bhairav", 2), [say("Thakur Bhairav mops his neck and meets my eye for exactly one breath, which for him is courage.")]),
      when(trusts("ugrasen", 2), [say("By the pillar, Ugrasen stands with the wrapped sword. He does not nod. He shifts his weight so that he is facing me instead of the throne.")]),
      when(trusts("vikram", 2), [say("At the door, Vikram brings his spear-butt down on the stone as I pass. The guard beside him glances at him and then does the same, not knowing why.")]),
      when(trusts("devashrava", 2), [say("Devashrava, on the dais steps with his sandalwood and his water, lifts two fingers in the smallest blessing a priest can give.")]),
      when(
        or(trusts("nandini", 2), trusts("sumitra", 2), trusts("vidyadhar", 2)),
        [say("And at the servants' arch, where no lord ever looks, there are faces I know: someone from the kitchens, someone from the archive stair, someone sixteen and missing nothing. They are not supposed to be here. They are here.")],
      ),
      fx((s) => set("alliesAtBell", allyCount(s))(s)),
      when(
        alliesAt(3),
        [
          say("Kaushal watches all of it from beside the throne, the way a man watches a ledger that is being added up by somebody else."),
          line("kaushal", "The prince has been busy."),
          say("He says it to no one, pleasantly, and my father hears it, as he was meant to."),
          fx(sus(1)),
        ],
        [say("Kaushal watches me come in and then looks away, satisfied, as though I had confirmed a figure he already had.")],
      ),
      when(
        has("heir-proposed"),
        [say("Ranadhir is at his place on the second step. He does not look at me. I look at him for a long time, and think: as the heir proposed. He adjusts his sleeve over his wrist, where the blue-green would show.")],
        [say("Ranadhir is at his place on the second step, watching the doors, the way he was this morning. He has not stopped watching them all day.")],
      ),
      say("Chaya is brought in last, and put back in the bar of light where she knelt before. Her eyes go round the hall once, like a courier checking a road, and stop on me."),
      choice("There are two places a prince may stand.", [
        {
          label: "Take your place beside the throne",
          detail: "Stand where your father put you. Let him see you there.",
          fx: all(set("afternoonPlace", "throne"), sus(-1)),
          then: [
            say("I go up the steps and stand at my father's left, one stair below Ranadhir. The king does not look at me. He lays his hand, briefly, on the arm of the throne nearest to me, and takes it away."),
          ],
        },
        {
          label: "Stand among the lords, below the steps",
          detail: "With the court, not above it. Everyone will see the choice.",
          fx: all(set("afternoonPlace", "lords"), stat({ renown: 1 }), sus(1)),
          then: [
            say("I stay where I am, on the floor of the hall, between Padmavati's silk and Bhairav's sweat. There is a murmur, very small, like a page turning."),
            say("My father looks down at me from the throne the way he looks at a move on a chessboard that he had expected someone else to make."),
          ],
        },
      ]),
      line("bhanusen", "Minister. You may begin."),
    ],
  },
];
