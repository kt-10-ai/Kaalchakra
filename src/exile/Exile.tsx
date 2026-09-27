import { Canvas, useFrame } from "@react-three/fiber";
import { Sky, Cloud, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ToneMapping, N8AO, DepthOfField, HueSaturation, BrightnessContrast, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import WalkerControls from "./WalkerControls";
import ExileModal from "./ExileModal";
import World from "./World";
import { useExileEngine } from "./useExileEngine";
import BiLabel from "./BiLabel";
import WindDriver from "./Wind";

interface Props {
  onExit: () => void;
}

/**
 * The road is ~210 units long, so a fixed shadow camera either covers a slice
 * of it (hard cutoff across the ground) or covers all of it at useless
 * resolution. Instead the sun rides along with the player.
 */
function FollowSun() {
  const light = useRef<THREE.DirectionalLight>(null);
  const target = useRef<THREE.Object3D>(null);

  useFrame(({ camera }) => {
    const x = camera.position.x;
    if (light.current) light.current.position.set(x - 55, 60, 38);
    if (target.current) target.current.position.set(x, 0, 0);
  });

  return (
    <>
      <object3D ref={target} />
      <directionalLight
        ref={light}
        intensity={3.4}
        color="#ffc074"
        castShadow
        target={target.current ?? undefined}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
        shadow-camera-near={1}
        shadow-camera-far={260}
        shadow-bias={-0.0004}
        shadow-normalBias={0.06}
      />
    </>
  );
}

function Atmosphere() {
  return (
    <>
      {/* Low sun — long shadows, late-afternoon exile light */}
      <Sky sunPosition={[-150, 16, 60]} turbidity={11} rayleigh={3.1} mieCoefficient={0.028} mieDirectionalG={0.86} />
      <fogExp2 attach="fog" args={["#c9a97e", 0.0035]} />

      <hemisphereLight args={["#9dc0f5", "#8a6234", 0.42]} />
      <ambientLight intensity={0.22} />
      <FollowSun />

      {/* dust hanging in the light */}
      <Sparkles count={260} scale={[520, 12, 80]} position={[220, 5, 0]} size={2.5} speed={0.25} opacity={0.35} color="#ffe6bd" />

      <Cloud position={[120, 60, -140]} speed={0.1} opacity={0.25} segments={22} bounds={[40, 6, 12]} />
      <Cloud position={[400, 70, -120]} speed={0.1} opacity={0.2} segments={22} bounds={[40, 6, 12]} />
    </>
  );
}

export default function Exile({ onExit }: Props) {
  const { flags, activeModal, ambient, locked, onMove, begin, resolveModal, restart, runId, progress } =
    useExileEngine();
  const [looking, setLooking] = useState(false);
  const handleLockChange = useCallback((v: boolean) => setLooking(v), []);

  useEffect(() => {
    begin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  return (
    <div className="relative h-screen w-screen bg-black">
      <Canvas
        key={runId}
        shadows
        dpr={[1, 1.75]}
        camera={{ fov: 62, near: 0.1, far: 1600 }}
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
        <WalkerControls onMove={onMove} locked={locked} onPointerLockChange={handleLockChange} />

        <EffectComposer multisampling={4}>
          {/* contact shadows — without this everything looks like it is hovering */}
          <N8AO aoRadius={0.9} intensity={1.1} distanceFalloff={0.5} quality="medium" halfRes color="#3d2a1a" />
          <Bloom intensity={0.42} luminanceThreshold={0.78} luminanceSmoothing={0.35} mipmapBlur />
          {/* shallow focus on the middle distance, so the road reads with depth */}
          <DepthOfField focusDistance={0.02} focalLength={0.12} bokehScale={1.6} />
          {/* warm the golden hour and lift contrast, the cheap end of colour grading */}
          <HueSaturation saturation={0.06} />
          <BrightnessContrast brightness={-0.01} contrast={0.12} />
          <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.12} />
          <Vignette offset={0.32} darkness={0.55} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>

      <button
        onClick={onExit}
        className="absolute top-4 left-4 rounded-full bg-stone-900/70 px-4 py-2 text-xs font-semibold text-amber-100 backdrop-blur hover:bg-stone-800"
      >
        ← Back
      </button>

      <div className="absolute top-4 right-4 flex items-center gap-3 rounded-full bg-stone-900/70 px-4 py-2 text-xs backdrop-blur">
        <span className="text-stone-400">{"WASD walk · drag to look"}</span>
        <span className="text-stone-700">|</span>
        <span className="text-amber-200">{flags.supplies.food} food</span>
        <span className="text-amber-200">{flags.supplies.coin} coin</span>
      </div>

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
        className="absolute top-0 left-0 h-1 bg-amber-500 transition-all"
        style={{ width: `${progress * 100}%` }}
      />

      {!locked && ambient && (
        <div className="absolute right-0 bottom-0 left-0 flex justify-center px-6 pb-10">
          <div className="max-w-2xl rounded-xl border border-amber-900/50 bg-stone-950/85 p-5 backdrop-blur">
            <div className="mb-1">
              <BiLabel text={ambient.era} className="text-xs font-bold text-amber-400" />
            </div>
            <p className="leading-relaxed text-stone-100">{ambient.text}</p>
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
