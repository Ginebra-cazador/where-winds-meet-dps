import { useEffect, useMemo, useRef, useState } from "react"
import type { Inputs } from "../../../engine/types"
import type { Skill, SkillHit, HitTrigger, HitVariant, TriggerKind } from "../../../engine/skill"
import { makeSkill, makeHit, seedSkillFromBuiltin, triggerConditions } from "../../../engine/skill"
import type { Buff, BuffStatEffect } from "../../../engine/buff"
import type { Debuff } from "../../../engine/debuff"
import { computeSkillPreview, type ArtPatch } from "../../../engine/perSkillDamage"
import {
  builtinSkillsForClass,
  builtinDebuffsForClass,
  builtinBuffsForClass,
} from "../../../engine/builtinLibrary"
import { getSchool } from "../../../engine/panel"
import {
  appliesForSkill,
  receivesForSkill,
  type AppliesRow,
  type ReceivesRow,
} from "../../../engine/buffs/catalog"
import { STAT_DEF_BY_KEY } from "../../../engine/statRegistry"
import {
  saveCustomSkill,
  deleteCustomSkill,
  exportCustomSkill,
  importCustomSkill,
} from "../../../storage"
import { useI18n } from "../../../i18n/I18nContext"
import { useConfirm } from "../../components/ConfirmDialog"
import { NumInput, PercentInput } from "../../components/NumberInputs"
import { Combobox, type ComboboxOption } from "../../components/Combobox"
import { FPS } from "../../../engine/timeline"
import { formatConditions, statusTooltip } from "./statusText"

const WEAPONS = [
  "Sword",
  "Spear",
  "Fan",
  "Umbrella",
  "Modao",
  "Twin Blades",
  "Rope Dart",
  "Hengdao",
]
const SKILL_TYPES = ["weapon", "mindMethod", "mystic", "sustain", "Heavenwork"]
const MYSTIC_CATEGORIES = ["control", "burst", "area-debuff", "area-damage", "area"]
const ATTRIBUTES = ["", "Bellstrike", "Stonesplit", "Silkbind", "Bamboocut"]
const ATTUNEMENTS = [
  "bleed",
  "fanCharged",
  "fanQ",
  "fanSpecial",
  "moBladeCharge",
  "phalanxbaneCharged",
  "phalanxbaneQ",
  "ropeDartCharged",
  "ropeDartQ",
  "ropeDartSpecial",
  "snowpartingCharged",
  "snowpartingQ",
  "snowpartingVariedCombo",
  "spearCharged",
  "spearMartial",
  "spearQ",
  "spearSpecial",
  "swordCharged",
  "swordQ",
  "swordSpecial",
  "umbCharged",
  "umbQ",
  "umbrellaQ",
]

interface Props {
  inputs: Inputs
  engineInputs: Inputs
  customSkills: Skill[]
  onCustomSkillsChange(next: Skill[]): void
  customBuffs: Buff[]
  customDebuffs: Debuff[]
}

function fmtDmg(n: number): string {
  if (!Number.isFinite(n)) return "—"
  return n >= 1000 ? Math.round(n).toLocaleString() : n.toFixed(2)
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

type TriggerDraft = HitTrigger & { hitScope: "all" | number }

function triggerSignature(tr: HitTrigger): string {
  return JSON.stringify({
    kind: tr.kind,
    targetId: tr.targetId,
    stacks: tr.stacks,
    condition: tr.condition,
    conditions: tr.conditions ?? [],
    extendFrames: tr.extendFrames,
    extendOnly: tr.extendOnly,
  })
}

function deriveTriggerDrafts(skill: Skill): TriggerDraft[] {
  if (skill.hits.length <= 1) {
    return (skill.hits[0]?.triggers ?? []).map((tr) => ({ ...tr, hitScope: "all" as const }))
  }
  const groups = new Map<string, { trig: HitTrigger; hitIdx: number }[]>()
  skill.hits.forEach((hit, hitIdx) => {
    for (const trig of hit.triggers) {
      const sig = triggerSignature(trig)
      const list = groups.get(sig)
      if (list) list.push({ trig, hitIdx })
      else groups.set(sig, [{ trig, hitIdx }])
    }
  })
  const drafts: TriggerDraft[] = []
  for (const occurrences of groups.values()) {
    if (occurrences.length === skill.hits.length) {
      drafts.push({ ...occurrences[0].trig, hitScope: "all" })
    } else {
      for (const occ of occurrences) drafts.push({ ...occ.trig, hitScope: occ.hitIdx })
    }
  }
  return drafts
}

function kindClass(kind: TriggerKind): string {
  if (kind === "applyBuff") return "is-buff"
  if (kind === "applyDebuff" || kind === "applyDot") return "is-debuff"
  return "is-cast"
}

function dotDisplayName(d: Debuff): string {
  return d.name.replace(/\s*Tick$/, "")
}

const INNER_WAY_DISPLAY_NAMES: Record<string, string> = {
  swordHorizon: "Sword Horizon",
}

function typeBadge(s: Skill, t: (x: string) => string): string {
  if (s.attributeAttack) return t(s.attributeAttack)
  if (s.skillType) return t(s.skillType)
  return `${s.hits.length} ${t("hits")}`
}

export function SkillsTab({
  inputs,
  engineInputs,
  customSkills,
  onCustomSkillsChange,
  customBuffs,
  customDebuffs,
}: Props) {
  const { t } = useI18n()
  const confirm = useConfirm()
  const classId = inputs.classId
  const fileRef = useRef<HTMLInputElement>(null)

  const classSkills = useMemo(
    () => customSkills.filter((s) => s.classId === classId),
    [customSkills, classId],
  )
  const classBuffs = useMemo(
    () => customBuffs.filter((b) => b.classId === classId),
    [customBuffs, classId],
  )
  const classDebuffs = useMemo(
    () => customDebuffs.filter((d) => d.classId === classId),
    [customDebuffs, classId],
  )

  function effectiveTriggerKind(trig: HitTrigger): TriggerKind {
    const isBuffId = (id: string) =>
      classBuffs.some((b) => b.id === id) || builtinBuffs.some((b) => b.id === id)
    const isDebuffId = (id: string) =>
      classDebuffs.some((d) => d.id === id) || builtinDebuffs.some((d) => d.id === id)
    if (trig.kind === "applyBuff" && !isBuffId(trig.targetId) && isDebuffId(trig.targetId)) {
      return "applyDebuff"
    }
    if (trig.kind === "applyDebuff" && !isDebuffId(trig.targetId) && isBuffId(trig.targetId)) {
      return "applyBuff"
    }
    return trig.kind
  }

  const builtinSkills = useMemo(() => builtinSkillsForClass(classId), [classId])
  const builtinDebuffs = useMemo(() => builtinDebuffsForClass(classId), [classId])
  const builtinBuffs = useMemo(() => builtinBuffsForClass(classId), [classId])

  const [search, setSearch] = useState("")
  const q = search.trim().toLowerCase()
  const filteredClassSkills = useMemo(
    () =>
      classSkills
        .filter((s) => (s.name || "").toLowerCase().includes(q))
        .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [classSkills, q],
  )
  const filteredBuiltins = useMemo(
    () =>
      builtinSkills
        .filter((s) => t(s.name).toLowerCase().includes(q))
        .sort((a, b) => t(a.name).localeCompare(t(b.name))),
    [builtinSkills, q, t],
  )

  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [draft, setDraft] = useState<Skill | null>(null)
  const [activeHitIndex, setActiveHitIndex] = useState(0)
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null)
  const [effectsOpen, setEffectsOpen] = useState(true)
  const [showInactiveReceives, setShowInactiveReceives] = useState(false)

  function loadDraft(skill: Skill) {
    const cloned: Skill = {
      ...skill,
      hits: skill.hits.map((h) => ({
        ...h,
        triggers: h.triggers.map((tr) => ({
          ...tr,
          conditions: tr.conditions ? tr.conditions.map((c) => ({ ...c })) : undefined,
        })),
        variants: h.variants?.map((v) => ({
          ...v,
          conditions: v.conditions.map((c) => ({ ...c })),
        })),
      })),
    }
    setDraft(cloned)
    setActiveHitIndex(0)
    setActiveVariantId(null)
  }

  function selectSkill(s: Skill) {
    setSelectedKey(`user:${s.id}`)
    loadDraft(s)
  }

  function createNew() {
    const d = makeSkill(classId, { name: "" })
    setSelectedKey(`user:${d.id}`)
    loadDraft(d)
  }

  function seedFromBuiltin(skill: Skill) {
    const existing = classSkills.find((s) => s.id === skill.id)
    if (existing) {
      selectSkill(existing)
      return
    }
    const d = seedSkillFromBuiltin(classId, skill)
    setSelectedKey(`builtin:${skill.id}`)
    loadDraft(d)
  }

  function patchDraft(patch: Partial<Skill>) {
    setDraft((d) => (d ? { ...d, ...patch } : d))
  }

  function patchHit(idx: number, patch: Partial<SkillHit>) {
    setDraft((d) => {
      if (!d) return d
      const hits = d.hits.map((h, i) => (i === idx ? { ...h, ...patch } : h))
      return { ...d, hits }
    })
  }
  function patchHitVariant(hitIdx: number, variantId: string, patch: Partial<HitVariant>) {
    setDraft((d) => {
      if (!d) return d
      const hits = d.hits.map((h, i) =>
        i === hitIdx
          ? {
              ...h,
              variants: (h.variants ?? []).map((v) =>
                v.id === variantId ? { ...v, ...patch } : v,
              ),
            }
          : h,
      )
      return { ...d, hits }
    })
  }
  function addHit() {
    setDraft((d) => {
      if (!d) return d
      const hits = [
        ...d.hits,
        makeHit({ frame: d.hits.length > 0 ? d.hits[d.hits.length - 1].frame + 15 : 0 }),
      ]
      setActiveHitIndex(hits.length - 1)
      return { ...d, hits }
    })
  }
  function removeHit(idx: number) {
    setDraft((d) => {
      if (!d) return d
      const hits = d.hits.filter((_, i) => i !== idx)
      return { ...d, hits: hits.length > 0 ? hits : [makeHit()] }
    })
    setActiveHitIndex((i) => Math.max(0, i > idx ? i - 1 : i === idx ? 0 : i))
  }

  async function handleSave() {
    if (!draft) return
    const name = draft.name.trim()
    if (!name) {
      await confirm(t("Please enter a skill name first"))
      return
    }
    const normalized: Skill = { ...draft, name }
    const list = saveCustomSkill(normalized)
    onCustomSkillsChange(list)
    const saved = list.find((s) => s.id === draft.id)
    if (saved) {
      setSelectedKey(`user:${saved.id}`)
      loadDraft(saved)
    }
  }

  async function handleDelete() {
    if (!draft) return
    if (!classSkills.some((s) => s.id === draft.id)) {
      setDraft(null)
      setSelectedKey(null)
      return
    }
    if (!(await confirm(t("Delete this skill?")))) return
    const list = deleteCustomSkill(draft.id)
    onCustomSkillsChange(list)
    setDraft(null)
    setSelectedKey(null)
  }

  function handleReset() {
    if (!draft) return
    const s = classSkills.find((x) => x.id === draft.id)
    if (s) selectSkill(s)
  }

  function handleExport() {
    if (!draft) return
    const blob = new Blob([exportCustomSkill(draft)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `skill-${draft.name || "custom"}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text()
      const fresh = importCustomSkill(text, classId)
      const list = saveCustomSkill(fresh)
      onCustomSkillsChange(list)
      setSelectedKey(`user:${fresh.id}`)
      loadDraft(fresh)
    } catch (e) {
      await confirm(`${t("Import failed")}: ${(e as Error).message}`)
    }
  }

  const preview = useMemo(() => {
    if (!draft || !draft.name.trim()) return null

    const hit = draft.hits[activeHitIndex]
    if (!hit) return null
    const variant = activeVariantId
      ? hit.variants?.find((v) => v.id === activeVariantId)
      : undefined
    const livePatch: ArtPatch = {
      name: draft.name.trim(),
      physMultiplier: variant ? variant.physMultiplier : hit.physMultiplier,
      physFixed: variant ? variant.physFixed : hit.physFixed,
      attributeMultiplier: variant ? variant.attributeMultiplier : hit.attributeMultiplier,
      attributeFixed: variant ? variant.attributeFixed : hit.attributeFixed,
      extraCritDamage: hit.extraCritDamage,
    }
    if (draft.skillType) livePatch.skillType = draft.skillType
    if (draft.weaponOrAttribute) livePatch.weaponOrAttribute = draft.weaponOrAttribute
    if (draft.attributeAttack) livePatch.attributeAttack = draft.attributeAttack
    const mysticFlag =
      (draft.tags ?? []).find((x) => x.startsWith("mystic:"))?.slice("mystic:".length) ?? ""
    if (mysticFlag) livePatch.mysticCategory = mysticFlag
    return computeSkillPreview(draft.name.trim(), engineInputs, livePatch)
  }, [draft, activeHitIndex, activeVariantId, engineInputs])

  useEffect(() => {
    if (draft && activeHitIndex >= draft.hits.length) setActiveHitIndex(0)
  }, [draft, activeHitIndex])

  useEffect(() => {
    if (!draft || !activeVariantId) return
    const hit = draft.hits[activeHitIndex]
    if (!hit?.variants?.some((v) => v.id === activeVariantId)) setActiveVariantId(null)
  }, [draft, activeHitIndex, activeVariantId])

  const opts = (vals: string[], labelFn?: (v: string) => string): ComboboxOption[] =>
    vals.map((v) => ({ value: v, label: v === "" ? t("None") : labelFn ? labelFn(v) : t(v) }))

  const adoptedBuiltinNames = useMemo(() => new Set(classSkills.map((s) => s.name)), [classSkills])

  function resolveStatus(targetId: string): Buff | Debuff | undefined {
    return (
      classBuffs.find((b) => b.id === targetId) ??
      classDebuffs.find((d) => d.id === targetId) ??
      builtinBuffs.find((b) => b.id === targetId) ??
      builtinDebuffs.find((d) => d.id === targetId)
    )
  }
  function resolveSkillTarget(targetId: string): Skill | undefined {
    return (
      classSkills.find((s) => s.id === targetId) ?? builtinSkills.find((s) => s.id === targetId)
    )
  }

  function conditionsClause(d: TriggerDraft): string {
    const conds = triggerConditions(d)
    if (conds.length === 0) return ""
    return `${t("when")} ${formatConditions(conds, (id) => resolveStatus(id)?.name)}`
  }

  function summarizeTriggerDraft(d: TriggerDraft): { label: string; effect: string } {
    const kind = effectiveTriggerKind(d)
    const gate = conditionsClause(d)
    if (kind === "applyDot") {
      const status = resolveStatus(d.targetId)
      if (!status || !("dot" in status) || !status.dot)
        return { label: t("Select a target…"), effect: "" }
      const name = dotDisplayName(status)
      const durationSec = (status.durationFrames / FPS).toFixed(1)
      let effect = `+1 ${t("stack")} (${t("max")} ${status.maxStacks}) · ${t("refreshes")} ${durationSec}s ${t("duration")}`
      const ladder = status.dot.perStackMultipliers
      if (ladder && ladder.length > 0) {
        effect += ` · ${t("per-tick damage")} ×${ladder.join(" / ×")} ${t("at")} ${ladder.map((_, i) => i + 1).join("/")} ${t("stacks")}`
      }
      if (gate) effect += ` · ${gate}`
      return { label: `${t("Applies")} ${name}`, effect }
    }
    if (kind === "detonateDot") {
      const status = resolveStatus(d.targetId)
      if (!status || !("dot" in status) || !status.detonation)
        return { label: t("Select a target…"), effect: "" }
      const det = status.detonation
      const name = dotDisplayName(status)
      const detonateSkill = resolveSkillTarget(det.skillId)
      const label = `${t("Causes")} ${detonateSkill?.name ?? name}`
      let effect = `${t("on reaching")} ${status.maxStacks} ${t("stacks: consumes them and auto-casts")} ${detonateSkill?.name ?? det.skillId}`
      if (det.retainParam) {
        const paramName = INNER_WAY_DISPLAY_NAMES[det.retainParam] ?? det.retainParam
        const retained = det.retainParamStacks ?? det.retainStacks ?? 0
        effect += ` · ${t("retains")} ${retained} ${t("at")} ${paramName} ${t("tier")} ${det.retainMinTier ?? 6}`
      }
      if (gate) effect += ` · ${gate}`
      return { label, effect }
    }
    if (kind === "applyDebuff" || kind === "applyBuff") {
      const status = resolveStatus(d.targetId)
      if (!status) return { label: t("Select a target…"), effect: "" }
      const parts: string[] = []
      if ("dot" in status && status.dot) {
        parts.push(
          `${t("DoT")} · ${t("every")} ${(status.dot.tickIntervalFrames / FPS).toFixed(1)}s`,
        )
      }
      const eff = effectsSummary(status.effects, t)
      if (eff) parts.push(eff)
      parts.push(
        d.hitScope === "all" && (draft?.hits.length ?? 1) > 1
          ? `+${d.stacks} ${t("stacks/hit")}`
          : `+${d.stacks} ${t("stacks")}`,
      )
      if (gate) parts.push(gate)
      return { label: status.name || t("Unnamed"), effect: parts.join(" · ") }
    }
    const target = resolveSkillTarget(d.targetId)
    const label = target ? `${t("Casts")} ${target.name || t("Unnamed")}` : t("Select a target…")
    return { label, effect: gate }
  }

  const triggerRows = useMemo<TriggerDraft[]>(
    () => (draft ? deriveTriggerDrafts(draft) : []),
    [draft],
  )

  const appliesRows = useMemo<AppliesRow[]>(
    () => (draft ? appliesForSkill(draft, classId) : []),
    [draft, classId],
  )

  const receivesRows = useMemo<ReceivesRow[]>(
    () => (draft ? receivesForSkill(draft, classId, inputs) : []),
    [draft, classId, inputs],
  )
  const specMechanicRows = useMemo(
    () => receivesRows.filter((r) => r.isSpecMechanic),
    [receivesRows],
  )
  const buffReceiveRows = useMemo(
    () => receivesRows.filter((r) => !r.isSpecMechanic),
    [receivesRows],
  )
  const activeReceiveRows = useMemo(
    () => buffReceiveRows.filter((r) => r.active),
    [buffReceiveRows],
  )
  const inactiveReceiveRows = useMemo(
    () => buffReceiveRows.filter((r) => !r.active),
    [buffReceiveRows],
  )

  const flagsSummary = useMemo(() => {
    if (!draft) return ""
    const tags = draft.tags ?? []
    const parts: string[] = []
    const weaponTags = tags.filter((tag) => tag.startsWith("weapon:"))
    if (weaponTags.length > 0) {
      for (const tag of weaponTags) parts.push(`${tag.slice(7)} (${t("Weapon Type")})`)
    } else if (draft.weaponOrAttribute) {
      parts.push(`${draft.weaponOrAttribute} (${t("Weapon Type")})`)
    }
    for (const tag of tags) {
      if (tag.startsWith("weapon:")) continue
      if (tag.startsWith("attune:")) parts.push(`${t("Attunement")}: ${tag.slice(7)}`)
      else if (tag.startsWith("prop:") || tag.startsWith("mystic:") || tag.startsWith("attack:"))
        parts.push(tag)
    }
    return parts.join(" · ")
  }, [draft, t])

  const currentWeaponFlag =
    (draft?.tags ?? []).find((x) => x.startsWith("weapon:"))?.slice("weapon:".length) ?? ""
  const currentAttuneFlag =
    (draft?.tags ?? []).find((x) => x.startsWith("attune:"))?.slice("attune:".length) ?? ""
  const currentMysticFlag =
    (draft?.tags ?? []).find((x) => x.startsWith("mystic:"))?.slice("mystic:".length) ?? ""
  const otherTags = (draft?.tags ?? []).filter(
    (x) => !x.startsWith("weapon:") && !x.startsWith("attune:") && !x.startsWith("mystic:"),
  )

  function setWeaponFlag(weapon: string) {
    setDraft((d) => {
      if (!d) return d
      const rest = (d.tags ?? []).filter((x) => !x.startsWith("weapon:"))
      return { ...d, tags: weapon ? [...rest, `weapon:${weapon}`] : rest }
    })
  }
  function setAttuneFlag(attune: string) {
    setDraft((d) => {
      if (!d) return d
      const rest = (d.tags ?? []).filter((x) => !x.startsWith("attune:"))
      return { ...d, tags: attune ? [...rest, `attune:${attune}`] : rest }
    })
  }
  function setMysticFlag(category: string) {
    setDraft((d) => {
      if (!d) return d
      const rest = (d.tags ?? []).filter((x) => !x.startsWith("mystic:"))
      return { ...d, tags: category ? [...rest, `mystic:${category}`] : rest }
    })
  }

  const weaponFlagOptions = opts(
    currentWeaponFlag && !WEAPONS.includes(currentWeaponFlag)
      ? ["", ...WEAPONS, currentWeaponFlag]
      : ["", ...WEAPONS],
  )
  const attuneFlagOptions = opts(
    currentAttuneFlag && !ATTUNEMENTS.includes(currentAttuneFlag)
      ? ["", ...ATTUNEMENTS, currentAttuneFlag]
      : ["", ...ATTUNEMENTS],
  )
  const mysticFlagOptions = opts(
    currentMysticFlag && !MYSTIC_CATEGORIES.includes(currentMysticFlag)
      ? ["", ...MYSTIC_CATEGORIES, currentMysticFlag]
      : ["", ...MYSTIC_CATEGORIES],
  )

  return (
    <div className="panel skills-tab">
      <div className="skills-layout">
        <div className="skills-list-panel">
          <div className="skills-list-head">
            <h3>
              {t("Skill")} ({t(getSchool(classId).cn ?? classId)})
            </h3>
            <button type="button" className="save-btn" onClick={createNew}>
              {t("New Skill")}
            </button>
          </div>
          <input
            type="text"
            className="skills-search"
            placeholder={t("Search skills…")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ul className="skills-list">
            {filteredClassSkills.length > 0 && (
              <li className="skills-list-group">{t("My Skills")}</li>
            )}
            {filteredClassSkills.map((s) => (
              <li
                key={`user:${s.id}`}
                className={"skills-list-item" + (selectedKey === `user:${s.id}` ? " active" : "")}
                onClick={() => selectSkill(s)}
              >
                <span className="skills-list-name">{s.name || t("Unnamed")}</span>
                <span className="skills-tag is-new">{typeBadge(s, t)}</span>
              </li>
            ))}
            {filteredBuiltins.length > 0 && <li className="skills-list-group">{t("Built-in")}</li>}
            {filteredBuiltins.map((skill) => (
              <li
                key={`builtin:${skill.id}`}
                className={
                  "skills-list-item" + (selectedKey === `builtin:${skill.id}` ? " active" : "")
                }
                onClick={() => seedFromBuiltin(skill)}
              >
                <span className="skills-list-name">{t(skill.name)}</span>
                {adoptedBuiltinNames.has(skill.name) ? (
                  <span className="skills-tag is-edit">{t("Adopted")}</span>
                ) : (
                  <span className="skills-tag">{typeBadge(skill, t)}</span>
                )}
              </li>
            ))}
            {filteredClassSkills.length === 0 && filteredBuiltins.length === 0 && (
              <li className="skills-empty">
                {q ? t("No skills match your search") : t("No skills yet — click New Skill")}
              </li>
            )}
          </ul>
        </div>

        <div className="skills-detail-panel">
          {!draft ? (
            <div className="skills-empty">{t("Select a skill on the left, or create one")}</div>
          ) : (
            <>
              <div className="skills-preview">
                <div className="skills-preview-head">
                  {t("Damage Preview (per hit)")} — {t("Slot ")} {activeHitIndex + 1} {t("hits")}
                </div>
                <div className="skills-preview-grid">
                  <PreviewCard
                    label={t("Abrasion")}
                    cls="is-zero"
                    value={preview ? fmtDmg(preview.abrasion) : "—"}
                  />
                  <PreviewCard
                    label={t("Normal")}
                    cls=""
                    value={
                      preview
                        ? `${fmtDmg(preview.normal.min)} – ${fmtDmg(preview.normal.max)}`
                        : "—"
                    }
                  />
                  <PreviewCard
                    label={t("Crit")}
                    cls="is-positive"
                    value={
                      preview ? `${fmtDmg(preview.crit.min)} – ${fmtDmg(preview.crit.max)}` : "—"
                    }
                  />
                  <PreviewCard
                    label={t("Affinity")}
                    cls="is-affinity"
                    value={preview ? fmtDmg(preview.affinity) : "—"}
                  />
                </div>
              </div>

              <Section title={t("Skill")}>
                <Field label={t("Skill Name")}>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => patchDraft({ name: e.target.value })}
                  />
                </Field>
                <Field label={t("Type")}>
                  <Combobox
                    value={draft.skillType}
                    options={opts(SKILL_TYPES)}
                    onChange={(v) => patchDraft({ skillType: v })}
                  />
                </Field>
                {draft.skillType === "sustain" && (
                  <div className="skills-hint">
                    {t(
                      "Type 'sustain' only tags sustain-damage scaling; it does not generate ticks. For a DoT, use a debuff with a DoT.",
                    )}
                  </div>
                )}
                <Field label={t("weapon")}>
                  <Combobox
                    value={draft.weaponOrAttribute}
                    options={opts(["", ...WEAPONS])}
                    onChange={(v) => patchDraft({ weaponOrAttribute: v })}
                  />
                </Field>
                <Field label={t("Stat")}>
                  <Combobox
                    value={draft.attributeAttack}
                    options={opts(ATTRIBUTES)}
                    onChange={(v) => patchDraft({ attributeAttack: v })}
                  />
                </Field>
                <Field
                  label={t("Cast Time")}
                  unit={`${t("frames")} (${(draft.castFrames / FPS).toFixed(2)}s)`}
                >
                  <NumInput
                    value={draft.castFrames}
                    onChange={(v) => patchDraft({ castFrames: v })}
                  />
                </Field>
                <label className="skills-check">
                  <input
                    type="checkbox"
                    checked={draft.triggerable}
                    onChange={(e) => patchDraft({ triggerable: e.target.checked })}
                  />
                  <span>{t("Triggerable")}</span>
                </label>
                <div className="skills-hint">
                  {t("Can be the target of a cast-skill trigger (e.g. an auto-proc)")}
                </div>
                <label className="skills-check">
                  <input
                    type="checkbox"
                    checked={draft.prePull ?? false}
                    onChange={(e) => patchDraft({ prePull: e.target.checked })}
                  />
                  <span>{t("Pre-pull Skill")}</span>
                </label>
                <div className="skills-hint">
                  {t(
                    'A pre-pull skill is cast before the pull — it lands at negative frames and is excluded from the rotation duration. Leave unchecked to auto-detect from a name containing "Prepull".',
                  )}
                </div>
              </Section>

              <Section title={t("Hit Table")}>
                {draft.hits.map((hit, idx) => (
                  <div
                    key={hit.id}
                    className={"skills-hit" + (idx === activeHitIndex ? " active" : "")}
                    onClick={() => {
                      setActiveHitIndex(idx)
                      setActiveVariantId(null)
                    }}
                  >
                    <div className="skills-hit-head">
                      <span className="skills-hit-index">#{idx + 1}</span>
                      <label className="skills-hit-frame" title={t("Frame Offset")}>
                        <NumInput value={hit.frame} onChange={(v) => patchHit(idx, { frame: v })} />
                        <span className="skills-field-unit">
                          {t("frames")} ({(hit.frame / FPS).toFixed(2)}s)
                        </span>
                      </label>
                      {draft.hits.length > 1 && (
                        <button
                          type="button"
                          className="reset-btn skills-hit-del"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeHit(idx)
                          }}
                        >
                          {t("Delete")}
                        </button>
                      )}
                    </div>
                    <div className="skills-hit-fields">
                      <Field label={t("Phys Coeff")} unit="%">
                        <PercentInput
                          value={hit.physMultiplier}
                          onChange={(v) => patchHit(idx, { physMultiplier: v })}
                        />
                      </Field>
                      <Field label={t("Flat Phys")}>
                        <NumInput
                          value={hit.physFixed}
                          onChange={(v) => patchHit(idx, { physFixed: v })}
                        />
                      </Field>
                      <Field label={t("Attr Coeff")} unit="%">
                        <PercentInput
                          value={hit.attributeMultiplier}
                          onChange={(v) => patchHit(idx, { attributeMultiplier: v })}
                        />
                      </Field>
                      <Field label={t("Flat Attr")}>
                        <NumInput
                          value={hit.attributeFixed}
                          onChange={(v) => patchHit(idx, { attributeFixed: v })}
                        />
                      </Field>
                      <Field label={t("Crit Boost")} unit="%">
                        <PercentInput
                          value={hit.extraCritDamage}
                          onChange={(v) => patchHit(idx, { extraCritDamage: v })}
                        />
                      </Field>
                    </div>
                    {(hit.variants ?? []).map((variant) => {
                      const gateStatus = variant.conditions[0]
                        ? resolveStatus(variant.conditions[0].buffId)
                        : undefined
                      const isActive = idx === activeHitIndex && activeVariantId === variant.id
                      return (
                        <div
                          key={variant.id}
                          className={"skills-hit-variant" + (isActive ? " active" : "")}
                          title={
                            `${gateStatus ? statusTooltip(gateStatus.name, gateStatus.durationFrames) : variant.label}` +
                            ` — ${t("replaces the base row above while active")}`
                          }
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveHitIndex(idx)
                            setActiveVariantId(variant.id)
                          }}
                        >
                          <div className="skills-hit-variant-head">
                            <span className="skills-hit-variant-name">
                              {t("Variant")}: {variant.label}
                            </span>
                            <span className="skills-hit-variant-cond">
                              {t("when")}{" "}
                              {formatConditions(
                                variant.conditions,
                                (id) => resolveStatus(id)?.name,
                              )}
                            </span>
                          </div>
                          <div className="skills-hit-fields">
                            <Field label={t("Phys Coeff")} unit="%">
                              <PercentInput
                                value={variant.physMultiplier}
                                onChange={(v) =>
                                  patchHitVariant(idx, variant.id, { physMultiplier: v })
                                }
                              />
                            </Field>
                            <Field label={t("Flat Phys")}>
                              <NumInput
                                value={variant.physFixed}
                                onChange={(v) => patchHitVariant(idx, variant.id, { physFixed: v })}
                              />
                            </Field>
                            <Field label={t("Attr Coeff")} unit="%">
                              <PercentInput
                                value={variant.attributeMultiplier}
                                onChange={(v) =>
                                  patchHitVariant(idx, variant.id, { attributeMultiplier: v })
                                }
                              />
                            </Field>
                            <Field label={t("Flat Attr")}>
                              <NumInput
                                value={variant.attributeFixed}
                                onChange={(v) =>
                                  patchHitVariant(idx, variant.id, { attributeFixed: v })
                                }
                              />
                            </Field>
                          </div>
                          <div className="skills-hint">
                            {t("The base row above applies while no variant's condition holds")}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
                <button type="button" className="skills-add-hit" onClick={addHit}>
                  + {t("Add Hit")}
                </button>
              </Section>

              <div className="skills-section skills-effects-section">
                <button
                  type="button"
                  className="skills-effects-toggle"
                  onClick={() => setEffectsOpen((o) => !o)}
                >
                  <span className="skills-section-title">{t("Effects")}</span>
                  <span className="skills-effects-caret">{effectsOpen ? "▾" : "▸"}</span>
                </button>
                <div className="skills-hint">
                  {t("Which buffs/debuffs/mechanics apply to this skill")}
                </div>
                {effectsOpen && (
                  <>
                    <div className="skills-fields skills-effects-tags">
                      <Field label={t("Weapon Type")}>
                        <Combobox
                          value={currentWeaponFlag}
                          options={weaponFlagOptions}
                          onChange={setWeaponFlag}
                        />
                      </Field>
                      <Field label={t("Attunement")}>
                        <Combobox
                          value={currentAttuneFlag}
                          options={attuneFlagOptions}
                          onChange={setAttuneFlag}
                        />
                      </Field>
                      <Field label={t("Mystic Category")}>
                        <Combobox
                          value={currentMysticFlag}
                          options={mysticFlagOptions}
                          onChange={setMysticFlag}
                        />
                      </Field>
                      <div className="skills-hint">
                        {t("Optional flags used by site buff matching. All fields are optional.")}
                      </div>
                      {otherTags.length > 0 && (
                        <Field label={t("Other Tags")}>
                          <div className="skills-chips">
                            {otherTags.map((tag) => (
                              <span className="skills-chip is-readonly" key={tag}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </Field>
                      )}
                      <div className="skills-hint skills-effects-flags">
                        <strong>{t("Skill Flags")}:</strong>
                        {flagsSummary || "—"}
                      </div>
                    </div>

                    <div className="skills-effects">
                      <div className="skills-effects-col">
                        <div className="skills-effects-col-head">
                          {t("Triggers (this skill applies)")}
                        </div>
                        {triggerRows.length === 0 ? (
                          <div className="skills-effects-empty">—</div>
                        ) : (
                          triggerRows.map((d) => {
                            const effKind = effectiveTriggerKind(d)
                            const summary = summarizeTriggerDraft(d)
                            const scopeNote =
                              typeof d.hitScope === "number" && draft.hits.length > 1
                                ? ` · ${t("hit")} #${d.hitScope + 1}`
                                : ""
                            const targetStatus =
                              effKind === "castSkill" ? undefined : resolveStatus(d.targetId)
                            const tooltip =
                              effKind === "castSkill"
                                ? resolveSkillTarget(d.targetId)
                                  ? statusTooltip(resolveSkillTarget(d.targetId)!.name)
                                  : undefined
                                : targetStatus
                                  ? statusTooltip(targetStatus.name, targetStatus.durationFrames)
                                  : undefined
                            return (
                              <div
                                className={"skills-effects-row " + kindClass(effKind)}
                                key={d.id}
                                title={tooltip}
                              >
                                <span className="skills-effects-row-name">{summary.label}</span>
                                {(summary.effect || scopeNote) && (
                                  <span className="skills-effects-row-detail">
                                    {summary.effect}
                                    {scopeNote}
                                  </span>
                                )}
                              </div>
                            )
                          })
                        )}
                        {appliesRows.length > 0 && (
                          <>
                            <div className="skills-effects-subhead">
                              {t("Site buffs this skill applies")}
                            </div>
                            {appliesRows.map((r) => (
                              <div className="skills-effects-row is-site" key={`site:${r.id}`}>
                                <span className="skills-effects-row-name">{r.name}</span>
                                {r.effect && (
                                  <span className="skills-effects-row-detail">{r.effect}</span>
                                )}
                                {r.requires && (
                                  <span className="skills-effects-row-requires">
                                    ({t("requires")} {r.requires})
                                  </span>
                                )}
                              </div>
                            ))}
                          </>
                        )}
                      </div>

                      <div className="skills-effects-col">
                        <div className="skills-effects-col-head">
                          {t("Receives (buffs affecting this skill)")}
                        </div>
                        {activeReceiveRows.length === 0 && inactiveReceiveRows.length === 0 ? (
                          <div className="skills-effects-empty">—</div>
                        ) : (
                          <>
                            {activeReceiveRows.map((r) => (
                              <div className="skills-effects-row is-site" key={r.id}>
                                <span className="skills-effects-row-name">{r.name}</span>
                                {r.effect && (
                                  <span className="skills-effects-row-detail">{r.effect}</span>
                                )}
                                {r.triggeredBy && (
                                  <span className="skills-effects-row-triggered">
                                    ({r.triggeredBy})
                                  </span>
                                )}
                              </div>
                            ))}
                            {inactiveReceiveRows.length > 0 && (
                              <>
                                <button
                                  type="button"
                                  className="skills-effects-more"
                                  onClick={() => setShowInactiveReceives((v) => !v)}
                                >
                                  {t("Not in your current build")} ({inactiveReceiveRows.length})
                                </button>
                                {showInactiveReceives &&
                                  inactiveReceiveRows.map((r) => (
                                    <div className="skills-effects-row is-site is-off" key={r.id}>
                                      <span className="skills-effects-row-name">{r.name}</span>
                                      {r.effect && (
                                        <span className="skills-effects-row-detail">
                                          {r.effect}
                                        </span>
                                      )}
                                      {r.requires && (
                                        <span className="skills-effects-row-requires">
                                          ({t("requires")} {r.requires})
                                        </span>
                                      )}
                                      {r.triggeredBy && (
                                        <span className="skills-effects-row-triggered">
                                          ({r.triggeredBy})
                                        </span>
                                      )}
                                    </div>
                                  ))}
                              </>
                            )}
                          </>
                        )}
                      </div>

                      <div className="skills-effects-col">
                        <div className="skills-effects-col-head">{t("Spec Mechanics")}</div>
                        {specMechanicRows.length === 0 ? (
                          <div className="skills-effects-empty">—</div>
                        ) : (
                          specMechanicRows.map((r) => (
                            <div className="skills-effects-row is-spec" key={r.id}>
                              <span className="skills-effects-row-name">{r.name}</span>
                              {r.effect && (
                                <span className="skills-effects-row-detail">{r.effect}</span>
                              )}
                              {!r.active && r.requires && (
                                <span className="skills-effects-row-requires">
                                  ({t("requires")} {r.requires})
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="skills-actions">
                <button type="button" className="save-btn" onClick={handleSave}>
                  {t("Save")}
                </button>
                <button type="button" className="reset-btn" onClick={handleReset}>
                  {t("Reset")}
                </button>
                <button type="button" className="reset-btn" onClick={handleDelete}>
                  {t("Delete")}
                </button>
                <button type="button" className="reset-btn" onClick={handleExport}>
                  {t("Export")}
                </button>
                <button
                  type="button"
                  className="reset-btn"
                  onClick={() => fileRef.current?.click()}
                >
                  {t("Import")}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void handleImportFile(f)
                    e.target.value = ""
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PreviewCard({ label, value, cls }: { label: string; value: string; cls: string }) {
  return (
    <div className="skills-preview-card">
      <div className="skills-preview-label">{label}</div>
      <div className={"skills-preview-value " + cls}>{value}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="skills-section">
      <div className="skills-section-title">{title}</div>
      <div className="skills-fields">{children}</div>
    </div>
  )
}

function Field({
  label,
  unit,
  children,
}: {
  label: string
  unit?: string
  children: React.ReactNode
}) {
  return (
    <label className="skills-field">
      <span className="skills-field-label">{label}</span>
      <span className="skills-field-input">
        {children}
        {unit && <span className="skills-field-unit">{unit}</span>}
      </span>
    </label>
  )
}
