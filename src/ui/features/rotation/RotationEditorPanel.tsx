import { useEffect, useMemo, useRef, useState } from "react"
import type { Inputs, Result, CastBuffTag, RotationCast } from "../../../engine/types"
import type { Buff, BuffStatEffect } from "../../../engine/buff"
import type { Debuff } from "../../../engine/debuff"
import {
  makeRotation,
  newRotationId,
  newStepId,
  resolveRotation,
  type Rotation,
  type RotationStep,
} from "../../../engine/rotation"
import { activeRotationForInputs } from "../../../engine/dps"
import { Combobox, type ComboboxOption } from "../../components/Combobox"
import { FPS } from "../../../engine/timeline"
import { isPrePullSkill, type Skill } from "../../../engine/skill"
import {
  builtinSkillsForClass,
  builtinRotationsForClass,
  defaultRotationForClass,
} from "../../../engine/builtinLibrary"
import { specMechanicDefIds } from "../../../engine/buffs/catalog"
import { STAT_DEF_BY_KEY } from "../../../engine/statRegistry"
import { buffChipHue, castBuffDisplayOrder, visibleCastBuffs } from "./buffChips"
import {
  loadCustomRotations,
  saveCustomRotation,
  deleteCustomRotation,
  exportCustomRotation,
  importCustomRotation,
  loadCustomSkillsForClass,
  loadCustomBuffsForClass,
  loadCustomDebuffsForClass,
} from "../../../storage"
import { useI18n } from "../../../i18n/I18nContext"
import { useConfirm } from "../../components/ConfirmDialog"

interface Props {
  inputs: Inputs
  onChange: (next: Inputs) => void
  result: Result
}

function stepCastFrames(step: RotationStep, skill: Skill | undefined): number {
  if (!skill) return 0
  const hitCount = Math.max(0, Math.min(step.hitCount, skill.hits.length))
  const performed = skill.hits.slice(0, hitCount)
  const maxFrame = performed.length > 0 ? Math.max(...performed.map((h) => h.frame)) : -1
  return skill.castFrames || maxFrame + 1
}

function effectsSummary(effects: BuffStatEffect[], t: (s: string) => string): string {
  return effects
    .filter((e) => e.amount !== 0)
    .map((e) => {
      const def = STAT_DEF_BY_KEY[e.statKey]
      const label = def ? t(def.label) : e.statKey
      const sign = e.amount >= 0 ? "+" : ""
      const value =
        def?.unit === "fraction" ? `${sign}${(e.amount * 100).toFixed(0)}%` : `${sign}${e.amount}`
      return `${label} ${value}`
    })
    .join(", ")
}

function CastBuffTagChip({ tag }: { tag: CastBuffTag }) {
  const { t } = useI18n()
  const label = tag.maxStacks > 1 ? `${t(tag.name)} ${tag.stacks}/${tag.maxStacks}` : t(tag.name)
  const eff = effectsSummary(tag.effects, t)
  const style = { "--buff-hue": buffChipHue(tag.name, tag.id) } as React.CSSProperties
  return (
    <span className="cast-buff-tag" style={style}>
      {label}
      <span className="cast-buff-tooltip">
        <div>{t(tag.name)}</div>
        {tag.maxStacks > 1 && (
          <div>
            {t("Stacks")}: {tag.stacks} / {tag.maxStacks}
          </div>
        )}
        {tag.remainingSec != null && (
          <div>
            {t("Remaining")}: {tag.remainingSec.toFixed(1)}s
          </div>
        )}
        {tag.dotIntervalSec != null && (
          <div>
            {t("DoT")} · {t("every")} {tag.dotIntervalSec.toFixed(1)}s
          </div>
        )}
        {eff && <div>{eff}</div>}
        {tag.requires && (
          <div>
            {t("requires")} {tag.requires}
          </div>
        )}
        {tag.description && <div>{tag.description}</div>}
      </span>
    </span>
  )
}

export function RotationEditorPanel({ inputs, onChange, result }: Props) {
  const { t } = useI18n()
  const confirm = useConfirm()

  const [saved, setSaved] = useState<Rotation[]>(() => loadCustomRotations())
  const [expanded, setExpanded] = useState(true)
  const [nameDraft, setNameDraft] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const savedForClass = useMemo(
    () => saved.filter((r) => r.classId === inputs.classId),
    [saved, inputs.classId],
  )

  const classSkills = useMemo<Skill[]>(() => {
    const byId = new Map<string, Skill>()
    for (const s of builtinSkillsForClass(inputs.classId)) byId.set(s.id, s)
    for (const s of loadCustomSkillsForClass(inputs.classId)) byId.set(s.id, s)
    return [...byId.values()]
  }, [inputs.classId])
  const classBuffs = useMemo<Buff[]>(
    () => loadCustomBuffsForClass(inputs.classId),
    [inputs.classId],
  )
  const classDebuffs = useMemo<Debuff[]>(
    () => loadCustomDebuffsForClass(inputs.classId),
    [inputs.classId],
  )
  const skillsById = useMemo(
    () => new Map(classSkills.map((s) => [s.id, s] as const)),
    [classSkills],
  )
  const skillOpts: ComboboxOption[] = useMemo(
    () => classSkills.map((s) => ({ value: s.id, label: s.name || t("Unnamed") })),
    [classSkills, t],
  )

  const builtinRotations = useMemo(() => builtinRotationsForClass(inputs.classId), [inputs.classId])
  const defaultRotationId = useMemo(
    () => defaultRotationForClass(inputs.classId)?.id ?? "",
    [inputs.classId],
  )

  const activeRotation = useMemo(() => activeRotationForInputs(inputs), [inputs])
  const isCustom =
    !!inputs.activeCustomRotation && inputs.activeCustomRotation.classId === inputs.classId
  const isPersisted = isCustom && !!activeRotation && saved.some((r) => r.id === activeRotation.id)
  const selectedRotationValue = isCustom
    ? (activeRotation?.id ?? "")
    : (inputs.selectedBuiltinRotationId ?? "")
  const selectedBuiltin = !isCustom
    ? builtinRotations.find((r) => r.id === inputs.selectedBuiltinRotationId)
    : undefined

  useEffect(() => {
    setNameDraft(activeRotation?.name ?? "")
  }, [activeRotation?.id])

  useEffect(() => {
    if (!isCustom || !activeRotation) return
    let changed = false
    const steps = activeRotation.steps.map((s) => {
      const sk = skillsById.get(s.skillId)
      if (sk && s.hitCount !== sk.hits.length) {
        changed = true
        return { ...s, hitCount: sk.hits.length }
      }
      return s
    })
    if (changed) onChange({ ...inputs, activeCustomRotation: { ...activeRotation, steps } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRotation?.id, skillsById])

  const computedDurationSec = useMemo(() => {
    if (!activeRotation) return 0
    const frames = activeRotation.steps
      .filter((s) => {
        const skill = skillsById.get(s.skillId)
        return !skill || !isPrePullSkill(skill)
      })
      .reduce((sum, s) => sum + stepCastFrames(s, skillsById.get(s.skillId)), 0)
    return frames / FPS
  }, [activeRotation, skillsById])

  const diagnostics = useMemo(() => {
    if (!isCustom || !activeRotation) return []
    return resolveRotation(activeRotation, classSkills, [...classBuffs, ...classDebuffs]).warnings
  }, [isCustom, activeRotation, classSkills, classBuffs, classDebuffs])

  const castsByStepId = useMemo(() => {
    const map = new Map<string, RotationCast>()
    for (const c of result.casts ?? []) map.set(c.stepId, c)
    return map
  }, [result.casts])
  const castsByStepIndex = useMemo(() => {
    const map = new Map<number, RotationCast>()
    for (const c of result.casts ?? []) map.set(c.stepIndex, c)
    return map
  }, [result.casts])

  const hiddenBuffIds = useMemo(() => specMechanicDefIds(inputs.classId), [inputs.classId])
  const buffOrder = useMemo(
    () => castBuffDisplayOrder(result.casts, hiddenBuffIds),
    [result.casts, hiddenBuffIds],
  )

  function selectRotation(id: string) {
    if (!id) {
      onChange({ ...inputs, activeCustomRotation: null, selectedBuiltinRotationId: null })
      return
    }
    const builtin = builtinRotations.find((r) => r.id === id)
    if (builtin) {
      onChange({ ...inputs, activeCustomRotation: null, selectedBuiltinRotationId: id })
      return
    }
    const custom = saved.find((x) => x.id === id)
    if (custom) {
      const steps = custom.steps.map((s) => {
        const sk = skillsById.get(s.skillId)
        return sk ? { ...s, hitCount: sk.hits.length } : s
      })
      onChange({
        ...inputs,
        activeCustomRotation: { ...custom, steps },
        selectedBuiltinRotationId: null,
      })
    }
  }

  function commitRotation(updater: (r: Rotation) => Rotation) {
    if (!isCustom || !activeRotation) return
    onChange({ ...inputs, activeCustomRotation: updater(activeRotation) })
  }

  function updateStep(idx: number, patch: Partial<RotationStep>) {
    commitRotation((r) => ({
      ...r,
      steps: r.steps.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }))
  }
  function removeStep(idx: number) {
    commitRotation((r) => ({ ...r, steps: r.steps.filter((_, i) => i !== idx) }))
  }
  function addStep() {
    const first = classSkills[0]
    commitRotation((r) => ({
      ...r,
      steps: [
        ...r.steps,
        {
          id: newStepId(),
          skillId: first?.id ?? "",
          hitCount: first?.hits.length ?? 1,
          prePull: false,
        },
      ],
    }))
  }
  function addStepAfter(idx: number) {
    commitRotation((r) => {
      const src = r.steps[idx]
      const skill = src ? skillsById.get(src.skillId) : undefined
      const arr = r.steps.slice()
      arr.splice(idx + 1, 0, {
        id: newStepId(),
        skillId: src?.skillId ?? "",
        hitCount: skill?.hits.length ?? src?.hitCount ?? 1,
        prePull: false,
      })
      return { ...r, steps: arr }
    })
  }
  function moveStep(idx: number, delta: -1 | 1) {
    commitRotation((r) => {
      const next = idx + delta
      if (next < 0 || next >= r.steps.length) return r
      const arr = r.steps.slice()
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      return { ...r, steps: arr }
    })
  }
  function setPermanentBuffIds(ids: string[]) {
    commitRotation((r) => ({ ...r, permanentBuffIds: ids }))
  }
  function setPrePullHitsCount(v: boolean) {
    commitRotation((r) => ({ ...r, prePullHitsCount: v }))
  }

  function handleNew() {
    const empty = makeRotation(inputs.classId)
    onChange({ ...inputs, activeCustomRotation: empty, selectedBuiltinRotationId: null })
    setExpanded(true)
  }

  function forkToCustom() {
    if (!activeRotation) return
    const copy = makeRotation(inputs.classId, {
      name: activeRotation.name,
      steps: activeRotation.steps.map((s) => {
        const sk = skillsById.get(s.skillId)
        return { ...s, id: newStepId(), hitCount: sk ? sk.hits.length : s.hitCount }
      }),
      permanentBuffIds: [...activeRotation.permanentBuffIds],
      prePullHitsCount: activeRotation.prePullHitsCount,
    })
    onChange({ ...inputs, activeCustomRotation: copy, selectedBuiltinRotationId: null })
    setExpanded(true)
  }

  function handleSave() {
    if (!activeRotation || !isCustom) return
    if (!nameDraft.trim()) {
      alert(t("Please enter a name"))
      return
    }
    const persisted = saveCustomRotation({ ...activeRotation, name: nameDraft })
    setSaved(loadCustomRotations())
    onChange({ ...inputs, activeCustomRotation: persisted })
  }

  function handleSaveAs() {
    if (!activeRotation || !isCustom) return
    if (!nameDraft.trim()) {
      alert(t("Please enter a name"))
      return
    }
    const id = newRotationId()
    const persisted = saveCustomRotation({ ...activeRotation, id, name: nameDraft })
    setSaved(loadCustomRotations())
    onChange({ ...inputs, activeCustomRotation: persisted, selectedBuiltinRotationId: null })
  }

  async function handleDelete() {
    if (!activeRotation || !isCustom || !isPersisted) return
    if (!(await confirm(t("Delete this custom rotation?")))) return
    deleteCustomRotation(activeRotation.id)
    setSaved(loadCustomRotations())
    onChange({ ...inputs, activeCustomRotation: null })
  }

  function handleExport() {
    if (!activeRotation) return
    const text = exportCustomRotation(
      isCustom ? { ...activeRotation, name: nameDraft } : activeRotation,
    )
    const blob = new Blob([text], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const safeName = ((isCustom ? nameDraft : activeRotation.name) || "rotation").replace(
      /[^\w\-.]+/g,
      "_",
    )
    const a = document.createElement("a")
    a.href = url
    a.download = `${safeName}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      const text = await file.text()
      const imported = importCustomRotation(text)
      const persisted = saveCustomRotation(imported)
      setSaved(loadCustomRotations())
      onChange({ ...inputs, activeCustomRotation: persisted, selectedBuiltinRotationId: null })
      setExpanded(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(`${t("Import failed")}: ${msg}`)
    }
  }

  const steps = activeRotation?.steps ?? []

  return (
    <div className="custom-rotation-panel">
      <div className="cr-toolbar">
        <span className="cr-toolbar-label">{t("Rotation Editor")}</span>
        <select
          className={"cr-active-select" + (isCustom ? " is-active" : "")}
          value={selectedRotationValue}
          onChange={(e) => selectRotation(e.target.value)}
        >
          <option value="">{t("Default class axis")}</option>
          <optgroup label={t("Built-in rotations")}>
            {builtinRotations.map((r) => (
              <option key={r.id} value={r.id}>
                {(r.name || t("(unnamed)")) + (r.id === defaultRotationId ? t(" (default)") : "")}
              </option>
            ))}
          </optgroup>
          <optgroup label={t("Custom Rotation")}>
            {savedForClass.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name || t("(unnamed)")}
              </option>
            ))}
          </optgroup>
        </select>
        {selectedBuiltin?.description && (
          <span className="cr-builtin-hint">{selectedBuiltin.description}</span>
        )}
        <div className="cr-spacer" />
        <button type="button" className="cr-btn" onClick={handleNew}>
          + {t("New")}
        </button>
        <button type="button" className="cr-btn" onClick={() => setExpanded((x) => !x)}>
          {expanded ? t("Close editor") : t("Open editor")}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: "none" }}
          onChange={handleImportFile}
        />
      </div>

      {expanded && activeRotation && (
        <div className="cr-editor">
          <div className="cr-meta">
            <label className="field">
              <span>{t("Name")}</span>
              <input
                type="text"
                value={isCustom ? nameDraft : activeRotation.name}
                placeholder={t("(unnamed)")}
                disabled={!isCustom}
                onChange={(e) => setNameDraft(e.target.value)}
              />
            </label>
            <label className="field">
              <span>{t("Duration (computed)")}</span>
              <span className="cr-duration-display">{computedDurationSec.toFixed(2)} s</span>
            </label>
            <label className="field cr-timeline-toggle">
              <span>{t("Pre-pull hits count toward damage")}</span>
              <input
                type="checkbox"
                checked={activeRotation.prePullHitsCount}
                disabled={!isCustom}
                onChange={(e) => setPrePullHitsCount(e.target.checked)}
              />
            </label>
            <div className="actions">
              {isCustom ? (
                <>
                  <button type="button" className="cr-btn primary" onClick={handleSave}>
                    {t("Save")}
                  </button>
                  <button type="button" className="cr-btn" onClick={handleSaveAs}>
                    {t("Save as")}
                  </button>
                  <button type="button" className="cr-btn" onClick={handleExport}>
                    {t("Export")}
                  </button>
                  <button type="button" className="cr-btn" onClick={handleImportClick}>
                    {t("Import")}
                  </button>
                  <button
                    type="button"
                    className="cr-btn danger"
                    onClick={handleDelete}
                    disabled={!isPersisted}
                  >
                    {t("Delete")}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="cr-btn primary" onClick={forkToCustom}>
                    {t("Fork to Custom")}
                  </button>
                  <button type="button" className="cr-btn" onClick={handleExport}>
                    {t("Export")}
                  </button>
                  <button type="button" className="cr-btn" onClick={handleImportClick}>
                    {t("Import")}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="cr-divider" />

          <div className="cr-entries">
            {steps.map((step, idx) => {
              const skill = skillsById.get(step.skillId)
              const maxHits = Math.max(1, skill?.hits.length ?? 1)
              const cast = castsByStepId.get(step.id) ?? castsByStepIndex.get(idx)
              const shownBuffs = cast ? visibleCastBuffs(cast.buffs, hiddenBuffIds, buffOrder) : []
              return (
                <div key={step.id} className={"cr-entry" + (isCustom ? "" : " cr-entry-readonly")}>
                  <div className="idx">{idx + 1}</div>
                  <span className="cr-time">
                    {cast ? `${Math.max(0, cast.timeSec).toFixed(2)}s` : "—"}
                  </span>
                  {isCustom ? (
                    <Combobox
                      value={step.skillId}
                      options={skillOpts}
                      onChange={(v) => {
                        const next = skillsById.get(v)
                        updateStep(idx, { skillId: v, hitCount: next?.hits.length ?? 1 })
                      }}
                      placeholder={t("Select skill…")}
                    />
                  ) : (
                    <span className="cr-skill-static">{t(skill?.name ?? step.skillId)}</span>
                  )}
                  <span className="cr-cast-readonly">
                    {maxHits} {t("hits")}
                  </span>
                  <span className="cr-prepull" title={t("Pre-pull (excluded from duration)")}>
                    {skill && isPrePullSkill(skill) ? t("Pre-pull") : ""}
                  </span>
                  <div className="cr-buffs-cell">
                    {shownBuffs.length === 0 ? (
                      <span className="muted">—</span>
                    ) : (
                      shownBuffs.map((tag) => <CastBuffTagChip key={tag.id} tag={tag} />)
                    )}
                  </div>
                  {isCustom && (
                    <div className="row-actions">
                      <button
                        type="button"
                        className="cr-btn icon"
                        onClick={() => addStepAfter(idx)}
                        title={t("Add skill after this line")}
                        aria-label="add after"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="cr-btn icon"
                        onClick={() => moveStep(idx, -1)}
                        disabled={idx === 0}
                        aria-label="move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="cr-btn icon"
                        onClick={() => moveStep(idx, 1)}
                        disabled={idx === steps.length - 1}
                        aria-label="move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="cr-btn icon danger"
                        onClick={() => removeStep(idx)}
                        aria-label="remove"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            {steps.length === 0 && <div className="cr-entries-empty">{t("(none)")}</div>}
          </div>

          {isCustom && (
            <button
              type="button"
              className="cr-add"
              onClick={addStep}
              disabled={classSkills.length === 0}
            >
              + {t("Add skill")}
            </button>
          )}

          {isCustom ? (
            <div className="cr-permanent-buffs">
              <span className="cr-permanent-label">{t("Permanent Buffs/Debuffs")}</span>
              <BuffMultiSelect
                label={t("Permanent buffs")}
                buffs={classBuffs}
                selected={activeRotation.permanentBuffIds}
                onChange={setPermanentBuffIds}
              />
              <BuffMultiSelect
                label={t("Permanent Debuffs")}
                buffs={classDebuffs}
                selected={activeRotation.permanentBuffIds}
                onChange={setPermanentBuffIds}
              />
            </div>
          ) : (
            activeRotation.permanentBuffIds.length > 0 && (
              <div className="cr-permanent-buffs">
                <span className="cr-permanent-label">{t("Permanent Buffs/Debuffs")}</span>
                <span>
                  {activeRotation.permanentBuffIds
                    .map((id) =>
                      t([...classBuffs, ...classDebuffs].find((b) => b.id === id)?.name ?? id),
                    )
                    .join(", ")}
                </span>
              </div>
            )
          )}

          {diagnostics.length > 0 && (
            <div className="warnings">
              {diagnostics.map((w, i) => (
                <div key={i}>⚠ {w}</div>
              ))}
            </div>
          )}
          <div className="cr-hint">
            {t(
              "Each step picks a saved skill; hit-triggered buffs/skills land at the hit's frame offset. The Buffs column shows what's still active once that cast fully resolves, chips are ordered by when each buff first appears in the rotation, and always-on spec passives are listed in the Class Talents tab instead.",
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function BuffMultiSelect({
  label,
  buffs,
  selected,
  onChange,
}: {
  label: string
  buffs: readonly { id: string; name: string }[]
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const selectedSet = new Set(selected)
  const count = selected.length
  const toggle = (id: string) => {
    const next = new Set(selectedSet)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange([...next])
  }
  return (
    <div className="cr-buff-select">
      <button type="button" className="cr-btn" onClick={() => setOpen((x) => !x)}>
        {label}
        {count > 0 ? ` (${count})` : ""} ▾
      </button>
      {open && (
        <div className="cr-buff-dropdown">
          {buffs.length === 0 && <div className="cr-buff-empty">—</div>}
          {buffs.map((b) => (
            <label key={b.id} className="cr-buff-option">
              <input
                type="checkbox"
                checked={selectedSet.has(b.id)}
                onChange={() => toggle(b.id)}
              />
              <span>{b.name || "(unnamed)"}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
