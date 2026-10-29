import { useState } from 'react'
import { CUISINE_EMOJI, DIETARY_LABELS, formatPrice } from '../lib/constants'
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
      <div className="relative size-18 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-nus-orange-soft to-nus-blue-soft">
        {showImage ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="size-full object-cover"
          />
        ) : (
          <span className="grid size-full place-items-center text-3xl" aria-hidden="true">
            {CUISINE_EMOJI[item.cuisine] ?? '🍽️'}
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
          {canteenName && <span className="text-slate-400"> · {canteenName}</span>}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-500">{item.cuisine}</span>
          {item.dietary.map((tag) => (
            <span key={tag} className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
              {DIETARY_LABELS[tag]}
            </span>
          ))}
        </div>
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
