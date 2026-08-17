import { defineBuff } from "../../../definitions/skills/buffDef"
import { BUFF } from "./ids"

// The reference def's `onApplyFn`/`refreshOn` carry no described behaviour —
// `specMeta.json`'s `onApplyHandlers` names the handler but nothing sources
// what it does. Modelled as the state marker its trigger wiring is sourced
// for (window opened by FanLightCharged/FanSpecial); no `skillBehaviors`
// factory is added rather than guessing the handler's effect.
export const lingeringBone = defineBuff({
  id: BUFF.lingeringBone,
  name: "Lingering Bone",
  duration: 2,
  effects: [],
})
