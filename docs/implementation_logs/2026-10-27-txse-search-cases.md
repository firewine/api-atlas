# Alpaca TXSE and DeepSeek search credential cases

Author: 차도녀 gpt may

Reviewed: 2026-10-27

## Scope and review boundary

- Add two English canonical practical Guides, synchronized review recipes, eight minimal public-source snapshots and two selected GitHub metadata receipts. English is the canonical content language; no existing Korean translation was replaced or made stale.
- Add a deliberately narrow DeepSeek Search/Fetch provider with the four required sourced facts. Preserve Alpaca's existing Market Data v2 facts and dates; Assets is a separate contract. Connect existing schema, credential-safety and LLM selection Guides.
- Alpaca: separate merged PR #826 from the latest published v0.44.0. The release enum lacks TXSE. The raw-data branch is source evidence, not a tested workaround; constructor documentation and implementation disagree.
- DeepSeek: separate chat and tool key/origin ownership, Messages-based search and dedicated retrieval, and authentication/balance/rate errors. The merged OpenClaw guard covers model-key fallback, not every credential path.
- Publication research caught OpenClaw v2026.10.8, released after the morning report. The compare API reports a divergent history from the reviewed patch; no shipped remedy is claimed. Selected public metadata is retained in `case-studies/evidence/openclaw-release-gap-2026-10-27.json`; the matching Alpaca receipt records release/merge timestamps and the inspected tag enum.
- Both cases remain source-review. Article snippets are locally authored illustrative preflights, not copied upstream code or live SDK tests. Proposed network controls were not run. No exact GetBeta production remedy was established.

## Validation approach

- Node 24.22.1; install the unchanged lockfile using a writable temporary npm cache. Worktree, dependencies and browser-download attempts use a separate temporary filesystem, without deleting unrelated workspace data.
- The first full run passed 43 tests, then Astro attempted its unavailable default home config. Set `ASTRO_TELEMETRY_DISABLED=1` and `XDG_CONFIG_HOME=/tmp/atlas_config`; no product or assertion changes were needed.
- Run full validation for both deployment layouts, after the final pending change:

```sh
ASTRO_TELEMETRY_DISABLED=1 XDG_CONFIG_HOME=/tmp/atlas_config \
  SITE_URL=https://api-atlas.pages.dev BASE_PATH=/ npm run validate
ASTRO_TELEMETRY_DISABLED=1 XDG_CONFIG_HOME=/tmp/atlas_config \
  SITE_URL=https://getbeta.app BASE_PATH=/api-atlas/ npm run validate
```

- Add two source-contract tests for recipe/generated content/evidence hashes, provider linkage and source-review author metadata. Add two browser tests for no-JavaScript reading, canonical URLs and provider discovery. These validate Atlas publishing, not vendor behavior.
- Local browser execution is blocked: managed Chromium ZIP downloads were truncated; installed Chromium failed with `socket() failed: Operation not permitted`. Test discovery is not browser execution. The exact pushed commit's CI must establish browser results.

## Local results

- Independent content review passed with no blocking finding.
- Final root and subpath `npm run validate` both passed: 45 tests, Astro 0 errors / 0 warnings, 36 providers / 161 sourced facts, 23 Guides / 16 reviewed cases, 9 Korean Guides / 4 providers / 1 comparison, and 155 required outputs / 108 HTML pages. Subpath reported one existing unused `Props` hint; no assertion was changed.
- Browser discovery loaded 25 tests in 7 files. Local browser assertions were not executed for the environment reasons above; CI remains the browser gate. `git diff --check` passed.

## Publication and search boundaries

The user authorized applying these cases and committing/pushing. No paid or authenticated supplier request, secret creation/collection, GetBeta product edit, forced update, manual deployment or hosting-policy change was performed. Main may trigger existing automatic publishing. Deployment success and Search Console URL inspection, selected canonical, indexing and search-performance receipts remain unverified until separately observed. Keywords are candidates, not measured search demand.
