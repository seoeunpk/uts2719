# Person 2: data and functionality handoff

Target: a working app by **Sunday, 1 November 2026**. The user confirmed that Person 1 uses React + Vite and will provide the menu data later as CSV files.

The map interface and data utilities are now combined. `src/lib/filterMenu.ts` adapts the UI's existing controls to the shared search/filter logic, including its price presets, canteen IDs and four dietary tags. Result counts, menu lists and map summaries use the filtered records. The app still shows labelled preview data until the real CSVs are supplied.

## Included

- Read one or multiple UTF-8 CSVs, including quoted commas, line breaks, double quotes and Excel's UTF-8 byte-order mark.
- Reject malformed rows, missing required fields, duplicate IDs, unsupported dietary tags and invalid prices.
- Search across dish, canteen, stall, cuisine and recorded dietary tags, ignoring case and accents.
- Combine location, cuisine, budget and dietary filters; sort by name or price.
- Expose loading, empty, request-error and invalid-filter states through a React hook.
- Abort obsolete requests and ignore late responses after switching files or unmounting.
- Run data/filter/React lifecycle tests and a Vite compilation check.

## CSV format

One row represents one purchasable dish or explicitly priced variant. Use a separate stable ID for each size/variant. All prices are SGD. This is a proposed import format: when the actual CSVs arrive, map their existing columns before importing instead of guessing missing facts.

| Column | Required heading | Value |
| --- | --- | --- |
| `id` | Yes | Unique non-empty text across every file; leading zeroes are preserved |
| `name` | Yes | Verified dish name |
| `price` | Yes | Numeric amount such as `3.50`; blank means unknown |
| `canteen` | Yes | Verified canteen name |
| `stall` | Yes | Verified stall name |
| `cuisine` | No | Recorded category, or blank |
| `dietary_tags` | No | Verified `vegetarian`, `vegan`, `halal`, `no-pork-no-lard`, separated with `|`; otherwise blank |
| `image` | No | Image URL or site-relative path; otherwise blank |
| `source` | No | Source photograph/file/reference; otherwise blank |

Headings are trimmed and matched without case sensitivity. Extra columns are ignored. Text cells are trimmed. Blank optional values become `null`, except `dietary_tags`, which becomes `[]`.

Price `0` means free. Blank prices stay unknown and are excluded by active price bounds. Currency symbols, ranges, negative amounts and prices with more than two decimal places are rejected for review. Do not convert ambiguous prices without checking the source.

Dietary tags are explicit verified attributes. Blank means no verified tag is recorded. Each selected tag must appear in the row; the importer does not infer extra tags, nutrition, allergen safety or sustainability claims. If a vegan dish should appear in both filters, record both verified `vegan|vegetarian` tags.

Use consistent canteen, stall and cuisine spellings. IDs are case-sensitive. If stalls share a name across canteens, combine canteen and stall filters. Files in `public/` will be public when deployed.

## CSV-loading hook for the real-data import

The current app uses the existing data entry point and UI filter adapter. The standalone CSV-loading hook below is available when replacing preview data. Declaration files support TypeScript consumers. Map parsed CSV records to `src/types/menu.ts` and verified canteen coordinates before switching the app's data source; the CSV and UI contracts use different field names.

In an existing component, connect its control values to the hook:

```jsx
import { useMenu } from "./hooks/useMenu.js";
import { formatPrice, getMenuFacets, searchMenu } from "./lib/menu.js";

// Values below come from the existing search/filter controls.
const menu = useMenu(`${import.meta.env.BASE_URL}data/menu.csv`, {
  query,
  canteens: selectedCanteens,
  stalls: selectedStalls,
  cuisines: selectedCuisines,
  dietaryTags: selectedDietaryTags,
  maxPrice: maxPriceText === "" ? undefined : Number(maxPriceText),
  sort: "price-asc",
});

// Populate stall choices for the selected canteen(s).
const stallOptions = getMenuFacets(
  searchMenu(menu.items, { canteens: selectedCanteens }),
).stalls;

if (menu.loading) return <p>Loading menus…</p>;
if (menu.error) return <p role="alert">{menu.error.message}</p>;
if (menu.filterError) return <p role="alert">{menu.filterError.message}</p>;
if (!menu.totalCount) return <p>Menu data has not been added yet.</p>;
if (!menu.matchCount) return <p>No dishes match. Try changing the filters.</p>;

return <ul>{menu.results.map((item) => (
  <li key={item.id}>{item.name} — {formatPrice(item.price)}</li>
))}</ul>;
```

This snippet belongs inside Person 1's component and illustrates the data connection. Person 1 supplies the control state, selectors and card components. Clear selected stalls when changing canteens. Render CSV text using React text expressions, as shown. For pictures in `public/`, prepend `import.meta.env.BASE_URL` to relative image paths. Image text is preserved; the importer does not check whether the image exists.

For multiple CSVs, pass an array of URLs. Equivalent URL arrays do not reload the data. Each source loads once per source change; changing filters uses the in-memory data. Any source or validation failure rejects the complete load so an incomplete catalogue is not silently displayed.

## Filter behaviour

Empty selections mean all values. Selected canteens/stalls/cuisines use OR within a field; different fields combine with AND. All selected dietary tags must match. Every search word must appear somewhere in the searchable text.

`minPrice` and `maxPrice` are inclusive numeric bounds. Unset or `null` bounds are inactive; zero is active. Convert number-input strings before passing them. Invalid bounds become `filterError` in the hook so the UI can display a correction message.

Sort values: `name-asc` (default), `name-desc`, `price-asc`, `price-desc`. Unknown prices sort last in both price directions. Sorting returns a new array and preserves the original input order. `getMenuFacets(items)` returns the available canteens, stalls, cuisines, dietary tags and known price range. The hook's facets cover all loaded items; use the scoped example for cascading stalls.

## Before release

1. Receive the real CSVs, map their columns and review ambiguous/missing values against the menu sources.
2. Validate all intended files together. Compare source/output counts, duplicate IDs and dietary evidence.
3. Replace the preview data through `src/data/index.ts`, mapping CSV fields to the UI contract, checking canteen IDs/coordinates and handling unknown prices before removing the preview badge.
4. Test the actual interface on mobile and desktop: reset filters, changing canteens, repeated stall names, unknown prices, no results, failed loading and images.
5. Use Person 1's Vite production build, configure the agreed hosting account/base path, deploy and verify the public URL. The base-aware CSV URL supports a repository subpath.

Automated checks use fictional records. They do not verify real NUS menus, dietary claims, Person 1's final UI, mobile usability or a deployed website. The header-only production CSV intentionally fails release validation until real records are added.

Implementation references: [Papa Parse documentation](https://www.papaparse.com/docs) and [React effect cleanup](https://react.dev/reference/react/useEffect).
