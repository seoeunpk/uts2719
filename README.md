# NUS Food Finder

A responsive, map-first web app for browsing food across NUS campus canteens. Pins on a campus map show where matching dishes are; a side panel (desktop) or draggable bottom sheet (mobile) lists the menus. Built with React, TypeScript, Vite, Tailwind CSS v4 and Leaflet (with a MapLibre vector basemap), with no backend.

## Run it

```bash
npm ci
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally
```

Deploy to Vercel or Netlify as a Vite project: the build command is `npm run build` and the output directory is `dist`.

## Project layout

```
src/
  types/menu.ts          Shared data contracts (MenuItem, Canteen, MenuFilters, ...)
  data/index.ts          Single data entry point: the only file that should import data
  data/mock/mockMenu.ts  MOCK data for UI preview only (not real menus)
  lib/filterMenu.ts      UI adapter for search + combined filters
  lib/constants.ts       Dietary labels, price ranges, empty filter state, map bounds
  lib/summarise.ts       Groups filtered results by canteen for pins and the list
  hooks/                 Filter UI state, media query / viewport helpers
  data/nusCampus.ts      NUS campus outlines (from OpenStreetMap) for the NUS-only map
  components/map/        Leaflet map, canteen pins, minimal campus basemap
  components/            Panel views (ResultsList, CanteenDetail), FoodCard, SearchBar,
                         QuickFilters chip row, FilterSheet, BottomSheet
  App.tsx                Layout and wiring (desktop side panel vs mobile bottom sheet)
```

## Integration guide (Person 2)

Search and filtering are connected to the existing UI. Real menu data is still pending:

1. **Real data: `src/data/index.ts`.** Replace the mock imports with the real dataset, mapped to `Canteen[]` and `MenuItem[]` from `src/types/menu.ts`. Then set `IS_MOCK_DATA = false`, which removes the "Preview data" badge. `filterOptions.cuisines` is built from the items automatically.
2. **Search and filtering: `src/lib/filterMenu.ts`.** The adapter now calls the shared logic in `src/lib/menu.js`, translating the UI's canteen IDs, price presets and dietary selections. The map pins, result count, list and empty state all use its results. It preserves the existing item order and object references.

How `MenuFilters` is defined (an empty value means no restriction):

| Field          | Set by                         | Meaning                                  |
| -------------- | ------------------------------ | ---------------------------------------- |
| `query`        | Search bar (every keystroke)   | Raw search text                          |
| `canteenId`    | Filter dropdown                | One `Canteen.id`, or `null` for all      |
| `cuisines`     | Quick chips + filter sheet     | Match **any** selected cuisine           |
| `priceRangeId` | Quick chips + filter sheet     | Look up in `options.priceRanges`; bounds are inclusive, `max: null` means no cap |
| `dietary`      | Quick chips + filter sheet     | Suggested: item must have **all** selected tags |

Other notes:

- Every `Canteen` needs `coordinates: { lat, lng }` for its map pin. The mock coordinates are approximate, so use the real ones from the dataset or check them on a map.
- Pins and the list are built from whatever `filterMenuItems` returns. A canteen with no matching dishes stays on the map as a small grey pin.
- Clicking a pin opens that canteen in the panel. This is UI state and separate from the `canteenId` filter.
- The basemap is OpenFreeMap's free, keyless "Positron" vector style, with place names, road shields and boundaries removed (`HIDDEN_LAYER` in `CampusBasemap.tsx`). Everything outside the NUS outline is faded out, and panning and zooming are limited to campus (`NUS_MAX_BOUNDS`, `minZoom` in `MapView.tsx`).
- The map code (MapLibre) is about 335 KB gzipped, so it's lazy-loaded and the panel appears first. Vite's "chunk larger than 500 kB" warning is expected.
- `MenuItem.imageUrl` is optional. When it's missing or the image fails to load, the card shows a placeholder for the cuisine.
- `DietaryTag` is a union in `types/menu.ts`. If the dataset has more tags, add them there and in `DIETARY_LABELS`, and the compiler will flag anything else that needs updating.
- Price buckets are defined in `PRICE_RANGES` in `lib/constants.ts`.
- `FoodCard` accepts an optional `onSelect` callback if a dish detail view is added later.

## Data utilities and checks

Use Node.js 24 LTS; `.nvmrc` pins the checked version, 24.16.0.

```sh
npm test                  # CSV, core filtering, UI adapter and React lifecycle tests
npm run lint              # shared frontend and data code
npm run build             # type-check and build the actual app
npm run test:build        # standalone React/data compatibility fixture
npm run validate:menu     # validate the production CSV; fails while it is empty
```

Pull requests and updates to `main` run tests, lint and the app build in GitHub Actions.

`src/lib/menu.js` provides CSV loading/validation, combined filters, sorting and filter options. `src/hooks/useMenu.js` provides a standalone CSV-loading hook. Both include TypeScript declarations. The existing map UI continues to use the clearly labelled mock data through `src/data/index.ts` until the actual CSVs are supplied and mapped to the shared UI types.

`public/data/menu.csv` contains headings only. The fixture records in `tests/fixtures/` are fictional and must not be published as real menu data. Menu release validation is separate from CI because real records and source verification are still pending.

See [the data handoff guide](docs/person-2-handoff.md) for the proposed CSV format. Menu photos, dietary evidence, coordinates, actual desktop/mobile acceptance and deployment still require checking before launch.
