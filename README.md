# NUS Food Finder — UTS2719

Person 2's data and functionality starter for the team's React + Vite app. It includes CSV loading, validation, search, combined filters, price sorting and a React hook. Person 1 owns the application interface.

**Status:** the actual menu CSVs have not been supplied. `public/data/menu.csv` contains headings only. The fictional records in `tests/fixtures/` are for automated tests and must not be published as NUS menu information. The application interface and deployment are pending.

## Run the checks

Use Node.js 24 LTS (24.15 or newer) with npm. `.nvmrc` pins the tested version, 24.16.0:

```sh
npm ci
npm test
npm run test:build
npm run validate:menu
```

`validate:menu` deliberately exits with code 2 while the production CSV is empty. With real data, it reports the item count and filter categories, or identifies invalid records. Validate multiple files together to catch duplicate IDs:

```sh
npm run validate:menu -- public/data/menu-a.csv public/data/menu-b.csv
```

`test:build` compiles a minimal React fixture with Vite under `/uts2719/`. It is a compatibility check, not the team's website. This starter does not yet provide an app `dev` or deployment `build` command.

## Main files

| File | Purpose |
| --- | --- |
| `src/lib/menu.js` | CSV loading, validation, search, filters, facets and formatting |
| `src/hooks/useMenu.js` | React loading/error state and filtered results |
| `public/data/menu.csv` | Placeholder for the real dataset |
| `docs/person-2-handoff.md` | CSV format, integration example and release checks |

## Working with Person 1

Pull requests targeting `main` run the tests and Vite compatibility build in GitHub Actions. The same checks run on updates to `main`. Menu-data release validation remains a separate step because the real CSVs are still pending; a passing CI run does not establish that the app is ready to deploy.

Keep one React + Vite app. Merge the modules and hook into Person 1's interface, retaining their Vite configuration, pages, components and styles. If Person 1 already has a `package.json`, merge the dependencies and check scripts rather than replacing it; keep compatible existing React/Vite versions and regenerate the lockfile. Papa Parse is the only additional runtime dependency beyond React.

See [the handoff guide](docs/person-2-handoff.md) for the integration contract. No traditional backend or login is needed for the current static CSV catalogue.
