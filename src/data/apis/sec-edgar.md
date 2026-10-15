---
name: "SEC EDGAR APIs"
provider: "U.S. Securities and Exchange Commission"
category: "public-data"
status: "active"
officialDocs: "https://www.sec.gov/search-filings/edgar-application-programming-interfaces"
homepage: "https://www.sec.gov/edgar"
baseUrl: "https://data.sec.gov"
auth: "No API key; declare a responsible User-Agent per SEC policy"
versioning: "Unversioned documented JSON endpoints; monitor SEC guidance"
resourceGroups: ["Submissions","Company facts","Company concepts","Bulk ZIP archives"]
pagination: "Submission history may be split into referenced files; bulk archives are available"
errors: "HTTP status responses; throttle and identify requests"
webhooks: "No webhooks documented"
sdks: []
summary: "Official JSON and bulk-data access to company filing submissions and XBRL facts."
pricing: "Public access without usage fees"
rateLimit: "SEC currently asks automated clients to stay within its published fair-access threshold"
formats: ["JSON","ZIP"]
protocols: ["REST","Bulk download"]
bestFor: ["Authoritative U.S. filing metadata","Company XBRL facts"]
cautions: ["Follow SEC fair-access and User-Agent rules.","Do not treat filing facts as investment advice."]
verifiedAt: "2026-09-13"
sourceUrls: ["https://www.sec.gov/search-filings/edgar-application-programming-interfaces","https://www.sec.gov/about/developer-resources"]
mutableFacts:
  - label: "Base URL"
    value: "https://data.sec.gov"
    sourceUrl: "https://www.sec.gov/search-filings/edgar-application-programming-interfaces"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "No API key; declare a responsible User-Agent per SEC policy"
    sourceUrl: "https://www.sec.gov/about/developer-resources"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Public access without usage fees"
    sourceUrl: "https://www.sec.gov/about/developer-resources"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "SEC currently asks automated clients to stay within its published fair-access threshold"
    sourceUrl: "https://www.sec.gov/about/developer-resources"
    verifiedAt: "2026-09-13"
tags: ["submissions","company-facts","company-concepts","public-data"]
---

## What it covers

Official JSON and bulk-data access to company filing submissions and XBRL facts. The profile stays deliberately concise: use the linked official reference for endpoint schemas and current commercial terms.

## Integration notes

Authenticate exactly as the provider documents, keep credentials out of client bundles, and retain upstream request identifiers when available. Pagination, retries, caching, and webhook verification should be implemented per product rather than inferred from another API.

## Decision notes

Best suited to authoritative u.s. filing metadata and company xbrl facts. Before production, verify follow sec fair-access and user-agent rules. do not treat filing facts as investment advice. Mutable limits, prices, and versions were checked on 2026-09-13 and should be rechecked at purchase or deployment time.

## Python example: company filings (no API key)

```python
import httpx

BASE = "https://data.sec.gov"
# SEC REQUIRES a descriptive User-Agent with contact info — requests without one are blocked
HEADERS = {"User-Agent": "YourAppName/1.0 (contact@example.com)", "Accept-Encoding": "gzip"}

def get_filings(cik: str, form: str | None = None, count: int = 10) -> list[dict]:
    """Get recent filings for a CIK (10-digit, zero-padded)."""
    cik = cik.zfill(10)
    resp = httpx.get(f"{BASE}/submissions/CIK{cik}.json", headers=HEADERS, timeout=30)
    resp.raise_for_status()
    filings = resp.json()["filings"]["recent"]
    rows = []
    for i in range(min(count, len(filings["accessionNumber"]))):
        if form and filings["form"][i] != form:
            continue
        rows.append({
            "form": filings["form"][i],
            "filed": filings["filingDate"][i],
            "accession": filings["accessionNumber"][i].replace("-", ""),
        })
    return rows

# Apple's recent 10-K filings (CIK 320193)
for f in get_filings("320193", form="10-K", count=3):
    print(f["filed"], f["accession"])
```

**Notes:**
- No API key — but a proper `User-Agent` with contact email is mandatory
- Rate limit: 10 requests/second; be a good citizen
- Company concept data (e.g. XBRL facts) lives under `/api/xbrl/companyconcept/CIK{cik}/us-gaap/{tag}.json`
- Full-text search has a separate UI at efts.sec.gov; the JSON APIs above are the programmatic path
