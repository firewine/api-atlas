---
name: "Gemini API"
provider: "Google"
category: "ai"
status: "active"
officialDocs: "https://ai.google.dev/gemini-api/docs"
homepage: "https://ai.google.dev/"
baseUrl: "https://generativelanguage.googleapis.com/v1beta"
auth: "Gemini API key in x-goog-api-key; current documentation distinguishes authorization keys from standard keys"
versioning: "Versioned REST paths; current examples use v1beta for several Gemini API operations."
resourceGroups: ["Models and generation", "Embeddings", "Files", "Tools", "Live API"]
pagination: "List operations use endpoint-specific pageToken fields."
errors: "Google JSON error status responses are used; quota exhaustion is documented as 429 RESOURCE_EXHAUSTED."
webhooks: "No general event webhook product was confirmed in the reviewed Gemini API documentation."
sdks: ["Python", "JavaScript and TypeScript", "Go", "Java"]
summary: "Google's developer API for Gemini models, multimodal generation, embeddings, files, tools, and live interactions."
pricing: "Free and paid tiers vary by model and feature."
rateLimit: "Per-project limits vary by model and usage tier across RPM, TPM, RPD, and specialized dimensions."
formats: ["JSON", "Server-sent events"]
protocols: ["REST", "Streaming", "WebSocket"]
bestFor:
  - "Google-native multimodal applications"
  - "Large-context and media workflows"
  - "Prototyping through Google AI Studio"
cautions:
  - "Quotas apply per project rather than per key."
  - "Model names, preview status, prices, and key requirements change frequently."
verifiedAt: "2026-09-13"
sourceUrls:
  - "https://ai.google.dev/gemini-api/docs"
  - "https://ai.google.dev/gemini-api/docs/api-key"
  - "https://ai.google.dev/gemini-api/docs/rate-limits"
  - "https://ai.google.dev/gemini-api/docs/pricing"
mutableFacts:
  - label: "Base URL"
    value: "https://generativelanguage.googleapis.com/v1beta"
    sourceUrl: "https://ai.google.dev/gemini-api/docs"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "Gemini API key in the x-goog-api-key header"
    sourceUrl: "https://ai.google.dev/gemini-api/docs/api-key"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Free and paid tiers vary by model and feature"
    sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Per-project limits vary by model and usage tier across RPM, TPM, RPD, and specialized dimensions"
    sourceUrl: "https://ai.google.dev/gemini-api/docs/rate-limits"
    verifiedAt: "2026-09-13"
  - label: "Key policy"
    value: "New keys created in Google AI Studio are documented as authorization keys; migration guidance applies to standard keys"
    sourceUrl: "https://ai.google.dev/gemini-api/docs/api-key"
    verifiedAt: "2026-09-13"
  - label: "Quota scope"
    value: "Rate limits are applied per project and vary by model and usage tier"
    sourceUrl: "https://ai.google.dev/gemini-api/docs/rate-limits"
    verifiedAt: "2026-09-13"
tags: ["llm", "multimodal", "google", "embeddings", "live-api"]
---

## What it covers

The Gemini API supports text and multimodal model calls, streaming, embeddings, file inputs, tools, and live sessions. Google AI Studio provides project and key management for direct Gemini API use.

## Request shape

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/YOUR_MODEL:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Compare these two API responses."}]}]}'
```

Use the official model list at integration time. Quotas belong to the project, so creating more keys does not multiply the available allowance.

## Decision notes

Separate stable integration facts from model-specific facts. The base API and authentication pattern are relatively stable; model IDs, preview status, token limits, prices, and quotas need dated verification.
