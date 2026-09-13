---
name: "World Bank Indicators API"
provider: "World Bank"
category: "public-data"
status: "active"
officialDocs: "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation"
homepage: "https://data.worldbank.org/"
baseUrl: "https://api.worldbank.org/v2"
auth: "No API key or authentication required"
versioning: "Version 2; version 1 is retired"
resourceGroups: ["Countries","Indicators","Sources","Topics","Income levels","Lending types"]
pagination: "page and per_page parameters with response metadata"
errors: "HTTP errors and format-specific error payloads"
webhooks: "No webhooks documented"
sdks: []
summary: "Public access to World Bank development indicators and their country, source, and topic metadata."
pricing: "Free public access"
rateLimit: "No fixed public quota recorded in the reviewed overview"
formats: ["XML","JSON","JSON-stat","CSV"]
protocols: ["REST"]
bestFor: ["Cross-country development indicators","Long-run public datasets"]
cautions: ["V1 endpoints no longer work.","Revisions and missing country-year values require explicit handling."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation","https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.worldbank.org/v2"
    sourceUrl: "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "No API key or authentication required"
    sourceUrl: "https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Free public access"
    sourceUrl: "https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "No fixed public quota recorded in the reviewed overview"
    sourceUrl: "https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures"
    verifiedAt: "2026-09-13"
tags: ["countries","indicators","sources","public-data"]
---

## What it covers

Public access to World Bank development indicators and their country, source, and topic metadata. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Decision notes

Best suited to cross-country development indicators and long-run public datasets. Before production, verify v1 endpoints no longer work. revisions and missing country-year values require explicit handling. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.
