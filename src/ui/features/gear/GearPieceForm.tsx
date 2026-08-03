import { useMemo } from "react"
import type {
  GearLevel,
  GearPiece,
  GearRarity,
  GearSlot,
  GearWordEntry,
} from "../../../engine/types"
import { GEAR_SLOTS, isWeaponSlot } from "../../../engine/types"
import { getWordSpecs } from "../../../engine/itemRanking"
import { relayedCapValue, gearBaseStatsFor } from "../../../engine/gearStats"
import { attunementsFor, getAttunement } from "../../../engine/attunements"
import type { Inputs } from "../../../engine/types"
import type { WordMaxRow } from "../../../engine/dpsWorker"
import { useI18n } from "../../../i18n/I18nContext"
import { Combobox, type ComboboxOption } from "../../components/Combobox"
import { NumInput, PercentInput } from "../../components/NumberInputs"

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

const SLOT_LABEL_KEYS: Record<GearSlot, string> = {
  leftWeapon: "Left Weapon",
  rightWeapon: "Right Weapon",
  disc: "Disc",
  pendant: "Pendant",
  helm: "Helm",
  armor: "Armor",
  greaves: "Greaves",
  bracer: "Bracer",
}

interface Props {
  piece: GearPiece
  inputs: Inputs
  disabled: boolean
  onChange(piece: GearPiece): void
  wordMaxRows: WordMaxRow[]
  wordMaxPending: boolean
  showWordMax?: boolean
}

export function GearPieceForm({
  piece,
  inputs,
  disabled,
  onChange,
  wordMaxRows,
  wordMaxPending,
  showWordMax = true,
}: Props) {
  const { t } = useI18n()

  const slotOptions: ComboboxOption[] = useMemo(
    () => GEAR_SLOTS.map((s) => ({ value: s, label: t(SLOT_LABEL_KEYS[s]) })),
    [t],
  )
  const levelOptions: ComboboxOption[] = useMemo(
    () => [
      { value: "86", label: "lv86" },
      { value: "91", label: "lv91" },
      { value: "96", label: "lv96" },
    ],
    [],
  )
  const rarityOptions: ComboboxOption[] = useMemo(
    () => [
      { value: "legendary", label: t("Legendary") },
      { value: "epic", label: t("Epic") },
    ],
    [t],
  )
  const wordSpecs = useMemo(() => getWordSpecs(inputs), [inputs])
  const wordOptions: ComboboxOption[] = useMemo(() => {
    const list = wordSpecs.map((s) => ({ value: s.word, label: t(s.word) }))
    return [{ value: "", label: t("(none)") }, ...list]
  }, [wordSpecs, t])
  const attunementCatalog = useMemo(
    () => attunementsFor(piece.slot, inputs.classId),
    [piece.slot, inputs.classId],
  )
  const attunementOptions: ComboboxOption[] = useMemo(
    () => [
      { value: "", label: t("(none)") },
      ...attunementCatalog.map((opt) => ({ value: opt.id, label: t(opt.label) })),
    ],
    [attunementCatalog, t],
  )

  const weaponSide = isWeaponSlot(piece.slot)
  const base = gearBaseStatsFor(piece)

  function capFor(word: string, relayed: boolean): number | null {
    const spec = wordSpecs.find((s) => s.word === word)
    if (!spec) return null
    return relayed ? relayedCapValue(spec.amount, spec.unit) : spec.amount
  }
  function round1(v: number, isPercent: boolean): number {
    if (!Number.isFinite(v)) return v
    return isPercent ? Math.round(v * 1000) / 1000 : Math.round(v * 10) / 10
  }

  function patch(p: Partial<GearPiece>): void {
    onChange({ ...piece, ...p })
  }
  function patchBase(p: Partial<GearPiece>): void {
    const merged = { ...piece, ...p }
    const base = gearBaseStatsFor(merged)
    onChange({
      ...merged,
      minPhys: base.minPhys,
      maxPhys: base.maxPhys,
      hp: base.hp,
      physDef: base.physDef,
    })
  }
  function clampAndRound(value: number, word: string, relayed: boolean): number {
    const spec = wordSpecs.find((s) => s.word === word)
    if (!spec || !Number.isFinite(value)) return value
    const cap = relayed ? relayedCapValue(spec.amount, spec.unit) : spec.amount
    return round1(Math.min(Math.max(value, 0), cap), spec.unit === "percent")
  }
  function patchWord(idx: number, w: Partial<GearWordEntry>): void {
    const next = [...piece.words] as GearPiece["words"]
    const merged = { ...next[idx], ...w }
    merged.value = clampAndRound(merged.value, merged.word, piece.relayed)
    next[idx] = merged
    onChange({ ...piece, words: next })
  }
  function setRelayed(value: boolean): void {
    const nextWords = piece.words.map((w) => ({
      ...w,
      value: clampAndRound(w.value, w.word, value),
    })) as GearPiece["words"]
    onChange({ ...piece, relayed: value, words: nextWords })
  }

  return (
    <fieldset disabled={disabled} style={{ border: "none", padding: 0, margin: 0 }}>
      <div className="gear-paired-row">
        <label>{t("Type")}</label>
        <Combobox
          value={piece.slot}
          options={slotOptions}
          onChange={(v) => patchBase({ slot: v as GearSlot })}
        />
        <label>{t("Level")}</label>
        <Combobox
          value={String(piece.level)}
          options={levelOptions}
          onChange={(v) => patchBase({ level: Number(v) as GearLevel })}
        />
      </div>
      <div className="gear-paired-row">
        <label>{t("Rarity")}</label>
        <Combobox
          value={piece.rarity}
          options={rarityOptions}
          onChange={(v) => patchBase({ rarity: v as GearRarity })}
        />
        <label></label>
        <span />
      </div>

      {weaponSide ? (
        <div className="gear-paired-row">
          <label>{t("Min Phys")}</label>
          <span className="gear-derived-value">{base.minPhys}</span>
          <label>{t("Max Phys")}</label>
          <span className="gear-derived-value">{base.maxPhys}</span>
        </div>
      ) : (
        <div className="gear-paired-row">
          <label>{t("HP")}</label>
          <span className="gear-derived-value">{base.hp}</span>
          <label>{t("Phys Defense")}</label>
          <span className="gear-derived-value">{base.physDef}</span>
        </div>
      )}

      <div className="gear-words-section">
        <div className="gear-words-header">
          <div className="gear-words-title">{t("Tunements")}</div>
          <label
            className="gear-relayed-toggle"
            title={t("Relayed gear caps each word at 94 % of its max")}
          >
            <input
              type="checkbox"
              checked={piece.relayed}
              onChange={(e) => setRelayed(e.target.checked)}
            />
            {t("Relayed")}
          </label>
        </div>
        <div className="gear-words-grid">
          {piece.words.map((w, idx) => {
            const spec = wordSpecs.find((s) => s.word === w.word)
            const isPercent = spec?.unit === "percent"
            const ValueInput = isPercent ? PercentInput : NumInput
            const cap = capFor(w.word, piece.relayed)
            const maxDisplay =
              cap != null ? (isPercent ? `${(cap * 100).toFixed(2)} %` : cap.toFixed(2)) : undefined
            const wm: WordMaxRow | undefined = wordMaxRows[idx]
            let maxValueText: string
            let deltaText = ""
            let deltaSign = "is-zero"
            let deltaTitle: string | undefined
            if (wm && wm.evaluated) {
              maxValueText =
                wm.unit === "percent"
                  ? `${(wm.capValue * 100).toFixed(1)}%`
                  : wm.capValue.toFixed(1)
              deltaText = fmtDpsDelta(wm.deltaDps)
              deltaSign = deltaSignClass(wm.deltaDps)
              deltaTitle = `${t("Full-cast 94%")}: ${maxValueText} → ${deltaText} DPS`
            } else {
              maxValueText = wordMaxPending ? "…" : "—"
            }
            return (
              <div key={idx} className="gear-word-row">
                <Combobox
                  value={w.word}
                  options={wordOptions}
                  onChange={(v) => patchWord(idx, { word: v })}
                  placeholder={t("(none)")}
                />
                <ValueInput
                  value={w.value}
                  onChange={(v) => patchWord(idx, { value: v })}
                  min={0}
                  title={maxDisplay ? `${t("Max")}: ${maxDisplay}` : undefined}
                />
                <button
                  type="button"
                  className={"cr-btn" + (w.retuned ? " is-on" : "")}
                  onClick={() => patchWord(idx, { retuned: !w.retuned })}
                  title={t("Retune")}
                >
                  R
                </button>
                {showWordMax && (
                  <div className="gear-word-max" title={deltaTitle}>
                    <span className="gear-word-max-value">{maxValueText}</span>
                    <span className={"gear-word-max-delta " + deltaSign}>{deltaText}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {(() => {
        const active = piece.attunement ? getAttunement(piece.attunement) : undefined
        const selected =
          active && attunementCatalog.some((o) => o.id === active.id) ? active : undefined
        const isPercent = true
        const ValueInput = isPercent ? PercentInput : NumInput
        const min = selected?.min ?? 0
        const max = selected?.max ?? 0
        const rangeHint = selected
          ? `${(min * 100).toFixed(1)}–${(max * 100).toFixed(1)} %${selected.hint ? " " + t(selected.hint) : ""}`
          : ""
        function clampValue(v: number): number {
          if (!selected || !Number.isFinite(v)) return v
          return Math.round(Math.min(Math.max(v, selected.min), selected.max) * 1000) / 1000
        }
        return (
          <div className="gear-paired-row">
            <label>{t("Attunement")}</label>
            <Combobox
              value={selected?.id ?? ""}
              options={attunementOptions}
              onChange={(v) => patch({ attunement: v, attunementValue: 0 })}
              placeholder={t("(none)")}
            />
            <label>{t("Amount")}</label>
            <ValueInput
              value={piece.attunementValue}
              onChange={(v) => patch({ attunementValue: clampValue(v) })}
              min={0}
              title={rangeHint || undefined}
            />
          </div>
        )
      })()}
    </fieldset>
  )
}
