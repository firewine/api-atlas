---
name: "Alpaca"
provider: "Alpaca Markets"
category: "market-data"
status: "active"
officialDocs: "https://docs.alpaca.markets/us/docs/about-market-data-api"
homepage: "https://alpaca.markets/"
baseUrl: "https://data.alpaca.markets/v2"
auth: "Trading API users: APCA-API-KEY-ID and APCA-API-SECRET-KEY headers"
versioning: "This profile covers US stock Market Data REST v2; other asset classes and brokerage APIs have separate contracts."
resourceGroups: ["Stock bars", "Stock trades", "Stock quotes", "Stock snapshots"]
pagination: "Historical stock bars return next_page_token; send it as page_token until absent. The limit is shared across symbols."
errors: "Inspect HTTP status and the JSON error body separately. Code 42210000 identifies the documented recent-SIP subscription error; it is not an HTTP status."
webhooks: "The reviewed market-data documentation describes WebSocket streams; a general webhook delivery contract was not verified."
sdks: ["Python (alpaca-py)", "Go", "NodeJS", "C#"]
summary: "US stock market data with explicit IEX or consolidated SIP feed selection, historical REST queries, and live WebSocket streams."
pricing: "Individual Trading API equities: Basic is free; Algo Trader Plus is listed at USD 99/month. Broker pricing and redistribution rights require separate review."
rateLimit: "Individual Trading API historical equities: Basic 200 calls/minute; Algo Trader Plus 10,000 calls/minute, per the plan table checked 2026-10-16."
formats: ["JSON"]
protocols: ["REST", "WebSocket"]
bestFor:
  - "Historical US stock bars with a known feed and time window"
  - "IEX-only live prototypes that explicitly label their coverage"
  - "Consolidated SIP workflows with verified data entitlement"
cautions:
  - "IEX is one exchange; its prices and volume are not a substitute for consolidated SIP coverage."
  - "Basic historical SIP queries need an end time at least 15 minutes old. Latest SIP endpoints require subscription access."
  - "This profile does not verify brokerage, order execution, redistribution licensing, or an individual account's entitlements."
verifiedAt: "2026-10-16"
sourceUrls:
  - "https://docs.alpaca.markets/us/docs/about-market-data-api"
  - "https://docs.alpaca.markets/us/docs/market-data-faq"
  - "https://docs.alpaca.markets/us/reference/stockbars"
  - "https://github.com/alpacahq/alpaca-py"
mutableFacts:
  - key: "base-url"
    label: "Stock market-data base URL"
    value: "https://data.alpaca.markets/v2; historical bars use /stocks/bars"
    sourceUrl: "https://docs.alpaca.markets/us/reference/stockbars"
    verifiedAt: "2026-10-16"
  - key: "authentication"
    label: "Trading API authentication"
    value: "APCA-API-KEY-ID and APCA-API-SECRET-KEY HTTP headers for individual Trading API users"
    sourceUrl: "https://docs.alpaca.markets/us/docs/about-market-data-api"
    verifiedAt: "2026-10-16"
  - key: "pricing"
    label: "Individual equities pricing"
    value: "Basic is free; Algo Trader Plus is listed at USD 99/month; Broker API plans are separate"
    sourceUrl: "https://docs.alpaca.markets/us/docs/about-market-data-api"
    verifiedAt: "2026-10-16"
  - key: "rate-limits"
    label: "Historical equities calls"
    value: "Trading API plan table: Basic 200/minute; Algo Trader Plus 10,000/minute"
    sourceUrl: "https://docs.alpaca.markets/us/docs/about-market-data-api"
    verifiedAt: "2026-10-16"
tags: ["stocks", "iex", "sip", "historical-data", "alpaca-py"]
---

## Scope and request shape

This profile focuses on US equities market data for individual Trading API users. The [official overview](https://docs.alpaca.markets/us/docs/about-market-data-api) separates those subscriptions from Broker API arrangements. Market-data requests use the data host, not the trading/order host.

```bash
curl --get 'https://data.alpaca.markets/v2/stocks/bars' \
  -H "APCA-API-KEY-ID: $APCA_API_KEY_ID" \
  -H "APCA-API-SECRET-KEY: $APCA_API_SECRET_KEY" \
  --data-urlencode 'symbols=AAPL' \
  --data-urlencode 'timeframe=1Day' \
  --data-urlencode 'start=2024-01-02T00:00:00Z' \
  --data-urlencode 'end=2024-01-06T00:00:00Z' \
  --data-urlencode 'feed=sip' \
  --data-urlencode 'adjustment=raw'
```

This is an illustrative historical request, not a recorded live response. Keep credentials in a server-side secret store and never include them in a URL, frontend bundle, or diagnostic log. Follow every `next_page_token` with `page_token`; one successful page is not a complete multi-symbol dataset.

## Choose coverage before latency

Use the [recent SIP error guide](../../guides/alpaca-api-recent-sip-data-error-iex/) to choose a delayed consolidated query or an explicitly IEX-only workflow. Preserve the feed and requested interval with cached data. Changing the feed to make an error disappear changes the dataset.

The [current Python SDK](https://github.com/alpacahq/alpaca-py) is `alpaca-py`. No SDK installation, authenticated API call, order, or paid subscription was tested for this profile.

## Separate asset-catalog contract

The [TXSE SDK enum case](../../guides/alpaca-py-txse-assetexchange-validation-error/) concerns read-only Trading Assets metadata, not this profile's Market Data v2 host, subscription prices or limits. [Alpaca's Assets SDK reference](https://alpaca.markets/sdks/python/api_reference/trading/assets.html) defines that separate surface. The source review dated 2026-10-27 did not execute an account request or order; existing market-data fact dates above are unchanged.
