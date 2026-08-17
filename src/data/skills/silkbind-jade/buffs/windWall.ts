import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF } from "../../buffs/ids"
import { stat } from "../../../../engine/effects/effect"

export const windWall = defineClassBuff({
  id: BUFF.windWall,
  name: "Wind Wall",
  duration: 15,
  effects: [stat("allDamageBoost", 0.4)],
})
