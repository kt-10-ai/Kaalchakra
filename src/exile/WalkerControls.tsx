import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { heightAt } from "./terrain";
import { companionPos } from "./Characters";
import type { Focus } from "./story";

interface Props {
  onMove: (x: number, z: number) => void;
  locked?: boolean;
  onPointerLockChange?: (locked: boolean) => void;
  /** When set, the head turns to face this point — how cutscenes direct the eye. */
  focus?: Focus | null;
  /** Live look-at target, checked every frame; wins over `focus` when it returns a point. */
  focusPoint?: () => [number, number, number] | null;
  ground?: (x: number, z: number) => number;
  bounds?: { minX: number; maxX: number; minZ: number; maxZ: number };
  start?: { x: number; z: number; yaw: number };
  /** Axis-aligned boxes the walker can't enter (x/z extents only). */
  colliders?: Collider[];
}

export interface Collider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

const RADIUS = 0.35;

/** Push a circle out of any box it overlaps, along the shallowest axis. */
function collide(p: { x: number; z: number }, boxes: Collider[]) {
  for (const b of boxes) {
    const cx = Math.max(b.minX, Math.min(p.x, b.maxX));
    const cz = Math.max(b.minZ, Math.min(p.z, b.maxZ));
    const dx = p.x - cx;
    const dz = p.z - cz;
    const d2 = dx * dx + dz * dz;
    if (d2 >= RADIUS * RADIUS) continue;
    if (d2 > 1e-8) {
      const d = Math.sqrt(d2);
      p.x = cx + (dx / d) * RADIUS;
      p.z = cz + (dz / d) * RADIUS;
    } else {
      // centre is inside the box: leave by the nearest face
      const exits = [p.x - b.minX, b.maxX - p.x, p.z - b.minZ, b.maxZ - p.z];
      const i = exits.indexOf(Math.min(...exits));
      if (i === 0) p.x = b.minX - RADIUS;
      else if (i === 1) p.x = b.maxX + RADIUS;
      else if (i === 2) p.z = b.minZ - RADIUS;
      else p.z = b.maxZ + RADIUS;
    }
  }
}

function shortestAngle(from: number, to: number) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/**
 * A person walks ~1.4 m/s, which reads as glacial in first person, so games
 * normally cheat upward. 4.2 feels like a purposeful traveller's walk; holding
 * shift pushes to a jog for players who want to cover ground.
 */
const WALK_SPEED = 4.2;
const JOG_SPEED = 9;
const EYE = 1.75; // eye height of a standing adult
const LOOK_SENSITIVITY = 0.0022;
const PITCH_LIMIT = Math.PI / 2 - 0.12;
const BOUNDS = { minX: -40, maxX: 745, minZ: -40, maxZ: 40 };

/** Facing +X (east, toward Meghadurg) at the start. */
const START_YAW = -Math.PI / 2;

export default function WalkerControls({
  onMove,
  locked,
  onPointerLockChange,
  focus,
  focusPoint,
  ground: groundAt = heightAt,
  bounds = BOUNDS,
  start = { x: -24, z: 0, yaw: START_YAW },
  colliders,
}: Props) {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const yaw = useRef(start.yaw);
  const pitch = useRef(-0.04);
  const bob = useRef(0);

  /**
   * Look is drag-based rather than pointer-lock. Pointer lock is unreliable in
   * embedded/iframe contexts and fights the choice modals that interrupt play
   * constantly — dragging works everywhere and leaves the cursor available.
   */
  useEffect(() => {
    camera.position.set(start.x, groundAt(start.x, start.z) + EYE, start.z);
    camera.rotation.order = "YXZ";

    const canvas = gl.domElement;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const down = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = true);
    const up = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = false);

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture?.(e.pointerId);
      onPointerLockChange?.(true);
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      yaw.current -= (e.clientX - lastX) * LOOK_SENSITIVITY;
      pitch.current -= (e.clientY - lastY) * LOOK_SENSITIVITY;
      pitch.current = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch.current));
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      canvas.releasePointerCapture?.(e.pointerId);
      onPointerLockChange?.(false);
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
    // start is only read on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl, onPointerLockChange]);

  useFrame((_, delta) => {
    const live = focusPoint?.() ?? null;
    if (live || focus) {
      const [fx, fy, fz] = live
        ? live
        : focus === "companion"
          ? [companionPos.x, companionPos.y, companionPos.z]
          : focus === "road"
            ? [camera.position.x + 40, camera.position.y - 0.3, camera.position.z * 0.4]
            : (focus as [number, number, number]);
      const dx = fx - camera.position.x;
      const dz = fz - camera.position.z;
      const wantYaw = Math.atan2(-dx, -dz);
      const wantPitch = Math.atan2(fy - camera.position.y, Math.hypot(dx, dz));
      const k = Math.min(1, delta * 2.2);
      yaw.current += shortestAngle(yaw.current, wantYaw) * k;
      pitch.current += (Math.max(-0.5, Math.min(0.5, wantPitch)) - pitch.current) * k;
    }

    // Look is applied even while a modal is open so the view doesn't snap on resume.
    camera.rotation.set(pitch.current, yaw.current, 0);
    const ground = groundAt(camera.position.x, camera.position.z);

    if (locked) return;

    const k = keys.current;
    let f = 0;
    let s = 0;
    if (k["w"] || k["arrowup"]) f += 1;
    if (k["s"] || k["arrowdown"]) f -= 1;
    if (k["d"] || k["arrowright"]) s += 1;
    if (k["a"] || k["arrowleft"]) s -= 1;

    if (f === 0 && s === 0) {
      // ease the head back to rest
      bob.current += (0 - bob.current) * Math.min(1, delta * 6);
      camera.position.y = ground + EYE + bob.current;
      return;
    }

    // move relative to where the player is looking, ignoring pitch
    const sinY = Math.sin(yaw.current);
    const cosY = Math.cos(yaw.current);
    const fx = -sinY;
    const fz = -cosY;
    const rx = cosY;
    const rz = -sinY;

    const running = keys.current["shift"];
    const speed = running ? JOG_SPEED : WALK_SPEED;
    const len = Math.hypot(f, s) || 1;
    const step = (speed * delta) / len;
    camera.position.x += (fx * f + rx * s) * step;
    camera.position.z += (fz * f + rz * s) * step;

    camera.position.x = Math.min(bounds.maxX, Math.max(bounds.minX, camera.position.x));
    camera.position.z = Math.min(bounds.maxZ, Math.max(bounds.minZ, camera.position.z));
    if (colliders) collide(camera.position, colliders);

    // footfall bob
    bob.current = Math.sin(performance.now() * (running ? 0.011 : 0.006)) * 0.045;
    camera.position.y = groundAt(camera.position.x, camera.position.z) + EYE + bob.current;

    onMove(camera.position.x, camera.position.z);
  });

  return null;
}
