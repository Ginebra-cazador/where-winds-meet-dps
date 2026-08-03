import type { TriggerCondition } from "../../../engine/skill"
import { FPS } from "../../../engine/timeline"

const OP_SYMBOL: Record<TriggerCondition["op"], string> = { gte: "≥", gt: ">", eq: "=" }

export function formatConditions(
  conditions: readonly TriggerCondition[],
  nameOf: (id: string) => string | undefined,
): string {
  return conditions
    .map((c) => `${nameOf(c.buffId) ?? c.buffId} ${OP_SYMBOL[c.op]} ${c.stacks}`)
    .join(" · ")
}

export function statusTooltip(name: string, durationFrames?: number): string {
  if (durationFrames == null) return name
  const durationSec = (durationFrames / FPS).toFixed(1)
  return `${name} · ${durationSec}s window · remaining time counts down from application`
}
