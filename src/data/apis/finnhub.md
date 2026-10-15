---
name: "Finnhub API"
provider: "Finnhub"
category: "market-data"
status: "active"
officialDocs: "https://finnhub.io/docs/api"
homepage: "https://finnhub.io/"
baseUrl: "https://finnhub.io/api/v1"
auth: "API key via `token` query param or `X-Finnhub-Token` header"
versioning: "v1 in URL path"
resourceGroups: ["Stock quotes", "Company fundamentals", "News", "Economic data", "Crypto/Forex"]
pagination: "Varies by endpoint; cursor or limit/offset"
errors: "HTTP 429 on rate limit; 403 on premium endpoints with free key"
webhooks: "Not supported; use WebSocket for streaming"
sdks: ["finnhub-python (official)", "finnhub-go", "finnhub-ruby"]
summary: "Real-time and historical market data for stocks, forex, and crypto. Generous free tier for US stocks; premium endpoints (e.g. historical candles) require paid plans."
pricing: "Free tier: 60 calls/min; paid tiers raise limits"
rateLimit: "60 calls/min free; 30 req/sec global cap; HTTP 429 when exceeded"
formats: ["JSON"]
protocols: ["REST", "WebSocket"]
bestFor: ["US stock quotes", "Company fundamentals", "Real-time price streaming"]
cautions: ["/stock/candle (historical OHLCV) returns 403 on free tier.", "Free tier covers US stocks well; international coverage is limited.", "WebSocket limited to 1 concurrent connection per key."]
verifiedAt: "2026-10-15"
sourceUrls: ["https://finnhub.io/docs/api", "https://finnhub.io/pricing"]
mutableFacts:
  - label: "Base URL"
    value: "https://finnhub.io/api/v1"
    sourceUrl: "https://finnhub.io/docs/api"
    verifiedAt: "2026-10-15"
  - label: "Authentication"
    value: "API key via token query param or X-Finnhub-Token header"
    sourceUrl: "https://finnhub.io/docs/api"
    verifiedAt: "2026-10-15"
  - label: "Pricing"
    value: "Free tier: 60 calls/min; paid tiers raise limits"
    sourceUrl: "https://finnhub.io/pricing"
    verifiedAt: "2026-10-15"
  - label: "Rate limits"
    value: "60 calls/min free; 30 req/sec global cap"
    sourceUrl: "https://finnhub.io/pricing"
    verifiedAt: "2026-10-15"
---

# Finnhub API

Finnhub provides real-time and historical market data with a developer-friendly free tier. Best known for US stock coverage.

## Key endpoints

| Endpoint | Description | Free tier |
|----------|-------------|-----------|
| `GET /quote` | Real-time quote (current, high, low, prev close) | ✅ |
| `GET /stock/profile2` | Company profile (market cap, industry, etc.) | ✅ |
| `GET /stock/symbol` | Search/list stock symbols by exchange | ✅ |
| `GET /company-news` | Company news articles | ✅ |
| `GET /stock/metric` | Key metrics (52wk high/low, beta, etc.) | ✅ |
| `GET /stock/candle` | Historical OHLCV candles | ❌ (403) |
| `GET /stock/dividends` | Dividend history | ❌ |
| `GET /calendar/earnings` | Earnings calendar | ✅ |
| `GET /forex/rates` | Forex rates | ✅ |
| `GET /crypto/candle` | Crypto OHLCV | ✅ |

## Python example: stock quote

```python
import httpx

API_KEY = "your_finnhub_key"
BASE = "https://finnhub.io/api/v1"
HEADERS = {"X-Finnhub-Token": API_KEY}

def get_quote(symbol: str) -> dict:
    """Get real-time quote. Header auth keeps key out of URLs/logs."""
    resp = httpx.get(f"{BASE}/quote", params={"symbol": symbol}, headers=HEADERS, timeout=10)
    resp.raise_for_status()
    return resp.json()

# Example
quote = get_quote("AAPL")
print(f"AAPL: ${quote['c']} (prev close: ${quote['pc']})")
```

## Python example: company profile

```python
def get_profile(symbol: str) -> dict:
    """Company fundamentals. Free tier includes profile2."""
    resp = httpx.get(f"{BASE}/stock/profile2", params={"symbol": symbol}, headers=HEADERS, timeout=10)
    resp.raise_for_status()
    return resp.json()

# Example
profile = get_profile("AAPL")
print(f"{profile['name']}: {profile['finnhubIndustry']}, mkt cap ${profile['marketCapitalization']:,.0f}M")
```

## Python example: symbol search

```python
def search_symbols(query: str, exchange: str = "US") -> list[dict]:
    """Search stock symbols. Useful for autocomplete."""
    resp = httpx.get(f"{BASE}/search", params={"q": query}, headers=HEADERS, timeout=10)
    resp.raise_for_status()
    return resp.json().get("result", [])

# Example
results = search_symbols("apple")
for r in results[:3]:
    print(f"{r['symbol']}: {r['description']}")
```

## Python example: company news

```python
from datetime import date, timedelta

def get_news(symbol: str, days_back: int = 7) -> list[dict]:
    """Recent news for a symbol."""
    to_date = date.today().isoformat()
    from_date = (date.today() - timedelta(days=days_back)).isoformat()
    resp = httpx.get(
        f"{BASE}/company-news",
        params={"symbol": symbol, "from": from_date, "to": to_date},
        headers=HEADERS, timeout=15,
    )
    resp.raise_for_status()
    return resp.json()

# Example
news = get_news("AAPL", days_back=3)
for n in news[:3]:
    print(f"{n['datetime']}: {n['headline'][:80]}")
```

**Notes:**
- Free tier: 60 calls/min; global 30 req/sec cap across all plans
- `/stock/candle` returns **403 on free tier** — build charts by polling `/quote` or using WebSocket
- Prefer `X-Finnhub-Token` header over `?token=` query param (key stays out of logs)
- WebSocket: `wss://ws.finnhub.io?token=KEY` — 1 concurrent connection per key
