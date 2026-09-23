export function byOrder<T extends { order: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function featuredProjects<T extends { featured: boolean; order: number }>(
  items: readonly T[],
  max = 5,
): T[] {
  return byOrder(items.filter((p) => p.featured)).slice(0, max);
}

/** Empleo más reciente: el que termina más tarde (vigente = null gana); empate → inicio más reciente. */
export function latestWork<T extends { line: string; start: string; end: string | null }>(
  items: readonly T[],
): T | undefined {
  const endKey = (e: T) => e.end ?? '9999-12';
  return [...items]
    .filter((e) => e.line === 'work')
    .sort((a, b) => endKey(b).localeCompare(endKey(a)) || b.start.localeCompare(a.start))[0];
}

/** 'Juan Sebastián Martínez Noreña' → 'JM'; 'Ana Pérez' → 'AP'. */
export function initials(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  const surname = words.length >= 4 ? words[2] : words[words.length - 1];
  return (words[0][0] + surname[0]).toUpperCase();
}
