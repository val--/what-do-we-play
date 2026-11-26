// Client-side filters. Within a group, ticked boxes add up (OR);
// across groups they combine (AND). State lives in the URL so it can be shared.
const form = document.getElementById('filters');
const games = [...document.querySelectorAll('#games > .game')];
const count = document.getElementById('count');
const reset = document.getElementById('reset');
const none = document.getElementById('none');
// The links to the other languages keep the filters: remember each one's own address.
const langSwitches = [...document.querySelectorAll('[data-lang-switch]')].map((link) => ({ link, href: link.getAttribute('href') }));

const GROUPS = { for: 'for', lang: 'langs', type: 'types' };
const FLAGS = ['free', 'noaccount', 'phone', 'noscreen'];
const list = document.getElementById('games');
const sort = document.getElementById('sort');
const search = document.getElementById('q');

// A page by need (src/landings.ts) holds only its own games and shows its rule as ticked boxes:
// the preset. It stays out of the URL. As soon as the visitor changes one of those boxes,
// the page no longer holds the right games, so we go to the home page with the filters as they are.
const preset = [...new URLSearchParams(form.dataset.preset || '')];
const home = form.dataset.home;
const presetHeld = (state) => preset.every(([key, value]) =>
  key in GROUPS ? state[key].join(',') === value : FLAGS.includes(key) ? state[key] : state[key] === value);
function withoutPreset(state) {
  const rest = { ...state };
  for (const [key] of preset) rest[key] = key in GROUPS ? [] : FLAGS.includes(key) ? false : '';
  return rest;
}

// Same folding as the build: lower case, no accents.
const plain = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Favourites: specific to this browser, never in the URL.
const FAV_KEY = 'wdwp:favs';
let favs = new Set();
try { favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]')); } catch {}
function paintFavs() {
  for (const el of games) el.querySelector('.fav').setAttribute('aria-pressed', String(favs.has(el.dataset.id)));
}

const SORTS = {
  '': (a, b) => a.dataset.i - b.dataset.i,
  new: (a, b) => b.dataset.added.localeCompare(a.dataset.added) || a.dataset.i - b.dataset.i,
  az: (a, b) => a.dataset.name.localeCompare(b.dataset.name),
  short: (a, b) => a.dataset.dmin - b.dataset.dmin || a.dataset.i - b.dataset.i,
  big: (a, b) => b.dataset.max - a.dataset.max || a.dataset.i - b.dataset.i,
};

function readForm() {
  const data = new FormData(form);
  const state = { n: data.get('n') || '', t: data.get('t') || '', q: search.value.trim() };
  for (const name of Object.keys(GROUPS)) state[name] = data.getAll(name);
  for (const flag of FLAGS) state[flag] = data.has(flag);
  return state;
}

function toQuery(state) {
  const q = new URLSearchParams();
  if (state.q) q.set('q', state.q);
  if (state.n) q.set('n', state.n);
  if (state.t) q.set('t', state.t);
  for (const name of Object.keys(GROUPS)) if (state[name].length) q.set(name, state[name].join(','));
  for (const flag of FLAGS) if (state[flag]) q.set(flag, '1');
  return q.toString();
}

function fillForm(query) {
  const q = new URLSearchParams(query);
  for (const [key, value] of preset) q.set(key, value);
  search.value = q.get('q') || '';
  form.elements.n.value = q.get('n') || '';
  form.elements.t.value = q.get('t') || '';
  for (const box of form.querySelectorAll('input[type=checkbox]:not([name=favs])')) {
    box.checked = FLAGS.includes(box.name)
      ? q.get(box.name) === '1'
      : (q.get(box.name) || '').split(',').includes(box.value);
  }
}

function matches(el, state) {
  const d = el.dataset;
  // Every word typed must appear somewhere in the game's text.
  if (state.q && !plain(state.q).split(/\s+/).every((word) => d.search.includes(word))) return false;
  const n = Number(state.n);
  if (n && (n < Number(d.min) || n > Number(d.max))) return false;
  if (state.t && Number(d.dmin) > Number(state.t)) return false;
  for (const [name, attr] of Object.entries(GROUPS)) {
    if (state[name].length && !state[name].some((v) => d[attr].split(' ').includes(v))) return false;
  }
  if (form.elements.favs.checked && !favs.has(d.id)) return false;
  return FLAGS.every((flag) => !state[flag] || d[flag] === '1');
}

function apply() {
  const state = readForm();
  if (!presetHeld(state)) {
    const all = toQuery(state);
    location.assign(all ? `${home}?${all}` : home);
    return;
  }
  let shown = 0;
  for (const el of games) {
    const ok = matches(el, state);
    el.hidden = !ok;
    if (ok) shown++;
  }
  const { one, many, zero } = count.dataset;
  count.textContent = shown === 0 ? zero : shown === 1 ? one : many.replace('{n}', shown);
  none.hidden = shown !== 0;

  const query = toQuery(withoutPreset(state));
  history.replaceState(null, '', query ? `?${query}` : location.pathname);
  for (const { link, href } of langSwitches) link.href = query ? `${href}?${query}` : href;
}

fillForm(location.search);
paintFavs();
apply();
// Coming back with the browser's Back button can bring the page as it was left: put it in order again.
addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  fillForm(location.search);
  apply();
});
form.addEventListener('input', apply);
search.addEventListener('input', apply);
form.addEventListener('submit', (e) => e.preventDefault());
reset.addEventListener('click', () => {
  fillForm('');
  form.elements.favs.checked = false;
  apply();
});
sort.addEventListener('change', () => {
  list.append(...[...games].sort(SORTS[sort.value]));
});
// The "+3 games added" line sorts by newest first.
document.getElementById('fresh')?.addEventListener('click', () => {
  sort.value = 'new';
  sort.dispatchEvent(new Event('change'));
});
list.addEventListener('click', (e) => {
  const btn = e.target.closest('.fav');
  if (!btn) return;
  const id = btn.closest('.game').dataset.id;
  favs.has(id) ? favs.delete(id) : favs.add(id);
  try { localStorage.setItem(FAV_KEY, JSON.stringify([...favs])); } catch {}
  paintFavs();
  apply();
});
