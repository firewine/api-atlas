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
pagination: "Page-based with page_no and page_count (100 per page maximum); inspect total_page"
errors: "status/message fields in response"
webhooks: "Not supported"
sdks: ["Community Python wrappers"]
summary: "Korea's official corporate filing system (like US EDGAR) — financial statements, disclosures, and company info for KOSPI/KOSDAQ listed companies."
pricing: "Generally free with an approved key; FSS may announce paid services"
rateLimit: "Error 020 generally occurs after 20,000 requests; configured limits may differ"
formats: ["XML", "JSON"]
protocols: ["REST"]
bestFor: ["Korean company filings", "Financial statements (XBRL)", "Disclosure search"]
cautions: ["API key required; review the issued key limit.", "English filing search uses a separate endpoint.", "XBRL parsing requires additional libraries."]
verifiedAt: "2026-10-15"
sourceUrls: ["https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS001&apiId=2019001", "https://opendart.fss.or.kr/intro/terms.do", "https://opendart.fss.or.kr/", "https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DE001&apiId=AE00001"]
mutableFacts:
  - key: "base-url"
    label: "Base URL"
    value: "https://opendart.fss.or.kr/api"
    sourceUrl: "https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS001&apiId=2019001"
    verifiedAt: "2026-10-15"
  - key: "authentication"
    label: "Authentication"
    value: "crtfc_key query parameter with an issued API key"
    sourceUrl: "https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS001&apiId=2019001"
    verifiedAt: "2026-10-15"
  - key: "pricing"
    label: "Pricing"
    value: "Generally free; FSS terms allow announced paid services"
    sourceUrl: "https://opendart.fss.or.kr/intro/terms.do"
    verifiedAt: "2026-10-15"
  - key: "rate-limits"
    label: "Rate limits"
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

## Python example: first page of company filings

This example makes one request for up to 100 filings. If `total_page > 1`, the result is partial: a search with 101 matches still returns at most 100 rows here.

```python
import httpx

API_KEY = "your_dart_api_key"
BASE = "https://opendart.fss.or.kr/api"

def get_first_filings_page(corp_code: str, bgn_de: str, end_de: str) -> dict:
    """Get page 1 and the reported page count. Dates are YYYYMMDD."""
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
    status = data.get("status")
    if status == "013":  # no filings on the initial request
        return {"filings": [], "page_no": 1, "total_page": 0}
    if status != "000":
        raise ValueError(f"OpenDART filing search failed (status {status!r})")
    return {
        "filings": data["list"],
        "page_no": data["page_no"],
        "total_page": data["total_page"],
    }

def get_corp_code(ticker: str) -> str | None:
    """Look up DART corp code. Download the corp code XML first."""
    # GET https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=KEY
    # Parse XML to map stock codes to corp codes
    pass  # implement XML parsing for your use case

# Example: Samsung Electronics filings in 2024
# result = get_first_filings_page(corp_code="00126380", bgn_de="20240101", end_de="20241231")
# result["filings"] contains page 1 only; inspect result["total_page"].
```

For a complete collection, request all pages through `total_page` and use the 14-character `rcept_no` string to identify and deduplicate filings. If an expected later page fails or returns `013`, report the collection as incomplete rather than treating the partial rows as complete. See [REST API pagination patterns](../../guides/rest-pagination-patterns/).

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
- The [official English filing-search guide](https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DE001&apiId=AE00001) describes a separate endpoint, `https://engopendart.fss.or.kr/engapi/list.json`. The example above uses the Korean endpoint.
