import { expect, test } from '@playwright/test';
import { categories } from '../../src/data/categories';
import type { apiToJson } from '../../src/lib/content';

const basePath = process.env.BASE_PATH ?? '/';
const categoryEntries = Object.entries(categories);
const labels = ['All', ...categoryEntries.map(([, category]) => category.name)];
const paths = [`${basePath}apis/`, ...categoryEntries.map(([slug]) => `${basePath}categories/${slug}/`)];

test.use({ javaScriptEnabled: false });

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`Catalog category navigation remains available through every selection at ${viewport.width}px without JavaScript`, async ({ page, request }) => {
    await page.setViewportSize(viewport);
    const catalogResponse = await request.get('api/catalog.json');
    expect(catalogResponse.status()).toBe(200);
    const catalog: { providers: ReturnType<typeof apiToJson>[] } = await catalogResponse.json();
    const allNames = catalog.providers.map((provider) => provider.name);
    expect(allNames.length).toBeGreaterThan(0);
    const response = await page.goto('apis/');
    expect(response?.status()).toBe(200);
    const navigation = page.getByRole('navigation', { name: 'API categories', exact: true });
    const links = navigation.getByRole('link');
    const cards = page.locator('.provider-grid').getByRole('heading', { level: 3 });
    await expect(cards).toHaveText(allNames);

    for (const [slug, category] of categoryEntries) {
      await navigation.getByRole('link', { name: category.name, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${basePath}categories/${slug}/$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(category.name);
      await expect(navigation).toBeVisible();
      await expect(links).toHaveText(labels);
      expect(await links.evaluateAll((items) => items.map((item) => item.getAttribute('href')))).toEqual(paths);
      await expect(navigation.locator('[aria-current="page"]')).toHaveText(category.name);
      await expect(navigation.locator('a.active')).toHaveText(category.name);
      const expectedNames = catalog.providers.filter((provider) => provider.category === slug).map((provider) => provider.name);
      expect(expectedNames.length).toBeGreaterThan(0);
      await expect(cards).toHaveText(expectedNames);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }

    await page.reload();
    await expect(navigation.locator('[aria-current="page"]')).toHaveText(categories['mapping-weather'].name);
    await navigation.getByRole('link', { name: 'All', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${basePath}apis/$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The API catalog.');
    await expect(links).toHaveText(labels);
    await expect(navigation.locator('[aria-current="page"]')).toHaveText('All');
    await expect(navigation.locator('a.active')).toHaveText('All');
    await expect(cards).toHaveText(allNames);
  });
}
