import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF } from "../../buffs/ids"
import { stat } from "../../../../engine/effects/effect"

export const combo = defineClassBuff({
  id: BUFF.combo,
  name: "Combo",
  duration: 15,
  effects: [stat("allDamageBoost", 0.2)],
})
