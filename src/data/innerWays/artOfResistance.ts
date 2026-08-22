import { defineInnerWay } from "../../definitions/innerWays/innerWayDef"
import { INNER_WAY_ID } from "./ids"
import { PARAM } from "../skills/buffs/ids"
import { artOfResistanceShielded } from "./artOfResistanceBuffs"

export const artOfResistance = defineInnerWay({
  id: INNER_WAY_ID.artOfResistance,
  name: "Art of Resistance",
  selectableTiers: [6, 5, 4],
  buffParam: PARAM.artOfResistance,
  panelStats: { "primaryAttr.min": 12.7, "primaryAttr.max": 25.3 },
  tiers: {
    5: { panelStats: { "primaryAttr.penetration": 0.06 } },
  },
  buffDefs: [artOfResistanceShielded],
})
