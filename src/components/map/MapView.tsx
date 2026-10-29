import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { MapContainer, Marker, ZoomControl } from 'react-leaflet'
import { NUS_CENTER, NUS_MAX_BOUNDS, formatPrice } from '../../lib/constants'
import type { CanteenSummary } from '../../lib/summarise'
import type { LatLng } from '../../types/menu'
import { CampusBasemap } from './CampusBasemap'
import { MapLegend } from './MapLegend'

/** Pixels of map hidden behind floating UI, so pins are framed in the visible area. */
export interface MapPadding {
  top: number
  right: number
  bottom: number
  left: number
}

export interface MapViewProps {
  summaries: CanteenSummary[]
  selectedCanteenId: string | null
  /** Pin to emphasise, e.g. while hovering a list row. */
  highlightedCanteenId?: string | null
  onSelectCanteen: (canteenId: string) => void
  padding: MapPadding
  showZoomControl?: boolean
  /** Shows the lettered map key (desktop). */
  showLegend?: boolean
}

const SELECTED_ZOOM = 17
const EDGE = 32
const COMPACT_BELOW_ZOOM = 16
/** Legend card width + gap; pins are framed to its right. */
const LEGEND_SPACE = 272

export function MapView({
  summaries,
  selectedCanteenId,
  highlightedCanteenId,
  onSelectCanteen,
  padding,
  showZoomControl = true,
  showLegend = false,
}: MapViewProps) {
  const [map, setMap] = useState<L.Map | null>(null)
  const selected = summaries.find((s) => s.canteen.id === selectedCanteenId)?.canteen
  const framing = useMemo(
    () => (showLegend ? { ...padding, left: padding.left + LEGEND_SPACE } : padding),
    [padding, showLegend],
  )

  useEffect(() => {
    if (!map) return
    const el = map.getContainer()
    el.style.setProperty('--map-pad-bottom', `${padding.bottom}px`)
    el.style.setProperty('--map-pad-left', `${padding.left}px`)
  }, [map, padding.bottom, padding.left])

  // Hide secondary pin labels when zoomed out so neighbouring canteens don't collide.
  useEffect(() => {
    if (!map) return
    const update = () => map.getContainer().classList.toggle('nff-compact', map.getZoom() < COMPACT_BELOW_ZOOM)
    update()
    map.on('zoomend', update)
    return () => {
      map.off('zoomend', update)
    }
  }, [map])

  // Reads the latest props without making every filter keystroke re-frame the map.
  const reframe = useEffectEvent(() => {
    if (!map) return
    if (selected) {
      map.flyTo(centerWithPadding(map, selected.coordinates, SELECTED_ZOOM, framing), SELECTED_ZOOM, { duration: 0.6 })
    } else {
      fitAll(map, summaries, framing)
    }
  })

  // Re-frame only when the selection or the visible area changes.
  useEffect(() => {
    reframe()
  }, [map, selected?.id, framing.top, framing.right, framing.bottom, framing.left])

  return (
    <div className="absolute inset-0 isolate">
      <MapContainer
        ref={setMap}
        center={[NUS_CENTER.lat, NUS_CENTER.lng]}
        zoom={16}
        minZoom={14}
        zoomSnap={0.25}
        maxZoom={19}
        maxBounds={NUS_MAX_BOUNDS}
        maxBoundsViscosity={1}
        zoomControl={false}
        className="size-full"
      >
        <CampusBasemap />
        {showZoomControl && <ZoomControl position="bottomright" />}
        {summaries.map((summary) => (
          <CanteenMarker
            key={summary.canteen.id}
            summary={summary}
            state={
              summary.canteen.id === selectedCanteenId
                ? 'selected'
                : summary.items.length === 0
                  ? 'empty'
                  : summary.canteen.id === highlightedCanteenId
                    ? 'highlighted'
                    : 'default'
            }
            onSelect={onSelectCanteen}
          />
        ))}
      </MapContainer>

      <button
        type="button"
        onClick={() => map && fitAll(map, summaries, framing)}
        aria-label="Show all canteens"
        title="Show all canteens"
        style={{ bottom: padding.bottom + (showZoomControl ? 104 : 16), right: padding.right + 12 }}
        className="absolute z-[1000] grid size-10 place-items-center rounded-full bg-white text-slate-700 shadow-md ring-1 ring-black/5 transition-[bottom] duration-300 hover:bg-slate-50"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
        </svg>
      </button>

      {showLegend && (
        <div style={{ left: padding.left + 16, bottom: padding.bottom + 16 }} className="absolute z-[1000] transition-[left] duration-300">
          <MapLegend summaries={summaries} onSelectCanteen={onSelectCanteen} />
        </div>
      )}
    </div>
  )
}

type PinState = 'default' | 'highlighted' | 'selected' | 'empty'

interface CanteenMarkerProps {
  summary: CanteenSummary
  state: PinState
  onSelect: (canteenId: string) => void
}

function CanteenMarker({ summary, state, onSelect }: CanteenMarkerProps) {
  const { canteen, letter, items, minPrice } = summary
  const count = items.length

  const icon = useMemo(() => {
    const sub = count === 0 ? 'No matches' : `${count} ${count === 1 ? 'dish' : 'dishes'} · from ${formatPrice(minPrice ?? 0)}`
    return L.divIcon({
      className: 'nff-pin-icon',
      iconSize: [0, 0],
      html: `<div class="nff-pin nff-pin--${state}">
          <div class="nff-pin__head"><span>${escapeHtml(letter)}</span></div>
          <div class="nff-pin__label"><strong>${escapeHtml(canteen.name)}</strong><span>${sub}</span></div>
        </div>`,
    })
  }, [canteen.name, letter, count, minPrice, state])

  return (
    <Marker
      position={[canteen.coordinates.lat, canteen.coordinates.lng]}
      icon={icon}
      title={canteen.name}
      zIndexOffset={state === 'selected' ? 1000 : state === 'highlighted' ? 500 : state === 'empty' ? -500 : 0}
      eventHandlers={{ click: () => onSelect(canteen.id) }}
    />
  )
}

/** Map centre that puts `target` in the middle of the unobscured area. */
function centerWithPadding(map: L.Map, target: LatLng, zoom: number, p: MapPadding): L.LatLng {
  const point = map.project([target.lat, target.lng], zoom)
  const offset = L.point((p.left - p.right) / 2, (p.top - p.bottom) / 2)
  return map.unproject(point.subtract(offset), zoom)
}

function fitAll(map: L.Map, summaries: CanteenSummary[], p: MapPadding) {
  if (summaries.length === 0) return
  const bounds = L.latLngBounds(summaries.map((s) => [s.canteen.coordinates.lat, s.canteen.coordinates.lng]))
  map.flyToBounds(bounds, {
    paddingTopLeft: [p.left + EDGE, p.top + EDGE],
    // Extra right padding leaves room for the labels beside each pin.
    paddingBottomRight: [p.right + EDGE + 150, p.bottom + EDGE],
    maxZoom: SELECTED_ZOOM,
    duration: 0.6,
  })
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`)
}
