const LINK_GROUPS = [
  { name: 'google', links: [['g','gmail','https://mail.google.com/'],['p','photos','https://photos.google.com/'],['c','calendar','https://calendar.google.com/'],['d','drive','https://drive.google.com/'],['o','docs','https://docs.google.com/']] },
  { name: 'dev+ai', links: [['h','github','https://github.com/'],['l','claude','https://claude.ai/'],['e','gemini','https://gemini.google.com/']] },
  { name: 'media', links: [['y','youtube','https://www.youtube.com/'],['r','reddit','https://www.reddit.com/'],['x','x','https://x.com/?lang=en'],['m','yt music','https://music.youtube.com/']] },
  { name: 'tools', links: [['t','yt transcript','https://youtubetotranscript.com/'],['v','canva','https://www.canva.com/'],['k','monkeytype','https://monkeytype.com/'],['i','title caps','https://capitalizemytitle.com/'],['a','date calc','https://www.timeanddate.com/date/dateadd.html']] }
];

const linksPane = document.getElementById('links-pane');
for (const g of LINK_GROUPS) {
  const col = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'group-name';
  name.textContent = g.name;
  col.appendChild(name);
  for (const [key, label, href] of g.links) {
    const row = document.createElement('div');
    row.innerHTML = `<span style="color:#6272a4">${key}</span> <a href="${href}">${label}</a>`;
    col.appendChild(row);
  }
  linksPane.appendChild(col);
}
document.getElementById('links-pane').appendChild(document.getElementById('cat'));
document.getElementById('cat').style.position = 'absolute';

const pad = n => String(n).padStart(2, '0');
const ordinal = d => (d % 10 === 1 && d !== 11) ? 'st' : (d % 10 === 2 && d !== 12) ? 'nd' : (d % 10 === 3 && d !== 13) ? 'rd' : 'th';

function tick() {
  const n = new Date();
  const h = n.getHours(), day = n.getDate();
  document.getElementById('greeting').textContent = (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + ', Syreese.';
  document.getElementById('clock').textContent = `${pad(h)}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
  document.getElementById('date').textContent = `${n.toLocaleDateString('en-US', { weekday: 'long' })} the ${day}${ordinal(day)}`;
}
tick();
setInterval(tick, 1000);

function hm(iso) { return iso ? iso.slice(11, 16) : '--:--'; }
function loadWeather(lat, lon, place) {
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&daily=sunrise,sunset,precipitation_probability_max&timezone=auto&forecast_days=1`)
    .then(r => r.json())
    .then(d => {
      document.getElementById('wx-place').textContent = place;
      document.getElementById('wx-temp').textContent = `${Math.round(d.current.temperature_2m)}°C`;
      document.getElementById('wx-rain').textContent = `${d.daily.precipitation_probability_max[0]}%`;
      document.getElementById('wx-sunrise').textContent = hm(d.daily.sunrise[0]);
      document.getElementById('wx-sunset').textContent = hm(d.daily.sunset[0]);
    })
    .catch(() => {});
}
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    p => loadWeather(p.coords.latitude, p.coords.longitude, 'local'),
    () => loadWeather(40.71, -74.01, 'New York'),
    { timeout: 4000 }
  );
} else {
  loadWeather(40.71, -74.01, 'New York');
}

function loadQuote() {
  const quoteEl = document.getElementById('quote'), authorEl = document.getElementById('author');
  quoteEl.classList.add('swapping');
  authorEl.classList.add('swapping');
  fetch('https://quotescdn.vercel.app/api/random')
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(q => {
      quoteEl.textContent = q.quote;
      authorEl.textContent = `— ${q.author}`;
    })
    .catch(err => {
      console.error('quote fetch failed:', err);
      quoteEl.textContent = 'Could not load a quote — check console for error';
      authorEl.textContent = '';
    })
    .finally(() => {
      quoteEl.classList.remove('swapping');
      authorEl.classList.remove('swapping');
    });
}
loadQuote();
document.getElementById('new-quote').addEventListener('click', e => { e.preventDefault(); loadQuote(); });

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
  else if (e.key === 'n') loadQuote();
});
