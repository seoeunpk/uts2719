import { useEffect, useMemo, useState } from "react";
import { getMenuFacets, loadMenuCsv, searchMenu } from "../lib/menu.js";

const EMPTY_ITEMS = Object.freeze([]);
const EMPTY_FILTERS = Object.freeze({});

/** Pass Vite-base-aware CSV URL(s). Changing filters never refetches the data. */
export function useMenu(urls, filters = EMPTY_FILTERS) {
  const sourceKey = JSON.stringify(Array.isArray(urls) ? urls : [urls]);
  const [state, setState] = useState({ sourceKey: null, items: EMPTY_ITEMS, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    loadMenuCsv(JSON.parse(sourceKey), { signal: controller.signal }).then(
      (items) => { if (active) setState({ sourceKey, items, loading: false, error: null }); },
      (error) => { if (active) setState({ sourceKey, items: EMPTY_ITEMS, loading: false, error }); },
    );
    return () => { active = false; controller.abort(); };
  }, [sourceKey]);

  // Hide previous-source results immediately, including before its effect cleans up.
  const current = state.sourceKey === sourceKey ? state : { items: EMPTY_ITEMS, loading: true, error: null };
  const facets = useMemo(() => getMenuFacets(current.items), [current.items]);
  const filtered = useMemo(() => {
    try { return { results: searchMenu(current.items, filters), filterError: null }; }
    catch (filterError) { return { results: EMPTY_ITEMS, filterError }; }
  }, [current.items, filters]);

  return { items: current.items, loading: current.loading, error: current.error, ...filtered, facets, totalCount: current.items.length, matchCount: filtered.results.length };
}
