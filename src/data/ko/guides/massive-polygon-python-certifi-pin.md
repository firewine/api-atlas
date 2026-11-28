---
locale: "ko"
sourceId: "massive-polygon-python-certifi-pin"
sourceRevision: "d90608af4c639d5629800715beb30f374bde58d34b781ae2af120abda2ffeb5a"
translationReviewedAt: "2026-11-28"
title: "Massive Python의 Polygon SDK certifi 충돌: 패키지 전환과 잠금 파일 검증"
h1: "Massive Python의 Polygon SDK certifi 충돌: 패키지 전환과 잠금 파일 검증"
description: "Polygon Python SDK 1.16.3이 certifi 고정값과 충돌하는 이유, Massive 2.9.0으로 옮길 때의 Python 조건과 검증 절차를 확인합니다."
summary: "2026년 certifi 고정값은 기존 Polygon Python SDK의 상한을 넘습니다. 새 SDK는 그 버전을 허용하지만, Python 조건과 프로젝트 전체 잠금 파일을 따로 검증해야 합니다."
verificationNote: "2026-11-28 소스 검토만 수행했습니다. PyPI 배포 버전의 메타데이터와 태그로 고정한 SDK 소스를 대조했습니다. 의존성 해결, 설치, API 호출, 배포 확인은 하지 않았습니다."
linkLabel: "Massive Python: 기존 Polygon SDK의 certifi 충돌 해결"
---

## 증상

한 프로젝트에서 `polygon-api-client==1.16.3`과 `certifi==2026.7.22`를 동시에 고정하면 조건을 모두 만족하는 certifi 버전이 없습니다. API 호출 전 의존성 해결 단계의 문제이며, 인증이나 요금제, TLS 연결 오류가 아닙니다.

## 원인

[기존 SDK의 PyPI 배포 정보 (영문)](https://pypi.org/pypi/polygon-api-client/1.16.3/json)는 `certifi>=2022.5.18,<2026.0.0`과 Python 3.9 이상(4.0 미만)을 요구합니다. [Massive 2.9.0 배포 정보 (영문)](https://pypi.org/pypi/massive/2.9.0/json)와 [태그 기준 SDK 소스 (영문)](https://github.com/massive-com/client-python/blob/v2.9.0/pyproject.toml)는 `certifi>=2022.5.18,<2027.0.0`과 Python 3.10 이상(4.0 미만)을 요구합니다. 위 certifi 버전은 새 SDK 조건만 만족합니다.

## 안전한 해결

지원되는 Python에서 기존 직접 의존성을 `massive`로 교체하고 가져오기 구문을 `from massive import RESTClient`로 바꾸세요. 간접 의존성이 여전히 옛 SDK를 요구하는지 확인한 뒤, 프로젝트의 도구로 지원 환경별 전체 잠금 파일을 다시 만드세요. 공유 환경 전체의 certifi를 내리거나 인증서 검증을 끄지 않습니다.

아래 명령은 임시 POSIX 환경에서 두 패키지만 확인하는 예입니다. 경로가 이미 있으면 다른 새 경로를 사용하세요. 가져오기 자체에는 API 키나 공급자 호출이 필요하지 않습니다.

```bash
python3.10 -m venv /tmp/massive-sdk-check
/tmp/massive-sdk-check/bin/python -m pip install --dry-run "massive==2.9.0" "certifi==2026.7.22"
/tmp/massive-sdk-check/bin/python -m pip install "massive==2.9.0" "certifi==2026.7.22"
/tmp/massive-sdk-check/bin/python -m pip check
/tmp/massive-sdk-check/bin/python -c 'from massive import RESTClient; from importlib.metadata import version; assert version("massive") == "2.9.0"; assert version("certifi") == "2026.7.22"'
```

## 검증

2026-11-28 소스 검토만 수행했습니다. PyPI 배포 버전의 메타데이터와 태그로 고정한 SDK 소스를 대조했습니다. 의존성 해결, 설치, API 호출, 배포 확인은 하지 않았습니다.

별도의 깨끗한 Python 3.10 환경에서 기존 1.16.3과 동일한 certifi 버전을 dry-run으로 확인하면 의존성 조건 때문에 실패할 것으로 예상됩니다. 새 SDK 조합을 위 예로 확인한 뒤, 프로젝트의 전체 잠금 파일을 새 환경에 설치하고 `pip check`, 실제 앱의 가져오기와 테스트를 확인하세요. 운영 환경이 Python 3.9라면 먼저 인터프리터를 올리거나, 전환할 때까지 기존 작업을 격리하세요.

## 한계

비교 범위는 적힌 배포 버전과 의존성 조건입니다. 새 SDK 하나가 해당 certifi 버전을 허용하더라도 프로젝트 전체 설치나 실제 운영 성공, 기존 Polygon 주소의 종료 여부는 확인되지 않습니다.
