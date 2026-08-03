import type { Inputs } from "./types"
import { buildContext } from "./panel"
import { computeSkillDamage } from "./formula"
import { resolveMindMethodOverrides } from "./mindMethodOverrides"

type Art = Parameters<typeof computeSkillDamage>[0]

type ArtsOverrides = ReturnType<typeof resolveMindMethodOverrides>["artsOverrides"]

export type ArtPatch = Record<string, number | string>

function applyMmDeltas(art: Art, mmDelta: Record<string, number> | undefined): Art {
  if (!mmDelta) return art
  const merged = { ...art } as Art & Record<string, unknown>
  for (const [k, delta] of Object.entries(mmDelta)) {
    if (typeof delta !== "number") continue
    const cur = (art as unknown as Record<string, unknown>)[k]
    merged[k] = (typeof cur === "number" ? cur : 0) + delta
  }
  return merged
}

export function resolveArt(
  name: string,
  _inputs: Inputs,
  artsOverrides: ArtsOverrides,
  livePatch?: ArtPatch,
): Art | undefined {
  if (!livePatch) return undefined
  const art = { ...(livePatch as Partial<Art>), name } as Art
  return applyMmDeltas(art, artsOverrides[name] as Record<string, number> | undefined)
}

export interface SkillPreview {
  abrasion: number
  normal: { min: number; max: number }
  crit: { min: number; max: number }
  affinity: number
}

export function computeSkillPreview(
  skillName: string,
  inputs: Inputs,
  livePatch?: ArtPatch,
): SkillPreview | null {
  const ctx = buildContext(inputs)
  const { artsOverrides } = resolveMindMethodOverrides(inputs)
  const art = resolveArt(skillName, inputs, artsOverrides, livePatch)
  if (!art) return null
  const { cells: c } = computeSkillDamage(art, padSlots([]), ctx, 1)
  const bm = (1 + c.H) * (c.I || 1) * (1 + c.E)
  return {
    abrasion: c.DZ * bm,
    normal: { min: c.normalMin * bm, max: c.normalMax * bm },
    crit: { min: c.critMin * bm, max: c.critMax * bm },
    affinity: c.ED * bm,
  }
}

export function padSlots(boosts: readonly string[]): [string, string, string, string, string] {
  const padded: string[] = []
  for (let i = 0; i < 5; i++) padded.push(boosts[i] ?? "N/A")
  return padded as [string, string, string, string, string]
}
