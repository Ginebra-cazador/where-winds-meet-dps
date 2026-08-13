# Stonesplit Might — lvl-100 coefficient sheet (source of truth for Code)

This is the authoritative mapping for porting the `reference/classes/skills/stonesplit-power/*.json`
files into `defineSkill` modules under `src/data/skills/stonesplit-might/`. Every number here is
the **lvl-100 (Max Level)** value, verified against in-game screenshots and the WWMath-Add-on
`config.js` `to` block. Apply exactly; do not round differently or infer.

## How Code must apply this

For each reference file listed below:

1. Copy the skill into a `defineSkill` module, following the `stonesplit-strength` folder as the
   structural template.
2. **Change only the four coefficient fields on each hit:** `physMultiplier`, `attributeMultiplier`,
   `physFixed`, `attributeFixed`.
3. **Keep everything else byte-for-byte from the reference file:** `frame`, `castFrames`, `tags`,
   hit count, per-hit `id`, `extraCritDamage`, and existing `triggers` (except the one explicit
   trigger addition noted in §Wiring).
4. Rewrite identifiers only as the folder convention requires: `id` → `SKILL.<key>` (pinned in
   `ids.ts` as `stonesplitMight-<slug>`), `classId` → `"stonesplitMight"`, raw tag strings and
   `castTag` → the symbolic constants from `../ids`. The `stonesplitPower` prefix must not survive
   anywhere.
5. For a **multi-hit skill, every hit gets the same per-hit value** shown in the table (the reference
   already splits these equally; preserve that).
6. **Zero-damage stays zero.** If the reference hit is all-zero, leave it all-zero.
7. Touch only `src/data/`. Never `src/definitions/` or `src/engine/`. No Chinese in any file.

## Naming (locked, verified against the locale)

- Class id: `stonesplitMight`
- `displayName`: `Stonesplit Might`  (colon dropped, matching the `stonesplitStrength` sibling)
- Spec id: `stonesplit_might`
- `stonesplitPower` is the stale, unofficial holdover — discard it; map any reference use of it to
  `stonesplitMight`.

## Coefficient table (per hit, lvl 100)

| Reference file | physMult | attrMult | physFixed | attrFixed | hits | notes |
|---|---|---|---|---|---|---|
| `mobladeheavycharge-1bw` | 2.89475 | 4.3421 | 800.5 | 436 | 2 | both hits identical |
| `mobladeheavycharge-1bw-cancel` | 2.89475 | 4.3421 | 800.5 | 436 | 2 | same coeff as base; only castFrames differ |
| `mobladeheavycharge-1bw-perception` | 2.89475 | 4.3421 | 800.5 | 436 | 2 | same coeff as base; only castFrames differ |
| `mobladeheavycharge-1bw-perception-cancel` | 2.89475 | 4.3421 | 800.5 | 436 | 2 | same coeff as base; only castFrames differ |
| `mobladeheavycharge-2bw` | 3.6184 | 5.42765 | 1001 | 545 | 2 | both hits identical |
| `mobladeheavycharge-2bw-cancel` | 3.6184 | 5.42765 | 1001 | 545 | 2 | same coeff as base |
| `mobladeheavycharge-2bw-perception` | 3.6184 | 5.42765 | 1001 | 545 | 2 | same coeff as base |
| `mobladeheavycharge-2bw-perception-cancel` | 3.6184 | 5.42765 | 1001 | 545 | 2 | same coeff as base |
| `mobladevariedcombo-2bw` | 2.6343 | 3.9514 | 729 | 397 | 1 | triggers GroundSlam — see §Wiring |
| `mobladevariedcombo-2bw-cancel` | 2.6343 | 3.9514 | 729 | 397 | 1 | same coeff as base; faster castFrames |
| `mobladevariedcombogroundslam-2bw` | 1.6464 | 2.4696 | 455 | 248 | 1 | fired as a follow-up of Varied Combo |
| `spearspecial` | 1.13 | 1.695 | 313 | 171 | 1 | full hit ("Hit on Boss", PVE value) |
| `spearspecial-cancel` | 0.4843 | 0.7264 | 134 | 73 | 1 | **first-hit value, NOT the old 30%** — see §Spear cancel |
| `spearq` | 0.3151 | 0.4726 | 88 | 48 | 1 | config-only (no screenshot cross-check) |
| `spearspecial-prepull` | 1.13 | 1.695 | 313 | 171 | 1 | **keep castFrames 0** — mirrors `spearspecial`; see §Prepull |
| `spearspecial-cancel-prepull` | 0.4843 | 0.7264 | 134 | 73 | 1 | **keep castFrames 0** — mirrors `spearspecial-cancel`; see §Prepull |

These last two were written as zero in Batch 1 and need **correcting** to the values above (a small
Batch-1 fix, not a new file). Every other row is a fresh Batch 2–4 port.

### Zero-damage — keep all coefficient fields at 0

| Reference file | reason |
|---|---|
| `blockperception` | defensive, no damage (castFrames 15) |
| `deflect` | defensive, no damage (castFrames 25) |
| `mobladeq` | utility, no damage (castFrames 60) |
| `mobladeq-prepull` | prepull marker, no damage (castFrames 0) |
| `spearq-prepull` | prepull marker, no damage (castFrames 0) |

Exactly **5** files are all-zero. Note the split: the **Q** prepulls deal no damage (a gap-closer
lands nothing), but the **Spear Special** prepulls carry their counterpart's full damage — see
§Prepull.

## §Wiring — Varied Combo → Ground Slam

In-game, Varied Combo produces two damage instances back-to-back (weapon into the enemy, then into
the ground) and reads as one action. Ground Slam is a triggered follow-up with no separate cast time.
Add a `castSkill` trigger on the (single) hit of `mobladevariedcombo-2bw` targeting the Ground Slam
skill, mirroring exactly how `stonesplit-strength/phalanxcharged-s3.ts` fires `anxisoldiermodown`:

```ts
// import at top of mobladevariedcombo-2bw module:
import { castSkill } from "../../../definitions/skills/triggers"

// on the hit(0, { ... }) of mobladevariedcombo-2bw, add:
triggers: [
  castSkill({ id: "tg-moblade-varied-combo-cast", target: SKILL.<groundslam-key>, stacks: 0 }),
]
```

`SKILL.<groundslam-key>` is whatever key `ids.ts` pinned for `mobladevariedcombogroundslam-2bw` (use
the exact constant from the folder's `ids.ts`). Both reference files currently have `triggers: null`,
so this is the **only** trigger added; the Ground Slam skill itself gets no trigger. **Show the written
trigger for review before finalizing** — direction and timing are a judgment call, not mechanical.

## §Spear cancel — why 0.4843, not 0.339

Spear Special's full hit ("Stage 1, Hit on Boss") is 113% / 313 / 169.5% / 171 = the `spearspecial`
full value. The cancel captures only the first hit ("Stage 1, Hitting Boss") = 48.43% / 134 /
72.64% / 73, which is a self-consistent ~42.9% of full across all four fields and is the hit that
applies Vulnerable. The config's 0.339 was a legacy 30% approximation that matches no lvl-100 game
value. Use the first-hit value.

## §Prepull — why two prepulls carry damage

A prepull is cast just before the fight so its animation costs no fight time (`castFrames: 0`). The
reference splits the four prepull files deliberately: the **Q** prepulls (`mobladeq-prepull`,
`spearq-prepull`) are all-zero because a gap-closer lands no damage, but the **Spear Special**
prepulls carry their non-prepull counterpart's full damage — the hit still lands on the boss as
combat starts, so it counts, while the cast time is free. Hence `spearspecial-prepull` = full
`spearspecial`, and `spearspecial-cancel-prepull` = `spearspecial-cancel`, both at `castFrames: 0`.

(If the intent is instead that pre-pulled Spear Special applies Vulnerable with **no** HP damage,
these two revert to zero and Vulnerable is applied through the debuff system — a one-line change per
file. Confirm before relying on it.)

## Downstream captures (NOT part of the skill port — for later sections)

- **Vulnerable debuff** (Section 4/5): +8% HP and Qi damage taken, +8% more if the attacker uses
  Thundercry Blade or Stormbreaker Spear. Stonesplit Might uses both, so the full 16% always applies.
  Applied by Spear Special's first hit.
- **PR #14 corrections to apply at class-wiring time (Section 8):**
  - `classSkillBoosts.json`: the boost scales with **Stonesplit Min** (not Max); the scale-max field
    should reference the **Min** value, not Max.
  - `retunementPools.ts` L18: `["Max Phys", "Power", "Agility", "Max Stonesplit", "Min Phys", "Crit"]`.
  - `retunementPools.ts` L62: remove Affinity Rate Up (tanks don't have it).
- **Out of scope (confirmed):** 1st/2nd stage charge, "Insufficient Fighting Spirit" 0-bar charge,
  battle-will management. Always assume a full 3rd-stage charge and that the rotation supplies enough
  bars.
