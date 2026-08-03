// Site's `ju(playerLevel)`, `.tmp/site/deobfuscated.js` ~L22198-22228.
import { describe, expect, it } from "vitest"
import { playerLevelAttributeAttackBonus } from "../../src/engine/buffs/levelAttributeBonus"

describe("playerLevelAttributeAttackBonus", () => {
  it("matches the site's J1 table at each named bracket", () => {
    expect(playerLevelAttributeAttackBonus(100)).toBe(150)
    expect(playerLevelAttributeAttackBonus(95)).toBe(129.2)
    expect(playerLevelAttributeAttackBonus(90)).toBe(114.5)
    expect(playerLevelAttributeAttackBonus(85)).toBe(34)
  })

  it("uses the highest bracket at or below the given level (in-between levels)", () => {
    expect(playerLevelAttributeAttackBonus(97)).toBe(129.2)
    expect(playerLevelAttributeAttackBonus(88)).toBe(34)
  })

  it("is 0 below the lowest bracket", () => {
    expect(playerLevelAttributeAttackBonus(84)).toBe(0)
    expect(playerLevelAttributeAttackBonus(0)).toBe(0)
  })
})
