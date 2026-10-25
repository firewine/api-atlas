# Responses instructions and yfinance quotation-unit cases

Author: 차도녀 gpt may

Reviewed: 2026-10-25

## Scope and editorial review

- Add two practical Guides and their Korean overlays using the existing template, plus review recipes and 12 dated public-source excerpt snapshots.
- Link from the existing LLM and market-data selection Guides. Provider backlinks are generated from case metadata; no provider facts, application behavior, dependencies or workflow changed.
- OpenAI: distinguish the documented `previous_response_id` / top-level `instructions` contract from an API bug. v7.43.0 is the inspected SDK documentation version, not a claimed introduction or fix version.
- yfinance: distinguish the reported GBP/GBp regression and released repair from the separate synthetic partial-block report. PR #2927 was open/unmerged when checked; no universal 100x fix is claimed.
- Independent source and EN/KO technical review found no blocking issue. Repository-interest counters are rounded observed display values, not API usage counts. No corresponding GetBeta production fix is claimed.
- Both articles retain `source-review`. Offline application-helper controls do not establish SDK behavior, live service availability, model adherence, market-data accuracy or a production repair.

## Local validation

- Node 24.22.1; `npm ci --cache /tmp/api-atlas-npm-cache` installed the unchanged lockfile. An initial install could not write the default home cache; using a writable temporary cache resolved it without dependency changes.
- Disable Astro telemetry and use a writable temporary config/cache for local checks:

```sh
ASTRO_TELEMETRY_DISABLED=1 XDG_CONFIG_HOME=/tmp/api-atlas-config \
  npm_config_cache=/tmp/api-atlas-npm-cache \
  SITE_URL=https://api-atlas.pages.dev BASE_PATH=/ npm run validate

ASTRO_TELEMETRY_DISABLED=1 XDG_CONFIG_HOME=/tmp/api-atlas-config \
  npm_config_cache=/tmp/api-atlas-npm-cache \
  SITE_URL=https://getbeta.app BASE_PATH=/api-atlas/ npm run validate
```

- Root validation passed: 43 tests, Astro check 0 errors / 0 warnings, build/Pagefind, 35 providers / 157 facts, 21 Guides / 14 reviewed cases, 9 Korean Guides / 4 providers / 1 comparison, and 151 required outputs / 105 HTML pages.
- Subpath validation passed with the same test, source-check, content, translation and distribution counts at `https://getbeta.app/api-atlas/`.
- The four new focused tests validate recipe/evidence/translation contracts and execute only application examples. The yfinance helper uses synthetic scalar values (4 positive and 5 rejection controls); the Responses helper checks first/continuation/replacement policies and 8 rejected argument variants without an SDK or network.
- An early validation snapshot taken while translation edits were still being finalized detected a stale Korean source revision. The revision was corrected and the full final-content validation rerun. No validator was weakened.
- Browser assertions were not reached locally: the managed Chromium download was truncated, installed Chromium failed its socket launch, and an elevated launch failed environment setup. The two new browser tests cover no-JavaScript bilingual reading, canonical/language links, provider discovery and selection-guide navigation. The existing push-triggered CI must establish the exact commit's root/subpath browser result; local static checks are not a browser PASS.

## Publication boundaries

The user authorized applying these cases and committing/pushing. No paid/vendor API call, credential creation or collection, manual deployment, PR, hosting-policy change or Search Console inspection was performed. Search Console URL inspection, selected canonical, indexing and search performance remain unverified. A successful push/build does not establish production deployment or indexing.
