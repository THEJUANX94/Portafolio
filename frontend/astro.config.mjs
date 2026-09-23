// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// SITE_URL se define al elegir hosting (ver docs/03-operacion/deploy.md).
const site = process.env.SITE_URL ?? 'http://localhost:4321';

export default defineConfig({
  site,
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [
    react(),
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es-CO', en: 'en-US' } },
      filter: (page) => new URL(page).pathname !== '/',
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
