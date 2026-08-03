import { useMemo } from "react"
import type { Result, SkillTickResult } from "../../../engine/types"
import { useI18n } from "../../../i18n/I18nContext"

function groupKey(name: string): string {
  return name.replace(/\s*\(\d+ stack\)$/, "")
}

interface GroupedRow {
  name: string
  count: number
  castCount: number
  castTimeSec: number
  expectedDamage: number
  percentOfTotal: number
  dpsOfCastTime: number
}

function groupAndSort(rows: SkillTickResult[]): GroupedRow[] {
  const map = new Map<string, GroupedRow>()
  for (const r of rows) {
    const key = groupKey(r.name)
    const castCount = r.castCount ?? 0
    const castTimeSec = r.castTimeSec ?? 0
    const existing = map.get(key)
    if (existing) {
      existing.count += r.count
      existing.castCount += castCount
      existing.castTimeSec += castTimeSec
      existing.expectedDamage += r.expectedDamage
      existing.percentOfTotal += r.percentOfTotal
    } else {
      map.set(key, {
        name: key,
        count: r.count,
        castCount,
        castTimeSec,
        expectedDamage: r.expectedDamage,
        percentOfTotal: r.percentOfTotal,
        dpsOfCastTime: 0,
      })
    }
  }
  const out = Array.from(map.values())
  for (const row of out) {
    row.dpsOfCastTime = row.castTimeSec > 0 ? row.expectedDamage / row.castTimeSec : 0
  }
  return out.sort((a, b) => b.expectedDamage - a.expectedDamage)
}

const fmt = (n: number, digits = 2) =>
  Number.isFinite(n)
    ? n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : "—"

const PALETTE = [
  "#c0a060",
  "#6a9bd8",
  "#8fbf6a",
  "#d87a7a",
  "#b57ad8",
  "#d8b46a",
  "#6ad8c4",
  "#d86ab0",
  "#9a9a9a",
  "#d8d86a",
  "#7a9ad8",
  "#d89a6a",
]
const colorFor = (i: number) => PALETTE[i % PALETTE.length]

export function RotationBreakdownPanel({ result }: { result: Result }) {
  const { t } = useI18n()
  const rows = useMemo(() => groupAndSort(result.perSkill), [result.perSkill])

  if (rows.length === 0) {
    return <div className="empty-tab">{t("(none)")}</div>
  }

  const maxDmg = rows[0]?.expectedDamage || 1

  let cursor = 0
  const stops: string[] = []
  for (let i = 0; i < rows.length; i++) {
    const start = cursor
    const span = Math.max(0, rows[i].percentOfTotal) * 100
    cursor += span
    stops.push(`${colorFor(i)} ${start.toFixed(3)}% ${cursor.toFixed(3)}%`)
  }
  const gradient = stops.length > 0 ? `conic-gradient(${stops.join(", ")})` : "none"

  return (
    <div className="breakdown-layout">
      <div className="breakdown-pie-wrap">
        <div className="breakdown-pie" style={{ background: gradient }} />
        <div className="breakdown-legend">
          {rows.map((r, i) => (
            <div key={r.name} className="breakdown-legend-row">
              <span className="breakdown-legend-swatch" style={{ background: colorFor(i) }} />
              <span className="breakdown-legend-name">{t(r.name)}</span>
              <span className="breakdown-legend-pct">{(r.percentOfTotal * 100).toFixed(1)} %</span>
            </div>
          ))}
        </div>
      </div>
      <table className="ranking-table skill-table breakdown-table">
        <thead>
          <tr>
            <th>{t("Skill")}</th>
            <th className="bar-col" />
            <th>{t("Casts")}</th>
            <th>{t("Hit Count")}</th>
            <th>{t("Duration")}</th>
            <th>{t("Share")}</th>
            <th>{t("DPS (cast time)")}</th>
            <th>{t("Total Damage")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const ratio = r.expectedDamage / maxDmg
            return (
              <tr key={r.name}>
                <td>{t(r.name)}</td>
                <td className="bar-col">
                  <div className="skill-bar-track">
                    <div
                      className="skill-bar-fill"
                      style={{ width: (ratio * 100).toFixed(2) + "%", background: colorFor(i) }}
                    />
                  </div>
                </td>
                <td>{r.castCount}</td>
                <td>{r.count}</td>
                <td>{r.castTimeSec.toFixed(2)} s</td>
                <td>{(r.percentOfTotal * 100).toFixed(1)} %</td>
                <td>{fmt(r.dpsOfCastTime, 1)}</td>
                <td>{fmt(r.expectedDamage, 0)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
