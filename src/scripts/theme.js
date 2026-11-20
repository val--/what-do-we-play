// Light/dark button in the header. Without a stored choice the page follows the device.
const KEY = 'wdwp:theme';
const root = document.documentElement;
const button = document.querySelector('[data-theme-toggle]');
const deviceDark = matchMedia('(prefers-color-scheme: dark)');

const current = () => root.dataset.theme || (deviceDark.matches ? 'dark' : 'light');

function paint() {
  const mode = current();
  const label = mode === 'dark' ? button.dataset.toLight : button.dataset.toDark;
  button.dataset.mode = mode;
  button.setAttribute('aria-label', label);
  button.title = label;
}

if (button) {
  button.hidden = false;
  paint();
  deviceDark.addEventListener('change', paint);
  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch {}
    paint();
  });
}
