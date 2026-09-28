import { useEffect, useRef, useState } from "react";
import BiLabel from "../../exile/BiLabel";
import type { Toast } from "../engine";
import { PLACES } from "../locations";
import type { CourtState, Episode } from "../types";

/** Written by the scene every frame; read by the HUD for the compass. */
export const pose = { x: 0, z: 0, yaw: 0 };

const TOAST_STYLE: Record<Toast["kind"], string> = {
  clue: "border-sky-700/70 text-sky-100",
  "trust-up": "border-emerald-800/70 text-emerald-200",
  "trust-down": "border-rose-900/70 text-rose-200",
  suspicion: "border-red-800/80 text-red-200",
  calm: "border-stone-700 text-stone-300",
  supply: "border-amber-800/70 text-amber-200",
};

function Toasts({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  useEffect(() => {
    if (!toasts.length) return;
    const t = setTimeout(() => dismiss(toasts[0].id), 3600);
    return () => clearTimeout(t);
  }, [toasts, dismiss]);
  return (
    <div className="pointer-events-none absolute top-20 right-4 z-30 flex w-72 flex-col gap-2">
      {toasts.slice(0, 4).map((t) => (
        <div key={t.id} className={`kc-rise rounded-lg border bg-black/75 px-4 py-2.5 text-sm backdrop-blur ${TOAST_STYLE[t.kind]}`}>
          {t.kind === "clue" && <div className="text-[10px] tracking-widest text-sky-400 uppercase">Added to the Case Book</div>}
          {t.text}
        </div>
      ))}
    </div>
  );
}

function Compass({ target }: { target: [number, number] }) {
  const arrow = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const dx = target[0] - pose.x;
      const dz = target[1] - pose.z;
      const want = Math.atan2(-dx, -dz);
      let rel = want - pose.yaw;
      rel = Math.atan2(Math.sin(rel), Math.cos(rel));
      if (arrow.current) arrow.current.style.transform = `rotate(${-rel}rad)`;
      setDist(Math.round(Math.hypot(dx, dz)));
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return (
    <div className="flex items-center gap-2">
      <div ref={arrow} className="flex h-6 w-6 items-center justify-center text-amber-300">
        ▲
      </div>
      <span className="text-xs text-stone-400">{dist} m</span>
    </div>
  );
}

export default function HUD({
  state,
  episode,
  walking,
  toasts,
  dismiss,
  onCaseBook,
  hour,
}: {
  state: CourtState;
  episode: Episode | null;
  walking: boolean;
  toasts: Toast[];
  dismiss: (id: number) => void;
  onCaseBook: () => void;
  hour: number;
}) {
  const place = episode ? PLACES[episode.location] : null;
  const h = Math.floor(hour % 24);
  const m = Math.round((hour % 1) * 60);
  const clock = `${h}:${String(m).padStart(2, "0")}`;
  return (
    <>
      <Toasts toasts={toasts} dismiss={dismiss} />
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3 rounded-full bg-stone-950/75 px-4 py-2 text-xs backdrop-blur">
        <span className="text-stone-400">{clock}</span>
        <span className="text-stone-700">|</span>
        <span className="text-amber-200">{state.supplies.coin} coin</span>
        <span className="text-stone-700">|</span>
        <span className="flex items-center gap-1" title="How closely the king's men are watching you">
          <span className={state.suspicion >= 7 ? "text-red-400" : "text-stone-400"}>👁</span>
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={`h-2 w-1.5 rounded-sm ${i < state.suspicion ? (state.suspicion >= 7 ? "bg-red-500" : "bg-amber-600") : "bg-stone-700"}`} />
          ))}
        </span>
        <span className="text-stone-700">|</span>
        <button onClick={onCaseBook} className="font-semibold text-amber-300 hover:text-amber-100">
          Case Book ({state.clues.length}) · C
        </button>
      </div>

      {walking && episode && place && (
        <div className="kc-rise absolute top-4 left-1/2 z-20 -translate-x-1/2 rounded-xl border border-amber-900/50 bg-stone-950/80 px-5 py-2.5 text-center backdrop-blur">
          <div className="flex items-center justify-center gap-3">
            <span className="text-[10px] tracking-widest text-stone-500 uppercase">Episode {episode.n}</span>
            <BiLabel text={place.name} className="text-xs font-semibold text-amber-400" />
            <Compass target={place.mark} />
          </div>
          <div className="mt-0.5 font-serif text-[15px] text-stone-100">{episode.objective}</div>
        </div>
      )}

      {walking && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-20 text-[11px] text-stone-500">WASD walk · Shift jog · drag to look · follow the golden light</div>
      )}
    </>
  );
}
