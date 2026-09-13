---
name: "GitHub REST API"
provider: "GitHub"
category: "developer-platform"
status: "active"
officialDocs: "https://docs.github.com/en/rest"
homepage: "https://github.com/"
baseUrl: "https://api.github.com"
auth: "Bearer token recommended; selected public resources allow unauthenticated requests"
versioning: "Version selected with X-GitHub-Api-Version header"
resourceGroups: ["Repositories","Issues","Pull requests","Actions","Git data","Users","Organizations"]
pagination: "Link headers and per_page/page or endpoint-specific cursors"
errors: "HTTP status with JSON message and documentation_url"
webhooks: "Repository, organization and app webhooks are supported"
sdks: ["Octokit"]
summary: "GitHub's official REST surface for repositories, collaboration, Actions, Git data, and account resources."
pricing: "API access follows GitHub product and authentication context"
rateLimit: "Primary and secondary rate limits depend on authentication and operation"
formats: ["JSON"]
protocols: ["REST","Webhooks"]
bestFor: ["Repository automation","Pull-request and issue integrations"]
cautions: ["Use fine-grained permissions.","Respect secondary limits and conditional requests."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://docs.github.com/en/rest","https://docs.github.com/en/rest/using-the-rest-api"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.github.com"
    sourceUrl: "https://docs.github.com/en/rest"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "Bearer token recommended; selected public resources allow unauthenticated requests"
    sourceUrl: "https://docs.github.com/en/rest/using-the-rest-api"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "API access follows GitHub product and authentication context"
    sourceUrl: "https://docs.github.com/en/rest/using-the-rest-api"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Primary and secondary rate limits depend on authentication and operation"
    sourceUrl: "https://docs.github.com/en/rest/using-the-rest-api"
    verifiedAt: "2026-09-13"
tags: ["repositories","issues","pull-requests","developer-platform"]
---

## What it covers

GitHub's official REST surface for repositories, collaboration, Actions, Git data, and account resources. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Decision notes

Best suited to repository automation and pull-request and issue integrations. Before production, verify use fine-grained permissions. respect secondary limits and conditional requests. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.
