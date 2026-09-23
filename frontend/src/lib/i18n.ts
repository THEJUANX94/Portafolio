export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'es';

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (LOCALES as readonly string[]).includes(value);
}

/** Primer idioma soportado según la lista del navegador (navigator.languages). */
export function pickLocale(languages: readonly string[]): Locale {
  for (const lang of languages) {
    const base = lang.toLowerCase().split('-')[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'es' ? 'en' : 'es';
}

/** '/es/experiencia/' + 'en' → '/en/experiencia/'. Rutas sin prefijo → raíz del idioma. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0 || !isLocale(segments[0])) return `/${target}/`;
  const rest = segments.slice(1);
  return rest.length === 0 ? `/${target}/` : `/${target}/${rest.join('/')}/`;
}
