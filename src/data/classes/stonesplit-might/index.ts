import { defineClass } from "../../../definitions/classes/classDef"
import { CLASS_ID, SKILLS } from "../../skills/stonesplit-might"
import { DEBUFFS } from "../../skills/stonesplit-might/debuffs"
import { withUniversalSkills } from "../../../definitions/skills/universalSkills"
import { rotationPoolFor } from "../../../definitions/rotations/registry"
import { INNER_WAY_ID } from "../../innerWays/ids"
import { MARTIAL_ART_ID } from "../../martialArts/ids"
import { STONESPLIT_MIGHT_GRADUATION_BUILD } from "./graduationBuild"
import { drumbeat } from "../../skills/stonesplit-might/buffs/drumbeat"
import { breakthrough } from "../../skills/stonesplit-might/buffs/breakthrough"
import { breakthroughConsume } from "../../skills/stonesplit-might/buffs/breakthroughConsume"
import { stonesplitMightChargedCrit } from "../../skills/stonesplit-might/buffs/stonesplitMightChargedCrit"
import { vulnerability } from "../../skills/stonesplit-might/buffs/vulnerability"
import { vulnerabilityWeapon } from "../../skills/stonesplit-might/buffs/vulnerabilityWeapon"
import { rainwhisperBaseCrit } from "../../skills/stonesplit-might/buffs/rainwhisperBaseCrit"
import { rainwhisperShieldedCrit } from "../../skills/stonesplit-might/buffs/rainwhisperShieldedCrit"
import { stonesplitMightShield } from "../../skills/stonesplit-might/buffs/stonesplitMightShield"
import { throatPiercedMight } from "../../innerWays/throatPierceBuffs/throatPiercedMight"

export const stonesplitMight = defineClass({
  id: CLASS_ID,
  displayName: "Stonesplit Might",
  validated: false,
  spec: "stonesplit_might",
  primaryAttribute: "Stonesplit",
  attributeMultiplier: 51.5,
  classMindGroup: INNER_WAY_ID.exquisiteScenery,
  allowedMindMethods: [
    INNER_WAY_ID.moraleChant,
    INNER_WAY_ID.exquisiteScenery,
    INNER_WAY_ID.artOfResistance,
    INNER_WAY_ID.throatPierce,
    INNER_WAY_ID.battleAnthem,
    INNER_WAY_ID.adaptiveSteel,
    INNER_WAY_ID.breakingPoint,
    INNER_WAY_ID.bitterSeason,
  ],
  classSpecificAttunements: ["moBladeChargeDamage", "spearMartial"],
  weapons: [MARTIAL_ART_ID.thundercryBlade, MARTIAL_ART_ID.stormbreakerSpear],
  critBoostWeaponTypes: [],
  skills: withUniversalSkills(CLASS_ID, "Stonesplit", SKILLS),
  debuffs: DEBUFFS,
  ...rotationPoolFor(CLASS_ID),
  graduationBuild: STONESPLIT_MIGHT_GRADUATION_BUILD,
  classBuffDefs: [
    drumbeat,
    breakthrough,
    breakthroughConsume,
    stonesplitMightChargedCrit,
    vulnerability,
    vulnerabilityWeapon,
    rainwhisperBaseCrit,
    rainwhisperShieldedCrit,
    stonesplitMightShield,
    throatPiercedMight,
  ],
  gateBuffs: [],
  mechanics: [],
  skillBehaviors: [],
  displayGates: [],
  poisonExtensions: [],
})
