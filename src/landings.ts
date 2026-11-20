// Pages by need: one page per kind of game or situation, in both languages, built from the catalogue.
// To add one, add an entry below. A page is published only once enough games match (MIN_GAMES),
// so a thin category appears by itself the day the catalogue fills it.
import games from './data/games.json';
import status from './data/status.json';
import type { Locale } from './i18n';

export type Game = (typeof games)[number];
type Text = { slug: string; label: string; h1: string; lead: string };
export type Landing = { key: string; match: (g: Game) => boolean; en: Text; fr: Text };

export const MIN_GAMES = 5;
const type = (x: string) => (g: Game) => g.types.includes(x);

export const landings: Landing[] = [
  {
    key: 'drawing', match: type('drawing'),
    en: { slug: 'drawing-games', label: 'Drawing', h1: 'Online drawing games to play together',
      lead: 'Draw, guess and laugh at the results. Share a link and everyone joins from their browser.' },
    fr: { slug: 'jeux-de-dessin', label: 'Dessin', h1: 'Jeux de dessin en ligne à plusieurs',
      lead: 'Dessinez, devinez, riez du résultat. On partage un lien et chacun joue depuis son navigateur.' },
  },
  {
    key: 'words', match: type('words'),
    en: { slug: 'word-games', label: 'Words', h1: 'Online word games to play together',
      lead: 'Find the word, guess the clue or beat the clock, in the same room or far apart.' },
    fr: { slug: 'jeux-de-mots', label: 'Mots', h1: 'Jeux de mots en ligne à plusieurs',
      lead: "Trouver le mot, deviner l'indice ou battre le chrono, dans la même pièce ou à distance." },
  },
  {
    key: 'quiz', match: type('quiz'),
    en: { slug: 'quiz-games', label: 'Quiz', h1: 'Online quiz games to play together',
      lead: 'Quizzes where everyone answers from their own screen.' },
    fr: { slug: 'quiz-en-ligne', label: 'Quiz', h1: 'Quiz en ligne à plusieurs',
      lead: 'Des quiz où chacun répond depuis son propre écran.' },
  },
  {
    key: 'board', match: type('board'),
    en: { slug: 'board-and-card-games', label: 'Board & cards', h1: 'Online board and card games to play together',
      lead: 'Board and card games that run in a browser tab, with nothing to install.' },
    fr: { slug: 'jeux-de-plateau-et-de-cartes', label: 'Plateau & cartes', h1: 'Jeux de plateau et de cartes en ligne',
      lead: 'Des jeux de plateau et de cartes qui tiennent dans un onglet, sans rien installer.' },
  },
  {
    key: 'arcade', match: type('arcade'),
    en: { slug: 'arcade-games', label: 'Arcade', h1: 'Multiplayer arcade games in the browser',
      lead: 'Quick action games to play against each other, straight from a link.' },
    fr: { slug: 'jeux-d-arcade', label: 'Arcade', h1: "Jeux d'arcade multijoueurs sur navigateur",
      lead: "Des jeux d'action rapides pour s'affronter, directement depuis un lien." },
  },
  {
    key: 'geography', match: type('geography'),
    en: { slug: 'geography-games', label: 'Geography', h1: 'Online geography games to play together',
      lead: 'Maps, countries and places to guess, together or against each other.' },
    fr: { slug: 'jeux-de-geographie', label: 'Géographie', h1: 'Jeux de géographie en ligne à plusieurs',
      lead: 'Cartes, pays et lieux à deviner, ensemble ou les uns contre les autres.' },
  },
  {
    key: 'music', match: type('music'),
    en: { slug: 'music-games', label: 'Music', h1: 'Online music games to play together',
      lead: 'Name the song before the others do.' },
    fr: { slug: 'jeux-musicaux', label: 'Musique', h1: 'Jeux musicaux en ligne à plusieurs',
      lead: 'Trouvez le titre avant les autres.' },
  },
  {
    key: 'bluff', match: type('bluff'),
    en: { slug: 'bluffing-games', label: 'Bluffing', h1: 'Online bluffing games to play together',
      lead: 'Lie, accuse and find out who is hiding something.' },
    fr: { slug: 'jeux-de-bluff', label: 'Bluff', h1: 'Jeux de bluff en ligne à plusieurs',
      lead: 'Mentez, accusez et trouvez qui cache quelque chose.' },
  },
  {
    key: 'kids', match: (g) => g.audience.includes('kids'),
    en: { slug: 'games-for-kids', label: 'Kids', h1: 'Online games for kids to play together',
      lead: 'Games simple enough for children, to play with siblings, cousins or grandparents.' },
    fr: { slug: 'jeux-pour-enfants', label: 'Enfants', h1: 'Jeux en ligne pour enfants, à plusieurs',
      lead: 'Des jeux assez simples pour les enfants, à faire entre frères et sœurs, cousins ou avec les grands-parents.' },
  },
  {
    key: 'teams', match: (g) => g.audience.includes('coworkers'),
    en: { slug: 'team-icebreaker-games', label: 'Teams at work', h1: 'Online icebreaker games for teams',
      lead: 'Games to open a meeting or liven up a remote team: quick to explain, playable during a video call.' },
    fr: { slug: 'jeux-pour-equipes', label: 'Équipes au travail', h1: 'Jeux en ligne pour équipes : briser la glace en visio',
      lead: 'Des jeux pour lancer une réunion ou animer une équipe à distance : vite expliqués, jouables pendant une visio.' },
  },
  {
    key: 'large', match: (g) => g.players.max >= 10,
    en: { slug: 'games-for-large-groups', label: 'Large groups', h1: 'Online games for large groups, 10 players and more',
      lead: 'Games that take ten players or more in the same round.' },
    fr: { slug: 'jeux-pour-grands-groupes', label: 'Grands groupes', h1: 'Jeux en ligne pour grands groupes, 10 joueurs et plus',
      lead: 'Des jeux qui accueillent dix joueurs ou plus dans la même partie.' },
  },
  {
    key: 'two', match: (g) => g.players.min <= 2,
    en: { slug: 'two-player-games', label: 'Two players', h1: 'Two-player online games',
      lead: 'Games that work with just two players, each on their own screen.' },
    fr: { slug: 'jeux-a-deux', label: 'À deux', h1: 'Jeux en ligne à deux',
      lead: 'Des jeux qui fonctionnent à deux, chacun sur son écran.' },
  },
  {
    key: 'phone', match: (g) => g.mobile,
    en: { slug: 'games-on-a-phone', label: 'On a phone', h1: 'Multiplayer games to play on a phone',
      lead: "No app to install: these games run in the phone's browser." },
    fr: { slug: 'jeux-sur-telephone', label: 'Sur téléphone', h1: 'Jeux à plusieurs sur téléphone',
      lead: 'Aucune application à installer : ces jeux tournent dans le navigateur du téléphone.' },
  },
  {
    key: 'nosignup', match: (g) => g.free && g.noAccount,
    en: { slug: 'free-games-no-sign-up', label: 'Free, no sign-up', h1: 'Free online games with no sign-up',
      lead: 'Open the link, pick a name, play. No account to create, and it is free.' },
    fr: { slug: 'jeux-gratuits-sans-inscription', label: 'Gratuit, sans compte', h1: 'Jeux en ligne gratuits sans inscription',
      lead: "On ouvre le lien, on choisit un pseudo, on joue. Pas de compte à créer, et c'est gratuit." },
  },
  {
    key: 'french', match: (g) => g.languages.includes('fr'),
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
