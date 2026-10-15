import { expect, test } from '@playwright/test';

const basePath = process.env.BASE_PATH ?? '/';
const initial = ['Fact', 'Alpha Vantage', 'BOK ECOS', 'Claude API'];

test('Compare keeps checked providers, visible columns and data in sync', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto('compare/');
  const headers = page.getByRole('table').getByRole('columnheader');
  await expect(headers).toHaveText(initial);
  await page.getByRole('checkbox', { name: 'Cloudflare API', exact: true }).check();
  await expect(headers).toHaveText([...initial, 'Cloudflare API']);
  await expect(page.getByRole('row', { name: 'Category market-data public-data ai developer-platform', exact: true })).toBeVisible();
  await page.getByRole('checkbox', { name: 'CoinGecko API', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'CoinGecko API', exact: true })).not.toBeChecked();
  await expect(page.getByRole('status')).toHaveText('4 providers selected.');
  await expect(headers).toHaveText([...initial, 'Cloudflare API']);
  await page.getByRole('checkbox', { name: 'Alpha Vantage', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: 'BOK ECOS', exact: true }).uncheck();
  await expect(headers).toHaveText(['Fact', 'Claude API', 'Cloudflare API']);
  await expect(page.getByRole('row', { name: 'Category ai developer-platform', exact: true })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Claude API', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: 'Cloudflare API', exact: true }).uncheck();
  await expect(headers).toHaveText(['Fact']);
  await expect(page.getByRole('status')).toHaveText('Select at least two providers.');
  await page.getByRole('checkbox', { name: 'OpenAI API', exact: true }).press('Space');
  await page.getByRole('checkbox', { name: 'Gemini API', exact: true }).press('Space');
  await expect(headers).toHaveText(['Fact', 'Gemini API', 'OpenAI API']);
  await expect(page.getByRole('status')).toHaveText('2 providers selected.');
  await page.reload();
  await expect(headers).toHaveText(initial);
  expect(errors).toEqual([]);
});

test('Search uses query parameters, renders results and preserves the public mount path', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto('search/?q=openai');
  await expect(page.getByRole('textbox', { name: 'Search', exact: true })).toHaveValue('openai');
  const result = page.getByRole('link', { name: 'OpenAI API', exact: true });
  await expect(result).toHaveAttribute('href', `${basePath}apis/openai/`);
  await result.click();
  await expect(page).toHaveURL(new RegExp(`${basePath}apis/openai/$`));
  await page.getByRole('link', { name: 'API Atlas home', exact: true }).click();
  await expect(page).toHaveURL(`http://127.0.0.1:4173${basePath}`);
  await page.goto('guides/choose-llm-api/');
  await page.getByRole('link', { name: 'OpenAI and Anthropic', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${basePath}compare/openai-vs-anthropic/$`));
  expect(errors).toEqual([]);
});

test('Search distinguishes an empty query and a query without results', async ({ page }) => {
  await page.goto('search/');
  await expect(page.getByRole('status')).toHaveText('Enter a search term.');
  await page.getByRole('textbox', { name: 'Search', exact: true }).fill('"qzxjv918273645abcdxyz"');
  await expect(page.getByText('No results for "qzxjv918273645abcdxyz"', { exact: true })).toBeVisible();
});

test('Search reports a failed UI asset instead of leaving a blank page', async ({ page }) => {
  await page.route('**/pagefind/pagefind-ui.js', (route) => route.fulfill({ status: 404, body: 'Not found' }));
  await page.goto('search/?q=openai');
  await expect(page.getByRole('status')).toHaveText('Search could not load. Check that search assets are available, then reload.');
  await expect(page.getByRole('link', { name: 'APIs', exact: true })).toHaveAttribute('href', `${basePath}apis/`);
});

test('Guide body and matching article metadata are available without JavaScript or login', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    const response = await page.goto(`http://127.0.0.1:4173${basePath}guides/retry-and-backoff/`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('How to design API retries and backoff');
    await expect(page.getByRole('heading', { name: 'Classify before retrying', exact: true })).toBeVisible();
    await expect(page.locator('[data-guide-author]')).toHaveText('API Atlas');
    await expect(page.locator('[data-guide-body] pre code')).toContainText('function backoff');
    const schemas = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent() ?? '[]');
    const article = schemas.find((item: Record<string, unknown>) => item['@type'] === 'TechArticle');
    expect(article.author.name).toBe(await page.locator('[data-guide-author]').textContent());
    expect(article.dateModified).toBe(await page.locator('time').first().getAttribute('datetime'));
    expect(article.mainEntityOfPage).toBe(await page.locator('link[rel="canonical"]').getAttribute('href'));
  } finally { await context.close(); }
});
