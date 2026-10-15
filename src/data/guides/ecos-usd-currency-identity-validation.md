---
"title": "ECOS exchange rate API: prevent selecting a non-USD currency"
"h1": "ECOS exchange rate API: prevent selecting a non-USD currency"
"description": "Prevent an ECOS 731Y001 parser from treating the first currency
  row as USD/KRW by validating currency identity and rejecting missing or
  ambiguous matches."
"summary": "Valid ECOS JSON can still be interpreted as the wrong currency.
  Select and validate the USD item explicitly; never turn the first row into a
  compatibility fallback when the expected currency is absent."
"order": 12
"updatedAt": "2026-10-16"
"tags":
  - "practical-case"
  - "ecos"
"caseStudy":
  "slug": "ecos-usd-currency-identity-validation"
  "problemId": "ecos-usd-currency-identity-validation"
  "titleParts":
    "api": "ECOS"
    "problem": "exchange rate API"
    "solution": "prevent selecting a non-USD currency"
  "linkLabel": "ECOS exchange rate API: prevent selecting a non-USD currency"
  "providers":
    - "bok-ecos"
  "searchIntent":
    "primary":
      "term": "ECOS exchange rate API reads EUR instead of USD"
      "sourcePhrase": "ITEM_NAME1"
      "evidenceIds":
        - "getbeta-ecos-parser"
    "related":
      - "term": "ECOS 731Y001 USD 0000001 item code"
        "sourcePhrase": "0000001"
        "evidenceIds":
          - "getbeta-ecos-query"
      - "term": "ECOS ITEM_NAME1 DATA_VALUE parsing"
        "sourcePhrase": "ITEM_NAME1"
        "evidenceIds":
          - "getbeta-ecos-parser"
      - "term": "ECOS USD row missing compatibility fallback"
        "sourcePhrase": "first_row = rows[0]"
        "evidenceIds":
          - "getbeta-ecos-parser"
    "status": "keyword-candidate"
  "evidence":
    - "id": "getbeta-ecos-parser"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/890c2531b76c2fad834da80c58ac16\
        6908afdde1/app/services/bok_exchange_rate_service.py"
      "checkedAt": "2026-10-16"
      "snapshot": "case-studies/evidence/getbeta-ecos-parser.txt"
      "sha256": "86c0dbf507364615e879dcc63874d24708cc247b170b1687c26c93c1bfc96760"
      "excerpt": "item_name = row.get('ITEM_NAME1') or row.get('ITEM_NAME2') or ''

        \                item_name_lower = str(item_name).lower()

        \               \ 

        \                # 미국달러 관련 항목 확인

        \                if '미국달러' in item_name or 'usd' in item_name_lower:

        \                    data_value = row.get('DATA_VALUE')

        \                    if data_value:

        \                        try:

        \                            rate_value =
        float(str(data_value).replace(\",\", \"\"))

        \                            logger.debug(f\"Found USD rate: {item_name}
        = {rate_value}\")

        \                            return Decimal(str(rate_value))

        \                        except (ValueError, TypeError):

        ...

        \            first_row = rows[0]

        \            if isinstance(first_row, dict):

        \                for key_candidate in (\"DATA_VALUE\", \"DATA\",
        \"DATA_VAL\", \"DATA_VALUE_\"):

        \                    if key_candidate in first_row:

        \                        try:

        \                            rate_value =
        float(str(first_row[key_candidate]).replace(\",\", \"\"))"
    - "id": "getbeta-ecos-query"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/890c2531b76c2fad834da80c58ac16\
        6908afdde1/scripts/update_dividends_bulk.py"
      "checkedAt": "2026-10-16"
      "snapshot": "case-studies/evidence/getbeta-ecos-query.txt"
      "sha256": "d8b93cec38d7a16804c59f86b28ce3062ff6eeaa23a1efc1cd3364634c8e42ce"
      "excerpt": "f\"731Y001/D/{start_text}/{end_text}/0000001/?/?/?\""
    - "id": "getbeta-sdk-pins"
      "kind": "documentation"
      "url": "https://github.com/firewine/getbeta/blob/890c2531b76c2fad834da80c58ac16\
        6908afdde1/backend/requirements.txt"
      "checkedAt": "2026-10-16"
      "snapshot": "case-studies/evidence/getbeta-sdk-pins.txt"
      "sha256": "23a1f44e49b93f32d0881c3a97dfcbc71ce6fb3e7da56703eb449017ebfb5f51"
      "excerpt": "anthropic==0.117.0 \\

        google-genai==2.8.0 \\

        httpx==0.28.1 \\

        openai==2.46.0 \\"
    - "id": "getbeta-five-examples-execution"
      "kind": "execution"
      "url": "https://github.com/firewine/api-atlas/blob/main/case-studies/evidence/g\
        etbeta-five-examples-execution.txt"
      "checkedAt": "2026-10-16"
      "snapshot": "case-studies/evidence/getbeta-five-examples-execution.txt"
      "sha256": "e23b7f8f5aa819f371fc5ac12db806e5929ecb3e35eb20f09e8721f13218136d"
      "excerpt": "Checked: 2026-10-16

        Scope: deterministic reduced Python snippets; synthetic inputs; no
        network or provider SDK calls

        Python: 3.9.6

        Command: python3 tests/fixtures/check-getbeta-cases.py (code blocks
        supplied as JSON on stdin)

        Exit code: 0

        eodhd-dividend-delay-cache-refresh: synthetic fixture passed

        seibro-dividend-pagination-count-mismatch: synthetic fixture passed

        ecos-usd-currency-identity-validation: synthetic fixture passed

        llm-retry-fallback-shared-timeout-budget: synthetic fixture passed

        llm-structured-output-fallback-response-format: synthetic fixture
        passed"
  "technicalDetails":
    - "kind": "field"
      "value": "ITEM_NAME1"
      "evidenceId": "getbeta-ecos-parser"
    - "kind": "field"
      "value": "DATA_VALUE"
      "evidenceId": "getbeta-ecos-parser"
    - "kind": "field"
      "value": "0000001"
      "evidenceId": "getbeta-ecos-query"
    - "kind": "sdk-version"
      "value": "httpx==0.28.1"
      "evidenceId": "getbeta-sdk-pins"
  "verification":
    "level": "synthetic-test"
    "note": "Synthetic Python examples were checked on 2026-10-16; the original
      application tests and live provider APIs were not run."
    "evidenceIds":
      - "getbeta-five-examples-execution"
  "review":
    "author": "API Atlas"
    "authorType": "Organization"
    "checkedAt": "2026-10-16"
    "titleMatchesBody": true
    "distinctProblem": "Valid ECOS JSON can still be interpreted as the wrong
      currency. Select and validate the USD item explicitly; never turn the
      first row into a compatibility fallback when the expected currency is
      absent."
    "noInventedResults": true
---

## Symptoms

A response is valid JSON and `DATA_VALUE` is numeric, yet the stored rate belongs to another currency. The reviewed legacy ECOS parser searches `ITEM_NAME1` or `ITEM_NAME2` for a USD identity, but still contains a first-row compatibility fallback when no match is found. That remaining fallback matters: the evidence does not justify saying every application path is fixed. The pinned application lock contains `httpx==0.28.1`; the example below uses only Python's decimal module.

## Cause

The `731Y001` statistics table is not itself proof that every returned row is USD/KRW. A separate reviewed collection path requests `731Y001/D/.../0000001`, while a generic parser must still establish what it received. A row's position and a plausible value are not currency identity. The [official ECOS service](https://ecos.bok.or.kr/api/) remains the authority for current table and item definitions.

## Safe resolution

The reduced parser requires the expected item code and a consistent USD name, rejects ambiguous or missing matches, and parses the original value as Decimal. Its ITEM_CODE1 requirement is an explicit stricter application contract; adapt it only after checking the response schema of the endpoint you actually request.

```python
from decimal import Decimal, InvalidOperation

def select_usd_krw(payload):
    rows = payload["StatisticSearch"]["row"]
    if isinstance(rows, dict):
        rows = [rows]
    if not isinstance(rows, list):
        raise ValueError("Expected ECOS rows")
    matches = [
        row for row in rows
        if isinstance(row, dict)
        and row.get("ITEM_CODE1") == "0000001"
        and ("미국달러" in str(row.get("ITEM_NAME1", ""))
             or "usd" in str(row.get("ITEM_NAME1", "")).lower())
    ]
    if len(matches) != 1:
        raise ValueError("USD/KRW row missing or ambiguous")
    raw = matches[0].get("DATA_VALUE")
    if not isinstance(raw, str):
        raise ValueError("Expected original ECOS value text")
    try:
        rate = Decimal(raw.replace(",", ""))
    except InvalidOperation as exc:
        raise ValueError("Invalid ECOS rate") from exc
    if not rate.is_finite() or rate <= 0:
        raise ValueError("Invalid ECOS rate")
    return rate
```

## Verification

Synthetic Python examples were checked on 2026-10-16; the original application tests and live provider APIs were not run.

Put a non-USD row before the USD row and assert the selected value does not depend on row order. Test a response with only EUR, two USD matches, an Australian-dollar item, non-finite/zero/malformed values, and a prematurely parsed float. Each invalid fixture must fail rather than return the first numeric value. All fixture amounts are synthetic; they are not market observations.

The checked-in tests extract this published Python block and exercise the same synthetic boundary cases. Re-run with `npm test`.

## Limitations

This snippet is a proposed strict boundary, not a statement that the legacy first-row fallback was removed from every deployed application path. Validate observation dates, requested windows, units and persistence provenance separately. Different ECOS tables may use different item fields; do not copy 0000001 into an unrelated table. Repository source links may require access, and no authenticated ECOS request or original application test was run. See the [BOK ECOS profile](../../apis/bok-ecos/).

Implementation evidence was reviewed at pinned GetBeta revision `890c2531b76c`. Source-repository links may require access; the public code above is a reduced adaptation without credentials or customer data. Search expressions are candidates, with no search-volume, indexing or ranking claim.
