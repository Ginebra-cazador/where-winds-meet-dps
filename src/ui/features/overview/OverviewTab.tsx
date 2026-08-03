import { useI18n } from "../../../i18n/I18nContext"
import { resistanceForInputs } from "../../../engine/panel"
import type { Inputs, Result } from "../../../engine/types"
import { syncClassPermanent } from "../../utils/classSetup"
import { useItemRanking } from "../../hooks/useItemRanking"
import { useSetTileDps } from "../../hooks/useSetTileDps"
import { ClassSelect } from "./ClassSelect"
import { BreakthroughSelect } from "./BreakthroughSelect"
import { MindMethodsPanel } from "./MindMethodsPanel"
import { EncounterSettingsPanel } from "./EncounterSettingsPanel"
import { BowSetPanel } from "./BowSetPanel"
import { ArsenalPanel } from "./ArsenalPanel"
import { StatsOverviewPanel } from "./StatsOverviewPanel"
import { ItemRankingTable } from "./ItemRankingTable"

export function OverviewTab({
  inputs,
  engineInputs,
  onChange,
  result,
}: {
  inputs: Inputs
  engineInputs: Inputs
  onChange: (next: Inputs) => void
  result: Result
}) {
  const { t } = useI18n()
  const { rows: rankingRows, isPending: rankingPending } = useItemRanking(engineInputs, result.dps)
  const { data: tileDps, isPending: tilesPending } = useSetTileDps(inputs)
  return (
    <>
      <div className="overview-grid">
        <div>
          <div className="panel">
            <h2>{t("Class & Breakthrough")}</h2>
            <ClassSelect
              value={inputs.classId}
              onChange={(v) => onChange(syncClassPermanent(inputs, v))}
            />
            <BreakthroughSelect
              value={inputs.breakthrough}
              onChange={(v) => onChange({ ...inputs, breakthrough: v })}
            />
            <div className="row">
              <label>{t("Enable Dummy")}</label>
              <input
                type="checkbox"
                checked={inputs.dummyMode}
                onChange={(e) => onChange({ ...inputs, dummyMode: e.target.checked })}
              />
            </div>
          </div>
          <div className="panel">
            <h2>{t("Inner Ways")}</h2>
            <MindMethodsPanel inputs={inputs} onChange={onChange} />
          </div>
          <div className="panel">
            <h2>{t("Encounter Settings")}</h2>
            <EncounterSettingsPanel inputs={inputs} onChange={onChange} />
          </div>
        </div>

        <div>
          <div className="panel">
            <h2>{t("Set Bonuses")}</h2>
            <BowSetPanel
              inputs={inputs}
              onChange={onChange}
              armorDpsByKey={tileDps?.armorDpsByKey}
              bowDpsByChoice={tileDps?.bowDpsByChoice}
              isPending={tilesPending}
            />
            <div className="set-section-label">{t("Arsenal")}</div>
            <ArsenalPanel
              inputs={inputs}
              onChange={onChange}
              arsenalDpsByChoice={tileDps?.arsenalDpsByChoice}
              isPending={tilesPending}
            />
          </div>
        </div>

        <div>
          <div className="panel">
            <div className="panel-head">
              <h2>{t("Panel Stats")}</h2>
              <span className="panel-head-meta">
                {t("Resistance")}:{" "}
                <span className="panel-head-meta-value">{resistanceForInputs(inputs)}%</span>
              </span>
            </div>
            <StatsOverviewPanel inputs={inputs} />
          </div>
        </div>

        <div>
          <div className="panel">
            <div className="panel-head">
              <h2>{t("Gear-Stat Lift")}</h2>
              <span className="panel-head-meta">{rankingRows.length}</span>
            </div>
            <div style={{ opacity: rankingPending ? 0.6 : 1 }}>
              <ItemRankingTable rows={rankingRows} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
