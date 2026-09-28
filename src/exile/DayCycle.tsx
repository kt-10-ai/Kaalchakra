import { useFrame, useThree } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sceneLight, Stars } from "./Effects";
import { WORLD_SCALE } from "./story";

/**
 * Eleven days compressed into one walk: the time of day is a function of how
 * far west the player has come. Cold dawn at Vajragarh's gate, a hard white
 * noon, smoke-haze over the burned village, gold at the ford, a red sunset
 * over the border straight ahead, and full night for the letter.
 */
export interface Key {
  sx: number;
  sunAz: number;
  sunEl: number;
  turbidity: number;
  rayleigh: number;
  lightAz: number;
  lightEl: number;
  light: string;
  lightInt: number;
  hemiSky: string;
  hemiGround: string;
  hemiInt: number;
  fog: string;
  fogDensity: number;
  stars: number;
}

const KEYS: Key[] = [
  { sx: -30, sunAz: 160, sunEl: 3, turbidity: 4, rayleigh: 2.2, lightAz: 175, lightEl: 9, light: "#ffb08a", lightInt: 1.8, hemiSky: "#8aa2c8", hemiGround: "#5a4636", hemiInt: 0.55, fog: "#8f96a6", fogDensity: 0.0032, stars: 0.2 },
  { sx: 2, sunAz: 150, sunEl: 38, turbidity: 8, rayleigh: 1.4, lightAz: 150, lightEl: 42, light: "#fff0d6", lightInt: 3.3, hemiSky: "#9dc0f5", hemiGround: "#8a6234", hemiInt: 0.45, fog: "#d2c2a2", fogDensity: 0.0027, stars: 0 },
  { sx: 22, sunAz: 125, sunEl: 44, turbidity: 18, rayleigh: 0.8, lightAz: 125, lightEl: 44, light: "#ffc48a", lightInt: 2.1, hemiSky: "#a29a8e", hemiGround: "#4a3a2e", hemiInt: 0.42, fog: "#8e7f70", fogDensity: 0.0085, stars: 0 },
  { sx: 34, sunAz: 95, sunEl: 38, turbidity: 9, rayleigh: 1.3, lightAz: 95, lightEl: 38, light: "#ffe2b0", lightInt: 3.0, hemiSky: "#a0c0e8", hemiGround: "#7a5a34", hemiInt: 0.45, fog: "#cdb891", fogDensity: 0.0032, stars: 0 },
  { sx: 50, sunAz: 70, sunEl: 28, turbidity: 9, rayleigh: 1.6, lightAz: 70, lightEl: 30, light: "#ffdfa0", lightInt: 2.5, hemiSky: "#9fc7a4", hemiGround: "#3c4a26", hemiInt: 0.5, fog: "#8d9e7c", fogDensity: 0.0062, stars: 0 },
  { sx: 66, sunAz: 30, sunEl: 12, turbidity: 10, rayleigh: 2.6, lightAz: 30, lightEl: 15, light: "#ffae5e", lightInt: 3.2, hemiSky: "#b0b8d8", hemiGround: "#6a5030", hemiInt: 0.42, fog: "#c99a70", fogDensity: 0.0026, stars: 0 },
  { sx: 92, sunAz: 6, sunEl: 1.5, turbidity: 12, rayleigh: 3.6, lightAz: 6, lightEl: 5, light: "#ff6e3c", lightInt: 2.4, hemiSky: "#9a88b8", hemiGround: "#4a2a20", hemiInt: 0.4, fog: "#be785a", fogDensity: 0.0045, stars: 0.1 },
  { sx: 110, sunAz: 3, sunEl: -3, turbidity: 10, rayleigh: 3, lightAz: 210, lightEl: 40, light: "#8ea6ff", lightInt: 0.75, hemiSky: "#3a4c80", hemiGround: "#1c140e", hemiInt: 0.38, fog: "#343a50", fogDensity: 0.0055, stars: 0.75 },
  { sx: 128, sunAz: 0, sunEl: -9, turbidity: 8, rayleigh: 2.5, lightAz: 215, lightEl: 45, light: "#9fb2ff", lightInt: 0.85, hemiSky: "#2e3c6a", hemiGround: "#140f0a", hemiInt: 0.34, fog: "#262c3e", fogDensity: 0.005, stars: 1 },
  { sx: 146, sunAz: -4, sunEl: -1, turbidity: 9, rayleigh: 3.2, lightAz: -4, lightEl: 7, light: "#e7b8b0", lightInt: 1.2, hemiSky: "#5a6a9a", hemiGround: "#2a2018", hemiInt: 0.42, fog: "#6e6478", fogDensity: 0.0036, stars: 0.45 },
  // Act Two: the sun comes up behind the player and lights Meghadurg gold
  { sx: 162, sunAz: 185, sunEl: 7, turbidity: 5, rayleigh: 2.4, lightAz: 185, lightEl: 12, light: "#ffc890", lightInt: 2.6, hemiSky: "#9ab0d8", hemiGround: "#6a5238", hemiInt: 0.5, fog: "#c9b6a0", fogDensity: 0.0024, stars: 0 },
  { sx: 188, sunAz: 150, sunEl: 40, turbidity: 6, rayleigh: 1.4, lightAz: 150, lightEl: 44, light: "#fff2dc", lightInt: 3.3, hemiSky: "#a0c4f5", hemiGround: "#8a6a44", hemiInt: 0.48, fog: "#d8ccb4", fogDensity: 0.0022, stars: 0 },
  { sx: 216, sunAz: 100, sunEl: 58, turbidity: 6, rayleigh: 1.2, lightAz: 100, lightEl: 60, light: "#fff6e6", lightInt: 3.1, hemiSky: "#a8c8f5", hemiGround: "#9a7a54", hemiInt: 0.5, fog: "#d8d0bc", fogDensity: 0.0022, stars: 0 },
  { sx: 234, sunAz: 40, sunEl: 20, turbidity: 8, rayleigh: 2.2, lightAz: 40, lightEl: 22, light: "#ffbf78", lightInt: 3.0, hemiSky: "#b0b8d8", hemiGround: "#6a5030", hemiInt: 0.45, fog: "#d4ac84", fogDensity: 0.0028, stars: 0 },
  { sx: 246, sunAz: 12, sunEl: 2, turbidity: 11, rayleigh: 3.4, lightAz: 12, lightEl: 6, light: "#ff7a48", lightInt: 2.5, hemiSky: "#9a88b8", hemiGround: "#4a2a20", hemiInt: 0.42, fog: "#b87a62", fogDensity: 0.0035, stars: 0.05 },
];

const dir = (az: number, el: number, out: THREE.Vector3) => {
  const a = THREE.MathUtils.degToRad(az);
  const e = THREE.MathUtils.degToRad(el);
  // azimuth 0 = +X, the direction of travel; 180 = back toward Vajragarh
  return out.set(Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a));
};

const lerp = THREE.MathUtils.lerp;

function sample(keys: Key[], sx: number) {
  let i = 0;
  while (i < keys.length - 2 && sx > keys[i + 1].sx) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const raw = Math.min(1, Math.max(0, (sx - a.sx) / (b.sx - a.sx)));
  const t = raw * raw * (3 - 2 * raw);
  return { a, b, t };
}

interface Props {
  /** Keyframes; `sx` is whatever `at()` returns. Defaults to the road, keyed by distance. */
  keys?: Key[];
  at?: (camera: THREE.Camera) => number;
  /** Where the shadow camera centres, relative to the player. */
  shadowSpan?: number;
}

const byRoad = (camera: THREE.Camera) => camera.position.x / WORLD_SCALE;

export default function DayCycle({ keys = KEYS, at = byRoad, shadowSpan = 60 }: Props) {
  const { scene, camera } = useThree();
  const sky = useRef<THREE.Mesh<THREE.BoxGeometry, THREE.ShaderMaterial>>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const target = useRef<THREE.Object3D>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const stars = useRef<THREE.PointsMaterial>(null);
  const fog = useMemo(() => new THREE.FogExp2("#d2c2a2", 0.003), []);
  const cur = useRef<number | null>(null);
  const tmp = useMemo(
    () => ({ v: new THREE.Vector3(), l: new THREE.Vector3(), c1: new THREE.Color(), c2: new THREE.Color() }),
    []
  );

  scene.fog = fog;

  useFrame((_, dt) => {
    // ease rather than snap, so running backwards doesn't strobe the sky
    const want = at(camera);
    cur.current = cur.current === null ? want : cur.current + (want - cur.current) * Math.min(1, dt * 1.5);
    const { a, b, t } = sample(keys, cur.current);

    const m = sky.current?.material;
    if (m?.uniforms) {
      dir(lerp(a.sunAz, b.sunAz, t), lerp(a.sunEl, b.sunEl, t), tmp.v);
      m.uniforms.sunPosition.value.copy(tmp.v).multiplyScalar(400);
      m.uniforms.turbidity.value = lerp(a.turbidity, b.turbidity, t);
      m.uniforms.rayleigh.value = lerp(a.rayleigh, b.rayleigh, t);
      m.uniforms.mieCoefficient.value = 0.008;
      m.uniforms.mieDirectionalG.value = 0.8;
    }
    sky.current?.position.copy(camera.position);

    if (sun.current && target.current) {
      if (sun.current.target !== target.current) sun.current.target = target.current;
      // the sun rides along with the player so one shadow map covers where they are
      tmp.l.copy(dir(a.lightAz, a.lightEl, tmp.l)).lerp(dir(b.lightAz, b.lightEl, tmp.v), t).normalize();
      const x = camera.position.x + (keys === KEYS ? 10 : 0);
      const z = keys === KEYS ? 0 : camera.position.z;
      target.current.position.set(x, 0, z);
      target.current.updateMatrixWorld();
      sun.current.position.set(x + tmp.l.x * 90, Math.max(tmp.l.y, 0.05) * 90, z + tmp.l.z * 90);
      sun.current.color.copy(tmp.c1.set(a.light).lerp(tmp.c2.set(b.light), t));
      sun.current.intensity = lerp(a.lightInt, b.lightInt, t);
    }
    if (hemi.current) {
      hemi.current.color.copy(tmp.c1.set(a.hemiSky).lerp(tmp.c2.set(b.hemiSky), t));
      hemi.current.groundColor.copy(tmp.c1.set(a.hemiGround).lerp(tmp.c2.set(b.hemiGround), t));
      hemi.current.intensity = lerp(a.hemiInt, b.hemiInt, t);
    }
    // how bright unlit smoke should read: follows the sky, never fully black
    const lit = Math.min(1, 0.18 + lerp(a.lightInt, b.lightInt, t) * 0.26);
    sceneLight.value.copy(tmp.c1.set(a.fog).lerp(tmp.c2.set(b.fog), t)).lerp(tmp.c2.set("#ffffff"), 0.5).multiplyScalar(lit);
    fog.color.copy(tmp.c1.set(a.fog).lerp(tmp.c2.set(b.fog), t));
    fog.density = lerp(a.fogDensity, b.fogDensity, t);
    if (stars.current) stars.current.opacity = lerp(a.stars, b.stars, t);
  });

  return (
    <>
      <Sky ref={sky} distance={1200} sunPosition={[-150, 16, 60]} />
      <Stars material={stars} />
      <hemisphereLight ref={hemi} args={["#9dc0f5", "#8a6234", 0.45]} />
      <ambientLight intensity={0.12} />
      <object3D ref={target} />
      <directionalLight
        ref={sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-shadowSpan}
        shadow-camera-right={shadowSpan}
        shadow-camera-top={shadowSpan}
        shadow-camera-bottom={-shadowSpan}
        shadow-camera-near={1}
        shadow-camera-far={260}
        shadow-bias={-0.0004}
        shadow-normalBias={0.06}
      />
    </>
  );
}
