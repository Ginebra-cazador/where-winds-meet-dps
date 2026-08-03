import breakthroughs from "../../../data/baseStats/breakthroughTiers.json"
import { useI18n } from "../../../i18n/I18nContext"

interface BreakthroughRow {
  breakthrough: number
  name: string
  levelRange: string
  resistance: number
  defense: number
}
const BREAKTHROUGHS = breakthroughs as BreakthroughRow[]

interface Props {
  value: number
  onChange: (next: number) => void
}

export function BreakthroughSelect({ value, onChange }: Props) {
  const { t } = useI18n()
  return (
    <div className="row">
      <label>{t("Breakthrough")}</label>
      <select value={String(value)} onChange={(e) => onChange(Number(e.target.value))}>
        {BREAKTHROUGHS.map((bt) => (
          <option key={bt.breakthrough} value={bt.breakthrough}>
            {`${t("Lv.")} ${bt.breakthrough}${bt.name ? ` · ${bt.name}` : ""} (${t("Lv.")} ${bt.levelRange}, def ${bt.defense}, res ${bt.resistance}%)`}
          </option>
        ))}
      </select>
    </div>
  )
}
