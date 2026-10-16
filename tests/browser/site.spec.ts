import { expect, test } from '@playwright/test';

const basePath = process.env.BASE_PATH ?? '/';
type CompareProvider = {
  name: string; category: string; auth: string; baseUrl: string;
  pricing: string; rateLimit: string; protocols: string[]; formats: string[];
};

test('Compare keeps checked providers, visible columns and data in sync', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const response = await page.request.get('api/catalog.json');
  expect(response.ok()).toBeTruthy();
  const catalog = await response.json();
  const providers: CompareProvider[] = [...catalog.providers].sort((a, b) => a.name.localeCompare(b.name));
  expect(providers.length).toBeGreaterThanOrEqual(5);
  const initial = providers.slice(0, 3);
  const fourth = providers[3];
  const fifth = providers[4];
  await page.goto('compare/');
  const table = page.getByRole('table');
  const headers = table.getByRole('columnheader');
  const checkbox = (provider: CompareProvider) => page.getByRole('checkbox', { name: provider.name, exact: true });
  const assertSelection = async (selected: CompareProvider[]) => {
    const ordered = [...selected].sort((a, b) => a.name.localeCompare(b.name));
    await expect(headers).toHaveText(['Fact', ...ordered.map((provider) => provider.name)]);
    await expect(page.locator('.compare-picker input:checked')).toHaveCount(ordered.length);
    for (const provider of ordered) await expect(checkbox(provider)).toBeChecked();
    const rows: Array<[string, (provider: CompareProvider) => string]> = [
      ['Category', (provider) => provider.category],
      ['Authentication', (provider) => provider.auth],
      ['Base URL', (provider) => provider.baseUrl],
      ['Pricing shape', (provider) => provider.pricing],
      ['Rate limits', (provider) => provider.rateLimit],
      ['Protocols', (provider) => provider.protocols.join(', ')],
      ['Formats', (provider) => provider.formats.join(', ')],
    ];
    for (const [label, value] of rows) {
      const row = table.getByRole('row').filter({ has: page.getByRole('rowheader', { name: label, exact: true }) });
      await expect(row.getByRole('cell')).toHaveText(ordered.map(value));
    }
  };
  await assertSelection(initial);
  await checkbox(fourth).check();
  await assertSelection([...initial, fourth]);
  await checkbox(fifth).click();
  await expect(checkbox(fifth)).not.toBeChecked();
  await expect(page.getByRole('status')).toHaveText('4 providers selected.');
  await assertSelection([...initial, fourth]);
  await checkbox(initial[0]).uncheck();
  await checkbox(initial[1]).uncheck();
  await assertSelection([initial[2], fourth]);
  await checkbox(initial[2]).uncheck();
  await checkbox(fourth).uncheck();
  await assertSelection([]);
  await expect(page.getByRole('status')).toHaveText('Select at least two providers.');
  const keyboardProviders = ['OpenAI API', 'Gemini API'].map((name) => {
    const provider = providers.find((item) => item.name === name);
    expect(provider, `Keyboard test provider ${name} is present`).toBeDefined();
    return provider!;
  });
  for (const provider of keyboardProviders) await checkbox(provider).press('Space');
  await assertSelection(keyboardProviders);
  await expect(page.getByRole('status')).toHaveText('2 providers selected.');
  await page.reload();
  await assertSelection(initial);
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

test('All five requested practical cases are discoverable and readable without JavaScript', async ({ browser }) => {
  const cases = [
    ['eodhd-dividend-delay-cache-refresh', 'EODHD missing dividend data: handle delayed updates and cache refreshes'],
    ['seibro-dividend-pagination-count-mismatch', 'SEIBRO dividend API pagination: reconcile count and collected rows'],
    ['ecos-usd-currency-identity-validation', 'ECOS exchange rate API: prevent selecting a non-USD currency'],
    ['llm-retry-fallback-shared-timeout-budget', 'LLM API retries and fallback: avoid applying timeout budgets twice'],
    ['llm-structured-output-fallback-response-format', 'LLM structured output: preserve response_format through fallback'],
  ];
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto(`http://127.0.0.1:4173${basePath}guides/`);
    for (const [slug, title] of cases) {
      await expect(page.getByRole('link', { name: title, exact: false })).toHaveAttribute('href', `${basePath}guides/${slug}/`);
    }
    for (const [slug, title] of cases) {
      const response = await page.goto(`http://127.0.0.1:4173${basePath}guides/${slug}/`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
      await expect(page.locator('[data-guide-body]').getByRole('heading', { level: 2 })).toHaveText(['Symptoms', 'Cause', 'Safe resolution', 'Verification', 'Limitations']);
      await expect(page.locator('[data-guide-body] pre code')).toBeVisible();
      await expect(page.locator('[data-guide-author]')).toHaveText('API Atlas');
      const canonical = new URL(`${basePath}guides/${slug}/`, process.env.SITE_URL ?? 'https://api-atlas.pages.dev').href;
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    }
    await page.goto(`http://127.0.0.1:4173${basePath}apis/seibro/`);
    await expect(page.getByRole('link', { name: cases[1][1], exact: true })).toHaveAttribute('href', `${basePath}guides/${cases[1][0]}/`);
  } finally { await context.close(); }
});
