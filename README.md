# API Atlas

API Atlas is a static-first, source-backed API knowledge base. The catalog ships provider profiles, category indexes, comparisons, integration guides, a change ledger, Pagefind search, and machine-readable catalog surfaces.

## Local development

Requires Node.js 24 or newer.

```bash
npm ci
npm run dev
```

Run the complete pre-merge contract with:

```bash
npm run validate
```

That command tests the shared validation contract, validates source content and Astro types, builds the static site and Pagefind index, then checks the generated catalog and distribution. GitHub Actions runs it for root and subpath deployments on pull requests and pushes to `main`, followed by production browser tests for Compare and Search. Manual workflow runs are also available.

## Content model

Provider Markdown in `src/data/apis/` is the shared source for HTML and JSON. Mutable facts include an official source URL and verification date; provider profiles show that provenance directly. Additions must satisfy the schema in `src/content.config.ts` and the shared provenance rules in `src/lib/provider-provenance.mjs`. Follow the required fact keys and publishing steps in [Content authoring](docs/CONTENT_AUTHORING.md).

The seed catalog covers EODHD, BOK ECOS, the FSC fund-product API on data.go.kr, OpenAI, Anthropic, Gemini, Massive, Alpha Vantage, yfinance, and Currencylayer.

Machine surfaces:

- `/api/catalog.json`
- `/api/providers/{slug}.json`
- `/api/changes.json`
- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`

## Deployment

The output is static and deployable from `dist/` to Cloudflare Pages. Set `SITE_URL` to the production HTTPS origin and `BASE_PATH` to the public mount path during the build. These values determine internal links, canonical URLs, the sitemap, robots file, `llms.txt`, and the search index URLs. Rebuild when the mount path changes.

```bash
SITE_URL=https://api-atlas.pages.dev BASE_PATH=/ npm run validate
SITE_URL=https://getbeta.app BASE_PATH=/api-atlas/ npm run validate
```

For the same builds plus browser checks, first run `npx playwright install chromium`, then use `npm run validate:ci` with the same environment variables.

The exact Pages setup and post-deploy verification procedure are documented in `docs/CLOUDFLARE_PAGES.md`.

## Policy boundary

Search/retrieval crawler access and training crawler access are controlled separately where providers expose separate tokens. API Atlas does not cloak content, manufacture impressions, or monetize bot traffic through advertising. Official vendor documentation remains authoritative.
