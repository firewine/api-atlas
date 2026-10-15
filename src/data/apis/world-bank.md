---
name: "World Bank Indicators API"
provider: "World Bank"
category: "public-data"
status: "active"
officialDocs: "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation"
homepage: "https://data.worldbank.org/"
baseUrl: "https://api.worldbank.org/v2"
auth: "No API key or authentication required"
versioning: "Version 2; version 1 is retired"
resourceGroups: ["Countries","Indicators","Sources","Topics","Income levels","Lending types"]
pagination: "page and per_page parameters with response metadata"
errors: "HTTP errors and format-specific error payloads"
webhooks: "No webhooks documented"
sdks: []
summary: "Public access to World Bank development indicators and their country, source, and topic metadata."
pricing: "Free public access"
rateLimit: "No fixed public quota recorded in the reviewed overview"
formats: ["XML","JSON","JSON-stat","CSV"]
protocols: ["REST"]
bestFor: ["Cross-country development indicators","Long-run public datasets"]
cautions: ["V1 endpoints no longer work.","Revisions and missing country-year values require explicit handling."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation","https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.worldbank.org/v2"
    sourceUrl: "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "No API key or authentication required"
    sourceUrl: "https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Free public access"
    sourceUrl: "https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "No fixed public quota recorded in the reviewed overview"
    sourceUrl: "https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures"
    verifiedAt: "2026-09-13"
tags: ["countries","indicators","sources","public-data"]
---

## What it covers

Public access to World Bank development indicators and their country, source, and topic metadata. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Decision notes

Best suited to cross-country development indicators and long-run public datasets. Before production, verify v1 endpoints no longer work. revisions and missing country-year values require explicit handling. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.

## Python example: country indicators (no auth)

```python
import httpx

BASE = "https://api.worldbank.org/v2"

def get_indicator(country: str, indicator: str, per_page: int = 20) -> list[dict]:
    """Fetch an indicator series. Metadata sits in element [0], data in [1]."""
    resp = httpx.get(
        f"{BASE}/country/{country}/indicator/{indicator}",
        params={"format": "json", "per_page": per_page},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    rows = []
    for entry in data[1] or []:
        if entry["value"] is None:
            continue
        rows.append({"year": int(entry["date"]), "value": entry["value"]})
    return rows

# US GDP growth (annual %) — indicator NY.GDP.MKTP.KD.ZG
for r in get_indicator("US", "NY.GDP.MKTP.KD.ZG", per_page=5):
    print(r["year"], r["value"])
```

**Notes:**
- No authentication required; `format=json` avoids XML
- Response is a 2-element list: `[metadata, data]` — data may be `None` for bad queries
- `value` is `None` for missing years; filter before use
- Country codes are ISO3 (`US`, `KR`, `CN`); use `all` for every country (paginates)
