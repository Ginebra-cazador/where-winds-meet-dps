import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { ATTACK, CAST, ROLE, WEAPON } from "../ids"
import { SKILL } from "./ids"

const COEFFICIENTS = {
  physMultiplier: 1.7001,
  attributeMultiplier: 2.5502,
  physFixed: 471,
  attributeFixed: 256,
  extraCritDamage: 0,
}

export const umbHeavylight = defineSkill({
  id: SKILL.umbHeavylight,
  classId: "silkbindJade",
  name: "Umb HeavyLight",
  tags: [WEAPON.umbrella, ATTACK.mixed, ROLE.umbHeavyLight],
  skillType: "weapon",
  weaponOrAttribute: "Umbrella",
  attributeAttack: "Silkbind",
  castTag: CAST.umbHeavyLight,
  castFrames: 75,
  triggerable: true,
  hits: [
    hit(0, { frame: 0, ...COEFFICIENTS }),
    hit(1, { frame: 25, ...COEFFICIENTS }),
    hit(2, { frame: 50, ...COEFFICIENTS }),
  ],
  createdAt: "2026-08-17T00:00:00.000Z",
  updatedAt: "2026-08-17T00:00:00.000Z",
})
