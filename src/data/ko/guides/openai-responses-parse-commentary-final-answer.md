---
locale: "ko"
sourceId: "openai-responses-parse-commentary-final-answer"
sourceRevision: "69213adb65b1edcfffc5c11cba7a4a15ac7625ca555d90ca636f579de09906e5"
translationReviewedAt: "2026-10-23"
title: "OpenAI Responses API의 JSON 오류와 중간값 오선택: 최종 구조화 결과 파싱"
h1: "OpenAI Responses API의 JSON 오류와 중간값 오선택: 최종 구조화 결과 파싱"
description: "OpenAI Responses가 commentary를 JSON으로 파싱하거나 중간값을 반환하는 문제의 원인, SDK 3.14.1 수정과 최종 결과 선택 방법, 실제 호출을 검증하지 않은 범위를 설명합니다."
summary: "최종 JSON이 정상이어도 그 앞의 commentary 때문에 JSON 오류가 나거나 중간값이 반환될 수 있습니다. 요청 스키마가 아닌 응답 phase 선택 문제를 구분하고, 수정된 SDK의 구조화 결과를 사용하세요."
verificationNote: "2026-10-23에 공식 SDK 수정 코드·문서·릴리스·이슈를 검토했습니다. OpenAI 요청이나 실제 모델 시험은 수행하지 않았으며, 상위 프로젝트의 합성 시험 결과는 해당 PR의 보고로 구분합니다."
linkLabel: "OpenAI Responses commentary 오파싱: 최종 구조화 결과 선택"
---

## 증상

API가 HTTP 200과 `status="completed"`를 반환하고 최종 JSON도 정상인데 `ValidationError: json_invalid`가 발생할 수 있습니다. [공식 저장소 이슈 #3859 (영문)](https://github.com/openai/openai-python/issues/3859)는 일반 문장인 `commentary` 뒤에 `final_answer`가 있을 때의 실패를 보고합니다. 별도 합성 대조군에서는 commentary도 스키마에 맞는 JSON으로 만들었더니 오류 없이 중간값이 반환됐습니다. 신고자가 재현한 환경은 openai 3.8.0·3.14.0과 Pydantic 2.13.5입니다.

구조화 추출이나 에이전트 결과를 소비할 때 JSON 검증 성공만으로 최종 답을 선택했다고 판단하면 안 됩니다. 인기도와 난관의 근거도 구분합니다. [공식 SDK 저장소 메타데이터 (영문)](https://api.github.com/repos/openai/openai-python)는 2026-10-23 확인 당시 stars 31,917개·forks 8,058개를 표시했습니다. 이는 관심도 지표이며 API 이용자 수나 시장점유율은 아닙니다. 구체적인 난관은 위 재현 이슈로 확인했습니다. 이슈와 수정은 9월에 발생했으며, 이번 확인일의 신규 장애로 보고하는 것이 아닙니다.

## 원인

구버전 파서는 메시지의 `phase`를 구분하지 않고 각 `output_text`를 파싱한 뒤, `output_parsed`에서 처음 파싱된 값을 반환했습니다. 그 결과 일반 문장을 JSON으로 검증하다 실패하거나, 유효한 JSON인 중간 설명을 최종 답으로 오인할 수 있었습니다. 요청 스키마를 더 엄격하게 지정해도 응답 선택 오류는 해결되지 않습니다.

[병합된 공식 수정 PR (영문)](https://github.com/openai/openai-python/pull/3861)과 [고정 커밋의 파서 (영문)](https://github.com/openai/openai-python/blob/6520df1220a0030c7b45b00a6fa4bf2e9c7396ac/src/openai/lib/_parsing/_responses.py)는 `final_answer` 이외의 명시적 phase를 파싱하지 않도록 변경했습니다. phase가 없거나 null이면 기존 동작을 유지하며, 본문이나 모델 이름으로 phase를 추정하지 않습니다. 이는 요청의 형식을 누락하는 [response_format 폴백 사례 (영문)](../../../guides/llm-structured-output-fallback-response-format/)와 다른 문제입니다.

## 안전한 해결

실제로 설치된 `openai` 버전을 확인하고, 호환성을 검토해 수정이 포함된 릴리스로 이동하세요. [공식 3.14.1 릴리스 (영문)](https://github.com/openai/openai-python/releases/tag/v3.14.1)는 2026-09-15 배포됐으며 해당 수정을 포함합니다. 유료 플랜 변경이나 같은 모델 호출 반복을 SDK 파싱 오류의 해결책으로 삼지 마세요.

`responses.parse(..., text_format=YourModel)`이 성공한 뒤 `output_parsed`를 읽습니다. [공식 SDK 가이드 (영문)](https://github.com/openai/openai-python/blob/v3.14.1/helpers.md#parsing-responses-api-output)에 따르면 `output_text`에는 commentary도 합쳐집니다. 이 전체 문자열을 다시 JSON으로 파싱하면 응답 선택 경계가 다시 잘못될 수 있습니다.

아래 함수는 수정된 SDK가 이미 파싱한 응답을 받는 애플리케이션 수용 검사입니다. 자체 API 호출은 없으며 구버전 SDK에서 함수에 도달하기 전에 발생하는 파싱 오류를 고치는 코드는 아닙니다.

```python
def require_structured_result(response):
    """Accept an already-parsed response from a fixed OpenAI SDK.

    This is an application acceptance guard, not a replacement SDK parser.
    It makes no API call and deliberately never reads response.output_text.
    """
    if response.status != "completed":
        raise ValueError("Response is not completed")
    for item in response.output or []:
        if item.type != "message":
            continue
        if getattr(item, "phase", None) not in (None, "final_answer"):
            continue
        if any(part.type == "refusal" for part in item.content or []):
            raise ValueError("Final response was refused")
    result = response.output_parsed
    if result is None:
        raise ValueError("No structured result; do not fall back to commentary")
    return result
```

최종 JSON 오류는 오류로 유지하고, 거절·미완료·구조화 결과 없음을 구분하세요. commentary로 대체하면 안 됩니다. 위 검사는 수용 가능한 메시지에 거절이 있으면 convenience accessor보다 엄격하게 거부합니다. 대화 이력을 직접 재전송할 때도 [공식 phase 명세 (영문)](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.5#phase-parameter)에 따라 원래 출력 항목과 phase를 보존하고 한 문자열로 합치지 않습니다.

## 검증

2026-10-23에 공식 SDK 수정 코드·문서·릴리스·이슈를 검토했습니다. OpenAI 요청이나 실제 모델 시험은 수행하지 않았으며, 상위 프로젝트의 합성 시험 결과는 해당 PR의 보고로 구분합니다.

상위 PR은 동기·비동기 파싱과 스트리밍에 합성 HTTP/SSE 응답을 사용한 회귀검사를 보고합니다. 이를 이번 조사에서 직접 수행한 시험이나 실제 모델 호출 결과로 표현하지 않습니다.

고정한 SDK의 회귀검사에서는 최종 JSON만 있는 정상군, 일반 문장 commentary 뒤의 최종 JSON, 스키마에 맞는 commentary 뒤의 최종 JSON을 비교하세요. 뒤의 두 경우에도 중간값이 아닌 최종 객체가 선택돼야 합니다. 알 수 없는 명시적 phase, phase 없음/null, 거절, 최종 결과 없음, 잘못된 최종 JSON, 미완료 응답을 실패·호환성 대조군으로 포함합니다. 파싱과 스트리밍을 모두 사용한다면 양쪽 경로를 검사해야 합니다.

이 저장소의 별도 오프라인 예제 검사는 합성 Python 객체로 위 수용 함수만 확인합니다. 콘텐츠·빌드 검사는 글의 계약, 링크와 번역을 검사합니다. 두 검사 모두 SDK 동작이나 공급자 가용성을 입증하지 않습니다.

## 한계

신고된 3.8.0·3.14.0 재현과 3.14.1 수정만 근거로 삼았습니다. 최초 영향 버전, 모델별 발생 빈도, 현재 실제 호출에서의 재현 여부, 개별 계정 접근권과 요금 조건은 확인하지 않았습니다. 모든 Astra 응답에 commentary가 있거나 이 모델에서만 발생한다고 단정하지 않습니다.

SDK는 phase가 없는 응답과의 호환성을 유지하므로 프록시가 제거한 phase를 복구할 수 없습니다. `output_parsed`는 수용 가능한 첫 파싱 결과이며, 최종 객체가 반드시 하나라는 보장은 아닙니다. 결과가 정확히 하나여야 한다면 별도의 계약과 검사를 추가하세요. 이후 릴리스에서 다른 동작이 바뀔 수 있으므로 설치된 의존성을 확인하고 대조군 검사를 반복해야 합니다.

GetBeta가 이 문제를 해결한 사례로 연결하지 않습니다. 공급자 정보는 [OpenAI API 소개 (영문)](../../../apis/openai/)를 참고하세요. 검색 표현은 후보이며 검색량이나 순위가 검증된 키워드가 아닙니다.
