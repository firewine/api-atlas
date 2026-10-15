---
name: "KRX API"
provider: "Korea Exchange"
category: "market-data"
status: "active"
officialDocs: "https://www.krx.co.kr/"
homepage: "https://www.krx.co.kr/"
baseUrl: "https://www.krx.co.kr/api"
auth: "Varies by data product; some require registration"
versioning: "Product-specific"
resourceGroups: ["Stock prices", "ETF/ETN", "Derivatives", "Bond", "Market statistics"]
pagination: "Date-range based queries"
errors: "Korean-language error messages"
webhooks: "Not supported"
sdks: ["Community Python wrappers"]
summary: "Official market data from Korea Exchange — KOSPI, KOSDAQ, ETF prices, and trading statistics."
pricing: "Free for delayed data; real-time requires license"
rateLimit: "Undisclosed; use reasonable request rates"
formats: ["JSON", "CSV", "XML"]
protocols: ["REST"]
bestFor: ["Korean stock market data", "KOSPI/KOSDAQ prices", "ETF information"]
cautions: ["Documentation is primarily in Korean.", "Real-time data requires commercial license.", "Some endpoints change without notice."]
verifiedAt: "2026-10-15"
sourceUrls: ["https://www.krx.co.kr/"]
mutableFacts:
  - label: "Base"
    value: "https://www.krx.co.kr"
    sourceUrl: "https://www.krx.co.kr/"
    verifiedAt: "2026-10-15"
---

# KRX API

Korea Exchange provides official Korean market data. The primary web interface is in Korean; API access patterns vary by data product.

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
- For production, evaluate KRX's official data products and licensing
- Korean market holidays differ from US — use `pykrx`'s calendar or KRX holiday data
