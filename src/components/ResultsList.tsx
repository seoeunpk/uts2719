import { formatPrice } from '../lib/constants'
import type { CanteenSummary } from '../lib/summarise'
import type { MenuItem } from '../types/menu'
import { EmptyState } from './EmptyState'
import { FoodCard } from './FoodCard'

const PREVIEW_COUNT = 3

export interface ResultsListProps {
  summaries: CanteenSummary[]
  onSelectCanteen: (canteenId: string) => void
  onSelectItem: (item: MenuItem) => void
  /** Hovering a canteen's group emphasises its map pin. */
  onHoverCanteen?: (canteenId: string | null) => void
  onReset: () => void
}

/** Default panel view: matching dishes grouped by canteen. */
export function ResultsList({
  summaries,
  onSelectCanteen,
  onSelectItem,
  onHoverCanteen,
  onReset,
}: ResultsListProps) {
  const withResults = summaries.filter((s) => s.items.length > 0)
  const total = withResults.reduce((sum, s) => sum + s.items.length, 0)

  return (
    <div className="px-4 pb-6">
      <div className="pb-3 pt-1">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">What should we eat today?</h1>
        <p className="mt-0.5 text-sm text-slate-500" aria-live="polite">
          {total} {total === 1 ? 'dish' : 'dishes'} at {withResults.length}{' '}
          {withResults.length === 1 ? 'canteen' : 'canteens'}
        </p>
      </div>

      {withResults.length === 0 ? (
        <EmptyState onReset={onReset} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {withResults.map(({ canteen, items, minPrice }) => (
            <li
              key={canteen.id}
              className="py-3"
              onMouseEnter={() => onHoverCanteen?.(canteen.id)}
              onMouseLeave={() => onHoverCanteen?.(null)}
            >
              <button
                type="button"
                onClick={() => onSelectCanteen(canteen.id)}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-slate-50"
              >
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-nus-blue text-sm font-bold text-white"
                >
                  {items.length}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-slate-900">{canteen.name}</span>
                  <span className="block truncate text-sm text-slate-500">
                    {canteen.location}
                    {minPrice !== null && `, from ${formatPrice(minPrice)}`}
                  </span>
                </span>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="mt-1">
                {items.slice(0, PREVIEW_COUNT).map((item) => (
                  <FoodCard key={item.id} item={item} onSelect={onSelectItem} />
                ))}
              </div>
              {items.length > PREVIEW_COUNT && (
                <button
                  type="button"
                  onClick={() => onSelectCanteen(canteen.id)}
                  className="ml-2.5 mt-1 text-sm font-semibold text-nus-blue hover:underline"
                >
                  See all {items.length} dishes
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
