import type { ReactNode } from 'react'
import { toggleInList } from '../hooks/useMenuFilters'
import { DIETARY_LABELS } from '../lib/constants'
import type { FilterOptions, MenuFilters } from '../types/menu'
import { Chip } from './Chip'
import { PriceSlider } from './PriceSlider'

export interface FilterPanelProps {
  filters: MenuFilters
  options: FilterOptions
  onChange: (patch: Partial<MenuFilters>) => void
  onReset: () => void
  /** Hides the built-in header, e.g. when the mobile drawer has its own. */
  hideHeader?: boolean
}

export function FilterPanel({ filters, options, onChange, onReset, hideHeader = false }: FilterPanelProps) {
  const stalls = options.stalls.filter((stall) => !filters.canteenId || stall.canteenId === filters.canteenId)
  const canteenNames = new Map(options.canteens.map((canteen) => [canteen.id, canteen.name]))
  return (
    <div className="flex flex-col gap-6">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Filters</h2>
          <button type="button" onClick={onReset} className="text-sm font-medium text-nus-blue hover:underline">
            Reset
          </button>
        </div>
      )}

      <FilterSection title="Canteen">
        <select
          value={filters.canteenId ?? ''}
          onChange={(e) => onChange({ canteenId: e.target.value || null })}
          aria-label="Canteen"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-nus-blue focus:ring-4 focus:ring-nus-blue/15"
        >
          <option value="">All canteens</option>
          {options.canteens.map((canteen) => (
            <option key={canteen.id} value={canteen.id}>
              {canteen.name}
            </option>
          ))}
        </select>
      </FilterSection>

      <FilterSection title="Stall">
        <select
          value={filters.stallId ?? ''}
          onChange={(e) => onChange({ stallId: e.target.value || null })}
          aria-label="Stall"
          disabled={stalls.length === 0}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-nus-blue focus:ring-4 focus:ring-nus-blue/15 disabled:text-slate-400"
        >
          <option value="">All stalls</option>
          {stalls.map((stall) => <option key={stall.id} value={stall.id}>
            {stall.name}{!filters.canteenId && `, ${canteenNames.get(stall.canteenId) ?? stall.canteenId}`}
          </option>)}
        </select>
      </FilterSection>

      <FilterSection title="Cuisine">
        <div className="flex flex-wrap gap-2">
          {options.cuisines.map((cuisine) => (
            <Chip
              key={cuisine}
              selected={filters.cuisines.includes(cuisine)}
              onClick={() => onChange({ cuisines: toggleInList(filters.cuisines, cuisine) })}
            >
              {cuisine}
            </Chip>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price">
        <PriceSlider
          bounds={options.priceBounds}
          value={filters.priceRange}
          onChange={(priceRange) => onChange({ priceRange })}
        />
      </FilterSection>

      <FilterSection title="Dietary">
        <div className="flex flex-col gap-1">
          {options.dietary.map((tag) => {
            const checked = filters.dietary.includes(tag)
            return (
              <label
                key={tag}
                className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange({ dietary: toggleInList(filters.dietary, tag) })}
                  className="size-4 rounded accent-nus-blue"
                />
                {DIETARY_LABELS[tag]}
              </label>
            )
          })}
        </div>
      </FilterSection>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</legend>
      {children}
    </fieldset>
  )
}
