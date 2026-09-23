import type { Locale } from './i18n';
import type { Localized } from './schemas';

const OG_LOCALE: Record<Locale, string> = { es: 'es_CO', en: 'en_US' };

export function ogLocale(locale: Locale): string {
  return OG_LOCALE[locale];
}

interface PersonSource {
  name: string;
  title: Localized;
  summary: Localized;
  email: string;
  linkedin: string;
  github: string;
  education: { institution: string };
}

/** JSON-LD schema.org/Person para la página principal. */
export function personJsonLd(profile: PersonSource, locale: Locale, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title[locale],
    description: profile.summary[locale],
    url: pageUrl,
    email: `mailto:${profile.email}`,
    sameAs: [profile.linkedin, profile.github],
    address: { '@type': 'PostalAddress', addressRegion: 'Boyacá', addressCountry: 'CO' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: profile.education.institution },
  };
}
