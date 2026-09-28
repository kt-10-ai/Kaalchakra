# Kaalchakra — The Exile's Crown

SIH prototype. A banished prince walks eleven days west to bring back an enemy king's head, and every step reveals the errand is a lie inside a lie. Story reference: `docs/Kaalchakra - The Exile's Crown - Story Bible v1.docx`.

The game has two parts:

- **Part One — The Court of Vajragarh.** One day, 100 episodes: the trial of the courier Chaya, from the last watch to the sword at sunset. Walk the fortress, question people, fill the Case Book, solve puzzles (cipher wheel, torn fragments, wax seals, ledgers, handwriting, locks, deduction, courtroom testimony), and manage trust and suspicion. Playable in the browser and in Unity.
- **Acts One & Two — the road west and Meghadurg.** Browser only.

## Run the web build

```bash
npm install
npm run dev
```

WASD walk, Shift jog, drag to look. Space advances, 1–9 choose, C opens the Case Book.

## Run the Unity build

Open `My project/` in Unity 6000.0 (URP). Run **Kaalchakra ▸ Build Court Scene** once, open `Assets/Court/Scenes/Court.unity`, press Play. Click to look (Esc frees the mouse).

The Unity build does not reimplement the story. `src/court/core.ts` is bundled into `My project/Assets/StreamingAssets/court-core.js` and executed inside Unity by the Jint JavaScript interpreter; C# only draws the world and UI and reports what the player did. **After changing any episode or engine code, run `npm run build:unity-core`.**

- `Assets/Court/Scripts/Story/StoryBridge.cs` — loads the bundle, exposes view/act as JSON.
- `Assets/Court/Scripts/CourtGame.cs` — episode triggers, staging, camera direction, saves.
- `Assets/Court/Scripts/World/` — fortress builder (from the story's layout data), procedural surfaces, characters, walker, day cycle, particles.
- `Assets/Court/Scripts/UI/` — UI Toolkit screens and the eight puzzle types.
- `Assets/Court/Editor/` — scene builder, URP setup, and the `Kaalchakra ▸ Tests` hooks used for automated playthroughs.

## Web structure

- `src/court/` — the Court: `types.ts` (schema), `dsl.ts` (authoring helpers), `episodes/ch01–ch10.ts`, `clues.ts`, `cast.ts` (people and endings), `engineCore.ts` (pure story engine), `core.ts` (headless API for Unity), plus the React/three.js scene and UI.
- `src/exile/` — the road west and Meghadurg: `story.ts`, engine, terrain, day cycle, characters, effects.
- `src/chronicle/` — collectible entries unlocked across playthroughs.

## Status

- Court: all 100 episodes written and validated; web and Unity builds both play them.
- Road and Meghadurg (Acts One & Two): web only. Act Three is not built.
- Unity UI shows only the English half of bilingual titles until Devanagari text shaping is added.
