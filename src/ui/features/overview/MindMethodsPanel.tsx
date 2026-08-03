import type { Inputs, MindMethodSlot } from "../../../engine/types"
import { allowedInnerWaysForClass } from "../../../engine/panel"
import { useI18n } from "../../../i18n/I18nContext"

const TIER_OPTIONS = ["tier 6", "tier 5"] as const

interface Props {
  inputs: Inputs
  onChange: (next: Inputs) => void
}

export function MindMethodsPanel({ inputs, onChange }: Props) {
  const { t } = useI18n()
  const updateSlot = (i: number, patch: Partial<MindMethodSlot>) => {
    const next = inputs.mindMethods.map((m, idx) =>
      idx === i ? { ...m, ...patch } : m,
    ) as Inputs["mindMethods"]
    onChange({ ...inputs, mindMethods: next })
  }

  const options = ["", ...allowedInnerWaysForClass(inputs.classId)]
  const slotConfigs: { idx: number; label: string }[] = [
    { idx: 0, label: "Inner Way 1" },
    { idx: 1, label: "Inner Way 2" },
    { idx: 2, label: "Inner Way 3" },
    { idx: 3, label: "Inner Way 4" },
  ]

  return (
    <>
      {slotConfigs.map(({ idx, label }) => {
        const slot = inputs.mindMethods[idx]
        const currentName = slot.name
        const fallbackNames = slot.name && !options.includes(slot.name) ? [slot.name] : []
        const takenElsewhere = new Set(
          inputs.mindMethods.filter((m, i) => i !== idx && m.name).map((m) => m.name),
        )
        const isTaken = (n: string) => n !== "" && n !== currentName && takenElsewhere.has(n)
        return (
          <div key={idx} className="mind-slot">
            <label>{label}</label>
            <select
              value={currentName}
              onChange={(e) => {
                const name = e.target.value
                const patch: Partial<MindMethodSlot> = { name }
                if (name && !slot.stacks) patch.stacks = "tier 6"
                if (!name) patch.stacks = ""
                updateSlot(idx, patch)
              }}
            >
              {options.map((n) => (
                <option key={n || "-"} value={n} disabled={isTaken(n)}>
                  {n ? t(n) : t("(unselected)")}
                </option>
              ))}
              {fallbackNames.length > 0 && (
                <optgroup label={t("No longer available")}>
                  {fallbackNames.map((n) => (
                    <option key={n} value={n} disabled={isTaken(n)}>
                      {t(n)}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <select
              value={slot.stacks || "tier 6"}
              disabled={!currentName}
              onChange={(e) => updateSlot(idx, { stacks: e.target.value })}
            >
              {TIER_OPTIONS.map((tier) => (
                <option key={tier} value={tier}>
                  {t(tier)}
                </option>
              ))}
            </select>
          </div>
        )
      })}
    </>
  )
}
