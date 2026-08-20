import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF } from "../../buffs/ids"
import { stat } from "../../../../engine/effects/effect"

export const rainwhisperBaseCrit = defineClassBuff({
  id: BUFF.rainwhisperBaseCrit,
  name: "Rainwhisper (Base)",
  affectsAll: true,
  alwaysActive: true,
  duration: 9999,
  effects: [stat("critDamageBoost", 0.1)],
})
