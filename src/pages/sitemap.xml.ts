import type { APIRoute } from 'astro';
import status from '../data/status.json';
import { published, pathOf } from '../landings';

// One entry per page and language: the home page, then the pages by need (src/landings.ts).
// They change when the daily link check runs.
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const lastmod = Object.values(status as Record<string, { lastChecked?: string }>)
    .map((s) => s.lastChecked ?? '')
    .sort()
    .pop()
    ?.slice(0, 10);
  const entries = [undefined, ...published].flatMap((landing) => {
    const en = new URL(base + pathOf('en', landing), site).href;
    const fr = new URL(base + pathOf('fr', landing), site).href;
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
