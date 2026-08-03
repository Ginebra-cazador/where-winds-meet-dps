import schools from "../../../data/classes/schools.json"
import { useI18n } from "../../../i18n/I18nContext"

const SCHOOLS = schools as { id: string; cn: string; en: string }[]

const SUPPORTED_CLASS_IDS: ReadonlySet<string> = new Set(["bellstrikeUmbra"])

interface Props {
  value: string
  onChange: (next: string) => void
}

export function ClassSelect({ value, onChange }: Props) {
  const { t } = useI18n()
  const visible = SCHOOLS.filter((s) => SUPPORTED_CLASS_IDS.has(s.id))
  const legacy = SUPPORTED_CLASS_IDS.has(value) ? undefined : SCHOOLS.find((s) => s.id === value)
  return (
    <div className="row">
      <label>{t("Class")}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {visible.map((s) => (
          <option key={s.id} value={s.id}>
            {t(s.cn)}
          </option>
        ))}
        {legacy && (
          <option value={legacy.id} disabled>
            {t(legacy.cn)}
          </option>
        )}
      </select>
    </div>
  )
}
