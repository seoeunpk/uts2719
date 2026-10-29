import { useEffect, useRef } from 'react'
import { FilterPanel, type FilterPanelProps } from './FilterPanel'

export interface MobileFilterDrawerProps extends Omit<FilterPanelProps, 'hideHeader'> {
  open: boolean
  onClose: () => void
  resultCount: number
}

/** Bottom sheet wrapping `FilterPanel` for small screens. */
export function MobileFilterDrawer({ open, onClose, resultCount, ...panelProps }: MobileFilterDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-drawer-title"
        inert={!open}
        className={`absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-slate-200" aria-hidden="true" />
        <div className="flex items-center justify-between px-5 pb-2 pt-3">
          <h2 id="filter-drawer-title" className="text-lg font-bold">
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
