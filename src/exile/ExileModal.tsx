import { useCallback, useEffect, useState } from "react";
import type { ExileFlags, ExileStep } from "./story";
import BiLabel from "./BiLabel";

interface Props {
  step: ExileStep;
  flags: ExileFlags;
  onResolve: (apply?: (f: ExileFlags) => ExileFlags) => void;
  onRestart: () => void;
  onExit: () => void;
}

function Letterbox() {
  return (
    <>
      <div className="kc-bar-top pointer-events-none absolute top-0 right-0 left-0 h-[11vh] bg-black" />
      <div className="kc-bar-bottom pointer-events-none absolute right-0 bottom-0 left-0 h-[11vh] bg-black" />
    </>
  );
}

/**
 * Plays a cutscene over the live world. With a clip in public/videos it plays
 * full-frame; without one, the camera holds on the scene and the caption runs
 * as a film subtitle. Space / Enter advances.
 */
function Cutscene({
  step,
  flags,
  onDone,
}: {
  step: Extract<ExileStep, { kind: "scene" }>;
  flags: ExileFlags;
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const [video, setVideo] = useState<"pending" | "ok" | "missing">("pending");
  const clip = step.clips[i];
  const isLast = i === step.clips.length - 1;

  useEffect(() => {
    setVideo("pending");
  }, [i]);

  const next = useCallback(() => {
    if (isLast) onDone();
    else setI((n) => n + 1);
  }, [isLast, onDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next]);

  return (
    <div className="absolute inset-0">
      <div className="kc-fade pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
      <Letterbox />

      <div className="kc-rise-late absolute top-[11vh] right-0 left-0 flex items-center justify-center gap-3 pt-5">
        <BiLabel text={step.title} className="text-sm font-semibold text-amber-300/90 drop-shadow" />
        {step.clips.length > 1 && (
          <span className="text-[10px] text-stone-400">
            {i + 1} / {step.clips.length}
          </span>
        )}
      </div>

      <video
        key={clip.id}
        src={`/videos/${clip.id}.mp4`}
        autoPlay
        playsInline
        onLoadedData={() => setVideo("ok")}
        onEnded={next}
        onError={() => setVideo("missing")}
        className={
          video === "ok"
            ? "kc-fade absolute top-[11vh] right-0 bottom-[11vh] left-0 h-[78vh] w-full bg-black object-cover"
            : "hidden"
        }
      />

      <div className="absolute right-0 bottom-[11vh] left-0 flex flex-col items-center px-8 pb-8">
        {video !== "pending" && (
          <p
            key={clip.id}
            className="kc-rise max-w-3xl text-center font-serif text-xl leading-relaxed text-stone-50 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] md:text-[22px]"
          >
            {clip.caption(flags)}
          </p>
        )}
      </div>

      <button
        onClick={next}
        className="kc-fade absolute right-8 bottom-[calc(11vh+1.25rem)] rounded-full border border-amber-400/40 bg-black/40 px-5 py-1.5 text-xs font-semibold tracking-widest text-amber-200 uppercase backdrop-blur hover:border-amber-300 hover:text-amber-100"
      >
        {isLast ? "Continue" : "Next"} <span className="text-stone-500 normal-case">␣</span>
      </button>
    </div>
  );
}

function Choice({
  step,
  flags,
  onResolve,
}: {
  step: Extract<ExileStep, { kind: "choice" }>;
  flags: ExileFlags;
  onResolve: (apply: (f: ExileFlags) => ExileFlags) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key) - 1;
      const opt = step.options[n];
      if (opt && !(opt.requires && !opt.requires(flags))) onResolve(opt.apply);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, flags, onResolve]);

  return (
    <div className="absolute inset-0">
      <div className="kc-fade pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />
      <div className="kc-bar-top pointer-events-none absolute top-0 right-0 left-0 h-[7vh] bg-black" />
      <div className="absolute right-0 bottom-0 left-0 flex justify-center px-6 pb-10">
        <div className="w-full max-w-2xl">
          <p className="kc-rise mb-6 text-center font-serif text-lg leading-relaxed text-stone-50 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] md:text-xl">
            {step.prompt(flags)}
          </p>
          <div className="kc-stagger flex flex-col gap-2.5">
            {step.options.map((opt, n) => {
              const locked = opt.requires ? !opt.requires(flags) : false;
              return (
                <button
                  key={opt.label}
                  disabled={locked}
                  onClick={() => !locked && onResolve(opt.apply)}
                  className={
                    locked
                      ? "flex cursor-not-allowed gap-4 rounded-lg border border-stone-800/80 bg-black/40 px-5 py-3 text-left"
                      : "group flex gap-4 rounded-lg border border-amber-800/60 bg-black/50 px-5 py-3 text-left backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-950/50"
                  }
                >
                  <span className={locked ? "pt-0.5 text-xs text-stone-700" : "pt-0.5 text-xs text-amber-500 group-hover:text-amber-300"}>
                    {n + 1}
                  </span>
                  <span>
                    <span className={locked ? "block text-stone-600" : "block text-amber-50"}>{opt.label}</span>
                    {opt.detail && !locked && <span className="mt-1 block text-xs text-stone-400">{opt.detail}</span>}
                    {locked && opt.lockedReason && <span className="mt-1 block text-xs text-stone-600">{opt.lockedReason}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const SUMMARY: [string, (f: ExileFlags) => string | null][] = [
  ["First meal", (f) => (f.firstMeal === "hunted" ? "hunted it himself" : f.firstMeal === "begged" ? "asked a farmer for it" : f.firstMeal === "stole" ? "took the goat" : null)],
  ["Chaya", (f) => (f.chaya === "trusted" ? "asked her the truth" : f.chaya === "wary" ? "left the debt unnamed" : null)],
  ["The border", (f) => (f.crossing === "bribe" ? "paid the toll captain" : f.crossing === "smuggle" ? "went around it by night" : f.crossing === "pilgrim" ? "walked through with the pilgrims" : null)],
  ["The letter", (f) => (f.letter === "believe" ? "believed it" : f.letter === "doubt" ? "called it a forgery" : null)],
  ["The gate", (f) => (f.gateName === "true" ? "gave his true name" : f.gateName === "hidden" ? "passed as a servant" : f.gateName === "asked" ? "asked who expected him" : null)],
  ["The thief", (f) => (f.market === "paid" ? "paid for the bread" : f.market === "vouched" ? "took the boy's debt" : f.market === "walked" ? "walked on" : null)],
  ["Shailendra", (f) => (f.head === "taken" ? "took his head" : f.head === "spared" ? "set the knife down" : f.head === "proof" ? "asked him why" : null)],
  ["His mother", (f) => (f.mother === "accuse" ? "accused her" : f.mother === "ask" ? "asked why" : f.mother === "hold" ? "held her" : null)],
  ["His brother", (f) => (f.brother === "owed" ? "owes him everything" : f.brother === "resent" ? "cannot forgive him yet" : null)],
  ["The path", (f) => (f.path === "war" ? "his mother's war" : f.path === "warn" ? "home, to warn them" : f.path === "settle" ? "a settlement" : null)],
];

function EndCard({
  step,
  flags,
  onRestart,
  onExit,
}: {
  step: Extract<ExileStep, { kind: "end" }>;
  flags: ExileFlags;
  onRestart: () => void;
  onExit: () => void;
}) {
  const rows = SUMMARY.map(([k, fn]) => [k, fn(flags)] as const).filter(([, v]) => v);
  return (
    <div className="max-h-full w-full max-w-2xl overflow-y-auto text-center">
      <div className="kc-rise mb-2">
        <BiLabel text={step.label} className="text-xs font-bold text-amber-400" />
      </div>
      <h2 className="kc-rise mb-4 font-serif text-3xl text-amber-50">{step.title}</h2>
      <div className="kc-stagger mb-4 space-y-3">
        {step.body(flags).map((para, i) => (
          <p key={i} className="font-serif text-base leading-relaxed text-stone-200">
            {para}
          </p>
        ))}
      </div>
      <p className="kc-rise-late mb-5 font-serif text-lg text-amber-200/90 italic">{step.coda(flags)}</p>

      <div className="kc-rise-late mb-5 rounded-lg border border-stone-700/70 bg-stone-950/60 p-4 text-left text-sm">
        <div className="mb-2 font-semibold text-stone-300">What the road made of me:</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {(["ruthlessness", "cunning", "renown"] as const).map((k) => (
            <div key={k}>
              <div className="text-lg font-bold text-amber-300">{flags.stats[k]}</div>
              <div className="text-[10px] tracking-wide text-stone-500 uppercase">{k}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-0.5 border-t border-stone-800 pt-3 text-xs text-stone-400">
          {rows.map(([k, v]) => (
            <div key={k}>
              <span className="text-stone-500">{k}:</span> {v}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={onRestart}
          className="rounded-full bg-amber-500 px-6 py-3 font-semibold text-stone-900 hover:bg-amber-400"
        >
          Walk It Again, Differently
        </button>
        <button
          onClick={onExit}
          className="rounded-full border border-stone-700 px-6 py-3 font-semibold text-stone-300 hover:border-stone-500"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default function ExileModal({ step, flags, onResolve, onRestart, onExit }: Props) {
  return (
    <div className="absolute inset-0 z-10">
      {step.kind === "scene" && <Cutscene key={step.title} step={step} flags={flags} onDone={() => onResolve()} />}
      {step.kind === "choice" && <Choice step={step} flags={flags} onResolve={onResolve} />}
      {step.kind === "end" && (
        <div className="kc-fade absolute inset-0 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <EndCard step={step} flags={flags} onRestart={onRestart} onExit={onExit} />
        </div>
      )}
    </div>
  );
}
