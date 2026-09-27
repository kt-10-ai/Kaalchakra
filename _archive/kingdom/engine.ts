import { STAGES, type ResourceType } from "./data";
import type { Flags } from "../storyline/story";

const BUILD_COST = 4;
const RESOLVE_COST_PER_SEVERITY = 2;
const PRIMARY: ResourceType = "textiles"; // Vijayanagara's historical export strength

export interface KingdomState {
  stageIndex: number;
  prestige: number;
  resources: Record<ResourceType, number>;
  builtInfrastructure: number;
  resolvedConflicts: Set<string>;
  log: string[];
}

export type KingdomAction =
  | { type: "TRADE"; give: ResourceType; take: ResourceType; amount: number }
  | { type: "BUILD" }
  | { type: "RESOLVE_CONFLICT"; conflictId: string }
  | { type: "GAMBIT"; conflictId: string; roll?: number } // roll injectable for tests
  | { type: "ADVANCE" };

const GAMBIT_COST_PER_SEVERITY = 1;
const GAMBIT_SUCCESS_CHANCE = 0.5;

export function createKingdomState(founderFlags: Flags): KingdomState {
  const { renown, piety, cunning } = founderFlags.stats;
  return {
    stageIndex: 0,
    prestige: 10,
    resources: {
      grain: 3 + Math.floor(piety / 3),
      textiles: 3,
      metal: 3 + Math.floor(cunning / 3),
      luxury: 3 + Math.floor(renown / 3),
    },
    builtInfrastructure: 0,
    resolvedConflicts: new Set(),
    log: [
      `You take the throne beside Bukka in ${STAGES[0].year} CE. What you carry with you from the river: ${
        founderFlags.approach === "diplomacy" ? "alliances built on marriage and temple patronage" : "a reputation for strength"
      }.`,
    ],
  };
}

export function currentStage(state: KingdomState) {
  return STAGES[state.stageIndex];
}

export function isKingdomOver(state: KingdomState) {
  return state.stageIndex >= STAGES.length;
}

function clone(state: KingdomState): KingdomState {
  return {
    ...state,
    resources: { ...state.resources },
    resolvedConflicts: new Set(state.resolvedConflicts),
    log: [...state.log],
  };
}

export function canAfford(state: KingdomState, type: ResourceType, amount: number) {
  return state.resources[type] >= amount;
}

export function applyKingdomAction(state: KingdomState, action: KingdomAction): KingdomState {
  const stage = currentStage(state);
  const next = clone(state);

  switch (action.type) {
    case "TRADE": {
      const { give, take, amount } = action;
      if (give === take || !canAfford(next, give, amount)) return state;
      next.resources[give] -= amount;
      next.resources[take] += amount;
      next.log.push(`Traded ${amount} ${give} for ${amount} ${take} along the river ports.`);
      return next;
    }

    case "BUILD": {
      if (!canAfford(next, PRIMARY, BUILD_COST)) return state;
      next.resources[PRIMARY] -= BUILD_COST;
      next.builtInfrastructure += 1;
      next.prestige += 1;
      next.log.push("Invested in infrastructure — future textile income and prestige increased.");
      return next;
    }

    case "RESOLVE_CONFLICT": {
      const conflict = stage.conflicts.find((c) => c.id === action.conflictId);
      if (!conflict || next.resolvedConflicts.has(conflict.id)) return state;
      const cost = conflict.severity * RESOLVE_COST_PER_SEVERITY;
      if (!canAfford(next, PRIMARY, cost)) return state;
      next.resources[PRIMARY] -= cost;
      next.resolvedConflicts.add(conflict.id);
      next.prestige += conflict.severity;
      next.log.push(`Resolved "${conflict.label}" — +${conflict.severity} prestige.`);
      return next;
    }

    case "GAMBIT": {
      const conflict = stage.conflicts.find((c) => c.id === action.conflictId);
      if (!conflict || conflict.severity < 3 || next.resolvedConflicts.has(conflict.id)) return state;
      const cost = conflict.severity * GAMBIT_COST_PER_SEVERITY;
      if (!canAfford(next, PRIMARY, cost)) return state;
      next.resources[PRIMARY] -= cost;

      const roll = action.roll ?? Math.random();
      if (roll < GAMBIT_SUCCESS_CHANCE) {
        next.resolvedConflicts.add(conflict.id);
        next.prestige += conflict.severity;
        next.log.push(`Gambit paid off — "${conflict.label}" resolved at half cost. +${conflict.severity} prestige.`);
      } else {
        next.prestige -= 1;
        next.log.push(`Gambit failed — the resources spent on "${conflict.label}" bought nothing. -1 prestige.`);
      }
      return next;
    }

    case "ADVANCE": {
      for (const conflict of stage.conflicts) {
        if (!next.resolvedConflicts.has(conflict.id)) {
          next.prestige -= conflict.severity;
          next.log.push(
            `Left "${conflict.label}" unresolved (${conflict.severity} prestige lost). What really happened: ${conflict.historicalOutcome}`
          );
        }
      }

      next.resources[PRIMARY] += 3 + next.builtInfrastructure;
      next.resources.grain += 1;
      next.stageIndex += 1;

      if (next.stageIndex < STAGES.length) {
        next.log.push(`The era turns — it is now ${STAGES[next.stageIndex].year} CE.`);
      }

      return next;
    }

    default:
      return state;
  }
}

export { PRIMARY };
