---
name: "EODHD"
provider: "EOD Historical Data"
category: "market-data"
status: "active"
officialDocs: "https://eodhd.com/financial-apis/api-for-historical-data-and-volumes"
homepage: "https://eodhd.com/"
baseUrl: "https://eodhd.com/api"
auth: "API token in the api_token query parameter"
versioning: "Endpoint-family paths; many core REST endpoints do not use a global version prefix."
resourceGroups: ["End-of-day history", "Fundamentals", "Splits and dividends", "Intraday and live", "News and calendars"]
pagination: "Endpoint-specific; time series use date ranges while list resources document their own paging fields."
errors: "HTTP status codes are used; the EOD documentation identifies 401 for an invalid API token."
webhooks: "No general webhook product was confirmed in the reviewed official documentation."
sdks: ["Python", "R", "Node.js", "PHP", "Java"]
summary: "A broad financial-data API covering end-of-day prices, fundamentals, corporate actions, intraday data, news, and more."
pricing: "Free trial tier plus paid personal and commercial plans; entitlements differ by dataset."
rateLimit: "Plan-based daily and per-minute limits."
formats: ["JSON", "CSV"]
protocols: ["REST", "WebSocket"]
bestFor:
  - "Global end-of-day history"
  - "Dividends and splits"
  - "A single vendor spanning several market datasets"
cautions:
  - "Personal plans are not a substitute for a commercial data license."
  - "Real-time coverage and exchange entitlements vary by plan."
verifiedAt: "2026-09-13"
sourceUrls:
  - "https://eodhd.com/financial-apis/api-for-historical-data-and-volumes"
  - "https://eodhd.com/pricing"
mutableFacts:
  - label: "Base URL"
    value: "https://eodhd.com/api"
    sourceUrl: "https://eodhd.com/financial-apis/api-for-historical-data-and-volumes"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "API token in the api_token query parameter"
    sourceUrl: "https://eodhd.com/financial-apis/api-for-historical-data-and-volumes"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Free trial tier plus paid personal and commercial plans with dataset-specific entitlements"
    sourceUrl: "https://eodhd.com/pricing"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "The free EOD allowance is 20 calls per day; paid limits depend on plan"
    sourceUrl: "https://eodhd.com/financial-apis/api-for-historical-data-and-volumes"
    verifiedAt: "2026-09-13"
  - label: "Free allowance"
    value: "20 API calls per day with a one-year EOD history window"
    sourceUrl: "https://eodhd.com/financial-apis/api-for-historical-data-and-volumes"
    verifiedAt: "2026-09-13"
  - label: "Paid entry point"
    value: "EOD Historical Data — All World is listed at USD 19.99/month on monthly billing"
    sourceUrl: "https://eodhd.com/pricing"
    verifiedAt: "2026-09-13"
tags: ["stocks", "etfs", "fundamentals", "dividends", "historical-data"]
---

## What it covers

EODHD exposes a family of market-data endpoints rather than one narrow feed. The EOD endpoint returns daily, weekly, or monthly OHLCV history; the wider catalog adds fundamentals, dividends, splits, intraday prices, calendars, exchange metadata, news, and selected real-time feeds.

## Request shape

```bash
curl "https://eodhd.com/api/eod/AAPL.US?api_token=YOUR_TOKEN&fmt=json"
```

The EOD endpoint defaults to CSV. Set `fmt=json` when a JSON response is easier to consume. Keep the token server-side even though query-string authentication is supported.

## Decision notes

EODHD is a practical fit when a product wants broad market coverage from one integration. Before production use, match every required dataset to the actual plan and license; a personal subscription does not automatically grant redistribution rights.
