---
name: "KRX API"
provider: "Korea Exchange"
category: "market-data"
status: "active"
officialDocs: "https://openapi.krx.co.kr/contents/OPP/INFO/service/OPPINFO004.cmd"
homepage: "https://openapi.krx.co.kr/"
baseUrl: "Service-specific URL in the approved KRX OPEN API specification"
auth: "Issued key in AUTH_KEY request header; service use requires approval"
versioning: "Product-specific"
resourceGroups: ["Stock prices", "ETF/ETN", "Derivatives", "Bond", "Market statistics"]
pagination: "Date-range based queries"
errors: "Korean-language error messages"
webhooks: "Not supported"
sdks: ["Community Python wrappers"]
summary: "Official market data from Korea Exchange — KOSPI, KOSDAQ, ETF prices, and trading statistics."
pricing: "No blanket API price stated in reviewed terms; noncommercial use only"
rateLimit: "Up to 10,000 requests per key per day under current terms"
formats: ["JSON", "XML"]
protocols: ["REST"]
bestFor: ["Korean stock market data", "KOSPI/KOSDAQ prices", "ETF information"]
cautions: ["KRX OPEN API terms restrict use to noncommercial purposes and prohibit third-party redistribution.", "Authentication key and service approval are required.", "Use the approved service specification for its exact request URL."]
verifiedAt: "2026-10-15"
sourceUrls: ["https://openapi.krx.co.kr/contents/OPP/INFO/service/OPPINFO004.cmd", "https://openapi.krx.co.kr/contents/OPP/INFO/OPPINFO002.jsp", "https://openapi.krx.co.kr/contents/OPP/INFO/OPPINFO003.jsp", "https://openapi.krx.co.kr/contents/OPP/USES/service/OPPUSES002_S2.cmd?BO_ID=JvJFzlAENzZlPBDNGAWC"]
mutableFacts:
  - key: "base-url"
    label: "Base URL"
    value: "Service-specific URL; consult the approved API specification"
    sourceUrl: "https://openapi.krx.co.kr/contents/OPP/INFO/OPPINFO003.jsp"
    verifiedAt: "2026-10-15"
  - key: "authentication"
    label: "Authentication"
    value: "Issued key in AUTH_KEY request header; service approval required"
    sourceUrl: "https://openapi.krx.co.kr/contents/OPP/USES/service/OPPUSES002_S2.cmd?BO_ID=JvJFzlAENzZlPBDNGAWC"
    verifiedAt: "2026-10-15"
  - key: "pricing"
    label: "Pricing"
    value: "No blanket fee stated in reviewed OPEN API terms; noncommercial use only"
    sourceUrl: "https://openapi.krx.co.kr/contents/OPP/INFO/OPPINFO002.jsp"
    verifiedAt: "2026-10-15"
  - key: "rate-limits"
    label: "Rate limits"
    value: "10,000 requests or fewer per key per day (00:00–24:00)"
    sourceUrl: "https://openapi.krx.co.kr/contents/OPP/INFO/OPPINFO002.jsp"
    verifiedAt: "2026-10-15"
---

# KRX API

Korea Exchange provides official Korean market data. Use the official KRX OPEN API portal to request a key and approval for each service. The request URL is specific to the approved API specification.

## Key functions (via pykrx community library)

| Function | Description |
|----------|-------------|
| `stock.get_market_ticker_list()` | All tickers by market |
| `stock.get_market_ohlcv()` | OHLCV for date range |
| `stock.get_market_cap()` | Market cap data |
| `stock.get_market_fundamental()` | PER/PBR/dividend yield |
| `stock.get_etf_ticker_list()` | ETF tickers |
| `stock.get_etf_ohlcv()` | ETF OHLCV |
| `stock.get_index_ticker_list()` | Index tickers |
| `bond.get_otc_ticker_list()` | Bond tickers |

## Python example: KRX stock data via pykrx

```python
# pykrx is a community wrapper (not official) for KRX data
# pip install pykrx

from pykrx import stock

# KOSPI tickers
tickers = stock.get_market_ticker_list(market="KOSPI")
print(f"KOSPI tickers: {len(tickers)}")

# Samsung Electronics (005930) OHLCV
df = stock.get_market_ohlcv("20240101", "20241231", "005930")
print(df.tail(3))

# ETF tickers
etf_tickers = stock.get_etf_ticker_list()
print(f"ETF count: {len(etf_tickers)}")
```

**Notes:**
- `pykrx` scrapes KRX web endpoints; not an official API client
- The OPEN API terms limit use to noncommercial purposes, prohibit third-party redistribution, and cap each key at 10,000 requests per day. Review the official terms before integrating
- Korean market holidays differ from US — use `pykrx`'s calendar or KRX holiday data
