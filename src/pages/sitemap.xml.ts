import type { APIRoute } from 'astro';
import status from '../data/status.json';

// The site has two pages, one per language; they change when the daily link check runs.
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const en = new URL(`${base}/`, site).href;
  const fr = new URL(`${base}/fr/`, site).href;
  const lastmod = Object.values(status as Record<string, { lastChecked?: string }>)
    .map((s) => s.lastChecked ?? '')
    .sort()
    .pop()
    ?.slice(0, 10);
  const entry = (loc: string) => `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${fr}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${en}"/>
  </url>`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entry(en)}
${entry(fr)}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
