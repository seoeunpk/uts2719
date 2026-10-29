import test from 'node:test'
import assert from 'node:assert/strict'
import { mockCanteens, mockMenuItems } from '../src/data/mock/mockMenu.ts'
import { EMPTY_FILTERS, PRICE_RANGES, ALL_DIETARY_TAGS } from '../src/lib/constants.ts'
import { filterMenuItems } from '../src/lib/filterMenu.ts'
import { summariseByCanteen } from '../src/lib/summarise.ts'
import { parseMenuCsv } from '../src/lib/menu.js'

const options = {
  canteens: mockCanteens,
  cuisines: [...new Set(mockMenuItems.map((item) => item.cuisine))],
  dietary: ALL_DIETARY_TAGS,
  priceRanges: PRICE_RANGES,
}
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
    canteenId: 'techno-edge', cuisines: ['Indian', 'Western'], priceRangeId: 'under-4', dietary: ['halal', 'vegetarian'],
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

test('UI price buckets include their boundaries and the open-ended upper bucket', () => {
  const prices = [0, 3.99, 4, 6, 6.01, 8, 8.01, 12]
  const items = prices.map((price, index) => ({ ...mockMenuItems[0], id: `boundary-${index}`, price }))
  assert.deepEqual(apply({ priceRangeId: 'under-4' }, items).map((item) => item.price), [0, 3.99])
  assert.deepEqual(apply({ priceRangeId: '4-6' }, items).map((item) => item.price), [4, 6])
  assert.deepEqual(apply({ priceRangeId: '6-8' }, items).map((item) => item.price), [6.01, 8])
  assert.deepEqual(apply({ priceRangeId: 'over-8' }, items).map((item) => item.price), [8.01, 12])
  assert.deepEqual(apply({ priceRangeId: 'removed-preset' }, items), [])
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
