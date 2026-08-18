import type { GraduationBuild } from "../../../definitions/classes/classDef"
import { SET_ID } from "../../sets/ids"
import { createGraduationGearPiece } from "../graduationGear"

const idPrefix = "graduation-stonesplit-might"

export const STONESPLIT_MIGHT_GRADUATION_BUILD: GraduationBuild = {
  gear: [
    createGraduationGearPiece({
      idPrefix,
      slot: "leftWeapon",
      words: ["maxPhys", "maxPhys", "power", "momentum", "crit"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "rightWeapon",
      words: ["maxPhys", "maxPhys", "power", "momentum", "modaoBoost"],
      attunement: "physPen",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "disc",
      words: ["maxPhys", "maxPhys", "power", "allMartialBoost", "precision"],
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
      words: ["crit", "crit", "momentum", "precision", "maxPhys"],
      attunement: "moBladeChargeDamage",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "armor",
      words: ["crit", "crit", "momentum", "power", "maxPhys"],
      attunement: "moBladeChargeDamage",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "greaves",
      words: ["power", "power", "momentum", "maxPhys", "damageVsBoss"],
      attunement: "moBladeChargeDamage",
    }),
    createGraduationGearPiece({
      idPrefix,
      slot: "bracer",
      words: ["power", "power", "momentum", "maxPhys", "damageVsBoss"],
      attunement: "moBladeChargeDamage",
    }),
  ],
  set: SET_ID.formbend,
  bowSet: "precision",
  arsenal: "stonesplit",
}
