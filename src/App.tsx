import { useCallback, useMemo, useState } from 'react'
import { ActiveFilterChips } from './components/ActiveFilterChips'
import { CanteenNav } from './components/CanteenNav'
import { EmptyState } from './components/EmptyState'
import { FilterPanel } from './components/FilterPanel'
import { FoodGrid } from './components/FoodGrid'
import { Header } from './components/Header'
import { MobileFilterDrawer } from './components/MobileFilterDrawer'
import { SearchBar } from './components/SearchBar'
import { IS_MOCK_DATA, canteens, filterOptions, menuItems } from './data'
import { useMenuFilters } from './hooks/useMenuFilters'
import { filterMenuItems } from './lib/filterMenu'

function App() {
  const { filters, updateFilters, resetFilters, activeFilterCount } = useMenuFilters()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const results = useMemo(() => filterMenuItems(menuItems, filters, filterOptions), [filters])

  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of menuItems) counts[item.canteenId] = (counts[item.canteenId] ?? 0) + 1
    return counts
  }, [])

  const selectedCanteen = canteens.find((c) => c.id === filters.canteenId)

  return (
    <div className="min-h-dvh">
      <Header isPreviewData={IS_MOCK_DATA} />

      <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-nus-blue-soft to-stone-50">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-nus-orange/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-4 pb-12 pt-12 text-center sm:px-6 sm:pt-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-nus-blue/70">Hungry between classes?</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            What should we eat <span className="text-nus-orange">today?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
            Browse dishes, prices and stalls across NUS canteens, all in one place.
          </p>
          <div className="mt-8">
            <SearchBar value={filters.query} onChange={(query) => updateFilters({ query })} />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CanteenNav
          canteens={canteens}
          selectedId={filters.canteenId}
          onSelect={(canteenId) => updateFilters({ canteenId })}
          itemCounts={itemCounts}
        />

        <div className="mt-8 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <FilterPanel
                filters={filters}
                options={filterOptions}
                onChange={updateFilters}
                onReset={resetFilters}
              />
            </div>
          </aside>

          <section aria-labelledby="results-heading" className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 id="results-heading" className="text-xl font-bold text-slate-900">
                  {selectedCanteen ? selectedCanteen.name : 'All dishes'}
                </h2>
                <p className="text-sm text-slate-500" aria-live="polite">
                  {results.length} {results.length === 1 ? 'dish' : 'dishes'}
                  {selectedCanteen && ` · ${selectedCanteen.location}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 lg:hidden"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.2}>
                  <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-nus-blue text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            <div className="mb-5">
              <ActiveFilterChips
                filters={filters}
                options={filterOptions}
                onChange={updateFilters}
                onReset={resetFilters}
              />
            </div>

            {results.length > 0 ? (
              <FoodGrid items={results} canteens={canteens} />
            ) : (
              <EmptyState onReset={resetFilters} />
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200/70 py-8 text-center text-sm text-slate-500">
        NUS Food Finder · Made by NUS students, for NUS students
      </footer>

      <MobileFilterDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        resultCount={results.length}
        filters={filters}
        options={filterOptions}
        onChange={updateFilters}
        onReset={resetFilters}
      />
    </div>
  )
}

export default App
