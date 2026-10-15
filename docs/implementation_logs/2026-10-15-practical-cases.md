# Practical integration cases: Gemini and Massive

Author: 차도녀 gpt may

Source review date: 2026-10-15

State: reviewed for publication; production deployment and live endpoint checks are recorded separately.

## Scope

- Added two English practical cases to the existing Guides collection with distinct titles, descriptions, slugs, dated evidence snapshots, and source-review scope.
- Linked them from the Gemini and Massive provider profiles and relevant existing Guides. The Massive profile's aggregate helper returns the first `results` page, so its surrounding text now flags the long-range pagination limit.
- Reused the existing case-study schema, Guide template, canonical and sitemap path handling. The case headings and metadata labels follow the existing English Atlas pages.

## Source verification

- Gemini: read the official thought-signature guide, issue #1275, and the issue author's correction comment. The correction attributes the reported 400 to separate model Content entries made from one parallel response. The guide's JSON is a synthetic shape fixture.
- Massive: read the Custom Bars reference, aggregate limit explanation, missing-aggregates knowledge-base article, and unresolved MMM/HON issue #1028. The guide separates base-aggregate `limit` truncation from no-eligible-trade minutes. The Python example uses an injected page fetcher and no key.
- Pricing and plan facts were not revised. Search terms are candidates, with no traffic or ranking claim.

## Validation

- `npm ci --offline`: completed.
- `SITE_URL=https://getbeta.app BASE_PATH=/api-atlas/ npm run validate:ci`: 16 unit/integration tests, 5 browser tests, Astro check, build, content, Guides and distribution checks passed.
- `SITE_URL=https://api-atlas.pages.dev BASE_PATH=/ npm run validate:ci`: same checks passed.
- No credentialed Gemini or Massive request, production deployment, Search Console review, or live trade-condition check was performed. Those remain UNVERIFIED.
