import { useEffect } from "react";
import BiLabel from "../../exile/BiLabel";
import { displayName } from "../cast";
import { resolve } from "../engine";
import type { Beat, CourtState, Episode, Option, Topic } from "../types";
import PuzzleView from "../puzzles/PuzzleView";

interface Props {
  beat: Beat;
  state: CourtState;
  episode: Episode;
  asked: string[];
  onAdvance: () => void;
  onChoose: (o: Option) => void;
  onAsk: (t: Topic) => void;
  onLeave: () => void;
  onPuzzle: (solved: boolean) => void;
  onOpenCaseBook: () => void;
}

const SPEAKER_COLORS: Record<string, string> = {
  bhanusen: "text-red-300",
  ranadhir: "text-sky-300",
  chaya: "text-rose-300",
  kaushal: "text-violet-300",
  ugrasen: "text-orange-300",
  devashrava: "text-amber-300",
  vidyadhar: "text-stone-200",
  sumitra: "text-amber-200",
  nandini: "text-cyan-200",
  padmavati: "text-pink-300",
  jaswant: "text-red-400",
  bhairav: "text-lime-300",
  karan: "text-stone-300",
  vikram: "text-orange-200",
  moti: "text-yellow-200",
  bhola: "text-stone-300",
};

function Letterbox({ light = false }: { light?: boolean }) {
  return (
    <>
      <div className={`kc-bar-top pointer-events-none absolute top-0 right-0 left-0 bg-black ${light ? "h-[6vh]" : "h-[10vh]"}`} />
      <div className={`kc-bar-bottom pointer-events-none absolute right-0 bottom-0 left-0 bg-black ${light ? "h-[3vh]" : "h-[10vh]"}`} />
    </>
  );
}

function EpisodeTitle({ episode }: { episode: Episode }) {
  return (
    <div className="pointer-events-none absolute top-[10vh] right-0 left-0 flex justify-center pt-4">
      <div className="flex items-center gap-3 text-xs">
        <span className="text-stone-500">Episode {episode.n}</span>
        <BiLabel text={episode.title} className="font-semibold text-amber-300/90" />
      </div>
    </div>
  );
}

function Say({ beat, state, onAdvance }: { beat: Extract<Beat, { t: "say" }>; state: CourtState; onAdvance: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onAdvance();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onAdvance]);

  const text = resolve(beat.text, state);
  const who = beat.who && beat.who !== "narrator" ? beat.who : null;
  return (
    <div className="absolute inset-0 cursor-pointer" onClick={onAdvance}>
      <div className="pointer-events-none absolute right-0 bottom-[10vh] left-0 flex flex-col items-center px-8 pb-7">
        {who && (
          <div key={`${who}${text}`} className={`kc-rise mb-2 text-sm font-semibold tracking-wide ${SPEAKER_COLORS[who] ?? "text-amber-200"}`}>
            {displayName(who)}
          </div>
        )}
        <p
          key={text}
          className={`kc-rise max-w-3xl text-center font-serif leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] ${
            who ? "text-[21px] text-stone-50" : "text-[20px] text-stone-200 italic"
          }`}
        >
          {who ? `“${text}”` : text}
        </p>
      </div>
      <div className="pointer-events-none absolute right-8 bottom-[calc(10vh+1.1rem)] text-[10px] tracking-widest text-stone-500 uppercase">
        Space ›
      </div>
    </div>
  );
}

function OptionButton({ n, label, detail, locked, lockedReason, asked, evidence, onClick }: { n: number; label: string; detail?: string; locked?: boolean; lockedReason?: string; asked?: boolean; evidence?: boolean; onClick: () => void }) {
  return (
    <button
      disabled={locked}
      onClick={onClick}
      className={
        locked
          ? "flex cursor-not-allowed gap-4 rounded-lg border border-stone-800/80 bg-black/50 px-5 py-2.5 text-left"
          : asked
            ? "flex gap-4 rounded-lg border border-stone-800 bg-black/40 px-5 py-2.5 text-left opacity-60 hover:opacity-90"
            : `group flex gap-4 rounded-lg border ${evidence ? "border-sky-800/70" : "border-amber-800/60"} bg-black/55 px-5 py-2.5 text-left backdrop-blur transition hover:-translate-y-0.5 ${evidence ? "hover:border-sky-400" : "hover:border-amber-400"} hover:bg-amber-950/40`
      }
    >
      <span className={locked ? "pt-0.5 text-xs text-stone-700" : "pt-0.5 text-xs text-amber-500"}>{n}</span>
      <span>
        <span className={locked ? "block text-stone-600" : asked ? "block text-stone-400" : evidence ? "block text-sky-100" : "block text-amber-50"}>
          {asked && "✓ "}
          {label}
        </span>
        {detail && !locked && <span className="mt-0.5 block text-xs text-stone-400">{detail}</span>}
        {locked && lockedReason && <span className="mt-0.5 block text-xs text-stone-600">{lockedReason}</span>}
      </span>
    </button>
  );
}

function Choice({ beat, state, onChoose }: { beat: Extract<Beat, { t: "choice" }>; state: CourtState; onChoose: (o: Option) => void }) {
  const visible = beat.options.filter((o) => !o.showIf || o.showIf(state));
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const o = visible[Number(e.key) - 1];
      if (o && !(o.requires && !o.requires(state))) onChoose(o);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [visible, state, onChoose]);

  return (
    <div className="absolute inset-0">
      <div className="kc-fade pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />
      <div className="absolute right-0 bottom-0 left-0 flex justify-center px-6 pb-8">
        <div className="w-full max-w-2xl">
          <p className="kc-rise mb-5 text-center font-serif text-lg leading-relaxed text-stone-50 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{resolve(beat.prompt, state)}</p>
          <div className="kc-stagger flex flex-col gap-2">
            {visible.map((o, i) => {
              const locked = o.requires ? !o.requires(state) : false;
              return <OptionButton key={o.label} n={i + 1} label={o.label} detail={o.detail} locked={locked} lockedReason={o.lockedReason} onClick={() => !locked && onChoose(o)} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Talk({ beat, state, asked, onAsk, onLeave, onOpenCaseBook }: { beat: Extract<Beat, { t: "talk" }>; state: CourtState; asked: string[]; onAsk: (t: Topic) => void; onLeave: () => void; onOpenCaseBook: () => void }) {
  const topics = beat.topics.filter((t) => !t.requires || t.requires(state));
  const missing = beat.topics.filter((t) => t.required && !asked.includes(t.id) && (!t.requires || t.requires(state)));
  const canLeave = missing.length === 0;
  const isSearch = beat.who === "narrator";
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = topics[Number(e.key) - 1];
      if (t && !asked.includes(t.id)) onAsk(t);
      if ((e.key === "Escape" || e.key === "0") && canLeave) onLeave();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [topics, asked, canLeave, onAsk, onLeave]);

  return (
    <div className="absolute inset-0">
      <div className="kc-fade pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
      <div className="absolute right-0 bottom-0 left-0 flex justify-center px-6 pb-8">
        <div className="w-full max-w-2xl">
          <div className="mb-1 text-center text-sm font-semibold tracking-wide text-amber-300">
            {isSearch ? "Search" : `Talk — ${displayName(beat.who)}`}
          </div>
          <p className="kc-rise mb-5 text-center font-serif text-lg leading-relaxed text-stone-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">{resolve(beat.intro, state)}</p>
          <div className="flex flex-col gap-2">
            {topics.map((t, i) => (
              <OptionButton key={t.id} n={i + 1} label={t.label} asked={asked.includes(t.id)} evidence={t.label.startsWith("Show")} onClick={() => !asked.includes(t.id) && onAsk(t)} />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button onClick={onOpenCaseBook} className="text-xs text-stone-400 hover:text-amber-200">
              Case Book (C)
            </button>
            <button
              onClick={onLeave}
              disabled={!canLeave}
              className={canLeave ? "rounded-full border border-stone-600 px-5 py-1.5 text-xs font-semibold text-stone-200 hover:border-amber-400" : "cursor-not-allowed rounded-full border border-stone-800 px-5 py-1.5 text-xs text-stone-600"}
              title={canLeave ? "" : "There's something you still need to ask"}
            >
              {canLeave ? (isSearch ? "Done searching (Esc)" : "Leave (Esc)") : `Still to ask: ${missing.length}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BeatView(p: Props) {
  const { beat, state, episode } = p;
  if (beat.t === "puzzle") {
    return <PuzzleView key={beat.puzzle.title} puzzle={beat.puzzle} state={state} onDone={p.onPuzzle} />;
  }
  return (
    <div className="absolute inset-0 z-10">
      <Letterbox light={beat.t !== "say"} />
      {beat.t === "say" && <EpisodeTitle episode={episode} />}
      {beat.t === "say" && <Say beat={beat} state={state} onAdvance={p.onAdvance} />}
      {beat.t === "choice" && <Choice beat={beat} state={state} onChoose={p.onChoose} />}
      {beat.t === "talk" && <Talk beat={beat} state={state} asked={p.asked} onAsk={p.onAsk} onLeave={p.onLeave} onOpenCaseBook={p.onOpenCaseBook} />}
    </div>
  );
}
