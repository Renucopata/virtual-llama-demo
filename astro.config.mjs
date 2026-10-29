// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';

// Demo portal pages (login, agent profile, admin) are private and stay out of the sitemap.
const PRIVATE = /\/(es\/)?(login|portal|admin)\/$/;

export default defineConfig({
  site: 'https://virtuallama.com',
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en-US', es: 'es-BO' } },
      filter: (page) => !PRIVATE.test(page),
    }),
    preact(),
  ],
  vite: { plugins: [tailwindcss()] },
});
