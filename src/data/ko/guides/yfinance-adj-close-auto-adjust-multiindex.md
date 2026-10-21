---
locale: 'ko'
sourceId: 'yfinance-adj-close-auto-adjust-multiindex'
sourceRevision: 'b5f444ea17d0b29d2cd5c940e5505c435082585335c10ab69feac48e82a953dd'
translationReviewedAt: '2026-10-21'
title: "yfinance Adj Close가 없을 때: auto_adjust와 MultiIndex 처리"
h1: "yfinance Adj Close가 없을 때: auto_adjust와 MultiIndex 처리"
description: "yfinance에서 Adj Close가 없거나 단일 종목도 MultiIndex로 반환될 때 확인할 auto_adjust·multi_level_index 설정과 가격 의미, 컬럼 검증 방법을 설명합니다."
summary: "Adj Close 누락과 예상하지 못한 튜플 컬럼은 모두 yf.download의 기본 설정에서 비롯될 수 있습니다. 가격 시계열을 읽기 전에 조정 옵션과 컬럼 구조를 명시하고, 단일·복수 종목의 반환 형태를 각각 확인하세요."
verificationNote: "2026-10-20의 소스 검토 범위는 yfinance 1.7.0 소스, 프로젝트 문서, 이슈 보고입니다. Yahoo 가격 요청이나 실제 데이터 비교는 수행하지 않았습니다."
linkLabel: "yfinance Adj Close 누락: auto_adjust와 MultiIndex 컬럼 확인"
---

## 증상

`yf.download()`에서 `Adj Close`를 기대하는 파이프라인은 `Close`가 있어도 컬럼 조회에 실패할 수 있습니다. 별개로, 단일 종목을 내려받았는데 컬럼이 `MultiIndex`라서 조회에 실패할 수도 있습니다. [컬럼 누락 보고 (영문)](https://github.com/ranaroussi/yfinance/issues/2308)와 [단일 종목 컬럼 보고 (영문)](https://github.com/ranaroussi/yfinance/issues/2193)는 이런 증상을 설명합니다. 이 보고들이 2026-10-18에 새로운 실행 결함이 생겼다는 사실을 입증하는 것은 아닙니다.

## 원인

검토한 [1.7.0 다운로드 소스 (영문)](https://github.com/ranaroussi/yfinance/blob/1.7.0/yfinance/multi.py)의 기본값은 `auto_adjust=True`와 `multi_level_index=True`입니다. [가격 조정 문서 (영문)](https://ranaroussi.github.io/yfinance/advanced/price_adjustment.html)에 따르면 `auto_adjust=False`는 이미 주식 분할이 반영된 Yahoo OHLC와 배당까지 반영한 `Adj Close`를 반환합니다. 따라서 이 설정을 완전히 무보정인 원시 가격을 받는 방법으로 해석하면 안 됩니다.

`auto_adjust=True`에서는 모든 OHLC 필드에 분할과 배당이 반영됩니다. 이때 `Close`가 조정 종가이며 별도의 `Adj Close`는 나타나지 않습니다. [조정 헬퍼 소스 (영문)](https://github.com/ranaroussi/yfinance/blob/1.7.0/yfinance/utils.py)에서 컬럼명 변경을 확인할 수 있습니다.

가격 조정과 별개로 `multi_level_index=False`는 종목이 정확히 하나일 때만 종목 레벨을 제거합니다. 여러 종목이면 종목 레벨이 유지되므로 가격 필드와 종목 코드를 함께 선택해야 합니다. [2026-10-18 문서 커밋 (영문)](https://github.com/ranaroussi/yfinance/commit/2081dca0b224512ff768f9c5e6bd9c658a3b8339)은 가격 의미를 명확히 설명한 변경이며, 기본값이 처음 바뀐 시점을 입증하지는 않습니다.

## 안전한 해결

컬럼을 선택하기 전에 필요한 가격의 의미를 정하세요. 배당 조정 종가를 별도 `Adj Close`로 받으려면 `auto_adjust=False`를 명시합니다. 조정 OHLC를 사용하려면 `auto_adjust=True`를 설정하고 `Close`를 읽습니다. 단일 종목의 평면 컬럼에는 `multi_level_index=False`를 사용하고, 여러 종목에서는 종목 레벨을 유지하세요.

수집 계약에 패키지 버전, 종목 코드, 조회 간격, 두 옵션, 필드의 의미를 기록합니다. 독자가 아래 호출을 실행하면 네트워크 접근이 필요합니다. 이 검토에서는 호출을 실행하지 않았습니다.

```python
import yfinance as yf
from importlib.metadata import version

print("yfinance", version("yfinance"))

raw = yf.download(
    "AAPL", period="1y", auto_adjust=False,
    multi_level_index=False, progress=False,
)
if raw.empty or "Adj Close" not in raw.columns:
    raise ValueError("Expected a nonempty single-ticker Adj Close series")
adj_close = raw["Adj Close"]

adjusted = yf.download(
    "AAPL", period="1y", auto_adjust=True,
    multi_level_index=False, progress=False,
)
if adjusted.empty or "Close" not in adjusted.columns or "Adj Close" in adjusted.columns:
    raise ValueError("Unexpected adjusted-price schema")
adjusted_close = adjusted["Close"]

many = yf.download(
    ["AAPL", "MSFT"], period="1y", auto_adjust=False,
    multi_level_index=True, group_by="column", progress=False,
)
if many.empty or ("Adj Close", "AAPL") not in many.columns:
    raise ValueError("Unexpected multi-ticker schema")
apple_adj_close = many["Adj Close"]["AAPL"]
```

## 검증

2026-10-20의 소스 검토 범위는 yfinance 1.7.0 소스, 프로젝트 문서, 이슈 보고입니다. Yahoo 가격 요청이나 실제 데이터 비교는 수행하지 않았습니다.

로컬 형태 검사에는 두 조정 모드와 단일·복수 종목을 각각 나타내는, 비어 있지 않은 저장된 테스트 데이터를 사용하세요. 잘못된 필드를 선택하는 실패 대조군을 포함해 예상 필드와 인덱스 레벨을 확인합니다. 실제 피드의 수용 시험에서는 알려진 분할일·배당일을 비교하고 관측값, 패키지 버전, 옵션, 타임스탬프를 보관해야 합니다. 분할과 배당이 모두 없는 기간만으로는 조정 의미를 확인할 수 없습니다. 저장된 데이터로 수행한 형태 검사는 Yahoo 가격의 정확성을 입증하지 않습니다.

## 한계

두 기본값이 각각 어느 버전에서 처음 바뀌었는지는 확인하지 않았습니다. [원문 검토 당시 확인한 최신 릴리스 (영문)](https://github.com/ranaroussi/yfinance/releases/tag/1.7.0)는 1.7.0(2026-08-26)이며, 이후 패키지나 상위 데이터 공급원의 동작은 다를 수 있습니다. 이 안내는 `yf.download()`에 관한 것입니다. `Ticker.history()`는 해당 메서드의 호출 계약을 별도로 확인하세요.

[프로젝트 README (영문)](https://github.com/ranaroussi/yfinance/blob/main/README.md)는 yfinance가 비공식 도구이고 연구·교육 목적으로 제공되며, Yahoo 데이터는 개인 사용을 위한 것이라고 안내합니다. 라이브러리 라이선스와 내려받은 데이터의 이용권은 별개입니다. 여기서는 실시간 시세, 상업적 이용 허가, 운영 결과를 검증하지 않았습니다.

공급자의 성격과 이용 제약은 [yfinance 개요 (영문)](../../../apis/yfinance/)에서, 후보 간 검증 기준은 [한국·미국 주식 데이터 API 선택 가이드](../choose-stock-market-data-api/)에서 확인하세요.
