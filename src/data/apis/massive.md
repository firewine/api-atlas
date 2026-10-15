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

## Key endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /v2/aggs/ticker/{ticker}/range/{mult}/{ts}/{from}/{to}` | OHLCV aggregates |
| `GET /v2/aggs/grouped/locale/us/market/stocks/{date}` | Grouped daily bars |
| `GET /v1/open-close/{ticker}/{date}` | Daily open/close |
| `GET /v3/reference/tickers` | Ticker reference data |
| `GET /v3/reference/tickers/{ticker}` | Ticker details |
| `GET /v3/reference/dividends` | Dividend data |
| `GET /v3/reference/splits` | Stock splits |
| `GET /v2/last/trade/{ticker}` | Last trade |

## Decision notes

Compare Massive plans on four axes: asset class, historical depth, feed latency, and usage rights. “Unlimited calls” does not by itself answer whether the data may be displayed or redistributed in a commercial product.

## Python example: aggregates and ticker details

```python
import httpx
from decimal import Decimal
from datetime import date

API_KEY = "your_massive_api_key"
BASE = "https://api.massive.com"

def get_aggs(ticker: str, from_: str, to: str, timespan: str = "day") -> list[dict]:
    """Get OHLCV aggregates. Response nests under 'results'."""
    resp = httpx.get(
        f"{BASE}/v2/aggs/ticker/{ticker}/range/1/{timespan}/{from_}/{to}",
        params={"apiKey": API_KEY},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    if data.get("status") != "OK":
        raise RuntimeError(f"Massive error: {data.get('status')}")
    return [
        {
            "date": date.fromtimestamp(r["t"] / 1000),
            "open": Decimal(str(r["o"])),
            "close": Decimal(str(r["c"])),
            "volume": r["v"],
        }
        for r in data.get("results", [])
    ]

def get_ticker_details(ticker: str) -> dict:
    resp = httpx.get(f"{BASE}/v3/reference/tickers/{ticker}", params={"apiKey": API_KEY}, timeout=30)
    resp.raise_for_status()
    return resp.json()["results"]

for bar in get_aggs("AAPL", "2024-01-02", "2024-01-05"):
    print(bar["date"], bar["close"])
```

**Notes:**
- Timestamps are milliseconds since epoch — divide by 1000
- Free tier is delayed 15 min and limited to 5 calls/min; paid plans unlock real-time
- The company rebranded from Polygon.io to Massive in 2025; old `polygon.io` hosts still work
- Dividends live under `/v3/reference/dividends`; splits under `/v3/reference/splits`
