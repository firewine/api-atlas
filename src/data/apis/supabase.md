---
name: "Supabase Data APIs"
provider: "Supabase"
category: "developer-platform"
status: "active"
officialDocs: "https://supabase.com/docs/guides/api"
homepage: "https://supabase.com/"
baseUrl: "https://PROJECT_REF.supabase.co/rest/v1"
auth: "Project key plus user JWT or service-role context"
versioning: "Project REST endpoints are generated from the database schema"
resourceGroups: ["Tables and views","Postgres functions","GraphQL","Storage","Auth","Realtime"]
pagination: "PostgREST Range headers and query parameters"
errors: "PostgREST and product-specific JSON errors"
webhooks: "Database webhooks and Realtime changes are supported"
sdks: ["JavaScript","Flutter","Python","C#","Swift","Kotlin"]
summary: "Auto-generated REST and GraphQL data APIs backed by a project's Postgres schema, alongside Auth, Storage, and Realtime."
pricing: "Free and paid project plans with usage-based allowances"
rateLimit: "Resource and product limits depend on the project plan"
formats: ["JSON"]
protocols: ["REST","GraphQL","WebSocket"]
bestFor: ["Postgres-backed applications","Rapid CRUD APIs with row-level security"]
cautions: ["Never expose the service-role key.","Row-level security must be designed and tested."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://supabase.com/docs/guides/api","https://supabase.com/docs/guides/api/api-keys"]
mutableFacts:
  - key: "base-url"
    label: "Base URL"
    value: "https://PROJECT_REF.supabase.co/rest/v1"
    sourceUrl: "https://supabase.com/docs/guides/api"
    verifiedAt: "2026-09-13"
  - key: "authentication"
    label: "Authentication"
    value: "Project key plus user JWT or service-role context"
    sourceUrl: "https://supabase.com/docs/guides/api/api-keys"
    verifiedAt: "2026-09-13"
  - key: "pricing"
    label: "Pricing"
    value: "Free and paid project plans with usage-based allowances"
    sourceUrl: "https://supabase.com/docs/guides/api/api-keys"
    verifiedAt: "2026-09-13"
  - key: "rate-limits"
    label: "Rate limits"
    value: "Resource and product limits depend on the project plan"
    sourceUrl: "https://supabase.com/docs/guides/api/api-keys"
    verifiedAt: "2026-09-13"
tags: ["tables-and-views","postgres-functions","graphql","developer-platform"]
---

## What it covers

Auto-generated REST and GraphQL data APIs backed by a project's Postgres schema, alongside Auth, Storage, and Realtime. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Key endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /rest/v1/{table}` | Query table rows |
| `POST /rest/v1/{table}` | Insert rows |
| `PATCH /rest/v1/{table}` | Update rows |
| `DELETE /rest/v1/{table}` | Delete rows |
| `POST /auth/v1/signup` | User signup |
| `POST /auth/v1/token?grant_type=password` | User login |
| `GET /auth/v1/user` | Current user |
| `POST /storage/v1/object/{bucket}/{path}` | Upload file |

## Decision notes

Best suited to postgres-backed applications and rapid crud apis with row-level security. Before production, verify never expose the service-role key. row-level security must be designed and tested. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.

## Python example: query a table (two headers)

```python
import httpx

PROJECT_REF = "your_project_ref"
ANON_KEY = "your_anon_key"  # or service_role key server-side (never in browser)
BASE = f"https://{PROJECT_REF}.supabase.co/rest/v1"
HEADERS = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
}

def select(table: str, **filters) -> list[dict]:
    """Select rows. Filters use PostgREST syntax: col=eq.value."""
    params = {k: f"eq.{v}" for k, v in filters.items()}
    params["select"] = "*"
    resp = httpx.get(f"{BASE}/{table}", headers=HEADERS, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()

def insert(table: str, row: dict) -> dict:
    resp = httpx.post(
        f"{BASE}/{table}",
        headers={**HEADERS, "Prefer": "return=representation"},
        json=row,
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()[0]

# Example: read tasks
for t in select("tasks", status="open")[:5]:
    print(t["id"], t.get("title"))
```

**Notes:**
- Both `apikey` and `Authorization: Bearer` headers are required on REST calls
- `service_role` key bypasses Row Level Security — server-side only, never in frontend code
- RLS policies decide what anon/authenticated roles can see; test them, don't assume
- Use `Prefer: return=representation` on writes to get the inserted row back
