---
{
  "locale": "ko",
  "sourceId": "yfinance-repair-pence-pound-currency-unit-mismatch",
  "sourceRevision": "50e339eac0c2694296c2fae528238bd370ae7f87298ea2962d4f9aad891b054f",
  "translationReviewedAt": "2026-10-25",
  "title": "yfinance repair=True 가격 단위 오류: 펜스·파운드와 수정 버전 확인",
  "h1": "yfinance repair=True 가격 단위 오류: 펜스·파운드와 수정 버전 확인",
  "description": "yfinance repair=True 이후 가격이 100배 달라질 때 GBp/GBP, 같은 조회의 통화 메타데이터, 1.6.0 수정과 미해결 범위를 확인합니다.",
  "summary": "환율 환산 전 가격 복구 과정에서 호가 단위가 달라졌는지 확인하세요. 배포된 단위 복원 수정과 미병합 후속 작업을 구분하고, 검증한 history 통화로 한 번만 환산합니다.",
  "verificationNote": "2026-10-25에 yfinance 이슈, 병합된 수정, 1.6.0 변경 기록, 1.7.0 코드와 repair 문서를 검토했습니다. Yahoo 요청이나 실제 가격 비교는 수행하지 않았습니다.",
  "linkLabel": "yfinance repair 가격 단위: 환율 환산 전 펜스·파운드 확인"
}
---

## 증상

포트폴리오 수집기가 `repair=True`를 켠 뒤 다른 단위의 가격을 받을 수 있습니다. [이슈 #2866 (영문)](https://github.com/ranaroussi/yfinance/issues/2866)는 yfinance 1.4.1과 XDEV.L에서 Close가 6201에서 62.01로 바뀌고 일부 `Repaired?` 값은 false였다고 보고합니다. 이는 신고자의 관측이며 API Atlas가 실제 호출로 재현한 결과가 아닙니다. 여기에 펜스→파운드 변환을 한 번 더 적용하면 환율 계산 이전부터 금액이 틀어집니다.

인기도와 연동 난이도의 근거는 별개입니다. [프로젝트 저장소 (영문)](https://github.com/ranaroussi/yfinance)는 2026-10-25 확인 당시 약 25.6k stars·3.5k forks를 표시했습니다. 관심도 지표일 뿐 API 이용자 수는 아닙니다. 구체적인 난관은 위 단위 불일치 이슈와 후속 복구 논의가 뒷받침합니다.

## 원인

배당 복구를 위한 내부 통화 단위 표준화가 반환 가격과 메타데이터에 남았습니다. 2026-07-27 병합된 [PR #2907 (영문)](https://github.com/ranaroussi/yfinance/pull/2907)은 원래 호가 단위를 복원합니다. [1.6.0 변경 기록 (영문)](https://github.com/ranaroussi/yfinance/blob/1.6.0/CHANGELOG.rst)에 수정이 기재돼 있고, [1.7.0 코드 (영문)](https://github.com/ranaroussi/yfinance/blob/1.7.0/yfinance/scrapers/history.py)에도 내부 변환이 있었을 때 가격·배당·통화 메타데이터를 되돌리는 로직이 있습니다.

모든 100배 차이가 이 원인이라고 단정하면 안 됩니다. 별도의 [부분 구간 보고 #2924 (영문)](https://github.com/ranaroussi/yfinance/issues/2924)는 합성 데이터 재현이며, 복합 상태가 발생한 실제 종목을 입증하지 않습니다. 이슈는 닫혔지만 연결된 [PR #2927 (영문)](https://github.com/ranaroussi/yfinance/pull/2927)은 확인 당시 열려 있고 미병합 상태입니다. 이슈 종료만으로 수정 릴리스가 나왔다고 볼 수 없습니다.

## 안전한 해결

설치 버전, 종목, 날짜, 간격, `repair`와 `auto_adjust`를 기록합니다. 수정이 포함된 호환 버전을 사용하되 모든 단위 문제가 해결됐다고 가정하지 말고 회귀검사를 유지하세요. 가격은 같은 history 조회 직후의 `Ticker.history_metadata['currency']`와 묶어서 보관합니다. [공식 repair 문서 (영문)](https://ranaroussi.github.io/yfinance/advanced/price_repair.html)는 이를 `Ticker.info`와 구분합니다.

호가 단위를 확인한 뒤 파운드로 정규화하세요. 아래 오프라인 함수는 명시적인 단위 변환 경계만 보여줍니다. 혼합 단위 행을 고치거나 공급자 메타데이터의 정확성을 검증하거나 데이터를 조회하지 않습니다. 정규화 전 원래 값과 단위도 보관하세요. 무조건 100을 곱하거나 나누지 말고, 반환된 GBP 값에 펜스 변환을 다시 적용하지 않습니다.

```python
from decimal import Decimal

def quotation_to_gbp(value, history_currency):
    """Normalize an already retrieved, unit-verified value; no network call."""
    factors = {"GBp": Decimal("0.01"), "GBX": Decimal("0.01"),
               "GBP": Decimal("1")}
    if history_currency not in factors:
        raise ValueError("Unknown quotation unit; inspect source metadata")
    amount = Decimal(str(value))
    if not amount.is_finite():
        raise ValueError("Non-finite price")
    return amount * factors[history_currency]
```

배당도 환율 변환 전에 같은 단위 판단이 필요합니다. `Repaired?=False`가 모든 값의 불변을 보장하지는 않습니다. 문서는 `Adj Close`만 고치는 경우 표시가 바뀌지 않을 수 있다고 설명합니다. 열 선택과 가격 조정 의미는 별도 문제이므로 [yfinance Adj Close·MultiIndex 사례](../yfinance-adj-close-auto-adjust-multiindex/)를 함께 보세요.

## 검증

2026-10-25에 yfinance 이슈, 병합된 수정, 1.6.0 변경 기록, 1.7.0 코드와 repair 문서를 검토했습니다. Yahoo 요청이나 실제 가격 비교는 수행하지 않았습니다.

저장된 데이터로 펜스 단위가 일관된 시계열, 이미 파운드인 시계열, 통화 누락, 실제 혼합 단위 구간을 대조하세요. 첫 두 경우는 정확히 한 번만 정규화되고 통화 누락은 추측 대신 실패해야 합니다. 혼합 단위 구간은 상위 데이터 문제를 조사해야 하며 단일 값 함수로 복구했다고 처리하면 안 됩니다. 배당·환율 경계도 포함하고 버전·옵션·메타데이터를 기록에 남기세요.

저장소의 오프라인 예제 검사는 합성 값으로 위 함수만 검사합니다. 동등한 GBp/GBP 금액, 알 수 없는 단위, 유한하지 않은 값을 포함합니다. yfinance 실행 시험, Yahoo 가격 정확성 검사나 운영 검증이 아닙니다.

## 한계

최초 영향 버전, 모든 영향 종목, 현재 실제 호출에서의 재현 여부는 확인하지 않았습니다. 부분 구간 후속 수정을 배포된 해결책으로 주장하지 않습니다. 클라이언트 결함이며 데이터 요금제를 올리면 해결된다는 근거도 없습니다.

yfinance는 비공식 Yahoo 클라이언트이지 공식 Yahoo SDK가 아닙니다. [프로젝트 안내 (영문)](https://ranaroussi.github.io/yfinance/)는 Yahoo와의 관계와 데이터 이용 조건을 구분합니다. 무료 라이브러리라는 사실이 상업적 데이터 사용권을 입증하지 않으며 계정 권한·상업적 사용 허가는 검증하지 않았습니다.

직접 대응하는 GetBeta 수정이나 운영 시험 근거는 확인하지 못했습니다. [yfinance 공급자 소개 (영문)](../../../apis/yfinance/)와 [시장 데이터 API 선택 가이드](../choose-stock-market-data-api/)를 참고하세요. 기존 조정 가격 열 안내와 달리 이번 사례는 repair부터 환율 환산까지 호가 단위를 추적한다는 점이 추가 가치입니다. 검색 표현은 후보이며 검색량·순위를 검증한 주장이 아닙니다.
