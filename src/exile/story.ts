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
}

export const INITIAL_EXILE_FLAGS: ExileFlags = {
  stats: { ruthlessness: 2, cunning: 3, renown: 1 },
  supplies: { food: 1, coin: 0 },
  firstMeal: null,
  chaya: null,
  heardTheRumour: false,
  crossing: null,
  letter: null,
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

/** A cutscene. `clips` play back-to-back; any missing file falls back to its caption. */
interface SceneStep {
  kind: "scene";
  x: number;
  title: string;
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
  prompt: (f: ExileFlags) => string;
  options: ExileOption[];
}

interface EndStep {
  kind: "end";
  x: number;
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
    clips: [
      {
        id: "exile-06-chaya",
        caption: () =>
          "A woman at the crossroads shrine, watering a horse better than mine — and I know her before she turns around. Six days ago she was kneeling on my father's floor with her hands tied. She is not dead, and she is not surprised to see me. 'Chaya,' she says, as though I had asked.",
      },
    ],
  },
  {
    kind: "choice",
    x: 32,
    id: "chaya",
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
    x: 94,
    id: "crossing",
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
  { kind: "end", x: 146 },
];

/** Beats stretched onto the real road. */
export const EXILE_STORY: ExileStep[] = RAW_STORY.map((step) => ({
  ...step,
  x: step.x * WORLD_SCALE,
}));
