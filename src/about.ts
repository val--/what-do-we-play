// The "About" page: what the site is, how to reach its owner, and the legal notice.
// One short block of text per language; a paragraph may contain links.
import { SITES, type Locale } from './i18n';

export const CONTACT = 'contact@whatdoweplay.games';
const mail = `<a href="mailto:${CONTACT}">${CONTACT}</a>`;
const HOST = 'GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107';

// Address of the page in each language, without the site's base.
const SLUGS: Record<Locale, string> = { en: 'about', fr: 'a-propos', es: 'acerca-de' };
export const aboutPath = (locale: Locale) => `${SITES[locale].prefix}/${SLUGS[locale]}/`;

// A section with an empty heading is shown as plain paragraphs.
type About = { title: string; lead: string; sections: (games: number) => { h: string; p: string[] }[] };

export const about: Record<Locale, About> = {
  en: {
    title: 'About',
    lead: 'WhatDoWePlay is a directory of games to play together in a web browser, with nothing to install.',
    sections: (n) => [
      { h: '', p: [
        `${n} games picked by hand (with a little help from AI for a first sort 😉), to play with family, friends or coworkers. No ads, no account, no cookies.`,
        "Links are checked every day. The details come from each game's own site and can change: when in doubt, the game's site is right.",
      ] },
      { h: 'Contact', p: [
        `To suggest a game, report a mistake or ask for a page to be removed: ${mail}.`,
      ] },
      { h: 'Legal notice', p: [
        `A personal, non-commercial site. Hosting: ${HOST}, United States.`,
        'Game names, logos and images belong to their owners. WhatDoWePlay is not affiliated with any of these games.',
      ] },
    ],
  },
  fr: {
    title: 'À propos',
    lead: 'WhatDoWePlay est un annuaire de jeux à plusieurs qui se jouent dans le navigateur, sans rien installer.',
    sections: (n) => [
      { h: '', p: [
        `${n} jeux choisis à la main (avec un coup de main de l'IA pour faire un premier tri 😉), à jouer en famille, entre amis ou entre collègues. Pas de publicité, pas de compte, pas de cookie.`,
        "Les liens sont vérifiés chaque jour. Les informations viennent du site de chaque jeu et peuvent changer : en cas de doute, c'est lui qui fait foi.",
      ] },
      { h: 'Contact', p: [
        `Pour proposer un jeu, signaler une erreur ou demander le retrait d'une fiche : ${mail}.`,
      ] },
      { h: 'Mentions légales', p: [
        `Site personnel, non professionnel. Hébergement : ${HOST}, États-Unis.`,
        "Les noms, logos et images des jeux appartiennent à leurs propriétaires. WhatDoWePlay n'est affilié à aucun de ces jeux.",
      ] },
    ],
  },
  es: {
    title: 'Acerca de',
    lead: 'WhatDoWePlay es un directorio de juegos para jugar en grupo desde el navegador, sin instalar nada.',
    sections: (n) => [
      { h: '', p: [
        `${n} juegos elegidos a mano (con una ayudita de la IA para hacer una primera selección 😉), para jugar en familia, con amigos o con compañeros de trabajo. Sin publicidad, sin cuenta, sin cookies.`,
        'Los enlaces se comprueban cada día. Los datos proceden del sitio de cada juego y pueden cambiar: en caso de duda, vale lo que diga el sitio del juego.',
      ] },
      { h: 'Contacto', p: [
        `Para proponer un juego, avisar de un error o pedir que se retire una ficha: ${mail}.`,
      ] },
      { h: 'Aviso legal', p: [
        `Sitio personal, sin fines comerciales. Alojamiento: ${HOST}, Estados Unidos.`,
        'Los nombres, logotipos e imágenes de los juegos pertenecen a sus propietarios. WhatDoWePlay no está afiliado a ninguno de estos juegos.',
      ] },
    ],
  },
};
