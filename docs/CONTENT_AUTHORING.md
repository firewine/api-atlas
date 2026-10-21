# Provider content and validation

Provider Markdown in `src/data/apis/` supplies the HTML profile and catalog JSON. The Astro schema validates source content before the build; the JSON validator checks the generated catalog using the same provenance rules.

## Required sourced facts

Every provider has exactly one fact for each stable key. The `label` is display text and may be changed without changing the key. Additional editorial facts can omit `key`.

```yaml
sourceUrls:
  - "https://vendor.example/docs"
  - "https://vendor.example/pricing"
mutableFacts:
  - key: "base-url"
    label: "Base URL"
    value: "https://api.vendor.example/v1"
    sourceUrl: "https://vendor.example/docs"
    verifiedAt: "YYYY-MM-DD"
  - key: "authentication"
    label: "Authentication"
    value: "Describe the verified authentication method"
    sourceUrl: "https://vendor.example/docs"
    verifiedAt: "YYYY-MM-DD"
  - key: "pricing"
    label: "Pricing"
    value: "State verified pricing conditions or explicitly say what remains unknown"
    sourceUrl: "https://vendor.example/pricing"
    verifiedAt: "YYYY-MM-DD"
  - key: "rate-limits"
    label: "Rate limits"
    value: "State the scope, unit, plan and exceptions supported by the source"
    sourceUrl: "https://vendor.example/docs"
    verifiedAt: "YYYY-MM-DD"
```

Replace the illustrative URLs, values and dates with facts actually reviewed. `officialDocs` must appear in `sourceUrls`. Every fact's exact `sourceUrl` must also appear there. Use the canonical official URL if an old documentation URL redirects. Only HTTPS sources and real calendar dates are accepted.

Adding a key identifies a fact; it does not establish that its claim is true. Review the source itself. Schema validation cannot verify an API key, call a paid API, prove pricing semantics, or validate every example against a vendor service.

## Local and CI checks

```bash
npm ci
npm run validate
```

The static contract runs unit/integration tests, Astro source/type checks, the static build and Pagefind, catalog provenance validation, and distribution verification. `npm run check` is the fastest source check while editing. `npm run validate:content` reads the last build, so rebuild after content edits before using its result.

For workflow, URL and runtime changes, install the browser once and run the full production browser checks in both deployment modes:

```bash
npx playwright install chromium
SITE_URL=https://api-atlas.pages.dev BASE_PATH=/ npm run validate:ci
SITE_URL=https://getbeta.app BASE_PATH=/api-atlas/ npm run validate:ci
```

`validate:ci` adds Compare/Search browser tests to the static contract. Cloudflare's build command remains `npm run validate` and does not require a browser installation. GitHub Actions tests both modes independently on Node 24 and saves screenshots/traces if a browser assertion fails.

Run the complete pending change before publishing a coherent commit. Avoid pushing each incomplete provider addition: each push starts a validation run and newer pushes cancel older runs by design. Check the newest SHA's result. A green Actions run proves the tested source and static output; hosting redirects, response policies, and production deployment need separate evidence.


## 실전 연동 사례 생성

실전 사례는 새 화면을 만들지 않고 기존 `src/data/guides/*.md` 상세 템플릿을 사용한다. `case-studies/template.json`을 복사해 **직접 확인한 근거**로 채운 뒤 실행한다. 빈 템플릿과 `tests/fixtures/` 합성 데이터는 공개 콘텐츠가 아니다. 첨부 조사 보고서는 후보 발굴 자료이며, 그 문서 자체가 실제 실험 성공이나 공급자 현재 동작을 입증하지 않는다.

```bash
npm run generate:case -- /absolute/path/to/reviewed-case.json
SITE_URL=https://getbeta.app BASE_PATH=/api-atlas/ npm run validate:ci
```

생성기는 하나의 입력에서 하나의 Markdown만 만들며 기존 파일은 덮어쓰지 않는다. 검증 실패 시 공개 글을 만들지 않는다. 수정할 때는 기존 Markdown을 편집하고 전체 검증을 다시 실행한다. 생성기의 제목 형식은 `{api} {problem}: {solution}`이며 `title`과 `h1`은 그 문구와 일치해야 한다. 기존 Atlas 본문과 같은 영어로 작성한다. `description`과 첫 요약 문단 `summary`는 각 사례의 실제 내용을 별도로 작성한다. 검색어 목록을 제목이나 본문에 자동으로 덧붙이지 않는다.

| 입력 | 작성·검증 규칙 |
| --- | --- |
| `caseStudy.problemId` | 동일한 공급자/실패 원인/해결 대상을 식별하는 안정적인 ID. 표현만 바꾼 글은 같은 ID를 사용한다. |
| `caseStudy.titleParts` | 공급자/API, 구체적인 문제, 해결 방향. 예: EODHD / 배당 데이터 누락 / 지연 업데이트와 캐시 갱신 처리. |
| `caseStudy.slug` | 소문자 영문·숫자·하이픈. 실제 Guides URL과 일치해야 한다. |
| `searchIntent.primary` | 대표 검색 의도 **1개**. `term`은 사람이 읽는 후보 표현, `sourcePhrase`는 실제 근거의 원문 구절, `evidenceIds`는 근거 ID. |
| `searchIntent.related` | 관련 표현 **3–5개**, 서로 중복되지 않게 작성. 원문 구절이 해당 근거 발췌에 실제 포함되어야 한다. |
| `searchIntent.status` | `keyword-candidate`. 검색량을 조회하지 않은 표현을 검증된 인기 검색어로 표시하지 않는다. 검색 의도와 후보는 목록형 SEO 본문으로 출력하지 않는다. |
| `evidence` | 최소 2개 근거, code 근거 최소 1개. HTTPS 출처 URL, 실제 확인일, 원문 발췌, 저장한 스냅샷과 SHA-256을 기록한다. 코드 출처는 가능하면 commit SHA로 고정한다. |
| `technicalDetails` | 실제 `field`, `error-code`, `sdk-version`만 기록한다. 근거 발췌 및 본문에 정확한 값이 있어야 한다. SDK 버전/오류 메시지를 모르면 만들지 말고 남은 한계에 미확인을 명시한다. |
| `verification` | `source-review`, `synthetic-test`, `live-test`를 구분한다. 실행을 주장하는 뒤의 두 값에는 `execution` 종류의 실행 기록을 연결한다. `note`의 검증 범위를 본문 검증 방법에 그대로 표시한다. |
| `review` | 화면에 표시할 실제 작성자/유형, 실제 확인일, 제목·본문 일치 검토, 독립적인 문제인 근거, 결과를 꾸미지 않았다는 검토를 기록한다. 단순히 true를 입력하는 것은 내용 검토를 대신하지 않는다. |
| `updatedAt` | 검토 확인일과 같아야 한다. 생성·빌드 시각으로 자동 갱신하지 않는다. |
| `sections` | `symptoms` → `cause` → `solution` → `verification` → `limitations`. 해결 코드는 언어를 명시한 fenced code block을 포함하고 검증 방법에는 정상/실패 대조군과 실제 수행 범위를 작성한다. |
| `providers`, `linkLabel` | 기존 공급자 ID와 설명적인 링크 문구. 예: EODHD 배당 누락과 캐시 갱신 해결 사례. Guides 목록 및 해당 공급자 페이지에 자동 연결된다. 미등록 공급자를 임의 ID로 만들면 실패한다. |

원문 스냅샷은 저장소의 `case-studies/evidence/` 아래 **공개 가능한 발췌만** 저장한다. 토큰·개인정보·계좌·내부 주소·비공개 원문을 넣지 않는다. 이 디렉터리 자체는 정적 사이트로 복사하지 않지만, 글의 근거 메타데이터/발췌는 `/api/guides.json`에 포함되므로 모두 공개 가능한 내용이어야 한다. 해시 일치와 발췌 검사는 스냅샷 무결성만 확인한다. 원격 출처의 진위·최신성·문장의 의미를 자동 인증하지 않는다. 코드/문서 열람과 테스트 실행, 합성 테스트와 운영 성공을 구분해서 작성한다.

본문에는 임의 H1/H2나 실행 HTML을 넣지 않는다. 생성기가 다섯 단계의 H2를 만든다. 내부 링크는 배포 경로에 맞아야 한다. 예를 들어 공급자 링크는 `../../apis/eodhd/`처럼 상대 경로를 사용할 수 있다. 운영 빌드는 `SITE_URL=https://getbeta.app BASE_PATH=/api-atlas/`를 사용하며 GetBeta origin에서 루트 경로로 빌드하면 검증이 실패한다. 상세 템플릿이 canonical, 관련 링크, TechArticle을 만들고 사이트맵은 콘텐츠 컬렉션에서 해당 URL과 저장된 확인일을 가져온다.

## 사례 빌드 검사와 편집 검토

`npm run validate`에 `validate:guides`가 포함된다. Astro 스키마와 생성기가 공통 사례 계약을 사용한다. 배포 산출물에서는 다음을 확인한다.

- 제목·meta description·slug·동일 문제 ID 중복, 거의 같은 사례 본문(단어 집합 유사도 90% 이상).
- 필수 SEO 값, 단일 H1, 첫 요약, 실제 정적 코드/본문 구성과 출처.
- 고유 canonical과 `/api-atlas/` 경로, Guides/공급자 양방향 링크, 사이트맵 및 고정 확인일.
- 화면의 작성자/유형·확인일·제목·설명과 Article/TechArticle 값의 일치.
- 기존 전체 배포 검사에서 내부 URL 대상 파일 및 fragment anchor 존재 여부.

자동 검증은 제목과 본문 의미의 완전한 일치, 모든 허위 결과, 모든 의미상 중복을 판별하지 못한다. 편집자는 `review.distinctProblem`에 별도의 증상·원인·해결·근거가 충분한 이유를 기록하고, 비슷한 글은 우선 기존 글을 보완한다. 같은 사례를 키워드만 바꿔 양산하지 않는다. 검사 통과를 실제 공급자 연동 성공·운영 배포·검색 순위 상승의 증거로 보고하지 않는다.

테스트는 격리 임시 사이트에서 합성 사례를 생성·빌드한 뒤 canonical/공급자 링크/사이트맵/내부 링크/스키마를 의도적으로 망가뜨려 실패하는지 확인한다. 합성 사례는 실제 `src/data/guides/`에 남기지 않는다. 브라우저 검사는 JavaScript를 끈 상태의 직접 Guide 접근도 확인한다.

## 한국어 표시용 번역

영문 원본은 기존 컬렉션에 유지하고 한국어 Markdown은 `src/data/ko/`의
`apis`, `guides`, `comparisons`에 둡니다. 파일명과 `sourceId`는 원본 ID와 같아야 하며
`sourceRevision`에는 원문 Markdown 전체 바이트의 SHA-256을 기록합니다.
본문을 검토한 날짜는 `translationReviewedAt`에 기록합니다. 번역으로 원문 사실의
`verifiedAt`·`checkedAt`이나 검증 등급을 갱신하지 않습니다.

번역은 제목·H1·description·summary·본문을 소유하고, 원본의 가격·한도·증거·스냅샷·
기술 값·출처 날짜는 원본에서 참조합니다. 사례 번역은 `verificationNote`와 설명적인
`linkLabel`을 제공하며 `증상 → 원인 → 안전한 해결 → 검증 → 한계` 절을 유지합니다.
지원되지 않는 원문 주장까지 번역하지 말고 검토된 범위와 제외 사유를 기록합니다.
문서 조사·구현 확인·합성 시험·실제 호출 검증을 구분합니다.

`validate:translations`는 원문 연결·revision·중복·실제 HTML·사이트맵·언어 쌍을
검사하며 `validate`에 포함됩니다. 번역이 없는 링크는 영문이라고 표시하고 정확한
영문 경로로 연결합니다. 검색 화면은 noindex를 유지하고 사이트맵/hreflang에서 제외합니다.
root/subpath `validate:ci`의 실제 브라우저 검색도 통과해야 합니다.

## 배포 후 Search Console 확인

실제 사례가 배포된 뒤 사이트 소유자의 Search Console에서 다음을 직접 확인하고 별도 검증 기록에 남긴다. 도구 접근이나 조회 결과가 없으면 **미검증/대기**로 기록한다.

1. URL 검사: `/api-atlas/guides/{slug}/`의 접근, 색인 상태, 사용자 지정 canonical과 Google 선택 canonical.
2. 사이트맵: 운영 사이트맵 처리 상태 및 해당 URL 포함 여부. 사이트맵 포함만으로 색인 완료라고 보고하지 않는다.
3. 실적: 해당 페이지로 필터한 조회 기간과 실제 유입 검색어·노출·클릭. 데이터가 없으면 0건 또는 데이터 부족이라는 화면의 실제 상태를 구분해 기록한다.
4. 기록: 조회일, property, 페이지 URL, 기간, 확인한 화면/내보내기 근거를 남긴다. 노출·순위·검색량을 추정해 채우거나 상위 노출을 보장하지 않는다.
