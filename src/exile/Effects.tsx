import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { fbm, heightAt } from "./terrain";

const plumeVert = /* glsl */ `
  uniform float uTime;
  uniform float uHeight;
  uniform float uSpread;
  uniform float uSize;
  uniform float uSpeed;
  uniform float uGrow;
  uniform float uDrift;
  uniform float uMaxSize;
  attribute float aSeed;
  attribute vec3 aRand;
  varying float vAge;
  void main() {
    float age = fract(uTime * uSpeed + aSeed);
    vAge = age;
    float widen = 0.3 + age * 1.3;
    vec3 p = vec3(
      aRand.x * uSpread * widen + age * age * uDrift + sin(uTime * 0.7 + aSeed * 20.0) * age * 0.6,
      age * uHeight * (0.8 + aRand.y * 0.4),
      aRand.z * uSpread * widen
    );
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // clamp so a flame right next to the camera doesn't fill the lens
    gl_PointSize = min(uSize * (0.35 + age * uGrow) * (300.0 / -mv.z), uMaxSize);
  }
`;

const plumeFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uColorEnd;
  uniform float uOpacity;
  uniform float uGlow;
  uniform vec3 uTint;
  varying float vAge;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d) * uOpacity * smoothstep(0.0, 0.1, vAge) * (1.0 - vAge);
    vec3 col = mix(uColor, uColorEnd, vAge) * uGlow * uTint;
    gl_FragColor = vec4(col, a);
  }
`;

/**
 * Smoke is unlit, so without this it would glow white at night. The day cycle
 * writes the current light level here; flames ignore it.
 */
export const sceneLight = { value: new THREE.Color(1, 1, 1) };
const FULL = { value: new THREE.Color(1, 1, 1) };

interface PlumeProps {
  position: [number, number, number];
  count?: number;
  height?: number;
  spread?: number;
  size?: number;
  speed?: number;
  grow?: number;
  drift?: number;
  color?: string;
  colorEnd?: string;
  opacity?: number;
  /** >1 pushes the colour past the bloom threshold, for flames and embers. */
  glow?: number;
  additive?: boolean;
}

/** A GPU particle column: smoke, embers, flame. One draw call each. */
export function Plume({
  position,
  count = 60,
  height = 14,
  spread = 1.6,
  size = 60,
  speed = 0.06,
  grow = 2.2,
  drift = 4,
  color = "#4a4541",
  colorEnd,
  opacity = 0.45,
  glow = 1,
  additive = false,
}: PlumeProps) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seeds = new Float32Array(count);
    const rand = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      seeds[i] = i / count + Math.random() * 0.02;
      rand[i * 3] = Math.random() * 2 - 1;
      rand[i * 3 + 1] = Math.random();
      rand[i * 3 + 2] = Math.random() * 2 - 1;
    }
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, height / 2, 0), height + spread * 3);
    return g;
  }, [count, height, spread]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: Math.random() * 100 },
      uHeight: { value: height },
      uSpread: { value: spread },
      uSize: { value: size },
      uSpeed: { value: speed },
      uGrow: { value: grow },
      uDrift: { value: drift },
      uColor: { value: new THREE.Color(color) },
      uColorEnd: { value: new THREE.Color(colorEnd ?? color) },
      uOpacity: { value: opacity },
      uGlow: { value: glow },
      uMaxSize: { value: additive ? 26 : 260 },
      uTint: additive ? FULL : sceneLight,
    }),
    [height, spread, size, speed, grow, drift, color, colorEnd, opacity, glow, additive]
  );

  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt;
  });

  return (
    <points position={position} geometry={geometry} frustumCulled>
      <shaderMaterial
        ref={mat}
        vertexShader={plumeVert}
        fragmentShader={plumeFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

export function Flame({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <Plume
      position={position}
      count={28}
      height={0.9 * scale}
      spread={0.12 * scale}
      size={18 * scale}
      speed={1.1}
      grow={-0.25}
      drift={0}
      color="#ffd27a"
      colorEnd="#ff4a12"
      opacity={0.9}
      glow={1.7}
      additive
    />
  );
}

/** A standing torch or oil lamp. Only some carry a real light — they are expensive. */
export function Torch({
  x,
  z,
  height = 2.2,
  light = false,
  lamp = false,
}: {
  x: number;
  z: number;
  height?: number;
  light?: boolean;
  lamp?: boolean;
}) {
  const y = heightAt(x, z);
  const ref = useRef<THREE.PointLight>(null);
  const seed = useMemo(() => Math.random() * 10, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime + seed;
    ref.current.intensity = 22 + Math.sin(t * 13) * 3 + Math.sin(t * 7.3) * 4;
  });
  const top = lamp ? 0.95 : height;
  return (
    <group position={[x, y, z]}>
      {lamp ? (
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.2, 0.9, 6]} />
          <meshStandardMaterial color="#8a7a66" flatShading roughness={0.9} />
        </mesh>
      ) : (
        <mesh position={[0, height / 2, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.07, height, 5]} />
          <meshStandardMaterial color="#4a3321" flatShading roughness={0.9} />
        </mesh>
      )}
      <mesh position={[0, top + 0.05, 0]}>
        <cylinderGeometry args={[0.16, 0.08, 0.14, 7]} />
        <meshStandardMaterial color="#6b4a2a" flatShading roughness={0.7} />
      </mesh>
      <Flame position={[0, top + 0.1, 0]} scale={lamp ? 0.7 : 1} />
      {light && <pointLight ref={ref} position={[0, top + 0.5, 0]} color="#ff9a48" distance={16} decay={2} />}
    </group>
  );
}

export function Campfire({ x, z }: { x: number; z: number }) {
  const y = heightAt(x, z);
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.intensity = 60 + Math.sin(t * 11) * 8 + Math.sin(t * 5.7) * 10;
  });
  return (
    <group position={[x, y, z]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 0.12, 0]} rotation={[0, (i * Math.PI) / 2.5, 1.2]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 1.1, 5]} />
          <meshStandardMaterial color="#3a2616" flatShading />
        </mesh>
      ))}
      <Flame position={[0, 0.1, 0]} scale={1.7} />
      <Plume position={[0, 0.6, 0]} count={30} height={9} spread={0.4} size={45} speed={0.08} drift={1.5} color="#6f6a66" opacity={0.25} />
      <Plume position={[0, 0.3, 0]} count={20} height={3.5} spread={0.25} size={6} speed={0.35} grow={-0.3} drift={0.5} color="#ffb347" colorEnd="#ff3a0a" opacity={1} glow={4} additive />
      <pointLight ref={ref} position={[0, 1.1, 0]} color="#ff8a3a" distance={26} decay={2} castShadow={false} />
    </group>
  );
}

/** Small tileable normal map from noise, so water catches the sun in ripples. */
function makeRippleNormals(size = 128) {
  const data = new Uint8Array(size * size * 4);
  const hAt = (x: number, y: number) => fbm((x / size) * 8, (y / size) * 8, 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = hAt((x + 1) % size, y) - hAt((x - 1 + size) % size, y);
      const dy = hAt(x, (y + 1) % size) - hAt(x, (y - 1 + size) % size);
      const n = new THREE.Vector3(-dx * 6, -dy * 6, 1).normalize();
      const i = (y * size + x) * 4;
      data[i] = (n.x * 0.5 + 0.5) * 255;
      data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

export function Water({ x, y, width, length }: { x: number; y: number; width: number; length: number }) {
  const normals = useMemo(() => {
    const t = makeRippleNormals();
    t.repeat.set(width / 6, length / 6);
    return t;
  }, [width, length]);
  useFrame((_, dt) => {
    normals.offset.y += dt * 0.05;
    normals.offset.x += dt * 0.012;
  });
  return (
    <mesh rotation-x={-Math.PI / 2} position={[x, y, 0]} receiveShadow>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial
        color="#3d6a70"
        roughness={0.08}
        metalness={0.1}
        normalMap={normals}
        normalScale={new THREE.Vector2(0.7, 0.7)}
        transparent
        opacity={0.82}
      />
    </mesh>
  );
}

/** Carrion birds wheeling on thermals over the burned village. */
export function Birds({ center, count = 7, radius = 22, height = 26 }: { center: [number, number, number]; count?: number; radius?: number; height?: number }) {
  const group = useRef<THREE.Group>(null);
  const wing = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0, -0.25, 0, 0, 0.25, 1.3, 0.05, 0]), 3));
    g.computeVertexNormals();
    return g;
  }, []);
  const birds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        r: radius * (0.5 + Math.random() * 0.7),
        h: height + (Math.random() - 0.5) * 10,
        speed: 0.12 + Math.random() * 0.1,
        phase: (i / count) * Math.PI * 2,
        dir: Math.random() < 0.3 ? -1 : 1,
      })),
    [count, radius, height]
  );

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    g.children.forEach((b, i) => {
      const p = birds[i];
      const a = p.phase + t * p.speed * p.dir;
      b.position.set(Math.cos(a) * p.r, p.h + Math.sin(t * 0.3 + i) * 2, Math.sin(a) * p.r);
      b.rotation.y = -a + (p.dir > 0 ? 0 : Math.PI);
      b.rotation.z = Math.sin(t * 0.8 + i) * 0.25 * p.dir;
      const flap = Math.sin(t * 5 + i * 3) > 0.92 ? Math.sin(t * 22) * 0.5 : 0.08;
      (b.children[0] as THREE.Mesh).rotation.x = flap;
      (b.children[1] as THREE.Mesh).rotation.x = -flap;
    });
  });

  return (
    <group ref={group} position={center}>
      {birds.map((_, i) => (
        <group key={i}>
          <mesh geometry={wing} rotation-y={Math.PI / 2}>
            <meshBasicMaterial color="#1a1512" side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={wing} rotation-y={-Math.PI / 2}>
            <meshBasicMaterial color="#1a1512" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** A cloth banner rippling from a pole. */
export function Banner({ x, y, z, color = "#c8571b", height = 3.2, rotY = 0 }: { x: number; y: number; z: number; color?: string; height?: number; rotY?: number }) {
  const geo = useMemo(() => new THREE.PlaneGeometry(1.3, height, 10, 4), [height]);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo]);
  const seed = useMemo(() => Math.random() * 10, []);
  useFrame(({ clock }) => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const t = clock.elapsedTime + seed;
    for (let i = 0; i < pos.count; i++) {
      const bx = base[i * 3];
      const by = base[i * 3 + 1];
      const along = bx + 0.65;
      pos.setZ(i, Math.sin(along * 3.2 - t * 3.1 + by * 0.4) * 0.18 * along);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });
  return (
    <group position={[x, y, z]} rotation-y={rotY}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, height + 0.8, 5]} />
        <meshStandardMaterial color="#3a2a1a" />
      </mesh>
      <mesh geometry={geo} position={[0.68, 0.2, 0]} castShadow>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} side={THREE.DoubleSide} flatShading roughness={0.8} />
      </mesh>
    </group>
  );
}

/** A star dome that fades in with dusk. Opacity is driven by the day cycle. */
export function Stars({ material }: { material: RefObject<THREE.PointsMaterial | null> }) {
  const group = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const n = 1800;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.acos(Math.random() * 0.95);
      arr[i * 3] = Math.sin(v) * Math.cos(u) * 900;
      arr[i * 3 + 1] = Math.cos(v) * 900;
      arr[i * 3 + 2] = Math.sin(v) * Math.sin(u) * 900;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);
  useFrame(({ camera }) => group.current?.position.copy(camera.position));
  return (
    <points ref={group} geometry={geo} frustumCulled={false}>
      <pointsMaterial ref={material} size={1.7} sizeAttenuation={false} color="#dfe6ff" transparent opacity={0} fog={false} depthWrite={false} />
    </points>
  );
}
