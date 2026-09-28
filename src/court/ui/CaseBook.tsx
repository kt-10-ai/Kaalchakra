import { useEffect, useState } from "react";
import BiLabel from "../../exile/BiLabel";
import { CAST } from "../cast";
import { CLUE_BY_ID, type ClueKind } from "../clues";
import { CHAPTERS, EPISODES } from "../episodes";
import type { CharId, CourtState } from "../types";

const KIND: Record<ClueKind, { label: string; icon: string }> = {
  document: { label: "Documents", icon: "📜" },
  testimony: { label: "Testimony", icon: "🗣" },
  object: { label: "Objects", icon: "⚱" },
  observation: { label: "Observations", icon: "👁" },
};

type Tab = "evidence" | "people" | "day";

export default function CaseBook({ state, onClose }: { state: CourtState; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("evidence");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key.toLowerCase() === "c") onClose();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const done = EPISODES.slice(0, state.episode);
  const met = new Set<CharId>();
  done.forEach((e) => e.cast.forEach((c) => met.add(c)));
  const people = (Object.keys(CAST) as (keyof typeof CAST)[]).filter((id) => met.has(id));

  return (
    <div className="kc-fade absolute inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-amber-900/60 bg-[#1a140e] shadow-2xl"
        style={{ backgroundImage: "radial-gradient(ellipse at top, #2a2016 0%, #120e0a 70%)" }}
      >
        <div className="flex items-center justify-between border-b border-amber-900/40 px-6 py-4">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-amber-600 uppercase">अभियोग-पुस्तिका</div>
            <h2 className="font-serif text-2xl text-amber-50">The Case Book</h2>
          </div>
          <div className="flex gap-1">
            {(["evidence", "people", "day"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${tab === t ? "bg-amber-500 text-stone-900" : "text-stone-400 hover:text-amber-200"}`}>
                {t === "day" ? "The Day" : t}
              </button>
            ))}
            <button onClick={onClose} className="ml-3 rounded-full border border-stone-700 px-3 py-1.5 text-xs text-stone-400 hover:text-stone-100">
              Close (C)
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6">
          {tab === "evidence" && (
            <>
              {state.clues.length === 0 && <p className="font-serif text-stone-500 italic">Nothing yet. Whatever you learn today, Nandini will write it here.</p>}
              {(Object.keys(KIND) as ClueKind[]).map((k) => {
                const list = state.clues.map((id) => CLUE_BY_ID[id]).filter((c) => c && c.kind === k);
                if (!list.length) return null;
                return (
                  <div key={k} className="mb-6">
                    <div className="mb-2 text-xs font-bold tracking-widest text-amber-600 uppercase">
                      {KIND[k].icon} {KIND[k].label}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {list.map((c) => (
                        <button key={c.id} onClick={() => setOpen(open === c.id ? null : c.id)} className="rounded-lg border border-stone-800 bg-[#ece0c4]/[0.06] p-4 text-left transition hover:border-amber-700">
                          <div className="font-serif text-[17px] text-amber-100">{c.title}</div>
                          <p className={`mt-1 font-serif text-[14px] leading-relaxed text-stone-300 ${open === c.id ? "" : "line-clamp-2"}`}>{c.text}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {tab === "people" && (
            <div className="grid gap-3 md:grid-cols-2">
              {people.length === 0 && <p className="font-serif text-stone-500 italic">You haven't spoken to anyone yet.</p>}
              {people.map((id) => {
                const p = CAST[id];
                const t = state.trust[id] ?? 0;
                return (
                  <div key={id} className="rounded-lg border border-stone-800 p-4">
                    <div className="flex items-baseline justify-between">
                      <div className="font-serif text-[17px] text-amber-100">{p.name}</div>
                      <div className={`text-xs ${t >= 2 ? "text-emerald-400" : t <= -2 ? "text-rose-400" : "text-stone-500"}`}>{t >= 3 ? "Would stand with you" : t >= 2 ? "An ally" : t >= 1 ? "Warm" : t <= -3 ? "An enemy" : t <= -1 ? "Cold" : "Unreadable"}</div>
                    </div>
                    <div className="mt-1 text-sm text-stone-400">{p.role}</div>
                    <div className="mt-3 flex gap-1">
                      {Array.from({ length: 10 }, (_, i) => {
                        const v = i - 5;
                        const lit = t > 0 ? v >= 0 && v < t : t < 0 ? v < 0 && v >= t : false;
                        return <div key={i} className={`h-1.5 flex-1 rounded ${lit ? (t > 0 ? "bg-emerald-500" : "bg-rose-500") : "bg-stone-800"} ${i === 5 ? "ml-1" : ""}`} />;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "day" && (
            <div>
              <div className="mb-4 grid grid-cols-3 gap-3 text-center">
                {(["ruthlessness", "cunning", "renown"] as const).map((k) => (
                  <div key={k} className="rounded-lg border border-stone-800 p-3">
                    <div className="text-2xl font-bold text-amber-300">{state.stats[k]}</div>
                    <div className="text-[10px] tracking-widest text-stone-500 uppercase">{k}</div>
                  </div>
                ))}
              </div>
              {CHAPTERS.map((ch) => {
                const eps = EPISODES.filter((e) => e.chapter === ch.n);
                if (!eps.length) return null;
                const reached = eps.some((e) => e.n <= state.episode + 1);
                return (
                  <div key={ch.n} className={`mb-4 ${reached ? "" : "opacity-40"}`}>
                    <BiLabel text={ch.title} className="text-sm font-semibold text-amber-300" />
                    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 md:grid-cols-5">
                      {eps.map((e) => {
                        const idx = EPISODES.indexOf(e);
                        const state_ = idx < state.episode ? "done" : idx === state.episode ? "now" : "later";
                        return (
                          <div key={e.id} className={`truncate text-xs ${state_ === "done" ? "text-stone-300" : state_ === "now" ? "font-semibold text-amber-200" : "text-stone-600"}`} title={e.title}>
                            {e.n}. {state_ === "later" ? "…" : e.title.split(" · ").pop()}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
