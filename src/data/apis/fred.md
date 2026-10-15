---
name: "FRED API"
provider: "Federal Reserve Bank of St. Louis"
category: "public-data"
status: "active"
officialDocs: "https://fred.stlouisfed.org/docs/api/fred/"
homepage: "https://fred.stlouisfed.org/"
baseUrl: "https://api.stlouisfed.org/fred"
auth: "API key query parameter"
versioning: "FRED API v1 paths; FRED API v2 is separately documented"
resourceGroups: ["Series","Observations","Categories","Releases","Sources","Tags"]
pagination: "limit, offset, sort_order and endpoint-specific filters"
errors: "Structured XML or JSON error responses"
webhooks: "No webhooks documented"
sdks: []
summary: "Official programmatic access to FRED economic series, observations, releases, sources, and metadata."
pricing: "Free API key access under FRED terms"
rateLimit: "Official documentation governs request limits; avoid encoding an unverified fixed number"
formats: ["JSON","XML","CSV","XLSX"]
protocols: ["REST"]
bestFor: ["U.S. macroeconomic time series","Economic metadata and release calendars"]
cautions: ["Observation revisions are normal.","Preserve units, frequency and seasonal adjustment metadata."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://fred.stlouisfed.org/docs/api/fred/","https://fred.stlouisfed.org/docs/api/fred/api_key.html"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.stlouisfed.org/fred"
    sourceUrl: "https://fred.stlouisfed.org/docs/api/fred/"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "API key query parameter"
    sourceUrl: "https://fred.stlouisfed.org/docs/api/fred/api_key.html"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Free API key access under FRED terms"
    sourceUrl: "https://fred.stlouisfed.org/docs/api/fred/api_key.html"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Official documentation governs request limits; avoid encoding an unverified fixed number"
    sourceUrl: "https://fred.stlouisfed.org/docs/api/fred/api_key.html"
    verifiedAt: "2026-09-13"
tags: ["series","observations","categories","public-data"]
---

## What it covers

Official programmatic access to FRED economic series, observations, releases, sources, and metadata. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Key endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /fred/series/observations` | Series observations (data points) |
| `GET /fred/series` | Series metadata |
| `GET /fred/series/search` | Search series |
| `GET /fred/series/categories` | Series categories |
| `GET /fred/category` | Category details |
| `GET /fred/category/children` | Child categories |
| `GET /fred/releases` | Economic releases |
| `GET /fred/release/dates` | Release dates |

## Decision notes

Best suited to u.s. macroeconomic time series and economic metadata and release calendars. Before production, verify observation revisions are normal. preserve units, frequency and seasonal adjustment metadata. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.

## Python example: fetching an economic series

```python
import httpx
from decimal import Decimal
from datetime import date

API_KEY = "your_fred_api_key"
BASE = "https://api.stlouisfed.org/fred"

def get_observations(series_id: str, start: str, end: str | None = None) -> list[dict]:
    """Fetch observations for a FRED series. Values come back as strings."""
    params = {
        "series_id": series_id,
        "api_key": API_KEY,
        "file_type": "json",
        "observation_start": start,
    }
    if end:
        params["observation_end"] = end
    resp = httpx.get(f"{BASE}/series/observations", params=params, timeout=30)
    resp.raise_for_status()
    rows = []
    for obs in resp.json().get("observations", []):
        if obs["value"] == ".":  # FRED uses "." for missing values
            continue
        rows.append({"date": date.fromisoformat(obs["date"]), "value": Decimal(obs["value"])})
    return rows

# 10-year Treasury yield, 2024
for obs in get_observations("DGS10", "2024-01-01", "2024-12-31")[:3]:
    print(obs["date"], obs["value"])
```

**Notes:**
- API key goes in the `api_key` query parameter; `file_type=json` avoids XML
- Missing values are the string `"."` — filter before converting to Decimal
- Popular series: `DGS10` (10Y Treasury), `FEDFUNDS`, `CPIAUCSL`, `UNRATE`, `GDP`
- Rate limit is generous (120 req/min); no auth needed for the website, key required for API
