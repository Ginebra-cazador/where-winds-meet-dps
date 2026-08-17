// One assist attack every 0.30s whatever the drone's size (in-game,
// 2026-08-17). The variant sets how many land, so the window follows from the
// count instead of being authored per variant.
export const DRONE_INTERVAL_FRAMES = 18

export function droneWindowFrames(ticks: number): number {
  return ticks * DRONE_INTERVAL_FRAMES + 1
}

// Per TICK, despite the workbook row calling itself a per-second rate: its
// rotation spends a constant 10 units per throw against a drone lasting ~7s,
// so a unit is one assist attack (workbook v1.2, 2026-08-14). Every variant
// shares these — only the count differs.
export const DRONE_TICK = {
  physMultiplier: 1.174955,
  physFixed: 324.3,
  attributeMultiplier: 1.762375,
  attributeFixed: 177.1,
}
