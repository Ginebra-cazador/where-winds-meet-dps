import { useMemo } from "react"
import type { GearPiece } from "../../../engine/types"
import type { RetunementRow } from "../../../engine/dpsWorker"
import type { RetunementReason } from "../../hooks/useRetunementAnalysis"
import { useI18n } from "../../../i18n/I18nContext"

interface Props {
  piece: GearPiece | null
  rows: RetunementRow[]
  reason: RetunementReason
  isPending: boolean
}

interface Pick {
  slotIndex: number
  currentWord: string
  word: string
  deltaDps: number
  legalCount: number
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

function fmtChance(legalCount: number): string {
  if (legalCount <= 0) return "—"
  const pct = (100 / legalCount).toFixed(1)
  return `1 / ${legalCount} (${pct} %)`
}

export function RetunementAnalyzerPanel({ piece, rows, reason, isPending }: Props) {
  const { t } = useI18n()

  const legalCountsBySlot = useMemo(() => {
    const m = new Map<number, number>()
    for (const r of rows) {
      if (!r.legal) continue
      m.set(r.slotIndex, (m.get(r.slotIndex) ?? 0) + 1)
    }
    return m
  }, [rows])

  const best: Pick | null = useMemo(() => {
    if (!piece) return null
    let pick: Pick | null = null
    for (const r of rows) {
      if (!r.legal || r.isCurrent) continue
      if (!pick || r.deltaDps > pick.deltaDps) {
        pick = {
          slotIndex: r.slotIndex,
          currentWord: piece.words[r.slotIndex]?.word ?? "",
          word: r.word,
          deltaDps: r.deltaDps,
          legalCount: legalCountsBySlot.get(r.slotIndex) ?? 0,
        }
      }
    }
    return pick
  }, [piece, rows, legalCountsBySlot])

  const recommended = best !== null && best.deltaDps > 0

  const focusSlotCandidates: Pick[] = useMemo(() => {
    if (!piece || !best) return []
    const out: Pick[] = []
    for (const r of rows) {
      if (r.slotIndex !== best.slotIndex) continue
      if (!r.legal || r.isCurrent) continue
      out.push({
        slotIndex: r.slotIndex,
        currentWord: piece.words[r.slotIndex]?.word ?? "",
        word: r.word,
        deltaDps: r.deltaDps,
        legalCount: best.legalCount,
      })
    }
    out.sort((a, b) => b.deltaDps - a.deltaDps)
    return out
  }, [piece, rows, best])

  if (!piece) {
    return (
      <div className="panel retunement-panel">
        <div className="cr-toolbar">
          <span className="cr-toolbar-label">{t("Retunement")}</span>
        </div>
        <div className="cr-hint">{t("Select a gear piece to analyze retunement gains")}</div>
      </div>
    )
  }

  if (reason === "relayed") {
    return (
      <div className="panel retunement-panel">
        <div className="cr-toolbar">
          <span className="cr-toolbar-label">{t("Retunement")}</span>
        </div>
        <div className="cr-hint">{t("Relayed gear cannot be retuned")}</div>
      </div>
    )
  }

  if (reason === "no-pool") {
    return (
      <div className="panel retunement-panel">
        <div className="cr-toolbar">
          <span className="cr-toolbar-label">{t("Retunement")}</span>
        </div>
        <div className="cr-hint">{t("No retunement data for this class yet")}</div>
      </div>
    )
  }

  const lockedSlots = piece.words.map((w, i) => (i > 0 && w.retuned ? i : -1)).filter((i) => i >= 0)
  const lockedNote =
    lockedSlots.length > 0 ? t("R-locked: only Slot ") + (lockedSlots[0] + 1) + t("") : null

  const hasRows = rows.length > 0

  return (
    <div className="panel retunement-panel">
      <div className="cr-toolbar">
        <span className="cr-toolbar-label">{t("Retunement")}</span>
        {isPending && <span className="cr-hint">{t("Computing…")}</span>}
        {lockedNote && <span className="cr-hint">{lockedNote}</span>}
      </div>

      {!hasRows && isPending && <div className="cr-hint">{t("Computing…")}</div>}

      {best && (
        <div className="retunement-best">
          <div className="retunement-best-row">
            <span className="retunement-best-label">
              {recommended ? t("Best retune") : t("Least loss")}
            </span>
            <span className="retunement-best-slot">
              {t("Slot ") + (best.slotIndex + 1) + t("")}
              {best.currentWord ? ` (${t("Active")}: ${t(best.currentWord)})` : ""}
              {" → "}
              <strong>{t(best.word)}</strong>
            </span>
            <span className={"retunement-best-delta " + deltaSignClass(best.deltaDps)}>
              {fmtDpsDelta(best.deltaDps)} DPS
            </span>
          </div>
          <div className="retunement-best-row">
            <span className="retunement-best-label">{t("Success")}</span>
            <span>{fmtChance(best.legalCount)}</span>
          </div>
          {!recommended && (
            <div className="retunement-warn">{t("Not recommended to retune this piece")}</div>
          )}
        </div>
      )}

      {focusSlotCandidates.length > 0 && (
        <div className="retunement-table">
          <div className="retunement-th">{t("Tunements")}</div>
          <div className="retunement-th">{t("Δ")}</div>
          {focusSlotCandidates.map((c) => {
            const sign = deltaSignClass(c.deltaDps)
            return (
              <div
                key={`${c.slotIndex}-${c.word}`}
                className="retunement-row"
                style={{ display: "contents" }}
              >
                <div className="retunement-cell">{t(c.word)}</div>
                <div className={"retunement-cell " + sign}>{fmtDpsDelta(c.deltaDps)}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
