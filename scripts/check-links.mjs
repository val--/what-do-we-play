// Visite chaque jeu et met à jour src/data/status.json.
//
//   en ligne  --(3 échecs de suite)-->  offline  --(30 jours)-->  archived
//   Un seul passage réussi remet le jeu en ligne, même archivé.
//
// Un échec = pas de réponse, erreur HTTP, ou page qui ne contient plus le mot attendu
// (domaine racheté, jeu remplacé). Un refus anti-robot (401/403/429) ne prouve rien :
// il est noté « blocked » et ne compte ni comme échec ni comme succès.
//
// Usage : node scripts/check-links.mjs [--dry]   (--dry : affiche sans rien écrire)
import { readFile, writeFile } from 'node:fs/promises';

const FAILS_BEFORE_OFFLINE = 3;
const DAYS_BEFORE_ARCHIVE = 30;
const TIMEOUT_MS = 20_000;
const CONCURRENCY = 6;
const USER_AGENT = 'Mozilla/5.0 (compatible; WhatDoWePlayBot/1.0; link checker)';

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
    const html = (await res.text()).toLowerCase();
    if (!html.includes(game.keyword.toLowerCase())) return { result: 'fail', detail: `"${game.keyword}" not found on page` };
    return { result: 'ok', detail: `HTTP ${res.status}` };
  } catch (err) {
    return { result: 'fail', detail: err.cause?.code ?? err.name ?? String(err) };
  }
}

async function check(game) {
  let outcome = await visit(game);
  if (outcome.result === 'fail') outcome = await visit(game); // une seconde chance dans le même passage
  return outcome;
}

const daysBetween = (a, b) => Math.floor((Date.parse(b) - Date.parse(a)) / 86_400_000);

export function nextStatus(prev = {}, outcome, today) {
  const s = { state: 'online', fails: 0, ...prev, lastChecked: today, lastResult: outcome.detail };
  if (outcome.result === 'ok') {
    return { state: 'online', fails: 0, lastChecked: today, lastOk: today, lastResult: outcome.detail };
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
      next[game.id] = nextStatus(status[game.id], outcome, today);
      console.log(`${outcome.result.padEnd(7)} ${next[game.id].state.padEnd(8)} ${game.id.padEnd(18)} ${outcome.detail}`);
    }
  }),
);

// Même ordre que le catalogue, pour des diffs lisibles ; les jeux retirés du catalogue disparaissent.
const ordered = Object.fromEntries(games.map((g) => [g.id, next[g.id]]));
if (!dry) await writeFile(statusUrl, JSON.stringify(ordered, null, 2) + '\n');

const tally = Object.values(ordered).reduce((acc, s) => ({ ...acc, [s.state]: (acc[s.state] ?? 0) + 1 }), {});
console.log(`\n${games.length} games:`, tally, dry ? '(dry run, nothing written)' : '');
