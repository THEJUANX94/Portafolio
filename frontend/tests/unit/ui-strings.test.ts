import { describe, it, expect } from 'vitest';
import es from '../../src/i18n/es.json';
import en from '../../src/i18n/en.json';
import { t } from '../../src/i18n';

describe('textos de interfaz', () => {
  it('es y en tienen exactamente las mismas claves', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
  });
  it('ningún texto está vacío', () => {
    for (const v of [...Object.values(es), ...Object.values(en)]) expect(v.trim()).not.toBe('');
  });
  it('t devuelve el texto del idioma', () => {
    expect(t('es', 'theme.toggle')).toBe(es['theme.toggle']);
    expect(t('en', 'theme.toggle')).toBe(en['theme.toggle']);
  });
});
