import type { Arsenal, Inputs } from "../../../../engine/types"
import { ARSENAL_BONUS, swapArsenal } from "../../../../engine/panel"
import { useI18n } from "../../../../i18n/i18nContext"
import setTiles from "../shared/setTiles.module.scss"
import styles from "./ArsenalPanel.module.scss"

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

const fmtDelta = (delta: number) => {
  if (!Number.isFinite(delta)) return "—"
  const sign = delta > 0 ? "+" : ""
  return `${sign}${delta.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function ArsenalPanel({ inputs, onChange, arsenalDpsByChoice, isPending }: Props) {
  const { t } = useI18n()

  const currentDps = arsenalDpsByChoice?.[inputs.arsenal] ?? Number.NaN

  return (
    <div
      className={`${setTiles.tileGrid} ${setTiles.cols3}`}
      style={{ opacity: isPending ? 0.6 : 1 }}
    >
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
  const tileClassName =
    setTiles.tile +
    (selected ? ` ${setTiles.isSelected}` : "") +
    (!selected && delta > 0 ? ` ${setTiles.isPositive}` : "") +
    (!selected && delta < 0 ? ` ${setTiles.isNegative}` : "")
  return (
    <button type="button" className={tileClassName} onClick={onClick}>
      <div className={setTiles.tileHead}>
        <span className={setTiles.tileLabel}>{label}</span>
      </div>
      <div className={styles.arsenalTileBonus}>{bonusLine}</div>
      {!selected && <div className={setTiles.tileDelta}>{fmtDelta(delta)}</div>}
      {selected && (
        <div className={`${setTiles.tileDelta} ${setTiles.isCurrent}`}>{currentLabel}</div>
      )}
    </button>
  )
}
