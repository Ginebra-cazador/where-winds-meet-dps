import { defineSkill, dotTicks } from "../../../definitions/skills/skillDef"
import { ATTUNE, CAST, ROLE, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"
import { DRONE_INTERVAL_FRAMES, DRONE_TICK } from "./droneTick"

export const umbdrone26HitTick = defineSkill({
  id: SKILL.umbdrone26Hit,
  classId: "silkbindJade",
  name: "UmbDrone[26hit] Tick",
  tags: [WEAPON.umbrella, ATTUNE.umbSpecial, ROLE.umbDrone],
  skillType: "sustain",
  weaponOrAttribute: "Umbrella",
  attributeAttack: "Silkbind",
  castTag: CAST.umbDroneTick26hit,
  receives: [BUFF.soulShaken],
  elevatedAttributeMultiplier: false,
  castFrames: 0,
  triggerable: true,
  hits: dotTicks({
    count: 26,
    everyFrames: DRONE_INTERVAL_FRAMES,
    ...DRONE_TICK,
  }),
  createdAt: "2026-08-17T00:00:00.000Z",
  updatedAt: "2026-08-17T00:00:00.000Z",
})
