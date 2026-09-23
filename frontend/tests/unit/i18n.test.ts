import { describe, it, expect } from 'vitest';
import { LOCALES, isLocale, pickLocale, otherLocale, switchLocalePath } from '../../src/lib/i18n';

describe('isLocale', () => {
  it('acepta solo es y en', () => {
    expect(LOCALES).toEqual(['es', 'en']);
    expect(isLocale('es')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe('pickLocale', () => {
  it('elige en para cualquier variante de inglés', () => {
    expect(pickLocale(['en-US', 'es'])).toBe('en');
    expect(pickLocale(['EN'])).toBe('en');
  });
  it('elige es para español', () => {
    expect(pickLocale(['es-CO'])).toBe('es');
  });
  it('usa el primer idioma soportado de la lista', () => {
    expect(pickLocale(['fr-FR', 'en-GB', 'es'])).toBe('en');
  });
  it('cae a es si no hay idioma soportado o la lista está vacía', () => {
    expect(pickLocale(['fr', 'de'])).toBe('es');
    expect(pickLocale([])).toBe('es');
  });
});

describe('otherLocale', () => {
  it('devuelve el idioma contrario', () => {
    expect(otherLocale('es')).toBe('en');
    expect(otherLocale('en')).toBe('es');
  });
});

describe('switchLocalePath', () => {
  it('cambia el prefijo conservando la ruta', () => {
    expect(switchLocalePath('/es/experiencia/', 'en')).toBe('/en/experiencia/');
    expect(switchLocalePath('/en/proyectos/ancla/', 'es')).toBe('/es/proyectos/ancla/');
  });
  it('maneja la raíz del idioma con y sin barra final', () => {
    expect(switchLocalePath('/es/', 'en')).toBe('/en/');
    expect(switchLocalePath('/es', 'en')).toBe('/en/');
  });
  it('rutas sin prefijo van a la raíz del idioma destino', () => {
    expect(switchLocalePath('/', 'en')).toBe('/en/');
    expect(switchLocalePath('/otra/', 'es')).toBe('/es/');
  });
});
