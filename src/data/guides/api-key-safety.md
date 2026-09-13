---
title: "How to handle API keys safely"
summary: "Keep credentials out of source, clients, logs, and accidental blast radii with a practical key lifecycle."
order: 3
updatedAt: "2026-09-13"
tags: ["security", "authentication", "operations"]
---

## The rule that prevents most leaks

Never ship a reusable provider key to a browser, desktop bundle, or mobile application. If a client can use the key, a user can extract it. Put provider calls behind a server you control and authenticate the user to that server instead.

## Store secrets outside the repository

Use the deployment platform's secret manager or encrypted environment configuration. Commit only variable names and a safe `.env.example`, never working values. Treat documentation screenshots, shell history, notebooks, support tickets, and copied URLs as possible leak paths.

Query-string credentials deserve extra care because URLs commonly reach access logs, browser history, monitoring tools, and referrer headers. Prefer an authorization header when the provider supports one.

## Reduce blast radius

Create separate keys for production, staging, local development, and CI. Scope each key to the minimum project, environment, endpoint, or role supported by the provider. Apply budget and quota caps. Restrict source IPs or origins only when that control matches the real deployment and will not create a false sense of security.

Do not share one employee's personal key across a service. Prefer service accounts or workload identity where available.

## Keep keys out of logs

Redact `Authorization`, API-key headers, known query parameters, cookies, and signed URLs at the logging boundary. Redact before an event reaches third-party observability—not later in a dashboard. Be careful with automatic HTTP debug logging and exception objects that include request configuration.

Log a provider request ID, status, latency, endpoint name, and internal trace ID. Those are usually enough to investigate without recording the credential.

## Build rotation as an operation

A safe rotation overlaps old and new credentials:

1. issue a new key;
2. deploy it to consumers;
3. verify successful traffic;
4. revoke the old key;
5. confirm old-key traffic has stopped.

Document owners, creation date, intended consumers, scopes, rotation interval, and emergency revocation path. Test the runbook before an incident.

## Respond to a leak

Revoke or disable the credential immediately, issue a replacement, inspect provider usage and billing, search logs and repository history for exposure, and fix the leak path. Deleting the latest Git line is not enough if the secret exists in commit history or build artifacts.
