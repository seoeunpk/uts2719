import type { DietaryTag, MenuFilters, PriceRange } from '../types/menu'

export const DIETARY_LABELS: Record<DietaryTag, string> = {
  halal: 'Halal',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  'no-pork-no-lard': 'No pork, no lard',
}

export const ALL_DIETARY_TAGS = Object.keys(DIETARY_LABELS) as DietaryTag[]

export const PRICE_RANGES: PriceRange[] = [
  { id: 'under-4', label: 'Under $4', min: 0, max: 3.99 },
  { id: '4-6', label: '$4 – $6', min: 4, max: 6 },
  { id: '6-8', label: '$6 – $8', min: 6.01, max: 8 },
  { id: 'over-8', label: 'Above $8', min: 8.01, max: null },
]

export const EMPTY_FILTERS: MenuFilters = {
  query: '',
  canteenId: null,
  cuisines: [],
  dietary: [],
  priceRangeId: null,
}

/** Emoji used on the image placeholder when a dish has no photo. */
export const CUISINE_EMOJI: Record<string, string> = {
  Chinese: '🍜',
  Malay: '🍛',
  Indian: '🫓',
  Western: '🍝',
  Japanese: '🍱',
  Korean: '🍲',
  Thai: '🌶️',
  Vegetarian: '🥗',
  Drinks: '🧋',
  Desserts: '🍧',
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}
