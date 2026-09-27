export type ResourceType = "grain" | "textiles" | "metal" | "luxury";

export const RESOURCE_LABELS: Record<ResourceType, string> = {
  grain: "Grain",
  textiles: "Textiles",
  metal: "Metal",
  luxury: "Luxury Goods",
};

export interface Conflict {
  id: string;
  label: string;
  description: string;
  severity: 1 | 2 | 3;
  historicalOutcome: string;
}

export interface Stage {
  year: number;
  title: string;
  blurb: string;
  developments: string[];
  conflicts: Conflict[];
}

/**
 * Simplified for gameplay. The founding date (1336), Bahmani Sultanate's
 * founding (1347) and the Raichur Doab as the long-term flashpoint between
 * the two kingdoms are well-documented; specific skirmish details in
 * between are dramatized rather than sourced to a single battle.
 */
export const STAGES: Stage[] = [
  {
    year: 1337,
    title: "Securing the Riverbank",
    blurb:
      "The foundation stone is barely a year old. Vijayanagara is still more intention than city — a fort, a temple, and the loyalty of whoever chooses to show up.",
    developments: ["Hilltop fortification", "Tungabhadra irrigation channels", "First temple grants"],
    conflicts: [
      {
        id: "1337-chieftains",
        label: "Local Chieftains Test the New Authority",
        description:
          "Minor Deccan chieftains who served neither Kakatiya nor Hoysala loyally are waiting to see if this new court can actually protect them.",
        severity: 2,
        historicalOutcome:
          "Vijayanagara's early rulers combined force and incorporation, winning over chieftains piecemeal rather than through a single decisive campaign.",
      },
    ],
  },
  {
    year: 1342,
    title: "The Deccan Takes Notice",
    blurb:
      "Word of the river-city has spread. Some come to join it. Others — officers still nominally loyal to Delhi, scattered by the Sultanate's retreat from the region — come to test it.",
    developments: ["Standing garrison", "Trade agreements with coastal ports", "Court scribes and record-keeping"],
    conflicts: [
      {
        id: "1342-holdouts",
        label: "Sultanate Holdout Garrisons",
        description:
          "Isolated Sultanate garrisons, cut off from Delhi's shrinking Deccan authority, raid rather than negotiate.",
        severity: 2,
        historicalOutcome:
          "Delhi's grip on the Deccan continued to weaken through the 1340s; most isolated garrisons were absorbed or driven out rather than reinforced.",
      },
    ],
  },
  {
    year: 1347,
    title: "A Rival Is Born",
    blurb:
      "To the north, Ala-ud-Din Bahman Shah — another officer who broke from Muhammad bin Tughlaq's authority — founds his own independent kingdom: the Bahmani Sultanate. The Deccan now has two new powers instead of one.",
    developments: ["Diplomatic contact with Bahmani envoys", "Fortified northern border posts"],
    conflicts: [
      {
        id: "1347-bahmani",
        label: "A New Power on the Frontier",
        description:
          "The Bahmani Sultanate claims authority over the same borderlands Vijayanagara has spent a decade securing.",
        severity: 3,
        historicalOutcome:
          "Vijayanagara and the Bahmani Sultanate, born from the same Delhi collapse within eleven years of each other, became rivals almost immediately — a rivalry that would outlast both kingdoms' founders.",
      },
    ],
  },
  {
    year: 1350,
    title: "The Frontier Hardens",
    blurb:
      "The Raichur Doab — the fertile land between the Krishna and Tungabhadra rivers — sits between your kingdom and Bahman Shah's. Neither side is willing to concede it.",
    developments: ["Doab border fortifications", "A standing cavalry force"],
    conflicts: [
      {
        id: "1350-doab",
        label: "The Raichur Doab",
        description:
          "Both kingdoms claim this stretch of river-fed farmland. Whoever holds it controls the Deccan's richest agricultural base.",
        severity: 3,
        historicalOutcome:
          "The Raichur Doab remained contested between Vijayanagara and the Deccan Sultanates for the next two centuries — one of the longest-running border disputes in the region's history.",
      },
    ],
  },
];

export const HISTORICAL_BASELINE_PRESTIGE = 18;
export const HISTORICAL_SUMMARY =
  "Vijayanagara did not just survive its founding decade — it became the dominant power of the southern Deccan for two centuries, a bulwark against Sultanate expansion until its fall at Talikota in 1565. The Bahmani Sultanate rivalry founded in 1347, and the Raichur Doab dispute that came with it, defined Deccan politics for generations after both of you were gone.";
