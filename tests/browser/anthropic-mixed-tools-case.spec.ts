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
  await page.goto(`http://127.0.0.1:4173${base}apis/anthropic/`);
  await expect(page.locator(`a[href="${base}guides/${slug}/"]`)).toHaveCount(1);
  await page.goto(`http://127.0.0.1:4173${base}guides/choose-llm-api/`);
  const operationalLink = page.getByRole('link', {
    name: 'Anthropic Claude delayed-result and 400 continuation case', exact: true,
  });
  await expect(operationalLink).toHaveCount(1);
  await expect(operationalLink).toHaveAttribute('href', `../${slug}/`);
  await operationalLink.click();
  await expect(page).toHaveURL(`http://127.0.0.1:4173${base}guides/${slug}/`);
  await expect(page.locator('h1')).toContainText('Anthropic Claude API');
  await page.goto(`http://127.0.0.1:4173${base}ko/guides/`);
  await expect(page.locator(`a[href="${base}ko/guides/${slug}/"]`)).toHaveCount(1);
});
