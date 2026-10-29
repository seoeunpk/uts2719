import { useEffect } from 'react'
import { formatPrice } from '../lib/constants'
import type { CanteenSummary } from '../lib/summarise'
import { FoodCard } from './FoodCard'

export interface CanteenDetailProps {
  summary: CanteenSummary
  onBack: () => void
  /** Dish to scroll to and highlight, e.g. picked from the results list. */
  highlightedItemId?: string | null
}

/** Panel view for one canteen: details plus its matching menu. */
export function CanteenDetail({ summary, onBack, highlightedItemId }: CanteenDetailProps) {
  const { canteen, items, minPrice } = summary
  const { lat, lng } = canteen.coordinates

  useEffect(() => {
    if (!highlightedItemId) return
    document.getElementById(`dish-${highlightedItemId}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [highlightedItemId])

  return (
    <div className="pb-6">
      <div className="relative h-28 overflow-hidden bg-nus-blue">
        <span aria-hidden="true" className="absolute bottom-3 right-4 text-5xl font-black text-white/15">
          {canteen.name}
        </span>
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to all results"
          className="absolute left-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="px-4 pt-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{canteen.name}</h2>
        <p className="mt-0.5 text-sm text-slate-600">{canteen.location}</p>

        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {canteen.openingHours && (
            <div className="flex gap-1.5">
              <dt className="sr-only">Opening hours</dt>
              <dd className="font-medium text-emerald-700">{canteen.openingHours}</dd>
            </div>
          )}
          <div className="flex gap-1.5">
            <dt className="sr-only">Matching dishes</dt>
            <dd className="text-slate-600">
              {items.length} {items.length === 1 ? 'dish' : 'dishes'}
              {minPrice !== null && `, from ${formatPrice(minPrice)}`}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex gap-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-nus-blue px-4 text-sm font-semibold text-white hover:bg-nus-blue-dark"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
              <path d="M3 11 21 3l-8 18-2-8-8-2Z" />
            </svg>
            Directions
          </a>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 px-2 pt-3">
        <h3 className="px-2.5 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Menu</h3>
        {items.length === 0 ? (
          <p className="px-2.5 py-6 text-sm text-slate-500">No dishes here match your current search and filters.</p>
        ) : (
          items.map((item) => <FoodCard key={item.id} item={item} highlighted={item.id === highlightedItemId} />)
        )}
      </div>
    </div>
  )
}
