import { useCallback, useMemo, useRef, useState } from "react";
import { STORY, INITIAL_FLAGS, type Flags, type Step } from "./story";
import { deriveAct1ChronicleIds, act1EndingId } from "../chronicle/derive";
import { unlock } from "../chronicle/storage";

const EPS = 0.01;

export interface Ambient {
  era: string;
  text: string;
}

function advance(fromIndex: number, x: number, flags: Flags) {
  let idx = fromIndex;
  let ambient: Ambient | null = null;
  let modal: Step | null = null;

  while (idx + 1 < STORY.length) {
    const step = STORY[idx + 1];
    if (
      (step.kind === "choice" || step.kind === "walk") &&
      step.condition &&
      !step.condition(flags)
    ) {
      idx++;
      continue;
    }
    if (x < step.x - EPS) break;

    if (step.kind === "walk") {
      ambient = { era: step.era, text: step.text(flags) };
      idx++;
      continue;
    }

    // video / choice / ending: block here until resolved
    modal = step;
    break;
  }

  return { idx, ambient, modal };
}

export function useStoryEngine() {
  const [flags, setFlags] = useState<Flags>(INITIAL_FLAGS);
  const [resolvedIndex, setResolvedIndexState] = useState(-1);
  const [activeModal, setActiveModal] = useState<Step | null>(null);
  const [ambient, setAmbient] = useState<Ambient | null>(null);
  const [runId, setRunId] = useState(0);
  const lastX = useRef(-8);
  const resolvedIndexRef = useRef(-1);

  const setResolvedIndex = (idx: number) => {
    resolvedIndexRef.current = idx;
    setResolvedIndexState(idx);
  };

  const locked = activeModal !== null;

  const onMove = useCallback(
    (x: number) => {
      lastX.current = x;
      if (activeModal) return;
      const { idx, ambient: newAmbient, modal } = advance(resolvedIndexRef.current, x, flags);
      setResolvedIndex(idx);
      if (newAmbient) setAmbient(newAmbient);
      if (modal) setActiveModal(modal);
      if (modal?.kind === "ending") unlock([act1EndingId(flags)]);
    },
    [activeModal, flags]
  );

  const resolveModal = useCallback(
    (choiceApply?: (f: Flags) => Flags) => {
      if (!activeModal) return;
      const newFlags = choiceApply ? choiceApply(flags) : flags;
      setFlags(newFlags);
      unlock(deriveAct1ChronicleIds(newFlags));

      const resumeIndex = resolvedIndexRef.current + 1;
      const { idx, ambient: newAmbient, modal } = advance(resumeIndex, lastX.current, newFlags);
      setResolvedIndex(idx);
      setAmbient(newAmbient ?? ambient);
      setActiveModal(modal);
      if (modal?.kind === "ending") unlock([act1EndingId(newFlags)]);
    },
    [activeModal, flags, ambient]
  );

  const restart = useCallback(() => {
    setFlags(INITIAL_FLAGS);
    setResolvedIndex(-1);
    setActiveModal(null);
    setAmbient(null);
    lastX.current = -8;
    setRunId((r) => r + 1);
  }, []);

  const progress = useMemo(() => Math.max(0, resolvedIndex + 1) / STORY.length, [resolvedIndex]);

  return { flags, activeModal, ambient, locked, onMove, resolveModal, restart, runId, progress };
}
