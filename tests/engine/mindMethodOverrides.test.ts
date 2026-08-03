import { describe, expect, it } from "vitest"
import { resolveMindMethodOverrides } from "../../src/engine/mindMethodOverrides"
import { defaultInputs } from "../../src/engine/defaults"
import type { Inputs } from "../../src/engine/types"

function withMindMethods(...slots: { name: string; stacks: string }[]): Inputs {
  return {
    ...defaultInputs,
    mindMethods: [
      slots[0] ?? { name: "", stacks: "" },
      slots[1] ?? { name: "", stacks: "" },
      slots[2] ?? { name: "", stacks: "" },
      slots[3] ?? { name: "", stacks: "" },
    ] as Inputs["mindMethods"],
  }
}

describe("Mud-Fish Heart affects Mouse Mud-Fish extraDamageBoost", () => {
  it("at tier 6 → 0.30", () => {
    const o = resolveMindMethodOverrides(
      withMindMethods({ name: "Mud-Fish Heart", stacks: "tier 6" }),
    )
    expect(o.artsOverrides["Mouse Mud-Fish"].extraDamageBoost).toBe(0.3)
  })
  it("at tier 5 → 0", () => {
    const o = resolveMindMethodOverrides(
      withMindMethods({ name: "Mud-Fish Heart", stacks: "tier 5" }),
    )
    expect(o.artsOverrides["Mouse Mud-Fish"].extraDamageBoost).toBe(0)
  })
  it("not selected → 0", () => {
    const o = resolveMindMethodOverrides(withMindMethods())
    expect(o.artsOverrides["Mouse Mud-Fish"].extraDamageBoost).toBe(0)
  })
})

describe("Sutra Shift affects ModaoRCharge/Derivative extraCritDamage", () => {
  it("selected → +0.20 delta", () => {
    const o = resolveMindMethodOverrides(withMindMethods({ name: "Sutra Shift", stacks: "tier 6" }))
    expect(o.artsOverrides["Modao R-Charge 2"].extraCritDamage).toBeCloseTo(0.2, 6)
  })
  it("not selected → 0 delta", () => {
    const o = resolveMindMethodOverrides(withMindMethods())
    expect(o.artsOverrides["Modao R-Charge 2"].extraCritDamage).toBe(0)
  })
})

describe("Boat on Wood affects Dust Rope Dart extraDamageBoost", () => {
  it("selected → 5/10/15% on R123/R45/R67", () => {
    const o = resolveMindMethodOverrides(
      withMindMethods({ name: "Boat on Wood", stacks: "tier 6" }),
    )
    expect(o.artsOverrides["Dust Rope Dart R1-2-3"].extraDamageBoost).toBeCloseTo(0.05, 6)
    expect(o.artsOverrides["Dust Rope Dart R4-5"].extraDamageBoost).toBeCloseTo(0.1, 6)
    expect(o.artsOverrides["Dust Rope Dart R6-7"].extraDamageBoost).toBeCloseTo(0.15, 6)
  })
  it("special technique gates on tier 6", () => {
    const sixth = resolveMindMethodOverrides(
      withMindMethods({ name: "Boat on Wood", stacks: "tier 6" }),
    )
    const fifth = resolveMindMethodOverrides(
      withMindMethods({ name: "Boat on Wood", stacks: "tier 5" }),
    )
    expect(sixth.artsOverrides["Dust Rope Dart Special"].extraDamageBoost).toBeCloseTo(0.15, 6)
    expect(fifth.artsOverrides["Dust Rope Dart Special"].extraDamageBoost).toBe(0)
  })
  it("not selected → 0", () => {
    const o = resolveMindMethodOverrides(withMindMethods())
    expect(o.artsOverrides["Dust Rope Dart R1-2-3"].extraDamageBoost).toBe(0)
    expect(o.artsOverrides["Dust Rope Dart Special"].extraDamageBoost).toBe(0)
  })
})

describe("Insightful Strike affects Nine Sword/Nine Spear affinity damage (rate moved to panel direct affinity)", () => {
  it("selected → +0.10 affinity damage; affinity-rate conditional removed", () => {
    const o = resolveMindMethodOverrides(
      withMindMethods({ name: "Insightful Strike", stacks: "tier 6" }),
    )
    expect(o.artsOverrides["Nine Sword Q"].extraAffinityDamage).toBeCloseTo(0.1, 6)
    expect(o.artsOverrides["Nine Sword Q"].extraAffinityRate).toBeUndefined()
    expect(o.artsOverrides["Nine Spear Q (1st)"].extraAffinityDamage).toBeCloseTo(0.1, 6)
  })
  it("not selected → 0 affinity damage, no affinity-rate field", () => {
    const o = resolveMindMethodOverrides(withMindMethods())
    expect(o.artsOverrides["Nine Sword Q"].extraAffinityDamage).toBe(0)
    expect(o.artsOverrides["Nine Sword Q"].extraAffinityRate).toBeUndefined()
  })
})

describe("Forgotten River Echo affects Samsara boost-zone col2", () => {
  it("at tier 6 → 0.10", () => {
    const o = resolveMindMethodOverrides(
      withMindMethods({ name: "Forgotten River Echo", stacks: "tier 6" }),
    )
    expect(o.boostZoneOverrides["Samsara"].col2).toBe(0.1)
  })
  it("at any other tier → 0.05", () => {
    const o = resolveMindMethodOverrides(
      withMindMethods({ name: "Forgotten River Echo", stacks: "tier 5" }),
    )
    expect(o.boostZoneOverrides["Samsara"].col2).toBe(0.05)
  })
  it("not selected → 0.05 (per Checkxinfa default)", () => {
    const o = resolveMindMethodOverrides(withMindMethods())
    expect(o.boostZoneOverrides["Samsara"].col2).toBe(0.05)
  })
})
