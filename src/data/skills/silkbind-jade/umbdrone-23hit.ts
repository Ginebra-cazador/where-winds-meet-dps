import { defineSkill, dotTicks } from "../../../definitions/skills/skillDef"
import { ATTACK, ATTUNE, CAST, ROLE, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"
import { DRONE_INTERVAL_FRAMES, DRONE_TICK } from "./droneTick"

export const umbdrone23HitTick = defineSkill({
  id: SKILL.umbdrone23Hit,
  classId: "silkbindJade",
  name: "UmbDrone[23hit] Tick",
  tags: [WEAPON.umbrella, ATTACK.light, ATTUNE.umbSpecial, ROLE.umbDrone],
  skillType: "sustain",
  weaponOrAttribute: "Umbrella",
  attributeAttack: "Silkbind",
  castTag: CAST.umbDroneTick23hit,
  receives: [BUFF.soulShaken, BUFF.thunderousBloom, BUFF.combo, BUFF.windWall],
  elevatedAttributeMultiplier: false,
  castFrames: 0,
  triggerable: true,
  hits: dotTicks({
    count: 23,
    everyFrames: DRONE_INTERVAL_FRAMES,
    ...DRONE_TICK,
  }),
  createdAt: "2026-08-17T00:00:00.000Z",
  updatedAt: "2026-08-17T00:00:00.000Z",
})
