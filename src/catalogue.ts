// The catalogue as the pages use it: games.json merged with what the daily robot knows (status.json).
import { readdirSync } from 'node:fs';
import games from './data/games.json';
import status from './data/status.json';
import { LOCALES, SITES, type Locale } from './i18n';

// A game must be described in every language the site is published in: stop the build otherwise,
// rather than publish a page with a hole in it.
for (const g of games) {
  const missing = LOCALES.filter((l) => !(g.desc as Record<string, string> | undefined)?.[l]?.trim());
  if (missing.length) throw new Error(`games.json: "${g.id}" has no description in: ${missing.join(', ')}`);
}

type St = { state?: string; lastChecked?: string; lastOk?: string; offlineSince?: string; added?: string };
const st = status as Record<string, St>;

// The piece of an address made from a name: "Achtung, die Kurve!" -> "achtung-die-kurve".
// The "games like …" pages (src/landings.ts) and the check below both use it, so they cannot disagree.
export const slugOf = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Each name in `inspiredBy` gets its own "games like …" page, so one original game must have one
// spelling. Stop the build when the field is not a list of names, when a name cannot make an
// address, or when two names (or a name and a game of the catalogue) differ only by case,
// accents, spaces or punctuation. Archived games are not shown anywhere and are left out.
{
  const sameName = (s: string) => slugOf(s).replace(/-/g, '');
  const listed = games.filter((g) => st[g.id]?.state !== 'archived');
  const titles = new Map(listed.map((g) => [sameName(g.name), g.name]));
  const seen = new Map<string, { name: string; id: string }>();
  for (const g of listed) {
    const value: unknown = (g as { inspiredBy?: unknown }).inspiredBy;
    if (value === undefined) continue;
    if (!Array.isArray(value) || value.some((x) => typeof x !== 'string'))
      throw new Error(`games.json: "${g.id}": inspiredBy must be a list of names, like ["Wordle"].`);
    for (const name of value as string[]) {
      const key = sameName(name);
      if (!key || name !== name.trim())
        throw new Error(`games.json: "${g.id}": inspiredBy "${name}" is empty, has spaces around it, or has no Latin letter or digit to make a page address from.`);
      const first = seen.get(key);
      if (first && first.name !== name)
        throw new Error(`games.json: "${g.id}" says inspiredBy "${name}", but ${first.id === g.id ? 'the same entry' : `"${first.id}"`} already says "${first.name}". Use one spelling.`);
      const title = titles.get(key);
      if (title && title !== name)
        throw new Error(`games.json: "${g.id}" says inspiredBy "${name}", but the catalogue has a game named "${title}". Write it the same way.`);
      if (!first) seen.set(key, { name, id: g.id });
    }
  }
}

// Every game still listed (archived ones are gone), those that answer first.
export const entries = games
  .filter((g) => st[g.id]?.state !== 'archived')
  .map((g) => ({ ...g, offline: st[g.id]?.state === 'offline', offlineSince: st[g.id]?.offlineSince, lastOk: st[g.id]?.lastOk, added: st[g.id]?.added ?? '' }))
  .sort((a, b) => Number(a.offline) - Number(b.offline));
export type Entry = (typeof entries)[number];

// The published game(s) a game is an online version of, when it is one (`inspiredBy` in games.json);
// `official` marks the version made by the game's own publisher.
export const inspiredBy = (g: object) => (g as { inspiredBy?: string[] }).inspiredBy ?? [];
export const isOfficial = (g: object) => (g as { official?: boolean }).official === true;

export const lastCheck = Object.values(st).map((s) => s.lastChecked ?? '').sort().pop() || null;

// Thumbnails fetched by scripts/fetch-covers.mjs; games without a file keep the coloured tile.
export let covers = new Set<string>();
try { covers = new Set(readdirSync('public/covers').map((f) => f.replace(/\.webp$/, ''))); } catch {}

// Screenshots taken by the owner, prepared by scripts/make-shots.mjs: public/shots/<id>-<n>.webp.
let shotFiles: string[] = [];
try { shotFiles = readdirSync('public/shots'); } catch {}
export const shotsOf = (id: string) =>
  shotFiles
    .filter((f) => f.startsWith(`${id}-`) && /^\d+\.webp$/.test(f.slice(id.length + 1)))
    .sort((a, b) => parseInt(a.slice(id.length + 1)) - parseInt(b.slice(id.length + 1)));

// Latest arrivals: the daily robot stamps each game the first time it sees it (status.json, `added`).
export const daysAgo = (iso: string) => (Date.now() - Date.parse(iso)) / 864e5;
export const isNew = (g: Entry) => g.added !== '' && daysAgo(g.added) <= 14;

export const range = (a: number, b: number) => (a === b ? `${a}` : `${a} – ${b}`);
export const formatDate = (locale: Locale, iso?: string | null, month: 'long' | 'short' = 'long', year = true) =>
  iso
    ? new Date(iso).toLocaleDateString(SITES[locale].date, { day: 'numeric', month, year: year ? 'numeric' : undefined, timeZone: 'UTC' })
    : null;

// Address of a game's own page, without the site's base.
export const gamePath = (locale: Locale, id: string) => `${SITES[locale].prefix}/${SITES[locale].games}/${id}/`;

// Similar games, by one rule for the whole catalogue: at least one kind in common, then
// 3 points per shared kind, 1 per shared audience, 1 if some group size suits both.
// Equal scores keep the catalogue's order. Games that are offline are left out.
export function similar(game: Entry, count = 6) {
  const shared = (a: string[], b: string[]) => a.filter((x) => b.includes(x)).length;
  return entries
    .filter((g) => g.id !== game.id && !g.offline && shared(g.types, game.types) > 0)
    .map((g, i) => ({
      g, i,
      score: 3 * shared(g.types, game.types) + shared(g.audience, game.audience)
        + Number(g.players.min <= game.players.max && game.players.min <= g.players.max),
    }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, count)
    .map((x) => x.g);
}
