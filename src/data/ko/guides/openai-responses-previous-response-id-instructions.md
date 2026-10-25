---
locale: "ko"
sourceId: "openai-responses-previous-response-id-instructions"
sourceRevision: "f8753c485eea98e6530c593fb512cf21a4cd3855915a2b16a5a86e9456094935"
translationReviewedAt: "2026-10-25"
title: "OpenAI Responses 지침이 다음 턴에 사라질 때: previous_response_id와 instructions 분리"
h1: "OpenAI Responses 지침이 다음 턴에 사라질 때: previous_response_id와 instructions 분리"
description: "OpenAI Responses의 previous_response_id는 이전 최상위 instructions를 자동 적용하지 않습니다. 매 턴 지침 재전송, 공식 Node SDK 근거와 실제 호출을 하지 않은 검증 범위를 설명합니다."
summary: "이전 응답을 문맥으로 연결해도 이전 최상위 지침은 자동으로 이어지지 않습니다. 매 요청에 안정적인 지침을 포함하고 모델이나 플랜을 바꾸기 전에 실제 요청 필드를 확인하세요."
verificationNote: "2026-10-25에 공식 Responses 가이드·SDK 요청 타입·릴리스를 검토했습니다. OpenAI 요청이나 실제 모델 시험은 하지 않았습니다. 별도 오프라인 예제 검사는 애플리케이션 요청 객체 구성만 확인합니다."
linkLabel: "OpenAI Responses 지침 누락: 매 턴 정책 재전송"
---

## 증상

다중 턴 챗봇이 처음에는 언어·답변 방식 지침을 따르는데 후속 요청은 새 입력과 `previous_response_id`만 보내는 경우입니다. 우선 조사할 구체적인 요청 결함은 최상위 `instructions` 누락입니다. 답변이 달라졌다는 사실만으로 이 원인을 확정할 수는 없습니다. 대화 문맥을 유지하면서 애플리케이션 정책도 빠뜨리지 않는 것이 작업 목적입니다.

인기도와 난관 근거는 별개입니다. [공식 Node SDK 저장소 (영문)](https://github.com/openai/openai-node)는 2026-10-25 확인 시 약 11.2k stars와 1.6k forks를 표시했습니다. 저장소 관심도 지표이지 Responses 이용자 수·시장점유율은 아닙니다. 연동 난관은 이전 응답 문맥과 요청별 지침이 다르다는 공식 계약에 있으며, 서비스 장애를 주장하는 것이 아닙니다.

## 원인

[공식 SDK 가이드 (영문)](https://github.com/openai/openai-node/blob/v7.43.0/docs/responses.md)와 [고정 커밋의 요청 타입 (영문)](https://github.com/openai/openai-node/blob/d02d4de77ea7a6f82325c02e6f44deb34ee3992c/src/resources/responses/responses.ts)은 이전 응답 문맥과 다음 요청의 최상위 정책을 구분합니다. `previous_response_id`는 이전 `instructions`를 자동 적용하지 않습니다. 이는 명시된 요청 계약이며 API 버그가 아닙니다.

[공식 이전 가이드 (영문)](https://developers.openai.com/api/docs/guides/migrate-to-responses)도 안정적인 지침을 매번 다시 보내도록 설명합니다. 기존 [commentary·최종 답변 파싱 사례](../openai-responses-parse-commentary-final-answer/)가 응답 선택 문제라면, 이번 사례는 나가는 요청의 구성 문제입니다.

## 안전한 해결

공통 요청 생성기에 애플리케이션 지침을 넣고 첫 요청과 모든 후속 요청에 전달하세요. 대화 화면뿐 아니라 민감 정보를 가린 실제 요청 필드를 확인합니다. 아래 JavaScript는 텍스트 전용 예제이며 요청 객체만 만들고 전송하지 않습니다. 앱에서 사용할 수 있는 모델을 지정하고 후속 턴에만 실제 이전 응답 ID를 넣습니다.

```javascript
function buildResponseRequest({ model, instructions, input, previousResponseId }) {
  if (typeof model !== "string" || !model.trim()) {
    throw new TypeError("model is required");
  }
  if (typeof instructions !== "string" || !instructions.trim()) {
    throw new TypeError("stable instructions are required on every turn");
  }
  if (typeof input !== "string" || !input.trim()) {
    throw new TypeError("this text-only example requires input");
  }
  const request = { model, instructions, input };
  if (previousResponseId !== undefined) {
    if (typeof previousResponseId !== "string" || !previousResponseId.trim()) {
      throw new TypeError("previousResponseId must be a nonempty response ID");
    }
    request.previous_response_id = previousResponseId;
  }
  return request; // Build only: no SDK call, credentials, or network.
}
```

반환 객체를 기존 SDK 전송 경로에 넘깁니다. 이 함수는 응답 ID의 소유권·보존 여부·실재 여부를 확인하지 못하며 모델이 지침을 지켰다는 증거도 아닙니다. 공식 SDK 문서가 함께 사용할 수 없다고 설명하는 `previous_response_id`와 `conversation`을 동시에 지정하지 마세요. 이력을 직접 관리한다면 assistant 텍스트만 추리지 말고 필요한 reasoning·tool 항목을 포함한 원래 순서를 보존해야 합니다.

확인한 Node SDK는 [2026-10-22 릴리스된 v7.43.0 (영문)](https://github.com/openai/openai-node/releases/tag/v7.43.0)입니다. 이는 검토한 문서 버전이지 지침 계약이 처음 생긴 버전이나 해당 버그 수정 버전이라는 뜻이 아닙니다. 재시도·모델 변경·유료 플랜 변경으로 누락된 필드가 복구되지는 않습니다.

## 검증

2026-10-25에 공식 Responses 가이드·SDK 요청 타입·릴리스를 검토했습니다. OpenAI 요청이나 실제 모델 시험은 하지 않았습니다. 별도 오프라인 예제 검사는 애플리케이션 요청 객체 구성만 확인합니다.

오프라인 대조군은 첫 턴의 지침 있음·이전 ID 없음, 후속 턴의 같은 지침·이전 ID 있음, 정책 변경 시 새 지침 반영입니다. 이 애플리케이션 예제는 지침 누락·공백, 빈 모델·입력, 잘못된 후속 ID를 거부하도록 검사합니다. 지침을 빠뜨린 수동 후속 요청과도 비교합니다. 모두 합성 요청 객체 검사이며 공급자 응답을 관찰한 결과가 아닙니다.

권한을 받은 실제 평가에서는 여러 턴의 정책 준수 여부, 민감 정보를 가린 요청 기록, SDK·모델 버전과 예상 출력 기준을 함께 확인해야 합니다. 그 평가는 수행하지 않았습니다. 저장소 콘텐츠·링크 검사 역시 실제 모델 동작을 증명하지 않습니다.

## 한계

범위는 `previous_response_id`와 최상위 `instructions`의 조합입니다. 모든 대화 상태 방식에 일반화하거나 완전한 지침 준수를 보장하지 않습니다. 전체 영향 애플리케이션 수, 개별 모델 접근권·계정 설정·요금·플랜 조건은 시험하지 않았으며 유료 플랜 상향이 필요하다는 근거도 없습니다. 언어·형식 변화의 다른 원인은 별도로 조사해야 합니다.

GetBeta의 운영 수정 성공 사례로 연결하지 않습니다. 다른 요청에서 `previous_response_id`를 사용하지 않는 코드가 있다는 사실만으로 이번 문제의 해결을 입증할 수 없습니다. [OpenAI 공급자 소개 (영문)](../../../apis/openai/)와 [LLM API 선택 가이드 (영문)](../../../guides/choose-llm-api/)를 함께 참고하세요. 검색 표현은 의도 후보이며 검색량·순위는 확인하지 않았습니다. 배포 후 Search Console URL 검사·색인·실적도 미검증입니다.
