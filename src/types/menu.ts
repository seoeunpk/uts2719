/**
 * Shared data contracts for NUS Food Finder.
 *
 * Both the UI components (Person 1) and the real dataset / filtering logic
 * (Person 2) depend on these types. Change them here, in one place, and the
 * compiler will point out every component that needs updating.
 */

export interface LatLng {
  lat: number
  lng: number
}

/** A campus food location, e.g. a canteen or food court. */
export interface Canteen {
  id: string
  name: string
  /** Short human-readable area, e.g. "Faculty of Science". */
  location: string
  /** Where the map pin goes. */
  coordinates: LatLng
  openingHours?: string
}

/** Dietary labels a dish can carry. Extend this union if the dataset has more. */
export type DietaryTag = 'halal' | 'vegetarian' | 'vegan' | 'no-pork-no-lard'

/** A single dish sold at a stall. */
export interface MenuItem {
  id: string
  name: string
  /** Price in SGD; null means the source does not provide a price. */
  price: number | null
  stallName: string
  /** Must match a `Canteen.id`. */
  canteenId: string
  /** Free-form so the real dataset can define its own cuisines. */
  cuisine: string | null
  dietary: DietaryTag[]
  /** Optional; cards fall back to a placeholder when missing or broken. */
  imageUrl?: string
  description?: string
}

/** A distinct stall within one canteen, derived from the loaded menu records. */
export interface StallOption {
  id: string
  canteenId: string
  name: string
}

/** Inclusive price range in SGD. */
export interface PriceRange {
  min: number
  max: number
}

/**
 * Everything the user has selected in the search bar, canteen navigation and
 * filter panel. An empty array / null means "no restriction".
 */
export interface MenuFilters {
  query: string
  canteenId: string | null
  /** Identifies a stall within its canteen, including when names repeat. */
  stallId: string | null
  cuisines: string[]
  dietary: DietaryTag[]
  /** Set by the price slider; `null` means any price. */
  priceRange: PriceRange | null
}

/** The choices the filter panel renders. Derived from the dataset. */
export interface FilterOptions {
  canteens: Canteen[]
  stalls: StallOption[]
  cuisines: string[]
  dietary: DietaryTag[]
  /** Slider limits, derived from the cheapest and dearest dish. */
  priceBounds: PriceRange
}

/** Signature for the search + filter implementation (Person 2). */
export type FilterMenuItems = (
  items: MenuItem[],
  filters: MenuFilters,
  options: FilterOptions,
) => MenuItem[]
