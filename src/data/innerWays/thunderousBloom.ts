import { defineInnerWay } from "../../definitions/innerWays/innerWayDef"
import { INNER_WAY_ID } from "./ids"
import { PARAM } from "../skills/buffs/ids"
import { thunderousBloomBuffDef } from "./thunderousBloomBuffs"

export const thunderousBloom = defineInnerWay({
  id: INNER_WAY_ID.thunderousBloom,
  name: "Thunderous Bloom",
  selectableTiers: [6, 5],
  buffParam: PARAM.thunderousBloom,
  buffDefs: [thunderousBloomBuffDef],
})
