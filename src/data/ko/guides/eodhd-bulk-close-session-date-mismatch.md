---
locale: 'ko'
sourceId: 'eodhd-bulk-close-session-date-mismatch'
sourceRevision: '678ea154b1ca2c29c012d92b6d38c9ba8de09efd26797bb856782e4fc935e44e'
translationReviewedAt: '2026-11-20'
title: "EODHD 일괄 종가 거래일 불일치: 저장 전에 응답 날짜 확인하기"
h1: "EODHD 일괄 종가 거래일 불일치: 저장 전에 응답 날짜 확인하기"
description: "EODHD 일괄 응답의 날짜와 완료된 거래소 세션을 대조한 뒤 보정 전 종가를 저장합니다. GetBeta의 KRX 재확인에서 가격을 저장하지 않은 이유도 살펴봅니다."
summary: "일괄 응답에는 지정한 거래일보다 오래된 종가가 들어올 수 있습니다. 완료 거래일을 고정하고 응답 행의 날짜를 검증하여, 오래됐거나 확인되지 않은 가격은 기록하지 않습니다."
verificationNote: "2026-11-20 소스 검토만 수행했습니다. 공급자 문서와 커밋으로 고정한 GetBeta 코드·재확인 기록을 읽었습니다. 공급자 호출, 예제·테스트 실행, 가격 저장 및 배포 확인은 하지 않았습니다."
linkLabel: "EODHD 일괄 종가: 응답 거래일 일치 여부 확인"
---

## 증상

EODHD 거래소 일괄 요청에 가격 행이 들어 있어도 요청한 정규장 종가가 없을 수 있습니다. 요청 파라미터의 날짜나 다운로드 시각을 그대로 관측 날짜로 쓰면 이전 종가가 새로운 종가로 저장될 수 있습니다.

[GetBeta 재확인 기록 (영문 저장소의 한국어 문서)](https://github.com/firewine/getbeta/blob/11719738cd0a18b64d7d804997b0c4fc134b5ab8/docs/plans/2026-11-06_COLLECTION_RELIABILITY_PHASES.md#L1589-L1601)은 2026-11-19 KRX 종가가 미확보된 172개 종목을 다룹니다. 날짜 지정 일괄 응답, 개별 조회, 기존 일별 가격 이력 모두에서 해당 거래일 일치 건은 0건이었습니다. 개별 조회 분류는 이전 거래일 127개, 응답 없음 14개, 공급자 종목 목록에 없음 31개였습니다. 이 재확인 단계의 금융 데이터 반영 건수는 0건입니다.

## 원인

[EODHD 일괄 API 명세 (영문)](https://eodhd.com/financial-apis/bulk-api-eod-splits-dividends)에 따르면, 과거 휴장일을 요청하면 그 직전 거래일을, 미래 날짜를 요청하면 최근 가용 거래일을 반환할 수 있습니다. 요청에 날짜를 보냈고 응답이 성공했다는 사실만으로 원하는 거래일의 종가가 확인되지는 않습니다. 이 문서의 대체 반환 규칙이 11월 19일 KRX 종가 미확보를 일으켰다고 확인된 것은 아닙니다.

[GetBeta 변경 코드 (영문)](https://github.com/firewine/getbeta/blob/85fb65013df819462126fe3f85d96b1a0fc5876e/scripts/bulk_price_ingestion.py#L563-L600)는 완료된 KRX 거래일과 마감 시각을 고정하고 일괄 조회에 날짜를 보내며, 개별 응답 행의 날짜를 검증에 사용합니다. [날짜·가격 검증 코드 (영문)](https://github.com/firewine/getbeta/blob/85fb65013df819462126fe3f85d96b1a0fc5876e/scripts/bulk_price_ingestion.py#L159-L183)는 누락되거나 형식이 잘못됐거나 기대일과 다른 날짜를 거부하며, 수정 종가 `adjusted_close`가 아니라 보정 전 종가 `close`를 사용합니다.

## 안전한 해결

1. 휴장과 마감 시각 예외를 반영한 거래소 달력으로 **마지막 완료 정규장**을 구합니다. 한 작업 안에서는 그 거래일과 마감 시각을 고정합니다.
2. 일괄 요청에 거래일을 넣되 응답의 `date`를 별도로 검증합니다. 상장 종목 식별 정보와 날짜가 정확히 일치하고 보정 전 `close`가 유한한 양수일 때만 저장 후보로 인정합니다. 누락·이전 거래일·형식 오류를 구분하고, 이전 가격의 날짜를 바꾸거나 다른 가격 종류로 몰래 대체하지 않습니다.
3. 이미 더 최신인 가격을 보존하고, 같은 거래일의 값이 서로 충돌하면 조용히 덮어쓰지 않습니다. [GetBeta 트랜잭션 코드 (영문)](https://github.com/firewine/getbeta/blob/85fb65013df819462126fe3f85d96b1a0fc5876e/scripts/bulk_price_ingestion.py#L278-L303)는 저장 확정 직전에도 거래일을 다시 확인합니다. 그 사이 다음 정규장이 완료되면 이전 거래일 쓰기를 되돌립니다. 개별 복구 경로에도 동일한 수용 기준을 적용합니다.

아래 예제는 종목 식별 정보가 이미 확인됐다고 가정하며 공급자 API 호출이나 저장을 하지 않습니다.

```python
from decimal import Decimal, InvalidOperation


def exact_close(row, expected_session):
    # expected_session은 거래소 달력에서 확인한 완료 거래일이다.
    if row.get("date") != expected_session.isoformat():
        return None
    raw_close = row.get("close")
    if isinstance(raw_close, bool):
        return None
    try:
        close = Decimal(str(raw_close))
    except (InvalidOperation, ValueError):
        return None
    return close if close.is_finite() and close > 0 else None
```

시장별 데이터 점검 기준은 [EODHD 제공자 상세](../../apis/eodhd/)와 [주식 시장 데이터 API 선택 가이드](../choose-stock-market-data-api/)를 참고하세요.

## 검증

2026-11-20 소스 검토만 수행했습니다. 공급자 문서와 커밋으로 고정한 GetBeta 코드·재확인 기록을 읽었습니다. 공급자 호출, 예제·테스트 실행, 가격 저장 및 배포 확인은 하지 않았습니다.

[날짜를 보내는 GetBeta 코드 (영문)](https://github.com/firewine/getbeta/blob/85fb65013df819462126fe3f85d96b1a0fc5876e/scripts/bulk_price_ingestion.py#L305-L322)와 [재확인 기록](https://github.com/firewine/getbeta/blob/11719738cd0a18b64d7d804997b0c4fc134b5ab8/docs/plans/2026-11-06_COLLECTION_RELIABILITY_PHASES.md#L1589-L1601)을 대조했습니다. 이 기록은 당시 운영자 관찰이며 이 가이드에서 직접 실행한 결과가 아닙니다.

오프라인 테스트에서는 기대 거래일과 유효한 종가가 있는 정상 행은 받아들이고, 이전·이후·누락·비정상 형식 날짜 및 잘못된 종가를 거부하는지 확인하세요. 거래일 선택 후 저장 확정 전에 다음 정규장이 완료되는 경우 롤백되는지도 확인하세요. 더 최신인 저장 값은 변경되지 않아야 합니다.

## 한계

검토 범위는 한국 주식의 특정 종가 수집 경로입니다. 172개 종목 재확인 결과로 KRX 전체 종목의 데이터가 없었다거나, EODHD가 한국 종가를 제공하지 않는다거나, 문서의 날짜 대체 규칙이 장애 원인이라고 결론낼 수 없습니다. 공급자 복구, 운영 전체 흐름의 성공, 대체 공급자의 배포도 확인하지 않았습니다. 이 사례는 배당 날짜 커버리지나 배당 캐시 갱신 문제와 별개입니다.
