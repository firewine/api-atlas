---
name: "Neon API"
provider: "Neon"
category: "developer-platform"
status: "active"
officialDocs: "https://neon.com/docs/reference/api"
homepage: "https://neon.com/"
baseUrl: "https://console.neon.tech/api/v2"
auth: "API key via Bearer token"
versioning: "API v2"
resourceGroups: ["Projects", "Branches", "Databases", "Roles", "Endpoints", "Operations"]
pagination: "Cursor-based pagination with limit parameter"
errors: "Standard HTTP errors with JSON detail"
webhooks: "Not natively supported"
sdks: ["JavaScript", "Python via community"]
summary: "Serverless PostgreSQL platform with branching, autoscaling, and a management REST API."
pricing: "Free: 100 projects, 100 CU-hours/month and 1 GB storage per project; paid usage-based Launch/Scale plans"
rateLimit: "700 requests/minute; additional route and operation burst limits apply"
formats: ["JSON"]
protocols: ["REST", "PostgreSQL wire protocol"]
bestFor: ["Serverless Postgres", "Database branching for dev/test", "Auto-suspending databases"]
cautions: ["Direct connections and pooled connections behave differently — test both.", "Free tier computes suspend after inactivity; first query has cold-start latency.", "Always use SSL with verify-full in production."]
verifiedAt: "2026-10-15"
sourceUrls: ["https://neon.com/docs/reference/api", "https://neon.com/docs/reference/api/get-started", "https://neon.com/docs/reference/api/key-concepts", "https://neon.com/pricing"]
mutableFacts:
  - label: "Base URL"
    value: "https://console.neon.tech/api/v2"
    sourceUrl: "https://neon.com/docs/reference/api/get-started"
    verifiedAt: "2026-10-15"
  - label: "Authentication"
    value: "API key in Authorization: Bearer header"
    sourceUrl: "https://neon.com/docs/reference/api/get-started"
    verifiedAt: "2026-10-15"
  - label: "Pricing"
    value: "Free: 100 projects, 100 CU-hours/month and 1 GB storage per project; Launch/Scale usage-based"
    sourceUrl: "https://neon.com/pricing"
    verifiedAt: "2026-10-15"
  - label: "Rate limits"
    value: "700 requests/minute; 40 requests/second burst per route; key creation 10 requests/second"
    sourceUrl: "https://neon.com/docs/reference/api/key-concepts"
    verifiedAt: "2026-10-15"
---

# Neon API

Neon provides serverless PostgreSQL with instant branching, autoscaling, and scale-to-zero. Two interfaces: the **management REST API** (projects, branches, operations) and the **PostgreSQL wire protocol** (your app's database connection).

## Management API

```bash
# List projects
curl -H "Authorization: Bearer $NEON_API_KEY" \
  https://console.neon.tech/api/v2/projects

# Create a branch
curl -X POST \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"branch": {"name": "feature-x"}}' \
  https://console.neon.tech/api/v2/projects/{project_id}/branches
```

## Connecting with Psycopg (Python)

```python
import psycopg
from psycopg.rows import dict_row

conninfo = {
    "host": "ep-xxxx-xxxx.us-east-2.aws.neon.tech",
    "dbname": "neondb",
    "user": "app_role",
    "password": "secret",
    "sslmode": "verify-full",
    "sslrootcert": "/etc/ssl/certs/ca-certificates.crt",
    "channel_binding": "require",
}

with psycopg.connect(**conninfo, row_factory=dict_row) as conn:
    conn.read_only = True  # for read-only queries
    with conn.cursor() as cur:
        cur.execute("SELECT count(*) AS count FROM projects")
        print(cur.fetchone()["count"])
```

Always use parameterized queries — never interpolate user input into SQL:

```python
cur.execute("SELECT id FROM projects WHERE id = %s", (project_id,))
```

## Real-world notes

**Direct vs pooled.** Neon offers direct connections and a connection pooler. They behave differently for prepared statements, transactions, and migrations. Use direct connections for `pg_dump`/`pg_restore` and migrations; test the pooler separately before switching.

**Cold starts.** Suspended computes resume on first query, adding latency. Design health checks to distinguish "database warming up" from "database down."

**Branching.** Branches are copy-on-write and instant. Ideal for per-PR databases or testing migrations safely.
