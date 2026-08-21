import { defineSkill, hit } from "../../../definitions/skills/skillDef"
import { CAST, WEAPON } from "../ids"
import { BUFF } from "../buffs/ids"
import { SKILL } from "./ids"

export const mobladeqPrepull = defineSkill({
  id: SKILL.mobladeqPrepull,
  classId: "stonesplitMight",
  name: "MoBladeQ Prepull",
  tags: [WEAPON.moBlade],
  skillType: "weapon",
  weaponOrAttribute: "Modao",
  attributeAttack: "Stonesplit",
  castTag: CAST.moBladeQPrepull,
  castFrames: 0,
  triggerable: true,
  triggersBuffs: [
    BUFF.stonesplitMightShield,
    BUFF.artOfResistanceShielded,
    BUFF.rainwhisperShieldedCrit,
    BUFF.breakthrough,
  ],
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
