import { useCallback, useState } from 'react'
import { EMPTY_FILTERS } from '../lib/constants.ts'
import type { MenuFilters } from '../types/menu'

/** Holds the UI's filter selections. Contains no filtering logic. */
export function useMenuFilters(initial: MenuFilters = EMPTY_FILTERS) {
  const [filters, setFilters] = useState<MenuFilters>(initial)

  const updateFilters = useCallback((patch: Partial<MenuFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...patch,
      ...('canteenId' in patch && patch.canteenId !== prev.canteenId && !('stallId' in patch)
        ? { stallId: null } : {}),
    }))
  }, [])

  // Keep the search text when resetting the filter panel.
  const resetFilters = useCallback(() => {
    setFilters((prev) => ({ ...EMPTY_FILTERS, query: prev.query }))
  }, [])

  const clearAllFilters = useCallback(() => setFilters({ ...EMPTY_FILTERS }), [])

  const activeFilterCount =
    (filters.canteenId ? 1 : 0) +
    (filters.stallId ? 1 : 0) +
    filters.cuisines.length +
    filters.dietary.length +
    (filters.priceRange ? 1 : 0)

  return { filters, setFilters, updateFilters, resetFilters, clearAllFilters, activeFilterCount }
}

/** Adds `value` to the list if absent, removes it if present. */
export function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}
