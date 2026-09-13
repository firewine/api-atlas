# API Atlas

API Atlas is a static-first, source-backed API knowledge base. The MVP ships ten provider profiles, category indexes, five comparisons, seven integration guides, a change ledger, Pagefind search, and machine-readable catalog surfaces.

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

That command type-checks Astro, builds the static site, generates the Pagefind index, validates provider content/provenance, and checks required output routes plus internal links. GitHub Actions runs the same stages for pull requests and pushes to `main`.

## Content model

Provider Markdown in `src/data/apis/` is the shared source for HTML and JSON. Mutable facts include an official source URL and verification date; provider profiles show that provenance directly. Additions must satisfy the schema in `src/content.config.ts` and the invariants in `scripts/validate-content.mjs`.

The seed catalog covers EODHD, BOK ECOS, the FSC fund-product API on data.go.kr, OpenAI, Anthropic, Gemini, Massive, Alpha Vantage, yfinance, and Currencylayer.

Machine surfaces:

- `/api/catalog.json`
- `/api/providers/{slug}.json`
- `/api/changes.json`
- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`

## Deployment

The output is static and deployable from `dist/` to Cloudflare Pages. Set `SITE_URL` to the production HTTPS origin during the build so canonical links, the sitemap, robots file, and `llms.txt` use the final domain.

## Policy boundary

Search/retrieval crawler access and training crawler access are controlled separately where providers expose separate tokens. API Atlas does not cloak content, manufacture impressions, or monetize bot traffic through advertising. Official vendor documentation remains authoritative.
