---
name: "Cloudflare API"
provider: "Cloudflare"
category: "developer-platform"
status: "active"
officialDocs: "https://developers.cloudflare.com/api/overview/"
homepage: "https://www.cloudflare.com/developer-platform/"
baseUrl: "https://api.cloudflare.com/client/v4"
auth: "Scoped API token in Authorization Bearer header; legacy global API key also documented"
versioning: "client/v4 REST base with evolving endpoint resources"
resourceGroups: ["Accounts","Zones","DNS","Workers","Pages","R2","Rules"]
pagination: "Endpoint-specific pagination documented in each operation"
errors: "JSON success, errors, messages and result envelope"
webhooks: "Product-specific event and notification mechanisms"
sdks: ["TypeScript","Go","Python"]
summary: "A broad control-plane API for Cloudflare accounts, zones, DNS, Workers, Pages, storage, and security products."
pricing: "API operations manage products whose pricing and entitlements vary"
rateLimit: "Cloudflare documents global and endpoint-specific limits"
formats: ["JSON"]
protocols: ["REST"]
bestFor: ["Edge-platform automation","DNS and zone management"]
cautions: ["Prefer narrowly scoped tokens.","Account and zone identifiers are required by many operations."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://developers.cloudflare.com/api/overview/","https://developers.cloudflare.com/fundamentals/api/get-started/create-token/"]
mutableFacts:
  - key: "base-url"
    label: "Base URL"
    value: "https://api.cloudflare.com/client/v4"
    sourceUrl: "https://developers.cloudflare.com/api/overview/"
    verifiedAt: "2026-09-13"
  - key: "authentication"
    label: "Authentication"
    value: "Scoped API token in Authorization Bearer header; legacy global API key also documented"
    sourceUrl: "https://developers.cloudflare.com/fundamentals/api/get-started/create-token/"
    verifiedAt: "2026-09-13"
  - key: "pricing"
    label: "Pricing"
    value: "API operations manage products whose pricing and entitlements vary"
    sourceUrl: "https://developers.cloudflare.com/fundamentals/api/get-started/create-token/"
    verifiedAt: "2026-09-13"
  - key: "rate-limits"
    label: "Rate limits"
    value: "Cloudflare documents global and endpoint-specific limits"
    sourceUrl: "https://developers.cloudflare.com/fundamentals/api/get-started/create-token/"
    verifiedAt: "2026-09-13"
tags: ["accounts","zones","dns","developer-platform"]
---

## What it covers

A broad control-plane API for Cloudflare accounts, zones, DNS, Workers, Pages, storage, and security products. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Key endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /client/v4/zones` | List zones |
| `GET /client/v4/zones/{zone_id}` | Zone details |
| `GET /client/v4/zones/{zone_id}/dns_records` | List DNS records |
| `POST /client/v4/zones/{zone_id}/dns_records` | Create DNS record |
| `PATCH /client/v4/zones/{zone_id}/dns_records/{id}` | Update DNS record |
| `DELETE /client/v4/zones/{zone_id}/dns_records/{id}` | Delete DNS record |
| `GET /client/v4/accounts` | List accounts |
| `GET /client/v4/zones/{zone_id}/purge_cache` | Purge cache |

## Decision notes

Best suited to edge-platform automation and dns and zone management. Before production, verify prefer narrowly scoped tokens. account and zone identifiers are required by many operations. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.

## Python example: list zones (bearer token)

```python
import httpx

API_TOKEN = "your_cloudflare_api_token"
BASE = "https://api.cloudflare.com/client/v4"
HEADERS = {"Authorization": f"Bearer {API_TOKEN}"}

def api_get(path: str, params: dict | None = None) -> dict:
    """GET helper. Cloudflare nests results and reports success explicitly."""
    resp = httpx.get(f"{BASE}{path}", headers=HEADERS, params=params or {}, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    if not data.get("success"):
        raise RuntimeError(f"Cloudflare errors: {data.get('errors')}")
    return data

def list_zones() -> list[dict]:
    zones, page = [], 1
    while True:
        data = api_get("/zones", {"page": page, "per_page": 50})
        zones.extend(data["result"])
        info = data["result_info"]
        if page >= info["total_pages"]:
            break
        page += 1
    return zones

for z in list_zones():
    print(z["name"], z["status"], z["plan"]["name"])
```

**Notes:**
- Prefer scoped API tokens over the global API key; tokens need explicit zone/account permissions
- Every response has `success` + `errors` — check it, don't rely on HTTP status alone
- Pagination via `result_info.total_pages`; default page size is 20
- Rate limit 1200 req/5min per account; 429s should back off
