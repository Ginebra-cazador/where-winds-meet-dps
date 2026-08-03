import { useState } from "react"
import { useI18n } from "../../../i18n/I18nContext"
import { getSchool } from "../../../engine/panel"
import type { Inputs } from "../../../engine/types"
import { SubTabs } from "../../components/SubTabs"
import { TalentsTab } from "./TalentsTab"
import { OdditiesTab } from "./OdditiesTab"

export function TalentsOdditiesTab({
  inputs,
  onChange,
}: {
  inputs: Inputs
  onChange: (next: Inputs) => void
}) {
  const { t } = useI18n()
  const [sub, setSub] = useState<"talents" | "oddities">("talents")
  const className = t(getSchool(inputs.classId).cn ?? inputs.classId)
  return (
    <>
      <SubTabs
        active={sub}
        onSelect={setSub}
        tabs={[
          { key: "talents", label: `${t("Class Talents")} (${className})` },
          { key: "oddities", label: t("Oddities") },
        ]}
      />
      {sub === "talents" && <TalentsTab inputs={inputs} />}
      {sub === "oddities" && <OdditiesTab inputs={inputs} onChange={onChange} />}
    </>
  )
}
