import { defineConfig } from 'astro/config';

// GitHub Pages address by default. With a custom domain:
// SITE=https://whatdoweplay.games BASE=/ npm run build
export default defineConfig({
  site: process.env.SITE ?? 'https://val--.github.io',
  base: process.env.BASE ?? '/what-do-we-play',
});
