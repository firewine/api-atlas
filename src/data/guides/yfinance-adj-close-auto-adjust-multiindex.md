---
"title": "yfinance Adj Close missing: check auto_adjust and MultiIndex"
"h1": "yfinance Adj Close missing: check auto_adjust and MultiIndex"
"description": "Fix a missing yfinance Adj Close by setting auto_adjust
  explicitly, choosing single-ticker or MultiIndex columns, and checking price
  semantics."
"summary": "A missing Adj Close and unexpected tuple columns can both follow
  yf.download defaults. Set adjustment and column shape explicitly before
  reading a price series."
"order": 12
"updatedAt": "2026-10-20"
"tags":
  - "yfinance"
  - "market-data"
  - "pandas"
  - "price-adjustment"
"caseStudy":
  "slug": "yfinance-adj-close-auto-adjust-multiindex"
  "problemId": "yfinance-download-adjusted-close-column-shape"
  "titleParts":
    "api": "yfinance"
    "problem": "Adj Close missing"
    "solution": "check auto_adjust and MultiIndex"
  "linkLabel": "yfinance missing Adj Close: check auto_adjust and MultiIndex columns"
  "providers":
    - "yfinance"
  "searchIntent":
    "primary":
      "term": "yfinance Adj Close missing"
      "sourcePhrase": "Using yf.download(ticker) the adjusted Close is missing"
      "evidenceIds":
        - "missing-issue"
    "related":
      - "term": "yfinance auto_adjust false Adj Close"
        "sourcePhrase": "auto_adjust=False"
        "evidenceIds":
          - "price-doc"
      - "term": "yfinance single ticker MultiIndex"
        "sourcePhrase": "yf.Download for a single ticker now produces columns with an
          un-wanted multi-index"
        "evidenceIds":
          - "index-issue"
      - "term": "yfinance download multi_level_index default"
        "sourcePhrase": "multi_level_index=True"
        "evidenceIds":
          - "download-source"
    "status": "keyword-candidate"
  "evidence":
    - "id": "download-source"
      "kind": "code"
      "url": "https://github.com/ranaroussi/yfinance/blob/1.7.0/yfinance/multi.py"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/yfinance-download-1-7-0.txt"
      "sha256": "7de4eb46e72ec7eb8bd6a4fab20f46bc37f30cd31634ff3583391eed081f2400"
      "excerpt": "multi_level_index=True"
    - "id": "adjust-helper"
      "kind": "code"
      "url": "https://github.com/ranaroussi/yfinance/blob/1.7.0/yfinance/utils.py"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/yfinance-adjust-helper-1-7-0.txt"
      "sha256": "18c150fda75782d6a521cc71a32e183bc3d2195c1814d57d1fcb72354a6d646e"
      "excerpt": "ratio = (df[\"Adj Close\"] / df[\"Close\"]).to_numpy()"
    - "id": "price-doc"
      "kind": "documentation"
      "url": "https://ranaroussi.github.io/yfinance/advanced/price_adjustment.html"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/yfinance-price-adjustment.txt"
      "sha256": "bd5b2de29148ef84cac0e15a72357cae380adae74e0eb9b866312544b0d3705e"
      "excerpt": "Pass `auto_adjust=False` to get Yahoo’s split-adjusted OHLC together
        with an `Adj Close` column that also includes dividends."
    - "id": "missing-issue"
      "kind": "documentation"
      "url": "https://github.com/ranaroussi/yfinance/issues/2308"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/yfinance-missing-adj-close-issue.txt"
      "sha256": "c833998a611cf258dd6a3f288265d91d0b4573117bcd6564a7c097686de252b3"
      "excerpt": "Using yf.download(ticker) the adjusted Close is missing"
    - "id": "index-issue"
      "kind": "documentation"
      "url": "https://github.com/ranaroussi/yfinance/issues/2193"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/yfinance-multiindex-issue.txt"
      "sha256": "396a17777ee7dd284c0d1b6cd82592048336d618e6466b25c9627001815fa1bf"
      "excerpt": "yf.Download for a single ticker now produces columns with an
        un-wanted multi-index"
    - "id": "doc-commit"
      "kind": "documentation"
      "url": "https://github.com/ranaroussi/yfinance/commit/2081dca0b224512ff768f9c5e\
        6bd9c658a3b8339"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/yfinance-doc-clarification.txt"
      "sha256": "8d7a2d2b3dc420bfef5bccf21fd17d68d6ce7d218b578635b0871d2b6c7d9f1f"
      "excerpt": "docs: explain default price adjustment and Close vs Adj Close (fixes
        #860)"
    - "id": "project-readme"
      "kind": "documentation"
      "url": "https://github.com/ranaroussi/yfinance/blob/main/README.md"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/yfinance-readme-use.txt"
      "sha256": "6cf8eb0fab3a66adb87ba202e67d92a5a2b76cc40de65f12a79a3f4c469a5bb4"
      "excerpt": "yfinance is not affiliated, endorsed, or vetted by Yahoo, Inc."
  "technicalDetails":
    - "kind": "field"
      "value": "auto_adjust"
      "evidenceId": "price-doc"
    - "kind": "field"
      "value": "multi_level_index"
      "evidenceId": "download-source"
    - "kind": "field"
      "value": "Adj Close"
      "evidenceId": "price-doc"
  "verification":
    "level": "source-review"
    "note": "Source review on 2026-10-20 covers yfinance 1.7.0 source, project
      documentation and issue reports; no Yahoo price request or live data
      comparison was performed."
    "evidenceIds":
      - "download-source"
      - "adjust-helper"
      - "price-doc"
      - "missing-issue"
      - "index-issue"
  "review":
    "author": "차도녀 gpt may"
    "authorType": "Person"
    "checkedAt": "2026-10-20"
    "titleMatchesBody": true
    "distinctProblem": "A yfinance DataFrame adjustment and column-shape contract,
      distinct from general provider selection and other vendors’ data gaps."
    "noInventedResults": true
---

## Symptoms

A pipeline expecting `Adj Close` from `yf.download()` may fail a column lookup even when `Close` is present. A separate lookup may fail because a one-ticker download has `MultiIndex` columns. The [missing-column report](https://github.com/ranaroussi/yfinance/issues/2308) and [single-ticker column report](https://github.com/ranaroussi/yfinance/issues/2193) describe these symptoms. They do not prove a new runtime defect on 2026-10-18.

## Cause

The [1.7.0 download source](https://github.com/ranaroussi/yfinance/blob/1.7.0/yfinance/multi.py) sets `auto_adjust=True` and `multi_level_index=True` by default. The [price-adjustment documentation](https://ranaroussi.github.io/yfinance/advanced/price_adjustment.html) says `auto_adjust=False` returns Yahoo OHLC already adjusted for splits and an `Adj Close` that also reflects dividends. With `auto_adjust=True`, all OHLC fields reflect splits and dividends: `Close` is the adjusted close and no separate `Adj Close` appears. The [adjustment helper](https://github.com/ranaroussi/yfinance/blob/1.7.0/yfinance/utils.py) shows the rename. Separately, `multi_level_index=False` removes the ticker level only for exactly one ticker. Multiple tickers retain a ticker level, so select both the price field and symbol. The [2026-10-18 documentation commit](https://github.com/ranaroussi/yfinance/commit/2081dca0b224512ff768f9c5e6bd9c658a3b8339) clarified the price semantics; it does not establish when the defaults first changed.

## Safe resolution

Choose the required price meaning before selecting columns. Set `auto_adjust=False` for a separate dividend-adjusted `Adj Close`, or `auto_adjust=True` and read `Close` for adjusted OHLC. Use `multi_level_index=False` for one flat ticker and preserve the symbol level for multiple tickers. Record the package version, symbols, interval, both options and field meaning in the ingestion contract. These calls require network access when a reader runs them; they were not run for this review.

```python
import yfinance as yf
from importlib.metadata import version

print("yfinance", version("yfinance"))

raw = yf.download(
    "AAPL", period="1y", auto_adjust=False,
    multi_level_index=False, progress=False,
)
if raw.empty or "Adj Close" not in raw.columns:
    raise ValueError("Expected a nonempty single-ticker Adj Close series")
adj_close = raw["Adj Close"]

adjusted = yf.download(
    "AAPL", period="1y", auto_adjust=True,
    multi_level_index=False, progress=False,
)
if adjusted.empty or "Close" not in adjusted.columns or "Adj Close" in adjusted.columns:
    raise ValueError("Unexpected adjusted-price schema")
adjusted_close = adjusted["Close"]

many = yf.download(
    ["AAPL", "MSFT"], period="1y", auto_adjust=False,
    multi_level_index=True, group_by="column", progress=False,
)
if many.empty or ("Adj Close", "AAPL") not in many.columns:
    raise ValueError("Unexpected multi-ticker schema")
apple_adj_close = many["Adj Close"]["AAPL"]
```

## Verification

Source review on 2026-10-20 covers yfinance 1.7.0 source, project documentation and issue reports; no Yahoo price request or live data comparison was performed. For a local shape test, use saved nonempty fixtures for both adjustment modes and one versus multiple tickers; assert expected fields and index levels, including a failure control with the wrong field. For real-feed acceptance, compare known split and dividend dates and save the observed values, package version, options and timestamps. A period without either event cannot establish adjustment semantics. Fixture shape checks do not prove Yahoo price correctness.

## Limitations

The first version in which either default changed was not established. The [latest release checked here](https://github.com/ranaroussi/yfinance/releases/tag/1.7.0) was 1.7.0 (2026-08-26); later package or upstream behavior may differ. The guidance here concerns `yf.download()`; check `Ticker.history()` against its own call contract. The [project README](https://github.com/ranaroussi/yfinance/blob/main/README.md) identifies yfinance as unofficial and intended for research and education, and warns that Yahoo data is intended for personal use. The library license and rights to downloaded data are separate. No live quote, commercial-use permission or production result was verified.
