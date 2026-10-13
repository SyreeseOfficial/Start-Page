const THEMES = ['dracula', 'nord', 'gruvbox', 'light'];

function setTheme(t) {
  const root = document.documentElement;
  root.dataset.theme = t;
  document.querySelector('meta[name=theme-color]').content = getComputedStyle(root).getPropertyValue('--bg').trim();
}

let saved;
try { saved = localStorage.getItem('theme'); } catch {}
setTheme(THEMES.includes(saved) ? saved : THEMES[0]);

document.addEventListener('keydown', e => {
  const t = THEMES[e.key - 1];
  if (!t || e.target.tagName === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return;
  setTheme(t);
  try { localStorage.setItem('theme', t); } catch {}
});
