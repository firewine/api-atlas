---
name: "Paddle Billing API"
provider: "Paddle"
category: "payments"
status: "active"
officialDocs: "https://developer.paddle.com/api-reference/overview"
homepage: "https://www.paddle.com/"
baseUrl: "https://api.paddle.com"
auth: "Bearer API key in Authorization header"
versioning: "Versioning is documented through Paddle's API and changelog"
resourceGroups: ["Customers","Products","Prices","Transactions","Subscriptions","Adjustments"]
pagination: "Cursor pagination with after and per_page"
errors: "Structured error responses with request identifiers"
webhooks: "Signed notifications for subscription and transaction events"
sdks: ["Node.js","Python","PHP","Go"]
summary: "Merchant-of-record billing APIs for products, prices, customers, transactions, and subscriptions."
pricing: "Commercial merchant-of-record pricing; verify current terms"
rateLimit: "Rate limits are documented by endpoint and response headers"
formats: ["JSON"]
protocols: ["REST","Webhooks"]
bestFor: ["SaaS merchant-of-record billing","Subscription lifecycle automation"]
cautions: ["Sandbox and live credentials are separate.","Process notifications idempotently."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://developer.paddle.com/api-reference/overview","https://developer.paddle.com/api-reference/about/rate-limiting"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.paddle.com"
    sourceUrl: "https://developer.paddle.com/api-reference/overview"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "Bearer API key in Authorization header"
    sourceUrl: "https://developer.paddle.com/api-reference/about/rate-limiting"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Commercial merchant-of-record pricing; verify current terms"
    sourceUrl: "https://developer.paddle.com/api-reference/about/rate-limiting"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Rate limits are documented by endpoint and response headers"
    sourceUrl: "https://developer.paddle.com/api-reference/about/rate-limiting"
    verifiedAt: "2026-09-13"
tags: ["customers","products","prices","payments"]
---

## What it covers

Merchant-of-record billing APIs for products, prices, customers, transactions, and subscriptions. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Key endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /products` | List products |
| `POST /products` | Create product |
| `GET /products/{id}` | Product details |
| `GET /prices` | List prices |
| `POST /prices` | Create price |
| `GET /customers` | List customers |
| `GET /transactions` | List transactions |
| `POST /transactions` | Create transaction |

## Decision notes

Best suited to saas merchant-of-record billing and subscription lifecycle automation. Before production, verify sandbox and live credentials are separate. process notifications idempotently. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.

## Python example: list products (bearer auth)

```python
import httpx

API_KEY = "your_paddle_api_key"  # sandbox keys start with test_
BASE = "https://api.paddle.com"  # sandbox: https://sandbox-api.paddle.com

def api_get(path: str, params: dict | None = None) -> dict:
    resp = httpx.get(
        f"{BASE}{path}",
        headers={"Authorization": f"Bearer {API_KEY}"},
        params=params or {},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()

def list_products(status: str = "active") -> list[dict]:
    """List products. Paddle paginates with `after` cursor."""
    products, after = [], None
    while True:
        params = {"status": status, "per_page": 50}
        if after:
            params["after"] = after
        data = api_get("/products", params)
        products.extend(data["data"])
        pagination = data.get("meta", {}).get("pagination", {})
        if not pagination.get("has_more"):
            break
        after = pagination["next"]
    return products

for p in list_products()[:3]:
    print(p["id"], p["name"], p["status"])
```

**Notes:**
- Bearer token auth; use the sandbox host + test keys for development
- Pagination is cursor-based (`after`); check `meta.pagination.has_more`
- Paddle is the merchant of record — it handles global sales tax/VAT for you
- Webhooks are signed; verify signatures before trusting events
