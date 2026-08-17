// Ranges are the breakthrough-16 gear-tier rolls. No official in-game Attune
// Effect list has been captured for this class yet, so every label below is
// composed from the pattern the other classes' cited lists use — none is a
// cited official string, unlike `stonesplit-strength/attunements.ts`.
import type { AttunementOption } from "../../../engine/attunements"
import { ARMOR_SLOTS } from "../attunementSlots"

export const SILKBIND_JADE_ATTUNEMENTS = [
  {
    id: "umbQ",
    label: "Vernal Umbrella - Martial Art Skill DMG Boost",
    min: 0.036,
    max: 0.06,
    slots: ARMOR_SLOTS,
    classIds: ["silkbindJade"],
    enginePath: "classSpecificAttunement.umbQ",
    affectsTag: "attune:umbQ",
  },
  {
    id: "umbCharged",
    label: "Vernal Umbrella - Charged Skill DMG Boost",
    min: 0.036,
    max: 0.06,
    slots: ARMOR_SLOTS,
    classIds: ["silkbindJade"],
    enginePath: "classSpecificAttunement.umbCharged",
    affectsTag: "attune:umbCharged",
  },
  {
    id: "fanQ",
    label: "Inkwell Fan - Martial Art Skill DMG Boost",
    min: 0.036,
    max: 0.06,
    slots: ARMOR_SLOTS,
    classIds: ["silkbindJade"],
    enginePath: "classSpecificAttunement.fanQ",
    affectsTag: "attune:fanQ",
  },
  {
    id: "fanCharged",
    label: "Inkwell Fan - Charged Skill DMG Boost",
    min: 0.036,
    max: 0.06,
    slots: ARMOR_SLOTS,
    classIds: ["silkbindJade"],
    enginePath: "classSpecificAttunement.fanCharged",
    affectsTag: "attune:fanCharged",
  },
  {
    id: "fanSpecial",
    label: "Inkwell Fan - Special Skill DMG Boost",
    min: 0.036,
    max: 0.06,
    slots: ARMOR_SLOTS,
    classIds: ["silkbindJade"],
    enginePath: "classSpecificAttunement.fanSpecial",
    affectsTag: "attune:fanSpecial",
  },
] as const satisfies readonly AttunementOption[]
