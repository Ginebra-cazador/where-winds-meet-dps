// Swift Gale, Swaying Heights and Stars Align carried no modelled effect and
// their `defineSet` calls are gone, so a stored `set` naming one is now illegal.
// `V14__dropUnimplementedArmorSets` heals stored profiles; the live-registry
// check in `hydrateInputs` holds the same invariant on the two paths that never
// walk the chain, which is why the step is called directly below rather than
// asserted through `loadProfiles` alone.
//
// Matches ids, not display names: V11 converted `Inputs.set` to the stable id
// before this step runs.
import { beforeEach, describe, expect, it } from "vitest"
import { importProfile, loadProfiles } from "../../src/storage"
import { ARMOR_SET_OPTIONS } from "../../src/engine/panel"
import {
  LATEST_PROFILES_VERSION,
  runProfileMigrations,
  type RawProfilesBlob,
} from "../../src/migrations"
import { V14__dropUnimplementedArmorSets } from "../../src/migrations/V14__dropUnimplementedArmorSets"
import type { StoredProfile } from "../../src/engine/types"
import legacyProfileFile from "./testProfiles/v12/silkbindJade.json"

const PROFILES_KEY = "wwm.profiles"
const RETIRED_SET_IDS = ["swiftGale", "swayingHeights", "starsAlign"]

type LegacyFile = { v: number; profile: StoredProfile }
const LEGACY = legacyProfileFile as unknown as LegacyFile

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function withSet(profile: StoredProfile, set: string | null): StoredProfile {
  return { ...profile, inputs: { ...profile.inputs, set } }
}

function blobOf(profile: StoredProfile, version = LATEST_PROFILES_VERSION - 1): RawProfilesBlob {
  return { v: version, profiles: [profile], activeId: profile.id }
}

function inputsOf(blob: RawProfilesBlob) {
  return (blob.profiles[0] as StoredProfile).inputs
}

function loadOne(): StoredProfile {
  const { profiles } = loadProfiles()
  expect(profiles).toHaveLength(1)
  return profiles[0]
}

describe("V14__dropUnimplementedArmorSets — called directly", () => {
  for (const retired of RETIRED_SET_IDS) {
    it(`clears a stored ${retired}`, () => {
      const migrated = V14__dropUnimplementedArmorSets.migrate(
        blobOf(withSet(clone(LEGACY.profile), retired)),
      )
      expect(migrated.v).toBe(V14__dropUnimplementedArmorSets.to)
      expect(inputsOf(migrated).set).toBeNull()
    })
  }

  for (const option of ARMOR_SET_OPTIONS) {
    it(`leaves the still-offered ${option.setKey} untouched`, () => {
      const migrated = V14__dropUnimplementedArmorSets.migrate(
        blobOf(withSet(clone(LEGACY.profile), option.setKey)),
      )
      expect(inputsOf(migrated).set).toBe(option.setKey)
    })
  }

  it("leaves an already-unset profile at null", () => {
    const migrated = V14__dropUnimplementedArmorSets.migrate(
      blobOf(withSet(clone(LEGACY.profile), null)),
    )
    expect(inputsOf(migrated).set).toBeNull()
  })

  it("touches nothing but the set", () => {
    const before = blobOf(withSet(clone(LEGACY.profile), "starsAlign"))
    const migrated = V14__dropUnimplementedArmorSets.migrate(clone(before))
    expect(inputsOf(migrated)).toEqual({ ...inputsOf(before), set: null })
    expect((migrated.profiles[0] as StoredProfile).id).toBe(LEGACY.profile.id)
  })

  it("does not mutate its input", () => {
    const input = blobOf(withSet(clone(LEGACY.profile), "swiftGale"))
    const snapshot = clone(input)
    V14__dropUnimplementedArmorSets.migrate(input)
    expect(input).toEqual(snapshot)
  })

  it("is idempotent", () => {
    const once = V14__dropUnimplementedArmorSets.migrate(
      blobOf(withSet(clone(LEGACY.profile), "swayingHeights")),
    )
    expect(V14__dropUnimplementedArmorSets.migrate(clone(once))).toEqual(once)
  })
})

describe("V14__dropUnimplementedArmorSets — registered in the chain", () => {
  it("walks to the latest version through this step", () => {
    const result = runProfileMigrations(
      blobOf(withSet(clone(LEGACY.profile), "starsAlign"), LEGACY.v),
    )!
    expect(result.applied).toContain("V14__dropUnimplementedArmorSets")
    expect(result.blob.v).toBe(LATEST_PROFILES_VERSION)
    expect(inputsOf(result.blob).set).toBeNull()
  })
})

describe("V14__dropUnimplementedArmorSets — end to end through loadProfiles", () => {
  beforeEach(() => localStorage.clear())

  it("clears the set and persists at the latest version", () => {
    localStorage.setItem(
      PROFILES_KEY,
      JSON.stringify(blobOf(withSet(clone(LEGACY.profile), "starsAlign"), LEGACY.v)),
    )
    expect(loadOne().inputs.set).toBeNull()

    const persisted = JSON.parse(localStorage.getItem(PROFILES_KEY)!)
    expect(persisted.v).toBe(LATEST_PROFILES_VERSION)
    expect(persisted.profiles[0].inputs.set).toBeNull()
  })
})

// The chain never runs on a bare imported profile, so only the live-registry
// check in `hydrateInputs` stands between it and an illegal stored set.
describe("hydrateInputs backstop — a retired set on a bare import", () => {
  beforeEach(() => localStorage.clear())

  for (const retired of RETIRED_SET_IDS) {
    it(`clears ${retired}`, () => {
      const bare = withSet(clone(LEGACY.profile), retired)
      expect(importProfile(JSON.stringify(bare)).inputs.set).toBeNull()
    })
  }

  it("keeps a set that is still offered", () => {
    const bare = withSet(clone(LEGACY.profile), "mistwillow")
    expect(importProfile(JSON.stringify(bare)).inputs.set).toBe("mistwillow")
  })
})
