import type { Beat, CharId, Cond, CourtState, Fx, Option, Puzzle, Text, Topic } from "./types";

/** Authoring helpers. Episodes are written with these so they stay readable. */

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ── effects ──
export const gain =
  (...ids: string[]): Fx =>
  (s) => ({ ...s, clues: [...s.clues, ...ids.filter((id) => !s.clues.includes(id))] });

export const set =
  (key: string, value: string | number | boolean = true): Fx =>
  (s) => ({ ...s, flags: { ...s.flags, [key]: value } });

export const trust =
  (who: CharId, n: number): Fx =>
  (s) => ({ ...s, trust: { ...s.trust, [who]: clamp((s.trust[who] ?? 0) + n, -5, 5) } });

/** Rises are softened so one bold chapter isn't fatal; falls apply in full. Tuned by simulation. */
export const SUSPICION_GAIN = 0.8;
export const sus =
  (n: number): Fx =>
  (s) => ({ ...s, suspicion: clamp(s.suspicion + (n > 0 ? Math.max(1, Math.round(n * SUSPICION_GAIN)) : n), 0, 10) });

export const stat =
  (d: Partial<CourtState["stats"]>): Fx =>
  (s) => ({
    ...s,
    stats: {
      ruthlessness: clamp(s.stats.ruthlessness + (d.ruthlessness ?? 0), 0, 10),
      cunning: clamp(s.stats.cunning + (d.cunning ?? 0), 0, 10),
      renown: clamp(s.stats.renown + (d.renown ?? 0), 0, 10),
    },
  });

export const supply =
  (d: Partial<CourtState["supplies"]>): Fx =>
  (s) => ({
    ...s,
    supplies: { food: Math.max(0, s.supplies.food + (d.food ?? 0)), coin: Math.max(0, s.supplies.coin + (d.coin ?? 0)) },
  });

export const all =
  (...fx: Fx[]): Fx =>
  (s) =>
    fx.reduce((acc, f) => f(acc), s);

// ── conditions ──
export const has =
  (...ids: string[]): Cond =>
  (s) =>
    ids.every((id) => s.clues.includes(id));
export const hasAny =
  (...ids: string[]): Cond =>
  (s) =>
    ids.some((id) => s.clues.includes(id));
export const is =
  (key: string, value: string | number | boolean = true): Cond =>
  (s) =>
    s.flags[key] === value;
export const flag =
  (key: string): Cond =>
  (s) =>
    s.flags[key] !== undefined && s.flags[key] !== false;
export const trusts =
  (who: CharId, atLeast: number): Cond =>
  (s) =>
    (s.trust[who] ?? 0) >= atLeast;
export const statAt =
  (k: keyof CourtState["stats"], atLeast: number): Cond =>
  (s) =>
    s.stats[k] >= atLeast;
export const coin =
  (atLeast: number): Cond =>
  (s) =>
    s.supplies.coin >= atLeast;
export const suspicionAt =
  (atLeast: number): Cond =>
  (s) =>
    s.suspicion >= atLeast;
export const not =
  (c: Cond): Cond =>
  (s) =>
    !c(s);
export const and =
  (...cs: Cond[]): Cond =>
  (s) =>
    cs.every((c) => c(s));
export const or =
  (...cs: Cond[]): Cond =>
  (s) =>
    cs.some((c) => c(s));

// ── beats ──
export const say = (text: Text): Beat => ({ t: "say", text });
export const line = (who: CharId, text: Text): Beat => ({ t: "say", who, text });
export const fx = (...f: Fx[]): Beat => ({ t: "fx", fx: all(...f) });
export const choice = (prompt: Text, options: Option[]): Beat => ({ t: "choice", prompt, options });
export const talk = (who: CharId, intro: Text, topics: Topic[], done?: Text): Beat => ({ t: "talk", who, intro, topics, done });
/** A search is a talk with no one: the topics are places to look. */
export const search = (intro: Text, topics: Topic[], done?: Text): Beat => ({ t: "talk", who: "narrator", intro, topics, done });
export const puzzle = (p: Puzzle, solved: Beat[] = [], failed: Beat[] = []): Beat => ({ t: "puzzle", puzzle: p, solved, failed });
export const when = (cond: Cond, then: Beat[], otherwise: Beat[] = []): Beat => ({ t: "if", cond, then, else: otherwise });
