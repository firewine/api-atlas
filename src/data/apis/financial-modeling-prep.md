---
name: "Financial Modeling Prep API"
provider: "Financial Modeling Prep"
category: "market-data"
status: "active"
officialDocs: "https://site.financialmodelingprep.com/developer/docs"
homepage: "https://site.financialmodelingprep.com/"
baseUrl: "https://financialmodelingprep.com/stable"
auth: "API key via `apikey` query parameter"
versioning: "/stable (current); /api/v3 (legacy)"
resourceGroups: ["Stock quotes", "Financial statements", "Ratios", "Insider trading", "ETF/mutual funds", "Economic data"]
pagination: "Limit param; date ranges for historical"
errors: "HTTP 401/402/429 with JSON error message"
webhooks: "Not supported; use WebSocket for streaming"
sdks: ["Community wrappers (Python, JS)"]
summary: "Comprehensive financial data: real-time quotes, 30 years of financial statements, ratios, insider transactions, and analyst estimates. Strong for fundamental analysis."
pricing: "Free tier with limited calls; paid plans for full access"
rateLimit: "Varies by plan; HTTP 429 when exceeded"
formats: ["JSON"]
protocols: ["REST", "WebSocket"]
bestFor: ["Financial statements", "Fundamental screening", "Insider trading data"]
cautions: ["Migrating from /api/v3 to /stable — check docs for current endpoints.", "Free tier is limited; heavy fundamental queries need paid plan.", "WebSocket requires separate subscription."]
verifiedAt: "2026-10-15"
sourceUrls: ["https://site.financialmodelingprep.com/developer/docs", "https://site.financialmodelingprep.com/developer/docs/pricing"]
mutableFacts:
  - label: "Base URL"
    value: "https://financialmodelingprep.com/stable"
    sourceUrl: "https://site.financialmodelingprep.com/developer/docs/stable"
    verifiedAt: "2026-10-15"
  - label: "Authentication"
    value: "API key via apikey query parameter"
    sourceUrl: "https://site.financialmodelingprep.com/developer/docs"
    verifiedAt: "2026-10-15"
  - label: "Pricing"
    value: "Free tier with limited calls; paid plans for full access"
    sourceUrl: "https://site.financialmodelingprep.com/developer/docs/pricing"
    verifiedAt: "2026-10-15"
  - label: "Rate limits"
    value: "Varies by plan; HTTP 429 when exceeded"
    sourceUrl: "https://site.financialmodelingprep.com/developer/docs/pricing"
    verifiedAt: "2026-10-15"
---

# Financial Modeling Prep API

FMP provides deep fundamental data — financial statements, ratios, insider trades — alongside market quotes. Popular for screening and valuation work.

## Key endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /quote` | Real-time quote |
| `GET /income-statement` | Income statements (annual/quarterly) |
| `GET /balance-sheet-statement` | Balance sheets |
| `GET /cash-flow-statement` | Cash flow statements |
| `GET /ratios` | Financial ratios (P/E, ROE, etc.) |
| `GET /key-metrics` | Key metrics per share |
| `GET /insider-trading` | Insider transactions |
| `GET /stock-dividend` | Dividend history |
| `GET /analyst-estimates` | Consensus estimates |
| `GET /etf-holder` | ETF holdings |

## Python example: income statement

```python
import httpx

API_KEY = "your_fmp_key"
BASE = "https://financialmodelingprep.com/stable"

def get_income_statement(symbol: str, period: str = "annual", limit: int = 5) -> list[dict]:
    """Annual or quarterly income statements."""
    resp = httpx.get(
        f"{BASE}/income-statement",
        params={"symbol": symbol, "period": period, "limit": limit, "apikey": API_KEY},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()

# Example
stmts = get_income_statement("AAPL", period="annual", limit=3)
for s in stmts:
    print(f"{s['date']}: revenue ${s['revenue']:,}, net income ${s['netIncome']:,}")
```

## Python example: key ratios

```python
def get_ratios(symbol: str, limit: int = 5) -> list[dict]:
    """Financial ratios (P/E, ROE, debt/equity, etc.)."""
    resp = httpx.get(f"{BASE}/ratios", params={"symbol": symbol, "limit": limit, "apikey": API_KEY}, timeout=15)
    resp.raise_for_status()
    return resp.json()

# Example
ratios = get_ratios("AAPL", limit=1)
r = ratios[0]
print(f"P/E: {r['peRatio']:.1f}, ROE: {r['returnOnEquity']:.1%}, Div yield: {r['dividendYield']:.1%}")
```

## Python example: dividend history

```python
def get_dividends(symbol: str, limit: int = 10) -> list[dict]:
    """Dividend payment history. Useful for dividend investors."""
    resp = httpx.get(f"{BASE}/stock-dividend", params={"symbol": symbol, "limit": limit, "apikey": API_KEY}, timeout=15)
    resp.raise_for_status()
    return resp.json()

# Example
divs = get_dividends("AAPL", limit=4)
for d in divs:
    print(f"{d['date']}: ${d['dividend']} (yield: {d.get('yield', 'N/A')})")
```

## Python example: insider trading

```python
def get_insider_trades(symbol: str, limit: int = 10) -> list[dict]:
    """Recent insider transactions."""
    resp = httpx.get(f"{BASE}/insider-trading", params={"symbol": symbol, "limit": limit, "apikey": API_KEY}, timeout=15)
    resp.raise_for_status()
    return resp.json()
```

**Notes:**
- Use `/stable` base URL; `/api/v3` is legacy
- Auth is `apikey` query param (no header option)
- 100+ endpoints: statements, ratios, insider trades, ETF holdings, economic calendar
- WebSocket: `wss://websockets.financialmodelingprep.com` — login with API key, then subscribe
