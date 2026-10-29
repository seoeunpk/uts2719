# NUS Food Finder

A responsive web app for browsing food across NUS campus canteens. It's built with React, TypeScript, Vite and Tailwind CSS v4, and there's no backend.

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
  lib/constants.ts       Dietary labels, price ranges, empty filter state, formatPrice
  hooks/useMenuFilters.ts  UI state for the search bar / filters (no filtering logic)
  components/            Presentational components, all controlled via props
  App.tsx                Page layout and wiring
```

## Integration guide (Person 2)

The UI is already wired end to end. Two files need changing:

1. **Real data: `src/data/index.ts`.** Replace the mock imports with the real dataset, mapped to `Canteen[]` and `MenuItem[]` from `src/types/menu.ts`. Then set `IS_MOCK_DATA = false`, which removes the "Preview data" badge. `filterOptions.cuisines` is built from the items automatically.
2. **Search and filtering: `src/lib/filterMenu.ts`.** Implement `filterMenuItems(items, filters, options)`. It runs every time any filter changes, and the UI renders whatever it returns: the result count, the grid, and the empty state when it returns nothing.

How `MenuFilters` is defined (an empty value means no restriction):

| Field          | Set by                         | Meaning                                  |
| -------------- | ------------------------------ | ---------------------------------------- |
| `query`        | Search bar (every keystroke)   | Raw search text                          |
| `canteenId`    | Canteen nav + filter dropdown  | One `Canteen.id`, or `null` for all      |
| `cuisines`     | Cuisine chips                  | Match **any** selected cuisine           |
| `priceRangeId` | Price chips                    | Look up in `options.priceRanges`; bounds are inclusive, `max: null` means no cap |
| `dietary`      | Dietary checkboxes             | Suggested: item must have **all** selected tags |

Other notes:

- `MenuItem.imageUrl` is optional. When it's missing or the image fails to load, the card shows a placeholder for the cuisine.
- `DietaryTag` is a union in `types/menu.ts`. If the dataset has more tags, add them there and in `DIETARY_LABELS`, and the compiler will flag anything else that needs updating.
- Price buckets are defined in `PRICE_RANGES` in `lib/constants.ts`.
- `FoodCard` / `FoodGrid` accept an optional `onSelect` callback if a dish detail view is added later.
