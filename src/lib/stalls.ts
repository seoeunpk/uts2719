import type { MenuItem, StallOption } from '../types/menu'

/** Tuple encoding avoids collisions and keeps equal names in different canteens distinct. */
export function getStallId(canteenId: string, name: string): string {
  return JSON.stringify([canteenId, name.trim().toLocaleLowerCase('en')])
}

export function getStallOptions(items: MenuItem[]): StallOption[] {
  const stalls = new Map<string, StallOption>()
  for (const item of items) {
    const id = getStallId(item.canteenId, item.stallName)
    if (!stalls.has(id)) stalls.set(id, { id, canteenId: item.canteenId, name: item.stallName.trim() })
  }
  return [...stalls.values()].sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base', numeric: true }) || a.canteenId.localeCompare(b.canteenId))
}
