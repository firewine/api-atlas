import type { CategorySlug } from '../data/categories';
import { getKoreanApis, getKoreanGuides, getKoreanComparisons } from './translations';

export type Locale = 'en' | 'ko';
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Only site-relative route keys enter here; assets always use the English root. */
export function route(path = '', locale: Locale = 'en') {
  if (path.startsWith('/') || path.includes('..') || path.includes('://') || path.startsWith('ko/')) {
    throw new Error(`Invalid site route: ${path}`);
  }
  return `${base}/${locale === 'ko' ? 'ko/' : ''}${path}`;
}

export function routeKey(pathname: string) {
  if (!pathname.startsWith(`${base}/`)) throw new Error('Page escaped the configured base path');
  return pathname.slice(base.length + 1).replace(/^ko\//, '');
}

/** The actual collections, not a speculative slug list, own publication. */
export async function translatedRoutes() {
  const [guides, apis, comparisons] = await Promise.all([getKoreanGuides(), getKoreanApis(), getKoreanComparisons()]);
  return new Set(['', 'guides/', 'search/',
    ...guides.map(({ source }) => `guides/${source.id}/`),
    ...apis.map(({ source }) => `apis/${source.id}/`),
    ...comparisons.map(({ source }) => `compare/${source.id}/`),
  ]);
}

export function contentLink(path: string, locale: Locale, published: ReadonlySet<string>) {
  const language = locale === 'ko' && published.has(path) ? 'ko' : 'en';
  return { href: route(path, language), suffix: locale === 'ko' && language === 'en' ? ' (영문)' : '' };
}

export const koreanCategories: Record<CategorySlug, string> = {
  ai: 'AI·모델 API', 'market-data': '시장 데이터', 'public-data': '공공 데이터',
  'currency-data': '환율 데이터', 'developer-platform': '개발 플랫폼',
  payments: '결제', communications: '메시지·협업', 'mapping-weather': '지도·날씨',
};

export const koreanStatus = { active: '제공 중', legacy: '레거시', research: '조사 단계' } as const;

export function guidePriority(id: string) {
  const priority = ['seibro-dividend-pagination-count-mismatch', 'eodhd-seibro-korean-dividend-source-selection',
    'ecos-usd-currency-identity-validation', 'choose-stock-market-data-api', 'yfinance-adj-close-auto-adjust-multiindex'];
  const index = priority.indexOf(id);
  return index === -1 ? priority.length : index;
}
