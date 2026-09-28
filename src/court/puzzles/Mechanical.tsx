import { useEffect, useMemo, useState } from "react";
import type { Puzzle } from "../types";
import type { Attempt } from "./PuzzleView";

const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const rot = (text: string, n: number) =>
  text.replace(/[A-Z]/g, (c) => A[(((A.indexOf(c) + n) % 26) + 26) % 26]);

/** The queen's brass wheel: an outer ring of letters, an inner ring that turns, eight spokes. */
function Wheel({ turn }: { turn: number }) {
  const R = 118;
  const r = 88;
  return (
    <svg viewBox="-140 -140 280 280" className="h-64 w-64 drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)]">
      <defs>
        <radialGradient id="brass" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#f0cc70" />
          <stop offset="60%" stopColor="#b8862e" />
          <stop offset="100%" stopColor="#6a4a18" />
        </radialGradient>
      </defs>
      <circle r={134} fill="url(#brass)" stroke="#4a3210" strokeWidth={3} />
      <circle r={102} fill="#2a1e10" opacity={0.25} />
      {A.split("").map((c, i) => {
        const a = (i / 26) * Math.PI * 2 - Math.PI / 2;
        return (
          <text key={c} x={Math.cos(a) * R} y={Math.sin(a) * R + 5} textAnchor="middle" fontSize={14} fontFamily="Georgia, serif" fill="#2a1a08" fontWeight={700}>
            {c}
          </text>
        );
      })}
      <g style={{ transform: `rotate(${(-turn / 26) * 360}deg)`, transition: "transform 0.35s cubic-bezier(.2,.8,.2,1)" }}>
        <circle r={100} fill="url(#brass)" stroke="#4a3210" strokeWidth={2} />
        {A.split("").map((c, i) => {
          const a = (i / 26) * Math.PI * 2 - Math.PI / 2;
          return (
            <text key={c} x={Math.cos(a) * r} y={Math.sin(a) * r + 4} textAnchor="middle" fontSize={11} fontFamily="Georgia, serif" fill="#5a1a10" fontStyle="italic">
              {c.toLowerCase()}
            </text>
          );
        })}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <line key={i} x1={Math.cos(a) * 16} y1={Math.sin(a) * 16} x2={Math.cos(a) * 72} y2={Math.sin(a) * 72} stroke="#4a3210" strokeWidth={5} strokeLinecap="round" />;
        })}
        <circle r={74} fill="none" stroke="#4a3210" strokeWidth={3} />
        <circle r={16} fill="#4a3210" />
      </g>
      <polygon points="0,-138 -7,-126 7,-126" fill="#8a1a14" />
    </svg>
  );
}

export function CipherPuzzle({ p, attempt, solved }: { p: Extract<Puzzle, { kind: "cipher" }>; attempt: Attempt; solved: boolean }) {
  const cipher = useMemo(() => rot(p.plain.toUpperCase(), p.shift), [p]);
  const [turn, setTurn] = useState(0);
  const reading = rot(cipher, -turn);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (solved) return;
      if (e.key === "ArrowLeft") setTurn((t) => (t + 25) % 26);
      if (e.key === "ArrowRight") setTurn((t) => (t + 1) % 26);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [solved]);

  return (
    <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center gap-3">
        <Wheel turn={turn} />
        <div className="flex items-center gap-3">
          <button disabled={solved} onClick={() => setTurn((t) => (t + 25) % 26)} className="rounded-full border border-amber-800 px-4 py-1.5 text-amber-200 hover:border-amber-400">
            ◀
          </button>
          <span className="w-24 text-center text-sm text-stone-400">
            turned <span className="font-bold text-amber-300">{turn}</span>
          </span>
          <button disabled={solved} onClick={() => setTurn((t) => (t + 1) % 26)} className="rounded-full border border-amber-800 px-4 py-1.5 text-amber-200 hover:border-amber-400">
            ▶
          </button>
        </div>
        <span className="text-[10px] text-stone-600">← → keys turn the wheel</span>
      </div>
      <div>
        <div className="mb-1 text-[10px] tracking-widest text-stone-500 uppercase">As written</div>
        <p className="mb-5 rounded bg-[#e8dcc0] p-4 font-mono text-[15px] leading-relaxed tracking-[0.12em] break-words text-[#3a2a1a] shadow-inner">{cipher}</p>
        <div className="mb-1 text-[10px] tracking-widest text-stone-500 uppercase">Read through the wheel</div>
        <p className={`min-h-[5rem] rounded border p-4 font-serif text-[17px] leading-relaxed break-words transition ${solved ? "border-emerald-700 text-emerald-100" : "border-stone-700 text-stone-100"}`}>{reading}</p>
        <button
          disabled={solved}
          onClick={() => attempt(turn === p.shift, turn === p.shift ? "The letters stop being letters and become words." : "It still reads like nothing. Turn it again.")}
          className="mt-4 rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-400 disabled:opacity-40"
        >
          This is it
        </button>
      </div>
    </div>
  );
}

/** A shuffle that is stable for a given puzzle and never already solved. */
function shuffled(n: number, seed: number) {
  const idx = Array.from({ length: n }, (_, i) => i);
  let s = seed || 1;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  if (idx.every((v, i) => v === i)) idx.reverse();
  return idx;
}

const TORN = [
  "polygon(0% 8%, 6% 0%, 14% 6%, 24% 1%, 35% 7%, 47% 0%, 58% 5%, 70% 1%, 82% 6%, 92% 0%, 100% 5%, 100% 93%, 93% 100%, 83% 95%, 71% 100%, 60% 94%, 48% 100%, 37% 95%, 25% 100%, 13% 94%, 5% 100%, 0% 94%)",
  "polygon(0% 4%, 9% 0%, 19% 7%, 30% 2%, 41% 8%, 53% 1%, 64% 6%, 76% 0%, 88% 7%, 100% 2%, 100% 96%, 90% 100%, 79% 93%, 67% 99%, 55% 94%, 43% 100%, 31% 95%, 19% 100%, 8% 93%, 0% 98%)",
];

export function OrderPuzzle({ p, attempt, solved }: { p: Extract<Puzzle, { kind: "order" }>; attempt: Attempt; solved: boolean }) {
  const [order, setOrder] = useState(() => shuffled(p.pieces.length, p.title.length * 31 + p.pieces.length));
  const [pick, setPick] = useState<number | null>(null);

  const swap = (a: number, b: number) =>
    setOrder((o) => {
      const n = [...o];
      [n[a], n[b]] = [n[b], n[a]];
      return n;
    });

  const click = (i: number) => {
    if (solved) return;
    if (pick === null) setPick(i);
    else {
      if (pick !== i) swap(pick, i);
      setPick(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        {order.map((pieceIdx, i) => (
          <div key={pieceIdx} className="flex items-center gap-3">
            <div className="flex flex-col">
              <button disabled={solved || i === 0} onClick={() => swap(i, i - 1)} className="px-2 text-xs text-stone-500 hover:text-amber-300 disabled:opacity-20">
                ▲
              </button>
              <button disabled={solved || i === order.length - 1} onClick={() => swap(i, i + 1)} className="px-2 text-xs text-stone-500 hover:text-amber-300 disabled:opacity-20">
                ▼
              </button>
            </div>
            <button
              onClick={() => click(i)}
              style={{ clipPath: TORN[pieceIdx % 2] }}
              className={`flex-1 px-6 py-4 text-left font-serif text-[16px] text-[#3a2a1a] transition ${
                pick === i ? "bg-[#f4e2a8] ring-2 ring-amber-400" : solved ? "bg-[#dfe8cc]" : "bg-[#e6d8b8] hover:bg-[#efe2c4]"
              }`}
            >
              {p.pieces[pieceIdx]}
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button
          disabled={solved}
          onClick={() => attempt(order.every((v, i) => v === i), order.every((v, i) => v === i) ? "The edges meet. It reads straight through." : "The torn edges don't meet. Something is out of place.")}
          className="rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-400 disabled:opacity-40"
        >
          Fit them together
        </button>
        <span className="text-xs text-stone-500">Click two pieces to swap them, or use the arrows.</span>
      </div>
    </div>
  );
}

export function CodePuzzle({ p, attempt, solved }: { p: Extract<Puzzle, { kind: "code" }>; attempt: Attempt; solved: boolean }) {
  const [digits, setDigits] = useState(() => Array.from({ length: p.answer.length }, () => 0));
  const spin = (i: number, d: number) => setDigits((ds) => ds.map((v, j) => (j === i ? (v + d + 10) % 10 : v)));
  const guess = digits.join("");
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-3 rounded-xl border-4 border-[#3a3430] bg-gradient-to-b from-[#5a524a] to-[#2e2a26] p-5 shadow-inner">
        {digits.map((v, i) => (
          <div key={i} className="flex flex-col items-center">
            <button disabled={solved} onClick={() => spin(i, 1)} className="px-3 text-stone-400 hover:text-amber-300">
              ▲
            </button>
            <div className={`my-1 flex h-16 w-12 items-center justify-center rounded-md border-2 font-serif text-3xl shadow ${solved ? "border-emerald-600 bg-[#d8e8c8] text-emerald-900" : "border-[#8a7a5a] bg-[#e8dcc0] text-[#2a1a0a]"}`}>{v}</div>
            <button disabled={solved} onClick={() => spin(i, -1)} className="px-3 text-stone-400 hover:text-amber-300">
              ▼
            </button>
          </div>
        ))}
      </div>
      <button
        disabled={solved}
        onClick={() => attempt(guess === p.answer, guess === p.answer ? "Something inside the lock gives, with a sound like a held breath let go." : "The shackle doesn't move.")}
        className="rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-400 disabled:opacity-40"
      >
        Try the lock
      </button>
    </div>
  );
}
