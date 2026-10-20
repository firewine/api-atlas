---
"title": "EODHD missing dividend data: handle delayed updates and cache refreshes"
"h1": "EODHD missing dividend data: handle delayed updates and cache refreshes"
"description": "Distinguish delayed EODHD dividend publication from stale local
  caches, bypass cache reads and writes for scheduled observations, and test
  late-arriving rows."
"summary": "A successful dividend request can still return an incomplete
  observation. Reusing that observation for seven days can hide a later update;
  scheduled collection needs a fresh observation and explicit coverage limits."
"order": 10
"updatedAt": "2026-10-20"
"tags":
  - "practical-case"
  - "eodhd"
"caseStudy":
  "slug": "eodhd-dividend-delay-cache-refresh"
  "problemId": "eodhd-dividend-delay-cache-refresh"
  "titleParts":
    "api": "EODHD"
    "problem": "missing dividend data"
    "solution": "handle delayed updates and cache refreshes"
  "linkLabel": "EODHD missing dividend data: handle delayed updates and cache refreshes"
  "providers":
    - "eodhd"
  "searchIntent":
    "primary":
      "term": "EODHD dividend data missing after successful API request"
      "sourcePhrase": "skip_cache"
      "evidenceIds":
        - "getbeta-eodhd-cache"
    "related":
      - "term": "EODHD skip_cache scheduled dividend collection"
        "sourcePhrase": "skip_cache"
        "evidenceIds":
          - "getbeta-eodhd-cache"
      - "term": "EODHD bulk dividend cache TTL"
        "sourcePhrase": "skip_cache"
        "evidenceIds":
          - "getbeta-eodhd-cache"
      - "term": "late dividend update reconciliation window"
        "sourcePhrase": "skip_cache"
        "evidenceIds":
          - "getbeta-eodhd-cache"
    "status": "keyword-candidate"
  "evidence":
    - "id": "getbeta-eodhd-cache"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/890c2531b76c2fad834da80c58ac16\
        6908afdde1/app/services/eodhd_api_client.py"
      "checkedAt": "2026-10-16"
      "snapshot": "case-studies/evidence/getbeta-eodhd-cache.txt"
      "sha256": "d009d729d8d5100fa99fb4508bdf5000d4c9542d40c3d6ef374449a62dfbece6"
      "excerpt": "_DIV_TTL = 60 * 60 * 24 * 7  # 7 days for dividend lists

        ...

        \        cache_key = f\"bulk_div-v2-decimal:{exchange}:{date}\"

        \        if not skip_cache:

        \            cached = self._store.get_cache(cache_key)

        \            if exact_dividend_cache_rows(cached, bulk=True):

        \                logger.info(f\"Bulk dividends cache HIT for {exchange}
        on {date}\")

        \                return cached

        \        try:

        \            result = await self.get_bulk_dividends_result(exchange,
        date, use_demo=use_demo)

        \        except httpx.HTTPStatusError as exc:

        \            if raise_on_error:

        \                raise RuntimeError(

        ...

        \    async def get_bulk_dividends_result(

        \        self, exchange: str = \"US\", date: Optional[str] = None, *,
        use_demo: bool = False,

        \    ) -> BulkDividendFetchResult:

        \        \"\"\"Uncached scheduled observation with explicit row
        rejection counts.\"\"\""
    - "id": "official-eodhd-bulk"
      "kind": "documentation"
      "url": "https://eodhd.com/financial-apis/bulk-api-eod-splits-dividends"
      "checkedAt": "2026-10-16"
      "snapshot": "case-studies/evidence/official-eodhd-bulk.txt"
      "sha256": "3244b75559307c715127ebf6d07f8b629e70d52d4b4521099d4e917091c71f2c"
      "excerpt": "One request, one exchange, one day.

        type=dividends"
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
      "value": "skip_cache"
      "evidenceId": "getbeta-eodhd-cache"
    - "kind": "field"
      "value": "get_bulk_dividends_result"
      "evidenceId": "getbeta-eodhd-cache"
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
    "distinctProblem": "A successful dividend request can still return an incomplete
      observation. Reusing that observation for seven days can hide a later
      update; scheduled collection needs a fresh observation and explicit
      coverage limits."
    "noInventedResults": true
---

## Symptoms

A scheduled dividend import finishes without a transport error, yet a record added by the upstream feed later is still absent locally. The reviewed application has a seven-day `_DIV_TTL` for dividend caches and a compatibility bulk reader. This is a local integration case, not proof that an HTTP 200 certifies a complete dividend schedule. The reviewed dependency lock pins `httpx==0.28.1`; it does not establish the SDK installed on a live server.

## Cause

The first response and the most complete response need not arrive at the same time. A cache keyed by exchange and observation day can preserve an early empty result after a later upstream revision. In the pinned implementation, `skip_cache` gates reads and writes, and `get_bulk_dividends_result` provides an uncached scheduled observation with explicit rejected-row counts. The [official bulk reference](https://eodhd.com/financial-apis/bulk-api-eod-splits-dividends) documents a day-scoped dividend dataset selected with `type=dividends`; it does not make the application's seven-day TTL a vendor guarantee.

## Safe resolution

The reduced example makes observation policy explicit. It uses injected transport and a synthetic cache, without API keys. Bypassing both cache reads and writes protects the scheduled observation from a stale compatibility cache.

```python
def observe_dividends(cache, fetch, exchange, day, *, now_s,
                      skip_cache=False, ttl_s=7 * 24 * 60 * 60):
    key = (exchange, day)
    cached = cache.get(key)
    if not skip_cache and cached is not None:
        expires_at, rows = cached
        if expires_at > now_s:
            return list(rows)
    rows = fetch(exchange, day)
    if not isinstance(rows, list):
        raise ValueError("Expected dividend rows")
    if not skip_cache:
        cache[key] = (now_s + ttl_s, list(rows))
    return list(rows)
```

## Verification

Synthetic Python examples were checked on 2026-10-16; the original application tests and live provider APIs were not run.

The deterministic fixture first returns an empty list, then exposes a newly added dividend. A normal cached read must still return the first observation, while `skip_cache=True` must call the transport and return the new row. Assert that bypassing did not read or overwrite the old cache; then expire the cache and verify a normal read refreshes it. Also reject a non-list response instead of labelling malformed data complete.

The checked-in tests extract this published Python block and exercise the same synthetic boundary cases. Re-run with `npm test`.

## Limitations

Cache bypass cannot create a dividend that the provider has not published. Revisit a defined lookback window, preserve observation time and source dates, and separately reconcile revisions older than that window. A bypass does not invalidate stale entries used by other readers. The example does not normalize monetary precision, prove financial completeness, or measure live publication delay. The original application's tests were read as evidence, not rerun here. See the [EODHD profile](../../apis/eodhd/) and [retry guide](../retry-and-backoff/).

Implementation evidence was reviewed at pinned GetBeta revision `890c2531b76c`. Source-repository links may require access; the public code above is a reduced adaptation without credentials or customer data. Search expressions are candidates, with no search-volume, indexing or ranking claim.

Editorial update (2026-10-20): this historical cache case does not describe the current KR dividend source policy. See the [EODHD and SEIBRO market-routing case](../eodhd-seibro-korean-dividend-source-selection/) for the Korean date-field coverage limit and the reviewed source selection.
