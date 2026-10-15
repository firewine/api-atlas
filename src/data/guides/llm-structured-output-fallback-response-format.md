---
"title": "LLM structured output: preserve response_format through fallback"
"h1": "LLM structured output: preserve response_format through fallback"
"description": "Preserve the original response_format contract across LLM
  fallback, reject adapters that cannot honor it before SDK calls, and
  distinguish JSON mode from schema enforcement."
"summary": "An adapter that accepts response_format but drops it can silently
  turn a structured request into free text. Fallback must preserve the same
  output contract or explicitly refuse the request."
"order": 14
"updatedAt": "2026-10-16"
"tags":
  - "practical-case"
  - "llm"
"caseStudy":
  "slug": "llm-structured-output-fallback-response-format"
  "problemId": "llm-structured-output-fallback-response-format"
  "titleParts":
    "api": "LLM"
    "problem": "structured output"
    "solution": "preserve response_format through fallback"
  "linkLabel": "LLM structured output: preserve response_format through fallback"
  "providers":
    - "openai"
    - "anthropic"
    - "gemini"
  "searchIntent":
    "primary":
      "term": "LLM fallback silently drops response_format"
      "sourcePhrase": "response_format"
      "evidenceIds":
        - "getbeta-llm-format"
    "related":
      - "term": "Anthropic adapter unsupported response_format before SDK call"
        "sourcePhrase": "response_format"
        "evidenceIds":
          - "getbeta-llm-format"
      - "term": "OpenAI json_object fallback contract preservation"
        "sourcePhrase": "response_format"
        "evidenceIds":
          - "getbeta-llm-format-tests"
      - "term": "LLM JSON mode versus strict JSON Schema"
        "sourcePhrase": "JSON mode will not guarantee"
        "evidenceIds":
          - "official-openai-json-mode"
    "status": "keyword-candidate"
  "evidence":
    - "id": "getbeta-llm-format"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/890c2531b76c2fad834da80c58ac16\
        6908afdde1/app/services/llm/base.py"
      "checkedAt": "2026-10-16"
      "snapshot": "case-studies/evidence/getbeta-llm-format.txt"
      "sha256": "178cccd0e917ed1570f0f4edaad8529ac24ebb62998fa8fc6cdb66bbcfff6ef8"
      "excerpt": "def validate_provider_response_format(

        \    response_format: object,

        \    *,

        \    supported: bool,

        ) -> None:

        \    \"\"\"Reject malformed or unsupported structured-output requests
        fail-closed.\"\"\"

        \    if response_format is None:

        \        return

        \    if type(response_format) is not dict:

        \        raise ValueError(\"provider response_format must be an
        object\")

        \    if not supported:

        \        raise ValueError(\"provider does not support
        response_format\")"
    - "id": "official-openai-json-mode"
      "kind": "documentation"
      "url": "https://developers.openai.com/api/docs/guides/structured-outputs?api-mo\
        de=chat"
      "checkedAt": "2026-10-16"
      "snapshot": "case-studies/evidence/official-openai-json-mode.txt"
      "sha256": "a6a636095ea3523aca47ff31bda01f94fd75f1fde57ad05509a249ccd4d64caa"
      "excerpt": "response_format

        json_object

        JSON mode will not guarantee the output matches any specific schema"
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
    - "id": "getbeta-llm-forwarding"
      "kind": "code"
      "url": "https://github.com/firewine/getbeta/blob/890c2531b76c2fad834da80c58ac16\
        6908afdde1/app/services/llm/factory.py"
      "checkedAt": "2026-10-16"
      "snapshot": "case-studies/evidence/getbeta-llm-forwarding.txt"
      "sha256": "235436d33fbd30d38c35bb046fec5e4a169fb93ecd8bfd56a051f2ccea7fb91d"
      "excerpt": "response = call(

        \                messages,

        \                model=effective_model,

        \                response_format=response_format,

        \                temperature=temperature,

        \                max_tokens=resolved_max_tokens,

        \                timeout_s=remaining_timeout,

        \                **({\"before_attempt\": guard_transport} if
        before_attempt is not None else {}),

        \            )

        \            ensure_provider_deadline(deadline)"
    - "id": "getbeta-llm-format-tests"
      "kind": "test"
      "url": "https://github.com/firewine/getbeta/blob/890c2531b76c2fad834da80c58ac16\
        6908afdde1/tests/test_llm_provider_bounds.py"
      "checkedAt": "2026-10-16"
      "snapshot": "case-studies/evidence/getbeta-llm-format-tests.txt"
      "sha256": "cc353ea1d2989ecfd84a0c7d4df20b17e3bffec9d2b74f78fa8477dd9138d1de"
      "excerpt": "assert result.provider == \"openai\"

        \        anthropic_client.messages.create.assert_not_called()

        \        forwarded =
        openai_client.chat.completions.create.call_args.kwargs

        \        assert forwarded[\"response_format\"] is response_format"
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
      "value": "response_format"
      "evidenceId": "getbeta-llm-format"
    - "kind": "error-code"
      "value": "provider does not support response_format"
      "evidenceId": "getbeta-llm-format"
    - "kind": "field"
      "value": "json_object"
      "evidenceId": "official-openai-json-mode"
    - "kind": "sdk-version"
      "value": "openai==2.46.0"
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
    "distinctProblem": "An adapter that accepts response_format but drops it can
      silently turn a structured request into free text. Fallback must preserve
      the same output contract or explicitly refuse the request."
    "noInventedResults": true
---

## Symptoms

A primary adapter rejects or cannot implement a structured-output request, and a fallback returns plain text because the format argument disappeared. In the reviewed revision, the common factory forwards `response_format`; unsupported adapters reject it before their SDK is called. The observed application error text is `provider does not support response_format`, not a vendor error message. The dependency lock pins `openai==2.46.0`.

## Cause

A common method signature is not proof that each adapter implements every parameter. The reviewed regression asserts that an unsupported Anthropic adapter makes no SDK call and that the OpenAI fallback receives the original format object. This concerns those application wrappers; it does not establish that Anthropic or Gemini APIs generally lack structured-output features. The [official OpenAI guide](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=chat) distinguishes JSON mode from schema-constrained output.

## Safe resolution

The reduced chain skips a capability that is explicitly unsupported and never removes the output contract. The injected send function represents an adapter that returns a parsed application object, not a raw SDK completion. Include a JSON instruction in messages when using OpenAI JSON mode.

```python
def structured_fallback(providers, messages, response_format):
    if type(response_format) is not dict:
        raise ValueError("response_format must be an object")
    for supports_format, send in providers:
        if not supports_format:
            continue
        try:
            result = send(
                messages=messages,
                response_format=response_format,
            )
        except TimeoutError:
            continue
        if not isinstance(result, dict):
            raise ValueError("Expected parsed structured output")
        return result
    raise RuntimeError("No provider preserved response_format")
```

## Verification

Synthetic Python examples were checked on 2026-10-16; the original application tests and live provider APIs were not run.

Pass a single format object such as {'type': 'json_object'} and assert the fallback transport receives that exact object. Assert zero calls for an unsupported adapter, preserve the contract when a supported primary times out, and reject a text result rather than accepting silent degradation. If all adapters are unsupported, fail without making a provider call. Invalid format types must fail before any transport.

The checked-in tests extract this published Python block and exercise the same synthetic boundary cases. Re-run with `npm test`.

## Limitations

A json_object fixture proves argument preservation and a parsed-object boundary; it does not prove strict JSON Schema adherence, every required business field, or live model compliance. A strict-schema requirement needs an explicitly supported adapter plus local validation; refusals and truncated responses remain separate outcomes. The example does not translate between different vendors' schema dialects or migrate Chat Completions response_format to Responses text.format. See the [LLM selection guide](../choose-llm-api/) and [Anthropic profile](../../apis/anthropic/).

Implementation evidence was reviewed at pinned GetBeta revision `890c2531b76c`. Source-repository links may require access; the public code above is a reduced adaptation without credentials or customer data. Search expressions are candidates, with no search-volume, indexing or ranking claim.
