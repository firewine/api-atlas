export const changeEvents = [
  {
    id: '2026-09-13-catalog-expansion',
    date: '2026-09-13',
    type: 'catalog',
    title: 'Catalog expanded to 25 providers',
    summary: 'Added fifteen official-source profiles spanning public data, developer platforms, payments, communications, maps, and weather.',
    affectedProviders: ['sec-edgar', 'fred', 'treasury-fiscal-data', 'world-bank', 'coingecko', 'github-rest', 'cloudflare', 'supabase', 'stripe', 'paddle', 'twilio', 'slack', 'notion', 'open-meteo', 'mapbox'],
  },
  {
    id: '2026-09-13-seed-catalog',
    date: '2026-09-13',
    type: 'catalog',
    title: 'Initial verified seed catalog',
    summary: 'Added ten source-backed provider profiles across AI, market data, public data, and currency data.',
    affectedProviders: ['eodhd', 'bok-ecos', 'fsc-data-go-kr', 'openai', 'anthropic', 'gemini', 'massive', 'alpha-vantage', 'yfinance', 'currencylayer'],
  },
  {
    id: '2026-09-13-crawler-policy',
    date: '2026-09-13',
    type: 'policy',
    title: 'Crawler controls documented',
    summary: 'Separated search and retrieval access from model-training controls in robots.txt and the source policy.',
    affectedProviders: [],
  },
] as const;
