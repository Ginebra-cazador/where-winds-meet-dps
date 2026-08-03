import type { ItemRankingRow } from "../../../engine/types"
import { useI18n } from "../../../i18n/I18nContext"

interface Props {
  rows: ItemRankingRow[]
}

export function ItemRankingTable({ rows }: Props) {
  const { t } = useI18n()
  if (!rows.length) return null
  const sorted = [...rows].sort((a, b) => b.liftPercent - a.liftPercent)
  const fmt = (n: number, digits = 2) =>
    Number.isFinite(n)
      ? n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })
      : "—"
  return (
    <table className="ranking-table ranking-table-spaced">
      <thead>
        <tr>
          <th>{t("Tunements")}</th>
          <th>{t("Amount")}</th>
          <th>{t("Expected DPS")}</th>
          <th>{t("Lift")}</th>
          <th>{t("Lead")}</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((row, i) => (
          <tr key={row.word + i}>
            <td>{t(row.word)}</td>
            <td>{row.unit === "percent" ? fmt(row.amount * 100, 2) + " %" : fmt(row.amount, 2)}</td>
            <td>{fmt(row.expectedDps, 2)}</td>
            <td>{(row.liftPercent * 100).toFixed(2) + " %"}</td>
            <td style={{ color: row.leadVsMin === "(none)" ? "#666" : "#d8b070" }}>
              {typeof row.leadVsMin === "number" ? row.leadVsMin.toFixed(2) : t(row.leadVsMin)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
