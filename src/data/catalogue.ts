import { loadMenuCsv, MenuDataError } from '../lib/menu.js'
import type { MenuItem as CsvMenuItem } from '../lib/menu.js'
import type { Canteen, FilterOptions, MenuItem } from '../types/menu'

export interface MenuCatalogue {
  canteens: Canteen[]
  menuItems: MenuItem[]
  filterOptions: FilterOptions
  isPreview: boolean
}

export interface CatalogueConfig {
  source: string
  baseUrl: string
  csvFiles?: string
  canteensUrl?: string
}

const normalise = (value: string) => value.trim().toLocaleLowerCase('en')

/** Resolve public assets under Vite's base path without allowing executable URLs. */
export function publicAssetUrl(value: string, baseUrl: string): string {
  const origin = 'https://menu-assets.invalid'
  const url = new URL(value, new URL(baseUrl, origin))
  if (!['https:', 'http:'].includes(url.protocol)) throw new MenuDataError('Unsupported public asset URL.')
  return url.origin === origin ? `${url.pathname}${url.search}${url.hash}` : url.href
}

export function validateCanteens(value: unknown): Canteen[] {
  if (!Array.isArray(value)) throw new MenuDataError('Canteen metadata must be an array.')
  const ids = new Set<string>()
  return value.map((record, index) => {
    const validText = (text: unknown): text is string => typeof text === 'string' && text.trim().length > 0
    if (!record || !validText(record.id) || !validText(record.name)
      || !Number.isFinite(record.coordinates?.lat) || Math.abs(record.coordinates.lat) > 90
      || !Number.isFinite(record.coordinates?.lng) || Math.abs(record.coordinates.lng) > 180
      || (record.location != null && typeof record.location !== 'string')
      || (record.openingHours != null && typeof record.openingHours !== 'string')) {
      throw new MenuDataError(`Invalid canteen metadata at record ${index + 1}.`)
    }
    const id = record.id.trim()
    if (ids.has(id)) throw new MenuDataError(`Duplicate canteen ID: ${id}.`)
    ids.add(id)
    return { id, name: record.name.trim(), location: record.location?.trim() ?? '',
      coordinates: { lat: record.coordinates.lat, lng: record.coordinates.lng },
      ...(record.openingHours ? { openingHours: record.openingHours.trim() } : {}) }
  })
}

/** Preserve unknown prices/cuisines and require an unambiguous map location. */
export function mapCsvMenu(records: CsvMenuItem[], canteens: Canteen[], baseUrl: string): MenuItem[] {
  return records.map((record) => {
    const exactId = canteens.find((canteen) => canteen.id === record.canteen)
    const matches = exactId ? [exactId] : canteens.filter((canteen) => normalise(canteen.name) === normalise(record.canteen))
    if (matches.length !== 1) throw new MenuDataError(`Item ${record.id} has an unknown or ambiguous canteen: ${record.canteen}.`)
    return { id: record.id, name: record.name, price: record.price, canteenId: matches[0].id,
      stallName: record.stall, cuisine: record.cuisine, dietary: [...record.dietary_tags],
      ...(record.image ? { imageUrl: publicAssetUrl(record.image, baseUrl) } : {}) }
  })
}

export function buildFilterOptions(canteens: Canteen[], items: MenuItem[]): FilterOptions {
  const prices = items.flatMap((item) => item.price === null ? [] : [item.price])
  return {
    canteens,
    cuisines: [...new Set(items.flatMap((item) => item.cuisine ? [item.cuisine] : []))].sort(),
    dietary: [...new Set(items.flatMap((item) => item.dietary))].sort(),
    priceBounds: {
      min: prices.length ? Math.floor(prices.reduce((a, b) => Math.min(a, b))) : 0,
      max: prices.length ? Math.ceil(prices.reduce((a, b) => Math.max(a, b))) : 0,
    },
  }
}

/** CSV mode never silently falls back to fictional records after an error. */
export async function loadCatalogue(config: CatalogueConfig, preview: MenuCatalogue,
  { signal, fetchImpl = globalThis.fetch }: { signal?: AbortSignal; fetchImpl?: typeof fetch } = {}): Promise<MenuCatalogue> {
  if (config.source === 'preview') return preview
  if (config.source !== 'csv') throw new MenuDataError('Menu source must be preview or csv.')
  const files: unknown = config.csvFiles ? JSON.parse(config.csvFiles) : ['data/menu.csv']
  if (!Array.isArray(files) || !files.length || files.some((file) => typeof file !== 'string' || !file.trim())) {
    throw new MenuDataError('CSV files must be a non-empty array of public URLs.')
  }
  const [records, canteenResponse] = await Promise.all([
    loadMenuCsv(files.map((file: string) => publicAssetUrl(file, config.baseUrl)), { signal, fetchImpl }),
    fetchImpl(publicAssetUrl(config.canteensUrl ?? 'data/canteens.json', config.baseUrl), { signal }),
  ])
  if (!canteenResponse.ok) throw new MenuDataError(`Could not load canteen metadata: HTTP ${canteenResponse.status}.`)
  const canteens = validateCanteens(await canteenResponse.json())
  const menuItems = mapCsvMenu(records, canteens, config.baseUrl)
  return { canteens, menuItems, filterOptions: buildFilterOptions(canteens, menuItems), isPreview: false }
}
