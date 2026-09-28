export interface ChronicleEntry {
  id: string;
  group: "court" | "road" | "meghadurg" | "truth";
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

CHRONICLE_ENTRIES.push(
  // ── Meghadurg ──
  { id: "the-open-gate", group: "meghadurg", era: "मेघदुर्ग · Meghadurg", title: "The Open Gate", text: "Not unguarded — open, the way a gate stands open in a city nobody has attacked in a generation. The captain on it knew he was coming, and knew Chaya better." },
  { id: "gate-true", group: "meghadurg", era: "Choice", title: "His True Name", text: "Arunveer, son of Bhanusen of Vajragarh — said aloud in the enemy's gate. It went up the street faster than he could walk." },
  { id: "gate-hidden", group: "meghadurg", era: "Choice", title: "Chaya's Servant", text: "The last disguise he would get. Nobody looked at him twice; several people looked at Chaya three times." },
  { id: "gate-asked", group: "meghadurg", era: "Choice", title: "Who Expected Him", text: "'The war council,' said the captain — the way men speak of a person, not a room." },
  { id: "the-market", group: "meghadurg", era: "हाट · The Market", title: "Nobody Makes War on a Customer", text: "Vajragarh's salt and Vajragarh's iron, sold in Meghadurg's square with the smiths' marks still on them. The enemy's swords were bought with his own father's ore." },
  { id: "market-paid", group: "meghadurg", era: "Choice", title: "One Coin", text: "He paid for a stolen loaf with his last coin. It wasn't justice. It was arithmetic." },
  { id: "market-vouched", group: "meghadurg", era: "Choice", title: "What You Owe", text: "He claimed a thief as his errand-boy, and a guard wrote his name down beside the debt. In Meghadurg a debt is written where anyone can read it." },
  { id: "market-walked", group: "meghadurg", era: "Choice", title: "Walked On", text: "One errand, and it wasn't this. The sound carried up the street a long way." },
  { id: "the-audience", group: "meghadurg", era: "सभा · The Audience", title: "Another King, Another Blade", text: "Shailendra sent his guards out, bowed his head, and had Chaya offer her knife hilt first — exactly as Bhanusen had offered his sword." },
  { id: "head-spared", group: "meghadurg", era: "Choice", title: "The Same Sound", text: "He set the knife down on the stone. The same sound, in a different hall." },
  { id: "head-proof", group: "meghadurg", era: "Choice", title: "Why He Wanted to Die", text: "He held the knife and asked. 'Because I am not his enemy,' said Shailendra. 'I am his elder cousin.'" },
  { id: "ending-errand", group: "meghadurg", era: "Ending", title: "The Errand Kept", text: "He took the head home in a grain sack and was not given the throne. The old man on the steps was the only one who could have proved what he was." },
  { id: "the-reunion", group: "meghadurg", era: "पुनर्मिलन · The Reunion", title: "The Sixth Person at the Table", text: "Five generals and a map of Vajragarh more detailed than any in Vajragarh. The sixth person turned around." },
  { id: "mother-accuse", group: "meghadurg", era: "Choice", title: "Six Years", text: "'You let me grieve you for six years.' 'Yes,' she said, and took it standing." },
  { id: "mother-ask", group: "meghadurg", era: "Choice", title: "Why?", text: "One word, and she decided how much it held. She didn't soften any of it." },
  { id: "mother-hold", group: "meghadurg", era: "Choice", title: "The Length of a Breath", text: "She let him, for one breath. Then she told him everything, the way you set a bone." },
  { id: "brother-owed", group: "meghadurg", era: "Choice", title: "Everything", text: "Every cold look on the steps was a gift. He'll try to come back for me." },
  { id: "brother-resent", group: "meghadurg", era: "Choice", title: "He Knew", text: "Saving someone isn't the same as trusting them. Ranadhir knew she was alive, and let him grieve." },
  { id: "path-war", group: "meghadurg", era: "Act Two", title: "Her War", text: "Twelve thousand men by spring, and between his mother's silence and his own, all of them." },
  { id: "path-warn", group: "meghadurg", era: "Act Two", title: "Home, to Warn Them", text: "'He won't believe you,' Chaya said, and meant his father, and was right. He went anyway." },
  { id: "path-settle", group: "meghadurg", era: "Act Two", title: "Two Letters, One Hand", text: "For the first time in twenty years, one courier carried the post of both houses." },
  // ── the twist ladder, continued ──
  { id: "twist-older-line", group: "truth", era: "Twist Three", title: "The Kingdoms Were One", text: "A generation ago there was one realm. Bhanusen, a general of a younger branch, took its throne in a single night; the older line fled west and built Meghadurg. The feud is a theft that never finished, dressed as grief." },
  { id: "twist-broken-wheel", group: "truth", era: "The Seal", title: "The Missing Spoke", text: "Meghadurg's seal is Vajragarh's seal with the wheel whole. On Bhanusen's, one of the eight spokes has been cut away." },
  { id: "twist-war-council", group: "truth", era: "Twist Four", title: "She Runs the War Council", text: "Queen Mrinalini was not rescued. She defected, and spent six years building the army meant to restore the older line." },
  { id: "twist-her-road", group: "truth", era: "Twist Five", title: "Her Road", text: "She found the papers of the coup; Bhanusen offered silence or her sons' lives. She made herself dead instead. She was exiled for refusing him — exactly as her son would be." },
  { id: "twist-ranadhir", group: "truth", era: "Twist Six", title: "Ranadhir's Letters", text: "The banishment was his idea: an impossible errand that looked like a punishment and got his brother out alive. He opened Chaya's cell. 'He's safe as long as he's hated.'" },
  { id: "twist-heir", group: "truth", era: "Twist Seven", title: "Heir to Both", text: "Through his father, the usurped throne; through his mother, the rightful one. The errand — bring me Shailendra's head — was an order to destroy his own claim." },
);

export const TOTAL_ENTRIES = CHRONICLE_ENTRIES.length;

export const GROUP_LABELS: Record<ChronicleEntry["group"], string> = {
  court: "The Court of Vajragarh",
  road: "The Road West",
  meghadurg: "Meghadurg",
  truth: "What Was Actually True",
};
