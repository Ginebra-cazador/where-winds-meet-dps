import type { BowSet, Inputs } from "../../../engine/types"
import { ARMOR_SET_OPTIONS, BOW_SET_BONUS } from "../../../engine/panel"
import { useI18n } from "../../../i18n/I18nContext"

interface Props {
  inputs: Inputs
  onChange: (next: Inputs) => void
  armorDpsByKey?: Record<string, number>
  bowDpsByChoice?: { affinity: number; crit: number; precision: number; none: number }
  isPending?: boolean
}

interface BowTile {
  choice: BowSet
  label: string
  bonusValue: number
}

const BOW_TILES: BowTile[] = [
  { choice: "affinity", label: "Affinity", bonusValue: BOW_SET_BONUS.affinity },
  { choice: "crit", label: "Crit", bonusValue: BOW_SET_BONUS.crit },
  { choice: "precision", label: "Precision", bonusValue: BOW_SET_BONUS.precision },
  { choice: null, label: "(unselected)", bonusValue: 0 },
]

function bonusValueLabel(value: number, isFlat: boolean): string {
  if (value === 0) return ""
  return isFlat ? `+${value}` : `+${(value * 100).toFixed(1)}%`
}

function bonusWithStatLabel(
  t: (s: string) => string,
  statKey: string,
  value: number,
  isFlat: boolean,
): string {
  if (!statKey || value === 0) return ""
  return `${bonusValueLabel(value, isFlat)} ${t(statKey)}`
}

const STAT_TO_I18N_KEY: Readonly<Record<string, string>> = {
  affinityRate: "Affinity",
  critRate: "Crit",
  precisionRate: "Precision",
  maxPhys: "Max Phys",
}

const fmtDelta = (n: number) => {
  if (!Number.isFinite(n)) return "—"
  const sign = n > 0 ? "+" : ""
  return `${sign}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function BowSetPanel({ inputs, onChange, armorDpsByKey, bowDpsByChoice, isPending }: Props) {
  const { t } = useI18n()

  const currentArmorDps =
    inputs.set && armorDpsByKey?.[inputs.set] !== undefined
      ? armorDpsByKey[inputs.set]
      : (armorDpsByKey?.__none ?? Number.NaN)

  const currentBowDps = bowDpsKey(inputs.bowSet, bowDpsByChoice)

  const armorSelectedKey = ARMOR_SET_OPTIONS.some((o) => o.setKey === inputs.set)
    ? inputs.set
    : null

  return (
    <div style={{ opacity: isPending ? 0.6 : 1 }}>
      <div className="set-section-label">{t("Armor Set")}</div>
      <div className="set-tile-grid cols-2">
        {ARMOR_SET_OPTIONS.map((opt) => {
          const statKey = STAT_TO_I18N_KEY[opt.stat] ?? opt.stat
          const isFlat = opt.stat === "maxPhys"
          return (
            <SetTile
              key={opt.setKey}
              label={t(opt.setKey)}
              bonusLabel={bonusWithStatLabel(t, statKey, opt.value, isFlat)}
              dps={armorDpsByKey?.[opt.setKey] ?? Number.NaN}
              currentDps={currentArmorDps}
              selected={armorSelectedKey === opt.setKey}
              onClick={() => onChange({ ...inputs, set: opt.setKey })}
              currentLabel={t("Active")}
            />
          )
        })}
        <SetTile
          label={t("(unselected)")}
          bonusLabel=""
          dps={armorDpsByKey?.__none ?? Number.NaN}
          currentDps={currentArmorDps}
          selected={armorSelectedKey === null}
          onClick={() => onChange({ ...inputs, set: null })}
          currentLabel={t("Active")}
        />
      </div>

      <div className="set-section-label">{t("Bow Set")}</div>
      <div className="set-tile-grid cols-4">
        {BOW_TILES.map((tile) => (
          <SetTile
            key={tile.choice ?? "none"}
            label={t(tile.label)}
            bonusLabel={bonusValueLabel(tile.bonusValue, false)}
            dps={bowDpsKey(tile.choice, bowDpsByChoice)}
            currentDps={currentBowDps}
            selected={inputs.bowSet === tile.choice}
            onClick={() => onChange({ ...inputs, bowSet: tile.choice })}
            currentLabel={t("Active")}
          />
        ))}
      </div>
    </div>
  )
}

interface SetTileProps {
  label: string
  bonusLabel: string
  dps: number
  currentDps: number
  selected: boolean
  onClick: () => void
  currentLabel: string
}

function SetTile({
  label,
  bonusLabel,
  dps,
  currentDps,
  selected,
  onClick,
  currentLabel,
}: SetTileProps) {
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
        {bonusLabel && <span className="bow-set-tile-bonus">{bonusLabel}</span>}
      </div>
      {!selected && <div className="bow-set-tile-delta">{fmtDelta(delta)}</div>}
      {selected && <div className="bow-set-tile-delta is-current">{currentLabel}</div>}
    </button>
  )
}

function bowDpsKey(
  choice: BowSet,
  table: { affinity: number; crit: number; precision: number; none: number } | undefined,
): number {
  if (!table) return Number.NaN
  switch (choice) {
    case "affinity":
      return table.affinity
    case "crit":
      return table.crit
    case "precision":
      return table.precision
    default:
      return table.none
  }
}
