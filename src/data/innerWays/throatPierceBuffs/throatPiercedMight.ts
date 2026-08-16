import { defineClassBuff } from "../../../definitions/skills/buffDef"
import { BUFF, PARAM } from "../../skills/buffs/ids"
import { stat } from "../../../engine/effects/effect"
import { matchesAnyTag } from "../../../engine/scope"

const MATCHED = ["role:moBladeVariedCombo"]

export const throatPiercedMight = defineClassBuff({
  id: BUFF.throatPiercedMight,
  name: "Throat-Pierced (Might)",
  requires: { param: PARAM.throatPierced },
  triggersFromGeneratedSkills: true,
  affectsAll: true,
  duration: 12,
  maxStacks: 5,
  stacks: () => 2,
  summary: "per stack: physPen +3 / critDmg +3% on Varied Combo, +2 / +2% elsewhere",
  effects: (ctx) => {
    if (ctx.event.kind !== "damage") return []
    const matched = matchesAnyTag(ctx.event.tags, MATCHED)
    const stacks = ctx.self.stacks
    return [
      stat("phys.penetration", (matched ? 0.03 : 0.02) * stacks),
      stat("critDamageBoost", (matched ? 0.03 : 0.02) * stacks),
    ]
  },
})
