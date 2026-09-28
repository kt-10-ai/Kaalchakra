export type LocationId =
  | "chambers"
  | "courtyard"
  | "hall"
  | "dungeon"
  | "chancery"
  | "archive"
  | "kitchens"
  | "garden"
  | "temple"
  | "treasury"
  | "barracks"
  | "walls"
  | "stables"
  | "gate"
  | "ranadhir";

export type CharId =
  | "narrator"
  | "arun"
  | "bhanusen"
  | "ranadhir"
  | "chaya"
  | "kaushal"
  | "ugrasen"
  | "devashrava"
  | "vidyadhar"
  | "sumitra"
  | "karan"
  | "nandini"
  | "jaswant"
  | "padmavati"
  | "bhairav"
  | "vikram"
  | "moti"
  | "bhola";

export interface CourtState {
  /** Index into EPISODES of the next episode to play. */
  episode: number;
  clues: string[];
  flags: Record<string, string | number | boolean>;
  /** -5 … 5. How far each person is willing to go for Arun. */
  trust: Partial<Record<CharId, number>>;
  /** 0 … 10. How closely the king's men are watching Arun. At 10 the day ends badly. */
  suspicion: number;
  stats: { ruthlessness: number; cunning: number; renown: number };
  supplies: { food: number; coin: number };
}

export type Text = string | ((s: CourtState) => string);
export type Cond = (s: CourtState) => boolean;
export type Fx = (s: CourtState) => CourtState;

export interface Option {
  label: string;
  detail?: string;
  requires?: Cond;
  lockedReason?: string;
  /** Hide the option entirely (rather than showing it locked) when this fails. */
  showIf?: Cond;
  fx?: Fx;
  then?: Beat[];
}

export interface Topic {
  id: string;
  label: string;
  /** Topic appears only when this passes — e.g. has("some-clue") to present evidence. */
  requires?: Cond;
  /** The player cannot leave the conversation until every required topic is asked. */
  required?: boolean;
  reply: Beat[];
}

export type HandId = "queen" | "kaushal" | "ranadhir" | "vidyadhar" | "chaya" | "king" | "bhairav" | "clerk";

export interface SealSpec {
  label: string;
  /** Number of spokes drawn on the wheel (8 is whole). */
  spokes: number;
  /** Index (0-7) of a spoke cut away, if any. */
  cut?: number;
  wax: string;
  /** Dots around the rim. */
  border: number;
  cracked?: boolean;
  /** Drawn slightly off-centre / smudged — a hurried re-seal. */
  smudged?: boolean;
}

export type Puzzle =
  | {
      kind: "cipher";
      title: string;
      prompt: Text;
      /** Plain text, upper case A–Z and spaces/punctuation. The UI enciphers it by `shift`. */
      plain: string;
      shift: number;
      hint: Text;
    }
  | {
      kind: "order";
      title: string;
      prompt: Text;
      /** Given in the CORRECT order; the UI shuffles them. */
      pieces: string[];
      hint: Text;
    }
  | { kind: "seal"; title: string; prompt: Text; seals: SealSpec[]; answer: number; hint: Text }
  | {
      kind: "ledger";
      title: string;
      prompt: Text;
      columns: string[];
      rows: string[][];
      /** Row indices that must ALL be selected (and nothing else). */
      answer: number[];
      hint: Text;
    }
  | {
      kind: "hand";
      title: string;
      prompt: Text;
      sample: { text: string; hand: HandId };
      candidates: { label: string; text: string; hand: HandId }[];
      answer: number;
      hint: Text;
    }
  | {
      kind: "deduce";
      title: string;
      prompt: Text;
      /** Each slot is filled from the Case Book. `answer` is the clue id (or any of several). */
      slots: { q: string; answer: string | string[] }[];
      hint: Text;
    }
  | {
      kind: "testimony";
      title: string;
      witness: CharId;
      prompt: Text;
      /** Solve by presenting clue `breaks` against that statement. */
      statements: { text: string; press?: string; breaks?: string }[];
      hint: Text;
    }
  | {
      kind: "code";
      title: string;
      prompt: Text;
      /** Digits 0-9, e.g. "8712". */
      answer: string;
      hint: Text;
    };

export type Beat =
  | { t: "say"; who?: CharId; text: Text }
  | { t: "choice"; prompt: Text; options: Option[] }
  | { t: "talk"; who: CharId; intro: Text; topics: Topic[]; done?: Text }
  | { t: "puzzle"; puzzle: Puzzle; solved?: Beat[]; failed?: Beat[] }
  | { t: "fx"; fx: Fx }
  | { t: "if"; cond: Cond; then: Beat[]; else?: Beat[] }
  | { t: "end"; ending: EndingId };

export type EndingId = "obedient" | "brother-betrayed" | "suspicion" | "court-complete";

export interface Episode {
  /** 1-based episode number. */
  n: number;
  id: string;
  chapter: number;
  /** "देवनागरी · English" */
  title: string;
  location: LocationId;
  /** Shown in the HUD before the episode starts, e.g. "Find the stable boy". */
  objective: string;
  /** Who is physically present at the location for this episode (besides Arun). */
  cast: CharId[];
  beats: Beat[];
}

export interface Ending {
  id: EndingId;
  label: string;
  title: string;
  body: (s: CourtState) => string[];
  coda: (s: CourtState) => string;
}
