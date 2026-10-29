import { useState } from 'react'
import { DIETARY_LABELS, formatPrice } from '../lib/constants'
import type { MenuItem } from '../types/menu'

export interface FoodCardProps {
  item: MenuItem
  /** Shown after the stall name; omit when the canteen is already obvious. */
  canteenName?: string
  /** Visually marks the dish, e.g. after it was picked from the results list. */
  highlighted?: boolean
  onSelect?: (item: MenuItem) => void
}

/** Compact dish row used in the results list and canteen menus. */
export function FoodCard({ item, canteenName, highlighted = false, onSelect }: FoodCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = item.imageUrl && !imageFailed

  const body = (
    <>
      <div className="relative size-18 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {showImage ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="size-full object-cover"
          />
        ) : (
          <span className="grid size-full place-items-center text-slate-400" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-1.7 1-3 3.2-3 6v4h3v8" />
            </svg>
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug text-slate-900">{item.name}</h3>
          <span className="shrink-0 font-bold text-nus-blue">{formatPrice(item.price)}</span>
        </div>
        <p className="mt-0.5 truncate text-sm text-slate-600">
          {item.stallName}
          {canteenName && <span className="text-slate-400">, {canteenName}</span>}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          {[item.cuisine, ...item.dietary.map((tag) => DIETARY_LABELS[tag])].join(', ')}
        </p>
      </div>
    </>
  )

  const className = `flex w-full gap-3 rounded-xl p-2.5 text-left transition ${
    highlighted ? 'bg-nus-orange-soft ring-2 ring-nus-orange/60' : ''
  }`

  if (onSelect) {
    return (
      <button
        type="button"
        id={`dish-${item.id}`}
        onClick={() => onSelect(item)}
        className={`${className} hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-nus-blue`}
      >
        {body}
      </button>
    )
  }
  return (
    <article id={`dish-${item.id}`} className={className}>
      {body}
    </article>
  )
}
