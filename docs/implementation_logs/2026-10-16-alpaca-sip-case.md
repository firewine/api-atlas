# Alpaca provider and recent SIP entitlement case

Author: 차도녀 gpt may
Reviewed: 2026-10-16
Base: `0ea2c204ab39e59ae8b68487453074867623d36d`

## Scope

- Added the Alpaca US equities market-data provider, with all four required dated sourced facts.
- Added one English practical case: `alpaca-api-recent-sip-data-error-iex`.
- Added its review recipe and four short public evidence snapshots, including current `alpaca-py` request-model lines pinned to `0c6f1e5234271874591fe12b62b91f749b681792`.
- Added two automated tests: recipe/guide/evidence consistency and execution of the published request-planning example against offline controls.
- Existing provider/guide backlinks, catalog, search, sitemap and structured data derive from the content collections; no routing or template change was needed.

## Technical and editorial review

The case explains JSON error code `42210000`, Basic historical SIP end-time eligibility, and the separate entitlement requirements for latest/snapshot SIP. It explicitly distinguishes consolidated SIP from IEX-only coverage. The example requires a feed choice and rejects recent SIP rather than silently changing the feed or requested range. A one-minute margin is an implementation choice, not a claimed vendor requirement.

The FAQ, historical bars reference and Python SDK documentation describe defaults differently. The article avoids depending on any inferred default by supplying feed and end explicitly. The pinned current SDK source was read through GitHub. Legacy issue #394 is labeled as a closed 2021 report in the repository archived June 17, 2026, not a current SDK defect.

The article retains `verification.level: source-review`. Offline tests validate the local helper, not provider behavior. No authenticated API request, paid subscription, SDK installation/test, account entitlement check or order was performed. Evidence contains no credentials or private account data.

## Validation receipts

On 2026-10-16, `npm run validate` passed for both:

- `SITE_URL=https://getbeta.app BASE_PATH=/api-atlas/`
- `SITE_URL=https://api-atlas.pages.dev BASE_PATH=/`

Each run passed 23 tests; Astro diagnostics reported zero errors, warnings and hints. Catalog validation covered 35 providers and 157 sourced facts; guide validation covered 15 guides and 8 reviewed cases; distribution validation covered 128 required outputs and 82 HTML pages. This includes static canonical, metadata, internal-link, provider backlink and sitemap checks. Independent content review found no high-priority issues and reran the two Alpaca tests successfully.

The Python fixture checks delayed SIP and the exact 15-minute boundary, recent IEX with its coverage label retained, timezone normalization, and 11 rejection controls including omitted/unknown feed, recent SIP, naive timestamps, future/reversed intervals and empty symbols. No network requests occur in that fixture.

The first environment setup attempts failed because default npm/Astro cache directories were unavailable. Retrying with writable cache/config directories succeeded; no dependency versions or validation rules were changed. Browser tests were not run: this change adds content and offline tests only, with no workflow, URL or runtime implementation changes.

## Publication and Search Console

This change is prepared for a local commit only. Push, pull request, deployment and production verification are outside this receipt. Search Console URL inspection, Google-selected canonical, sitemap processing and query/impression/click reports are unverified/pending. Static sitemap inclusion is not evidence of indexing or traffic.
