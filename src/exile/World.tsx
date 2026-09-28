import { useGLTF } from "@react-three/drei";
import { Component, Suspense, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { WORLD, USED_MODELS, ROAD_LENGTH, type Placement } from "./worldData";
import { applyWind, registerWindClock } from "./Wind";
import { groundColor, heightAt, roadColor, ROAD_HALF, RIVER_X, WATER_Y } from "./terrain";
import { Banner, Birds, Campfire, Plume, Torch, Water } from "./Effects";
import { WORLD_SCALE } from "./story";

const S = WORLD_SCALE;

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
    const tinted = placements.some((p) => p.tint);
    const col = new THREE.Color();

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
      if (tinted) mesh.setColorAt(i, col.set(p.tint ?? "#ffffff"));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
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

export function InstancedModel({ model, placements }: { model: string; placements: Placement[] }) {
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

const X0 = -220;
const X1 = ROAD_LENGTH + 260;

/**
 * Sculpted, flat-shaded ground: a valley that rises into hills and far
 * mountains, coloured by region — dust at the gate, ash through the burned
 * village, forest floor, river mud, irrigated green inside Meghadurg.
 */
function Terrain() {
  const geometry = useMemo(() => {
    const w = X1 - X0;
    const d = 760;
    const g = new THREE.PlaneGeometry(w, d, Math.round(w / 3), Math.round(d / 3));
    g.rotateX(-Math.PI / 2);
    g.translate(X0 + w / 2, 0, 0);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = heightAt(x, z);
      // the road mesh covers the centre; keep the ground just under it
      pos.setY(i, Math.abs(z) < ROAD_HALF + 1 ? h - 0.06 : h);
      groundColor(x, z, h, c);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors flatShading roughness={0.96} metalness={0} />
    </mesh>
  );
}

/** Finer strip for the road itself so the wheel ruts and the edges read. */
function Road() {
  const geometry = useMemo(() => {
    const w = X1 - X0;
    const width = ROAD_HALF * 2 + 3;
    const g = new THREE.PlaneGeometry(w, width, Math.round(w / 1.2), 26);
    g.rotateX(-Math.PI / 2);
    g.translate(X0 + w / 2, 0, 0);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const road = new THREE.Color();
    const ground = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = heightAt(x, z);
      pos.setY(i, h + 0.02);
      roadColor(x, z, road);
      groundColor(x, z, h, ground);
      // ragged edge that blends into the verge rather than a hard stripe
      const edge = ROAD_HALF - 0.6 + Math.sin(x * 0.37) * 0.45 + Math.sin(x * 1.3) * 0.25;
      const t = Math.min(1, Math.max(0, (Math.abs(z) - edge) / 1.4));
      road.lerp(ground, t);
      colors[i * 3] = road.r;
      colors[i * 3 + 1] = road.g;
      colors[i * 3 + 2] = road.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} metalness={0} />
    </mesh>
  );
}

const at = (sx: number, z: number, lift = 0): [number, number, number] => [sx * S, heightAt(sx * S, z) + lift, z];

const STALL_COLORS = ["#c8571b", "#e0a526", "#1f6a5a", "#a8324a", "#e8dcc0", "#3a5a8a"];
const GOODS = ["#d8a04a", "#8a5a2a", "#c83a2a", "#e0d0a0", "#6a8a3a", "#9aa0a6"];

/** A market stall: four posts, a cloth awning that sags, goods heaped on a trestle. */
function Stall({ x, z, color, goods }: { x: number; z: number; color: string; goods: string }) {
  const y = heightAt(x, z);
  const face = z > 0 ? -1 : 1;
  return (
    <group position={[x, y, z]}>
      {[
        [-1.2, -0.9],
        [1.2, -0.9],
        [-1.2, 0.9],
        [1.2, 0.9],
      ].map(([px, pz], i) => (
        <mesh key={i} position={[px, 1.2, pz]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 2.4 + (pz * face > 0 ? 0 : 0.4), 5]} />
          <meshStandardMaterial color="#5a4028" flatShading />
        </mesh>
      ))}
      <mesh position={[0, 2.5, 0]} rotation-x={0.18 * face} castShadow>
        <boxGeometry args={[2.8, 0.05, 2.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.12} flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.75, 0.2 * face]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.1, 1]} />
        <meshStandardMaterial color="#7a5a3a" flatShading />
      </mesh>
      {[-0.7, 0, 0.7].map((gx, i) => (
        <mesh key={i} position={[gx, 0.95, 0.2 * face]} castShadow>
          <icosahedronGeometry args={[0.24 + (i % 2) * 0.05, 0]} />
          <meshStandardMaterial color={goods} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/** Shailendra's throne: a raised dais under a saffron canopy, the wheel of eight spokes behind it. */
function Throne({ x, z }: { x: number; z: number }) {
  const y = heightAt(x, 0) + 0.06;
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 0.5, 4.2]} />
        <meshStandardMaterial color="#cbb998" flatShading />
      </mesh>
      <mesh position={[0, 0.6, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.2, 3]} />
        <meshStandardMaterial color="#d8c8a6" flatShading />
      </mesh>
      <mesh position={[0, 1.3, -1.3]} castShadow>
        <boxGeometry args={[1.4, 1.2, 0.9]} />
        <meshStandardMaterial color="#9a6a2a" metalness={0.5} roughness={0.4} flatShading />
      </mesh>
      <mesh position={[0, 2.3, -1.65]} castShadow>
        <boxGeometry args={[1.5, 1.6, 0.2]} />
        <meshStandardMaterial color="#9a6a2a" metalness={0.5} roughness={0.4} flatShading />
      </mesh>
      {/* the kaalchakra: a whole wheel, where Vajragarh's has a spoke cut away */}
      <group position={[0, 4.2, -1.8]}>
        <mesh>
          <torusGeometry args={[1.1, 0.08, 6, 24]} />
          <meshStandardMaterial color="#e0a526" emissive="#6a4000" metalness={0.6} roughness={0.3} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} rotation-z={(i * Math.PI) / 4}>
            <boxGeometry args={[2.2, 0.06, 0.06]} />
            <meshStandardMaterial color="#e0a526" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>
      {[
        [-2.6, -1.8],
        [2.6, -1.8],
        [-2.6, 1.8],
        [2.6, 1.8],
      ].map(([px, pz], i) => (
        <mesh key={i} position={[px, 2.9, pz]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 5, 6]} />
          <meshStandardMaterial color="#8a5a2a" flatShading />
        </mesh>
      ))}
      <mesh position={[0, 5.5, 0]} castShadow>
        <boxGeometry args={[5.6, 0.18, 4]} />
        <meshStandardMaterial color="#d9761b" emissive="#d9761b" emissiveIntensity={0.15} flatShading />
      </mesh>
    </group>
  );
}

/** The war table: long as a boat, a map of Vajragarh on it, markers for every garrison. */
function WarTable({ x, z }: { x: number; z: number }) {
  const y = heightAt(x, z) + 0.06;
  const markers = useMemo(
    () => Array.from({ length: 16 }, (_, i) => [((i * 37) % 100) / 100 - 0.5, ((i * 61) % 100) / 100 - 0.5, i % 3] as const),
    []
  );
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.4, 0.12, 2.2]} />
        <meshStandardMaterial color="#5a3a22" flatShading />
      </mesh>
      {[
        [-2.9, -0.9],
        [2.9, -0.9],
        [-2.9, 0.9],
        [2.9, 0.9],
      ].map(([px, pz], i) => (
        <mesh key={i} position={[px, 0.42, pz]} castShadow>
          <boxGeometry args={[0.15, 0.85, 0.15]} />
          <meshStandardMaterial color="#4a2e1a" />
        </mesh>
      ))}
      <mesh position={[0, 0.92, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[6, 1.9]} />
        <meshStandardMaterial color="#d8c49a" roughness={1} />
      </mesh>
      {markers.map(([mx, mz, kind], i) => (
        <mesh key={i} position={[mx * 5.4, 1.0, mz * 1.6]} castShadow>
          {kind === 0 ? <coneGeometry args={[0.07, 0.18, 5]} /> : <boxGeometry args={[0.1, 0.1, 0.1]} />}
          <meshStandardMaterial color={kind === 2 ? "#1f6a5a" : "#8c2f1e"} />
        </mesh>
      ))}
    </group>
  );
}

/** Things that move or burn, placed on their story beats. */
function SetPieces() {
  return (
    <>
      {/* Vajragarh's gate: torches either side, the family's banners */}
      <Torch x={-19 * S} z={-7.5} height={2.6} light />
      <Torch x={-19 * S} z={7.5} height={2.6} light />
      <Banner x={-19.6 * S} y={heightAt(-19.6 * S, -10) + 3} z={-10} color="#6e1f1a" height={3.6} rotY={Math.PI / 2} />
      <Banner x={-19.6 * S} y={heightAt(-19.6 * S, 10) + 3} z={10} color="#6e1f1a" height={3.6} rotY={Math.PI / 2} />

      {/* the farmhouse lamp */}
      <Torch x={6.9 * S + 2.6} z={-16.6} lamp />
      <Plume position={at(7.6, -20, 5)} count={24} height={10} spread={0.3} size={30} speed={0.05} drift={2} color="#cfc8c0" opacity={0.2} />

      {/* the burned village: old fires still smouldering, ash, carrion birds */}
      <Plume position={at(21, -15, 0.3)} count={70} height={26} spread={1.8} size={90} speed={0.035} drift={9} color="#3e3935" opacity={0.42} />
      <Plume position={at(24.5, -12, 0.3)} count={45} height={16} spread={1.2} size={70} speed={0.045} drift={6} color="#5a534d" opacity={0.35} />
      <Plume position={at(22, 16, 0.3)} count={55} height={20} spread={1.5} size={80} speed={0.04} drift={7} color="#433d38" opacity={0.38} />
      <Plume position={at(21, -15, 0.2)} count={30} height={5} spread={1.5} size={5} speed={0.18} grow={-0.3} drift={1.5} color="#ffb347" colorEnd="#ff3a0a" opacity={1} glow={4} additive />
      <Plume position={at(22, 16, 0.2)} count={25} height={4} spread={1.2} size={5} speed={0.2} grow={-0.3} drift={1.2} color="#ffb347" colorEnd="#ff3a0a" opacity={1} glow={4} additive />
      <Plume position={at(22, 0, 0.2)} count={60} height={2.5} spread={16} size={2.2} speed={0.03} grow={0} drift={3} color="#c8c2ba" opacity={0.55} />
      <Birds center={at(22, 0, 0)} count={8} radius={26} height={30} />

      {/* the crossroads shrine: a plinth, an idol, two oil lamps, marigolds */}
      <group position={at(33.6, -12)}>
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.6, 2.4]} />
          <meshStandardMaterial color="#9a8c78" flatShading />
        </mesh>
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[1.6, 0.3, 1.6]} />
          <meshStandardMaterial color="#8a7c68" flatShading />
        </mesh>
        <mesh position={[0, 1.35, 0]} castShadow>
          <coneGeometry args={[0.35, 0.95, 6]} />
          <meshStandardMaterial color="#b8451e" flatShading roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.02, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.42, 0.07, 5, 14]} />
          <meshStandardMaterial color="#f29a1a" flatShading emissive="#6a3000" />
        </mesh>
      </group>
      <Torch x={33.6 * S - 1.6} z={-10.2} lamp light />
      <Torch x={33.6 * S + 1.6} z={-10.2} lamp />
      <Plume position={at(33.6, -12, 1.9)} count={16} height={4} spread={0.05} size={14} speed={0.12} drift={0.6} color="#d8d0c8" opacity={0.25} />

      {/* the ford */}
      <Water x={RIVER_X} y={WATER_Y} width={17} length={760} />

      {/* the border post: torches and Meghadurg's colours */}
      <Torch x={93.3 * S} z={-8.5} height={2.8} light />
      <Torch x={93.3 * S} z={8.5} height={2.8} />
      <Banner x={93.6 * S} y={heightAt(93.6 * S, -12) + 7.5} z={-12} color="#1f6a5a" height={4} rotY={Math.PI / 2} />
      <Banner x={93.6 * S} y={heightAt(93.6 * S, 12) + 7.5} z={12} color="#1f6a5a" height={4} rotY={Math.PI / 2} />

      {/* where the letter is read, at nightfall */}
      <Campfire x={121 * S} z={-7.5} />

      {/* Meghadurg's farms: hearth smoke, which means people live here */}
      {[
        [112, -17],
        [120, 18],
        [129, -19],
        [137, 20],
        [144, -21],
      ].map(([sx, z]) => (
        <Plume key={sx} position={at(sx, z, 6)} count={24} height={12} spread={0.3} size={32} speed={0.05} drift={2.5} color="#d6d0ca" opacity={0.2} />
      ))}

      {/* Meghadurg's gate */}
      <Torch x={169.4 * S} z={-7} height={2.8} light />
      <Torch x={169.4 * S} z={7} height={2.8} />
      {[-40, -10.5, 10.5, 40].map((z, i) => (
        <Banner key={z} x={170.4 * S} y={heightAt(170.4 * S, z) + 13 + (i % 2) * 3} z={z} color={i % 2 ? "#1f6a5a" : "#d9a13a"} height={5} rotY={Math.PI / 2} />
      ))}

      {/* market stalls down both sides of the street */}
      {Array.from({ length: 12 }, (_, i) => {
        const sx = 175 + i * 2.7;
        const side = i % 2 ? 1 : -1;
        return <Stall key={i} x={sx * S} z={side * (8.4 + (i % 3) * 0.3)} color={STALL_COLORS[i % STALL_COLORS.length]} goods={GOODS[i % GOODS.length]} />;
      })}
      <Plume position={at(187.6, 12, 3.2)} count={20} height={6} spread={0.3} size={26} speed={0.08} drift={1.5} color="#e6ded4" opacity={0.25} />

      {/* the palace: a stone court, the throne under a canopy, the war room beyond */}
      <mesh position={[229 * S, heightAt(229 * S, 0) + 0.06, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[36 * S, 24]} />
        <meshStandardMaterial color="#b9a88c" roughness={0.9} />
      </mesh>
      <mesh position={[229 * S, heightAt(229 * S, 0) + 0.07, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[36 * S, 3.2]} />
        <meshStandardMaterial color="#7a2a22" roughness={0.95} />
      </mesh>
      <Throne x={222 * S} z={-8.5} />
      <WarTable x={239 * S} z={4.6} />
      <Torch x={236 * S} z={1.4} lamp light />
      <Torch x={242 * S} z={1.4} lamp />
      <Torch x={236 * S} z={8} lamp />
      <Torch x={242 * S} z={8} lamp light />
      {[216, 222, 228, 234, 240].flatMap((sx) => [-11, 11].map((z) => (
        <Banner key={`${sx}${z}`} x={sx * S + 1.4} y={heightAt(sx * S, z) + 2.6} z={z * 0.93} color={z < 0 ? "#1f6a5a" : "#d9a13a"} height={3.4} rotY={z < 0 ? 0 : Math.PI} />
      )))}
      <Plume position={at(252, 0, 50)} count={20} height={14} spread={0.6} size={40} speed={0.04} drift={4} color="#e0d8d0" opacity={0.15} />
    </>
  );
}

/** One failed model load would otherwise take the whole canvas down. */
export class ModelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
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
      <Road />
      <SetPieces />
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
