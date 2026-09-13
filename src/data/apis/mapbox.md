---
name: "Mapbox APIs"
provider: "Mapbox"
category: "mapping-weather"
status: "active"
officialDocs: "https://docs.mapbox.com/api/overview/"
homepage: "https://www.mapbox.com/"
baseUrl: "https://api.mapbox.com"
auth: "Access token, generally passed as access_token"
versioning: "Product APIs use product-specific versioned paths"
resourceGroups: ["Maps","Tilesets","Styles","Geocoding","Directions","Matrix","Isochrone"]
pagination: "Product-specific; geocoding and tiles APIs use their own result limits"
errors: "HTTP status with product-specific JSON errors"
webhooks: "Product-specific events; no single platform webhook contract"
sdks: ["JavaScript","iOS","Android"]
summary: "Mapping platform APIs for maps, tiles, styles, geocoding, navigation, routing, and spatial analysis."
pricing: "Usage-based by product SKU and monthly volume"
rateLimit: "Product-specific limits; inspect each API reference and response headers"
formats: ["JSON","GeoJSON","Vector tiles","Raster images"]
protocols: ["REST"]
bestFor: ["Custom maps and navigation","Geocoding and routing"]
cautions: ["Token scopes and URL restrictions matter.","Caching and data-display terms are product-specific."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://docs.mapbox.com/api/overview/","https://docs.mapbox.com/help/getting-started/access-tokens/"]
mutableFacts:
  - label: "Base URL"
    value: "https://api.mapbox.com"
    sourceUrl: "https://docs.mapbox.com/api/overview/"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "Access token, generally passed as access_token"
    sourceUrl: "https://docs.mapbox.com/help/getting-started/access-tokens/"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Usage-based by product SKU and monthly volume"
    sourceUrl: "https://docs.mapbox.com/help/getting-started/access-tokens/"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "Product-specific limits; inspect each API reference and response headers"
    sourceUrl: "https://docs.mapbox.com/help/getting-started/access-tokens/"
    verifiedAt: "2026-09-13"
tags: ["maps","tilesets","styles","mapping-weather"]
---

## What it covers

Mapping platform APIs for maps, tiles, styles, geocoding, navigation, routing, and spatial analysis. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Decision notes

Best suited to custom maps and navigation and geocoding and routing. Before production, verify token scopes and url restrictions matter. caching and data-display terms are product-specific. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.
