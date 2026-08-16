import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { CAST, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"

export const spearqPrepull = defineSkill({
  id: SKILL.spearqPrepull,
  classId: "stonesplitMight",
  name: "SpearQ Prepull",
  tags: [WEAPON.stormbreakerSpear, "attune:spearMartial"],
  skillType: "weapon",
  weaponOrAttribute: "Spear",
  attributeAttack: "Stonesplit",
  castTag: CAST.spearQPrepull,
  castFrames: 0,
  triggerable: true,
  triggersBuffs: [BUFF.drumbeat],
  hits: [
    hit(0, {
      frame: 0,
      physMultiplier: 0,
      attributeMultiplier: 0,
      physFixed: 0,
      attributeFixed: 0,
    }),
  ],
  createdAt: "2026-07-19T00:00:00.000Z",
  updatedAt: "2026-07-19T00:00:00.000Z",
})
