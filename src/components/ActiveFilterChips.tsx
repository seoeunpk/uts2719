import { DIETARY_LABELS } from '../lib/constants'
import type { FilterOptions, MenuFilters } from '../types/menu'

export interface ActiveFilterChipsProps {
  filters: MenuFilters
  options: FilterOptions
  onChange: (patch: Partial<MenuFilters>) => void
  onReset: () => void
}

/** Row of removable chips summarising the current filter selection. */
export function ActiveFilterChips({ filters, options, onChange, onReset }: ActiveFilterChipsProps) {
  const chips: { key: string; label: string; remove: () => void }[] = []

  if (filters.canteenId) {
    const canteen = options.canteens.find((c) => c.id === filters.canteenId)
    chips.push({ key: 'canteen', label: canteen?.name ?? filters.canteenId, remove: () => onChange({ canteenId: null }) })
  }
  for (const cuisine of filters.cuisines) {
    chips.push({
      key: `cuisine-${cuisine}`,
      label: cuisine,
      remove: () => onChange({ cuisines: filters.cuisines.filter((c) => c !== cuisine) }),
    })
  }
  if (filters.priceRangeId) {
    const range = options.priceRanges.find((r) => r.id === filters.priceRangeId)
    chips.push({ key: 'price', label: range?.label ?? filters.priceRangeId, remove: () => onChange({ priceRangeId: null }) })
  }
  for (const tag of filters.dietary) {
    chips.push({
      key: `diet-${tag}`,
      label: DIETARY_LABELS[tag],
      remove: () => onChange({ dietary: filters.dietary.filter((t) => t !== tag) }),
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          aria-label={`Remove filter: ${chip.label}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-nus-blue-soft pl-3 pr-2 text-sm font-medium text-nus-blue hover:bg-nus-blue/15"
        >
          {chip.label}
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={3}>
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>
      ))}
      <button type="button" onClick={onReset} className="px-1 text-sm font-medium text-slate-500 hover:text-slate-800 hover:underline">
        Clear all
      </button>
    </div>
  )
}
