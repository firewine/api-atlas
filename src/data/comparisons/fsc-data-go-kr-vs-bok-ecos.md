---
title: "FSC Fund Product API vs BOK ECOS"
summary: "Compare Korea's two flagship public finance APIs: the FSC fund-product identifier service on data.go.kr and the Bank of Korea's ECOS economic-statistics engine."
providers: ["fsc-data-go-kr", "bok-ecos"]
verdict: "Use the FSC fund-product service for official Korean fund identifiers and standard codes; use BOK ECOS for Korean macroeconomic time series — both are free public portals, but one is an identifier lookup and the other is a statistics engine."
order: 11
verifiedAt: "2026-10-15"
sourceUrls:
  - "https://www.data.go.kr/en/data/15094792/openapi.do"
  - "https://www.data.go.kr/catalog/15094792/openapi.json"
  - "https://ecos.bok.or.kr/api/"
  - "https://ecos.bok.or.kr/api/#/DevGuide/DevSpeciflcation"
---

## Integration shape

Both are Korean public-sector APIs, but they serve opposite ends of a workflow. The FSC service on data.go.kr exposes fund-product information — names, standard codes, operators, categories, types, reference dates — through a single operation with a `serviceKey` query parameter, `pageNo`/`numOfRows` pagination, and a listed development allowance of 10,000 requests. BOK ECOS is a statistics engine: series-code-based retrieval of monetary, financial, price, and national-account time series, with the API key embedded in the request path and start/end row numbers in the path for pagination.

| Decision axis | FSC Fund Product | BOK ECOS |
| --- | --- | --- |
| Coverage | Fund names, standard codes, operators, categories, types | Korean macroeconomic time series across many statistical tables |
| Auth | data.go.kr serviceKey query parameter | ECOS API key embedded in the request path |
| Pricing | Free with portal application; automatic approval listed | Public access after key registration |
| Free allowance | 10,000 requests listed for development | Service-policy limits on the registered key; confirm current allowance in ECOS |
| Update cadence | Daily collection; next-business-day availability after 13:00 | Publication schedules differ by statistical series |
| Discovery | Fund-name, short-code, type, and date filters on one operation | Catalog endpoints (table list, item list) before querying observations |
| Formats | JSON and XML | JSON and XML |

## Where the FSC service wins

Official identifier provenance. When a product needs the authoritative fund name, standard code, or operator for a Korean fund — for matching, enrichment, or display — this is the reference source, sourced from the Korea Financial Investment Association. The single-operation shape keeps integration small.

## Where ECOS wins

It is the authoritative starting point for Korean economic statistics, period. Stable statistical table and item codes make retrieval reproducible and auditable, and the catalog-first workflow (table list, then item list, then observations) suits scheduled ingestion of macro series far better than screen-scraping releases.

## An identifier lookup is not a statistics feed

Do not treat fund-product records as time series: the FSC service is not a live NAV or price feed, so persist `basDt` and retrieval time separately and never infer present availability from a historical record. Conversely, do not query ECOS observations until you have discovered the right table and item codes — series codes and cycle values are prerequisites, not guesses.
