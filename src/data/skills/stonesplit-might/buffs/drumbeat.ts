import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF } from "../../buffs/ids"
import { CAST } from "../../ids"
import { stat } from "../../../../engine/effects/effect"

export const drumbeat = defineClassBuff({
  id: BUFF.drumbeat,
  name: "Drumbeat",
  triggeredBy: [
    CAST.spearHeavy,
    CAST.spearHeavy1Hit,
    CAST.spearHeavy1HitPrepull,
    CAST.spearQ,
    CAST.spearQ0HitCancel,
    CAST.spearQ5HitCancel,
    CAST.spearQPrepull,
  ],
  affectsProperty: "isCharged",
  duration: 6,
  summary: "charged: allDamageBoost +15%",
  effects: [stat("allDamageBoost", 0.15)],
})
