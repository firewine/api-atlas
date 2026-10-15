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
  - key: "base-url"
    label: "Base URL"
    value: "https://api.coingecko.com/api/v3"
    sourceUrl: "https://docs.coingecko.com/reference/introduction"
    verifiedAt: "2026-09-13"
  - key: "authentication"
    label: "Authentication"
    value: "Plan-specific API key header for Demo or Pro access"
    sourceUrl: "https://docs.coingecko.com/reference/authentication"
    verifiedAt: "2026-09-13"
  - key: "pricing"
    label: "Pricing"
    value: "Demo and paid plans; current entitlements are plan-specific"
    sourceUrl: "https://docs.coingecko.com/reference/authentication"
    verifiedAt: "2026-09-13"
  - key: "rate-limits"
    label: "Rate limits"
    value: "Plan-specific request limits documented by CoinGecko"
    sourceUrl: "https://docs.coingecko.com/reference/authentication"
    verifiedAt: "2026-09-13"
tags: ["coins","prices","market-data"]
---

## What it covers

Crypto asset prices, metadata, markets, exchanges, NFTs, and onchain datasets. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Key endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v3/ping` | API status check |
| `GET /api/v3/simple/price` | Simple price for coins |
| `GET /api/v3/simple/supported_vs_currencies` | Supported currencies |
| `GET /api/v3/coins/markets` | Market data list |
| `GET /api/v3/coins/{id}` | Coin details |
| `GET /api/v3/coins/{id}/market_chart` | Historical market chart |
| `GET /api/v3/coins/list` | All supported coins |
| `GET /api/v3/global` | Global crypto market data |

## Decision notes

Best suited to crypto market discovery and broad asset and exchange metadata. Before production, verify asset ids are safer than ticker symbols. freshness and endpoint access vary by plan. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.

## Python example: simple prices (no key on free tier)

```python
import httpx
from decimal import Decimal

BASE = "https://api.coingecko.com/api/v3"

def simple_price(ids: list[str], vs: str = "usd") -> dict[str, Decimal]:
    """Get current prices. Free tier needs no API key."""
    resp = httpx.get(
        f"{BASE}/simple/price",
        params={"ids": ",".join(ids), "vs_currencies": vs},
        timeout=30,
    )
    if resp.status_code == 429:
        raise RuntimeError("Rate limited — free tier is ~10-30 calls/min")
    resp.raise_for_status()
    return {k: Decimal(str(v[vs])) for k, v in resp.json().items()}

def coin_markets(vs: str = "usd", per_page: int = 10) -> list[dict]:
    resp = httpx.get(
        f"{BASE}/coins/markets",
        params={"vs_currency": vs, "order": "market_cap_desc", "per_page": per_page},
        timeout=30,
    )
    resp.raise_for_status()
    return [
        {"id": c["id"], "symbol": c["symbol"], "price": Decimal(str(c["current_price"])),
         "mcap_rank": c["market_cap_rank"]}
        for c in resp.json()
    ]

print(simple_price(["bitcoin", "ethereum"]))
```

**Notes:**
- Free tier requires no key but is heavily rate-limited (~10-30 calls/min); add delays
- Paid plans use `x-cg-pro-api-key` header against `pro-api.coingecko.com`
- Coin IDs are slugs (`bitcoin`, not `BTC`) — resolve via `/coins/list` if unsure
- Cache aggressively; prices don't need per-second refresh for most use cases
