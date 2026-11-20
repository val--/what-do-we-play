// Renders the share image (Open Graph) in each language from scripts/og/card.html.
// Needs Chrome or Edge on this machine; run it by hand after editing card.html:
//   node scripts/og/make.mjs
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const browsers = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const browser = browsers.find((p) => p && existsSync(p));
if (!browser) throw new Error('No Chrome or Edge found; set CHROME to its path.');

for (const lang of ['en', 'fr', 'es']) {
  const out = path.resolve(here, `../../public/og-${lang}.png`);
  const url = `${pathToFileURL(path.join(here, 'card.html'))}?lang=${lang}`;
  execFileSync(browser, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1200,630', '--virtual-time-budget=3000', `--screenshot=${out}`, url,
  ], { stdio: 'ignore' });
  console.log(`wrote ${path.relative(process.cwd(), out)}`);
}
