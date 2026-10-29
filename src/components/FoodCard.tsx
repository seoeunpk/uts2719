import { useState } from 'react'
import { CUISINE_EMOJI, DIETARY_LABELS, formatPrice } from '../lib/constants'
import type { MenuItem } from '../types/menu'

export interface FoodCardProps {
  item: MenuItem
  canteenName: string
  /** Makes the card clickable, e.g. to open a detail view later. */
  onSelect?: (item: MenuItem) => void
}

export function FoodCard({ item, canteenName, onSelect }: FoodCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = item.imageUrl && !imageFailed

  const body = (
    <>
      <div className="relative aspect-[16/9] overflow-hidden min-[480px]:aspect-[4/3] bg-gradient-to-br from-nus-orange-soft to-nus-blue-soft">
        {showImage ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center" aria-hidden="true">
            <span className="text-6xl drop-shadow-sm transition duration-300 group-hover:scale-110">
              {CUISINE_EMOJI[item.cuisine] ?? '🍽️'}
            </span>
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-sm font-bold text-nus-blue shadow-sm">
          {formatPrice(item.price)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.cuisine}</p>
          <h3 className="mt-0.5 text-base font-semibold leading-snug text-slate-900">{item.name}</h3>
        </div>
        <p className="flex items-start gap-1.5 text-sm text-slate-600">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21Z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          <span>
            {item.stallName}
            <span className="text-slate-400"> · </span>
            {canteenName}
          </span>
        </p>
        {item.dietary.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-1" aria-label="Dietary information">
            {item.dietary.map((tag) => (
              <li key={tag} className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {DIETARY_LABELS[tag]}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )

  const className =
    'group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(item)}
        className={`${className} w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nus-blue`}
      >
        {body}
      </button>
    )
  }
  return <article className={className}>{body}</article>
}
