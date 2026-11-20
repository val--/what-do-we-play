// Turns the owner's screenshots into the small images shown on each game's page.
//
// The `screenshots/` folder at the root of the project holds one folder per game, named after
// the game's id (the last part of its page address, https://whatdoweplay.games/games/<id>/).
// Drop image files (png, jpg, webp) into a game's folder, under any name, then run:
//   npm run shots
// Each image is resized, saved as public/shots/<id>-<n>.webp and its original moved to the
// `done` folder inside the game's folder, so running the script again never adds the same
// picture twice. An image left directly in `screenshots/` also works if its name starts with
// the game's id (`skribbl 2.png`). The script creates the folder of any game that lacks one.
// `screenshots/` is not committed; `public/shots/` is.
import { readFile, writeFile, mkdir, readdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inbox = path.join(root, 'screenshots');
const out = path.join(root, 'public', 'shots');
const MAX_WIDTH = 1280;
const isImage = (f) => /\.(png|jpe?g|webp)$/i.test(f);

const games = JSON.parse(await readFile(path.join(root, 'src/data/games.json'), 'utf8'));
const ids = games.map((g) => g.id);
await mkdir(out, { recursive: true });
for (const id of ids) await mkdir(path.join(inbox, id), { recursive: true });

// Longest ids first, so that `gartic-phone-1.png` goes to gartic-phone and not to a shorter id.
const byLength = [...ids].sort((a, b) => b.length - a.length);
const gameOf = (file) => {
  const name = file.toLowerCase();
  return byLength.find((id) => name.startsWith(id) && !/[a-z0-9]/.test(name[id.length] ?? '.'));
};

// What to process: [game id, folder holding the file, file name].
const todo = [];
const unknown = [];
for (const id of ids) {
  for (const file of (await readdir(path.join(inbox, id))).filter(isImage).sort()) todo.push([id, path.join(inbox, id), file]);
}
for (const file of (await readdir(inbox)).filter(isImage).sort()) {
  const id = gameOf(file);
  if (id) todo.push([id, inbox, file]);
  else unknown.push(file);
}

const existing = await readdir(out);
const count = (id) => existing.filter((f) => f.startsWith(`${id}-`) && /^\d+\.webp$/.test(f.slice(id.length + 1))).length;

for (const [id, folder, file] of todo) {
  const target = `${id}-${count(id) + 1}.webp`;
  const image = sharp(await readFile(path.join(folder, file))).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
  await writeFile(path.join(out, target), await image.webp({ quality: 80 }).toBuffer());
  existing.push(target);
  const done = path.join(inbox, id, 'done');
  await mkdir(done, { recursive: true });
  await rename(path.join(folder, file), path.join(done, file));
  console.log(`ok    ${path.relative(inbox, path.join(folder, file))}  ->  public/shots/${target}`);
}
for (const file of unknown) console.log(`skip  ${file}  (put it in a game's folder, or start its name with a game id)`);
console.log(`\n${todo.length} screenshot(s) added${unknown.length ? `, ${unknown.length} skipped` : ''}.`);
if (!todo.length && !unknown.length) console.log(`Nothing to do: put image files in a game's folder under ${inbox}`);
