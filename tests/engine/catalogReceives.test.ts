import { describe, expect, it } from "vitest"
import { receivesForSkill } from "../../src/engine/buffs/catalog"
import { builtinSkillsForClass } from "../../src/engine/builtinLibrary"
import { defaultInputs } from "../../src/engine/defaults"
import { defaultCombatSettings, type Inputs } from "../../src/engine/types"
import type { Skill } from "../../src/engine/skill"

const CLASS = "bellstrikeUmbra"
const RETENTION_ROW_ID = "dotRetention:debuff-bellstrikeUmbra-bleed-tick"

function findSkill(name: string): Skill {
  const s = builtinSkillsForClass(CLASS).find((sk) => sk.name === name)
  if (!s) throw new Error(`missing built-in skill: ${name}`)
  return s
}

function inputsWithSwordHorizon(tier: string | null): Inputs {
  return {
    ...defaultInputs,
    classId: CLASS,
    mindMethods: [
      tier ? { name: "Sword Horizon", stacks: tier } : { name: "", stacks: "" },
      { name: "", stacks: "" },
      { name: "", stacks: "" },
      { name: "", stacks: "" },
    ],
  }
}

describe("catalog receives — Sword Horizon retention on Bleed Tick", () => {
  it("Bleed Tick carries the retention row as an ordinary (non-spec-mechanic) buff", () => {
    const bleedTick = findSkill("Bleed Tick")
    const rows = receivesForSkill(bleedTick, CLASS, inputsWithSwordHorizon("tier 6"))
    const row = rows.find((r) => r.id === RETENTION_ROW_ID)
    expect(row).toBeTruthy()
    expect(row!.isSpecMechanic).toBe(false)
  })

  it("is active at Sword Horizon tier 6, inactive at tier 5, inactive with no Sword Horizon at all", () => {
    const bleedTick = findSkill("Bleed Tick")
    const at6 = receivesForSkill(bleedTick, CLASS, inputsWithSwordHorizon("tier 6"))
    expect(at6.find((r) => r.id === RETENTION_ROW_ID)!.active).toBe(true)

    const at5 = receivesForSkill(bleedTick, CLASS, inputsWithSwordHorizon("tier 5"))
    expect(at5.find((r) => r.id === RETENTION_ROW_ID)!.active).toBe(false)

    const none = receivesForSkill(bleedTick, CLASS, inputsWithSwordHorizon(null))
    expect(none.find((r) => r.id === RETENTION_ROW_ID)!.active).toBe(false)
  })

  it("does not appear on Bleed Detonation or Crosswind Blade (appliers, not the DoT skill)", () => {
    const inputs = inputsWithSwordHorizon("tier 6")
    const detonation = receivesForSkill(findSkill("Bleed Detonation"), CLASS, inputs)
    const crosswind = receivesForSkill(findSkill("Crosswind Blade"), CLASS, inputs)
    expect(detonation.some((r) => r.id === RETENTION_ROW_ID)).toBe(false)
    expect(crosswind.some((r) => r.id === RETENTION_ROW_ID)).toBe(false)
  })
})

describe("catalog receives — Vulnerability (Teammate) follows the Tank Spear Debuff toggle", () => {
  it("reads inactive by default (toggle off) and requires names the Tank Spear Debuff", () => {
    const swordQ = findSkill("Sword Martial Q")
    const rows = receivesForSkill(swordQ, CLASS, { ...defaultInputs, classId: CLASS })
    const row = rows.find((r) => r.id === "vulnerabilityTeammate")
    expect(row).toBeTruthy()
    expect(row!.active).toBe(false)
    expect(row!.requires).toMatch(/Tank Spear Debuff/)
  })

  it("reads active once the Tank Spear Debuff (Vulnerability) toggle is on", () => {
    const swordQ = findSkill("Sword Martial Q")
    const inputs: Inputs = {
      ...defaultInputs,
      classId: CLASS,
      shareEasyHurt: true,
      combatSettings: { ...defaultCombatSettings() },
    }
    const rows = receivesForSkill(swordQ, CLASS, inputs)
    expect(rows.find((r) => r.id === "vulnerabilityTeammate")!.active).toBe(true)
  })
})

describe("catalog receives — Mirage Bonus surfaces its cast condition", () => {
  it("triggeredBy names the triggering cast and the Mirage prerequisite", () => {
    const swordQ = findSkill("Sword Martial Q")
    const rows = receivesForSkill(swordQ, CLASS, { ...defaultInputs, classId: CLASS })
    const row = rows.find((r) => r.id === "mirageBonus")
    expect(row).toBeTruthy()
    expect(row!.triggeredBy).toMatch(/Perfect Dodge/)
    expect(row!.triggeredBy).toMatch(/Mirage/)
  })
})
