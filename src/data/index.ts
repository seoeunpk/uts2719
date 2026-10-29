/**
 * Single entry point for menu data. Components import from here, never from
 * `./mock` directly.
 *
 * TODO(Person 2): replace the mock imports below with the real NUS dataset,
 * keep the exported names and types, and set IS_MOCK_DATA to false.
 */
import { ALL_DIETARY_TAGS, PRICE_RANGES } from '../lib/constants'
import type { Canteen, FilterOptions, MenuItem } from '../types/menu'
import { mockCanteens, mockMenuItems } from './mock/mockMenu'

/** Shows a "Preview data" badge in the UI while true. */
export const IS_MOCK_DATA = true

export const canteens: Canteen[] = mockCanteens
export const menuItems: MenuItem[] = mockMenuItems

export const filterOptions: FilterOptions = {
  canteens,
  cuisines: [...new Set(menuItems.map((item) => item.cuisine))].sort(),
  dietary: ALL_DIETARY_TAGS,
  priceRanges: PRICE_RANGES,
}
