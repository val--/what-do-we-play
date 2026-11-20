// Visits every game and updates src/data/status.json.
//
//   online  --(3 failures in a row)-->  offline  --(30 days)-->  archived
//   A single successful visit puts the game back online, even when archived.
//
// A failure = no response, an HTTP error, or a page that no longer contains the expected
// keyword (domain resold, game replaced). A bot refusal (401/403/429) proves nothing:
// it is recorded as "blocked" and counts neither as a failure nor as a success.
//
// A live page can still announce that the game moved, was replaced or is closing. The
// checker cannot judge that, so it only records the sentence it saw as a `notice` for a
// human (or the weekly scout) to review. A notice never changes a game's state.
//
// Usage: node scripts/check-links.mjs [--dry]   (--dry: print without writing anything)
import { readFile, writeFile } from 'node:fs/promises';

const FAILS_BEFORE_OFFLINE = 3;
const DAYS_BEFORE_ARCHIVE = 30;
const TIMEOUT_MS = 20_000;
const CONCURRENCY = 6;
const USER_AGENT = 'Mozilla/5.0 (compatible; WhatDoWePlayBot/1.0; link checker)';

// Phrases that often announce a successor, a move or a shutdown (English and French).
const NOTICE_PATTERNS = [
  /\b(we|we've|we have) (built|made|launched|released) a new version\b/i,
  /\bgot an upgrade\b/i,
  /\b(has|have|we've|we have) moved to\b/i,
  /\bis now (called|known as)\b/i,
  /\b(is|are|will be) (shutting|closing) down\b/i,
  /\b(has|have) (shut|closed) down\b/i,
  /\b(sunsetting|will be sunset|end of life|has been discontinued|no longer (available|maintained))\b/i,
  /\bdomain (is|may be) for sale\b/i,
  /\bnouvelle version (du site|du jeu|est disponible)\b/i,
  /\b(a|ont|avons) déménagé\b/i,
  /\bferme(ra)? ses portes\b/i,
  /\bn'est plus (disponible|maintenu)\b/i,
];

// Visible text only, so that scripts and styles do not trigger false alarms.
function findNotice(html) {
  const text = html
    .replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ');
  for (const pattern of NOTICE_PATTERNS) {
    const hit = pattern.exec(text);
    if (hit) return text.slice(Math.max(0, hit.index - 60), hit.index + 140).trim();
  }
  return null;
}

const gamesUrl = new URL('../src/data/games.json', import.meta.url);
const statusUrl = new URL('../src/data/status.json', import.meta.url);
const dry = process.argv.includes('--dry');

async function visit(game) {
  try {
    const res = await fetch(game.url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,*/*;q=0.8', 'accept-language': 'en' },
    });
    if ([401, 403, 429].includes(res.status)) return { result: 'blocked', detail: `HTTP ${res.status}` };
    if (!res.ok) return { result: 'fail', detail: `HTTP ${res.status}` };
    const raw = await res.text();
    if (!raw.toLowerCase().includes(game.keyword.toLowerCase())) return { result: 'fail', detail: `"${game.keyword}" not found on page` };
    return { result: 'ok', detail: `HTTP ${res.status}`, notice: findNotice(raw) };
  } catch (err) {
    return { result: 'fail', detail: err.cause?.code ?? err.name ?? String(err) };
  }
}

async function check(game) {
  let outcome = await visit(game);
  if (outcome.result === 'fail') outcome = await visit(game); // one retry within the same run
  return outcome;
}

const daysBetween = (a, b) => Math.floor((Date.parse(b) - Date.parse(a)) / 86_400_000);

export function nextStatus(prev = {}, outcome, today) {
  const s = { state: 'online', fails: 0, ...prev, lastChecked: today, lastResult: outcome.detail };
  if (outcome.result === 'ok') {
    const fresh = { state: 'online', fails: 0, lastChecked: today, lastOk: today, lastResult: outcome.detail };
    if (outcome.notice) fresh.notice = outcome.notice;
    return fresh;
  }
  if (outcome.result === 'fail') {
    s.fails += 1;
    if (s.state === 'online' && s.fails >= FAILS_BEFORE_OFFLINE) {
      s.state = 'offline';
      s.offlineSince = today;
    }
  }
  if (s.state === 'offline' && daysBetween(s.offlineSince, today) >= DAYS_BEFORE_ARCHIVE) s.state = 'archived';
  return s;
}

const games = JSON.parse(await readFile(gamesUrl, 'utf8'));
const status = JSON.parse(await readFile(statusUrl, 'utf8'));
const today = new Date().toISOString().slice(0, 10);

const queue = [...games];
const next = {};
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let game; (game = queue.shift()); ) {
      const outcome = await check(game);
      const prev = status[game.id];
      next[game.id] = nextStatus(prev, outcome, today);
      // Stamped once, the first time the robot sees a game; games of the launch catalogue have none.
      const added = prev ? prev.added : today;
      if (added) next[game.id].added = added;
      console.log(`${outcome.result.padEnd(7)} ${next[game.id].state.padEnd(8)} ${game.id.padEnd(18)} ${outcome.detail}`);
    }
  }),
);

// Same order as the catalogue, for readable diffs; games removed from the catalogue are dropped.
const ordered = Object.fromEntries(games.map((g) => [g.id, next[g.id]]));
if (!dry) await writeFile(statusUrl, JSON.stringify(ordered, null, 2) + '\n');

const notices = games.filter((g) => ordered[g.id].notice);
if (notices.length) {
  console.log('\nNotices to review (possible new version, move or shutdown):');
  for (const g of notices) console.log(`  ${g.id}: ${ordered[g.id].notice}`);
}

const tally = Object.values(ordered).reduce((acc, s) => ({ ...acc, [s.state]: (acc[s.state] ?? 0) + 1 }), {});
console.log(`\n${games.length} games:`, tally, dry ? '(dry run, nothing written)' : '');
