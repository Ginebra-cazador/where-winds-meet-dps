import type { Skill } from "../../engine/skill"
import * as bellstrikeRainbow from "./bellstrike-rainbow"
import * as bellstrikeUmbra from "./bellstrike-umbra"
import * as silkbindJade from "./silkbind-jade"
import * as stonesplitPower from "./stonesplit-power"
import * as stonesplitBalancePureTang from "./stonesplit-balance-pure-tang"
import * as bamboocutWindTwinblade from "./bamboocut-wind-twinblade"
import * as bamboocutDust from "./bamboocut-dust"
import * as stonesplitBalanceDualCut from "./stonesplit-balance-dual-cut"

export const BUILTIN_SKILLS_BY_CLASS: Record<string, readonly Skill[]> = {
  [bellstrikeRainbow.CLASS_ID]: bellstrikeRainbow.SKILLS,
  [bellstrikeUmbra.CLASS_ID]: bellstrikeUmbra.SKILLS,
  [silkbindJade.CLASS_ID]: silkbindJade.SKILLS,
  [stonesplitPower.CLASS_ID]: stonesplitPower.SKILLS,
  [stonesplitBalancePureTang.CLASS_ID]: stonesplitBalancePureTang.SKILLS,
  [bamboocutWindTwinblade.CLASS_ID]: bamboocutWindTwinblade.SKILLS,
  [bamboocutDust.CLASS_ID]: bamboocutDust.SKILLS,
  [stonesplitBalanceDualCut.CLASS_ID]: stonesplitBalanceDualCut.SKILLS,
}
