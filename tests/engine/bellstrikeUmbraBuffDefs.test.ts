import { describe, expect, it } from "vitest"
import { BuffEngine } from "../../src/engine/buffs/buffEngine"
import { mechanicBuffDefs } from "../../src/engine/buffs/data"
import { receivesForSkill } from "../../src/engine/buffs/catalog"
import { makeSkill } from "../../src/engine/skill"
import { builtinSkillsForClass } from "../../src/engine/builtinLibrary"
import type { StatKey } from "../../src/engine/statRegistry"

const TRACKED: StatKey[] = ["affinityDamageBoost", "phys.penetration", "bellstrike.penetration"]

function skill(name: string) {
  return makeSkill("test", { name, tags: [] })
}

function sumsFor(params: Record<string, unknown>, name: string) {
  const e = new BuffEngine(params, [], mechanicBuffDefs())
  const r = e.calculateDamageEffects(skill(name), 0)
  return Object.fromEntries(
    TRACKED.map((k) => [
      k,
      r.effects.filter((x) => x.statKey === k).reduce((a, b) => a + b.amount, 0),
    ]),
  )
}

const SWORD_HORIZON = { swordHorizon: true, swordHorizonTier: 6 }

describe("Bellstrike Umbra bleed buff-defs — BuffEngine unit", () => {
  it("Bleed Detonation gets both the affinity-damage and bleed-penetration terms", () => {
    expect(sumsFor(SWORD_HORIZON, "Bleed Detonation")).toEqual({
      affinityDamageBoost: 0.18,
      "phys.penetration": 0.15,
      "bellstrike.penetration": 0.15,
    })
  })

  it("Combustion gets only the affinity-damage term, never the bleed penetration", () => {
    expect(sumsFor(SWORD_HORIZON, "Combustion")).toEqual({
      affinityDamageBoost: 0.18,
      "phys.penetration": 0,
      "bellstrike.penetration": 0,
    })
  })

  it("a non-bleed skill (Sword Martial Q) gets neither term", () => {
    expect(sumsFor(SWORD_HORIZON, "Sword Martial Q")).toEqual({
      affinityDamageBoost: 0,
      "phys.penetration": 0,
      "bellstrike.penetration": 0,
    })
  })

  it("with no swordHorizon param, neither Umbra buff is seeded (alwaysActive gated off)", () => {
    expect(sumsFor({}, "Bleed Detonation")).toEqual({
      affinityDamageBoost: 0,
      "phys.penetration": 0,
      "bellstrike.penetration": 0,
    })
  })
})

describe("Bellstrike Umbra bleed buff-defs — Skill Editor RECEIVES visibility", () => {
  it("surfaces both buff ids for the Bleed Detonation skill and neither for Sword Martial Q", () => {
    const detonation = builtinSkillsForClass("bellstrikeUmbra").find(
      (s) => s.name === "Bleed Detonation",
    )
    const swordQ = builtinSkillsForClass("bellstrikeUmbra").find(
      (s) => s.name === "Sword Martial Q",
    )
    expect(detonation).toBeTruthy()
    expect(swordQ).toBeTruthy()

    const detonationIds = receivesForSkill(detonation!).map((r) => r.id)
    expect(detonationIds).toContain("bellstrikeUmbraBleedPen")
    expect(detonationIds).toContain("bellstrikeUmbraBleedingDamage")

    const swordQIds = receivesForSkill(swordQ!).map((r) => r.id)
    expect(swordQIds).not.toContain("bellstrikeUmbraBleedPen")
    expect(swordQIds).not.toContain("bellstrikeUmbraBleedingDamage")
  })

  it("flags the Umbra bleed buffs as spec mechanics, split out from ordinary buff rows", () => {
    const detonation = builtinSkillsForClass("bellstrikeUmbra").find(
      (s) => s.name === "Bleed Detonation",
    )
    const detRows = receivesForSkill(detonation!, "bellstrikeUmbra")
    const specIds = detRows.filter((r) => r.isSpecMechanic).map((r) => r.id)
    expect(specIds).toEqual(
      expect.arrayContaining(["bellstrikeUmbraBleedPen", "bellstrikeUmbraBleedingDamage"]),
    )
    expect(specIds).not.toContain("soulShaken")
    const soulShakenRow = detRows.find((r) => r.id === "soulShaken")
    expect(soulShakenRow).toBeTruthy()
    expect(soulShakenRow!.isSpecMechanic).toBe(false)
  })
})
