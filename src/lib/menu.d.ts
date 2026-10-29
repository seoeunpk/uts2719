export type DietaryTag = "vegetarian" | "vegan" | "halal" | "no-pork-no-lard";
export interface MenuItem {
  id: string;
  name: string;
  price: number | null;
  canteen: string;
  stall: string;
  cuisine: string | null;
  dietary_tags: DietaryTag[];
  image: string | null;
  source: string | null;
}
export interface MenuFilters {
  query?: string;
  canteens?: string[];
  stalls?: string[];
  cuisines?: string[];
  dietaryTags?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: "name-asc" | "name-desc" | "price-asc" | "price-desc";
}
export interface MenuFacets {
  canteens: string[];
  stalls: string[];
  cuisines: string[];
  dietaryTags: DietaryTag[];
  minPrice: number | null;
  maxPrice: number | null;
}
export interface MenuValidationIssue {
  record?: number;
  field: string;
  message: string;
}
export class MenuDataError extends Error {
  constructor(message: string, details?: MenuValidationIssue[]);
  details: MenuValidationIssue[];
}
export const DIETARY_TAGS: readonly DietaryTag[];
export function validateMenuItems(items: unknown): MenuValidationIssue[];
export function parseMenuCsv(csv: string, options?: { source?: string }): MenuItem[];
export function loadMenuCsv(urls: string | URL | (string | URL)[], options?: { signal?: AbortSignal; fetchImpl?: typeof fetch }): Promise<MenuItem[]>;
export function searchMenu(items: readonly MenuItem[], filters?: MenuFilters): MenuItem[];
export function getMenuFacets(items: readonly MenuItem[]): MenuFacets;
export function formatPrice(price: number | null): string;
