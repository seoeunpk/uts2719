import type { ExpressionSpecification, LayerSpecification, StyleSpecification } from 'maplibre-gl'

/** Flat "illustrated neighbourhood map" palette. Mirrored as CSS vars in index.css. */
export const MAP_COLORS = {
  cream: '#f2eadc',
  sage: '#a6bcbc',
  sageDark: '#97afaf',
  green: '#9db8a9',
  water: '#8fb2bf',
  canopy: '#c39049',
  trunk: '#8a6a3d',
}

const notTunnel: ExpressionSpecification = ['!=', ['get', 'brunnel'], 'tunnel']

function roadClass(...classes: string[]): ExpressionSpecification {
  return ['all', notTunnel, ['match', ['get', 'class'], classes, true, false]]
}

function roadWidth(atZ14: number, atZ18: number): ExpressionSpecification {
  return ['interpolate', ['exponential', 1.6], ['zoom'], 14, atZ14, 18, atZ18]
}

function road(id: string, filter: ExpressionSpecification, width: ExpressionSpecification, minzoom = 0): LayerSpecification {
  return {
    id,
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'transportation',
    minzoom,
    filter,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': MAP_COLORS.cream, 'line-width': width },
  }
}

function trees(id: string, sourceLayer: string, filter?: ExpressionSpecification): LayerSpecification {
  return {
    id,
    type: 'symbol',
    source: 'openmaptiles',
    'source-layer': sourceLayer,
    minzoom: 15,
    ...(filter && { filter }),
    layout: {
      'icon-image': TREE_ICON,
      'icon-anchor': 'bottom',
      'icon-size': ['interpolate', ['linear'], ['zoom'], 15, 0.8, 18, 1.3],
      'icon-padding': 14,
      'symbol-spacing': 120,
    },
  }
}

export const TREE_ICON = 'tree'

/**
 * Minimal campus style on OpenFreeMap's free vector tiles: sage blocks,
 * cream roads, no labels, and decorative trees in green spaces.
 */
export const CAMPUS_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
      attribution:
        '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    },
  },
  layers: [
    { id: 'blocks', type: 'background', paint: { 'background-color': MAP_COLORS.sage } },
    {
      id: 'greenery',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['match', ['get', 'class'], ['wood', 'grass', 'farmland'], true, false],
      paint: { 'fill-color': MAP_COLORS.green, 'fill-opacity': 0.55 },
    },
    {
      id: 'parks',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'park',
      paint: { 'fill-color': MAP_COLORS.green, 'fill-opacity': 0.55 },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: { 'fill-color': MAP_COLORS.water },
    },
    {
      id: 'buildings',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      minzoom: 16,
      paint: {
        'fill-color': MAP_COLORS.sageDark,
        'fill-opacity': ['interpolate', ['linear'], ['zoom'], 16, 0, 17.5, 0.7],
      },
    },
    // Only proper roads, drawn wide: footpaths and service lanes would clutter the flat look.
    road('roads-minor', roadClass('minor'), roadWidth(1.2, 9)),
    road('roads-major', roadClass('primary', 'secondary', 'tertiary'), roadWidth(3, 22)),
    road('roads-motorway', roadClass('motorway', 'trunk'), roadWidth(4, 26)),
    trees('trees-parks', 'park'),
    trees('trees-wood', 'landcover', ['==', ['get', 'class'], 'wood']),
  ],
}

/** Draws the flat tree icon (canopy + trunk) used on green spaces. */
export function drawTreeIcon(): ImageData {
  const w = 40
  const h = 64
  const ctx = document.createElement('canvas').getContext('2d')!
  ctx.canvas.width = w
  ctx.canvas.height = h
  ctx.fillStyle = MAP_COLORS.trunk
  ctx.fillRect(w / 2 - 2.5, 38, 5, 24)
  ctx.fillStyle = MAP_COLORS.canopy
  ctx.beginPath()
  ctx.ellipse(w / 2, 24, 14, 22, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgb(255 255 255 / 0.55)'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(w / 2, 12)
  ctx.lineTo(w / 2, 34)
  ctx.stroke()
  return ctx.getImageData(0, 0, w, h)
}
