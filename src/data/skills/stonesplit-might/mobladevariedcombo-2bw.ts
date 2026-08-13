import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { castSkill } from "../../../definitions/skills/triggers"
import { ATTACK, PROP, WEAPON } from "../ids"
import { SKILL } from "./ids"

export const mobladevariedcombo2bw = defineSkill({
  id: SKILL.mobladevariedcombo2bw,
  classId: "stonesplitMight",
  name: "MoBladeVariedCombo-2BW",
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
  castTag: "cast:moBladeVariedCombo2BW",
  castFrames: 60,
  triggerable: true,
  hits: [
    hit(0, {
      frame: 0,
      physMultiplier: 2.6343,
      attributeMultiplier: 3.9514,
      physFixed: 729,
      attributeFixed: 397,
      triggers: [
        castSkill({
          id: "tg-mobladevariedcombo-2bw-cast",
          target: SKILL.mobladevariedcombogroundslam2bw,
          stacks: 0,
        }),
      ],
    }),
  ],
  createdAt: "2026-07-19T00:00:00.000Z",
  updatedAt: "2026-07-19T00:00:00.000Z",
})
