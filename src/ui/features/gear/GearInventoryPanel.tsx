import type { GearPiece, GearSlot } from "../../../engine/types"
import { useI18n } from "../../../i18n/I18nContext"
import type { DpsDelta } from "../../../engine/dpsWorker"
import type { DpsDeltaMap } from "../../hooks/useDpsDeltas"

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

export interface InventoryRow {
  piece: GearPiece
  ownerProfileId: string
  ownerProfileName: string
  isEquipped: boolean
}

interface Props {
  rows: InventoryRow[]
  activeProfileId: string
  selectedPieceId: string | null
  showGlobal: boolean
  onToggleGlobal(): void
  onSelect(row: InventoryRow): void
  onCreate(): void
  slotFilter: GearSlot | null
  onClearSlotFilter(): void
  dpsDeltas: DpsDeltaMap
  dpsDeltasPending: boolean
  hideComparisons?: boolean
}

function fmtDelta(n: number): string {
  const rounded = Math.round(n)
  if (rounded > 0) return `+${rounded.toLocaleString()}`
  if (rounded < 0) return `${rounded.toLocaleString()}`
  return "+0"
}

function signClass(n: number): string {
  const rounded = Math.round(n)
  if (rounded > 0) return "is-positive"
  if (rounded < 0) return "is-negative"
  return "is-zero"
}

export function sortInventoryRowsByDps(
  rows: InventoryRow[],
  dpsDeltas: DpsDeltaMap,
): InventoryRow[] {
  return [...rows].sort((a, b) => {
    const da = dpsDeltas[a.piece.id]
    const db = dpsDeltas[b.piece.id]
    if (da === undefined && db === undefined) return 0
    if (da === undefined) return 1
    if (db === undefined) return -1
    if (db.upgraded !== da.upgraded) return db.upgraded - da.upgraded
    return db.fullPotential - da.fullPotential
  })
}

export function GearInventoryPanel({
  rows,
  activeProfileId,
  selectedPieceId,
  showGlobal,
  onToggleGlobal,
  onSelect,
  onCreate,
  slotFilter,
  onClearSlotFilter,
  dpsDeltas,
  dpsDeltasPending,
  hideComparisons = false,
}: Props) {
  const { t } = useI18n()

  const unequippedRows = rows.filter((r) => !(r.isEquipped && r.ownerProfileId === activeProfileId))
  const filteredRows =
    slotFilter == null ? unequippedRows : unequippedRows.filter((r) => r.piece.slot === slotFilter)
  const visibleRows = sortInventoryRowsByDps(filteredRows, dpsDeltas)

  function renderTile(row: InventoryRow) {
    const { piece } = row
    const isSelected = piece.id === selectedPieceId
    const isForeign = row.ownerProfileId !== activeProfileId
    const delta: DpsDelta | undefined = dpsDeltas[piece.id]
    const slotLabel = t(SLOT_LABEL_KEYS[piece.slot])
    const rarityLabel = t(piece.rarity === "legendary" ? "Legendary" : "Epic")
    return (
      <button
        type="button"
        key={piece.id}
        className={
          "gear-inv-tile" +
          ` rarity-${piece.rarity}` +
          (isSelected ? " is-selected" : "") +
          (isForeign ? " is-foreign" : "")
        }
        onClick={() => onSelect(row)}
        title={`${slotLabel} lv${piece.level}`}
      >
        {piece.isNew && !isForeign && <span className="gear-inv-tile-new">{t("New")}</span>}

        <div className="gear-inv-tile-head">
          <span className="gear-inv-tile-slot">{slotLabel}</span>
          <span className="gear-inv-tile-meta">
            lv{piece.level} · {rarityLabel}
          </span>
        </div>

        {!hideComparisons && (
          <div className="gear-inv-tile-stats">
            <Stat label={t("Now")} delta={delta?.current} pending={dpsDeltasPending} />
            <Stat label={t("Max (94%)")} delta={delta?.upgraded} pending={dpsDeltasPending} />
            <Stat label="FP" delta={delta?.fullPotential} pending={dpsDeltasPending} />
            <Stat label="FP(E)" delta={delta?.fullPotentialE} pending={dpsDeltasPending} />
          </div>
        )}

        {isForeign && <div className="gear-inv-tile-owner">{row.ownerProfileName}</div>}
      </button>
    )
  }

  return (
    <div className="gear-inventory">
      <div className="cr-toolbar">
        <button type="button" className="cr-btn primary" onClick={onCreate}>
          + {t("New piece")}
        </button>
        {slotFilter != null && (
          <span className="gear-inv-filter">
            {t(SLOT_LABEL_KEYS[slotFilter])}
            <button
              type="button"
              className="gear-inv-filter-clear"
              onClick={onClearSlotFilter}
              title={t("Show all slots")}
              aria-label={t("Show all slots")}
            >
              ×
            </button>
          </span>
        )}
        <div className="cr-spacer" />
        <label className="gear-toggle">
          <input type="checkbox" checked={showGlobal} onChange={onToggleGlobal} />
          {t("Show global")}
        </label>
      </div>

      {visibleRows.length === 0 ? (
        <div className="empty-tab">
          {slotFilter != null
            ? t("No pieces of this type — click 'New piece' to add one")
            : rows.length === 0
              ? t("No gear yet — click 'New piece' to add one")
              : t("Equipped pieces are shown above")}
        </div>
      ) : (
        <div className="gear-inv-grid">{visibleRows.map(renderTile)}</div>
      )}
    </div>
  )
}

function Stat({
  label,
  delta,
  pending,
}: {
  label: string
  delta: number | undefined
  pending: boolean
}) {
  const cls = delta === undefined ? "is-pending" : signClass(delta)
  const value = delta === undefined ? (pending ? "…" : "—") : `${fmtDelta(delta)}`
  return (
    <div className={"gear-inv-tile-stat " + cls}>
      <span className="gear-inv-tile-stat-label">{label}</span>
      <span className="gear-inv-tile-stat-value">{value}</span>
    </div>
  )
}
