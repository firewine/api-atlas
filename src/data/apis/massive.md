---
name: "Massive"
provider: "Massive.com (formerly Polygon.io)"
category: "market-data"
status: "active"
officialDocs: "https://massive.com/docs/rest/quickstart"
homepage: "https://massive.com/"
baseUrl: "https://api.massive.com"
auth: "Bearer API key or apiKey query parameter"
versioning: "Resource paths use endpoint-family versions such as v1, v2, and v3."
resourceGroups: ["Stocks", "Options", "Futures", "Indices", "Forex and crypto", "Economy"]
pagination: "Endpoint-specific cursor fields and next_url links are used for multi-page result sets."
errors: "Structured JSON responses include status and request_id fields for diagnostics."
webhooks: "No general webhook product was confirmed in the reviewed REST quickstart."
sdks: ["Python", "Go", "Kotlin", "JavaScript"]
summary: "A market-data platform for stocks, options, futures, indices, forex, crypto, economic, and alternative datasets."
pricing: "Free and paid asset-class plans; business licensing is separate from individual plans."
rateLimit: "The free Stocks Basic plan lists 5 API calls per minute; paid plan behavior depends on product and entitlement."
formats: ["JSON", "Flat files"]
protocols: ["REST", "WebSocket", "S3-compatible flat files"]
bestFor:
  - "U.S. equity aggregates and reference data"
  - "REST plus WebSocket market-data access"
  - "Teams that also need bulk flat files"
cautions:
  - "Individual pricing is not a commercial redistribution license."
  - "Real-time feeds and historical depth are entitlement-dependent."
verifiedAt: "2026-09-13"
sourceUrls:
  - "https://massive.com/docs/rest/quickstart"
  - "https://massive.com/pricing"
mutableFacts:
  - label: "Base URL"
    value: "https://api.massive.com"
    sourceUrl: "https://massive.com/docs/rest/quickstart"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "Bearer API key or apiKey query parameter"
    sourceUrl: "https://massive.com/docs/rest/quickstart"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Free and paid asset-class plans; business licensing is separate from individual plans"
    sourceUrl: "https://massive.com/pricing"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "The free Stocks Basic plan lists 5 API calls per minute; paid behavior depends on product and entitlement"
    sourceUrl: "https://massive.com/pricing"
    verifiedAt: "2026-09-13"
  - label: "Free stocks limit"
    value: "Stocks Basic is listed at USD 0 with 5 API calls per minute and two years of historical data"
    sourceUrl: "https://massive.com/pricing"
    verifiedAt: "2026-09-13"
  - label: "Brand"
    value: "The service documents REST requests on api.massive.com"
    sourceUrl: "https://massive.com/docs/rest/quickstart"
    verifiedAt: "2026-09-13"
tags: ["stocks", "options", "websocket", "aggregates", "historical-data"]
---

## What it covers

Massive offers REST request/response APIs, WebSocket streams, and bulk flat files across multiple asset classes. The REST quickstart uses dividends to demonstrate the common JSON response shape with `status`, `results`, and `request_id` fields.

## Request shape

```bash
curl "https://api.massive.com/v3/reference/dividends" \
  -H "Authorization: Bearer $MASSIVE_API_KEY"
```

The query-string `apiKey` form also works, but authorization headers reduce accidental key leakage through logs and copied URLs.

## Decision notes

Compare Massive plans on four axes: asset class, historical depth, feed latency, and usage rights. “Unlimited calls” does not by itself answer whether the data may be displayed or redistributed in a commercial product.
