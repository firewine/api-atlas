---
name: "Alpha Vantage"
provider: "Alpha Vantage"
category: "market-data"
status: "active"
officialDocs: "https://www.alphavantage.co/documentation/"
homepage: "https://www.alphavantage.co/"
baseUrl: "https://www.alphavantage.co/query"
auth: "API key in the apikey query parameter"
versioning: "Function-based endpoints without a documented global version prefix."
resourceGroups: ["Time series", "Fundamentals", "Technical indicators", "Forex and crypto", "Economic indicators"]
pagination: "Function-specific output-size and date parameters rather than one uniform cursor contract."
errors: "JSON responses may carry Note, Information, or Error Message fields; validate them before consuming data."
webhooks: "No general webhook product was confirmed in the reviewed official documentation."
sdks: []
summary: "A function-based market-data API for equities, options, forex, crypto, commodities, economic indicators, fundamentals, and technical indicators."
pricing: "A free standard allowance and paid premium request-rate plans."
rateLimit: "The standard free usage limit is 25 requests per day; premium plans raise throughput."
formats: ["JSON", "CSV"]
protocols: ["REST"]
bestFor:
  - "Small prototypes and educational projects"
  - "Technical indicator endpoints"
  - "Function-style queries from scripts and spreadsheets"
cautions:
  - "The free allowance is too small for most production ingestion jobs."
  - "Some datasets and real-time entitlements are premium."
verifiedAt: "2026-09-13"
sourceUrls:
  - "https://www.alphavantage.co/documentation/"
  - "https://www.alphavantage.co/premium/"
mutableFacts:
  - label: "Base URL"
    value: "https://www.alphavantage.co/query"
    sourceUrl: "https://www.alphavantage.co/documentation/"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "API key in the apikey query parameter"
    sourceUrl: "https://www.alphavantage.co/documentation/"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "A free standard allowance and paid premium request-rate plans"
    sourceUrl: "https://www.alphavantage.co/premium/"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "The standard free usage limit is 25 requests per day; premium throughput is plan-specific"
    sourceUrl: "https://www.alphavantage.co/premium/"
    verifiedAt: "2026-09-13"
  - label: "Standard allowance"
    value: "25 API requests per day"
    sourceUrl: "https://www.alphavantage.co/premium/"
    verifiedAt: "2026-09-13"
  - label: "Premium daily cap"
    value: "Premium plans advertise no daily request limit, with plan-specific per-minute throughput"
    sourceUrl: "https://www.alphavantage.co/premium/"
    verifiedAt: "2026-09-13"
tags: ["stocks", "forex", "technical-indicators", "fundamentals", "economic-data"]
---

## What it covers

Alpha Vantage routes most requests through a single `/query` endpoint. The `function` parameter selects a dataset or calculation, while other query parameters define the symbol, interval, output size, and format.

## Request shape

```bash
curl "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=YOUR_KEY"
```

The documentation defines each function separately. Validate output metadata and error or throttling messages before treating a response as market data.

## Decision notes

Alpha Vantage is easy to test, but the 25-request daily standard limit makes caching and a narrow refresh scope essential. Confirm commercial rights and any real-time exchange entitlements before shipping a user-facing product.
