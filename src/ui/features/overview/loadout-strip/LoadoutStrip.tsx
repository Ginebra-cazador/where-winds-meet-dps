import { useI18n } from "../../../../i18n/i18nContext"
import type { Inputs } from "../../../../engine/types"
import { syncClassPermanent } from "../../../utils/classSetup"
import { ClassSelect } from "../class-select/ClassSelect"
import { BreakthroughSelect } from "../breakthrough-select/BreakthroughSelect"
import { Switch } from "../../../components/switch/Switch"
import styles from "./LoadoutStrip.module.scss"

export function LoadoutStrip({
  inputs,
  onChange,
}: {
  inputs: Inputs
  onChange: (next: Inputs) => void
}) {
  const { t } = useI18n()
  return (
    <div className={styles.strip}>
      <div className={styles.field}>
        <span className={styles.fieldLabel}>{t("Class")}</span>
        <ClassSelect
          value={inputs.classId}
          onChange={(classId) => onChange(syncClassPermanent(inputs, classId))}
        />
      </div>
      <div className={styles.field}>
        <span className={styles.fieldLabel}>{t("Breakthrough")}</span>
        <BreakthroughSelect
          value={inputs.breakthrough}
          onChange={(breakthrough) => onChange({ ...inputs, breakthrough })}
        />
      </div>
      <div className={styles.divider} aria-hidden="true" />
      <Switch
        checked={inputs.dummyMode}
        label={t("Enable Dummy")}
        onChange={(dummyMode) => onChange({ ...inputs, dummyMode })}
      />
    </div>
  )
}
