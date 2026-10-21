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

That command tests the shared validation contract, validates source content and Astro types, builds the static site and Pagefind index, then checks the generated catalog, Guide SEO and distribution. GitHub Actions runs it for root and subpath deployments on pull requests and pushes to `main`, followed by production browser tests for Compare, Search and static Guides. Manual workflow runs are also available.

## Content model

Provider Markdown in `src/data/apis/` is the shared source for HTML and JSON. Mutable facts include an official source URL and verification date; provider profiles show that provenance directly. Additions must satisfy the schema in `src/content.config.ts` and the shared provenance rules in `src/lib/provider-provenance.mjs`. Follow the required fact keys and publishing steps in [Content authoring](docs/CONTENT_AUTHORING.md).

Practical case studies use the existing Guides template. Generate one reviewed case with `npm run generate:case -- /path/to/reviewed-case.json`; start from `case-studies/template.json` and follow the evidence/SEO and post-deploy Search Console rules in [Content authoring](docs/CONTENT_AUTHORING.md). `validate:guides` checks the built pages and is part of the normal validation command.

The seed catalog covers EODHD, BOK ECOS, the FSC fund-product API on data.go.kr, OpenAI, Anthropic, Gemini, Massive, Alpha Vantage, yfinance, and Currencylayer.

Korean pages live under `/ko/` (or `/api-atlas/ko/` when mounted in GetBeta).
They use separate display overlays and the original providers, facts and evidence.
Only reviewed translations get reciprocal language links; the existing English
URLs and machine endpoints remain the canonical sources for their contracts.
See the Korean overlay rules in [Content authoring](docs/CONTENT_AUTHORING.md).

Machine surfaces:

- `/api/catalog.json`
- `/api/guides.json`
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
