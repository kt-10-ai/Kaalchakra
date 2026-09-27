import { useState } from "react";
import { RESOURCE_LABELS, STAGES } from "./data";
import { canAfford, currentStage, PRIMARY, type KingdomAction, type KingdomState } from "./engine";
import type { ResourceType } from "./data";

interface Props {
  state: KingdomState;
  dispatch: (action: KingdomAction) => void;
}

const RESOURCE_TYPES: ResourceType[] = ["grain", "textiles", "metal", "luxury"];

export default function KingdomScreen({ state, dispatch }: Props) {
  const stage = currentStage(state);
  const [tradeTarget, setTradeTarget] = useState<ResourceType>("luxury");

  const unresolvedCount = stage.conflicts.filter((c) => !state.resolvedConflicts.has(c.id)).length;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        {STAGES.map((s, i) => (
          <div key={s.year} className="flex flex-1 items-center">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold ${
                i === state.stageIndex
                  ? "border-amber-400 bg-amber-500 text-stone-900"
                  : i < state.stageIndex
                    ? "border-amber-700 bg-amber-900 text-amber-200"
                    : "border-stone-700 text-stone-500"
              }`}
            >
              {s.year}
            </div>
            {i < STAGES.length - 1 && <div className="mx-1 h-px flex-1 bg-stone-700" />}
          </div>
        ))}
      </div>

      <div className="mb-1 text-xs tracking-widest text-amber-400 uppercase">
        Vijayanagara &middot; {stage.year} CE
      </div>
      <h2 className="mb-3 text-2xl font-bold text-amber-50">{stage.title}</h2>
      <p className="mb-6 text-stone-300">{stage.blurb}</p>

      {stage.developments.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {stage.developments.map((t) => (
            <span key={t} className="rounded-full border border-stone-700 px-3 py-1 text-xs text-stone-400">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mb-8 grid grid-cols-4 gap-3">
        {RESOURCE_TYPES.map((r) => (
          <div
            key={r}
            className={`rounded-lg border p-3 text-center ${
              r === PRIMARY ? "border-amber-600 bg-amber-950/40" : "border-stone-700 bg-stone-900/40"
            }`}
          >
            <div className="text-lg font-bold text-amber-100">{state.resources[r]}</div>
            <div className="text-[11px] text-stone-400">{RESOURCE_LABELS[r]}</div>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-lg border border-stone-700 bg-stone-900/40 p-4 text-center">
        <div className="text-2xl font-bold text-amber-300">{state.prestige}</div>
        <div className="text-xs text-stone-400">Prestige</div>
      </div>

      <h3 className="mb-2 text-sm font-semibold tracking-wide text-stone-300 uppercase">
        Conflicts this era ({unresolvedCount} unresolved)
      </h3>
      <div className="mb-8 space-y-3">
        {stage.conflicts.map((c) => {
          const resolved = state.resolvedConflicts.has(c.id);
          const cost = c.severity * 2;
          const affordable = canAfford(state, PRIMARY, cost);
          return (
            <div
              key={c.id}
              className={`rounded-lg border p-4 ${
                resolved ? "border-emerald-700 bg-emerald-950/30" : "border-red-900/60 bg-red-950/20"
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-semibold text-stone-100">{c.label}</span>
                <span className="text-xs text-stone-400">
                  Severity {c.severity} &middot; {"⚔".repeat(c.severity)}
                </span>
              </div>
              <p className="mb-2 text-sm text-stone-400">{c.description}</p>
              {resolved ? (
                <p className="text-xs text-emerald-400">Resolved this era.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={!affordable}
                    onClick={() => dispatch({ type: "RESOLVE_CONFLICT", conflictId: c.id })}
                    className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-stone-900 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
                  >
                    Resolve &mdash; costs {cost} {RESOURCE_LABELS[PRIMARY]}
                  </button>
                  {c.severity >= 3 && (
                    <button
                      disabled={!canAfford(state, PRIMARY, c.severity)}
                      onClick={() => dispatch({ type: "GAMBIT", conflictId: c.id })}
                      className="rounded-md border border-red-800 bg-red-950/40 px-3 py-1.5 text-xs font-semibold text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                      title="50% chance to resolve at half cost — 50% chance you lose the resources and 1 prestige"
                    >
                      Gambit &mdash; {c.severity} {RESOURCE_LABELS[PRIMARY]}, 50/50
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-stone-700 bg-stone-900/40 p-4">
          <h4 className="mb-2 text-sm font-semibold text-stone-200">Trade along the river</h4>
          <p className="mb-3 text-xs text-stone-400">
            Exchange 2 surplus {RESOURCE_LABELS[PRIMARY]} for 2 of what the kingdom lacks.
          </p>
          <select
            value={tradeTarget}
            onChange={(e) => setTradeTarget(e.target.value as ResourceType)}
            className="mb-3 w-full rounded-md border border-stone-700 bg-stone-800 px-2 py-1.5 text-sm text-stone-100"
          >
            {RESOURCE_TYPES.filter((r) => r !== PRIMARY).map((r) => (
              <option key={r} value={r}>
                {RESOURCE_LABELS[r]}
              </option>
            ))}
          </select>
          <button
            disabled={!canAfford(state, PRIMARY, 2)}
            onClick={() => dispatch({ type: "TRADE", give: PRIMARY, take: tradeTarget, amount: 2 })}
            className="w-full rounded-md bg-stone-700 px-3 py-1.5 text-xs font-semibold text-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Trade
          </button>
        </div>

        <div className="rounded-lg border border-stone-700 bg-stone-900/40 p-4">
          <h4 className="mb-2 text-sm font-semibold text-stone-200">Invest in infrastructure</h4>
          <p className="mb-3 text-xs text-stone-400">
            Spend 4 {RESOURCE_LABELS[PRIMARY]} on irrigation, forts, or temples. Permanently raises future
            income and prestige.
          </p>
          <button
            disabled={!canAfford(state, PRIMARY, 4)}
            onClick={() => dispatch({ type: "BUILD" })}
            className="w-full rounded-md bg-stone-700 px-3 py-1.5 text-xs font-semibold text-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Build (+1 prestige, +1 future income)
          </button>
        </div>
      </div>

      <button
        onClick={() => dispatch({ type: "ADVANCE" })}
        className="w-full rounded-full bg-amber-500 px-6 py-3 font-semibold text-stone-900 transition hover:bg-amber-400"
      >
        {state.stageIndex === STAGES.length - 1 ? "Close the Decade" : "Advance to Next Era →"}
      </button>
    </div>
  );
}
