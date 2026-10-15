---
name: "Stripe API"
provider: "Stripe"
category: "payments"
status: "active"
officialDocs: "https://docs.stripe.com/api"
homepage: "https://stripe.com/"
baseUrl: "https://api.stripe.com/v1"
auth: "Secret key with HTTP Basic authentication; publishable keys have limited client uses"
versioning: "Account or request API version controls response behavior"
resourceGroups: ["Customers","PaymentIntents","Checkout","Subscriptions","Invoices","Connect"]
pagination: "Cursor pagination with starting_after or ending_before"
errors: "Structured Stripe error object and request ID"
webhooks: "Signed webhooks for asynchronous events"
sdks: ["Node.js","Python","Ruby","PHP","Java",".NET","Go"]
summary: "A mature payments and billing API covering checkout, payment intents, subscriptions, invoicing, and platforms."
pricing: "Transaction and product-specific pricing varies by country and feature"
rateLimit: "Global and endpoint-specific limiters; handle 429 responses"
formats: ["JSON","Form-encoded requests"]
protocols: ["REST","Webhooks"]
bestFor: ["Online payments and billing","Marketplace and platform payments"]
cautions: ["Verify webhook signatures.","Use idempotency keys for safely retried writes."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://docs.stripe.com/api","https://docs.stripe.com/rate-limits"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.stripe.com/v1"
    sourceUrl: "https://docs.stripe.com/api"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "Secret key with HTTP Basic authentication; publishable keys have limited client uses"
    sourceUrl: "https://docs.stripe.com/rate-limits"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Transaction and product-specific pricing varies by country and feature"
    sourceUrl: "https://docs.stripe.com/rate-limits"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Global and endpoint-specific limiters; handle 429 responses"
    sourceUrl: "https://docs.stripe.com/rate-limits"
    verifiedAt: "2026-09-13"
tags: ["customers","paymentintents","checkout","payments"]
---

## What it covers

A mature payments and billing API covering checkout, payment intents, subscriptions, invoicing, and platforms. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Decision notes

Best suited to online payments and billing and marketplace and platform payments. Before production, verify verify webhook signatures. use idempotency keys for safely retried writes. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.

## Python example: customers and charges (test mode)

```python
import httpx
from httpx import BasicAuth

SECRET_KEY = "sk_test_your_key"  # TEST key — never use live keys in code samples
BASE = "https://api.stripe.com/v1"

def create_customer(email: str, name: str | None = None) -> dict:
    """Create a customer. Stripe uses form-encoded bodies with basic auth."""
    data = {"email": email}
    if name:
        data["name"] = name
    resp = httpx.post(
        f"{BASE}/customers", auth=BasicAuth(SECRET_KEY, ""), data=data, timeout=30
    )
    resp.raise_for_status()
    return resp.json()

def list_charges(limit: int = 10) -> list[dict]:
    resp = httpx.get(
        f"{BASE}/charges", auth=BasicAuth(SECRET_KEY, ""), params={"limit": limit}, timeout=30
    )
    resp.raise_for_status()
    return resp.json()["data"]

customer = create_customer("dev@example.com", "Dev Example")
print("created:", customer["id"])
```

**Notes:**
- Secret key goes in HTTP Basic auth username (password empty) — not a Bearer header
- Request bodies are `application/x-www-form-urlencoded`, not JSON
- Always develop against `sk_test_*` keys; live keys start `sk_live_*`
- Idempotency: send `Idempotency-Key` header on POSTs to safely retry
- Use the official `stripe` SDK in production — it handles retries, pagination, and webhooks
