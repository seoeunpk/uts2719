import { toggleInList } from '../hooks/useMenuFilters'
import { DIETARY_LABELS } from '../lib/constants'
import type { FilterOptions, MenuFilters } from '../types/menu'
import { Chip } from './Chip'

export interface QuickFiltersProps {
  filters: MenuFilters
  options: FilterOptions
  onChange: (patch: Partial<MenuFilters>) => void
  onOpenAllFilters: () => void
  activeFilterCount: number
}

/** Horizontally scrolling chip row over the map, like map apps' category chips. */
export function QuickFilters({ filters, options, onChange, onOpenAllFilters, activeFilterCount }: QuickFiltersProps) {
  return (
    <div className="scrollbar-none flex items-center gap-2 overflow-x-auto py-1">
      <button
        type="button"
        onClick={onOpenAllFilters}
        className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.2}>
          <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
        </svg>
        Filters
        {activeFilterCount > 0 && (
          <span className="grid size-5 place-items-center rounded-full bg-nus-blue text-xs text-white">{activeFilterCount}</span>
        )}
      </button>

      <Divider />
      {options.priceRanges.map((range) => {
        const selected = filters.priceRangeId === range.id
        return (
          <Chip key={range.id} floating selected={selected} onClick={() => onChange({ priceRangeId: selected ? null : range.id })}>
            {range.label}
          </Chip>
        )
      })}

      <Divider />
      {options.dietary.map((tag) => (
        <Chip
          key={tag}
          floating
          selected={filters.dietary.includes(tag)}
          onClick={() => onChange({ dietary: toggleInList(filters.dietary, tag) })}
        >
          {DIETARY_LABELS[tag]}
        </Chip>
      ))}

      <Divider />
      {options.cuisines.map((cuisine) => (
        <Chip
          key={cuisine}
          floating
          selected={filters.cuisines.includes(cuisine)}
          onClick={() => onChange({ cuisines: toggleInList(filters.cuisines, cuisine) })}
        >
          {cuisine}
        </Chip>
      ))}
    </div>
  )
}

function Divider() {
  return <span aria-hidden="true" className="h-6 w-px shrink-0 bg-slate-300/80" />
}
