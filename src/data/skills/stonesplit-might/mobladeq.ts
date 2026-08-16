import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { CAST, PROP, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"

export const mobladeq = defineSkill({
  id: SKILL.mobladeq,
  classId: "stonesplitMight",
  name: "MoBladeQ",
  tags: [WEAPON.moBlade, PROP.consumesDrumbeat],
  skillType: "weapon",
  weaponOrAttribute: "Modao",
  attributeAttack: "Stonesplit",
  castTag: CAST.moBladeQ,
  castFrames: 60,
  triggerable: true,
  triggersBuffs: [BUFF.stonesplitMightShield],
  hits: [
    hit(0, {
      frame: 0,
      physMultiplier: 0,
      attributeMultiplier: 0,
      physFixed: 0,
      attributeFixed: 0,
    }),
  ],
  createdAt: "2026-07-19T00:00:00.000Z",
  updatedAt: "2026-07-19T00:00:00.000Z",
})
