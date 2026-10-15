---
name: "FSS DART API"
provider: "Financial Supervisory Service"
category: "public-data"
status: "active"
officialDocs: "https://opendart.fss.or.kr/"
homepage: "https://dart.fss.or.kr/"
baseUrl: "https://opendart.fss.or.kr/api"
auth: "API key (crtfc_key) in query parameter"
versioning: "API version in endpoint path"
resourceGroups: ["Company info", "Filings", "Financial statements", "Shareholder reports"]
pagination: "Page-based with page_no and page_count"
errors: "status/message fields in response"
webhooks: "Not supported"
sdks: ["Community Python wrappers"]
summary: "Korea's official corporate filing system (like US EDGAR) — financial statements, disclosures, and company info for KOSPI/KOSDAQ listed companies."
pricing: "Free with API key registration"
rateLimit: "10,000 requests/day per key"
formats: ["XML", "JSON"]
protocols: ["REST"]
bestFor: ["Korean company filings", "Financial statements (XBRL)", "Disclosure search"]
cautions: ["API key required (free registration at opendart.fss.or.kr).", "Documentation is in Korean.", "XBRL parsing requires additional libraries."]
verifiedAt: "2026-10-15"
sourceUrls: ["https://opendart.fss.or.kr/"]
mutableFacts:
  - label: "Rate limit"
    value: "10,000 requests/day"
    sourceUrl: "https://opendart.fss.or.kr/"
    verifiedAt: "2026-10-15"
---

# FSS DART API

DART (Data Analysis, Retrieval and Transfer System) is Korea's equivalent of the US SEC EDGAR — the official source for corporate filings, financial statements, and disclosures.

## Python example: company filings

```python
import httpx

API_KEY = "your_dart_api_key"
BASE = "https://opendart.fss.or.kr/api"

def get_filings(corp_code: str, bgn_de: str, end_de: str) -> list[dict]:
    """Get filings for a company. Dates in YYYYMMDD format."""
    resp = httpx.get(f"{BASE}/list.json", params={
        "crtfc_key": API_KEY,
        "corp_code": corp_code,
        "bgn_de": bgn_de,
        "end_de": end_de,
        "page_no": 1,
        "page_count": 100,
    }, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    if data.get("status") != "000":
        raise ValueError(data.get("message"))
    return data.get("list", [])

def get_corp_code(ticker: str) -> str | None:
    """Look up DART corp code. Download the corp code XML first."""
    # GET https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=KEY
    # Parse XML to map stock codes to corp codes
    pass  # implement XML parsing for your use case

# Example: Samsung Electronics filings in 2024
# filings = get_filings(corp_code="00126380", bgn_de="20240101", end_de="20241231")
```

## Python example: financial statements

```python
def get_financial_statement(corp_code: str, bsns_year: str, reprt_code: str = "11011"):
    """Get financial statements.
    reprt_code: 11013 (Q1), 11012 (half), 11014 (Q3), 11011 (annual)
    """
    resp = httpx.get(f"{BASE}/fnlttSinglAcntAll.json", params={
        "crtfc_key": API_KEY,
        "corp_code": corp_code,
        "bsns_year": bsns_year,
        "reprt_code": reprt_code,
        "fs_div": "CFS",  # CFS=consolidated, OFS=separate
    }, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    if data.get("status") != "000":
        raise ValueError(data.get("message"))
    return data.get("list", [])
```

**Notes:**
- Free API key at [opendart.fss.or.kr](https://opendart.fss.or.kr/) — 10,000 requests/day
- `corp_code` is DART's internal ID, not the stock ticker — download `corpCode.xml` to map
- Financial statements available in XBRL; JSON API returns key account data
- All documentation in Korean; use browser translation if needed
