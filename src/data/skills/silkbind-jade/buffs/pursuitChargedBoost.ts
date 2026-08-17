import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF } from "../../buffs/ids"
import { stat } from "../../../../engine/effects/effect"

export const pursuitChargedBoost = defineClassBuff({
  id: BUFF.pursuitChargedBoost,
  name: "Spring Shock",
  duration: 15,
  maxStacks: 5,
  stacksPerHit: true,
  summary: "+4.0% all/stack",
  effects: (ctx) => (ctx.self.stacks > 0 ? [stat("allDamageBoost", 0.04 * ctx.self.stacks)] : []),
})
