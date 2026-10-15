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
rateLimit: "Rate limits per API key"
formats: ["JSON"]
protocols: ["REST"]
bestFor: ["Simple cloud deployments", "Docker web services", "Preview environments"]
cautions: ["Free tier services sleep after 15 minutes of inactivity.", "Auto-deploy is off by default — verify deploy settings.", "Secret Files and environment variables are managed separately."]
verifiedAt: "2026-10-15"
sourceUrls: ["https://render.com/docs/api", "https://render.com/docs/free"]
mutableFacts:
  - label: "Management API base"
    value: "https://api.render.com/v1"
    sourceUrl: "https://render.com/docs/api"
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

## Real-world notes

**Free tier sleep.** Free web services sleep after 15 minutes without requests. The first request after sleep triggers a cold start (can take 30+ seconds). Don't use uptime checks alone to prove availability.

**render.yaml vs dashboard.** A `render.yaml` blueprint defines initial defaults, but dashboard changes override it. Don't assume the YAML reflects current production settings — check the dashboard.

**Secret Files.** Sensitive values go in Secret Files (mounted at `/etc/secrets/`), not plain environment variables. Reference them via `*_FILE` env vars in your app.
