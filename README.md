# API Atlas

API Atlas is a static-first, crawler-friendly API knowledge base built from verified official sources.

## Goals

- Organize API providers around source-backed facts.
- Publish useful human-readable pages and machine-readable summaries from the same source data.
- Timestamp mutable facts such as models, pricing, quotas, versions, and rate limits.
- Make content easy for search engines and AI retrieval systems to discover and cite.
- Never treat crawler traffic as monetizable ad inventory or generate artificial impressions/clicks.

## Stack

- Astro 7 + TypeScript
- Astro Content Collections
- Git-tracked Markdown/YAML/JSON
- Pagefind static search
- Cloudflare Pages
- GitHub Actions build/source checks

## Initial content

The first providers will be migrated from the GetBeta research inventory, starting with EODHD, BOK ECOS, FSC/data.go.kr, OpenAI, Anthropic, Gemini, Massive, Alpha Vantage, yfinance, and Currencylayer.

## Status

Bootstrap implementation in progress.
