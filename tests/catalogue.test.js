import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { buildFilterOptions, loadCatalogue, mapCsvMenu, publicAssetUrl, validateCanteens } from '../src/data/catalogue.ts'
import { parseMenuCsv, MenuDataError } from '../src/lib/menu.js'

const csv = await readFile(new URL('./fixtures/example-menu.csv', import.meta.url), 'utf8')
const records = parseMenuCsv(csv)
export const locations = [
  { id: 'north', name: 'Example North', coordinates: { lat: 1.3, lng: 103.77 }, location: 'Fictional test area' },
  { id: 'south', name: 'Example South', coordinates: { lat: 1.29, lng: 103.78 }, location: 'Fictional test area' },
]
const preview = { canteens: [], menuItems: [], filterOptions: buildFilterOptions([], []), isPreview: true }
const config = { source: 'csv', baseUrl: '/uts2719/' }
const response = (text) => ({ ok: true, text: async () => text })

test('CSV fields map to UI cards while preserving missing data and source order', () => {
  const items = mapCsvMenu(records, locations, '/uts2719/')
  assert.deepEqual(items.map((item) => item.id), records.map((item) => item.id))
  assert.equal(items[0].canteenId, 'north')
  assert.equal(items[0].stallName, 'Example Rice')
  assert.equal(items[3].price, null)
  assert.equal(items[4].price, 0)
  const missing = mapCsvMenu([{ ...records[0], cuisine: null, dietary_tags: [] }], locations, '/')[0]
  assert.equal(missing.cuisine, null)
  assert.deepEqual(missing.dietary, [])
})

test('canteens match exact IDs or normalised names; missing and ambiguous locations fail', () => {
  assert.equal(mapCsvMenu([{ ...records[0], canteen: 'north' }], locations, '/')[0].canteenId, 'north')
  assert.equal(mapCsvMenu([{ ...records[0], canteen: ' example NORTH ' }], locations, '/')[0].canteenId, 'north')
  assert.throws(() => mapCsvMenu(records, [], '/'), /unknown or ambiguous/)
  assert.throws(() => mapCsvMenu([records[0]], [locations[0], { ...locations[0], id: 'duplicate-name' }], '/'), /ambiguous/)
})

test('canteen metadata requires unique IDs and finite coordinates', () => {
  assert.equal(validateCanteens(locations).length, 2)
  assert.deepEqual(validateCanteens([]), [])
  for (const invalid of [{}, [null], [{ ...locations[0], coordinates: { lat: 100, lng: 103 } }],
    [{ ...locations[0], coordinates: { lat: 1, lng: NaN } }], [locations[0], locations[0]]]) {
    assert.throws(() => validateCanteens(invalid), MenuDataError)
  }
})

test('images and data URLs respect the deployment base and reject executable protocols', () => {
  assert.equal(publicAssetUrl('data/menu.csv', '/uts2719/'), '/uts2719/data/menu.csv')
  assert.equal(publicAssetUrl('images/dish.jpg', '/uts2719/'), '/uts2719/images/dish.jpg')
  assert.equal(publicAssetUrl('https://example.com/dish.jpg', '/uts2719/'), 'https://example.com/dish.jpg')
  assert.equal(mapCsvMenu([{ ...records[0], image: 'images/dish.jpg' }], locations, '/uts2719/')[0].imageUrl, '/uts2719/images/dish.jpg')
  assert.throws(() => publicAssetUrl('javascript:alert(1)', '/'), MenuDataError)
})

test('filter options come from loaded records and handle empty/unknown-price datasets', () => {
  const options = buildFilterOptions(locations, mapCsvMenu(records, locations, '/'))
  assert.deepEqual(options.priceBounds, { min: 0, max: 6 })
  assert.deepEqual(options.cuisines, ['Chinese', 'Drinks', 'Indian'])
  assert.deepEqual(buildFilterOptions([], []).priceBounds, { min: 0, max: 0 })
  assert.deepEqual(buildFilterOptions(locations, [{ ...mapCsvMenu(records, locations, '/')[0], price: null }]).priceBounds, { min: 0, max: 0 })
})

test('catalogue loads multiple CSVs and metadata together, with the same abort signal', async () => {
  const controller = new AbortController()
  const urls = []
  const catalogue = await loadCatalogue({ ...config, csvFiles: '["data/a.csv","data/b.csv"]' }, preview, {
    signal: controller.signal,
    fetchImpl: async (url, options) => {
      urls.push(url)
      assert.equal(options.signal, controller.signal)
      if (url.endsWith('.json')) return { ok: true, json: async () => locations }
      return response(url.endsWith('a.csv') ? csv : csv.replaceAll('example-', 'second-'))
    },
  })
  assert.equal(catalogue.menuItems.length, 12)
  assert.equal(catalogue.isPreview, false)
  assert.deepEqual(urls, ['/uts2719/data/a.csv', '/uts2719/data/b.csv', '/uts2719/data/canteens.json'])
})

test('CSV mode fails explicitly for bad files, metadata or config without using preview data', async () => {
  await assert.rejects(loadCatalogue(config, preview, { fetchImpl: async () => ({ ok: false, status: 404 }) }), /HTTP 404/)
  await assert.rejects(loadCatalogue(config, preview, { fetchImpl: async (url) => url.endsWith('.json')
    ? { ok: true, json: async () => [] } : response(csv) }), /unknown or ambiguous/)
  await assert.rejects(loadCatalogue({ ...config, csvFiles: '[]' }, preview), /non-empty/)
  await assert.rejects(loadCatalogue({ ...config, source: 'invalid' }, preview), /source/)
})

test('preview is explicit and makes no network request; header-only CSV stays empty', async () => {
  assert.equal(await loadCatalogue({ ...config, source: 'preview' }, preview, { fetchImpl: () => { throw new Error('No request expected') } }), preview)
  const empty = await loadCatalogue(config, preview, { fetchImpl: async (url) => url.endsWith('.json')
    ? { ok: true, json: async () => [] } : response(csv.split('\n')[0]) })
  assert.equal(empty.isPreview, false)
  assert.deepEqual(empty.menuItems, [])
})
