import { useMemo, useState } from "react"
import type { Inputs } from "../../../engine/types"
import { applyArmorSet, applyBowSet } from "../../../engine/panel"
import { withDerivedStats } from "../../../engine/derivedInputs"
import { useI18n } from "../../../i18n/I18nContext"
import { syncClassPermanent } from "../../utils/classSetup"
import { ClassSelect } from "../overview/ClassSelect"
import { MindMethodsPanel } from "../overview/MindMethodsPanel"
import { GearTab } from "../gear/GearTab"

export type SetupMode = "first-run" | "new-profile"

interface Props {
  initialName: string
  initialInputs: Inputs
  mode: SetupMode
  onFinish(name: string, inputs: Inputs): void
  onCancel?: () => void
}

const TEMP_PROFILE_ID = "__setup_wizard__"
const STEP_COUNT = 3

export function SetupWizard({ initialName, initialInputs, mode, onFinish, onCancel }: Props) {
  const { t } = useI18n()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [name, setName] = useState(initialName)
  const [draft, setDraft] = useState<Inputs>(() =>
    syncClassPermanent(initialInputs, initialInputs.classId),
  )

  const trimmedName = name.trim()
  const canAdvance = step === 1 ? trimmedName.length > 0 : true

  function next() {
    if (!canAdvance) return
    if (step < STEP_COUNT) setStep((s) => (s + 1) as 1 | 2 | 3)
    else onFinish(trimmedName, draft)
  }
  function back() {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3)
    else if (onCancel) onCancel()
  }
  const canGoBack = step > 1 || !!onCancel
  const backLabel = step === 1 && onCancel ? t("Cancel") : t("Back")

  const heading =
    step === 1 ? t("Name your profile") : step === 2 ? t("Class & Inner Ways") : t("Your gear")

  const instruction =
    step === 1
      ? t("Give this profile a name — your character name works well.")
      : step === 2
        ? t("Pick your class, then fill in the four Inner Way slots.")
        : t(
            "Add the gear you currently own. We'll skip DPS comparisons during setup — you can review them on the Gear tab once you're done.",
          )

  const finishLabel = mode === "first-run" ? t("Finish setup") : t("Create profile")

  return (
    <div
      className="wizard-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-heading"
    >
      <div className={"wizard-modal" + (step === 3 ? " wizard-modal--gear" : "")}>
        <div className="wizard-header">
          <div className="wizard-step-indicator">
            {t("Step {n}").replace("{n}", `${step} / ${STEP_COUNT}`)}
          </div>
          <h2 id="wizard-heading">{heading}</h2>
          <p className="wizard-instruction">{instruction}</p>
        </div>

        <div className="wizard-body">
          {step === 1 && <Step1Name name={name} onChange={setName} onSubmit={next} />}
          {step === 2 && <Step2Class draft={draft} onChange={setDraft} />}
          {step === 3 && (
            <Step3Gear draft={draft} onChange={setDraft} name={trimmedName || initialName} />
          )}
        </div>

        <div className="wizard-footer">
          <button type="button" className="cr-btn" onClick={back} disabled={!canGoBack}>
            {backLabel}
          </button>
          <div className="wizard-progress" aria-hidden="true">
            {Array.from({ length: STEP_COUNT }).map((_, i) => (
              <span
                key={i}
                className={
                  "wizard-dot" + (i + 1 === step ? " is-active" : i + 1 < step ? " is-done" : "")
                }
              />
            ))}
          </div>
          <button type="button" className="cr-btn primary" onClick={next} disabled={!canAdvance}>
            {step === STEP_COUNT ? finishLabel : t("Next")}
          </button>
        </div>
      </div>
    </div>
  )
}

function Step1Name({
  name,
  onChange,
  onSubmit,
}: {
  name: string
  onChange: (v: string) => void
  onSubmit: () => void
}) {
  const { t } = useI18n()
  return (
    <div className="row wizard-name-row">
      <label htmlFor="wizard-name">{t("Profile name")}</label>
      <input
        id="wizard-name"
        type="text"
        autoFocus
        value={name}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit()
        }}
        placeholder={t("e.g. my character name")}
      />
    </div>
  )
}

function Step2Class({ draft, onChange }: { draft: Inputs; onChange: (next: Inputs) => void }) {
  const { t } = useI18n()
  return (
    <>
      <div className="panel">
        <h2>{t("Class")}</h2>
        <ClassSelect
          value={draft.classId}
          onChange={(v) => onChange(syncClassPermanent(draft, v))}
        />
      </div>
      <div className="panel">
        <h2>{t("mindMethod")}</h2>
        <MindMethodsPanel inputs={draft} onChange={onChange} />
      </div>
    </>
  )
}

function Step3Gear({
  draft,
  onChange,
  name,
}: {
  draft: Inputs
  onChange: (next: Inputs) => void
  name: string
}) {
  const tempProfile = {
    id: TEMP_PROFILE_ID,
    name: name || "—",
    inputs: draft,
  }
  const engineInputs = useMemo(() => {
    const derived = withDerivedStats(draft)
    return applyBowSet(applyArmorSet(derived))
  }, [draft])
  return (
    <GearTab
      inputs={draft}
      engineInputs={engineInputs}
      onChange={onChange}
      profiles={[tempProfile]}
      activeProfileId={TEMP_PROFILE_ID}
      currentDps={0}
      dpsDeltas={{}}
      dpsDeltasPending={false}
      hideComparisons
    />
  )
}
