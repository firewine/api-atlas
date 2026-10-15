---
name: "Treasury Fiscal Data API"
provider: "U.S. Department of the Treasury"
category: "public-data"
status: "active"
officialDocs: "https://fiscaldata.treasury.gov/api-documentation/"
homepage: "https://fiscaldata.treasury.gov/"
baseUrl: "https://api.fiscaldata.treasury.gov/services/api/fiscal_service"
auth: "No authentication required for public endpoints"
versioning: "Versioned dataset paths such as v1"
resourceGroups: ["Debt","Revenue","Spending","Interest and exchange rates","Savings bonds"]
pagination: "page[number] and page[size], with meta and links"
errors: "HTTP status and JSON error information"
webhooks: "No webhooks documented"
sdks: []
summary: "Official U.S. Treasury fiscal datasets with filtering, sorting, field selection, and pagination."
pricing: "Free public access"
rateLimit: "No fixed numeric limit recorded; clients should cache and request responsibly"
formats: ["JSON","CSV"]
protocols: ["REST"]
bestFor: ["Federal debt and cash data","Machine-readable fiscal series"]
cautions: ["Each dataset has its own update cadence.","Read dataset metadata before combining series."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://fiscaldata.treasury.gov/api-documentation/","https://fiscaldata.treasury.gov/api-documentation/#getting-started"]
mutableFacts:
  - key: "base-url"
    label: "Base URL"
    value: "https://api.fiscaldata.treasury.gov/services/api/fiscal_service"
    sourceUrl: "https://fiscaldata.treasury.gov/api-documentation/"
    verifiedAt: "2026-09-13"
  - key: "authentication"
    label: "Authentication"
    value: "No authentication required for public endpoints"
    sourceUrl: "https://fiscaldata.treasury.gov/api-documentation/#getting-started"
    verifiedAt: "2026-09-13"
  - key: "pricing"
    label: "Pricing"
    value: "Free public access"
    sourceUrl: "https://fiscaldata.treasury.gov/api-documentation/#getting-started"
    verifiedAt: "2026-09-13"
  - key: "rate-limits"
    label: "Rate limits"
    value: "No fixed numeric limit recorded; clients should cache and request responsibly"
    sourceUrl: "https://fiscaldata.treasury.gov/api-documentation/#getting-started"
    verifiedAt: "2026-09-13"
tags: ["debt","revenue","spending","public-data"]
---

## What it covers

Official U.S. Treasury fiscal datasets with filtering, sorting, field selection, and pagination. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Key endpoints

| Pattern | Description |
|---------|-------------|
| `GET /v2/accounting/od/avg_interest_rates` | Average interest rates |
| `GET /v2/accounting/od/debt_to_penny` | Debt to the penny |
| `GET /v2/accounting/od/savings_bonds` | Savings bonds data |
| `?filter=record_date:gte:2024-01-01` | Date range filter |
| `?filter=security_type_desc:eq:Bill` | Equality filter |
| `?sort=-record_date&page[size]=100` | Sort and pagination |

## Decision notes

Best suited to federal debt and cash data and machine-readable fiscal series. Before production, verify each dataset has its own update cadence. read dataset metadata before combining series. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.

## Python example: querying a dataset with pagination

```python
import httpx

BASE = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service"

def query(dataset: str, **filters) -> list[dict]:
    """Query a Fiscal Data dataset. Pagination via page[number]/page[size]."""
    params = {"page[number]": 1, "page[size]": 100}
    for k, v in filters.items():
        params[f"filter[{k}]"] = v
    rows = []
    while True:
        resp = httpx.get(f"{BASE}/{dataset}", params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        rows.extend(data.get("data", []))
        links = data.get("links", {})
        if not links.get("next"):
            break
        params["page[number]"] += 1
    return rows

# Daily Treasury par yield curve rates, sorted newest first
rates = query(
    "v2/accounting/od/avg_interest_rates",
    sort="-record_date",
    **{"record_date:gte": "2024-01-01"},
)
for r in rates[:3]:
    print(r["record_date"], r.get("avg_interest_rate_amt"))
```

**Notes:**
- No API key required — fully open
- Filters use `filter[field:op]=value` syntax (`:gte`, `:lte`, `:eq`); sort with `sort=-field`
- Always paginate via `links.next`; default page size is small
- Dataset paths are versioned (`v1/`, `v2/`); check the dataset docs for exact fields
