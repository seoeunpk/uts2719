import { useEffect, useRef, useState } from 'react'
import { toggleInList } from '../hooks/useMenuFilters'
import { DIETARY_LABELS, formatPrice } from '../lib/constants'
import type { FilterOptions, MenuFilters } from '../types/menu'
import { Chip } from './Chip'
import { PriceSlider } from './PriceSlider'

export interface QuickFiltersProps {
  filters: MenuFilters
  options: FilterOptions
  onChange: (patch: Partial<MenuFilters>) => void
  onOpenAllFilters: () => void
  activeFilterCount: number
}

/** Horizontally scrolling chip row over the map, like map apps' category chips. */
export function QuickFilters({ filters, options, onChange, onOpenAllFilters, activeFilterCount }: QuickFiltersProps) {
  const [priceOpen, setPriceOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!priceOpen) return
    function close(event: PointerEvent | KeyboardEvent) {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !rootRef.current?.contains(event.target as Node)) {
        setPriceOpen(false)
      }
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [priceOpen])

  const { priceRange } = filters

  return (
    // The popover sits outside the scrolling row, which would otherwise clip it.
    <div ref={rootRef} className="relative">
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
        <Chip floating selected={priceRange !== null} onClick={() => setPriceOpen((open) => !open)}>
          {priceRange ? `${formatPrice(priceRange.min)} – ${formatPrice(priceRange.max)}` : 'Price'}
          <svg aria-hidden="true" viewBox="0 0 24 24" className={`size-3.5 transition ${priceOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Chip>

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
      {priceOpen && (
        <div
          role="dialog"
          aria-label="Price range"
          className="absolute left-0 top-full z-10 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5"
        >
          <PriceSlider bounds={options.priceBounds} value={priceRange} onChange={(next) => onChange({ priceRange: next })} />
        </div>
      )}
    </div>
  )
}

function Divider() {
  return <span aria-hidden="true" className="h-6 w-px shrink-0 bg-slate-300/80" />
}
