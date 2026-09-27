import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

interface Props {
  onMove: (x: number, z: number) => void;
  locked?: boolean;
}

const SPEED = 22;
const BOUNDS = { minX: -12, maxX: 172, minZ: -16, maxZ: 16 };

export default function WalkerControls({ onMove, locked }: Props) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    camera.position.set(-8, 2.2, 10);
    camera.lookAt(20, 1.5, 0);

    const down = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = true);
    const up = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [camera]);

  useFrame((_, delta) => {
    if (locked) return;
    const k = keys.current;
    let dx = 0;
    let dz = 0;
    if (k["w"] || k["arrowup"]) dx += 1;
    if (k["s"] || k["arrowdown"]) dx -= 1;
    if (k["a"] || k["arrowleft"]) dz -= 1;
    if (k["d"] || k["arrowright"]) dz += 1;

    if (dx !== 0 || dz !== 0) {
      const len = Math.hypot(dx, dz) || 1;
      camera.position.x += (dx / len) * SPEED * delta;
      camera.position.z += (dz / len) * SPEED * delta;
      camera.position.x = Math.min(BOUNDS.maxX, Math.max(BOUNDS.minX, camera.position.x));
      camera.position.z = Math.min(BOUNDS.maxZ, Math.max(BOUNDS.minZ, camera.position.z));
      camera.lookAt(camera.position.x + 10, 1.5, 0);
      onMove(camera.position.x, camera.position.z);
    }
  });

  return null;
}
