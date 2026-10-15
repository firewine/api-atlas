# Provider content and validation

Provider Markdown in `src/data/apis/` supplies the HTML profile and catalog JSON. The Astro schema validates source content before the build; the JSON validator checks the generated catalog using the same provenance rules.

## Required sourced facts

Every provider has exactly one fact for each stable key. The `label` is display text and may be changed without changing the key. Additional editorial facts can omit `key`.

```yaml
sourceUrls:
  - "https://vendor.example/docs"
  - "https://vendor.example/pricing"
mutableFacts:
  - key: "base-url"
    label: "Base URL"
    value: "https://api.vendor.example/v1"
    sourceUrl: "https://vendor.example/docs"
    verifiedAt: "YYYY-MM-DD"
  - key: "authentication"
    label: "Authentication"
    value: "Describe the verified authentication method"
    sourceUrl: "https://vendor.example/docs"
    verifiedAt: "YYYY-MM-DD"
  - key: "pricing"
    label: "Pricing"
    value: "State verified pricing conditions or explicitly say what remains unknown"
    sourceUrl: "https://vendor.example/pricing"
    verifiedAt: "YYYY-MM-DD"
  - key: "rate-limits"
    label: "Rate limits"
    value: "State the scope, unit, plan and exceptions supported by the source"
    sourceUrl: "https://vendor.example/docs"
    verifiedAt: "YYYY-MM-DD"
```

Replace the illustrative URLs, values and dates with facts actually reviewed. `officialDocs` must appear in `sourceUrls`. Every fact's exact `sourceUrl` must also appear there. Use the canonical official URL if an old documentation URL redirects. Only HTTPS sources and real calendar dates are accepted.

Adding a key identifies a fact; it does not establish that its claim is true. Review the source itself. Schema validation cannot verify an API key, call a paid API, prove pricing semantics, or validate every example against a vendor service.

## Local and CI checks

```bash
npm ci
npm run validate
```

The static contract runs unit/integration tests, Astro source/type checks, the static build and Pagefind, catalog provenance validation, and distribution verification. `npm run check` is the fastest source check while editing. `npm run validate:content` reads the last build, so rebuild after content edits before using its result.

For workflow, URL and runtime changes, install the browser once and run the full production browser checks in both deployment modes:

```bash
npx playwright install chromium
SITE_URL=https://api-atlas.pages.dev BASE_PATH=/ npm run validate:ci
SITE_URL=https://getbeta.app BASE_PATH=/api-atlas/ npm run validate:ci
```

`validate:ci` adds Compare/Search browser tests to the static contract. Cloudflare's build command remains `npm run validate` and does not require a browser installation. GitHub Actions tests both modes independently on Node 24 and saves screenshots/traces if a browser assertion fails.

Run the complete pending change before publishing a coherent commit. Avoid pushing each incomplete provider addition: each push starts a validation run and newer pushes cancel older runs by design. Check the newest SHA's result. A green Actions run proves the tested source and static output; hosting redirects, response policies, and production deployment need separate evidence.
