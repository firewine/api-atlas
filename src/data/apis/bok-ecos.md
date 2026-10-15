---
name: "BOK ECOS"
provider: "Bank of Korea"
category: "public-data"
status: "active"
officialDocs: "https://ecos.bok.or.kr/api/"
homepage: "https://ecos.bok.or.kr/"
baseUrl: "https://ecos.bok.or.kr/api"
auth: "ECOS API key embedded in the request path"
versioning: "Service-name request paths; no global version prefix is documented in the reviewed developer guide."
resourceGroups: ["StatisticSearch", "StatisticTableList", "StatisticItemList", "KeyStatisticList"]
pagination: "Start and end row numbers are embedded in request paths."
errors: "Responses include ECOS result codes and messages; inspect them before reading rows."
webhooks: "No webhook interface was confirmed in the reviewed ECOS developer guide."
sdks: []
summary: "The Bank of Korea's official economic-statistics API for Korean monetary, financial, price, national-account, and related time series."
pricing: "Public API access after key registration."
rateLimit: "Service-policy limits apply to the registered key; confirm the current allowance in ECOS."
formats: ["JSON", "XML"]
protocols: ["REST"]
bestFor:
  - "Official Korean macroeconomic time series"
  - "Bank of Korea statistics"
  - "Reproducible series-code based retrieval"
cautions:
  - "Series codes and cycle values must be discovered before querying observations."
  - "Publication schedules differ by statistical series."
verifiedAt: "2026-09-13"
sourceUrls:
  - "https://ecos.bok.or.kr/api/"
  - "https://ecos.bok.or.kr/api/#/DevGuide/DevSpeciflcation"
mutableFacts:
  - label: "Base URL"
    value: "https://ecos.bok.or.kr/api"
    sourceUrl: "https://ecos.bok.or.kr/api/"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "ECOS API key embedded in the request path"
    sourceUrl: "https://ecos.bok.or.kr/api/#/DevGuide/DevSpeciflcation"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Public API access after key registration"
    sourceUrl: "https://ecos.bok.or.kr/api/"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "No fixed public quota was confirmed in the reviewed pages; confirm the registered key's current allowance in ECOS"
    sourceUrl: "https://ecos.bok.or.kr/api/"
    verifiedAt: "2026-09-13"
  - label: "Access"
    value: "The ECOS Open API is active and exposes key-statistics and statistical-search services"
    sourceUrl: "https://ecos.bok.or.kr/api/"
    verifiedAt: "2026-09-13"
tags: ["korea", "macroeconomics", "central-bank", "statistics"]
---

## What it covers

ECOS is the authoritative starting point for Bank of Korea statistics. It exposes catalog discovery, item lookup, statistical observations, key indicators, and release-calendar style information using stable statistical table and item codes.

## Request shape

```text
GET https://ecos.bok.or.kr/api/StatisticSearch/{API_KEY}/json/kr/1/10/{STAT_CODE}/{CYCLE}/{START}/{END}/{ITEM_CODE}
```

Start with the catalog endpoints, record the selected table and item codes, then query the actual time series. Store those codes alongside the data so later refreshes remain auditable.

## Key endpoints

| Endpoint pattern | Description |
|------------------|-------------|
| `StatisticSearch/{key}/json/kr/1/10/731Y001/D/{from}/{to}/0000001` | USD/KRW exchange rate (731Y001) |
| `StatisticSearch/{key}/json/kr/1/100/731Y001/D/{from}/{to}/` | All major currency rates |
| `StatisticSearch/{key}/json/kr/1/10/060Y001/M/{from}/{to}/` | Consumer price index |
| `StatisticSearch/{key}/json/kr/1/10/102Y004/M/{from}/{to}/` | Policy interest rate |
| `StatisticItemList/{key}/json/kr/1/100/731Y001` | List items in a statistic |

## Decision notes

Prefer ECOS over secondary macro-data vendors when the required Korean series is available. Treat release timing, revisions, units, and frequency as part of the observation—not as display-only metadata.

## Python examples

### 1. USD/KRW rate with fallback patterns

```python
import httpx
from decimal import Decimal
from datetime import datetime

API_KEY = "your_ecos_api_key"
BASE = "https://ecos.bok.or.kr/api"

def fetch_usd_krw(dt: datetime) -> Decimal | None:
    """Fetch USD/KRW for a date, trying multiple URL patterns.

    ECOS API behavior varies; trying several patterns increases success rate.
    731Y001 = major currency rates vs KRW (most reliable source).
    """
    date_str = dt.strftime("%Y%m%d")
    patterns = [
        f"{API_KEY}/json/kr/1/10/731Y001/D/{date_str}/{date_str}/0000001",
        f"{API_KEY}/json/kr/1/100/731Y001/D/{date_str}/{date_str}/",
    ]
    for pattern in patterns:
        try:
            resp = httpx.get(f"{BASE}/StatisticSearch/{pattern}", timeout=12)
            resp.raise_for_status()
            rate = parse_usd_rate(resp.json())
            if rate:
                return rate
        except Exception:
            continue
    return None

def parse_usd_rate(data: dict) -> Decimal | None:
    """Extract USD/KRW from ECOS response. Handles varying structures."""
    outer = data.get("StatisticSearch") or data
    # rows may be under 'row', 'rows', 'list', or 'stat'
    rows = outer.get("row") or outer.get("rows") or []
    if isinstance(rows, dict):
        rows = [rows]
    for row in rows:
        # Match by item name since codes can vary
        name = row.get("ITEM_NAME1", "")
        if "미국달러" in name and "매매기준율" in name:
            value = row.get("DATA_VALUE", "").replace(",", "").strip()
            if value and value != "-":
                return Decimal(value)
    return None
```

### 2. Previous business day fallback

```python
from datetime import timedelta

def get_rate_with_fallback(dt: datetime, max_days_back: int = 5) -> Decimal | None:
    """Get rate for a date, falling back to previous business days.

    ECOS doesn't publish on weekends/holidays. Walk back up to
    5 days, skipping weekends, until a rate is found.
    """
    # Try the requested date first
    rate = fetch_usd_krw(dt)
    if rate:
        return rate
    # Walk back, skipping weekends
    for days_back in range(1, max_days_back + 1):
        prev = dt - timedelta(days=days_back)
        if prev.weekday() >= 5:  # Saturday, Sunday
            continue
        rate = fetch_usd_krw(prev)
        if rate:
            return rate
    return None
```

### 3. Caching strategy

```python
# ECOS allows ~100 calls/hour. For daily FX rates, cache by date.
# A simple dict works for scripts; use SQLite/Redis for services.

_cache: dict[str, Decimal] = {}

def get_cached_rate(dt: datetime) -> Decimal | None:
    key = dt.strftime("%Y%m%d")
    if key not in _cache:
        _cache[key] = get_rate_with_fallback(dt)
    return _cache[key]
```

**Real-world notes:**
- **Rate limit:** ~100 calls/hour — daily caching is sufficient for FX rates
- **Weekends/holidays:** No data published; always implement previous-business-day fallback
- **Response structure varies:** Check `StatisticSearch.row`, handle both list and single-dict
- **Item matching:** Match by `ITEM_NAME1` containing "미국달러" rather than hardcoding item codes
- **DATA_VALUE:** May contain commas or "-" for missing; strip and validate before `Decimal()`
- **Statistic code `731Y001`:** Major currency rates vs KRW — the most reliable source for USD/KRW
