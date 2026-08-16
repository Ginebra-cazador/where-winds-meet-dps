import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF } from "../../buffs/ids"
import { stat } from "../../../../engine/effects/effect"

export const breakthrough = defineClassBuff({
  id: BUFF.breakthrough,
  name: "Breakthrough",
  duration: 12,
  summary: "charged: allDamageBoost +42%",
  effects: [stat("allDamageBoost", 0.42)],
})
