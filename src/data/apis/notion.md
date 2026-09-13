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
  - label: "Base URL"
    value: "https://api.notion.com/v1"
    sourceUrl: "https://developers.notion.com/reference/intro"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "Bearer token from an internal, personal, or OAuth connection"
    sourceUrl: "https://developers.notion.com/reference/authentication"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "API access accompanies Notion connections; workspace plan limits also apply"
    sourceUrl: "https://developers.notion.com/reference/authentication"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Per-connection and per-workspace limits; current plan-specific values are official-doc mutable facts"
    sourceUrl: "https://developers.notion.com/reference/authentication"
    verifiedAt: "2026-09-13"
tags: ["pages","blocks","databases","communications"]
---

## What it covers

A workspace content API for pages, blocks, data sources, comments, users, search, and webhooks. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Decision notes

Best suited to knowledge-base integrations and content workflow automation. Before production, verify notion-version is required. respect retry-after for 429 and 529 responses. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.
