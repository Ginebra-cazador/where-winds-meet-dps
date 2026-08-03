import { useEffect, useRef, useState } from "react"
import type { GearLevel, GearPiece, GearRarity, GearSlot, Inputs } from "../../../engine/types"
import { emptyGearWords } from "../../../engine/types"
import { gearBaseStatsFor } from "../../../engine/gearStats"
import { newGearPieceId } from "../../../storage"
import { useI18n } from "../../../i18n/I18nContext"
import { GearPieceForm } from "./GearPieceForm"

interface Props {
  initialSlot: GearSlot
  inputs: Inputs
  onCancel(): void
  onSave(piece: GearPiece, mode: "store" | "equip"): void
}

function makeDraft(slot: GearSlot): GearPiece {
  const level: GearLevel = 96
  const rarity: GearRarity = "legendary"
  const base = gearBaseStatsFor({ slot, level, rarity })
  return {
    id: newGearPieceId(),
    slot,
    level,
    rarity,
    minPhys: base.minPhys,
    maxPhys: base.maxPhys,
    hp: base.hp,
    physDef: base.physDef,
    words: emptyGearWords(),
    attunement: "",
    attunementValue: 0,
    relayed: false,
  }
}

export function NewGearPieceDialog({ initialSlot, inputs, onCancel, onSave }: Props) {
  const { t } = useI18n()
  const [draft, setDraft] = useState<GearPiece>(() => makeDraft(initialSlot))
  const equipButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return
      if (e.defaultPrevented) return
      onCancel()
    }
    document.addEventListener("keydown", onKey)
    equipButtonRef.current?.focus()
    return () => document.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="gear-dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gear-dialog-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="gear-dialog-modal">
        <div className="gear-dialog-header">
          <h2 id="gear-dialog-title">{t("New gear piece")}</h2>
        </div>
        <div className="gear-dialog-body">
          <GearPieceForm
            piece={draft}
            inputs={inputs}
            disabled={false}
            onChange={setDraft}
            wordMaxRows={[]}
            wordMaxPending={false}
            showWordMax={false}
          />
        </div>
        <div className="gear-dialog-footer">
          <button type="button" className="cr-btn" onClick={onCancel}>
            {t("Cancel")}
          </button>
          <button type="button" className="cr-btn" onClick={() => onSave(draft, "store")}>
            {t("Save & Store")}
          </button>
          <button
            type="button"
            ref={equipButtonRef}
            className="cr-btn primary"
            onClick={() => onSave(draft, "equip")}
          >
            {t("Save & Equip")}
          </button>
        </div>
      </div>
    </div>
  )
}
