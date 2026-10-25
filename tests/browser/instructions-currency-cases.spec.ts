import { expect, test } from '@playwright/test';

const base = process.env.BASE_PATH ?? '/';
const site = process.env.SITE_URL ?? 'https://api-atlas.pages.dev';

for (const [slug, provider, selectionGuide, field] of [
  ['openai-responses-previous-response-id-instructions', 'openai', 'choose-llm-api', 'previous_response_id'],
  ['yfinance-repair-pence-pound-currency-unit-mismatch', 'yfinance', 'choose-stock-market-data-api', 'repair'],
]) {
  test(`${provider} case supports static bilingual reading and discovery`, async ({ browser, page }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await context.newPage();
    try {
      for (const locale of ['', 'ko/']) {
        const path = `${base}${locale}guides/${slug}/`;
        await staticPage.goto(`http://127.0.0.1:4173${path}`);
        await expect(staticPage.locator('h1')).toHaveCount(1);
        await expect(staticPage.locator('[data-guide-author]')).toHaveText('차도녀 gpt may');
        await expect(staticPage.locator('link[rel="canonical"]')).toHaveAttribute('href', `${site}${path}`);
        await expect(staticPage.locator('[data-guide-body]')).toContainText(field);
        await expect(staticPage.locator('pre')).not.toHaveCount(0);
        await expect(staticPage.locator('.language-switch')).toHaveAttribute('href', `${base}${locale ? '' : 'ko/'}guides/${slug}/`);
        await expect(staticPage.locator('#case-providers + ul a')).toHaveAttribute('href', `${base}apis/${provider}/`);
      }
    } finally {
      await context.close();
    }
    await page.goto(`http://127.0.0.1:4173${base}apis/${provider}/`);
    await expect(page.locator(`a[href="${base}guides/${slug}/"]`)).toHaveCount(1);
    await page.goto(`http://127.0.0.1:4173${base}guides/${selectionGuide}/`);
    const link = page.locator(`a[href="../${slug}/"]`);
    await expect(link).toHaveCount(1);
    await link.click();
    await expect(page).toHaveURL(`http://127.0.0.1:4173${base}guides/${slug}/`);
    await page.goto(`http://127.0.0.1:4173${base}ko/guides/`);
    await expect(page.locator(`a[href="${base}ko/guides/${slug}/"]`)).toHaveCount(1);
  });
}
