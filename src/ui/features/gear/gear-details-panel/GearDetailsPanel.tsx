import type { GearPiece } from "../../../../engine/types"
import type { Inputs } from "../../../../engine/types"
import type { WordMaxRow } from "../../../../engine/dpsWorker"
import { useI18n } from "../../../../i18n/i18nContext"
import { GearPieceForm } from "../gear-piece-form/GearPieceForm"
import styles from "./GearDetailsPanel.module.scss"

interface Props {
  piece: GearPiece | null
  readOnly: boolean
  isEquipped: boolean
  inputs: Inputs
  onChange(piece: GearPiece): void
  onEquip(): void
  onUnequip(): void
  onDelete(): void
  wordMaxRows: WordMaxRow[]
  wordMaxPending: boolean
}

export function GearDetailsPanel({
  piece,
  readOnly,
  isEquipped,
  inputs,
  onChange,
  onEquip,
  onUnequip,
  onDelete,
  wordMaxRows,
  wordMaxPending,
}: Props) {
  const { t } = useI18n()

  if (!piece) {
    return (
      <div className="panel">
        <h2>{t("Gear details")}</h2>
        <div className="empty-tab">{t("Select a gear piece to view details")}</div>
      </div>
    )
  }

  return (
    <div className={`panel ${styles.gearDetails}`}>
      <div className="toolbar">
        <span className="toolbar-label">{t("Gear details")}</span>
        <div className="spacer" />
        {readOnly ? (
          <button type="button" className="btn primary" onClick={onEquip}>
            {t("Equip")}
          </button>
        ) : (
          <>
            {isEquipped ? (
              <button type="button" className="btn" onClick={onUnequip}>
                {t("Unequip")}
              </button>
            ) : (
              <button type="button" className="btn primary" onClick={onEquip}>
                {t("Equip")}
              </button>
            )}
            <button type="button" className="btn danger" onClick={onDelete}>
              {t("Delete")}
            </button>
          </>
        )}
      </div>

      <GearPieceForm
        piece={piece}
        inputs={inputs}
        disabled={readOnly}
        onChange={onChange}
        wordMaxRows={wordMaxRows}
        wordMaxPending={wordMaxPending}
      />

      {readOnly && (
        <div className="hint">
          {t(
            "This gear piece belongs to another profile. Equipping it copies it into the active profile.",
          )}
        </div>
      )}
    </div>
  )
}
