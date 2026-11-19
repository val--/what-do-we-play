// Récupère la vignette de chaque jeu : l'image d'aperçu que le site publie lui-même
// (balise og:image ou twitter:image), recadrée en 480 × 300 et rangée dans
// public/covers/<id>.webp. À défaut, l'icône du site posée sur un fond flouté.
// Un jeu sans image exploitable garde la vignette colorée du site.
//
// Usage : node scripts/fetch-covers.mjs            (seulement les jeux sans vignette)
//         node scripts/fetch-covers.mjs --force    (tout refaire)
//         node scripts/fetch-covers.mjs skribbl jklm   (seulement ces jeux, refaits)
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import sharp from 'sharp';

const WIDTH = 480;
const HEIGHT = 300;
const MIN_SOURCE_WIDTH = 300; // en dessous, l'image serait floue une fois agrandie : on la traite comme une icône
const MIN_ICON_WIDTH = 96;
const ICON_SIZE = 150;
const MAX_BYTES = 8_000_000;
const TIMEOUT_MS = 20_000;
const USER_AGENT = 'Mozilla/5.0 (compatible; WhatDoWePlayBot/1.0; link preview)';

const gamesUrl = new URL('../src/data/games.json', import.meta.url);
const coversDir = new URL('../public/covers/', import.meta.url);
const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter((a) => !a.startsWith('--'));

const exists = (url) => access(url).then(() => true, () => false);
const get = (url, accept) =>
  fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS), headers: { 'user-agent': USER_AGENT, accept } });

// Lit <meta property="og:image" content="…"> quel que soit l'ordre des attributs.
function findPreviewImage(html, pageUrl) {
  for (const key of ['og:image:secure_url', 'og:image', 'twitter:image', 'twitter:image:src']) {
    for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
      const name = tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1];
      const content = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1];
      if (name?.toLowerCase() === key && content) {
        try { return new URL(content.replaceAll('&amp;', '&'), pageUrl).href; } catch {}
      }
    }
  }
  return null;
}

// La plus grande icône déclarée par la page (apple-touch-icon de préférence).
function findIcon(html, pageUrl) {
  const icons = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = tag.match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase() ?? '';
    const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!href || !/icon/.test(rel)) continue;
    const size = Number(tag.match(/\bsizes\s*=\s*["'](\d+)x/i)?.[1] ?? (rel.includes('apple') ? 180 : 0));
    try { icons.push({ size, href: new URL(href.replaceAll('&amp;', '&'), pageUrl).href }); } catch {}
  }
  icons.sort((a, b) => b.size - a.size);
  return icons[0]?.href ?? new URL('/apple-touch-icon.png', pageUrl).href;
}

async function download(url) {
  const res = await get(url, 'image/*');
  if (!res.ok) throw new Error(`image HTTP ${res.status}`);
  if (!(res.headers.get('content-type') ?? '').startsWith('image/')) throw new Error('not an image');
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length > MAX_BYTES) throw new Error('image too large');
  const { width = 0 } = await sharp(bytes, { limitInputPixels: 40_000_000 }).metadata();
  return { bytes, width };
}

// Grande image : simple recadrage.
const crop = (bytes) =>
  sharp(bytes).flatten({ background: '#ffffff' }).resize(WIDTH, HEIGHT, { fit: 'cover', position: 'attention' });

// Petite image ou icône : posée au centre, sur elle-même agrandie et floutée.
async function iconCard(bytes) {
  const icon = await sharp(bytes)
    .resize(ICON_SIZE, ICON_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .composite([{
      input: Buffer.from(`<svg width="${ICON_SIZE}" height="${ICON_SIZE}"><rect width="100%" height="100%" rx="30" /></svg>`),
      blend: 'dest-in',
    }])
    .png()
    .toBuffer();
  const backdrop = await sharp(bytes)
    .flatten({ background: '#ffffff' })
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .blur(28)
    .modulate({ brightness: 0.82, saturation: 1.5 })
    .toBuffer();
  return sharp(backdrop).composite([{ input: icon, gravity: 'centre' }]);
}

async function cover(game) {
  const page = await get(game.url, 'text/html,*/*;q=0.8');
  if (!page.ok) return `page HTTP ${page.status}`;
  const html = await page.text();
  const tried = [];
  for (const [kind, url] of [['preview', findPreviewImage(html, page.url)], ['icon', findIcon(html, page.url)]]) {
    if (!url) continue;
    try {
      const { bytes, width } = await download(url);
      if (width < MIN_ICON_WIDTH) { tried.push(`${kind} too small (${width}px)`); continue; }
      const image = kind === 'preview' && width >= MIN_SOURCE_WIDTH ? crop(bytes) : await iconCard(bytes);
      await writeFile(new URL(`${game.id}.webp`, coversDir), await image.webp({ quality: 78 }).toBuffer());
      console.log(`ok    ${game.id.padEnd(18)} ${kind}${width < MIN_SOURCE_WIDTH ? ' as icon' : ''}`);
      return null;
    } catch (err) {
      tried.push(`${kind}: ${err.message}`);
    }
  }
  return tried.join(', ') || 'no image found';
}

const games = JSON.parse(await readFile(gamesUrl, 'utf8'));
await mkdir(coversDir, { recursive: true });
let made = 0;
for (const game of games) {
  if (game.cover === false) continue; // image du site inutilisable, refusée à la main
  if (only.length ? !only.includes(game.id) : !force && (await exists(new URL(`${game.id}.webp`, coversDir)))) continue;
  let problem;
  try { problem = await cover(game); } catch (err) { problem = err.cause?.code ?? err.name ?? String(err); }
  if (!problem) made++;
  if (problem) console.log(`skip  ${game.id.padEnd(18)} ${problem}`);
}
console.log(`\n${made} cover(s) written to public/covers/`);
