import { useMemo, useState, type CSSProperties } from "react";
import { CLUE_BY_ID } from "../clues";
import { displayName } from "../cast";
import type { CourtState, HandId, Puzzle, SealSpec } from "../types";
import type { Attempt } from "./PuzzleView";

// ─────────────────────────────── seals ───────────────────────────────

function waxEdge(seed: number) {
  const pts: string[] = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const r = 46 + Math.sin(i * 2.7 + seed) * 2.4 + Math.sin(i * 5.1 + seed * 2) * 1.6;
    pts.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

function Seal({ s, seed }: { s: SealSpec; seed: number }) {
  const edge = useMemo(() => waxEdge(seed), [seed]);
  const shade = s.wax;
  return (
    <svg viewBox="-55 -55 110 110" className="h-32 w-32">
      <defs>
        <radialGradient id={`w${seed}`} cx="38%" cy="32%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
          <stop offset="45%" stopColor={shade} stopOpacity={0} />
        </radialGradient>
        <filter id={`b${seed}`}>
          <feGaussianBlur stdDeviation={0.9} />
        </filter>
      </defs>
      <path d={edge} fill={shade} stroke="#00000055" strokeWidth={1} />
      <path d={edge} fill={`url(#w${seed})`} />
      <g filter={s.smudged ? `url(#b${seed})` : undefined} transform={s.smudged ? "translate(2.5 1.5) rotate(7)" : undefined} opacity={0.85}>
        <circle r={37} fill="none" stroke="#00000066" strokeWidth={2} />
        {Array.from({ length: s.border }, (_, i) => {
          const a = (i / s.border) * Math.PI * 2;
          return <circle key={i} cx={Math.cos(a) * 32} cy={Math.sin(a) * 32} r={1.5} fill="#00000077" />;
        })}
        <circle r={24} fill="none" stroke="#00000077" strokeWidth={2.4} />
        {Array.from({ length: 8 }, (_, i) => {
          // a cut spoke leaves a gap where it was; otherwise draw the first `spokes` of eight
          const drawn = s.cut !== undefined ? i !== s.cut : i < s.spokes;
          if (!drawn) return null;
          const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
          return <line key={i} x1={Math.cos(a) * 4} y1={Math.sin(a) * 4} x2={Math.cos(a) * 23} y2={Math.sin(a) * 23} stroke="#00000088" strokeWidth={2.6} strokeLinecap="round" />;
        })}
        <circle r={4} fill="#00000088" />
        {/* the mountain of Vajragarh above the wheel */}
        <path d="M-9,-27 L-3,-34 L0,-31 L4,-36 L10,-27" fill="none" stroke="#00000077" strokeWidth={1.6} />
      </g>
      {s.cracked && <path d="M-30,-18 L-14,-6 L-18,4 L-2,14 L-6,24 L10,36" fill="none" stroke="#1a0a06" strokeWidth={1.4} />}
    </svg>
  );
}

export function SealPuzzle({ p, attempt, solved }: { p: Extract<Puzzle, { kind: "seal" }>; attempt: Attempt; solved: boolean }) {
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-5">
        {p.seals.map((s, i) => (
          <button
            key={i}
            disabled={solved}
            onClick={() => setPick(i)}
            className={`flex flex-col items-center rounded-xl border-2 bg-[#e6d8b8] p-3 transition ${pick === i ? "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.35)]" : "border-transparent hover:border-amber-800"}`}
          >
            <Seal s={s} seed={i * 3 + 1} />
            <span className="mt-1 max-w-[9rem] text-center font-serif text-[13px] text-[#3a2a1a]">{s.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 flex justify-center">
        <button
          disabled={solved || pick === null}
          onClick={() => attempt(pick === p.answer, pick === p.answer ? "Yes. Once you see it, you can't stop seeing it." : "Look again — closer.")}
          className="rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-400 disabled:opacity-40"
        >
          This one
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────── ledgers ───────────────────────────────

export function LedgerPuzzle({ p, attempt, solved }: { p: Extract<Puzzle, { kind: "ledger" }>; attempt: Attempt; solved: boolean }) {
  const [sel, setSel] = useState<number[]>([]);
  const toggle = (i: number) => !solved && setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
  const correct = sel.length === p.answer.length && p.answer.every((a) => sel.includes(a));
  return (
    <div>
      <div className="overflow-x-auto rounded-lg bg-[#e8dcc0] p-3 shadow-inner">
        <table className="w-full border-collapse font-serif text-[14px] text-[#2a1a0a]">
          <thead>
            <tr>
              <th className="w-8" />
              {p.columns.map((c) => (
                <th key={c} className="border-b-2 border-[#8a6a3a] px-3 py-2 text-left text-xs tracking-wider text-[#6a4a2a] uppercase">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.rows.map((row, i) => (
              <tr key={i} onClick={() => toggle(i)} className={`cursor-pointer border-b border-[#c8b48a] transition ${sel.includes(i) ? "bg-amber-300/60" : "hover:bg-[#f2e6c8]"}`}>
                <td className="px-2 text-center text-[#8a1a14]">{sel.includes(i) ? "✎" : ""}</td>
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button
          disabled={solved || sel.length === 0}
          onClick={() => attempt(correct, correct ? "There. In ink, where anyone could have read it." : sel.length < p.answer.length ? "Not all of it. There's more than that." : "Some of what you've marked is innocent.")}
          className="rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-400 disabled:opacity-40"
        >
          Mark these
        </button>
        <span className="text-xs text-stone-500">Click rows to mark them. {sel.length} marked.</span>
      </div>
    </div>
  );
}

// ─────────────────────────────── handwriting ───────────────────────────────

const HANDS: Record<HandId, CSSProperties> = {
  queen: { fontFamily: "'Snell Roundhand', 'Apple Chancery', 'Brush Script MT', cursive", fontSize: 22, color: "#2a1a4a" },
  kaushal: { fontFamily: "Didot, 'Bodoni 72', 'Times New Roman', serif", fontSize: 17, letterSpacing: "0.06em", color: "#1a1a1a" },
  ranadhir: { fontFamily: "'Bradley Hand', 'Segoe Print', cursive", fontSize: 18, color: "#1a3a3a" },
  vidyadhar: { fontFamily: "Papyrus, 'Herculanum', fantasy", fontSize: 17, color: "#3a2a1a" },
  chaya: { fontFamily: "Noteworthy, 'Marker Felt', 'Comic Sans MS', cursive", fontSize: 17, color: "#1a2a4a" },
  king: { fontFamily: "Trattatello, Copperplate, 'Copperplate Gothic Light', serif", fontSize: 18, color: "#3a0a0a" },
  bhairav: { fontFamily: "'Courier New', Courier, monospace", fontSize: 15, color: "#2a2a1a" },
  clerk: { fontFamily: "Georgia, serif", fontSize: 16, fontStyle: "italic", color: "#2a2a2a" },
};

function Paper({ children, hand, active }: { children: string; hand: HandId; active?: boolean }) {
  return (
    <div className={`rounded bg-[#ece0c4] p-4 shadow-md ${active ? "ring-2 ring-amber-400" : ""}`} style={{ backgroundImage: "repeating-linear-gradient(transparent 0 27px, #c8b48a55 27px 28px)" }}>
      <p style={{ ...HANDS[hand], lineHeight: 1.55 }}>{children}</p>
    </div>
  );
}

export function HandPuzzle({ p, attempt, solved }: { p: Extract<Puzzle, { kind: "hand" }>; attempt: Attempt; solved: boolean }) {
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div>
      <div className="mb-1 text-[10px] tracking-widest text-stone-500 uppercase">The sample</div>
      <div className="mb-5">
        <Paper hand={p.sample.hand}>{p.sample.text}</Paper>
      </div>
      <div className="mb-1 text-[10px] tracking-widest text-stone-500 uppercase">Compare against</div>
      <div className="grid gap-3 md:grid-cols-2">
        {p.candidates.map((c, i) => (
          <button key={i} disabled={solved} onClick={() => setPick(i)} className="text-left">
            <div className="mb-1 text-xs font-semibold text-amber-200">{c.label}</div>
            <Paper hand={c.hand} active={pick === i}>
              {c.text}
            </Paper>
          </button>
        ))}
      </div>
      <div className="mt-5">
        <button
          disabled={solved || pick === null}
          onClick={() => attempt(pick === p.answer, pick === p.answer ? "The same hand. There's no mistaking it once the two lie side by side." : "Close in places. Not the same hand.")}
          className="rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-400 disabled:opacity-40"
        >
          The same hand
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────── evidence picker ───────────────────────────────

function EvidencePicker({ state, onPick, onClose, title }: { state: CourtState; onPick: (id: string) => void; onClose: () => void; title: string }) {
  const clues = state.clues.map((id) => CLUE_BY_ID[id]).filter(Boolean);
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-black/85 p-6">
      <div className="max-h-full w-full max-w-2xl overflow-y-auto">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-amber-300">{title}</div>
          <button onClick={onClose} className="text-xs text-stone-400 hover:text-stone-200">
            Cancel
          </button>
        </div>
        {clues.length === 0 && <p className="text-stone-500">Your Case Book is empty.</p>}
        <div className="grid gap-2 md:grid-cols-2">
          {clues.map((c) => (
            <button key={c.id} onClick={() => onPick(c.id)} className="rounded-lg border border-stone-700 bg-stone-900/80 p-3 text-left hover:border-amber-500">
              <div className="text-sm text-amber-100">{c.title}</div>
              <div className="mt-1 line-clamp-2 text-xs text-stone-400">{c.text}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────── deduction ───────────────────────────────

export function DeducePuzzle({ p, state, attempt, solved }: { p: Extract<Puzzle, { kind: "deduce" }>; state: CourtState; attempt: Attempt; solved: boolean }) {
  const [filled, setFilled] = useState<(string | null)[]>(() => p.slots.map(() => null));
  const [open, setOpen] = useState<number | null>(null);
  const check = () => {
    const bad = p.slots.filter((s, i) => {
      const f = filled[i];
      return !f || !(Array.isArray(s.answer) ? s.answer.includes(f) : s.answer === f);
    }).length;
    attempt(bad === 0, bad === 0 ? "It holds. Every piece where it belongs." : `${bad} of ${p.slots.length} don't hold.`);
  };
  return (
    <div className="relative">
      <div className="flex flex-col gap-3">
        {p.slots.map((s, i) => {
          const clue = filled[i] ? CLUE_BY_ID[filled[i]!] : null;
          return (
            <div key={i} className="grid items-center gap-3 md:grid-cols-[1fr_1.3fr]">
              <div className="font-serif text-[16px] text-stone-200">{s.q}</div>
              <button disabled={solved} onClick={() => setOpen(i)} className={`rounded-lg border p-3 text-left transition ${clue ? "border-sky-700 bg-sky-950/40" : "border-dashed border-stone-600 hover:border-amber-500"}`}>
                {clue ? <span className="text-sm text-sky-100">{clue.title}</span> : <span className="text-sm text-stone-500">Choose from the Case Book…</span>}
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-5">
        <button disabled={solved || filled.some((f) => !f)} onClick={check} className="rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-400 disabled:opacity-40">
          Put it together
        </button>
      </div>
      {open !== null && (
        <EvidencePicker
          state={state}
          title={p.slots[open].q}
          onClose={() => setOpen(null)}
          onPick={(id) => {
            setFilled((f) => f.map((v, j) => (j === open ? id : v)));
            setOpen(null);
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────── testimony ───────────────────────────────

export function TestimonyPuzzle({ p, state, attempt, solved }: { p: Extract<Puzzle, { kind: "testimony" }>; state: CourtState; attempt: Attempt; solved: boolean }) {
  const [pressed, setPressed] = useState<number[]>([]);
  const [presenting, setPresenting] = useState<number | null>(null);
  const [broken, setBroken] = useState<number | null>(null);
  return (
    <div className="relative">
      <div className="mb-3 text-sm font-semibold text-amber-200">{displayName(p.witness)} testifies:</div>
      <div className="flex flex-col gap-3">
        {p.statements.map((st, i) => (
          <div key={i} className={`rounded-lg border p-4 transition ${broken === i ? "border-emerald-600 bg-emerald-950/30" : "border-stone-700 bg-stone-900/60"}`}>
            <p className="font-serif text-[16px] text-stone-100">“{st.text}”</p>
            {pressed.includes(i) && st.press && <p className="kc-rise mt-2 border-l-2 border-amber-700 pl-3 font-serif text-[15px] text-stone-400 italic">{st.press}</p>}
            {!solved && (
              <div className="mt-3 flex gap-2">
                {st.press && !pressed.includes(i) && (
                  <button onClick={() => setPressed((ps) => [...ps, i])} className="rounded-full border border-stone-600 px-4 py-1 text-xs text-stone-300 hover:border-amber-400">
                    Press
                  </button>
                )}
                <button onClick={() => setPresenting(i)} className="rounded-full border border-sky-800 px-4 py-1 text-xs text-sky-200 hover:border-sky-400">
                  Present evidence
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {presenting !== null && (
        <EvidencePicker
          state={state}
          title={`Against: “${p.statements[presenting].text}”`}
          onClose={() => setPresenting(null)}
          onPick={(id) => {
            const st = p.statements[presenting];
            const ok = st.breaks === id;
            if (ok) setBroken(presenting);
            setPresenting(null);
            attempt(ok, ok ? `${displayName(p.witness)} stops. The hall hears the silence.` : `${displayName(p.witness)} barely glances at it. “And?”`);
          }}
        />
      )}
    </div>
  );
}
