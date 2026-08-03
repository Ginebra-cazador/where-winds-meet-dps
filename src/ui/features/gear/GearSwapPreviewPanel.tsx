import { useMemo } from "react"
import type { GearPiece, Inputs } from "../../../engine/types"
import { applyPieceContribution, listKnownPaths } from "../../../engine/gearStats"
import { effectiveRates } from "../../../engine/panel"
import { useI18n } from "../../../i18n/I18nContext"
import type { DpsDelta } from "../../../engine/dpsWorker"
import { PATH_LABELS, PERCENT_PATHS, PENETRATION_PATHS, readPath } from "../../utils/statFormatting"

const RESISTANCE_RATE_PATHS = new Set(["precision", "critRate", "affinityRate"])

interface Props {
  inputs: Inputs
  candidate: GearPiece | null
  isEquipped: boolean
  currentDps: number
  dpsDelta: DpsDelta | undefined
  dpsDeltasPending: boolean
}

function fmtVal(value: number, isPercent: boolean, isPenetration = false): string {
  if (!Number.isFinite(value)) return "—"
  if (isPenetration) return String(Math.round(value * 1000) / 10)
  if (isPercent) return `${(value * 100).toFixed(2)}%`
  if (Math.abs(value) < 0.01 && value !== 0) return value.toFixed(4)
  return Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(2)
}

function fmtDelta(value: number, isPercent: boolean, isPenetration = false): string {
  if (!Number.isFinite(value) || value === 0) return "—"
  const sign = value > 0 ? "+" : "−"
  const abs = Math.abs(value)
  if (isPenetration) return `${sign}${Math.round(abs * 1000) / 10}`
  if (isPercent) return `${sign}${(abs * 100).toFixed(2)}%`
  if (abs < 0.01) return `${sign}${abs.toFixed(4)}`
  return `${sign}${abs >= 100 ? abs.toFixed(0) : abs.toFixed(2)}`
}

function fmtDpsDelta(n: number): string {
  const rounded = Math.round(n)
  if (rounded > 0) return `+${rounded.toLocaleString()}`
  if (rounded < 0) return rounded.toLocaleString()
  return "+0"
}

function deltaSignClass(n: number): string {
  if (n > 0) return "is-positive"
  if (n < 0) return "is-negative"
  return "is-zero"
}

export function GearSwapPreviewPanel({
  inputs,
  candidate,
  isEquipped,
  currentDps,
  dpsDelta,
  dpsDeltasPending,
}: Props) {
  const { t } = useI18n()

  const rows = useMemo(() => {
    if (!candidate || isEquipped) return null
    const equippedId = inputs.equipped[candidate.slot]
    const equippedPiece = equippedId
      ? (inputs.inventory.find((p) => p.id === equippedId) ?? null)
      : null
    const baseline = equippedPiece ? applyPieceContribution(inputs, equippedPiece, -1) : inputs
    const after = applyPieceContribution(baseline, candidate, +1)
    const effBefore = effectiveRates(inputs)
    const effAfter = effectiveRates(after)
    return listKnownPaths()
      .map((path) => {
        const cur = readPath(inputs, path)
        const next = readPath(after, path)
        const delta = next - cur
        const isRate = RESISTANCE_RATE_PATHS.has(path)
        const key = path as "precision" | "critRate" | "affinityRate"
        const effCur = isRate ? effBefore[key] : undefined
        const effNext = isRate ? effAfter[key] : undefined
        const effDelta =
          effCur !== undefined && effNext !== undefined ? effNext - effCur : undefined
        return { path, cur, next, delta, effCur, effNext, effDelta }
      })
      .filter((r) => Math.abs(r.delta) > 1e-9)
  }, [inputs, candidate, isEquipped])

  if (!candidate || isEquipped || rows === null) return null

  const afterDps = dpsDelta ? currentDps + dpsDelta.current : null

  return (
    <div className="panel gear-swap-preview">
      <div className="cr-toolbar">
        <span className="cr-toolbar-label">{t("If equipped — stat preview")}</span>
      </div>

      <div className="gear-swap-dps">
        <div className="gear-swap-dps-cell">
          <div className="label">{t("Current DPS")}</div>
          <div className="value">{Math.round(currentDps).toLocaleString()}</div>
        </div>
        <div className="gear-swap-dps-cell">
          <div className="label">{t("After-equip DPS")}</div>
          <div className="value">
            {afterDps !== null
              ? Math.round(afterDps).toLocaleString()
              : dpsDeltasPending
                ? "…"
                : "—"}
          </div>
        </div>
        <div className="gear-swap-dps-cell">
          <div className="label">{t("Δ")}</div>
          <div className={"value " + (dpsDelta ? deltaSignClass(dpsDelta.current) : "is-zero")}>
            {dpsDelta ? `${fmtDpsDelta(dpsDelta.current)} DPS` : dpsDeltasPending ? "…" : "—"}
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="cr-hint">{t("Equipping this piece would not change any panel stats.")}</div>
      ) : (
        <div className="gear-swap-table">
          <div className="gear-base-th">{t("Stat")}</div>
          <div className="gear-base-th">{t("Active")}</div>
          <div className="gear-base-th">{t("After")}</div>
          <div className="gear-base-th">{t("Δ")}</div>
          {rows.map((r) => {
            const isPct = PERCENT_PATHS.has(r.path)
            const isPen = PENETRATION_PATHS.has(r.path)
            return (
              <Row
                key={r.path}
                label={t(PATH_LABELS[r.path] ?? r.path)}
                cur={fmtVal(r.cur, isPct, isPen)}
                next={fmtVal(r.next, isPct, isPen)}
                delta={fmtDelta(r.delta, isPct, isPen)}
                sign={deltaSignClass(r.delta)}
                effCur={r.effCur !== undefined ? fmtVal(r.effCur, isPct, isPen) : undefined}
                effNext={r.effNext !== undefined ? fmtVal(r.effNext, isPct, isPen) : undefined}
                effDelta={r.effDelta !== undefined ? fmtDelta(r.effDelta, isPct, isPen) : undefined}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function Row({
  label,
  cur,
  next,
  delta,
  sign,
  effCur,
  effNext,
  effDelta,
}: {
  label: string
  cur: string
  next: string
  delta: string
  sign: string
  effCur?: string
  effNext?: string
  effDelta?: string
}) {
  return (
    <>
      <div className="gear-base-cell">{label}</div>
      <div className="gear-base-cell">
        {cur}
        {effCur && <span className="stats-overview-eff"> → {effCur}</span>}
      </div>
      <div className="gear-base-cell">
        {next}
        {effNext && <span className="stats-overview-eff"> → {effNext}</span>}
      </div>
      <div className={"gear-base-cell " + sign}>
        {delta}
        {effDelta && <span className="stats-overview-eff"> → {effDelta}</span>}
      </div>
    </>
  )
}
