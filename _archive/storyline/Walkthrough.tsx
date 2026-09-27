import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import WalkerControls from "./WalkerControls";
import StoryModal from "./StoryModal";
import { useStoryEngine } from "./useStoryEngine";
import type { Flags } from "./story";

interface Props {
  onExit: () => void;
  onFounderComplete: (flags: Flags) => void;
}

function Scene() {
  const { scene } = useGLTF("/models/vijayanagara.glb");
  return <primitive object={scene} />;
}

export default function Walkthrough({ onExit, onFounderComplete }: Props) {
  const { flags, activeModal, ambient, locked, onMove, resolveModal, restart, runId, progress } =
    useStoryEngine();

  return (
    <div className="relative h-screen w-screen bg-black">
      <Canvas key={runId} camera={{ fov: 60, near: 0.1, far: 500 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[60, 80, 40]} intensity={1.8} castShadow />
        <fog attach="fog" args={["#1a1712", 60, 220]} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
        <WalkerControls onMove={onMove} locked={locked} />
      </Canvas>

      {/* HUD */}
      <button
        onClick={onExit}
        className="absolute top-4 left-4 rounded-full bg-stone-900/80 px-4 py-2 text-xs font-semibold text-amber-100 backdrop-blur hover:bg-stone-800"
      >
        ← Back to Kaalchakra
      </button>

      <div className="absolute top-4 right-4 rounded-full bg-stone-900/80 px-4 py-2 text-xs text-stone-300 backdrop-blur">
        WASD / Arrow keys to walk
      </div>

      <div
        className="absolute top-0 left-0 h-1 bg-amber-500 transition-all"
        style={{ width: `${progress * 100}%` }}
      />

      {/* ambient narration for plain walk beats */}
      {!locked && ambient && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center px-6 pb-10">
          <div className="max-w-2xl rounded-xl border border-amber-800/50 bg-stone-950/85 p-5 backdrop-blur">
            <div className="mb-1 text-xs font-bold tracking-widest text-amber-400 uppercase">
              {ambient.era}
            </div>
            <p className="text-stone-100">{ambient.text}</p>
          </div>
        </div>
      )}

      {activeModal && (
        <StoryModal
          step={activeModal}
          flags={flags}
          onResolve={resolveModal}
          onRestart={restart}
          onProceed={() => onFounderComplete(flags)}
        />
      )}
    </div>
  );
}

useGLTF.preload("/models/vijayanagara.glb");
