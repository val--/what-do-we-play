// The catalogue as the pages use it: games.json merged with what the daily robot knows (status.json).
import { readdirSync } from 'node:fs';
import games from './data/games.json';
import status from './data/status.json';
import type { Locale } from './i18n';

type St = { state?: string; lastChecked?: string; lastOk?: string; offlineSince?: string; added?: string };
const st = status as Record<string, St>;

// Every game still listed (archived ones are gone), those that answer first.
export const entries = games
  .filter((g) => st[g.id]?.state !== 'archived')
  .map((g) => ({ ...g, offline: st[g.id]?.state === 'offline', offlineSince: st[g.id]?.offlineSince, lastOk: st[g.id]?.lastOk, added: st[g.id]?.added ?? '' }))
  .sort((a, b) => Number(a.offline) - Number(b.offline));
export type Entry = (typeof entries)[number];

export const lastCheck = Object.values(st).map((s) => s.lastChecked ?? '').sort().pop() || null;

// Thumbnails fetched by scripts/fetch-covers.mjs; games without a file keep the coloured tile.
export let covers = new Set<string>();
try { covers = new Set(readdirSync('public/covers').map((f) => f.replace(/\.webp$/, ''))); } catch {}

// Latest arrivals: the daily robot stamps each game the first time it sees it (status.json, `added`).
export const daysAgo = (iso: string) => (Date.now() - Date.parse(iso)) / 864e5;
export const isNew = (g: Entry) => g.added !== '' && daysAgo(g.added) <= 14;

export const range = (a: number, b: number) => (a === b ? `${a}` : `${a} – ${b}`);
export const formatDate = (locale: Locale, iso?: string | null, month: 'long' | 'short' = 'long', year = true) =>
  iso
    ? new Date(iso).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month, year: year ? 'numeric' : undefined, timeZone: 'UTC' })
    : null;

// Address of a game's own page, without the site's base.
export const gamePath = (locale: Locale, id: string) => `${locale === 'fr' ? '/fr/jeux' : '/games'}/${id}/`;

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
