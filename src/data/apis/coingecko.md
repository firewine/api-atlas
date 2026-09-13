---
name: "CoinGecko API"
provider: "CoinGecko"
category: "market-data"
status: "active"
officialDocs: "https://docs.coingecko.com/reference/introduction"
homepage: "https://www.coingecko.com/en/api"
baseUrl: "https://api.coingecko.com/api/v3"
auth: "Plan-specific API key header for Demo or Pro access"
versioning: "Current public REST base uses api/v3"
resourceGroups: ["Coins","Prices","Market data","Exchanges","NFTs","Onchain"]
pagination: "Endpoint-specific page and per_page parameters"
errors: "HTTP status codes with JSON bodies"
webhooks: "No general webhooks documented"
sdks: []
summary: "Crypto asset prices, metadata, markets, exchanges, NFTs, and onchain datasets."
pricing: "Demo and paid plans; current entitlements are plan-specific"
rateLimit: "Plan-specific request limits documented by CoinGecko"
formats: ["JSON"]
protocols: ["REST","WebSocket"]
bestFor: ["Crypto market discovery","Broad asset and exchange metadata"]
cautions: ["Asset IDs are safer than ticker symbols.","Freshness and endpoint access vary by plan."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://docs.coingecko.com/reference/introduction","https://docs.coingecko.com/reference/authentication"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.coingecko.com/api/v3"
    sourceUrl: "https://docs.coingecko.com/reference/introduction"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "Plan-specific API key header for Demo or Pro access"
    sourceUrl: "https://docs.coingecko.com/reference/authentication"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Demo and paid plans; current entitlements are plan-specific"
    sourceUrl: "https://docs.coingecko.com/reference/authentication"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Plan-specific request limits documented by CoinGecko"
    sourceUrl: "https://docs.coingecko.com/reference/authentication"
    verifiedAt: "2026-09-13"
tags: ["coins","prices","market-data"]
---

## What it covers

Crypto asset prices, metadata, markets, exchanges, NFTs, and onchain datasets. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Decision notes

Best suited to crypto market discovery and broad asset and exchange metadata. Before production, verify asset ids are safer than ticker symbols. freshness and endpoint access vary by plan. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.
