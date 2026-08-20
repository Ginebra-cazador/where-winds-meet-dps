import { defineInnerWay } from "../../definitions/innerWays/innerWayDef"
import { INNER_WAY_ID } from "./ids"

// The T5 Bellstrike DMG bonus (+3% in-game) has no panel path — the only
// attribute-damage key, `attributeDamageBoost`, follows the character's primary
// attribute (Stonesplit for Might), so it cannot carry a Bellstrike-specific
// bonus. Only Max Bellstrike is representable, and it is inert for a Stonesplit
// class anyway.
export const adaptiveSteel = defineInnerWay({
  id: INNER_WAY_ID.adaptiveSteel,
  name: "Adaptive Steel",
  selectableTiers: [6, 5, 4],
  panelStats: { "bellstrike.max": 36.2 },
})
