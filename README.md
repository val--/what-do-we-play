# WhatDoWePlay

A directory of multiplayer games that run in a web browser, for families, friends and team icebreakers. Filter by group size, language, audience and time, then share a link: nothing to install.

**Live site: https://whatdoweplay.games/** (also [in French](https://whatdoweplay.games/fr/) and [in Spanish](https://whatdoweplay.games/es/))

It is a static site built with [Astro](https://astro.build), in English, French and Spanish, with combinable filters, a daily link check and a weekly agent that proposes new games.

## Commands

```
npm install
npm run dev          # http://localhost:4321/
npm run build        # builds into dist/
npm run check-links  # visits every game and updates src/data/status.json
npm run covers       # fetches a thumbnail for games that have none
```

`node scripts/check-links.mjs --dry` prints the result without writing anything.

## Adding a game

Add an entry to [src/data/games.json](src/data/games.json):

| Field | Purpose |
| --- | --- |
| `id` | unique identifier, used as the key in `status.json` and as the thumbnail file name |
| `keyword` | a word the link checker must find on the page (usually the game's name) |
| `types` | `drawing`, `quiz`, `words`, `bluff`, `board`, `geography`, `music`, `humor`, `arcade`, `collection` |
| `languages` | `en`, `fr`, `es`, `de`, `it`, `pt` |
| `audience` | `kids`, `family`, `friends`, `coworkers` |
| `players`, `duration` | minimum and maximum (duration in minutes) |
| `free`, `noAccount`, `mobile`, `sharedScreen` | practical criteria |
| `desc` | one or two sentences in every language of the site (`en`, `fr`, `es`) |
| `inspiredBy`, `official` | optional: the published games this one is an online version of (`["Wavelength"]`), and `true` when it is the publisher's own version |
| `tested` | date of the last hands-on test (`null` until someone has actually played) |

Filter labels and all site text live in [src/i18n.ts](src/i18n.ts).

## Thumbnails

[scripts/fetch-covers.mjs](scripts/fetch-covers.mjs) copies the preview image each game publishes itself (its `og:image` tag), crops it to 480 × 300 and stores it in `public/covers/<id>.webp`. Failing that, it places the site's icon on a blurred backdrop. A game with no image keeps the coloured tile drawn by the site.

- `npm run covers` only handles games without a thumbnail; `npm run covers -- --force` redoes everything, `npm run covers -- skribbl` redoes one game.
- To reject a game's image, delete its file and add `"cover": false` to its entry.
- The daily bot also runs this script, so a newly added game gets its thumbnail by the next day at the latest.
- A hand-picked image works too: drop it in `public/covers/` as `<id>.webp`.

## The link checker

[scripts/check-links.mjs](scripts/check-links.mjs) runs every day through [.github/workflows/check-links.yml](.github/workflows/check-links.yml), records its result in `src/data/status.json`, then redeploys the site.

- 3 failures in a row: the game is marked **Offline** and moves to the end of the list.
- 30 days offline: the entry is archived (hidden from the site, kept in the data).
- One successful visit puts the game back online, even when archived.
- The first time the checker sees a game it stamps it with an `added` date in `status.json`. The site uses it for the "+N games added on …" line, the "New" tag (14 days) and the "Newest first" sort. Games of the launch catalogue have no date.
- A bot refusal (HTTP 401, 403, 429) counts neither as a failure nor as a success.

- When a live page announces a new version, a move or a shutdown, the sentence is recorded as a `notice` in `status.json` and printed in the run log. It never changes a game's state; the weekly agent reviews these notices.

The checker reads the raw HTML only, so it sees nothing on sites that are pure JavaScript apps, and it cannot tell that a game became paid: those cases are caught by the weekly agent's review or by hand.

## Deployment

GitHub Pages, through [.github/workflows/deploy.yml](.github/workflows/deploy.yml), on every push to `main`, served at the custom domain `whatdoweplay.games` (set in the repository's Pages settings). To build for another address, use `SITE=https://… BASE=/…`.

## New game proposals

A scheduled Claude agent looks for new games every Monday and opens a pull request with at most five entries. It never merges anything itself. Games with clear sites but little written about them come in a separate "À trancher" list of at most three, for the owner to judge. Its instructions are in [docs/scout.md](docs/scout.md): editing that file is enough to change its behaviour.

To have a game looked at, add its address to [docs/suggestions.md](docs/suggestions.md): the agent opens those first.

To stop a refused game from being proposed again, add its address to [src/data/rejected.json](src/data/rejected.json), for example `["https://example.io/"]`.

## Thumbnails and trademarks

Game names, logos, preview images and screenshots belong to their respective owners. They are shown only to identify, describe and link to each game. If you publish one of these games and want an image removed, open an issue.

## Screenshots

A game's page can show screenshots taken by the owner while playing. `screenshots/` at the root of the project holds one folder per game, named after its id. Drop image files into a game's folder and run `npm run shots`: the script resizes them into `public/shots/`, moves the originals to the game's `done` folder, and creates the folder of any new game. The `screenshots/` folder is not committed. Check that a screenshot shows no real name or private chat before adding it.

## Search engines and link previews

`/sitemap.xml` and `/robots.txt` are generated at build time ([src/pages](src/pages)). The image shown when the site is shared (`public/og-en.png`, `public/og-fr.png`) is drawn from [scripts/og/card.html](scripts/og/card.html): after editing it, run `node scripts/og/make.mjs` (needs Chrome or Edge) and commit the two images.

## Pages by need

Besides the two home pages, the site builds one page per kind of game or situation
("drawing games", "games for large groups", "free, no sign-up"…), in every language.
They exist so that people searching for a precise need can land on a matching list.

They are declared in `src/landings.ts`: a rule that picks the games, plus an address,
a title and one sentence per language. A page is published only when at least five
games match, so nothing has to be done when the catalogue grows. The pages link to
each other under "More ideas" and are listed in the sitemap.

The same file also builds one "games like …" page per published game that games of the catalogue are inspired by (`inspiredBy` in `games.json`): `/games-like-monopoly/`, `/fr/jeux-comme-monopoly/`, `/es/juegos-como-monopoly/`. Nothing to declare: filling `inspiredBy` on a game is enough.

The "About" page (what the site is, contact, legal notice) has its text in `src/about.ts`, one block per language.

## A page per game

Every listed game also has its own page (`/games/<id>/`, `/fr/jeux/<id>/`, `/es/juegos/<id>/`): what the
catalogue knows about it, the pages by need it belongs to, and six similar games.
"Similar" is one rule for the whole catalogue, in `src/catalogue.ts`: at least one kind
in common, then the games sharing the most kinds and audiences come first.

The pieces: `src/catalogue.ts` (the data every page reads), `Base.astro` (the shell),
`GameCard.astro` (a card), `Catalog.astro` (a list with filters), `GamePage.astro`.

## Languages

The site is published in English, French and Spanish. The list is `LOCALES` in `src/i18n.ts`,
and the comment above it says what a new language needs: its interface texts, its texts in
`src/landings.ts`, a description of every game in `src/data/games.json`, and three page files.
The project's maintainer reads English and French; the Spanish is written with the help of an
AI assistant, so corrections from native speakers are welcome.
