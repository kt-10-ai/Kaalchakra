import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, ToneMapping, N8AO, HueSaturation, BrightnessContrast, Noise } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import BiLabel from "../exile/BiLabel";
import DayCycle, { type Key } from "../exile/DayCycle";
import WindDriver from "../exile/Wind";
import WalkerControls from "../exile/WalkerControls";
import { Npc } from "../exile/Characters";
import Fortress from "./Fortress";
import { CAST, ENDINGS } from "./cast";
import { clearSave, useCourtEngine } from "./engine";
import { CHAPTERS, EPISODES } from "./episodes";
import { COLLIDERS, courtGround, PLACES, START, WALL_HALF } from "./locations";
import { hourFor, stage } from "./staging";
import type { CourtState } from "./types";
import BeatView from "./ui/BeatView";
import CaseBook from "./ui/CaseBook";
import HUD, { pose } from "./ui/HUD";

/** Light over one day in Vajragarh, keyed by hour. Sun rises in the east (+x), sets in the west. */
const COURT_KEYS: Key[] = [
  { sx: 4.5, sunAz: 0, sunEl: -14, turbidity: 8, rayleigh: 2.5, lightAz: 210, lightEl: 48, light: "#8ea6ff", lightInt: 0.7, hemiSky: "#2e3c6a", hemiGround: "#140f0a", hemiInt: 0.36, fog: "#1c2232", fogDensity: 0.0035, stars: 1 },
  { sx: 6, sunAz: 4, sunEl: 1.5, turbidity: 6, rayleigh: 2.6, lightAz: 6, lightEl: 7, light: "#ffae80", lightInt: 1.6, hemiSky: "#7f93c0", hemiGround: "#4a3a2e", hemiInt: 0.45, fog: "#9a8e96", fogDensity: 0.0032, stars: 0.3 },
  { sx: 7.5, sunAz: 25, sunEl: 18, turbidity: 6, rayleigh: 1.6, lightAz: 25, lightEl: 22, light: "#ffe0b8", lightInt: 2.8, hemiSky: "#9dc0f5", hemiGround: "#7a6040", hemiInt: 0.46, fog: "#c8bca8", fogDensity: 0.0024, stars: 0 },
  { sx: 10, sunAz: 55, sunEl: 45, turbidity: 5, rayleigh: 1.2, lightAz: 55, lightEl: 48, light: "#fff0da", lightInt: 3.1, hemiSky: "#a0c4f5", hemiGround: "#8a6a44", hemiInt: 0.48, fog: "#d0c8b8", fogDensity: 0.002, stars: 0 },
  { sx: 12, sunAz: 90, sunEl: 68, turbidity: 5, rayleigh: 1.1, lightAz: 90, lightEl: 68, light: "#fff8ea", lightInt: 3.3, hemiSky: "#a8c8f5", hemiGround: "#9a7a54", hemiInt: 0.5, fog: "#d8d2c4", fogDensity: 0.0018, stars: 0 },
  { sx: 14.5, sunAz: 128, sunEl: 44, turbidity: 6, rayleigh: 1.3, lightAz: 128, lightEl: 46, light: "#fff0d4", lightInt: 3.1, hemiSky: "#a0c0ec", hemiGround: "#8a6a44", hemiInt: 0.48, fog: "#d4cab4", fogDensity: 0.002, stars: 0 },
  { sx: 16.5, sunAz: 158, sunEl: 22, turbidity: 8, rayleigh: 2.0, lightAz: 158, lightEl: 24, light: "#ffc88a", lightInt: 3.0, hemiSky: "#b0b8d8", hemiGround: "#6a5030", hemiInt: 0.44, fog: "#d4b490", fogDensity: 0.0026, stars: 0 },
  { sx: 17.8, sunAz: 174, sunEl: 7, turbidity: 10, rayleigh: 3.0, lightAz: 174, lightEl: 9, light: "#ff9a58", lightInt: 2.6, hemiSky: "#a898c0", hemiGround: "#4a3020", hemiInt: 0.42, fog: "#c89070", fogDensity: 0.0032, stars: 0 },
  { sx: 18.4, sunAz: 180, sunEl: 1.2, turbidity: 12, rayleigh: 3.6, lightAz: 180, lightEl: 4, light: "#ff6a3a", lightInt: 2.2, hemiSky: "#9a88b8", hemiGround: "#4a2a20", hemiInt: 0.4, fog: "#b0705a", fogDensity: 0.0038, stars: 0.1 },
  { sx: 19.5, sunAz: 184, sunEl: -6, turbidity: 9, rayleigh: 2.6, lightAz: 215, lightEl: 45, light: "#8ea6ff", lightInt: 0.75, hemiSky: "#34427a", hemiGround: "#160f0a", hemiInt: 0.36, fog: "#2a3044", fogDensity: 0.0036, stars: 0.8 },
  { sx: 24, sunAz: 270, sunEl: -30, turbidity: 8, rayleigh: 2.5, lightAz: 200, lightEl: 50, light: "#8ea6ff", lightInt: 0.65, hemiSky: "#2a3662", hemiGround: "#120d08", hemiInt: 0.34, fog: "#1a2030", fogDensity: 0.0035, stars: 1 },
  { sx: 29, sunAz: 4, sunEl: 1, turbidity: 6, rayleigh: 2.8, lightAz: 6, lightEl: 6, light: "#ffa878", lightInt: 1.5, hemiSky: "#7f90bc", hemiGround: "#4a3a2e", hemiInt: 0.45, fog: "#8e8494", fogDensity: 0.0034, stars: 0.25 },
  { sx: 30, sunAz: 10, sunEl: 5, turbidity: 6, rayleigh: 2.4, lightAz: 10, lightEl: 10, light: "#ffc090", lightInt: 2, hemiSky: "#8aa0cc", hemiGround: "#5a4636", hemiInt: 0.46, fog: "#a89a98", fogDensity: 0.003, stars: 0 },
];

function PoseTracker({ mark }: { mark: [number, number] }) {
  useFrame(({ camera }) => {
    if (import.meta.env.DEV) {
      // test hooks for the automated playthrough
      const w = window as unknown as Record<string, unknown>;
      w.__kcCamera = camera;
      w.__kcMark = mark;
    }
    pose.x = camera.position.x;
    pose.z = camera.position.z;
    pose.yaw = camera.rotation.y;
  });
  return null;
}

/** Starts the episode when the player reaches its mark. */
function Trigger({ mark, active, onReach }: { mark: [number, number]; active: boolean; onReach: () => void }) {
  const fired = useRef(false);
  useEffect(() => {
    fired.current = false;
  }, [mark, active]);
  useFrame(({ camera }) => {
    if (!active || fired.current) return;
    if (Math.hypot(camera.position.x - mark[0], camera.position.z - mark[1]) < 3.4) {
      fired.current = true;
      onReach();
    }
  });
  return null;
}

/** A column of gold light over the next place to go. */
function Beacon({ mark, visible }: { mark: [number, number]; visible: boolean }) {
  const gem = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const y = courtGround(mark[0], mark[1]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (gem.current) {
      gem.current.rotation.y = t * 1.2;
      gem.current.position.y = y + 2.4 + Math.sin(t * 2) * 0.15;
    }
    if (ring.current) ring.current.scale.setScalar(1 + (t % 1.6) * 0.6);
    if (ring.current) (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - (t % 1.6) / 1.6);
  });
  if (!visible) return null;
  return (
    <group position={[mark[0], 0, mark[1]]}>
      <mesh position={[0, y + 14, 0]}>
        <cylinderGeometry args={[0.9, 1.3, 28, 16, 1, true]} />
        <meshBasicMaterial color="#ffc860" transparent opacity={0.12} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={gem}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshBasicMaterial color="#ffe0a0" toneMapped={false} />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position={[0, y + 0.05, 0]}>
        <ringGeometry args={[1.8, 2.1, 40]} />
        <meshBasicMaterial color="#ffc860" transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Cast({ index }: { index: number }) {
  const staged = useMemo(() => stage(index), [index]);
  return (
    <>
      {[...staged.values()].map((s) => {
        const person = CAST[s.id as keyof typeof CAST];
        if (!person) return null;
        return <Npc key={s.id} look={person.look} x={s.x} z={s.z} y={s.y} rotY={s.rotY} />;
      })}
    </>
  );
}

function ChapterCard({ chapter, onDone }: { chapter: number; onDone: () => void }) {
  const ch = CHAPTERS.find((c) => c.n === chapter);
  useEffect(() => {
    const t = setTimeout(onDone, 4200);
    const k = (e: KeyboardEvent) => (e.key === " " || e.key === "Enter") && onDone();
    window.addEventListener("keydown", k);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", k);
    };
  }, [onDone]);
  if (!ch) return null;
  return (
    <div className="kc-fade absolute inset-0 z-30 flex cursor-pointer flex-col items-center justify-center bg-black/70" onClick={onDone}>
      <div className="kc-rise text-xs tracking-[0.4em] text-amber-600 uppercase">Chapter {ch.n} of 10</div>
      <div className="kc-rise-late mt-3">
        <BiLabel text={ch.title} className="font-serif text-4xl text-amber-50" />
      </div>
      {chapter === 1 && <p className="kc-rise-late mt-6 max-w-xl text-center font-serif text-stone-400 italic">Vajragarh. The day of the trial. By sunset, a king will hand his son a sword.</p>}
    </div>
  );
}

function EndingCard({ state, id, onRestart, onExit }: { state: CourtState; id: keyof typeof ENDINGS; onRestart: () => void; onExit: () => void }) {
  const e = ENDINGS[id];
  return (
    <div className="kc-fade absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/85 p-6 backdrop-blur-sm">
      <div className="my-auto max-w-2xl text-center">
        <BiLabel text={e.label} className="text-xs font-bold text-amber-400" />
        <h2 className="kc-rise mt-2 mb-5 font-serif text-3xl text-amber-50">{e.title}</h2>
        <div className="kc-stagger space-y-3">
          {e.body(state).map((p, i) => (
            <p key={i} className="font-serif text-[16px] leading-relaxed text-stone-200">
              {p}
            </p>
          ))}
        </div>
        <p className="kc-rise-late mt-5 font-serif text-lg text-amber-200/90 italic">{e.coda(state)}</p>
        <p className="mt-6 text-xs text-stone-500">Reached at episode {Math.min(state.episode + 1, EPISODES.length)} of {EPISODES.length}.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={onRestart} className="rounded-full bg-amber-500 px-6 py-3 font-semibold text-stone-900 hover:bg-amber-400">
            Begin the Day Again
          </button>
          <button onClick={onExit} className="rounded-full border border-stone-700 px-6 py-3 font-semibold text-stone-300 hover:border-stone-500">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

function CompleteCard({ state, onRoad, onExit }: { state: CourtState; onRoad: () => void; onExit: () => void }) {
  return (
    <div className="kc-fade absolute inset-0 z-40 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
      <div className="max-w-xl text-center">
        <BiLabel text={ENDINGS["court-complete"].label} className="text-xs font-bold text-amber-400" />
        <h2 className="mt-2 mb-4 font-serif text-3xl text-amber-50">The Gate Closes at Dawn</h2>
        <p className="font-serif text-stone-300">
          One hundred episodes, one day. You leave Vajragarh with {state.supplies.coin} coin, {state.supplies.food} food, and {state.clues.length} things you know that your father doesn't know you know.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          {(["ruthlessness", "cunning", "renown"] as const).map((k) => (
            <div key={k} className="rounded-lg border border-stone-800 p-3">
              <div className="text-2xl font-bold text-amber-300">{state.stats[k]}</div>
              <div className="text-[10px] tracking-widest text-stone-500 uppercase">{k}</div>
            </div>
          ))}
        </div>
        <div className="mt-7 flex justify-center gap-3">
          <button onClick={onRoad} className="rounded-full bg-amber-500 px-6 py-3 font-semibold text-stone-900 hover:bg-amber-400">
            निर्वासन · Ride West
          </button>
          <button onClick={onExit} className="rounded-full border border-stone-700 px-6 py-3 font-semibold text-stone-300 hover:border-stone-500">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export interface Carry {
  stats: CourtState["stats"];
  supplies: CourtState["supplies"];
}

interface Props {
  initial: CourtState | null;
  onExit: () => void;
  onRestart: () => void;
  onComplete: (carry: Carry) => void;
}

export default function Court({ initial, onExit, onRestart, onComplete }: Props) {
  const engine = useCourtEngine(initial);
  const { run, beat, episode } = engine;
  const [caseBook, setCaseBook] = useState(false);

  const index = run.state.episode;
  const hour = hourFor(index, CHAPTERS);
  const hourRef = useRef(hour);
  hourRef.current = hour;
  const staged = useMemo(() => stage(index), [index]);

  const walking = run.phase === "walk";
  const inEpisode = run.phase === "episode";
  const mark = episode ? PLACES[episode.location].mark : START_MARK;

  // Episode 1 begins where you wake up.
  useEffect(() => {
    if (walking && index === 0) engine.start();
  }, [walking, index, engine]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c" && !caseBook && run.phase !== "chapter") setCaseBook(true);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [caseBook, run.phase]);

  const speaker = beat && (beat.t === "say" || beat.t === "talk") ? beat.who : undefined;
  const focusPoint = useCallback((): [number, number, number] | null => {
    if (!inEpisode || !episode) return null;
    const who = speaker && speaker !== "narrator" && speaker !== "arun" ? speaker : episode.cast[0];
    const s = who ? staged.get(who) : undefined;
    if (s) return [s.x, s.y + 1.55, s.z];
    const p = PLACES[episode.location];
    const slot = p.slots[0];
    return [slot.x, courtGround(slot.x, slot.z) + 1.4, slot.z];
  }, [inEpisode, episode, speaker, staged]);

  const restart = () => {
    clearSave();
    onRestart();
  };

  return (
    <div className="relative h-screen w-screen bg-black">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ fov: 60, near: 0.1, far: 2000 }}
        gl={{ antialias: true, toneMappingExposure: 1.05 }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          scene.background = new THREE.Color("#101218");
        }}
      >
        <DayCycle keys={COURT_KEYS} at={() => hourRef.current} shadowSpan={70} />
        <WindDriver />
        <Suspense fallback={null}>
          <Fortress />
        </Suspense>
        <Cast index={index} />
        <Beacon mark={mark} visible={walking} />
        <Trigger mark={mark} active={walking && index > 0} onReach={engine.start} />
        <PoseTracker mark={mark} />
        <WalkerControls
          onMove={() => {}}
          locked={!walking || caseBook}
          focusPoint={focusPoint}
          ground={courtGround}
          bounds={{ minX: -WALL_HALF + 1, maxX: WALL_HALF - 1, minZ: -WALL_HALF + 1, maxZ: WALL_HALF - 1 }}
          start={START}
          colliders={COLLIDERS}
        />
        <EffectComposer multisampling={4}>
          <N8AO aoRadius={0.9} intensity={1.1} distanceFalloff={0.5} quality="medium" halfRes color="#2a1e14" />
          <Bloom intensity={0.55} luminanceThreshold={0.82} luminanceSmoothing={0.3} mipmapBlur />
          <HueSaturation saturation={0.06} />
          <BrightnessContrast brightness={-0.01} contrast={0.14} />
          <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.1} />
          <Vignette offset={0.3} darkness={0.62} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>

      <button onClick={onExit} className="absolute top-4 left-4 z-30 rounded-full bg-stone-900/70 px-4 py-2 text-xs font-semibold text-amber-100 backdrop-blur hover:bg-stone-800">
        ← Back
      </button>

      <HUD state={run.state} episode={episode} walking={walking} toasts={run.toasts} dismiss={engine.dismiss} onCaseBook={() => setCaseBook(true)} hour={hour} />

      {inEpisode && beat && episode && (
        <BeatView
          beat={beat}
          state={run.state}
          episode={episode}
          asked={run.asked}
          onAdvance={engine.advance}
          onChoose={engine.choose}
          onAsk={engine.ask}
          onLeave={engine.leave}
          onPuzzle={engine.finishPuzzle}
          onOpenCaseBook={() => setCaseBook(true)}
        />
      )}

      {run.phase === "chapter" && episode && <ChapterCard chapter={episode.chapter} onDone={engine.chapterDone} />}
      {run.phase === "ending" && run.ending && <EndingCard state={run.state} id={run.ending} onRestart={restart} onExit={onExit} />}
      {run.phase === "complete" && (
        <CompleteCard
          state={run.state}
          onExit={onExit}
          onRoad={() => {
            clearSave();
            onComplete({ stats: run.state.stats, supplies: { food: Math.max(1, run.state.supplies.food), coin: run.state.supplies.coin } });
          }}
        />
      )}
      {caseBook && <CaseBook state={run.state} onClose={() => setCaseBook(false)} />}
    </div>
  );
}

const START_MARK: [number, number] = [START.x, START.z];
