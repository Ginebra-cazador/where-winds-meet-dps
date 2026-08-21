import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { ATTACK, PROP, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"

export const mobladeheavycharge1bwCancel = defineSkill({
  id: SKILL.mobladeheavycharge1bwCancel,
  classId: "stonesplitMight",
  name: "MoBladeHeavyCharge-1BW[Cancel]",
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
  castTag: "cast:moBladeHeavyCharge1BWCancel",
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
      physMultiplier: 2.89475,
      attributeMultiplier: 4.3421,
      physFixed: 800.5,
      attributeFixed: 436,
    }),
    hit(1, {
      frame: 88,
      physMultiplier: 2.89475,
      attributeMultiplier: 4.3421,
      physFixed: 800.5,
      attributeFixed: 436,
    }),
  ],
  createdAt: "2026-07-19T00:00:00.000Z",
  updatedAt: "2026-07-19T00:00:00.000Z",
})
