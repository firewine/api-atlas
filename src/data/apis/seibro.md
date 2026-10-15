---
{
  "name": "SEIBRO",
  "provider": "Korea Securities Depository",
  "category": "public-data",
  "status": "research",
  "officialDocs": "https://seibro.or.kr/",
  "homepage": "https://seibro.or.kr/",
  "baseUrl": "Public REST base URL not independently verified; official website: https://seibro.or.kr/",
  "auth": "Browser access does not establish an unauthenticated server API contract; reusable API authentication is unverified.",
  "versioning": "No versioned public REST contract was verified in this review.",
  "resourceGroups": [
    "Securities information",
    "Dividend information research"
  ],
  "pagination": "The reviewed integration uses LIST_CNT, START_PAGE and END_PAGE; treat these as observed browser-service integration fields, not a stable public REST guarantee.",
  "errors": "The practical case labels application coverage errors separately from vendor error codes.",
  "webhooks": "No webhook contract was verified.",
  "sdks": [],
  "summary": "Korea Securities Depository securities information portal, with a research case on dividend list completeness and count reconciliation.",
  "pricing": "No public server API pricing schedule was verified in the reviewed pages.",
  "rateLimit": "No server API request allowance or service-level guarantee was verified.",
  "formats": [
    "HTML portal; integration XML requires separate verification"
  ],
  "protocols": [
    "HTTPS"
  ],
  "bestFor": [
    "Official securities-information discovery",
    "Research into dividend collection completeness"
  ],
  "cautions": [
    "Research profile: this is not a claim of an approved or stable public REST API.",
    "Confirm permitted use, authentication and request allowances with the operator before production integration."
  ],
  "verifiedAt": "2026-10-16",
  "sourceUrls": [
    "https://seibro.or.kr/",
    "https://www.ksd.or.kr/"
  ],
  "mutableFacts": [
    {
      "key": "base-url",
      "label": "Base URL",
      "value": "Public REST base URL not independently verified; official website: https://seibro.or.kr/",
      "sourceUrl": "https://seibro.or.kr/",
      "verifiedAt": "2026-10-16"
    },
    {
      "key": "authentication",
      "label": "Authentication",
      "value": "Browser access does not establish an unauthenticated server API contract; reusable API authentication is unverified.",
      "sourceUrl": "https://seibro.or.kr/",
      "verifiedAt": "2026-10-16"
    },
    {
      "key": "pricing",
      "label": "Pricing",
      "value": "No public server API pricing schedule was verified in the reviewed pages.",
      "sourceUrl": "https://seibro.or.kr/",
      "verifiedAt": "2026-10-16"
    },
    {
      "key": "rate-limits",
      "label": "Rate limits",
      "value": "No server API request allowance or service-level guarantee was verified.",
      "sourceUrl": "https://seibro.or.kr/",
      "verifiedAt": "2026-10-16"
    }
  ],
  "tags": [
    "korea",
    "dividends",
    "securities",
    "research"
  ]
}
---

## Research scope

The [official SEIBRO portal](https://seibro.or.kr/) and [Korea Securities Depository](https://www.ksd.or.kr/) identify the official service context. This review did not establish an approved public REST contract, pricing, authentication or rate allowance. The associated case describes a reviewed application adapter and reduced synthetic tests. Browser-service fields must be independently verified before production use.
