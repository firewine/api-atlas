---
title: "Treasury Fiscal Data API vs FRED API"
summary: "Compare the U.S. Treasury's fiscal datasets with the Federal Reserve Bank of St. Louis's economic series by coverage, authentication, discovery, and revision semantics."
providers: ["treasury-fiscal-data", "fred"]
verdict: "Reach for the Treasury Fiscal Data API when the question is what the U.S. federal government collected, spent, or owes; reach for FRED when the question is the state of the economy — both are free, but their coverage, metadata, and discovery models differ."
order: 10
verifiedAt: "2026-10-15"
sourceUrls:
  - "https://fiscaldata.treasury.gov/api-documentation/"
  - "https://fiscaldata.treasury.gov/api-documentation/#getting-started"
  - "https://fred.stlouisfed.org/docs/api/fred/"
  - "https://fred.stlouisfed.org/docs/api/fred/api_key.html"
---

## Integration shape

Both are free U.S. government data APIs, but they answer different questions. The Treasury Fiscal Data API serves versioned dataset paths under `/services/api/fiscal_service` with no authentication: debt, revenue, spending, interest rates, and savings bonds, with `page[number]`/`page[size]` pagination and field selection. FRED serves economic time series under `api.stlouisfed.org/fred` with an API key in the query parameter, organized around series, observations, categories, releases, sources, and tags, with `limit`/`offset` pagination and JSON, XML, CSV, and XLSX formats.

| Decision axis | Treasury Fiscal Data | FRED |
| --- | --- | --- |
| Coverage | Federal fiscal datasets: debt, revenue, spending, interest, savings bonds | Hundreds of thousands of economic time series across sources |
| Auth | None required for public endpoints | API key query parameter |
| Pricing | Free public access | Free API key access under FRED terms |
| Discovery | Versioned dataset paths (e.g. v1) with filters | Series search, categories, releases, tags, sources |
| Formats | JSON and CSV | JSON, XML, CSV, and XLSX |
| Revisions | Each dataset has its own update cadence | Observation revisions are normal; units, frequency, and seasonal adjustment are first-class metadata |
| Rate limits | No fixed numeric limit recorded; cache and request responsibly | Official documentation governs limits; avoid encoding an unverified fixed number |

## Where Treasury Fiscal Data wins

It is the authoritative machine-readable source for what the federal government collected, spent, and owes. No key registration means one less onboarding step, and the dataset-path model with filtering, sorting, and field selection maps cleanly onto fiscal questions like outstanding debt by date or receipts by category.

## Where FRED wins

Breadth and metadata. FRED's release calendars, revision history, and series-level metadata (units, frequency, seasonal adjustment) make it the better fit for economic analysis where the question is the state of the economy rather than the state of the ledger. The category/release/tag discovery model scales to exploratory work across many indicators.

## Match the question to the institution

Do not mix fiscal-year debt figures with calendar-quarter macro series without checking both sides' metadata. Read each dataset's update cadence before combining series, and persist units, frequency, and retrieval time alongside the observations — a number without its vintage is a liability in fiscal and economic work alike.
