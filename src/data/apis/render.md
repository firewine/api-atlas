---
name: "Render API"
provider: "Render"
category: "developer-platform"
status: "active"
officialDocs: "https://render.com/docs/api"
homepage: "https://render.com/"
baseUrl: "https://api.render.com/v1"
auth: "API key via Bearer token"
versioning: "API v1"
resourceGroups: ["Services", "Deploys", "Environment Variables", "Custom Domains", "Jobs"]
pagination: "Cursor-based with limit parameter"
errors: "Standard HTTP errors with JSON detail"
webhooks: "Deploy hooks via deploy hook URLs"
sdks: ["Community clients"]
summary: "Cloud platform API for managing web services, databases, background workers, and deployments."
pricing: "Free tier with limitations, paid plans per service type"
rateLimit: "Endpoint-specific; most GET requests share 400/minute per user"
formats: ["JSON"]
protocols: ["REST"]
bestFor: ["Simple cloud deployments", "Docker web services", "Preview environments"]
cautions: ["Free web services spin down after 15 minutes without inbound traffic.", "API rate limits vary by endpoint and usually apply per user; deploy hooks are per service.", "Review the current service plan and deployment settings before production use."]
verifiedAt: "2026-10-15"
sourceUrls: ["https://render.com/docs/api", "https://render.com/docs/free", "https://api-docs.render.com/reference/rate-limiting", "https://api-docs.render.com/reference/list-services"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.render.com/v1"
    sourceUrl: "https://api-docs.render.com/reference/list-services"
    verifiedAt: "2026-10-15"
  - label: "Authentication"
    value: "API key in Authorization: Bearer header"
    sourceUrl: "https://render.com/docs/api"
    verifiedAt: "2026-10-15"
  - label: "Pricing"
    value: "Free web services have limits; paid plans vary by service type"
    sourceUrl: "https://render.com/docs/free"
    verifiedAt: "2026-10-15"
  - label: "Rate limits"
    value: "Endpoint-specific; most GET requests share 400/minute per user"
    sourceUrl: "https://api-docs.render.com/reference/rate-limiting"
    verifiedAt: "2026-10-15"
---

# Render API

Render's REST API manages services, deploys, environment variables, and more. Most day-to-day work happens in the dashboard, but the API enables automation.

## Listing services

```bash
curl -H "Authorization: Bearer $RENDER_API_KEY" \
  "https://api.render.com/v1/services?limit=20"
```

## Triggering a deploy

```bash
# Using a deploy hook URL (no API key needed)
curl -X POST "https://api.render.com/deploy/srv-xxxx?key=yyyy"
```

## Key endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /v1/services` | List services |
| `POST /v1/services` | Create service |
| `GET /v1/services/{serviceId}` | Service details |
| `PATCH /v1/services/{serviceId}` | Update service |
| `DELETE /v1/services/{serviceId}` | Delete service |
| `GET /v1/services/{serviceId}/deploys` | List deploys |
| `POST /v1/services/{serviceId}/deploys` | Trigger deploy |
| `GET /v1/owners` | List owners |

## Real-world notes

**Free tier sleep.** Free web services sleep after 15 minutes without requests. The first request after sleep triggers a cold start (can take 30+ seconds). Don't use uptime checks alone to prove availability.

**Rate limits.** Limits vary by endpoint. Most GET requests share a 400-per-minute limit per user; deploy hooks are limited per service. Handle HTTP 429 with backoff.

**API keys.** Keep keys in a secret store and revoke any exposed key through Render account settings.
