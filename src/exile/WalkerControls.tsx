import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

interface Props {
  onMove: (x: number, z: number) => void;
  locked?: boolean;
  onPointerLockChange?: (locked: boolean) => void;
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
const BOUNDS = { minX: -40, maxX: 520, minZ: -40, maxZ: 40 };

/** Facing +X (east, toward Meghadurg) at the start. */
const START_YAW = -Math.PI / 2;

export default function WalkerControls({ onMove, locked, onPointerLockChange }: Props) {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const yaw = useRef(START_YAW);
  const pitch = useRef(-0.04);
  const bob = useRef(0);

  /**
   * Look is drag-based rather than pointer-lock. Pointer lock is unreliable in
   * embedded/iframe contexts and fights the choice modals that interrupt play
   * constantly — dragging works everywhere and leaves the cursor available.
   */
  useEffect(() => {
    camera.position.set(-24, EYE, 0);
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
  }, [camera, gl, onPointerLockChange]);

  useFrame((_, delta) => {
    // Look is applied even while a modal is open so the view doesn't snap on resume.
    camera.rotation.set(pitch.current, yaw.current, 0);

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
      camera.position.y = EYE + bob.current;
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

    camera.position.x = Math.min(BOUNDS.maxX, Math.max(BOUNDS.minX, camera.position.x));
    camera.position.z = Math.min(BOUNDS.maxZ, Math.max(BOUNDS.minZ, camera.position.z));

    // footfall bob
    bob.current = Math.sin(performance.now() * (running ? 0.011 : 0.006)) * 0.045;
    camera.position.y = EYE + bob.current;

    onMove(camera.position.x, camera.position.z);
  });

  return null;
}
