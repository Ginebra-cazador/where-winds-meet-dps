import { defineClassBuff } from "../../../definitions/skills/buffDef"
import { BUFF, PARAM } from "../../skills/buffs/ids"
import { CAST } from "../../skills/ids"
import { stat } from "../../../engine/effects/effect"

// Per-stack magnitude is uniform 0.03 — throat-pierce is tier 5/6, both past the
// tier-3 threshold below which the game lowers it. Deflect refreshes to the
// 5-stack max; the Varied Combo casts and their generated Ground Slam each add 2
// (hence `triggersFromGeneratedSkills`). The reference's once-per-15s gate on the
// Deflect refresh is unmodeled: no data field limits one trigger source without
// also throttling the others.
export const throatPiercedMight = defineClassBuff({
  id: BUFF.throatPiercedMight,
  name: "Throat-Pierced (Might)",
  requires: { param: PARAM.throatPierced },
  triggersFromGeneratedSkills: true,
  affectsAll: true,
  duration: 12,
  maxStacks: 5,
  stacks: (ctx) => (ctx.event.kind === "cast" && ctx.event.castTag === CAST.deflect ? 5 : 2),
  summary: "per stack: physPen +3 / critDmg +3% (max 5)",
  effects: (ctx) =>
    ctx.event.kind === "damage"
      ? [
          stat("phys.penetration", 0.03 * ctx.self.stacks),
          stat("critDamageBoost", 0.03 * ctx.self.stacks),
        ]
      : [],
})
