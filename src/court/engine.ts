import { useCallback, useReducer } from "react";
import { EPISODES } from "./episodes";
import { currentFrame, newRun, reduce } from "./engineCore";
import type { CourtState, Option, Topic } from "./types";

export { clearSave, loadSave, resolve } from "./engineCore";
export type { Phase, Run, Toast } from "./engineCore";

export function useCourtEngine(initial: CourtState | null) {
  const [run, dispatch] = useReducer(reduce, initial, newRun);

  const top = currentFrame(run);
  const beat = run.phase === "episode" && top ? top.beats[top.i] : null;

  return {
    run,
    beat,
    episode: EPISODES[run.state.episode] ?? null,
    start: useCallback(() => dispatch({ type: "start" }), []),
    advance: useCallback(() => dispatch({ type: "advance" }), []),
    choose: useCallback((option: Option) => dispatch({ type: "choose", option }), []),
    ask: useCallback((topic: Topic) => dispatch({ type: "ask", topic }), []),
    leave: useCallback(() => dispatch({ type: "leave" }), []),
    finishPuzzle: useCallback((solved: boolean) => dispatch({ type: "puzzle", solved }), []),
    chapterDone: useCallback(() => dispatch({ type: "chapterDone" }), []),
    dismiss: useCallback((id: number) => dispatch({ type: "dismiss", id }), []),
  };
}
