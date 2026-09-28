import type { CharId, Cond, CourtState, Episode, Fx } from "../types";
import { choice, fx, flag, has, hasAny, is, line, not, or, and, say, set, stat, statAt, supply, sus, trust, trusts, when } from "../dsl";

// ── local helpers ──
const ALLY_IDS: CharId[] = ["padmavati", "ugrasen", "devashrava", "bhairav", "vikram", "jaswant", "vidyadhar", "sumitra", "nandini"];
const allyCount = (s: CourtState) => ALLY_IDS.filter((id) => (s.trust[id] ?? 0) >= 2).length;
const alliesAt =
  (n: number): Cond =>
  (s) =>
    allyCount(s) >= n;

/** After the sword is down the sentence is already the ending; the Chancery no longer needs to watch. Keeps the canon ending from being pre-empted. */
const settle: Fx = (s) => ({ ...s, suspicion: Math.min(s.suspicion, 9) });

const brotherClose: Cond = or(is("brother", "follow"), trusts("ranadhir", 2));

const HALL_CAST: CharId[] = ["bhanusen", "kaushal", "ranadhir", "jaswant", "padmavati", "bhairav", "ugrasen", "devashrava", "vikram", "chaya", "karan"];

export const CHAPTER_10: Episode[] = [
  // ───────────────────────────── 91 ─────────────────────────────
  {
    n: 91,
    id: "e091-the-hilt",
    chapter: 10,
    title: "मूठ · The Hilt",
    location: "hall",
    objective: "Stand before the throne",
    cast: HALL_CAST,
    beats: [
      say("My father's hall. Every noble of Vajragarh lining the walls, and a woman kneeling bound on the stone between us — a royal courier, taken on the Meghadurg road. A spy, they said."),
      say((s) =>
        s.flags.stance === "defiant"
          ? "I decided on the walls to walk in as though I had nothing to apologise for. It is harder to keep on the stone than it was on the rampart. I keep it."
          : s.flags.stance === "grieving"
            ? "I decided on the walls not to hide what this costs. I do not hide it. The court looks at my face and then looks away, the way you look away from a man undressing."
            : s.flags.stance === "calm"
              ? "I decided on the walls to be calm. Calm is a thing you do with your hands and your breathing. I do it. Underneath it, nothing is calm at all."
              : "I have not decided how to stand. My body decides for me. It stands the way it was taught to stand in this hall, straight, and a little afraid.",
      ),
      say("Ugrasen comes up the length of the floor with the wrapped sword across both palms. He unwraps it at the foot of the steps. The red cloth falls. The blade takes the lamplight and holds it."),
      line("ugrasen", "Blessed, my king. Oiled and sharp."),
      say("My father comes down the steps. Not all of them. Three. He takes the sword from Ugrasen by the blade, with a cloth between his palm and the edge, and turns it, and holds it out to me."),
      say("King Bhanusen holds out his own sword, hilt first."),
      line("bhanusen", "A king ends things."),
      when(
        is("swordLesson", "learned"),
        [say("I know this sword. Ugrasen put it in my hands this morning and showed me where its weight lives. It lives a hand's width above the guard. I could find it with my eyes shut.")],
        [say("I have never held this sword. I refused to touch it this morning. It is a strange thing, to be offered the one object in the fortress you have promised yourself not to hold.")],
      ),
      choice("The hilt is a hand's length from your chest. Everyone is waiting for your hand.", [
        {
          label: "Reach for it",
          then: [
            say("I lift my hand. It stops a finger's width short of the grip, of its own accord, as though the air there were thicker."),
            say("My father does not move the sword closer. He never closes a distance someone else is supposed to close."),
          ],
        },
        {
          label: "Wait until he says it again",
          detail: "Make him say it twice, in front of all of them.",
          fx: (s) => set("hiltWait")(stat({ renown: 1 })(s)),
          then: [
            say("I do not reach. The hall waits. My father waits longer than the hall."),
            line("bhanusen", "A king ends things, Arunveer."),
            say("He says it exactly as he said it the first time. Not louder. He does not repeat himself so much as let you hear what you missed."),
          ],
        },
        {
          label: "Look at the hilt, not at him",
          fx: stat({ cunning: 1 }),
          then: [
            say("I look at the hilt. Wire-bound, dark with the sweat of three generations. At the pommel, the royal wheel, worn smooth. Seven spokes."),
            when(has("old-charters"), [say("Seven. Of course seven. Even his sword was cut to fit the story.")]),
          ],
        },
      ]),
    ],
  },

  // ───────────────────────────── 92 ─────────────────────────────
  {
    n: 92,
    id: "e092-end-this-one",
    chapter: 10,
    title: "इसे समाप्त करो · End This One",
    location: "hall",
    objective: "Hear the order",
    cast: HALL_CAST,
    beats: [
      line("bhanusen", "End this one."),
      say("Three words. He does not look at her while he says them. He does not need to. She is simply the next thing on the table."),
      say("She does not beg, and she does not look away from me."),
      when(
        is("chayaFarewell", "refuse"),
        [say("I promised her in the dungeon that I would refuse. She is not holding me to it. She is watching to see whether I hold myself.")],
      ),
      when(is("promisedChaya", "truth"), [say("I promised her this morning the truth would be said aloud in this hall. It has been. It changed nothing. She knew it wouldn't. She let me promise anyway.")]),
      say("My brother Ranadhir watches from the steps. He does not look pleased. He looks ill, and he keeps glancing at the doors."),
      when(
        is("brother", "follow"),
        [say("Then do exactly what Father asks tonight. That is what he told me this afternoon, when I said I would follow his lead. And then do exactly what he tells you after. I do not know which of those sentences he is watching the doors for.")],
      ),
      when(is("kaushalDeal"), [say("Kaushal, at the right of the throne, has folded his hands into his sleeves. He is not watching me. He is watching my father watch me. A bargain is a thing you check from the side.")]),
      choice("The sword is still held out. Where do your eyes go?", [
        {
          label: "Meet her eyes",
          fx: (s) => set("swordLook", "chaya")(trust("chaya", 1)(s)),
          then: [
            say("I meet her eyes. They are brown and entirely steady. There is no appeal in them, which is worse than an appeal. She is not asking me for anything. She is waiting to see who I am."),
            when(trusts("chaya", 3), [say("Very slightly, so that only I could see it, she shakes her head. I do not know whether it means don't, or it doesn't matter.")]),
          ],
        },
        {
          label: "Look at Ranadhir",
          fx: set("swordLook", "ranadhir"),
          then: [
            say("I look at my brother. He is looking at the doors. Then, for one breath, at me."),
            when(
              brotherClose,
              [say("His face gives nothing. His throat moves, once, as if he has swallowed something that will not go down.")],
              [say("His face gives nothing. He looks away first. He always did, when we were small and something had been broken and he knew who had done it.")],
            ),
            when(flag("suspectsBrother"), [say("A token, a scent, a key. He is looking at the doors as a man looks at a door he has already opened once tonight.")]),
          ],
        },
        {
          label: "Look at the king",
          fx: (s) => set("swordLook", "king")(stat({ ruthlessness: 1 })(s)),
          then: [
            say("I look at my father. He looks back. There is nothing in his face that I could name in front of a priest. Patience, perhaps. Interest."),
            when(has("king-test"), [say("If the boy cannot end one life, he has no business with a crown. He is not waiting for her death. He is waiting for my answer.")]),
          ],
        },
      ]),
    ],
  },

  // ───────────────────────────── 93 ─────────────────────────────
  {
    n: 93,
    id: "e093-the-weight",
    chapter: 10,
    title: "भार · The Weight",
    location: "hall",
    objective: "Take the sword",
    cast: HALL_CAST,
    beats: [
      say("I take it. I hold it long enough that the hall goes quiet."),
      say("Quieter than quiet. The lamp-wicks. A lord's ring against a pillar. Somewhere behind me, Bhairav breathing through his mouth."),
      when(
        is("swordLesson", "learned"),
        [say("The weight is where Ugrasen showed me. My wrist knows what to do with it before I do. That is the most frightening thing that has happened to me today.")],
        [say("It is heavier than it looks, and the weight is in the wrong place, further out than I expected. It wants to fall forward. It wants, I think, to be used.")],
      ),
      when(statAt("ruthlessness", 6), [say("Seven paces to the mark. One stroke. The cold small part of me has already done the sum and is waiting, politely, for the rest of me to agree.")]),
      choice("The sword is in your hand. The hall is waiting.", [
        {
          label: "Strike",
          detail: "End this one.",
          fx: (s) => set("swordAct", "struck")(stat({ ruthlessness: 3 })(s)),
          then: [
            say("I walk the seven paces. I do not remember deciding to. I remember the chalk under my boots, and the red scarf, and that she did not look away. Not once. Not even then."),
            when(
              is("swordLesson", "learned"),
              [say("It is one stroke, clean, the way Ugrasen showed me on the post. He was right. The body knows.")],
              [say("It is one stroke. I had been afraid it would take more. It does not.")],
            ),
            say("Afterwards I stand there holding the sword, and I cannot think what a person does with his hands next. Nobody tells me. Nobody in this hall has ever needed telling."),
            { t: "end", ending: "obedient" },
          ],
        },
        {
          label: "Set it down on the stone",
          detail: "Gently. Where everyone can see.",
          fx: set("swordAct", "down"),
          then: [
            say("And then I set it down on the stone."),
            say("I kneel to do it. Not to him. To the floor. I lay it flat, the edge turned away from her, and take my hand off it, and stand."),
          ],
        },
        {
          label: "Hand it back, hilt first",
          detail: "Give him his sword the way he gave it.",
          fx: (s) => set("swordAct", "returned")(stat({ renown: 1 })(s)),
          then: [
            say("I turn the sword in my hands, the way he turned it, and hold it out to him. Hilt first."),
            say("He looks at it. He does not take it. His hands stay at his sides. We stand there, the two of us, holding out and not holding, until my arm begins to shake."),
            say("I open my hand."),
          ],
        },
        {
          label: "Throw it at his feet",
          detail: "Let the whole hall hear what you think of it.",
          fx: (s) => set("swordAct", "thrown")(stat({ renown: 2, ruthlessness: 1 })(sus(3)(s))),
          then: [
            say("I throw it down at his feet. Not at him. Near enough that nobody could say it was at him. Near enough that nobody will ever say it wasn't."),
          ],
        },
      ]),
      fx(settle),
    ],
  },

  // ───────────────────────────── 94 ─────────────────────────────
  {
    n: 94,
    id: "e094-the-sound",
    chapter: 10,
    title: "ध्वनि · The Sound",
    location: "hall",
    objective: "Stand in the silence",
    cast: HALL_CAST,
    beats: [
      say((s) =>
        s.flags.swordAct === "thrown"
          ? "It strikes the stone point-first and skids and rings, and goes on ringing, and the sound it makes is the loudest thing I have ever heard."
          : s.flags.swordAct === "returned"
            ? "It falls between his hands and mine. Nobody catches it. The sound it makes on the stone is the loudest thing I have ever heard."
            : "The sound it makes is the loudest thing I have ever heard.",
      ),
      say("Iron on stone. A small sound, really. A kitchen sound. It goes up into the rafters of my father's hall and does not come down."),
      say((s) => {
        const bits: string[] = [];
        if ((s.trust.padmavati ?? 0) >= 2) bits.push("Padmavati closes her fan, very slowly, as if it were a door she did not want to slam.");
        if ((s.trust.ugrasen ?? 0) >= 2 || s.flags.ugrasenSpeaks) bits.push("Ugrasen lets out a breath he has been holding since the barracks.");
        if ((s.trust.bhairav ?? 0) >= 2) bits.push("Bhairav's lips are moving. He is counting something. I hope it is not me.");
        if ((s.trust.devashrava ?? 0) >= 2) bits.push("Devashrava's hand goes to his forehead, where the ash is.");
        if ((s.trust.vikram ?? 0) >= 2 || s.flags.vikramBroken) bits.push("By the door, Vikram has straightened, the way a soldier straightens for an officer.");
        if ((s.trust.jaswant ?? 0) >= 2 && s.flags.ledger !== "exposed") bits.push("Jaswant makes a noise in his throat, like a man who has been cheated at dice.");
        if (bits.length === 0) return "No one moves. No one looks at me. Along both walls the lords of Vajragarh study the floor, the rafters, their own rings — anything that will not later be asked what it saw.";
        return bits.join(" ");
      }),
      when(
        is("ledger", "exposed"),
        [say("Rao Jaswant, alone in his stride of empty stone, is staring at the sword as if it had been drawn on him.")],
      ),
      when(is("kaushalDeal"), [say("Kaushal's hands come out of his sleeves. That is all. For him it is a shout.")]),
      say((s) =>
        s.flags.stance === "defiant"
          ? "I keep my chin up. It is the only thing about me I am sure I can keep where I put it."
          : s.flags.stance === "grieving"
            ? "My eyes are wet. I let them be. The court may write down that the prince wept. It will be the truest thing in their ledger."
            : "My hands are still. I made them promise on the walls. They are keeping the promise better than the rest of me.",
      ),
      say("Chaya has not moved. She is looking at the sword on the stone. Then, for the first time today, she closes her eyes."),
      choice("The silence is yours to break, or to keep.", [
        {
          label: "“I will not end her.”",
          fx: (s) => set("swordWords", "will-not")(stat({ renown: 1 })(s)),
          then: [
            line("arun", "I will not end her. Not at your word. Not at anyone's."),
            say("My voice sounds very young in that hall. I had hoped it would not."),
          ],
        },
        {
          label: "“Find another hand.”",
          detail: "Colder. Your father's own register.",
          showIf: or(is("stance", "defiant"), statAt("ruthlessness", 4)),
          fx: (s) => set("swordWords", "another")(stat({ renown: 1, ruthlessness: 1 })(s)),
          then: [
            line("arun", "Find another hand, Father. You have a whole hall of them."),
            say("Along the walls, a whole hall of hands goes very still."),
          ],
        },
        {
          label: "“She was coming home.”",
          detail: "The whole case, in four words.",
          showIf: or(is("caseProven"), has("chaya-said-east")),
          fx: (s) => set("swordWords", "home")(trust("chaya", 1)(s)),
          then: [
            line("arun", "She was coming home."),
            say("It is not an argument. It is only the truth, and it lies on the stone next to the sword and does exactly as much."),
          ],
        },
        {
          label: "Say nothing",
          detail: "The sword has said it.",
          fx: (s) => set("swordWords", "nothing")(stat({ cunning: 1 })(s)),
          then: [say("I say nothing. The sword has said it. Anything I added would only be a smaller sound.")],
        },
      ]),
      fx(settle),
    ],
  },

  // ───────────────────────────── 95 ─────────────────────────────
  {
    n: 95,
    id: "e095-the-sentence",
    chapter: 10,
    title: "दंड · The Sentence",
    location: "hall",
    objective: "Hear your father's sentence",
    cast: HALL_CAST,
    beats: [
      say((s) =>
        s.flags.swordAct === "thrown"
          ? "My father looks down at the sword by his feet. Then he steps over it, the way you step over a dog asleep in a doorway, and comes down the last of the steps to me."
          : "My father looks at the sword on the stone for a long moment. He does not pick it up. He does not tell anyone else to. It will lie there, I understand, until he is finished with me.",
      ),
      say("My father does not shout. That is the worst of it."),
      when(
        is("caseProven"),
        [
          line("bhanusen", "You have proved her innocent. Very well. You have a gift for proof. Then go and prove me guilty, in Meghadurg."),
        ],
      ),
      when(
        is("draftExposed"),
        [line("bhanusen", "You found this in the Minister's desk before I could say it. So you know I am not inventing anything. I am only reading aloud.")],
      ),
      line(
        "bhanusen",
        "If you will not take one life at my word, then take one of your own choosing. Bring me the head of Shailendra of Meghadurg — the man whose riders killed your mother.",
      ),
      line("bhanusen", "Come back with it and the throne is yours over your brother's claim. Come back without it and do not come back."),
      say("Nobody in the hall breathes. Over your brother's claim. Three stairs up, my brother does not move at all."),
      when(
        hasAny("soldiers-bounty", "ugrasen-guilt", "soldier-confession"),
        [say("The man whose riders killed your mother. I have seen the ledger of what those riders were paid, and by whom. My father says the words without any change in his voice. He has had six years to practise them.")],
      ),
      when(
        has("king-draft"),
        [say("Having refused the king's justice, shall be sent west with nothing. I read it this afternoon in Kaushal's desk. It is strange to hear it aloud, in my father's voice, and find it has not improved.")],
      ),
      line("kaushal", "The prince will leave at dawn by the western gate. He takes no soldiers, no gold from the treasury, and no title. The court will not speak his name until he returns. If he returns."),
      choice("He is waiting. He wants to see what you do with it.", [
        {
          label: "“I will bring you what I find.”",
          detail: "Accept it. Word it carefully.",
          fx: (s) => set("sentenceAnswer", "find")(stat({ cunning: 1, renown: 1 })(s)),
          then: [
            line("arun", "I will go west, Father. And I will bring you back what I find there."),
            say("He hears exactly what I have not said. Something in his face approves of it. That is almost the worst thing that has happened today."),
          ],
        },
        {
          label: "Bow",
          detail: "As a son. As a subject. As whatever you are now.",
          fx: (s) => set("sentenceAnswer", "bow")(sus(-1)(s)),
          then: [say("I bow. Exactly as far as protocol requires, and not a hair further. I learned that from him this evening. He sees that I learned it.")],
        },
        {
          label: "Stand, and say nothing",
          fx: (s) => set("sentenceAnswer", "stand")(stat({ renown: 1 })(s)),
          then: [
            say("I do not bow. I do not speak. I stand in front of him and let him look at what he has made."),
            line("bhanusen", "Good. You will need that on the road."),
          ],
        },
      ]),
      fx(settle),
    ],
  },

  // ───────────────────────────── 96 ─────────────────────────────
  {
    n: 96,
    id: "e096-ranadhir-at-the-steps",
    chapter: 10,
    title: "सीढ़ियों पर भाई · Ranadhir at the Steps",
    location: "hall",
    objective: "Face your brother",
    cast: HALL_CAST,
    beats: [
      say("It is Ranadhir who breaks the silence. He comes down two stairs, so that he stands above me and beside our father, and he speaks to the whole hall."),
      line("ranadhir", "He was always hers. Soft hands, soft heart, a head full of her poems. Everyone in this court has known it for years and been too polite to say it. I am not polite."),
      line("ranadhir", "Let him go west and see what the west does to soft things. If he comes back, I will be glad to be wrong. I do not expect to be glad."),
      say("Someone along the wall laughs, shortly, and stops. Kaushal inclines his head to the heir, as to a man who has said the correct thing in the correct order."),
      when(
        brotherClose,
        [
          say("And I see his hands. He has clasped them behind his back so the court cannot see them, but I am below him and to the side, and I can. They are shaking."),
          say("Whatever I do tonight — hate me for it loudly. He said it in the colonnade an hour ago. He is doing it now. He is doing it very well."),
        ],
        [
          when(
            is("brother", "secret"),
            [say("I kept his secret this afternoon. I kept it from our father, from the court, from the Minister. I watch him spend it now, all at once, on my back, and I do not know what I bought.")],
            [say("His voice does not shake. Nothing about him shakes. He has always been better at this court than I am. I had not understood until now that it was a skill he practised.")],
          ),
        ],
      ),
      when(has("heir-proposed"), [say("The errand to Meghadurg — as the heir proposed. He proposed it. He is standing on the stair above it now, telling the court I will fail.")]),
      choice("He has finished. The hall is waiting to see if you answer him.", [
        {
          label: "Hate him loudly",
          detail: "Give the court the hatred it came to see.",
          fx: (s) => set("brotherParting", "loud")(stat({ renown: 1 })(s)),
          then: [
            line("arun", "You will make a fine king, Bhaiya. You have never once in your life been in danger of being wrong about anything."),
            say("It lands. I see it land, in the court. I see it land in him too, somewhere lower than the court can see."),
            when(brotherClose, [say("He looks at me as if I had done him a kindness, and then looks at the doors.")]),
          ],
        },
        {
          label: "Say nothing to him",
          fx: set("brotherParting", "silent"),
          then: [say("I say nothing. I look at him, and he looks at me, and it is the same look we have been giving each other across this hall for six years. We have had a great deal of practice.")],
        },
        {
          label: "Look at his hands",
          detail: "Let him see that you see.",
          showIf: brotherClose,
          fx: (s) => set("brotherParting", "hands")(trust("ranadhir", 1)(s)),
          then: [
            say("I look at his hands. Only that. Then I look up at his face."),
            say("For a breath he is not the heir. Then he turns his back on me, and goes up the stairs to stand by the throne, and does not look down again."),
          ],
        },
      ]),
      fx(settle),
    ],
  },

  // ───────────────────────────── 97 ─────────────────────────────
  {
    n: 97,
    id: "e097-nilkanth",
    chapter: 10,
    title: "नीलकंठ · Nilkanth",
    location: "hall",
    objective: "Watch them take her out",
    cast: HALL_CAST,
    beats: [
      line("kaushal", "The prisoner will be returned to her cell until the king names another hand."),
      say("Karan and two of the Chancery men lift her from the mark. She does not help them and she does not fight them. They have to drag her, and they do, down the long floor between the walls of lords."),
      say("Her path to the door runs past me. I do not step back."),
      say("As they drag her out she says one word to me."),
      line("chaya", "Nilkanth."),
      say((s) => {
        if (s.clues.includes("nilkanth-lullaby"))
          return "Nilkanth. The blue-throated one, who swallowed the poison so the world could live. Sumitra sang it over my bed and my brother's. I know what the word means. I do not know who it is.";
        if (s.clues.includes("nilkanth"))
          return "Nilkanth. The name from the Minister's brazier, from the ash. For Nilkanth, by the courier's hand. A name, I think, though not one I have ever heard anyone answer to.";
        return "A name, I think, though not one I have ever heard. She says it as if it were a gift, and as if I would know what to do with it.";
      }),
      when(
        hasAny("decoded-fragment", "courier-copy"),
        [say("Tell Nilkanth the boy asks questions. Get him out before the wheel turns. I have asked questions all day. The wheel has turned. I am being got out.")],
      ),
      when(
        has("ranadhir-flinch"),
        [say("I do not look at the rail where my brother's hand closed this afternoon. I do not look. I do not look so hard that I can feel exactly where it is.")],
      ),
      say("Then the doors close behind her, and the lamps shiver in the draught, and she is gone."),
      choice("The word is still in the air.", [
        {
          label: "Repeat it, silently",
          detail: "Keep it.",
          fx: (s) => set("keptName")(stat({ cunning: 1 })(s)),
          then: [say("I say it once, behind my teeth, where no one in the hall can hear. Nilkanth. I put it somewhere safe, next to her lesson and her letter and every other thing in this house that I was not supposed to find.")],
        },
        {
          label: "Look away",
          detail: "Let the court see nothing pass between you.",
          fx: sus(-1),
          then: [say("I look away, at the sword on the stone, as if nothing had been said to me at all. Kaushal is watching. I give him nothing to write down. I have learned that much today.")],
        },
      ]),
      line("bhanusen", "Take the prince to his rooms. He rides at dawn."),
      fx(settle),
    ],
  },

  // ───────────────────────────── 98 ─────────────────────────────
  {
    n: 98,
    id: "e098-taken-from-the-hall",
    chapter: 10,
    title: "दरबार से विदा · Taken from the Hall",
    location: "chambers",
    objective: "Go to your rooms under guard",
    cast: ["nandini"],
    beats: [
      say((s) =>
        s.flags.gateMen === "named"
          ? "Two of Kaushal's grey coats walk me to the east wing. One of them is Keshav. He keeps half a pace further back than he has to."
          : "Two of Kaushal's grey coats walk me to the east wing, one before and one behind, as if I might be tempted to take a wrong turning in the house I was born in.",
      ),
      say("My rooms have been gone through. Neatly. The chest lids are closed and nothing is broken, which is how you know it was the Chancery and not thieves."),
      line("nandini", "They said you may take one thing, my lord. One. They'll search the rest off you at the gate. I asked what counted as a thing. They said a thing."),
      when(
        trusts("nandini", 2),
        [say("Her voice is perfectly steady. Her hands are not. She has kept my notes since I was a boy, and she is looking at the Case Book on the table as if it were about to be taken out and executed.")],
      ),
      choice("One thing. What do you carry out of Vajragarh?", [
        {
          label: "The charter copy",
          detail: "Vidyadhar's gift. The wheel whole, eight spokes.",
          requires: is("charterCopy"),
          lockedReason: "You have no copy of the old charter.",
          fx: (s) => set("carried", "charter")(stat({ cunning: 1 })(s)),
          then: [
            say("I take the old charter copy, rolled tight in its oilcloth. Eight spokes on the seal. Carry the whole wheel, Vidyadhar said."),
            say("I do not know yet what it proves. I know it frightened a priest, and that my father's sword has one spoke fewer."),
          ],
        },
        {
          label: "Her letter",
          detail: "From the iron box under the blue stone.",
          requires: has("queens-box-letter"),
          lockedReason: "You never opened her box.",
          fx: (s) => set("carried", "letter")(stat({ renown: 1 })(s)),
          then: [
            say("I take her letter. Six years folded. Do not believe the manner of it. Believe the love."),
            say("And look after your brother — he is braver than he lets anyone see. I read that line three times, standing, with the grey coats in the door. Then I put it inside my shirt, against the skin."),
          ],
        },
        {
          label: "Her wheel, written out",
          detail: "The key, on a strip of paper: eight letters on.",
          requires: has("queen-lesson"),
          lockedReason: "You don't have her key.",
          fx: (s) => set("carried", "wheel")(stat({ cunning: 1 })(s)),
          then: [
            say("Her brass wheel is gone. But I remember her lesson. I draw the ring on a strip of paper, the alphabet twice around it, eight letters on. A whole wheel."),
            say("It is a small thing. The grey coat at the door glances at it and sees a boy's scribble. That is what she taught me it would look like."),
          ],
        },
        {
          label: "Sumitra's knife",
          detail: "Small, plain, sharp. Wrapped with the bread.",
          fx: (s) => set("carried", "knife")(stat({ ruthlessness: 1 })(s)),
          then: [
            say("I take the small kitchen knife Sumitra wrapped in cloth. A cook's knife, a hand long. It will not kill anyone who is expecting it. It will cut bread, and rope, and perhaps a way out."),
            say("She would have set the sword down too. I think of that, choosing a blade."),
          ],
        },
      ]),
      say("Nandini picks up the Case Book, weighs it, and puts it down. Then she picks it up again and slides it under her own shawl."),
      line("nandini", "Things that are mine aren't yours, my lord. They can't take what you aren't carrying."),
      fx(settle),
    ],
  },

  // ───────────────────────────── 99 ─────────────────────────────
  {
    n: 99,
    id: "e099-the-gate-at-dawn",
    chapter: 10,
    title: "भोर का द्वार · The Gate at Dawn",
    location: "gate",
    objective: "Go down to the western gate at dawn",
    cast: ["moti", "nandini", "vikram", "padmavati", "sumitra", "ugrasen", "bhairav", "devashrava", "vidyadhar"],
    beats: [
      say("Dawn, grey, the iron bell silent. It rang for her at this hour yesterday. It does not ring for me."),
      say("Moti has the grey at the gate. The Chancery men are there too, the same six, and they search me — boots, belt, sleeves — as though I were a merchant suspected of salt."),
      when(
        or(is("hiddenCoin"), is("gateMen", "named")),
        [
          when(
            is("hiddenCoin"),
            [say("They take my purse. It is empty. The coin is in the saddle skirt, flat under the leather, and nobody's hand goes there. My father taught me always to know where my money is.")],
            [say("Keshav does the searching. His hand passes over my purse, and pauses, and moves on. His mother sells ghee in the lower market. I will not forget it.")],
          ),
        ],
        [
          say("They take my purse, and count it aloud, and enter it in a ledger. No gold."),
          fx(supply({ coin: -99 })),
        ],
      ),
      when(
        or(is("padmavatiDeal"), trusts("padmavati", 2), is("giftPadmavati")),
        [
          say("Rani Padmavati's litter is at the gate, curtained. A hand comes out between the curtains and drops a small purse into Moti's cap as he passes. Salt money. It spends the same on either bank."),
          when(is("padmavatiDeal"), [line("padmavati", "The salt guild in Meghadurg. You'll ask for Hemlata at the sign of the two jars. Our bargain holds, Prince. So does my memory.")]),
          fx(supply({ coin: 2 })),
        ],
      ),
      when(
        is("giftBhairav"),
        [
          say("A small bag sits on the mounting block. Nobody put it there. The treasury has suffered one more loss, near the gate. Rats. Damp. Arithmetic."),
          fx(supply({ coin: 1 })),
        ],
      ),
      when(
        is("sumitraBread"),
        [
          say("Sumitra is at the kitchen postern with a bundle tied in her own shawl. Bread for a journey. She puts it in my hands and does not let go of them for a moment."),
          line("sumitra", "Two days if you're careful. You won't be careful. Eat the round one first."),
          fx(supply({ food: 2 })),
        ],
        [
          when(or(is("giftSumitra"), trusts("sumitra", 2)), [
            say("Sumitra sends a kitchen boy with a heel of bread and no message. The message is the bread."),
            fx(supply({ food: 1 })),
          ]),
        ],
      ),
      when(
        or(trusts("ugrasen", 2), is("giftUgrasen")),
        [
          say("Ugrasen does not come. A folded square of leather is in the saddlebag that was not there last night. The Company's map of the passes, with the watch-posts marked in soot, and a line along the old drovers' track that no Chancery map has ever shown."),
          fx(stat({ cunning: 1 })),
        ],
      ),
      when(
        is("giftDevashrava"),
        [say("A thread of red cotton has been tied to the grey's bridle. A traveller's blessing, older than this house. The rite says nothing about the hand.")],
      ),
      when(
        is("giftVidyadhar"),
        [say("Tucked under the saddle strap, a strip of old vellum in Vidyadhar's shaking hand: the names of the river fords, west to east, as they were before anyone renamed them. Something that travels better than he does.")],
      ),
      when(
        or(is("vikramBroken"), trusts("vikram", 2)),
        [
          say("Vikram is at the gatehouse door. He was told no soldiers, and he is a soldier, so he does not ride out with me. He puts his heels together and salutes, in front of the grey coats, and holds it."),
          when(is("giftVikram"), [line("vikram", "My road ends at the border stone, my lord. They didn't say I couldn't look down it.")]),
          fx(stat({ renown: 1 })),
        ],
      ),
      say("Moti holds the grey's head. His hand stays flat on the horse's neck the whole time, as though he could keep us both a moment longer by not letting go."),
      when(is("motiNosebag"), [line("moti", "Extra nosebag's on the left, my lord. Nobody told me not to.")]),
      when(
        or(trusts("nandini", 2), is("giftNandini")),
        [
          say("Nandini is by the wall, where a servant stands when she is carrying nothing and going nowhere. She is carrying my Case Book under her shawl."),
          line("nandini", "I'll keep watching, my lord. Someone should be at the gate who isn't paid to be. And someone should be here when you come back."),
        ],
      ),
      when(
        not(alliesAt(1)),
        [say("Nobody else comes. I did not expect them to. In Vajragarh that is not unkindness. It is arithmetic.")],
      ),
      say("Ranadhir is not there. As I put my foot in the stirrup I look up at the west wing, and a lamp in his window goes out."),
      when(
        brotherClose,
        [say("Not snuffed. Covered — a hand across the glass, and then taken away, and then dark. Or I want it to have been. I have wanted a great many things of my brother today.")],
      ),
      say("No soldiers. No gold. No title. They let me keep the horse, which I think was meant as a joke."),
      choice("Before you mount, the people at the gate are watching you.", [
        {
          label: "Thank them, aloud",
          detail: "The grey coats can write it down. You're leaving.",
          fx: stat({ renown: 1 }),
          then: [
            say((s) =>
              allyCount(s) >= 1
                ? "I thank them by name, one after another, in front of the Chancery men. It is the only thing I can give anyone this morning, and I give it where it will be seen."
                : "I thank Moti by name, in front of the Chancery men. He goes red to the ears. It is the only thing I can give anyone this morning.",
            ),
          ],
        },
        {
          label: "Mount without a word",
          detail: "Anything you say here is said to Kaushal.",
          fx: stat({ cunning: 1 }),
          then: [say("I say nothing to any of them. It is the kindest thing I can do. Anything I say at this gate is said to the Minister, and every name I speak is a name he will have a use for.")],
        },
      ]),
    ],
  },

  // ───────────────────────────── 100 ─────────────────────────────
  {
    n: 100,
    id: "e100-the-road-west",
    chapter: 10,
    title: "पश्चिम का मार्ग · The Road West",
    location: "gate",
    objective: "Ride out of the western gate",
    cast: ["moti", "vikram"],
    beats: [
      say("The bar comes up out of its brackets. The western gate opens outward, onto the road and the cold, and the first flat light comes through it the way it came through the hall window last night."),
      say("I ride through. The grey's shoes ring on the stone of the passage, and then they don't. Then it is dirt."),
      say((s) => {
        switch (s.flags.carried) {
          case "charter":
            return "Inside my coat, the old charter, rolled tight. Eight spokes. I carry the whole wheel out of a house that has been using seven for twenty-two years.";
          case "letter":
            return "Against my skin, her letter. Believe the love. Look after your brother. I am leaving him behind on a stair. I do not know yet how to do both.";
          case "wheel":
            return "In my sleeve, a strip of paper with a ring of letters on it. Eight letters on. A whole wheel. It is the only thing she ever taught me that the Chancery would not recognise as a weapon.";
          case "knife":
            return "At my belt, Sumitra's kitchen knife. My father offered me his sword, and I leave his house carrying a knife for cutting bread. I think she meant it that way.";
          default:
            return "I carry nothing out of Vajragarh but the horse and the word she gave me.";
        }
      }),
      say((s) =>
        s.flags.brother === "follow"
          ? "Do exactly what he tells you after. I told my brother I would follow his lead. I did not do what Father asked. I am doing what he told me after. I hope that is half of what Ranadhir meant."
          : s.flags.brother === "secret"
            ? "I kept my brother's secret. I do not know what it is. I am carrying it west anyway, with the bread and the name, and it is heavier than either."
            : "I think of my brother on the stair, and his voice in the hall, and I do not know what I think of him. I have eleven days of road to decide.",
      ),
      when(
        and(has("mountain-road"), not(is("brother", "follow"))),
        [say("An accident on a mountain road. That was the other plan, before this one was proposed. I am on a road now. I keep to the middle of it.")],
      ),
      say("Behind me I hear the great bar drop back into its brackets."),
      say("The gate closes behind me at dawn."),
      choice("The road runs west, down out of the hills.", [
        {
          label: "Look back",
          fx: set("lookedBack"),
          then: [
            say("I look back. The wall, the gate, the east wing where my rooms were. The balcony above the courtyard."),
            say("Someone is standing on it. As I turn, whoever it is steps back into the dark. It is the second time in a day I have seen that done, and I still do not know what it means."),
          ],
        },
        {
          label: "Don't look back",
          fx: set("lookedBack", false),
          then: [
            say("I don't look back. My father would call it strength. My mother would call it something else. I keep my eyes on the road, because it is the only thing in front of me that has not lied to me today."),
          ],
        },
      ]),
    ],
  },
];
