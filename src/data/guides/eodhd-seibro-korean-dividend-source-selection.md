---
"title": "EODHD + SEIBRO Korean dividend dates missing: route collection by
  listing market"
"h1": "EODHD + SEIBRO Korean dividend dates missing: route collection by listing
  market"
"description": "Handle missing EODHD Korean dividend record and payment dates by
  collecting KR stock and ETF cash events from SEIBRO while keeping US dividends
  on EODHD."
"summary": "EODHD support identified a Korean .KO date-field coverage limit:
  ex-date and amount are supplied, while declaration, record and payment dates
  are not. Route KR dividends to confirmed SEIBRO events; keep EODHD for the US
  dividend path and avoid cross-source field grafting."
"order": 13
"updatedAt": "2026-10-20"
"tags":
  - "practical-case"
  - "eodhd"
  - "seibro"
  - "dividends"
  - "korea"
"caseStudy":
  "slug": "eodhd-seibro-korean-dividend-source-selection"
  "problemId": "korean-dividend-eodhd-date-coverage-market-source-selection"
  "titleParts":
    "api": "EODHD + SEIBRO"
    "problem": "Korean dividend dates missing"
    "solution": "route collection by listing market"
  "linkLabel": "EODHD Korean dividend date gaps: route KR events to SEIBRO"
  "providers":
    - "eodhd"
    - "seibro"
  "searchIntent":
    "primary":
      "term": "EODHD Korea dividend payment date missing"
      "sourcePhrase": "record and payment dates are not supplied"
      "evidenceIds":
        - "support-reply"
    "related":
      - "term": "EODHD .KO dividend ex-date and amount"
        "sourcePhrase": "the ex-date and value are the reliable fields for Korea"
        "evidenceIds":
          - "support-reply"
      - "term": "EODHD dividend recordDate null"
        "sourcePhrase": "recordDate  | date or null"
        "evidenceIds":
          - "eodhd-fields"
      - "term": "SEIBRO Korea dividend source selection"
        "sourcePhrase": "KR-listed dividends use SEIBRO"
        "evidenceIds":
          - "source-policy"
      - "term": "SEIBRO ETF payment date field"
        "sourcePhrase": "TH1_PAY_TERM_BEGIN_DT"
        "evidenceIds":
          - "etf-facts"
    "status": "keyword-candidate"
  "evidence":
    - "id": "support-reply"
      "kind": "documentation"
      "url": "https://github.com/firewine/api-atlas/blob/main/case-studies/evidence/e\
        odhd-korea-support-2026-09-28.md"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/eodhd-korea-support-2026-09-28.md"
      "sha256": "e14b6ef15e01c851690b55f4e3bf0bc2b1be777bd46039d522255efc6cd3bdf1"
      "excerpt": "Coverage limitation (not a defect): Korean stocks and ETFs (.KO).
        For these the source provides only the ex-date and the amount -
        declaration, record and payment dates are not supplied to us, so they
        come back null across the board. This is why 005930.KO, 069500.KO and
        the other .KO names show null there. We cannot backfill these, as we do
        not receive them; the ex-date and value are the reliable fields for
        Korea."
    - "id": "eodhd-fields"
      "kind": "documentation"
      "url": "https://eodhd.com/financial-apis/api-splits-dividends"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/official-eodhd-dividend-dates-2026-10-20.txt"
      "sha256": "20db79f3dd3f5a24fddc571c42b3a16fe8c28509d62422a80a28019eba9dcc6c"
      "excerpt": "recordDate  | date or null"
    - "id": "source-policy"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b\
        595860a26b/app/services/dividend_source_policy.py"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/getbeta-kr-dividend-source-policy-c4d29bb.txt"
      "sha256": "545037bf6bfffbebbe7d672b84338b335d5197272b77739211fb1300a0b76bce"
      "excerpt": "KR-listed dividends use SEIBRO"
    - "id": "eodhd-guard"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b\
        595860a26b/app/services/eodhd_api_client.py"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/getbeta-eodhd-kr-guard-c4d29bb.txt"
      "sha256": "53c5075a5d099545da28a64998cc19c64955c9d858c624a6e2f4b8aca89f2c24"
      "excerpt": "EODHD_KR_DIVIDENDS_NOT_ALLOWED"
    - "id": "etf-facts"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b\
        595860a26b/app/services/seibro_dividend_collection_service.py"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/getbeta-seibro-etf-facts-c4d29bb.txt"
      "sha256": "e2120d8658b8f8634df5360fef36b4305dcc30c98a7e98891362d9ee8f49fd4a"
      "excerpt": "TH1_PAY_TERM_BEGIN_DT"
    - "id": "stock-facts"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b\
        595860a26b/app/services/seibro_stock_dividend_source.py"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/getbeta-seibro-stock-facts-c4d29bb.txt"
      "sha256": "f068b185d01b4d1ae6b6932a04aa1a57df9f0d5abcede31351adcd0b3f010957"
      "excerpt": "SHOTN_ISIN"
    - "id": "stock-conflicts"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b\
        595860a26b/app/services/seibro_stock_dividend_collection_service.py"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/getbeta-seibro-stock-conflicts-c4d29bb.txt"
      "sha256": "be251ca190c3f47e898f5801706438b0f08375d8d6c7768625c6d77a93d39b99"
      "excerpt": "stock_correction_cross_source_requires_bridge"
    - "id": "scheduler"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b\
        595860a26b/scripts/scheduler_runner.py"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/getbeta-dividend-scheduler-c4d29bb.txt"
      "sha256": "4114d678a3742b200e370580a946fbeb96e662819721f6084200011aa34ea87c"
      "excerpt": "SEIBRO_SUPPLEMENT_COMMAND"
    - "id": "backfill"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b\
        595860a26b/scripts/backfill_kr_dividends_seibro.py"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/getbeta-seibro-backfill-c4d29bb.txt"
      "sha256": "f522c1467d71390eac851aeb390a9cc5c04cc65d9e133f301ecae7661336ceeb"
      "excerpt": "dry-run unless --apply"
    - "id": "receipt"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b\
        595860a26b/scripts/seibro_backfill_state.py"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/getbeta-seibro-receipt-c4d29bb.txt"
      "sha256": "6f144f99af65bfdbb81700c7a52665a9e0e678ec0e878798caf1ca97bf07b3c6"
      "excerpt": "running/unknown always require review"
    - "id": "paging"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b\
        595860a26b/app/services/seibro_stock_dividend_source.py"
      "checkedAt": "2026-10-20"
      "snapshot": "case-studies/evidence/getbeta-seibro-stock-paging-c4d29bb.txt"
      "sha256": "9d597c30d903ea2e203b98b6664c47452e31aca73a7be931f9a8fb195d8eb530"
      "excerpt": "A middle gap is not a terminal:"
  "technicalDetails":
    - "kind": "field"
      "value": "recordDate"
      "evidenceId": "eodhd-fields"
    - "kind": "field"
      "value": "TH1_PAY_TERM_BEGIN_DT"
      "evidenceId": "etf-facts"
    - "kind": "field"
      "value": "SHOTN_ISIN"
      "evidenceId": "stock-facts"
    - "kind": "error-code"
      "value": "EODHD_KR_DIVIDENDS_NOT_ALLOWED"
      "evidenceId": "eodhd-guard"
  "verification":
    "level": "source-review"
    "note": "Source review on 2026-10-20 covers the authorized 2026-09-28 EODHD
      support excerpt, vendor field documentation and GetBeta commit c4d29bbb;
      no provider request, original GetBeta test suite, database backfill or
      deployment was run."
    "evidenceIds":
      - "support-reply"
      - "eodhd-fields"
      - "source-policy"
      - "eodhd-guard"
      - "etf-facts"
      - "stock-facts"
      - "stock-conflicts"
      - "scheduler"
      - "backfill"
      - "receipt"
      - "paging"
  "review":
    "author": "차도녀 gpt may"
    "authorType": "Person"
    "checkedAt": "2026-10-20"
    "titleMatchesBody": true
    "distinctProblem": "This case addresses a documented KR date-field coverage
      limit and an explicit market-level provider policy. The older EODHD case
      covers delayed observation and cache behavior; the SEIBRO case covers
      historical page-count validation."
    "noInventedResults": true
---

## Symptoms

An EODHD .KO dividend row can have an ex-date and amount but no declaration, record or payment date. A yield, entitlement or cash-date pipeline that treats those null fields as complete will misstate its confidence. In an [authorized excerpt of a 2026-09-28 EODHD support reply](https://github.com/firewine/api-atlas/blob/main/case-studies/evidence/eodhd-korea-support-2026-09-28.md), support called this a Korean stocks and ETFs coverage limitation, not a runtime defect: its upstream source did not provide those three dates. EODHD's [dividend field reference](https://eodhd.com/financial-apis/api-splits-dividends) identifies `date` as ex-date and marks `recordDate` and `paymentDate` nullable. The support reply describes its then-current .KO feed; it does not establish that Korean dividend amounts as a class are wrong.

## Cause

This is a missing-field and source-selection issue, separate from the [earlier EODHD delayed-update/cache case](../eodhd-dividend-delay-cache-refresh/). The reviewed [GetBeta policy](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/app/services/dividend_source_policy.py) uses the catalog listing market, not currency or ticker shape: active KR-listed STOCK and ETF dividends come from SEIBRO. Old EODHD KR rows remain auditable but are excluded before date selection, limits and sums. The [EODHD client guard](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/app/services/eodhd_api_client.py) rejects KO/KQ/KS/ETF_KR dividend requests with `EODHD_KR_DIVIDENDS_NOT_ALLOWED`. EODHD still serves the existing US dividend path; price and FX collection are separate paths. This is market-segmented collection, not a field-by-field join or fallback between competing dividend rows.

## Safe resolution

1. Classify each security from the authoritative listing catalog. For KR-listed STOCK/ETF cash dividends, acquire SEIBRO events; for the reviewed US dividend path, continue EODHD. Preserve source, capture time, security identity and raw evidence with every observation. Do not rewrite an archived EODHD KR row as SEIBRO or fill its null dates from a nearby SEIBRO row.
2. Confirm the SEIBRO event before financial admission. The reviewed [ETF collector](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/app/services/seibro_dividend_collection_service.py) binds a full ISIN and uses `RGT_STD_DT` (record date), `TH1_PAY_TERM_BEGIN_DT` (payment date) and `ESTM_STDPRC` (KRW amount); `청산분배` is excluded from recurring DPS. The reviewed [stock source](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/app/services/seibro_stock_dividend_source.py) treats `SHOTN_ISIN` as a short code, checks issuer and share class, and corroborates cash facts through three rights responses. Neither collector writes a guessed ex-date: new SEIBRO rows explicitly use `ex_date=None`; a separate [read-only entitlement calculation](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/app/services/dividend_entitlement.py) may derive a date for eligibility when the reviewed KRX calendar supports it.
3. Select active rows by listing market and source before any sort, limit, date extreme or sum. Hold missing, ambiguous, noncash or conflicting events for review. The [stock correction guard](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/app/services/seibro_stock_dividend_collection_service.py) requires a bridge for cross-source or legacy ex-date corrections; absence in a recent list does not delete a historical event.

The reduced Python example shows the read-side boundary. It accepts already collected rows and makes no provider request or database write.

```python
def active_dividend_rows(listing_market, instrument_kind, rows):
    if listing_market == "KR" and instrument_kind in {"STOCK", "ETF"}:
        required_source = "SEIBRO"
    elif listing_market == "US":
        required_source = "EODHD"
    else:
        raise ValueError("Market or instrument requires a separate source policy")

    selected = [row for row in rows
                if str(row.get("data_source", "")).strip().upper() == required_source]
    if listing_market == "KR" and any(
        row.get("record_date") is None or row.get("pay_date") is None
        for row in selected
    ):
        raise ValueError("Unconfirmed KR dividend dates")
    return selected  # Apply date ordering, limits and sums only after this filter.
```

## Verification

Source review on 2026-10-20 covers the authorized 2026-09-28 EODHD support excerpt, vendor field documentation and GetBeta commit c4d29bbb; no provider request, original GetBeta test suite, database backfill or deployment was run. A local contract check should feed the reduced selector a KR SEIBRO event plus an archived EODHD KR event and assert only the former reaches downstream dates and sums. Negative controls should hold a SEIBRO row missing record/payment dates, reject an unsupported market, and detect a same-date cross-source overlap without merging fields. For the real collector, verify full ETF ISIN or stock issuer/short-code/share-class identity, rights confirmations, capture-time precedence for same-source revisions and persisted source provenance.

The [current scheduler source](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/scripts/scheduler_runner.py) places price refresh, SEIBRO, EODHD US dividends, upcoming and modeled stages in that order; a SEIBRO failure prevents the upcoming KR SEIBRO stage while other stages have their own outcomes. Recovery uses a [monthly backfill command](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/scripts/backfill_kr_dividends_seibro.py) that defaults to dry-run; `--apply` writes and `--resume` is explicit. Review the [receipt state](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/scripts/seibro_backfill_state.py) before replay: complete/partial are terminal, and running/unknown need investigation because database and JSON receipts are not atomic. None of these source observations proves a full historical backfill was completed.

## Limitations

The support reply is a dated, user-approved text excerpt, not a public EODHD API contract or a live-feed test. EODHD may later change coverage. SEIBRO browser-service fields and access terms need independent verification for each deployment; see the [SEIBRO profile](../../apis/seibro/) and [EODHD profile](../../apis/eodhd/). The [historical SEIBRO pagination case](../seibro-dividend-pagination-count-mismatch/) is pinned to older GetBeta code. The newer reviewed stock adapter can retain confirmed events after a stable overstated count only when every advertised remaining range is normally empty, beginning immediately after received rows, and the second count is stable. A middle gap, count drift or malformed response still fails; this does not certify full history or TTM coverage.

No live SEIBRO/EODHD call, paid API use, production collection, backfill completion or deployment was verified here. Source-repository links may require access. Search expressions are candidates; no search-volume, indexing or ranking result is claimed.
