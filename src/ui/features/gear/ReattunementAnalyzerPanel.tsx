import { useMemo } from "react"
import type { GearPiece } from "../../../engine/types"
import type { ReattunementOption } from "../../../engine/dpsWorker"
import type { ReattunementReason } from "../../hooks/useReattunementAnalysis"
import { useI18n } from "../../../i18n/I18nContext"

interface Props {
  piece: GearPiece | null
  options: ReattunementOption[]
  probImproveOverall: number
  reason: ReattunementReason
  isPending: boolean
}

function fmtDpsDelta(n: number): string {
  const rounded = Math.round(n)
  if (rounded > 0) return `+${rounded.toLocaleString()}`
  if (rounded < 0) return rounded.toLocaleString()
  return "+0"
}

function deltaSignClass(n: number): string {
  if (n > 0.5) return "is-positive"
  if (n < -0.5) return "is-negative"
  return "is-zero"
}

function fmtPct(p: number): string {
  if (!Number.isFinite(p)) return "—"
  if (p <= 0) return "0 %"
  if (p >= 1) return "100 %"
  return `${(p * 100).toFixed(1)} %`
}

function fmtRange(min: number, max: number): string {
  return `${(min * 100).toFixed(1)}–${(max * 100).toFixed(1)} %`
}

export function ReattunementAnalyzerPanel({
  piece,
  options,
  probImproveOverall,
  reason,
  isPending,
}: Props) {
  const { t } = useI18n()

  const sorted = useMemo(() => {
    return options.slice().sort((a, b) => b.deltaDpsAtMax - a.deltaDpsAtMax)
  }, [options])

  const best = sorted.length > 0 ? sorted[0] : null
  const recommended = best !== null && best.deltaDpsAtMax > 0

  if (!piece) {
    return (
      <div className="panel retunement-panel">
        <div className="cr-toolbar">
          <span className="cr-toolbar-label">{t("Attunement")}</span>
        </div>
        <div className="cr-hint">{t("Select a gear piece to analyze attunement gains")}</div>
      </div>
    )
  }

  if (reason === "no-pool") {
    return (
      <div className="panel retunement-panel">
        <div className="cr-toolbar">
          <span className="cr-toolbar-label">{t("Attunement")}</span>
        </div>
        <div className="cr-hint">{t("No attunement options available for this slot/class")}</div>
      </div>
    )
  }

  return (
    <div className="panel retunement-panel">
      <div className="cr-toolbar">
        <span className="cr-toolbar-label">{t("Attunement")}</span>
        {isPending && <span className="cr-hint">{t("Computing…")}</span>}
      </div>

      {sorted.length === 0 && isPending && <div className="cr-hint">{t("Computing…")}</div>}

      {best && (
        <div className="retunement-best">
          <div className="retunement-best-row">
            <span className="retunement-best-label">
              {recommended ? t("Best attunement") : t("Least loss")}
            </span>
            <span className="retunement-best-slot">
              <strong>{t(best.label)}</strong>
              {" @ "}
              {(best.max * 100).toFixed(1)} %
              {best.isCurrent && (
                <span className="retunement-tag" style={{ marginLeft: 6 }}>
                  {t("Active")}
                </span>
              )}
            </span>
            <span className={"retunement-best-delta " + deltaSignClass(best.deltaDpsAtMax)}>
              {fmtDpsDelta(best.deltaDpsAtMax)} DPS
            </span>
          </div>
          <div className="retunement-best-row">
            <span className="retunement-best-label">{t("Improve chance")}</span>
            <span>
              {fmtPct(probImproveOverall)}
              <span className="cr-hint" style={{ marginLeft: 6 }}>
                {t("(across the whole pool)")}
              </span>
            </span>
          </div>
          {!recommended && (
            <div className="retunement-warn">{t("Not recommended to re-attune this piece")}</div>
          )}
        </div>
      )}

      {sorted.length > 0 && (
        <div className="reattunement-table">
          <div className="retunement-th">{t("Attunement")}</div>
          <div className="retunement-th">{t("Range")}</div>
          <div className="retunement-th">{t("Δ")}</div>
          {sorted.map((o) => {
            const sign = deltaSignClass(o.deltaDpsAtMax)
            return (
              <div key={o.optionId} style={{ display: "contents" }}>
                <div className="retunement-cell">
                  {t(o.label)}
                  {o.isCurrent && <span className="retunement-tag">{t("Active")}</span>}
                  {o.inert && <span className="retunement-tag">{t("Inert")}</span>}
                </div>
                <div className="retunement-cell">{fmtRange(o.min, o.max)}</div>
                <div className={"retunement-cell " + sign}>{fmtDpsDelta(o.deltaDpsAtMax)}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
