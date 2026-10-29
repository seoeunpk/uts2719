import type { Canteen, MenuItem } from '../types/menu'
import { FoodCard } from './FoodCard'

export interface FoodGridProps {
  items: MenuItem[]
  canteens: Canteen[]
  onSelectItem?: (item: MenuItem) => void
}

export function FoodGrid({ items, canteens, onSelectItem }: FoodGridProps) {
  const canteenNames = new Map(canteens.map((c) => [c.id, c.name]))

  return (
    <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <li key={item.id}>
          <FoodCard
            item={item}
            canteenName={canteenNames.get(item.canteenId) ?? 'Unknown canteen'}
            onSelect={onSelectItem}
          />
        </li>
      ))}
    </ul>
  )
}
