---
name: "OpenAI API"
provider: "OpenAI"
category: "ai"
status: "active"
officialDocs: "https://developers.openai.com/api/reference/overview"
homepage: "https://openai.com/api/"
baseUrl: "https://api.openai.com/v1"
auth: "Bearer API key in the Authorization header"
versioning: "The REST base path is v1; endpoint and model lifecycle changes are documented separately."
resourceGroups: ["Responses", "Models", "Files", "Batches", "Embeddings", "Images and audio"]
pagination: "List endpoints use documented cursor parameters and has_more indicators."
errors: "HTTP status codes return structured JSON errors; request IDs support troubleshooting."
webhooks: "Webhooks are supported for asynchronous API events."
sdks: ["JavaScript and TypeScript", "Python", ".NET", "Java", "Go"]
summary: "A model platform for text, multimodal input, structured outputs, tools, embeddings, image, audio, and agent-oriented workflows."
pricing: "Usage-based pricing varies by model and capability."
rateLimit: "Organization/project and model-specific limits, with usage tiers and response headers."
formats: ["JSON", "Server-sent events"]
protocols: ["REST", "Streaming", "WebSocket"]
bestFor:
  - "Multimodal product features"
  - "Tool-using and structured-output workflows"
  - "A broad set of first-party model capabilities"
cautions:
  - "Model availability, prices, and limits change; resolve them at decision time."
  - "API keys must never be shipped to browsers or mobile clients."
verifiedAt: "2026-09-13"
sourceUrls:
  - "https://developers.openai.com/api/reference/overview"
  - "https://developers.openai.com/api/docs/guides/rate-limits"
  - "https://openai.com/api/pricing/"
mutableFacts:
  - label: "Base URL"
    value: "https://api.openai.com/v1"
    sourceUrl: "https://developers.openai.com/api/reference/overview"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "Bearer API key in the Authorization header"
    sourceUrl: "https://developers.openai.com/api/reference/overview"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Usage-based by model and modality; current prices are maintained on the official pricing page"
    sourceUrl: "https://openai.com/api/pricing/"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Limits vary by organization/project, model, and usage tier"
    sourceUrl: "https://developers.openai.com/api/docs/guides/rate-limits"
    verifiedAt: "2026-09-13"
tags: ["llm", "multimodal", "agents", "embeddings", "generation"]
---

## What it covers

The OpenAI API groups model inference and platform capabilities behind authenticated HTTP APIs. The Responses API is the general entry point for model responses and tool use, while specialized APIs cover embeddings, images, audio, files, batches, and real-time interactions.

## Request shape

```bash
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"YOUR_MODEL","input":"Summarize this release note."}'
```

Select a current model from the official model catalog instead of copying a model name from an old article. Handle `429` responses with bounded exponential backoff and respect the returned rate-limit metadata.

## Decision notes

Evaluate models using your own representative inputs, latency target, and output-quality rubric. Price comparisons should include input, cached input where applicable, output, and tool-specific charges rather than a single headline token price.
