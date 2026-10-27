---
"title": "Alpaca get_all_assets TXSE validation error: check the SDK enum and release"
"h1": "Alpaca get_all_assets TXSE validation error: check the SDK enum and release"
"description": "Handle Alpaca TXSE asset-list validation failures without
  dropping symbols. Distinguish the merged SDK enum fix from published packages
  and untested raw-response adapters."
"summary": "An unfamiliar exchange value can reject an entire typed asset list.
  Preserve the raw catalog, expose unsupported values and verify the installed
  release instead of treating a closed issue as a shipped fix."
"order": 22
"updatedAt": "2026-10-27"
"tags":
  - "practical-case"
  - "alpaca"
  - "integration"
"caseStudy":
  "slug": "alpaca-py-txse-assetexchange-validation-error"
  "problemId": "alpaca-assets-new-exchange-enum-validation"
  "titleParts":
    "api": "Alpaca get_all_assets"
    "problem": "TXSE validation error"
    "solution": "check the SDK enum and release"
  "linkLabel": "Alpaca get_all_assets TXSE validation error: check the SDK enum and release"
  "providers":
    - "alpaca"
  "searchIntent":
    "primary":
      "term": "Alpaca get_all_assets TXSE validation error"
      "sourcePhrase": "TXSE"
      "evidenceIds":
        - "alpaca-txse-issue"
    "related":
      - "term": "Alpaca list Asset model validation"
        "sourcePhrase": "TypeAdapter"
        "evidenceIds":
          - "alpaca-assets-raw-branch"
      - "term": "Alpaca raw_data asset catalog"
        "sourcePhrase": "self._use_raw_data"
        "evidenceIds":
          - "alpaca-assets-raw-branch"
      - "term": "Alpaca SDK 0.44.0 exchange enum"
        "sourcePhrase": "v0.44.0"
        "evidenceIds":
          - "alpaca-assets-release"
    "status": "keyword-candidate"
  "evidence":
    - "id": "alpaca-assets-raw-branch"
      "kind": "code"
      "url": "https://github.com/alpacahq/alpaca-py/blob/v0.44.0/alpaca/trading/clien\
        t.py"
      "checkedAt": "2026-10-27"
      "snapshot": "case-studies/evidence/alpaca-assets-raw-branch-2026-10-27.txt"
      "sha256": "a0a7a5499fde887a9730b1dff4698d373e2965880d8e1b3a7ac8f42d3fb991f6"
      "excerpt": "if self._use_raw_data:

        \            return response


        \        return TypeAdapter(List[Asset]).validate_python(response)"
    - "id": "alpaca-txse-enum-fix"
      "kind": "code"
      "url": "https://github.com/alpacahq/alpaca-py/blob/b8c670f35ffd86cde56fcf9f67e3\
        2829dfc9221b/alpaca/trading/enums.py"
      "checkedAt": "2026-10-27"
      "snapshot": "case-studies/evidence/alpaca-txse-enum-fix-2026-10-27.txt"
      "sha256": "da2b2cbda20d7177026e418f81d28bd762bde4acd8658da30d82751500db3617"
      "excerpt": "TXSE = \"TXSE\""
    - "id": "alpaca-txse-issue"
      "kind": "documentation"
      "url": "https://github.com/alpacahq/alpaca-py/issues/827"
      "checkedAt": "2026-10-27"
      "snapshot": "case-studies/evidence/alpaca-txse-issue-2026-10-27.txt"
      "sha256": "83273b9bf84cd8dbf433d1778dabf80afc1695f7cc28453befaaad5430dec502"
      "excerpt": "TXSE"
    - "id": "alpaca-assets-release"
      "kind": "documentation"
      "url": "https://github.com/alpacahq/alpaca-py/releases/tag/v0.44.0"
      "checkedAt": "2026-10-27"
      "snapshot": "case-studies/evidence/alpaca-assets-release-2026-10-27.txt"
      "sha256": "a541698eab49dc51faf7f2bf19e50b00c2d1dedfad3f66757349d323d0ea74a7"
      "excerpt": "v0.44.0"
  "technicalDetails":
    - "kind": "field"
      "value": "TXSE"
      "evidenceId": "alpaca-txse-enum-fix"
    - "kind": "sdk-version"
      "value": "v0.44.0"
      "evidenceId": "alpaca-assets-release"
  "verification":
    "level": "source-review"
    "note": "Reviewed official SDK source, the issue, merged fix and release
      metadata on 2026-10-27. No Alpaca SDK execution, authenticated API call or
      order was performed."
    "evidenceIds":
      - "alpaca-assets-raw-branch"
      - "alpaca-txse-enum-fix"
      - "alpaca-txse-issue"
      - "alpaca-assets-release"
  "review":
    "author": "차도녀 gpt may"
    "authorType": "Person"
    "checkedAt": "2026-10-27"
    "titleMatchesBody": true
    "distinctProblem": "alpaca-assets-new-exchange-enum-validation; independent of
      existing pagination, feed entitlement and model-output cases."
    "noInventedResults": true
---

## Symptoms

A catalog query can fail before returning any typed assets when the server includes an exchange unknown to the installed SDK. [Issue #827](https://github.com/alpacahq/alpaca-py/issues/827) reports this on 0.42.2; a separate user reproduced it. This is a Trading Assets read operation, not the SIP/IEX market-data entitlement problem. It is not evidence that every account fails. The [earlier ASCX addition](https://github.com/alpacahq/alpaca-py/pull/625) shows why enum expansion deserves a regression case.

## Cause

In [v0.44.0](https://github.com/alpacahq/alpaca-py/blob/v0.44.0/alpaca/trading/client.py), the asset-list method validates the whole response as a list of Asset models. Its [release enum](https://github.com/alpacahq/alpaca-py/blob/v0.44.0/alpaca/trading/enums.py) lacks TXSE. [PR #826](https://github.com/alpacahq/alpaca-py/pull/826) merged the addition on October 22, and the issue closed on October 27. The latest published GitHub release checked on October 27 remained v0.44.0, dated August 11. A merged fix and a shipped package are different evidence; do not promise that an upgrade to the current latest release fixes this.

## Safe resolution

First inspect the installed version and whether it contains the enum addition. Until a release containing the fix is verified, consider a dedicated read-only raw-response adapter rather than changing a shared typed client. The reviewed get_all_assets/get_asset methods return raw data before model validation when configured to do so, although the constructor documentation still says that option is not implemented. This is a method-specific source observation, not a runtime guarantee.

Keep the returned rows and flag unknown exchanges explicitly. Do not relabel TXSE as another exchange, silently remove symbols or let an unrecognized record trigger an order. This illustrative offline adapter neither fetches data nor imports the SDK:

```python
def inspect_catalog(rows, supported_exchanges):
    if not isinstance(rows, list):
        raise TypeError("Expected an asset-list response")
    unsupported = []
    for index, row in enumerate(rows):
        if not isinstance(row, dict):
            raise TypeError("Expected asset objects")
        if row.get("exchange") not in supported_exchanges:
            unsupported.append(index)
    return {"rows": rows, "unsupported_indexes": unsupported}
```

Supply supported_exchanges from the reviewed installed model contract, not an invented abbreviated list. Preserve downstream type boundaries and show the unsupported count. See [schema consumption](../consume-openapi-specification/) and [market-data selection](../choose-stock-market-data-api/).

## Verification

Reviewed official SDK source, the issue, merged fix and release metadata on 2026-10-27. No Alpaca SDK execution, authenticated API call or order was performed.

Before adoption, compare an all-supported fixture with a mixed supported/TXSE fixture, then an invalid response shape. Check that total row counts are preserved and unsupported values remain visible. These are proposed controls, not executed tests. The upstream mock test accompanying the fix is not a live listing record or this article's test result. Repository static validation validates this article, not the vendor API.

## Limitations

No actual account response, installed-package workaround or fixed production release was tested. The raw option changes return types and must be checked on the exact installed version. A higher market-data subscription is not an evidenced remedy. The existing [Alpaca profile](../../apis/alpaca/) retains its Market Data v2 scope; the separate Assets contract is documented by [Alpaca](https://alpaca.markets/sdks/python/api_reference/trading/assets.html). Search expressions are editorial candidates, not measured query volume. GetBeta has no verified resolution of this specific issue in this review.
