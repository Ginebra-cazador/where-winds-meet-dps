import { defineSkill, dotTicks } from "../../../definitions/skills/skillDef"
import { ATTUNE, CAST, ROLE, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"
import { DRONE_INTERVAL_FRAMES, DRONE_TICK } from "./droneTick"

export const umbdrone16HitTick = defineSkill({
  id: SKILL.umbdrone16Hit,
  classId: "silkbindJade",
  name: "UmbDrone[16hit] Tick",
  tags: [WEAPON.umbrella, ATTUNE.umbSpecial, ROLE.umbDrone],
  skillType: "sustain",
  weaponOrAttribute: "Umbrella",
  attributeAttack: "Silkbind",
  castTag: CAST.umbDroneTick16hit,
  receives: [BUFF.soulShaken, BUFF.thunderousBloom],
  elevatedAttributeMultiplier: false,
  castFrames: 0,
  triggerable: true,
  hits: dotTicks({
    count: 16,
    everyFrames: DRONE_INTERVAL_FRAMES,
    ...DRONE_TICK,
  }),
  createdAt: "2026-08-17T00:00:00.000Z",
  updatedAt: "2026-08-17T00:00:00.000Z",
})
