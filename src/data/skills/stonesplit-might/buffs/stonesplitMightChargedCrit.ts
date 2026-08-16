import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF } from "../../buffs/ids"
import { stat } from "../../../../engine/effects/effect"

export const stonesplitMightChargedCrit = defineClassBuff({
  id: BUFF.stonesplitMightChargedCrit,
  name: "Stonesplit Might Charged Crit",
  alwaysActive: true,
  duration: 9999,
  summary: "charged/varied: critDamageBoost +10%, directCritRate +24%",
  effects: [stat("critDamageBoost", 0.1), stat("directCritRate", 0.24)],
})
