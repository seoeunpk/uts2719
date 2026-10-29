import { Suspense, lazy, useCallback, useMemo, useState } from 'react'
import { BottomSheet } from './components/BottomSheet'
import { CanteenDetail } from './components/CanteenDetail'
import { FilterSheet } from './components/FilterSheet'
import type { MapPadding } from './components/map/MapView'
import { QuickFilters } from './components/QuickFilters'
import { ResultsList } from './components/ResultsList'
import { SearchBar } from './components/SearchBar'
import { IS_MOCK_DATA, canteens, filterOptions, menuItems } from './data'
import { useMenuFilters } from './hooks/useMenuFilters'
import { useMediaQuery, useViewportHeight } from './hooks/useViewport'
import { filterMenuItems } from './lib/filterMenu'
import { getSheetHeights, type SheetSnap } from './lib/sheet'
import { summariseByCanteen } from './lib/summarise'
import type { MenuItem } from './types/menu'

// The map engine is large; load it separately so the panel appears first.
const MapView = lazy(() => import('./components/map/MapView').then((m) => ({ default: m.MapView })))

const PANEL_WIDTH = 408
/** Height of the floating search + chip rows on mobile. */
const MOBILE_TOP_OVERLAY = 116
/** Height of the floating chip row on desktop. */
const DESKTOP_TOP_OVERLAY = 64

function App() {
  const { filters, updateFilters, resetFilters, activeFilterCount } = useMenuFilters()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const viewportHeight = useViewportHeight()

  const [selectedCanteenId, setSelectedCanteenId] = useState<string | null>(null)
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null)
  const [hoveredCanteenId, setHoveredCanteenId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>('half')
  const closeFilters = useCallback(() => setFiltersOpen(false), [])

  const results = useMemo(() => filterMenuItems(menuItems, filters, filterOptions), [filters])
  const summaries = useMemo(() => summariseByCanteen(canteens, results), [results])
  const selectedSummary = summaries.find((s) => s.canteen.id === selectedCanteenId)

  const panelOffset = isDesktop && !panelCollapsed ? PANEL_WIDTH : 0
  const sheetHeight = getSheetHeights(viewportHeight)[sheetSnap]
  const mapPadding = useMemo<MapPadding>(
    () =>
      isDesktop
        ? { top: DESKTOP_TOP_OVERLAY, right: 0, bottom: 0, left: panelOffset }
        : { top: MOBILE_TOP_OVERLAY, right: 0, bottom: sheetHeight, left: 0 },
    [isDesktop, panelOffset, sheetHeight],
  )

  function selectCanteen(canteenId: string) {
    setSelectedCanteenId(canteenId)
    setHighlightedItemId(null)
    setPanelCollapsed(false)
    if (sheetSnap === 'peek') setSheetSnap('half')
  }

  function selectItem(item: MenuItem) {
    setSelectedCanteenId(item.canteenId)
    setHighlightedItemId(item.id)
  }

  function backToResults() {
    setSelectedCanteenId(null)
    setHighlightedItemId(null)
  }

  const panelContent = selectedSummary ? (
    <CanteenDetail summary={selectedSummary} onBack={backToResults} highlightedItemId={highlightedItemId} />
  ) : (
    <ResultsList
      summaries={summaries}
      onSelectCanteen={selectCanteen}
      onSelectItem={selectItem}
      onHoverCanteen={isDesktop ? setHoveredCanteenId : undefined}
      onReset={resetFilters}
      isPreviewData={IS_MOCK_DATA}
    />
  )

  const searchBar = (
    <SearchBar
      value={filters.query}
      onChange={(query) => updateFilters({ query })}
      onSubmit={() => {
        backToResults()
        if (!isDesktop) setSheetSnap('half')
      }}
    />
  )

  const quickFilters = (
    <QuickFilters
      filters={filters}
      options={filterOptions}
      onChange={updateFilters}
      onOpenAllFilters={() => setFiltersOpen(true)}
      activeFilterCount={activeFilterCount}
    />
  )

  return (
    <div className="relative h-dvh overflow-hidden bg-slate-100">
      <Suspense fallback={null}>
        <MapView
          summaries={summaries}
          selectedCanteenId={selectedCanteenId}
          highlightedCanteenId={hoveredCanteenId}
          onSelectCanteen={selectCanteen}
          padding={mapPadding}
          showZoomControl={isDesktop}
        />
      </Suspense>

      {isDesktop ? (
        <>
          <aside
            aria-label="Search results"
            style={{ width: PANEL_WIDTH, transform: `translateX(${panelCollapsed ? -PANEL_WIDTH : 0}px)` }}
            className="absolute inset-y-0 left-0 z-20 flex flex-col bg-white shadow-xl transition-transform duration-300"
          >
            <div className="shrink-0 p-4 pb-3">{searchBar}</div>
            <div key={selectedCanteenId ?? 'list'} className="min-h-0 flex-1 overflow-y-auto">
              {panelContent}
            </div>
            <button
              type="button"
              onClick={() => setPanelCollapsed((c) => !c)}
              aria-label={panelCollapsed ? 'Show side panel' : 'Hide side panel'}
              className="absolute left-full top-1/2 grid h-12 w-6 -translate-y-1/2 place-items-center rounded-r-lg bg-white text-slate-500 shadow-md hover:text-slate-800"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className={`size-4 ${panelCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </aside>
          <div
            style={{ left: panelOffset + 16 }}
            className="absolute right-4 top-3 z-10 transition-[left] duration-300"
          >
            {quickFilters}
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-x-0 top-0 z-30 space-y-2 px-3 pt-3">
            {searchBar}
            {quickFilters}
          </div>
          <BottomSheet
            snap={sheetSnap}
            onSnapChange={setSheetSnap}
            viewportHeight={viewportHeight}
            contentKey={selectedCanteenId ?? 'list'}
          >
            {panelContent}
          </BottomSheet>
        </>
      )}

      <FilterSheet
        open={filtersOpen}
        onClose={closeFilters}
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
