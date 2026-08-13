import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { ATTACK, PROP, WEAPON } from "../ids"
import { SKILL } from "./ids"

export const mobladeheavycharge2bwPerception = defineSkill({
  id: SKILL.mobladeheavycharge2bwPerception,
  classId: "stonesplitMight",
  name: "MoBladeHeavyCharge-2BW[Perception]",
  tags: [PROP.isCharged, PROP.abrasionImmune, WEAPON.moBlade, ATTACK.charge, "attune:moBladeCharge"],
  skillType: "weapon",
  weaponOrAttribute: "Modao",
  attributeAttack: "Stonesplit",
  castTag: "cast:moBladeHeavyCharge2BWPerception",
  castFrames: 105,
  triggerable: true,
  hits: [
    hit(0, {
      frame: 0,
      physMultiplier: 3.6184,
      attributeMultiplier: 5.42765,
      physFixed: 1001,
      attributeFixed: 545,
    }),
    hit(1, {
      frame: 52,
      physMultiplier: 3.6184,
      attributeMultiplier: 5.42765,
      physFixed: 1001,
      attributeFixed: 545,
    }),
  ],
  createdAt: "2026-07-19T00:00:00.000Z",
  updatedAt: "2026-07-19T00:00:00.000Z",
})
