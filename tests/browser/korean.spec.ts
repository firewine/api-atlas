import { expect, test } from '@playwright/test';

const base = process.env.BASE_PATH ?? '/';
const site = process.env.SITE_URL ?? 'https://api-atlas.pages.dev';
const guideIds = ['seibro-dividend-pagination-count-mismatch', 'eodhd-seibro-korean-dividend-source-selection',
  'ecos-usd-currency-identity-validation', 'choose-stock-market-data-api', 'yfinance-adj-close-auto-adjust-multiindex'];
const detailKeys = [...guideIds.map(id => `guides/${id}/`),
  ...['seibro', 'eodhd', 'bok-ecos', 'fsc-data-go-kr'].map(id => `apis/${id}/`), 'compare/fsc-data-go-kr-vs-bok-ecos/'];

test('Korean details are static, have reciprocal language links and preserve source review dates', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    for (const key of detailKeys) {
      const url = `http://127.0.0.1:4173${base}ko/${key}`;
      expect((await page.goto(url))?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(/[가-힣]/);
      await expect(page.locator('[data-guide-body], [data-translation-body]')).toContainText(/[가-힣]/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new URL(`${base}ko/${key}`, site).href);
      await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', new URL(`${base}${key}`, site).href);
      await expect(page.locator('link[hreflang="ko"]')).toHaveAttribute('href', new URL(`${base}ko/${key}`, site).href);
      const schemas: Array<Record<string, unknown>> = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent() ?? '[]');
      expect(schemas.find(item => item['@type'] === 'TechArticle')?.inLanguage).toBe('ko');
      await expect(page.getByText('번역 검토일:', { exact: false })).toBeVisible();
      await page.locator('.language-switch').click();
      await expect(page).toHaveURL(`http://127.0.0.1:4173${base}${key}`);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator('link[hreflang="ko"]')).toHaveAttribute('href', new URL(`${base}ko/${key}`, site).href);
      await page.locator('.language-switch').click();
      await expect(page).toHaveURL(url);
    }
    await page.goto(`http://127.0.0.1:4173${base}ko/guides/yfinance-adj-close-auto-adjust-multiindex/`);
    await expect(page.locator('#case-providers').locator('..').getByRole('link')).toHaveAttribute('href', `${base}apis/yfinance/`);
    await expect(page.locator('#case-providers').locator('..').getByRole('link')).toContainText('영문');
    await page.goto(`http://127.0.0.1:4173${base}apis/yfinance/`);
    await expect(page.locator('link[hreflang]')).toHaveCount(0);
    const koreanCases = page.locator('#korean-cases').locator('..');
    for (const slug of ['yfinance-adj-close-auto-adjust-multiindex', 'yfinance-repair-pence-pound-currency-unit-mismatch']) {
      const caseLink = koreanCases.locator(`a[href="${base}ko/guides/${slug}/"]`);
      await expect(caseLink).toHaveCount(1);
      await expect(caseLink).toBeVisible();
      await caseLink.click();
      await expect(page).toHaveURL(`http://127.0.0.1:4173${base}ko/guides/${slug}/`);
      await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
      await page.goBack();
      await expect(page).toHaveURL(`http://127.0.0.1:4173${base}apis/yfinance/`);
    }
  } finally { await context.close(); }
});

test('Korean home and guide list prioritize SEIBRO and the Korean dividend source case', async ({ page }) => {
  for (const key of ['ko/', 'ko/guides/']) {
    await page.goto(key);
    const cards = page.locator('.guide-grid .guide-card');
    await expect(cards.nth(0)).toHaveAttribute('href', `${base}ko/guides/${guideIds[0]}/`);
    await expect(cards.nth(1)).toHaveAttribute('href', `${base}ko/guides/${guideIds[1]}/`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.language-switch')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

for (const query of ['배당', '세이브로', 'SEIBRO', 'EODHD', '배당 지급일', '배당지급일', 'Adj Close', 'stock_page_coverage_mismatch']) {
  test(`Korean Pagefind resolves ${query} against published Korean pages`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(`ko/search/?q=${encodeURIComponent(query)}`);
    const search = page.getByRole('textbox');
    await expect(search).toHaveValue(query);
    await expect(search).toHaveAttribute('placeholder', /검색/);
    const result = page.locator('.pagefind-ui__result-title a');
    await expect(result.first()).toBeVisible();
    for (const href of await result.evaluateAll(links => links.map(link => link.getAttribute('href')))) {
      expect(href).toMatch(new RegExp(`^${base}ko/`));
    }
    const expectedPath = query === 'Adj Close' ? 'yfinance-adj-close-auto-adjust-multiindex'
      : query === 'stock_page_coverage_mismatch' ? 'seibro-dividend-pagination-count-mismatch'
      : query.includes('지급일') ? 'eodhd-seibro-korean-dividend-source-selection'
      : query === 'EODHD' ? 'eodhd' : 'seibro';
    await expect(page.locator(`.pagefind-ui__result-title a[href*="${expectedPath}"]`).first()).toBeVisible();
    await result.first().click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    expect(errors).toEqual([]);
  });
}

test('Korean search empty, missing results and failed assets have Korean feedback', async ({ page }) => {
  await page.goto('ko/search/');
  await expect(page.getByRole('status')).toHaveText('검색어를 입력하세요.');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
  await expect(page.locator('link[hreflang]')).toHaveCount(0);
  await page.getByRole('textbox').fill('qzxjv918273645abcdxyz');
  await expect(page.locator('.pagefind-ui__message')).toContainText('qzxjv918273645abcdxyz');
  await expect(page.locator('.pagefind-ui__message')).toContainText(/[가-힣]/);
  await expect(page.locator('.pagefind-ui__result-title a')).toHaveCount(0);
  // Only external asset failure is simulated; successful searches use the real index.
  await page.route('**/pagefind/pagefind-ui.js', route => route.fulfill({ status: 404, body: 'Not found' }));
  await page.goto('ko/search/?q=배당');
  await expect(page.getByRole('status')).toHaveText('검색 화면을 불러오지 못했습니다. 페이지를 새로고침해 주세요.');
});
