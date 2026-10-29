import test from 'node:test'
import assert from 'node:assert/strict'
import { getStallId, getStallOptions } from '../src/lib/stalls.ts'
import { buildFilterOptions } from '../src/data/catalogue.ts'
import { filterMenuItems } from '../src/lib/filterMenu.ts'
import { EMPTY_FILTERS } from '../src/lib/constants.ts'

const canteens = [
  { id: 'north', name: 'Example North', location: '', coordinates: { lat: 1.3, lng: 103.77 } },
  { id: 'south', name: 'Example South', location: '', coordinates: { lat: 1.29, lng: 103.78 } },
]
const base = { name: 'Rice dish', price: 3, stallName: 'Same Stall', canteenId: 'north', cuisine: 'Chinese', dietary: ['halal'] }
const items = [
  { ...base, id: 'north-rice' },
  { ...base, id: 'north-veg', name: 'Veg dish', price: 6, stallName: ' same STALL ' },
  { ...base, id: 'south-rice', canteenId: 'south' },
  { ...base, id: 'north-other', stallName: 'Other Stall' },
]
const options = buildFilterOptions(canteens, items)
const apply = (patch) => filterMenuItems(items, { ...EMPTY_FILTERS, ...patch }, options)

test('stall options deduplicate case/whitespace within a canteen and distinguish equal names elsewhere', () => {
  const stalls = getStallOptions(items)
  assert.equal(stalls.length, 3)
  assert.equal(stalls.filter((stall) => stall.canteenId === 'north').length, 2)
  assert.notEqual(getStallId('north', 'Same Stall'), getStallId('south', 'Same Stall'))
  assert.equal(getStallId('north', 'Same Stall'), getStallId('north', ' same STALL '))
})

test('a stall selection matches only that canteen and preserves original records/order', () => {
  const result = apply({ stallId: getStallId('north', 'Same Stall') })
  assert.deepEqual(result.map((item) => item.id), ['north-rice', 'north-veg'])
  assert.equal(result[0], items[0])
  assert.equal(result[1], items[1])
  assert.deepEqual(apply({ canteenId: 'south', stallId: getStallId('north', 'Same Stall') }), [])
  assert.deepEqual(apply({ stallId: 'unknown-stall' }), [])
})

test('stall selection combines with search, cuisine, dietary and inclusive price filters', () => {
  const result = apply({ stallId: getStallId('north', 'Same Stall'), query: 'rice', cuisines: ['Chinese'],
    dietary: ['halal'], priceRange: { min: 3, max: 3 } })
  assert.deepEqual(result.map((item) => item.id), ['north-rice'])
})

test('stall IDs cannot collide when names or canteen IDs contain separators and quotes', () => {
  assert.notEqual(getStallId('a|b', 'c'), getStallId('a', 'b|c'))
  assert.deepEqual(JSON.parse(getStallId('north', 'Stall "A", Rice')), ['north', 'stall "a", rice'])
  assert.deepEqual(getStallOptions([]), [])
})
