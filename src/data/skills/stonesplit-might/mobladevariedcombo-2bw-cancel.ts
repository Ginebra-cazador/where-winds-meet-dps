import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { castSkill } from "../../../definitions/skills/triggers"
import { ATTACK, PROP, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"

export const mobladevariedcombo2bwCancel = defineSkill({
  id: SKILL.mobladevariedcombo2bwCancel,
  classId: "stonesplitMight",
  name: "MoBladeVariedCombo-2BW[Cancel]",
  tags: [
    PROP.isCharged,
    PROP.abrasionImmune,
    WEAPON.moBlade,
    ATTACK.charge,
    "attune:moBladeCharge",
    "role:moBladeVariedCombo",
  ],
  skillType: "weapon",
  weaponOrAttribute: "Modao",
  attributeAttack: "Stonesplit",
  castTag: "cast:moBladeVariedCombo2BWCancel",
  castFrames: 37,
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
      physMultiplier: 2.6343,
      attributeMultiplier: 3.9514,
      physFixed: 729,
      attributeFixed: 397,
      triggers: [
        castSkill({
          target: SKILL.mobladevariedcombogroundslam2bw,
          stacks: 0,
        }),
      ],
    }),
  ],
  createdAt: "2026-07-19T00:00:00.000Z",
  updatedAt: "2026-07-19T00:00:00.000Z",
})
