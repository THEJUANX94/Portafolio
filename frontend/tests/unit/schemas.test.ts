import { describe, it, expect } from 'vitest';
import {
  localized, profileSchema, experienceSchema, projectSchema, skillSchema, courseSchema,
} from '../../src/lib/schemas';

const L = (s: string) => ({ es: s, en: s });

const baseProject = {
  title: L('Ancla'), tagline: L('t'), problem: L('p'), role: L('r'), solution: L('s'), result: L('x'),
  tech: ['Java'], visibility: 'full' as const, featured: true, order: 1, images: [],
};

describe('localized', () => {
  it('exige ambos idiomas no vacíos', () => {
    expect(localized.safeParse({ es: 'Hola', en: 'Hi' }).success).toBe(true);
    expect(localized.safeParse({ es: 'Hola' }).success).toBe(false);
    expect(localized.safeParse({ es: 'Hola', en: '' }).success).toBe(false);
  });
});

describe('projectSchema', () => {
  it('acepta proyecto completo con repo', () => {
    expect(projectSchema.safeParse({ ...baseProject, repo: 'https://github.com/THEJUANX94/Ancla' }).success).toBe(true);
  });
  it('rechaza proyecto anonimizado con repo o demo', () => {
    expect(projectSchema.safeParse({ ...baseProject, visibility: 'anonymized', repo: 'https://github.com/x/y' }).success).toBe(false);
    expect(projectSchema.safeParse({ ...baseProject, visibility: 'anonymized', demo: 'https://x.co' }).success).toBe(false);
  });
  it('acepta proyecto anonimizado sin enlaces', () => {
    expect(projectSchema.safeParse({ ...baseProject, visibility: 'anonymized' }).success).toBe(true);
  });
  it('exige alt bilingüe en imágenes', () => {
    expect(projectSchema.safeParse({ ...baseProject, images: [{ src: '/img/a.png', alt: { es: 'a' } }] }).success).toBe(false);
  });
});

describe('experienceSchema', () => {
  const exp = { line: 'work', organization: L('Gob'), role: L('Dev'), start: '2025-08', end: null, highlights: [L('h')], tech: [], projects: [] };
  it('acepta fin null (hoy)', () => {
    expect(experienceSchema.safeParse(exp).success).toBe(true);
  });
  it('rechaza línea desconocida y fechas mal formadas', () => {
    expect(experienceSchema.safeParse({ ...exp, line: 'freelance' }).success).toBe(false);
    expect(experienceSchema.safeParse({ ...exp, start: '2025-8' }).success).toBe(false);
  });
  it('rechaza fin anterior al inicio', () => {
    expect(experienceSchema.safeParse({ ...exp, start: '2026-01', end: '2025-12' }).success).toBe(false);
  });
});

const validProfile = {
  name: 'Juan', title: L('t'), summary: L('s'), location: L('l'), available: true, availabilityNote: L('n'),
  email: 'a@b.co', linkedin: 'https://linkedin.com/in/x', github: 'https://github.com/x',
  cv: { es: '/cv/a.pdf', en: '/cv/b.pdf' }, languages: [{ name: L('Español'), level: L('Nativo') }],
  education: { degree: L('Ingeniería'), institution: 'UPTC', year: 2026 },
};

describe('profileSchema, skillSchema, courseSchema', () => {
  it('validan entradas mínimas', () => {
    expect(profileSchema.safeParse(validProfile).success).toBe(true);
    expect(skillSchema.safeParse({ group: L('g'), tech: ['Docker'], order: 1 }).success).toBe(true);
    expect(courseSchema.safeParse({ name: L('Java'), institution: 'Boomlabs', hours: 200, order: 1 }).success).toBe(true);
  });
  it('rechaza email inválido', () => {
    expect(profileSchema.safeParse({ ...validProfile, email: 'no-es-email' }).success).toBe(false);
  });
  it('exige la formación en el perfil', () => {
    const { education: _omit, ...withoutEducation } = validProfile;
    expect(profileSchema.safeParse(withoutEducation).success).toBe(false);
  });
});
