---
name: "Open-Meteo API"
provider: "Open-Meteo"
category: "mapping-weather"
status: "active"
officialDocs: "https://open-meteo.com/en/docs"
homepage: "https://open-meteo.com/"
baseUrl: "https://api.open-meteo.com/v1"
auth: "No API key for non-commercial public access; commercial customer endpoints differ"
versioning: "v1 forecast paths"
resourceGroups: ["Forecast","Historical weather","Marine","Air quality","Geocoding"]
pagination: "Coordinate arrays replace conventional pagination for forecast calls"
errors: "HTTP status and JSON error responses"
webhooks: "No webhooks documented"
sdks: []
summary: "Weather forecast, historical, marine, air-quality, and geocoding APIs with an accessible public tier."
pricing: "Free non-commercial access and paid commercial plans"
rateLimit: "Usage limits and commercial terms are maintained on the official pricing page"
formats: ["JSON"]
protocols: ["REST"]
bestFor: ["Weather prototypes","Multi-location forecast requests"]
cautions: ["Attribution and license requirements vary by dataset.","Commercial use should use the appropriate customer plan."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://open-meteo.com/en/docs","https://open-meteo.com/en/pricing"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.open-meteo.com/v1"
    sourceUrl: "https://open-meteo.com/en/docs"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "No API key for non-commercial public access; commercial customer endpoints differ"
    sourceUrl: "https://open-meteo.com/en/pricing"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Free non-commercial access and paid commercial plans"
    sourceUrl: "https://open-meteo.com/en/pricing"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Usage limits and commercial terms are maintained on the official pricing page"
    sourceUrl: "https://open-meteo.com/en/pricing"
    verifiedAt: "2026-09-13"
tags: ["forecast","historical-weather","marine","mapping-weather"]
---

## What it covers

Weather forecast, historical, marine, air-quality, and geocoding APIs with an accessible public tier. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Key endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /v1/forecast` | Weather forecast (16 days) |
| `GET /v1/archive` | Historical weather (ERA5) |
| `GET /v1/air-quality` | Air quality forecast |
| `GET /v1/geocoding` | Geocoding search |
| `GET /v1/elevation` | Elevation data |
| `GET /v1/marine` | Marine weather |

## Decision notes

Best suited to weather prototypes and multi-location forecast requests. Before production, verify attribution and license requirements vary by dataset. commercial use should use the appropriate customer plan. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.

## Python example: weather forecast (no auth)

```python
import httpx
from datetime import date

BASE = "https://api.open-meteo.com/v1"

def forecast(lat: float, lon: float, days: int = 3) -> list[dict]:
    """Get daily forecast. No API key needed."""
    resp = httpx.get(
        f"{BASE}/forecast",
        params={
            "latitude": lat,
            "longitude": lon,
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
            "forecast_days": days,
            "timezone": "auto",
        },
        timeout=30,
    )
    resp.raise_for_status()
    d = resp.json()["daily"]
    return [
        {
            "date": date.fromisoformat(d["time"][i]),
            "tmax": d["temperature_2m_max"][i],
            "tmin": d["temperature_2m_min"][i],
            "precip_mm": d["precipitation_sum"][i],
        }
        for i in range(len(d["time"]))
    ]

# Seoul
for day in forecast(37.57, 126.98):
    print(day["date"], f"{day['tmin']}~{day['tmax']}C", f"{day['precip_mm']}mm")
```

**Notes:**
- Completely free, no API key, generous limits (10000 calls/day)
- Pick variables explicitly via `daily` / `hourly` params — the API returns only what you ask
- `timezone=auto` localizes times; otherwise UTC
- Commercial use is allowed on the free tier within limits; check terms for high volume
