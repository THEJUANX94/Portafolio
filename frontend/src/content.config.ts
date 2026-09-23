import { defineCollection, reference } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  profileSchema, experienceBase, endAfterStart, endAfterStartMsg,
  projectSchema, skillSchema, courseSchema,
} from './lib/schemas';

const profile = defineCollection({ loader: file('src/data/profile.json'), schema: profileSchema });

const experience = defineCollection({
  loader: file('src/data/experience.json'),
  // Referencias entre colecciones. Astro solo registra el error si un slug no existe; tests/unit/content.test.ts hace fallar la CI.
  schema: experienceBase
    .extend({ projects: z.array(reference('projects')) })
    .refine(endAfterStart, endAfterStartMsg),
});

const projects = defineCollection({ loader: file('src/data/projects.json'), schema: projectSchema });
const skills = defineCollection({ loader: file('src/data/skills.json'), schema: skillSchema });
const courses = defineCollection({ loader: file('src/data/courses.json'), schema: courseSchema });

export const collections = { profile, experience, projects, skills, courses };
