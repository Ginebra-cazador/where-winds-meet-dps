// Ranges are the breakthrough-16 gear-tier rolls; labels follow the strength
// pattern (art name — skill DMG boost). No official English Attune Effect
// strings for Thundercry Blade / Stormbreaker Spear have been captured, so these
// labels are composed, not cited.
import type { AttunementOption } from "../../../engine/attunements"
import { ARMOR_SLOTS } from "../attunementSlots"

export const STONESPLIT_MIGHT_ATTUNEMENTS = [
  {
    id: "moBladeChargeDamage",
    label: "Thundercry Blade - Charged Skill DMG Boost",
    min: 0.036,
    max: 0.06,
    slots: ARMOR_SLOTS,
    classIds: ["stonesplitMight"],
    enginePath: "classSpecificAttunement.moBladeChargeDamage",
    affectsTag: "attune:moBladeCharge",
  },
  {
    id: "spearMartial",
    label: "Stormbreaker Spear - Martial Art Skill DMG Boost",
    min: 0.036,
    max: 0.06,
    slots: ARMOR_SLOTS,
    classIds: ["stonesplitMight"],
    enginePath: "classSpecificAttunement.spearMartial",
    affectsTag: "attune:spearMartial",
  },
] as const satisfies readonly AttunementOption[]
