import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { ATTACK, ATTUNE, CAST, PROP, ROLE, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"

const COEFFICIENTS = {
  physMultiplier: 1.7173,
  attributeMultiplier: 2.576,
  physFixed: 396,
  attributeFixed: 221,
  extraCritDamage: 1,
}

export const umblightcharge = defineSkill({
  id: SKILL.umblightcharge,
  classId: "silkbindJade",
  name: "UmbLightCharge",
  tags: [
    PROP.isCharged,
    PROP.hasQiBreakPhysPen,
    WEAPON.umbrella,
    ATTACK.light,
    ATTUNE.umbCharged,
    ROLE.umbLightCharge,
  ],
  skillType: "sustain",
  weaponOrAttribute: "Umbrella",
  attributeAttack: "Silkbind",
  castTag: CAST.umbLightCharge,
  receives: [
    BUFF.combo,
    BUFF.comboUmbLightBonus,
    BUFF.windWall,
    BUFF.pursuitChargedBoost,
    BUFF.trajectorySkill,
    BUFF.thunderousBloom,
  ],
  castFrames: 147,
  triggerable: true,
  hits: [
    hit(0, { frame: 0, ...COEFFICIENTS }),
    hit(1, { frame: 10, ...COEFFICIENTS }),
    hit(2, { frame: 20, ...COEFFICIENTS }),
    hit(3, { frame: 30, ...COEFFICIENTS }),
    hit(4, { frame: 40, ...COEFFICIENTS }),
    hit(5, { frame: 50, ...COEFFICIENTS }),
  ],
  createdAt: "2026-08-17T00:00:00.000Z",
  updatedAt: "2026-08-17T00:00:00.000Z",
})
