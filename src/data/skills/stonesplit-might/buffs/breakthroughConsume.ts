import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF } from "../../buffs/ids"
import { PROP } from "../../ids"

export const breakthroughConsume = defineClassBuff({
  id: BUFF.breakthroughConsume,
  name: "Breakthrough (Consume)",
  affectsAll: true,
  duration: 0,
  perCastConsume: {
    property: PROP.consumesDrumbeat,
    preferredFrom: [BUFF.breakthrough],
    from: BUFF.drumbeat,
    grants: [
      { whenConsumedFrom: BUFF.drumbeat, buffIds: [BUFF.breakthrough] },
      { whenConsumedFrom: BUFF.breakthrough, buffIds: [BUFF.breakthrough] },
    ],
  },
  summary: "Mo Blade Q consumes Drumbeat/Breakthrough and (re)grants Breakthrough",
  effects: [],
})
