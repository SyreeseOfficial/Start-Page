const input = document.getElementById('search-input');
const echo = document.getElementById('search-echo');
const hint = document.getElementById('search-hint');
input.addEventListener('input', () => {
  echo.textContent = input.value;
  hint.style.display = input.value ? 'none' : '';
});
input.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const v = input.value.trim();
  if (!v) return;
  const m = v.match(/^(y|gh)\s+(.*)$/);
  const q = encodeURIComponent(m ? m[2] : v);
  window.location.href = m && m[1] === 'y'
    ? `https://www.youtube.com/results?search_query=${q}`
    : m ? `https://github.com/search?q=${q}`
    : `https://www.google.com/search?q=${q}`;
});
document.addEventListener('keydown', e => {
  const t = e.target && e.target.tagName;
  if (t === 'INPUT' || e.ctrlKey || e.metaKey) return;
  if (e.key === '/') { e.preventDefault(); input.focus(); }
});
