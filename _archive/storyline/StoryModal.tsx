import { useState } from "react";
import { getVideoId, isFounderEnding, type Flags, type Step } from "./story";

interface Props {
  step: Step;
  flags: Flags;
  onResolve: (apply?: (f: Flags) => Flags) => void;
  onRestart: () => void;
  onProceed: () => void;
}

function VideoCutscene({
  step,
  flags,
  onResolve,
}: {
  step: Extract<Step, { kind: "video" }>;
  flags: Flags;
  onResolve: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const videoId = getVideoId(step, flags);
  const src = `/videos/${videoId}.mp4`;

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4">
      <div className="text-xs font-bold tracking-widest text-amber-400 uppercase">{step.title}</div>
      {!failed ? (
        <video
          src={src}
          autoPlay
          controls
          onEnded={onResolve}
          onError={() => setFailed(true)}
          className="max-h-[50vh] w-full rounded-lg border border-amber-800/50 bg-black"
        />
      ) : (
        <div className="w-full rounded-lg border border-dashed border-amber-800/50 bg-stone-900/60 p-8 text-center">
          <p className="mb-2 text-xs text-stone-500">
            [ cutscene placeholder — drop a clip at public/videos/{videoId}.mp4 ]
          </p>
          <p className="text-stone-100">{step.fallback(flags)}</p>
        </div>
      )}
      <button
        onClick={onResolve}
        className="rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-400"
      >
        Continue
      </button>
    </div>
  );
}

const STAT_LABELS: { key: keyof Flags["stats"]; label: string }[] = [
  { key: "loyalty", label: "Loyalty" },
  { key: "cunning", label: "Cunning" },
  { key: "piety", label: "Piety" },
  { key: "renown", label: "Renown" },
];

function StatsBar({ stats }: { stats: Flags["stats"] }) {
  return (
    <div className="mb-6 flex justify-center gap-4">
      {STAT_LABELS.map(({ key, label }) => (
        <div key={key} className="text-center">
          <div className="text-sm font-bold text-amber-300">{stats[key]}</div>
          <div className="text-[10px] tracking-wide text-stone-500 uppercase">{label}</div>
        </div>
      ))}
    </div>
  );
}

function ChoicePrompt({
  step,
  flags,
  onResolve,
}: {
  step: Extract<Step, { kind: "choice" }>;
  flags: Flags;
  onResolve: (apply: (f: Flags) => Flags) => void;
}) {
  return (
    <div className="w-full max-w-xl">
      <StatsBar stats={flags.stats} />
      <p className="mb-6 text-center text-lg text-stone-100">{step.prompt(flags)}</p>
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
                  ? "cursor-not-allowed rounded-lg border border-stone-800 bg-stone-900/30 px-5 py-3 text-left text-stone-500"
                  : "rounded-lg border border-amber-700 bg-stone-900/60 px-5 py-3 text-left text-amber-100 transition hover:border-amber-400 hover:bg-amber-950/40"
              }
            >
              <div>{opt.label}</div>
              {locked && opt.lockedReason && (
                <div className="mt-1 text-xs text-stone-600">{opt.lockedReason}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EndingScreen({
  flags,
  onRestart,
  onProceed,
}: {
  flags: Flags;
  onRestart: () => void;
  onProceed: () => void;
}) {
  const founder = isFounderEnding(flags);
  return (
    <div className="w-full max-w-xl text-center">
      <div className="mb-1 text-xs font-bold tracking-widest text-amber-400 uppercase">
        {founder ? "Act One Complete — Founder" : "Ending — Loyalist"}
      </div>
      <h2 className="mb-4 text-2xl font-bold text-amber-50">
        {founder ? "The City of Victory" : "The Garrison That Stayed"}
      </h2>
      <p className="mb-6 text-stone-300">
        {founder
          ? "Bukka and I founded Vijayanagara together. What it becomes — how it stands against what's coming from the north — is no longer a story that happens to me. Now I have to govern it."
          : "I kept my post and my oath. Vijayanagara rose without me, two hundred years of a history I watched from the outside. Loyalty wasn't the wrong virtue — it was just spent on the wrong kingdom."}
      </p>
      <StatsBar stats={flags.stats} />
      <div className="mb-6 rounded-lg border border-stone-700 bg-stone-900/40 p-4 text-left text-sm text-stone-400">
        <div className="mb-1 font-semibold text-stone-300">My choices:</div>
        <div>
          Rudramadevi's example: {flags.legacy === "inspiration" ? "a reason to defy" : "a cautionary tale"}
        </div>
        {flags.ambition !== null && (
          <div>Delhi's commendation: {flags.ambition === "duty" ? "welcomed it" : "felt the cost in it"}</div>
        )}
        <div>Village order: {flags.mercy ? "showed mercy" : "carried it out"}</div>
        <div>Vidyaranya: {flags.trust ? "trusted" : "reported"}</div>
        {flags.redeemed !== null && <div>Last moment: {flags.redeemed ? "changed my mind" : "held firm"}</div>}
        {flags.widow !== null && (
          <div>The widow's petition: {flags.widow === "land" ? "granted" : "deferred"}</div>
        )}
        {flags.approach !== null && (
          <div>Consolidation: {flags.approach === "diplomacy" ? "alliances and patronage" : "demonstrated strength"}</div>
        )}
      </div>
      {founder ? (
        <button
          onClick={onProceed}
          className="rounded-full bg-amber-500 px-6 py-3 font-semibold text-stone-900 hover:bg-amber-400"
        >
          Govern Vijayanagara →
        </button>
      ) : (
        <>
          <p className="mb-6 text-xs text-stone-500">
            Only the founder path goes on to govern the kingdom. Different choices at the river lead to a
            different city — or none at all.
          </p>
          <button
            onClick={onRestart}
            className="rounded-full bg-amber-500 px-6 py-3 font-semibold text-stone-900 hover:bg-amber-400"
          >
            Walk It Again, Differently
          </button>
        </>
      )}
    </div>
  );
}

export default function StoryModal({ step, flags, onResolve, onRestart, onProceed }: Props) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
      {step.kind === "video" && (
        <VideoCutscene step={step} flags={flags} onResolve={() => onResolve()} />
      )}
      {step.kind === "choice" && <ChoicePrompt step={step} flags={flags} onResolve={onResolve} />}
      {step.kind === "ending" && (
        <EndingScreen flags={flags} onRestart={onRestart} onProceed={onProceed} />
      )}
    </div>
  );
}
