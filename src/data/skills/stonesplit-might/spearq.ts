import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { CAST, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"

export const spearq = defineSkill({
  id: SKILL.spearq,
  classId: "stonesplitMight",
  name: "SpearQ",
  tags: [WEAPON.stormbreakerSpear, "attune:spearMartial"],
  skillType: "weapon",
  weaponOrAttribute: "Spear",
  attributeAttack: "Stonesplit",
  castTag: CAST.spearQ,
  castFrames: 60,
  triggerable: true,
  triggersBuffs: [BUFF.drumbeat, BUFF.jadeware],
  hits: [
    hit(0, {
      frame: 0,
      physMultiplier: 0.3151,
      attributeMultiplier: 0.4726,
      physFixed: 88,
      attributeFixed: 48,
    }),
  ],
  createdAt: "2026-07-19T00:00:00.000Z",
  updatedAt: "2026-07-19T00:00:00.000Z",
})
