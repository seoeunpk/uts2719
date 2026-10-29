/**
 * Single entry point for menu data. Components import from here, never from
 * `./mock` directly.
 *
 * TODO(Person 2): replace the mock imports below with the real NUS dataset,
 * keeping the exported names and types.
 */
import { ALL_DIETARY_TAGS } from '../lib/constants'
import type { Canteen, FilterOptions, MenuItem } from '../types/menu'
import { mockCanteens, mockMenuItems } from './mock/mockMenu'

export const canteens: Canteen[] = mockCanteens
export const menuItems: MenuItem[] = mockMenuItems

export const filterOptions: FilterOptions = {
  canteens,
  cuisines: [...new Set(menuItems.map((item) => item.cuisine))].sort(),
  dietary: ALL_DIETARY_TAGS,
  // Whole dollars so the slider ends on round numbers.
  priceBounds: {
    min: Math.floor(Math.min(...menuItems.map((item) => item.price))),
    max: Math.ceil(Math.max(...menuItems.map((item) => item.price))),
  },
}
