// Ranges are the breakthrough-16 gear-tier rolls, and each label the official
// English Attune Effect name (in-game re-attuning preview, 2026-08-17;
// cross-checked against the client localization, which also carries
// "DMG Boost for Vernal Umbrella - Frequent Projectile Skill" — no roll range
// or slot list has been captured for that one, so it is not offered yet).
import type { AttunementOption } from "../../../engine/attunements"
import { ARMOR_SLOTS } from "../attunementSlots"

export const SILKBIND_JADE_ATTUNEMENTS = [
  {
    id: "umbQ",
    label: "Vernal Umbrella Martial Art Skill DMG Boost",
    min: 0.036,
    max: 0.06,
    slots: ARMOR_SLOTS,
    classIds: ["silkbindJade"],
    enginePath: "classSpecificAttunement.umbQ",
    affectsTag: "attune:umbQ",
  },
  {
    id: "umbCharged",
    label: "Vernal Umbrella Charged Skill DMG Boost",
    min: 0.036,
    max: 0.06,
    slots: ARMOR_SLOTS,
    classIds: ["silkbindJade"],
    enginePath: "classSpecificAttunement.umbCharged",
    affectsTag: "attune:umbCharged",
  },
  {
    id: "umbSpecial",
    label: "Vernal Umbrella Special Skill DMG Boost",
    min: 0.036,
    max: 0.06,
    slots: ARMOR_SLOTS,
    classIds: ["silkbindJade"],
    enginePath: "classSpecificAttunement.umbSpecial",
    affectsTag: "attune:umbSpecial",
  },
  {
    id: "fanQ",
    label: "Inkwell Fan Martial Art Skill DMG Boost",
    min: 0.036,
    max: 0.06,
    slots: ARMOR_SLOTS,
    classIds: ["silkbindJade"],
    enginePath: "classSpecificAttunement.fanQ",
    affectsTag: "attune:fanQ",
  },
  {
    id: "fanCharged",
    label: "Inkwell Fan Charged Skill DMG Boost",
    min: 0.036,
    max: 0.06,
    slots: ARMOR_SLOTS,
    classIds: ["silkbindJade"],
    enginePath: "classSpecificAttunement.fanCharged",
    affectsTag: "attune:fanCharged",
  },
  {
    id: "fanSpecial",
    label: "Inkwell Fan - Special and Pursuit Skill DMG Boost",
    min: 0.036,
    max: 0.06,
    slots: ARMOR_SLOTS,
    classIds: ["silkbindJade"],
    enginePath: "classSpecificAttunement.fanSpecial",
    affectsTag: "attune:fanSpecial",
  },
] as const satisfies readonly AttunementOption[]
