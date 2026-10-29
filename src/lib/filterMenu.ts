import type { FilterMenuItems } from '../types/menu'

/**
 * Applies the search query and filters to the menu.
 *
 * TODO(Person 2): implement search + filtering here. The UI already passes
 * the full `MenuFilters` state on every change and renders whatever this
 * returns, so no component changes should be needed.
 *
 * Currently a pass-through so the UI can be previewed.
 */
export const filterMenuItems: FilterMenuItems = (items, _filters, _options) => items
