import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import React, { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { JSDOM } from 'jsdom'
import { buildFilterOptions } from '../src/data/catalogue.ts'
import { useMenuCatalogue } from '../src/hooks/useMenuCatalogue.ts'
import { useMenuFilters } from '../src/hooks/useMenuFilters.ts'
import { getStallId } from '../src/lib/stalls.ts'

const csv = await readFile(new URL('./fixtures/example-menu.csv', import.meta.url), 'utf8')
const locations = JSON.parse(await readFile(new URL('./fixtures/example-canteens.json', import.meta.url), 'utf8'))
const config = { source: 'csv', baseUrl: '/' }
const preview = { canteens: [], menuItems: [], filterOptions: buildFilterOptions([], []), isPreview: true }
const ok = (text = csv) => ({ ok: true, text: async () => text })
const metadata = () => ({ ok: true, json: async () => locations })
const flush = () => new Promise((resolve) => setImmediate(resolve))

test('interface catalogue lifecycle and recovery', async (suite) => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>')
  const previous = { window: globalThis.window, document: globalThis.document, fetch: globalThis.fetch,
    act: globalThis.IS_REACT_ACT_ENVIRONMENT }
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  let state
  let filterState
  let root
  function Probe({ source = config }) {
    const catalogue = useMenuCatalogue(source, preview)
    const filters = useMenuFilters()
    useEffect(() => { state = catalogue; filterState = filters }, [catalogue, filters])
    return React.createElement('p', null, catalogue.loading ? 'Loading' : String(catalogue.menuItems.length))
  }
  const render = async (source = config) => {
    if (!root) root = createRoot(document.getElementById('root'))
    await act(async () => { root.render(React.createElement(Probe, { source })); await flush() })
  }
  const reset = async () => { if (root) await act(async () => root.unmount()); root = null }
  try {
    await suite.test('shows explicit preview without fetching', async () => {
      globalThis.fetch = () => { throw new Error('Preview must not fetch') }
      await render({ ...config, source: 'preview' })
      assert.equal(state.loading, false)
      assert.equal(state.isPreview, true)
      await reset()
    })
    await suite.test('loading clears old records; equivalent config and filter changes do not refetch', async () => {
      let completeCsv
      let requests = 0
      globalThis.fetch = async (url) => {
        requests++
        return url.endsWith('.json') ? metadata() : new Promise((resolve) => { completeCsv = resolve })
      }
      await render()
      assert.equal(state.loading, true)
      assert.equal(state.menuItems.length, 0)
      await act(async () => { completeCsv(ok()); await flush() })
      assert.equal(state.loading, false)
      assert.equal(state.menuItems.length, 6)
      assert.equal(state.filterOptions.priceBounds.max, 6)
      await render({ ...config })
      await act(async () => { filterState.updateFilters({ query: 'rice' }); await flush() })
      assert.equal(requests, 2)
      await reset()
    })
    await suite.test('failed loads expose an error and retry recovers without preview fallback', async () => {
      globalThis.fetch = async (url) => url.endsWith('.json') ? metadata() : { ok: false, status: 503 }
      await render()
      assert.equal(state.loading, false)
      assert.match(state.error.message, /HTTP 503/)
      assert.equal(state.isPreview, false)
      assert.equal(state.menuItems.length, 0)
      globalThis.fetch = async (url) => url.endsWith('.json') ? metadata() : ok()
      await act(async () => { state.retry(); await flush() })
      assert.equal(state.error, null)
      assert.equal(state.menuItems.length, 6)
      await reset()
    })
    await suite.test('switching CSVs aborts and ignores an obsolete response', async () => {
      let completeOld
      let oldSignal
      globalThis.fetch = async (url, { signal }) => {
        if (url.endsWith('.json')) return metadata()
        if (url.endsWith('old.csv')) {
          oldSignal = signal
          return new Promise((resolve) => { completeOld = resolve })
        }
        return ok(csv.replaceAll('example-', 'new-'))
      }
      await render({ ...config, csvFiles: '["old.csv"]' })
      await render({ ...config, csvFiles: '["new.csv"]' })
      assert.equal(oldSignal.aborted, true)
      assert.ok(state.menuItems.every((item) => item.id.startsWith('new-')))
      await act(async () => { completeOld(ok()); await flush() })
      assert.ok(state.menuItems.every((item) => item.id.startsWith('new-')))
      await reset()
    })
    await suite.test('a header-only CSV is a loaded empty menu rather than an error', async () => {
      globalThis.fetch = async (url) => url.endsWith('.json') ? metadata() : ok(csv.split('\n')[0])
      await render()
      assert.equal(state.loading, false)
      assert.equal(state.error, null)
      assert.equal(state.menuItems.length, 0)
      assert.equal(state.isPreview, false)
      await reset()
    })
    await suite.test('changing canteens clears a stale stall and the active count includes stall selection', async () => {
      await render({ ...config, source: 'preview' })
      await act(async () => { filterState.updateFilters({ canteenId: 'north', stallId: getStallId('north', 'Rice') }) })
      assert.equal(filterState.activeFilterCount, 2)
      await act(async () => { filterState.updateFilters({ canteenId: 'south' }) })
      assert.equal(filterState.filters.stallId, null)
      assert.equal(filterState.activeFilterCount, 1)
      await act(async () => { filterState.updateFilters({ stallId: getStallId('south', 'Rice') }) })
      await act(async () => { filterState.updateFilters({ canteenId: 'south' }) })
      assert.equal(filterState.filters.stallId, getStallId('south', 'Rice'))
      await act(async () => { filterState.updateFilters({ canteenId: null }) })
      assert.equal(filterState.filters.stallId, null)
      await reset()
    })
    await suite.test('filter-panel reset preserves search, while empty-results recovery clears everything', async () => {
      await render({ ...config, source: 'preview' })
      await act(async () => { filterState.updateFilters({ query: 'missing', canteenId: 'north', stallId: getStallId('north', 'Rice'), priceRange: { min: 1, max: 3 } }) })
      await act(async () => { filterState.resetFilters() })
      assert.equal(filterState.filters.query, 'missing')
      assert.equal(filterState.filters.priceRange, null)
      assert.equal(filterState.filters.stallId, null)
      await act(async () => { filterState.clearAllFilters() })
      assert.equal(filterState.filters.query, '')
      assert.equal(filterState.activeFilterCount, 0)
      await reset()
    })
  } finally {
    await reset()
    dom.window.close()
    globalThis.window = previous.window
    globalThis.document = previous.document
    globalThis.fetch = previous.fetch
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act
  }
})
