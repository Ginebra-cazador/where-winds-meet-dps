import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { WEAPON, ATTUNE } from "../ids"
import { SKILL } from "./ids"

export const spearspecialCancelPrepull = defineSkill({
  id: SKILL.spearspecialCancelPrepull,
  classId: "stonesplitMight",
  name: "SpearSpecial[Cancel] Prepull",
  tags: [WEAPON.stormbreakerSpear, ATTUNE.spearSpecial],
  skillType: "weapon",
  weaponOrAttribute: "Spear",
  attributeAttack: "Stonesplit",
  castTag: "cast:spearSpecialCancelPrepull",
  castFrames: 0,
  triggerable: true,
  hits: [
    hit(0, {
      frame: 0,
      physMultiplier: 0.4843,
      attributeMultiplier: 0.7264,
      physFixed: 134,
      attributeFixed: 73,
    }),
  ],
  createdAt: "2026-07-19T00:00:00.000Z",
  updatedAt: "2026-07-19T00:00:00.000Z",
})
