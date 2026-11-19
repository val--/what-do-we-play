// Client-side filters. Within a group, ticked boxes add up (OR);
// across groups they combine (AND). State lives in the URL so it can be shared.
const form = document.getElementById('filters');
const games = [...document.querySelectorAll('#games > .game')];
const count = document.getElementById('count');
const reset = document.getElementById('reset');
const none = document.getElementById('none');
const langSwitch = document.querySelector('[data-lang-switch]');
const switchHref = langSwitch.getAttribute('href');

const GROUPS = { for: 'for', lang: 'langs', type: 'types' };
const FLAGS = ['free', 'noaccount', 'phone', 'noscreen'];
const list = document.getElementById('games');
const sort = document.getElementById('sort');

// Favourites: specific to this browser, never in the URL.
const FAV_KEY = 'wdwp:favs';
let favs = new Set();
try { favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]')); } catch {}
function paintFavs() {
  for (const el of games) el.querySelector('.fav').setAttribute('aria-pressed', String(favs.has(el.dataset.id)));
}

const SORTS = {
  '': (a, b) => a.dataset.i - b.dataset.i,
  az: (a, b) => a.dataset.name.localeCompare(b.dataset.name),
  short: (a, b) => a.dataset.dmin - b.dataset.dmin || a.dataset.i - b.dataset.i,
  big: (a, b) => b.dataset.max - a.dataset.max || a.dataset.i - b.dataset.i,
};

function readForm() {
  const data = new FormData(form);
  const state = { n: data.get('n') || '', t: data.get('t') || '' };
  for (const name of Object.keys(GROUPS)) state[name] = data.getAll(name);
  for (const flag of FLAGS) state[flag] = data.has(flag);
  return state;
}

function toQuery(state) {
  const q = new URLSearchParams();
  if (state.n) q.set('n', state.n);
  if (state.t) q.set('t', state.t);
  for (const name of Object.keys(GROUPS)) if (state[name].length) q.set(name, state[name].join(','));
  for (const flag of FLAGS) if (state[flag]) q.set(flag, '1');
  return q.toString();
}

function fillForm(query) {
  const q = new URLSearchParams(query);
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
  let shown = 0;
  for (const el of games) {
    const ok = matches(el, state);
    el.hidden = !ok;
    if (ok) shown++;
  }
  const { one, many, zero } = count.dataset;
  count.textContent = shown === 0 ? zero : shown === 1 ? one : many.replace('{n}', shown);
  none.hidden = shown !== 0;

  const query = toQuery(state);
  history.replaceState(null, '', query ? `?${query}` : location.pathname);
  langSwitch.href = query ? `${switchHref}?${query}` : switchHref;
}

fillForm(location.search);
paintFavs();
apply();
form.addEventListener('input', apply);
form.addEventListener('submit', (e) => e.preventDefault());
reset.addEventListener('click', () => {
  fillForm('');
  form.elements.favs.checked = false;
  apply();
});
sort.addEventListener('change', () => {
  list.append(...[...games].sort(SORTS[sort.value]));
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
