# Catalog category navigation — 2026-10-16

## Baseline and cause

- Repository: `/Users/june/api-atlas`, branch `main`.
- Baseline HEAD: `2c853804dca4f0bc7dd57420fde28124f2c1c0f2`; initial working tree clean.
- Reproduced on production: selecting Public data from `/api-atlas/apis/` navigated to its category page, where the entire category menu was absent.
- The catalog rendered the menu inline; the category detail template did not render it. Provider cards still existed. This was a page-template omission.

## Change

- `src/components/CategoryNavigation.astro`: shared static navigation sourced from the existing category definitions, including All and every category. Selected link has the existing active style and `aria-current="page"`.
- `src/pages/apis/index.astro`: reuse the shared navigation with All selected.
- `src/pages/categories/[slug].astro`: render the same navigation with the current category selected.
- `tests/browser/catalog-navigation.spec.ts`: desktop (1440px) and mobile (390px), JavaScript disabled. Select every category sequentially, verify all navigation labels/paths and exactly one selected link, match the visible providers against the catalog JSON, reload, return to All, and reject horizontal overflow.
- No existing tests changed; no assertions removed, skipped tests, exclusive tests, new mocks or snapshots.

## Verification

| Command | Exit | Observed result |
| --- | --- | --- |
| `SITE_URL=https://getbeta.app BASE_PATH=/api-atlas/ npx playwright test tests/browser/catalog-navigation.spec.ts --grep 1440px` (before application change) | 1 | Fails after category navigation: `API categories` element not found. |
| `npx playwright install chromium` | 0 | Browser dependency available. |
| `SITE_URL=https://api-atlas.pages.dev BASE_PATH=/ npm run validate:ci` | 0 | 21 tests; Astro 0 errors/warnings; 8 browser tests; 34 providers, 14 Guides, 80 HTML pages verified. |
| `SITE_URL=https://getbeta.app BASE_PATH=/api-atlas/ npm run validate:ci` | 0 | Same checks passed at the production mount path. |
| `git diff --check` | 0 | No whitespace errors. |

A separate browser session against the built subpath site confirmed All → Public data → Payments → All. The Public data screenshot shows all category links with Public data selected and the corresponding provider cards below.

## Release boundary

The application change is ready for the next GetBeta frontend rebuild. Production deployment of this category fix is UNVERIFIED in this report. The user independently rebuilt and confirmed the earlier five English Guides were present.
