import { byOrder } from './home';

/** Proyecto anterior y siguiente según `order`. */
export function neighbors<T extends { id: string; order: number }>(
  items: readonly T[],
  id: string,
): { prev: T | undefined; next: T | undefined } {
  const sorted = byOrder(items);
  const index = sorted.findIndex((p) => p.id === id);
  if (index === -1) throw new Error(`Proyecto inexistente: ${id}`);
  return { prev: sorted[index - 1], next: sorted[index + 1] };
}

/** Etapas de experiencia que referencian el proyecto. */
export function relatedExperience<T extends { projects: readonly string[] }>(
  entries: readonly T[],
  projectId: string,
): T[] {
  return entries.filter((e) => e.projects.includes(projectId));
}
