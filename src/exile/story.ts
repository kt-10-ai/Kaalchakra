export interface Stats {
  ruthlessness: number; // what he's willing to do — the thing his father says he lacks
  cunning: number; // surviving with nothing
  renown: number; // how the road's people speak of him
}

export interface Supplies {
  food: number;
  coin: number;
}

export interface ExileFlags {
  stats: Stats;
  supplies: Supplies;
  firstMeal: "hunted" | "begged" | "stole" | null;
  chaya: "trusted" | "wary" | null;
  heardTheRumour: boolean;
  crossing: "bribe" | "smuggle" | "pilgrim" | null;
  letter: "believe" | "doubt" | null;
  // ── Act Two ──
  gateName: "true" | "hidden" | "asked" | null;
  market: "paid" | "vouched" | "walked" | null;
  head: "spared" | "proof" | "taken" | null;
  mother: "accuse" | "ask" | "hold" | null;
  brother: "owed" | "resent" | null;
  path: "war" | "warn" | "settle" | null;
  /** Set when a choice ends the story early; the engine jumps to the matching end. */
  ending: "errand" | null;
}

export const INITIAL_EXILE_FLAGS: ExileFlags = {
  stats: { ruthlessness: 2, cunning: 3, renown: 1 },
  supplies: { food: 1, coin: 0 },
  firstMeal: null,
  chaya: null,
  heardTheRumour: false,
  crossing: null,
  letter: null,
  gateName: null,
  market: null,
  head: null,
  mother: null,
  brother: null,
  path: null,
  ending: null,
};

function adjust(
  f: ExileFlags,
  stats: Partial<Stats>,
  supplies: Partial<Supplies> = {}
): ExileFlags {
  const s = { ...f.stats };
  for (const k of Object.keys(stats) as (keyof Stats)[]) {
    s[k] = Math.max(0, Math.min(10, s[k] + (stats[k] ?? 0)));
  }
  const sup = { ...f.supplies };
  for (const k of Object.keys(supplies) as (keyof Supplies)[]) {
    sup[k] = Math.max(0, sup[k] + (supplies[k] ?? 0));
  }
  return { ...f, stats: s, supplies: sup };
}

interface WalkStep {
  kind: "walk";
  x: number;
  era: string;
  condition?: (f: ExileFlags) => boolean;
  text: (f: ExileFlags) => string;
}

/** Where the camera turns during a beat. Story-unit x; "companion" tracks Chaya. */
export type Focus = [number, number, number] | "companion" | "road";

/** A cutscene. `clips` play back-to-back; any missing file falls back to its caption. */
interface SceneStep {
  kind: "scene";
  x: number;
  title: string;
  focus?: Focus;
  /** Where to turn once the scene ends — used to face the road after the opening. */
  thenFace?: Focus;
  clips: { id: string; caption: (f: ExileFlags) => string }[];
}

export interface ExileOption {
  label: string;
  detail?: string;
  apply: (f: ExileFlags) => ExileFlags;
  requires?: (f: ExileFlags) => boolean;
  lockedReason?: string;
}

interface ChoiceStep {
  kind: "choice";
  x: number;
  id: string;
  condition?: (f: ExileFlags) => boolean;
  focus?: Focus;
  prompt: (f: ExileFlags) => string;
  options: ExileOption[];
}

interface EndStep {
  kind: "end";
  x: number;
  /** Early endings are reached by flag, not by walking. */
  ending?: ExileFlags["ending"];
  label: string;
  title: string;
  body: (f: ExileFlags) => string[];
  coda: (f: ExileFlags) => string;
}

export type ExileStep = WalkStep | SceneStep | ChoiceStep | EndStep;

/**
 * The journey is meant to read as eleven days on foot, so beats are authored at
 * comfortable relative spacing and then stretched by WORLD_SCALE. Change this
 * one number to make the road longer or shorter; worldData.ts uses the same
 * constant so scenery stays aligned to its beat.
 */
export const WORLD_SCALE = 3;

const RAW_STORY: ExileStep[] = [
  // ─────────────────────────────── 1. THE HALL ───────────────────────────────
  {
    kind: "scene",
    x: -10,
    title: "वज्रगढ़ का दरबार · The Court of Vajragarh",
    focus: [-20, 7, 0],
    clips: [
      {
        id: "exile-01-the-court",
        caption: () =>
          "My father's hall. Every noble of Vajragarh lining the walls, and a woman kneeling bound on the stone between us — a royal courier, taken on the Meghadurg road. A spy, they said. The sentence was decided before I walked in.",
      },
      {
        id: "exile-02-the-sword",
        caption: () =>
          "King Bhanusen holds out his own sword, hilt first. 'A king ends things,' he says. 'End this one.' She does not beg, and she does not look away from me. My brother Ranadhir watches from the steps. He does not look pleased. He looks ill, and he keeps glancing at the doors.",
      },
      {
        id: "exile-03-the-refusal",
        caption: () =>
          "I take it. I hold it long enough that the hall goes quiet. And then I set it down on the stone, and the sound it makes is the loudest thing I have ever heard.",
      },
      {
        id: "exile-04-the-sentence",
        caption: () =>
          "My father does not shout. That is the worst of it. 'If you will not take one life at my word,' he says, 'then take one of your own choosing. Bring me the head of Shailendra of Meghadurg — the man whose riders killed your mother. Come back with it and the throne is yours over your brother's claim. Come back without it and do not come back.'",
      },
      {
        id: "exile-05-the-road",
        caption: () =>
          "No soldiers. No gold. No title. They let me keep the horse, which I think was meant as a joke. As they drag her out she says one word to me — a name, I think, though not one I have ever heard. The gate closes behind me at dawn.",
      },
    ],
  },
  {
    kind: "walk",
    x: -8,
    era: "प्रथम दिवस · The First Day",
    text: () =>
      "Meghadurg is eleven days west on a good horse. I have one day of bread. Nobody in the hall said that part out loud, but everyone in it did the arithmetic.",
  },

  // ─────────────────────────────── 2. THE ROAD ───────────────────────────────
  {
    kind: "choice",
    x: 6,
    id: "first-meal",
    focus: [7, 2.2, -17],
    prompt: () =>
      "The bread is gone by the second night. There is a farmhouse off the road with a goat pen and one lamp burning, and there is forest on the other side, and I have never in my life had to solve this problem myself.",
    options: [
      {
        label: "Hunt the forest",
        detail: "Nobody owes you anything. Take nothing that belongs to someone.",
        apply: (f) => adjust({ ...f, firstMeal: "hunted" }, { cunning: 1 }, { food: 2 }),
      },
      {
        label: "Knock, and ask",
        detail: "A prince begging at a farmhouse door. Word travels — and travels both ways.",
        apply: (f) =>
          adjust({ ...f, firstMeal: "begged" }, { renown: 2 }, { food: 2, coin: 2 }),
      },
      {
        label: "Take the goat",
        detail: "They will not miss one. You are not in a position to be delicate.",
        apply: (f) =>
          adjust({ ...f, firstMeal: "stole" }, { ruthlessness: 2, cunning: 1, renown: -1 }, { food: 3 }),
      },
    ],
  },

  // ──────────────────────── 3. THE BURNED COUNTRY ───────────────────────────
  {
    kind: "walk",
    x: 20,
    era: "दग्ध भूमि · The Burned Country",
    text: (f) =>
      f.firstMeal === "stole"
        ? "A village, or what the fire left of it. Old burn — a season at least. I keep thinking about the farmer waking to one less goat, which is an absurd thing to be thinking about, standing in this. Nobody has told me yet whose army did it."
        : "A village, or what the fire left of it. Old burn — a season at least. I have spent my whole life hearing what Meghadurg's riders do to villages. But the burn runs along the eastern walls, and Meghadurg is west of here. Fire does not come from the direction you are told to fear.",
  },

  // ─────────────────────────────── 4. CHAYA ─────────────────────────────────
  {
    kind: "scene",
    x: 32,
    title: "छाया · Chaya",
    focus: "companion",
    clips: [
      {
        id: "exile-06-chaya",
        caption: () =>
          "A woman at the crossroads shrine, lighting a lamp to a god older than my father's house — and I know her before she turns around. Six days ago she was kneeling on my father's floor with her hands tied. She is not dead, and she is not surprised to see me. 'Chaya,' she says, as though I had asked.",
      },
    ],
  },
  {
    kind: "choice",
    x: 32,
    id: "chaya",
    focus: "companion",
    prompt: () =>
      "She carried Vajragarh's sealed post for ten years before they dismissed her, and she knows every road, toll and watched crossing between here and Meghadurg. She is going west. She suggests we go west together. She has not yet explained how she walked out of a death sentence.",
    options: [
      {
        label: "Ask how she got out of Vajragarh alive.",
        detail: "Nobody walks out of that hall. Somebody opened a door.",
        apply: (f) => adjust({ ...f, chaya: "trusted" }, { renown: 1, cunning: 1 }),
      },
      {
        label: "Don't ask. Some debts are better left unnamed.",
        detail: "She owes you her life. Naming it would spend it.",
        apply: (f) => adjust({ ...f, chaya: "wary" }, { cunning: 2 }),
      },
    ],
  },
  {
    kind: "walk",
    x: 48,
    era: "पश्चिम की ओर · Westward",
    text: (f) =>
      f.chaya === "trusted"
        ? "She would not tell me who opened her cell. She only said, 'Someone who could not be seen doing it' — and then, after a long while: 'You should ask yourself who told you Meghadurg killed your mother.' She has not said another word about it in three days."
        : "I did not ask, and she did not offer. Three days of her company, a debt neither of us has named out loud, and twice now she has taken a turning before I said which way we were going.",
  },

  // ────────────────────────── 5. THE FORD — TWIST 1 ─────────────────────────
  {
    kind: "scene",
    x: 64,
    title: "घाट का यात्री · The Traveller at the Ford",
    focus: [65.4, 0.9, 4.6],
    clips: [
      {
        id: "exile-07-the-ford",
        caption: () =>
          "An old man watering his mule at the crossing. He has walked this road thirty years, he says, and he talks the way people do when they have not had anyone to talk to in a while.",
      },
    ],
  },
  {
    kind: "choice",
    x: 64,
    id: "the-rumour",
    focus: [65.4, 0.9, 4.6],
    prompt: () =>
      "He asks where I'm bound. Meghadurg, I tell him. He makes a face. 'Shailendra's country. Quiet these ten years.' Quiet. He says it the way you say a thing everybody knows.",
    options: [
      {
        label: "Ten years? Meghadurg's riders killed my mother six years ago.",
        detail: "Say it plainly and watch what his face does.",
        apply: (f) => adjust({ ...f, heardTheRumour: true }, { renown: 1 }),
      },
      {
        label: "Say nothing. Let him talk.",
        detail: "People tell you more when you are not asking.",
        apply: (f) => adjust({ ...f, heardTheRumour: true }, { cunning: 2 }),
      },
    ],
  },
  {
    kind: "walk",
    x: 78,
    era: "उसने जो कहा · What He Said",
    text: (f) =>
      f.chaya === "trusted"
        ? "No raid. No riders. Not in his lifetime on this road — and he would know, he says, because a raid means the road closes, and this road has not closed in thirty years. Chaya listened to all of it without once looking surprised. That is the part I cannot put down."
        : "No raid. No riders. Not in his lifetime on this road — and he would know, he says, because a raid means the road closes, and this road has not closed in thirty years. He is an old man and old men misremember. I have been telling myself that for six miles.",
  },

  // ───────────────────────────── 6. THE BORDER ──────────────────────────────
  {
    kind: "choice",
    x: 88,
    id: "crossing",
    focus: [93, 2.5, 0],
    prompt: () =>
      "Meghadurg's border post. Three ways past it, and Chaya has an opinion about which — an opinion she states a little too quickly, which is the first thing she has done that I don't believe.",
    options: [
      {
        label: "Pay the toll captain to look elsewhere",
        detail: "Clean, quick, and it leaves a man who can describe your face.",
        requires: (f) => f.supplies.coin >= 1,
        lockedReason: "You have nothing to pay with. (Needs 1 coin)",
        apply: (f) => adjust({ ...f, crossing: "bribe" }, { renown: 1 }, { coin: -1 }),
      },
      {
        label: "Go around it by night, the way Chaya suggests",
        detail: "Unwatched, and it means trusting her route over your judgment.",
        requires: (f) => f.stats.cunning >= 5,
        lockedReason: "You'd be caught inside an hour. (Needs Cunning 5)",
        apply: (f) => adjust({ ...f, crossing: "smuggle" }, { cunning: 2 }),
      },
      {
        label: "Walk through openly, among the pilgrims",
        detail: "Nobody looks twice at another poor man walking west.",
        apply: (f) => adjust({ ...f, crossing: "pilgrim" }, { renown: 1, cunning: 1 }),
      },
    ],
  },
  {
    kind: "walk",
    x: 106,
    era: "सीमा के भीतर · Inside",
    text: (f) =>
      f.crossing === "bribe"
        ? "Inside Meghadurg's country, and a toll captain somewhere behind me with my face in his memory and my coin in his belt. The fields here are irrigated. The road is better than ours. That is its own kind of accusation."
        : f.crossing === "smuggle"
          ? "Chaya took us around the post in the dark by a track she did not have to look for once. Inside Meghadurg's country now. The fields here are irrigated. The road is better than ours."
          : "I walked past Meghadurg's border guards in a column of pilgrims and not one of them looked up. The fields here are irrigated. The road is better than ours. That is its own kind of accusation.",
  },

  // ─────────────────── 7. THE SEALED LETTER — TWIST 2 / CLIMAX ──────────────
  {
    kind: "scene",
    x: 120,
    title: "मुद्रांकित पत्र · The Sealed Letter",
    focus: "companion",
    clips: [
      {
        id: "exile-08-the-letter",
        caption: () =>
          "Chaya stops on the road and takes out something she has been carrying since the crossroads shrine — since four years before the crossroads shrine. A sealed letter she was ordered to destroy and didn't. 'I was dismissed for this,' she says. 'Not for losing it. For not burning it.'",
      },
    ],
  },
  {
    kind: "choice",
    x: 120,
    id: "letter",
    focus: [121, 0.6, -7.5],
    prompt: () =>
      "It is my mother's hand. I would know it anywhere; she taught me to write with it. And it is dated two years after Meghadurg's riders are supposed to have killed her.",
    options: [
      {
        label: "She's alive.",
        detail: "Six years of grief, and it was a story someone decided to tell you.",
        apply: (f) => adjust({ ...f, letter: "believe" }, { cunning: 1, renown: 1 }),
      },
      {
        label: "A forgery. Meghadurg wants me turned before I reach the gate.",
        detail: "It is exactly what you would do, if you were Shailendra.",
        apply: (f) => adjust({ ...f, letter: "doubt" }, { ruthlessness: 1, cunning: 1 }),
      },
    ],
  },
  {
    kind: "walk",
    x: 132,
    era: "वह एक नाम · The Name She Said",
    text: (f) =>
      f.letter === "believe"
        ? "The letter is addressed to a name I have never heard — and then I remember the word Chaya said as they dragged her out of the hall. It was not a word. It was this name. She was carrying my mother's post when they took her. That is why my father wanted her dead in front of the whole court, by my hand, and it is the one order I refused."
        : "Forgery or not, the hand is my mother's, and the letter is addressed to a name I have never heard. And then I remember the word Chaya said as they dragged her out of the hall. It was not a word. It was this name. Whatever else is true, my father wanted this woman dead in front of the whole court — and he wanted me to be the one to do it.",
  },

  // ═════════════════════════ ACT TWO — THE CONSPIRACY ═════════════════════════
  {
    kind: "scene",
    x: 146,
    title: "अंक दो — षड्यंत्र · Act Two — The Conspiracy",
    focus: [176, 14, 0],
    clips: [
      {
        id: "exile-09-act-two",
        caption: () =>
          "From the ridge, at first light: Meghadurg. Eleven days I have been walking toward the house of the man who killed my mother, and I have arrived believing neither half of that sentence.",
      },
    ],
  },
  {
    kind: "walk",
    x: 150,
    era: "भोर · First Light",
    text: (f) =>
      "The road down to the city is paved. Not the last mile, for show — all of it. Somebody here decided a long time ago that the road to their gate should be easy to walk. In Vajragarh we build the road to our gate so that an army on it can be seen a day away." +
      (f.chaya === "trusted"
        ? " Chaya has stopped taking turnings before I choose them. She doesn't need to. There is only one road now, and she has walked it more often than she will admit."
        : " Chaya walks half a step ahead of me now, and does not pretend otherwise."),
  },

  // ─────────────────────────── 8. THE GATE ───────────────────────────
  {
    kind: "scene",
    x: 162,
    title: "मेघदुर्ग का द्वार · The Gate of Meghadurg",
    focus: [168.6, 1.6, 4],
    clips: [
      {
        id: "exile-10-the-gate",
        caption: (f) =>
          "The gate is open. Not unguarded — open, the way a gate stands open in a city nobody has attacked in a generation. The captain on it looks at me for a long moment, and then past me. " +
          (f.crossing === "bribe"
            ? "'A toll captain on the eastern post sent word eight days ago,' he says. 'A young man, a Vajragarh voice, and a purse he emptied to get past. He described you well. He described the woman with you better.'"
            : f.crossing === "smuggle"
              ? "'You came around the eastern post at night,' he says, 'by the goat track under the second watchtower. We've known that track for four years. We've known who uses it.' He is looking at Chaya when he says it."
              : "'Pilgrims from the east,' he says. And then, to Chaya — not to me: 'You're late.'"),
      },
      {
        id: "exile-11-expected",
        caption: (f) =>
          f.firstMeal === "begged"
            ? "Then, to me: 'And you'll be the prince who knocks on farmhouse doors. That story got here before you did. People here liked it more than they'll tell you.'"
            : f.firstMeal === "stole"
              ? "Then, to me, quite civil: 'A farmer on the Vajragarh side lost a goat the night you passed. Nobody here will mention it to you. I thought you should know that nobody will mention it.'"
              : "Then, to me, perfectly civil: 'You're expected. You have been expected for some years.'",
      },
    ],
  },
  {
    kind: "choice",
    x: 162,
    id: "gate-name",
    focus: [168.6, 1.6, 4],
    prompt: () =>
      "He asks for a name to give the palace. It is a formality. Everyone on this gate already knows what it is.",
    options: [
      {
        label: "Arunveer, son of Bhanusen of Vajragarh.",
        detail: "Say it out loud in the enemy's gate, and let it be carried.",
        apply: (f) => adjust({ ...f, gateName: "true" }, { renown: 2 }),
      },
      {
        label: "Tell him I'm Chaya's servant.",
        detail: "Nobody looks at a servant. It's the last disguise you'll get.",
        apply: (f) => adjust({ ...f, gateName: "hidden" }, { cunning: 1 }),
      },
      {
        label: "Ask him who told him to expect me.",
        detail: "If this is a trap, it was built by someone who knew you'd come.",
        apply: (f) => adjust({ ...f, gateName: "asked" }, { cunning: 2 }),
      },
    ],
  },

  // ─────────────────────────── 9. THE MARKET ───────────────────────────
  {
    kind: "walk",
    x: 176,
    era: "हाट · The Market",
    text: (f) =>
      "Market day. Salt from our mines, sold in their square at twice what it costs in ours. Iron from our forges, with our smiths' marks still on it. Every sword my father ever told me Meghadurg raised against us was bought, I think, with our own ore. Nobody makes war on a customer. " +
      (f.gateName === "true"
        ? "Heads turn as I pass. The name went up the street ahead of me, faster than I can walk."
        : f.gateName === "hidden"
          ? "Nobody looks at me twice. Several people look at Chaya three times."
          : "'The war council,' the captain told me, when I asked who expected me. He said it the way men speak of a person, not a room, and it has followed me up the street."),
  },
  {
    kind: "choice",
    x: 186,
    id: "market",
    focus: [187, 1.1, 8.6],
    prompt: (f) =>
      "A boy of nine or ten ducks under a baker's awning and comes out with a loaf, and the baker has him by the collar before he's gone three steps. A city guard is already walking over. It isn't my city. It isn't my law." +
      (f.firstMeal === "stole"
        ? " I know exactly what that loaf is worth to him. I know exactly what it's worth to the baker, too."
        : ""),
    options: [
      {
        label: "Pay for the bread.",
        detail: "One coin. It isn't justice. It's arithmetic.",
        requires: (f) => f.supplies.coin >= 1,
        lockedReason: "You have nothing left to pay with. (Needs 1 coin)",
        apply: (f) => adjust({ ...f, market: "paid" }, { renown: 1 }, { coin: -1 }),
      },
      {
        label: "Tell the guard the boy was running an errand for you.",
        detail: "A lie, in a stranger's city, told to a man with a sword — and it puts your name on his debt.",
        apply: (f) => adjust({ ...f, market: "vouched" }, { renown: 2, cunning: 1 }),
      },
      {
        label: "Walk on. You can't carry every stolen loaf.",
        detail: "You have one errand. It isn't this.",
        apply: (f) => adjust({ ...f, market: "walked" }, { ruthlessness: 2 }),
      },
    ],
  },
  {
    kind: "walk",
    x: 196,
    era: "राजपथ · The Palace Road",
    text: (f) =>
      (f.market === "paid"
        ? "The baker took my last coin and looked at me as though I'd insulted him. The boy was gone before either of us turned round. I have no money now, anywhere in the world."
        : f.market === "vouched"
          ? "The guard wrote something on a wax tablet and let the boy go. When I asked what he'd written he said, 'Your name, and what you owe.' In Meghadurg, it seems, a debt is written down where anyone can read it."
          : "I didn't look back, and I didn't have to. The sound carried up the street a long way. Chaya didn't say anything. She didn't have to either.") +
      " The palace at the end of the street has towers, but no outer wall. I don't know what to make of a king who doesn't think he needs one.",
  },

  // ─────────────────────── 10. THE AUDIENCE ───────────────────────
  {
    kind: "scene",
    x: 218,
    title: "सभा · The Audience",
    focus: [222, 1.9, -6.5],
    clips: [
      {
        id: "exile-12-shailendra",
        caption: (f) =>
          "Shailendra of Meghadurg is older than I was told and thinner than I expected, and he does not rise from the steps of his throne when I come in, because I don't think he can. He looks at me the way you look at a letter you have been waiting on for a long time. 'You have her hands,' he says. I don't ask whose." +
          (f.stats.ruthlessness >= 6 ? " 'And his walk,' he adds. 'You came up my street the way your father would have.'" : ""),
      },
      {
        id: "exile-13-the-knife",
        caption: () =>
          "Then he does the one thing I hadn't prepared for. He sends his guards out. He takes off the chain of his office, bows his head, and moves the white hair away from the back of his neck with one old hand. 'You were sent for this,' he says. 'Chaya — give him your knife.' And Chaya holds it out to me hilt first, exactly the way my father held his sword.",
      },
    ],
  },
  {
    kind: "choice",
    x: 218,
    id: "the-head",
    focus: [222, 1.5, -6.5],
    prompt: () =>
      "Eleven days ago a king offered me a blade and told me that a king ends things. Here is another king, and another blade, and nobody left in the room to stop me. One stroke, and the throne of Vajragarh is mine over my brother's claim. That was the bargain.",
    options: [
      {
        label: "Take the knife. Finish the errand.",
        detail: "It's what you were sent to do. It's what he's asking you to do.",
        apply: (f) => adjust({ ...f, head: "taken", ending: "errand" }, { ruthlessness: 3 }),
      },
      {
        label: "Set it down on the stone. Again.",
        detail: "The same sound, in a different hall.",
        apply: (f) => adjust({ ...f, head: "spared" }, { renown: 2 }),
      },
      {
        label: "Take the knife — and ask him why he wants to die.",
        detail: "A man who offers his neck has already decided something. Find out what.",
        apply: (f) => adjust({ ...f, head: "proof" }, { cunning: 2, ruthlessness: 1 }),
      },
    ],
  },
  {
    kind: "end",
    x: 9999,
    ending: "errand",
    label: "कार्य सम्पन्न · The Errand Kept",
    title: "A King Ends Things",
    body: () => [
      "It is very quick. He doesn't make a sound, and neither does Chaya, and the silence afterward is worse than the sword on the stone ever was — because this time nothing follows it. Nobody comes in. Nobody raises an alarm. Standing there, I understand that he meant for nobody to.",
      "I carried his head home in a grain sack. It took eleven days. My father received it in the same hall, from the same throne, and thanked me, and did not give me the throne. He gave it to no one. He was dead within the year, and Ranadhir within three, and I learned too late — from a letter Chaya left at my door the night she disappeared — that the old man on those steps was the only living person who could have proved what I was.",
    ],
    coda: () => "A king ends things. I ended the one man who knew my name.",
  },
  {
    kind: "scene",
    x: 218,
    title: "पुरानी वंशावली · The Older Line",
    focus: [222, 1.5, -6.5],
    clips: [
      {
        id: "exile-14-the-older-line",
        caption: (f) =>
          f.head === "spared"
            ? "The knife lies on the floor between us. Shailendra looks at it for a long time, and then at me, and something in his face gives way that I think has been held up for twenty years. 'Your father would have used it,' he says. 'That is the whole difference between you. And it is why I can tell you the rest.'"
            : "I hold the knife and ask him why a king would want to die at the hands of his enemy's son. He laughs, which costs him — he coughs for a long while after. 'Because I am not his enemy,' he says. 'I am his elder cousin. And that chair in your father's hall was my father's, before your father took it.'",
      },
      {
        id: "exile-15-one-realm",
        caption: () =>
          "He tells it plainly. A generation ago there was no Vajragarh and no Meghadurg — one kingdom, one throne, in the mountains where my father's hall now stands. Bhanusen was a younger son of a younger branch, and a general, and he took the throne in a single night with the army he'd been given to defend it. The older line fled west to the river and built this. 'The feud was never about your mother,' Shailendra says. 'It is a theft that never finished, dressed up as grief so that a kingdom would keep paying for it.'",
      },
      {
        id: "exile-16-the-seal",
        caption: () =>
          "He shows me the seal of his house. It is my father's seal — the same mountain, the same wheel of eight spokes — except that on his, the wheel is whole. On ours, one spoke has been cut away. I have pressed that seal into wax a thousand times, and I never once asked what was missing from it.",
      },
    ],
  },
  {
    kind: "walk",
    x: 226,
    era: "चित्रशाला · The Long Gallery",
    text: (f) =>
      "A painted map runs the length of the gallery: the mountains, the river, the road I walked — and no border anywhere on it. Someone painted the border in afterward, in a different red, badly. Chaya stops in front of it and says, without looking at me, 'There's someone else you need to see. I was told to bring you when you were ready. I don't think you are. I don't think anyone would be.'" +
      (f.letter === "doubt" ? " 'You called the letter a forgery,' she adds. 'You're about to find out what it was.'" : ""),
  },

  // ─────────────────────── 11. THE REUNION ───────────────────────
  {
    kind: "scene",
    x: 235,
    title: "पुनर्मिलन · The Reunion",
    focus: [238, 1.6, 6.2],
    clips: [
      {
        id: "exile-17-the-war-room",
        caption: () =>
          "A room with no throne in it, only a table as long as a boat, and on the table a map of Vajragarh drawn in more detail than any map in Vajragarh — every gate, every garrison, every well. Six people stand around it. Five of them are generals. The sixth turns around, and I have spent six years trying to forget exactly this face, so that it would stop hurting.",
      },
      {
        id: "exile-18-mrinalini",
        caption: (f) =>
          "Queen Mrinalini is alive. She is not in mourning, she is not a prisoner, and she is not a woman who was rescued. She is the one the generals were waiting on to speak. 'Arun,' my mother says — and then, after a moment, as though reminding herself it's allowed: 'You grew.'" +
          (f.letter === "doubt" ? " And then: 'You called my letter a forgery. Good. I taught you to.'" : ""),
      },
    ],
  },
  {
    kind: "choice",
    x: 235,
    id: "mother",
    focus: [238, 1.6, 6.2],
    prompt: () =>
      "Six years. I built a whole life around the shape of the hole she left, and here she is, standing in it, with a pointer in her hand and my father's garrisons laid out in front of her.",
    options: [
      {
        label: "You let me grieve you for six years.",
        detail: "Say the true thing before you say anything kind.",
        apply: (f) => adjust({ ...f, mother: "accuse" }, { ruthlessness: 1, renown: 1 }),
      },
      {
        label: "Why?",
        detail: "One word. Let her decide how much it holds.",
        apply: (f) => adjust({ ...f, mother: "ask" }, { cunning: 2 }),
      },
      {
        label: "Cross the room and hold her.",
        detail: "Whatever she is now, she was your mother first.",
        apply: (f) => adjust({ ...f, mother: "hold" }, { renown: 1 }),
      },
    ],
  },
  {
    kind: "walk",
    x: 235.5,
    era: "वह क्यों गई · Why She Left",
    text: (f) =>
      (f.mother === "accuse"
        ? "'Yes,' she says. She doesn't apologise, and she doesn't look away, and I realise she has waited six years to be accused of this and decided to take it standing. "
        : f.mother === "hold"
          ? "She lets me, for the length of one breath. Then she steps back, takes both my hands, and tells me — the way you set a bone: fast, so it's done. "
          : "She tells me, and she doesn't soften any of it. ") +
      "She found the papers of the coup: the orders, in Bhanusen's hand, for the night he took the throne. She took them to him. He didn't deny it. He gave her a choice — silence, or her sons would not live to be grown. She chose a third thing. She made herself dead and went west, because a king does not murder the sons of a wife who is already buried. 'I was exiled for refusing him,' she says. 'So were you. You've been walking my road the whole way here, Arun, and I had no way to tell you it went anywhere.'",
  },

  // ─────────────────────── 12. RANADHIR'S LETTERS ───────────────────────
  {
    kind: "scene",
    x: 240,
    title: "रणधीर के पत्र · Ranadhir's Letters",
    focus: "companion",
    clips: [
      {
        id: "exile-19-the-letters",
        caption: (f) =>
          f.chaya === "trusted"
            ? "Chaya takes out a second bundle, tied with a courier's knot, and puts it into my hands herself. 'I told you someone opened a door,' she says. 'You asked me who. This is who.'"
            : "My mother holds out her hand to Chaya, and after a moment Chaya puts a second bundle into it — tied with a courier's knot, carried eleven days without a word. 'You never asked,' Chaya says to me, and I can't tell if it's an apology or an accusation.",
      },
      {
        id: "exile-20-ranadhir",
        caption: () =>
          "The letters are in my brother's hand. The first is dated six weeks before the hall. Our father had decided I was asking too many questions about our mother; I was to have an accident on a mountain road. Ranadhir wrote to her that he had found another way — an errand so impossible it would look like a punishment and not an execution, one that would get me out of the capital alive and send me straight to her. He opened Chaya's cell the night before my sentence. He had her put on my road. Every cold look on those steps was a man making sure his father believed him.",
      },
      {
        id: "exile-21-brother",
        caption: () =>
          "The last letter is short. 'He's safe as long as he's hated. So I'll make sure he's hated, and I'll make sure I'm the one who hates him loudest. Don't tell him. He'll try to come back for me.'",
      },
    ],
  },
  {
    kind: "choice",
    x: 240,
    id: "brother",
    focus: [238, 1.6, 6.2],
    prompt: () =>
      "My brother. Whom I have been hating, carefully, for eleven days, because it was easier than the alternative. Who is still in that hall with our father, alone, playing a part he wrote to keep me alive.",
    options: [
      {
        label: "He saved my life. I owe him everything.",
        detail: "Every cold look was a gift. Carry that into whatever comes.",
        apply: (f) => adjust({ ...f, brother: "owed" }, { renown: 1 }),
      },
      {
        label: "He knew she was alive. He let me grieve anyway.",
        detail: "Saving someone isn't the same as trusting them.",
        apply: (f) => adjust({ ...f, brother: "resent" }, { ruthlessness: 1, cunning: 1 }),
      },
    ],
  },

  // ─────────────────────── 13. THE OFFER ───────────────────────
  {
    kind: "scene",
    x: 243,
    title: "शैलेंद्र का प्रस्ताव · Shailendra's Offer",
    focus: [240.5, 1.4, 3.2],
    clips: [
      {
        id: "exile-22-the-offer",
        caption: () =>
          "Shailendra is carried in on a chair, and the generals make room for him at the table. He has brought the knife I was meant to use; he lays it on the map, on Vajragarh. 'Twelve thousand men by spring,' he says. 'Your mother has spent six years gathering them. With you at the front — Bhanusen's own son, marching to undo his father's theft — half of Vajragarh's garrisons will open their gates without a fight.'",
      },
      {
        id: "exile-23-the-cough",
        caption: () =>
          "He coughs into a cloth and folds it before anyone can see what's on it, and I see it anyway. My mother sees me see it. Neither of us says a word. 'March east,' she says. 'End it. You're the only one who can end it without every village on that road burning twice.'",
      },
    ],
  },
  {
    kind: "choice",
    x: 243,
    id: "path",
    focus: [238, 1.6, 6.2],
    prompt: (f) =>
      "My mother's war. My father's throne. My brother in the middle, who will command whatever army is sent to meet us. Everyone in this room has decided what I am for. " +
      (f.brother === "owed"
        ? "I keep thinking of the last line of his letter. He'll try to come back for me."
        : "I keep thinking that he knew, and let me walk."),
    options: [
      {
        label: "March east with her army.",
        detail: "End the usurpation the way it began: by force, in a single season.",
        apply: (f) => adjust({ ...f, path: "war" }, { ruthlessness: 2 }),
      },
      {
        label: "Refuse — and ride home to warn Vajragarh.",
        detail: "Your brother is in that hall. You won't come home at the head of the army sent to kill him.",
        apply: (f) => adjust({ ...f, path: "warn" }, { renown: 1 }),
      },
      {
        label: "Force a settlement between the two houses.",
        detail: "Neither house wants it. Make them sit at the same table anyway.",
        requires: (f) => f.stats.renown >= 6,
        lockedReason: "Nobody in either house would listen to you yet. (Needs Renown 6)",
        apply: (f) => adjust({ ...f, path: "settle" }, { renown: 1, cunning: 1 }),
      },
    ],
  },
  {
    kind: "end",
    x: 246,
    label: "अंक दो समाप्त · End of Act Two",
    title: "The Broken Wheel",
    body: (f) => [
      f.path === "war"
        ? "We march in the spring. My mother rides beside me and does not speak of my father, and I do not speak of my brother, and between the two silences there are twelve thousand men."
        : f.path === "warn"
          ? "I leave before dawn, on a better horse than the one I came with. Chaya doesn't try to stop me. She only says, 'He won't believe you,' and she means my father, and she's right, and I go anyway."
          : "I write two letters on the same night, in the same hand, to two kings who each believe the other a thief. Chaya carries both. It is the first time in twenty years that one courier has carried the post of both houses.",
      "Shailendra died nine days later, before anything could be answered. His will was read in the war room with the map still on the table. It named his heir in a single line, and every general in the room turned to look at me — because my mother is of the older line, and I am her son, and the man my father sent me to kill was the last living person who could prove it.",
    ],
    coda: () =>
      "Bring me the head of Shailendra, my father said. He was sending me to cut off my own claim, and calling it a gift.",
  },
];

/** Beats stretched onto the real road. */
const scaleFocus = (f: Focus | undefined): Focus | undefined =>
  f === undefined || typeof f === "string" ? f : [f[0] * WORLD_SCALE, f[1], f[2]];

export const EXILE_STORY: ExileStep[] = RAW_STORY.map((step) => {
  const out = { ...step, x: step.x * WORLD_SCALE };
  if (out.kind === "scene") return { ...out, focus: scaleFocus(out.focus), thenFace: scaleFocus(out.thenFace) };
  if (out.kind === "choice") return { ...out, focus: scaleFocus(out.focus) };
  return out;
});
