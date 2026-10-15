---
"title": "LLM API retries and fallback: avoid applying timeout budgets twice"
"h1": "LLM API retries and fallback: avoid applying timeout budgets twice"
"description": "Share one monotonic timeout deadline across LLM attempts and
  fallback providers, disable hidden SDK retries, and verify that exhausted
  budgets never start another call."
"summary": "A fallback chain must spend one request budget. Giving every retry
  and provider a fresh timeout can multiply latency, especially when application
  retries are combined with SDK retries."
"order": 13
"updatedAt": "2026-10-16"
"tags":
  - "practical-case"
  - "llm"
"caseStudy":
  "slug": "llm-retry-fallback-shared-timeout-budget"
  "problemId": "llm-retry-fallback-shared-timeout-budget"
  "titleParts":
    "api": "LLM API"
    "problem": "retries and fallback"
    "solution": "avoid applying timeout budgets twice"
  "linkLabel": "LLM API retries and fallback: avoid applying timeout budgets twice"
  "providers":
    - "openai"
    - "anthropic"
    - "gemini"
  "searchIntent":
    "primary":
      "term": "LLM fallback timeout applied again for each provider"
      "sourcePhrase": "remaining_provider_timeout"
      "evidenceIds":
        - "getbeta-llm-deadline"
    "related":
      - "term": "OpenAI max_retries zero application retry budget"
        "sourcePhrase": "max_retries=0"
        "evidenceIds":
          - "official-openai-retries"
      - "term": "LLM remaining_provider_timeout monotonic deadline"
        "sourcePhrase": "remaining_provider_timeout"
        "evidenceIds":
          - "getbeta-llm-deadline"
      - "term": "Gemini timeout seconds to milliseconds"
        "sourcePhrase": "resolved_timeout * 1000"
        "evidenceIds":
          - "getbeta-gemini-timeout"
    "status": "keyword-candidate"
  "evidence":
    - "id": "getbeta-llm-deadline"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/890c2531b76c2fad834da80c58ac16\
        6908afdde1/app/services/llm/base.py"
      "checkedAt": "2026-10-16"
      "snapshot": "case-studies/evidence/getbeta-llm-deadline.txt"
      "sha256": "e3928632492d6c807e5fada12b2ab924bfbadfeb70735ee916e9e61d2db63f9e"
      "excerpt": "def provider_operation_deadline(timeout_s: float) -> float:

        \    \"\"\"Return the monotonic deadline shared by one logical
        operation.\"\"\"

        \    return time.monotonic() + timeout_s



        def remaining_provider_timeout(deadline: float) -> float:

        \    \"\"\"Return remaining operation time or fail before another SDK
        call.\"\"\"

        \    remaining = deadline - time.monotonic()

        \    if remaining <= 0:

        \        raise TimeoutError(\"LLM provider deadline exceeded\")

        \    return min(remaining, PROVIDER_TIMEOUT_SECONDS)"
    - "id": "official-openai-retries"
      "kind": "documentation"
      "url": "https://developers.openai.com/api/reference/python"
      "checkedAt": "2026-10-16"
      "snapshot": "case-studies/evidence/official-openai-retries.txt"
      "sha256": "aa1d257ab0d710754f905815db8e60ba9fdf57ca5eb82faa5611e80421c4b34c"
      "excerpt": "max_retries=0\n0 disables retries."
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
    - "id": "getbeta-gemini-timeout"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/890c2531b76c2fad834da80c58ac16\
        6908afdde1/app/services/llm/gemini_provider.py"
      "checkedAt": "2026-10-16"
      "snapshot": "case-studies/evidence/getbeta-gemini-timeout.txt"
      "sha256": "8a10a6bf1f94564ac2e9a99f1e6486d5c0043553295e1b27bea78ed85d668cc7"
      "excerpt": "config: Dict[str, Any] = {

        \            \"max_output_tokens\": resolved_max_tokens,

        \            \"http_options\": {

        \                \"timeout\": max(1, int(resolved_timeout * 1000)),

        \            },

        \        }

        \        if system_prompt:"
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
      "value": "remaining_provider_timeout"
      "evidenceId": "getbeta-llm-deadline"
    - "kind": "field"
      "value": "max_retries=0"
      "evidenceId": "official-openai-retries"
    - "kind": "sdk-version"
      "value": "openai==2.46.0"
      "evidenceId": "getbeta-sdk-pins"
    - "kind": "sdk-version"
      "value": "anthropic==0.117.0"
      "evidenceId": "getbeta-sdk-pins"
    - "kind": "sdk-version"
      "value": "google-genai==2.8.0"
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
    "distinctProblem": "A fallback chain must spend one request budget. Giving every
      retry and provider a fresh timeout can multiply latency, especially when
      application retries are combined with SDK retries."
    "noInventedResults": true
---

## Symptoms

A logical request exceeds its intended timeout because a retry or secondary provider receives a new full allowance. A second retry layer inside an SDK can multiply attempts again. The reviewed application dependency pins are `openai==2.46.0`, `anthropic==0.117.0` and `google-genai==2.8.0`; these identify the reviewed revision, not the newest available releases.

## Cause

The reviewed factory creates one monotonic deadline and calls `remaining_provider_timeout` before each leg. Its OpenAI and Anthropic constructors disable automatic retries with `max_retries=0`; the Gemini constructor limits SDK retry attempts to one. Gemini's per-request timeout is converted from seconds to milliseconds. The [official OpenAI Python reference](https://developers.openai.com/api/reference/python) separately documents configurable SDK retries. The application's retry policy and fixed ceilings are application decisions, not provider limits.

## Safe resolution

The reduced function uses one clock/deadline and an injected provider boundary. Configure SDK retry ownership outside this function; a provider callable must honor the timeout passed to it and must not secretly reset the logical deadline.

```python
def call_with_budget(providers, *, budget_s, clock):
    if budget_s <= 0:
        raise ValueError("Budget must be positive")
    deadline = clock() + budget_s
    last_error = None
    for send in providers:
        remaining = deadline - clock()
        if remaining <= 0:
            raise TimeoutError("Logical LLM deadline exceeded")
        try:
            result = send(timeout_s=remaining)
        except TimeoutError as exc:
            last_error = exc
            continue
        if clock() > deadline:
            raise TimeoutError("Logical LLM deadline exceeded")
        return result
    if last_error is not None:
        raise last_error
    raise RuntimeError("No provider available")
```

## Verification

Synthetic Python examples were checked on 2026-10-16; the original application tests and live provider APIs were not run.

Use a fake monotonic clock rather than sleeping. With a budget of ten seconds, let the primary consume six seconds and time out; assert the secondary receives only four seconds. If the primary exhausts the budget, assert secondary calls remain zero. Reject a result returned after the deadline. Preserve a successful first response without starting fallback. Inspect the real adapter separately for max_retries=0, Gemini attempts=1 and millisecond conversion.

The checked-in tests extract this published Python block and exercise the same synthetic boundary cases. Re-run with `npm test`.

## Limitations

Checking a local deadline does not prove a blocking transport is immediately cancelled; a timed-out generation may still have reached a provider. Retry side effects and request authority/cancellation need their own boundaries. This example retries only TimeoutError, not arbitrary permission failures or malformed output, and does not reproduce the historical adapter's source-specific authentication retry policy. Backoff must also consume the same budget and release concurrency slots. See the [retry guide](../retry-and-backoff/) and [OpenAI profile](../../apis/openai/).

Implementation evidence was reviewed at pinned GetBeta revision `890c2531b76c`. Source-repository links may require access; the public code above is a reduced adaptation without credentials or customer data. Search expressions are candidates, with no search-volume, indexing or ranking claim.
