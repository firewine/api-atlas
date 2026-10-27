import { expect, test } from '@playwright/test';
const base = process.env.BASE_PATH ?? '/';
const site = process.env.SITE_URL ?? 'https://api-atlas.pages.dev';
test.use({ javaScriptEnabled: false });
for (const [slug, provider, snippet] of [
  ['alpaca-py-txse-assetexchange-validation-error', 'alpaca', 'inspect_catalog'],
  ['deepseek-search-401-proxy-credential-endpoint', 'deepseek', 'checkToolRoute'],
]) {
  test(`${slug} has static reading, canonical and provider discovery`, async ({ page }) => {
    const path = `${base}guides/${slug}/`;
    await page.goto(`http://127.0.0.1:4173${path}`);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('[data-guide-author]')).toHaveText('차도녀 gpt may');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${site}${path}`);
    await expect(page.locator('pre')).toContainText(snippet);
    await expect(page.locator('#case-providers + ul a')).toHaveAttribute('href', `${base}apis/${provider}/`);
    await page.goto(`http://127.0.0.1:4173${base}apis/${provider}/`);
    await expect(page.locator(`a[href="${path}"]`)).toHaveCount(1);
  });
}
