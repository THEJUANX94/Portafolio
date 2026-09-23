import { describe, it, expect } from 'vitest';
import { ogLocale, personJsonLd } from '../../src/lib/seo';

describe('ogLocale', () => {
  it('formato de Open Graph por idioma', () => {
    expect(ogLocale('es')).toBe('es_CO');
    expect(ogLocale('en')).toBe('en_US');
  });
});

describe('personJsonLd', () => {
  const profile = {
    name: 'Juan Sebastián Martínez Noreña',
    title: { es: 'Ingeniero de Software', en: 'Software Engineer' },
    summary: { es: 'Resumen', en: 'Summary' },
    email: 'a@b.co',
    linkedin: 'https://linkedin.com/in/x',
    github: 'https://github.com/x',
    location: { es: 'Boyacá, Colombia', en: 'Boyacá, Colombia' },
    education: { degree: { es: 'Ingeniería', en: 'Engineering' }, institution: 'UPTC', year: 2026 },
  };

  it('Person con cargo, enlaces y formación en el idioma pedido', () => {
    const ld = personJsonLd(profile, 'en', 'https://example.com/en/');
    expect(ld).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Juan Sebastián Martínez Noreña',
      jobTitle: 'Software Engineer',
      description: 'Summary',
      url: 'https://example.com/en/',
      email: 'mailto:a@b.co',
      sameAs: ['https://linkedin.com/in/x', 'https://github.com/x'],
      address: { '@type': 'PostalAddress', addressRegion: 'Boyacá', addressCountry: 'CO' },
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'UPTC' },
    });
  });
});
