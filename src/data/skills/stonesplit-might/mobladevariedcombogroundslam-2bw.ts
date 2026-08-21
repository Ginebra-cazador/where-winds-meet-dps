import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { ATTACK, PROP, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"

export const mobladevariedcombogroundslam2bw = defineSkill({
  id: SKILL.mobladevariedcombogroundslam2bw,
  classId: "stonesplitMight",
  name: "MoBladeVariedComboGroundSlam-2BW",
  tags: [
    PROP.isCharged,
    PROP.abrasionImmune,
    WEAPON.moBlade,
    ATTACK.charge,
    // Ground Slam receives the Mo Blade Charge Damage attunement: intended
    // behavior. The live game does not apply it here — treated as a bug.
    "attune:moBladeCharge",
    "role:moBladeVariedCombo",
  ],
  skillType: "weapon",
  weaponOrAttribute: "Modao",
  attributeAttack: "Stonesplit",
  castTag: "cast:moBladeVariedComboGroundSlam2BW",
  castFrames: 0,
  triggerable: true,
  triggersBuffs: [BUFF.throatPiercedMight],
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
      physMultiplier: 1.6464,
      attributeMultiplier: 2.4696,
      physFixed: 455,
      attributeFixed: 248,
    }),
  ],
  createdAt: "2026-07-19T00:00:00.000Z",
  updatedAt: "2026-07-19T00:00:00.000Z",
})
