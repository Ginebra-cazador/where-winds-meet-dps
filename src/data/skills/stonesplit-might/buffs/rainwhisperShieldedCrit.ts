import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF } from "../../buffs/ids"
import { stat } from "../../../../engine/effects/effect"

export const rainwhisperShieldedCrit = defineClassBuff({
  id: BUFF.rainwhisperShieldedCrit,
  name: "Rainwhisper (Shielded)",
  affectsAll: true,
  duration: 16,
  requiresBuffActive: BUFF.stonesplitMightShield,
  effects: [stat("critDamageBoost", 0.15)],
})
