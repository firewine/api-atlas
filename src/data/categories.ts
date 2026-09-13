export const categories = {
  ai: {
    name: 'AI & model APIs',
    eyebrow: 'Intelligence layer',
    description: 'Model APIs for text, multimodal input, tools, structured output, and agent workflows.',
    accent: '#ff6b35',
  },
  'market-data': {
    name: 'Market data',
    eyebrow: 'Prices & fundamentals',
    description: 'Market prices, reference data, corporate actions, fundamentals, and developer libraries.',
    accent: '#16a085',
  },
  'public-data': {
    name: 'Public data',
    eyebrow: 'Official datasets',
    description: 'Government and central-bank datasets published through official open APIs.',
    accent: '#4f46e5',
  },
  'currency-data': {
    name: 'Currency data',
    eyebrow: 'FX rates',
    description: 'Current and historical foreign-exchange rates and currency conversion services.',
    accent: '#a855f7',
  },
} as const;

export type CategorySlug = keyof typeof categories;

export function getCategory(slug: string) {
  return categories[slug as CategorySlug];
}
