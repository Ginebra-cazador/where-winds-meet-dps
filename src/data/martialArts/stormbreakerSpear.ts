import { defineMartialArt } from "../../definitions/martialArts/martialArtDef"
import { MARTIAL_ART_ID } from "./ids"
import icon from "./icons/stonesplit-might.png"

export const stormbreakerSpear = defineMartialArt({
  id: MARTIAL_ART_ID.stormbreakerSpear,
  name: "Stormbreaker Spear",
  weaponType: "Spear",
  icon,
})
