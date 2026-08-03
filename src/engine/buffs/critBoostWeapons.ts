// Per-class weapon gate for the site's min-phys-scaled crit-damage bonus (see
// `timeline.ts`'s `MIN_PHYS_CRIT_BONUS_SENTINEL`). `.tmp/site/deobfuscated.js`
// ~L42153-42160 gates the bonus on `critBoost === 1 && (weaponIds ?
// ec(ability, weaponIds) : true)`; `ec` (~L15130) calls `Gp(weaponIds,
// ability.weaponType)` (~L14241) — true only when one of the character's
// weapons has both a matching `weaponType` and `grantsCritBoost === true`.
import specMeta from "../../data/classes/specMeta.json"
import { CLASS_SPEC } from "./data"

interface InnerWayWeapon {
  weaponType: string
  martialArt: string
  specIds: string[]
  grantsCritBoost: boolean
}
interface WeaponsBySpecEntry {
  key: string
  name: string
  martialArt: string
  damageStatKey: string
}
const META = specMeta as unknown as {
  innerWays: Record<string, InnerWayWeapon>
  weaponsBySpec: Record<string, WeaponsBySpecEntry[]>
}

const CRIT_BOOST_WEAPON_TYPES_BY_CLASS: Record<string, ReadonlySet<string>> = (() => {
  const martialArtToItem = new Map<string, InnerWayWeapon>()
  for (const item of Object.values(META.innerWays ?? {}))
    martialArtToItem.set(item.martialArt, item)

  const out: Record<string, ReadonlySet<string>> = {}
  for (const [classId, spec] of Object.entries(CLASS_SPEC)) {
    const types = new Set<string>()
    for (const loadoutWeapon of META.weaponsBySpec?.[spec] ?? []) {
      const item = martialArtToItem.get(loadoutWeapon.martialArt)
      if (item?.grantsCritBoost) types.add(item.weaponType)
    }
    out[classId] = types
  }
  return out
})()

export function classGrantsMinPhysCritBoost(
  classId: string,
  weaponType: string | undefined,
): boolean {
  if (!weaponType) return false
  return CRIT_BOOST_WEAPON_TYPES_BY_CLASS[classId]?.has(weaponType) ?? false
}
