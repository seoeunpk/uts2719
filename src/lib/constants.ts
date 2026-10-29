import type { DietaryTag, LatLng, MenuFilters } from '../types/menu'

export const DIETARY_LABELS: Record<DietaryTag, string> = {
  halal: 'Halal',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  'no-pork-no-lard': 'No pork, no lard',
}

export const ALL_DIETARY_TAGS = Object.keys(DIETARY_LABELS) as DietaryTag[]

export const EMPTY_FILTERS: MenuFilters = {
  query: '',
  canteenId: null,
  cuisines: [],
  dietary: [],
  priceRange: null,
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

/** Map framing for the Kent Ridge campus (incl. UTown). */
export const NUS_CENTER: LatLng = { lat: 1.2995, lng: 103.7773 }
/**
 * How far the map can pan. The area outside campus is faded out, so this is
 * mostly slack that lets pins move clear of the side panel / bottom sheet.
 * It must be larger than the screen at the minimum zoom (15), or Leaflet
 * pins the view to the centre of these bounds.
 */
export const NUS_MAX_BOUNDS: [[number, number], [number, number]] = [
  [NUS_CENTER.lat - 0.021, NUS_CENTER.lng - 0.036],
  [NUS_CENTER.lat + 0.021, NUS_CENTER.lng + 0.036],
]
