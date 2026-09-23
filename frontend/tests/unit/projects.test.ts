import { describe, it, expect } from 'vitest';
import { neighbors, relatedExperience } from '../../src/lib/projects';

const p = (id: string, order: number) => ({ id, order });
const all = [p('c', 3), p('a', 1), p('b', 2)];

describe('neighbors', () => {
  it('anterior y siguiente según order', () => {
    expect(neighbors(all, 'b')).toEqual({ prev: p('a', 1), next: p('c', 3) });
  });
  it('el primero no tiene anterior y el último no tiene siguiente', () => {
    expect(neighbors(all, 'a')).toEqual({ prev: undefined, next: p('b', 2) });
    expect(neighbors(all, 'c')).toEqual({ prev: p('b', 2), next: undefined });
  });
  it('un solo proyecto → sin vecinos', () => {
    expect(neighbors([p('x', 1)], 'x')).toEqual({ prev: undefined, next: undefined });
  });
  it('id inexistente → error', () => {
    expect(() => neighbors(all, 'zzz')).toThrow(/zzz/);
  });
});

describe('relatedExperience', () => {
  const e = (id: string, projects: string[]) => ({ id, projects });
  it('devuelve las etapas que referencian el proyecto, en el orden recibido', () => {
    const entries = [e('uno', ['a']), e('dos', ['b']), e('tres', ['a', 'b'])];
    expect(relatedExperience(entries, 'a').map((x) => x.id)).toEqual(['uno', 'tres']);
  });
  it('lista vacía si ninguna etapa lo referencia', () => {
    expect(relatedExperience([e('uno', ['a'])], 'b')).toEqual([]);
  });
});
