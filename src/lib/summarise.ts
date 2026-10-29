import type { Canteen, MenuItem } from '../types/menu'

/** Display-only grouping of (already filtered) results, one entry per canteen. */
export interface CanteenSummary {
  canteen: Canteen
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
  return canteens.map((canteen) => {
    const list = byCanteen.get(canteen.id) ?? []
    const prices = list.flatMap((item) => item.price === null ? [] : [item.price])
    return {
      canteen,
      items: list,
      minPrice: prices.length ? prices.reduce((a, b) => Math.min(a, b)) : null,
    }
  })
}
