// @ts-check
/** @typedef {{ triggerSearch: (term: string) => void }} PagefindInstance */
/** @typedef {new (options: object) => PagefindInstance} PagefindConstructor */

const root = /** @type {HTMLElement | null} */ (document.querySelector('#search'));
const searchStatus = /** @type {HTMLElement | null} */ (document.querySelector('#search-status'));
if (!root || !searchStatus) throw new Error('Search elements are missing');
const statusElement = searchStatus;
const ko = document.documentElement.lang === 'ko';
const messages = ko ? {
  assets: '검색 화면을 불러오지 못했습니다. 페이지를 새로고침해 주세요.',
  empty: '검색어를 입력하세요.',
  data: '검색 데이터를 불러오지 못했습니다. 새로고침하거나 한국어 가이드 목록을 이용해 주세요.',
} : {
  assets: 'Search could not load. Check that search assets are available, then reload.',
  empty: 'Enter a search term.',
  data: 'Search data could not load. Please reload or browse the API catalog.',
};

const base = root.dataset.basePath;
if (!base) throw new Error('Search base path is missing');

async function initializeSearch() {
  const searchWindow = /** @type {Window & { PagefindUI?: PagefindConstructor }} */ (window);
  const PagefindUI = searchWindow.PagefindUI;
  if (!PagefindUI) {
    statusElement.textContent = messages.assets;
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
    statusElement.textContent = query ? '' : messages.empty;
    if (query) search.triggerSearch(query);
  } catch (error) {
    statusElement.textContent = messages.data;
    console.error('Search initialization failed', error);
  }
}

void initializeSearch();
export {};
