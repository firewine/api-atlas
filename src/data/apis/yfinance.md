---
name: "yfinance"
provider: "Ran Aroussi and contributors"
category: "market-data"
status: "active"
officialDocs: "https://ranaroussi.github.io/yfinance/"
homepage: "https://github.com/ranaroussi/yfinance"
baseUrl: "Python package (not a contracted hosted API base URL)"
auth: "No user-managed API key for the normal package interface"
versioning: "Package releases provide versioning, but there is no contracted hosted-API version surface."
resourceGroups: ["Ticker", "Download", "Search", "Screeners", "WebSocket helpers"]
pagination: "Wrapper-specific; there is no uniform public pagination contract."
errors: "Python exceptions and upstream response changes must be handled by the application."
webhooks: "No webhook interface is provided by the package."
sdks: ["Python package"]
summary: "An open-source Python library that retrieves market data through Yahoo Finance's publicly available interfaces."
pricing: "Free, open-source software under Apache-2.0; underlying data rights are separate."
rateLimit: "No service-level quota or SLA is published by the project; upstream behavior can change."
formats: ["Python objects", "pandas DataFrame"]
protocols: ["Python library", "WebSocket helpers"]
bestFor:
  - "Research notebooks"
  - "Personal analysis and prototypes"
  - "Convenient ticker history and metadata access in Python"
cautions:
  - "It is not affiliated with, endorsed by, or vetted by Yahoo."
  - "Project documentation says Yahoo Finance data is intended for personal use; review the underlying terms."
verifiedAt: "2026-09-13"
sourceUrls:
  - "https://ranaroussi.github.io/yfinance/"
  - "https://ranaroussi.github.io/yfinance/reference/index.html"
  - "https://github.com/ranaroussi/yfinance/blob/main/README.md"
mutableFacts:
  - label: "Base URL"
    value: "Python package; no contracted hosted API base URL"
    sourceUrl: "https://ranaroussi.github.io/yfinance/"
    verifiedAt: "2026-09-13"
  - label: "Authentication"
    value: "No user-managed API key for the normal package interface"
    sourceUrl: "https://ranaroussi.github.io/yfinance/"
    verifiedAt: "2026-09-13"
  - label: "Pricing"
    value: "Free Apache-2.0 software; underlying Yahoo data rights are separate"
    sourceUrl: "https://github.com/ranaroussi/yfinance/blob/main/README.md"
    verifiedAt: "2026-09-13"
  - label: "Rate limits"
    value: "No service-level quota or SLA is published by the project; upstream behavior can change"
    sourceUrl: "https://ranaroussi.github.io/yfinance/"
    verifiedAt: "2026-09-13"
  - label: "Project status"
    value: "The maintained documentation exposes Ticker, download, Search, WebSocket, screener, sector, and related interfaces"
    sourceUrl: "https://ranaroussi.github.io/yfinance/reference/index.html"
    verifiedAt: "2026-09-13"
  - label: "Affiliation and use warning"
    value: "The project states it is not affiliated with Yahoo and is intended for research and educational use"
    sourceUrl: "https://ranaroussi.github.io/yfinance/"
    verifiedAt: "2026-09-13"
tags: ["python", "open-source", "stocks", "research", "pandas"]
---

## What it covers

`yfinance` wraps ticker history, corporate actions, financial statements, options, funds, search, screening, and other Yahoo Finance data in a Pythonic interface. It is a library, not a vendor contract or stable paid data feed.

## Request shape

```python
import yfinance as yf

history = yf.download("AAPL", period="1mo", auto_adjust=True)
print(history.tail())
```

Pin the package version for reproducible work and expect upstream response behavior to evolve.

## Decision notes

Use yfinance for personal research and prototyping where its stated terms fit. For production redistribution, uptime commitments, deterministic schemas, or licensed display rights, evaluate a contracted market-data provider instead.
