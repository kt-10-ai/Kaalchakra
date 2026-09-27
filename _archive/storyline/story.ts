export interface Stats {
  loyalty: number; // to Delhi — high means the Sultanate still trusts me
  cunning: number; // nerve/guile — gates whether I can pull off deception
  piety: number; // standing with temples and the old order's moral language
  renown: number; // standing with Deccan chieftains, earned not appointed
}

export interface Flags {
  stats: Stats;
  legacy: "cautionary" | "inspiration" | null;
  ambition: "duty" | "doubt" | null;
  mercy: boolean | null;
  widow: "land" | "nothing" | null;
  trust: boolean | null;
  redeemed: boolean | null;
  approach: "diplomacy" | "military" | null;
}

const BASE_STATS: Stats = { loyalty: 5, cunning: 3, piety: 3, renown: 3 };

export const INITIAL_FLAGS: Flags = {
  stats: { ...BASE_STATS },
  legacy: null,
  ambition: null,
  mercy: null,
  widow: null,
  trust: null,
  redeemed: null,
  approach: null,
};

function adjust(f: Flags, delta: Partial<Stats>): Flags {
  const stats = { ...f.stats };
  for (const k of Object.keys(delta) as (keyof Stats)[]) {
    stats[k] = Math.max(0, Math.min(10, stats[k] + (delta[k] ?? 0)));
  }
  return { ...f, stats };
}

export function isFounderEnding(f: Flags): boolean {
  return f.trust === true || f.redeemed === true;
}

interface WalkStep {
  kind: "walk";
  x: number;
  era: string;
  condition?: (f: Flags) => boolean;
  text: (f: Flags) => string;
}

interface VideoStep {
  kind: "video";
  x: number;
  id: string; // maps to /videos/{id}.mp4 — falls back to text if missing
  title: string;
  fallback: (f: Flags) => string;
}

export interface ChoiceOption {
  label: string;
  apply: (f: Flags) => Flags;
  requires?: (f: Flags) => boolean;
  lockedReason?: string;
}

interface ChoiceStep {
  kind: "choice";
  x: number;
  id: string;
  condition?: (f: Flags) => boolean;
  prompt: (f: Flags) => string;
  options: ChoiceOption[];
}

interface EndingStep {
  kind: "ending";
  x: number;
}

export type Step = WalkStep | VideoStep | ChoiceStep | EndingStep;

export const STORY: Step[] = [
  {
    kind: "walk",
    x: -8,
    era: "1300 CE",
    text: () =>
      "I serve as a Sultanate-appointed officer, one of many sent to hold the Deccan after Malik Kafur's campaigns. It's meant to be a posting that ends in promotion, not trouble. My commander, Malik Nabi, has held this garrison for six years and speaks of Delhi the way other men speak of weather — something to endure, not question.",
  },
  {
    kind: "walk",
    x: 5,
    era: "1262-1289 CE — What Rudramadevi Built",
    text: () =>
      "The elders here still speak of Rani Rudramadevi, who ruled this kingdom in her own name and died defending it. What I'm garrisoning is what was left when that defense failed. Nobody I serve with talks about her. I've started to notice that.",
  },
  {
    kind: "choice",
    x: 10,
    id: "choice-legacy",
    prompt: () => "Something about Rudramadevi's story sits with me, uninvited.",
    options: [
      {
        label: "A cautionary tale — she defended a debt that was never hers to owe",
        apply: (f) => adjust({ ...f, legacy: "cautionary" }, { loyalty: 1, piety: 1 }),
      },
      {
        label: "The reason I don't trust orders that come from far away",
        apply: (f) => adjust({ ...f, legacy: "inspiration" }, { cunning: 1, renown: 1 }),
      },
    ],
  },
  {
    kind: "walk",
    x: 15,
    era: "Garrison Life",
    text: () =>
      "Most days here are administrative: tribute counted, roads patrolled, petitions filed and ignored. Malik Nabi likes to say a quiet district is a well-run one. I used to believe that meant something good was happening. Lately I'm less sure it just means nothing's been reported yet.",
  },
  {
    kind: "walk",
    x: 20,
    era: "1323 CE — The Ruins",
    text: () =>
      "Warangal fell. Its king was taken north in chains. I was told this was necessary. Standing in the wreckage, it looks less like necessity and more like erasure.",
  },
  {
    kind: "choice",
    x: 27,
    id: "choice-ambition",
    prompt: () =>
      "A letter arrives from Delhi commending the garrison's discipline. Malik Nabi is pleased. I'm not sure what I feel.",
    options: [
      {
        label: "Let it feel like the promotion I came here for",
        apply: (f) => adjust({ ...f, ambition: "duty" }, { loyalty: 2 }),
      },
      {
        label: "Notice that 'discipline' is Delhi's word for what I watched at Warangal",
        apply: (f) => adjust({ ...f, ambition: "doubt" }, { piety: 1, renown: 1 }),
      },
    ],
  },
  {
    kind: "video",
    x: 32,
    id: "01-inciting-incident",
    title: "The Order",
    fallback: () =>
      "My commander is blunt: a nearby village has stopped paying the new levy. Make an example of it — publicly — or the whole district will follow. He is not asking.",
  },
  {
    kind: "choice",
    x: 32,
    id: "choice-mercy",
    prompt: () => "The village is unarmed. My orders aren't ambiguous.",
    options: [
      {
        label: "Carry out the order",
        apply: (f) => adjust({ ...f, mercy: false }, { loyalty: 2, renown: -1 }),
      },
      {
        label: "Let them go quietly",
        apply: (f) => adjust({ ...f, mercy: true }, { loyalty: -1, piety: 1, renown: 1, cunning: 1 }),
      },
    ],
  },
  {
    kind: "walk",
    x: 42,
    era: "Aftermath",
    text: (f) =>
      f.mercy
        ? "I falsify the report. The village stands. Word of it moves quietly through the ranks — quiet enough, I hope, not to reach Delhi. A fellow officer, my brother Bukka, finds a reason to seek me out."
        : "The order is carried out. I am commended for it. It sits in me like a stone I swallowed. Bukka, my brother, garrisoned nearby, has heard what happened — and says nothing about it, which is its own kind of judgment.",
  },
  {
    kind: "walk",
    x: 48,
    era: "What Bukka Doesn't Say",
    text: (f) =>
      f.mercy
        ? "Bukka doesn't ask how I got the report past Nabi. He just looks at me a moment longer than usual, the way he used to when we were boys and one of us had done something the other hadn't decided yet whether to admire."
        : "Bukka and I don't talk about the village directly. We talk around it — supply routes, a horse he's trying to sell, anything. I keep waiting for him to say something. He keeps not saying it. I'm starting to understand that's the message.",
  },
  {
    kind: "video",
    x: 61,
    id: "02-vidyaranya-revelation",
    title: "What Vidyaranya Knows",
    fallback: () =>
      "A sage named Vidyaranya, head of the Sringeri monastery, seeks me out. He tells me plainly: Delhi's court has already discussed withdrawing support from the Deccan garrisons once the treasury here is exhausted. I was never meant to hold this land — only to bleed it before it's abandoned.",
  },
  {
    kind: "choice",
    x: 61,
    id: "choice-trust",
    prompt: (f) =>
      f.stats.cunning < 4
        ? "If Vidyaranya is right, my loyalty is being spent on a kingdom that has already written me off. Part of me wants to defect on the spot — but I've given this Sultanate no reason yet to doubt me, and no practice at deception."
        : "If Vidyaranya is right, my loyalty is being spent on a kingdom that has already written me off.",
    options: [
      {
        label: "Trust him — break with Delhi",
        requires: (f) => f.stats.cunning >= 4,
        lockedReason: "I haven't shown the nerve for this yet. (Needs Cunning 4+)",
        apply: (f) => adjust({ ...f, trust: true }, { loyalty: -3, piety: 2 }),
      },
      {
        label: "Report this as treason",
        apply: (f) => adjust({ ...f, trust: false }, { loyalty: 3, cunning: -1 }),
      },
    ],
  },
  {
    kind: "video",
    x: 68,
    id: "03-brothers-confrontation",
    title: "Bukka",
    fallback: (f) =>
      f.trust
        ? "Bukka is waiting for me at the river. He already knew — he's been in contact with Vidyaranya for weeks. 'I was going to ask you the same question,' he says. 'I'm glad I didn't have to ask it alone.'"
        : "Bukka is waiting for me at the river, and he already knows what I've decided to report. 'You'd hand him to them? After everything you just told me you watched them do to Warangal?' He isn't asking a hypothetical.",
  },
  {
    kind: "choice",
    x: 68,
    id: "choice-redeem",
    condition: (f) => f.trust === false,
    prompt: (f) =>
      f.stats.renown < 5
        ? "Bukka isn't moving. He's waiting to see if there's anything left to appeal to in me — but I've given him little to work with so far."
        : "Bukka isn't moving. This is the last moment the choice is still mine to make.",
    options: [
      {
        label: "Stand with Delhi anyway",
        apply: (f) => adjust({ ...f, redeemed: false }, { loyalty: 2 }),
      },
      {
        label: "He's right. Change my mind.",
        requires: (f) => f.stats.renown >= 5,
        lockedReason: "Bukka doesn't believe I mean it. (Needs Renown 5+)",
        apply: (f) => adjust({ ...f, redeemed: true }, { loyalty: -4, renown: 2 }),
      },
    ],
  },
  {
    kind: "walk",
    x: 88,
    era: "A Sanctuary — Or Not",
    text: (f) =>
      isFounderEnding(f)
        ? "Word moves faster than either of us expected. Scholars, artisans, refugees from Sultanate territory begin arriving at the river before there's even a wall to receive them."
        : "I send my report north. Delhi thanks me for my vigilance. Nothing changes for the refugees still arriving at the border I no longer control the meaning of.",
  },
  {
    kind: "choice",
    x: 95,
    id: "choice-widow",
    condition: (f) => isFounderEnding(f),
    prompt: () =>
      "A chieftain's widow from Dwarasamudra petitions me directly — not Bukka, me — for land to resettle her household. She has nothing left to offer but the fact that she asked.",
    options: [
      {
        label: "Grant it — a kingdom that doesn't protect widows isn't worth founding",
        apply: (f) => adjust({ ...f, widow: "land" }, { piety: 2, renown: 1 }),
      },
      {
        label: "Refer her to the treasury — I can't set that precedent yet",
        apply: (f) => adjust({ ...f, widow: "nothing" }, { cunning: 1, loyalty: 1 }),
      },
    ],
  },
  {
    kind: "walk",
    x: 95,
    era: "The Weight of a Report",
    condition: (f) => !isFounderEnding(f),
    text: () =>
      "I file petitions from people whose villages no longer exist under names Delhi still uses on its maps. I used to think paperwork was the boring part of this posting. I was wrong about which part was going to stay with me.",
  },
  {
    kind: "walk",
    x: 108,
    era: "1340s CE — Reassignment",
    condition: (f) => !isFounderEnding(f),
    text: () =>
      "I am reassigned deeper into Sultanate territory, further from the river, further from Bukka. The chieftains here submit to Delhi's tax collectors instead. It looks almost the same on a map.",
  },
  {
    kind: "choice",
    x: 108,
    id: "choice-approach",
    condition: (f) => isFounderEnding(f),
    prompt: () =>
      "Chieftains who once served Warangal or Dwarasamudra are watching to see what kind of power Bukka and I intend to be.",
    options: [
      {
        label: "Win them through marriage alliances and temple patronage",
        apply: (f) => adjust({ ...f, approach: "diplomacy" }, { piety: 2, renown: 1 }),
      },
      {
        label: "Win them by demonstrating I can hold what I've taken",
        apply: (f) => adjust({ ...f, approach: "military" }, { cunning: 2, renown: 1 }),
      },
    ],
  },
  {
    kind: "video",
    x: 125,
    id: isFounderPlaceholder("04-founding-climax", "05-loyalist-climax"),
    title: "What I Built",
    fallback: (f) => {
      if (isFounderEnding(f)) {
        const base =
          "On the riverbank near Hampi, at the sacred ground of Pampa-kshetra, Bukka and I lay the foundation stone together. Vidyaranya names it Vijayanagara — the City of Victory. It isn't a metaphor I feel entitled to yet. I'll grow into it.";
        const approach =
          f.approach === "military"
            ? " The chieftains who join us do so because they've seen what happens to the ones who didn't."
            : " The chieftains who join us do so because Bukka married into half of them and I funded the other half's temples.";
        const widow =
          f.widow === "land"
            ? " The widow from Dwarasamudra is among the first to resettle. I try to remember that when I'm tempted to think this city started with a foundation stone instead of with her."
            : "";
        const legacy =
          f.legacy === "inspiration"
            ? " Somewhere in this, I think, Rudramadevi would recognize what I'm doing."
            : " I try not to think about what Rudramadevi would say about a kingdom built on a soldier's defection.";
        return base + approach + widow + legacy;
      }
      const base =
        "News reaches me months later, secondhand: Bukka founded his city without me. They're calling it Vijayanagara. I stayed loyal to a Sultanate that, exactly as Vidyaranya warned, quietly stopped funding this garrison eighteen months later.";
      const legacy =
        f.legacy === "inspiration"
          ? " I think of Rudramadevi again, and for the first time it stings instead of inspires."
          : " I was right to be cautious, I tell myself. I am still here, holding a post no one back home remembers exists.";
      return base + legacy;
    },
  },
  { kind: "ending", x: 145 },
];

// The video id depends on the ending branch, but Step[] needs a fixed id per
// array position — resolved at render time via getVideoId() instead.
function isFounderPlaceholder(founderId: string, loyalistId: string) {
  return `${founderId}|${loyalistId}`;
}

export function getVideoId(step: VideoStep, flags: Flags): string {
  if (!step.id.includes("|")) return step.id;
  const [founderId, loyalistId] = step.id.split("|");
  return isFounderEnding(flags) ? founderId : loyalistId;
}
