import defaultRotationsData from "../data/rotations/defaultRotations.json"
import handRotationsData from "../data/rotations/handRotations.json"
import debuffsLibrary from "../data/skills/debuffsLibrary.json"
import { BUILTIN_SKILLS_BY_CLASS } from "../data/skills"
import type { Skill } from "./skill"
import type { Rotation } from "./rotation"
import type { Debuff } from "./debuff"

export { builtinBuffsForClass } from "./builtinBuffs"

const DEFAULT_ROTATIONS = defaultRotationsData as unknown as Record<
  string,
  { rotations: Rotation[]; defaultRotationId: string }
>
const HAND_ROTATIONS = handRotationsData as unknown as Record<
  string,
  { rotations: Rotation[]; defaultRotationId?: string }
>
const DEBUFF_LIBRARY = debuffsLibrary as unknown as Record<string, Debuff[]>

export function builtinSkillsForClass(classId: string): Skill[] {
  return [...(BUILTIN_SKILLS_BY_CLASS[classId] ?? [])]
}

export function builtinRotationsForClass(classId: string): Rotation[] {
  return [
    ...(DEFAULT_ROTATIONS[classId]?.rotations ?? []),
    ...(HAND_ROTATIONS[classId]?.rotations ?? []),
  ]
}

export function defaultRotationForClass(classId: string): Rotation | null {
  const rotations = builtinRotationsForClass(classId)
  const defaultId =
    HAND_ROTATIONS[classId]?.defaultRotationId ?? DEFAULT_ROTATIONS[classId]?.defaultRotationId
  return rotations.find((r) => r.id === defaultId) ?? rotations[0] ?? null
}

export function builtinDebuffsForClass(classId: string): Debuff[] {
  return DEBUFF_LIBRARY[classId] ?? []
}
