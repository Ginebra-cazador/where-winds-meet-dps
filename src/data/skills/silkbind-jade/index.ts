import type { Skill } from "../../../engine/skill"
import { fanheavypursuit3Hit } from "./fanheavypursuit-3-hit"
import { fanheavypursuit5Hit } from "./fanheavypursuit-5-hit"
import { fanlightcharged } from "./fanlightcharged"
import { fanqPrepull } from "./fanq-prepull"
import { fanq } from "./fanq"
import { fanqcancel } from "./fanqcancel"
import { fanspecial } from "./fanspecial"
import { healerBuff } from "./healer-buff"
import { healerExtension } from "./healer-extension"
import { umbHeavylight } from "./umb-heavylight"
import { umbdronelaunch12Hit } from "./umbdronelaunch-12hit"
import { umbdronelaunch16Hit } from "./umbdronelaunch-16hit"
import { umbdronelaunch20Hit } from "./umbdronelaunch-20hit"
import { umbdronelaunch23Hit } from "./umbdronelaunch-23hit"
import { umbdronelaunch26Hit } from "./umbdronelaunch-26hit"
import { umblightcharge } from "./umblightcharge"
import { umbqPrepull } from "./umbq-prepull"
import { umbq } from "./umbq"

export const CLASS_ID = "silkbindJade"

export const SKILLS: Skill[] = [
  fanheavypursuit3Hit,
  fanheavypursuit5Hit,
  fanlightcharged,
  fanqPrepull,
  fanq,
  fanqcancel,
  fanspecial,
  healerBuff,
  healerExtension,
  umbHeavylight,
  umbdronelaunch12Hit,
  umbdronelaunch16Hit,
  umbdronelaunch20Hit,
  umbdronelaunch23Hit,
  umbdronelaunch26Hit,
  umblightcharge,
  umbqPrepull,
  umbq,
]
