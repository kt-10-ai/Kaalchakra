export interface ChronicleEntry {
  id: string;
  group: "court" | "road" | "truth";
  era: string;
  title: string;
  text: string;
}

/**
 * Every distinct thing a playthrough can reveal. One run cannot unlock all of
 * these — the branch-specific entries come in pairs and threes, and only one
 * of each is reachable per journey. Collected across playthroughs, persisted
 * client-side.
 */
export const CHRONICLE_ENTRIES: ChronicleEntry[] = [
  // ── The Court of Vajragarh ──
  {
    id: "the-hall",
    group: "court",
    era: "वज्रगढ़ · Vajragarh",
    title: "The Court of Vajragarh",
    text: "A mountain fortress of iron and hard country. King Bhanusen's hall, where sentences are decided before the accused is brought in.",
  },
  {
    id: "the-condemned",
    group: "court",
    era: "बंदिनी · The Condemned",
    title: "The Woman on the Floor",
    text: "A royal courier taken on the Meghadurg road and named a spy. Not a soldier — which raises the question of what she was carrying that a king wanted destroyed in front of witnesses.",
  },
  {
    id: "the-refusal",
    group: "court",
    era: "अस्वीकार · The Sword",
    title: "The Refusal",
    text: "Offered his father's own sword, hilt first, and ordered to execute a bound, unarmed woman. He set it down on the stone instead. The whole story proceeds from the sound it made.",
  },
  {
    id: "the-sentence",
    group: "court",
    era: "The Errand",
    title: "The Sentence",
    text: "“If you will not take one life at my word, take one of your own choosing.” Bring back the head of Shailendra of Meghadurg, and the throne passes over the elder brother's claim.",
  },
  {
    id: "ranadhir",
    group: "court",
    era: "The Brother",
    title: "Ranadhir at the Steps",
    text: "The favoured heir watched his brother's banishment without pleasure. He looked ill, and he kept glancing at the doors — as though waiting for something, or someone, that never arrived.",
  },

  // ── The Road West ──
  {
    id: "meal-hunted",
    group: "road",
    era: "Choice",
    title: "Hunted",
    text: "Two nights without bread, and he went into the forest rather than take from a farmhouse. Nobody owed him anything, and he behaved as though that were true.",
  },
  {
    id: "meal-begged",
    group: "road",
    era: "Choice",
    title: "Asked",
    text: "A prince knocking at a farmhouse door. They fed him and gave him coin, and word of it travelled west faster than he did.",
  },
  {
    id: "meal-stole",
    group: "road",
    era: "Choice",
    title: "Took the Goat",
    text: "The first thing he took because he could. His father would have called it the first sensible decision of his life.",
  },
  {
    id: "burned-country",
    group: "road",
    era: "The Border Villages",
    title: "The Burned Country",
    text: "Villages burned a season back, along their eastern walls. Meghadurg lies to the west. Fire does not come from the direction you are told to fear.",
  },
  {
    id: "chaya",
    group: "road",
    era: "छाया · The Courier",
    title: "Chaya",
    text: "The woman from the hall, alive on the western road. Carried Vajragarh's sealed post for ten years before she was dismissed without a reason. Somebody opened her cell the night of the sentencing, and she will not say who.",
  },
  {
    id: "chaya-trusted",
    group: "road",
    era: "Choice",
    title: "Asked How She Lived",
    text: "Nobody walks out of that hall. “Someone who could not be seen doing it,” she said — and then: “Ask yourself who told you Meghadurg killed your mother.”",
  },
  {
    id: "chaya-wary",
    group: "road",
    era: "Choice",
    title: "Left the Debt Unnamed",
    text: "She owed him her life and neither of them said so out loud. Twice she took a turning before he said which way they were going.",
  },
  {
    id: "crossing-bribe",
    group: "road",
    era: "Choice",
    title: "Paid the Toll Captain",
    text: "Clean and quick, and it left behind a man who could describe his face to anyone who asked later.",
  },
  {
    id: "crossing-smuggle",
    group: "road",
    era: "Choice",
    title: "Around It by Night",
    text: "Chaya led them past the border post in the dark by a track she never once had to look for.",
  },
  {
    id: "crossing-pilgrim",
    group: "road",
    era: "Choice",
    title: "Among the Pilgrims",
    text: "He walked past Meghadurg's guards in a column of the faithful, and not one of them looked up.",
  },
  {
    id: "meghadurg",
    group: "road",
    era: "मेघदुर्ग · Meghadurg",
    title: "Inside Meghadurg",
    text: "Irrigated fields and a better road than Vajragarh's. Eleven days west of a kingdom that has spent a decade calling this place the enemy.",
  },

  // ── What Was Actually True ──
  {
    id: "twist-quiet-country",
    group: "truth",
    era: "The Ford",
    title: "Quiet These Ten Years",
    text: "A traveller of thirty years on that road: no raid, no riders, and the road has never once closed. A raid closes a road. This one never closed.",
  },
  {
    id: "twist-the-letter",
    group: "truth",
    era: "The Climax",
    title: "The Sealed Letter",
    text: "In Queen Mrinalini's own hand, dated two years after Meghadurg's riders are supposed to have killed her. Chaya was dismissed for refusing to burn it.",
  },
  {
    id: "letter-believe",
    group: "truth",
    era: "Choice",
    title: "She's Alive",
    text: "Six years of grief, revealed as a story somebody decided to tell. The question stops being who killed her and becomes who needed her dead.",
  },
  {
    id: "letter-doubt",
    group: "truth",
    era: "Choice",
    title: "A Forgery",
    text: "Exactly what Shailendra would do — turn the assassin before he reaches the gate. Believing it might be the last mistake he makes.",
  },
  {
    id: "the-name",
    group: "truth",
    era: "The Payoff",
    title: "वह एक नाम · The Name She Said",
    text: "It was not a word. It was the name the letter is addressed to. Chaya was carrying the queen's post when they took her — which is why the king wanted her dead in front of the whole court, by the hand of the one son who might have asked why.",
  },
];

export const TOTAL_ENTRIES = CHRONICLE_ENTRIES.length;

export const GROUP_LABELS: Record<ChronicleEntry["group"], string> = {
  court: "The Court of Vajragarh",
  road: "The Road West",
  truth: "What Was Actually True",
};
