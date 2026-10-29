import L from 'leaflet'
import '@maplibre/maplibre-gl-leaflet'
import { setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { useEffect } from 'react'
import { Polygon, useMap } from 'react-leaflet'
import { NUS_CAMPUS_RINGS } from '../../data/nusCampus'
import { NUS_MAX_BOUNDS } from '../../lib/constants'

// MapLibre locates its worker relative to its own file, which breaks once Vite bundles it.
setWorkerUrl(maplibreWorkerUrl)

/** Free, key-less minimal vector style (https://openfreemap.org). */
const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'

/** Style layers removed to keep the campus map uncluttered. */
const HIDDEN_LAYER = /^(label_|boundary_|highway-shield|road_shield|airport|highway-name-path|water_name|waterway_line_label)/

// Mask = everything inside the map bounds except the campus, which shows through as holes.
const [[south, west], [north, east]] = NUS_MAX_BOUNDS
const MASK_OUTER: [number, number][] = [
  [south - 0.05, west - 0.05],
  [north + 0.05, west - 0.05],
  [north + 0.05, east + 0.05],
  [south - 0.05, east + 0.05],
]

/** Minimal vector basemap with everything outside NUS faded out. */
export function CampusBasemap() {
  const map = useMap()

  useEffect(() => {
    // Attribution comes from the style's sources automatically.
    const layer = L.maplibreGL({ style: STYLE_URL }).addTo(map)
    const gl = layer.getMaplibreMap()
    const simplify = () => {
      for (const { id } of gl.getStyle().layers) {
        if (HIDDEN_LAYER.test(id)) gl.removeLayer(id)
      }
    }
    gl.once('load', simplify)
    return () => {
      layer.remove()
    }
  }, [map])

  return (
    <>
      <Polygon
        positions={[MASK_OUTER, ...NUS_CAMPUS_RINGS]}
        interactive={false}
        pathOptions={{ stroke: false, fillColor: '#f1f5f9', fillOpacity: 0.82 }}
      />
      <Polygon
        positions={NUS_CAMPUS_RINGS}
        interactive={false}
        pathOptions={{ color: '#003d7c', weight: 1.5, opacity: 0.35, fill: false }}
      />
    </>
  )
}
