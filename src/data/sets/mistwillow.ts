import { defineSet } from "../../definitions/sets/setDef"
import { SET_ID } from "./ids"

// 2 pieces: "Precision Rate +0.1%" (in-game set tooltip, 2026-08-17) — 0.1
// percentage points, in the same fraction-of-100 unit `hawking`'s 4.5%
// affinity carries as 0.045.
//
// The 4-piece cross-stance mechanic lives in `buffEngine.ts`
// (`params.armorSet === "mistwillow"`), not here.
export const mistwillow = defineSet({
  id: SET_ID.mistwillow,
  name: "Mistwillow",
  siteKey: "mistwillow",
  panelBonus: { stat: "precisionRate", value: 0.001 },
})
