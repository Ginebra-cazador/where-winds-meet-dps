// v5 → v6 — stop persisting resolved stat fields; they are recomputed by
// `withDerivedStats` on every load, and a stored copy can go stale or illegal
// (e.g. an arsenal-subtraction going negative).
import type { Migration, RawProfilesBlob } from "./types"
import { withoutDerivedStats } from "../engine/derivedInputs"

const isRec = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value)

export const V6__dropDerivedStats: Migration = {
  to: 6,
  name: "V6__dropDerivedStats",
  migrate(blob: RawProfilesBlob): RawProfilesBlob {
    const profiles = Array.isArray(blob.profiles)
      ? blob.profiles.map((profile) =>
          isRec(profile) && isRec(profile.inputs)
            ? { ...profile, inputs: withoutDerivedStats(profile.inputs) }
            : profile,
        )
      : blob.profiles
    return { ...blob, v: 6, profiles }
  },
}
