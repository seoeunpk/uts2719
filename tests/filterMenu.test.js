import test from 'node:test'
import assert from 'node:assert/strict'
import { mockCanteens, mockMenuItems } from '../src/data/mock/mockMenu.ts'
import { EMPTY_FILTERS, formatPrice } from '../src/lib/constants.ts'
import { buildFilterOptions } from '../src/data/catalogue.ts'
import { filterMenuItems } from '../src/lib/filterMenu.ts'
import { summariseByCanteen } from '../src/lib/summarise.ts'
import { parseMenuCsv } from '../src/lib/menu.js'

const options = buildFilterOptions(mockCanteens, mockMenuItems)
const apply = (patch = {}, items = mockMenuItems) => filterMenuItems(items, { ...EMPTY_FILTERS, ...patch }, options)
const ids = (items) => items.map((item) => item.id)

test('UI adapter preserves all item objects and their order with no filters', () => {
  const before = structuredClone(mockMenuItems)
  const results = apply()
  assert.deepEqual(results, mockMenuItems)
  results.forEach((item, index) => assert.equal(item, mockMenuItems[index]))
  assert.deepEqual(mockMenuItems, before)
})

test('UI search uses dish names, stall names and human-readable canteen names', () => {
  assert.deepEqual(ids(apply({ query: '  DECK   rice ' })), ['m1'])
  assert.deepEqual(ids(apply({ query: 'mock korean' })), ['m9', 'm10'])
  assert.deepEqual(ids(apply({ query: 'does not exist' })), [])
})

test('UI canteen IDs, cuisine, budget and all dietary tags combine', () => {
  assert.deepEqual(ids(apply({
    canteenId: 'techno-edge', cuisines: ['Indian', 'Western'], priceRange: { min: 0, max: 3.99 }, dietary: ['halal', 'vegetarian'],
  })), ['m5'])
  assert.deepEqual(ids(apply({ canteenId: 'unknown' })), [])
  assert.deepEqual(ids(apply({ canteenId: 'the-deck', cuisines: ['Indian'] })), [])
})

test('UI dietary filters preserve no-pork/no-lard without treating it as halal', () => {
  assert.deepEqual(ids(apply({ dietary: ['no-pork-no-lard'] })), ['m4', 'm11', 'm15'])
  assert.deepEqual(ids(apply({ dietary: ['no-pork-no-lard', 'halal'] })), [])
  const csv = 'id,name,price,canteen,stall,dietary_tags\nexample,Example Dish,4.00,Example Canteen,Example Stall,no-pork-no-lard'
  assert.deepEqual(parseMenuCsv(csv)[0].dietary_tags, ['no-pork-no-lard'])
})

test('UI price slider uses inclusive bounds, zero and decimal prices', () => {
  const prices = [0, 3.99, 4, 6, 6.01, 8, 8.01, 12]
  const items = prices.map((price, index) => ({ ...mockMenuItems[0], id: `boundary-${index}`, price }))
  assert.deepEqual(apply({ priceRange: { min: 0, max: 3.99 } }, items).map((item) => item.price), [0, 3.99])
  assert.deepEqual(apply({ priceRange: { min: 4, max: 6 } }, items).map((item) => item.price), [4, 6])
  assert.deepEqual(apply({ priceRange: { min: 6.01, max: 8 } }, items).map((item) => item.price), [6.01, 8])
  assert.deepEqual(apply({ priceRange: { min: 8.01, max: 12 } }, items).map((item) => item.price), [8.01, 12])
  assert.throws(() => apply({ priceRange: { min: 5, max: 3 } }, items), RangeError)
})

test('unknown prices remain visible without a price filter and never become a free map price', () => {
  const items = [{ ...mockMenuItems[0], price: null }]
  assert.equal(apply({}, items).length, 1)
  assert.equal(apply({ priceRange: { min: 0, max: 10 } }, items).length, 0)
  assert.equal(summariseByCanteen(mockCanteens, items)[0].minPrice, null)
  assert.equal(formatPrice(null), 'Price unavailable')
})

test('map summaries and result counts reflect the filtered set', () => {
  const results = apply({ query: 'rice' })
  const summaries = summariseByCanteen(mockCanteens, results)
  assert.equal(summaries.length, mockCanteens.length)
  assert.equal(summaries.reduce((count, summary) => count + summary.items.length, 0), results.length)
  assert.equal(summaries.find((summary) => summary.canteen.id === 'the-deck').minPrice, 4)
  assert.equal(summaries.find((summary) => summary.canteen.id === 'frontier').minPrice, null)
  assert.ok(summariseByCanteen(mockCanteens, apply({ query: 'no results' })).every((summary) => !summary.items.length && summary.minPrice === null))
})
