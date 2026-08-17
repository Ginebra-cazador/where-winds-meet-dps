import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { ATTACK, ATTUNE, CAST, PROP, ROLE, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"

const COEFFICIENTS = {
  physMultiplier: 1.80931,
  attributeMultiplier: 2.71382,
  physFixed: 501.7,
  attributeFixed: 272.6,
  extraCritDamage: 1,
}

export const fanheavypursuit3Hit = defineSkill({
  id: SKILL.fanheavypursuit3Hit,
  classId: "silkbindJade",
  name: "FanHeavyPursuit 3-Hit",
  breakdownName: "Moon Shatter Spring",
  tags: [
    PROP.isExecution,
    PROP.hasLowQiCritBoost,
    PROP.hasLowQiDmgBoost,
    WEAPON.fan,
    ATTACK.heavy,
    ATTUNE.fanSpecial,
    ROLE.fanHeavyPursuit,
  ],
  skillType: "weapon",
  weaponOrAttribute: "Fan",
  attributeAttack: "Silkbind",
  castTag: CAST.fanHeavyPursuit3Hit,
  receives: [BUFF.windWallPursuit, BUFF.lowQiFollowUp, BUFF.thunderousBloom],
  triggersBuffs: [BUFF.pursuitChargedBoost],
  castFrames: 90,
  triggerable: true,
  hits: [
    hit(0, { frame: 0, ...COEFFICIENTS }),
    hit(1, { frame: 30, ...COEFFICIENTS }),
    hit(2, { frame: 60, ...COEFFICIENTS }),
  ],
  createdAt: "2026-08-17T00:00:00.000Z",
  updatedAt: "2026-08-17T00:00:00.000Z",
})
