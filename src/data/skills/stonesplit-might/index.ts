import type { Skill } from "../../../engine/skill"
import { blockperception } from "./blockperception"
import { deflect } from "./deflect"
import { mobladeqPrepull } from "./mobladeq-prepull"
import { mobladeq } from "./mobladeq"
import { spearqPrepull } from "./spearq-prepull"
import { spearspecialCancelPrepull } from "./spearspecial-cancel-prepull"
import { spearspecialPrepull } from "./spearspecial-prepull"

export const CLASS_ID = "stonesplitMight"

export const SKILLS: Skill[] = [
  blockperception,
  deflect,
  mobladeqPrepull,
  mobladeq,
  spearqPrepull,
  spearspecialCancelPrepull,
  spearspecialPrepull,
]
