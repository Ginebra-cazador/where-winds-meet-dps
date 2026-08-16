import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF, PARAM } from "../../buffs/ids"
import { stat } from "../../../../engine/effects/effect"

// Formbend armor set adds +2s to Breakthrough duration (in-game, meta build).
// Hardcoded because the calc does not yet distinguish armor-set slots.
const FORMBEND_DURATION_BONUS = 2

export const breakthrough = defineClassBuff({
  id: BUFF.breakthrough,
  name: "Breakthrough",
  duration: (ctx) =>
    12 + (ctx.build.paramTier(PARAM.artOfResistance) >= 6 ? 6 : 0) + FORMBEND_DURATION_BONUS,
  summary: "charged: allDamageBoost +42%",
  effects: [stat("allDamageBoost", 0.42)],
})
