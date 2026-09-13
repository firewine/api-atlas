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
  - label: "Base URL"
    value: "https://PROJECT_REF.supabase.co/rest/v1"
    sourceUrl: "https://supabase.com/docs/guides/api"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "Project key plus user JWT or service-role context"
    sourceUrl: "https://supabase.com/docs/guides/api/api-keys"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Free and paid project plans with usage-based allowances"
    sourceUrl: "https://supabase.com/docs/guides/api/api-keys"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Resource and product limits depend on the project plan"
    sourceUrl: "https://supabase.com/docs/guides/api/api-keys"
    verifiedAt: "2026-09-13"
tags: ["tables-and-views","postgres-functions","graphql","developer-platform"]
---

## What it covers

Auto-generated REST and GraphQL data APIs backed by a project's Postgres schema, alongside Auth, Storage, and Realtime. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Decision notes

Best suited to postgres-backed applications and rapid crud apis with row-level security. Before production, verify never expose the service-role key. row-level security must be designed and tested. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.
