---
locale: 'ko'
sourceId: 'seibro-dividend-pagination-count-mismatch'
sourceRevision: 'f6e533b2f39686c36699bd2f4cea2b913189a658cca9ad8db1ea4e41944ca478'
translationReviewedAt: '2026-10-21'
title: "SEIBRO 세이브로 배당금 가져오기: 수집 범위와 건수 검증"
h1: "SEIBRO 세이브로 배당금 가져오기: 수집 범위와 건수 검증"
description: "SEIBRO 세이브로 배당 수집에서 LIST_CNT와 행 범위 START_PAGE·END_PAGE를 대조하고 중복, 마지막 빈 구간, 건수 변동을 검사하는 방법과 합성 테스트의 한계를 설명합니다."
summary: "세이브로에서 마지막 데이터 구간까지 받았다는 사실만으로 배당 수집이 완전하다고 판단할 수 없습니다. 처음 조회한 건수를 고정하고, 각 행 범위와 중복을 검사하며, 마지막 빈 구간과 재조회한 건수까지 확인한 뒤 배당 사실을 확정해야 합니다."
verificationNote: "합성 입력을 사용한 Python 예제는 2026-10-16에 검사했습니다. 원본 애플리케이션 테스트와 실제 공급자 API 호출은 수행하지 않았습니다."
linkLabel: "SEIBRO 세이브로 배당금 가져오기: 행 범위와 수집 건수 검증"
---

## 증상

배당 목록을 끝까지 순회했더라도 건수 응답과 실제로 모은 행 수가 다를 수 있습니다. 검토한 SEIBRO 주식 어댑터는 이를 불완전한 관측으로 처리하며 누락된 이벤트를 만들어 채우지 않습니다. `LIST_CNT`는 건수 응답의 값입니다. `START_PAGE`와 `END_PAGE`는 양 끝을 포함하는 요청 행 범위를 나타냅니다. 이 이름들은 검토한 웹사이트 내부 서비스 연동에서 나온 것으로, 새로 검증된 공식 Open API나 공개 REST 명세를 뜻하지 않습니다. 당시 애플리케이션 의존성에는 `httpx==0.28.1`이 고정되어 있습니다.

확인하지 못한 배당금이나 날짜가 `null`인 상태를 배당금 `0`으로 바꾸어서는 안 됩니다. 수집 실패·누락과 확인된 배당 없음은 구별해야 합니다. 기준일·배당락일·지급일의 차이는 [GetBeta의 지급일과 배당락일 설명](https://getbeta.app/learn/payment-vs-ex-date)에서 함께 살펴볼 수 있습니다.

## 원인

수집이 너무 일찍 끝나거나, 앞 구간과 겹치는 응답을 다시 받거나, 예상보다 짧은 구간을 받아들이거나, 처음 건수를 조회한 뒤 데이터가 바뀌면 불일치가 생길 수 있습니다. 원문 근거만으로 과거 모든 불일치의 상위 원인을 확정할 수는 없습니다.

검토한 [GetBeta SEIBRO 수집 코드 (영문)](https://github.com/firewine/getbeta/blob/890c2531b76c2fad834da80c58ac166908afdde1/app/services/seibro_stock_dividend_source.py)는 `divStatInfoListCnt` 동작으로 `LIST_CNT`를 조회하고, `divStatInfoPList` 동작으로 행을 가져옵니다. 요청값은 `START_PAGE = offset + 1`, `END_PAGE = offset + PAGE_SIZE`입니다. 필드명에 PAGE가 들어가지만 일반적인 페이지 번호로 해석하면 안 됩니다. 실제 코드가 보내는 값은 포함 경계의 행 번호입니다.

어댑터는 각 구간의 예상 행 수, 원본 행 중복, 처음 고정한 총건수 너머의 종료 구간, 두 번째 건수 응답을 확인합니다. `stock_page_coverage_mismatch`는 이 검사를 위해 애플리케이션이 정의한 오류이며 SEIBRO의 HTTP 오류 코드가 아닙니다.

## 안전한 해결

아래 축약 수집기는 외부에서 전달한 건수 함수와 구간 조회 함수로 수집 범위 검사를 모델링합니다. 기본 구간 크기 500행은 검토한 어댑터를 따른 값이며 새로 확인한 서비스 할당량이 아닙니다. 각 행의 딕셔너리는 전송·파싱 경계에서 이미 검증한 단순 값 필드를 담고 있다고 가정합니다. 이 예제에는 인증 정보나 실제 네트워크 호출이 없습니다.

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

## 검증

합성 입력을 사용한 Python 예제는 2026-10-16에 검사했습니다. 원본 애플리케이션 테스트와 실제 공급자 API 호출은 수행하지 않았습니다.

서로 다른 합성 행 501개를 사용해 `1–500`, `501–1000`, 빈 종료 구간인 `1001–1500`을 요청하고 건수 함수를 두 번 호출하는지 확인합니다. 실패 입력에는 첫 구간의 행 수 부족, 두 번째 구간의 중복, 종료 구간의 비어 있지 않은 응답, 두 번째 건수의 변경을 포함합니다. 모두 재무 사실 확정이나 저장 단계에 도달하기 전에 오류를 내야 합니다. 일부 행을 완전한 결과로 취급하지 말고 원래 수집 대상 기간을 조사할 수 있도록 남겨두세요.

저장소의 검사는 공개된 Python 코드 블록을 추출해 같은 합성 경계 사례를 실행합니다. 재검사 명령은 `npm test`입니다. 이 실행 기록은 실제 SEIBRO에서 배당금을 모두 가져왔다는 증거가 아닙니다.

## 한계

건수가 같아도 각 행이 올바른 배당 사실인지, 수집 중 원천 데이터가 바뀌지 않았는지까지 증명되지는 않습니다. 운영 어댑터에는 요청 구간·바이트·시간의 상한, 발행사와 주식 종류 식별, 현금 배당 상태 확인, 금액과 지급일 교차 검사가 여전히 필요합니다. 검토한 연동의 `SHOTN_ISIN`은 전체 ISIN이 아닌 단축 증권 코드입니다. 이 사례는 과거 원천 데이터 불일치가 복구되었거나 기간을 나누어 수집하면 이미 복구가 끝났다는 주장이 아닙니다.

[SEIBRO 개요](../../apis/seibro/)에서 연구 상태와 접근 계약의 미확인 사항을 확인하세요. 일반적인 순회 방식은 [REST 페이지 처리 가이드 (영문)](../../../guides/rest-pagination-patterns/)에서 다룹니다. 웹사이트 내부 서비스의 사용 허용 범위·인증·요청 조건은 별도 확인 대상입니다.

구현 근거는 GetBeta 리비전 `890c2531b76c`에 고정해 검토했습니다. 소스 저장소 링크에는 접근 권한이 필요할 수 있습니다. 위 공개 코드는 인증 정보와 고객 데이터를 포함하지 않는 축약 예제입니다. 검색 표현은 후보이며 검색량·색인·순위 결과를 주장하지 않습니다.

원문의 2026-10-20 편집 보완: 위의 엄격한 건수 규칙은 고정된 과거 어댑터를 설명합니다. [이후 EODHD·SEIBRO 출처 선택 사례](../eodhd-seibro-korean-dividend-source-selection/)는 표시된 건수가 실제보다 많더라도 그 값이 안정적이고 나머지 구간이 모두 정상적인 빈 응답임을 확인한 경우에 한정하는, 검토된 주식 어댑터의 예외를 설명합니다. 그 예외 역시 전체 과거 이력의 완전성을 인증하지 않습니다.
