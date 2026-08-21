import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { ATTACK, PROP, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"

export const mobladeheavycharge2bwCancel = defineSkill({
  id: SKILL.mobladeheavycharge2bwCancel,
  classId: "stonesplitMight",
  name: "MoBladeHeavyCharge-2BW[Cancel]",
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
  castTag: "cast:moBladeHeavyCharge2BWCancel",
  castFrames: 176,
  triggerable: true,
  receives: [
    BUFF.drumbeat,
    BUFF.breakthrough,
    BUFF.stonesplitMightChargedCrit,
    BUFF.battleAnthemChargedDamage,
    BUFF.battleAnthemEnduranceBoost,
  ],
  hits: [
    hit(0, {
      frame: 0,
      physMultiplier: 3.6184,
      attributeMultiplier: 5.42765,
      physFixed: 1001,
      attributeFixed: 545,
    }),
    hit(1, {
      frame: 88,
      physMultiplier: 3.6184,
      attributeMultiplier: 5.42765,
      physFixed: 1001,
      attributeFixed: 545,
    }),
  ],
  createdAt: "2026-07-19T00:00:00.000Z",
  updatedAt: "2026-07-19T00:00:00.000Z",
})
