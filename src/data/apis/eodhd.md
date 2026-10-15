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
  - "Dividend payment-date coverage is uneven: a September 2026 bulk pull of /api/div found paymentDate null in about 6,700 records across 2,792 symbols, with Korean listings most affected (reported to EODHD support). Treat payment-date fields as coverage-dependent, not guaranteed."
  - "Some dividend records pair an ex-date with an earlier payment date (observed September 2026, reported to support). Validate date ordering before building payment calendars."
  - "For ETFs, the EOD close's session basis — regular vs extended hours, primary vs consolidated — is not fully documented, and the isPrimary flag's meaning for a given listing is ambiguous (queried October 2026). Confirm methodology before comparing closes against issuer NAV."
verifiedAt: "2026-09-13"
sourceUrls:
  - "https://eodhd.com/financial-apis/api-for-historical-data-and-volumes"
  - "https://eodhd.com/pricing"
mutableFacts:
  - key: "base-url"
    label: "Base URL"
    value: "https://eodhd.com/api"
    sourceUrl: "https://eodhd.com/financial-apis/api-for-historical-data-and-volumes"
    verifiedAt: "2026-09-13"
  - key: "authentication"
    label: "Authentication"
    value: "API token in the api_token query parameter"
    sourceUrl: "https://eodhd.com/financial-apis/api-for-historical-data-and-volumes"
    verifiedAt: "2026-09-13"
  - key: "pricing"
    label: "Pricing"
    value: "Free trial tier plus paid personal and commercial plans with dataset-specific entitlements"
    sourceUrl: "https://eodhd.com/pricing"
    verifiedAt: "2026-09-13"
  - key: "rate-limits"
    label: "Rate limits"
    value: "The free EOD allowance is 20 calls per day; paid limits depend on plan"
    sourceUrl: "https://eodhd.com/financial-apis/api-for-historical-data-and-volumes"
    verifiedAt: "2026-09-13"
  - label: "Free allowance"
    value: "20 API calls per day with a one-year EOD history window"
    sourceUrl: "https://eodhd.com/pricing"
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
curl "https://eodhd.com/api/eod/AAPL.US?api_token=<redacted>
```

The EOD endpoint defaults to CSV. Set `fmt=json` when a JSON response is easier to consume. Keep the token server-side even though query-string authentication is supported.

## Python example: dividend history with defensive parsing

```python
import httpx
from decimal import Decimal

BASE = "https://eodhd.com/api"
TOKEN = "your_api_token"  # keep server-side

def get_dividends(ticker: str, exchange: str = "US") -> list[dict]:
    """Fetch dividend history, skipping rows with missing critical fields."""
    url = f"{BASE}/div/{ticker}.{exchange}"
    resp = httpx.get(url, params={"api_token": TOKEN, "fmt": "json"}, timeout=30)
    resp.raise_for_status()
    rows = []
    for row in resp.json():
        # paymentDate is frequently null in practice — don't assume it exists
        amount = row.get("value")
        if amount is None:
            continue
        rows.append({
            "ex_date": row.get("date"),
            "payment_date": row.get("paymentDate"),  # may be None
            "amount": Decimal(str(amount)),
            "currency": row.get("currencyCode", "USD"),
        })
    return rows

# Example: SCHD.US dividends
for div in get_dividends("SCHD")[:3]:
    print(div["ex_date"], div["amount"], div["currency"])
```

## Key endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/eod/{symbol}` | End-of-day OHLCV |
| `GET /api/real-time/{symbol}` | Real-time quote |
| `GET /api/div/{symbol}` | Dividend history |
| `GET /api/splits/{symbol}` | Stock splits |
| `GET /api/fundamentals/{symbol}` | Fundamentals data |
| `GET /api/news` | Financial news |
| `GET /api/eod-bulk-last-day/{exchange}` | Bulk EOD for exchange |
| `GET /api/screener` | Stock screener |

## Decision notes

EODHD is a practical fit when a product wants broad market coverage from one integration. Before production use, match every required dataset to the actual plan and license; a personal subscription does not automatically grant redistribution rights.

Field-level spot checks are worth the effort: dividend date fields and close-price session definitions have shown gaps in practice, so validate the exact fields a product depends on against a second source before treating them as authoritative.

**Real-world data quality notes (observed September–October 2026):**
- Bulk dividend queries returned `paymentDate: null` for thousands of rows (Korean listings most affected)
- Some rows have payment dates earlier than ex-dates — validate chronology
- `isPrimary` flag meaning for a given listing is ambiguous — confirm methodology before comparing closes
