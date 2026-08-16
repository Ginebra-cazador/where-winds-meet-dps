import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { ATTUNE, CAST, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"

export const spearspecial = defineSkill({
  id: SKILL.spearspecial,
  classId: "stonesplitMight",
  name: "SpearSpecial",
  tags: [WEAPON.stormbreakerSpear, ATTUNE.spearSpecial],
  skillType: "weapon",
  weaponOrAttribute: "Spear",
  attributeAttack: "Stonesplit",
  castTag: CAST.spearSpecial,
  castFrames: 49,
  triggerable: true,
  triggersBuffs: [BUFF.vulnerability, BUFF.vulnerabilityWeapon],
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
