# Anthropic mixed server/client tools case

Author: 차도녀 gpt may

Reviewed: 2026-10-23

## Scope

- Add one English practical case and its Korean overlay through the existing Guides model, plus the operational-fit link in `choose-llm-api`.
- Preserve the Anthropic provider's existing facts; the shared Guide/provider discovery provides the backlink.
- Store eight dated, hashed public-source excerpts, including a commit-pinned SDK result type and both official issue follow-ups.
- Explain deferred direct server calls, tool-result-only continuation, unchanged tools, ID correlation, `pause_turn`, and multi-round programmatic container reuse.
- Keep the article at `source-review`. Historical SDK/model/tool versions are issue-specific, not universal current support or a fixed-version recommendation.
- Do not implement or claim a GetBeta production fix. No existing OpenAI case, provider facts, repository instructions, dependencies, workflows, credentials or deployment configuration were changed.

## Validation performed

- Node 24.19.0, existing dependencies from the unchanged lockfile. Per-process Astro telemetry was disabled to avoid unavailable home-directory configuration; no persistent application setting was changed.
- Both documented configurations passed `npm run validate`:
  - Root: `SITE_URL=https://api-atlas.pages.dev BASE_PATH=/`.
  - Subpath: `SITE_URL=https://getbeta.app BASE_PATH=/api-atlas/`.
- Each run: 39 tests passed; Astro check reported 0 errors, 0 warnings and one existing unused-interface hint; build/Pagefind passed; 35 providers and 157 sourced facts validated; 19 Guides and 12 reviewed cases validated; Korean overlays validated (7 Guides, 4 providers, 1 comparison); 147 required outputs and 101 HTML pages checked.
- Focused tests verify the recipe/generated body, all evidence hashes, Korean source revision, identical bilingual code and operational-fit link.
- Offline Python controls check normal continuation, state/definition preservation, delayed and already-present result IDs, client-error-shaped results, pause continuation and multi-round programmatic calls. Fifteen rejection controls exercise malformed or inappropriate continuations. No SDK, client tool or provider service is called by these tests.
- Independent source/code review found no blocking issue. Synthetic-test wording was tightened before the full passing validations.
- A browser regression test was added for both language pages, no-JavaScript readability, canonical/language links and provider/operational-fit discovery. Local browser execution remains unavailable in this sandbox and was not retried through an alternate route. Browser PASS must come from the exact pushed commit's existing CI, not from these static results.

## Boundaries

No Anthropic model/API request, paid call, new software installation, manual deployment or Search Console access was performed. Upstream issue observations are attributed reports. Static/offline success does not prove live API behavior, hosting publication, indexing, ranking or search volume. The existing push-triggered validation may run normally; no CI/deployment workflow was changed or manually invoked.
