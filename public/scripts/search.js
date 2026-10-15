// @ts-check
/** @typedef {{ triggerSearch: (term: string) => void }} PagefindInstance */
/** @typedef {new (options: object) => PagefindInstance} PagefindConstructor */

const root = /** @type {HTMLElement | null} */ (document.querySelector('#search'));
const searchStatus = /** @type {HTMLElement | null} */ (document.querySelector('#search-status'));
if (!root || !searchStatus) throw new Error('Search elements are missing');
const statusElement = searchStatus;

const base = root.dataset.basePath;
if (!base) throw new Error('Search base path is missing');

async function initializeSearch() {
  const searchWindow = /** @type {Window & { PagefindUI?: PagefindConstructor }} */ (window);
  const PagefindUI = searchWindow.PagefindUI;
  if (!PagefindUI) {
    statusElement.textContent = 'Search could not load. Check that search assets are available, then reload.';
    return;
  }

  try {
    /** @type {{ init: () => Promise<void>, search: (term: string) => Promise<unknown> }} */
    const pagefind = await import(`${base}pagefind/pagefind.js`);
    await pagefind.init();
    const query = new URLSearchParams(window.location.search).get('q')?.trim();
    await pagefind.search(query || 'atlas');
    const search = new PagefindUI({
      element: '#search', showSubResults: true, showImages: false, autofocus: true,
      baseUrl: base, bundlePath: `${base}pagefind/`, noWorker: true,
    });
    statusElement.textContent = query ? '' : 'Enter a search term.';
    if (query) search.triggerSearch(query);
  } catch (error) {
    statusElement.textContent = 'Search data could not load. Please reload or browse the API catalog.';
    console.error('Search initialization failed', error);
  }
}

void initializeSearch();
export {};
