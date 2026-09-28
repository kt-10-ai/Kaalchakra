import { Canvas } from "@react-three/fiber";
import { Cloud, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ToneMapping, N8AO, HueSaturation, BrightnessContrast, Noise } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import WalkerControls from "./WalkerControls";
import ExileModal from "./ExileModal";
import World from "./World";
import { useExileEngine } from "./useExileEngine";
import BiLabel from "./BiLabel";
import WindDriver from "./Wind";
import DayCycle from "./DayCycle";
import { Chaya, RoadPeople } from "./Characters";
import type { ExileFlags, Focus } from "./story";

interface Props {
  onExit: () => void;
  initialFlags?: ExileFlags;
  fromCourt?: boolean;
}

function Atmosphere() {
  return (
    <>
      <DayCycle />
      {/* dust hanging in the light */}
      <Sparkles count={480} scale={[820, 10, 70]} position={[360, 4, 0]} size={2.4} speed={0.25} opacity={0.35} color="#ffe6bd" />
      <Cloud position={[120, 70, -160]} speed={0.1} opacity={0.22} segments={22} bounds={[50, 6, 14]} />
      <Cloud position={[300, 80, 150]} speed={0.1} opacity={0.2} segments={22} bounds={[50, 6, 14]} />
      <Cloud position={[460, 75, -130]} speed={0.1} opacity={0.18} segments={22} bounds={[40, 6, 12]} />
    </>
  );
}

export default function Exile({ onExit, initialFlags, fromCourt = false }: Props) {
  const { flags, activeModal, ambient, locked, onMove, begin, resolveModal, restart, runId, progress } =
    useExileEngine(initialFlags, fromCourt);
  const [looking, setLooking] = useState(false);
  const handleLockChange = useCallback((v: boolean) => setLooking(v), []);
  const [afterFocus, setAfterFocus] = useState<Focus | null>(null);
  const lastModal = useRef(activeModal);

  useEffect(() => {
    begin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  // after a scene that asks for it, turn the player back to the road
  useEffect(() => {
    const prev = lastModal.current;
    lastModal.current = activeModal;
    // after a beat that turned the camera, hand the player back facing the road
    const prevFocus = prev && (prev.kind === "scene" || prev.kind === "choice") ? prev.focus : undefined;
    if (prev && !activeModal && prevFocus) {
      setAfterFocus((prev.kind === "scene" && prev.thenFace) || "road");
      const id = setTimeout(() => setAfterFocus(null), 1600);
      return () => clearTimeout(id);
    }
  }, [activeModal]);

  const focus =
    activeModal && (activeModal.kind === "scene" || activeModal.kind === "choice")
      ? (activeModal.focus ?? null)
      : afterFocus;

  return (
    <div className="relative h-screen w-screen bg-black">
      <Canvas
        key={runId}
        shadows
        dpr={[1, 1.75]}
        camera={{ fov: 62, near: 0.1, far: 2400 }}
        gl={{ antialias: true, toneMappingExposure: 1.05 }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          scene.background = new THREE.Color("#d8bd93");
        }}
      >
        <Atmosphere />
        <WindDriver />
        <Suspense fallback={null}>
          <World />
        </Suspense>
        <RoadPeople />
        <Chaya joined={flags.chaya !== null} />
        <WalkerControls onMove={onMove} locked={locked} onPointerLockChange={handleLockChange} focus={focus} />

        <EffectComposer multisampling={4}>
          {/* contact shadows — without this everything looks like it is hovering */}
          <N8AO aoRadius={0.9} intensity={1.1} distanceFalloff={0.5} quality="medium" halfRes color="#3d2a1a" />
          <Bloom intensity={0.6} luminanceThreshold={0.82} luminanceSmoothing={0.3} mipmapBlur />
          <HueSaturation saturation={0.1} />
          <BrightnessContrast brightness={-0.01} contrast={0.14} />
          <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.1} />
          <Vignette offset={0.3} darkness={0.6} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>

      <button
        onClick={onExit}
        className="absolute top-4 left-4 z-20 rounded-full bg-stone-900/70 px-4 py-2 text-xs font-semibold text-amber-100 backdrop-blur hover:bg-stone-800"
      >
        ← Back
      </button>

      {!locked && (
        <div className="absolute top-4 right-4 flex items-center gap-3 rounded-full bg-stone-900/70 px-4 py-2 text-xs backdrop-blur">
          <span className="text-stone-400">{"WASD walk · shift to jog · drag to look"}</span>
          <span className="text-stone-700">|</span>
          <span className="text-amber-200">{flags.supplies.food} food</span>
          <span className="text-amber-200">{flags.supplies.coin} coin</span>
        </div>
      )}

      {/* a faint reticle, brighter while the player is actively looking */}
      {!locked && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={`rounded-full bg-amber-100 transition-all ${
              looking ? "h-1.5 w-1.5 opacity-70" : "h-1 w-1 opacity-30"
            }`}
          />
        </div>
      )}

      <div
        className="absolute top-0 left-0 z-20 h-1 bg-amber-500 transition-all duration-700"
        style={{ width: `${progress * 100}%` }}
      />

      {/* entering a new stretch of road: a chapter title, then the narration */}
      {!locked && ambient && (
        <div key={ambient.era} className="pointer-events-none">
          <div className="kc-chapter absolute top-[16%] right-0 left-0 text-center">
            <BiLabel text={ambient.era} className="text-2xl font-semibold text-amber-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]" />
          </div>
          <div className="kc-rise absolute right-0 bottom-0 left-0 flex justify-center px-6 pb-10">
            <div className="max-w-2xl rounded-xl border border-amber-900/40 bg-stone-950/75 p-5 backdrop-blur-md">
              <p className="font-serif text-[17px] leading-relaxed text-stone-100">{ambient.text}</p>
            </div>
          </div>
        </div>
      )}

      {activeModal && (
        <ExileModal
          step={activeModal}
          flags={flags}
          onResolve={resolveModal}
          onRestart={restart}
          onExit={onExit}
        />
      )}
    </div>
  );
}
