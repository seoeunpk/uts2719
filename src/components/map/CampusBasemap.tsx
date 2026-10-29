import L from 'leaflet'
import '@maplibre/maplibre-gl-leaflet'
import { setWorkerUrl, type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { NUS_CAMPUS_RINGS } from '../../data/nusCampus'
import { NUS_MAX_BOUNDS } from '../../lib/constants'

// MapLibre locates its worker relative to its own file, which breaks once Vite bundles it.
setWorkerUrl(maplibreWorkerUrl)

/** Free, key-less full-colour vector style (https://openfreemap.org). */
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'

/** Style layers removed to keep the campus map uncluttered. */
const HIDDEN_LAYER =
  /^(label_|boundary_|poi_|highway-shield|road_shield|road_one_way|airport|highway-name-path|water_name|waterway_line_label|building-3d|natural_earth)/

type Ring = [number, number][]

/** Twice the signed area of a [lng, lat] ring; positive = counter-clockwise. */
function signedArea(ring: Ring): number {
  let sum = 0
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[(i + 1) % ring.length]
    sum += x1 * y2 - x2 * y1
  }
  return sum
}

/** GeoJSON ring: [lng, lat], closed, with the requested winding. */
function toGeoJsonRing(latLngs: [number, number][], counterClockwise: boolean): Ring {
  const ring: Ring = latLngs.map(([lat, lng]) => [lng, lat])
  const [first, last] = [ring[0], ring[ring.length - 1]]
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push(first)
  return signedArea(ring) > 0 === counterClockwise ? ring : ring.reverse()
}

// Grey cover over everything except campus, which shows through as holes.
// Keep in sync with the .leaflet-container background in index.css.
const [[south, west], [north, east]] = NUS_MAX_BOUNDS
const MASK_OUTER: [number, number][] = [
  [south - 0.05, west - 0.05],
  [north + 0.05, west - 0.05],
  [north + 0.05, east + 0.05],
  [south - 0.05, east + 0.05],
]
const OUTSIDE_CAMPUS: GeoJSON.Polygon = {
  type: 'Polygon',
  coordinates: [toGeoJsonRing(MASK_OUTER, true), ...NUS_CAMPUS_RINGS.map((ring) => toGeoJsonRing(ring, false))],
}

/** Drops cluttering layers and adds the grey outside-campus cover on top. */
function prepareStyle(style: StyleSpecification): StyleSpecification {
  return {
    ...style,
    sources: { ...style.sources, 'outside-campus': { type: 'geojson', data: OUTSIDE_CAMPUS } },
    layers: [
      ...style.layers.filter((l) => !HIDDEN_LAYER.test(l.id)),
      // Drawn by MapLibre (not Leaflet) so it stays in sync while panning and zooming.
      {
        id: 'outside-campus',
        type: 'fill',
        source: 'outside-campus',
        paint: { 'fill-color': '#d4d4d4', 'fill-opacity': 0.85 },
      },
    ],
  }
}

/** Colourful vector basemap with everything outside NUS greyed out. */
export function CampusBasemap() {
  const map = useMap()

  useEffect(() => {
    let layer: L.MaplibreGL | undefined
    let cancelled = false

    // Edit the style before MapLibre sees it, so removed layers' icons never load.
    // Attribution comes from the style's sources automatically.
    fetch(STYLE_URL)
      .then((res) => res.json() as Promise<StyleSpecification>)
      .then(prepareStyle)
      .catch(() => STYLE_URL)
      .then((style) => {
        // Render 50% beyond the viewport (plugin default 10%) so zooming out doesn't reveal
        // blank edges mid-animation. `padding` is supported but missing from the plugin's types.
        const options = { style, padding: 0.5 } as L.LeafletMaplibreGLOptions
        if (!cancelled) layer = L.maplibreGL(options).addTo(map)
      })

    return () => {
      cancelled = true
      layer?.remove()
    }
  }, [map])

  return null
}
