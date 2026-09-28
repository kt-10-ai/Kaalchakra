import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import SIZES from "../exile/modelSizes.json";
import { InstancedModel, ModelBoundary } from "../exile/World";
import type { Placement } from "../exile/worldData";
import { fbm } from "../exile/terrain";
import { Banner, Campfire, Flame, Plume, Torch } from "../exile/Effects";
import { Beast } from "../exile/Characters";
import { courtGround, PLACES, RAMPART, WALL_HALF, type Room } from "./locations";

const mat = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, flatShading: true, ...extra });

function Box({ p, s, color, rot = 0, cast = true }: { p: [number, number, number]; s: [number, number, number]; color: string; rot?: number; cast?: boolean }) {
  const m = useMemo(() => mat(color), [color]);
  return (
    <mesh position={p} rotation-y={rot} material={m} castShadow={cast} receiveShadow>
      <boxGeometry args={s} />
    </mesh>
  );
}

// ─────────────────────────────── ground ───────────────────────────────

/** Irregular flagstones drawn once to a canvas, so the courtyard reads as paved. */
function useFlagstones() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d")!;
    g.fillStyle = "#4a443e";
    g.fillRect(0, 0, 512, 512);
    let seed = 7;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let row = 0; row < 8; row++) {
      let x = -r() * 40;
      while (x < 512) {
        const w = 44 + r() * 50;
        const shade = 110 + Math.floor(r() * 40);
        g.fillStyle = `rgb(${shade + 12},${shade + 4},${shade - 6})`;
        g.fillRect(x + 2, row * 64 + 2, w - 4, 60);
        g.fillStyle = `rgba(0,0,0,${0.05 + r() * 0.08})`;
        g.fillRect(x + 2 + r() * w * 0.5, row * 64 + 2 + r() * 30, w * 0.4, 20);
        x += w;
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(26, 26);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
}

function Ground() {
  const flag = useFlagstones();
  const terrain = useMemo(() => {
    const size = 900;
    const g = new THREE.PlaneGeometry(size, size, 300, 300);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    const grass = new THREE.Color("#5f6a3a");
    const rock = new THREE.Color("#7c7266");
    const snow = new THREE.Color("#d8d4cc");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = courtGround(x, z);
      const inside = Math.max(Math.abs(x), Math.abs(z)) < WALL_HALF + 3;
      pos.setY(i, inside ? -0.05 : h);
      const n = fbm(x * 0.05, z * 0.05, 3);
      c.copy(grass).lerp(rock, Math.min(1, Math.max(0, (h - 8) / 30) + n * 0.3));
      if (h > 110) c.lerp(snow, Math.min(1, (h - 110) / 40));
      c.multiplyScalar(0.85 + n * 0.3);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <>
      <mesh geometry={terrain} receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.95} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[WALL_HALF * 2, WALL_HALF * 2]} />
        <meshStandardMaterial map={flag} color="#c8bfb2" roughness={0.95} />
      </mesh>
    </>
  );
}

// ─────────────────────────────── walls ───────────────────────────────

/** Crenellations along every wall, instanced — a few hundred merlons. */
function Merlons({ points, color = "#7e756a" }: { points: [number, number, number, number][]; color?: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const m = useMemo(() => mat(color), [color]);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    points.forEach(([x, y, z, r], i) => {
      o.position.set(x, y, z);
      o.rotation.set(0, r, 0);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [points]);
  return (
    <instancedMesh ref={ref} args={[undefined, m, points.length]} castShadow receiveShadow>
      <boxGeometry args={[1.1, 1.4, 1.6]} />
    </instancedMesh>
  );
}

function Bastion({ x, z, r = 7, h = 16 }: { x: number; z: number; r?: number; h?: number }) {
  const merlons = useMemo(() => {
    const out: [number, number, number, number][] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      out.push([x + Math.cos(a) * r, h + 0.7, z + Math.sin(a) * r, -a]);
    }
    return out;
  }, [x, z, r, h]);
  const stone = useMemo(() => mat("#857b6f"), []);
  const band = useMemo(() => mat("#6a6056"), []);
  return (
    <>
      <mesh position={[x, h / 2, z]} material={stone} castShadow receiveShadow>
        <cylinderGeometry args={[r, r * 1.15, h, 14]} />
      </mesh>
      <mesh position={[x, h * 0.62, z]} material={band}>
        <cylinderGeometry args={[r * 1.04, r * 1.04, 0.6, 14]} />
      </mesh>
      <Merlons points={merlons} />
    </>
  );
}

function OuterWalls() {
  const H = 11;
  const T = 3;
  const L = WALL_HALF * 2;
  const merlons = useMemo(() => {
    const out: [number, number, number, number][] = [];
    for (let t = -WALL_HALF + 4; t <= WALL_HALF - 4; t += 2.4) {
      out.push([t, H + 0.7, -WALL_HALF - T / 2 + 0.6, 0]);
      out.push([-WALL_HALF - T / 2 + 0.6, H + 0.7, t, Math.PI / 2]);
      out.push([WALL_HALF + T / 2 - 0.6, H + 0.7, t, Math.PI / 2]);
      if (Math.abs(t) > 9) out.push([t, H + 0.7, WALL_HALF + T / 2 - 0.6, 0]);
    }
    return out;
  }, []);
  const half = (L - 12) / 2;
  return (
    <group>
      <Box p={[0, H / 2, -WALL_HALF - T / 2]} s={[L + T * 2, H, T]} color="#80776b" />
      <Box p={[-WALL_HALF - T / 2, H / 2, 0]} s={[T, H, L]} color="#80776b" />
      <Box p={[WALL_HALF + T / 2, H / 2, 0]} s={[T, H, L]} color="#80776b" />
      <Box p={[-6 - half / 2, H / 2, WALL_HALF + T / 2]} s={[half, H, T]} color="#80776b" />
      <Box p={[6 + half / 2, H / 2, WALL_HALF + T / 2]} s={[half, H, T]} color="#80776b" />
      {/* the walk along the top */}
      <Merlons points={merlons} />
      {[-WALL_HALF, WALL_HALF].flatMap((x) => [-WALL_HALF, WALL_HALF].map((z) => <Bastion key={`${x}${z}`} x={x} z={z} />))}
      <Bastion x={-WALL_HALF} z={0} r={5.5} h={14} />
      <Bastion x={WALL_HALF} z={0} r={5.5} h={14} />
      <Gatehouse />
    </group>
  );
}

function Gatehouse() {
  const z = WALL_HALF + 1.5;
  return (
    <group>
      <Bastion x={-8.5} z={z} r={4.5} h={17} />
      <Bastion x={8.5} z={z} r={4.5} h={17} />
      <Box p={[0, 13.5, z]} s={[12, 5, 4]} color="#7a7064" />
      {/* the doors — iron-studded teak, shut */}
      <Box p={[-2.5, 5.5, z + 0.2]} s={[5, 11, 0.5]} color="#4a3322" />
      <Box p={[2.5, 5.5, z + 0.2]} s={[5, 11, 0.5]} color="#452f20" />
      {[-4, -1, 1, 4].flatMap((x) => [2, 5, 8].map((y) => <Box key={`${x}${y}`} p={[x, y, z - 0.1]} s={[0.25, 0.25, 0.2]} color="#2a2622" cast={false} />))}
      <Torch x={-5.5} z={WALL_HALF - 2} height={3} />
      <Torch x={5.5} z={WALL_HALF - 2} height={3} />
    </group>
  );
}

function Rampart() {
  const r = RAMPART;
  const steps = 12;
  return (
    <group>
      <Box p={[(r.x0 + r.x1) / 2, r.h / 2, (r.z0 + r.z1) / 2]} s={[r.x1 - r.x0, r.h, r.z1 - r.z0]} color="#7e756a" />
      {Array.from({ length: steps }, (_, i) => {
        const z0 = r.rampZ1 - ((i + 1) / steps) * (r.rampZ1 - r.rampZ0);
        const h = ((i + 1) / steps) * r.h;
        const depth = (r.rampZ1 - r.rampZ0) / steps;
        return <Box key={i} p={[(r.rampX0 + r.rampX1) / 2, h / 2, z0 + depth / 2]} s={[r.rampX1 - r.rampX0, h, depth]} color={i % 2 ? "#766d62" : "#7e756a"} />;
      })}
      {/* parapet with a view over the western passes */}
      {Array.from({ length: 9 }, (_, i) => (
        <Box key={i} p={[r.x0 + 1.2 + i * 2.5, r.h + 0.7, r.z1 - 0.4]} s={[1.3, 1.4, 0.8]} color="#6e655b" />
      ))}
      <Banner x={r.x1 - 1.5} y={r.h + 3} z={r.z0 + 2} color="#6e1f1a" height={4} rotY={Math.PI / 2} />
      <Torch x={r.x0 + 3} z={r.z1 - 2} height={2.4} />
    </group>
  );
}

// ─────────────────────────────── rooms ───────────────────────────────

/** A walled room with one side open (or a doorway), a flat roof and a parapet — Rajput style. */
function RoomShell({ r, chhatri = true, roofed = true }: { r: Room; chhatri?: boolean; roofed?: boolean }) {
  const T = 0.6;
  const walls: { p: [number, number, number]; s: [number, number, number] }[] = [];
  const cx = (r.x0 + r.x1) / 2;
  const cz = (r.z0 + r.z1) / 2;
  const w = r.x1 - r.x0;
  const d = r.z1 - r.z0;
  const side = (s: "n" | "s" | "e" | "w") => {
    const horizontal = s === "n" || s === "s";
    const len = horizontal ? w : d;
    const fixed = s === "n" ? r.z0 : s === "s" ? r.z1 : s === "w" ? r.x0 : r.x1;
    const segs: [number, number][] = [];
    if (s !== r.open) segs.push([0, len]);
    else if (r.door !== undefined) {
      segs.push([0, len / 2 - r.door / 2], [len / 2 + r.door / 2, len]);
    }
    for (const [a, b] of segs) {
      const mid = (a + b) / 2;
      if (horizontal) walls.push({ p: [r.x0 + mid, r.h / 2, fixed], s: [b - a, r.h, T] });
      else walls.push({ p: [fixed, r.h / 2, r.z0 + mid], s: [T, r.h, b - a] });
    }
    // lintel over a doorway
    if (s === r.open && r.door !== undefined) {
      const lh = r.h - 3.4;
      if (horizontal) walls.push({ p: [cx, r.h - lh / 2, fixed], s: [r.door, lh, T] });
      else walls.push({ p: [fixed, r.h - lh / 2, cz], s: [T, lh, r.door] });
    }
  };
  (["n", "s", "e", "w"] as const).forEach(side);

  // an open front gets pillars and a deep eave instead of a wall
  const pillars: [number, number][] = [];
  if (r.door === undefined) {
    const n = Math.max(2, Math.round((r.open === "n" || r.open === "s" ? w : d) / 4));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      if (r.open === "n") pillars.push([r.x0 + t * w, r.z0]);
      if (r.open === "s") pillars.push([r.x0 + t * w, r.z1]);
      if (r.open === "w") pillars.push([r.x0, r.z0 + t * d]);
      if (r.open === "e") pillars.push([r.x1, r.z0 + t * d]);
    }
  }

  return (
    <group>
      <Box p={[cx, 0.08, cz]} s={[w, 0.16, d]} color={r.floor} cast={false} />
      {walls.map((wl, i) => (
        <Box key={i} p={wl.p} s={wl.s} color={r.wall} />
      ))}
      {pillars.map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x, r.h / 2, z]} castShadow>
            <cylinderGeometry args={[0.32, 0.4, r.h, 8]} />
            <meshStandardMaterial color="#9a8e7e" flatShading />
          </mesh>
          <Box p={[x, 0.3, z]} s={[1, 0.6, 1]} color="#6e655b" />
        </group>
      ))}
      {roofed && (
        <>
          <Box p={[cx, r.h + 0.25, cz]} s={[w + 1.4, 0.5, d + 1.4]} color={r.roof} />
          {/* parapet */}
          <Box p={[cx, r.h + 0.9, r.z0 - 0.5]} s={[w + 1.4, 0.8, 0.4]} color={r.wall} />
          <Box p={[cx, r.h + 0.9, r.z1 + 0.5]} s={[w + 1.4, 0.8, 0.4]} color={r.wall} />
          <Box p={[r.x0 - 0.5, r.h + 0.9, cz]} s={[0.4, 0.8, d + 1.4]} color={r.wall} />
          <Box p={[r.x1 + 0.5, r.h + 0.9, cz]} s={[0.4, 0.8, d + 1.4]} color={r.wall} />
          {chhatri && <Chhatri x={cx} y={r.h + 0.5} z={cz} />}
        </>
      )}
    </group>
  );
}

/** The domed roof pavilion that marks every Rajput skyline. */
function Chhatri({ x, y, z, s = 1 }: { x: number; y: number; z: number; s?: number }) {
  return (
    <group position={[x, y, z]} scale={s}>
      <Box p={[0, 0.2, 0]} s={[3.2, 0.4, 3.2]} color="#9a8e7e" />
      {[
        [-1.2, -1.2],
        [1.2, -1.2],
        [-1.2, 1.2],
        [1.2, 1.2],
      ].map(([px, pz], i) => (
        <mesh key={i} position={[px, 1.5, pz]} castShadow>
          <cylinderGeometry args={[0.14, 0.16, 2.4, 6]} />
          <meshStandardMaterial color="#a89a86" flatShading />
        </mesh>
      ))}
      <Box p={[0, 2.8, 0]} s={[3.4, 0.3, 3.4]} color="#8a7e6e" />
      <mesh position={[0, 3, 0]} castShadow>
        <sphereGeometry args={[1.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#b0a28c" flatShading />
      </mesh>
      <mesh position={[0, 4.7, 0]}>
        <coneGeometry args={[0.15, 0.6, 6]} />
        <meshStandardMaterial color="#c9a13a" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────── the hall ───────────────────────────────

/** Vajragarh's wheel: seven spokes, one cut away. */
function BrokenWheel({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const iron = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a3632", metalness: 0.7, roughness: 0.35 }), []);
  return (
    <group position={position} scale={scale}>
      <mesh material={iron}>
        <torusGeometry args={[1.6, 0.12, 6, 28]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) =>
        i === 3 ? null : (
          <mesh key={i} rotation-z={(i * Math.PI) / 4 + Math.PI / 8} position={[Math.cos((i * Math.PI) / 4 + Math.PI / 8) * 0.8, Math.sin((i * Math.PI) / 4 + Math.PI / 8) * 0.8, 0]} material={iron}>
            <boxGeometry args={[1.6, 0.1, 0.1]} />
          </mesh>
        )
      )}
      <mesh material={iron}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 10]} />
      </mesh>
    </group>
  );
}

function ThroneHall() {
  const r = PLACES.hall.room!;
  const pillarZ = [-66, -60, -54, -48, -42, -36];
  return (
    <group>
      <RoomShell r={r} chhatri={false} />
      <Chhatri x={-12} y={r.h + 0.5} z={-70} s={1.3} />
      <Chhatri x={12} y={r.h + 0.5} z={-70} s={1.3} />
      <Chhatri x={0} y={r.h + 0.5} z={-52} s={1.8} />
      {/* two rows of pillars down the hall */}
      {pillarZ.flatMap((z) =>
        [-8, 8].map((x) => (
          <group key={`${x}${z}`}>
            <mesh position={[x, r.h / 2, z]} castShadow receiveShadow>
              <cylinderGeometry args={[0.6, 0.75, r.h, 10]} />
              <meshStandardMaterial color="#8e8374" flatShading />
            </mesh>
            <Box p={[x, 0.4, z]} s={[1.8, 0.8, 1.8]} color="#5e5650" />
            <Box p={[x, r.h - 0.4, z]} s={[1.8, 0.8, 1.8]} color="#6e655b" />
          </group>
        ))
      )}
      {/* the long carpet from the door to the dais */}
      <Box p={[0, 0.18, -50]} s={[3.2, 0.04, 40]} color="#5a1a16" cast={false} />
      {/* the dais: three steps, the throne, the wheel above */}
      <Box p={[0, 0.3, -66]} s={[14, 0.6, 12]} color="#6a625a" />
      <Box p={[0, 0.75, -67.5]} s={[10, 0.3, 9]} color="#766d64" />
      <Box p={[0, 1.05, -69]} s={[6, 0.3, 6]} color="#827870" />
      <Box p={[0, 1.8, -69.4]} s={[2.2, 1.2, 1.6]} color="#3a2a22" />
      <Box p={[0, 3.2, -70.1]} s={[2.4, 2.8, 0.3]} color="#2e2018" />
      <Box p={[0, 1.95, -69]} s={[2, 0.2, 1.4]} color="#6e1f1a" />
      <BrokenWheel position={[0, 8, -73.4]} scale={1.4} />
      {[-4, 4].map((x) => (
        <Banner key={x} x={x} y={7} z={-73.2} color="#6e1f1a" height={6} rotY={0} />
      ))}
      {/* torches along the pillars — the hall's only light besides the door */}
      {[-66, -54, -42].flatMap((z, i) => [
        <Torch key={`l${z}`} x={-7} z={z + 1.2} height={2.6} light={i === 0} />,
        <Torch key={`r${z}`} x={7} z={z + 1.2} height={2.6} />,
      ])}
      <pointLight position={[0, 8, -60]} color="#ffb070" intensity={60} distance={40} decay={2} />
    </group>
  );
}

// ─────────────────────────────── furnishings ───────────────────────────────

function Shelf({ x, z, rot = 0, h = 3.4, w = 3 }: { x: number; z: number; rot?: number; h?: number; w?: number }) {
  const scrolls = useMemo(() => Array.from({ length: 18 }, (_, i) => [((i % 6) / 5 - 0.5) * (w - 0.4), 0.55 + Math.floor(i / 6) * (h / 3.2), (i * 37) % 3] as const), [w, h]);
  return (
    <group position={[x, 0, z]} rotation-y={rot}>
      <Box p={[0, h / 2, 0]} s={[w, h, 0.7]} color="#4a3422" />
      {[1, 2].map((i) => (
        <Box key={i} p={[0, (h / 3) * i, 0.1]} s={[w - 0.1, 0.08, 0.6]} color="#3a2818" cast={false} />
      ))}
      {scrolls.map(([sx, sy, k], i) => (
        <mesh key={i} position={[sx, sy, 0.25]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.09, 0.09, 0.5, 6]} />
          <meshStandardMaterial color={k === 0 ? "#e0d0a8" : k === 1 ? "#c8b48a" : "#b8452a"} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Table({ x, z, w = 2.4, d = 1.2, h = 0.8, rot = 0, color = "#5a3a22" }: { x: number; z: number; w?: number; d?: number; h?: number; rot?: number; color?: string }) {
  return (
    <group position={[x, 0, z]} rotation-y={rot}>
      <Box p={[0, h, 0]} s={[w, 0.1, d]} color={color} />
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([a, b], i) => (
        <Box key={i} p={[(a * (w - 0.2)) / 2, h / 2, (b * (d - 0.2)) / 2]} s={[0.1, h, 0.1]} color="#3a2616" />
      ))}
    </group>
  );
}

function Papers({ x, y, z, n = 5 }: { x: number; y: number; z: number; n?: number }) {
  return (
    <group position={[x, y, z]}>
      {Array.from({ length: n }, (_, i) => (
        <Box key={i} p={[((i * 13) % 7) / 10 - 0.3, i * 0.012, ((i * 7) % 5) / 10 - 0.2]} s={[0.35, 0.01, 0.45]} rot={i * 0.4} color={i % 2 ? "#e8dcc0" : "#d8c8a0"} cast={false} />
      ))}
    </group>
  );
}

function Brazier({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.2, 1, 8]} />
        <meshStandardMaterial color="#3a3430" metalness={0.6} roughness={0.5} />
      </mesh>
      <Flame position={[0, 1, 0]} scale={1.3} />
      <Plume position={[0, 1.2, 0]} count={24} height={5} spread={0.25} size={34} speed={0.1} drift={0.6} color="#5a5450" opacity={0.3} />
    </group>
  );
}

function Bars({ x, z0, z1, h = 3 }: { x: number; z0: number; z1: number; h?: number }) {
  const n = Math.round((z1 - z0) / 0.35);
  const iron = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2a2826", metalness: 0.7, roughness: 0.45 }), []);
  return (
    <group>
      {Array.from({ length: n + 1 }, (_, i) => (
        <mesh key={i} position={[x, h / 2, z0 + (i * (z1 - z0)) / n]} material={iron} castShadow>
          <cylinderGeometry args={[0.035, 0.035, h, 5]} />
        </mesh>
      ))}
      <mesh position={[x, h, (z0 + z1) / 2]} material={iron}>
        <boxGeometry args={[0.12, 0.12, z1 - z0]} />
      </mesh>
      <mesh position={[x, 0.1, (z0 + z1) / 2]} material={iron}>
        <boxGeometry args={[0.12, 0.12, z1 - z0]} />
      </mesh>
    </group>
  );
}

function Bed({ x, z, rot = 0, color = "#6e1f1a" }: { x: number; z: number; rot?: number; color?: string }) {
  return (
    <group position={[x, 0, z]} rotation-y={rot}>
      <Box p={[0, 0.3, 0]} s={[2, 0.5, 1.2]} color="#4a3322" />
      <Box p={[0, 0.6, 0]} s={[1.9, 0.18, 1.1]} color={color} />
      <Box p={[-0.8, 0.75, 0]} s={[0.4, 0.15, 0.8]} color="#e8dcc0" />
    </group>
  );
}

function Sacks({ x, z, n = 4 }: { x: number; z: number; n?: number }) {
  return (
    <group position={[x, 0, z]}>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={[(i % 2) * 0.7, 0.35 + Math.floor(i / 2) * 0.55, (i % 3) * 0.3]} castShadow>
          <icosahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial color={i % 2 ? "#b8a47a" : "#a8946a"} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Rack({ x, z, rot = 0 }: { x: number; z: number; rot?: number }) {
  const iron = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8a9096", metalness: 0.7, roughness: 0.35 }), []);
  return (
    <group position={[x, 0, z]} rotation-y={rot}>
      <Box p={[0, 1.2, 0]} s={[2.4, 0.1, 0.3]} color="#4a3322" />
      <Box p={[0, 0.4, 0]} s={[2.4, 0.1, 0.3]} color="#4a3322" />
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} position={[-1 + i * 0.4, 0, 0]}>
          <mesh position={[0, 1.2, 0.05]} material={iron} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 2.4, 4]} />
          </mesh>
          <mesh position={[0, 2.5, 0.05]} material={iron}>
            <coneGeometry args={[0.06, 0.3, 4]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Coins({ x, y, z }: { x: number; y: number; z: number }) {
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d9a13a", metalness: 0.8, roughness: 0.3, emissive: "#3a2600" }), []);
  return (
    <group position={[x, y, z]}>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[(i % 4) * 0.18 - 0.3, 0.05 + Math.floor(i / 4) * 0.02, Math.floor(i / 4) * 0.2]} material={gold}>
          <cylinderGeometry args={[0.07, 0.07, 0.08 + (i % 3) * 0.06, 10]} />
        </mesh>
      ))}
    </group>
  );
}

function Strongbox({ x, z, rot = 0 }: { x: number; z: number; rot?: number }) {
  return (
    <group position={[x, 0, z]} rotation-y={rot}>
      <Box p={[0, 0.35, 0]} s={[1, 0.7, 0.7]} color="#3a2a1e" />
      <Box p={[0, 0.36, 0]} s={[1.04, 0.1, 0.74]} color="#6a6660" />
      <Box p={[0, 0.5, 0.36]} s={[0.2, 0.2, 0.04]} color="#c9a13a" />
    </group>
  );
}

// ─────────────────────────────── the locations ───────────────────────────────

function Chancery() {
  return (
    <group>
      <RoomShell r={PLACES.chancery.room!} />
      <Table x={-38} z={-32} w={1.6} d={2.8} />
      <Papers x={-38} y={0.86} z={-32.4} n={8} />
      <Box p={[-38.2, 0.92, -31]} s={[0.3, 0.12, 0.3]} color="#6a1f1a" />
      <Shelf x={-41.4} z={-36} rot={Math.PI / 2} />
      <Shelf x={-41.4} z={-28} rot={Math.PI / 2} />
      <Brazier x={-33} z={-37.5} />
      <Torch x={-29} z={-26} lamp />
    </group>
  );
}

function Archive() {
  return (
    <group>
      <RoomShell r={PLACES.archive.room!} />
      {[-18, -13.5, -9, -4.5].map((z) => (
        <Shelf key={z} x={-67.3} z={z} rot={Math.PI / 2} h={5} />
      ))}
      {[-62, -57].map((x) => (
        <Shelf key={x} x={x} z={-19.3} h={5} />
      ))}
      <Table x={-59} z={-7} w={3} d={1.6} />
      <Papers x={-59} y={0.86} z={-7} n={6} />
      <Torch x={-60.5} z={-6.4} lamp light />
      <Torch x={-52} z={0} lamp />
    </group>
  );
}

function Dungeon() {
  return (
    <group>
      <RoomShell r={PLACES.dungeon.room!} chhatri={false} />
      {/* three cells along the back, the middle one is hers */}
      <Bars x={-62} z0={12.6} z1={31.4} />
      {[18.5, 25.5].map((z) => (
        <Box key={z} p={[-65, 1.5, z]} s={[6, 3, 0.4]} color="#4a4540" />
      ))}
      <Box p={[-65, 0.2, 22]} s={[2, 0.2, 1.4]} color="#b8a060" cast={false} />
      <Box p={[-57, 0.4, 14]} s={[1.2, 0.8, 0.8]} color="#4a3322" />
      <Table x={-55} z={16.5} w={1.4} d={0.9} />
      <Box p={[-55, 1, 16.5]} s={[0.18, 0.3, 0.18]} color="#6a4a2a" />
      <Torch x={-60.5} z={20} height={2.3} light />
      <Torch x={-52} z={29} height={2.3} />
    </group>
  );
}

function RanadhirRooms() {
  return (
    <group>
      <RoomShell r={PLACES.ranadhir.room!} />
      <Bed x={-40} z={52} rot={Math.PI / 2} color="#1f2a3a" />
      <Table x={-31} z={51} w={1.8} d={1} />
      <Papers x={-31} y={0.86} z={51} n={3} />
      <Box p={[-30.4, 0.92, 51.2]} s={[0.12, 0.14, 0.12]} color="#1f6a5a" />
      <Rack x={-43.4} z={46} rot={Math.PI / 2} />
      <Torch x={-28} z={42} lamp />
    </group>
  );
}

function Chambers() {
  return (
    <group>
      <RoomShell r={PLACES.chambers.room!} />
      <Bed x={39} z={-36} color="#6e1f1a" />
      <Table x={38} z={-27} w={1.6} d={0.9} h={0.45} />
      <Papers x={38} y={0.5} z={-27} n={3} />
      <Strongbox x={41} z={-30} rot={-Math.PI / 2} />
      <Torch x={35} z={-38.5} lamp />
    </group>
  );
}

function Temple() {
  const r = PLACES.temple.room!;
  return (
    <group>
      <RoomShell r={r} chhatri={false} />
      {/* the shikhara rising over the sanctum */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Box key={i} p={[37, r.h + 1 + i * 1.6, 36]} s={[6 - i * 1.05, 1.6, 6 - i * 1.05]} color={i % 2 ? "#a8927a" : "#9a846c"} />
      ))}
      <mesh position={[37, r.h + 9.4, 36]}>
        <sphereGeometry args={[0.6, 8, 6]} />
        <meshStandardMaterial color="#c9a13a" metalness={0.6} roughness={0.35} />
      </mesh>
      <Box p={[39.5, 0.6, 36]} s={[2, 1.2, 3]} color="#8a7a64" />
      <mesh position={[39.5, 1.7, 36]} castShadow>
        <coneGeometry args={[0.4, 1.1, 6]} />
        <meshStandardMaterial color="#b8451e" flatShading />
      </mesh>
      <Torch x={38} z={34} lamp light />
      <Torch x={38} z={38} lamp />
      <Plume position={[34, 0.5, 36]} count={40} height={7} spread={0.6} size={50} speed={0.05} drift={1} color="#b8b0a4" opacity={0.28} />
      {[31, 35].map((z) => (
        <mesh key={z} position={[28.6, 5.6, z + 2]}>
          <coneGeometry args={[0.25, 0.5, 8, 1, true]} />
          <meshStandardMaterial color="#b89a4a" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function Kitchens() {
  return (
    <group>
      <RoomShell r={PLACES.kitchens.room!} chhatri={false} />
      <Box p={[15, 0.6, 64.6]} s={[5, 1.2, 1.6]} color="#5a4a3e" />
      <Campfire x={15} z={64.4} />
      <Table x={15} z={58} w={3} d={1.2} />
      <mesh position={[14.4, 0.95, 58]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial color="#e8dcc0" flatShading />
      </mesh>
      <Sacks x={9} z={62} n={6} />
      {[10, 11, 12].map((x) => (
        <mesh key={x} position={[x, 0.3, 53]} castShadow>
          <cylinderGeometry args={[0.35, 0.28, 0.6, 8]} />
          <meshStandardMaterial color="#8a4a2a" flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Treasury() {
  return (
    <group>
      <RoomShell r={PLACES.treasury.room!} />
      <Table x={-15} z={58.5} w={3} d={1.3} />
      <Coins x={-15.6} y={0.85} z={58.3} />
      <Papers x={-14.2} y={0.86} z={58.6} n={4} />
      <Strongbox x={-21} z={63} rot={Math.PI / 2} />
      <Strongbox x={-9} z={63} rot={-Math.PI / 2} />
      <Shelf x={-15} z={65.4} rot={Math.PI} w={5} />
      <Torch x={-12} z={52} lamp />
    </group>
  );
}

function Barracks() {
  return (
    <group>
      <RoomShell r={PLACES.barracks.room!} chhatri={false} />
      <Rack x={69.4} z={49} rot={-Math.PI / 2} />
      <Rack x={69.4} z={56} rot={-Math.PI / 2} />
      {[48, 52, 56, 60].map((z) => (
        <Bed key={z} x={64} z={z} color="#4a3a2e" />
      ))}
      <Table x={56} z={58} w={2.4} d={1.2} />
      {/* the straw man they practise on */}
      <group position={[44, 0, 46]}>
        <Box p={[0, 1, 0]} s={[0.15, 2, 0.15]} color="#4a3322" />
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.3, 0.9, 7]} />
          <meshStandardMaterial color="#c8b060" flatShading />
        </mesh>
        <Box p={[0, 1.7, 0]} s={[1.2, 0.1, 0.1]} color="#4a3322" />
      </group>
      <Torch x={50} z={45} height={2.4} />
    </group>
  );
}

function Stables() {
  return (
    <group>
      <RoomShell r={PLACES.stables.room!} chhatri={false} />
      {[49, 53.5, 58, 62.5].map((z) => (
        <Box key={z} p={[-62, 0.7, z - 2.2]} s={[10, 1.4, 0.2]} color="#5a4430" />
      ))}
      <Beast x={-62} z={51} rotY={Math.PI / 2} scale={1.35} color="#6a4a32" />
      <Beast x={-63} z={55.5} rotY={Math.PI / 2 + 0.2} scale={1.35} color="#9a9894" />
      <Beast x={-61} z={60} rotY={Math.PI / 2} scale={1.3} color="#3a2e26" />
      <Sacks x={-68} z={63} n={5} />
      <Torch x={-52} z={48} height={2.3} />
    </group>
  );
}

/** The queen's garden: overgrown, a dry channel, a pavilion, her sealed rooms on the east side. */
function Garden() {
  const queenRooms: Room = { x0: 64, x1: 73, z0: -12, z1: 12, h: 7, open: "w", door: 2.4, wall: "#a89a86", floor: "#7a6a58", roof: "#7a3a2a" };
  return (
    <group>
      {/* the garden wall */}
      <Box p={[45.5, 2, -10.5]} s={[1, 4, 15]} color="#8e8474" />
      <Box p={[45.5, 2, 10.5]} s={[1, 4, 15]} color="#8e8474" />
      <Box p={[59.5, 2, -18]} s={[29, 4, 1]} color="#8e8474" />
      <Box p={[59.5, 2, 18]} s={[29, 4, 1]} color="#8e8474" />
      <Box p={[45.5, 4.6, 0]} s={[1.2, 1.2, 6.6]} color="#7a6e60" />
      <RoomShell r={queenRooms} />
      {/* the sealed doors: three more along her wall, wax on each */}
      {[-8, -3, 3, 8].map((z) => (
        <group key={z}>
          <Box p={[63.7, 1.4, z]} s={[0.2, 2.8, 1.6]} color="#4a3322" />
          <mesh position={[63.55, 1.4, z]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.12, 0.12, 0.05, 10]} />
            <meshStandardMaterial color="#8a1a14" roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* the water channel that no longer runs, and its bend */}
      <Box p={[52, 0.04, 0]} s={[12, 0.08, 1.2]} color="#4a5a5a" cast={false} />
      <Box p={[58.6, 0.04, -4]} s={[1.2, 0.08, 9]} color="#4a5a5a" cast={false} />
      <Box p={[58.6, 0.1, 0.4]} s={[0.9, 0.06, 0.9]} color="#2a5a8a" cast={false} />
      {/* the pavilion where she sat */}
      <Chhatri x={53} y={0} z={-10} s={1.2} />
      <Torch x={57} z={6} lamp />
    </group>
  );
}

function CourtyardDressing() {
  return (
    <group>
      {/* the well */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.6, 1.2, 12, 1, true]} />
        <meshStandardMaterial color="#7a7064" flatShading side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 0.1, 12]} />
        <meshStandardMaterial color="#1a2a2a" />
      </mesh>
      {[-1.3, 1.3].map((x) => (
        <Box key={x} p={[x, 1.8, 0]} s={[0.15, 2.4, 0.15]} color="#4a3322" />
      ))}
      <Box p={[0, 3, 0]} s={[2.8, 0.15, 0.15]} color="#4a3322" />
      {[
        [-10, -10],
        [10, -10],
        [-10, 18],
        [10, 18],
      ].map(([x, z]) => (
        <Torch key={`${x}${z}`} x={x} z={z} height={2.6} />
      ))}
      <Banner x={-16} y={4} z={-26} color="#6e1f1a" height={4} rotY={0} />
      <Banner x={16} y={4} z={-26} color="#6e1f1a" height={4} rotY={0} />
    </group>
  );
}

// ─────────────────────────────── kit props ───────────────────────────────

const sizes = SIZES as Record<string, { h: number; w: number }>;
const kit = (model: string, x: number, z: number, h: number, rotY = 0): Placement => ({
  model,
  pos: [x, 0, z],
  rotY,
  scale: h / Math.max(sizes[model]?.h ?? 1, 0.01),
});

const KIT: Placement[] = [
  // courtyard trees — neem and peepal, standing in for the kit's broadleafs
  kit("nature/tree_oak.glb", -18, -14, 9, 0.3),
  kit("nature/tree_default.glb", 18, -14, 8, 1.2),
  kit("nature/tree_oak_dark.glb", -18, 24, 9, 2),
  kit("nature/tree_default_dark.glb", 18, 24, 8.5, 0.7),
  // the garden, left to grow for six years
  ...Array.from({ length: 30 }, (_, i) => {
    const a = i * 2.39996;
    const r = 3 + (i % 7) * 1.5;
    const models = ["nature/plant_bush.glb", "nature/plant_bushLarge.glb", "nature/grass_leafsLarge.glb", "nature/plant_bushDetailed.glb"];
    return kit(models[i % 4], 55 + Math.cos(a) * r, Math.sin(a) * r * 1.4, 1 + (i % 3) * 0.5, a);
  }).filter((p) => p.pos[0] < 63 && Math.abs(p.pos[2]) < 16 && !(Math.abs(p.pos[2]) < 1.5 && p.pos[0] < 60)),
  kit("nature/tree_oak_fall.glb", 50, -14, 8, 0.4),
  kit("nature/tree_palmDetailedShort.glb", 50, 14, 7, 1.1),
  kit("nature/tree_default_fall.glb", 61, 14, 7, 2.2),
  // pines on the slopes beyond the walls
  ...Array.from({ length: 160 }, (_, i) => {
    const a = i * 2.39996;
    const r = 100 + (i % 11) * 14;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const m = i % 3 === 0 ? "nature/tree_pineDefaultA.glb" : i % 3 === 1 ? "nature/tree_pineRoundA.glb" : "nature/tree_cone_dark.glb";
    const p = kit(m, x, z, 9 + (i % 5) * 2, a);
    p.pos[1] = courtGround(x, z) - 0.3;
    return p;
  }),
];

function KitProps() {
  const byModel = useMemo(() => {
    const map = new Map<string, Placement[]>();
    for (const p of KIT) {
      const list = map.get(p.model);
      if (list) list.push(p);
      else map.set(p.model, [p]);
    }
    return [...map.entries()];
  }, []);
  return (
    <>
      {byModel.map(([model, placements]) => (
        <ModelBoundary key={model}>
          <Suspense fallback={null}>
            <InstancedModel model={model} placements={placements} />
          </Suspense>
        </ModelBoundary>
      ))}
    </>
  );
}

export default function Fortress() {
  return (
    <group>
      <Ground />
      <OuterWalls />
      <Rampart />
      <ThroneHall />
      <Chancery />
      <Archive />
      <Dungeon />
      <RanadhirRooms />
      <Chambers />
      <Temple />
      <Kitchens />
      <Treasury />
      <Barracks />
      <Stables />
      <Garden />
      <CourtyardDressing />
      <KitProps />
    </group>
  );
}
