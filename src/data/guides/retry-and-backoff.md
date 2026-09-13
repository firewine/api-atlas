---
title: "How to design API retries and backoff"
summary: "Retry only recoverable failures, honor server signals, and prevent a transient outage from becoming a retry storm."
order: 5
updatedAt: "2026-09-13"
tags: ["reliability", "retries", "rate-limits"]
---

## Classify before retrying

Usually retryable: connection resets, timeouts with unknown completion, `408`, `429`, and selected `5xx` responses. Usually not retryable without a change: authentication failures, permission failures, validation errors, missing resources, and exhausted hard budgets.

Provider-specific error bodies can refine that rule. A `429` caused by a short burst may succeed after a delay; a monthly spend cap will not.

## Honor the server

Use `Retry-After` and provider rate-limit headers when present. Otherwise apply exponential backoff with jitter. Jitter prevents thousands of clients from waking at the same instant.

```ts
function backoff(attempt: number, baseMs = 400, capMs = 15_000) {
  const ceiling = Math.min(capMs, baseMs * 2 ** attempt);
  return Math.random() * ceiling;
}
```

Cap both attempts and total elapsed time. A user-facing request may tolerate two short retries; a background import may tolerate more if it checkpoints progress.

## Respect method semantics

GET and HEAD are normally safe to retry. A POST that creates a charge, job, or message may duplicate work. Use the provider's idempotency key when available, or create your own operation ID that the receiving system can deduplicate. Keep the same idempotency key across retries of one logical operation.

If a timeout occurs after sending a non-idempotent request, the outcome is unknown. Query operation status before sending another create request.

## Add admission control

Retries cannot fix sustained overload. Limit concurrency, queue background jobs, reserve capacity for interactive work, and stop accepting optional work when error rates rise. Use a circuit breaker to pause calls during a clear provider outage, then probe recovery gradually.

## Instrument the policy

Record endpoint, attempt, response status, delay source, elapsed time, and final outcome. Distinguish original traffic from retry traffic. Alert on accepted-result rate and retry amplification—not only raw error count.

## Test failure sequences

Simulate `429` with and without `Retry-After`, intermittent `503`, connection reset, slow response, invalid credential, repeated hard quota error, and a timeout after a server-side write. A retry policy is production logic and deserves deterministic tests.
