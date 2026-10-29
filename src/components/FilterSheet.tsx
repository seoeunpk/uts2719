import { useEffect, useRef } from 'react'
import { FilterPanel, type FilterPanelProps } from './FilterPanel'

export interface FilterSheetProps extends Omit<FilterPanelProps, 'hideHeader'> {
  open: boolean
  onClose: () => void
  resultCount: number
}

/** All-filters dialog: bottom sheet on mobile, centred modal on desktop. */
export function FilterSheet({ open, onClose, resultCount, ...panelProps }: FilterSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sheet-title"
        inert={!open}
        className={`relative flex max-h-[85dvh] w-full flex-col rounded-t-3xl bg-white shadow-2xl transition duration-300 ease-out lg:max-h-[80vh] lg:w-[440px] lg:rounded-3xl ${
          open ? 'translate-y-0 lg:scale-100 lg:opacity-100' : 'translate-y-full lg:translate-y-0 lg:scale-95 lg:opacity-0'
        }`}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-slate-200 lg:hidden" aria-hidden="true" />
        <div className="flex items-center justify-between px-5 pb-2 pt-3 lg:pt-5">
          <h2 id="filter-sheet-title" className="text-lg font-bold">
            Filters
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="grid size-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          <FilterPanel {...panelProps} hideHeader />
        </div>

        <div className="flex gap-3 border-t border-slate-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={panelProps.onReset}
            className="h-12 flex-1 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-[2] rounded-xl bg-nus-blue font-semibold text-white hover:bg-nus-blue-dark"
          >
            Show {resultCount} {resultCount === 1 ? 'dish' : 'dishes'}
          </button>
        </div>
      </div>
    </div>
  )
}
