import { describe, expect, it } from "vitest"
import { BuffEngine } from "../../src/engine/buffs/buffEngine"
import { makeSkill } from "../../src/engine/skill"
import { simulateTimeline } from "../../src/engine/timeline"
import { defaultInputs } from "../../src/engine/defaults"
import { defaultRotationForClass } from "../../src/engine/builtinLibrary"
import type { Inputs } from "../../src/engine/types"
import { SET_ID } from "../../src/data/sets/ids"

function tagged(name: string, tags: string[] = []) {
  return makeSkill("test", { name, tags })
}

describe("mistwillow — BuffEngine", () => {
  it("a heavy cast grants the heavy stance; a subsequent light hit then gets +10% all-damage", () => {
    const e = new BuffEngine({ armorSet: "mistwillow" }, [], [])
    e.processSkillCast("SomeHeavyHit", 0, { attackType: "heavy" })
    const lightHit = tagged("SomeLightHit", ["attack:light"])
    const r = e.calculateDamageEffects(lightHit, 0.1)
    expect(r.effects).toContainEqual({ statKey: "allDamageBoost", amount: 0.1 })
    expect(r.breakdown.mistwillow).toBe(0.1)
  })

  it("a light cast grants the light stance; a subsequent HEAVY hit gets the bonus (cross-synergy, not same-stance)", () => {
    const e = new BuffEngine({ armorSet: "mistwillow" }, [], [])
    e.processSkillCast("SomeLightHit", 0, { attackType: "light" })
    const heavyHit = tagged("SomeHeavyHit", ["attack:heavy"])
    expect(e.calculateDamageEffects(heavyHit, 0.1).breakdown.mistwillow).toBe(0.1)
    const anotherLightHit = tagged("AnotherLightHit", ["attack:light"])
    expect(e.calculateDamageEffects(anotherLightHit, 0.1).breakdown.mistwillow).toBeUndefined()
  })

  it("is inert without the mistwillow set", () => {
    const e = new BuffEngine({}, [], [])
    e.processSkillCast("SomeHeavyHit", 0, { attackType: "heavy" })
    const lightHit = tagged("SomeLightHit", ["attack:light"])
    expect(e.calculateDamageEffects(lightHit, 0.1).breakdown.mistwillow).toBeUndefined()
  })

  it("a cast tag alone grants no stance — only attack: tags and prop:isExecution classify a cast", () => {
    const e = new BuffEngine({ armorSet: "mistwillow" }, [], [])
    e.processSkillCast("cast:umbQ", 0, {})
    const heavyHit = tagged("SomeHeavyHit", ["attack:heavy"])
    expect(e.calculateDamageEffects(heavyHit, 0.1).breakdown.mistwillow).toBeUndefined()
  })

  it("an isExecution-flagged cast grants the heavy stance even without attack:heavy", () => {
    const e = new BuffEngine({ armorSet: "mistwillow" }, [], [])
    e.processSkillCast("SomeExecutionHit", 0, { isExecution: true })
    const lightHit = tagged("SomeLightHit", ["attack:light"])
    expect(e.calculateDamageEffects(lightHit, 0.1).breakdown.mistwillow).toBe(0.1)
  })

  it("a mixed cast lands both bonuses at once, so it upgrades straight to the merged Mistwillow (full 10%)", () => {
    const e = new BuffEngine({ armorSet: "mistwillow" }, [], [])
    e.processSkillCast("SomeMixedHit", 0, { attackType: "mixed" })
    expect(e.isBuffActiveAtTime("mistwillowBuff", 0.1)).toBe(true)
    const mixedHit = tagged("AnotherMixedHit", ["attack:mixed"])
    expect(e.calculateDamageEffects(mixedHit, 0.1).breakdown.mistwillow).toBeCloseTo(0.1, 10)
  })

  it("when both bonuses exist they upgrade to Mistwillow, which buffs both stances beyond the singles' staggered expiries", () => {
    const e = new BuffEngine({ armorSet: "mistwillow" }, [], [])
    e.processSkillCast("SomeHeavyHit", 0, { attackType: "heavy" })
    e.processSkillCast("SomeLightHit", 14, { attackType: "light" })
    const lightHit = tagged("AnotherLightHit", ["attack:light"])
    expect(e.calculateDamageEffects(lightHit, 20).breakdown.mistwillow).toBe(0.1)
    const heavyHit = tagged("AnotherHeavyHit", ["attack:heavy"])
    expect(e.calculateDamageEffects(heavyHit, 20).breakdown.mistwillow).toBe(0.1)
  })

  it("the single stances end the moment they upgrade to the merged buff", () => {
    const e = new BuffEngine({ armorSet: "mistwillow" }, [], [])
    e.processSkillCast("SomeHeavyHit", 0, { attackType: "heavy" })
    e.processSkillCast("SomeLightHit", 5, { attackType: "light" })
    expect(e.isBuffActiveAtTime("mistwillowBuff", 6)).toBe(true)
    expect(e.isBuffActiveAtTime("mistwillowHeavyBuff", 6)).toBe(false)
    expect(e.isBuffActiveAtTime("mistwillowLightBuff", 6)).toBe(false)
  })

  it("any corresponding hit refreshes the merged Mistwillow's shared duration", () => {
    const e = new BuffEngine({ armorSet: "mistwillow" }, [], [])
    e.processSkillCast("SomeMixedHit", 0, { attackType: "mixed" })
    e.processSkillCast("SomeHeavyHit", 10, { attackType: "heavy" })
    const lightHit = tagged("SomeLightHit", ["attack:light"])
    expect(e.calculateDamageEffects(lightHit, 20).breakdown.mistwillow).toBe(0.1)
  })

  it("a refresh within 2 seconds of the last application is skipped", () => {
    const e = new BuffEngine({ armorSet: "mistwillow" }, [], [])
    e.processSkillCast("SomeMixedHit", 0, { attackType: "mixed" })
    e.processSkillCast("AnotherMixedHit", 1, { attackType: "mixed" })
    const mixedHit = tagged("ProbeMixedHit", ["attack:mixed"])
    expect(e.calculateDamageEffects(mixedHit, 15.5).breakdown.mistwillow).toBeUndefined()
  })

  it("a refresh 2 seconds or more after the last application extends the duration", () => {
    const e = new BuffEngine({ armorSet: "mistwillow" }, [], [])
    e.processSkillCast("SomeMixedHit", 0, { attackType: "mixed" })
    e.processSkillCast("AnotherMixedHit", 2.5, { attackType: "mixed" })
    const mixedHit = tagged("ProbeMixedHit", ["attack:mixed"])
    expect(e.calculateDamageEffects(mixedHit, 16).breakdown.mistwillow).toBeCloseTo(0.1, 10)
  })

  it("the 2-second throttle also gates a single stance's refresh", () => {
    const throttled = new BuffEngine({ armorSet: "mistwillow" }, [], [])
    throttled.processSkillCast("SomeLightHit", 0, { attackType: "light" })
    throttled.processSkillCast("AnotherLightHit", 1, { attackType: "light" })
    const heavyHit = tagged("SomeHeavyHit", ["attack:heavy"])
    expect(throttled.calculateDamageEffects(heavyHit, 15.5).breakdown.mistwillow).toBeUndefined()

    const refreshed = new BuffEngine({ armorSet: "mistwillow" }, [], [])
    refreshed.processSkillCast("SomeLightHit", 0, { attackType: "light" })
    refreshed.processSkillCast("AnotherLightHit", 3, { attackType: "light" })
    expect(refreshed.calculateDamageEffects(heavyHit, 15.5).breakdown.mistwillow).toBe(0.1)
  })
})

describe("mistwillow — end to end through simulateTimeline", () => {
  it("selecting Mistwillow changes DPS relative to no set, without crashing", () => {
    const rotation = defaultRotationForClass("bellstrikeUmbra")!
    const without: Inputs = {
      ...defaultInputs,
      classId: "bellstrikeUmbra",
      activeCustomRotation: rotation,
    }
    const withMistwillow: Inputs = {
      ...defaultInputs,
      classId: "bellstrikeUmbra",
      activeCustomRotation: rotation,
      set: SET_ID.mistwillow,
    }
    const before = simulateTimeline(without)
    const after = simulateTimeline(withMistwillow)
    expect(before.warnings.some((w) => /error|exception/i.test(w))).toBe(false)
    expect(after.warnings.some((w) => /error|exception/i.test(w))).toBe(false)
    expect(after.dps).toBeGreaterThan(0)
    expect(after.dps).not.toBeCloseTo(before.dps, 3)
  })
})
