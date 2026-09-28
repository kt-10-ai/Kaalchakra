import { CAST } from "./cast";
import { EPISODES } from "./episodes";
import { courtGround, PLACES, type Slot } from "./locations";
import type { CharId } from "./types";

export interface Staged extends Slot {
  id: CharId;
  y: number;
}

/**
 * Who stands where while episode `index` is current: its cast at its
 * location (named slots first), everyone else at home.
 */
export function stage(index: number): Map<CharId, Staged> {
  const ep = EPISODES[index];
  const out = new Map<CharId, Staged>();
  const used = new Map<string, number>();

  const put = (id: CharId, loc: keyof typeof PLACES) => {
    const place = PLACES[loc];
    let slot = place.fixed?.[id];
    if (!slot) {
      const n = used.get(loc) ?? 0;
      slot = place.slots[n % place.slots.length];
      used.set(loc, n + 1);
    }
    out.set(id, { ...slot, id, y: courtGround(slot.x, slot.z) + (slot.y ?? 0) });
  };

  const inScene = new Set<CharId>(ep ? ep.cast.filter((c) => c !== "narrator" && c !== "arun") : []);
  if (ep) inScene.forEach((id) => put(id, ep.location));
  (Object.keys(CAST) as (keyof typeof CAST)[]).forEach((id) => {
    if (!inScene.has(id)) put(id, CAST[id].home);
  });
  return out;
}

/** The hour of the day while episode `index` is current. */
export function hourFor(index: number, chapters: { n: number; hour: number }[]) {
  if (index >= 98) return 29.4; // the gate, at the next dawn
  if (index === 97) return 22.5;
  const ep = EPISODES[Math.min(index, EPISODES.length - 1)];
  if (!ep) return 4.6;
  const ch = chapters.find((c) => c.n === ep.chapter) ?? chapters[0];
  const next = chapters.find((c) => c.n === ep.chapter + 1)?.hour ?? ch.hour + 0.8;
  const inChapter = EPISODES.filter((e) => e.chapter === ep.chapter);
  const k = inChapter.indexOf(ep) / Math.max(1, inChapter.length);
  return ch.hour + k * (next - ch.hour);
}
