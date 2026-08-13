import type { Skill } from "../../../engine/skill"
import { blockperception } from "./blockperception"
import { deflect } from "./deflect"
import { mobladeheavycharge1bwCancel } from "./mobladeheavycharge-1bw-cancel"
import { mobladeheavycharge1bwPerceptionCancel } from "./mobladeheavycharge-1bw-perception-cancel"
import { mobladeheavycharge1bwPerception } from "./mobladeheavycharge-1bw-perception"
import { mobladeheavycharge1bw } from "./mobladeheavycharge-1bw"
import { mobladeheavycharge2bwCancel } from "./mobladeheavycharge-2bw-cancel"
import { mobladeheavycharge2bwPerceptionCancel } from "./mobladeheavycharge-2bw-perception-cancel"
import { mobladeheavycharge2bwPerception } from "./mobladeheavycharge-2bw-perception"
import { mobladeheavycharge2bw } from "./mobladeheavycharge-2bw"
import { mobladeqPrepull } from "./mobladeq-prepull"
import { mobladeq } from "./mobladeq"
import { mobladevariedcombo2bwCancel } from "./mobladevariedcombo-2bw-cancel"
import { mobladevariedcombo2bw } from "./mobladevariedcombo-2bw"
import { mobladevariedcombogroundslam2bw } from "./mobladevariedcombogroundslam-2bw"
import { spearqPrepull } from "./spearq-prepull"
import { spearq } from "./spearq"
import { spearspecialCancelPrepull } from "./spearspecial-cancel-prepull"
import { spearspecialCancel } from "./spearspecial-cancel"
import { spearspecialPrepull } from "./spearspecial-prepull"
import { spearspecial } from "./spearspecial"

export const CLASS_ID = "stonesplitMight"

export const SKILLS: Skill[] = [
  blockperception,
  deflect,
  mobladeheavycharge1bwCancel,
  mobladeheavycharge1bwPerceptionCancel,
  mobladeheavycharge1bwPerception,
  mobladeheavycharge1bw,
  mobladeheavycharge2bwCancel,
  mobladeheavycharge2bwPerceptionCancel,
  mobladeheavycharge2bwPerception,
  mobladeheavycharge2bw,
  mobladeqPrepull,
  mobladeq,
  mobladevariedcombo2bwCancel,
  mobladevariedcombo2bw,
  mobladevariedcombogroundslam2bw,
  spearqPrepull,
  spearq,
  spearspecialCancelPrepull,
  spearspecialCancel,
  spearspecialPrepull,
  spearspecial,
]
