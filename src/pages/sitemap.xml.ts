import type { APIRoute } from 'astro';
import status from '../data/status.json';
import { published, pathOf } from '../landings';
import { entries as games, gamePath } from '../catalogue';

// One entry per page and language: the home page, the pages by need (src/landings.ts), then each game's page.
// They change when the daily link check runs.
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const lastmod = Object.values(status as Record<string, { lastChecked?: string }>)
    .map((s) => s.lastChecked ?? '')
    .sort()
    .pop()
    ?.slice(0, 10);
  const pages = [
    ...[undefined, ...published].map((landing) => ({ en: pathOf('en', landing), fr: pathOf('fr', landing) })),
    ...games.map((g) => ({ en: gamePath('en', g.id), fr: gamePath('fr', g.id) })),
  ];
  const entries = pages.flatMap((paths) => {
    const en = new URL(base + paths.en, site).href;
    const fr = new URL(base + paths.fr, site).href;
    return [en, fr].map((loc) => `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${fr}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>
  </url>`);
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
