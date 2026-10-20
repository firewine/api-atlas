---
"title": "SEIBRO dividend API pagination: reconcile count and collected rows"
"h1": "SEIBRO dividend API pagination: reconcile count and collected rows"
"description": "Check SEIBRO LIST_CNT against every requested page, an empty
  terminal page and a final count before accepting a dividend collection window
  as complete."
"summary": "Receiving the last nonempty page is not enough to prove a dividend
  window is complete. Pin the count, validate page coverage and duplicates, and
  refuse an unstable window before confirming financial facts."
"order": 11
"updatedAt": "2026-10-20"
"tags":
  - "practical-case"
  - "seibro"
"caseStudy":
  "slug": "seibro-dividend-pagination-count-mismatch"
  "problemId": "seibro-dividend-pagination-count-mismatch"
  "titleParts":
    "api": "SEIBRO"
    "problem": "dividend API pagination"
    "solution": "reconcile count and collected rows"
  "linkLabel": "SEIBRO dividend API pagination: reconcile count and collected rows"
  "providers":
    - "seibro"
  "searchIntent":
    "primary":
      "term": "SEIBRO dividend LIST_CNT differs from collected rows"
      "sourcePhrase": "LIST_CNT"
      "evidenceIds":
        - "getbeta-seibro-pagination"
    "related":
      - "term": "SEIBRO START_PAGE END_PAGE pagination"
        "sourcePhrase": "LIST_CNT"
        "evidenceIds":
          - "getbeta-seibro-pagination"
      - "term": "SEIBRO empty terminal page validation"
        "sourcePhrase": "LIST_CNT"
        "evidenceIds":
          - "getbeta-seibro-pagination"
      - "term": "SEIBRO dividend count drift and overlapping pages"
        "sourcePhrase": "LIST_CNT"
        "evidenceIds":
          - "getbeta-seibro-pagination"
    "status": "keyword-candidate"
  "evidence":
    - "id": "getbeta-seibro-pagination"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/890c2531b76c2fad834da80c58ac16\
        6908afdde1/app/services/seibro_stock_dividend_source.py"
      "checkedAt": "2026-10-16"
      "snapshot": "case-studies/evidence/getbeta-seibro-pagination.txt"
      "sha256": "89136c6ec4805e5adfc9dbb3d94fc7ce3492014787f316c8ac877cdd0b8f3ebe"
      "excerpt": "async def total_count() -> int:

        \            receipt = await self._request(client,
        \"divStatInfoListCnt\", LIST_TASK, parameters, result)

        \            count = _singleton(receipt).get(\"LIST_CNT\", \"\")

        \            if not count.isdigit() or int(count) >
        MAX_DIVIDEND_PROVIDER_EVENTS:

        \                raise
        SeibroStockSourceError(\"stock_total_count_invalid_or_exceeded\")

        \            return int(count)


        \        total = await total_count()

        \        rows: list[dict[str, str]] = []

        \        seen: set[tuple[tuple[str, str], ...]] = set()

        \        # Always fetch the exact terminal range beyond the pinned
        total.

        \        for offset in range(0, total + PAGE_SIZE, PAGE_SIZE):

        \            page_params = {**parameters, \"START_PAGE\": str(offset +
        1), \"END_PAGE\": str(offset + PAGE_SIZE)}

        \            page = _vector(await self._request(client,
        \"divStatInfoPList\", LIST_TASK, page_params, result))

        \            if len(page) != min(PAGE_SIZE, max(0, total - offset)):

        \                raise
        SeibroStockSourceError(\"stock_page_coverage_mismatch\")

        \            for row in page:

        \                fingerprint = tuple(sorted(row.items()))

        \                if fingerprint in seen:

        \                    raise
        SeibroStockSourceError(\"stock_repeated_or_overlapping_page\")

        \                seen.add(fingerprint)

        \            rows.extend(page)

        \            await asyncio.sleep(0)

        \        if len(rows) != total or await total_count() != total:

        \            raise SeibroStockSourceError(\"stock_total_count_drift\")

        \        return rows"
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
      "value": "LIST_CNT"
      "evidenceId": "getbeta-seibro-pagination"
    - "kind": "field"
      "value": "START_PAGE"
      "evidenceId": "getbeta-seibro-pagination"
    - "kind": "field"
      "value": "END_PAGE"
      "evidenceId": "getbeta-seibro-pagination"
    - "kind": "error-code"
      "value": "stock_page_coverage_mismatch"
      "evidenceId": "getbeta-seibro-pagination"
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
    "checkedAt": "2026-10-20"
    "titleMatchesBody": true
    "distinctProblem": "Receiving the last nonempty page is not enough to prove a
      dividend window is complete. Pin the count, validate page coverage and
      duplicates, and refuse an unstable window before confirming financial
      facts."
    "noInventedResults": true
---

## Symptoms

A count response and a fully traversed dividend list can disagree. The reviewed SEIBRO stock adapter treats this as an incomplete observation rather than inventing missing events. `LIST_CNT` describes the count receipt; `START_PAGE` and `END_PAGE` describe inclusive request ranges. These names come from the reviewed integration, not a newly verified public REST specification. The historical application lock pins `httpx==0.28.1`.

## Cause

A collection can stop too early, repeat an overlapping page, accept a short page, or observe a changing dataset between the initial count and final request. The available evidence does not establish which upstream mechanism explains every historical discrepancy. The adapter checks each page's expected row count, raw-row duplication, a terminal range beyond the pinned total, and a second count. Its application error `stock_page_coverage_mismatch` is not a SEIBRO HTTP error code.

## Safe resolution

This reduced collector models those coverage checks with injected count/page functions. The default 500-row page size follows the reviewed adapter, not a newly asserted service quota. Row dictionaries are assumed to contain scalar fields already validated by a transport/parser boundary.

```python
def collect_complete(count, fetch_page, *, page_size=500):
    if type(page_size) is not int or page_size <= 0:
        raise ValueError("Invalid page size")
    total = count()
    if type(total) is not int or total < 0:
        raise ValueError("Invalid count")
    rows, seen = [], set()
    for offset in range(0, total + page_size, page_size):
        page = fetch_page(offset + 1, offset + page_size)
        expected = min(page_size, max(0, total - offset))
        if not isinstance(page, list) or len(page) != expected:
            raise ValueError("stock_page_coverage_mismatch")
        for row in page:
            fingerprint = tuple(sorted(row.items()))
            if fingerprint in seen:
                raise ValueError("stock_repeated_or_overlapping_page")
            seen.add(fingerprint)
        rows.extend(page)
    if len(rows) != total or count() != total:
        raise ValueError("stock_total_count_drift")
    return rows
```

## Verification

Synthetic Python examples were checked on 2026-10-16; the original application tests and live provider APIs were not run.

Use 501 distinct synthetic rows and assert requests for 1–500, 501–1000 and the empty 1001–1500 range, plus two count calls. Negative fixtures shorten the first page, overlap the second page, return a nonempty terminal page, or change the second count. Each must raise before any financial confirmation or persistence step. Keep the original window available for investigation rather than silently treating partial rows as complete.

The checked-in tests extract this published Python block and exercise the same synthetic boundary cases. Re-run with `npm test`.

## Limitations

Equal counts do not establish that every row is the right financial fact or that the source snapshot was immutable. A production adapter still needs bounded pages/bytes/time, issuer and share-class identity, confirmed cash-dividend status, amount and payment-date cross-checks. `SHOTN_ISIN` is a short security code in the reviewed integration, not a full ISIN. This is not a claim that the historical source discrepancy was repaired or that splitting windows has already recovered it. The [SEIBRO profile](../../apis/seibro/) documents the research status; the [pagination guide](../rest-pagination-patterns/) covers general traversal patterns.

Implementation evidence was reviewed at pinned GetBeta revision `890c2531b76c`. Source-repository links may require access; the public code above is a reduced adaptation without credentials or customer data. Search expressions are candidates, with no search-volume, indexing or ranking claim.

Editorial update (2026-10-20): the strict count rule above illustrates the pinned historical adapter. The [later EODHD and SEIBRO source-selection case](../eodhd-seibro-korean-dividend-source-selection/) describes the reviewed stock adapter's bounded exception for a stable overstated count with a verified empty tail. That exception does not certify complete history.
