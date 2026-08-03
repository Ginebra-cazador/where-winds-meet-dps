import type { Inputs } from "../../../engine/types"
import { defaultCombatSettings } from "../../../engine/types"
import { NumInput } from "../../components/NumberInputs"
import { useI18n } from "../../../i18n/I18nContext"

interface Props {
  inputs: Inputs
  onChange: (next: Inputs) => void
}

function ToggleChip({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={"toggle-chip" + (on ? " is-on" : "")}
      aria-pressed={on}
      onClick={onToggle}
    >
      {label}
    </button>
  )
}

export function EncounterSettingsPanel({ inputs, onChange }: Props) {
  const { t } = useI18n()
  const set = <K extends keyof Inputs>(k: K, v: Inputs[K]) => onChange({ ...inputs, [k]: v })

  const settings = inputs.combatSettings ?? defaultCombatSettings()
  const setCombat = <K extends keyof typeof settings>(k: K, v: (typeof settings)[K]) =>
    onChange({ ...inputs, combatSettings: { ...settings, [k]: v } })

  return (
    <div className="encounter-settings">
      <div className="toggle-chip-group">
        <div className="set-section-label">{t("Consumables & Self")}</div>
        <div className="toggle-chips">
          <ToggleChip
            label={t("Simmering Fish Slices (Food)")}
            on={inputs.food}
            onToggle={() => set("food", !inputs.food)}
          />
          <ToggleChip
            label={t("Revelry Script")}
            on={settings.revelryScript}
            onToggle={() => setCombat("revelryScript", !settings.revelryScript)}
          />
        </div>
      </div>

      <div className="toggle-chip-group">
        <div className="set-section-label">{t("Divinecraft")}</div>
        <div className="toggle-chips">
          <ToggleChip
            label={t("None")}
            on={inputs.tianGongElement == null}
            onToggle={() => set("tianGongElement", null)}
          />
          <ToggleChip
            label={t("Fire Oil")}
            on={inputs.tianGongElement === "fire"}
            onToggle={() => set("tianGongElement", "fire")}
          />
          <ToggleChip
            label={t("Poison")}
            on={inputs.tianGongElement === "poison"}
            onToggle={() => set("tianGongElement", "poison")}
          />
        </div>
      </div>

      <div className="toggle-chip-group">
        <div className="set-section-label">{t("Shared Debuffs")}</div>
        <div className="toggle-chips">
          <ToggleChip
            label={t("Bitter Season")}
            on={inputs.shareDebuff5HenZhi}
            onToggle={() => set("shareDebuff5HenZhi", !inputs.shareDebuff5HenZhi)}
          />
          <ToggleChip
            label={t("Tank Spear Debuff (Vulnerability)")}
            on={inputs.shareEasyHurt}
            onToggle={() => set("shareEasyHurt", !inputs.shareEasyHurt)}
          />
        </div>
      </div>

      <div className="toggle-chip-group">
        <div className="set-section-label">{t("Teammate Buffs")}</div>
        <div className="toggle-chips">
          <ToggleChip
            label={t("Dragon's Breath")}
            on={settings.dragonsBreath}
            onToggle={() => setCombat("dragonsBreath", !settings.dragonsBreath)}
          />
          <ToggleChip
            label={t("Healer Buff")}
            on={settings.healerBuff}
            onToggle={() => setCombat("healerBuff", !settings.healerBuff)}
          />
          <ToggleChip
            label={t("Break Extension")}
            on={settings.breakExtension}
            onToggle={() => setCombat("breakExtension", !settings.breakExtension)}
          />
        </div>
      </div>

      <div className="toggle-chip-group">
        <div className="set-section-label">{t("Qi Break")}</div>
        <div className="toggle-chips">
          <ToggleChip
            label={t("Qi Break Window")}
            on={settings.qiBreak.enabled}
            onToggle={() =>
              setCombat("qiBreak", { ...settings.qiBreak, enabled: !settings.qiBreak.enabled })
            }
          />
          {settings.qiBreak.enabled && (
            <span className="toggle-chip-inline">
              <label>{t("Start (s)")}</label>
              <NumInput
                value={settings.qiBreak.startSec}
                onChange={(v) => setCombat("qiBreak", { ...settings.qiBreak, startSec: v })}
              />
              <label>{t("Duration (s)")}</label>
              <NumInput
                value={settings.qiBreak.durationSec}
                onChange={(v) => setCombat("qiBreak", { ...settings.qiBreak, durationSec: v })}
              />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
