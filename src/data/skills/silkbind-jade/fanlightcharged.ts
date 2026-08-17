import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { ATTACK, ATTUNE, CAST, PROP, ROLE, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"

export const fanlightcharged = defineSkill({
  id: SKILL.fanlightcharged,
  classId: "silkbindJade",
  name: "FanLightCharged",
  tags: [PROP.isCharged, WEAPON.fan, ATTACK.light, ATTUNE.fanCharged, ROLE.fanLightCharged],
  skillType: "weapon",
  weaponOrAttribute: "Fan",
  attributeAttack: "Silkbind",
  castTag: CAST.fanLightCharged,
  receives: [BUFF.windWall, BUFF.pursuitChargedBoost, BUFF.thunderousBloom],
  triggersBuffs: [BUFF.lingeringBone],
  castFrames: 75,
  triggerable: true,
  hits: [
    hit(0, {
      frame: 0,
      physMultiplier: 2.76138,
      attributeMultiplier: 4.14207,
      physFixed: 764.15,
      attributeFixed: 416.15,
      extraCritDamage: 1,
    }),
  ],
  createdAt: "2026-08-17T00:00:00.000Z",
  updatedAt: "2026-08-17T00:00:00.000Z",
})
