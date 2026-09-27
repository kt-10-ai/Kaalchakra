import { useCallback, useRef, useState } from "react";
import { EXILE_STORY, INITIAL_EXILE_FLAGS, WORLD_SCALE, type ExileFlags, type ExileStep } from "./story";
import { deriveChronicleIds } from "../chronicle/derive";
import { unlock } from "../chronicle/storage";

const EPS = 0.01;
const START_X = -10 * WORLD_SCALE;

export interface Ambient {
  era: string;
  text: string;
}

function advance(fromIndex: number, x: number, flags: ExileFlags) {
  let idx = fromIndex;
  let ambient: Ambient | null = null;
  let modal: ExileStep | null = null;

  while (idx + 1 < EXILE_STORY.length) {
    const step = EXILE_STORY[idx + 1];
    if ((step.kind === "choice" || step.kind === "walk") && step.condition && !step.condition(flags)) {
      idx++;
      continue;
    }
    if (x < step.x - EPS) break;

    if (step.kind === "walk") {
      ambient = { era: step.era, text: step.text(flags) };
      idx++;
      continue;
    }

    modal = step; // scene / choice / end — blocks until resolved
    break;
  }

  return { idx, ambient, modal };
}

export function useExileEngine() {
  const [flags, setFlags] = useState<ExileFlags>(INITIAL_EXILE_FLAGS);
  const [activeModal, setActiveModal] = useState<ExileStep | null>(null);
  const [ambient, setAmbient] = useState<Ambient | null>(null);
  const [runId, setRunId] = useState(0);
  const [progress, setProgress] = useState(0);
  const lastX = useRef(START_X);
  const resolvedIndexRef = useRef(-1);

  const setResolved = (idx: number) => {
    resolvedIndexRef.current = idx;
    setProgress(Math.max(0, idx + 1) / EXILE_STORY.length);
  };

  const locked = activeModal !== null;

  const onMove = useCallback(
    (x: number) => {
      lastX.current = x;
      if (activeModal) return;
      const { idx, ambient: a, modal } = advance(resolvedIndexRef.current, x, flags);
      setResolved(idx);
      if (a) setAmbient(a);
      if (modal) setActiveModal(modal);
    },
    [activeModal, flags]
  );

  /** Called on mount so the opening cutscene fires before the player moves. */
  const begin = useCallback(() => {
    const { idx, ambient: a, modal } = advance(resolvedIndexRef.current, START_X, flags);
    setResolved(idx);
    if (a) setAmbient(a);
    if (modal) setActiveModal(modal);
  }, [flags]);

  const resolveModal = useCallback(
    (apply?: (f: ExileFlags) => ExileFlags) => {
      if (!activeModal) return;
      const newFlags = apply ? apply(flags) : flags;
      setFlags(newFlags);
      unlock(deriveChronicleIds(newFlags));

      const { idx, ambient: a, modal } = advance(resolvedIndexRef.current + 1, lastX.current, newFlags);
      setResolved(idx);
      if (a) setAmbient(a);
      setActiveModal(modal);
    },
    [activeModal, flags]
  );

  const restart = useCallback(() => {
    setFlags(INITIAL_EXILE_FLAGS);
    setActiveModal(null);
    setAmbient(null);
    lastX.current = START_X;
    resolvedIndexRef.current = -1;
    setProgress(0);
    setRunId((r) => r + 1);
  }, []);

  return { flags, activeModal, ambient, locked, onMove, begin, resolveModal, restart, runId, progress };
}
