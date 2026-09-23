import es from './es.json';
import en from './en.json';
import type { Locale } from '../lib/i18n';

export type UiKey = keyof typeof es;
const STRINGS: Record<Locale, Record<UiKey, string>> = { es, en };

export function t(locale: Locale, key: UiKey): string {
  return STRINGS[locale][key];
}
