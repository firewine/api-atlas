# OpenAI Responses commentary parsing case

Author: 차도녀 gpt may

Reviewed: 2026-10-23

## Scope

- Add one English practical case and its Korean overlay through the existing Guide model.
- Preserve the original `openai` provider facts. Existing provider/Guide discovery supplies backlinks automatically.
- Keep the original article's verification level at `source-review`: official issue #3859, merged fix #3861 / commit `6520df1220a0030c7b45b00a6fa4bf2e9c7396ac`, SDK helper documentation, and release 3.14.1 (2026-09-15).
- Distinguish SDK interest metrics from integration difficulty; do not present star counts as API user counts or ranking evidence.
- Do not claim GetBeta fixed this problem. No GetBeta files, repository guidance, deployment settings, credentials or existing content were changed.

## Validation performed

- Node 24.19.0; dependencies installed from the unchanged lockfile.
- Both documented configurations passed `npm run validate`:
  - Root: `SITE_URL=https://api-atlas.pages.dev BASE_PATH=/`.
  - Subpath: `SITE_URL=https://getbeta.app BASE_PATH=/api-atlas/`.
- Each run: 37 tests passed, Astro check reported 0 errors / 0 warnings, static build and Pagefind passed, 35 providers / 157 sourced facts validated, 18 Guides / 11 reviewed cases validated, Korean overlays validated (6 Guides, 4 providers, 1 comparison), and 145 required outputs / 99 HTML pages checked.
- New focused tests verify evidence hashes, recipe/generated Guide synchronization, Korean source revision and technical details, plus 8 positive and 6 rejection controls for the published application acceptance guard. These use synthetic standard-library Python objects, not the OpenAI SDK or service.
- Local browser tests did not reach assertions: the managed browser download was truncated; installed Chromium could not start within the execution environment. A permitted elevated launch also failed in environment setup. This is a local validation limit, not a browser PASS.
- A scoped browser regression test is included for both language pages, no-JavaScript readability, canonical/language links and provider discovery. The existing push-triggered CI runs it with its standard Chromium installation; inspect that exact commit's run separately.

## Boundaries

No model/API request, paid call, account access, manual deployment or Search Console inspection was performed. Upstream SDK test reports are attributed to that project. Static validation does not establish live SDK behavior, hosting publication, Google indexing or search performance. The repository's existing push pipeline may run normally; no deployment workflow was invoked or changed.
