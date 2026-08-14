# Stonesplit Might — buffs & talents working notes

Companion to `stonesplit-might-coefficients.md`. Goes in `reference/` (never `docs/` — the
`docsStayGeneral` gate forbids specific skill/class names there). This is the source of truth for
the Section 4/5 (buffs/debuffs) and Section 8 (class wiring) work. Values are lvl 100, talents
assumed maxed (100%).

## Corrections applied (from in-game screenshots)

- **Throat-Pierced is a SELF-BUFF on the player, not a boss debuff.** Each stack: the player ignores
  2 of the target's Physical Resistance and gains +2% Crit DMG; enhanced to 3 / +3% when casting
  Varied Combo (and assist trigger/effects). **Deflect maxes it to 5 stacks.** Duration 12s.
- **Breakthrough = 12s** (game screenshot), not the reference's 14s. Use 12 unless verified otherwise.
- **Might does NOT use Shattered Ridge.** It uses the **Rainwhisper** and **Formbend** sets. Drop
  `shatteredRidgeDeflect` from Might entirely.
- **Martial Arts Talents are assumed always 100% (maxed)** for every player; the values below are the
  lvl-100 figures.

## Already modeled in the repo (little or no new work)

- **Rainwhisper set** → `src/data/skills/buffs/rainwhisperShield.ts` exists.
- **Art of Resistance** → `src/data/skills/buffs/resistanceResolve.ts` (verify this is Art of
  Resistance).
- **Throat-Pierce inner way** → `src/data/innerWays/throatPierce.ts` exists with
  `buffParam: throatPierced` and `buffDefs: [throatPierced]`. The **Might-specific variant** (triggers
  MoBladeVariedCombo, 2 stacks/cast, Deflect→5) may still need adding to
  `throatPierceBuffs/throatPierced.ts` — TO VERIFY.
- **Martial Arts Talent stat bonuses** are handled by the shared base-stats layer
  (`src/data/baseStats/*.json` + `engine/buffs/levelAttributeBonus.ts`), NOT hand-written per class.
  So most talent numbers below are data for Section 8 wiring, not new buff-defs.

## Class-specific buff work that remains

### 1. Debuffs on the boss — Vulnerability (Section 4)
- `vulnerability`: +8% all damage taken. `vulnerabilityWeapon`: +8% for Mo Blade + Stormbreaker Spear
  damage. Might uses both weapons, so **16% total**. Both triggered by all four Spear Special variants
  (incl. both prepulls), duration 16.

### 2. Charged-skill damage chain — self-buffs (classBuffDefs)
- `drumbeat`: **+15%** to `isCharged` skills, from Spear casts, 6s, overridden by breakthrough.
- `breakthrough`: **+42%** to `isCharged` skills, from Mo Blade Q, **12s**, upgrades/refreshes from
  drumbeat. This is where the +42% we kept OUT of coefficients lives; the heavy-charge skills carry
  `isCharged`, so whichever is active multiplies them.

### 3. Charged-skill crit — self-buff (classBuffDef; pattern = strength's `skillCritDamage`)
Strength models an always-active `stonesplitStrengthSkillCritDamage` (+21% critDamageBoost). Might's
equivalent covers the Mo Blade talent crit, but scoped to charged/varied combo (`affects:` the
charged tags, not `null`):
- **+10% Crit DMG** on Charged Skill + Varied Combo (Charge Calculation Enhancement).
- **Crit Rate +9%, plus up to +15% from Max HP → +24% at ≥90k HP** (Charge Critical Hit Enhancement).
  Current HP 145,263 > 90k, so the HP portion is maxed. TO CONFIRM whether crit-rate belongs here or
  in the talent/baseStats layer.

### 4. Throat-Pierced Might variant (throatPierce inner way)
Self-buff: physPen + crit DMG, enhanced by Varied Combo, Deflect maxes to 5 stacks, duration 12.
Add the Might variant to the existing inner-way buff if not present.

## Martial Arts Talents → base-stats / classSkillBoosts (Section 8 wiring)

Thundercry Blade (Mo Blade), all "Effective 100%":
- Charge Calculation Enhancement: charged/varied never Abrasion, +10% Crit DMG; +4 Max Phys Attack per
  5,000 Max HP up to +120 at 150k HP.
- Physical Attack UP: +Max Phys Attack from higher of Constitution/Power (≈73.9 now; max at 280).
- Charge Critical Hit Enhancement: +9% crit rate on charged/varied, +1%/6,000 Max HP up to +15%.
- Stonesplit Attribute UP: +Stonesplit Attack 98–196; +Stonesplit Penetration from Min Stonesplit
  Attack (≈22 now; max at 328 Min).
- Attr. Attack DMG UP: Stonesplit Attack deals **+50% bonus damage** → this is the attribute multiplier
  (class def `attributeMultiplier`, 51.5 on the strength sibling). Likely already handled — verify.

Stormbreaker Spear, all "Effective 100%":
- Max Battle Will Increase: +1 bar, +1 more at ≥50k HP → +2 bars (battle-will system is out of scope).
- Max HP UP: +Max HP from higher of Body/Power (≈2800 now).
- DMG Reduction Enhancement: defensive (up to −30% phys damage taken after charged hits) — not output.
- Stonesplit Attribute UP: +Stonesplit Attack 98–196; +Stonesplit DMG Bonus (≈11% now; max at 328 Min).

**Connection to the PR #14 correction:** these "Stonesplit Attribute UP" talents scale off **Min
Stonesplit Attack** — which is exactly why `classSkillBoosts.json` must scale with Stonesplit **Min**
(and its scale-max field reference the Min value), as noted earlier.

## Buff timing & uptime (from the actual rotation)

The engine computes buff uptime from the rotation timeline, so the buff-defs need correct **effective
durations** (build-specific extensions baked in) and the right trigger/upgrade wiring:

- **Drumbeat** — spear cast → +15% charged, **6s**.
- **Breakthrough** — cast Mo Blade Q *while Drumbeat is active* → Drumbeat upgrades to Breakthrough,
  +42% charged. **Effective 20s** = 12 base + 2 (Formbend) + 6 (AoR). Recasting Mo Blade Q within the
  window refreshes it. (Reference json says 14 — that's base+Formbend only; the build value is 20.)
- **Mo Blade Q HP shield** — **effective 16s** = 8 base (`rainwhisperShield`) + 2 (Formbend) + 6 (AoR).
- **Result:** ~16s of "all buffs up" (shield → AoR +15% + Rainwhisper +15% crit DMG + Breakthrough
  +42%), then a ~4s Breakthrough-only tail before the next Mo Blade Q refresh. In practice the rotation
  recasts to keep both up, so treat shield + Breakthrough as **maintained through the burst**.
- **Hardened Foe** (post-shield +10%) requires the shield to be *broken* while active — does not happen
  in a clean DPS rotation, so **out of scope**. (This is likely what the current `resistanceResolve`
  models; the while-shielded +5%/+10% is the part we actually need.)

**Open modeling decision:** bake effective durations (shield 16s, Breakthrough 20s) assuming the
Formbend + AoR-T6 build, vs. modeling the +2/+6 extensions as separate duration modifiers. Baking is
simpler for a fixed-build calc; confirm before writing.

## Sets — HP-shield theme (affects damage, needs a scope decision)

**HP shield source (confirmed in code):** Mo Blade Q grants an **8s HP shield** (`rainwhisperShield.ts`,
triggered by `moBladeQ`/`moBladeQPrepull`). Mo Blade Q also triggers Breakthrough (12s), so one cast
lights up the shield window and the charged-skill buff together.

**Art of Resistance (Tier 6) — while shielded, +15% total in two instances** (per tooltip):
- +5% all damage/healing ("under the protection of HP shield")
- +10% all damage dealt ("under HP Shield protection")
- (+10% HP absorbed = defensive, ignore for DPS. Hardened Foe = +10% for 12s *after* shield breaks.)
- Partially modeled today as `resistanceResolve.ts` (+10%, T6-gated). TO VERIFY: whether the +5% is
  present, and whether the existing def is the while-shielded buff or the post-shield Hardened Foe.

- **Rainwhisper 4pc**: +10% all Crit DMG, +15% MORE with a self HP shield (→ +25% with shield).
- **Formbend 4pc**: defensive (+2s shield; −20% HP damage taken above 85% Qi / with Qi-immunity shield).

## Inner ways (mind methods) — per-tier attribute bonuses (lvl-100 `to` values)

Shared mind methods; most already exist in the repo with these values (strength uses several), so
Might mostly just lists which it allows. Stonesplit-flavoured ones (carry `minStonesplit` /
`stonesplitPen`) are the clearly Might-relevant ones.

| Inner way | key | tier-6 bonuses |
|---|---|---|
| Morale Chant | moraleChant | minPhys 23.6, maxPhys 47.2, directCrit 0.046 |
| Seasonal Edge | seasonalEdge | minPhys 23.6, maxPhys 47.2, physDmgBonus 0.028 |
| Breaking Point | breakingPoint | precision 0.065, directCrit 0.041 |
| Fivefold Bleed | fivefoldBleed | maxPhys 56.7, critDmg 0.035 |
| Invigorated Warrior | invigoratedWarrior | minPhys 63.8, physPen 5.1 |
| Exquisite Scenery | exquisiteScenery | crit 0.086, critDmg 0.044 |
| Battle Anthem | battleAnthem | affinity 0.039, affinityDmgBonus 0.052 |
| Adaptive Steel | adaptiveSteel | maxBellstrike 36.2 — **Bellstrike, not Might** |
| **Art of Resistance [CN buff]** | artOfResistance | minStonesplit 12.7, maxStonesplit 25.3, stonesplitPen 6, **shieldDamageBonus 0.10 @ T6** |
| Throat-Piercing Art | throatPierced | minStonesplit 12.1, maxStonesplit 24.1, stonesplitPen 6 |
| Bitter Seasons | bitterSeasons | precision 0.065, physDmgBonus 0.025 |

**The one real change:** only **Art of Resistance** moved — it gained an extra 5% shielded-damage buff
(shieldDamageBonus 0.05 → **0.10** at tier 6), the CN buff, applied **while shielded (Mo Blade Q)**.
Everything else matches existing repo values. So the inner-way work is: confirm these values are in the
repo, and apply the Art of Resistance shield-buff bump for Might.

### Inner-way build & signatures (4 slots, freely chosen in-game)

- **Meta build:** Morale Chant, Exquisite Scenery, Art of Resistance, + (Throat-Piercing Art **or**
  Battle Anthem).
- **Alternatives:** Adaptive Steel T0, Breaking Point.
- **Might's signatures (school path):** **Exquisite Scenery + Art of Resistance** (two, not one).
- **Throat-Piercing Art (TPA)** is signature for **Stonesplit** but belongs to **Strength**, not Might —
  which is why it still grants Stonesplit buffs when Might slots it. Might can slot it, but it's not a
  Might signature.
- Wiring nuance (Section 8): the class def's `classMindGroup` is a single value, but Might has two
  signatures. Need to check whether `classMindGroup` is one inner way or a path-group id (Umbra uses
  the string `"swordHorizon"`; strength uses `INNER_WAY_ID.frostCladNight`). Also reconcile the
  calculator's 11 inner ways vs the repo's 8.

## Open questions (updated)

1. ~~Per-solo-mode-level list~~ — **answered** (inner-way table).
2. **allowedMindMethods + classMindGroup** — **answered on build**: meta is Morale Chant / Exquisite
   Scenery / AoR / (TPA or Battle Anthem), alts Adaptive Steel T0 + Breaking Point; signatures are
   Exquisite Scenery + AoR. Remaining Section-8 detail: how `classMindGroup` encodes two signatures,
   and reconciling the 11-vs-8 inner-way count.
3. ~~HP-shield uptime~~ — **answered**: shield + Breakthrough maintained through the burst; shield
   effective 16s, Breakthrough 20s. Shield-conditional buffs (AoR +15%, Rainwhisper +15%) are active
   during the damage skills.
4. **Charged crit placement** — model +10% crit DMG / +24% crit rate as an always-active class buff on
   charged/varied, or via the talent/baseStats layer?
5. **Duration modeling** — bake effective durations (shield 16s / Breakthrough 20s) for the fixed
   Formbend + AoR-T6 build, or model the +2/+6 extensions separately?

## Inner ways — per-tier attribute bonuses (from calculator, lvl-100 `to` values)

The key finding: **Art of Resistance is the only Might-relevant change, and it's already in the repo.**
`resistanceResolve.ts` gates on `param: artOfResistance, minTier: 6`, gives `allDamageBoost 0.1`
(+10%, = the CN-buffed tier-6 `shieldDamageBonus: 0.1`), and is tied to `rainwhisperShield`. So the
"+5% while shielded (Mo Blade Q)" delta is already reflected — verify the 0.1 matches and no more.

Mo Blade Q is the lynchpin: it triggers **Breakthrough** (+42% charged) AND grants the HP shield that
enables Art of Resistance (+10%) and Rainwhisper (+15% crit DMG). So during the Mo Blade Q window the
shielded bonuses are up.

Each inner way gives tier4/5/6 attribute bonuses (tier = "solo mode level"). lvl-100 `to`, tier 6:

| Inner way | tier-6 bonuses |
|---|---|
| Morale Chant | minPhys 23.6, maxPhys 47.2, directCrit 0.046 |
| Seasonal Edge | minPhys 23.6, maxPhys 47.2, physDmgBonus 0.028 |
| Breaking Point | precision 0.065, directCrit 0.041 |
| Fivefold Bleed | maxPhys 56.7, critDmg 0.035 |
| Invigorated Warrior | minPhys 63.8, physPen 5.1 |
| Exquisite Scenery | crit 0.086, critDmg 0.044 (crit patched 0.082→0.086) |
| Battle Anthem | affinity 0.039, affinityDmgBonus 0.052 (affinity patched 0.037→0.039) |
| Adaptive Steel | maxBellstrike 36.2, bellstrikeDmgBonus 0.03 (Bellstrike — not Might) |
| Art of Resistance [CN] | minStonesplit 12.7, maxStonesplit 25.3, stonesplitPen 6, shieldDamageBonus 0.1 |
| Throat-Piercing Art | minStonesplit 12.1, maxStonesplit 24.1, stonesplitPen 6 |
| Bitter Seasons | precision 0.065, physDmgBonus 0.025 |

Repo already has inner ways: bitterSeason, frostCladNight, insightfulStrike, moraleChant,
steadfastDevotion, swordHorizon, throatPierce, wolfchasersArt (+ artOfResistance as a param). Repo
naming does not map 1:1 to the calculator's English names — reconciling that, and confirming which
inner ways Might can slot (`allowedMindMethods`), is Section 8 (class wiring) work.

**Still open:** which inner ways does Might's build actually slot? That sets `allowedMindMethods` and
`classMindGroup`.
