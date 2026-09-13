---
name: "Cloudflare API"
provider: "Cloudflare"
category: "developer-platform"
status: "active"
officialDocs: "https://developers.cloudflare.com/api/overview/"
homepage: "https://www.cloudflare.com/developer-platform/"
baseUrl: "https://api.cloudflare.com/client/v4"
auth: "Scoped API token in Authorization Bearer header; legacy global API key also documented"
versioning: "client/v4 REST base with evolving endpoint resources"
resourceGroups: ["Accounts","Zones","DNS","Workers","Pages","R2","Rules"]
pagination: "Endpoint-specific pagination documented in each operation"
errors: "JSON success, errors, messages and result envelope"
webhooks: "Product-specific event and notification mechanisms"
sdks: ["TypeScript","Go","Python"]
summary: "A broad control-plane API for Cloudflare accounts, zones, DNS, Workers, Pages, storage, and security products."
pricing: "API operations manage products whose pricing and entitlements vary"
rateLimit: "Cloudflare documents global and endpoint-specific limits"
formats: ["JSON"]
protocols: ["REST"]
bestFor: ["Edge-platform automation","DNS and zone management"]
cautions: ["Prefer narrowly scoped tokens.","Account and zone identifiers are required by many operations."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://developers.cloudflare.com/api/overview/","https://developers.cloudflare.com/fundamentals/api/get-started/create-token/"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.cloudflare.com/client/v4"
    sourceUrl: "https://developers.cloudflare.com/api/overview/"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "Scoped API token in Authorization Bearer header; legacy global API key also documented"
    sourceUrl: "https://developers.cloudflare.com/fundamentals/api/get-started/create-token/"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "API operations manage products whose pricing and entitlements vary"
    sourceUrl: "https://developers.cloudflare.com/fundamentals/api/get-started/create-token/"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Cloudflare documents global and endpoint-specific limits"
    sourceUrl: "https://developers.cloudflare.com/fundamentals/api/get-started/create-token/"
    verifiedAt: "2026-09-13"
tags: ["accounts","zones","dns","developer-platform"]
---

## What it covers

A broad control-plane API for Cloudflare accounts, zones, DNS, Workers, Pages, storage, and security products. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Decision notes

Best suited to edge-platform automation and dns and zone management. Before production, verify prefer narrowly scoped tokens. account and zone identifiers are required by many operations. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.
