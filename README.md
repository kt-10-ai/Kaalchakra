# Kaalchakra

SIH prototype: the subcontinent, 1200–1350 CE, as five regions whose histories run in parallel. Choose a region, steer it through four real eras, trade with neighbors, invest, and decide which conflicts to fight — then see your outcome against what actually happened.

## Run it

```bash
npm install
npm run dev
```

## Structure

- `src/engine/` — the "history engine": types, historical dataset (`data.ts`), and pure game-logic functions (`engine.ts`). No React, no DOM. This is the part meant to survive the move to mobile.
- `src/components/` — the web UI (Landing, region picker, game screen, end screen), built with React + Tailwind v4.
- `src/App.tsx` — screen-state wiring.

## Porting to mobile (React Native / Expo)

`src/engine/` has zero web dependencies, so it can be copied as-is into a React Native project. Only `src/components/` needs to be rebuilt against native primitives (`View`/`Text`/`Pressable` instead of `div`/`button`), reusing the same `dispatch(action)` contract against the same engine functions.

## Extending the dataset

Each region in `src/engine/data.ts` defines 4 stages (1200/1250/1300/1350) with a blurb, tech list, and 1+ conflicts (severity, description, and the real historical outcome shown if left unresolved), plus a `historicalBaselinePrestige` and `historicalSummary` used on the end screen. Adding a new region or era means adding to this data — the engine and UI are generic over it.
