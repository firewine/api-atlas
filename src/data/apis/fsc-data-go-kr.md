---
name: "FSC Basic Fund Product Information"
provider: "Financial Services Commission / data.go.kr"
category: "public-data"
status: "active"
officialDocs: "https://www.data.go.kr/en/data/15094792/openapi.do"
homepage: "https://www.data.go.kr/"
baseUrl: "https://apis.data.go.kr/1160100/service/GetFundProductInfoService"
auth: "data.go.kr serviceKey query parameter"
versioning: "A service-specific GetFundProductInfoService path without a separate version segment."
resourceGroups: ["Fund product standard-code lookup"]
pagination: "pageNo and numOfRows query parameters."
errors: "The Public Data Portal's standard response and service error codes apply."
webhooks: "No webhook interface is listed for this public-data service."
sdks: []
summary: "An official Korean public API for fund names, standard codes, operators, categories, types, and reference dates."
pricing: "Free, with an application for use through the Public Data Portal."
rateLimit: "The listed development allowance is 10,000 requests; production increases may be requested with a use case."
formats: ["JSON", "XML"]
protocols: ["REST"]
bestFor:
  - "Korean fund product and standard-code lookup"
  - "Official public-sector source provenance"
  - "Fund-name, short-code, type, and date filters"
cautions:
  - "Not every FSC-linked dataset is real time."
  - "The portal documents daily collection with next-business-day availability after 13:00 for this service."
verifiedAt: "2026-09-13"
sourceUrls:
  - "https://www.data.go.kr/en/data/15094792/openapi.do"
  - "https://www.data.go.kr/catalog/15094792/openapi.json"
mutableFacts:
  - label: "Base URL"
    value: "https://apis.data.go.kr/1160100/service/GetFundProductInfoService"
    sourceUrl: "https://www.data.go.kr/en/data/15094792/openapi.do"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "data.go.kr serviceKey query parameter"
    sourceUrl: "https://www.data.go.kr/en/data/15094792/openapi.do"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Free with an application for use through the Public Data Portal"
    sourceUrl: "https://www.data.go.kr/en/data/15094792/openapi.do"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "The listed development allowance is 10,000 requests; production increases may be requested with a use case"
    sourceUrl: "https://www.data.go.kr/en/data/15094792/openapi.do"
    verifiedAt: "2026-09-13"
  - label: "Development traffic"
    value: "10,000 requests for the development account"
    sourceUrl: "https://www.data.go.kr/en/data/15094792/openapi.do"
    verifiedAt: "2026-09-13"
  - label: "Review and fee"
    value: "Free; automatic approval is listed for development and production stages"
    sourceUrl: "https://www.data.go.kr/en/data/15094792/openapi.do"
    verifiedAt: "2026-09-13"
tags: ["korea", "funds", "standard-codes", "government", "open-data"]
---

## What it covers

This FSC service exposes basic fund-product information sourced from the Korea Financial Investment Association. Its single operation supports exact or partial fund-name filters, short codes, categories, fund types, and reference-date ranges.

## Request shape

```bash
curl "https://apis.data.go.kr/1160100/service/GetFundProductInfoService/getStandardCodeInfo?serviceKey=YOUR_KEY&resultType=json&pageNo=1&numOfRows=10&likeFndNm=INDEX"
```

The portal may show both encoded and decoded forms of a service key. Use the form appropriate to the HTTP client so the key is not accidentally encoded twice.

## Key endpoints

| Service / Operation | Description |
|---------------------|-------------|
| `GetFundProductInfoService` | Fund product information |
| `getFundProductInfo` | Fund details by code |
| `getFundPriceInfo` | Fund NAV/price history |
| `getFundDividendsInfo` | Fund distribution history |

## Decision notes

The service is useful for identifier discovery and official-source enrichment, but it is not a live NAV or price feed. Persist `basDt` and retrieval time separately, and do not infer present availability from a historical fund record alone.

## Python example: fund product info with pagination

```python
import httpx
from urllib.parse import quote

SERVICE_KEY = "your_data_go_kr_service_key"  # URL-encoded already if issued so
BASE = "https://apis.data.go.kr/1160100/service/GetFundProductInfoService"

def get_fund_products(page_no: int = 1, num_rows: int = 100) -> dict:
    """Query fund product info. Handles the standard data.go.kr envelope."""
    resp = httpx.get(
        f"{BASE}/getFundProductInfo",
        params={
            "serviceKey": SERVICE_KEY,
            "pageNo": page_no,
            "numOfRows": num_rows,
            "resultType": "json",
        },
        timeout=30,
    )
    resp.raise_for_status()
    body = resp.json()["response"]["body"]
    return body

def iter_all_funds():
    """Paginate through all fund products."""
    page = 1
    while True:
        body = get_fund_products(page_no=page)
        items = body.get("items", {}).get("item", [])
        if isinstance(items, dict):  # single item comes back as dict, not list
            items = [items]
        if not items:
            break
        yield from items
        if page * 100 >= int(body.get("totalCount", 0)):
            break
        page += 1

for fund in iter_all_funds():
    print(fund.get("fundName"), fund.get("fundCode"))
    break  # remove to iterate all
```

**Notes:**
- `serviceKey` must be URL-encoded if it contains special characters — most issued keys do
- Single-item responses return a dict instead of a list; normalize before iterating
- `resultType=json` avoids XML parsing; default is XML
- Rate limits are generous but add delays between pages for large crawls
