import { describe, it, expect } from 'vitest';
import { byOrder, featuredProjects, latestWork, initials } from '../../src/lib/home';

describe('byOrder', () => {
  it('ordena por order ascendente sin mutar la entrada', () => {
    const input = [{ order: 3 }, { order: 1 }, { order: 2 }];
    expect(byOrder(input).map((x) => x.order)).toEqual([1, 2, 3]);
    expect(input.map((x) => x.order)).toEqual([3, 1, 2]);
  });
});

describe('featuredProjects', () => {
  const p = (order: number, featured: boolean) => ({ order, featured });
  it('solo destacados, ordenados', () => {
    expect(featuredProjects([p(2, true), p(1, false), p(0, true)])).toEqual([p(0, true), p(2, true)]);
  });
  it('respeta el máximo (5 por defecto)', () => {
    const many = Array.from({ length: 7 }, (_, i) => p(i, true));
    expect(featuredProjects(many)).toHaveLength(5);
    expect(featuredProjects(many, 3).map((x) => x.order)).toEqual([0, 1, 2]);
  });
});

describe('latestWork', () => {
  const e = (line: string, start: string, end: string | null) => ({ line, start, end });
  it('elige el empleo que termina más tarde; vigente (null) gana', () => {
    const a = e('work', '2025-03', '2025-07');
    const b = e('work', '2025-08', '2026-08');
    const c = e('work', '2026-09', null);
    expect(latestWork([a, b])).toBe(b);
    expect(latestWork([a, c, b])).toBe(c);
  });
  it('desempata por inicio más reciente', () => {
    const a = e('work', '2024-01', '2026-01');
    const b = e('work', '2025-01', '2026-01');
    expect(latestWork([a, b])).toBe(b);
  });
  it('ignora líneas que no son empleo', () => {
    const project = e('projects', '2025-10', null);
    const work = e('work', '2025-08', '2026-08');
    expect(latestWork([project, work])).toBe(work);
  });
  it('undefined si no hay empleo', () => {
    expect(latestWork([e('education', '2020-01', '2026-01')])).toBeUndefined();
  });
});

describe('initials', () => {
  it('nombre completo hispano (2 nombres + 2 apellidos) → nombre + primer apellido', () => {
    expect(initials('Juan Sebastián Martínez Noreña')).toBe('JM');
  });
  it('nombres cortos → primera y última palabra', () => {
    expect(initials('Ana Pérez')).toBe('AP');
    expect(initials('Ana María Pérez')).toBe('AP');
  });
  it('una sola palabra → una letra', () => {
    expect(initials('Sebastián')).toBe('S');
  });
});
