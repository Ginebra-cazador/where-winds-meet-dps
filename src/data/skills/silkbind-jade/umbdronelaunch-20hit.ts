import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { applyDebuff } from "../../../definitions/skills/triggers"
import { ATTACK, CAST, PROP, ROLE, WEAPON } from "../ids"
import { SKILL, DEBUFF } from "./ids"

export const umbdronelaunch20Hit = defineSkill({
  id: SKILL.umbdronelaunch20Hit,
  classId: "silkbindJade",
  name: "UmbDroneLaunch[20hit]",
  tags: [PROP.hasQiBreakPhysPen, WEAPON.umbrella, ATTACK.heavy, ROLE.umbDrone, ROLE.umbDroneLaunch],
  skillType: "weapon",
  weaponOrAttribute: "Umbrella",
  attributeAttack: "Silkbind",
  castTag: CAST.umbDroneLaunch20hit,
  castFrames: 68,
  triggerable: true,
  hits: [
    hit(0, {
      frame: 0,
      physMultiplier: 0.54,
      attributeMultiplier: 0.81,
      physFixed: 148,
      attributeFixed: 81.5,
      extraCritDamage: 1,
      triggers: [applyDebuff({ target: DEBUFF.umbdrone20Hit })],
    }),
  ],
  createdAt: "2026-08-17T00:00:00.000Z",
  updatedAt: "2026-08-17T00:00:00.000Z",
})
