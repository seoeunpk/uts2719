import L from 'leaflet'
import '@maplibre/maplibre-gl-leaflet'
import { setWorkerUrl, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { useEffect } from 'react'
import { Polygon, useMap } from 'react-leaflet'
import { NUS_CAMPUS_RINGS } from '../../data/nusCampus'
import { NUS_MAX_BOUNDS } from '../../lib/constants'

// MapLibre locates its worker relative to its own file, which breaks once Vite bundles it.
setWorkerUrl(maplibreWorkerUrl)

/** Free, key-less full-colour vector style (https://openfreemap.org). */
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'

/** Style layers removed to keep the campus map uncluttered. */
const HIDDEN_LAYER =
  /^(label_|boundary_|poi_|highway-shield|road_shield|road_one_way|airport|highway-name-path|water_name|waterway_line_label|building-3d|natural_earth)/

// Mask = everything inside the map bounds except the campus, which shows through as holes.
const [[south, west], [north, east]] = NUS_MAX_BOUNDS
const MASK_OUTER: [number, number][] = [
  [south - 0.05, west - 0.05],
  [north + 0.05, west - 0.05],
  [north + 0.05, east + 0.05],
  [south - 0.05, east + 0.05],
]

/** Colourful vector basemap with everything outside NUS greyed out. */
export function CampusBasemap() {
  const map = useMap()

  useEffect(() => {
    let layer: L.MaplibreGL | undefined
    let cancelled = false

    // Strip unwanted layers before MapLibre sees the style, so their icons never load.
    // Attribution comes from the style's sources automatically.
    fetch(STYLE_URL)
      .then((res) => res.json() as Promise<StyleSpecification>)
      .then((style) => ({ ...style, layers: style.layers.filter((l) => !HIDDEN_LAYER.test(l.id)) }))
      .catch(() => STYLE_URL)
      .then((style) => {
        if (!cancelled) layer = L.maplibreGL({ style }).addTo(map)
      })

    return () => {
      cancelled = true
      layer?.remove()
    }
  }, [map])

  return (
    <Polygon
      positions={[MASK_OUTER, ...NUS_CAMPUS_RINGS]}
      interactive={false}
      pathOptions={{ stroke: false, fillColor: '#d4d4d4', fillOpacity: 0.85 }}
    />
  )
}
