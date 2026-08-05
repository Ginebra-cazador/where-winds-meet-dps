import breakthroughs from "../../../../data/baseStats/breakthroughTiers.json"
import { useI18n } from "../../../../i18n/i18nContext"

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
        {BREAKTHROUGHS.map((tier) => (
          <option key={tier.breakthrough} value={tier.breakthrough}>
            {`${t("Lv.")} ${tier.breakthrough}${tier.name ? ` · ${tier.name}` : ""} (${t("Lv.")} ${tier.levelRange}, def ${tier.defense}, res ${tier.resistance}%)`}
          </option>
        ))}
      </select>
    </div>
  )
}
