import type { APIRoute } from 'astro';
import status from '../data/status.json';
import { LOCALES, perLocale } from '../i18n';
import { allPages, pathOf } from '../landings';
import { entries as games, gamePath } from '../catalogue';
import { aboutPath } from '../about';

// One entry per page and language: the home page, the pages by need and the "games like …" pages (src/landings.ts), then each game's page.
// They change when the daily link check runs.
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const lastmod = Object.values(status as Record<string, { lastChecked?: string }>)
    .map((s) => s.lastChecked ?? '')
    .sort()
    .pop()
    ?.slice(0, 10);
  const pages = [
    ...[undefined, ...allPages].map((landing) => perLocale((l) => pathOf(l, landing))),
    ...games.map((g) => perLocale((l) => gamePath(l, g.id))),
    perLocale(aboutPath),
  ];
  const entries = pages.flatMap((paths) => {
    const url = perLocale((l) => new URL(base + paths[l], site).href);
    const alternates = LOCALES.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url[l]}"/>`).join('\n');
    return LOCALES.map((l) => `  <url>
    <loc>${url[l]}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${url.en}"/>
  </url>`);
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
