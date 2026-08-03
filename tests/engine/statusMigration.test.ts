// One-time split of a legacy mixed `wwm.customBuffs` blob into the current
// `wwm.customBuffs` (player/team) and `wwm.customDebuffs` (target/DoT) stores,
// preserving every id — see CLAUDE.md → "localStorage migrations".
import { beforeEach, describe, expect, it } from "vitest"
import { kvStore } from "../../src/kvStore"
import {
  loadCustomBuffs,
  loadCustomBuffsForClass,
  loadCustomDebuffs,
  loadCustomDebuffsForClass,
} from "../../src/storage"

const CLASS = "bellstrikeUmbra"
const BUFFS_KEY = "wwm.customBuffs"
const DEBUFFS_KEY = "wwm.customDebuffs"

function writeLegacyV1Blob(): void {
  kvStore.set(
    BUFFS_KEY,
    JSON.stringify({
      v: 1,
      buffs: [
        {
          id: "bf-legacy-player",
          classId: CLASS,
          name: "Warcry",
          scope: "player",
          activation: "triggered",
          durationFrames: 300,
          effects: [{ statKey: "critDamageBoost", amount: 0.2 }],
          maxStacks: 1,
          stackScaling: "flat",
          createdAt: "2020-01-01T00:00:00.000Z",
          updatedAt: "2020-01-01T00:00:00.000Z",
        },
        {
          id: "bf-legacy-bleed",
          classId: CLASS,
          name: "Bleed",
          scope: "target",
          activation: "triggered",
          durationFrames: 600,
          effects: [
            { statKey: "target.generalDamageTaken", amount: 0.1 },
            { statKey: "critDamageBoost", amount: 999 },
          ],
          dot: {
            tickIntervalFrames: 60,
            physMultiplier: 0,
            physFixed: 100,
            attributeMultiplier: 0,
            attributeFixed: 0,
            attributeAttack: "",
            skillType: "sustain",
            count: 1,
          },
          maxStacks: 5,
          stackScaling: "perStack",
          createdAt: "2020-01-01T00:00:00.000Z",
          updatedAt: "2020-01-01T00:00:00.000Z",
        },
      ],
    }),
  )
}

describe("buff/debuff store split migration", () => {
  beforeEach(() => {
    try {
      kvStore.remove(BUFFS_KEY)
    } catch {}
    try {
      kvStore.remove(DEBUFFS_KEY)
    } catch {}
  })

  it("splits a v1 blob into buffs (player) + debuffs (target/DoT), preserving ids", () => {
    writeLegacyV1Blob()

    const buffs = loadCustomBuffsForClass(CLASS)
    expect(buffs).toHaveLength(1)
    expect(buffs[0].id).toBe("bf-legacy-player")
    expect(buffs[0].name).toBe("Warcry")
    expect(buffs[0].scope).toBe("player")
    expect(buffs[0].effects).toEqual([{ statKey: "critDamageBoost", amount: 0.2 }])
    expect((buffs[0] as unknown as Record<string, unknown>).dot).toBeUndefined()

    const debuffs = loadCustomDebuffsForClass(CLASS)
    expect(debuffs).toHaveLength(1)
    expect(debuffs[0].id).toBe("bf-legacy-bleed")
    expect(debuffs[0].name).toBe("Bleed")
    expect(debuffs[0].dot?.tickIntervalFrames).toBe(60)
    expect(debuffs[0].maxStacks).toBe(5)
    expect(debuffs[0].stackScaling).toBe("perStack")
    expect(debuffs[0].effects).toEqual([{ statKey: "target.generalDamageTaken", amount: 0.1 }])
  })

  it("is idempotent — a second load after the split is a stable no-op", () => {
    writeLegacyV1Blob()
    const firstBuffs = loadCustomBuffs()
    const firstDebuffs = loadCustomDebuffs()

    const secondBuffs = loadCustomBuffs()
    const secondDebuffs = loadCustomDebuffs()

    expect(secondBuffs).toEqual(firstBuffs)
    expect(secondDebuffs).toEqual(firstDebuffs)
    expect(secondBuffs).toHaveLength(1)
    expect(secondDebuffs).toHaveLength(1)
  })

  it("triggering the migration via loadCustomDebuffs() first produces the same split", () => {
    writeLegacyV1Blob()
    const debuffs = loadCustomDebuffsForClass(CLASS)
    expect(debuffs).toHaveLength(1)
    expect(debuffs[0].id).toBe("bf-legacy-bleed")

    const buffs = loadCustomBuffsForClass(CLASS)
    expect(buffs).toHaveLength(1)
    expect(buffs[0].id).toBe("bf-legacy-player")
  })

  it("a current-version buffs blob (already split) is left untouched — no debuffs materialize", () => {
    kvStore.set(
      BUFFS_KEY,
      JSON.stringify({
        v: 3,
        buffs: [
          {
            id: "bf-v2",
            classId: CLASS,
            name: "Already split",
            scope: "player",
            activation: "triggered",
            durationFrames: 300,
            effects: [],
            maxStacks: 1,
            stackScaling: "flat",
            createdAt: "2020-01-01T00:00:00.000Z",
            updatedAt: "2020-01-01T00:00:00.000Z",
          },
        ],
      }),
    )
    expect(loadCustomBuffsForClass(CLASS)).toHaveLength(1)
    expect(loadCustomDebuffsForClass(CLASS)).toHaveLength(0)
  })
})
