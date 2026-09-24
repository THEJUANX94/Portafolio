import { describe, it, expect } from 'vitest';
import { composeUrl } from '../../src/lib/contact';

describe('composeUrl', () => {
  it('abre la redacción de Gmail web con destinatario y asunto codificados', () => {
    const url = new URL(composeUrl('sebastianmn03@gmail.com', 'Contacto desde tu portafolio'));
    expect(url.origin + url.pathname).toBe('https://mail.google.com/mail/');
    expect(url.searchParams.get('view')).toBe('cm');
    expect(url.searchParams.get('fs')).toBe('1');
    expect(url.searchParams.get('to')).toBe('sebastianmn03@gmail.com');
    expect(url.searchParams.get('su')).toBe('Contacto desde tu portafolio');
  });
  it('codifica caracteres especiales del asunto', () => {
    expect(composeUrl('a@b.co', 'Hola & adiós')).toContain('su=Hola+%26+adi%C3%B3s');
  });
});
