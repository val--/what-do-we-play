// Pages by need: one page per kind of game or situation, in every language, built from the catalogue.
// To add one, add an entry below. A page is published only once enough games match (MIN_GAMES),
// so a thin category appears by itself the day the catalogue fills it.
import { entries, inspiredBy, isOfficial, slugOf, type Entry } from './catalogue';
import { SITES, type Locale } from './i18n';

export type Game = Entry;
type Text = { slug: string; label: string; h1: string; lead: string };
// `filter` is the same rule written as the filter panel's query (see src/scripts/filters.js):
// the page shows those boxes ticked, and unticking them leads back to the full list.
// Leave it out when the panel has no equivalent.
// `like` is set on the pages built from `inspiredBy` (see likePages below): the game they are about.
export type Landing = { key: string; match: (g: Game) => boolean; filter?: string; like?: string } & Record<Locale, Text>;

export const MIN_GAMES = 5;
const type = (x: string) => (g: Game) => g.types.includes(x);

export const landings: Landing[] = [
  {
    key: 'drawing', match: type('drawing'), filter: 'type=drawing',
    en: { slug: 'drawing-games', label: 'Drawing', h1: 'Online drawing games to play together',
      lead: 'Games where one player draws and the others guess, each from their own browser.' },
    fr: { slug: 'jeux-de-dessin', label: 'Dessin', h1: 'Jeux de dessin en ligne à plusieurs',
      lead: "Des jeux où l'un dessine et les autres devinent, chacun depuis son navigateur." },
    es: { slug: "juegos-de-dibujo", label: "Dibujo", h1: "Juegos de dibujo online para jugar en grupo",
      lead: "Juegos en los que uno dibuja y los demás adivinan, cada uno desde su navegador." },
  },
  {
    key: 'words', match: type('words'), filter: 'type=words',
    en: { slug: 'word-games', label: 'Words', h1: 'Online word games to play together',
      lead: 'Letter and vocabulary games for several players, in the same room or apart.' },
    fr: { slug: 'jeux-de-mots', label: 'Mots', h1: 'Jeux de mots en ligne à plusieurs',
      lead: 'Des jeux de lettres et de vocabulaire à plusieurs, dans la même pièce ou à distance.' },
    es: { slug: "juegos-de-palabras", label: "Palabras", h1: "Juegos de palabras online para jugar en grupo",
      lead: "Juegos de letras y vocabulario para varios jugadores, en la misma habitación o a distancia." },
  },
  {
    key: 'quiz', match: type('quiz'), filter: 'type=quiz',
    en: { slug: 'quiz-games', label: 'Quiz', h1: 'Online quiz games to play together',
      lead: 'Quizzes where everyone answers from their own screen.' },
    fr: { slug: 'quiz-en-ligne', label: 'Quiz', h1: 'Quiz en ligne à plusieurs',
      lead: 'Des quiz où chacun répond depuis son propre écran.' },
    es: { slug: "juegos-de-preguntas", label: "Quiz", h1: "Juegos de preguntas y quiz online en grupo",
      lead: "Quiz en los que cada uno responde desde su propia pantalla." },
  },
  {
    key: 'board', match: type('board'), filter: 'type=board',
    en: { slug: 'board-and-card-games', label: 'Board & cards', h1: 'Online board and card games to play together',
      lead: 'Board and card games played in a browser tab, with nothing to install.' },
    fr: { slug: 'jeux-de-plateau-et-de-cartes', label: 'Plateau & cartes', h1: 'Jeux de plateau et de cartes en ligne',
      lead: 'Des jeux de plateau et de cartes qui se jouent dans un onglet, sans rien installer.' },
    es: { slug: "juegos-de-mesa-y-cartas", label: "Tablero y cartas", h1: "Juegos de mesa y de cartas online",
      lead: "Juegos de mesa y de cartas que se juegan en una pestaña, sin instalar nada." },
  },
  {
    key: 'arcade', match: type('arcade'), filter: 'type=arcade',
    en: { slug: 'arcade-games', label: 'Arcade', h1: 'Multiplayer arcade games in the browser',
      lead: 'Fast action games where you play against each other live.' },
    fr: { slug: 'jeux-d-arcade', label: 'Arcade', h1: "Jeux d'arcade multijoueurs sur navigateur",
      lead: "Des jeux d'action rapides où l'on s'affronte en direct." },
    es: { slug: "juegos-arcade", label: "Arcade", h1: "Juegos arcade multijugador en el navegador",
      lead: "Juegos de acción rápidos para competir en directo." },
  },
  {
    key: 'geography', match: type('geography'), filter: 'type=geography',
    en: { slug: 'geography-games', label: 'Geography', h1: 'Online geography games to play together',
      lead: 'Games where you have to find a place or a country on the map.' },
    fr: { slug: 'jeux-de-geographie', label: 'Géographie', h1: 'Jeux de géographie en ligne à plusieurs',
      lead: 'Des jeux où il faut retrouver un lieu ou un pays sur la carte.' },
    es: { slug: "juegos-de-geografia", label: "Geografía", h1: "Juegos de geografía online para jugar en grupo",
      lead: "Juegos en los que hay que encontrar un lugar o un país en el mapa." },
  },
  {
    key: 'music', match: type('music'), filter: 'type=music',
    en: { slug: 'music-games', label: 'Music', h1: 'Online music games to play together',
      lead: 'Games where you have to recognise a song before the others.' },
    fr: { slug: 'jeux-musicaux', label: 'Musique', h1: 'Jeux musicaux en ligne à plusieurs',
      lead: 'Des jeux où il faut reconnaître une chanson avant les autres.' },
    es: { slug: "juegos-de-musica", label: "Música", h1: "Juegos de música online para jugar en grupo",
      lead: "Juegos en los que hay que reconocer una canción antes que los demás." },
  },
  {
    key: 'bluff', match: type('bluff'), filter: 'type=bluff',
    en: { slug: 'bluffing-games', label: 'Bluffing', h1: 'Online bluffing games to play together',
      lead: 'Games where you lie without getting caught, or work out who is lying.' },
    fr: { slug: 'jeux-de-bluff', label: 'Bluff', h1: 'Jeux de bluff en ligne à plusieurs',
      lead: 'Des jeux où il faut mentir sans se faire prendre, ou trouver qui ment.' },
    es: { slug: "juegos-de-engano", label: "Engaño", h1: "Juegos de engaño online para jugar en grupo",
      lead: "Juegos en los que hay que mentir sin que te descubran, o averiguar quién miente." },
  },
  {
    key: 'family', match: (g) => g.audience.includes('family'), filter: 'for=family',
    en: { slug: 'family-games', label: 'Family', h1: 'Online games to play as a family',
      lead: 'Games for all ages, to play at home or with relatives far away.' },
    fr: { slug: 'jeux-en-famille', label: 'Famille', h1: 'Jeux en ligne en famille',
      lead: 'Des jeux tous publics, à faire à la maison ou avec la famille à distance.' },
    es: { slug: "juegos-en-familia", label: "Familia", h1: "Juegos online para jugar en familia",
      lead: "Juegos para todas las edades, en casa o con la familia a distancia." },
  },
  {
    key: 'kids', match: (g) => g.audience.includes('kids'), filter: 'for=kids',
    en: { slug: 'games-for-kids', label: 'Kids', h1: 'Online games for kids to play together',
      lead: 'Games with simple rules, suitable for children and playable as a family.' },
    fr: { slug: 'jeux-pour-enfants', label: 'Enfants', h1: 'Jeux en ligne pour enfants, à plusieurs',
      lead: 'Des jeux aux règles simples, adaptés aux enfants et jouables en famille.' },
    es: { slug: "juegos-para-ninos", label: "Niños", h1: "Juegos online para niños, en grupo",
      lead: "Juegos con reglas sencillas, adecuados para niños y para jugar en familia." },
  },
  {
    key: 'teams', match: (g) => g.audience.includes('coworkers'), filter: 'for=coworkers',
    en: { slug: 'team-icebreaker-games', label: 'Teams at work', h1: 'Online icebreaker games for teams',
      lead: 'Games that are quick to explain and playable during a video call, to open a meeting or bring a remote team together.' },
    fr: { slug: 'jeux-pour-equipes', label: 'Équipes au travail', h1: 'Jeux en ligne pour équipes : briser la glace en visio',
      lead: 'Des jeux vite expliqués et jouables pendant une visio, pour lancer une réunion ou animer une équipe à distance.' },
    es: { slug: "juegos-para-equipos", label: "Equipos de trabajo", h1: "Juegos online para equipos: romper el hielo en videollamada",
      lead: "Juegos fáciles de explicar que se juegan durante una videollamada, para empezar una reunión o animar a un equipo a distancia." },
  },
  {
    key: 'large', match: (g) => g.players.max >= 10,
    en: { slug: 'games-for-large-groups', label: 'Large groups', h1: 'Online games for large groups, 10 players and more',
      lead: 'Games that take ten players or more in the same round.' },
    fr: { slug: 'jeux-pour-grands-groupes', label: 'Grands groupes', h1: 'Jeux en ligne pour grands groupes, 10 joueurs et plus',
      lead: 'Des jeux qui accueillent dix joueurs ou plus dans la même partie.' },
    es: { slug: "juegos-para-grupos-grandes", label: "Grupos grandes", h1: "Juegos online para grupos grandes, 10 jugadores o más",
      lead: "Juegos que admiten diez jugadores o más en la misma partida." },
  },
  {
    key: 'two', match: (g) => g.players.min <= 2, filter: 'n=2',
    en: { slug: 'two-player-games', label: 'Two players', h1: 'Two-player online games',
      lead: 'Games that work with just two players, each on their own screen.' },
    fr: { slug: 'jeux-a-deux', label: 'À deux', h1: 'Jeux en ligne à deux',
      lead: 'Des jeux qui fonctionnent à deux, chacun sur son écran.' },
    es: { slug: "juegos-para-dos", label: "Para dos", h1: "Juegos online para dos jugadores",
      lead: "Juegos que funcionan con solo dos jugadores, cada uno en su pantalla." },
  },
  {
    key: 'phone', match: (g) => g.mobile, filter: 'phone=1',
    en: { slug: 'games-on-a-phone', label: 'On a phone', h1: 'Multiplayer games to play on a phone',
      lead: "Games that run in the phone's browser, with no app to install." },
    fr: { slug: 'jeux-sur-telephone', label: 'Sur téléphone', h1: 'Jeux à plusieurs sur téléphone',
      lead: 'Des jeux qui se jouent dans le navigateur du téléphone, sans application à installer.' },
    es: { slug: "juegos-en-el-telefono", label: "En el teléfono", h1: "Juegos multijugador para el teléfono",
      lead: "Juegos que funcionan en el navegador del teléfono, sin instalar ninguna aplicación." },
  },
  {
    key: 'nosignup', match: (g) => g.free && g.noAccount, filter: 'free=1&noaccount=1',
    en: { slug: 'free-games-no-sign-up', label: 'Free, no sign-up', h1: 'Free online games with no sign-up',
      lead: 'Free games you can play without creating an account: just open the link.' },
    fr: { slug: 'jeux-gratuits-sans-inscription', label: 'Gratuit, sans compte', h1: 'Jeux en ligne gratuits sans inscription',
      lead: "Des jeux gratuits où l'on joue sans créer de compte : il suffit d'ouvrir le lien." },
    es: { slug: "juegos-gratis-sin-registro", label: "Gratis, sin registro", h1: "Juegos online gratis sin registrarse",
      lead: "Juegos gratis en los que se juega sin crear una cuenta: basta con abrir el enlace." },
  },
  {
    key: 'french', match: (g) => g.languages.includes('fr'), filter: 'lang=fr',
    en: { slug: 'games-in-french', label: 'In French', h1: 'Online multiplayer games in French',
      lead: 'Games available in French, for groups who would rather not play in English.' },
    fr: { slug: 'jeux-en-francais', label: 'En français', h1: 'Jeux en ligne à plusieurs en français',
      lead: "Des jeux disponibles en français, pour jouer sans passer par l'anglais." },
    es: { slug: "juegos-en-frances", label: "En francés", h1: "Juegos online multijugador en francés",
      lead: "Juegos disponibles en francés, para grupos que prefieren no jugar en inglés." },
  },
  {
    key: 'spanish', match: (g) => g.languages.includes('es'), filter: 'lang=es',
    en: { slug: 'games-in-spanish', label: 'In Spanish', h1: 'Online multiplayer games in Spanish',
      lead: 'Games available in Spanish, for groups who would rather not play in English.' },
    fr: { slug: 'jeux-en-espagnol', label: 'En espagnol', h1: 'Jeux en ligne à plusieurs en espagnol',
      lead: "Des jeux disponibles en espagnol, pour jouer sans passer par l'anglais." },
    es: { slug: 'juegos-en-espanol', label: 'En español', h1: 'Juegos online multijugador en español',
      lead: 'Juegos disponibles en español, para jugar sin pasar por el inglés.' },
  },
];

// The pages that have enough games today.
export const published = landings.filter((l) => entries.filter(l.match).length >= MIN_GAMES);

// "Games like …": one page per published game that games of the catalogue are inspired by
// (`inspiredBy` in games.json), listing those games and the original when it is in the catalogue.
// Built by one rule, nothing to declare. A page exists as soon as one game other than the
// publisher's own version matches.
export const likePages: Landing[] = [...new Set(entries.flatMap(inspiredBy))]
  .sort((a, b) => a.localeCompare(b))
  .map((name) => ({
    key: `like-${slugOf(name)}`,
    like: name,
    match: (g: Game) => inspiredBy(g).includes(name) || g.name === name,
    en: { slug: `games-like-${slugOf(name)}`, label: name, h1: `Online games like ${name}`,
      lead: `Browser games inspired by ${name}, to play together with nothing to install.` },
    fr: { slug: `jeux-comme-${slugOf(name)}`, label: name, h1: `Jeux en ligne comme ${name}`,
      lead: `Des jeux sur navigateur inspirés de ${name}, à jouer à plusieurs sans rien installer.` },
    es: { slug: `juegos-como-${slugOf(name)}`, label: name, h1: `Juegos online como ${name}`,
      lead: `Juegos de navegador inspirados en ${name}, para jugar en grupo sin instalar nada.` },
  }))
  .filter((page) => entries.some((g) => page.match(g) && !isOfficial(g)));

// Every page that lists games, besides the home page.
export const allPages = [...published, ...likePages];

// Address of a page, without the site's base: '/fr/jeux-de-dessin/'. No landing gives the home page.
export const pathOf = (locale: Locale, landing?: Landing) =>
  `${SITES[locale].prefix}/${landing ? `${landing[locale].slug}/` : ''}`;
