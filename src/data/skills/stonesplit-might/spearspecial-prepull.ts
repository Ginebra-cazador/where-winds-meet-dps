import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { WEAPON, ATTUNE } from "../ids"
import { SKILL } from "./ids"

export const spearspecialPrepull = defineSkill({
  id: SKILL.spearspecialPrepull,
  classId: "stonesplitMight",
  name: "SpearSpecial Prepull",
  tags: [WEAPON.stormbreakerSpear, ATTUNE.spearSpecial],
  skillType: "weapon",
  weaponOrAttribute: "Spear",
  attributeAttack: "Stonesplit",
  castTag: "cast:spearSpecialPrepull",
  castFrames: 0,
  triggerable: true,
  hits: [
    hit(0, {
      frame: 0,
      physMultiplier: 1.13,
      attributeMultiplier: 1.695,
      physFixed: 313,
      attributeFixed: 171,
    }),
  ],
  createdAt: "2026-07-19T00:00:00.000Z",
  updatedAt: "2026-07-19T00:00:00.000Z",
})
