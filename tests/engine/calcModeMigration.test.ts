// Additive migration, no version bump — see CLAUDE.md → "localStorage migrations".
import { beforeEach, describe, expect, it } from "vitest"
import { kvStore } from "../../src/kvStore"
import { loadProfiles } from "../../src/storage"
import { defaultInputs } from "../../src/engine/defaults"
import type { Inputs } from "../../src/engine/types"

const PROFILES_KEY = "wwm.profiles"
const PROFILES_VERSION = 4

function writeLegacyProfilesBlob(calcMode: string): void {
  const inputs: Inputs & { calcMode?: string } = { ...defaultInputs }
  ;(inputs as unknown as Record<string, unknown>).calcMode = calcMode
  kvStore.set(
    PROFILES_KEY,
    JSON.stringify({
      v: PROFILES_VERSION,
      profiles: [{ id: "p1", name: "Legacy", inputs }],
      activeId: "p1",
    }),
  )
}

describe("calcMode migration (additive strip, no version bump)", () => {
  beforeEach(() => {
    try {
      kvStore.remove(PROFILES_KEY)
    } catch {}
  })

  it("strips a legacy first-mode calcMode and keeps the rest of the profile intact", () => {
    writeLegacyProfilesBlob("legacy-mode-a")
    const { profiles } = loadProfiles()
    expect("calcMode" in profiles[0].inputs).toBe(false)
    expect(profiles[0].inputs.breakthrough).toBe(defaultInputs.breakthrough)
  })

  it("strips a legacy second-mode calcMode and keeps the rest of the profile intact", () => {
    writeLegacyProfilesBlob("legacy-mode-b")
    const { profiles } = loadProfiles()
    expect("calcMode" in profiles[0].inputs).toBe(false)
    expect(profiles[0].inputs.breakthrough).toBe(defaultInputs.breakthrough)
  })
})
