import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF } from "../../buffs/ids"
import { stat } from "../../../../engine/effects/effect"

export const windWallPursuit = defineClassBuff({
  id: BUFF.windWallPursuit,
  name: "Wind Wall (Pursuit)",
  duration: 15,
  effects: [stat("allDamageBoost", 0.1)],
})
