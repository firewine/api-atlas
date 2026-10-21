---
locale: 'ko'
sourceId: 'ecos-usd-currency-identity-validation'
sourceRevision: '33f5fdde18d242d5c2be2ad4f485b7b7112d3ca54fa60c621618b7de3d1b47ba'
translationReviewedAt: '2026-10-21'
title: "ECOS 환율 API: 통화 식별 검증으로 USD/KRW 오인 방지하기"
h1: "ECOS 환율 API: 통화 식별 검증으로 USD/KRW 오인 방지하기"
description: "ECOS 731Y001 응답의 첫 행을 USD/KRW로 오인하지 않도록 통화 코드와 이름을 함께 검증하고 누락·중복·잘못된 값을 거부하는 Python 예제와 합성 검증 범위를 설명합니다."
summary: "ECOS 응답이 정상 JSON이고 값이 숫자여도 다른 통화의 환율일 수 있습니다. USD 항목을 명시적으로 선택하고 식별 정보를 검증하세요. 원하는 통화가 없을 때 첫 번째 숫자 행을 대체값으로 사용해서는 안 됩니다."
verificationNote: "합성 입력을 사용한 Python 예제는 2026-10-16에 검사했습니다. 원본 애플리케이션 테스트와 실제 공급자 API 호출은 수행하지 않았습니다."
linkLabel: "BOK ECOS 환율 API: USD/KRW 통화 코드·이름 검증 사례"
---

## 증상

응답은 정상 JSON이고 `DATA_VALUE`도 숫자지만 저장한 환율은 다른 통화의 값일 수 있습니다. 검토한 기존 ECOS 파서는 `ITEM_NAME1` 또는 `ITEM_NAME2`에서 USD에 해당하는 이름을 찾지만, 일치하는 행이 없으면 첫 행을 사용하는 호환성 대체 경로도 남아 있습니다. 이 경로가 남아 있다는 점 때문에 모든 애플리케이션 경로가 수정되었다고 말할 수는 없습니다.

고정된 애플리케이션 의존성에는 `httpx==0.28.1`이 포함됩니다. 아래 예제는 Python의 `decimal` 모듈만 사용합니다.

## 원인

통계표가 `731Y001`이라는 사실만으로 반환된 모든 행이 USD/KRW라고 판단할 수는 없습니다. 별도로 검토한 수집 경로는 `731Y001/D/.../0000001`을 요청하지만, 범용 파서는 실제로 받은 항목이 무엇인지도 확인해야 합니다. 행의 위치나 그럴듯한 숫자는 통화 식별 정보가 아닙니다. 현재 통계표와 항목의 정의는 [ECOS 공식 서비스](https://ecos.bok.or.kr/api/)를 기준으로 확인해야 합니다.

## 안전한 해결

아래 축약 파서는 예상 항목 코드와 그에 맞는 USD 이름을 함께 요구하고, 일치하는 행이 없거나 여러 개면 거부하며, 원래 값 문자열을 `Decimal`로 읽습니다. `ITEM_CODE1`을 반드시 요구하는 것은 더 엄격하게 정한 애플리케이션 계약입니다. 실제 요청할 엔드포인트의 응답 스키마를 확인한 뒤 적용하세요.

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

## 검증

합성 입력을 사용한 Python 예제는 2026-10-16에 검사했습니다. 원본 애플리케이션 테스트와 실제 공급자 API 호출은 수행하지 않았습니다.

USD가 아닌 행을 USD 행보다 앞에 놓고 선택한 값이 행 순서에 따라 달라지지 않는지 확인합니다. EUR만 있는 응답, USD가 두 번 일치하는 응답, 호주달러 항목, 유한하지 않은 값·0·잘못된 형식, 이미 `float`로 변환된 값도 시험하세요. 잘못된 입력은 첫 번째 숫자를 반환하는 대신 모두 실패해야 합니다. 테스트 데이터의 금액은 전부 합성값이며 시장 관측값이 아닙니다.

저장소의 검사는 공개된 Python 코드 블록을 추출해 같은 합성 경계 사례를 실행합니다. 재검사 명령은 `npm test`입니다.

## 한계

이 코드는 제안된 엄격한 경계를 보여주는 예제입니다. 배포된 애플리케이션의 모든 경로에서 기존 첫 행 대체 로직이 제거되었다는 뜻은 아닙니다. 관측일, 요청 기간, 단위, 저장 시 출처 정보는 따로 검증해야 합니다. ECOS 통계표에 따라 항목 필드가 다를 수 있으므로 관련 없는 표에 `0000001`을 그대로 적용하지 마세요.

저장소 소스 링크에는 접근 권한이 필요할 수 있으며, 인증된 ECOS 요청이나 원본 애플리케이션 테스트는 실행하지 않았습니다. [BOK ECOS 개요](../../apis/bok-ecos/)에서 통계표·항목 탐색 흐름을 확인하세요.

구현 근거는 GetBeta 리비전 `890c2531b76c`에 고정해 검토했습니다. 위 공개 코드는 인증 정보와 고객 데이터를 포함하지 않는 축약 예제입니다. 검색 표현은 후보이며 검색량·색인·순위 결과를 주장하지 않습니다.
