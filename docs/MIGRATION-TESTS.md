# MIGRATION-TESTS.md — writing a migration test

Every step in `src/migrations/` ships with a test in `tests/migrations/`.
Migrations are the one kind of code neither the type checker nor the rest of the
suite can protect: a broken step corrupts real saved builds, and it does it
silently — no crash, no warning, no failing assertion anywhere else.

Throughout, `V<n>__<name>` is the step under test and `<n>` the version it
produces.

## 1. Test against a real captured profile

Put an actual blob exported from the app in `tests/migrations/testProfiles/`,
named for the version it was captured at — `profile-v<n>.json`. A literal
written by hand only contains the fields you remembered, so it cannot catch a
step that drops the field you forgot.

One test file per fixture: `profileV<n>.test.ts`.

## 2. Assert the fixture is genuinely pre-change

Give this its own test, before anything else:

```ts
it("is version <n> and still carries the pre-<n+1> shape", () => {
  expect(LEGACY.v).toBe(<n>);
  expect(LEGACY.profile.inputs.<field>).toBe(<old value>);
});
```

Fixtures drift. A repo-wide find/replace will rewrite one without noticing, and
then every other test in the file keeps passing while covering nothing. Treat
the fixture as data under test, not as scaffolding.

## 3. Prove the step is what did the work

This is the one that bites, and it is the reason this document exists.

`hydrateInputs` repairs and defaults values on every load. A test that writes a
blob, calls `loadProfiles`, and checks the result may be measuring the hydrator
and never touching your migration at all.

**Verify by deleting the step from `PROFILE_MIGRATIONS` and re-running. If the
test still passes, it is not testing the migration.** Put the step back
afterwards.

To make the test load-bearing, call the step directly — no loader involved:

```ts
const migrated = V<n>__<name>.migrate(blobOf(clone(LEGACY.profile)));
expect(migrated.v).toBe(V<n>__<name>.to);
expect(inputsOf(migrated).<field>).toBe(<new value>);
```

...and pin that it is registered and that the chain reaches it:

```ts
const result = runProfileMigrations(blobOf(clone(LEGACY.profile)))!;
expect(result.applied).toContain("V<n>__<name>");
expect(result.blob.v).toBe(LATEST_PROFILES_VERSION);
```

Use `toContain`, not `toEqual([...])`, unless you are asserting the exact
sequence a given fixture should walk — see §7.

## 4. Then test the full path end to end

Direct calls prove the transform; they do not prove it is wired in. Write the
blob to `localStorage`, call `loadProfiles`, and assert on what the app would
actually receive — including that the upgraded blob was persisted at
`LATEST_PROFILES_VERSION`, so the chain runs once rather than on every load.

## 5. Assert the user's build survived

The point of a migration is that nothing is lost. Compare against the fixture,
never against hardcoded constants:

- `id`, `name`, `breakthrough`, `arsenal`
- `inventory.length` and `equipped` — gear is the irreplaceable part
- panel stats (`phys`, the attribute blocks, `precision`, `critRate`, `affinityRate`)
- every selected inner way — an allowlist pass can quietly blank a slot
- `runEngine(migrated).dps > 0`, with no "no default rotation" warning

Add whatever else your step is near. The rule is that a field your step does not
claim to touch must come out byte-identical.

## 6. Extra assertions by kind of change

**Renamed or moved field** — assert the value arrived at its new home *and*
that the old key is gone:

```ts
expect(inputs.<newField>).toEqual(<carried value>);
expect("<oldField>" in (inputs as Record<string, unknown>)).toBe(false);
```

**Renamed ids** — equality is not enough; the new id has to exist:

```ts
const known = new Set(builtinSkillsForClass(inputs.classId).map((s) => s.id));
for (const step of inputs.activeCustomRotation!.steps) {
  expect(known.has(step.skillId), `unresolved ${step.skillId}`).toBe(true);
}
```

An id nobody knows is skipped by `src/engine/timeline.ts` (`if (!sub) continue`).
The build still loads; DPS is just quietly lower. Nothing else in the suite
catches it.

**Narrowed allowlist** — assert a now-illegal stored value is cleared, and that
a legal neighbour in the same array is untouched.

**Changed unit or meaning** — assert the converted number, not just its
presence. A no-op step passes a presence check.

## 7. Old fixtures keep testing the whole chain

Never delete an old fixture when a newer step lands. Each fixture exercises
every hop from its own version up to the latest, and that is the only coverage
proving a multi-step walk composes correctly.

So a fixture's expectations grow over time. Once two further steps exist, a
fixture captured at `v<n>` has `applied` of `["V<n+1>__…", "V<n+2>__…"]`, and its
final assertions must reflect the *cumulative* result rather than what the first
step alone produced. When a later step changes a field an earlier fixture
asserts, update that fixture's expectation — never its stored data.

## 8. Idempotency, both directions

- legacy blob → load → save → load again ⇒ identical
- an already-migrated blob passes through unchanged
- the step does not mutate its input — snapshot it, migrate, compare

## 9. Chain behaviour is tested once, not per step

Versions older than the chain, a missing or garbage version, a future version, a
step that throws, a non-array `profiles` — those live in
`tests/migrations/migrationRunner.test.ts`. Do not re-test them per migration.
See `PROFILE-MIGRATIONS.md` for the guarantees they enforce.
