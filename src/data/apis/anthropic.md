---
name: "Claude API"
provider: "Anthropic"
category: "ai"
status: "active"
officialDocs: "https://platform.claude.com/docs/en/api/overview"
homepage: "https://www.anthropic.com/api"
baseUrl: "https://api.anthropic.com"
auth: "Authorization bearer token or x-api-key, plus an anthropic-version header"
versioning: "Requests carry an explicit anthropic-version header; feature versions can use additional beta headers."
resourceGroups: ["Messages", "Message Batches", "Token counting", "Models", "Files"]
pagination: "List endpoints use documented cursor fields such as next_page or before/after identifiers."
errors: "HTTP status codes return structured JSON errors and a request-id response header."
webhooks: "No general event webhook product was confirmed in the reviewed API overview."
sdks: ["Python", "TypeScript", "C#", "Go", "Java", "PHP", "Ruby"]
summary: "Anthropic's API for Claude messages, tool use, token counting, batches, files, and related platform capabilities."
pricing: "Usage-based pricing varies by model; Message Batches are documented with discounted processing."
rateLimit: "Organization-level usage tiers enforce request, token, and spend limits."
formats: ["JSON", "Server-sent events"]
protocols: ["REST", "Streaming"]
bestFor:
  - "Long-form reasoning and document workflows"
  - "Tool use and structured interactions"
  - "Direct Claude model access"
cautions:
  - "The anthropic-version header is required."
  - "Limits and feature availability differ between the direct API and cloud platforms."
verifiedAt: "2026-09-13"
sourceUrls:
  - "https://platform.claude.com/docs/en/api/overview"
  - "https://platform.claude.com/docs/en/api/rate-limits"
  - "https://platform.claude.com/docs/en/about-claude/pricing"
mutableFacts:
  - label: "Base URL"
    value: "https://api.anthropic.com"
    sourceUrl: "https://platform.claude.com/docs/en/api/overview"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Usage-based pricing varies by model; Message Batches are documented with discounted processing"
    sourceUrl: "https://platform.claude.com/docs/en/about-claude/pricing"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Organization-level usage tiers enforce request, token, and spend limits"
    sourceUrl: "https://platform.claude.com/docs/en/api/rate-limits"
    verifiedAt: "2026-09-13"
  - label: "Rate-limit model"
    value: "Usage-tier limits apply at organization level and include RPM, TPM, and spend controls"
    sourceUrl: "https://platform.claude.com/docs/en/api/rate-limits"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "Bearer authorization is supported; x-api-key remains a documented fallback"
    sourceUrl: "https://platform.claude.com/docs/en/api/overview"
    verifiedAt: "2026-09-13"
tags: ["llm", "claude", "tools", "batches", "generation"]
---

## What it covers

The direct Claude API centers on `POST /v1/messages`, with companion endpoints for batches, token counting, models, files, and platform administration. Anthropic also documents access through cloud platforms, whose IAM, billing, and feature availability can differ.

## Request shape

```bash
curl https://api.anthropic.com/v1/messages \
  -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"YOUR_MODEL","max_tokens":512,"messages":[{"role":"user","content":"Explain this API response."}]}'
```

SDKs populate the standard headers, but a raw HTTP integration must send the API version explicitly.

## Decision notes

Choose between direct Anthropic access and a cloud marketplace based on required features, identity controls, regional availability, and existing cloud commitments—not model name alone.
