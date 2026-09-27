import { HISTORICAL_BASELINE_PRESTIGE, HISTORICAL_SUMMARY } from "./data";
import type { KingdomState } from "./engine";

interface Props {
  state: KingdomState;
  onRestart: () => void;
}

export default function KingdomEnd({ state, onRestart }: Props) {
  const diff = state.prestige - HISTORICAL_BASELINE_PRESTIGE;
  const verdict =
    diff > 2
      ? "You outpaced history's own account of these decades."
      : diff < -2
        ? "History was kinder to Vijayanagara than your decade was."
        : "You matched history's trajectory closely.";

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <p className="mb-1 text-xs tracking-widest text-amber-400 uppercase">1350 CE &middot; Decade Complete</p>
      <h2 className="mb-6 text-3xl font-bold text-amber-50">Vijayanagara</h2>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-amber-700 bg-amber-950/30 p-4 text-center">
          <div className="text-3xl font-bold text-amber-300">{state.prestige}</div>
          <div className="text-xs text-stone-400">Your final prestige</div>
        </div>
        <div className="rounded-lg border border-stone-700 bg-stone-900/40 p-4 text-center">
          <div className="text-3xl font-bold text-stone-300">{HISTORICAL_BASELINE_PRESTIGE}</div>
          <div className="text-xs text-stone-400">Historical baseline</div>
        </div>
      </div>

      <p className="mb-8 text-center font-medium text-stone-200">{verdict}</p>

      <div className="mb-8 rounded-lg border border-stone-700 bg-stone-900/40 p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide text-stone-300 uppercase">
          What actually happened
        </h3>
        <p className="text-sm text-stone-400">{HISTORICAL_SUMMARY}</p>
      </div>

      <div className="mb-8 rounded-lg border border-stone-700 bg-stone-900/40 p-5">
        <h3 className="mb-2 text-sm font-semibold tracking-wide text-stone-300 uppercase">Your chronicle</h3>
        <ul className="space-y-1.5 text-sm text-stone-400">
          {state.log.map((entry, i) => (
            <li key={i} className="border-l-2 border-stone-700 pl-3">
              {entry}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onRestart}
        className="w-full rounded-full bg-amber-500 px-6 py-3 font-semibold text-stone-900 transition hover:bg-amber-400"
      >
        Begin Again, From the River
      </button>
    </div>
  );
}
