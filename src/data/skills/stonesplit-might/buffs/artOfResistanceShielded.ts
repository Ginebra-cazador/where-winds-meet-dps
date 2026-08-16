import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF, PARAM } from "../../buffs/ids"
import { stat } from "../../../../engine/effects/effect"

export const artOfResistanceShielded = defineClassBuff({
  id: BUFF.artOfResistanceShielded,
  name: "Art of Resistance (Shielded)",
  affectsAll: true,
  duration: 16,
  requires: { param: PARAM.artOfResistance, minTier: 6 },
  requiresBuffActive: BUFF.stonesplitMightShield,
  effects: [stat("allDamageBoost", 0.1)],
})
