import { describe, it, expect } from 'vitest';
import { cascadeSteps, CASCADE } from '../../src/lib/theme-cascade';

const r = (top: number, left: number) => ({ top, left });

describe('cascadeSteps', () => {
  it('ordena por fila (arriba primero) y luego por columna (izquierda primero)', () => {
    // perfil a la izquierda arriba, dos secciones a la derecha
    const rects = [r(300, 400), r(20, 20), r(20, 400)];
    expect(cascadeSteps(rects, 900)).toEqual([2, 0, 1]);
  });
  it('bloques casi a la misma altura cuentan como la misma fila (tolerancia 24 px)', () => {
    expect(cascadeSteps([r(30, 500), r(20, 20)], 900)).toEqual([1, 0]);
  });
  it('bloques fuera de la pantalla van al último paso', () => {
    expect(cascadeSteps([r(20, 20), r(2000, 20)], 900)).toEqual([0, CASCADE.maxStep]);
  });
  it('nunca supera el paso máximo', () => {
    const many = Array.from({ length: 20 }, (_, i) => r(i * 40, 20));
    const steps = cascadeSteps(many, 5000);
    expect(Math.max(...steps)).toBe(CASCADE.maxStep);
    expect(steps.slice(0, 3)).toEqual([0, 1, 2]);
  });
  it('lista vacía → lista vacía', () => {
    expect(cascadeSteps([], 900)).toEqual([]);
  });
  it('duración total = último paso × retardo + duración del color', () => {
    expect(CASCADE.totalMs).toBe(CASCADE.maxStep * CASCADE.stepMs + CASCADE.colorMs);
  });
});
