import type { ReactNode } from 'react'

export interface ChipProps {
  selected: boolean
  onClick: () => void
  children: ReactNode
  /** Adds a drop shadow for chips that float over the map. */
  floating?: boolean
}

/** Toggleable pill used throughout the filter UI. */
export function Chip({ selected, onClick, children, floating = false }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nus-blue ${
        floating ? 'shadow-sm' : ''
      } ${
        selected
          ? 'border-nus-blue bg-nus-blue text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  )
}
