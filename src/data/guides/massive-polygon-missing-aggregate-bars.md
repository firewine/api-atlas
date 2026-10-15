---
"title": "Massive (Polygon) API missing minute aggregate bars: check limit and
  trade conditions"
"h1": "Massive (Polygon) API missing minute aggregate bars: check limit and
  trade conditions"
"description": "Diagnose Massive (Polygon) missing minute aggregate bars by
  checking base-aggregate limit, next_url pagination, then trades and sale
  conditions before declaring a data gap."
"summary": "Missing Massive minute bars can reflect a base-aggregate limit or no
  eligible trades. Finish pagination, then inspect trades and conditions for the
  exact minute."
"order": 9
"updatedAt": "2026-10-15"
"tags":
  - "massive"
  - "polygon"
  - "aggregates"
"caseStudy":
  "slug": "massive-polygon-missing-aggregate-bars"
  "problemId": "massive-minute-aggregate-limit-eligibility"
  "titleParts":
    "api": "Massive (Polygon) API"
    "problem": "missing minute aggregate bars"
    "solution": "check limit and trade conditions"
  "linkLabel": "Massive (Polygon) missing minute bars: check limit and trade conditions"
  "providers":
    - "massive"
  "searchIntent":
    "primary":
      "term": "Massive Polygon missing minute aggregate bars"
      "sourcePhrase": "Possible missing 1-minute aggregates: MMM and HON"
      "evidenceIds":
        - "massive-mmm-hon-issue"
    "related":
      - "term": "Massive aggregate limit base bars"
        "sourcePhrase": "Limits the number of base aggregates"
        "evidenceIds":
          - "massive-custom-bars"
      - "term": "Massive aggregates next_url pagination"
        "sourcePhrase": "next page of data"
        "evidenceIds":
          - "massive-custom-bars"
      - "term": "Massive missing bars trade conditions"
        "sourcePhrase": "conditions array"
        "evidenceIds":
          - "massive-missing-aggs"
    "status": "keyword-candidate"
  "evidence":
    - "id": "massive-custom-bars"
      "kind": "code"
      "url": "https://massive.com/docs/rest/stocks/aggregates/custom-bars"
      "checkedAt": "2026-10-15"
      "snapshot": "case-studies/evidence/massive-custom-bars.txt"
      "sha256": "ecdc1807cf42b6970e3eda6dcd8700464cd1ddaeb94b479afb34a2ceb3c052ed"
      "excerpt": "limit

        next_url

        Limits the number of base aggregates queried to create the aggregate
        results. Max 50000 and Default 5000.

        If present, this value can be used to fetch the next page of data.

        for a in client.list_aggs("
    - "id": "massive-limit-explainer"
      "kind": "documentation"
      "url": "https://massive.com/blog/aggs-api-updates"
      "checkedAt": "2026-10-15"
      "snapshot": "case-studies/evidence/massive-limit-explainer.txt"
      "sha256": "2271300ef64bcaef393a18c7973d2b70cd01194bdb2ef43377bc00f464326772"
      "excerpt": "This parameter will limit the number of base aggregate bars that are
        used to generate the final result."
    - "id": "massive-missing-aggs"
      "kind": "documentation"
      "url": "https://massive.com/knowledge-base/article/why-are-there-missing-aggreg\
        ates-in-massives-data"
      "checkedAt": "2026-10-15"
      "snapshot": "case-studies/evidence/massive-missing-aggs.txt"
      "sha256": "78aa631334c0dda2569a5fc17d3ba039fdcb4007842408526969595b3a952f93"
      "excerpt": "A window with no eligible trade produces no bar at all, rather than
        an empty one.

        Look at each trade's conditions array"
    - "id": "massive-mmm-hon-issue"
      "kind": "documentation"
      "url": "https://github.com/massive-com/client-python/issues/1028"
      "checkedAt": "2026-10-15"
      "snapshot": "case-studies/evidence/massive-mmm-hon-issue.txt"
      "sha256": "651567d3f8013c43cd4857425f0fc8d7c5ba56fb93375f401db4a990f87f8901"
      "excerpt": "Possible missing 1-minute aggregates: MMM and HON (Stocks Basic)

        Did these intervals have zero qualifying trades because of
        trade-condition filtering, or do they represent an ingestion/data gap?"
  "technicalDetails":
    - "kind": "field"
      "value": "limit"
      "evidenceId": "massive-custom-bars"
    - "kind": "field"
      "value": "next_url"
      "evidenceId": "massive-custom-bars"
    - "kind": "field"
      "value": "conditions"
      "evidenceId": "massive-missing-aggs"
  "verification":
    "level": "source-review"
    "note": "Source review on 2026-10-15 confirms the documented limit and
      no-eligible-trade rules; no Massive API request or trade-eligibility check
      was performed."
    "evidenceIds":
      - "massive-custom-bars"
      - "massive-limit-explainer"
      - "massive-missing-aggs"
  "review":
    "author": "차도녀 gpt may"
    "authorType": "Person"
    "checkedAt": "2026-10-15"
    "titleMatchesBody": true
    "distinctProblem": "A market-data range completeness and trade-eligibility
      diagnosis, distinct from Gemini function-call history and from generic
      pagination advice."
    "noInventedResults": true
---

## Symptoms

A long `/v2/aggs/ticker/.../range/1/minute/...` response may stop early or show individual missing minutes. A [Python client issue about MMM and HON](https://github.com/massive-com/client-python/issues/1028) asks whether several absent minutes reflect eligibility filtering or an ingestion gap. That report does not establish a provider defect or explain those particular minutes.

## Cause

Two separate checks are needed. First, the [Custom Bars reference](https://massive.com/docs/rest/stocks/aggregates/custom-bars) says `limit` counts base aggregates used to calculate results, not the number of final bars. On the documentation checked here it defaults to 5,000 and permits at most 50,000; the [aggregate update article](https://massive.com/blog/aggs-api-updates) explains why a request can end before the requested range. Second, the [missing aggregates explanation](https://massive.com/knowledge-base/article/why-are-there-missing-aggregates-in-massives-data) says a minute with no eligible trade has no bar. Raising `limit` does not create an ineligible or no-trade bar.

## Safe resolution

Split long time ranges into bounded requests, choose a documented `limit` for the base aggregate volume, and exhaust `next_url` if present (or use the Python SDK `list_aggs` iterator). Inspect the timestamp range and `queryCount` before classifying any missing minute. This dependency-injected example gathers all pages without embedding an API key; `fetch_page` must be supplied by an authenticated caller:

```python
from urllib.parse import urlparse

def collect_bars(first_url, fetch_page):
    bars, seen = [], set()
    next_url = first_url
    while next_url:
        if urlparse(next_url).hostname != "api.massive.com":
            raise ValueError("Unexpected pagination host")
        if next_url in seen:
            raise ValueError("Pagination loop")
        seen.add(next_url)
        page = fetch_page(next_url)
        if page.get("status") != "OK":
            raise ValueError(f"Aggregate request failed: {page.get('status')}")
        bars.extend(page.get("results", []))
        next_url = page.get("next_url")
    return bars
```

After the last page, query `/v3/trades/{ticker}` for the exact absent minute, if entitled. No trades implies a quiet window; trades with no bar require checking each trade's `conditions` against the conditions reference endpoint. If access is denied, retain an **unknown** cause. For charts, mark any forward-filled display point as synthetic and keep it separate from source OHLCV.

## Verification

Source review on 2026-10-15 confirms the documented limit and no-eligible-trade rules; no Massive API request or trade-eligibility check was performed. With a synthetic two-page fixture, verify the collector follows `next_url`, keeps every returned timestamp, and rejects a repeated or foreign continuation URL. Then compare the full requested interval with returned `t` timestamps and check absent minutes against trades and conditions. A no-trade or ineligible-trade explanation requires those actual endpoint responses; without entitlement, leave the minute unresolved.

## Limitations

The MMM/HON report remains an open question here; adjacent active bars do not prove an eligible trade in the absent minute. `limit` and pagination diagnose range truncation, while conditions diagnose individual omitted intervals. Historical corrections and plan entitlement can affect what a real account sees. No live request, trade-condition lookup, or provider bug confirmation was made.
