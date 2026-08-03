import { useI18n } from "../../../i18n/I18nContext"
import type { Inputs, Result } from "../../../engine/types"
import { RotationEditorPanel } from "./RotationEditorPanel"
import { RotationBreakdownPanel } from "./RotationBreakdownPanel"
import { RotationTimelinePanel } from "./RotationTimelinePanel"

export function RotationTab({
  inputs,
  onChange,
  result,
}: {
  inputs: Inputs
  onChange: (next: Inputs) => void
  result: Result
}) {
  const { t } = useI18n()
  return (
    <>
      <div className="panel">
        <RotationEditorPanel inputs={inputs} onChange={onChange} result={result} />
      </div>
      <div className="panel">
        <h2>{t("DPS Breakdown")}</h2>
        <RotationBreakdownPanel result={result} />
      </div>
      <div className="panel">
        <h2>{t("Cast Timeline")}</h2>
        <RotationTimelinePanel result={result} />
      </div>
    </>
  )
}
