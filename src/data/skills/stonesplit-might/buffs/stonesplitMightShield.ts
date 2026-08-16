import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF, PARAM } from "../../buffs/ids"

// Formbend armor set adds +2s to the shield duration (in-game, meta build).
// Hardcoded because the calc does not yet distinguish armor-set slots.
const FORMBEND_DURATION_BONUS = 2

export const stonesplitMightShield = defineClassBuff({
  id: BUFF.stonesplitMightShield,
  name: "Stonesplit Might Shield",
  duration: (ctx) =>
    8 + (ctx.build.paramTier(PARAM.artOfResistance) >= 6 ? 6 : 0) + FORMBEND_DURATION_BONUS,
  effects: [],
})
