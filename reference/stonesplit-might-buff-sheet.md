# Stonesplit Might — buff spec sheet (v3)

**Canonical implementation spec for the buffs.** (The coefficient sheet is canonical for skill numbers;
`-buffs-and-talents.md` is research notes, not authoritative.) Goes in `reference/`. All values lvl 100,
build = Formbend armor + Rainwhisper weapon + AoR T6. Rewritten for the buff-inversion refactor (PR #69).

> **Two audit fixes required (both DPS-affecting, both `src/data`):**
> 1. **Shield-conditional buffs are inert** — `artOfResistanceShielded` and `rainwhisperShieldedCrit`
>    gate on the shield but nothing triggers them. Mo Blade Q must `triggersBuffs` all three (§3b).
> 2. **Rainwhisper base +10% crit DMG is unimplemented** — only the +15% shielded exists (§3).

Canonical values (supersede any conflicting statement in the research notes): **AoR = +10%**
while-shielded; **`resistanceResolve` = Hardened Foe** (post-shield, separate); Might's shield is
**`stonesplitMightShield`** (not the shared `rainwhisperShield`); **Drumbeat triggers off Spear Q**.

## The new authoring model (read first)

A buff is now **effects + activation policy only**. Reach and triggering moved onto the skills:

- **Reach:** a buff either sets `affectsAll: true` (hits every skill — "category 1") **or** sets no
  reach field ("category 2") and the skills that receive it list it in **`receives: [BUFF.x]`**.
- **Triggering:** the skill whose cast fires a buff lists it in **`triggersBuffs: [BUFF.x]`**. (Grants
  via `perCastConsume` are the exception — the consume def grants directly.)
- Removed from buff defs: `triggeredBy`, `affects`, `affectsProperty`, `affectsWeaponTypes`, `excludes`.
  `defineRejectsUnknownKeys` enforces this — stale keys fail tests.
- `TriggerSpec` no longer takes `id` (row index serves).

## Current state — Pass 1 DONE (adapted to the new model, committed)

Five buffs exist and are wired:

| Buff | reach | triggered by (skill's `triggersBuffs`) |
|---|---|---|
| `vulnerability` | `affectsAll: true` | 4 spear-special skills |
| `vulnerabilityWeapon` | `affectsAll: true` (Might uses both weapons ≡ all) | 4 spear-special skills |
| `drumbeat` | category 2 → charged skills `receives` | `spearq`, `spearq-prepull` (SEE §Drumbeat) |
| `breakthrough` | category 2 → charged skills `receives` | none yet — granted via consume (Pass 2) |
| `stonesplitMightChargedCrit` | category 2 → charged skills `receives`, `alwaysActive` | n/a |

Charged skills (8 heavy-charge + 2 varied-combo + ground-slam) declare
`receives: [drumbeat, breakthrough, stonesplitMightChargedCrit]`.

## §Drumbeat — which spear cast procs it (CONFIRM)

Reference lists spear Q + spear Heavy casts (not spear Special). Only `spearQ`/`spearQPrepull` match
Might skills, so Code wired Drumbeat to `spearq`/`spearq-prepull`. **Confirm the rotation actually
procs Drumbeat off spear Q, not spear Special.** **CONFIRMED (in-game): Spear Q.** Code wired
`spearq`/`spearq-prepull` → `triggersBuffs: [drumbeat]`. Settled — not provisional.

## Pass 2 — remaining buff work

### 1. Breakthrough consume (drumbeat → breakthrough, and refresh)
Model on `innerWays/steadfastDevotionBuffs/burningHeartIPConsume.ts`. One consume def on Mo Blade Q:
```ts
perCastConsume: {
  property: PROP.consumesDrumbeat,          // add this PROP tag to the mobladeq skill
  preferredFrom: [BUFF.breakthrough],       // check breakthrough first (refresh)
  from: BUFF.drumbeat,                       // else drumbeat (upgrade)
  grants: [
    { whenConsumedFrom: BUFF.drumbeat,      buffIds: [BUFF.breakthrough] },
    { whenConsumedFrom: BUFF.breakthrough,  buffIds: [BUFF.breakthrough] },
  ],
}
```
Drain-either / re-grant handles both upgrade and refresh; no double-count. Set `drumbeat` `maxStacks: 1`.
Edge: if a spear skill is cast during an active Breakthrough it re-adds Drumbeat — only a concern if the
rotation casts spear inside the Breakthrough window (pending §Drumbeat answer).

### 2. AoR while-shielded — +10% all damage (`artOfResistanceShielded`)
**AoR is +10% (canonical). The "+5% + 10% = 15%" reading was a translation artifact — discard it.**
`resistanceResolve.ts` is a SEPARATE mechanic: the post-shield **Hardened Foe** (+10%,
`activeAfterBuffEnds`), active *after* the shield ends — leave it untouched. This buff is the
*while-shielded* effect: `affectsAll: true`, `allDamageBoost 0.10`,
`requires: { param: artOfResistance, minTier: 6 }`, `requiresBuffActive: BUFF.stonesplitMightShield`.
Hardened Foe barely fires in a maintained-shield rotation — out of scope for DPS.

### 3. Rainwhisper crit — base +10% always, +15% more while shielded (two buffs)
Rainwhisper is the weapon set, modeled as buffs (not a formal set). It has **two** parts:
- **Base +10% crit DMG (unconditional):** an always-active buff — `affectsAll: true`,
  `alwaysActive: true`, `critDamageBoost 0.10`. **This must exist or the model undercounts.**
- **+15% crit DMG while shielded (`rainwhisperShieldedCrit`):** `affectsAll: true`,
  `critDamageBoost 0.15`, `requiresBuffActive: BUFF.stonesplitMightShield`.

### 3b. Shield triggering — REQUIRED for the conditional buffs to fire
`requiresBuffActive` is a **gate, not a trigger**. The two shield-conditional buffs
(`artOfResistanceShielded`, `rainwhisperShieldedCrit`) only *apply* while the shield is up, but they
still need their own trigger to activate. So **Mo Blade Q and `mobladeq-prepull` must list all three in
`triggersBuffs`:** `[stonesplitMightShield, artOfResistanceShielded, rainwhisperShieldedCrit]`. Without
this the two conditionals are inert (a silent DPS undercount).

### 4. Throat-Pierce Might variant (NEW buff)
The shared `throatPierceBuffs/throatPierced.ts` is strength-shaped — do NOT branch it. Create a separate
Might-scoped buff: self physPen + crit DMG, Varied Combo enhances, Deflect maxes to 5 stacks, duration 12,
gated on the `throatPierced` inner-way param. Self-buff (player), not a boss debuff.

### 5. Conditional durations (function duration, no baking)
The duration extension lives on the **Might-scoped `stonesplitMightShield`** (NOT the shared
`rainwhisperShield`, which stays untouched at its original 8s/12s to avoid regressing other classes) and
on `breakthrough` (Might-only):
```ts
// stonesplitMightShield (Might-scoped) and breakthrough:
duration: (ctx) => BASE + (ctx.build.paramTier(PARAM.artOfResistance) >= 6 ? 6 : 0) + 2  // BASE 8 / 12
```
- **AoR +6**: `ctx.build.paramTier(artOfResistance) >= 6` — conditional, correct across gear swaps.
- **Formbend +2**: **hardcoded — TEMPORARY FIXED-BUILD ASSUMPTION: Formbend 4-piece is always equipped.**
  Formbend is the armor set; the repo's context can read `armorSet`, but since the calc doesn't cleanly
  distinguish armor-vs-weapon set slots, the +2 is baked in. Correct for the meta build; would need a
  real `armorSet` read to support dropping Formbend.

## Class-def wiring (Section 8 — resolves the orphaned-buff test)
- `classBuffDefs`: `drumbeat`, `breakthrough`, `breakthroughConsume`, `stonesplitMightChargedCrit`,
  `vulnerability`, `vulnerabilityWeapon`, `artOfResistanceShielded`, `rainwhisperShieldedCrit`,
  `stonesplitMightShield`, `throatPiercedMight`, **and the Rainwhisper base +10% crit buff (§3)**. Every
  one must be listed or the buff-orphan / undercount problems return.
- Throat-Pierce Might variant attaches via the `throatPierce` inner way.
- This is what clears `classModuleBoundaries` (every class buff must be listed by a class).

## §Verify in code (cheap for Code)
- Confirm `directCritRate` still the crit-rate stat post-refactor (statRegistry was reworked).
- Confirm `affectsAll` vs `receives` for each new buff (Rainwhisper/AoR reach all; Throat-Pierce is self).

## Cross-ref: Section 8 (not buffs)
Martial-arts talents → base stats (`reference/baseStats/`) + `classSkillBoosts.json` (scales with
Stonesplit **Min**, PR #14 fix). Martial arts are now defined entities (`src/data/martialArts/`) — new
since the refactor; Might's two weapons (Thundercry Blade, Stormbreaker Spear) need entries. Formbend as
a selectable armor set. `classMindGroup` for Might's dual signature (Exquisite Scenery + AoR).
