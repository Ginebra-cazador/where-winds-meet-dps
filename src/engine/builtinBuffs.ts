// River Flow and Spear Special Cooldown carry no stat effects on purpose —
// they are gates consumed by the timeline (HitVariant swaps, trigger
// conditions), not `{statKey, amount}` effects.
import type { Buff } from "./buff"
import { CROSSWIND_MAX_CHARGES } from "./buffs/crosswind"

export const RIVER_FLOW_DURATION_FRAMES = 900
export const SPEAR_SPECIAL_COOLDOWN_FRAMES = 690

export const ZENITH_SMOLDER_EXTEND_FRAMES = 600

export const RIVER_FLOW_BUFF_ID = "buff-bellstrikeUmbra-river-flow"
export const SPEAR_SPECIAL_COOLDOWN_BUFF_ID = "buff-bellstrikeUmbra-spear-special-cooldown"
export const ZENITH_BAR_BUFF_ID = "buff-bellstrikeUmbra-zenith-bar"
export const ZENITH_DETONATION_BUFF_ID = "buff-bellstrikeUmbra-zenith-detonation"
export const ZENITH_DETONATION_FRAMES = 1

const BUILTIN_BUFFS: Record<string, Buff[]> = {
  bellstrikeUmbra: [
    {
      id: RIVER_FLOW_BUFF_ID,
      classId: "bellstrikeUmbra",
      name: "River Flow",
      scope: "player",
      activation: "triggered",
      durationFrames: RIVER_FLOW_DURATION_FRAMES,
      effects: [],
      maxStacks: 1,
      stackScaling: "flat",
      createdAt: "2026-07-30T00:00:00.000Z",
      updatedAt: "2026-07-30T00:00:00.000Z",
    },
    {
      id: SPEAR_SPECIAL_COOLDOWN_BUFF_ID,
      classId: "bellstrikeUmbra",
      name: "Spear Special Cooldown",
      scope: "player",
      activation: "triggered",
      durationFrames: SPEAR_SPECIAL_COOLDOWN_FRAMES,
      effects: [],
      maxStacks: 1,
      stackScaling: "flat",
      createdAt: "2026-07-30T00:00:00.000Z",
      updatedAt: "2026-07-30T00:00:00.000Z",
    },
    {
      id: ZENITH_BAR_BUFF_ID,
      classId: "bellstrikeUmbra",
      name: "Zenith Bar",
      scope: "player",
      activation: "permanent",
      durationFrames: 0,
      effects: [],
      maxStacks: CROSSWIND_MAX_CHARGES,
      stackScaling: "flat",
      createdAt: "2026-07-31T00:00:00.000Z",
      updatedAt: "2026-07-31T00:00:00.000Z",
    },
    {
      id: ZENITH_DETONATION_BUFF_ID,
      classId: "bellstrikeUmbra",
      name: "Zenith Detonation",
      scope: "player",
      activation: "triggered",
      durationFrames: ZENITH_DETONATION_FRAMES,
      effects: [],
      maxStacks: 1,
      stackScaling: "flat",
      createdAt: "2026-07-30T00:00:00.000Z",
      updatedAt: "2026-07-30T00:00:00.000Z",
    },
  ],
}

export function builtinBuffsForClass(classId: string): Buff[] {
  return BUILTIN_BUFFS[classId] ?? []
}
