import { fbm } from "../exile/noise";
import type { Collider } from "../exile/WalkerControls";
import type { CharId, LocationId } from "./types";

/**
 * Vajragarh: a square mountain fortress, 156m a side, the gate to the south.
 * x runs east, z runs south. Every location is a room with one open side
 * facing the courtyard, so a scene can be staged in it and seen from outside.
 */

export type Side = "n" | "s" | "e" | "w";

export interface Room {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  h: number;
  open: Side;
  wall: string;
  floor: string;
  roof: string;
  /** Width of the doorway in the open side; omit for a fully open front. */
  door?: number;
}

export interface Slot {
  x: number;
  z: number;
  rotY: number;
  /** Vertical offset — a throne, a dais, a kneeling prisoner. */
  y?: number;
}

export interface Place {
  id: LocationId;
  name: string;
  /** Walk here to start the episode. */
  mark: [number, number];
  room?: Room;
  /** Where people stand, in order of importance. */
  slots: Slot[];
  /** Specific people always take a specific slot here. */
  fixed?: Partial<Record<CharId, Slot>>;
}

const STONE = "#8b8174";
const DARK = "#6b6259";
const ROOF = "#5a2e22";

/** Faces a slot toward a point. */
const face = (x: number, z: number, tx: number, tz: number): Slot => ({ x, z, rotY: Math.atan2(tx - x, tz - z) });

export const PLACES: Record<LocationId, Place> = {
  courtyard: {
    id: "courtyard",
    name: "चौक · The Courtyard",
    mark: [0, 10],
    slots: [face(-3, 4, 0, 10), face(3, 4, 0, 10), face(-6, 7, 0, 10), face(6, 7, 0, 10), face(0, 3, 0, 10), face(-4, 1, 0, 10), face(4, 1, 0, 10)],
  },
  hall: {
    id: "hall",
    name: "सभा-मंडप · The Throne Hall",
    mark: [0, -38],
    room: { x0: -16, x1: 16, z0: -74, z1: -30, h: 13, open: "s", door: 7, wall: "#7e7468", floor: "#5e5650", roof: ROOF },
    slots: [
      face(-11, -58, 0, -52), face(11, -58, 0, -52), face(-11, -50, 0, -48), face(11, -50, 0, -48),
      face(-11, -44, 0, -44), face(11, -44, 0, -44), face(-11, -64, 0, -56), face(11, -64, 0, -56),
    ],
    fixed: {
      bhanusen: { x: 0, z: -68, rotY: 0, y: 1.3 },
      ranadhir: { x: -3.6, z: -63.5, rotY: 0.25, y: 0.45 },
      kaushal: { x: 4.4, z: -63, rotY: -0.3, y: 0.45 },
      chaya: { x: 0, z: -52, rotY: 0, y: -0.42 },
      ugrasen: { x: 7, z: -60, rotY: -0.6 },
      devashrava: { x: -7, z: -60, rotY: 0.6 },
    },
  },
  chancery: {
    id: "chancery",
    name: "मंत्रणालय · The Chancery",
    mark: [-22, -32],
    room: { x0: -42, x1: -27, z0: -40, z1: -24, h: 6, open: "e", door: 4, wall: STONE, floor: "#6e5a44", roof: ROOF },
    slots: [face(-34, -35, -22, -32), face(-36, -29, -22, -32), face(-31, -28, -22, -32)],
    fixed: { kaushal: { x: -38, z: -32, rotY: Math.PI / 2 } },
  },
  archive: {
    id: "archive",
    name: "अभिलेखागार · The Archive",
    mark: [-44, -8],
    room: { x0: -68, x1: -50, z0: -20, z1: 2, h: 9, open: "e", door: 4, wall: DARK, floor: "#5a4a3a", roof: "#3a3a44" },
    slots: [face(-58, -11, -44, -8), face(-61, -5, -44, -8), face(-55, -3, -44, -8)],
    fixed: { vidyadhar: { x: -58, z: -9, rotY: Math.PI / 2 } },
  },
  dungeon: {
    id: "dungeon",
    name: "कारागार · The Dungeon",
    mark: [-44, 22],
    room: { x0: -68, x1: -50, z0: 12, z1: 32, h: 5, open: "e", door: 3, wall: "#5a544e", floor: "#403a34", roof: "#3a3430" },
    slots: [face(-56, 20, -44, 22), face(-57, 26, -44, 22)],
    fixed: { chaya: { x: -64, z: 22, rotY: Math.PI / 2 }, karan: { x: -54, z: 17.5, rotY: Math.PI / 2 + 0.4 } },
  },
  ranadhir: {
    id: "ranadhir",
    name: "युवराज का कक्ष · Ranadhir's Quarters",
    mark: [-30, 36],
    room: { x0: -44, x1: -26, z0: 40, z1: 56, h: 6, open: "n", door: 4, wall: STONE, floor: "#5a4a44", roof: ROOF },
    slots: [face(-35, 46, -30, 36), face(-38, 50, -30, 36)],
    fixed: { ranadhir: { x: -33, z: 47, rotY: Math.PI } },
  },
  chambers: {
    id: "chambers",
    name: "राजकुमार का कक्ष · Your Chambers",
    mark: [22, -32],
    room: { x0: 27, x1: 42, z0: -40, z1: -24, h: 6, open: "w", door: 4, wall: STONE, floor: "#6a5040", roof: ROOF },
    slots: [face(33, -31, 22, -32), face(36, -35, 22, -32)],
    fixed: { nandini: { x: 32, z: -30, rotY: -Math.PI / 2 } },
  },
  garden: {
    id: "garden",
    name: "रानी का उपवन · The Queen's Garden",
    mark: [50, 0],
    slots: [face(58, -3, 50, 0), face(60, 4, 50, 0), face(56, 6, 50, 0)],
    fixed: { sumitra: { x: 60, z: 5, rotY: -Math.PI / 2 - 0.4 } },
  },
  temple: {
    id: "temple",
    name: "मंदिर · The Temple",
    mark: [24, 36],
    room: { x0: 28, x1: 42, z0: 28, z1: 44, h: 8, open: "w", wall: "#9a8a74", floor: "#8a7a64", roof: "#7a3a1a" },
    slots: [face(33, 33, 24, 36), face(33, 40, 24, 36)],
    fixed: { devashrava: { x: 36, z: 36, rotY: -Math.PI / 2 } },
  },
  kitchens: {
    id: "kitchens",
    name: "रसोई · The Kitchens",
    mark: [15, 44],
    room: { x0: 7, x1: 23, z0: 50, z1: 66, h: 6, open: "n", door: 5, wall: "#8a7a68", floor: "#6a5a48", roof: ROOF },
    slots: [face(12, 56, 15, 44), face(19, 57, 15, 44)],
    fixed: { sumitra: { x: 15, z: 56, rotY: Math.PI } },
  },
  treasury: {
    id: "treasury",
    name: "कोषागार · The Counting House",
    mark: [-15, 44],
    room: { x0: -23, x1: -7, z0: 50, z1: 66, h: 6, open: "n", door: 4, wall: DARK, floor: "#5a5048", roof: "#3a3a44" },
    slots: [face(-12, 57, -15, 44), face(-18, 58, -15, 44)],
    fixed: { bhairav: { x: -15, z: 57, rotY: Math.PI } },
  },
  barracks: {
    id: "barracks",
    name: "सैन्य-शाला · The Barracks",
    mark: [42, 52],
    room: { x0: 48, x1: 70, z0: 44, z1: 62, h: 6, open: "w", wall: "#7a7064", floor: "#6a5a4a", roof: "#4a3a2e" },
    slots: [face(53, 50, 42, 52), face(55, 56, 42, 52), face(58, 52, 42, 52)],
    fixed: { ugrasen: { x: 52, z: 53, rotY: -Math.PI / 2 } },
  },
  stables: {
    id: "stables",
    name: "अस्तबल · The Stables",
    mark: [-44, 55],
    room: { x0: -70, x1: -50, z0: 46, z1: 64, h: 5, open: "e", wall: "#7a6450", floor: "#6a5a3a", roof: "#5a4a30" },
    slots: [face(-54, 52, -44, 55), face(-55, 59, -44, 55)],
    fixed: { moti: { x: -54, z: 55, rotY: Math.PI / 2 } },
  },
  gate: {
    id: "gate",
    name: "द्वार · The Gate",
    mark: [0, 62],
    slots: [face(-4, 68, 0, 62), face(4, 68, 0, 62), face(-7, 65, 0, 62), face(7, 65, 0, 62), face(0, 70, 0, 62)],
    fixed: { vikram: { x: 3.5, z: 68, rotY: Math.PI } },
  },
  walls: {
    id: "walls",
    name: "प्राचीर · The Ramparts",
    mark: [60, -62],
    slots: [face(64, -66, 60, -62), face(56, -66, 60, -62)],
  },
};

/** The fortress interior is flat flagstone; the rampart tower is reached by a ramp. */
export const RAMPART = { x0: 50, x1: 72, z0: -74, z1: -52, h: 8, rampX0: 56, rampX1: 64, rampZ0: -52, rampZ1: -30 };

export const WALL_HALF = 78;

export function courtGround(x: number, z: number) {
  const r = RAMPART;
  if (x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1) return r.h;
  if (x > r.rampX0 && x < r.rampX1 && z >= r.rampZ0 && z < r.rampZ1) return r.h * (1 - (z - r.rampZ0) / (r.rampZ1 - r.rampZ0));
  const d = Math.max(Math.abs(x), Math.abs(z));
  if (d < WALL_HALF + 4) return 0;
  // the mountains Vajragarh is built into
  const k = Math.min(1, (d - WALL_HALF - 4) / 160);
  return -6 * Math.min(1, (d - WALL_HALF - 4) / 20) + k * k * (40 + fbm(x * 0.008, z * 0.008, 4) * 180);
}

const T = 0.6;

function roomColliders(r: Room): Collider[] {
  const out: Collider[] = [];
  const add = (minX: number, maxX: number, minZ: number, maxZ: number) => out.push({ minX, maxX, minZ, maxZ });
  const wallX = (x: number, z0: number, z1: number) => add(x - T / 2, x + T / 2, z0, z1);
  const wallZ = (z: number, x0: number, x1: number) => add(x0, x1, z - T / 2, z + T / 2);
  const withDoor = (side: Side) => {
    const door = r.door;
    if (side === "n" || side === "s") {
      const z = side === "n" ? r.z0 : r.z1;
      if (side !== r.open) return wallZ(z, r.x0, r.x1);
      if (door === undefined) return;
      const mid = (r.x0 + r.x1) / 2;
      wallZ(z, r.x0, mid - door / 2);
      wallZ(z, mid + door / 2, r.x1);
    } else {
      const x = side === "w" ? r.x0 : r.x1;
      if (side !== r.open) return wallX(x, r.z0, r.z1);
      if (door === undefined) return;
      const mid = (r.z0 + r.z1) / 2;
      wallX(x, r.z0, mid - door / 2);
      wallX(x, mid + door / 2, r.z1);
    }
  };
  (["n", "s", "e", "w"] as Side[]).forEach(withDoor);
  return out;
}

export const COLLIDERS: Collider[] = [
  ...Object.values(PLACES).flatMap((p) => (p.room ? roomColliders(p.room) : [])),
  // outer walls, with the gate gap to the south
  { minX: -WALL_HALF - 2, maxX: WALL_HALF + 2, minZ: -WALL_HALF - 2, maxZ: -WALL_HALF + 1 },
  { minX: -WALL_HALF - 2, maxX: -WALL_HALF + 1, minZ: -WALL_HALF, maxZ: WALL_HALF },
  { minX: WALL_HALF - 1, maxX: WALL_HALF + 2, minZ: -WALL_HALF, maxZ: WALL_HALF },
  { minX: -WALL_HALF - 2, maxX: -5, minZ: WALL_HALF - 1, maxZ: WALL_HALF + 2 },
  { minX: 5, maxX: WALL_HALF + 2, minZ: WALL_HALF - 1, maxZ: WALL_HALF + 2 },
  // the gate is barred until the very end
  { minX: -5, maxX: 5, minZ: WALL_HALF - 0.5, maxZ: WALL_HALF + 2 },
  // the well
  { minX: -1.6, maxX: 1.6, minZ: -1.6, maxZ: 1.6 },
  // the rampart tower: only the ramp gets you up
  { minX: RAMPART.x0 - 0.3, maxX: RAMPART.rampX0, minZ: RAMPART.z1 - 0.3, maxZ: RAMPART.z1 + 0.3 },
  { minX: RAMPART.rampX1, maxX: RAMPART.x1 + 0.3, minZ: RAMPART.z1 - 0.3, maxZ: RAMPART.z1 + 0.3 },
  { minX: RAMPART.x0 - 0.3, maxX: RAMPART.x0 + 0.3, minZ: RAMPART.z0, maxZ: RAMPART.z1 },
  { minX: RAMPART.x1 - 0.3, maxX: RAMPART.x1 + 0.3, minZ: RAMPART.z0, maxZ: RAMPART.z1 },
  // the garden wall, entered from the west
  { minX: 45, maxX: 46, minZ: -18, maxZ: -3 },
  { minX: 45, maxX: 46, minZ: 3, maxZ: 18 },
  { minX: 45, maxX: 74, minZ: -18.5, maxZ: -17.5 },
  { minX: 45, maxX: 74, minZ: 17.5, maxZ: 18.5 },
];

export const START = { x: 36, z: -32, yaw: Math.PI / 2 };
