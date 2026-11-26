// The "About" page: what the site is, how it is kept up to date, how to reach its owner, and the
// legal notice. One block of text per language; a paragraph may contain links.
import { SITES, type Locale } from './i18n';

export const CONTACT = 'contact@whatdoweplay.games';
const REPO = 'https://github.com/val--/what-do-we-play';
const mail = `<a href="mailto:${CONTACT}">${CONTACT}</a>`;
const HOST = 'GitHub Pages — GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107';

// Address of the page in each language, without the site's base.
const SLUGS: Record<Locale, string> = { en: 'about', fr: 'a-propos', es: 'acerca-de' };
export const aboutPath = (locale: Locale) => `${SITES[locale].prefix}/${SLUGS[locale]}/`;

type About = { title: string; lead: string; sections: (games: number) => { h: string; p: string[] }[] };

export const about: Record<Locale, About> = {
  en: {
    title: 'About',
    lead: 'WhatDoWePlay is a directory of games to play together in a web browser, with nothing to install.',
    sections: (n) => [
      { h: 'What you will find here', p: [
        `${n} games picked by hand, to play with family, friends or coworkers. Each page gives the number of players, the length of a game, the languages, and whether you have to pay or create an account.`,
        'The site shows no ads, asks for no account and sets no cookies.',
      ] },
      { h: 'How the information is kept up to date', p: [
        'A robot opens every link once a day. A game that stops answering is marked "Offline", then removed after 30 days.',
        "The details come from each game's own site. They can change without notice: when in doubt, the game's site is right.",
        '"Played by us" appears only on games we have actually played.',
      ] },
      { h: 'Where the games come from', p: [
        'Each week an AI assistant looks for new games and proposes them. None is added without being read and accepted by a person.',
        `The site itself is built with the help of an AI assistant. Its code is public: <a href="${REPO}">${REPO.replace('https://', '')}</a>.`,
      ] },
      { h: 'Suggest a game, report a mistake', p: [
        `Write to ${mail}. Game makers can use the same address to ask for their page to be corrected or removed.`,
      ] },
      { h: 'Names, logos and images', p: [
        'Names, logos, thumbnails and screenshots belong to their respective owners. They are used only to present the games and link to them. WhatDoWePlay is not affiliated with any of these games.',
      ] },
      { h: 'Legal notice', p: [
        `A personal, non-commercial site. Contact: ${mail}.`,
        `Hosting: ${HOST}, United States.`,
        'Audience measurement: GoatCounter, without cookies. Your favourites and the theme you choose are stored only in your browser.',
      ] },
    ],
  },
  fr: {
    title: 'À propos',
    lead: 'WhatDoWePlay est un annuaire de jeux à plusieurs qui se jouent dans le navigateur, sans rien installer.',
    sections: (n) => [
      { h: 'Ce que vous trouvez ici', p: [
        `${n} jeux choisis à la main, à jouer en famille, entre amis ou entre collègues. Chaque fiche indique le nombre de joueurs, la durée d'une partie, les langues, et s'il faut payer ou créer un compte.`,
        "Le site n'affiche pas de publicité, ne demande pas de compte et ne dépose pas de cookie.",
      ] },
      { h: 'Comment les informations sont tenues à jour', p: [
        'Un robot ouvre chaque lien une fois par jour. Un jeu qui ne répond plus est marqué « Hors ligne », puis retiré au bout de 30 jours.',
        "Les informations viennent du site de chaque jeu. Elles peuvent changer sans prévenir : en cas de doute, c'est le site du jeu qui fait foi.",
        'La mention « Testé par nos soins » apparaît seulement sur les jeux auxquels nous avons réellement joué.',
      ] },
      { h: "D'où viennent les jeux", p: [
        "Chaque semaine, un assistant IA cherche de nouveaux jeux et les propose. Aucun n'est ajouté sans avoir été relu et accepté par une personne.",
        `Le site lui-même est développé avec l'aide d'un assistant IA. Son code est public : <a href="${REPO}">${REPO.replace('https://', '')}</a>.`,
      ] },
      { h: 'Proposer un jeu, signaler une erreur', p: [
        `Écrivez à ${mail}. Les créateurs de jeux peuvent demander par la même adresse la correction ou le retrait de leur fiche.`,
      ] },
      { h: 'Noms, logos et images', p: [
        "Les noms, logos, vignettes et captures d'écran appartiennent à leurs propriétaires respectifs. Ils servent uniquement à présenter les jeux et à y renvoyer. WhatDoWePlay n'est affilié à aucun de ces jeux.",
      ] },
      { h: 'Mentions légales', p: [
        `Site personnel, édité à titre non professionnel. Contact : ${mail}.`,
        `Hébergement : ${HOST}, États-Unis.`,
        "Mesure d'audience : GoatCounter, sans cookie. Vos favoris et le thème choisi sont enregistrés uniquement dans votre navigateur.",
      ] },
    ],
  },
  es: {
    title: 'Acerca de',
    lead: 'WhatDoWePlay es un directorio de juegos para jugar en grupo desde el navegador, sin instalar nada.',
    sections: (n) => [
      { h: 'Qué encontrarás aquí', p: [
        `${n} juegos elegidos a mano, para jugar en familia, con amigos o con compañeros de trabajo. Cada ficha indica el número de jugadores, la duración de una partida, los idiomas, y si hay que pagar o crear una cuenta.`,
        'El sitio no muestra publicidad, no pide cuenta y no usa cookies.',
      ] },
      { h: 'Cómo se mantiene al día la información', p: [
        'Un robot abre cada enlace una vez al día. Un juego que deja de responder se marca como «Fuera de línea» y se retira a los 30 días.',
        'Los datos proceden del sitio de cada juego. Pueden cambiar sin aviso: en caso de duda, vale lo que diga el sitio del juego.',
        'La mención «Probado por nosotros» aparece solo en los juegos a los que hemos jugado de verdad.',
      ] },
      { h: 'De dónde salen los juegos', p: [
        'Cada semana, un asistente de IA busca juegos nuevos y los propone. Ninguno se añade sin que una persona lo haya revisado y aceptado.',
        `El propio sitio se desarrolla con la ayuda de un asistente de IA. Su código es público: <a href="${REPO}">${REPO.replace('https://', '')}</a>.`,
      ] },
      { h: 'Proponer un juego, avisar de un error', p: [
        `Escribe a ${mail}. Los creadores de juegos pueden pedir en la misma dirección que se corrija o se retire su ficha.`,
      ] },
      { h: 'Nombres, logotipos e imágenes', p: [
        'Los nombres, logotipos, miniaturas y capturas de pantalla pertenecen a sus respectivos propietarios. Se usan únicamente para presentar los juegos y enlazar a ellos. WhatDoWePlay no está afiliado a ninguno de estos juegos.',
      ] },
      { h: 'Aviso legal', p: [
        `Sitio personal, sin fines comerciales. Contacto: ${mail}.`,
        `Alojamiento: ${HOST}, Estados Unidos.`,
        'Medición de audiencia: GoatCounter, sin cookies. Tus favoritos y el tema elegido se guardan únicamente en tu navegador.',
      ] },
    ],
  },
};
