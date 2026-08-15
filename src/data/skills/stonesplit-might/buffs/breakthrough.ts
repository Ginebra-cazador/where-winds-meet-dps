import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF } from "../../buffs/ids"
import { CAST } from "../../ids"
import { stat } from "../../../../engine/effects/effect"

export const breakthrough = defineClassBuff({
  id: BUFF.breakthrough,
  name: "Breakthrough",
  triggeredBy: [CAST.moBladeQ, CAST.moBladeQPrepull],
  affectsProperty: "isCharged",
  duration: 12,
  summary: "charged: allDamageBoost +42%",
  effects: [stat("allDamageBoost", 0.42)],
})
