import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

/**
 * Bends vegetation in the wind by patching the material's vertex shader.
 *
 * The world is instanced, so this can't animate per-object transforms — the
 * sway has to happen on the GPU. Displacement is weighted by height above the
 * instance origin, so trunks stay planted and only the canopy moves.
 */
export function applyWind(material: THREE.Material, strength = 1) {
  const m = material as THREE.Material & { userData: Record<string, unknown> };
  if (m.userData.windPatched) return m.userData.windUniforms as { uTime: { value: number } };

  const uniforms = { uTime: { value: 0 }, uWind: { value: strength } };

  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uWind = uniforms.uWind;

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
         uniform float uTime;
         uniform float uWind;`
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         {
           // world position of this instance, so neighbours don't sway in lockstep
           #ifdef USE_INSTANCING
             vec3 instOrigin = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
           #else
             vec3 instOrigin = vec3(0.0);
           #endif
           float phase = instOrigin.x * 0.18 + instOrigin.z * 0.13;
           // only the upper part of the model moves
           float h = max(transformed.y, 0.0);
           float gust = sin(uTime * 1.1 + phase) * 0.6 + sin(uTime * 2.3 + phase * 1.7) * 0.4;
           float amp = uWind * 0.045 * h;
           transformed.x += gust * amp;
           transformed.z += cos(uTime * 0.9 + phase * 1.3) * amp * 0.6;
         }`
      );
  };

  m.needsUpdate = true;
  m.userData.windPatched = true;
  m.userData.windUniforms = uniforms;
  return uniforms;
}

const clocks: { uTime: { value: number } }[] = [];
export function registerWindClock(u: { uTime: { value: number } }) {
  if (!clocks.includes(u)) clocks.push(u);
}

/** Single driver that advances every patched material's time uniform. */
export default function WindDriver() {
  const t = useRef(0);
  useFrame((_, delta) => {
    t.current += delta;
    for (const c of clocks) c.uTime.value = t.current;
  });
  return null;
}
