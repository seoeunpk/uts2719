/**
 * Shared data contracts for NUS Food Finder.
 *
 * Both the UI components (Person 1) and the real dataset / filtering logic
 * (Person 2) depend on these types. Change them here, in one place, and the
 * compiler will point out every component that needs updating.
 */

/** A campus food location, e.g. a canteen or food court. */
export interface Canteen {
  id: string
  name: string
  /** Short human-readable area, e.g. "Faculty of Science". */
  location: string
  openingHours?: string
}

/** Dietary labels a dish can carry. Extend this union if the dataset has more. */
export type DietaryTag = 'halal' | 'vegetarian' | 'vegan' | 'no-pork-no-lard'

/** A single dish sold at a stall. */
export interface MenuItem {
  id: string
  name: string
  /** Price in SGD, e.g. 4.5 */
  price: number
  stallName: string
  /** Must match a `Canteen.id`. */
  canteenId: string
  /** Free-form so the real dataset can define its own cuisines. */
  cuisine: string
  dietary: DietaryTag[]
  /** Optional; cards fall back to a placeholder when missing or broken. */
  imageUrl?: string
  description?: string
}

/** A preset price bucket shown in the filter panel. Bounds are inclusive. */
export interface PriceRange {
  id: string
  label: string
  min: number
  /** `null` means no upper bound. */
  max: number | null
}

/**
 * Everything the user has selected in the search bar, canteen navigation and
 * filter panel. An empty array / null means "no restriction".
 */
export interface MenuFilters {
  query: string
  canteenId: string | null
  cuisines: string[]
  dietary: DietaryTag[]
  priceRangeId: string | null
}

/** The choices the filter panel renders. Derived from the dataset. */
export interface FilterOptions {
  canteens: Canteen[]
  cuisines: string[]
  dietary: DietaryTag[]
  priceRanges: PriceRange[]
}

/** Signature for the search + filter implementation (Person 2). */
export type FilterMenuItems = (
  items: MenuItem[],
  filters: MenuFilters,
  options: FilterOptions,
) => MenuItem[]
