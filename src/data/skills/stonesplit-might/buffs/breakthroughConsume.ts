import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF } from "../../buffs/ids"
import { PROP } from "../../ids"

// Breakthrough itself is opened as a timed window by Mo Blade Q's `triggersBuffs`
// (a consume grant only scopes to the casting skill, never a lasting window).
// This def's job is the other half: drain Drumbeat so its +15% does not stack on
// top of Breakthrough's +42%. Drumbeat's effect is stack-scaled, so spending its
// one stack to zero suppresses it.
export const breakthroughConsume = defineClassBuff({
  id: BUFF.breakthroughConsume,
  name: "Breakthrough (Consume)",
  affectsAll: true,
  duration: 0,
  perCastConsume: {
    property: PROP.consumesDrumbeat,
    from: BUFF.drumbeat,
  },
  summary: "Mo Blade Q drains Drumbeat so it doesn't stack with Breakthrough",
  effects: [],
})
