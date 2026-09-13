# API Atlas — GPT Work Handoff

> **Authoritative handoff for continuing implementation in ChatGPT Work.**
>
> Read this file first. Do not rely on prior chat memory. If this file conflicts with an old planning document, prefer this file unless the user explicitly says otherwise.

- Repository: `firewine/api-atlas`
- Default branch: `main`
- Visibility: public
- Handoff date: 2026-09-13 (Asia/Seoul)
- Project state: bootstrap only; MVP implementation has **not** been completed yet

---

## 1. Mission

Build **API Atlas**, a public, static-first API knowledge base that is useful to both humans and legitimate search/AI retrieval systems.

The product should answer practical questions such as:

- What does this API provide?
- How do I authenticate?
- What is the current base URL/version?
- What are the important endpoints?
- How do pagination, errors, webhooks, SDKs, quotas, and rate limits work?
- When was each mutable fact last verified?
- Which official source supports the fact?
- How does this API compare with alternatives?
- How do I complete common integration tasks?

The site should be easy to crawl, cite, search, and maintain without becoming a mirror of vendor documentation.

---

## 2. Non-negotiable rules

### 2.1 Source quality

Use sources in this priority order:

1. Official OpenAPI / official machine-readable API specification
2. Official vendor documentation / reference
3. Official changelog / release notes / RSS
4. Official SDK/source repositories
5. Manual editorial summary based on official sources
6. Secondary sources only as corroboration, never as the primary basis for mutable product facts

Do not invent facts. Do not treat historical notes from GetBeta as current truth without re-verification.

### 2.2 Mutable facts must be traceable

Facts that can change must include source and verification date. Examples:

- model names
- pricing
- API versions
- quotas
- rate limits
- authentication requirements
- availability / deprecation state
- base URLs
- supported regions
- plan restrictions

At minimum, each provider document must expose:

- `officialDocs`
- `verifiedAt`
- `sourceUrls[]`

If the schema is expanded to fact-level provenance, prefer that over page-level provenance.

### 2.3 Do not mirror whole vendor docs

API Atlas is a curated knowledge layer, not a documentation scraper/mirror.

Store:

- concise summaries
- normalized facts
- original examples written for API Atlas
- endpoint metadata needed for discovery/comparison
- hashes or source metadata for change detection

Do not copy large passages from official docs.

### 2.4 Bot traffic is discovery, not ad inventory

Do **not** implement any scheme whose purpose is to generate ad impressions/clicks from crawlers, bots, AI agents, or automated traffic.

Do not cloak content or ads by user agent. Do not fake engagement. Do not bypass ad-platform invalid-traffic protections.

Legitimate funnel:

`crawler/indexing -> citation/search result -> real human referral -> compliant monetization`

Human monetization may later include normal ads, sponsorship, affiliate/referral, premium data, or paid tooling after genuine human traffic exists.

### 2.5 Crawler controls must remain explicit

Search/retrieval crawlers and training crawlers are different controls.

Design robots policy so the user can intentionally control them separately. Do not assume that allowing search/retrieval requires allowing model training.

The MVP should be crawl-friendly to legitimate search/retrieval systems while remaining standards-compliant.

---

## 3. Current repository state

As of this handoff, `main` contains only the initial bootstrap:

```text
README.md
astro.config.mjs
package.json
src/
  content.config.ts
tsconfig.json
```

There are currently no completed application pages and no provider content files.

### 3.1 Current stack decision

- Astro 7.x
- TypeScript
- static-first generation
- Astro Content Collections
- Pagefind for static search
- Git-tracked Markdown/YAML/JSON content
- GitHub Actions for validation/build
- Cloudflare Pages is the preferred deployment target

Do not introduce a database, CMS, auth system, or server runtime for the MVP unless implementation evidence shows one is actually required.

### 3.2 Current package scripts

The bootstrap intends to use:

```json
{
  "dev": "astro dev",
  "build": "astro build && pagefind --site dist",
  "preview": "astro preview",
  "check": "astro check"
}
```

Verify dependency compatibility before changing versions. Do not downgrade the project to an older Astro architecture merely because an older tutorial uses it.

### 3.3 Current content collection

`src/content.config.ts` currently defines an `apis` collection using the Astro glob loader from `./src/data/apis`.

Current frontmatter fields:

```text
name
provider
category
status: active | legacy | research
officialDocs
auth
summary
verifiedAt
sourceUrls[]
tags[]
```

This is a bootstrap schema, not sacred. Expand it when needed for the MVP, but preserve source traceability and avoid unnecessary abstraction.

---

## 4. Prior research / planning context

The original planning work was done in `firewine/getbeta` on branch `docs/api-atlas-bootstrap`, draft PR #29.

That branch contains these planning documents:

```text
docs/plans/api_atlas/README.md
docs/plans/api_atlas/00_SCOPE_AND_RULES.md
docs/plans/api_atlas/01_EXISTING_API_INVENTORY.md
docs/plans/api_atlas/02_PUBLIC_API_CANDIDATES.md
docs/plans/api_atlas/03_SITE_INFORMATION_ARCHITECTURE.md
docs/plans/api_atlas/04_CRAWLER_AND_DISCOVERY_STRATEGY.md
docs/plans/api_atlas/05_DATA_MODEL_AND_INGESTION.md
docs/plans/api_atlas/06_MVP_IMPLEMENTATION_PLAN.md
```

If Work has GitHub access to `firewine/getbeta`, read these for background. They are not required to start because the critical decisions are repeated in this handoff.

Do not modify GetBeta while implementing API Atlas unless the user explicitly requests it.

---

## 5. Seed providers for the first implementation

Implement these **10 seed providers first** because they already have strong relevance from prior GetBeta/API research and cover multiple API categories.

1. **EODHD** — market/financial data
2. **Bank of Korea ECOS** — Korean economic/FX data
3. **Korea Financial Services Commission / data.go.kr fund product API** — Korean public financial data
4. **OpenAI API** — AI API
5. **Anthropic Claude API** — AI API
6. **Google Gemini API** — AI API
7. **Massive (formerly Polygon.io)** — market data
8. **Alpha Vantage** — market/economic data
9. **Yahoo Finance / yfinance** — unofficial library/data source; clearly label as unofficial rather than a first-party supported API
10. **Currencylayer** — FX API

### Important status nuance

Historical GetBeta usage is evidence of relevance, not proof of current product status.

For every seed provider, re-check current official documentation before publishing facts. If an API/product is legacy, renamed, unofficial, deprecated, or has changed ownership/branding, represent that clearly.

### Known official starting points

Use current official pages rather than secondary summaries. Starting URLs include:

```text
EODHD:          https://eodhd.com/financial-apis/
Massive:        https://massive.com/docs/
Alpha Vantage:  https://www.alphavantage.co/documentation/
FRED:           https://fred.stlouisfed.org/docs/api/fred/
SEC EDGAR:      https://www.sec.gov/search-filings/edgar-application-programming-interfaces
OpenAI:         https://developers.openai.com/
Anthropic:      https://docs.anthropic.com/en/api/
Gemini:         https://ai.google.dev/api
GitHub REST:    https://docs.github.com/en/rest
Cloudflare:     https://developers.cloudflare.com/api/
Stripe:         https://docs.stripe.com/api
Paddle:         https://developer.paddle.com/api-reference/overview
Supabase:       https://supabase.com/docs/guides/api
Mapbox:         https://docs.mapbox.com/api/
```

For Korean government APIs, resolve and store the exact current official service page/API reference during implementation rather than guessing from an old endpoint.

---

## 6. Expansion candidate set

After the first 10 providers work end-to-end, expand toward at least 25 high-quality entries.

Priority candidates already researched include:

### Finance / public data

- SEC EDGAR
- FRED
- Twelve Data
- Finnhub
- Tiingo
- Nasdaq Data Link
- Financial Modeling Prep
- U.S. Treasury Fiscal Data
- World Bank
- OECD / IMF where useful
- CoinGecko

### AI / developer platforms

- GitHub REST
- Cloudflare API
- Supabase
- Firebase
- Neon
- Auth0
- Clerk
- Mistral
- Cohere
- Hugging Face
- Together
- Fireworks
- Replicate
- OpenRouter
- xAI
- Perplexity

### Payments / SaaS / integrations

- Stripe
- PayPal
- Paddle
- Twilio
- Slack
- Notion
- Discord
- Telegram
- SendGrid
- Mailgun
- Resend
- Shopify
- Square
- Toss where official developer documentation is sufficiently public and useful

### Maps / weather / general data

- Open-Meteo
- Mapbox
- Google Maps Platform
- OpenStreetMap-related APIs where appropriate
- HERE
- NASA public APIs

Quality is more important than reaching a numerical target with thin pages.

---

## 7. Information architecture

Use these as the primary public routes:

```text
/
/apis/
/apis/{slug}/
/categories/
/categories/{slug}/
/compare/
/compare/{comparison-slug}/
/guides/
/guides/{guide-slug}/
/changes/
/sources/
/about/
```

Optional provider subpages should only exist when there is enough unique content:

```text
/apis/{slug}/authentication/
/apis/{slug}/rate-limits/
/apis/{slug}/pagination/
/apis/{slug}/errors/
/apis/{slug}/webhooks/
/apis/{slug}/sdks/
/apis/{slug}/versioning/
/apis/{slug}/examples/
```

Endpoint-level pages may use:

```text
/apis/{slug}/endpoints/{operation-slug}/
```

Do not generate thousands of thin endpoint pages just because an OpenAPI file contains thousands of operations.

---

## 8. Required machine-readable surfaces

The human-readable and machine-readable outputs should derive from the same source data.

MVP should expose at least:

```text
/api/catalog.json
/api/providers/{slug}.json
/api/changes.json
/robots.txt
/sitemap.xml
/llms.txt
```

An RSS/Atom feed for meaningful change events is desirable if it can be added cleanly.

Do not generate `llms-full.txt` by dumping the whole site. A concise `llms.txt` is enough for the MVP.

---

## 9. Provider page content standard

Every provider page should be useful on its own. A good MVP provider page should contain, where applicable:

1. Provider/API name
2. One-paragraph original summary
3. Category and status
4. Official documentation link
5. Authentication method
6. Base URL(s)
7. API version/versioning model
8. Key resource groups or important endpoints
9. Pagination pattern
10. Rate limit/quota information **only if verified from an official source**
11. Error model / common status codes
12. Webhook support if applicable
13. Official SDKs / OpenAPI availability
14. Small original integration example
15. Known caveats
16. Alternatives/comparisons
17. Sources
18. Verified date

If a fact cannot be confirmed, omit it or explicitly mark it unknown/unverified. Do not fill fields with generic text just to make the page look complete.

---

## 10. Initial comparisons and guides

The MVP target is at least **5 substantive comparisons** and **7 task-oriented guides**.

Good comparison candidates:

```text
EODHD vs Massive
EODHD vs Alpha Vantage
OpenAI vs Anthropic
OpenAI vs Gemini
Supabase vs Firebase
Stripe vs Paddle
Auth0 vs Clerk
```

Select at least five based on source quality and practical usefulness.

Good guide candidates:

```text
How to choose a stock market data API
How to choose an LLM API
How to handle API keys safely
How to implement pagination across common REST patterns
How to design retry/backoff for API clients
How to verify rate limits without relying on stale blog posts
How to consume an OpenAPI specification
How to track upstream API changes
```

Guides must be original explanatory content, not stitched copies of vendor docs.

---

## 11. Search

Use **Pagefind** after Astro static generation.

Target build flow:

```text
astro build
pagefind --site dist
```

Search should index useful editorial/API content while avoiding duplicate machine-readable pages.

Provide a simple search UI accessible from the main navigation or `/search/`.

---

## 12. SEO / crawlability / citation design

### Technical requirements

- static-rendered useful HTML by default
- meaningful `<title>` and descriptions
- canonical URLs
- sitemap
- robots.txt
- semantic headings
- breadcrumbs
- strong internal linking
- no empty JS shells for primary content
- real HTTP status codes
- no user-agent cloaking

### Structured data

Use established schema.org types only when appropriate, for example:

- `TechArticle`
- `BreadcrumbList`
- `WebSite`
- `Organization`

Do not invent a fake `APIReference` schema type.

### Source visibility

Sources and verification dates should be visible to humans, not hidden only in JSON.

---

## 13. robots.txt intent

The exact file may evolve, but the policy intent is:

- allow ordinary search crawlers
- allow legitimate AI search/retrieval crawlers used for discovery/citation
- keep model-training crawler controls separate
- never serve ads/content differently to bots to manufacture monetized impressions

Previously verified crawler distinctions include:

- OpenAI: `OAI-SearchBot` is for search discovery; `GPTBot` is a separate training control
- Anthropic: `Claude-SearchBot`, `Claude-User`, and `ClaudeBot` have different purposes
- Google: `Google-Extended` controls certain Gemini training/grounding uses and is separate from ordinary Google Search indexing

**Re-check current official crawler documentation at implementation time before finalizing robots.txt.**

---

## 14. Data model direction

The larger design uses these conceptual entities:

```text
provider
api_product
source
fact
resource_group
operation
example
comparison
change_event
```

The MVP does not need a database implementation of this model. File-based collections are preferred initially.

A practical provider record should make it possible to derive both HTML and JSON without duplicating facts.

When normalizing source-backed facts, favor a structure conceptually like:

```text
value
source_url
verified_at
confidence/status
```

Use that detail where it materially helps mutable facts. Avoid over-engineering every static descriptive sentence into a fact table.

---

## 15. Change monitoring direction

Do not block MVP launch on a full crawler/ingestion system.

After the site works, add maintainability in this preference order:

1. official OpenAPI diff
2. official machine-readable docs / Markdown / API indexes
3. official changelog/RSS
4. source-page hash/semantic diff
5. manual review

Potential refresh classes:

- very volatile (models, pricing, quotas, rate limits): daily/weekly
- moderate (versions, SDKs, endpoint groups): weekly
- slow (descriptive background): monthly
- event-driven where official changelog/feed exists

Automated source changes should normally create reviewable candidates/PRs rather than silently publishing arbitrary extracted text.

---

## 16. Target repository layout

Use this as a guide, not a rigid requirement:

```text
.github/
  workflows/
    validate.yml

public/
  robots.txt
  llms.txt

src/
  components/
  layouts/
  pages/
    index.astro
    apis/
    categories/
    compare/
    guides/
    changes/
    sources/
    about/
    api/
  data/
    apis/
    comparisons/
    guides/
  lib/
  styles/
  content.config.ts

scripts/
  validate-content.*
  check-sources.*

tests/

docs/
  WORK_HANDOFF.md
```

If Astro conventions make a slightly different layout cleaner, use the cleaner layout.

---

## 17. GitHub Actions minimum validation

Add CI that runs on PRs and pushes to the default branch.

At minimum validate:

```text
npm ci
npm run check
npm run build
```

Also add content validation for:

- duplicate slugs
- invalid/missing source URLs
- invalid dates
- missing required source metadata
- broken internal route assumptions where feasible

A network source checker should distinguish transient network failures from confirmed broken URLs so CI is not flaky.

Do not put API secrets in the repository or require private API keys merely to build the static site.

---

## 18. Cloudflare deployment

Preferred deployment target: Cloudflare Pages.

Expected static output directory:

```text
dist
```

Do not make Cloudflare deployment a prerequisite for local build correctness.

First make the repository build reproducibly in CI. Then configure deployment.

If Cloudflare credentials/account access are unavailable in Work, complete everything else and leave exact deployment instructions/config rather than blocking the MVP.

---

## 19. Definition of MVP done

Do **not** declare the MVP complete unless all applicable items below are true:

- [ ] repository installs cleanly from lockfile
- [ ] `npm run check` passes
- [ ] `npm run build` passes
- [ ] Pagefind index is generated successfully
- [ ] home page exists and explains the product
- [ ] `/apis/` directory page works
- [ ] at least 10 verified seed provider pages exist
- [ ] category pages work
- [ ] at least 5 substantive comparison pages exist
- [ ] at least 7 substantive guides exist
- [ ] machine-readable catalog JSON works
- [ ] provider JSON works
- [ ] robots.txt exists
- [ ] sitemap exists
- [ ] llms.txt exists
- [ ] canonical metadata is present
- [ ] sources and verified dates are visible
- [ ] GitHub Actions validates build/content
- [ ] no secrets are committed
- [ ] no bot/ad-impression monetization logic exists
- [ ] no mass-generated thin pages were added just to inflate page count

Longer-term launch target after the seed implementation: at least 25 quality provider/API entries.

---

## 20. Exact execution order for ChatGPT Work

When continuing this project, **do work, not another planning-only pass**.

### Step 1 — Audit the actual repository

Read:

```text
README.md
package.json
astro.config.mjs
tsconfig.json
src/content.config.ts
docs/WORK_HANDOFF.md
```

Then inspect all remaining files. The repository state is the source of truth for what already exists.

### Step 2 — Establish a clean working branch

Prefer a branch such as:

```text
work/api-atlas-mvp
```

unless the environment/user explicitly wants direct main commits.

### Step 3 — Verify the bootstrap builds

Install dependencies, create/update lockfile as appropriate, and run the baseline check/build.

If bootstrap code is invalid, fix it before building features.

### Step 4 — Implement the shared content model and UI shell

Build:

- global layout
- navigation/footer
- source/verified-date components
- provider cards
- category navigation
- reusable SEO/canonical metadata

### Step 5 — Implement 10 seed providers end-to-end

For each provider:

1. open current official docs
2. verify facts
3. capture source URLs and verification date
4. write original concise content
5. make the provider page render
6. make its machine JSON render from the same data

Do not wait until all ten are researched before verifying that one provider works end-to-end.

### Step 6 — Implement discovery pages

Build:

- `/apis/`
- provider detail pages
- `/categories/` and category details
- search
- breadcrumbs/internal links

### Step 7 — Implement comparison and guide collections

Create at least 5 comparisons and 7 guides with meaningful content.

### Step 8 — Implement machine/discovery surfaces

Create:

- catalog JSON
- provider JSON
- changes JSON
- sitemap
- robots
- llms.txt

### Step 9 — Add CI and validation

Run all checks locally/in Work, then confirm GitHub Actions configuration is valid.

### Step 10 — Final QA

Check built pages for:

- broken routes
- missing metadata
- duplicate content
- missing sources
- stale/unverified claims
- Pagefind indexing
- responsive usability
- machine JSON correctness

### Step 11 — Commit/PR

Commit coherent changes with clear messages. Open a PR if using a feature branch.

Do not claim a successful build unless the build was actually executed and its result observed.

---

## 21. Behavior expected from Work

- Do not ask the user to repeat context already contained here.
- Do not stop after generating another architecture plan.
- Make reasonable implementation decisions independently when they do not conflict with the rules above.
- If one provider source is blocked or ambiguous, continue with the rest and document the gap.
- Prefer partial working implementation over getting stuck on one external dependency.
- Verify current online facts when freshness matters.
- Keep implementation simple enough for one person to maintain.
- When changing this handoff due to a major architectural decision, update the document so the next session inherits the new truth.

---

## 22. Start command / prompt for a new Work session

Paste or send this short instruction after opening the repository in Work:

> Read `docs/WORK_HANDOFF.md` in `firewine/api-atlas` first and treat it as the authoritative project handoff. Audit the current `main` branch, then continue the MVP implementation rather than writing another plan. Verify all mutable API facts against current official sources, preserve source URLs and verified dates, run the actual checks/build, and leave the repository in a working state with clear commits/PR status.

---

## 23. Project success criterion

API Atlas succeeds if a developer or AI retrieval system can reach a page and quickly obtain a **concise, current, source-backed answer** about an API without needing to wade through marketing pages, while the site sends users back to official documentation for the full authoritative reference.
