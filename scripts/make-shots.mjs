// Turns the owner's screenshots into the small images shown on each game's page.
//
// Drop image files (png, jpg, webp) into the `screenshots/` folder at the root of the project.
// A file belongs to the game whose id its name starts with: `skribbl.png`, `skribbl 2.png`,
// `gartic-phone-lobby.jpg`. The id is the last part of the game's page address
// (https://whatdoweplay.games/games/<id>/). Then run:
//   npm run shots
// Each image is resized, saved as public/shots/<id>-<n>.webp and its original moved to
// `screenshots/done/`, so running the script again never adds the same picture twice.
// `screenshots/` is not committed; `public/shots/` is.
import { readFile, writeFile, mkdir, readdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inbox = path.join(root, 'screenshots');
const done = path.join(inbox, 'done');
const out = path.join(root, 'public', 'shots');
const MAX_WIDTH = 1280;

const games = JSON.parse(await readFile(path.join(root, 'src/data/games.json'), 'utf8'));
// Longest ids first, so that `gartic-phone-1.png` goes to gartic-phone and not to a shorter id.
const ids = games.map((g) => g.id).sort((a, b) => b.length - a.length);
const gameOf = (file) => {
  const name = file.toLowerCase();
  return ids.find((id) => name.startsWith(id) && !/[a-z0-9]/.test(name[id.length] ?? '.'));
};

await mkdir(done, { recursive: true });
await mkdir(out, { recursive: true });
const files = (await readdir(inbox)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();
const existing = await readdir(out);
const count = (id) => existing.filter((f) => f.startsWith(`${id}-`) && /^\d+\.webp$/.test(f.slice(id.length + 1))).length;

let written = 0;
const unknown = [];
for (const file of files) {
  const id = gameOf(file);
  if (!id) { unknown.push(file); continue; }
  const target = `${id}-${count(id) + 1}.webp`;
  const image = sharp(await readFile(path.join(inbox, file))).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
  await writeFile(path.join(out, target), await image.webp({ quality: 80 }).toBuffer());
  existing.push(target);
  await rename(path.join(inbox, file), path.join(done, file));
  console.log(`ok    ${file}  ->  public/shots/${target}`);
  written++;
}
for (const file of unknown) console.log(`skip  ${file}  (its name does not start with a game id)`);
console.log(`\n${written} screenshot(s) added${unknown.length ? `, ${unknown.length} skipped` : ''}.`);
if (!files.length) console.log(`Nothing to do: put image files in ${inbox}`);
