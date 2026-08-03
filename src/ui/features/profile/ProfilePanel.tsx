import { useRef, useState } from "react"
import type { StoredProfile } from "../../../engine/types"
import { exportProfile, importProfile } from "../../../storage"
import { useI18n } from "../../../i18n/I18nContext"
import schools from "../../../data/classes/schools.json"

const SCHOOLS = schools as { id: string; cn: string; en: string }[]

interface Props {
  profiles: StoredProfile[]
  activeId: string
  onCreate: () => void
  onSelect: (id: string) => void
  onRename: (id: string, name: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onImport: (profile: StoredProfile) => void
}

export function ProfilePanel({
  profiles,
  activeId,
  onCreate,
  onSelect,
  onRename,
  onDuplicate,
  onDelete,
  onImport,
}: Props) {
  const { t } = useI18n()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function startRename(p: StoredProfile) {
    setEditingId(p.id)
    setDraftName(p.name)
  }
  function commitRename() {
    if (editingId !== null) {
      const trimmed = draftName.trim()
      if (trimmed) onRename(editingId, trimmed)
    }
    setEditingId(null)
    setDraftName("")
  }
  function cancelRename() {
    setEditingId(null)
    setDraftName("")
  }

  function classLabel(classId: string): string {
    const s = SCHOOLS.find((x) => x.id === classId)
    if (!s) return classId
    return t(s.cn)
  }

  function handleExport(p: StoredProfile) {
    const text = exportProfile(p)
    const blob = new Blob([text], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const safeName = (p.name || "profile").replace(/[^\w\-.]+/g, "_")
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
      const imported = importProfile(text)
      onImport(imported)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(`${t("Import failed")}: ${msg}`)
    }
  }

  return (
    <div className="profile-panel">
      <div className="cr-toolbar">
        <span className="cr-toolbar-label">{t("Profiles")}</span>
        <div className="cr-spacer" />
        <button type="button" className="cr-btn" onClick={handleImportClick}>
          {t("Import")}
        </button>
        <button type="button" className="cr-btn primary" onClick={onCreate}>
          + {t("New profile")}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: "none" }}
          onChange={handleImportFile}
        />
      </div>

      <div className="profile-list">
        {profiles.map((p) => {
          const isActive = p.id === activeId
          const isEditing = editingId === p.id
          return (
            <div key={p.id} className={"profile-row" + (isActive ? " is-active" : "")}>
              <div className="profile-name">
                {isEditing ? (
                  <input
                    type="text"
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename()
                      else if (e.key === "Escape") cancelRename()
                    }}
                  />
                ) : (
                  <span
                    className="profile-name-text"
                    onDoubleClick={() => startRename(p)}
                    title={t("Rename")}
                  >
                    {p.name || t("(unnamed)")}
                  </span>
                )}
                {isActive && <span className="profile-active-badge">{t("Active")}</span>}
              </div>

              <div className="profile-class">{classLabel(p.inputs.classId)}</div>

              <div className="profile-actions">
                <button
                  type="button"
                  className="cr-btn"
                  onClick={() => onSelect(p.id)}
                  disabled={isActive}
                >
                  {t("Select")}
                </button>
                <button
                  type="button"
                  className="cr-btn"
                  onClick={() => startRename(p)}
                  disabled={isEditing}
                >
                  {t("Rename")}
                </button>
                <button type="button" className="cr-btn" onClick={() => onDuplicate(p.id)}>
                  {t("Duplicate")}
                </button>
                <button type="button" className="cr-btn" onClick={() => handleExport(p)}>
                  {t("Export")}
                </button>
                <button
                  type="button"
                  className="cr-btn danger"
                  onClick={() => onDelete(p.id)}
                  disabled={profiles.length <= 1}
                  title={profiles.length <= 1 ? "" : t("Delete")}
                >
                  {t("Delete")}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="cr-hint">
        {t(
          "Each profile stores the entire input set. Custom rotations are shared globally but only those matching the active profile's class are shown.",
        )}
      </div>
    </div>
  )
}
