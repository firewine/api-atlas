---
name: "FRED API"
provider: "Federal Reserve Bank of St. Louis"
category: "public-data"
status: "active"
officialDocs: "https://fred.stlouisfed.org/docs/api/fred/"
homepage: "https://fred.stlouisfed.org/"
baseUrl: "https://api.stlouisfed.org/fred"
auth: "API key query parameter"
versioning: "FRED API v1 paths; FRED API v2 is separately documented"
resourceGroups: ["Series","Observations","Categories","Releases","Sources","Tags"]
pagination: "limit, offset, sort_order and endpoint-specific filters"
errors: "Structured XML or JSON error responses"
webhooks: "No webhooks documented"
sdks: []
summary: "Official programmatic access to FRED economic series, observations, releases, sources, and metadata."
pricing: "Free API key access under FRED terms"
rateLimit: "Official documentation governs request limits; avoid encoding an unverified fixed number"
formats: ["JSON","XML","CSV","XLSX"]
protocols: ["REST"]
bestFor: ["U.S. macroeconomic time series","Economic metadata and release calendars"]
cautions: ["Observation revisions are normal.","Preserve units, frequency and seasonal adjustment metadata."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://fred.stlouisfed.org/docs/api/fred/","https://fred.stlouisfed.org/docs/api/fred/api_key.html"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.stlouisfed.org/fred"
    sourceUrl: "https://fred.stlouisfed.org/docs/api/fred/"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "API key query parameter"
    sourceUrl: "https://fred.stlouisfed.org/docs/api/fred/api_key.html"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Free API key access under FRED terms"
    sourceUrl: "https://fred.stlouisfed.org/docs/api/fred/api_key.html"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Official documentation governs request limits; avoid encoding an unverified fixed number"
    sourceUrl: "https://fred.stlouisfed.org/docs/api/fred/api_key.html"
    verifiedAt: "2026-09-13"
tags: ["series","observations","categories","public-data"]
---

## What it covers

Official programmatic access to FRED economic series, observations, releases, sources, and metadata. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Decision notes

Best suited to u.s. macroeconomic time series and economic metadata and release calendars. Before production, verify observation revisions are normal. preserve units, frequency and seasonal adjustment metadata. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.
