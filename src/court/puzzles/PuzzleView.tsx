import { useState } from "react";
import { resolve } from "../engine";
import type { CourtState, Puzzle } from "../types";
import { CipherPuzzle, CodePuzzle, OrderPuzzle } from "./Mechanical";
import { DeducePuzzle, HandPuzzle, LedgerPuzzle, SealPuzzle, TestimonyPuzzle } from "./Documents";

export type Attempt = (correct: boolean, reply?: string) => void;

const KIND_LABEL: Record<Puzzle["kind"], string> = {
  cipher: "Cipher",
  order: "Reassemble",
  seal: "Examine the Seals",
  ledger: "Read the Ledger",
  hand: "Compare the Hands",
  deduce: "Deduction",
  testimony: "Testimony",
  code: "The Lock",
};

/**
 * The frame around every puzzle: title, prompt, the attempt counter, the hint
 * after two misses, and a way to walk away that costs you the clue.
 */
export default function PuzzleView({ puzzle, state, onDone }: { puzzle: Puzzle; state: CourtState; onDone: (solved: boolean) => void }) {
  const [wrong, setWrong] = useState(0);
  const [reply, setReply] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  // a deduction you lack the evidence for can't even be attempted — don't trap the player
  const lacking =
    puzzle.kind === "deduce"
      ? puzzle.slots.some((sl) => ![sl.answer].flat().some((id) => state.clues.includes(id)))
      : puzzle.kind === "testimony"
        ? puzzle.statements.every((st) => !st.breaks || !state.clues.includes(st.breaks))
        : false;
  const canLeave = !solved && (wrong >= 2 || lacking);

  const attempt: Attempt = (correct, r) => {
    if (solved) return;
    if (correct) {
      setSolved(true);
      setReply(r ?? null);
      setTimeout(() => onDone(true), 1400);
    } else {
      setWrong((w) => w + 1);
      setReply(r ?? "No. That isn't it.");
    }
  };

  const body = (() => {
    switch (puzzle.kind) {
      case "cipher":
        return <CipherPuzzle p={puzzle} attempt={attempt} solved={solved} />;
      case "order":
        return <OrderPuzzle p={puzzle} attempt={attempt} solved={solved} />;
      case "code":
        return <CodePuzzle p={puzzle} attempt={attempt} solved={solved} />;
      case "seal":
        return <SealPuzzle p={puzzle} attempt={attempt} solved={solved} />;
      case "ledger":
        return <LedgerPuzzle p={puzzle} attempt={attempt} solved={solved} />;
      case "hand":
        return <HandPuzzle p={puzzle} attempt={attempt} solved={solved} />;
      case "deduce":
        return <DeducePuzzle p={puzzle} state={state} attempt={attempt} solved={solved} />;
      case "testimony":
        return <TestimonyPuzzle p={puzzle} state={state} attempt={attempt} solved={solved} />;
    }
  })();

  return (
    <div className="kc-fade absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative my-auto w-full max-w-4xl rounded-2xl border border-amber-900/50 bg-gradient-to-b from-stone-900/95 to-stone-950/95 p-6 shadow-2xl md:p-8">
        <div className="mb-1 text-[10px] font-bold tracking-[0.3em] text-amber-500 uppercase">{KIND_LABEL[puzzle.kind]}</div>
        <h2 className="mb-2 font-serif text-2xl text-amber-50">{puzzle.title}</h2>
        <p className="mb-6 max-w-3xl font-serif text-[16px] leading-relaxed text-stone-300">{resolve(puzzle.prompt, state)}</p>

        {body}

        <div className="mt-6 flex min-h-[2.5rem] flex-wrap items-center justify-between gap-3 border-t border-stone-800 pt-4">
          <div className="max-w-2xl">
            {reply && <p className={`kc-rise font-serif text-[15px] ${solved ? "text-emerald-300" : "text-rose-300"}`}>{reply}</p>}
            {!solved && wrong >= 2 && <p className="kc-rise mt-1 text-sm text-amber-200/80">Hint — {resolve(puzzle.hint, state)}</p>}
            {!solved && lacking && wrong < 2 && <p className="mt-1 text-sm text-stone-500 italic">You may not have found what you'd need for this yet.</p>}
          </div>
          <div className="flex items-center gap-4">
            {wrong > 0 && !solved && <span className="text-xs text-stone-500">{wrong} wrong</span>}
            {canLeave && (
              <button onClick={() => onDone(false)} className="rounded-full border border-stone-700 px-4 py-1.5 text-xs text-stone-400 hover:border-stone-500 hover:text-stone-200">
                Leave it
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
