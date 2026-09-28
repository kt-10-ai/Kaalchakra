/**
 * The court story as a headless module for the Unity port. Unity embeds a JS
 * interpreter, loads this bundle, and talks to it through `KC` with JSON
 * strings: it asks what should be on screen and reports what the player did.
 * All story logic stays here, identical to the web build.
 */
import { CAST, ENDINGS, INITIAL_COURT } from "./cast";
import { CLUES } from "./clues";
import { currentFrame, newRun, reduce, resolve, type Run } from "./engineCore";
import { CHAPTERS, EPISODES } from "./episodes";
import { COLLIDERS, PLACES, RAMPART, START, WALL_HALF } from "./locations";
import { hourFor, stage } from "./staging";
import type { CourtState, Option, Topic } from "./types";

let run: Run = newRun(null);

const nameOf = (id?: string) => (!id || id === "narrator" ? "" : id === "arun" ? "Arun" : (CAST[id as keyof typeof CAST]?.name ?? id));

function visibleOptions(options: Option[], s: CourtState) {
  return options.filter((o) => !o.showIf || o.showIf(s));
}
function visibleTopics(topics: Topic[], s: CourtState) {
  return topics.filter((t) => !t.requires || t.requires(s));
}

function beatView() {
  const top = currentFrame(run);
  if (run.phase !== "episode" || !top) return null;
  const b = top.beats[top.i];
  const s = run.state;
  if (!b) return null;
  switch (b.t) {
    case "say":
      return { t: "say", who: b.who ?? "narrator", name: nameOf(b.who), text: resolve(b.text, s) };
    case "choice":
      return {
        t: "choice",
        prompt: resolve(b.prompt, s),
        options: visibleOptions(b.options, s).map((o) => ({ label: o.label, detail: o.detail ?? "", locked: o.requires ? !o.requires(s) : false, lockedReason: o.lockedReason ?? "" })),
      };
    case "talk": {
      const topics = visibleTopics(b.topics, s);
      const missing = b.topics.filter((t) => t.required && !run.asked.includes(t.id) && (!t.requires || t.requires(s))).length;
      return {
        t: "talk",
        who: b.who,
        name: nameOf(b.who),
        search: b.who === "narrator",
        intro: resolve(b.intro, s),
        topics: topics.map((t) => ({ label: t.label, asked: run.asked.includes(t.id), evidence: t.label.startsWith("Show") })),
        missing,
      };
    }
    case "puzzle": {
      const p = b.puzzle;
      const base = { ...p, prompt: resolve(p.prompt, s), hint: resolve(p.hint, s) };
      const lacking =
        p.kind === "deduce"
          ? p.slots.some((sl) => ![sl.answer].flat().some((id) => s.clues.includes(id)))
          : p.kind === "testimony"
            ? p.statements.every((st) => !st.breaks || !s.clues.includes(st.breaks))
            : false;
      return { t: "puzzle", puzzle: base, lacking, witnessName: p.kind === "testimony" ? nameOf(p.witness) : "" };
    }
    default:
      return null;
  }
}

function view() {
  const ep = EPISODES[run.state.episode] ?? null;
  const ending = run.ending ? ENDINGS[run.ending] : null;
  return {
    phase: run.phase,
    index: run.state.episode,
    total: EPISODES.length,
    episode: ep && { n: ep.n, id: ep.id, chapter: ep.chapter, title: ep.title, location: ep.location, objective: ep.objective, cast: ep.cast },
    chapter: ep ? CHAPTERS.find((c) => c.n === ep.chapter) : null,
    hour: hourFor(run.state.episode, CHAPTERS),
    beat: beatView(),
    state: run.state,
    ending: ending && { id: ending.id, label: ending.label, title: ending.title, body: ending.body(run.state), coda: ending.coda(run.state) },
    toasts: run.toasts,
  };
}

type Act =
  | { type: "start" | "advance" | "leave" | "chapterDone" }
  | { type: "choose"; index: number }
  | { type: "ask"; index: number }
  | { type: "puzzle"; solved: boolean }
  | { type: "dismiss"; id: number };

function act(a: Act) {
  const top = currentFrame(run);
  const b = top?.beats[top.i];
  if (a.type === "choose" && b?.t === "choice") {
    const o = visibleOptions(b.options, run.state)[a.index];
    if (o && !(o.requires && !o.requires(run.state))) run = reduce(run, { type: "choose", option: o });
  } else if (a.type === "ask" && b?.t === "talk") {
    const t = visibleTopics(b.topics, run.state)[a.index];
    if (t && !run.asked.includes(t.id)) run = reduce(run, { type: "ask", topic: t });
  } else if (a.type === "puzzle") run = reduce(run, { type: "puzzle", solved: a.solved });
  else if (a.type === "dismiss") run = reduce(run, { type: "dismiss", id: a.id });
  else if (a.type === "start" || a.type === "advance" || a.type === "leave" || a.type === "chapterDone") run = reduce(run, { type: a.type });
}

const KC = {
  /** Start fresh, or from a saved CourtState JSON. */
  load(stateJson: string) {
    run = newRun(stateJson ? (JSON.parse(stateJson) as CourtState) : null);
    return JSON.stringify(view());
  },
  view: () => JSON.stringify(view()),
  act(json: string) {
    act(JSON.parse(json) as Act);
    return JSON.stringify(view());
  },
  save: () => JSON.stringify(run.state),
  staging: () => JSON.stringify([...stage(run.state.episode).values()]),
  /** Static data Unity needs to build the world and the Case Book. */
  meta: () =>
    JSON.stringify({
      places: PLACES,
      colliders: COLLIDERS,
      rampart: RAMPART,
      wallHalf: WALL_HALF,
      start: START,
      cast: CAST,
      clues: CLUES,
      chapters: CHAPTERS,
      episodes: EPISODES.map((e) => ({ n: e.n, title: e.title, chapter: e.chapter, location: e.location, cast: e.cast })),
      initial: INITIAL_COURT,
    }),
};

(globalThis as unknown as { KC: typeof KC }).KC = KC;
