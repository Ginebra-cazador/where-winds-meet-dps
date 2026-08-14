# Stonesplit Might — buff spec sheet (source of truth for Code)

Port-ready spec for the buffs/debuffs. Goes in `reference/` (never `docs/` — the `docsStayGeneral`
gate). Companion to `stonesplit-might-coefficients.md` and the `-buffs-and-talents.md` working notes.
All values lvl 100, build = Formbend + Rainwhisper sets, AoR T6.

## How Code applies this

Most of these already exist as reference JSONs under `reference/classes/buffs/` with a
`stonesplit_might` variant — porting them is mechanical, exactly like the skills: translate the
reference `def` into a `defineBuff`/`defineClassBuff` module, following the strength templates
`src/data/skills/stonesplit-strength/buffs/ironGuards.ts` (a `bonus`→`effects` buff) and
`skillCritDamage.ts` (an always-active class buff). Translation rules:

- Reference `bonus: { type: "buffBonus", value: X }` + `affects: null` → `effects: [stat("allDamageBoost", X)]`.
- Crit-DMG bonus → `stat("critDamageBoost", X)`. Penetration → `stat("phys.penetration", X)` /
  `stat("stonesplit.penetration", X)`.
- Keep `triggeredBy`, `affects`, `affectsProperty`, `affectsWeaponTypes`, `conditionalTrigger`,
  `duration`, `maxStacks`, `cooldown` from the reference **except** the explicit overrides below.
- Pin every buff id in the buffs `ids.ts` (mirror `stonesplit-strength/buffs/ids.ts`); rewrite raw
  `cast:` trigger strings to `CAST.*` constants.
- Touch only `src/data/`. No `src/engine`/`src/definitions`. No Chinese.

## A. Debuffs on the boss — PORT from reference (Section 4)

Both already have a `stonesplit_might` variant in `reference/classes/buffs/`. Port verbatim.

| Buff | reference | key fields |
|---|---|---|
| `vulnerability` | vulnerability.json | triggeredBy the 4 Spear Special casts; duration 16; `affects: null`; +8% (`allDamageBoost 0.08`) |
| `vulnerabilityWeapon` | vulnerabilityWeapon.json | same triggers; duration 16; `affectsWeaponTypes: ["Mo Blade","Stormbreaker Spear"]`; +8% |

Might uses both weapons, so these stack to the **16%** in-game total. No changes from the reference.

## B. Charged-skill damage chain — Drumbeat + Breakthrough via `perCastConsume` (Section 5)

The engine has no `overriddenBy`/`conditionalTrigger` support, but it does have **`perCastConsume`** —
a cast drains one buff (via `spendStack`) and grants another. Precedent: `burningHeartIPConsume.ts`
(strength's steadfastDevotion) consumes Inner Passion / Charge Enhancement → grants Mountain Splitter.
Model Drumbeat→Breakthrough the same way: **Mo Blade Q consumes Drumbeat and grants Breakthrough**, so
they never coexist (no double-count) and Breakthrough can't happen without Drumbeat (nothing to drain).

| Buff | source | fields |
|---|---|---|
| `drumbeat` | drumbeat.json | +15% (`affectsProperty: isCharged`), spear-triggered, duration 6, **maxStacks 1** (a single consumable stack) |
| `breakthrough` | breakthrough.json | +42% isCharged, duration **12 base** (+2 Formbend +6 AoR → 20 effective, §Duration), **maxStacks 1**; **granted and refreshed by the consume** (not directly triggered) |
| `breakthroughConsume` (NEW) | — | one consume def handling **both upgrade and refresh**, modeled on `burningHeartIPConsume`: `perCastConsume: { property: PROP.consumesDrumbeat, preferredFrom: [BUFF.breakthrough], from: BUFF.drumbeat, grants: [{ whenConsumedFrom: BUFF.drumbeat, buffIds: [BUFF.breakthrough] }, { whenConsumedFrom: BUFF.breakthrough, buffIds: [BUFF.breakthrough] }] }` |

On each Mo Blade Q the engine drains whichever pool has a stack (Breakthrough checked first, then
Drumbeat) and re-grants Breakthrough: drain Drumbeat → **upgrade**; drain Breakthrough → **refresh**.
One mechanism, no separate `refreshOnAnyCast`. Edge case to confirm against the rotation: if a spear
skill is ever cast *during* an active Breakthrough it re-applies Drumbeat, leaving both live and a
possible transient double-count (the consume drains only one pool per cast) — only a concern if the
rotation casts spear inside the Breakthrough window; otherwise airtight.

Also: add a `consumesDrumbeat` PROP tag to the `mobladeq` skill so the consume fires on that cast.
Drop the reference's `overriddenBy`/`conditionalTrigger` fields (engine ignores them; the consume
replaces them). This is all data-only — no `src/engine` edit.

## C. Charged-skill crit — NEW class buff (Section 5)

Not in the reference — build it new, patterned on strength's `skillCritDamage`, but scoped to
charged/varied (not `affects: null`). Sources: Charge Calculation Enhancement (+10% Crit DMG) and
Charge Critical Hit Enhancement (+9% base + up to +15% from Max HP, capped at 90k HP → **+24%** at the
build's 145k HP). Always active, but only on Charged Skill + Varied Combo (incl. Ground Slam).

```ts
export const stonesplitMightChargedCrit = defineClassBuff({
  id: BUFF.stonesplitMightChargedCrit,
  name: "Stonesplit Might Charged Crit",
  triggeredBy: [],
  affects: [ /* the charged-skill + varied-combo skill ids or tags — see note */ ],
  alwaysActive: true,
  duration: 9999,
  summary: "charged/varied: critDamageBoost +10%, crit rate +24%",
  effects: [
    stat("critDamageBoost", 0.10),
    stat("<CRIT_RATE_STAT>", 0.24),   // TO VERIFY: exact crit-rate stat key (see §Verify)
  ],
})
```

**Scope note:** `affects` must catch both the `isCharged` heavy-charge skills and the Varied Combo
(+ Ground Slam). Use whatever addressing the engine supports — a tag list if `affects` accepts the
`isCharged` property + a varied-combo tag, otherwise the explicit skill-id list. Confirm against how
`affects` is matched.

## D. Inner-way & set buffs — VERIFY existing, add the AoR +5% (Section 5)

These partly exist as shared buffs; the work is verification + one addition, not fresh authoring.

- **Throat-Pierced** (`reference/classes/buffs/throatPierced.json`, `throatPiercedDeflect.json`) — a
  **self-buff**: physPen + crit DMG per stack (enhanced by Varied Combo), Deflect maxes to 5 stacks,
  12s, gated on the `throatPierced` inner-way param. The inner way exists
  (`src/data/innerWays/throatPierce.ts` + `throatPierceBuffs/throatPierced.ts`). **VERIFY** the
  `stonesplit_might` variant is present there; add it if missing (triggers MoBladeVariedCombo, 2/cast,
  Deflect→5).
- **Art of Resistance** (`src/data/skills/buffs/resistanceResolve.ts`) — while shielded, Might gets
  **+15% all damage**, modeled as a **single instance** (`allDamageBoost 0.15`), not a 5%+10% split
  (your call, for simplicity). The existing def has +10%; **bump it to +15%** and confirm it's the
  while-shielded buff, not the post-shield Hardened Foe (which is out of scope — the shield isn't
  broken in a clean rotation). Set `shieldDamageBonus` per the T6 CN buff.
- **Rainwhisper** (`src/data/skills/buffs/rainwhisperShield.ts` = the Mo Blade Q shield; the 4pc crit
  buff) — **+15% crit DMG while a self shield is up**. Verify the 4pc crit-DMG-while-shielded buff
  exists and is +15% (`critDamageBoost 0.15`, gated on the shield being active).
- Shield source `rainwhisperShield` is triggered by Mo Blade Q, base duration 8.

## E. Removals

- **`shatteredRidgeDeflect`** — Might does NOT use Shattered Ridge. Do not add it to Might. (It stays
  on strength.)

## Class-def wiring (which bucket each buff lands in — Section 8)

- `debuffs`: `vulnerability`, `vulnerabilityWeapon`.
- `classBuffDefs`: `drumbeat`, `breakthrough`, `stonesplitMightChargedCrit`.
- inner-way / set buffs (`throatPierced`, AoR, Rainwhisper) attach via their inner way / set, not the
  class's `classBuffDefs` — they activate when that inner way is slotted / set equipped.
- `gateBuffs`: any gated on an inner-way param (throatPierced) go through the gate list.

## §Duration — DECIDED: model the extensions

Model the build's duration extensions as real modifiers, so the calc stays correct across gear swaps:

- **Formbend (set): +2s**, **Art of Resistance (inner way): +6s** — both extend the **HP shield** AND
  **Breakthrough** (AoR extends "the shield and the bonus effects of its source skill"; Breakthrough is
  a bonus effect of the shield's source, Mo Blade Q).
- Base durations stay at the game base: **shield 8s** (`rainwhisperShield`), **Breakthrough 12s**. With
  Formbend + AoR the effective values become **16s** and **20s**. (The reference `breakthrough.json`'s
  14 = 12 + Formbend only; use base 12 and let the modifiers do the rest.)
- **Code-verify:** confirm the engine supports set/inner-way duration extension on another buff. If it
  does, wire Formbend/AoR to extend `rainwhisperShield` and `breakthrough`. If it does NOT, fall back
  to baking (shield 16 / Breakthrough 20) **but note the shield is shared** — a Might-scoped shield
  variant would be needed to avoid changing other classes. Report which path before implementing.

## §Verify in code (small unknowns, cheap for Code to resolve)

- The exact **crit-rate stat key** for `stat(...)` (seen: `critDamageBoost`, `allDamageBoost`,
  `affinityDamageBoost`, `directAffinityRate` — crit *rate* not yet spotted; grep the engine).
- Whether `affects` accepts the `isCharged` property + a varied-combo tag, or needs explicit skill ids.
- Whether the `throatPierced` inner-way buff already has the `stonesplit_might` variant.
- Whether `resistanceResolve` models the while-shielded buff or Hardened Foe.

## Cross-ref: Section 8 (not buffs)

Martial-arts-talent base stats (Max Phys Attack, Stonesplit atk/pen/DMG bonus, Max HP, the +50%
attribute) → `baseStats/*.json` + `classSkillBoosts.json`; the latter scales with **Stonesplit Min**
(PR #14 correction). `classMindGroup` for Might's dual signature (Exquisite Scenery + AoR) and the
11-vs-8 inner-way reconciliation are also Section 8.
