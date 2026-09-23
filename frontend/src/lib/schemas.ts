import { z } from 'astro/zod';
import { YEAR_MONTH } from './dates';

export const localized = z.object({ es: z.string().min(1), en: z.string().min(1) });
export type Localized = z.infer<typeof localized>;

const yearMonth = z.string().regex(YEAR_MONTH, 'Formato esperado YYYY-MM');

export const profileSchema = z.object({
  name: z.string().min(1),
  title: localized,
  summary: localized,
  location: localized,
  available: z.boolean(),
  availabilityNote: localized,
  email: z.email(),
  linkedin: z.url(),
  github: z.url(),
  cv: z.object({ es: z.string().startsWith('/'), en: z.string().startsWith('/') }),
  languages: z.array(z.object({ name: localized, level: localized })),
  photo: z.string().startsWith('/').optional(),
});

export const LINES = ['work', 'projects', 'education'] as const;

/** Sin refinamientos para poder extenderlo en content.config.ts. */
export const experienceBase = z.object({
  line: z.enum(LINES),
  organization: localized,
  role: localized,
  start: yearMonth,
  end: yearMonth.nullable(),
  location: localized.optional(),
  highlights: z.array(localized),
  tech: z.array(z.string()),
  projects: z.array(z.string()),
});

const endAfterStart = (e: { start: string; end: string | null }) => e.end === null || e.end >= e.start;
const endAfterStartMsg = { message: 'La fecha de fin es anterior al inicio', path: ['end'] };

export const experienceSchema = experienceBase.refine(endAfterStart, endAfterStartMsg);

export const projectSchema = z
  .object({
    title: localized,
    tagline: localized,
    problem: localized,
    role: localized,
    solution: localized,
    result: localized,
    metrics: z.array(localized).optional(),
    images: z.array(z.object({ src: z.string().startsWith('/'), alt: localized })),
    tech: z.array(z.string()),
    visibility: z.enum(['full', 'anonymized']),
    repo: z.url().optional(),
    demo: z.url().optional(),
    featured: z.boolean(),
    order: z.number().int(),
  })
  .refine((p) => p.visibility === 'full' || (!p.repo && !p.demo), {
    message: 'Un proyecto anonimizado no puede tener repo ni demo',
    path: ['visibility'],
  });

export const skillSchema = z.object({
  group: localized,
  tech: z.array(z.string()).min(1),
  order: z.number().int(),
});

export const courseSchema = z.object({
  name: localized,
  institution: z.string().min(1),
  hours: z.number().int().positive().optional(),
  year: z.number().int().optional(),
  certificateUrl: z.url().optional(),
  order: z.number().int(),
});

export { endAfterStart, endAfterStartMsg };
