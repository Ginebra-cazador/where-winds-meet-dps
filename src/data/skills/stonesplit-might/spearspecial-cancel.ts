import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { ATTUNE, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"

export const spearspecialCancel = defineSkill({
  id: SKILL.spearspecialCancel,
  classId: "stonesplitMight",
  name: "SpearSpecial[Cancel]",
  tags: [WEAPON.stormbreakerSpear, ATTUNE.spearSpecial],
  skillType: "weapon",
  weaponOrAttribute: "Spear",
  attributeAttack: "Stonesplit",
  castTag: "cast:spearSpecialCancel",
  castFrames: 49,
  triggerable: true,
  triggersBuffs: [BUFF.vulnerability, BUFF.vulnerabilityWeapon],
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
