import { defineSet } from "../../definitions/sets/setDef"
import { SET_ID } from "./ids"

// Both set bonuses are defensive, so neither has a DPS channel: 2pc is +32
// Physical Defense (the panel-bonus enum carries no defense stat), and 4pc
// extends the HP shield by 2s and cuts HP damage taken above 85% Qi. The
// shield's +2s is modeled directly on `stonesplitMightShield`. Registered so the
// set shows in the armor-set grid.
export const formbend = defineSet({
  id: SET_ID.formbend,
  name: "Formbend",
})
