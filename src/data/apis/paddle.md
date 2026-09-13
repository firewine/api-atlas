---
name: "Paddle Billing API"
provider: "Paddle"
category: "payments"
status: "active"
officialDocs: "https://developer.paddle.com/api-reference/overview"
homepage: "https://www.paddle.com/"
baseUrl: "https://api.paddle.com"
auth: "Bearer API key in Authorization header"
versioning: "Versioning is documented through Paddle's API and changelog"
resourceGroups: ["Customers","Products","Prices","Transactions","Subscriptions","Adjustments"]
pagination: "Cursor pagination with after and per_page"
errors: "Structured error responses with request identifiers"
webhooks: "Signed notifications for subscription and transaction events"
sdks: ["Node.js","Python","PHP","Go"]
summary: "Merchant-of-record billing APIs for products, prices, customers, transactions, and subscriptions."
pricing: "Commercial merchant-of-record pricing; verify current terms"
rateLimit: "Rate limits are documented by endpoint and response headers"
formats: ["JSON"]
protocols: ["REST","Webhooks"]
bestFor: ["SaaS merchant-of-record billing","Subscription lifecycle automation"]
cautions: ["Sandbox and live credentials are separate.","Process notifications idempotently."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://developer.paddle.com/api-reference/overview","https://developer.paddle.com/api-reference/about/rate-limiting"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.paddle.com"
    sourceUrl: "https://developer.paddle.com/api-reference/overview"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "Bearer API key in Authorization header"
    sourceUrl: "https://developer.paddle.com/api-reference/about/rate-limiting"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Commercial merchant-of-record pricing; verify current terms"
    sourceUrl: "https://developer.paddle.com/api-reference/about/rate-limiting"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Rate limits are documented by endpoint and response headers"
    sourceUrl: "https://developer.paddle.com/api-reference/about/rate-limiting"
    verifiedAt: "2026-09-13"
tags: ["customers","products","prices","payments"]
---

## What it covers

Merchant-of-record billing APIs for products, prices, customers, transactions, and subscriptions. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Decision notes

Best suited to saas merchant-of-record billing and subscription lifecycle automation. Before production, verify sandbox and live credentials are separate. process notifications idempotently. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.
