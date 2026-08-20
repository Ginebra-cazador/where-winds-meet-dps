import { defineInnerWay } from "../../definitions/innerWays/innerWayDef"
import { INNER_WAY_ID } from "./ids"

export const exquisiteScenery = defineInnerWay({
  id: INNER_WAY_ID.exquisiteScenery,
  name: "Exquisite Scenery",
  selectableTiers: [6, 5, 4],
  panelStats: { critRate: 0.086 },
  tiers: {
    5: { panelStats: { critDamageBoost: 0.044 } },
  },
})
