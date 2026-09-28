import SIZES from "./modelSizes.json";
import { WORLD_SCALE } from "./story";
import { heightAt } from "./terrain";

/**
 * Set dressing for the road west. The player walks the +X axis from Vajragarh's
 * gate to the ridge above Meghadurg. All x positions are authored at story
 * spacing and multiplied by WORLD_SCALE, so scenery always lands on its beat.
 *
 * Scaling is normalised, not hand-tuned: the kit's models are authored at wildly
 * different source sizes (cliff_top_rock is 2.5× rock_smallH), so every placement
 * declares a *target height in metres* and the scale is derived from the model's
 * measured glTF bounding box. Eye height is 1.75m, so a tree at 9m towers.
 *
 * Everything here is drawn instanced (see World.tsx), so density is cheap —
 * a few thousand props cost a few dozen draw calls.
 */
export interface Placement {
  model: string;
  pos: [number, number, number];
  rotY?: number;
  scale?: number;
  /** Multiplies the model's colours — used to char the burned village. */
  tint?: string;
}

type Size = { h: number; w: number };
const sizes = SIZES as Record<string, Size>;
const sizeOf = (model: string): Size => sizes[model] ?? { h: 1, w: 1 };
const scaleFor = (model: string, targetH: number) => targetH / Math.max(sizeOf(model).h, 0.01);
const halfWidth = (model: string, scale: number) => (sizeOf(model).w * scale) / 2;

const S = WORLD_SCALE;
export const ROAD_LENGTH = 260 * S;

// target heights in metres
const H = {
  forestTree: 9,
  dryTree: 6,
  bush: 1.4,
  rock: 1.2,
  cliff: 9,
  wallSeg: 5,
  buildingWall: 4.5,
  prop: 1.2,
  pillar: 4.5,
};

/** Half-width of the walkable road; nothing may intrude inside this. */
const ROAD_CLEAR = 7;

const place = (
  model: string,
  x: number,
  z: number,
  targetH: number,
  opts: { y?: number; rotY?: number; tint?: string } = {}
): Placement => ({
  model,
  pos: [x * S, heightAt(x * S, z) + (opts.y ?? 0), z],
  rotY: opts.rotY ?? 0,
  scale: scaleFor(model, targetH),
  tint: opts.tint,
});

/** Deterministic pseudo-random so the world is identical every run. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * Scatter models beside the road. `gap` is clearance from the road edge; each
 * item is pushed out by its own footprint so wide models never intrude.
 * fromX/toX are in story units and scaled here.
 */
function scatter(
  models: string[],
  fromX: number,
  toX: number,
  count: number,
  seed: number,
  targetH: number,
  opts: { gap?: number; depth?: number; vary?: number; tint?: string } = {}
): Placement[] {
  const r = rng(seed);
  const { gap = 3, depth = 120, vary = 0.35, tint } = opts;
  const out: Placement[] = [];
  for (let i = 0; i < count; i++) {
    const model = models[Math.floor(r() * models.length)];
    const h = targetH * (1 - vary + r() * vary * 2);
    const sc = scaleFor(model, h);
    const x = (fromX + (toX - fromX) * r()) * S;
    const side = r() < 0.5 ? -1 : 1;
    // bias toward the roadside so the corridor stays legible, with a long tail
    const t = r() ** 1.7;
    const z = side * (ROAD_CLEAR + gap + halfWidth(model, sc) + depth * t);
    // sink slightly so bases don't float where the ground slopes
    out.push({ model, pos: [x, heightAt(x, z) - 0.15, z], rotY: r() * Math.PI * 2, scale: sc, tint });
  }
  return out;
}

/** A gate tower: base + mid + roof, stacked using each model's real height. */
function tower(x: number, z: number, segH: number, mid = "castle/tower-square-mid.glb"): Placement[] {
  return [
    place("castle/tower-square-base-color.glb", x, z, segH),
    place(mid, x, z, segH, { y: segH }),
    place("castle/tower-slant-roof.glb", x, z, segH, { y: segH * 2 }),
  ];
}

/** A run of wall pieces spaced by their true scaled width so they join up. */
function wallRun(x: number, fromZ: number, toZ: number, segH = H.wallSeg): Placement[] {
  const sc = scaleFor("castle/wall.glb", segH);
  const step = sizeOf("castle/wall.glb").w * sc;
  const out: Placement[] = [];
  for (let z = fromZ; z <= toZ + 0.001; z += step) out.push(place("castle/wall.glb", x, z, segH));
  return out;
}

function house(x: number, z: number, rotY: number, wall: string, roof: string): Placement[] {
  const h = H.buildingWall;
  return [place(wall, x, z, h, { rotY }), place(roof, x, z, h * 0.62, { y: h, rotY })];
}

const DRY_TREES = ["nature/tree_thin.glb", "nature/tree_palmDetailedShort.glb"];
const FOREST_TREES = [
  "nature/tree_default.glb", "nature/tree_oak.glb", "nature/tree_tall.glb",
  "nature/tree_pineRoundA.glb", "nature/tree_pineDefaultA.glb", "nature/tree_cone.glb",
  "nature/tree_default_dark.glb", "nature/tree_tall_dark.glb", "nature/tree_oak_dark.glb",
];
const MEGHA_TREES = [
  "nature/tree_default.glb", "nature/tree_oak.glb", "nature/tree_oak_fall.glb",
  "nature/tree_default_fall.glb", "nature/tree_palmDetailedShort.glb",
];
const ROCKS = ["nature/rock_smallH.glb", "nature/rock_smallI.glb"];
const CLIFFS = ["nature/cliff_blockSlope_rock.glb", "nature/cliff_blockSlope_stone.glb", "nature/cliff_blockDiagonal_rock.glb"];
const BUSHES = ["nature/plant_bush.glb", "nature/plant_bushDetailed.glb", "nature/plant_bushTriangle.glb", "nature/grass_leafs.glb", "nature/grass_leafsLarge.glb"];
const GRASS = ["nature/grass.glb", "nature/grass_leafs.glb"];
const CHAR = "#3b322b";

const WALLS = ["town/wall-window-shutters.glb", "town/wall-doorway-round.glb", "town/wall-window-glass.glb", "town/wall-doorway-square.glb", "town/wall-side.glb"];
const ROOFS = ["town/roof-gable.glb", "town/roof-high-point.glb", "town/roof-corner.glb", "town/roof-gable-detail.glb"];
const CITY_HOUSES: Placement[] = (() => {
  const r = rng(404);
  const out: Placement[] = [];
  for (let x = 173.5; x < 208; x += 2.6) {
    for (const side of [-1, 1]) {
      const z = side * (13.5 + r() * 1.5);
      out.push(...house(x, z, side > 0 ? Math.PI : 0, WALLS[Math.floor(r() * WALLS.length)], ROOFS[Math.floor(r() * ROOFS.length)]));
      // a second storey on some, so the street has a skyline
      if (r() < 0.45) {
        out.push(place(WALLS[Math.floor(r() * WALLS.length)], x, z + side * 3.5, H.buildingWall, { y: H.buildingWall * 0.9, rotY: side > 0 ? Math.PI : 0 }));
        out.push(place(ROOFS[Math.floor(r() * ROOFS.length)], x, z + side * 3.5, H.buildingWall * 0.62, { y: H.buildingWall * 1.9, rotY: side > 0 ? Math.PI : 0 }));
      }
    }
  }
  return out;
})();

export const WORLD: Placement[] = [
  // ── Vajragarh's gate, closing behind the player at the start (story x ≈ -20) ──
  ...tower(-20, -13, 9, "castle/tower-square-mid-windows.glb"),
  ...tower(-20, 13, 9, "castle/tower-square-mid-windows.glb"),
  ...wallRun(-20, -9, 9, 7),
  ...tower(-20, -34, 7),
  ...tower(-20, 34, 7),
  ...scatter(ROCKS, -24, -14, 26, 5, H.rock, { gap: 6, depth: 90 }),

  // ── The dry road out (story x -14 → 18) ──
  ...scatter(DRY_TREES, -14, 18, 90, 11, H.dryTree, { gap: 5, depth: 150 }),
  ...scatter(ROCKS, -16, 20, 220, 22, H.rock, { gap: 1.5, depth: 130 }),
  ...scatter(CLIFFS, -10, 22, 46, 33, H.cliff, { gap: 60, depth: 140 }),
  ...scatter(BUSHES, -14, 18, 120, 12, H.bush * 0.8, { gap: 1, depth: 70 }),
  place("nature/path_stone.glb", 3, 5.2, H.prop * 0.4),
  place("nature/path_stone.glb", 11, -5.4, H.prop * 0.4),
  place("nature/campfire_stones.glb", 7, 9, H.prop),

  // ── A farmhouse off the road, goat pen and one lamp (story x ≈ 7) ──
  ...house(7, -19, 0.25, "town/wall-doorway-square.glb", "town/roof-gable.glb"),
  place("town/wall-wood-block-half.glb", 9.6, -19.5, H.buildingWall * 0.55, { rotY: 0.25 }),
  place("nature/fence_simple.glb", 5, -11, H.prop, { rotY: 0 }),
  place("nature/fence_simple.glb", 7.4, -11, H.prop, { rotY: 0 }),
  place("nature/fence_simple.glb", 9.8, -11, H.prop, { rotY: 0 }),
  place("nature/fence_simple.glb", 4.2, -13.5, H.prop, { rotY: Math.PI / 2 }),
  place("nature/fence_simple.glb", 10.6, -13.5, H.prop, { rotY: Math.PI / 2 }),
  ...scatter(["nature/tree_oak_dark.glb", "nature/tree_default_dark.glb"], 2, 12, 60, 202, H.forestTree * 0.85, { gap: 4, depth: 60 }).map(
    (p) => {
      const z = Math.abs(p.pos[2]);
      return { ...p, pos: [p.pos[0], heightAt(p.pos[0], z) - 0.15, z] as [number, number, number] };
    }
  ),

  // ── The burned village (story x 16 → 27): walls charred, trees dead ──
  place("town/wall-doorway-square.glb", 17, -13, H.buildingWall, { rotY: 0.3, tint: CHAR }),
  place("town/wall-side.glb", 21, -16, H.buildingWall, { rotY: 1.5, tint: CHAR }),
  place("town/wall-window-shutters.glb", 24.5, -12.5, H.buildingWall * 0.8, { rotY: -0.2, tint: CHAR }),
  place("town/wall-wood-block-half.glb", 18, 13, H.buildingWall * 0.6, { rotY: 2.6, tint: CHAR }),
  place("town/wall-arch-top.glb", 22, 16, H.buildingWall, { rotY: 0.8, tint: CHAR }),
  place("town/wall-side.glb", 26, 13, H.buildingWall * 0.8, { rotY: 1.1, tint: CHAR }),
  place("town/wall-doorway-round.glb", 19.5, -24, H.buildingWall * 0.9, { rotY: 0.9, tint: CHAR }),
  place("town/wall-window-glass.glb", 27, 24, H.buildingWall * 0.85, { rotY: 2.2, tint: CHAR }),
  place("town/roof-gable.glb", 23, -19, H.buildingWall * 0.4, { rotY: 0.7, tint: CHAR }),
  place("nature/fence_simple.glb", 20, 9, H.prop, { rotY: 0.1, tint: CHAR }),
  place("nature/fence_simpleDiagonal.glb", 24, 9.2, H.prop, { rotY: 0.05, tint: CHAR }),
  place("nature/log_large.glb", 26, -9, H.prop, { rotY: 1.2, tint: CHAR }),
  place("nature/log_large.glb", 19, 8, H.prop * 0.8, { rotY: 2.4, tint: CHAR }),
  ...scatter(["nature/tree_thin.glb", "nature/tree_thin_dark.glb"], 15, 29, 34, 45, H.dryTree, { gap: 3, depth: 80, tint: "#2a2521" }),
  ...scatter(ROCKS, 15, 29, 90, 44, H.rock * 0.8, { gap: 1, depth: 45, tint: "#6a625a" }),

  // ── The crossroads shrine, where Chaya waits (story x ≈ 32) ──
  place("town/pillar-stone.glb", 32, 8.5, H.pillar),
  place("town/pillar-stone.glb", 32, -8.5, H.pillar),
  place("town/pillar-stone.glb", 34.5, 8.5, H.pillar * 0.8),
  place("town/pillar-stone.glb", 34.5, -8.5, H.pillar * 0.8),
  place("nature/path_stoneCircle.glb", 33.6, -12, 0.14),
  ...scatter(BUSHES, 27, 39, 90, 55, H.bush, { gap: 1, depth: 55 }),
  ...scatter(DRY_TREES, 26, 40, 40, 56, H.dryTree * 0.9, { gap: 6, depth: 90 }),

  // ── The forest track (story x 38 → 62) — dense, closes in on the road ──
  ...scatter(FOREST_TREES, 36, 63, 420, 66, H.forestTree, { gap: 1, depth: 150 }),
  ...scatter(BUSHES, 36, 63, 240, 77, H.bush, { gap: 0.5, depth: 90 }),
  ...scatter(["nature/mushroom_redTall.glb"], 40, 61, 50, 88, H.prop * 0.7, { gap: 1, depth: 26 }),
  ...scatter(ROCKS, 36, 63, 90, 89, H.rock * 0.9, { gap: 1, depth: 70 }),

  // ── The ford (story x 62 → 72) ──
  ...[-9, -4.5, 4.5, 9, 13].map((z, i) => place("nature/rock_smallI.glb", 66 + (i % 2) * 0.8, z, H.rock * 0.6, { rotY: i })),
  ...scatter(ROCKS, 60, 73, 90, 99, H.rock, { gap: 1, depth: 55 }),
  ...scatter(FOREST_TREES, 69, 88, 150, 110, H.forestTree * 0.9, { gap: 4, depth: 120 }),

  // ── The border post (story x ≈ 94) — Meghadurg's frontier gate ──
  ...tower(94, -12, 7, "castle/tower-square-mid-open.glb"),
  ...tower(94, 12, 7, "castle/tower-square-mid-open.glb"),
  ...wallRun(94, -8, 8, H.wallSeg),
  ...wallRun(94, -34, -14, H.wallSeg * 0.9),
  ...wallRun(94, 14, 34, H.wallSeg * 0.9),
  place("nature/fence_simpleHigh.glb", 89, 8, H.prop * 1.3, { rotY: 0.2 }),
  place("nature/fence_simpleHigh.glb", 89, -8, H.prop * 1.3, { rotY: -0.2 }),
  ...scatter(BUSHES, 84, 100, 70, 111, H.bush, { gap: 3, depth: 60 }),

  // ── Inside Meghadurg (story x 104 → 150) — irrigated, prosperous, alive ──
  ...scatter(GRASS, 98, 150, 400, 121, H.bush * 0.75, { gap: 0.5, depth: 110 }),
  ...scatter(MEGHA_TREES, 98, 150, 200, 132, H.forestTree, { gap: 5, depth: 150 }),
  ...house(112, -17, 0.2, "town/wall-window-glass.glb", "town/roof-gable.glb"),
  ...house(120, 18, -0.4, "town/wall-doorway-round.glb", "town/roof-corner.glb"),
  ...house(129, -19, 0.5, "town/wall-window-shutters.glb", "town/roof-high-point.glb"),
  ...house(137, 20, -0.2, "town/wall-doorway-square.glb", "town/roof-gable.glb"),
  ...house(144, -21, 0.7, "town/wall-window-glass.glb", "town/roof-corner.glb"),
  ...[121, 125, 129, 133].map((x) => place("nature/fence_simple.glb", x, 10, H.prop)),

  // ── Meghadurg's wall, with its gate standing open (story x 170) ──
  ...tower(170, -10.5, 8, "castle/tower-square-mid-door.glb"),
  ...tower(170, 10.5, 8, "castle/tower-square-mid-door.glb"),
  ...wallRun(170, -58, -14, 10),
  ...wallRun(170, 14, 64, 10),
  ...tower(170, -40, 11, "castle/tower-square-mid-windows.glb"),
  ...tower(170, 40, 11, "castle/tower-square-mid-windows.glb"),

  // ── The market street (story x 173 → 208): houses shoulder to shoulder ──
  ...CITY_HOUSES,

  // ── Shailendra's palace (story x 212 → 246): towers, no outer wall ──
  ...tower(214, -17, 8, "castle/tower-square-mid-windows.glb"),
  ...tower(214, 17, 8, "castle/tower-square-mid-windows.glb"),
  ...tower(228, -19, 11, "castle/tower-square-mid-color.glb"),
  ...tower(228, 19, 11, "castle/tower-square-mid-color.glb"),
  ...tower(244, -17, 13, "castle/tower-square-mid-windows.glb"),
  ...tower(244, 17, 13, "castle/tower-square-mid-windows.glb"),
  ...tower(252, 0, 16, "castle/tower-square-mid-windows.glb"),
  ...[216, 219, 222, 225, 229, 232, 235, 238, 241].flatMap((x) => [
    place("town/pillar-stone.glb", x, -11, H.pillar * 1.2),
    place("town/pillar-stone.glb", x, 11, H.pillar * 1.2),
  ]),
  ...wallRun(248, -30, -4, 7),
  ...wallRun(248, 4, 30, 7),
  ...scatter(["nature/tree_palmDetailedShort.glb", "nature/tree_oak_fall.glb"], 212, 246, 40, 301, H.forestTree * 0.8, { gap: 14, depth: 40 }),

  // skyline beyond: the city climbs the hill behind the palace
  ...[-60, -36, 36, 60].flatMap((z, i) => tower(262 + (i % 2) * 8, z, 14 + (i % 2) * 4, "castle/tower-square-mid-windows.glb")),
];

/** Unique models actually used, for preloading. */
export const USED_MODELS = [...new Set(WORLD.map((p) => p.model))];
