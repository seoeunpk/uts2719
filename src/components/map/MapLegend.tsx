import type { CanteenSummary } from '../../lib/summarise'

export interface MapLegendProps {
  summaries: CanteenSummary[]
  onSelectCanteen: (canteenId: string) => void
}

/** Printed-map style key: lettered pins plus symbol explanations. */
export function MapLegend({ summaries, onSelectCanteen }: MapLegendProps) {
  return (
    <div className="nff-legend w-60 rounded-2xl p-4 shadow-md">
      <h2 className="nff-legend__title">Legend</h2>
      <ul className="mt-3 space-y-1.5">
        {summaries.map(({ canteen, letter, items }) => (
          <li key={canteen.id}>
            <button
              type="button"
              onClick={() => onSelectCanteen(canteen.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-1 py-0.5 text-left hover:bg-black/5 ${items.length ? '' : 'opacity-55'}`}
            >
              <LegendPin letter={letter} muted={items.length === 0} />
              <span className="min-w-0 leading-tight">
                <span className="nff-legend__name block truncate">{canteen.name}</span>
                <span className="nff-legend__sub block">
                  {items.length ? `${items.length} ${items.length === 1 ? 'dish' : 'dishes'}` : 'No matches'}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-4 border-t border-black/10 pt-3">
        <span className="nff-legend__sub flex items-center gap-1.5">
          <LegendPin letter="" muted />
          No matches
        </span>
        <span className="nff-legend__sub flex items-center gap-1.5">
          <svg aria-hidden="true" viewBox="0 0 20 32" className="h-5 w-3.5">
            <rect x="8.75" y="19" width="2.5" height="12" fill="#8a6a3d" />
            <ellipse cx="10" cy="12" rx="7" ry="11" fill="#c39049" />
          </svg>
          Green space
        </span>
      </div>
    </div>
  )
}

function LegendPin({ letter, muted }: { letter: string; muted: boolean }) {
  return (
    <span aria-hidden="true" className={`nff-legend__pin ${muted ? 'nff-legend__pin--muted' : ''}`}>
      <span>{letter}</span>
    </span>
  )
}
