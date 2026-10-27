---
name: "DeepSeek Search & Fetch"
provider: "DeepSeek"
category: "ai"
status: "active"
officialDocs: "https://api-docs.deepseek.com/guides/search/"
homepage: "https://www.deepseek.com/"
baseUrl: "https://api.deepseek.com"
auth: "Authorization: Bearer with a DeepSeek API key; JSON content type"
versioning: "This profile covers the dedicated /v1/tools/search and /v1/tools/fetch routes, not the full model API."
resourceGroups: ["Web search", "Page fetch"]
pagination: "Search exposes a count parameter; cursor pagination was not established in this review."
errors: "Distinguish authentication 401, insufficient balance 402 and throttling 429."
webhooks: "No webhook contract was verified for these request-response tools."
sdks: []
summary: "Dedicated web retrieval APIs for agent workflows, with tool-specific authentication, usage accounting and limits separate from model inference."
pricing: "Search and Fetch each cost USD 0.75 per 1,000 successful requests; consult the dated billing conditions below."
rateLimit: "Account-level limits: Search 100 requests/second and Fetch 25 requests/second, independently. Fetch also has a per-domain limit whose numeric value was not specified."
formats: ["JSON", "Markdown page content"]
protocols: ["REST"]
bestFor: ["Agent retrieval with explicit endpoint and credential ownership", "Separately metered search and page retrieval"]
cautions:
  - "Chat compatibility does not prove search endpoint or credential compatibility."
  - "This profile does not verify model pricing, account entitlements or live request success."
  - "Target-site access restrictions still apply to Fetch."
verifiedAt: "2026-10-27"
sourceUrls:
  - "https://api-docs.deepseek.com/guides/search/"
  - "https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/web/web-deepseek-api/README.md"
mutableFacts:
  - key: "base-url"
    label: "Dedicated retrieval base"
    value: "https://api.deepseek.com; POST /v1/tools/search and POST /v1/tools/fetch"
    sourceUrl: "https://api-docs.deepseek.com/guides/search/"
    verifiedAt: "2026-10-27"
  - key: "authentication"
    label: "Retrieval authentication"
    value: "DeepSeek API key as Bearer authorization, with application/json content type"
    sourceUrl: "https://api-docs.deepseek.com/guides/search/"
    verifiedAt: "2026-10-27"
  - key: "pricing"
    label: "Tool request pricing"
    value: "Each API: USD 0.75 per 1,000 HTTP-200 requests with nonempty results/content. The described DeepSeek-backed Harness/Claude Code/Codex server tools switch from free calls at 2026-11-01 00:00 Beijing time."
    sourceUrl: "https://api-docs.deepseek.com/guides/search/"
    verifiedAt: "2026-10-27"
  - key: "rate-limits"
    label: "Separate tool quotas"
    value: "Search 100 QPS; Fetch 25 QPS per account, independently across all keys and separate from model concurrency. Fetch also has an unspecified per-domain QPS cap."
    sourceUrl: "https://api-docs.deepseek.com/guides/search/"
    verifiedAt: "2026-10-27"
tags: ["agents", "search", "retrieval", "authentication", "deepseek"]
---

## Deliberately narrow scope

This entry describes dedicated retrieval, not every DeepSeek model or client. The [official Harness module](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/packages/web/web-deepseek-api/README.md) distinguishes this path from search performed through a full Messages model turn. Do not use a tool-request price as the total cost of the latter workflow.

## Integration boundary

Use the [proxy credential and search 401 case](../../guides/deepseek-search-401-proxy-credential-endpoint/) to separate the tool route from chat configuration. Keep keys out of browser bundles and logs, and follow target websites' access policies. Source review on October 27, 2026 did not include a live request, paid call or account setup.
