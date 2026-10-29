import type { FilterMenuItems } from '../types/menu'
import { searchMenu } from './menu.js'
import { getStallId } from './stalls.ts'

/**
 * Applies the search query and filters to the menu.
 *
 * Translate the UI's canteen IDs and price slider into the shared data
 * filter contract. Keep the original item objects and order for cards,
 * canteen summaries and map navigation.
 */
export const filterMenuItems: FilterMenuItems = (items, filters, options) => {
  const priceRange = filters.priceRange

  const candidates = items.filter((item) =>
    (!filters.canteenId || item.canteenId === filters.canteenId)
    && (!filters.stallId || getStallId(item.canteenId, item.stallName) === filters.stallId))
  const canteenNames = new Map(options.canteens.map((canteen) => [canteen.id, canteen.name]))
  const matched = searchMenu(candidates.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    canteen: canteenNames.get(item.canteenId) ?? item.canteenId,
    stall: item.stallName,
    cuisine: item.cuisine,
    dietary_tags: item.dietary,
    image: item.imageUrl ?? null,
    source: null,
  })), {
    query: filters.query,
    cuisines: filters.cuisines,
    dietaryTags: filters.dietary,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
  })
  const matchingIds = new Set(matched.map((item) => item.id))
  return candidates.filter((item) => matchingIds.has(item.id))
}
