import type { Canteen, MenuItem } from '../types/menu'

/** Display-only grouping of (already filtered) results, one entry per canteen. */
export interface CanteenSummary {
  canteen: Canteen
  /** Map key shown on the pin and legend: A, B, C, ... */
  letter: string
  items: MenuItem[]
  minPrice: number | null
}

/** Keeps canteen order and includes canteens with no matching items. */
export function summariseByCanteen(canteens: Canteen[], items: MenuItem[]): CanteenSummary[] {
  const byCanteen = new Map<string, MenuItem[]>()
  for (const item of items) {
    const list = byCanteen.get(item.canteenId)
    if (list) list.push(item)
    else byCanteen.set(item.canteenId, [item])
  }
  return canteens.map((canteen, index) => {
    const list = byCanteen.get(canteen.id) ?? []
    return {
      canteen,
      letter: index < 26 ? String.fromCharCode(65 + index) : String(index + 1),
      items: list,
      minPrice: list.length ? Math.min(...list.map((i) => i.price)) : null,
    }
  })
}
