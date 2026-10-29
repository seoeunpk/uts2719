import type { MenuFacets, MenuFilters, MenuItem } from "../lib/menu.js";

export interface MenuState {
  items: readonly MenuItem[];
  results: readonly MenuItem[];
  loading: boolean;
  error: Error | null;
  filterError: Error | null;
  facets: MenuFacets;
  totalCount: number;
  matchCount: number;
}
export function useMenu(urls: string | URL | (string | URL)[], filters?: MenuFilters): MenuState;
