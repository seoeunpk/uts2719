import type { FormEvent } from 'react'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  /** Called on Enter / search button. Optional; `onChange` fires on every keystroke. */
  onSubmit?: (value: string) => void
  onFocus?: () => void
  placeholder?: string
}

/** Pill-shaped search box that floats over the map. */
export function SearchBar({ value, onChange, onSubmit, onFocus, placeholder = 'Search dishes or stalls' }: SearchBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.currentTarget.querySelector('input')?.blur()
    onSubmit?.(value)
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex h-12 w-full items-center rounded-full bg-white pl-2 pr-1.5 shadow-md ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-nus-blue/40"
    >
      <label htmlFor="menu-search" className="sr-only">
        Search the menu
      </label>
      <input
        id="menu-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        autoComplete="off"
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-slate-500 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="grid size-9 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>
      )}
      <button
        type="submit"
        aria-label="Search"
        className="grid size-9 shrink-0 place-items-center rounded-full text-nus-blue hover:bg-nus-blue-soft"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  )
}
