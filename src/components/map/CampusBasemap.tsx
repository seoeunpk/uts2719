import L from 'leaflet'
import '@maplibre/maplibre-gl-leaflet'
import { setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { useEffect } from 'react'
import { Polygon, useMap } from 'react-leaflet'
import { NUS_CAMPUS_RINGS } from '../../data/nusCampus'
import { NUS_MAX_BOUNDS } from '../../lib/constants'
import { CAMPUS_STYLE, MAP_COLORS, TREE_ICON, drawTreeIcon } from './campusStyle'

// MapLibre locates its worker relative to its own file, which breaks once Vite bundles it.
setWorkerUrl(maplibreWorkerUrl)

// Mask = everything inside the map bounds except the campus, which shows through as holes.
const [[south, west], [north, east]] = NUS_MAX_BOUNDS
const MASK_OUTER: [number, number][] = [
  [south - 0.05, west - 0.05],
  [north + 0.05, west - 0.05],
  [north + 0.05, east + 0.05],
  [south - 0.05, east + 0.05],
]

/** Illustrated-style vector basemap; everything outside NUS is blanked to cream. */
export function CampusBasemap() {
  const map = useMap()

  useEffect(() => {
    // Attribution comes from the style's sources automatically.
    const layer = L.maplibreGL({ style: CAMPUS_STYLE }).addTo(map)
    const gl = layer.getMaplibreMap()
    gl.setMissingStyleImageResolver((id) => {
      if (id === TREE_ICON && !gl.hasImage(TREE_ICON)) gl.addImage(TREE_ICON, drawTreeIcon(), { pixelRatio: 2 })
    })
    return () => {
      layer.remove()
    }
  }, [map])

  return (
    <Polygon
      positions={[MASK_OUTER, ...NUS_CAMPUS_RINGS]}
      interactive={false}
      pathOptions={{ stroke: false, fillColor: MAP_COLORS.cream, fillOpacity: 1 }}
    />
  )
}
