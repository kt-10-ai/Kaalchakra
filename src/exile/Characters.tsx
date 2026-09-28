import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { heightAt } from "./terrain";
import { WORLD_SCALE } from "./story";

const S = WORLD_SCALE;

/** Where Chaya is right now, so cutscenes can turn the camera to her. */
export const companionPos = new THREE.Vector3(33 * S, 1.5, -8.2);

type Head = "turban" | "scarf" | "helmet" | "bare";

export interface Look {
  skin: string;
  robe: string;
  top: string;
  head: Head;
  headColor: string;
  beard?: string;
  cloak?: string;
  prop?: "spear" | "staff";
  height?: number;
}

const mat = (color: string) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85 });

const tmpV = new THREE.Vector3();

interface FigureHandle {
  root: THREE.Group;
  head: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  torso: THREE.Mesh;
}

/**
 * A low-poly person built from primitives so it sits in the same visual
 * language as the Kenney kit. The rig is only what the scene needs: a head
 * that can turn, two arms that swing, a chest that breathes.
 */
function Body({ look, rig }: { look: Look; rig: MutableRefObject<FigureHandle | null> }) {
  const m = useMemo(
    () => ({
      skin: mat(look.skin),
      robe: mat(look.robe),
      top: mat(look.top),
      head: mat(look.headColor),
      beard: mat(look.beard ?? "#ddd"),
      cloak: mat(look.cloak ?? look.top),
      wood: mat("#5a4028"),
      iron: new THREE.MeshStandardMaterial({ color: "#9aa0a6", metalness: 0.6, roughness: 0.4, flatShading: true }),
    }),
    [look]
  );
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Mesh>(null);

  useLayoutEffect(() => {
    if (root.current && head.current && armL.current && armR.current && torso.current) {
      rig.current = { root: root.current, head: head.current, armL: armL.current, armR: armR.current, torso: torso.current };
    }
  }, [rig]);

  const k = (look.height ?? 1.72) / 1.72;

  return (
    <group ref={root} scale={k}>
      {/* dhoti / robe falling to the ankles */}
      <mesh position={[0, 0.47, 0]} material={m.robe} castShadow>
        <cylinderGeometry args={[0.19, 0.27, 0.9, 7]} />
      </mesh>
      <mesh position={[0, 0.03, 0.05]} material={m.skin} castShadow>
        <boxGeometry args={[0.3, 0.06, 0.2]} />
      </mesh>
      <mesh ref={torso} position={[0, 1.18, 0]} material={m.top} castShadow>
        <cylinderGeometry args={[0.2, 0.18, 0.58, 7]} />
      </mesh>
      {look.cloak && (
        <mesh position={[0, 1.08, -0.1]} rotation-x={0.08} material={m.cloak} castShadow>
          <cylinderGeometry args={[0.24, 0.34, 0.95, 7, 1, true, Math.PI * 0.55, Math.PI * 0.9]} />
        </mesh>
      )}
      <group ref={armL} position={[-0.25, 1.42, 0]}>
        <mesh position={[0, -0.28, 0]} rotation-z={0.08} material={m.skin} castShadow>
          <cylinderGeometry args={[0.055, 0.045, 0.6, 5]} />
        </mesh>
      </group>
      <group ref={armR} position={[0.25, 1.42, 0]}>
        <mesh position={[0, -0.28, 0]} rotation-z={-0.08} material={m.skin} castShadow>
          <cylinderGeometry args={[0.055, 0.045, 0.6, 5]} />
        </mesh>
        {look.prop && (
          <mesh position={[0.02, -0.35, 0.05]} material={m.wood} castShadow>
            <cylinderGeometry args={[0.025, 0.025, look.prop === "spear" ? 2.3 : 1.8, 5]} />
          </mesh>
        )}
        {look.prop === "spear" && (
          <mesh position={[0.02, 0.85, 0.05]} material={m.iron}>
            <coneGeometry args={[0.05, 0.28, 4]} />
          </mesh>
        )}
      </group>
      <group ref={head} position={[0, 1.5, 0]}>
        <mesh position={[0, 0.12, 0]} material={m.skin} castShadow>
          <icosahedronGeometry args={[0.125, 1]} />
        </mesh>
        {look.beard && (
          <mesh position={[0, 0.03, 0.08]} material={m.beard}>
            <boxGeometry args={[0.16, 0.14, 0.08]} />
          </mesh>
        )}
        {look.head === "turban" && (
          <>
            <mesh position={[0, 0.2, 0]} material={m.head} castShadow>
              <torusGeometry args={[0.12, 0.06, 5, 9]} />
            </mesh>
            <mesh position={[0, 0.25, 0]} material={m.head} rotation-x={Math.PI / 2}>
              <sphereGeometry args={[0.12, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
          </>
        )}
        {look.head === "scarf" && (
          <mesh position={[0, 0.12, -0.02]} material={m.head} castShadow>
            <sphereGeometry args={[0.15, 7, 6, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          </mesh>
        )}
        {look.head === "helmet" && (
          <mesh position={[0, 0.27, 0]} material={m.iron} castShadow>
            <coneGeometry args={[0.15, 0.24, 7]} />
          </mesh>
        )}
      </group>
    </group>
  );
}

function shortestAngle(from: number, to: number) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function useIdle(rig: MutableRefObject<FigureHandle | null>, facing: MutableRefObject<number>, watch: boolean) {
  const seed = useMemo(() => Math.random() * 10, []);
  const headYaw = useRef(0);
  useFrame(({ clock, camera }) => {
    const r = rig.current;
    if (!r) return;
    const t = clock.elapsedTime + seed;
    r.torso.scale.set(1 + Math.sin(t * 1.6) * 0.012, 1, 1 + Math.sin(t * 1.6) * 0.02);
    r.armL.rotation.x = Math.sin(t * 0.7) * 0.03;
    r.armR.rotation.x = Math.sin(t * 0.7 + 1) * 0.03;

    // turn to watch the player when they come close, within what a neck can do
    let want = Math.sin(t * 0.25) * 0.3;
    if (watch) {
      r.root.getWorldPosition(tmpV);
      const dx = camera.position.x - tmpV.x;
      const dz = camera.position.z - tmpV.z;
      if (dx * dx + dz * dz < 26 * 26) {
        const world = Math.atan2(dx, dz);
        want = Math.max(-1.2, Math.min(1.2, shortestAngle(facing.current, world)));
      }
    }
    headYaw.current += (want - headYaw.current) * 0.05;
    r.head.rotation.y = headYaw.current;
  });
}

/** Someone standing in the world who notices you. */
export function Npc({ look, x, z, rotY = 0, y }: { look: Look; x: number; z: number; rotY?: number; y?: number }) {
  const rig = useRef<FigureHandle | null>(null);
  const facing = useRef(rotY);
  useIdle(rig, facing, true);
  return (
    <group position={[x, y ?? heightAt(x, z), z]} rotation-y={rotY}>
      <Body look={look} rig={rig} />
    </group>
  );
}

/** A walking loop between two points on the road: pilgrims, travellers. */
export function Walker({ look, fromX, toX, z, speed = 1.1, offset = 0 }: { look: Look; fromX: number; toX: number; z: number; speed?: number; offset?: number }) {
  const rig = useRef<FigureHandle | null>(null);
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = group.current;
    const r = rig.current;
    if (!g || !r) return;
    const span = toX - fromX;
    const t = clock.elapsedTime * speed + offset * span;
    const u = (t % span) / span;
    const x = fromX + u * span;
    // shrink in and out at the ends of the loop so the reset is never seen as a pop
    const fade = Math.min(1, u * 12, (1 - u) * 12);
    g.position.set(x, heightAt(x, z), z);
    g.scale.setScalar(fade);
    const step = clock.elapsedTime * speed * 5.2 + offset * 10;
    r.root.position.y = Math.abs(Math.sin(step)) * 0.04;
    r.armL.rotation.x = Math.sin(step) * 0.45;
    r.armR.rotation.x = -Math.sin(step) * (look.prop ? 0.15 : 0.45);
    r.head.rotation.y = Math.sin(step * 0.13) * 0.25;
  });
  return (
    <group ref={group} rotation-y={Math.PI / 2}>
      <Body look={look} rig={rig} />
    </group>
  );
}

/** A four-legged animal from boxes — mule, goat. Grazes or drinks on a slow loop. */
export function Beast({ x, z, rotY = 0, scale = 1, color = "#6b5847", y }: { x: number; z: number; rotY?: number; scale?: number; color?: string; y?: number }) {
  const neck = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Mesh>(null);
  const m = useMemo(() => mat(color), [color]);
  const dark = useMemo(() => mat("#2a211a"), []);
  const seed = useMemo(() => Math.random() * 10, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed;
    if (neck.current) neck.current.rotation.x = 0.35 + (Math.sin(t * 0.35) > 0.2 ? 0.55 : 0) + Math.sin(t * 2) * 0.03;
    if (tail.current) tail.current.rotation.x = 0.3 + Math.sin(t * 3.1) * 0.25;
  });
  const legs: [number, number][] = [
    [-0.16, 0.42],
    [0.16, 0.42],
    [-0.16, -0.42],
    [0.16, -0.42],
  ];
  return (
    <group position={[x, y ?? heightAt(x, z), z]} rotation-y={rotY} scale={scale}>
      <mesh position={[0, 0.95, 0]} material={m} castShadow>
        <boxGeometry args={[0.46, 0.46, 1.15]} />
      </mesh>
      {legs.map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.36, lz]} material={m} castShadow>
          <boxGeometry args={[0.1, 0.72, 0.12]} />
        </mesh>
      ))}
      {legs.map(([lx, lz], i) => (
        <mesh key={`h${i}`} position={[lx, 0.03, lz]} material={dark}>
          <boxGeometry args={[0.11, 0.07, 0.13]} />
        </mesh>
      ))}
      <group ref={neck} position={[0, 1.1, 0.5]}>
        <mesh position={[0, 0.2, 0.18]} rotation-x={-0.6} material={m} castShadow>
          <boxGeometry args={[0.22, 0.52, 0.24]} />
        </mesh>
        <mesh position={[0, 0.42, 0.46]} material={m} castShadow>
          <boxGeometry args={[0.2, 0.22, 0.44]} />
        </mesh>
        <mesh position={[-0.07, 0.62, 0.32]} rotation-z={0.25} material={m}>
          <coneGeometry args={[0.04, 0.22, 4]} />
        </mesh>
        <mesh position={[0.07, 0.62, 0.32]} rotation-z={-0.25} material={m}>
          <coneGeometry args={[0.04, 0.22, 4]} />
        </mesh>
      </group>
      <mesh ref={tail} position={[0, 1.02, -0.6]} material={dark}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
      </mesh>
    </group>
  );
}

export const LOOKS = {
  chaya: { skin: "#a26c48", robe: "#2f3d52", top: "#435a73", head: "scarf", headColor: "#7d2a28", cloak: "#5a3a2a", height: 1.66 },
  oldMan: { skin: "#8e5f3e", robe: "#d9d0bb", top: "#cfc4aa", head: "turban", headColor: "#efe9dc", beard: "#e8e4dc", prop: "staff", height: 1.64 },
  guard: { skin: "#8a5a3a", robe: "#6b3a22", top: "#8c2f1e", head: "helmet", headColor: "#999", prop: "spear", height: 1.8 },
  captain: { skin: "#94613f", robe: "#3d4a2a", top: "#2f5a3a", head: "turban", headColor: "#c9a13a", beard: "#2a1d14", height: 1.78 },
  farmer: { skin: "#8e5c3a", robe: "#e2d8c0", top: "#b5a27a", head: "turban", headColor: "#b8452a" },
  shailendra: { skin: "#9a6a48", robe: "#efe8d8", top: "#e8dcc0", head: "turban", headColor: "#e0a526", beard: "#f0ece4", height: 1.74 },
  mrinalini: { skin: "#a8744e", robe: "#1f4a3e", top: "#2f6a5a", head: "scarf", headColor: "#d9a13a", cloak: "#6a1f3a", height: 1.66 },
  general: { skin: "#8a5a3a", robe: "#3a3a3a", top: "#5a4a2a", head: "turban", headColor: "#1f6a5a", beard: "#2a1d14", height: 1.8 },
  palaceGuard: { skin: "#8a5a3a", robe: "#1f4a3e", top: "#1f6a5a", head: "helmet", headColor: "#999", prop: "spear", height: 1.82 },
} satisfies Record<string, Look>;

const TOWNS_LOOKS: Look[] = [
  { skin: "#9a6644", robe: "#e8e0cc", top: "#c8571b", head: "turban", headColor: "#fff" },
  { skin: "#a8744e", robe: "#a8324a", top: "#e0a526", head: "scarf", headColor: "#3a5a8a", height: 1.6 },
  { skin: "#8a5a3a", robe: "#e5dccb", top: "#1f6a5a", head: "turban", headColor: "#e0a526" },
  { skin: "#b07a52", robe: "#3a5a8a", top: "#e8dcc0", head: "scarf", headColor: "#c83a2a", height: 1.58 },
  { skin: "#7e5033", robe: "#efe8d8", top: "#8a5a2a", head: "bare", headColor: "#222", beard: "#2a1d14" },
  { skin: "#9a6644", robe: "#6a3a5a", top: "#d9a13a", head: "turban", headColor: "#1f6a5a" },
];

const PILGRIM_LOOKS: Look[] = [
  { skin: "#9a6644", robe: "#e0762a", top: "#e88a36", head: "bare", headColor: "#222", prop: "staff" },
  { skin: "#8a5a3a", robe: "#efe8d8", top: "#e8e0cc", head: "turban", headColor: "#e0762a" },
  { skin: "#a8744e", robe: "#b5452a", top: "#c9a24a", head: "scarf", headColor: "#d4a13a", height: 1.6 },
  { skin: "#7e5033", robe: "#efe8d8", top: "#efe8d8", head: "bare", headColor: "#222", beard: "#cfcfcf", prop: "staff", height: 1.66 },
  { skin: "#9a6644", robe: "#d86a2a", top: "#d86a2a", head: "turban", headColor: "#f0e6d0" },
  { skin: "#b07a52", robe: "#6a3a5a", top: "#8a4a6a", head: "scarf", headColor: "#e0b04a", height: 1.58 },
  { skin: "#8a5a3a", robe: "#e5dccb", top: "#c98a3a", head: "turban", headColor: "#fff" },
];

/**
 * Chaya waits at the shrine; once the player has spoken with her she walks the
 * road beside them, keeping a courier's distance and looking where they look.
 */
export function Chaya({ joined }: { joined: boolean }) {
  const rig = useRef<FigureHandle | null>(null);
  const group = useRef<THREE.Group>(null);
  const facing = useRef(Math.PI);
  const vel = useRef(0);
  const step = useRef(0);
  const home = useMemo(() => new THREE.Vector3(33 * S, 0, -8.2), []);
  useIdle(rig, facing, !joined);

  useFrame(({ camera }, dt) => {
    const g = group.current;
    const r = rig.current;
    if (!g || !r) return;
    const target = joined
      ? tmpV.set(camera.position.x - 2.4, 0, camera.position.z + (camera.position.z > 1.5 ? -2.6 : 2.6))
      : tmpV.copy(home);
    const dx = target.x - g.position.x;
    const dz = target.z - g.position.z;
    const dist = Math.hypot(dx, dz);
    const want = dist > 0.6 ? Math.min(dist * 1.6, 9) : 0;
    vel.current += (want - vel.current) * Math.min(1, dt * 4);
    if (dist > 0.01) {
      const move = Math.min(dist, vel.current * dt);
      g.position.x += (dx / dist) * move;
      g.position.z += (dz / dist) * move;
    }
    g.position.y = heightAt(g.position.x, g.position.z);

    const moving = vel.current > 0.25;
    const heading = moving
      ? Math.atan2(dx, dz)
      : Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z);
    if (joined || moving) facing.current += shortestAngle(facing.current, heading) * Math.min(1, dt * (moving ? 6 : 2));
    g.rotation.y = facing.current;

    step.current += dt * vel.current * 4.4;
    const swing = moving ? Math.sin(step.current) * Math.min(0.5, vel.current * 0.12) : 0;
    r.armL.rotation.x = swing;
    r.armR.rotation.x = -swing;
    r.root.position.y = moving ? Math.abs(Math.sin(step.current)) * 0.035 : 0;
    companionPos.set(g.position.x, g.position.y + 1.55, g.position.z);
  });

  return (
    <group ref={group} position={[home.x, heightAt(home.x, home.z), home.z]}>
      <Body look={LOOKS.chaya} rig={rig} />
    </group>
  );
}

/** Everyone on the road who isn't Chaya. */
export function RoadPeople() {
  return (
    <>
      {/* the farmhouse: goats in the pen, a woman at the door */}
      <Beast x={6 * S} z={-13} rotY={0.4} scale={0.55} color="#e8e2d4" />
      <Beast x={8.6 * S} z={-12.6} rotY={2.2} scale={0.5} color="#4a3a2e" />
      <Beast x={7.4 * S} z={-14.4} rotY={-1.1} scale={0.55} color="#d8cfbc" />
      <Npc look={{ ...LOOKS.farmer, robe: "#8a3a3a", top: "#b8603a", head: "scarf", headColor: "#d9a441", height: 1.58 }} x={6.4 * S} z={-16.2} rotY={0.3} />

      {/* the ford: an old man and his mule, standing in the water */}
      <Npc look={LOOKS.oldMan} x={65.4 * S} z={4.6} rotY={-2.3} y={-0.55} />
      <Beast x={66.2 * S} z={7} rotY={-1.2} color="#6d5a48" y={-0.6} />

      {/* the border post */}
      <Npc look={LOOKS.guard} x={93 * S} z={-5.2} rotY={-Math.PI / 2} />
      <Npc look={LOOKS.guard} x={93 * S} z={5.2} rotY={-Math.PI / 2} />
      <Npc look={LOOKS.captain} x={92.2 * S} z={8.6} rotY={-Math.PI / 2 - 0.4} />

      {/* pilgrims walking west through the post, a column that never ends */}
      {PILGRIM_LOOKS.map((look, i) => (
        <Walker key={i} look={look} fromX={80 * S} toX={108 * S} z={i % 2 ? 3.2 : 2.2} speed={1.05 + (i % 3) * 0.06} offset={i / PILGRIM_LOOKS.length} />
      ))}

      {/* Meghadurg's fields: people at work, which is its own argument */}
      <Npc look={LOOKS.farmer} x={121 * S} z={22} rotY={-0.5} />
      <Npc look={{ ...LOOKS.farmer, headColor: "#2a6a8a" }} x={131 * S} z={-25} rotY={2.4} />
      <Npc look={{ ...LOOKS.farmer, robe: "#c9b48a", head: "scarf", headColor: "#c44a6a", height: 1.6 }} x={139 * S} z={27} rotY={-0.9} />
      <Beast x={126 * S} z={-19} rotY={0.9} color="#e8e2d4" scale={1.15} />
      <Beast x={134 * S} z={21} rotY={-2} color="#8a7a66" scale={1.1} />

      {/* Meghadurg's gate: the captain who already knows your name */}
      <Npc look={LOOKS.captain} x={168.6 * S} z={4} rotY={-Math.PI / 2 - 0.3} />
      <Npc look={LOOKS.palaceGuard} x={169.2 * S} z={-5.6} rotY={-Math.PI / 2} />
      <Npc look={LOOKS.palaceGuard} x={169.2 * S} z={7.4} rotY={-Math.PI / 2} />

      {/* the market: people going both ways, sellers behind their stalls */}
      {TOWNS_LOOKS.map((look, i) => (
        <Walker key={`e${i}`} look={look} fromX={172 * S} toX={210 * S} z={i % 2 ? 3.6 : -3.4} speed={0.9 + (i % 3) * 0.12} offset={i / TOWNS_LOOKS.length} />
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const sx = 175 + i * 2.7;
        const side = i % 2 ? 1 : -1;
        return (
          <Npc
            key={`s${i}`}
            look={TOWNS_LOOKS[(i + 2) % TOWNS_LOOKS.length]}
            x={sx * S + 0.4}
            z={side * 9.4}
            rotY={side > 0 ? Math.PI : 0}
          />
        );
      })}
      {/* the baker, the boy with the loaf, and the guard walking over */}
      <Npc look={{ skin: "#8e5c3a", robe: "#efe8d8", top: "#efe8d8", head: "bare", headColor: "#222", beard: "#3a2a1a" }} x={187 * S - 0.6} z={7.2} rotY={Math.PI + 0.6} />
      <Npc look={{ skin: "#a8744e", robe: "#8a7a5a", top: "#b5a27a", head: "bare", headColor: "#222", height: 1.25 }} x={187 * S + 0.4} z={6.8} rotY={-2.4} />
      <Npc look={LOOKS.palaceGuard} x={188.4 * S} z={5.2} rotY={-2} />

      {/* the palace */}
      <Npc look={LOOKS.shailendra} x={222 * S} z={-7.4} y={heightAt(222 * S, 0) + 0.76} rotY={0.25} />
      {[-11, 11].flatMap((z) => [216, 226, 236].map((sx) => (
        <Npc key={`${sx}${z}`} look={LOOKS.palaceGuard} x={sx * S + 2} z={z * 0.8} rotY={z < 0 ? 0 : Math.PI} />
      )))}

      {/* the war room: five generals and the woman they were waiting on */}
      <Npc look={LOOKS.mrinalini} x={238 * S} z={6.2} y={heightAt(238 * S, 6) + 0.06} rotY={Math.PI + 0.9} />
      {[
        [236.6, 3.1, 0.2],
        [238.2, 3.1, -0.1],
        [240.4, 3.2, 0],
        [240.8, 6.5, Math.PI],
        [237, 6.6, Math.PI + 0.3],
      ].map(([sx, z, r], i) => (
        <Npc key={`g${i}`} look={{ ...LOOKS.general, headColor: i % 2 ? "#8c2f1e" : "#1f6a5a" }} x={sx * S} z={z} y={heightAt(sx * S, z) + 0.06} rotY={r} />
      ))}
    </>
  );
}
