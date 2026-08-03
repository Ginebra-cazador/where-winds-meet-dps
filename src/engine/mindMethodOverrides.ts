import type { Inputs } from "./types"
import artsConditionals from "../data/skills/boosts/artsConditionals.json"
import boostZoneConditionals from "../data/skills/boosts/boostZoneConditionals.json"

interface CheckxinfRule {
  fn: "checkxinf"
  name: string
  then: number | string
  else: number | string
}
interface CheckxinfaRule {
  fn: "Checkxinfa"
  name: string
  tier: string
  then: number | string
  else: number | string
}
type Rule = CheckxinfRule | CheckxinfaRule

const ARTS_COND = artsConditionals as Record<string, Record<string, Rule[]>>
const BOOST_COND = boostZoneConditionals as Record<string, Record<string, Rule[]>>

export interface MindMethodOverrides {
  artsOverrides: Record<string, Record<string, number>>
  boostZoneOverrides: Record<string, Record<string, number>>
}

function resolveRule(rule: Rule, inputs: Inputs): number {
  const slot = inputs.mindMethods.find((m) => m.name === rule.name)
  let result: number | string
  if (rule.fn === "Checkxinfa") {
    result = slot?.stacks === rule.tier ? rule.then : rule.else
  } else {
    result = slot ? rule.then : rule.else
  }
  return typeof result === "number" ? result : 0
}

function resolveRules(rules: Rule[], inputs: Inputs): number {
  let total = 0
  for (const rule of rules) total += resolveRule(rule, inputs)
  return total
}

export function resolveMindMethodOverrides(inputs: Inputs): MindMethodOverrides {
  const artsOverrides: Record<string, Record<string, number>> = {}
  for (const [skill, fields] of Object.entries(ARTS_COND)) {
    for (const [field, rules] of Object.entries(fields)) {
      const delta = resolveRules(rules, inputs)
      artsOverrides[skill] ??= {}
      artsOverrides[skill][field] = delta
    }
  }

  const boostZoneOverrides: Record<string, Record<string, number>> = {}
  for (const [name, cols] of Object.entries(BOOST_COND)) {
    for (const [colKey, rules] of Object.entries(cols)) {
      const delta = resolveRules(rules, inputs)
      boostZoneOverrides[name] ??= {}
      boostZoneOverrides[name][colKey] = delta
    }
  }

  return { artsOverrides, boostZoneOverrides }
}
