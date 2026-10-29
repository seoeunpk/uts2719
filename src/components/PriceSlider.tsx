import { formatPrice } from '../lib/constants'
import type { PriceRange } from '../types/menu'

export interface PriceSliderProps {
  /** Full range the handles can move across. */
  bounds: PriceRange
  /** `null` means no restriction (handles at the bounds). */
  value: PriceRange | null
  onChange: (value: PriceRange | null) => void
  step?: number
}

/** Two-handle linear price slider. */
export function PriceSlider({ bounds, value, onChange, step = 0.5 }: PriceSliderProps) {
  const min = value?.min ?? bounds.min
  const max = value?.max ?? bounds.max
  const span = bounds.max - bounds.min || 1
  const toPercent = (n: number) => ((n - bounds.min) / span) * 100

  function update(nextMin: number, nextMax: number) {
    const isFull = nextMin <= bounds.min && nextMax >= bounds.max
    onChange(isFull ? null : { min: nextMin, max: nextMax })
  }

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between text-sm">
        <span className="font-semibold text-slate-900">
          {value ? `${formatPrice(min)} – ${formatPrice(max)}` : 'Any price'}
        </span>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="font-medium text-nus-blue hover:underline">
            Clear
          </button>
        )}
      </div>

      <div className="price-slider relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-nus-blue"
          style={{ left: `${toPercent(min)}%`, right: `${100 - toPercent(max)}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={bounds.min}
          max={bounds.max}
          step={step}
          value={min}
          // Both handles at the top end: lift the min handle so it can still be dragged back.
          style={min >= bounds.max - step ? { zIndex: 1 } : undefined}
          onChange={(e) => update(Math.min(Number(e.target.value), max), max)}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={bounds.min}
          max={bounds.max}
          step={step}
          value={max}
          onChange={(e) => update(min, Math.max(Number(e.target.value), min))}
        />
      </div>

      <div className="mt-1.5 flex justify-between text-xs text-slate-500">
        <span>{formatPrice(bounds.min)}</span>
        <span>{formatPrice(bounds.max)}</span>
      </div>
    </div>
  )
}
