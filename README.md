# NUS Food Finder

A responsive, map-first web app for browsing food across NUS campus canteens. Pins on a campus map show where matching dishes are; a side panel (desktop) or draggable bottom sheet (mobile) lists the menus. Built with React, TypeScript, Vite, Tailwind CSS v4 and Leaflet, with no backend.

## Run it

```bash
npm install
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
  lib/filterMenu.ts      Search + filter function (currently a pass-through stub)
  lib/constants.ts       Dietary labels, price ranges, empty filter state, map bounds
  lib/summarise.ts       Groups filtered results by canteen for pins and the list
  hooks/                 Filter UI state, media query / viewport helpers
  components/map/        Leaflet map with canteen pins
  components/            Panel views (ResultsList, CanteenDetail), FoodCard, SearchBar,
                         QuickFilters chip row, FilterSheet, BottomSheet
  App.tsx                Layout and wiring (desktop side panel vs mobile bottom sheet)
```

## Integration guide (Person 2)

The UI is already wired end to end. Two files need changing:

1. **Real data: `src/data/index.ts`.** Replace the mock imports with the real dataset, mapped to `Canteen[]` and `MenuItem[]` from `src/types/menu.ts`. Then set `IS_MOCK_DATA = false`, which removes the "Preview data" badge. `filterOptions.cuisines` is built from the items automatically.
2. **Search and filtering: `src/lib/filterMenu.ts`.** Implement `filterMenuItems(items, filters, options)`. It runs every time any filter changes, and the UI renders whatever it returns: the map pins, the result count, the list, and the empty state when it returns nothing.

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
- The map uses free OpenStreetMap tiles with no API key, which is fine for a student project. For heavy traffic, switch the `TileLayer` URL in `MapView.tsx` to a keyed provider.
- `MenuItem.imageUrl` is optional. When it's missing or the image fails to load, the card shows a placeholder for the cuisine.
- `DietaryTag` is a union in `types/menu.ts`. If the dataset has more tags, add them there and in `DIETARY_LABELS`, and the compiler will flag anything else that needs updating.
- Price buckets are defined in `PRICE_RANGES` in `lib/constants.ts`.
- `FoodCard` accepts an optional `onSelect` callback if a dish detail view is added later.
