import type { GearPiece, GearSlot } from "../../../engine/types"
import { GEAR_SLOTS } from "../../../engine/types"
import { useI18n } from "../../../i18n/I18nContext"
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

interface Props {
  inventory: GearPiece[]
  equipped: Record<GearSlot, string | null>
  selectedPieceId: string | null
  selectedSlot: GearSlot | null
  onSelectSlot(slot: GearSlot, pieceId: string | null): void
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

export function GearSlotTiles({
  inventory,
  equipped,
  selectedPieceId,
  selectedSlot,
  onSelectSlot,
  dpsDeltas,
  dpsDeltasPending,
  hideComparisons = false,
}: Props) {
  const { t } = useI18n()
  return (
    <div className="gear-tiles">
      {GEAR_SLOTS.map((slot) => {
        const pieceId = equipped[slot]
        const piece = pieceId ? (inventory.find((p) => p.id === pieceId) ?? null) : null
        const isSelected =
          slot === selectedSlot ||
          (selectedPieceId !== null && piece !== null && piece.id === selectedPieceId)
        const delta = piece ? dpsDeltas[piece.id] : undefined
        return (
          <button
            type="button"
            key={slot}
            className={
              "gear-tile" +
              (piece ? ` rarity-${piece.rarity}` : " empty") +
              (isSelected ? " is-selected" : "")
            }
            onClick={() => onSelectSlot(slot, piece?.id ?? null)}
          >
            <div className="gear-tile-slot">{t(SLOT_LABEL_KEYS[slot])}</div>
            <div className="gear-tile-piece">
              {piece
                ? `lv${piece.level} · ${t(piece.rarity === "legendary" ? "Legendary" : "Epic")}`
                : t("Empty")}
            </div>
            {piece && !hideComparisons && (
              <div className="gear-tile-stats">
                <SlotStat
                  label={t("Max (94%)")}
                  delta={delta?.upgraded}
                  pending={dpsDeltasPending}
                />
                <SlotStat label="FP" delta={delta?.fullPotential} pending={dpsDeltasPending} />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

function SlotStat({
  label,
  delta,
  pending,
}: {
  label: string
  delta: number | undefined
  pending: boolean
}) {
  const cls = delta === undefined ? "is-pending" : signClass(delta)
  const value = delta === undefined ? (pending ? "…" : "—") : fmtDelta(delta)
  return (
    <div className={"gear-tile-stat " + cls}>
      <span className="gear-tile-stat-label">{label}</span>
      <span className="gear-tile-stat-value">{value}</span>
    </div>
  )
}
