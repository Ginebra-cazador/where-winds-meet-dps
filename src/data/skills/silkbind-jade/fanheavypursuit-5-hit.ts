import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { ATTACK, ATTUNE, CAST, PROP, ROLE, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"

const COEFFICIENTS = {
  physMultiplier: 4.376825,
  attributeMultiplier: 6.56531,
  physFixed: 1210.75,
  attributeFixed: 659.75,
  extraCritDamage: 1,
}

export const fanheavypursuit5Hit = defineSkill({
  id: SKILL.fanheavypursuit5Hit,
  classId: "silkbindJade",
  name: "FanHeavyPursuit 5-Hit",
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
  castTag: CAST.fanHeavyPursuit5Hit,
  receives: [BUFF.windWallPursuit],
  triggersBuffs: [BUFF.pursuitChargedBoost],
  castFrames: 150,
  triggerable: true,
  hits: [
    hit(0, { frame: 0, ...COEFFICIENTS }),
    hit(1, { frame: 30, ...COEFFICIENTS }),
    hit(2, { frame: 60, ...COEFFICIENTS }),
    hit(3, { frame: 90, ...COEFFICIENTS }),
    hit(4, { frame: 120, ...COEFFICIENTS }),
  ],
  createdAt: "2026-08-17T00:00:00.000Z",
  updatedAt: "2026-08-17T00:00:00.000Z",
})
