---
name: "Currencylayer"
provider: "APILayer"
category: "currency-data"
status: "active"
officialDocs: "https://docs.apilayer.com/currencylayer/docs/api-documentation"
homepage: "https://currencylayer.com/"
baseUrl: "https://api.currencylayer.com"
auth: "Access key supplied with the access_key request parameter"
versioning: "Named REST endpoints without a documented global version prefix."
resourceGroups: ["Live rates", "Historical rates", "Conversion", "Timeframe", "Currency change"]
pagination: "Core rate responses do not use a uniform cursor; collection behavior is endpoint-specific."
errors: "Failures use a JSON error object; check the success field before consuming rates."
webhooks: "No general webhook product was confirmed in the reviewed official documentation."
sdks: []
summary: "A hosted foreign-exchange API for live, historical, conversion, timeframe, and currency-change queries."
pricing: "Free non-commercial tier plus paid commercial plans with larger monthly quotas and fresher updates."
rateLimit: "Monthly request allowance and data-refresh frequency depend on plan."
formats: ["JSON", "JSONP"]
protocols: ["REST"]
bestFor:
  - "Straightforward FX rate lookup"
  - "Historical currency series"
  - "Server-side currency conversion workflows"
cautions:
  - "The free tier is marked non-commercial."
  - "Source-currency switching and refresh frequency depend on plan."
verifiedAt: "2026-09-13"
sourceUrls:
  - "https://docs.apilayer.com/currencylayer/docs/api-documentation"
  - "https://currencylayer.com/pricing"
mutableFacts:
  - label: "Base URL"
    value: "https://api.currencylayer.com"
    sourceUrl: "https://docs.apilayer.com/currencylayer/docs/api-documentation"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "Access key supplied with the access_key request parameter"
    sourceUrl: "https://docs.apilayer.com/currencylayer/docs/api-documentation"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Free non-commercial tier plus paid commercial plans"
    sourceUrl: "https://currencylayer.com/pricing"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Monthly requests and data-refresh frequency depend on plan"
    sourceUrl: "https://currencylayer.com/pricing"
    verifiedAt: "2026-09-13"
  - label: "Free plan"
    value: "USD 0, 100 API calls, daily updates, and non-commercial use"
    sourceUrl: "https://currencylayer.com/pricing"
    verifiedAt: "2026-09-13"
  - label: "Paid entry point"
    value: "Basic is listed at USD 14.99/month with up to 10,000 requests and commercial use"
    sourceUrl: "https://currencylayer.com/pricing"
    verifiedAt: "2026-09-13"
tags: ["forex", "exchange-rates", "conversion", "historical-data"]
---

## What it covers

Currencylayer provides live quotes, historical rates, conversions, time-frame queries, and currency-change calculations. Plan entitlements determine request volume, refresh frequency, commercial use, and access to advanced operations.

## Request shape

```bash
curl "https://api.currencylayer.com/live?access_key=YOUR_ACCESS_KEY&currencies=KRW,EUR"
```

Call the service from a backend so the access key is not exposed to visitors. Cache responses in line with the plan's update frequency instead of spending quota on identical requests.

## Key endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /live` | Real-time exchange rates (USD base) |
| `GET /historical` | Historical rates for a date |
| `GET /convert` | Convert between currencies |
| `GET /list` | Supported currencies |
| `GET /timeframe` | Rates over a date range |
| `GET /change` | Currency change parameters |

## Decision notes

Currencylayer is simple to integrate, but the free plan's non-commercial restriction is decisive for a product. Compare paid plans on quota, update frequency, source-currency switching, and overage policy.

## Python example: live exchange rates (API key)

```python
import httpx
from decimal import Decimal

API_KEY = "your_currencylayer_key"
BASE = "https://api.currencylayer.com"

def live(currencies: list[str] | None = None, source: str = "USD") -> dict[str, Decimal]:
    """Get live rates. Free plan is USD-source only and hourly."""
    params = {"access_key": API_KEY, "source": source, "format": 1}
    if currencies:
        params["currencies"] = ",".join(currencies)
    resp = httpx.get(f"{BASE}/live", params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    if not data.get("success"):
        raise RuntimeError(f"CurrencyLayer error: {data.get('error', {}).get('info')}")
    return {k: Decimal(str(v)) for k, v in data["quotes"].items()}

def convert(amount: Decimal, from_: str, to: str) -> Decimal:
    """Convert via USD pivot (free-plan compatible)."""
    if from_ == "USD":
        return amount * live([to])[f"USD{to}"]
    if to == "USD":
        return amount / live([from_])[f"USD{from_}"]
    usd_amount = amount / live([from_])[f"USD{from_}"]
    return usd_amount * live([to])[f"USD{to}"]

print(live(["KRW", "EUR", "JPY"]))
print("100 USD in KRW:", convert(Decimal("100"), "USD", "KRW"))
```

**Notes:**
- Key goes in `access_key` query param; check `success` field — HTTP 200 can still be an error
- Free plan: USD source only, hourly updates, 1000 calls/month — cache hard
- Quotes are keyed like `USDKRW`; convert non-USD pairs via the USD pivot
- For KRW-specific needs, BOK ECOS (also in this Atlas) is the authoritative free source
