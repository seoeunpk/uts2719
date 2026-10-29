/** Dataset configuration. App consumes the result through useMenuCatalogue. */
import { buildFilterOptions } from './catalogue'
import type { CatalogueConfig, MenuCatalogue } from './catalogue'
import { mockCanteens, mockMenuItems } from './mock/mockMenu'

export const MENU_CONFIG: CatalogueConfig = {
  source: import.meta.env.VITE_MENU_SOURCE || 'preview',
  baseUrl: import.meta.env.BASE_URL,
  csvFiles: import.meta.env.VITE_MENU_CSV_FILES,
  canteensUrl: import.meta.env.VITE_CANTEENS_URL,
}

export const PREVIEW_CATALOGUE: MenuCatalogue = {
  canteens: mockCanteens,
  menuItems: mockMenuItems,
  filterOptions: buildFilterOptions(mockCanteens, mockMenuItems),
  isPreview: true,
}
