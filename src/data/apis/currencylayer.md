---
name: "Currencylayer"
provider: "APILayer"
category: "currency-data"
status: "active"
officialDocs: "https://docs.apilayer.com/currencylayer/docs/api-documentation"
homepage: "https://currencylayer.com/"
baseUrl: "https://api.currencylayer.com"
auth: "Access key supplied with the access_key request parameter"
versioning: "Named REST endpoints without a documented global version prefix."
resourceGroups: ["Live rates", "Historical rates", "Conversion", "Timeframe", "Currency change"]
pagination: "Core rate responses do not use a uniform cursor; collection behavior is endpoint-specific."
errors: "Failures use a JSON error object; check the success field before consuming rates."
webhooks: "No general webhook product was confirmed in the reviewed official documentation."
sdks: []
summary: "A hosted foreign-exchange API for live, historical, conversion, timeframe, and currency-change queries."
pricing: "Free non-commercial tier plus paid commercial plans with larger monthly quotas and fresher updates."
rateLimit: "Monthly request allowance and data-refresh frequency depend on plan."
formats: ["JSON", "JSONP"]
protocols: ["REST"]
bestFor:
  - "Straightforward FX rate lookup"
  - "Historical currency series"
  - "Server-side currency conversion workflows"
cautions:
  - "The free tier is marked non-commercial."
  - "Source-currency switching and refresh frequency depend on plan."
verifiedAt: "2026-09-13"
sourceUrls:
  - "https://docs.apilayer.com/currencylayer/docs/api-documentation"
  - "https://currencylayer.com/pricing"
mutableFacts:
  - label: "Base URL"
    value: "https://api.currencylayer.com"
    sourceUrl: "https://docs.apilayer.com/currencylayer/docs/api-documentation"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "Access key supplied with the access_key request parameter"
    sourceUrl: "https://docs.apilayer.com/currencylayer/docs/api-documentation"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Free non-commercial tier plus paid commercial plans"
    sourceUrl: "https://currencylayer.com/pricing"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Monthly requests and data-refresh frequency depend on plan"
    sourceUrl: "https://currencylayer.com/pricing"
    verifiedAt: "2026-09-13"
  - label: "Free plan"
    value: "USD 0, 100 API calls, daily updates, and non-commercial use"
    sourceUrl: "https://currencylayer.com/pricing"
    verifiedAt: "2026-09-13"
  - label: "Paid entry point"
    value: "Basic is listed at USD 14.99/month with up to 10,000 requests and commercial use"
    sourceUrl: "https://currencylayer.com/pricing"
    verifiedAt: "2026-09-13"
tags: ["forex", "exchange-rates", "conversion", "historical-data"]
---

## What it covers

Currencylayer provides live quotes, historical rates, conversions, time-frame queries, and currency-change calculations. Plan entitlements determine request volume, refresh frequency, commercial use, and access to advanced operations.

## Request shape

```bash
curl "https://api.currencylayer.com/live?access_key=YOUR_ACCESS_KEY&currencies=KRW,EUR"
```

Call the service from a backend so the access key is not exposed to visitors. Cache responses in line with the plan's update frequency instead of spending quota on identical requests.

## Decision notes

Currencylayer is simple to integrate, but the free plan's non-commercial restriction is decisive for a product. Compare paid plans on quota, update frequency, source-currency switching, and overage policy.
