---
title: "How to choose an LLM API"
summary: "Select a model platform with a reproducible evaluation instead of chasing a leaderboard or a single token price."
order: 2
updatedAt: "2026-09-13"
tags: ["ai", "evaluation", "selection"]
---

## Define the unit of success

An LLM is not “good” in the abstract. Define an accepted result for the workflow: a correct answer, a valid schema, a successful tool sequence, an approved draft, or a resolved support case. That result—not one model call—is the denominator for quality and cost.

## Create a representative evaluation set

Collect real examples and freeze them before comparing providers. Include ordinary cases, long inputs, multilingual cases, ambiguous instructions, missing data, adversarial formatting, tool errors, and tasks the system should refuse. Remove secrets and personally identifiable data from the test set.

Use deterministic graders where possible:

- JSON Schema validation for structured output;
- exact or tolerance-based checks for extracted values;
- sandboxed execution for generated code;
- expected tool-call arguments;
- citation presence and source match.

Human review is still useful for judgment-heavy output. Blind provider and model names so preference for a brand does not become the score.

## Measure the full workflow

Record model ID, API version, prompt version, date, input and output usage, latency, retry count, tool failures, and final acceptance. Calculate cost per accepted result. Include file, search, image, audio, batch, or other tool charges that belong to the workflow.

## Check operational fit

Test rate-limit behavior, timeouts, idempotency, streaming interruption, webhook verification, data retention controls, regional availability, audit needs, and service-account management. Confirm whether direct and cloud-hosted variants expose the same features.

## Preserve switching room

Use a provider adapter for authentication, payloads, streaming events, and error translation. Keep the neutral application task separate from the provider request. Preserve raw responses for diagnosis within your retention policy.

Avoid a lowest-common-denominator abstraction that hides useful differences. Capability flags—such as native schema output, file support, or a particular tool—are clearer than pretending every provider behaves identically.

## Re-evaluate on a trigger

Repeat the evaluation after a model deprecation, major price or quota change, sustained quality drift, or new workflow requirement. Do not automatically migrate because a new model name appeared.

Next: compare [OpenAI and Anthropic](/compare/openai-vs-anthropic/) or [OpenAI and Gemini](/compare/openai-vs-gemini/).
