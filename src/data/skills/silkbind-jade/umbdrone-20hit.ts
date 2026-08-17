import { defineSkill, dotTicks } from "../../../definitions/skills/skillDef"
import { ATTACK, ATTUNE, CAST, ROLE, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"
import { DRONE_INTERVAL_FRAMES, DRONE_TICK } from "./droneTick"

export const umbdrone20HitTick = defineSkill({
  id: SKILL.umbdrone20Hit,
  classId: "silkbindJade",
  name: "UmbDrone[20hit] Tick",
  tags: [WEAPON.umbrella, ATTACK.light, ATTUNE.umbSpecial, ROLE.umbDrone],
  skillType: "sustain",
  weaponOrAttribute: "Umbrella",
  attributeAttack: "Silkbind",
  castTag: CAST.umbDroneTick20hit,
  receives: [BUFF.soulShaken, BUFF.thunderousBloom],
  elevatedAttributeMultiplier: false,
  castFrames: 0,
  triggerable: true,
  hits: dotTicks({
    count: 20,
    everyFrames: DRONE_INTERVAL_FRAMES,
    ...DRONE_TICK,
  }),
  createdAt: "2026-08-17T00:00:00.000Z",
  updatedAt: "2026-08-17T00:00:00.000Z",
})
