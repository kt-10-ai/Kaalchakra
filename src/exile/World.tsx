import { useGLTF } from "@react-three/drei";
import { Component, Suspense, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { WORLD, USED_MODELS, ROAD_LENGTH, type Placement } from "./worldData";
import { applyWind, registerWindClock } from "./Wind";

/**
 * The world runs to several hundred metres and a few thousand props, so every
 * placement of a given model is drawn as one InstancedMesh rather than its own
 * object. Without this the draw-call count makes the scene unusable.
 */
function InstancedPart({
  geometry,
  material,
  local,
  placements,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  local: THREE.Matrix4;
  placements: Placement[];
}) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3();
    const euler = new THREE.Euler();

    placements.forEach((p, i) => {
      pos.set(p.pos[0], p.pos[1], p.pos[2]);
      euler.set(0, p.rotY ?? 0, 0);
      quat.setFromEuler(euler);
      const s = p.scale ?? 1;
      scl.set(s, s, s);
      m.compose(pos, quat, scl);
      // keep the mesh's own transform from inside the glTF
      m.multiply(local);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [placements, local]);

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material as THREE.Material, placements.length]}
      castShadow
      receiveShadow
      frustumCulled
    />
  );
}

/** Vegetation sways; stone and timber do not. */
const SWAYS = /tree_|plant_|grass|bush|mushroom/;

/**
 * Every material in the Kenney kits ships with metallicFactor = 1. A fully
 * metallic surface has no diffuse response — it only shows reflected
 * environment — so without an env map these render black or flat grey. Dirt,
 * bark and foliage are dielectrics, so force metalness off and keep them rough.
 */
function fixMaterial(src: THREE.Material): THREE.Material {
  const m = src.clone() as THREE.MeshStandardMaterial;
  if ("metalness" in m) {
    m.metalness = 0;
    m.roughness = 0.85;
  }
  return m;
}

function InstancedModel({ model, placements }: { model: string; placements: Placement[] }) {
  const { scene } = useGLTF(`/models/kit/${model}`);

  const parts = useMemo(() => {
    scene.updateMatrixWorld(true);
    const out: { geometry: THREE.BufferGeometry; material: THREE.Material | THREE.Material[]; local: THREE.Matrix4 }[] = [];
    const windy = SWAYS.test(model);
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      // materials are shared across the glTF cache, so always work on a copy
      const src = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const mat = fixMaterial(src);
      if (windy) {
        registerWindClock(
          applyWind(mat, model.includes("grass") || model.includes("plant_") ? 2.2 : 1)
        );
      }
      out.push({ geometry: mesh.geometry, material: mat, local: mesh.matrixWorld.clone() });
    });
    return out;
  }, [scene, model]);

  return (
    <>
      {parts.map((part, i) => (
        <InstancedPart
          key={i}
          geometry={part.geometry}
          material={part.material}
          local={part.local}
          placements={placements}
        />
      ))}
    </>
  );
}

/** Ground: dry earth near Vajragarh grading to irrigated green near Meghadurg. */
function Terrain() {
  const mid = ROAD_LENGTH / 2;
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[mid, -0.02, 0]} receiveShadow>
        <planeGeometry args={[ROAD_LENGTH + 400, 700]} />
        <meshStandardMaterial color="#6f7d4c" roughness={0.95} metalness={0} />
      </mesh>
      {/* the dry western half */}
      <mesh rotation-x={-Math.PI / 2} position={[ROAD_LENGTH * 0.18, -0.01, 0]} receiveShadow>
        <planeGeometry args={[ROAD_LENGTH * 0.75, 700]} />
        <meshStandardMaterial color="#8d7a54" roughness={0.95} metalness={0} transparent opacity={0.92} />
      </mesh>
      {/* the packed-earth road */}
      <mesh rotation-x={-Math.PI / 2} position={[mid, 0.02, 0]} receiveShadow>
        <planeGeometry args={[ROAD_LENGTH + 400, 11]} />
        <meshStandardMaterial color="#9c8763" roughness={0.98} metalness={0} />
      </mesh>
    </group>
  );
}

/** One failed model load would otherwise take the whole canvas down. */
class ModelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function World() {
  const byModel = useMemo(() => {
    const map = new Map<string, Placement[]>();
    for (const p of WORLD) {
      const list = map.get(p.model);
      if (list) list.push(p);
      else map.set(p.model, [p]);
    }
    return [...map.entries()];
  }, []);

  return (
    <group>
      <Terrain />
      {byModel.map(([model, placements]) => (
        <ModelBoundary key={model}>
          <Suspense fallback={null}>
            <InstancedModel model={model} placements={placements} />
          </Suspense>
        </ModelBoundary>
      ))}
    </group>
  );
}

USED_MODELS.forEach((m) => useGLTF.preload(`/models/kit/${m}`));
