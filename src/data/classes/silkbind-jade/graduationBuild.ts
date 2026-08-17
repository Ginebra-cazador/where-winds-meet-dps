import type { GraduationBuild } from "../../../definitions/classes/classDef"
import { SET_ID } from "../../sets/ids"
import { createGraduationGearPiece } from "../graduationGear"

const idPrefix = "graduation-silkbind-jade"

export const SILKBIND_JADE_GRADUATION_BUILD: GraduationBuild = {
  gear: [
    createGraduationGearPiece({
      idPrefix,
      slot: "leftWeapon",
      words: ["maxSilkbind", "maxSilkbind", "power", "momentum", "umbrellaBoost"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "rightWeapon",
      words: ["maxSilkbind", "maxSilkbind", "power", "crit", "momentum"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "disc",
      words: ["maxSilkbind", "power", "maxSilkbind", "allMartialBoost", "momentum"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "pendant",
      words: ["maxSilkbind", "maxSilkbind", "power", "allMartialBoost", "momentum"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "helm",
      words: ["crit", "agility", "maxSilkbind", "precision", "minPhys"],
      attunement: "umbQ",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "armor",
      words: ["crit", "agility", "maxSilkbind", "minPhys", "minPhys"],
      attunement: "umbQ",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "greaves",
      words: ["crit", "agility", "maxSilkbind", "minPhys", "damageVsBoss"],
      attunement: "umbQ",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "bracer",
      words: ["crit", "agility", "maxSilkbind", "minPhys", "damageVsBoss"],
      attunement: "umbQ",
    }),
  ],
  set: SET_ID.mistwillow,
  bowSet: "crit",
  arsenal: "silkbind",
}
