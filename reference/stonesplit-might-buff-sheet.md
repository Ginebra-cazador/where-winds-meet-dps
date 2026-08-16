# Stonesplit Might — buff spec sheet (v2, post-refactor model)

Rewritten for the buff-inversion refactor (upstream PR #69). Goes in `reference/`. All values lvl 100,
build = Formbend armor + Rainwhisper weapon + AoR T6.

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
procs Drumbeat off spear Q, not spear Special.** If Special, add `spearSpecial` to its `triggersBuffs`.

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

### 2. AoR while-shielded — +10% all damage (NEW buff)
`resistanceResolve.ts` is the post-shield **Hardened Foe** (+10%, `activeAfterBuffEnds`), NOT this —
leave it alone. Create a new buff: `affectsAll: true`, `allDamageBoost 0.10`,
`requires: { param: artOfResistance, minTier: 6 }`, `requiresBuffActive: rainwhisperShield`. (AoR is +10%,
not 15% — earlier 15% was a translation artifact.) Hardened Foe barely fires (shield is maintained) —
out of scope.

### 3. Rainwhisper while-shielded — +15% crit DMG (NEW buff)
Rainwhisper is the weapon set, modeled as buffs (not a formal set), so gate on the shield:
`critDamageBoost 0.15`, `requiresBuffActive: rainwhisperShield`. Reaches all skills → `affectsAll: true`.

### 4. Throat-Pierce Might variant (NEW buff)
The shared `throatPierceBuffs/throatPierced.ts` is strength-shaped — do NOT branch it. Create a separate
Might-scoped buff: self physPen + crit DMG, Varied Combo enhances, Deflect maxes to 5 stacks, duration 12,
gated on the `throatPierced` inner-way param. Self-buff (player), not a boss debuff.

### 5. Conditional durations (function duration, no baking)
`rainwhisperShield` already uses a function duration — extend it:
```ts
// rainwhisperShield (shared — run buff-equivalence tests after):
duration: (ctx) => 8 + (ctx.build.paramTier(PARAM.artOfResistance) >= 6 ? 6 : 0) + FORMBEND_2
// breakthrough (Might-only, safe):
duration: (ctx) => 12 + (ctx.build.paramTier(PARAM.artOfResistance) >= 6 ? 6 : 0) + FORMBEND_2
```
- **AoR +6**: `ctx.build.paramTier(artOfResistance) >= 6` — clean.
- **Formbend +2**: Formbend is the armor set. If the calc reads the armor set (`ctx.build.armorSet ===
  <formbend>`), gate on it; **but Formbend must first exist as a selectable armor set** (Section 8). If
  the calc doesn't distinguish set slots, **hardcode +2** (user-approved fallback) — Formbend is fixed in
  the meta build. Keep AoR conditional either way.

## Class-def wiring (Section 8 — resolves the orphaned-buff test)
- `classBuffDefs`: `drumbeat`, `breakthrough`, `stonesplitMightChargedCrit`, the AoR buff, the Rainwhisper
  buff, the consume def. `vulnerability`/`vulnerabilityWeapon` too (they're `defineClassBuff`).
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
