---
title: "How to choose a stock market data API"
summary: "Turn a vague data wish list into a tested decision on coverage, adjustments, latency, rights, and total operating cost."
order: 1
updatedAt: "2026-09-13"
tags: ["market-data", "selection", "licensing"]
---

## Start with the product output

Write down what a user will actually see or what a calculation will consume. “Stock data” is too broad. A useful requirement names the asset classes, exchanges, symbols, fields, frequency, history depth, and intended audience.

For example: daily adjusted closes and cash distributions for U.S.-listed ETFs, refreshed after market close, retained for backtests, displayed to authenticated retail users. That sentence exposes more decision points than a generic feature checklist.

## Build a rights matrix before a feature matrix

API access does not necessarily include the right to store, display, redistribute, or derive commercial products from data. Record each use separately:

| Intended use | Evidence to collect |
| --- | --- |
| Internal analytics | Applicable subscription terms |
| Persistent storage | Retention permission |
| Public display | Display agreement and exchange terms |
| Customer export | Redistribution terms |
| Derived metrics | Derived-data clause |

If the public plan page is unclear, ask sales for a written answer tied to the specific use. Do not infer commercial permission from a high request limit.

## Test data semantics

Download a small “golden set” containing a split, dividend, delisting, symbol change, missing session, and non-U.S. instrument if relevant. Compare:

- raw and adjusted OHLC fields;
- whether volume is split-adjusted;
- ex-date, record date, pay date, and declaration date;
- exchange and timezone identifiers;
- correction and restatement behavior;
- identifiers across symbol changes.

Store provider timestamps and raw responses during the test. Two APIs can use the same field name while applying different adjustment rules.

## Model the real workload

Estimate `symbols × resources × refreshes`, then add initial backfill, retries, repair jobs, and development environments. Decide whether bulk files or grouped requests change the economics. Measure response size, latency, compression, pagination, and throttling with production-like concurrency.

## Score the decision

Weight the axes before seeing vendor prices: rights, coverage, correctness, latency, recovery, support, and cost. A provider that wins on headline price but fails a must-have right or identifier requirement is not a finalist.

Run the same acceptance test against two candidates and save the results. Re-run it when the provider changes an API version, plan, or adjustment policy.

Next: compare [EODHD and Massive](/compare/eodhd-vs-massive/) or [EODHD and Alpha Vantage](/compare/eodhd-vs-alpha-vantage/).
