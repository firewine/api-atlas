# Five requested practical integration cases

- Date: 2026-10-16 (Asia/Seoul)
- Repository: firewine/api-atlas
- Baseline: main at f58fa76, clean after synchronizing the already-published implementation and preserving its English Gemini/Massive articles.
- Scope: publish the five missing English Guides, their reviewed recipes and bounded source evidence, plus a SEIBRO research profile for the related-provider link.

## Published source files

- `eodhd-dividend-delay-cache-refresh`: delayed observations versus cache reuse; bypass reads and writes without claiming all old windows are recovered.
- `seibro-dividend-pagination-count-mismatch`: count, page coverage, duplicate rows, empty terminal range and count recheck; financial confirmation remains separate.
- `ecos-usd-currency-identity-validation`: strict USD row selection, original decimal text, no blind first-row fallback; the reviewed legacy fallback remains an explicit limitation.
- `llm-retry-fallback-shared-timeout-budget`: one monotonic budget, SDK retry ownership and remaining-time fallback.
- `llm-structured-output-fallback-response-format`: preserve the original output contract; unsupported application adapters are distinct from vendor API capabilities.

The articles use the existing English Guide template, dated TechArticle metadata, canonical paths, sitemap and descriptive provider backlinks. Titles, summaries and search intent candidates are authored per case. No traffic/ranking claim is made.

## Evidence and scope

The implementation review uses pinned GetBeta revision `890c2531b76c2fad834da80c58ac166908afdde1`, bounded source excerpts, original test definitions and the dependency lock. Public Python examples are reduced adaptations with synthetic inputs, without customer data or credentials. Source-repository links may require access. Original application tests and authenticated provider calls were not run.

The checked-in fixture executes each published Python block with positive and negative cases. The execution receipt records Python 3.9.6 and the actual successful checks. Official EODHD and OpenAI references were read separately. SEIBRO remains `research`: public REST contract, reusable authentication, pricing and rate allowance were not independently established and are not invented.

## Verification

| Command | Exit | Result |
| --- | ---: | --- |
| `node --test tests/getbeta-cases.test.mjs` | 0 | All 5 actual published code blocks pass synthetic checks |
| `SITE_URL=https://getbeta.app BASE_PATH=/api-atlas/ npm run validate:ci` | 0 | 21 tests, Astro 0 errors/warnings, 6 browser tests |
| `SITE_URL=https://api-atlas.pages.dev BASE_PATH=/ npm run validate:ci` | 0 | Same checks pass |
| `git diff --check` | 0 | No whitespace errors |

Both builds verify 34 providers / 153 sourced facts, 14 Guides / 7 reviewed cases, 125 required outputs / 80 HTML pages. Browser verification reads all five requested pages without JavaScript and checks their listing links, headings, code, author, English language and canonical URL; it also checks the SEIBRO provider backlink.

Existing test assertions were preserved. The integration-test inventory assertion now derives the exact expected source Guide/case counts instead of hard-coding the previous two-case inventory. No skip/only or provider network mock was added; the reduced examples use injected synthetic boundaries.

## Publication boundary

Local checks above are complete. GitHub Actions and production HTTP/browser checks must be reported separately after push. Search Console indexing and traffic remain UNVERIFIED until an owner performs the documented post-deploy review.
