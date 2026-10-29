import type { FormEvent } from 'react'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  /** Called on Enter / search button. Optional; `onChange` fires on every keystroke. */
  onSubmit?: (value: string) => void
  placeholder?: string
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search dishes or stalls…',
}: SearchBarProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit?.(value)
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative w-full">
      <label htmlFor="menu-search" className="sr-only">
        Search the menu
      </label>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        id="menu-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-28 text-base shadow-sm outline-none transition placeholder:text-slate-400 focus:border-nus-blue focus:ring-4 focus:ring-nus-blue/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-24 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>
      )}
      <button
        type="submit"
        className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-xl bg-nus-blue px-4 text-sm font-semibold text-white transition hover:bg-nus-blue-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nus-blue"
      >
        Search
      </button>
    </form>
  )
}
