---
title: "FRED API vs World Bank Indicators API"
summary: "Compare the U.S. macroeconomic time-series API with the cross-country development indicators API."
providers: ["fred", "world-bank"]
verdict: "Use FRED for U.S. macro series with release calendars and revision metadata; use the World Bank API for cross-country development indicators — both are free, but their coverage, formats, and revision semantics differ."
order: 8
verifiedAt: "2026-10-15"
sourceUrls:
  - "https://fred.stlouisfed.org/docs/api/fred/"
  - "https://fred.stlouisfed.org/docs/api/fred/api_key.html"
  - "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation"
  - "https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures"
---

## Integration shape

FRED requires a free API key passed as a query parameter and organizes data into series, observations, categories, releases, sources, and tags. The World Bank Indicators API needs no key at all and exposes countries, indicators, sources, topics, income levels, and lending types under a versioned `/v2` path (v1 is retired).

| Decision axis | FRED API | World Bank Indicators API |
| --- | --- | --- |
| Auth | Free API key, query parameter | None required |
| Pricing | Free under FRED terms | Free public access |
| Coverage | U.S. macroeconomic series | Cross-country development indicators |
| Formats | JSON, XML, CSV, XLSX | XML, JSON, JSON-stat, CSV |
| Pagination | limit, offset, sort_order | page and per_page with response metadata |
| Revisions | Observation revisions are normal | Revisions and missing country-year values need explicit handling |

## Where FRED API wins

Depth on the U.S. economy: series-level metadata, release calendars, and revision semantics that macro dashboards and research pipelines depend on. Multiple output formats, including XLSX, suit analyst workflows directly.

## Where World Bank Indicators API wins

Zero-friction access — no key, no signup — to long-run cross-country indicators with income-level and lending-type dimensions. Ideal for comparative development research, policy analysis, and teaching datasets.

## Preserve the metadata, not just the numbers

Both sources revise history. Store units, frequency, and seasonal-adjustment flags from FRED alongside each observation, and treat World Bank country-year gaps as data rather than errors. Do not encode a fixed FRED request quota in your code; the official documentation governs limits.
