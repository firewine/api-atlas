"""Deterministic checks for published reduced examples; no provider API calls."""
import copy
import json
import sys
from decimal import Decimal


def rejects(call, error_type, message):
    try:
        call()
    except error_type as error:
        assert message in str(error), str(error)
    else:
        raise AssertionError("Expected rejection: " + message)


def cache_case(ns):
    observe = ns["observe_dividends"]
    cache, state, calls = {}, [[]], []
    def fetch(exchange, day):
        calls.append((exchange, day))
        return list(state[0])
    assert observe(cache, fetch, "TEST", "2026-01-01", now_s=10) == []
    before = copy.deepcopy(cache)
    row = {"code": "SYNTHETIC", "dividend": "0.10"}
    state[0] = [row]
    assert observe(cache, fetch, "TEST", "2026-01-01", now_s=20) == []
    assert len(calls) == 1
    assert observe(cache, fetch, "TEST", "2026-01-01", now_s=20, skip_cache=True) == [row]
    assert cache == before and len(calls) == 2
    assert observe(cache, fetch, "TEST", "2026-01-01", now_s=700000) == [row]
    rejects(lambda: observe({}, lambda *_: {}, "TEST", "2026-01-01", now_s=0), ValueError, "Expected dividend rows")


def pagination_case(ns):
    collect = ns["collect_complete"]
    rows = [{"SHOTN_ISIN": f"{i:06d}", "RGT_STD_DT": "20260101"} for i in range(501)]
    calls, counts = [], []
    def count():
        counts.append(True)
        return 501
    def page(start, end):
        calls.append((start, end))
        return rows[start - 1:end]
    assert collect(count, page) == rows
    assert calls == [(1, 500), (501, 1000), (1001, 1500)] and len(counts) == 2
    for failure in ["short", "overlap", "terminal"]:
        def bad_page(start, end):
            result = rows[start - 1:end]
            if failure == "short" and start == 1:
                return result[:-1]
            if failure == "overlap" and start == 501:
                return rows[:1]
            if failure == "terminal" and start == 1001:
                return rows[:1]
            return result
        reason = "stock_repeated_or_overlapping_page" if failure == "overlap" else "stock_page_coverage_mismatch"
        rejects(lambda: collect(lambda: 501, bad_page), ValueError, reason)
    sequence = iter([501, 502])
    rejects(lambda: collect(lambda: next(sequence), page), ValueError, "stock_total_count_drift")
    empty_calls = []
    assert collect(lambda: 0, lambda start, end: empty_calls.append((start, end)) or []) == []
    assert empty_calls == [(1, 500)]
    rejects(lambda: collect(lambda: -1, page), ValueError, "Invalid count")
    rejects(lambda: collect(lambda: 1, page, page_size=0), ValueError, "Invalid page size")


def currency_case(ns):
    select = ns["select_usd_krw"]
    usd = {"ITEM_CODE1": "0000001", "ITEM_NAME1": "원/미국달러", "DATA_VALUE": "1.25"}
    eur = {"ITEM_CODE1": "0000003", "ITEM_NAME1": "원/유로", "DATA_VALUE": "2.50"}
    payload = lambda rows: {"StatisticSearch": {"row": rows}}
    assert select(payload([eur, usd])) == Decimal("1.25")
    assert select(payload([usd, eur])) == Decimal("1.25")
    assert select(payload(usd)) == Decimal("1.25")
    rejects(lambda: select(payload([eur])), ValueError, "missing or ambiguous")
    rejects(lambda: select(payload([usd, usd])), ValueError, "missing or ambiguous")
    aud = {**usd, "ITEM_CODE1": "0000004", "ITEM_NAME1": "호주달러"}
    rejects(lambda: select(payload([aud])), ValueError, "missing or ambiguous")
    for bad in ["NaN", "Infinity", "0", "-1", "invalid"]:
        rejects(lambda: select(payload([{**usd, "DATA_VALUE": bad}])), ValueError, "Invalid ECOS rate")
    rejects(lambda: select(payload([{**usd, "DATA_VALUE": 1.25}])), ValueError, "original ECOS value text")


def deadline_case(ns):
    call = ns["call_with_budget"]
    clock, received = [0], []
    def primary(*, timeout_s):
        received.append(timeout_s)
        clock[0] += 6
        raise TimeoutError("synthetic primary timeout")
    def secondary(*, timeout_s):
        received.append(timeout_s)
        return "ok"
    assert call([primary, secondary], budget_s=10, clock=lambda: clock[0]) == "ok"
    assert received == [10, 4]
    def exhausted(*, timeout_s):
        clock[0] += timeout_s
        raise TimeoutError("synthetic timeout")
    received.clear()
    rejects(lambda: call([exhausted, secondary], budget_s=10, clock=lambda: clock[0]), TimeoutError, "Logical LLM deadline exceeded")
    assert received == []
    def late(*, timeout_s):
        clock[0] += timeout_s + 1
        return "late"
    rejects(lambda: call([late, secondary], budget_s=10, clock=lambda: clock[0]), TimeoutError, "Logical LLM deadline exceeded")
    assert received == []
    def denied(*, timeout_s):
        raise ValueError("permission rejected")
    rejects(lambda: call([denied, secondary], budget_s=10, clock=lambda: clock[0]), ValueError, "permission rejected")
    assert received == []
    assert call([secondary], budget_s=10, clock=lambda: clock[0]) == "ok"


def format_case(ns):
    call = ns["structured_fallback"]
    request_format = {"type": "json_object"}
    messages = [{"role": "user", "content": "Return JSON"}]
    seen = []
    def unsupported(**kwargs):
        raise AssertionError("Unsupported adapter called")
    def success(**kwargs):
        seen.append(kwargs)
        return {"status": "ok"}
    assert call([(False, unsupported), (True, success)], messages, request_format) == {"status": "ok"}
    assert seen[0]["response_format"] is request_format and seen[0]["messages"] is messages
    def timeout(**kwargs):
        assert kwargs["response_format"] is request_format
        raise TimeoutError("synthetic timeout")
    assert call([(True, timeout), (True, success)], messages, request_format) == {"status": "ok"}
    assert seen[-1]["response_format"] is request_format
    rejects(lambda: call([(False, unsupported)], messages, request_format), RuntimeError, "No provider preserved response_format")
    rejects(lambda: call([(True, success)], messages, []), ValueError, "must be an object")
    rejects(lambda: call([(True, lambda **_: "free text")], messages, request_format), ValueError, "Expected parsed structured output")


CHECKS = {
    "eodhd-dividend-delay-cache-refresh": cache_case,
    "seibro-dividend-pagination-count-mismatch": pagination_case,
    "ecos-usd-currency-identity-validation": currency_case,
    "llm-retry-fallback-shared-timeout-budget": deadline_case,
    "llm-structured-output-fallback-response-format": format_case,
}

for slug, code in json.load(sys.stdin).items():
    namespace = {}
    exec(compile(code, slug, "exec"), namespace)
    CHECKS[slug](namespace)
    print(slug + ": synthetic fixture passed")
