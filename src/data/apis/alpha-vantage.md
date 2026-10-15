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

## Python examples

### 1. Ticker search

```python
import httpx

API_KEY = "your_alpha_vantage_key"
BASE = "https://www.alphavantage.co/query"

def api_call(params: dict) -> dict:
    """Call Alpha Vantage, raising on API-level errors."""
    resp = httpx.get(BASE, params={**params, "apikey": API_KEY}, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    # Alpha Vantage returns errors as JSON fields, not HTTP status codes
    if "Error Message" in data:
        raise ValueError(data["Error Message"])
    if "Note" in data:  # rate limit hit
        raise RuntimeError(f"Rate limited: {data['Note']}")
    if "Information" in data:  # e.g. invalid API key, premium endpoint
        raise RuntimeError(data["Information"])
    return data

def search_ticker(keywords: str) -> list[dict]:
    """Search for tickers by company name or keywords."""
    data = api_call({"function": "SYMBOL_SEARCH", "keywords": keywords})
    return [
        {
            "symbol": m["1. symbol"],
            "name": m["2. name"],
            "type": m["3. type"],
            "region": m["4. region"],
            "currency": m["8. currency"],
        }
        for m in data.get("bestMatches", [])
    ]

# Find Schwab US Dividend Equity ETF
for m in search_ticker("Schwab Dividend"):
    print(m["symbol"], "-", m["name"])
```

### 2. Dividend history

```python
from decimal import Decimal
from datetime import date

def get_dividends(symbol: str) -> list[dict]:
    """Get dividend history. Ex-dates are dict keys in the response."""
    data = api_call({"function": "DIVIDENDS", "symbol": symbol})
    rows = []
    for ex_date_str, v in sorted(data.get("data", {}).items()):
        rows.append({
            "ex_date": date.fromisoformat(ex_date_str),
            "amount": Decimal(v["amount"]),
        })
    return rows

def annual_dividend(symbol: str, year: int) -> Decimal:
    """Sum dividends paid in a calendar year (by ex-date)."""
    total = Decimal("0")
    for d in get_dividends(symbol):
        if d["ex_date"].year == year:
            total += d["amount"]
    return total

# SCHD 2024 total dividends
print("SCHD 2024:", annual_dividend("SCHD", 2024))
```

### 3. Daily prices with adjusted close

```python
def get_daily(symbol: str, outputsize: str = "compact") -> list[dict]:
    """Get daily OHLCV. outputsize=compact (100 rows) or full (20+ years)."""
    data = api_call({
        "function": "TIME_SERIES_DAILY_ADJUSTED",
        "symbol": symbol,
        "outputsize": outputsize,
    })
    series = data.get("Time Series (Daily)", {})
    rows = []
    for d_str, v in sorted(series.items()):
        rows.append({
            "date": date.fromisoformat(d_str),
            "open": Decimal(v["1. open"]),
            "high": Decimal(v["2. high"]),
            "low": Decimal(v["3. low"]),
            "close": Decimal(v["4. close"]),
            "adj_close": Decimal(v["5. adjusted close"]),
            "volume": int(v["6. volume"]),
            "dividend": Decimal(v["7. dividend amount"]),
        })
    return rows

# Latest 5 closes for AAPL
for r in get_daily("AAPL")[-5:]:
    print(r["date"], r["close"])
```

### 4. Rate-limit-aware batch fetch

```python
import time

def batch_dividends(symbols: list[str], delay_sec: float = 13) -> dict:
    """Fetch dividends for multiple symbols, respecting the free-tier limit.

    Free tier allows 25 requests/day and ~5/minute. This spaces calls
    to stay under the per-minute cap. For larger batches, use a persistent
    cache (SQLite, Redis) keyed by symbol + date.
    """
    results = {}
    for i, sym in enumerate(symbols):
        if i > 0:
            time.sleep(delay_sec)
        try:
            results[sym] = get_dividends(sym)
        except RuntimeError as e:
            print(f"{sym}: {e}")
            break
    return results
```

**Notes:**
- Free tier: 25 requests/day, ~5/minute — cache aggressively, batch wisely
- Always check `"Note"`, `"Error Message"`, and `"Information"` fields; HTTP 200 does not mean success
- `DIVIDENDS` covers US equities; ex-dates are dict keys, not a list
- `TIME_SERIES_DAILY_ADJUSTED` includes split/dividend-adjusted closes — use `5. adjusted close` for total-return math
- For production with SLAs, consider a licensed provider (EODHD, Massive) instead
