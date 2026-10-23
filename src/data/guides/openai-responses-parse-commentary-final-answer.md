---
"title": "OpenAI Responses API commentary parsing errors: select final
  structured output"
"h1": "OpenAI Responses API commentary parsing errors: select final structured
  output"
"description": "Fix OpenAI Responses parsing that validates commentary as JSON
  or returns an intermediate object; distinguish SDK 3.14.1 behavior, final
  results and untested live claims."
"summary": "A completed response can contain commentary before valid final JSON.
  Older Python SDK parsing can reject the commentary or return it as the
  structured result; the phase-aware fix preserves commentary while selecting
  eligible final output."
"order": 18
"updatedAt": "2026-10-23"
"tags":
  - "practical-case"
  - "llm"
  - "openai"
  - "structured-output"
"caseStudy":
  "slug": "openai-responses-parse-commentary-final-answer"
  "problemId": "openai-responses-structured-parser-ignores-message-phase"
  "titleParts":
    "api": "OpenAI Responses API"
    "problem": "commentary parsing errors"
    "solution": "select final structured output"
  "linkLabel": "OpenAI Responses commentary parsing: select final structured output"
  "providers":
    - "openai"
  "searchIntent":
    "primary":
      "term": "OpenAI responses.parse commentary JSON error"
      "sourcePhrase": "ValidationError: json_invalid"
      "evidenceIds":
        - "openai-commentary-issue"
    "related":
      - "term": "output_parsed returns an intermediate result"
        "sourcePhrase": "output_parsed"
        "evidenceIds":
          - "openai-phase-helpers"
      - "term": "OpenAI final_answer structured-output selection"
        "sourcePhrase": "final_answer"
        "evidenceIds":
          - "openai-phase-parser"
      - "term": "OpenAI output_text includes commentary"
        "sourcePhrase": "output_text"
        "evidenceIds":
          - "openai-phase-helpers"
      - "term": "OpenAI Python 3.14.1 commentary fix"
        "sourcePhrase": "3.14.1"
        "evidenceIds":
          - "openai-phase-release"
    "status": "keyword-candidate"
  "evidence":
    - "id": "openai-phase-parser"
      "kind": "code"
      "url": "https://github.com/openai/openai-python/blob/6520df1220a0030c7b45b00a6f\
        a4bf2e9c7396ac/src/openai/lib/_parsing/_responses.py"
      "checkedAt": "2026-10-23"
      "snapshot": "case-studies/evidence/openai-phase-parser-2026-10-23.txt"
      "sha256": "7ed95e7552ac6946f23c7f4592bb938f228326dbff4cc8c38d469c54a705b4e8"
      "excerpt": "if phase is not None and phase != \"final_answer\":

        \        return None"
    - "id": "openai-phase-helpers"
      "kind": "documentation"
      "url": "https://github.com/openai/openai-python/blob/v3.14.1/helpers.md"
      "checkedAt": "2026-10-23"
      "snapshot": "case-studies/evidence/openai-phase-helpers-2026-10-23.txt"
      "sha256": "e872a0f5957337a0c03b7be9e74273c107f9f24772fce2615a3c1b8b88fe3f80"
      "excerpt": "`output_parsed` returns the first parsed result, or `None` when
        there is none.

        `output_text` continues to concatenate all output text, including
        commentary."
    - "id": "openai-commentary-issue"
      "kind": "documentation"
      "url": "https://github.com/openai/openai-python/issues/3859"
      "checkedAt": "2026-10-23"
      "snapshot": "case-studies/evidence/openai-commentary-issue-2026-10-23.txt"
      "sha256": "48e37f580ec019a8f01728f3716eb1182fe5df2e34e8bbcf9900d356ab329322"
      "excerpt": "ValidationError: json_invalid

        openai 3.14.0 and 3.8.0; Pydantic 2.13.5"
    - "id": "openai-phase-release"
      "kind": "documentation"
      "url": "https://github.com/openai/openai-python/releases/tag/v3.14.1"
      "checkedAt": "2026-10-23"
      "snapshot": "case-studies/evidence/openai-phase-release-2026-10-23.txt"
      "sha256": "3f740f3613458513633ef36bba0fff67ed7a525aad5630db7ee4561dd6083878"
      "excerpt": "##
        [3.14.1](https://github.com/openai/openai-python/compare/v3.14.0...v3.1\
        4.1) (2026-09-15)

        * **responses:** skip structured parsing for commentary"
    - "id": "openai-phase-pr"
      "kind": "test"
      "url": "https://github.com/openai/openai-python/pull/3861"
      "checkedAt": "2026-10-23"
      "snapshot": "case-studies/evidence/openai-phase-pr-2026-10-23.txt"
      "sha256": "ab6697ea5e77ecbee2f7e8baea56a18f702e634953f2056c31d13f946337a4c3"
      "excerpt": "Parse structured output only for messages with
        `phase=\"final_answer\"` or a missing/null phase."
    - "id": "openai-sdk-interest"
      "kind": "documentation"
      "url": "https://api.github.com/repos/openai/openai-python"
      "checkedAt": "2026-10-23"
      "snapshot": "case-studies/evidence/openai-sdk-interest-2026-10-23.txt"
      "sha256": "2c350e777fb6cd54bcbb0e967f292af265ca8ae6aa16ab353f4b3600d3217782"
      "excerpt": "\"stargazers_count\": 31917

        \"forks_count\": 8058"
  "technicalDetails":
    - "kind": "field"
      "value": "final_answer"
      "evidenceId": "openai-phase-parser"
    - "kind": "field"
      "value": "output_parsed"
      "evidenceId": "openai-phase-helpers"
    - "kind": "error-code"
      "value": "json_invalid"
      "evidenceId": "openai-commentary-issue"
    - "kind": "sdk-version"
      "value": "3.14.1"
      "evidenceId": "openai-phase-release"
  "verification":
    "level": "source-review"
    "note": "Source review on 2026-10-23 of the official SDK fix, documentation,
      release and issue. No OpenAI request or live model test was performed;
      upstream synthetic-test results are attributed to the pull request, not
      reproduced here."
    "evidenceIds":
      - "openai-phase-parser"
      - "openai-phase-helpers"
      - "openai-phase-release"
      - "openai-commentary-issue"
      - "openai-phase-pr"
  "review":
    "author": "차도녀 gpt may"
    "authorType": "Person"
    "checkedAt": "2026-10-23"
    "titleMatchesBody": true
    "distinctProblem": "The request retains its strict schema and final JSON is
      valid. The failure is phase-blind response selection, not dropped
      response_format, stream interruption, background lifecycle or
      server/client tool mixing."
    "noInventedResults": true
---

## Symptoms

A structured-output call can fail with `ValidationError: json_invalid` even when the API returned HTTP 200, `status="completed"`, and a valid final JSON answer. In [issue #3859](https://github.com/openai/openai-python/issues/3859), prose `commentary` before `final_answer` triggered the failure. A separate synthetic control made the commentary valid JSON: the old accessor then silently returned that intermediate value instead of the final answer. The reporter reproduced the SDK behavior with openai 3.8.0 and 3.14.0, using Pydantic 2.13.5.

This matters for typed extraction and agent results, where successful JSON validation alone does not establish that the selected answer is final. Popularity and difficulty have separate evidence: the [official SDK metadata](https://api.github.com/repos/openai/openai-python) showed 31,917 stars and 8,058 forks on 2026-10-23, an interest proxy rather than API usage or market share; the issue supplies the concrete failure. The issue and fix date to September, not a newly observed outage on this review date.

## Cause

The old parser tried each message's `output_text` without considering its `phase`. The `output_parsed` accessor then selected the first parsed item. This could either reject ordinary commentary as invalid JSON or accept schema-valid commentary as the answer. Increasing schema strictness does not repair this response-selection boundary.

[The merged fix](https://github.com/openai/openai-python/pull/3861) passes each message's phase into the [shared parsing function](https://github.com/openai/openai-python/blob/6520df1220a0030c7b45b00a6fa4bf2e9c7396ac/src/openai/lib/_parsing/_responses.py). Explicit phases other than `final_answer` remain unparsed. A missing or null phase preserves legacy behavior; the SDK does not infer a phase from text or model name. This is distinct from [dropping response_format during fallback](../llm-structured-output-fallback-response-format/), which changes the outgoing request.

## Safe resolution

Check the resolved `openai` package version and move to a compatible release containing this fix. The [official 3.14.1 release](https://github.com/openai/openai-python/releases/tag/v3.14.1), published on 2026-09-15, includes it. Do not treat a plan upgrade or repeated model call as the remedy for this SDK parsing bug.

Use `responses.parse(..., text_format=YourModel)` and consume `output_parsed` after parsing succeeds. According to the [SDK helper contract](https://github.com/openai/openai-python/blob/v3.14.1/helpers.md#parsing-responses-api-output), `output_text` still concatenates commentary and final text; parsing that combined string as JSON recreates the wrong boundary. The following application guard requires an already-parsed response from a fixed SDK. It cannot repair a validation error raised earlier by an old parser.

```python
def require_structured_result(response):
    """Accept an already-parsed response from a fixed OpenAI SDK.

    This is an application acceptance guard, not a replacement SDK parser.
    It makes no API call and deliberately never reads response.output_text.
    """
    if response.status != "completed":
        raise ValueError("Response is not completed")
    for item in response.output or []:
        if item.type != "message":
            continue
        if getattr(item, "phase", None) not in (None, "final_answer"):
            continue
        if any(part.type == "refusal" for part in item.content or []):
            raise ValueError("Final response was refused")
    result = response.output_parsed
    if result is None:
        raise ValueError("No structured result; do not fall back to commentary")
    return result
```

Keep invalid final JSON as an error, and distinguish refusal, incomplete response and no structured result. Do not fall back to commentary. The guard above is deliberately stricter than the convenience accessor when an eligible message contains a refusal. When replaying assistant output manually, retain the original items and their phase values as described in the [official phase documentation](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.5#phase-parameter); do not flatten them into one string.

## Verification

Source review on 2026-10-23 of the official SDK fix, documentation, release and issue. No OpenAI request or live model test was performed; upstream synthetic-test results are attributed to the pull request, not reproduced here.

The upstream PR reports synthetic HTTP/SSE coverage of synchronous and asynchronous helpers, including commentary, final answers, refusals and missing phases. These are upstream test reports, not evidence of a live model call in this review.

For a pinned SDK regression check, compare final JSON only, prose commentary followed by final JSON, and schema-valid commentary followed by final JSON. In the last two cases the final object should be selected, never the intermediate object. Include unknown explicit phases, missing/null phase, refusal, no final result, invalid final JSON and incomplete responses as negative or compatibility controls. Run the same controls through both parse and stream paths when the application uses both.

This repository's separate offline example check covers only the guard above with synthetic Python objects. Content/build validation checks the article contract, links and translation; neither check establishes SDK behavior or provider availability.

## Limitations

Only the reported 3.8.0 and 3.14.0 reproductions and the 3.14.1 fix are attributed here. The first affected version, frequency across models, current live occurrence, individual account access and plan conditions were not established. No claim is made that every Astra response emits commentary or that this failure is exclusive to that model.

The SDK preserves no-phase compatibility, so it cannot recover phase information stripped by a proxy. `output_parsed` is the first eligible parsed result, not a guarantee of one unique final object. If the application requires exactly one result, define and test that additional contract. A later release can change other behavior; confirm the installed dependency and repeat the regression controls.

No GetBeta implementation is presented as a fix for this case. See the [OpenAI API profile](../../apis/openai/) for provider context. Search expressions are research candidates, not verified search-volume or ranking claims.
