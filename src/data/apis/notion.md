---
name: "Notion API"
provider: "Notion"
category: "communications"
status: "active"
officialDocs: "https://developers.notion.com/reference/intro"
homepage: "https://www.notion.com/product/integrations"
baseUrl: "https://api.notion.com/v1"
auth: "Bearer token from an internal, personal, or OAuth connection"
versioning: "Required Notion-Version request header"
resourceGroups: ["Pages","Blocks","Databases","Data sources","Comments","Users","Search"]
pagination: "start_cursor and page_size with next_cursor and has_more"
errors: "Structured JSON errors; 429 and 529 include retry guidance"
webhooks: "Webhook events for pages, databases, data sources, comments and more"
sdks: ["JavaScript"]
summary: "A workspace content API for pages, blocks, data sources, comments, users, search, and webhooks."
pricing: "API access accompanies Notion connections; workspace plan limits also apply"
rateLimit: "Per-connection and per-workspace limits; current plan-specific values are official-doc mutable facts"
formats: ["JSON"]
protocols: ["REST","Webhooks"]
bestFor: ["Knowledge-base integrations","Content workflow automation"]
cautions: ["Notion-Version is required.","Respect Retry-After for 429 and 529 responses."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://developers.notion.com/reference/intro","https://developers.notion.com/reference/authentication","https://developers.notion.com/reference/request-limits"]
mutableFacts:
  - key: "base-url"
    label: "Base URL"
    value: "https://api.notion.com/v1"
    sourceUrl: "https://developers.notion.com/reference/intro"
    verifiedAt: "2026-09-13"
  - key: "authentication"
    label: "Authentication"
    value: "Bearer token from an internal, personal, or OAuth connection"
    sourceUrl: "https://developers.notion.com/reference/authentication"
    verifiedAt: "2026-09-13"
  - key: "pricing"
    label: "Pricing"
    value: "API access accompanies Notion connections; workspace plan limits also apply"
    sourceUrl: "https://developers.notion.com/reference/authentication"
    verifiedAt: "2026-09-13"
  - key: "rate-limits"
    label: "Rate limits"
    value: "Per-connection and per-workspace limits; current plan-specific values are official-doc mutable facts"
    sourceUrl: "https://developers.notion.com/reference/authentication"
    verifiedAt: "2026-09-13"
tags: ["pages","blocks","databases","communications"]
---

## What it covers

A workspace content API for pages, blocks, data sources, comments, users, search, and webhooks. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Key endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /v1/pages` | Create a page |
| `GET /v1/pages/{page_id}` | Retrieve a page |
| `PATCH /v1/pages/{page_id}` | Update page properties |
| `POST /v1/databases/{db_id}/query` | Query a database |
| `POST /v1/databases` | Create a database |
| `GET /v1/blocks/{block_id}/children` | List block children |
| `PATCH /v1/blocks/{block_id}` | Update a block |
| `GET /v1/search` | Search pages/databases |

## Decision notes

Best suited to knowledge-base integrations and content workflow automation. Before production, verify notion-version is required. respect retry-after for 429 and 529 responses. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.

## Python example: query a database (version header required)

```python
import httpx

API_KEY = "your_notion_integration_token"
BASE = "https://api.notion.com/v1"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Notion-Version": "2022-06-28",  # required — pin a version
    "Content-Type": "application/json",
}

def query_database(database_id: str, filter_: dict | None = None) -> list[dict]:
    """Query a database. Paginate with start_cursor."""
    rows, cursor = [], None
    while True:
        body = {"page_size": 50}
        if filter_:
            body["filter"] = filter_
        if cursor:
            body["start_cursor"] = cursor
        resp = httpx.post(f"{BASE}/databases/{database_id}/query", headers=HEADERS, json=body, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        rows.extend(data["results"])
        if not data.get("has_more"):
            break
        cursor = data["next_cursor"]
    return rows

def page_title(page: dict) -> str:
    for prop in page["properties"].values():
        if prop["type"] == "title" and prop["title"]:
            return prop["title"][0]["plain_text"]
    return "(untitled)"

for p in query_database("your_database_id")[:5]:
    print(page_title(p))
```

**Notes:**
- `Notion-Version` header is mandatory; pin it to avoid surprise breaking changes
- The integration must be shared with the database/page or queries return empty
- Properties are typed (`title`, `rich_text`, `select`, `date`...) — parse per type
- Rate limit ~3 req/sec; back off on 429
