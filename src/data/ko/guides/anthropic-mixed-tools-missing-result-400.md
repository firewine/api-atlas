---
locale: "ko"
sourceId: "anthropic-mixed-tools-missing-result-400"
sourceRevision: "088b5621a449d6a29f1757342c6fa6fe3db441ff8d73080aca00771878b43619"
translationReviewedAt: "2026-10-23"
title: "Anthropic Claude API 혼합 도구의 결과 누락과 400 오류: 미완료 턴 이어가기"
h1: "Anthropic Claude API 혼합 도구의 결과 누락과 400 오류: 미완료 턴 이어가기"
description: "Claude 서버·클라이언트 도구를 함께 쓸 때 결과 지연과 400 오류를 구분합니다. client tool_result만 반환하고 도구 정의·ID·programmatic container를 보존하는 방법을 설명합니다."
summary: "Claude의 혼합 도구 응답에서 서버 결과가 없다고 영구 누락은 아닙니다. 모든 클라이언트 결과만 다음 메시지에 보내고 도구 정의를 유지한 뒤, 이어지는 서버 결과를 ID로 연결해야 합니다."
verificationNote: "2026-10-23에 공식 문서·고정 커밋의 SDK 타입·이슈 후속 답변을 검토했습니다. Anthropic API 요청은 수행하지 않았으며, 상위 프로젝트의 관측은 API Atlas의 실제 재현과 구분합니다."
linkLabel: "Anthropic Claude 혼합 도구 결과 지연과 400 오류 방지"
---

## 증상

응답이 `stop_reason="tool_use"`로 끝나며 클라이언트 `tool_use`와 `server_tool_use`가 함께 있지만, 서버 결과는 아직 없을 수 있습니다. 진행 표시가 계속 남거나 추가 텍스트를 붙인 후속 요청에서 HTTP 400 `invalid_request_error`가 발생합니다. 이 모양만으로 결과가 영구 유실됐다고 판단하면 안 됩니다.

[TypeScript 이슈 #1090 (영문)](https://github.com/anthropics/anthropic-sdk-typescript/issues/1090)은 web fetch 사례를 보고했습니다. 2026-06-26 유지보수자 답변은 의도된 동작을 문서가 설명하지 못했던 문제로 정리합니다. [Python 이슈 #1325 (영문)](https://github.com/anthropics/anthropic-sdk-python/issues/1325)는 코드 실행·도구 검색 증상을 보고했고, [2026-08-06 후속 답변 (영문)](https://github.com/anthropics/anthropic-sdk-python/issues/1325#issuecomment-5206888743)은 서버 측 처리와 합성 결과가 불필요함을 설명합니다. 확인 당시 두 이슈 모두 종료됐습니다. 최초 신고만 현재 장애로 인용하지 마세요.

## 원인

[공식 혼합 도구 계약 (영문)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/server-tools#mixing-server-tools-and-client-tools-in-one-turn)은 두 흐름을 구분합니다. 직접 병렬 호출에서는 서버 도구가 대기하고 클라이언트 결과를 받은 다음 응답에 서버 결과가 나옵니다. 인접한 블록이 아니라 `tool_use_id`로 응답 간 연결을 해야 합니다. assistant → user → assistant 이력을 순서대로 유지하세요.

[Programmatic tool calling (영문)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling)은 이미 실행 중인 코드가 클라이언트 데이터를 기다리는 경우입니다. `caller`와 그 안의 `tool_id`를 확인하며, 코드의 최종 결과까지 여러 차례 왕복할 수 있습니다. 반면 `pause_turn`은 클라이언트 결과 메시지를 만들어 넣지 않고 저장한 assistant 내용을 이어가는 흐름입니다. [종료 사유 문서 (영문)](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons)에서 이 차이를 확인할 수 있습니다.

## 안전한 해결

미완료 혼합 턴에서는 응답의 각 클라이언트 `tool_use`마다 실제 `tool_result` 하나씩을 바로 다음 단일 user 메시지에 넣습니다. 결과 앞뒤에 별도의 최상위 텍스트 블록을 추가하지 마세요. 최초 `tools` 정의도 그대로 유지합니다. 대기 중인 도구를 제거하거나 턴을 일찍 끝내면 400이 발생할 수 있습니다. 새 사용자 지시는 턴이 끝난 뒤 보냅니다. 서버 도구를 직접 실행하거나 그 결과를 만들어 넣지 마세요.

[클라이언트 결과 계약 (영문)](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls)에 따라 실제 실행 실패는 `is_error: true`로 반환합니다. `tool_result` 안에 들어 있는 텍스트는 결과 데이터이므로 금지한 형제 텍스트 블록과 다릅니다. 서명이나 비텍스트 데이터를 포함한 모든 assistant 블록을 유지하고 문자열로 합치지 않습니다.

다음은 완성된 JSON 형태의 응답 딕셔너리로 후속 요청 필드를 만드는 애플리케이션 예제입니다. SDK 호출이나 도구 실행은 하지 않습니다. 첫 요청 전에 도구 정의의 변경되지 않는 사본을 저장하고, 별도로 허가된 실행기에서 얻은 실제 클라이언트 결과를 전달하세요.

```python
from copy import deepcopy


def pending_server_calls(previous, response):
    """Track unmatched IDs across complete responses, not block positions."""
    pending = dict(previous)
    for block in response["content"]:
        if block["type"] in ("server_tool_use", "mcp_tool_use"):
            pending[block["id"]] = block["name"]
    for block in response["content"]:
        if block["type"].endswith("_tool_result"):
            pending.pop(block.get("tool_use_id"), None)
    return pending  # Result observed does NOT mean execution succeeded.


def continuation_patch(history, response, original_tools, results=()):
    """Build request fields offline; history excludes this response.

    original_tools is the saved definition snapshot from the initial request.
    results contains actual client outcomes, never invented server outcomes.
    Keep model, max_tokens and other applicable request settings separately.
    """
    calls = [b for b in response["content"] if b["type"] == "tool_use"]
    reason = response["stop_reason"]
    if reason == "pause_turn":
        if calls or results:
            raise ValueError("pause_turn is not a client-result continuation")
    elif reason == "tool_use":
        if not calls or any(r.get("type") != "tool_result" for r in results):
            raise ValueError("Return client tool_result blocks only")
        expected = {b["id"] for b in calls}
        actual = [r.get("tool_use_id") for r in results]
        if len(actual) != len(expected) or set(actual) != expected:
            raise ValueError("Return exactly one result per client tool_use")
        by_id = {b["id"]: b for b in calls}
        for result in results:
            if result.get("toolset_name") != by_id[result["tool_use_id"]].get("toolset_name"):
                raise ValueError("Preserve the client toolset_name")
    else:
        raise ValueError("Handle completion, refusal or truncation separately")

    container_id = (response.get("container") or {}).get("id")
    programmatic = any(
        (b.get("caller") or {}).get("type", "direct").startswith("code_execution_")
        for b in calls
    )
    if programmatic and not container_id:
        raise ValueError("Programmatic continuation requires container.id")
    messages = deepcopy(history)
    messages.append({"role": "assistant", "content": deepcopy(response["content"])})
    if reason == "tool_use":
        messages.append({"role": "user", "content": deepcopy(list(results))})
    patch = {"messages": messages, "tools": deepcopy(original_tools)}
    if container_id:
        patch["container"] = container_id
    return patch
```

Programmatic 호출에서는 반환된 `container.id`를 재사용하고 새 컨테이너로 바꾸지 않습니다. 만들어진 필드와 함께 기존의 해당 모델·요청 설정을 전달합니다. 다음 응답도 이후 왕복 전에 assistant 이력에 보존하세요. 대기 ID 목록은 성공 기록이 아닙니다. 결과 블록이 도착해도 그 안의 서버 오류를 따로 확인해야 합니다. [고정 커밋의 SDK 결과 타입 (영문)](https://github.com/anthropics/anthropic-sdk-python/blob/9313f13a5a643ceed10fafba6785eab8e04b6e6e/src/anthropic/types/web_fetch_tool_result_block.py)은 `tool_use_id`와 `web_fetch_tool_result` 필드를 보여주지만 실행 성공을 입증하지는 않습니다.

왕복 횟수·시간 예산과 미해결 상태를 명시하세요. 종료 응답 이후에도 연결되지 않은 ID가 있으면 진단 근거를 남기고 조사합니다. 성공으로 덮어쓰거나 부작용이 있는 클라이언트 동작을 무작정 재시도하지 마세요.

## 검증

2026-10-23에 공식 문서·고정 커밋의 SDK 타입·이슈 후속 답변을 검토했습니다. Anthropic API 요청은 수행하지 않았으며, 상위 프로젝트의 관측은 API Atlas의 실제 재현과 구분합니다.

저장소의 오프라인 대조군은 합성 딕셔너리로 위 예제만 실행합니다. 정상군에는 여러 클라이언트 결과, 순서와 무관한 ID 연결, 이미 도착한 서버 결과, 다음 응답의 지연 결과, 클라이언트 오류 형태의 합성 결과(`is_error: true`), `pause_turn`, 여러 왕복의 programmatic 이어가기가 포함됩니다. 거부 대조군에는 최상위 추가 텍스트, 누락·중복·잘못된 클라이언트 ID, 만들어 넣은 서버 결과, programmatic 컨테이너 누락, 종료·잘린 응답의 재개 시도가 포함됩니다. 도구 정의와 이력 보존도 네트워크 없이 확인합니다.

허가된 실제 시험에서는 모델·API·SDK·도구 버전, 종료 사유, ID, caller·container 정보와 민감정보를 제거한 요청·응답 순서를 기록하세요. 결과만 보내는 정상군과 추가 텍스트·도구 정의 제거 실패군을 비교합니다. 이 서버 측 400 시험은 여기서 수행하지 않았습니다. 스키마·근거 해시·번역·빌드 검사도 공급자 가용성을 증명하지 않습니다.

## 한계

Python 신고의 SDK `0.52.0`, `claude-sonnet-4-6`, `code_execution_20250825`는 당시 환경을 식별할 뿐 현재 권장 조합이 아닙니다. 최초 영향 버전, 모든 경우를 고친 SDK 버전, 모델별 발생률은 확인하지 않았습니다. 사용하는 엔드포인트의 현재 도구·모델 호환성 문서를 확인하고, 직접 Anthropic·Vertex·Bedrock의 지원 범위를 같다고 가정하지 마세요.

예제는 SDK tool runner, 스트리밍 조립기나 자동 재시도 시스템이 아닙니다. 전체 요청 스키마 검사, 컨테이너 만료 처리, 클라이언트 동작 허가나 대기 동작의 성공 판정은 별도 책임입니다. 진단 기록은 보존 정책에 맞추고 비밀값은 제거하세요. GetBeta의 운영 수정으로 주장하거나 구현한 내용은 없습니다. 텍스트 전용 어댑터 경로는 혼합 도구 처리를 입증하지 않습니다.

[Anthropic 공급자 소개 (영문)](../../../apis/anthropic/)와 [LLM API 운영 적합성 평가 (영문)](../../../guides/choose-llm-api/#check-operational-fit)에 이 대조군을 연결해 검토하세요. 검색 표현은 편집상 후보이며 검색량·순위·이용 규모를 측정한 근거가 아닙니다.
