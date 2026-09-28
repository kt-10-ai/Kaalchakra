import type { Look } from "../exile/Characters";
import type { CharId, CourtState, Ending, LocationId } from "./types";

export interface Person {
  id: CharId;
  name: string;
  role: string;
  look: Look;
  /** Where they are when no episode needs them. */
  home: LocationId;
}

export const CAST: Record<Exclude<CharId, "narrator" | "arun">, Person> = {
  bhanusen: { id: "bhanusen", name: "King Bhanusen", role: "Ruler of Vajragarh. Your father.", home: "hall", look: { skin: "#8e5f3e", robe: "#3a1f1a", top: "#6e1f1a", head: "turban", headColor: "#c9a13a", beard: "#2a2420", cloak: "#2a1410", height: 1.86 } },
  ranadhir: { id: "ranadhir", name: "Ranadhir", role: "Your elder brother. The favoured heir.", home: "ranadhir", look: { skin: "#94613f", robe: "#1f2a3a", top: "#3a4a6a", head: "turban", headColor: "#e8dcc0", beard: "#1a1410", height: 1.82 } },
  chaya: { id: "chaya", name: "Chaya", role: "The prisoner. A dismissed royal courier.", home: "dungeon", look: { skin: "#a26c48", robe: "#2f3d52", top: "#435a73", head: "scarf", headColor: "#7d2a28", cloak: "#5a3a2a", height: 1.66 } },
  kaushal: { id: "kaushal", name: "Mantri Kaushal", role: "Chief Minister. Keeper of the seals.", home: "chancery", look: { skin: "#9a6a48", robe: "#2a2a2a", top: "#4a3a5a", head: "turban", headColor: "#2a2a2a", beard: "#9a9a9a", height: 1.74 } },
  ugrasen: { id: "ugrasen", name: "Senapati Ugrasen", role: "General of Vajragarh's army.", home: "barracks", look: { skin: "#7e5033", robe: "#4a3a2a", top: "#8c2f1e", head: "helmet", headColor: "#999", beard: "#5a5a5a", prop: "spear", height: 1.88 } },
  devashrava: { id: "devashrava", name: "Rajpurohit Devashrava", role: "Royal priest. Keeper of the rites.", home: "temple", look: { skin: "#a8744e", robe: "#e0762a", top: "#e88a36", head: "bare", headColor: "#222", beard: "#e8e4dc", prop: "staff", height: 1.7 } },
  vidyadhar: { id: "vidyadhar", name: "Vidyadhar", role: "The archivist. Half-blind. He taught you your letters.", home: "archive", look: { skin: "#8e5f3e", robe: "#d9d0bb", top: "#cfc4aa", head: "turban", headColor: "#efe9dc", beard: "#e8e4dc", prop: "staff", height: 1.6 } },
  sumitra: { id: "sumitra", name: "Sumitra", role: "Your mother's old nurse. Now in the kitchens.", home: "kitchens", look: { skin: "#8e5c3a", robe: "#8a3a3a", top: "#b8603a", head: "scarf", headColor: "#e8e0cc", height: 1.54 } },
  karan: { id: "karan", name: "Karan", role: "The gaoler.", home: "dungeon", look: { skin: "#8a5a3a", robe: "#3a3228", top: "#5a4a3a", head: "bare", headColor: "#222", beard: "#2a1d14", height: 1.76 } },
  nandini: { id: "nandini", name: "Nandini", role: "Your attendant. Sixteen, and misses nothing.", home: "chambers", look: { skin: "#a8744e", robe: "#3a5a8a", top: "#e8dcc0", head: "scarf", headColor: "#d9a441", height: 1.52 } },
  jaswant: { id: "jaswant", name: "Rao Jaswant", role: "Hill lord. Loudest voice for war with Meghadurg.", home: "barracks", look: { skin: "#8a5a3a", robe: "#5a2a1a", top: "#8a3a1a", head: "turban", headColor: "#b8452a", beard: "#1a1410", height: 1.84 } },
  padmavati: { id: "padmavati", name: "Rani Padmavati", role: "Widowed lady of Sonkot. Her house trades in salt.", home: "courtyard", look: { skin: "#b07a52", robe: "#6a1f3a", top: "#d9a13a", head: "scarf", headColor: "#e0b04a", cloak: "#3a1a2a", height: 1.64 } },
  bhairav: { id: "bhairav", name: "Thakur Bhairav", role: "Treasurer. Keeper of the counting house.", home: "treasury", look: { skin: "#9a6644", robe: "#3a4a2a", top: "#c9a24a", head: "turban", headColor: "#1f6a5a", height: 1.68 } },
  vikram: { id: "vikram", name: "Captain Vikram", role: "Captain of the border guard. He made the arrest.", home: "gate", look: { skin: "#8a5a3a", robe: "#6b3a22", top: "#8c2f1e", head: "helmet", headColor: "#999", prop: "spear", height: 1.8 } },
  moti: { id: "moti", name: "Moti", role: "The stable boy.", home: "stables", look: { skin: "#a8744e", robe: "#8a7a5a", top: "#b5a27a", head: "bare", headColor: "#222", height: 1.4 } },
  bhola: { id: "bhola", name: "Bhola", role: "An old soldier of the Third Company.", home: "barracks", look: { skin: "#7e5033", robe: "#4a3a2a", top: "#6b4a2a", head: "turban", headColor: "#5a4a3a", beard: "#9a9a9a", height: 1.72 } },
};

export const displayName = (id: CharId) => (id === "narrator" ? "" : id === "arun" ? "Arun" : CAST[id].name);

export const INITIAL_COURT: CourtState = {
  episode: 0,
  clues: [],
  flags: {},
  trust: { nandini: 1, sumitra: 1, vidyadhar: 2, moti: 1 },
  suspicion: 0,
  stats: { ruthlessness: 2, cunning: 3, renown: 1 },
  supplies: { food: 0, coin: 3 },
};

export const ENDINGS: Record<Ending["id"], Ending> = {
  obedient: {
    id: "obedient",
    label: "आज्ञाकारी · The Obedient Son",
    title: "A King Ends Things",
    body: () => [
      "The hall doesn't make a sound. I had expected it to — a gasp, a cry, anything — and instead there is only my father, nodding once, the way he nods at a ledger that balances.",
      "He named me heir before the blood was dry. Ranadhir did not argue. He did not look at me again, that night or ever, and a month later he rode west on some errand of his own and did not come back. I never learned where he went. I learned, years later, that he had been the only one in the hall who knew what she was carrying, and why she had to die by my hand in particular.",
    ],
    coda: () => "I ended one thing. Everything else I was going to be ended with it.",
  },
  "brother-betrayed": {
    id: "brother-betrayed",
    label: "विश्वासघात · The Brother Betrayed",
    title: "A Mountain Road",
    body: () => [
      "My father listened to all of it without interrupting, and thanked me, and sent me to my rooms. They took Ranadhir from his quarters before the lamps were lit. I heard that he didn't resist. I heard that he asked only whether I was safe, which I didn't understand, and then I did.",
      "The courier died at sunset by another man's hand, and there was no errand, and no sentence, and no road west. Three weeks later I was sent to inspect the passes, with an escort I didn't choose. The road was narrow and the drop was long, and the last thing I understood was that my brother had spent years standing between me and exactly this.",
    ],
    coda: () => "Nilkanth swallowed the poison so the world could live. I made him spit it out.",
  },
  suspicion: {
    id: "suspicion",
    label: "संदेह · Watched Too Closely",
    title: "The Quiet Accident",
    body: () => [
      "I asked one question too many, in front of one person too many. By the afternoon bell there were two of Kaushal's men at every door I walked through, and by the evening one of them was waiting on the stair to the walls.",
      "The court was told the prince had fallen, in the dark, on a stair he had climbed since he was four. The courier was executed at sunset by the Senapati. My brother wept at my pyre — the only one who did — and it was closed, like my mother's, before anyone could see my face.",
    ],
    coda: () => "There are two ways to be silenced in Vajragarh. I found the quicker one.",
  },
  "court-complete": {
    id: "court-complete",
    label: "वज्रगढ़ का दरबार समाप्त · The Court of Vajragarh",
    title: "The Gate Closes at Dawn",
    body: () => [],
    coda: () => "",
  },
};
