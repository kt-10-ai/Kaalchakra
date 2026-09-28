import { EPISODES } from "./episodes";
import { CAST, INITIAL_COURT } from "./cast";
import { CLUE_BY_ID } from "./clues";
import type { Beat, CharId, CourtState, EndingId, Option, Text, Topic } from "./types";

export type Phase = "chapter" | "walk" | "episode" | "ending" | "complete";

interface Frame {
  beats: Beat[];
  i: number;
}

export interface Toast {
  id: number;
  kind: "clue" | "trust-up" | "trust-down" | "suspicion" | "calm" | "supply";
  text: string;
}

export interface Run {
  state: CourtState;
  phase: Phase;
  stack: Frame[];
  /** Topics already asked in the talk currently open. */
  asked: string[];
  ending: EndingId | null;
  toasts: Toast[];
  /** Episodes completed this session, for the Case Book. */
  log: number[];
}

export const resolve = (t: Text, s: CourtState) => (typeof t === "function" ? t(s) : t);

const SAVE_KEY = "kaalchakra-court-v1";

export function loadSave(): CourtState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? (JSON.parse(raw) as CourtState) : null;
  } catch {
    return null;
  }
}

function save(s: CourtState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch {
    // no persistence available; the run still plays
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}

let toastId = 1;

/** Compare two states and describe what changed, for the little notices on screen. */
function diffToasts(a: CourtState, b: CourtState): Toast[] {
  const out: Toast[] = [];
  for (const id of b.clues) {
    if (!a.clues.includes(id)) out.push({ id: toastId++, kind: "clue", text: CLUE_BY_ID[id]?.title ?? id });
  }
  for (const k of Object.keys(b.trust) as CharId[]) {
    const d = (b.trust[k] ?? 0) - (a.trust[k] ?? 0);
    if (d === 0 || k === "narrator" || k === "arun") continue;
    const name = CAST[k as keyof typeof CAST]?.name ?? k;
    out.push({ id: toastId++, kind: d > 0 ? "trust-up" : "trust-down", text: d > 0 ? `${name} will remember that.` : `${name} thinks less of you.` });
  }
  if (b.suspicion > a.suspicion) out.push({ id: toastId++, kind: "suspicion", text: b.suspicion >= 7 ? "The king's men are very close now." : "Someone will report this." });
  if (b.suspicion < a.suspicion) out.push({ id: toastId++, kind: "calm", text: "Eyes drift elsewhere." });
  const dc = b.supplies.coin - a.supplies.coin;
  const df = b.supplies.food - a.supplies.food;
  if (dc) out.push({ id: toastId++, kind: "supply", text: `${dc > 0 ? "+" : ""}${dc} coin` });
  if (df) out.push({ id: toastId++, kind: "supply", text: `${df > 0 ? "+" : ""}${df} food` });
  return out;
}

/**
 * Run silent beats (fx, if) until something needs the player, or the episode
 * runs out, or an ending fires.
 */
function settle(run: Run): Run {
  let { state, stack } = run;
  stack = stack.map((f) => ({ ...f }));
  const before = run.state;
  let ending: EndingId | null = null;

  for (;;) {
    const top = stack[stack.length - 1];
    if (!top) break;
    if (top.i >= top.beats.length) {
      stack.pop();
      continue;
    }
    const beat = top.beats[top.i];
    if (beat.t === "fx") {
      state = beat.fx(state);
      top.i++;
      continue;
    }
    if (beat.t === "if") {
      top.i++;
      const branch = beat.cond(state) ? beat.then : (beat.else ?? []);
      if (branch.length) stack.push({ beats: branch, i: 0 });
      continue;
    }
    if (beat.t === "end") {
      ending = beat.ending;
      break;
    }
    break;
  }

  const toasts = [...run.toasts, ...diffToasts(before, state)];

  if (ending) return { ...run, state, stack: [], toasts, phase: "ending", ending };

  if (stack.length === 0 && run.phase === "episode") {
    // the episode is over
    const finished = EPISODES[state.episode];
    const next = { ...state, episode: state.episode + 1 };
    save(next);
    const log = finished ? [...run.log, finished.n] : run.log;
    if (next.suspicion >= 10) return { ...run, state: next, stack, toasts, log, phase: "ending", ending: "suspicion" };
    if (next.episode >= EPISODES.length) return { ...run, state: next, stack, toasts, log, phase: "complete" };
    const chapterChanged = finished && EPISODES[next.episode].chapter !== finished.chapter;
    if (chapterChanged && next.suspicion > 0) {
      // hours pass; the court finds other things to watch
      const eased = { ...next, suspicion: Math.max(0, next.suspicion - 3) };
      save(eased);
      return { ...run, state: eased, stack, log, asked: [], phase: "chapter", toasts: [...toasts, { id: toastId++, kind: "calm", text: "Hours pass. The court's attention drifts." }] };
    }
    return { ...run, state: next, stack, toasts, log, asked: [], phase: chapterChanged ? "chapter" : "walk" };
  }

  return { ...run, state, stack, toasts };
}

export type Action =
  | { type: "start" }
  | { type: "advance" }
  | { type: "choose"; option: Option }
  | { type: "ask"; topic: Topic }
  | { type: "leave" }
  | { type: "puzzle"; solved: boolean }
  | { type: "chapterDone" }
  | { type: "dismiss"; id: number };

export function currentFrame(run: Run) {
  return run.stack[run.stack.length - 1];
}

export function reduce(run: Run, a: Action): Run {
  switch (a.type) {
    case "start": {
      const ep = EPISODES[run.state.episode];
      if (!ep || run.phase !== "walk") return run;
      return settle({ ...run, phase: "episode", stack: [{ beats: ep.beats, i: 0 }], asked: [] });
    }
    case "advance": {
      const top = currentFrame(run);
      if (!top) return run;
      return settle({ ...run, stack: [...run.stack.slice(0, -1), { ...top, i: top.i + 1 }] });
    }
    case "choose": {
      const top = currentFrame(run);
      if (!top) return run;
      const state = a.option.fx ? a.option.fx(run.state) : run.state;
      const stack = [...run.stack.slice(0, -1), { ...top, i: top.i + 1 }];
      if (a.option.then?.length) stack.push({ beats: a.option.then, i: 0 });
      return settle({ ...run, state, stack, toasts: [...run.toasts, ...diffToasts(run.state, state)] });
    }
    case "ask": {
      // the talk beat stays current underneath; its reply plays on top
      return settle({ ...run, asked: [...run.asked, a.topic.id], stack: [...run.stack, { beats: a.topic.reply, i: 0 }] });
    }
    case "leave": {
      const top = currentFrame(run);
      if (!top) return run;
      return settle({ ...run, asked: [], stack: [...run.stack.slice(0, -1), { ...top, i: top.i + 1 }] });
    }
    case "puzzle": {
      const top = currentFrame(run);
      if (!top) return run;
      const beat = top.beats[top.i];
      if (beat.t !== "puzzle") return run;
      const branch = (a.solved ? beat.solved : beat.failed) ?? [];
      const stack = [...run.stack.slice(0, -1), { ...top, i: top.i + 1 }];
      if (branch.length) stack.push({ beats: branch, i: 0 });
      return settle({ ...run, stack });
    }
    case "chapterDone":
      return run.phase === "chapter" ? { ...run, phase: "walk" } : run;
    case "dismiss":
      return { ...run, toasts: run.toasts.filter((t) => t.id !== a.id) };
  }
}


export function newRun(initial: CourtState | null): Run {
  return { state: initial ?? INITIAL_COURT, phase: "chapter", stack: [], asked: [], ending: null, toasts: [], log: [] };
}
