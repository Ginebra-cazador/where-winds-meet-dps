import { defineClass } from "../../../definitions/classes/classDef"
import { CLASS_ID, SKILLS } from "../../skills/silkbind-jade"
import { DEBUFFS } from "../../skills/silkbind-jade/debuffs"
import { withUniversalSkills } from "../../../definitions/skills/universalSkills"
import { rotationPoolFor } from "../../../definitions/rotations/registry"
import { INNER_WAY_ID } from "../../innerWays/ids"
import { combo } from "../../skills/silkbind-jade/buffs/combo"
import { comboUmbLightBonus } from "../../skills/silkbind-jade/buffs/comboUmbLightBonus"
import { lingeringBone } from "../../skills/silkbind-jade/buffs/lingeringBone"
import { pursuitChargedBoost } from "../../skills/silkbind-jade/buffs/pursuitChargedBoost"
import { windWall } from "../../skills/silkbind-jade/buffs/windWall"
import { windWallPursuit } from "../../skills/silkbind-jade/buffs/windWallPursuit"
import { SILKBIND_JADE_GRADUATION_BUILD } from "./graduationBuild"
import { MARTIAL_ART_ID } from "../../martialArts/ids"

export const silkbindJade = defineClass({
  id: CLASS_ID,
  displayName: "Silkbind Jade",
  validated: false,
  spec: "silkbind_jade",
  primaryAttribute: "Silkbind",
  attributeMultiplier: 50,
  classMindGroup: "",
  allowedMindMethods: [INNER_WAY_ID.moraleChant, INNER_WAY_ID.bitterSeason],
  classSpecificAttunements: ["umbQ", "umbCharged", "fanQ", "fanCharged", "fanSpecial"],
  weapons: [MARTIAL_ART_ID.vernalUmbrella, MARTIAL_ART_ID.inkwellFan],
  critBoostWeaponTypes: ["Umbrella", "Fan"],
  skills: withUniversalSkills(CLASS_ID, "Silkbind", SKILLS),
  debuffs: DEBUFFS,
  ...rotationPoolFor(CLASS_ID),
  graduationBuild: SILKBIND_JADE_GRADUATION_BUILD,
  classBuffDefs: [
    combo,
    comboUmbLightBonus,
    windWall,
    windWallPursuit,
    pursuitChargedBoost,
    lingeringBone,
  ],
  gateBuffs: [],
  mechanics: [],
  skillBehaviors: [],
  displayGates: [],
  poisonExtensions: [],
})
