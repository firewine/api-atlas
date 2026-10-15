# API Atlas workflow 재검증과 개선

- 작성: 차도녀 gpt may
- 날짜: 2026-10-15 (Asia/Seoul)
- 대상: `firewine/api-atlas`, `.github/workflows/validate.yml`
- 시작 로컬: `main`, `3e75327e72a8097943bdb4d14ffb315bd19c24fb`, clean.
- 실패 재현 기준: 원격 `7fc59688c0866a82461af1eb5b3cae88711940a6`까지 fast-forward.
- 작업 중 반영한 다른 기여: `619a94275fca80c40e4f593968ee6799b293de00`의 FMP sourceUrls 추가를 보존. 해당 커밋은 기존 CI에서 성공했다.

## 결론

현재 실패의 직접 원인은 콘텐츠의 누락된 출처와 핵심 사실이었다. 검증 결과는 타당했다. 다만 작성 지침·Astro 스키마·빌드 후 검증 계약이 일치하지 않아 같은 문제가 반복됐고, 기존 CI는 하위 경로와 브라우저 동작을 검증하지 않았다. 이를 함께 보완했다.

실행 당시 활성 workflow는 `Validate` 하나였다. 분석 스냅샷 최근 100개는 취소 81, 실패 14, 성공 5였다. 실패 14개의 job 및 실제 로그를 모두 확인했다. 취소는 `cancel-in-progress: true`와 짧은 간격의 연속 push에 따른 것으로, 테스트 실패와 다르다.

## 실패 로그 전수 확인

| 실행 | 실패 단계 | 오류 개수 또는 원인 |
| --- | --- | --- |
| [38751192374](https://github.com/firewine/api-atlas/actions/runs/38751192374) | 콘텐츠 검증 | FMP 사실 출처 미선언 1개 |
| [38750633516](https://github.com/firewine/api-atlas/actions/runs/38750633516) | 콘텐츠 검증 | FMP/Finnhub/Twelve Data 11개 |
| [38750182965](https://github.com/firewine/api-atlas/actions/runs/38750182965) | 콘텐츠 검증 | 같은 세 프로필 11개; 재실행도 같은 SHA를 검사 |
| [38741833606](https://github.com/firewine/api-atlas/actions/runs/38741833606) | 콘텐츠 검증 | FSS DART/KRX/Neon/OCI/Render 21개 |
| [38740919440](https://github.com/firewine/api-atlas/actions/runs/38740919440) | Astro source sync | FSS DART sourceUrls 최소 2개 미충족 |
| [38740196725](https://github.com/firewine/api-atlas/actions/runs/38740196725) | 콘텐츠 검증 | 13개 |
| [38739561690](https://github.com/firewine/api-atlas/actions/runs/38739561690) | 콘텐츠 검증 | 13개 |
| [38739265271](https://github.com/firewine/api-atlas/actions/runs/38739265271) | 콘텐츠 검증 | 13개 |
| [38738902191](https://github.com/firewine/api-atlas/actions/runs/38738902191) | 콘텐츠 검증 | 13개 |
| [38738713749](https://github.com/firewine/api-atlas/actions/runs/38738713749) | 콘텐츠 검증 | 13개 |
| [38738346562](https://github.com/firewine/api-atlas/actions/runs/38738346562) | 콘텐츠 검증 | 13개 |
| [38735522115](https://github.com/firewine/api-atlas/actions/runs/38735522115) | 콘텐츠 검증 | 13개 |
| [38734364711](https://github.com/firewine/api-atlas/actions/runs/38734364711) | 콘텐츠 검증 | OCI 핵심 사실/출처 5개 |
| [38726382417](https://github.com/firewine/api-atlas/actions/runs/38726382417) | 정적 빌드 | 과거 Breadcrumbs의 `Invalid URL` |

따라서 12개 실행은 빌드 후 provenance 검사, 1개는 콘텐츠 스키마, 1개는 실제 URL 빌드 코드에서 실패했다. 최신 실패의 타입 검사·정적 빌드·Pagefind는 성공했고 distribution은 선행 실패로 건너뛰었다. 과거 breadcrumb 오류는 현재 코드에서 재현되지 않았고 별도 중복 수정하지 않았다.

기존 개선 커밋 `3e75327`의 [성공 실행](https://github.com/firewine/api-atlas/actions/runs/38749430864)과 작업 중 다른 기여로 올라온 `619a942`의 [성공 실행](https://github.com/firewine/api-atlas/actions/runs/38751805582)도 확인했다.

## 재현과 구조적 원인

`7fc5968`에서 `npm run validate`는 종료 1로 다음을 출력했다.

```text
provider financial-modeling-prep: fact source is not declared in sourceUrls:
https://site.financialmodelingprep.com/developer/docs/stable
```

같은 빌드의 `npm run verify:dist`를 독립 실행하면 종료 0으로 115개 필수 산출물/72 HTML을 통과했다. 설치나 runner 장애가 원인이 아니었다.

반복을 만든 구조는 다음과 같다.

1. Astro 스키마는 mutableFacts가 1개만 있어도 통과했지만, 후속 JSON 검증은 4개 핵심 사실과 출처 일치를 요구했다. 오류가 빌드 후에야 발견됐다.
2. 필수 사실을 표시 문구 `Base URL`, `Pricing` 등과 정확히 비교했다. 표현을 바꾸면 같은 의미의 사실도 누락으로 판정됐다.
3. 권위 있는 handoff 문서가 bootstrap 상태와 이전의 최소 provenance 조건을 기술하고 있었다. 필수 키/출처 규칙과 추가 절차를 한곳에서 안내하지 못했다.
4. 원격 콘텐츠를 파일 단위로 연속 push하면서 미완성 콘텐츠가 반복 검증됐다. 재실행은 해당 SHA를 다시 검사하므로 새 커밋의 수정을 이전 실행에 반영하지 않는다.
5. CI는 루트 빌드만 검사했고, 실제 Compare/Search 동작을 확인하지 않았다. 빌드 성공만으로 런타임 회귀를 막을 수 없었다.

## 개선 내용

- `src/lib/provider-provenance.mjs`: 소스 스키마와 생성 JSON이 공유하는 provenance 규칙. 필수 사실의 정확히 한 번 존재, 출처 선언/HTTPS/중복, 실제 달력 날짜, 빈 값 등을 검사한다.
- `src/content.config.ts`: 같은 규칙을 source sync에서 실행해 빌드 전에 실패시킨다. 날짜는 형식뿐 아니라 실제 유효한 날짜인지 확인한다.
- 핵심 fact에 `base-url`, `authentication`, `pricing`, `rate-limits` 키를 부여했다. label은 표시 전용이다. 33개 프로필의 132개 키를 이관했고 32개 프로필은 키 추가 외 문구·날짜·값을 바꾸지 않았다. 기존 다른 기여의 endpoint 목록을 보존했다.
- FMP의 `/developer/docs/stable`은 [공식 문서](https://site.financialmodelingprep.com/developer/docs)로 리다이렉트됨을 확인해 fact 출처에 canonical 문서를 사용했다. 같은 공식 문서가 지원하는 apikey 헤더 인증도 반영했다. 다른 기여가 sourceUrls에 추가한 URL은 보존했다.
- `scripts/validate-content.mjs`: 공유 규칙 재사용. providerCount와 실제 배열 길이 일치 검사를 추가했다. 기존 seed, 최소 수, 필수 필드 검사를 유지했다.
- CI: root와 `/api-atlas/` matrix, 실패한 모드가 다른 모드를 취소하지 않는 설정, 수동 실행, 10분 제한, 브라우저 실패 시 trace/스크린샷 artifact를 추가했다. 권한은 기존 `contents: read`를 유지했다.
- `tests/`: provenance 회귀/거부 테스트 8개, 실제 Astro source sync 통합 테스트 1개, production Compare/Search 브라우저 테스트 4개.
- `AGENTS.md`, `docs/CONTENT_AUTHORING.md`, README, handoff: 현재 작성·검증·일괄 게시 절차와 template를 명시했다. README의 고정 provider 수는 제거했다.
- 정적 배포의 `npm run validate`는 브라우저 설치를 요구하지 않는다. `validate:ci`가 Chromium을 사용하는 브라우저 검증을 추가한다. 기존 Cloudflare build command를 깨지 않는다.

JSON 출력에는 추가 metadata인 fact `key`가 포함되며 기존 label/value/source/date는 유지된다. 원본 콘텐츠의 핵심 fact는 key가 필요하므로 모든 기존 프로필을 함께 이관했다.

## 테스트 범위와 결과

| 검사 | 종료 코드 | 확인 결과 |
| --- | ---: | --- |
| 기준 HEAD `npm run validate` | 1 | GitHub와 같은 FMP 출처 누락 재현 |
| 기준 빌드 `npm run verify:dist` | 0 | downstream 실패가 아닌 것을 분리 확인 |
| `npm ci` | 0 | lockfile로 설치 가능 |
| `npm test` | 0 | 9개 통과, skip 0; 임시 격리 콘텐츠의 잘못된 출처는 Astro source sync에서 종료 1 |
| `SITE_URL=https://api-atlas.pages.dev BASE_PATH=/ npm run validate:ci` | 0 | 정적 검증과 browser 4개 통과 |
| `SITE_URL=https://getbeta.app BASE_PATH=/api-atlas/ npm run validate:ci` | 0 | 정적 검증과 browser 4개 통과 |
| `git diff --check` | 0 | 공백 오류 없음 |

각 모드는 33 providers/149 sourced facts, 115 required outputs/72 HTML, 70 Pagefind 문서를 확인했다. 로컬 Node는 26.5.0이고 GitHub runner는 workflow에 명시된 Node 24로 같은 검사와 browser 검사를 실행한다. 게시 커밋의 최종 Actions 결과는 로컬 결과와 구분해 확인·보고한다.

브라우저 테스트는 실제 정적 산출물을 임시 HTTP 서버로 제공한다. Compare의 0/2/4/5개 경계, 표의 헤더·데이터 동기화, Space, reload를 확인한다. Search의 직접 query URL, 실제 결과와 링크/로고/가이드 경로, 빈 입력, 결과 없음, UI asset 실패 안내를 검사한다. UI asset 실패 테스트만 외부 HTTP 경계를 의도적으로 404로 바꾼다. 정상 동작 테스트에서 runtime error나 HTTP 오류는 실패로 처리한다.

기존 테스트 삭제·assertion 약화·skip/only·실패 무시로 통과시키지 않았다. 출처 검사 규칙을 제거한 diff는 같은 규칙의 공유 모듈 이동이며, source-schema 통합 테스트가 실제 거부 동작을 확인한다. install/audit/action-runtime 경고는 원래 실패한 exit 1과 구분했으며 자동 dependency 일괄 업그레이드는 하지 않았다.

## GitHub 환경에서 확인한 테스트 이식성 보정

첫 개선 커밋 `61079c6`의 [Actions 실행](https://github.com/firewine/api-atlas/actions/runs/38754197733)은 새 source-schema 통합 테스트에서 실패했다. Astro는 잘못된 출처를 실제로 종료 1로 거부했지만, CI의 ANSI 색상/밑줄 코드가 기대 문자열 중간에 들어가 오류 메시지 비교가 실패했다. 애플리케이션 스키마 오류와 테스트 출력 비교 오류를 구분했다.

Node 표준 `stripVTControlCharacters`로 색상 문자만 제거한 후 같은 오류 내용과 종료 코드를 검사하도록 보정했다. 테스트의 하위 프로세스는 로컬에서도 `FORCE_COLOR=1`을 사용하므로 CI 조건을 함께 검사한다. 오류를 무시하거나 assertion을 완화하지 않는다.

## GitHub 최종 구현 검증 결과

커밋 `4a4b04efcac57a8ebfa4549e0c53d39cf9d098cb`의 [Actions 실행 38754488316](https://github.com/firewine/api-atlas/actions/runs/38754488316)은 두 matrix job 모두 성공했다. 실제 runner Node는 `v24.21.0`이었다.

| GitHub job | 정적/계약 테스트 | 콘텐츠와 산출물 | Chromium 브라우저 |
| --- | --- | --- | --- |
| [root](https://github.com/firewine/api-atlas/actions/runs/38754488316/job/116489176679) | 9 pass, 0 fail; Astro 0 errors | 33 providers/149 facts; 115 outputs/72 HTML | 4 passed |
| [subpath](https://github.com/firewine/api-atlas/actions/runs/38754488316/job/116489177159) | 9 pass, 0 fail; Astro 0 errors | 같은 검사, `/api-atlas/` 공개 경로 | 4 passed |

실패 증거 업로드 단계는 두 job이 성공했기 때문에 조건에 따라 실행되지 않았다. 테스트는 생략되지 않았다. 커밋·푸시 완료와 CI 성공을 확인했으며 운영 배포·정책 반영 성공으로 확대 해석하지 않는다.

## 범위의 한계

- 이번 검증은 파일 구조·출처 계약·정적 산출물·UI 동작을 증명한다. 모든 공급자의 가격/endpoint/예제의 의미까지 자동으로 사실 확인하지는 않는다. 새 사실은 작성자가 공식 문서에서 검토해야 한다.
- 네트워크로 모든 source URL을 CI에서 호출하지 않는다. 외부 문서의 일시 장애가 정적 검증을 불안정하게 만들지 않도록 한다.
- GetBeta CSP/redirect, Atlas `_headers`, 운영 배포는 변경하지 않았다. 운영 반영과 정책 적용은 green CI와 별도로 확인해야 한다.
