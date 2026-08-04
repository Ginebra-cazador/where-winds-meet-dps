import { useEffect, useMemo, useState } from "react"
import { HashRouter, NavLink, Navigate, Route, Routes } from "react-router-dom"
import { runEngine } from "./engine/dps"
import { applyArmorSet, applyBowSet } from "./engine/panel"
import { withDerivedStats } from "./engine/derivedInputs"
import type { Inputs, StoredProfile } from "./engine/types"
import { OverviewTab } from "./ui/features/overview/OverviewTab"
import { MetricsCard, WarningsList } from "./ui/layout/OutputPanel"
import { GithubLink } from "./ui/layout/GithubLink"
import { RotationTab } from "./ui/features/rotation/RotationTab"
import { ProfilePanel } from "./ui/features/profile/ProfilePanel"
import { GearTab } from "./ui/features/gear/GearTab"
import { TalentsOdditiesTab } from "./ui/features/talents/TalentsOdditiesTab"
import { SkillsTab } from "./ui/features/skills/SkillsTab"
import { useDpsDeltas } from "./ui/hooks/useDpsDeltas"
import { SetupWizard, type SetupMode } from "./ui/features/setup/SetupWizard"
import { I18nProvider, useI18n } from "./i18n/I18nContext"
import { ConfirmProvider, useConfirm } from "./ui/components/ConfirmDialog"
import {
  loadProfiles,
  saveProfiles,
  newProfileId,
  loadCustomSkills,
  loadCustomBuffs,
  loadCustomDebuffs,
  migrateSeededSkillIds,
  migrateDotStandinOverrides,
  type ProfilesState,
} from "./storage"
import type { Skill } from "./engine/skill"
import type { Buff } from "./engine/buff"
import type { Debuff } from "./engine/debuff"
import { blankInputs } from "./engine/defaults"

migrateSeededSkillIds()
migrateDotStandinOverrides()

function AppInner() {
  const initial = useState(() => loadProfiles())[0]
  const [committed, setCommitted] = useState<ProfilesState>({
    profiles: initial.profiles,
    activeId: initial.activeId,
  })
  const initialActive = committed.profiles.find((p) => p.id === committed.activeId)!
  const [activeDraft, setActiveDraft] = useState<Inputs>(initialActive.inputs)
  const inputs = activeDraft
  const setInputs = setActiveDraft
  const [lastSavedJson, setLastSavedJson] = useState(() => JSON.stringify(initialActive.inputs))
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const [wizard, setWizard] = useState<{ mode: SetupMode; defaultName: string } | null>(() =>
    initial.firstRun ? { mode: "first-run", defaultName: "" } : null,
  )

  const draftJson = useMemo(() => JSON.stringify(activeDraft), [activeDraft])
  const isDirty = draftJson !== lastSavedJson

  const [customSkills, setCustomSkills] = useState<Skill[]>(() => loadCustomSkills())
  const [customBuffs] = useState<Buff[]>(() => loadCustomBuffs())
  const [customDebuffs] = useState<Debuff[]>(() => loadCustomDebuffs())

  const engineInputs = useMemo(() => {
    const derived = withDerivedStats(inputs)
    const withArmor = applyArmorSet(derived)
    const withBow = applyBowSet(withArmor)
    const classSkills = customSkills.filter((s) => s.classId === inputs.classId)
    const classBuffs = customBuffs.filter((b) => b.classId === inputs.classId)
    const classDebuffs = customDebuffs.filter((d) => d.classId === inputs.classId)
    const withSkills = classSkills.length ? { ...withBow, customSkills: classSkills } : withBow
    const withBuffs = classBuffs.length ? { ...withSkills, customBuffs: classBuffs } : withSkills
    const withDebuffs = classDebuffs.length
      ? { ...withBuffs, customDebuffs: classDebuffs }
      : withBuffs
    return withDebuffs
  }, [inputs, customSkills, customBuffs, customDebuffs])

  const result = useMemo(() => runEngine(engineInputs), [engineInputs])

  const foreignCandidates = useMemo(() => {
    return committed.profiles
      .filter((p) => p.id !== committed.activeId)
      .flatMap((p) => p.inputs.inventory)
  }, [committed.profiles, committed.activeId])

  const { deltas: dpsDeltas, isPending: dpsDeltasPending } = useDpsDeltas(
    engineInputs,
    result.dps,
    foreignCandidates,
  )

  const { t } = useI18n()
  const confirm = useConfirm()

  function persist(next: ProfilesState) {
    setCommitted(next)
    saveProfiles(next)
  }

  function handleSave() {
    const next: ProfilesState = {
      ...committed,
      profiles: committed.profiles.map((p) =>
        p.id === committed.activeId ? { ...p, inputs: activeDraft } : p,
      ),
    }
    persist(next)
    setLastSavedJson(draftJson)
    setSavedAt(Date.now())
  }
  async function handleReset() {
    if (!isDirty) return
    if (!(await confirm(t("Discard unsaved changes?")))) return
    const active = committed.profiles.find((p) => p.id === committed.activeId)
    if (!active) return
    const restored = JSON.parse(JSON.stringify(active.inputs)) as Inputs
    setActiveDraft(restored)
    setLastSavedJson(JSON.stringify(restored))
    setSavedAt(null)
  }

  async function selectProfile(id: string) {
    if (id === committed.activeId) return
    if (isDirty && !(await confirm(t("You have unsaved changes — switch profiles anyway?")))) return
    const target = committed.profiles.find((p) => p.id === id)
    if (!target) return
    const next: ProfilesState = { ...committed, activeId: id }
    persist(next)
    setActiveDraft(target.inputs)
    setLastSavedJson(JSON.stringify(target.inputs))
    setSavedAt(null)
  }

  async function createProfile() {
    if (isDirty && !(await confirm(t("You have unsaved changes — switch profiles anyway?")))) return
    setWizard({
      mode: "new-profile",
      defaultName: `${t("New profile")} ${committed.profiles.length + 1}`,
    })
  }

  function handleWizardFinish(name: string, finishedInputs: Inputs) {
    const profile: StoredProfile = {
      id: newProfileId(),
      name,
      inputs: finishedInputs,
    }
    const next: ProfilesState =
      wizard?.mode === "first-run"
        ? { profiles: [profile], activeId: profile.id }
        : { profiles: [...committed.profiles, profile], activeId: profile.id }
    persist(next)
    setActiveDraft(profile.inputs)
    setLastSavedJson(JSON.stringify(profile.inputs))
    setSavedAt(null)
    setWizard(null)
  }

  function renameProfile(id: string, name: string) {
    const next: ProfilesState = {
      ...committed,
      profiles: committed.profiles.map((p) => (p.id === id ? { ...p, name } : p)),
    }
    persist(next)
  }

  function duplicateProfile(id: string) {
    const src = committed.profiles.find((p) => p.id === id)
    if (!src) return
    const copy: StoredProfile = {
      id: newProfileId(),
      name: `${src.name} ${t("Copy")}`,
      inputs: src.inputs,
    }
    const next: ProfilesState = {
      ...committed,
      profiles: [...committed.profiles, copy],
    }
    persist(next)
  }

  async function handleImportProfile(imported: StoredProfile) {
    if (isDirty && !(await confirm(t("You have unsaved changes — switch profiles anyway?")))) return
    const next: ProfilesState = {
      profiles: [...committed.profiles, imported],
      activeId: imported.id,
    }
    persist(next)
    setActiveDraft(imported.inputs)
    setLastSavedJson(JSON.stringify(imported.inputs))
    setSavedAt(null)
  }

  async function deleteProfile(id: string) {
    if (committed.profiles.length <= 1) return
    if (!(await confirm(t("Delete this profile?")))) return
    const remaining = committed.profiles.filter((p) => p.id !== id)
    let nextActive = committed.activeId
    if (id === committed.activeId) {
      nextActive = remaining[0].id
      setActiveDraft(remaining[0].inputs)
      setLastSavedJson(JSON.stringify(remaining[0].inputs))
      setSavedAt(null)
    }
    const next: ProfilesState = { profiles: remaining, activeId: nextActive }
    persist(next)
  }

  useEffect(() => {
    if (!savedAt) return
    const id = setTimeout(() => setSavedAt(null), 2500)
    return () => clearTimeout(id)
  }, [savedAt])

  const TABS: { path: string; label: string; align?: "right" }[] = [
    { path: "/overview", label: t("Overview") },
    { path: "/gear", label: t("Gear") },
    { path: "/rotation", label: t("Rotation") },
    { path: "/skills", label: t("Skill Editor") },
    { path: "/talents", label: t("Talents & Oddities") },
    { path: "/profile", label: t("Profiles"), align: "right" },
  ]

  return (
    <div className="app">
      {wizard && (
        <SetupWizard
          mode={wizard.mode}
          initialName={wizard.defaultName}
          initialInputs={blankInputs}
          onFinish={handleWizardFinish}
          onCancel={wizard.mode === "new-profile" ? () => setWizard(null) : undefined}
        />
      )}
      <div className="app-header">
        <header className="app-titlebar">
          <h1>{t("Where Winds Meet DPS")}</h1>
          <div className="app-titlebar-actions">
            <GithubLink />
            <button
              type="button"
              className={"save-btn" + (isDirty ? " dirty" : "")}
              onClick={handleSave}
              disabled={!isDirty}
              aria-label={t("Save")}
            >
              {savedAt && !isDirty ? t("Saved ✓") : isDirty ? t("Save") : t("Saved")}
            </button>
            <button
              type="button"
              className="reset-btn"
              onClick={handleReset}
              disabled={!isDirty}
              aria-label={t("Discard changes")}
              title={t("Discard edits since the last save")}
            >
              {t("Discard changes")}
            </button>
          </div>
        </header>

        <MetricsCard result={result} />

        <nav className="tabs" role="tablist">
          {TABS.map((tb) => (
            <NavLink
              key={tb.path}
              to={tb.path}
              role="tab"
              className={({ isActive }) =>
                "tab" + (isActive ? " active" : "") + (tb.align === "right" ? " tab-right" : "")
              }
            >
              {tb.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="tab-panel">
        <WarningsList result={result} />
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route
            path="/overview"
            element={
              <OverviewTab
                inputs={inputs}
                engineInputs={engineInputs}
                onChange={setInputs}
                result={result}
              />
            }
          />
          <Route
            path="/gear"
            element={
              <GearTab
                inputs={inputs}
                engineInputs={engineInputs}
                onChange={setInputs}
                profiles={committed.profiles}
                activeProfileId={committed.activeId}
                currentDps={result.dps}
                dpsDeltas={dpsDeltas}
                dpsDeltasPending={dpsDeltasPending}
              />
            }
          />
          <Route
            path="/rotation"
            element={<RotationTab inputs={inputs} onChange={setInputs} result={result} />}
          />
          <Route
            path="/skills"
            element={
              <SkillsTab
                inputs={inputs}
                engineInputs={engineInputs}
                customSkills={customSkills}
                onCustomSkillsChange={setCustomSkills}
                customBuffs={customBuffs}
                customDebuffs={customDebuffs}
              />
            }
          />
          <Route path="/buffs" element={<Navigate to="/skills" replace />} />
          <Route path="/debuffs" element={<Navigate to="/skills" replace />} />
          <Route
            path="/talents"
            element={<TalentsOdditiesTab inputs={inputs} onChange={setInputs} />}
          />
          <Route path="/oddities" element={<Navigate to="/talents" replace />} />
          <Route
            path="/profile"
            element={
              <div className="panel">
                <ProfilePanel
                  profiles={committed.profiles}
                  activeId={committed.activeId}
                  onCreate={createProfile}
                  onSelect={selectProfile}
                  onRename={renameProfile}
                  onDuplicate={duplicateProfile}
                  onDelete={deleteProfile}
                  onImport={handleImportProfile}
                />
              </div>
            }
          />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export function App() {
  return (
    <HashRouter>
      <I18nProvider>
        <ConfirmProvider>
          <AppInner />
        </ConfirmProvider>
      </I18nProvider>
    </HashRouter>
  )
}
