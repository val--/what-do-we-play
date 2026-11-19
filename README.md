# WhatDoWePlay

Un annuaire de jeux multijoueurs jouables dans le navigateur, pour la famille, les amis ou briser la glace entre collègues. Site statique (Astro), en anglais et en français, avec filtres combinables et vérification quotidienne des liens.

## Commandes

```
npm install
npm run dev          # http://localhost:4321/what-do-we-play/
npm run build        # génère dist/
npm run check-links  # visite chaque jeu et met à jour src/data/status.json
```

`node scripts/check-links.mjs --dry` affiche le résultat sans rien écrire.

## Ajouter un jeu

Ajouter une entrée dans [src/data/games.json](src/data/games.json) :

| Champ | Rôle |
| --- | --- |
| `id` | identifiant unique, sert de clé dans `status.json` |
| `keyword` | mot que le robot doit retrouver sur la page (en général le nom du jeu) |
| `types` | `drawing`, `quiz`, `words`, `bluff`, `board`, `geography`, `music`, `humor`, `arcade`, `collection` |
| `languages` | `en`, `fr`, `es`, `de`, `it`, `pt` |
| `audience` | `kids`, `family`, `friends`, `coworkers` |
| `players`, `duration` | bornes min et max (durée en minutes) |
| `free`, `noAccount`, `mobile`, `sharedScreen` | critères pratiques |
| `tested` | date du dernier test à la main (`null` tant que personne n'a joué) |

Les libellés des filtres et les textes du site sont dans [src/i18n.ts](src/i18n.ts).

## Le robot

[scripts/check-links.mjs](scripts/check-links.mjs) tourne chaque jour via [.github/workflows/check-links.yml](.github/workflows/check-links.yml), enregistre son résultat dans `src/data/status.json`, puis redéploie le site.

- 3 échecs de suite : le jeu est marqué **Offline** et passe en fin de liste.
- 30 jours hors ligne : la fiche est archivée (masquée du site, conservée dans les données).
- Un passage réussi remet le jeu en ligne, même archivé.
- Un refus anti-robot (HTTP 401, 403, 429) ne compte ni comme échec ni comme succès.

Le robot détecte un site mort ou remplacé, pas un jeu devenu payant : ces champs se vérifient à la main.

## Mise en ligne

GitHub Pages, par [.github/workflows/deploy.yml](.github/workflows/deploy.yml) : dans les réglages du dépôt, Pages → Source → « GitHub Actions ». Avec un nom de domaine, construire avec `SITE=https://… BASE=/`.

## Propositions de nouveaux jeux

Un agent Claude planifié cherche chaque lundi de nouveaux jeux et ouvre une pull request avec au plus cinq fiches. Il ne fusionne jamais lui-même. Pour qu'un jeu refusé ne soit plus proposé, ajouter son adresse dans [src/data/rejected.json](src/data/rejected.json), par exemple `["https://exemple.io/"]`.
