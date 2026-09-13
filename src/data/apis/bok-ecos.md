---
name: "BOK ECOS"
provider: "Bank of Korea"
category: "public-data"
status: "active"
officialDocs: "https://ecos.bok.or.kr/api/"
homepage: "https://ecos.bok.or.kr/"
baseUrl: "https://ecos.bok.or.kr/api"
auth: "ECOS API key embedded in the request path"
versioning: "Service-name request paths; no global version prefix is documented in the reviewed developer guide."
resourceGroups: ["StatisticSearch", "StatisticTableList", "StatisticItemList", "KeyStatisticList"]
pagination: "Start and end row numbers are embedded in request paths."
errors: "Responses include ECOS result codes and messages; inspect them before reading rows."
webhooks: "No webhook interface was confirmed in the reviewed ECOS developer guide."
sdks: []
summary: "The Bank of Korea's official economic-statistics API for Korean monetary, financial, price, national-account, and related time series."
pricing: "Public API access after key registration."
rateLimit: "Service-policy limits apply to the registered key; confirm the current allowance in ECOS."
formats: ["JSON", "XML"]
protocols: ["REST"]
bestFor:
  - "Official Korean macroeconomic time series"
  - "Bank of Korea statistics"
  - "Reproducible series-code based retrieval"
cautions:
  - "Series codes and cycle values must be discovered before querying observations."
  - "Publication schedules differ by statistical series."
verifiedAt: "2026-09-13"
sourceUrls:
  - "https://ecos.bok.or.kr/api/"
  - "https://ecos.bok.or.kr/api/#/DevGuide/DevSpeciflcation"
mutableFacts:
  - label: "Base URL"
    value: "https://ecos.bok.or.kr/api"
    sourceUrl: "https://ecos.bok.or.kr/api/"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "ECOS API key embedded in the request path"
    sourceUrl: "https://ecos.bok.or.kr/api/#/DevGuide/DevSpeciflcation"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Public API access after key registration"
    sourceUrl: "https://ecos.bok.or.kr/api/"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "No fixed public quota was confirmed in the reviewed pages; confirm the registered key's current allowance in ECOS"
    sourceUrl: "https://ecos.bok.or.kr/api/"
    verifiedAt: "2026-09-13"
  - label: "Access"
    value: "The ECOS Open API is active and exposes key-statistics and statistical-search services"
    sourceUrl: "https://ecos.bok.or.kr/api/"
    verifiedAt: "2026-09-13"
tags: ["korea", "macroeconomics", "central-bank", "statistics"]
---

## What it covers

ECOS is the authoritative starting point for Bank of Korea statistics. It exposes catalog discovery, item lookup, statistical observations, key indicators, and release-calendar style information using stable statistical table and item codes.

## Request shape

```text
GET https://ecos.bok.or.kr/api/StatisticSearch/{API_KEY}/json/kr/1/10/{STAT_CODE}/{CYCLE}/{START}/{END}/{ITEM_CODE}
```

Start with the catalog endpoints, record the selected table and item codes, then query the actual time series. Store those codes alongside the data so later refreshes remain auditable.

## Decision notes

Prefer ECOS over secondary macro-data vendors when the required Korean series is available. Treat release timing, revisions, units, and frequency as part of the observation—not as display-only metadata.
