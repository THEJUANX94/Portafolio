/**
 * Enlace para redactar un correo en Gmail web.
 * Se usa en vez de `mailto:` porque `mailto:` no hace nada si el equipo no tiene cliente de correo configurado.
 */
export function composeUrl(email: string, subject: string): string {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: email, su: subject });
  return `https://mail.google.com/mail/?${params}`;
}
