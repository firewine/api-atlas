---
name: "Twilio Messaging API"
provider: "Twilio"
category: "communications"
status: "active"
officialDocs: "https://www.twilio.com/docs/messaging/api"
homepage: "https://www.twilio.com/"
baseUrl: "https://api.twilio.com/2010-04-01"
auth: "HTTP Basic authentication using Account SID and Auth Token; API keys recommended for production"
versioning: "Product paths include dated API versions"
resourceGroups: ["Messages","Services","Media","Phone numbers","Delivery status"]
pagination: "PageToken-based pagination in list resources"
errors: "HTTP status with Twilio error code, message and documentation link"
webhooks: "Status callbacks and inbound message webhooks"
sdks: ["Node.js","Python","Java","C#","PHP","Ruby","Go"]
summary: "Programmable messaging APIs for SMS, MMS, WhatsApp, media, and delivery callbacks."
pricing: "Usage-based by destination, channel, sender and carrier fees"
rateLimit: "Throughput depends on sender, destination, channel and account configuration"
formats: ["JSON","Form-encoded requests"]
protocols: ["REST","Webhooks"]
bestFor: ["Transactional messaging","Delivery-status workflows"]
cautions: ["Regulatory registration may be required.","Validate Twilio webhook signatures."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://www.twilio.com/docs/messaging/api","https://www.twilio.com/docs/usage/api"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.twilio.com/2010-04-01"
    sourceUrl: "https://www.twilio.com/docs/messaging/api"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "HTTP Basic authentication using Account SID and Auth Token; API keys recommended for production"
    sourceUrl: "https://www.twilio.com/docs/usage/api"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Usage-based by destination, channel, sender and carrier fees"
    sourceUrl: "https://www.twilio.com/docs/usage/api"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Throughput depends on sender, destination, channel and account configuration"
    sourceUrl: "https://www.twilio.com/docs/usage/api"
    verifiedAt: "2026-09-13"
tags: ["messages","services","media","communications"]
---

## What it covers

Programmable messaging APIs for SMS, MMS, WhatsApp, media, and delivery callbacks. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Decision notes

Best suited to transactional messaging and delivery-status workflows. Before production, verify regulatory registration may be required. validate twilio webhook signatures. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.

## Python example: send an SMS (basic auth)

```python
import httpx
from httpx import BasicAuth

ACCOUNT_SID = "your_account_sid"
AUTH_TOKEN = "your_auth_token"
FROM_NUMBER = "+15551234567"  # your Twilio number

def send_sms(to: str, body: str) -> dict:
    """Send an SMS. Twilio uses basic auth + form-encoded bodies."""
    resp = httpx.post(
        f"https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/Messages.json",
        auth=BasicAuth(ACCOUNT_SID, AUTH_TOKEN),
        data={"From": FROM_NUMBER, "To": to, "Body": body},
        timeout=30,
    )
    if resp.status_code == 401:
        raise RuntimeError("Invalid Account SID / Auth Token")
    resp.raise_for_status()
    msg = resp.json()
    if msg.get("status") in ("failed", "undelivered"):
        raise RuntimeError(f"SMS failed: {msg.get('error_message')}")
    return {"sid": msg["sid"], "status": msg["status"]}

print(send_sms("+15559876543", "Hello from the API!"))
```

**Notes:**
- Basic auth with Account SID as username, Auth Token as password
- Trial accounts can only message verified numbers and prepend a trial notice
- The `2010-04-01` path segment is the API version — still current
- Check message `status`/`error_code` after sending; 201 Created doesn't mean delivered
