# PROFILE-MIGRATIONS.md — how the profile migration chain works

How the migration chain in `src/migrations/` works.

Saved profiles are the one part of this app that cannot be regenerated — a
user's gear inventory, panel stats and rotation exist nowhere else. Everything
in that folder follows from that.

## The chain

A stored `wwm.profiles` blob carries a version. On load it is walked **up one
version at a time** — v3 → v4 → v5 → … — until it reaches
`LATEST_PROFILES_VERSION`, then hydrated and re-saved at the new version so the
walk happens once rather than on every load.

`LATEST_PROFILES_VERSION` is derived from the registry, not written by hand.
`PROFILES_VERSION` in `src/storage.ts` is an alias of it.

## Rule 1 — a profile is never deleted

Not for being too old, too new, unversioned, corrupt, or for tripping a bug in
a migration. The runner guarantees:

| situation | behaviour |
| --- | --- |
| no step registered for a version hop | stepped over, blob kept |
| a step throws | caught; the pre-step blob carries forward |
| version missing or not a number | treated as `0`, walked from the bottom |
| version **newer** than we know | returned untouched — a downgrade must not shred data a newer build wrote |
| `profiles` is not an array | preserved as-is for the caller to salvage |

The only paths that fall back to a fresh default profile are "nothing stored"
and "the JSON does not parse" — cases where there is nothing to recover.

`hydrateInputs` runs after the chain and fills defaults for anything a step
left unreadable, so a step never has to delete a field to make it safe.

## Rule 2 — one hop per file

`V<n>__<whatItDoes>.ts`, exporting a `Migration` whose `to` is `<n>`. A step
migrates a blob at `n - 1` to `n`, and nothing else. Register it in the
`PROFILE_MIGRATIONS` array in `src/migrations/index.ts`; order and the
name/`to` match are asserted in `tests/migrations/migrationRunner.test.ts`.

## Rule 3 — steps are pure and idempotent

Return a new blob; never mutate the input. Running a step twice must equal
running it once, because the chain is not the only caller — imported profiles
and the legacy `wwm.inputs` blob reach the same transforms through
`hydrateInputs`.

Prefer carrying a value over to its new home before dropping the old key
(`siteBuffParams` → `buffParams`) rather than deleting and re-defaulting.

## Rule 4 — every step ships with a test against a real captured profile

Requirements are in `MIGRATION-TESTS.md`. The short version: use a real blob
from `tests/migrations/testProfiles/`, call the step directly so the test cannot
pass on `hydrateInputs` alone, then cover the full `loadProfiles` path.

## Scope

This chain covers `wwm.profiles` only. The `wwm.customRotations`,
`wwm.customSkills`, `wwm.customBuffs` and `wwm.customDebuffs` stores carry
their own version counters and still heal through their hydrators in
`src/storage.ts`, reusing the transforms a step exports. They have not been
converted to chains yet, and still drop on version mismatch.
