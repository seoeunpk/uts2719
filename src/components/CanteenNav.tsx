import type { Canteen } from '../types/menu'

export interface CanteenNavProps {
  canteens: Canteen[]
  /** `null` means "All canteens". */
  selectedId: string | null
  onSelect: (canteenId: string | null) => void
  /** Optional dish count per canteen id, shown under each name. */
  itemCounts?: Record<string, number>
}

export function CanteenNav({ canteens, selectedId, onSelect, itemCounts }: CanteenNavProps) {
  return (
    <nav aria-label="Canteens">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-slate-900">Browse by canteen</h2>
        {selectedId && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-sm font-medium text-nus-blue hover:underline"
          >
            Show all
          </button>
        )}
      </div>
      {/* Negative margin lets the row scroll edge-to-edge on mobile. */}
      <ul className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <li className="snap-start">
          <CanteenTile
            name="All canteens"
            subtitle="Every location"
            meta={`${canteens.length} canteens`}
            icon="🏫"
            selected={selectedId === null}
            onClick={() => onSelect(null)}
          />
        </li>
        {canteens.map((canteen) => {
          const count = itemCounts?.[canteen.id]
          return (
            <li key={canteen.id} className="snap-start">
              <CanteenTile
                name={canteen.name}
                subtitle={canteen.location}
                meta={count === undefined ? undefined : `${count} ${count === 1 ? 'dish' : 'dishes'}`}
                icon={canteen.name.charAt(0)}
                selected={selectedId === canteen.id}
                onClick={() => onSelect(selectedId === canteen.id ? null : canteen.id)}
              />
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

interface CanteenTileProps {
  name: string
  subtitle: string
  meta?: string
  icon: string
  selected: boolean
  onClick: () => void
}

function CanteenTile({ name, subtitle, meta, icon, selected, onClick }: CanteenTileProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex w-56 items-center gap-3 rounded-2xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nus-blue ${
        selected
          ? 'border-nus-blue bg-nus-blue text-white shadow-md'
          : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid size-11 shrink-0 place-items-center rounded-xl text-lg font-bold ${
          selected ? 'bg-white/15 text-white' : 'bg-nus-orange-soft text-nus-orange'
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold">{name}</span>
        <span className={`block truncate text-xs ${selected ? 'text-white/80' : 'text-slate-500'}`}>{subtitle}</span>
        {meta && (
          <span className={`block text-xs font-medium ${selected ? 'text-white' : 'text-nus-blue'}`}>{meta}</span>
        )}
      </span>
    </button>
  )
}
