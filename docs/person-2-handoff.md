# Person 2: data and functionality handoff

Target: a working app by **Sunday, 1 November 2026**. The user confirmed that Person 1 uses React + Vite and will provide the menu data later as CSV files.

The map interface and data utilities are now combined. `src/lib/filterMenu.ts` adapts the UI's existing controls to the shared search/filter logic, including its price slider, canteen IDs and four dietary tags. Result counts, menu lists and map summaries use the filtered records. The app still shows labelled preview data until the real CSVs are supplied.

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

## Connected interface

`src/data/index.ts` defines the source configuration and labelled sample catalogue. `useMenuCatalogue` loads the configured data once and exposes loading/error/retry state. The same returned catalogue supplies App's filter options, cards, canteen menus, result counts and map summaries.

The latest `feature/frontend` interface is included: its map styling, continuous price slider, compact menu rows and responsive layout are preserved. The slider now filters with inclusive numeric minimum/maximum bounds. Changing controls returns from a canteen detail to the matching-results list. The all-filters Reset button preserves the search text; the no-results recovery button clears both the search and filters.

The Stall dropdown is derived from loaded records and follows the Canteen dropdown. Equal stall names in different canteens have distinct keys and display their canteen when viewing all stalls. Changing canteens clears the previous stall selection. Both reset actions clear the stall, and stall filtering combines with search, cuisine, price and dietary filters. The active-filter badge counts the stall selection.

Unknown CSV prices remain null, display as "Price unavailable", are excluded by active price bounds, and are omitted from map minimum-price calculations. Unknown cuisines stay unlabelled. Images resolve against the deployment base path and retain a placeholder when missing or broken.

## Configure the real-data source

1. Add the verified menu CSVs under `public/data/`.
2. Fill `public/data/canteens.json` with an array of verified location records. Required fields: unique `id`, non-empty `name`, numeric `coordinates.lat` (-90 to 90) and `coordinates.lng` (-180 to 180). Optional fields: `location` and `openingHours`. Do not treat the sample locations as verified real metadata.
3. Each menu's `canteen` must match a metadata ID exactly, or a unique name (ignoring case/outer whitespace). Unknown and ambiguous locations are rejected rather than placed at guessed coordinates.
4. Copy `.env.example` to `.env.local` and set `VITE_MENU_SOURCE=csv`. `VITE_MENU_CSV_FILES` is a JSON array of public URLs; its default is `["data/menu.csv"]`. `VITE_CANTEENS_URL` defaults to `data/canteens.json`.
5. Restart Vite or rebuild. Relative data/image paths resolve below Vite's BASE_URL, including a repository subpath. All files in `public/` become public when deployed.

CSV and metadata files load as one catalogue. A failure in either produces a retry state; it never substitutes sample records. Empty files show that menu data is not available yet. Preview is the explicit default until real data arrives, with a visible sample-menu notice.

## Before release

- Map the actual CSV columns and check ambiguous/missing values against the original menu sources.
- Validate all intended CSVs together, compare source/output counts and confirm dietary evidence.
- Verify canteen names, IDs, coordinates, opening hours, images and directions.
- Check the completed interface on mobile and desktop with the actual dataset.
- Complete physical iOS/Android checks with the deployed URL. Browser viewport testing is recorded in `docs/device-qa.md`.
- Configure the agreed hosting account/base path, deploy and verify the public URL.

Automated tests and local browser checks use fictional fixture records. They verify the connection and controls, not actual NUS menus, dietary claims, geographic accuracy or release readiness. The production menu and metadata files are intentionally empty until real data is supplied.
