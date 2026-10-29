import { en } from './en';
import { es } from './es';
import type { Dict, Lang } from './types';

export type { ApplyPath, Dict, FormField, Lang } from './types';

const dictionaries: Record<Lang, Dict> = { en, es };

export const getDict = (lang: Lang): Dict => dictionaries[lang];

export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'es' : 'en');

/** URL of a page in a given language; the default locale has no prefix. `slug` is '' for home or e.g. 'apply'. */
export const localePath = (lang: Lang, slug = '') => {
  const base = lang === 'en' ? '/' : '/es/';
  return slug ? `${base}${slug}/` : base;
};
