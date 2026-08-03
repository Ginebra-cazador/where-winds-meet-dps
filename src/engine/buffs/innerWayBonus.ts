// Port of `zo()` (`.tmp/site/deobfuscated.js` ~L7743-65):
// `buffBonus += Ss[key].allDamageBonus` for every selected inner way.
import type { BuffEngine } from "./buffEngine"
import { SITE_PARAM_TO_INNER_WAY } from "./paramMap"

const INNER_WAY_ALL_DAMAGE_BONUS: Readonly<Record<string, number>> = {
  insightfulStrike: 0.015, // site's Ss.insightfulStrike.allDamageBonus (~L6906)
}

// `insightfulStrike`'s site param is deliberately unmapped in `paramMap.ts`
// (mapping it would re-trigger the `concentration` buff's already-covered
// `statModifiers`), so it's checked directly off `mindMethods` here instead.
export function innerWayAllDamageBoost(
  buffEngine: BuffEngine,
  mindMethods: readonly { name: string }[],
): number {
  let sum = 0
  for (const param of Object.keys(SITE_PARAM_TO_INNER_WAY)) {
    if (buffEngine.paramOn(param)) sum += INNER_WAY_ALL_DAMAGE_BONUS[param] ?? 0
  }
  if (mindMethods.some((m) => m.name === "Insightful Strike"))
    sum += INNER_WAY_ALL_DAMAGE_BONUS.insightfulStrike ?? 0
  return sum
}
