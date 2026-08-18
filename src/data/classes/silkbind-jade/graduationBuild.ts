import type { GraduationBuild } from "../../../definitions/classes/classDef"
import { SET_ID } from "../../sets/ids"
import { createGraduationGearPiece } from "../graduationGear"

const idPrefix = "graduation-silkbind-jade"

export const SILKBIND_JADE_GRADUATION_BUILD: GraduationBuild = {
  gear: [
    createGraduationGearPiece({
      idPrefix,
      slot: "leftWeapon",
      words: ["maxPhys", "maxPhys", "power", "agility", "crit"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "rightWeapon",
      words: ["maxPhys", "maxPhys", "power", "crit", "umbrellaBoost"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "disc",
      words: ["maxPhys", "maxPhys", "power", "allMartialBoost", "crit"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "pendant",
      words: ["maxPhys", "maxPhys", "power", "allMartialBoost", "crit"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "helm",
      words: ["crit", "crit", "maxPhys", "power", "minPhys"],
      attunement: "umbSpecial",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "armor",
      words: ["precision", "maxPhys", "power", "crit", "agility"],
      attunement: "umbSpecial",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "greaves",
      words: ["power", "damageVsBoss", "maxPhys", "power", "agility"],
      attunement: "umbSpecial",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "bracer",
      words: ["power", "power", "maxPhys", "damageVsBoss", "minPhys"],
      attunement: "umbSpecial",
    }),
  ],
  set: SET_ID.rainwhisper,
  bowSet: "precision",
  arsenal: "silkbind",
}
