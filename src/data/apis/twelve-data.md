---
name: "Twelve Data API"
provider: "Twelve Data"
category: "market-data"
status: "active"
officialDocs: "https://twelvedata.com/docs"
homepage: "https://twelvedata.com/"
baseUrl: "https://api.twelvedata.com"
auth: "API key via `apikey` query param or `Authorization: apikey` header"
versioning: "Unversioned base URL"
resourceGroups: ["Time series", "Quotes", "Technical indicators", "Fundamentals", "Reference data"]
pagination: "outputsize param for time series; page-based for some endpoints"
errors: "HTTP 429 on credit exhaustion; JSON error body with message"
webhooks: "Not supported; use WebSocket for streaming"
sdks: ["twelvedata (official Python)", "@twelvedata/twelvedata-node"]
summary: "Market data for stocks, forex, crypto, ETFs, and indices via REST and WebSocket. 100+ technical indicators computed server-side. Generous free tier for prototyping."
pricing: "Free: 800 credits/day; paid from $79/mo (Grow)"
rateLimit: "Free: 8 credits/min, 800 credits/day; HTTP 429 when exceeded"
formats: ["JSON", "CSV"]
protocols: ["REST", "WebSocket"]
bestFor: ["Time series data", "Technical indicators", "Multi-asset coverage"]
cautions: ["Credits are weighted by endpoint — heavy endpoints cost more.", "Fundamentals (profile, earnings, dividends) require Grow tier+.", "Financial statements require Pro tier+."]
verifiedAt: "2026-10-15"
sourceUrls: ["https://twelvedata.com/docs", "https://twelvedata.com/pricing"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.twelvedata.com"
    sourceUrl: "https://twelvedata.com/docs"
    verifiedAt: "2026-10-15"
  - label: "Authentication"
    value: "API key via apikey query param or Authorization header"
    sourceUrl: "https://twelvedata.com/docs"
    verifiedAt: "2026-10-15"
  - label: "Pricing"
    value: "Free: 800 credits/day; paid from $79/mo"
    sourceUrl: "https://twelvedata.com/pricing"
    verifiedAt: "2026-10-15"
  - label: "Rate limits"
    value: "Free: 8 credits/min, 800 credits/day"
    sourceUrl: "https://twelvedata.com/pricing"
    verifiedAt: "2026-10-15"
---

# Twelve Data API

Twelve Data offers multi-asset market data with server-side technical indicators. Good free tier for prototypes.

## Key endpoints

| Endpoint | Description | Free tier |
|----------|-------------|-----------|
| `GET /time_series` | OHLCV time series | ✅ |
| `GET /quote` | Real-time quote | ✅ |
| `GET /price` | Latest price only | ✅ |
| `GET /symbol_search` | Search symbols | ✅ |
| `GET /technical_indicators` | 100+ indicators (SMA, RSI, MACD...) | ✅ |
| `GET /profile` | Company profile | ❌ (Grow+) |
| `GET /dividends` | Dividend history | ❌ (Grow+) |
| `GET /earnings` | Earnings data | ❌ (Grow+) |
| `GET /income_statement` | Financial statements | ❌ (Pro+) |
| `GET /forex_pairs` | Forex symbol list | ✅ |

## Python example: time series

```python
import httpx

API_KEY = "your_twelvedata_key"
BASE = "https://api.twelvedata.com"
HEADERS = {"Authorization": f"apikey {API_KEY}"}

def get_time_series(symbol: str, interval: str = "1day", outputsize: int = 30) -> dict:
    """OHLCV time series. Header auth recommended."""
    resp = httpx.get(
        f"{BASE}/time_series",
        params={"symbol": symbol, "interval": interval, "outputsize": outputsize},
        headers=HEADERS, timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()
    if data.get("status") == "error":
        raise ValueError(data.get("message"))
    return data

# Example
ts = get_time_series("AAPL", interval="1day", outputsize=5)
for bar in ts["values"]:
    print(f"{bar['datetime']}: close ${bar['close']}")
```

## Python example: real-time quote

```python
def get_quote(symbol: str) -> dict:
    resp = httpx.get(f"{BASE}/quote", params={"symbol": symbol}, headers=HEADERS, timeout=10)
    resp.raise_for_status()
    return resp.json()

# Example
q = get_quote("AAPL")
print(f"{q['name']}: ${q['close']} ({q['percent_change']}%)")
```

## Python example: technical indicator (RSI)

```python
def get_rsi(symbol: str, interval: str = "1day", time_period: int = 14) -> dict:
    """Server-side RSI calculation. No local computation needed."""
    resp = httpx.get(
        f"{BASE}/rsi",
        params={"symbol": symbol, "interval": interval, "time_period": time_period},
        headers=HEADERS, timeout=15,
    )
    resp.raise_for_status()
    return resp.json()

# Example
rsi = get_rsi("AAPL")
latest = rsi["values"][0]
print(f"AAPL RSI(14): {latest['rsi']}")
```

## Python example: symbol search

```python
def search_symbols(query: str) -> list[dict]:
    resp = httpx.get(f"{BASE}/symbol_search", params={"symbol": query}, headers=HEADERS, timeout=10)
    resp.raise_for_status()
    return resp.json().get("data", [])

# Example
for s in search_symbols("tesla")[:3]:
    print(f"{s['symbol']}: {s['instrument_name']}")
```

**Notes:**
- Free: 800 credits/day, 8 credits/min — each endpoint has a credit weight
- Fundamentals (`/profile`, `/dividends`) need Grow ($79/mo); financial statements need Pro ($229/mo)
- WebSocket: `wss://ws.twelvedata.com/v1/quotes/price?apikey=KEY` — subscribe with `{"action":"subscribe","params":{"symbols":"AAPL"}}`
- Demo key `apikey=demo` works for limited testing
