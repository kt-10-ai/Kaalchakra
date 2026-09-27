import { useEffect, useState } from "react";
import type { ExileFlags, ExileStep } from "./story";
import BiLabel from "./BiLabel";

interface Props {
  step: ExileStep;
  flags: ExileFlags;
  onResolve: (apply?: (f: ExileFlags) => ExileFlags) => void;
  onRestart: () => void;
  onExit: () => void;
}

/** Plays a cutscene's clips back-to-back; each missing file falls back to its caption. */
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
  const [failed, setFailed] = useState(false);
  const clip = step.clips[i];
  const isLast = i === step.clips.length - 1;

  useEffect(() => {
    setFailed(false);
  }, [i]);

  function next() {
    if (isLast) onDone();
    else setI((n) => n + 1);
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <BiLabel text={step.title} className="text-xs font-bold text-amber-400" />
        <span className="text-[10px] text-stone-600">
          {i + 1} / {step.clips.length}
        </span>
      </div>

      {!failed ? (
        <video
          key={clip.id}
          src={`/videos/${clip.id}.mp4`}
          autoPlay
          controls
          onEnded={next}
          onError={() => setFailed(true)}
          className="max-h-[52vh] w-full rounded-lg border border-amber-900/50 bg-black"
        />
      ) : (
        <div className="w-full rounded-lg border border-dashed border-amber-900/50 bg-stone-900/60 p-8">
          <p className="mb-3 text-center text-[11px] text-stone-600">
            [ drop a clip at public/videos/{clip.id}.mp4 ]
          </p>
          <p className="text-lg leading-relaxed text-stone-100">{clip.caption(flags)}</p>
        </div>
      )}

      <button
        onClick={next}
        className="rounded-full bg-amber-500 px-7 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-400"
      >
        {isLast ? "Continue" : "Next"}
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
  return (
    <div className="w-full max-w-2xl">
      <p className="mb-7 text-center text-lg leading-relaxed text-stone-100">{step.prompt(flags)}</p>
      <div className="flex flex-col gap-3">
        {step.options.map((opt) => {
          const locked = opt.requires ? !opt.requires(flags) : false;
          return (
            <button
              key={opt.label}
              disabled={locked}
              onClick={() => !locked && onResolve(opt.apply)}
              className={
                locked
                  ? "cursor-not-allowed rounded-lg border border-stone-800 bg-stone-900/30 px-5 py-3 text-left"
                  : "rounded-lg border border-amber-800 bg-stone-900/60 px-5 py-3 text-left transition hover:border-amber-400 hover:bg-amber-950/40"
              }
            >
              <div className={locked ? "text-stone-600" : "text-amber-100"}>{opt.label}</div>
              {opt.detail && !locked && (
                <div className="mt-1 text-xs text-stone-500">{opt.detail}</div>
              )}
              {locked && opt.lockedReason && (
                <div className="mt-1 text-xs text-stone-700">{opt.lockedReason}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EndCard({
  flags,
  onRestart,
  onExit,
}: {
  flags: ExileFlags;
  onRestart: () => void;
  onExit: () => void;
}) {
  return (
    <div className="w-full max-w-xl text-center">
      <div className="mb-1">
        <BiLabel text="अंक एक समाप्त · End of Act One" className="text-xs font-bold text-amber-400" />
      </div>
      <h2 className="mb-5 text-2xl font-bold text-amber-50">Eleven Days West</h2>
      <p className="mb-6 leading-relaxed text-stone-300">
        Meghadurg's towers are visible from the ridge now. Somewhere inside them is a king my father
        says took my mother from me — and a letter in my mother's hand, written two years after she
        is supposed to have died.
      </p>
      <p className="mb-8 text-sm text-stone-500">
        Both cannot be true. Whatever waits at that gate, I was sent here to end it, and I no longer
        know what "it" is.
      </p>

      <div className="mb-8 rounded-lg border border-stone-700 bg-stone-900/40 p-4 text-left text-sm">
        <div className="mb-2 font-semibold text-stone-300">What the road made of me:</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {(["ruthlessness", "cunning", "renown"] as const).map((k) => (
            <div key={k}>
              <div className="text-lg font-bold text-amber-300">{flags.stats[k]}</div>
              <div className="text-[10px] tracking-wide text-stone-500 uppercase">{k}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-0.5 border-t border-stone-800 pt-3 text-xs text-stone-400">
          <div>
            First meal:{" "}
            {flags.firstMeal === "hunted"
              ? "hunted it himself"
              : flags.firstMeal === "begged"
                ? "asked a farmer for it"
                : "took the goat"}
          </div>
          <div>Chaya: {flags.chaya === "trusted" ? "told her the truth" : "told her nothing"}</div>
          <div>
            The border:{" "}
            {flags.crossing === "bribe"
              ? "paid the toll captain"
              : flags.crossing === "smuggle"
                ? "went around it by night"
                : "walked through with the pilgrims"}
          </div>
          <div>
            The letter:{" "}
            {flags.letter === "believe" ? "believed it" : "called it a forgery"}
          </div>
          <div>
            Supplies: {flags.supplies.food} food, {flags.supplies.coin} coin
          </div>
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
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm">
      {step.kind === "scene" && <Cutscene step={step} flags={flags} onDone={() => onResolve()} />}
      {step.kind === "choice" && <Choice step={step} flags={flags} onResolve={onResolve} />}
      {step.kind === "end" && <EndCard flags={flags} onRestart={onRestart} onExit={onExit} />}
    </div>
  );
}
