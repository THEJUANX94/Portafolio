import { describe, it, expect } from 'vitest';
import { formatMonth, formatRange, monthsBetween, formatDuration } from '../../src/lib/dates';

describe('formatMonth', () => {
  it('formatea YYYY-MM por idioma', () => {
    expect(formatMonth('2025-08', 'es')).toBe('ago 2025');
    expect(formatMonth('2025-08', 'en')).toBe('Aug 2025');
    expect(formatMonth('2026-01', 'es')).toBe('ene 2026');
  });
  it('rechaza formatos inválidos', () => {
    expect(() => formatMonth('2025-13', 'es')).toThrow();
    expect(() => formatMonth('2025', 'es')).toThrow();
  });
});

describe('formatRange', () => {
  it('une inicio y fin', () => {
    expect(formatRange('2025-08', '2026-08', 'es')).toBe('ago 2025 – ago 2026');
  });
  it('fin null = hoy / present', () => {
    expect(formatRange('2025-10', null, 'es')).toBe('oct 2025 – hoy');
    expect(formatRange('2025-10', null, 'en')).toBe('Oct 2025 – present');
  });
});

describe('monthsBetween', () => {
  it('cuenta meses inclusivos', () => {
    expect(monthsBetween('2025-03', '2025-07')).toBe(5);
    expect(monthsBetween('2025-08', '2026-08')).toBe(13);
    expect(monthsBetween('2025-08', '2025-08')).toBe(1);
  });
  it('rechaza fin anterior al inicio', () => {
    expect(() => monthsBetween('2026-01', '2025-12')).toThrow();
  });
});

describe('formatDuration', () => {
  it('años y meses en español', () => {
    expect(formatDuration(13, 'es')).toBe('1 año 1 mes');
    expect(formatDuration(5, 'es')).toBe('5 meses');
    expect(formatDuration(24, 'es')).toBe('2 años');
    expect(formatDuration(26, 'es')).toBe('2 años 2 meses');
  });
  it('años y meses en inglés', () => {
    expect(formatDuration(13, 'en')).toBe('1 yr 1 mo');
    expect(formatDuration(5, 'en')).toBe('5 mos');
    expect(formatDuration(24, 'en')).toBe('2 yrs');
  });
  it('rechaza valores no enteros positivos', () => {
    expect(() => formatDuration(0, 'es')).toThrow();
    expect(() => formatDuration(1.5, 'es')).toThrow();
  });
});
