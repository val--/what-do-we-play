import { defineConfig } from 'astro/config';

// Adresse GitHub Pages par défaut. Avec un nom de domaine à soi :
// SITE=https://whatdoweplay.games BASE=/ npm run build
export default defineConfig({
  site: process.env.SITE ?? 'https://val--.github.io',
  base: process.env.BASE ?? '/what-do-we-play',
});
