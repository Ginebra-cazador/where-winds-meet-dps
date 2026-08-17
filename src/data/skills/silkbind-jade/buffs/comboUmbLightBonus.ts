import { defineClassBuff } from "../../../../definitions/skills/buffDef"
import { BUFF } from "../../buffs/ids"
import { stat } from "../../../../engine/effects/effect"

// The reference def also gates this on `minTier: 4`, but its `enabledParam`
// ("combo") names no inner way in `src/data/innerWays` — every other buff in
// this extraction that carries `minTier` pairs it with a real inner-way param
// (`frostCladNight`, `steadfastDevotion`, …). Modelled as gated on Combo's own
// window only; the unexplained tier threshold is left out rather than guessed.
export const comboUmbLightBonus = defineClassBuff({
  id: BUFF.comboUmbLightBonus,
  name: "Combo (UmbLight)",
  requiresBuffActive: BUFF.combo,
  duration: 15,
  effects: [stat("allDamageBoost", 0.1)],
})
