import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { ATTACK, PROP, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"

export const mobladeheavycharge2bw = defineSkill({
  id: SKILL.mobladeheavycharge2bw,
  classId: "stonesplitMight",
  name: "MoBladeHeavyCharge-2BW",
  tags: [
    PROP.isCharged,
    PROP.abrasionImmune,
    WEAPON.moBlade,
    ATTACK.charge,
    "attune:moBladeCharge",
  ],
  skillType: "weapon",
  weaponOrAttribute: "Modao",
  attributeAttack: "Stonesplit",
  castTag: "cast:moBladeHeavyCharge2BW",
  castFrames: 226,
  triggerable: true,
  receives: [BUFF.drumbeat, BUFF.breakthrough, BUFF.stonesplitMightChargedCrit],
  hits: [
    hit(0, {
      frame: 0,
      physMultiplier: 3.6184,
      attributeMultiplier: 5.42765,
      physFixed: 1001,
      attributeFixed: 545,
    }),
    hit(1, {
      frame: 113,
      physMultiplier: 3.6184,
      attributeMultiplier: 5.42765,
      physFixed: 1001,
      attributeFixed: 545,
    }),
  ],
  createdAt: "2026-07-19T00:00:00.000Z",
  updatedAt: "2026-07-19T00:00:00.000Z",
})
