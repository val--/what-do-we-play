// Pages by need: one page per kind of game or situation, in both languages, built from the catalogue.
// To add one, add an entry below. A page is published only once enough games match (MIN_GAMES),
// so a thin category appears by itself the day the catalogue fills it.
import games from './data/games.json';
import status from './data/status.json';
import type { Locale } from './i18n';

export type Game = (typeof games)[number];
type Text = { slug: string; label: string; h1: string; lead: string };
// `filter` is the same rule written as the filter panel's query (see src/scripts/filters.js):
// the page shows those boxes ticked, and unticking them leads back to the full list.
// Leave it out when the panel has no equivalent.
export type Landing = { key: string; match: (g: Game) => boolean; filter?: string; en: Text; fr: Text };

export const MIN_GAMES = 5;
const type = (x: string) => (g: Game) => g.types.includes(x);

export const landings: Landing[] = [
  {
    key: 'drawing', match: type('drawing'), filter: 'type=drawing',
    en: { slug: 'drawing-games', label: 'Drawing', h1: 'Online drawing games to play together',
      lead: 'Games where one player draws and the others guess, each from their own browser.' },
    fr: { slug: 'jeux-de-dessin', label: 'Dessin', h1: 'Jeux de dessin en ligne à plusieurs',
      lead: "Des jeux où l'un dessine et les autres devinent, chacun depuis son navigateur." },
  },
  {
    key: 'words', match: type('words'), filter: 'type=words',
    en: { slug: 'word-games', label: 'Words', h1: 'Online word games to play together',
      lead: 'Letter and vocabulary games for several players, in the same room or apart.' },
    fr: { slug: 'jeux-de-mots', label: 'Mots', h1: 'Jeux de mots en ligne à plusieurs',
      lead: 'Des jeux de lettres et de vocabulaire à plusieurs, dans la même pièce ou à distance.' },
  },
  {
    key: 'quiz', match: type('quiz'), filter: 'type=quiz',
    en: { slug: 'quiz-games', label: 'Quiz', h1: 'Online quiz games to play together',
      lead: 'Quizzes where everyone answers from their own screen.' },
    fr: { slug: 'quiz-en-ligne', label: 'Quiz', h1: 'Quiz en ligne à plusieurs',
      lead: 'Des quiz où chacun répond depuis son propre écran.' },
  },
  {
    key: 'board', match: type('board'), filter: 'type=board',
    en: { slug: 'board-and-card-games', label: 'Board & cards', h1: 'Online board and card games to play together',
      lead: 'Board and card games played in a browser tab, with nothing to install.' },
    fr: { slug: 'jeux-de-plateau-et-de-cartes', label: 'Plateau & cartes', h1: 'Jeux de plateau et de cartes en ligne',
      lead: 'Des jeux de plateau et de cartes qui se jouent dans un onglet, sans rien installer.' },
  },
  {
    key: 'arcade', match: type('arcade'), filter: 'type=arcade',
    en: { slug: 'arcade-games', label: 'Arcade', h1: 'Multiplayer arcade games in the browser',
      lead: 'Fast action games where you play against each other live.' },
    fr: { slug: 'jeux-d-arcade', label: 'Arcade', h1: "Jeux d'arcade multijoueurs sur navigateur",
      lead: "Des jeux d'action rapides où l'on s'affronte en direct." },
  },
  {
    key: 'geography', match: type('geography'), filter: 'type=geography',
    en: { slug: 'geography-games', label: 'Geography', h1: 'Online geography games to play together',
      lead: 'Games where you have to find a place or a country on the map.' },
    fr: { slug: 'jeux-de-geographie', label: 'Géographie', h1: 'Jeux de géographie en ligne à plusieurs',
      lead: 'Des jeux où il faut retrouver un lieu ou un pays sur la carte.' },
  },
  {
    key: 'music', match: type('music'), filter: 'type=music',
    en: { slug: 'music-games', label: 'Music', h1: 'Online music games to play together',
      lead: 'Games where you have to recognise a song before the others.' },
    fr: { slug: 'jeux-musicaux', label: 'Musique', h1: 'Jeux musicaux en ligne à plusieurs',
      lead: 'Des jeux où il faut reconnaître une chanson avant les autres.' },
  },
  {
    key: 'bluff', match: type('bluff'), filter: 'type=bluff',
    en: { slug: 'bluffing-games', label: 'Bluffing', h1: 'Online bluffing games to play together',
      lead: 'Games where you lie without getting caught, or work out who is lying.' },
    fr: { slug: 'jeux-de-bluff', label: 'Bluff', h1: 'Jeux de bluff en ligne à plusieurs',
      lead: 'Des jeux où il faut mentir sans se faire prendre, ou trouver qui ment.' },
  },
  {
    key: 'family', match: (g) => g.audience.includes('family'), filter: 'for=family',
    en: { slug: 'family-games', label: 'Family', h1: 'Online games to play as a family',
      lead: 'Games for all ages, to play at home or with relatives far away.' },
    fr: { slug: 'jeux-en-famille', label: 'Famille', h1: 'Jeux en ligne en famille',
      lead: 'Des jeux tous publics, à faire à la maison ou avec la famille à distance.' },
  },
  {
    key: 'kids', match: (g) => g.audience.includes('kids'), filter: 'for=kids',
    en: { slug: 'games-for-kids', label: 'Kids', h1: 'Online games for kids to play together',
      lead: 'Games with simple rules, suitable for children and playable as a family.' },
    fr: { slug: 'jeux-pour-enfants', label: 'Enfants', h1: 'Jeux en ligne pour enfants, à plusieurs',
      lead: 'Des jeux aux règles simples, adaptés aux enfants et jouables en famille.' },
  },
  {
    key: 'teams', match: (g) => g.audience.includes('coworkers'), filter: 'for=coworkers',
    en: { slug: 'team-icebreaker-games', label: 'Teams at work', h1: 'Online icebreaker games for teams',
      lead: 'Games that are quick to explain and playable during a video call, to open a meeting or bring a remote team together.' },
    fr: { slug: 'jeux-pour-equipes', label: 'Équipes au travail', h1: 'Jeux en ligne pour équipes : briser la glace en visio',
      lead: 'Des jeux vite expliqués et jouables pendant une visio, pour lancer une réunion ou animer une équipe à distance.' },
  },
  {
    key: 'large', match: (g) => g.players.max >= 10,
    en: { slug: 'games-for-large-groups', label: 'Large groups', h1: 'Online games for large groups, 10 players and more',
      lead: 'Games that take ten players or more in the same round.' },
    fr: { slug: 'jeux-pour-grands-groupes', label: 'Grands groupes', h1: 'Jeux en ligne pour grands groupes, 10 joueurs et plus',
      lead: 'Des jeux qui accueillent dix joueurs ou plus dans la même partie.' },
  },
  {
    key: 'two', match: (g) => g.players.min <= 2, filter: 'n=2',
    en: { slug: 'two-player-games', label: 'Two players', h1: 'Two-player online games',
      lead: 'Games that work with just two players, each on their own screen.' },
    fr: { slug: 'jeux-a-deux', label: 'À deux', h1: 'Jeux en ligne à deux',
      lead: 'Des jeux qui fonctionnent à deux, chacun sur son écran.' },
  },
  {
    key: 'phone', match: (g) => g.mobile, filter: 'phone=1',
    en: { slug: 'games-on-a-phone', label: 'On a phone', h1: 'Multiplayer games to play on a phone',
      lead: "Games that run in the phone's browser, with no app to install." },
    fr: { slug: 'jeux-sur-telephone', label: 'Sur téléphone', h1: 'Jeux à plusieurs sur téléphone',
      lead: 'Des jeux qui se jouent dans le navigateur du téléphone, sans application à installer.' },
  },
  {
    key: 'nosignup', match: (g) => g.free && g.noAccount, filter: 'free=1&noaccount=1',
    en: { slug: 'free-games-no-sign-up', label: 'Free, no sign-up', h1: 'Free online games with no sign-up',
      lead: 'Free games you can play without creating an account: just open the link.' },
    fr: { slug: 'jeux-gratuits-sans-inscription', label: 'Gratuit, sans compte', h1: 'Jeux en ligne gratuits sans inscription',
      lead: "Des jeux gratuits où l'on joue sans créer de compte : il suffit d'ouvrir le lien." },
  },
  {
    key: 'french', match: (g) => g.languages.includes('fr'), filter: 'lang=fr',
    en: { slug: 'games-in-french', label: 'In French', h1: 'Online multiplayer games in French',
      lead: 'Games available in French, for groups who would rather not play in English.' },
    fr: { slug: 'jeux-en-francais', label: 'En français', h1: 'Jeux en ligne à plusieurs en français',
      lead: "Des jeux disponibles en français, pour jouer sans passer par l'anglais." },
  },
];

const st = status as Record<string, { state?: string }>;
const listed = games.filter((g) => st[g.id]?.state !== 'archived');

// The pages that have enough games today.
export const published = landings.filter((l) => listed.filter(l.match).length >= MIN_GAMES);

// Address of a page, without the site's base: '/fr/jeux-de-dessin/'. No landing gives the home page.
export const pathOf = (locale: Locale, landing?: Landing) =>
  `${locale === 'fr' ? '/fr' : ''}/${landing ? `${landing[locale].slug}/` : ''}`;
