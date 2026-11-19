import { defineConfig } from 'astro/config';

// Served at the custom domain. To build for another address:
// SITE=https://example.org BASE=/some-path npm run build
export default defineConfig({
  site: process.env.SITE ?? 'https://whatdoweplay.games',
  base: process.env.BASE ?? '/',
});
