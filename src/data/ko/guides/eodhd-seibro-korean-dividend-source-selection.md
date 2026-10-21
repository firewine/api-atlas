---
locale: 'ko'
sourceId: 'eodhd-seibro-korean-dividend-source-selection'
sourceRevision: '62ee0348424be85093c9258d915fe8679b4ad4a338b8408f4a58d32af527f0aa'
translationReviewedAt: '2026-10-21'
title: "EODHD 한국 배당 지급일 누락: SEIBRO와 시장별로 분리 수집하기"
h1: "EODHD 한국 배당 지급일 누락: SEIBRO와 시장별로 분리 수집하기"
description: "EODHD 한국 종목의 기준일·지급일 누락에 대응해 한국 주식·ETF 현금 배당은 SEIBRO에서, 미국 배당은 EODHD에서 수집하는 사례와 소스 검토의 한계를 설명합니다."
summary: "EODHD 지원 답변은 한국 .KO 종목의 배당락일과 금액은 제공되지만 선언일·기준일·지급일은 공급받지 못하는 범위 제한을 설명합니다. 검토한 GetBeta 사례는 한국 배당을 확인된 SEIBRO 이벤트에서 수집하고 미국 배당은 EODHD에 유지하며, 서로 다른 출처의 필드를 임의로 이어 붙이지 않습니다."
verificationNote: "2026-10-20의 소스 검토 범위는 공개가 승인된 2026-09-28 EODHD 지원 답변 발췌, 공급자 필드 문서, GetBeta 커밋 c4d29bbb입니다. 공급자 요청, 원본 GetBeta 테스트 스위트 실행, 데이터베이스 백필, 배포는 수행하지 않았습니다."
linkLabel: "EODHD 한국 배당 날짜 누락: SEIBRO와 상장시장별 수집 분리"
---

## 증상

EODHD의 `.KO` 배당 행에는 배당락일과 금액이 있어도 선언일·기준일·지급일이 없을 수 있습니다. 수익률, 배당 권리, 현금 지급일을 처리하는 파이프라인이 이런 `null` 필드를 완전한 데이터로 취급하면 데이터의 신뢰 수준을 실제보다 높게 표시하게 됩니다.

[공개가 승인된 2026-09-28 EODHD 지원 답변 발췌 (영문)](https://github.com/firewine/api-atlas/blob/main/case-studies/evidence/eodhd-korea-support-2026-09-28.md)에서 지원팀은 이를 한국 주식·ETF의 제공 범위 제한으로 설명했습니다. 상위 데이터 공급자가 세 날짜를 제공하지 않아 생긴 제한이며, 실행 중 발생한 결함이라는 설명은 아닙니다. EODHD의 [배당 필드 문서 (영문)](https://eodhd.com/financial-apis/api-splits-dividends)는 `date`를 배당락일로 정의하고 `recordDate`와 `paymentDate`가 `null`일 수 있음을 명시합니다. 이 답변은 당시 `.KO` 피드의 상태를 설명하며 한국 배당 금액 전체가 부정확하다는 근거가 되지는 않습니다.

## 원인

이번 문제는 필드 누락과 수집 출처 선택에 관한 것으로, [이전 EODHD 업데이트 지연·캐시 사례 (영문)](../../../guides/eodhd-dividend-delay-cache-refresh/)와 구별됩니다. 검토한 [GetBeta 출처 정책 (영문)](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/app/services/dividend_source_policy.py)은 통화나 종목 코드의 모양 대신 종목 카탈로그의 상장시장을 사용합니다. 한국에 상장된 `STOCK`과 `ETF`의 활성 배당 데이터는 SEIBRO에서 가져옵니다. 과거 EODHD 한국 배당 행은 감사 가능한 상태로 남기되 날짜 선택, 건수 제한, 합계 계산 전에 제외합니다.

[EODHD 클라이언트의 차단 로직 (영문)](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/app/services/eodhd_api_client.py)은 `KO/KQ/KS/ETF_KR` 배당 요청을 `EODHD_KR_DIVIDENDS_NOT_ALLOWED`로 거부합니다. 기존 미국 배당 경로는 EODHD를 계속 사용하며, 가격·환율 수집은 별도 경로입니다. 이는 상장시장별로 수집 출처를 나누는 정책이며, 서로 경쟁하는 배당 행의 필드를 하나씩 합치거나 다른 출처로 대체하는 방식이 아닙니다.

## 안전한 해결

1. 기준이 되는 상장 종목 카탈로그로 각 증권을 분류합니다. 한국 상장 `STOCK`·`ETF`의 현금 배당은 SEIBRO 이벤트를 수집하고, 검토한 미국 배당 경로는 EODHD를 유지합니다. 각 관측값에 출처, 수집 시각, 종목 식별 정보, 원본 근거를 보존하세요. 보관 중인 EODHD 한국 배당 행의 출처를 SEIBRO로 바꾸거나, 날짜가 가까운 SEIBRO 행에서 값을 가져와 빈 날짜를 채우지 마세요.
2. SEIBRO 이벤트를 재무 계산에 반영하기 전에 확인합니다. 검토한 [ETF 수집기 (영문)](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/app/services/seibro_dividend_collection_service.py)는 전체 ISIN을 연결하고 `RGT_STD_DT`를 기준일, `TH1_PAY_TERM_BEGIN_DT`를 지급일, `ESTM_STDPRC`를 KRW 금액으로 사용합니다. `청산분배`는 반복적인 주당 배당금(DPS)에서 제외합니다. 검토한 [주식 수집 소스 (영문)](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/app/services/seibro_stock_dividend_source.py)는 `SHOTN_ISIN`을 전체 ISIN이 아닌 단축 코드로 취급하고, 발행사와 주식 종류를 확인하며, 세 가지 권리 응답으로 현금 배당 사실을 교차 확인합니다. 두 수집기 모두 추정한 배당락일을 기록하지 않습니다. 새 SEIBRO 행은 명시적으로 `ex_date=None`을 사용합니다. 별도의 [읽기 전용 배당 권리 계산 (영문)](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/app/services/dividend_entitlement.py)은 검토한 KRX 달력으로 뒷받침되는 경우 수급 자격 판단용 날짜를 도출할 수 있습니다.
3. 정렬, 건수 제한, 날짜 최솟값·최댓값, 합계를 적용하기 전에 상장시장과 출처로 활성 행을 선택합니다. 누락되거나 모호한 이벤트, 비현금 이벤트, 서로 충돌하는 이벤트는 검토를 위해 보류하세요. [주식 배당 정정 보호 로직 (영문)](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/app/services/seibro_stock_dividend_collection_service.py)은 출처 간 정정이나 과거 배당락일 정정에 명시적인 연결 근거를 요구합니다. 최근 목록에 없다는 이유만으로 과거 이벤트를 삭제하지 않습니다.

아래 축약 Python 예제는 읽기 경로의 경계를 보여줍니다. 이미 수집된 행을 입력으로 받으며 공급자 요청이나 데이터베이스 쓰기를 수행하지 않습니다.

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

## 검증

2026-10-20의 소스 검토 범위는 공개가 승인된 2026-09-28 EODHD 지원 답변 발췌, 공급자 필드 문서, GetBeta 커밋 c4d29bbb입니다. 공급자 요청, 원본 GetBeta 테스트 스위트 실행, 데이터베이스 백필, 배포는 수행하지 않았습니다.

로컬 계약 검사에서는 축약 선택기에 한국 SEIBRO 이벤트와 보관된 EODHD 한국 이벤트를 함께 입력하고, SEIBRO 이벤트만 후속 날짜 처리와 합계 계산에 도달하는지 확인해야 합니다. 실패 대조군에서는 기준일·지급일이 없는 SEIBRO 행을 보류하고, 지원하지 않는 시장을 거부하며, 같은 날짜의 출처 간 중복을 필드 병합 없이 감지해야 합니다. 실제 수집기를 검증할 때는 ETF의 전체 ISIN 또는 주식의 발행사·단축 코드·주식 종류, 권리 응답 확인, 동일 출처 수정본의 수집 시각 우선순위, 저장된 출처 정보를 확인하세요.

검토한 [스케줄러 소스 (영문)](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/scripts/scheduler_runner.py)는 가격 갱신, SEIBRO, EODHD 미국 배당, 예정 배당(`upcoming`), 모델 기반 배당(`modeled`) 순서로 단계를 배치합니다. SEIBRO가 실패하면 예정 한국 SEIBRO 단계는 실행되지 않으며, 다른 단계의 결과는 별도로 처리합니다. 복구에는 기본값이 `dry-run`인 [월별 백필 명령 (영문)](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/scripts/backfill_kr_dividends_seibro.py)을 사용합니다. `--apply`를 지정하면 쓰기가 수행되고, 재개하려면 `--resume`을 명시해야 합니다. 재실행 전에는 [실행 기록 상태 (영문)](https://github.com/firewine/getbeta/blob/c4d29bbb49c9e1a30c782430e5028b595860a26b/scripts/seibro_backfill_state.py)를 확인하세요. `complete/partial`은 종료 상태이며, 데이터베이스와 JSON 기록은 원자적으로 함께 반영되지 않으므로 `running/unknown`은 조사가 필요합니다. 이 소스 관찰만으로 전체 과거 기간의 백필이 완료되었다고 판단할 수는 없습니다.

## 한계

지원 답변은 날짜가 명시되고 사용자가 공개를 승인한 텍스트 발췌이며, 공개 EODHD API 계약이나 실제 피드 시험 결과가 아닙니다. EODHD의 제공 범위는 이후 바뀔 수 있습니다. SEIBRO 브라우저 서비스의 필드와 접근 조건은 각 배포 환경에서 별도로 확인해야 합니다. [SEIBRO 개요](../../apis/seibro/)와 [EODHD 개요](../../apis/eodhd/)를 참고하세요.

[과거 SEIBRO 수집 범위·건수 검증 사례](../seibro-dividend-pagination-count-mismatch/)는 이전 GetBeta 코드에 고정되어 있습니다. 이번에 검토한 더 새로운 주식 어댑터는 표시된 총건수가 실제보다 많더라도, 수신한 행 바로 다음부터 표시된 나머지 범위가 모두 정상적인 빈 응답이고 재조회한 총건수가 같을 때만 확인된 이벤트를 유지할 수 있습니다. 중간 구간 누락, 총건수 변동, 잘못된 응답 형식은 여전히 실패로 처리합니다. 이 동작은 전체 과거 이력이나 최근 12개월(TTM)의 완전성을 인증하지 않습니다.

여기서는 실제 SEIBRO·EODHD 호출, 유료 API 사용, 운영 수집, 백필 완료, 배포를 검증하지 않았습니다. 소스 저장소 링크에는 접근 권한이 필요할 수 있습니다. 검색 표현은 후보이며 검색량, 색인, 순위 결과를 주장하지 않습니다.
