---
name: "FSS DART API"
provider: "Financial Supervisory Service"
category: "public-data"
status: "active"
officialDocs: "https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS001&apiId=2019001"
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
pricing: "Generally free with an approved key; FSS may announce paid services"
rateLimit: "Error 020 generally occurs after 20,000 requests; configured limits may differ"
formats: ["XML", "JSON"]
protocols: ["REST"]
bestFor: ["Korean company filings", "Financial statements (XBRL)", "Disclosure search"]
cautions: ["API key required; review the issued key limit.", "Documentation is in Korean.", "XBRL parsing requires additional libraries."]
verifiedAt: "2026-10-15"
sourceUrls: ["https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS001&apiId=2019001", "https://opendart.fss.or.kr/intro/terms.do", "https://opendart.fss.or.kr/"]
mutableFacts:
  - label: "Base URL"
    value: "https://opendart.fss.or.kr/api"
    sourceUrl: "https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS001&apiId=2019001"
    verifiedAt: "2026-10-15"
  - label: "Authentication"
    value: "crtfc_key query parameter with an issued API key"
    sourceUrl: "https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS001&apiId=2019001"
    verifiedAt: "2026-10-15"
  - label: "Pricing"
    value: "Generally free; FSS terms allow announced paid services"
    sourceUrl: "https://opendart.fss.or.kr/intro/terms.do"
    verifiedAt: "2026-10-15"
  - label: "Rate limits"
    value: "Error 020 generally after 20,000 requests; configured limits may differ"
    sourceUrl: "https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS001&apiId=2019001"
    verifiedAt: "2026-10-15"
---

# FSS DART API

DART (Data Analysis, Retrieval and Transfer System) is Korea's equivalent of the US SEC EDGAR — the official source for corporate filings, financial statements, and disclosures.

## Key endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/list.json` | Filing list search |
| `GET /api/company.json` | Company overview |
| `GET /api/fnlttSinglAcntAll.json` | Full financial statements |
| `GET /api/fnlttMultiAcnt.json` | Multi-company financials |
| `GET /api/corpCode.xml` | Corp code mapping (XML) |
| `GET /api/document.xml` | Filing document |

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
- Apply for an API key at [OpenDART](https://opendart.fss.or.kr/). The official guide describes error 020 generally after 20,000 requests, while individual configured limits may differ.
- `corp_code` is DART's internal ID, not the stock ticker — download `corpCode.xml` to map
- Financial statements available in XBRL; JSON API returns key account data
- All documentation in Korean; use browser translation if needed
