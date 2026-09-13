---
name: "Treasury Fiscal Data API"
provider: "U.S. Department of the Treasury"
category: "public-data"
status: "active"
officialDocs: "https://fiscaldata.treasury.gov/api-documentation/"
homepage: "https://fiscaldata.treasury.gov/"
baseUrl: "https://api.fiscaldata.treasury.gov/services/api/fiscal_service"
auth: "No authentication required for public endpoints"
versioning: "Versioned dataset paths such as v1"
resourceGroups: ["Debt","Revenue","Spending","Interest and exchange rates","Savings bonds"]
pagination: "page[number] and page[size], with meta and links"
errors: "HTTP status and JSON error information"
webhooks: "No webhooks documented"
sdks: []
summary: "Official U.S. Treasury fiscal datasets with filtering, sorting, field selection, and pagination."
pricing: "Free public access"
rateLimit: "No fixed numeric limit recorded; clients should cache and request responsibly"
formats: ["JSON","CSV"]
protocols: ["REST"]
bestFor: ["Federal debt and cash data","Machine-readable fiscal series"]
cautions: ["Each dataset has its own update cadence.","Read dataset metadata before combining series."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://fiscaldata.treasury.gov/api-documentation/","https://fiscaldata.treasury.gov/api-documentation/#getting-started"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.fiscaldata.treasury.gov/services/api/fiscal_service"
    sourceUrl: "https://fiscaldata.treasury.gov/api-documentation/"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "No authentication required for public endpoints"
    sourceUrl: "https://fiscaldata.treasury.gov/api-documentation/#getting-started"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Free public access"
    sourceUrl: "https://fiscaldata.treasury.gov/api-documentation/#getting-started"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "No fixed numeric limit recorded; clients should cache and request responsibly"
    sourceUrl: "https://fiscaldata.treasury.gov/api-documentation/#getting-started"
    verifiedAt: "2026-09-13"
tags: ["debt","revenue","spending","public-data"]
---

## What it covers

Official U.S. Treasury fiscal datasets with filtering, sorting, field selection, and pagination. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Decision notes

Best suited to federal debt and cash data and machine-readable fiscal series. Before production, verify each dataset has its own update cadence. read dataset metadata before combining series. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.
