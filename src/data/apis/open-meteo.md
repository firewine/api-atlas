---
name: "Open-Meteo API"
provider: "Open-Meteo"
category: "mapping-weather"
status: "active"
officialDocs: "https://open-meteo.com/en/docs"
homepage: "https://open-meteo.com/"
baseUrl: "https://api.open-meteo.com/v1"
auth: "No API key for non-commercial public access; commercial customer endpoints differ"
versioning: "v1 forecast paths"
resourceGroups: ["Forecast","Historical weather","Marine","Air quality","Geocoding"]
pagination: "Coordinate arrays replace conventional pagination for forecast calls"
errors: "HTTP status and JSON error responses"
webhooks: "No webhooks documented"
sdks: []
summary: "Weather forecast, historical, marine, air-quality, and geocoding APIs with an accessible public tier."
pricing: "Free non-commercial access and paid commercial plans"
rateLimit: "Usage limits and commercial terms are maintained on the official pricing page"
formats: ["JSON"]
protocols: ["REST"]
bestFor: ["Weather prototypes","Multi-location forecast requests"]
cautions: ["Attribution and license requirements vary by dataset.","Commercial use should use the appropriate customer plan."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://open-meteo.com/en/docs","https://open-meteo.com/en/pricing"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.open-meteo.com/v1"
    sourceUrl: "https://open-meteo.com/en/docs"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "No API key for non-commercial public access; commercial customer endpoints differ"
    sourceUrl: "https://open-meteo.com/en/pricing"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Free non-commercial access and paid commercial plans"
    sourceUrl: "https://open-meteo.com/en/pricing"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Usage limits and commercial terms are maintained on the official pricing page"
    sourceUrl: "https://open-meteo.com/en/pricing"
    verifiedAt: "2026-09-13"
tags: ["forecast","historical-weather","marine","mapping-weather"]
---

## What it covers

Weather forecast, historical, marine, air-quality, and geocoding APIs with an accessible public tier. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Decision notes

Best suited to weather prototypes and multi-location forecast requests. Before production, verify attribution and license requirements vary by dataset. commercial use should use the appropriate customer plan. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.
