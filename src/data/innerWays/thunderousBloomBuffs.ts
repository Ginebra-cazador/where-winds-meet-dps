import { defineBuff } from "../../definitions/skills/buffDef"
import { BUFF, PARAM } from "../skills/buffs/ids"
import { stat } from "../../engine/effects/effect"

// The guide's real mechanic spends a charge pool (5 charges from any martial
// skill, consumed by Light/Heavy Attack, Pursuit or a Ballistic Skill). The
// sim has no resource model — exactly like stamina consumption is already
// left out — so charges are treated as always available, and reach is scoped
// by `receives` on the skills that would consume one instead.
export const thunderousBloomBuffDef = defineBuff({
  id: BUFF.thunderousBloom,
  name: "Thunderous Bloom",
  requires: { param: PARAM.thunderousBloom },
  alwaysActive: true,
  duration: 9999,
  effects: [stat("allDamageBoost", 0.15)],
})
