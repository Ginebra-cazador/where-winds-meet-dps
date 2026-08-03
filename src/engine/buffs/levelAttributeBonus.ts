// Player-level → attribute-attack bonus table: site's `J1` array
// (`.tmp/site/deobfuscated.js` ~L22198-22214), read by `ju()` (~L22215-22228)
// and applied in `os()` (~L22647-52).
export const APP_PLAYER_LEVEL = 100

const PLAYER_LEVEL_ATTRIBUTE_BONUS: readonly { level: number; bonus: number }[] = [
  { level: 100, bonus: 150 },
  { level: 95, bonus: 129.2 },
  { level: 90, bonus: 114.5 },
  { level: 85, bonus: 34 },
]

export function playerLevelAttributeAttackBonus(playerLevel: number): number {
  for (const row of PLAYER_LEVEL_ATTRIBUTE_BONUS) {
    if (playerLevel >= row.level) return row.bonus
  }
  return 0
}
