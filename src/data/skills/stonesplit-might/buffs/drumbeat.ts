import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF } from "../../buffs/ids"
import { stat } from "../../../../engine/effects/effect"

export const drumbeat = defineClassBuff({
  id: BUFF.drumbeat,
  name: "Drumbeat",
  duration: 6,
  maxStacks: 1,
  summary: "charged: allDamageBoost +15%",
  effects: [stat("allDamageBoost", 0.15)],
})
