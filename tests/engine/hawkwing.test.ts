import { describe, expect, it } from "vitest"
import { hawkwingAvgBonus } from "../../src/engine/buffs/hawkwing"

function hitTrain(duration: number, interval = 0.3): number[] {
  const hits: number[] = []
  for (let t = 0; t < duration; t += interval) hits.push(t)
  return hits
}

describe("hawkwingAvgBonus", () => {
  it("is 0 when there are no hits", () => {
    expect(hawkwingAvgBonus([], 0.4, 60.7)).toBe(0)
  })

  it("is 0 when the rotation duration is non-positive", () => {
    expect(hawkwingAvgBonus(hitTrain(60.7), 0.4, 0)).toBe(0)
  })

  it("is 0 when the roll probability is non-positive", () => {
    expect(hawkwingAvgBonus(hitTrain(60.7), 0, 60.7)).toBe(0)
  })

  it("lands near 0.096-0.099 at the parity build's roll probability (~0.3997)", () => {
    const bonus = hawkwingAvgBonus(hitTrain(60.7), 0.3997, 60.7)
    expect(bonus).toBeGreaterThan(0.096)
    expect(bonus).toBeLessThan(0.099)
  })

  it("lands near 0.074 at a lower roll probability (0.15)", () => {
    const bonus = hawkwingAvgBonus(hitTrain(60.7), 0.15, 60.7)
    expect(bonus).toBeGreaterThan(0.072)
    expect(bonus).toBeLessThan(0.076)
  })

  it("a lower affinity rate yields a correspondingly smaller bonus", () => {
    const low = hawkwingAvgBonus(hitTrain(60.7), 0.15, 60.7)
    const high = hawkwingAvgBonus(hitTrain(60.7), 0.3997, 60.7)
    expect(low).toBeLessThan(high)
  })

  it("never exceeds the 5-stack cap (0.10)", () => {
    const bonus = hawkwingAvgBonus(hitTrain(120, 0.05), 1, 120)
    expect(bonus).toBeLessThanOrEqual(0.1)
  })
})
