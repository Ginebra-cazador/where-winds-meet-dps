import type { Arsenal, Inputs } from "../../../engine/types"
import { ARSENAL_BONUS, swapArsenal } from "../../../engine/panel"
import { useI18n } from "../../../i18n/I18nContext"

interface Props {
  inputs: Inputs
  onChange: (next: Inputs) => void
  arsenalDpsByChoice?: Record<string, number>
  isPending?: boolean
}

interface ArsenalTile {
  choice: Arsenal
  label: string
  statKey: string
}

const ARSENAL_TILES: ArsenalTile[] = [
  { choice: "general", label: "General Arsenal", statKey: "Phys" },
  { choice: "bellstrike", label: "Bellstrike Arsenal", statKey: "Bellstrike" },
  { choice: "stonesplit", label: "Stonesplit Arsenal", statKey: "Stonesplit" },
  { choice: "silkbind", label: "Silkbind Arsenal", statKey: "Silkbind" },
  { choice: "bamboocut", label: "Bamboocut Arsenal", statKey: "Bamboocut" },
]

const fmtDelta = (n: number) => {
  if (!Number.isFinite(n)) return "—"
  const sign = n > 0 ? "+" : ""
  return `${sign}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function ArsenalPanel({ inputs, onChange, arsenalDpsByChoice, isPending }: Props) {
  const { t } = useI18n()

  const currentDps = arsenalDpsByChoice?.[inputs.arsenal] ?? Number.NaN

  return (
    <div className="set-tile-grid cols-3" style={{ opacity: isPending ? 0.6 : 1 }}>
      {ARSENAL_TILES.map((tile) => {
        const bonusLine = `+${ARSENAL_BONUS.min} / +${ARSENAL_BONUS.max} ${tile.statKey}`
        return (
          <ArsenalTileButton
            key={tile.choice}
            label={t(tile.label)}
            bonusLine={bonusLine}
            dps={arsenalDpsByChoice?.[tile.choice] ?? Number.NaN}
            currentDps={currentDps}
            selected={inputs.arsenal === tile.choice}
            onClick={() => onChange(swapArsenal(inputs, tile.choice))}
            currentLabel={t("Active")}
          />
        )
      })}
    </div>
  )
}

interface ArsenalTileProps {
  label: string
  bonusLine: string
  dps: number
  currentDps: number
  selected: boolean
  onClick: () => void
  currentLabel: string
}

function ArsenalTileButton({
  label,
  bonusLine,
  dps,
  currentDps,
  selected,
  onClick,
  currentLabel,
}: ArsenalTileProps) {
  const delta = dps - currentDps
  const cls =
    "bow-set-tile" +
    (selected ? " is-selected" : "") +
    (!selected && delta > 0 ? " is-positive" : "") +
    (!selected && delta < 0 ? " is-negative" : "")
  return (
    <button type="button" className={cls} onClick={onClick}>
      <div className="bow-set-tile-head">
        <span className="bow-set-tile-label">{label}</span>
      </div>
      <div className="arsenal-tile-bonus">{bonusLine}</div>
      {!selected && <div className="bow-set-tile-delta">{fmtDelta(delta)}</div>}
      {selected && <div className="bow-set-tile-delta is-current">{currentLabel}</div>}
    </button>
  )
}
