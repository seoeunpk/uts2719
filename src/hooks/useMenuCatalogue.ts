import { useCallback, useEffect, useState } from 'react'
import { buildFilterOptions, loadCatalogue } from '../data/catalogue.ts'
import type { CatalogueConfig, MenuCatalogue } from '../data/catalogue'

const EMPTY_CATALOGUE: MenuCatalogue = {
  canteens: [], menuItems: [], filterOptions: buildFilterOptions([], []), isPreview: false,
}

/** One dataset feeds the controls, cards, counts and map. Retry invalidates stale results. */
export function useMenuCatalogue(config: CatalogueConfig, preview: MenuCatalogue) {
  const configKey = JSON.stringify(config)
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${configKey}:${attempt}`
  const [state, setState] = useState<{
    requestKey: string; catalogue: MenuCatalogue | null; error: Error | null
  }>(() => ({ requestKey, catalogue: config.source === 'preview' ? preview : null, error: null }))
  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    loadCatalogue(JSON.parse(configKey), preview, { signal: controller.signal }).then(
      (catalogue) => { if (active) setState({ requestKey, catalogue, error: null }) },
      (error) => { if (active) setState({ requestKey, catalogue: null, error: error instanceof Error ? error : new Error(String(error)) }) },
    )
    return () => { active = false; controller.abort() }
  }, [configKey, requestKey, preview])

  const current = state.requestKey === requestKey ? state : { catalogue: null, error: null }
  return { ...(current.catalogue ?? EMPTY_CATALOGUE), error: current.error,
    loading: current.catalogue === null && current.error === null, retry }
}
