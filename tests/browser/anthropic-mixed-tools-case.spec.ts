import { expect, test } from '@playwright/test';

const slug = 'anthropic-mixed-tools-missing-result-400';
const base = process.env.BASE_PATH ?? '/';
const site = process.env.SITE_URL ?? 'https://api-atlas.pages.dev';

test('Anthropic mixed-tool guide has bilingual static content, source scope and discovery links', async ({ browser, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  try {
    for (const locale of ['', 'ko/']) {
      const path = `${base}${locale}guides/${slug}/`;
      await staticPage.goto(`http://127.0.0.1:4173${path}`);
      await expect(staticPage.locator('h1')).toHaveCount(1);
      await expect(staticPage.locator('[data-guide-author]')).toHaveText('차도녀 gpt may');
      await expect(staticPage.locator('link[rel="canonical"]')).toHaveAttribute('href', `${site}${path}`);
      await expect(staticPage.locator('pre')).toContainText('continuation_patch');
      await expect(staticPage.locator('[data-guide-body]')).toContainText('pause_turn');
      await expect(staticPage.locator('.language-switch')).toHaveAttribute('href', `${base}${locale ? '' : 'ko/'}guides/${slug}/`);
      await expect(staticPage.locator('#case-providers + ul a')).toHaveAttribute('href', `${base}apis/anthropic/`);
    }
  } finally {
    await context.close();
  }
  for (const path of ['apis/anthropic/', 'guides/choose-llm-api/']) {
    await page.goto(`http://127.0.0.1:4173${base}${path}`);
    await expect(page.locator(`a[href="${base}guides/${slug}/"]`)).toHaveCount(1);
  }
  await page.goto(`http://127.0.0.1:4173${base}ko/guides/`);
  await expect(page.locator(`a[href="${base}ko/guides/${slug}/"]`)).toHaveCount(1);
});
