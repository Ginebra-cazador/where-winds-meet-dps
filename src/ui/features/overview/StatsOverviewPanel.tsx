import type { Inputs } from "../../../engine/types"
import { withDerivedStats, equippedPiecesFor } from "../../../engine/derivedInputs"
import { totalPlayerAttributes } from "../../../data/baseStats"
import { FOOD_MIN_PHYS_BONUS, FOOD_MAX_PHYS_BONUS } from "../../../engine/formula"
import { applyArmorSet, applyBowSet, effectiveRates, getSchool } from "../../../engine/panel"
import { useI18n } from "../../../i18n/I18nContext"
import { fmt, PATH_LABELS, PERCENT_PATHS, readPath } from "../../utils/statFormatting"

interface Props {
  inputs: Inputs
}

const ATTRIBUTE_BLOCKS: ("bellstrike" | "stonesplit" | "silkbind" | "bamboocut")[] = [
  "bellstrike",
  "stonesplit",
  "silkbind",
  "bamboocut",
]

const DAMAGE_BOOST_PATHS = [
  "physBoost",
  "critDamageBoost",
  "affinityDamageBoost",
  "attributeDamageBoost",
  "sustainDamageBoost",
]

const MARTIAL_BOOST_PATHS = [
  "allMartialBoost",
  "swordBoost",
  "spearBoost",
  "fanBoost",
  "umbrellaBoost",
  "modaoBoost",
  "dualKnivesBoost",
  "ropeDartBoost",
  "hengDaoBoost",
]

const TARGET_BOOST_PATHS = [
  "bossBoost",
  "singleMysticBoost",
  "groupAnomalyBoost",
  "groupDamageBoost",
]

interface RowEntry {
  label: string
  value: number
  effective?: number
  isPercent: boolean
  isPenetration?: boolean
}

function row(
  label: string,
  value: number,
  isPercent: boolean,
  effective?: number,
  isPenetration?: boolean,
): RowEntry {
  return { label, value, isPercent, effective, isPenetration }
}

export function StatsOverviewPanel({ inputs }: Props) {
  const { t } = useI18n()
  const school = getSchool(inputs.classId)

  const derived = withDerivedStats(inputs)
  const withSets = applyBowSet(applyArmorSet(derived))

  const eff = effectiveRates(withSets)

  const attrs = totalPlayerAttributes(equippedPiecesFor(inputs))
  const attributeRows: RowEntry[] = [
    row(t("Power"), attrs.power, false),
    row(t("Agility"), attrs.agility, false),
    row(t("Momentum"), attrs.momentum, false),
  ]

  const rateRows: RowEntry[] = [
    row(t(PATH_LABELS.precision), withSets.precision, true, eff.precision),
    row(t(PATH_LABELS.critRate), withSets.critRate, true, eff.critRate),
    row(t(PATH_LABELS.affinityRate), withSets.affinityRate, true, eff.affinityRate),
    row(t(PATH_LABELS.directCritRate), withSets.directCritRate, true),
    row(t(PATH_LABELS.directAffinityRate), withSets.directAffinityRate, true),
  ]

  const physMin = readPath(withSets, "phys.min")
  const physMax = readPath(withSets, "phys.max")
  const attackRows: RowEntry[] = [
    row(
      t(PATH_LABELS["phys.min"]),
      physMin,
      false,
      withSets.food ? physMin + FOOD_MIN_PHYS_BONUS : undefined,
    ),
    row(
      t(PATH_LABELS["phys.max"]),
      physMax,
      false,
      withSets.food ? physMax + FOOD_MAX_PHYS_BONUS : undefined,
    ),
  ]
  const penetrationRows: RowEntry[] = [
    row(
      t(PATH_LABELS["phys.penetration"]),
      readPath(withSets, "phys.penetration"),
      false,
      undefined,
      true,
    ),
  ]
  for (const key of ATTRIBUTE_BLOCKS) {
    const min = readPath(withSets, `${key}.min`)
    const max = readPath(withSets, `${key}.max`)
    const pen = readPath(withSets, `${key}.penetration`)
    if (min !== 0 || max !== 0) {
      attackRows.push(
        row(t(PATH_LABELS[`${key}.min`]), min, false),
        row(t(PATH_LABELS[`${key}.max`]), max, false),
      )
    }
    if (pen !== 0) {
      penetrationRows.push(row(t(PATH_LABELS[`${key}.penetration`]), pen, false, undefined, true))
    }
  }

  const damageBoostRows: RowEntry[] = DAMAGE_BOOST_PATHS.map((p) =>
    row(t(PATH_LABELS[p] ?? p), readPath(withSets, p), PERCENT_PATHS.has(p)),
  )

  const martialBoostRows: RowEntry[] = MARTIAL_BOOST_PATHS.map((p) =>
    row(t(PATH_LABELS[p] ?? p), readPath(withSets, p), PERCENT_PATHS.has(p)),
  ).filter((r) => r.value !== 0)
  const targetBoostRows: RowEntry[] = TARGET_BOOST_PATHS.map((p) =>
    row(t(PATH_LABELS[p] ?? p), readPath(withSets, p), PERCENT_PATHS.has(p)),
  ).filter((r) => r.value !== 0)

  const classBuffRows: RowEntry[] = school.permanentBuffs
    .filter((tag) => tag && tag !== "N/A")
    .map((tag) => row(t(tag), withSets.dingYinByTag[tag] ?? 0, true))

  return (
    <div className="stats-overview">
      <Section title={t("Attributes")} rows={attributeRows} />
      <Section title={t("Three Rates")} rows={rateRows} />
      <Section title={t("Attack & Penetration")} rows={[...attackRows, ...penetrationRows]} />
      <Section
        title={t("Damage Boosts")}
        rows={[...damageBoostRows, ...martialBoostRows, ...targetBoostRows]}
      />
      {classBuffRows.length > 0 && <Section title={t("Class Buffs")} rows={classBuffRows} />}
    </div>
  )
}

function Section({ title, rows }: { title: string; rows: RowEntry[] }) {
  if (rows.length === 0) return null
  return (
    <div className="stats-overview-section">
      <div className="stats-overview-section-head">{title}</div>
      <div className="stats-overview-grid">
        {rows.map((r, i) => (
          <div key={i} className="stats-overview-row">
            <div className="stats-overview-label" title={r.label}>
              {r.label}
            </div>
            <div className="stats-overview-value">
              {fmt(r.value, r.isPercent, r.isPenetration)}
              {r.effective !== undefined && (
                <span className="stats-overview-eff">
                  {" → "}
                  {fmt(r.effective, r.isPercent, r.isPenetration)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
