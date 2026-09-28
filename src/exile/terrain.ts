import * as THREE from "three";
import { WORLD_SCALE } from "./story";

const S = WORLD_SCALE;

/** Half-width of the packed-earth road surface. */
export const ROAD_HALF = 5.5;
/** The river crosses the road here; the ford beat sits on it. */
export const RIVER_X = 66 * S;
export const WATER_Y = -0.28;

import { fbm } from "./noise";

export { fbm };

const smooth = (a: number, b: number, t: number) => {
  const k = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/**
 * Ground height in metres. The road stays level so walking reads cleanly; the
 * land rises into a valley on both sides, and the river cuts a channel across
 * everything at the ford. Vajragarh's gate and Meghadurg's walls sit on flats.
 */
export function heightAt(x: number, z: number) {
  const d = Math.abs(z);
  const shoulder = smooth(ROAD_HALF + 5, 160, d);
  let h = shoulder * shoulder * (fbm(x * 0.011, z * 0.011) * 62 + 4);
  h += smooth(ROAD_HALF, ROAD_HALF + 16, d) * (fbm(x * 0.05 + 7, z * 0.05, 2) - 0.45) * 1.8;
  h += smooth(180, 330, d) * (35 + fbm(x * 0.005, z * 0.005 + 3, 3) * 110);

  const flat = Math.max(smooth(-40, -62, x), smooth(480, 512, x)) * (1 - smooth(70, 120, d));
  h *= 1 - flat;

  const r = Math.exp(-(((x - RIVER_X) / 7.5) ** 2));
  h = h * (1 - r) - r * 0.75;
  return h;
}

/** Ground palette keyed by story position: dust, dry road, ash, forest, mud, irrigated green. */
const BIOMES: [number, string, string][] = [
  [-40, "#8a7c66", "#716a58"],
  [-14, "#a58656", "#8b8550"],
  [14, "#a58656", "#8b8550"],
  [17.5, "#3a332d", "#5a534b"],
  [27, "#3a332d", "#5a534b"],
  [31, "#9a8356", "#7e8045"],
  [38, "#56612f", "#434d27"],
  [61, "#505b2c", "#3d4724"],
  [66, "#5a4a36", "#4b5731"],
  [75, "#6c7a3f", "#5a6934"],
  [97, "#648a37", "#50782e"],
  [200, "#5b8633", "#47752a"],
];

const ROCK = new THREE.Color("#8a7f70");
const SNOWISH = new THREE.Color("#b9ad9c");
const tmpA = new THREE.Color();
const tmpB = new THREE.Color();

export function groundColor(x: number, z: number, h: number, out: THREE.Color) {
  const sx = x / S;
  let i = 0;
  while (i < BIOMES.length - 2 && sx > BIOMES[i + 1][0]) i++;
  const [x0, g0, a0] = BIOMES[i];
  const [x1, g1, a1] = BIOMES[i + 1];
  const t = smooth(x0, x1, sx);
  tmpA.set(g0).lerp(tmpB.set(g1), t);
  const alt = new THREE.Color(a0).lerp(new THREE.Color(a1), t);
  const n = fbm(x * 0.08, z * 0.08, 3);
  out.copy(tmpA).lerp(alt, smooth(0.35, 0.7, n));

  // irrigated field strips inside Meghadurg's country
  if (sx > 100 && Math.abs(z) > 14 && Math.abs(z) < 90) {
    const stripe = Math.sin(z * 0.55 + fbm(x * 0.02, z * 0.02) * 4);
    if (stripe > 0.55) out.lerp(tmpB.set("#8fa84a"), 0.45);
  }

  out.lerp(ROCK, smooth(18, 45, h));
  out.lerp(SNOWISH, smooth(80, 130, h));
  out.multiplyScalar(0.92 + n * 0.16);
  return out;
}

/** Road surface colour: two wheel ruts, a worn centre, ash through the burned village. */
export function roadColor(x: number, z: number, out: THREE.Color) {
  const sx = x / S;
  out.set("#8d6f49");
  const rut = Math.exp(-(((Math.abs(z) - 1.7) / 0.35) ** 2));
  out.lerp(tmpA.set("#5f4a31"), rut * 0.55);
  out.lerp(tmpA.set("#a1845a"), Math.exp(-((z / 0.6) ** 2)) * 0.35);
  if (sx > 16 && sx < 29) out.lerp(tmpA.set("#4a423b"), 0.45);
  if (sx > 100) out.lerp(tmpA.set("#9a7c55"), 0.25);
  const n = fbm(x * 0.3, z * 0.9, 3);
  out.multiplyScalar(0.86 + n * 0.28);
  return out;
}
