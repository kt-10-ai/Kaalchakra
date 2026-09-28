import type { CharId, Cond, CourtState, Episode } from "../types";
import {
  choice,
  fx,
  has,
  hasAny,
  is,
  line,
  not,
  or,
  and,
  puzzle,
  say,
  search,
  set,
  stat,
  statAt,
  sus,
  talk,
  trust,
  trusts,
  when,
  coin,
  flag,
} from "../dsl";

// ── local helpers ──
const ALLY_IDS: CharId[] = ["padmavati", "ugrasen", "devashrava", "bhairav", "vikram", "jaswant", "vidyadhar", "sumitra", "nandini"];
const allyCount = (s: CourtState) => ALLY_IDS.filter((id) => (s.trust[id] ?? 0) >= 2).length;
const alliesAt =
  (n: number): Cond =>
  (s) =>
    allyCount(s) >= n;

const HALL_CAST: CharId[] = ["bhanusen", "kaushal", "ranadhir", "jaswant", "padmavati", "bhairav", "ugrasen", "devashrava", "vikram"];

export const CHAPTER_9: Episode[] = [
  // ───────────────────────────── 81 ─────────────────────────────
  {
    n: 81,
    id: "e081-allies",
    chapter: 9,
    title: "मित्र · Allies",
    location: "courtyard",
    objective: "Cross the courtyard before the sunset bell",
    cast: ["nandini", "padmavati", "ugrasen", "devashrava", "vikram", "vidyadhar", "sumitra", "bhairav", "jaswant"],
    beats: [
      say("The sun is a hand's width above the western wall. The courtyard is full of people pretending not to be waiting for sunset."),
      when(
        alliesAt(1),
        [say("Some of them, it turns out, are waiting for me. They do it carefully. Nobody at this court has ever done anything else.")],
        [say("Nobody meets my eye. In Vajragarh that is not rudeness. It is arithmetic.")],
      ),
      line("nandini", "Kaushal's clerks are at the colonnade, my lord, counting who you speak to. Speak quickly, then."),
      search(
        "Nandini walks half a step behind me, the way she has since she was nine, and names each person under her breath before we reach them.",
        [
          {
            id: "watchers",
            label: "The colonnade",
            required: true,
            reply: [
              say("Two grey Chancery coats by the third pillar, a writing board between them. One of them licks his thumb each time I stop walking."),
              say("I am being entered in a ledger. I wonder which column."),
            ],
          },
          {
            id: "padmavati",
            label: "Rani Padmavati",
            requires: trusts("padmavati", 2),
            reply: [
              say("She is admiring a pillar. She does not look at me when she speaks."),
              when(
                is("padmavatiDeal"),
                [line("padmavati", "Our bargain holds, Prince. If there is a gate tonight, there will be a purse at it. Salt money. It spends the same on either bank.")],
                [line("padmavati", "If there is a gate tonight, there will be a purse at it. Don't thank me. I am buying something, I just haven't decided what.")],
              ),
              fx(set("giftPadmavati")),
            ],
          },
          {
            id: "ugrasen",
            label: "Senapati Ugrasen",
            requires: trusts("ugrasen", 2),
            reply: [
              line("ugrasen", "The Chancery maps show the passes the way the Chancery wishes they ran. The Company has its own. One will be in your saddlebag if you need a saddlebag."),
              when(is("ugrasenSpeaks"), [line("ugrasen", "And I'll stand when you need me to. After that I'm no use to anyone. Remember that I stood.")]),
              fx(set("giftUgrasen")),
            ],
          },
          {
            id: "devashrava",
            label: "Rajpurohit Devashrava",
            requires: trusts("devashrava", 2),
            reply: [
              line("devashrava", "I am to bless the sword within the hour. I will do it. The rite says the sword. It says nothing about the hand."),
              line("devashrava", "Come to the lamp before you go in. There is a blessing for travellers older than this house."),
              fx(set("giftDevashrava")),
            ],
          },
          {
            id: "vikram",
            label: "Captain Vikram",
            requires: trusts("vikram", 2),
            reply: [
              line("vikram", "If you're sent anywhere, my lord, I'll ride with you to the border stone. That's my road. No one can tell me not to ride my own road."),
              say("Someone can. I don't tell him who."),
              fx(set("giftVikram")),
            ],
          },
          {
            id: "vidyadhar",
            label: "Old Vidyadhar",
            requires: trusts("vidyadhar", 2),
            reply: [
              say("He is sitting on the archive step in the last of the warmth, eyes shut, as though listening to the stones."),
              line("vidyadhar", "I heard your feet. You walk like her when you're frightened. Go on. I'll find something in the archive that travels better than I do."),
              fx(set("giftVidyadhar")),
            ],
          },
          {
            id: "sumitra",
            label: "Sumitra",
            requires: trusts("sumitra", 2),
            reply: [
              say("She is carrying a basket of onions across the yard, which is not her work and not her yard."),
              line("sumitra", "Don't stop, child, they're watching. Whatever I've packed will be where it needs to be. I packed for your mother too, once. I pack well."),
              fx(set("giftSumitra")),
            ],
          },
          {
            id: "bhairav",
            label: "Thakur Bhairav",
            requires: trusts("bhairav", 2),
            reply: [
              line("bhairav", "The treasury loses small sums every season, Prince. Rats. Damp. Arithmetic. It may lose one more tonight, near the gate."),
              say("He wipes his forehead. It is not warm."),
              fx(set("giftBhairav")),
            ],
          },
          {
            id: "nandini",
            label: "Nandini",
            requires: trusts("nandini", 2),
            reply: [
              line("nandini", "I'll be at the gate. Whatever happens in there. Someone should be at the gate who isn't paid to be."),
              fx(set("giftNandini")),
            ],
          },
          {
            id: "jaswant",
            label: "Rao Jaswant",
            requires: trusts("jaswant", 2),
            reply: [
              line("jaswant", "Do it cleanly, boy, and I'll drink to you tonight. One stroke. Your mother deserves one clean stroke."),
              say("Of all the promises made to me in this courtyard, his is the only one made in the open."),
            ],
          },
        ],
        (s) =>
          allyCount(s) >= 4
            ? "More people have promised me things in a quarter hour than in the whole of my life. I would feel better about it if any of them had said what they expected to happen."
            : allyCount(s) >= 1
              ? "A few promises, made sideways. It is more than I expected this morning."
              : "No one stops me. The clerks enter that too.",
      ),
      choice("The clerks are still writing. How do you leave the courtyard?", [
        {
          label: "Thank them openly",
          detail: "Let the Chancery write it down.",
          fx: (s) => stat({ renown: 1 })(sus(1)(s)),
          then: [say("I bow to each of them in turn, in full view. The clerk's thumb stops halfway to his mouth.")],
        },
        {
          label: "Walk on without a word",
          detail: "Make their ledger dull.",
          fx: sus(-1),
          then: [say("I walk on as though I had spoken to no one. Nandini falls back a pace, and then another, and then she is a servant carrying nothing, going nowhere.")],
        },
      ]),
    ],
  },

  // ───────────────────────────── 82 ─────────────────────────────
  {
    n: 82,
    id: "e082-the-ministers-men",
    chapter: 9,
    title: "मंत्री के लोग · The Minister's Men",
    location: "gate",
    objective: "Go down to the gate",
    cast: ["vikram"],
    beats: [
      say("Six men in Chancery grey stand in the gate passage where Vikram's border guard should be. They are not at attention. They are simply there, the way a door is there."),
      say("Their captain is lean and sunburnt, with the patience of a man paid by the day. A folded warrant is tucked in his belt. I can read two words of it upside down: for tonight."),
      when(
        or(is("lostWatcher", false), is("brazier", "interrupted")),
        [say("One of them I have seen before. He spent the afternoon a stair behind me. He does not pretend otherwise now.")],
      ),
      choice("They watch you come down the ramp.", [
        {
          label: "Stare them down",
          detail: "You are still a prince until sunset.",
          fx: (s) => set("gateMen", "stared")(stat({ renown: 1 })(sus(1)(s))),
          then: [
            say("I stop in front of the captain and look at him until he looks at the ground. Four of the others follow. The fifth looks at the sky."),
            say("The sixth goes on looking at me. I will remember his face. I suspect that is what he wanted."),
          ],
        },
        {
          label: "Walk around them, by the postern",
          detail: "Give them nothing to report.",
          fx: (s) => set("gateMen", "around")(stat({ cunning: 1 })(sus(-1)(s))),
          then: [say("I take the postern stair as if I had always meant to, and inspect the hinges of the small gate with great seriousness. Nobody writes down that the prince looked at a hinge.")],
        },
        {
          label: "Greet their captain by name",
          detail: "Only if you have been paying attention all day.",
          requires: statAt("cunning", 5),
          lockedReason: "You don't know his name. You'd have had to be paying closer attention.",
          fx: (s) => set("gateMen", "named")(sus(-1)(s)),
          then: [
            say("Keshav. His name was on the Chancery duty roll pinned by the door this morning; I read it while I was reading everything else. His mother sells ghee in the lower market. Nandini buys from her, and tells me things I never ask to know."),
            line("arun", "Keshav. Is your mother still at the lower market? Tell her the ghee has been thin since the rains."),
            say("He blinks. For one breath he is a man whose mother sells ghee, and not a gate. Then he remembers, but the breath was enough. He will not enjoy searching me."),
          ],
        },
      ]),
      when(
        or(is("vikramBroken"), trusts("vikram", 1)),
        [
          line("vikram", "They're not mine, my lord. They came with a Chancery warrant at the afternoon bell. For tonight, it says. It doesn't say what tonight is."),
          line("vikram", "It doesn't need to."),
        ],
        [say("Vikram is in the gatehouse door. He sees me and becomes very interested in the torch brackets.")],
      ),
      say("A gate with men posted at it for tonight is not being guarded against anyone coming in."),
    ],
  },

  // ───────────────────────────── 83 ─────────────────────────────
  {
    n: 83,
    id: "e083-the-stable-at-dusk",
    chapter: 9,
    title: "सांझ का अस्तबल · The Stable at Dusk",
    location: "stables",
    objective: "Look in on the stables",
    cast: ["moti"],
    beats: [
      say("The grey is saddled. Fed, watered, the girth buckled one hole looser than I like, which means Moti did it and not a groom."),
      when(
        has("horse-readied"),
        [say("I have known since the afternoon. Knowing is not the same as seeing the bridle hung on the post with its buckles polished, for a long road, by dusk.")],
        [say("Nobody saddles a horse at sunset for a prince who is going to bed. I stand there longer than I should, doing that sum.")],
      ),
      line("moti", "He's ready, my lord. I wasn't told for what. I was told for the prince, and a long road, and don't ask."),
      when(
        trusts("moti", 2),
        [
          line("moti", "I put an extra nosebag in. Nobody told me not to. Nobody tells me anything, so nobody told me not to."),
          fx(set("motiNosebag")),
        ],
      ),
      choice("Moti goes to fetch water. You are alone with the horse.", [
        {
          label: "Hide coin in the saddle",
          detail: "Under the skirt, where a searcher's hand won't go.",
          requires: coin(1),
          lockedReason: "Your purse is empty.",
          fx: set("hiddenCoin"),
          then: [
            say("I work the stitching of the saddle skirt loose with a thumbnail and slide the coins in flat, one behind another, and press the leather down."),
            say("My father taught me that a king should always know where his money is. I doubt this is what he meant."),
          ],
        },
        {
          label: "Check the horse's shoes",
          detail: "You have learned today what a shoe can say.",
          fx: (s) => set("checkedShoes")(stat({ cunning: 1 })(s)),
          then: [
            say("I lift each hoof in turn. Vajragarh shoes, narrow, deep-nailed, fresh this morning. Mountain shoes."),
            when(
              has("new-horseshoes"),
              [say("Her horse wore river-country iron. Mine is shod for the road up, not the road across. Somebody expects me to be climbing when this is over.")],
              [say("Fine shoes for stone. Poor for mud. I file that away for whatever country I end up in.")],
            ),
          ],
        },
        {
          label: "Stand with him",
          detail: "Nothing to be done here. Do nothing.",
          then: [say("I put my hand flat on his neck and feel him breathe. He does not know what sunset is for. I envy him that, and then I am ashamed of envying a horse.")],
        },
      ]),
      line("moti", "My lord. Whatever it is. He's a good horse. He'll carry you out of anything."),
    ],
  },

  // ───────────────────────────── 84 ─────────────────────────────
  {
    n: 84,
    id: "e084-the-temple-lamp",
    chapter: 9,
    title: "मंदिर का दीप · The Temple Lamp",
    location: "temple",
    objective: "Go to the temple, where the sword is being blessed",
    cast: ["devashrava", "ugrasen"],
    beats: [
      say("The temple is full of smoke — sandalwood and agar, heavy enough to lean on. My father's sword lies across the altar on a red cloth, naked, oiled, pointing west."),
      say("Ugrasen stands behind it like a man guarding a sleeping animal. Devashrava's hands move over the blade without touching it, and his voice does not falter once, which is how I know how frightened he is."),
      when(
        has("sandal-oil"),
        [say("Smoke, not oil. I breathe it in and think of the gaoler, and of a cell door, and of my brother. I would rather not have learned the difference today.")],
      ),
      choice("Devashrava lifts the lamp and waits for you to come forward.", [
        {
          label: "Pray",
          detail: "Kneel with everyone else.",
          fx: sus(-1),
          then: [
            say("I kneel. I find that I don't know which god to address, or what to ask for that would not be an insult to one of them."),
            say("In the end I ask for nothing. It is the most honest prayer I have made in this room."),
          ],
        },
        {
          label: "Refuse the blessing",
          detail: "Bless the sword. Not the hand.",
          fx: (s) => set("refusedBlessing")(stat({ renown: 1 })(sus(1)(s))),
          then: [
            line("arun", "Bless the sword, Rajpurohit. Leave the hand out of it."),
            say("A novice drops a bell. Ugrasen does not move. Devashrava looks at me for a long moment and then turns the lamp, very slightly, away from me."),
            line("devashrava", "As the prince wishes. The rite concerns the blade."),
          ],
        },
        {
          label: "Ask him the one question he fears",
          detail: "Low, under the chant.",
          requires: hasAny("accession-night", "temple-register"),
          lockedReason: "You don't know what he fears. Not yet.",
          fx: (s) => trust("devashrava", 1)(sus(1)(s)),
          then: [
            line("arun", "Have you blessed a blade for this house before, Rajpurohit? On the night the seal was cut?"),
            say("The chant goes on. His lips go on moving with it. Only his eyes stop."),
            line("devashrava", "The old king's line did not end in its bed. I have said that much once today and I will say it no more times. Ask me on some other road."),
          ],
        },
      ]),
      when(
        is("giftDevashrava"),
        [
          say("When the rite is done he passes me with the ash bowl, and his thumb touches my forehead for no reason written in any book."),
          line("devashrava", "That one was yours. Not its."),
        ],
      ),
      when(
        trusts("ugrasen", 1),
        [line("ugrasen", "I'll carry it in. You won't have to touch it until he gives it you. That's the only mercy I have to offer, and it isn't much.")],
        [say("Ugrasen wraps the sword in its cloth and carries it out ahead of me without a word.")],
      ),
    ],
  },

  // ───────────────────────────── 85 ─────────────────────────────
  {
    n: 85,
    id: "e085-ranadhir-in-passing",
    chapter: 9,
    title: "राह में भाई · Ranadhir in Passing",
    location: "courtyard",
    objective: "Cross the colonnade to the hall",
    cast: ["ranadhir"],
    beats: [
      say("The colonnade is striped with long shadows, pillar and gold, pillar and gold. My brother comes the other way. His step is the only one in Vajragarh I could name with my eyes shut."),
      when(
        or(is("brother", "follow"), trusts("ranadhir", 2)),
        [
          say("He does not stop. He slows by half a pace as we pass, which from Ranadhir is a speech."),
          line("ranadhir", "Whatever I do tonight — hate me for it loudly."),
          say("Then he is past, and the shadows close over him, pillar and gold."),
        ],
        [
          when(
            is("brother", "secret"),
            [
              say("He looks at me once — the look he gives a horse he has not decided whether to buy — and says nothing about this afternoon. I kept his secret. He is not going to thank me for it."),
              line("ranadhir", "Stand up straight in there. You look like you haven't slept."),
            ],
            [say("He gives me a look so cold and complete it could have been cut and fitted. Then he is past.")],
          ),
        ],
      ),
      choice("He is three pillars away.", [
        {
          label: "Nod, to his back",
          fx: set("passing", "nod"),
          then: [say("I nod to his back. It is a ridiculous thing to do. I do it anyway, the way you touch a doorframe for luck.")],
        },
        {
          label: "Say his name",
          detail: "The old name. Bhaiya.",
          fx: (s) => set("passing", "name")(trust("ranadhir", 1)(s)),
          then: [
            line("arun", "Bhaiya."),
            say("He stops. He does not turn. For the length of a breath his shoulders are twelve years old."),
            say("Then he walks on, faster."),
          ],
        },
        {
          label: "Say nothing",
          fx: set("passing", "nothing"),
          then: [say("I say nothing. We have been practising that for six years. We are very good at it.")],
        },
      ]),
    ],
  },

  // ───────────────────────────── 86 ─────────────────────────────
  {
    n: 86,
    id: "e086-the-king-alone",
    chapter: 9,
    title: "एकाकी राजा · The King Alone",
    location: "hall",
    objective: "Enter the throne hall before the court fills",
    cast: ["bhanusen"],
    beats: [
      say("The hall is empty except for my father. He sits the throne alone in the long light, one hand on the arm of it, the way other men sit on a bench outside their own house."),
      say("The sweepers have gone. The lamps are not lit yet. The mark where she will kneel has been chalked fresh on the stone."),
      line("bhanusen", "Arunveer. Come where I can see you. I will not be able to talk to you in a quarter of an hour. Kings have very little time for their sons."),
      talk(
        "bhanusen",
        "He does not ask me to sit. There is nothing to sit on below the steps.",
        [
          {
            id: "softness",
            label: "“Is it softness, to refuse?”",
            required: true,
            reply: [
              line("bhanusen", "Softness is not refusing. Softness is thinking that refusing costs only you."),
              line("bhanusen", "Your mother was soft. She thought kindness was a thing you could keep in one room of a house. It gets into the walls."),
            ],
          },
          {
            id: "crown",
            label: "“What does a crown cost?”",
            required: true,
            reply: [
              line("bhanusen", "Everything you would not give. That is how you know the price. If you would give it gladly, it was never payment."),
              say("He says it gently. That is the worst thing about my father. He is always gentle when he is telling the truth."),
            ],
          },
          {
            id: "pyre",
            label: "“Her pyre was closed.”",
            requires: has("closed-pyre"),
            reply: [
              line("bhanusen", "It was closed because I ordered it closed. There are things a husband does not share with a kitchen."),
              line("bhanusen", "Or with a son."),
              fx(sus(1)),
            ],
          },
          {
            id: "villages",
            label: "“The six villages.”",
            requires: hasAny("soldiers-bounty", "ugrasen-guilt", "ledger-page"),
            reply: [
              say("His hand does not move on the arm of the throne. I watch it not move for a long time."),
              line("bhanusen", "You have been reading. Good. A king should read. He should also know which pages to close."),
              fx(sus(1)),
            ],
          },
          {
            id: "letter",
            label: "Show: Her Letter to Me",
            requires: has("queens-box-letter"),
            reply: [
              say("I hold it up. I do not go up the steps. He would have to come down for it, and he does."),
              say("He reads it standing, in the west light. I see his eyes reach the line — believe the love — and stop there, and go back to the beginning, and read it again."),
              say("He is silent a very long time. Long enough for a sweeper to come to the door and see us and go away."),
              line("bhanusen", "She wrote well. She always did. She could make a laundry list sound like a promise."),
              say("He folds it along its old creases and hands it back. That, more than anything he has said, frightens me."),
              fx(set("kingReadLetter")),
            ],
          },
        ],
        "Outside, the first lords' voices on the stair. He straightens on the throne and is, at once, no one's father.",
      ),
      choice("He waits to be left.", [
        {
          label: "Bow",
          fx: sus(-1),
          then: [say("I bow as the court will see me bow in a quarter hour. He inclines his head, exactly as far as protocol requires.")],
        },
        {
          label: "“Father.”",
          detail: "Just the word.",
          then: [
            line("arun", "Father."),
            line("bhanusen", "Not in this hall."),
          ],
        },
        {
          label: "Turn and walk out without bowing",
          fx: (s) => stat({ renown: 1 })(sus(1)(s)),
          then: [say("I turn my back on the throne and walk the length of the hall. I count forty-one steps. He does not call me back. I had half hoped he would.")],
        },
      ]),
    ],
  },

  // ───────────────────────────── 87 ─────────────────────────────
  {
    n: 87,
    id: "e087-the-hall-fills",
    chapter: 9,
    title: "भरा दरबार · The Hall Fills",
    location: "hall",
    objective: "Take your place as the court assembles",
    cast: HALL_CAST,
    beats: [
      say("The court comes in the way water comes into a lock — quietly, from every side, until there is no dry stone left. Every noble of Vajragarh lining the walls."),
      say((s) => {
        const near: string[] = [];
        const far: string[] = [];
        const place = (id: CharId, name: string) => ((s.trust[id] ?? 0) >= 2 ? near : far).push(name);
        place("padmavati", "Padmavati");
        place("jaswant", "Jaswant");
        place("bhairav", "Bhairav");
        place("ugrasen", "Ugrasen");
        place("vikram", "Vikram");
        if (near.length === 0) return "They arrange themselves along the walls by rank and by caution. None of them stands near me. I have become a place people walk around.";
        return `They arrange themselves by rank and by caution. ${near.join(", ")} ${near.length === 1 ? "stands" : "stand"} on my side of the hall, close enough to be seen doing it. ${far.length ? `${far.join(", ")} ${far.length === 1 ? "keeps" : "keep"} to the far wall.` : "Nobody keeps to the far wall. I don't know what to do with that."}`;
      }),
      when(
        is("ledger", "exposed"),
        [say("Rao Jaswant stands alone. There is a clear stride of stone on either side of him. Since the afternoon, nobody in Vajragarh wants to be seen standing on burned fields.")],
      ),
      when(
        is("fragment", "read"),
        [say("People look at my brother, then at me, then at nothing. The name I read aloud this afternoon is still in the rafters somewhere.")],
      ),
      when(
        alliesAt(3),
        [
          line("kaushal", "The prince has made friends today. How pleasant. Friendship is so often mistaken for evidence."),
          fx(sus(1)),
        ],
      ),
      say("Kaushal takes his place at the right of the throne. Ranadhir takes his on the steps. Devashrava comes last, with Ugrasen behind him carrying the wrapped sword like a child that must not be woken."),
      choice("Where do you stand?", [
        {
          label: "At the foot of the steps",
          detail: "Where a son stands.",
          fx: (s) => set("hallPlace", "steps")(sus(-1)(s)),
          then: [say("At the foot of the steps, where a son stands. My brother is three stairs above me. I can see the back of his neck. He has cut himself shaving.")],
        },
        {
          label: "Beside the prisoner's mark",
          detail: "Where the executioner stands. Or the accused.",
          fx: (s) => set("hallPlace", "mark")(stat({ renown: 1 })(sus(1)(s))),
          then: [
            say("I go and stand beside the chalk mark on the stone, where she will kneel. A murmur goes along the walls like wind through dry millet."),
            say("It is the executioner's place. It is also, if you turn the other way, the place of the accused. I have not decided which way I am facing."),
          ],
        },
      ]),
    ],
  },

  // ───────────────────────────── 88 ─────────────────────────────
  {
    n: 88,
    id: "e088-kaushals-closing",
    chapter: 9,
    title: "मंत्री का समापन · Kaushal's Closing",
    location: "hall",
    objective: "Hear the Minister's closing",
    cast: HALL_CAST,
    beats: [
      say("Kaushal speaks without notes. He never needs them. He folds his hands into his sleeves and addresses the rafters, as if the case were written there and he were only reading it back to us."),
      line("kaushal", "A courier dismissed from royal service. Found on the western road. Carrying a satchel sealed, and found empty. The court has heard every argument about roads and linings and ink. They are interesting arguments."),
      when(
        is("vikramBroken"),
        [line("kaushal", "East, west. The Captain now believes she rode east. I accept it. A spy who comes home is a spy who has something to deliver. Direction is immaterial.")],
      ),
      when(
        is("fragment", "read"),
        [line("kaushal", "A name was read aloud in this court today. A god's name, in a traitor's letter. I will not say it again. Some names are evidence simply by being known.")],
      ),
      when(
        is("ledger", "exposed"),
        [line("kaushal", "And there were accusations about villages. This court tries a courier. Old fires are for another day, and another court, and I pray a wiser one.")],
      ),
      line("kaushal", "She has served Meghadurg. Whether with paper or with silence, she has served it. The sentence is death, and the king has named the hand."),
      choice("He bows to the throne. For a moment the floor is open.", [
        {
          label: "“The sentence was written this morning.”",
          detail: "Present the draft from his own desk.",
          requires: has("king-draft"),
          lockedReason: "You have nothing to prove it with.",
          fx: (s) => set("draftExposed")(stat({ renown: 3 })(sus(3)(s))),
          then: [
            line("arun", "The sentence was written this morning, Mantri. Before the first bell. Before any of these interesting arguments. It is in your desk. And not the courier's sentence. Mine."),
            say("It is quiet enough to hear the lamp-wicks. Kaushal does not look at the king, which is how everyone knows it is true."),
            line("bhanusen", "It was. I have been king for twenty-two years, Arunveer. I write most things in the morning."),
            when(has("heir-proposed"), [say("I do not say the rest — as the heir proposed. My brother's neck is very still, three stairs up.")]),
          ],
        },
        {
          label: "Give him the nod he's waiting for",
          detail: "You have an understanding, you and the Minister.",
          showIf: is("kaushalDeal"),
          fx: (s) => stat({ ruthlessness: 1 })(sus(-2)(s)),
          then: [
            say("His eyes find mine as he straightens. I nod — a small nod, a bargain being kept."),
            say("He smiles. He thinks he knows what I will do at sunset. So, for the moment, do I."),
          ],
        },
        {
          label: "Say nothing",
          detail: "Save what you have for the defence.",
          fx: stat({ cunning: 1 }),
          then: [say("I say nothing. Kaushal's glance touches me and moves on, satisfied with the silence, or pretending to be.")],
        },
      ]),
    ],
  },

  // ───────────────────────────── 89 ─────────────────────────────
  {
    n: 89,
    id: "e089-the-case-for-the-courier",
    chapter: 9,
    title: "दूत का पक्ष · The Case for the Courier",
    location: "hall",
    objective: "Speak for the courier",
    cast: HALL_CAST,
    beats: [
      line("bhanusen", "The prince has been busy all day. Everyone has told me so. Let him speak, then. Once."),
      say("Once. I have the whole day in my Case Book and one breath to spend it. I step forward and try to put it in the order a stranger could follow."),
      when(
        hasAny("king-test", "king-draft"),
        [
          puzzle(
            {
              kind: "deduce",
              title: "The Case for the Courier",
              prompt: "Make the defence. Answer each question from your Case Book — and, last, say aloud what this trial is really for.",
              slots: [
                { q: "Which way was she riding?", answer: ["new-horseshoes", "chaya-said-east"] },
                { q: "What was taken from her satchel?", answer: ["cut-lining", "ash-fragment", "decoded-fragment", "burning-at-dawn"] },
                { q: "Who knew she was coming?", answer: ["early-warrant", "heir-countersign"] },
                { q: "What is this trial really for?", answer: ["king-test", "king-draft"] },
              ],
              hint: "Think of what you saw at dawn and in the stables, what was cut and burned in the Chancery, the date on the warrant — and what the Senapati or the Minister's desk told you about sunset.",
            },
            [fx(set("caseProven"), set("namedTheTest"), stat({ renown: 2 }))],
            [fx(set("caseProven", false))],
          ),
        ],
        [
          puzzle(
            {
              kind: "deduce",
              title: "The Case for the Courier",
              prompt: "Make the defence. Answer each question from your Case Book.",
              slots: [
                { q: "Which way was she riding?", answer: ["new-horseshoes", "chaya-said-east"] },
                { q: "What was taken from her satchel?", answer: ["cut-lining", "ash-fragment", "decoded-fragment", "burning-at-dawn"] },
                { q: "Who knew she was coming?", answer: ["early-warrant", "heir-countersign"] },
              ],
              hint: "Think of her horse's shoes and what she told you, what was cut and burned in the Chancery, and the date on the warrant.",
            },
            [fx(set("caseProven"), stat({ renown: 2 }))],
            [fx(set("caseProven", false))],
          ),
        ],
      ),
      when(
        is("caseProven"),
        [
          say("She was riding home, not away; the shoes say it and so did she. Whatever she carried was cut out of her satchel and fed to a Chancery brazier before dawn. And the warrant for her was signed three days before anyone saw her. Someone was waiting for her."),
          when(is("namedTheTest"), [say("And this trial is not about her. It was never about her. It is about whether I will do as I am told, in front of all of you. The answer was written down this morning.")]),
          say("When I stop, there is a silence of a kind I have never heard in this hall. Not the silence of a court waiting. The silence of a court that has understood something and would give a great deal not to have."),
          when(trusts("padmavati", 2), [say("Padmavati's fan has stopped moving.")]),
          when(or(is("ugrasenSpeaks"), trusts("ugrasen", 2)), [say("Ugrasen, holding the wrapped sword, shifts his grip as though it has become heavier.")]),
          when(trusts("bhairav", 2), [say("Bhairav has closed his eyes.")]),
          line("bhanusen", "Everything you have said may be true."),
          line("bhanusen", "It changes nothing."),
        ],
        [
          say("I begin well and then I lose the thread of it — the shoes, the satchel, the warrant — and the pieces will not stand up in a line. I hear myself say ‘and also’ twice."),
          line("kaushal", "The prince is tired. It has been a long day for all of us."),
          line("bhanusen", "Enough. Whatever you meant to say, Arunveer, it would have changed nothing."),
          say("I believe him. That is the unbearable part. Even if I had said it perfectly, I believe him."),
        ],
      ),
    ],
  },

  // ───────────────────────────── 90 ─────────────────────────────
  {
    n: 90,
    id: "e090-the-last-light",
    chapter: 9,
    title: "अंतिम प्रकाश · The Last Light",
    location: "hall",
    objective: "Witness the prisoner brought to the mark",
    cast: [...HALL_CAST, "chaya", "karan"],
    beats: [
      say("The sun reaches the west window and comes through it flat and red, all the way across the floor to the foot of the throne. For a quarter of an hour, every day, this hall is the colour of what it is for."),
      say("They bring her in. Karan has her by one elbow, not roughly. Her hands are tied in front. She walks to the chalk mark as though she has walked to it many times, and kneels without being pushed."),
      say("A woman kneeling bound on the stone between us. The sentence was decided before I walked in. I think, now, it was decided before she did."),
      when(
        is("promisedChaya", "free"),
        [say("I promised this morning to get her out. The promise is kneeling on the stone with its hands tied.")],
      ),
      when(
        is("chayaFarewell", "refuse"),
        [say("She looks at me once. It is not a plea. It is a question she asked in the dungeon an hour ago, and I answered, and she is checking that the answer is still there.")],
        [
          when(
            is("chayaFarewell", "run"),
            [say("I told her to run. She said, not yet. She has not run. She kneels there as if not yet were a place, and she had arrived at it.")],
            [say("She does not look for me. She looks at the red floor in front of her as if reading it.")],
          ),
        ],
      ),
      choice("The last light is going. Where do you look?", [
        {
          label: "At her",
          fx: (s) => set("lastLook", "chaya")(trust("chaya", 1)(s)),
          then: [say("At her. Her scarf is the dark red of the floor. There is dust on her knees from a road I have never ridden. She is younger than I thought this morning, or I am older.")],
        },
        {
          label: "At the west window",
          fx: set("lastLook", "west"),
          then: [
            say("At the window. The sun is sitting on the western ridge like a coin on a thumb, about to be flipped."),
            when(has("decoded-fragment"), [say("The road west stays open. I do not know yet that I have read my own sentence in that line.")]),
          ],
        },
        {
          label: "At the king",
          fx: (s) => set("lastLook", "king")(stat({ ruthlessness: 1 })(s)),
          then: [say("At my father. He is watching the light, not her. He has timed this. Of course he has timed this.")],
        },
        {
          label: "At Ranadhir",
          fx: set("lastLook", "ranadhir"),
          then: [
            say("At my brother. He is looking at the doors."),
            when(flag("suspectsBrother"), [say("A token, a scent, a key. I have the whole shape of it and none of the meaning, and he is looking at the doors.")]),
          ],
        },
      ]),
      when(
        and(not(is("kaushalDeal")), statAt("ruthlessness", 6)),
        [say("Somewhere under my ribs, a small cold part of me measures the distance from the steps to the mark. Seven paces. I did not ask it to.")],
      ),
      say("The sun goes. The lamps are lit, all at once, by men who have been waiting with tapers. My father rises."),
    ],
  },
];
