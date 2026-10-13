// key -> () => void; app.js fills this with the link shortcuts (empty on minimal.html)
const linkKeys = new Map();

// prefix -> [label, search url]; `y cats` searches youtube for "cats"
const ENGINES = new Map([
  ['y',   ['youtube',    'https://www.youtube.com/results?search_query=']],
  ['gh',  ['github',     'https://github.com/search?q=']],
  ['w',   ['wikipedia',  'https://en.wikipedia.org/w/index.php?search=']],
  ['d',   ['duckduckgo', 'https://duckduckgo.com/?q=']],
  ['mdn', ['',           'https://developer.mozilla.org/en-US/search?q=']],
  ['npm', ['',           'https://www.npmjs.com/search?q=']],
  ['aur', ['',           'https://aur.archlinux.org/packages?K=']],
  ['r',   ['reddit',     'https://www.reddit.com/search/?q=']],
]);
const URL_RE = /^(https?:\/\/\S+|(localhost|\d{1,3}(\.\d{1,3}){3}|([a-z0-9-]+\.)+[a-z]{2,})(:\d+)?([/?#]\S*)?)$/i;

const input = document.getElementById('search-input');
input.placeholder = 'search · ' + [...ENGINES].map(([k, [label]]) => `${k} ${label}`.trim()).join(' · ');
input.title = input.placeholder;

const go = url => { window.location.href = url; };

input.addEventListener('keydown', e => {
  if (e.key === 'Escape') return input.blur(); // then link keys work without the search box eating them
  if (e.key !== 'Enter' || e.isComposing) return;
  const v = input.value.trim();
  if (!v) return;
  const jump = linkKeys.get(v.toLowerCase());
  if (jump) return jump();
  const [, prefix, query] = v.match(/^(\S+)\s+(.*)$/) || [];
  if (ENGINES.has(prefix)) go(ENGINES.get(prefix)[1] + encodeURIComponent(query));
  else if (URL_RE.test(v)) go(/^https?:/i.test(v) ? v : (/^(localhost|\d)/.test(v) ? 'http://' : 'https://') + v);
  else go('https://www.google.com/search?q=' + encodeURIComponent(v));
});

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.ctrlKey || e.metaKey) return;
  if (e.key === '/') { e.preventDefault(); input.focus(); }
});
