import type { Result, SkillTickResult } from "../../engine/types"
import { useI18n } from "../../i18n/I18nContext"

function groupKey(name: string): string {
  return name.replace(/\s*\(\d+ stack\)$/, "")
}

interface GroupedSkill {
  name: string
  count: number
  expectedDamage: number
  percentOfTotal: number
}

function groupAndSort(rows: SkillTickResult[]): GroupedSkill[] {
  const map = new Map<string, GroupedSkill>()
  for (const r of rows) {
    const key = groupKey(r.name)
    const existing = map.get(key)
    if (existing) {
      existing.count += r.count
      existing.expectedDamage += r.expectedDamage
      existing.percentOfTotal += r.percentOfTotal
    } else {
      map.set(key, {
        name: key,
        count: r.count,
        expectedDamage: r.expectedDamage,
        percentOfTotal: r.percentOfTotal,
      })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.expectedDamage - a.expectedDamage)
}

const fmt = (n: number, digits = 2) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : "—"

export function MetricsCard({ result }: { result: Result }) {
  const { t } = useI18n()
  return (
    <div className="metrics-card">
      <div className="dps">
        <span className="label">{t("DPS")}</span>
        <span className="value">{fmt(result.dps, 2)}</span>
      </div>
      <div className="stat">
        <span className="label">{t("Total Damage")}</span>
        <span className="value">{fmt(result.totalDamage, 0)}</span>
      </div>
      <div className="stat">
        <span className="label">{t("Duration")}</span>
        <span className="value">{fmt(result.rotationDuration, 0)}s</span>
      </div>
    </div>
  )
}

export function WarningsList({ result }: { result: Result }) {
  if (!result.warnings.length) return null
  return (
    <div className="warnings">
      {result.warnings.map((w, i) => (
        <div key={i}>⚠ {w}</div>
      ))}
    </div>
  )
}

export function PerSkillTable({ result }: { result: Result }) {
  const { t } = useI18n()
  if (!result.perSkill.length) {
    return <div className="empty-tab">{t("(none)")}</div>
  }
  const rows = groupAndSort(result.perSkill)
  const maxDmg = rows[0]?.expectedDamage || 1
  return (
    <table className="ranking-table skill-table">
      <thead>
        <tr>
          <th>{t("Skill")}</th>
          <th>{t("Count")}</th>
          <th>{t("Damage")}</th>
          <th>{t("Share")}</th>
          <th className="bar-col" />
        </tr>
      </thead>
      <tbody>
        {rows.map((s) => {
          const ratio = s.expectedDamage / maxDmg
          return (
            <tr key={s.name}>
              <td>{t(s.name)}</td>
              <td>{s.count}</td>
              <td>{fmt(s.expectedDamage, 0)}</td>
              <td>{(s.percentOfTotal * 100).toFixed(1)} %</td>
              <td className="bar-col">
                <div className="skill-bar-track">
                  <div
                    className="skill-bar-fill"
                    style={{ width: (ratio * 100).toFixed(2) + "%" }}
                  />
                  <span className="skill-bar-label">{(ratio * 100).toFixed(0)} %</span>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
