import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { ZodType } from 'astro/zod';
import profileData from '../../src/data/profile.json';
import experienceData from '../../src/data/experience.json';
import projectsData from '../../src/data/projects.json';
import skillsData from '../../src/data/skills.json';
import coursesData from '../../src/data/courses.json';
import {
  profileSchema,
  experienceSchema,
  projectSchema,
  skillSchema,
  courseSchema,
} from '../../src/lib/schemas';

const publicDir = fileURLToPath(new URL('../../public', import.meta.url));

type WithId = { id: string; [key: string]: unknown };

function assertAllParse(name: string, entries: WithId[], schema: ZodType) {
  for (const entry of entries) {
    const { id, ...rest } = entry;
    const result = schema.safeParse(rest);
    expect(
      result.success,
      result.success
        ? ''
        : `${name} entry "${id}" failed schema: ${JSON.stringify(result.error.issues, null, 2)}`,
    ).toBe(true);
  }
}

function assertUniqueNonEmptyIds(name: string, entries: WithId[]) {
  const ids = entries.map((e) => e.id);
  for (const id of ids) {
    expect(typeof id === 'string' && id.length > 0, `${name} has an empty or missing id`).toBe(true);
  }
  const unique = new Set(ids);
  expect(unique.size, `${name} has duplicate ids: ${ids.join(', ')}`).toBe(ids.length);
}

describe('profile.json', () => {
  it('cada entrada valida contra profileSchema', () => {
    assertAllParse('profile.json', profileData as WithId[], profileSchema);
  });

  it('ids únicos y no vacíos', () => {
    assertUniqueNonEmptyIds('profile.json', profileData as WithId[]);
  });

  it('tiene exactamente una entrada con id "main"', () => {
    const mains = (profileData as WithId[]).filter((e) => e.id === 'main');
    expect(mains.length).toBe(1);
  });

  it('los PDFs de profile.cv existen bajo public/', () => {
    for (const entry of profileData as Array<{ id: string; cv: { es: string; en: string } }>) {
      for (const locale of ['es', 'en'] as const) {
        const relativePath = entry.cv[locale].replace(/^\//, '');
        const absolutePath = `${publicDir}/${relativePath}`;
        expect(existsSync(absolutePath), `${entry.id}: cv.${locale} no existe en ${absolutePath}`).toBe(
          true,
        );
      }
    }
  });
});

describe('experience.json', () => {
  it('cada entrada valida contra experienceSchema', () => {
    assertAllParse('experience.json', experienceData as WithId[], experienceSchema);
  });

  it('ids únicos y no vacíos', () => {
    assertUniqueNonEmptyIds('experience.json', experienceData as WithId[]);
  });

  it('cada proyecto referenciado existe en projects.json', () => {
    const projectIds = new Set((projectsData as WithId[]).map((p) => p.id));
    for (const entry of experienceData as Array<{ id: string; projects: string[] }>) {
      for (const projectId of entry.projects) {
        expect(
          projectIds.has(projectId),
          `experience "${entry.id}" referencia proyecto inexistente "${projectId}"`,
        ).toBe(true);
      }
    }
  });
});

describe('projects.json', () => {
  it('cada entrada valida contra projectSchema', () => {
    assertAllParse('projects.json', projectsData as WithId[], projectSchema);
  });

  it('ids únicos y no vacíos', () => {
    assertUniqueNonEmptyIds('projects.json', projectsData as WithId[]);
  });
});

describe('skills.json', () => {
  it('cada entrada valida contra skillSchema', () => {
    assertAllParse('skills.json', skillsData as WithId[], skillSchema);
  });

  it('ids únicos y no vacíos', () => {
    assertUniqueNonEmptyIds('skills.json', skillsData as WithId[]);
  });
});

describe('courses.json', () => {
  it('cada entrada valida contra courseSchema', () => {
    assertAllParse('courses.json', coursesData as WithId[], courseSchema);
  });

  it('ids únicos y no vacíos', () => {
    assertUniqueNonEmptyIds('courses.json', coursesData as WithId[]);
  });
});
