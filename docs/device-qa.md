# Stall filter and responsive QA

Checked on 30 October 2026 (Asia/Singapore).

## Method and limits

Production builds were exercised in a Chromium browser with explicit viewport sizes. This covers responsive layouts and browser interaction, not physical iOS/Android hardware or Safari. The visible sample menu and fictional CSV fixtures were used; actual NUS menu content and geographic accuracy were not validated.

The CSV test build was served under `/device-check/` with temporary test data outside the repository. A local test server supplied normal, delayed, failed and empty CSV responses. Production menu and canteen files remain empty.

## Viewport checks

| Viewport | Scenarios exercised | Result |
| --- | --- | --- |
| 1280 × 800 | Repeated stall names distinguished by canteen; changing canteens clears old stall; Tab/Shift+Tab contained in filter dialog; Escape closes and restores focus; no page-wide horizontal overflow | Pass |
| 1024 × 768 | Desktop breakpoint; side-panel collapse/expand; hidden panel controls excluded from keyboard navigation; no horizontal overflow | Pass |
| 768 × 1024 | CSV data under a deployment subpath; distinct stall choices; unknown price; valid image and broken-image placeholder; delayed loading, HTTP 503, retry and empty-data states | Pass |
| 390 × 844 | Canteen/stall selectors; matching list and map counts; sheet expansion, pointer drag and keyboard activation; canteen navigation; directions URL; empty-result reset | Pass |
| 360 × 640 | Scrollable filter content; combined canteen/stall/dietary/price filtering; footer remains reachable with 48-pixel action buttons; empty-result recovery; no horizontal overflow | Pass |
| 844 × 390 | Landscape dialog fits after its opening transition; fixed footer reachable; long stall choices and internal scrolling; no horizontal overflow | Pass |

## Data and interaction results

- All-canteen stall labels include the canteen. Selecting the sample Malay stall in The Deck returned only its dish, excluding the equally named stall in The Terrace.
- Changing canteens clears the old stall and narrows available choices. Selecting the sample Western stall in Techno Edge returned its two dishes and matching map count.
- Stall filtering combines with query, cuisine, dietary and inclusive price bounds. Reset clears stall selection; panel Reset preserves query while no-results recovery clears both query and filters.
- CSV data loaded six fixture records in two canteens. Selecting the South Rice stall returned only the unknown-price noodles. The card showed “Price unavailable”; no false free minimum was displayed.
- A valid image loaded beneath `/device-check/`. An intentionally missing image produced the existing placeholder.
- A failed CSV request showed the error/retry state. Restoring the server and pressing Try again loaded all six records without a page refresh. An empty CSV showed “Menus are not available yet”; a delayed request showed “Loading menus…”. No silent fallback to sample records occurred.
- The directions link encoded the selected canteen's coordinates and walking mode. The external route itself and the sample coordinates were not independently validated.
- No unexpected console errors were observed in the final normal preview session. The fault-injection build intentionally produced failed-request and missing-image responses.

## Issues found and fixed

1. Keyboard focus could leave the filter dialog. Tab and Shift+Tab now wrap inside the open modal, Escape closes it, and closing restores the previous focus. Regression tests cover wrapping, disabled/hidden controls and an empty dialog.
2. Keyboard navigation could enter the desktop panel after it was hidden. Its content is now inert and hidden from accessibility navigation while collapsed; the Show side panel control remains available. The production-browser regression check confirmed focus stays on visible controls.

## Automated checks

56 automated tests passed, including stall identity, repeated names, combined filters, canteen-change/reset behaviour and modal focus handling. Lint, TypeScript checking, the app production build and standalone integration build passed. The existing lazy map bundle still produces Vite's large-chunk warning.

## Remaining acceptance

- Physical iPhone/iPad Safari and Android Chrome: touch hardware, native select behaviour, virtual keyboard, safe areas and low-memory/WebGL performance.
- Real menu, dietary and canteen-coordinate verification after the actual data is supplied.
- Smoke testing against the final deployed public URL, including its asset paths and map service access.
