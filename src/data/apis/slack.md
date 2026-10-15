---
name: "Slack Web API"
provider: "Slack"
category: "communications"
status: "active"
officialDocs: "https://docs.slack.dev/apis/web-api/"
homepage: "https://api.slack.com/"
baseUrl: "https://slack.com/api"
auth: "OAuth access token in Authorization Bearer header"
versioning: "Method-based Web API; changes are announced in Slack's changelog"
resourceGroups: ["Conversations","Messages","Users","Files","Views","Team"]
pagination: "Cursor-based pagination with next_cursor"
errors: "HTTP status plus JSON ok and error fields"
webhooks: "Events API, interactivity and slash-command request URLs"
sdks: ["Node.js","Python","Java"]
summary: "Method-oriented APIs for Slack messages, conversations, users, files, views, and workspace integrations."
pricing: "API availability and workspace features depend on Slack plans"
rateLimit: "Per-method rate tiers and special limits; honor Retry-After"
formats: ["JSON","Multipart"]
protocols: ["REST","Webhooks","Socket Mode"]
bestFor: ["Workspace automation","Interactive Slack applications"]
cautions: ["Request only necessary OAuth scopes.","Verify signed inbound requests."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://docs.slack.dev/apis/web-api/","https://docs.slack.dev/apis/web-api/rate-limits/"]
mutableFacts:
  - label: "Base URL"
    value: "https://slack.com/api"
    sourceUrl: "https://docs.slack.dev/apis/web-api/"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "OAuth access token in Authorization Bearer header"
    sourceUrl: "https://docs.slack.dev/apis/web-api/rate-limits/"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "API availability and workspace features depend on Slack plans"
    sourceUrl: "https://docs.slack.dev/apis/web-api/rate-limits/"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Per-method rate tiers and special limits; honor Retry-After"
    sourceUrl: "https://docs.slack.dev/apis/web-api/rate-limits/"
    verifiedAt: "2026-09-13"
tags: ["conversations","messages","users","communications"]
---

## What it covers

Method-oriented APIs for Slack messages, conversations, users, files, views, and workspace integrations. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Decision notes

Best suited to workspace automation and interactive slack applications. Before production, verify request only necessary oauth scopes. verify signed inbound requests. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.

## Python example: post a message (bearer token)

```python
import httpx

BOT_TOKEN = "xoxb-your-bot-token"
BASE = "https://slack.com/api"

def post_message(channel: str, text: str) -> dict:
    """Post a message. Slack returns ok:false with an error string on failure."""
    resp = httpx.post(
        f"{BASE}/chat.postMessage",
        headers={"Authorization": f"Bearer {BOT_TOKEN}"},
        json={"channel": channel, "text": text},
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    if not data.get("ok"):
        raise RuntimeError(f"Slack error: {data.get('error')}")
    return {"ts": data["ts"], "channel": data["channel"]}

print(post_message("#general", "Hello from the API!"))
```

**Notes:**
- Bot tokens start `xoxb-`; the bot must be invited to the channel first
- Always check the `ok` field — HTTP 200 with `ok: false` means failure (`channel_not_found`, etc.)
- Rate limits are tiered per method; respect `Retry-After` on 429
- For rich layouts use `blocks`; `text` is still required as a fallback
