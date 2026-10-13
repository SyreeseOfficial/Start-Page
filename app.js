const CONFIG = {
  name: 'Syreese',
  home: { name: 'New York', lat: 40.71, lon: -74.01 },
  geolocate: false,       // true = ask the browser for your location (permission prompt, falls back to home)
  units: 'metric',        // 'metric' | 'imperial'
  hour12: false,          // default clock format; click the clock to toggle
  useQuoteApi: false,     // true = fetch quotes from quotescdn.vercel.app (falls back to quotes.js)
  links: [                // [key, label, url]
    { name: 'google', links: [['g','gmail','https://mail.google.com/'],['p','photos','https://photos.google.com/'],['c','calendar','https://calendar.google.com/'],['d','drive','https://drive.google.com/'],['o','docs','https://docs.google.com/']] },
    { name: 'dev+ai', links: [['h','github','https://github.com/'],['l','claude','https://claude.ai/'],['e','gemini','https://gemini.google.com/']] },
    { name: 'media', links: [['y','youtube','https://www.youtube.com/'],['r','reddit','https://www.reddit.com/'],['x','x','https://x.com/?lang=en'],['m','yt music','https://music.youtube.com/']] },
    { name: 'tools', links: [['t','yt transcript','https://youtubetotranscript.com/'],['v','canva','https://www.canva.com/'],['k','monkeytype','https://monkeytype.com/'],['i','title caps','https://capitalizemytitle.com/'],['a','date calc','https://www.timeanddate.com/date/dateadd.html']] },
  ],
};

const $ = id => document.getElementById(id);
const setText = (el, s) => { if (el.textContent !== s) el.textContent = s; };
const store = {
  get(k, fallback) { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ---- links (sorted by use count, tracked in localStorage) ----
const hits = store.get('hits', {});
function visit(href) {
  hits[href] = (hits[href] || 0) + 1;
  store.set('hits', hits);
  window.location.href = href;
}
const linksPane = $('links-pane');
for (const g of CONFIG.links) {
  const col = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'group-name';
  name.textContent = g.name;
  col.appendChild(name);
  for (const [key, label, href] of g.links.slice().sort((a, b) => (hits[b[2]] || 0) - (hits[a[2]] || 0))) {
    const row = document.createElement('div');
    const k = document.createElement('span');
    k.className = 'muted';
    k.textContent = key;
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    row.append(k, ' ', a);
    col.appendChild(row);
    linkKeys.set(key, () => visit(href));
  }
  linksPane.appendChild(col);
}
// count real clicks too (left + middle); navigation proceeds normally
const countClick = e => {
  const a = e.target.closest('a');
  if (a) { const h = a.getAttribute('href'); hits[h] = (hits[h] || 0) + 1; store.set('hits', hits); }
};
linksPane.addEventListener('click', countClick);
linksPane.addEventListener('auxclick', countClick);

// ---- clock ----
let hour12 = store.get('hour12', CONFIG.hour12);
const pad = n => String(n).padStart(2, '0');
const ordinal = d => (d % 10 === 1 && d !== 11) ? 'st' : (d % 10 === 2 && d !== 12) ? 'nd' : (d % 10 === 3 && d !== 13) ? 'rd' : 'th';
const fmtH = h => pad(hour12 ? h % 12 || 12 : h);
const suffix = h => hour12 ? (h < 12 ? ' AM' : ' PM') : '';

let lastMinute = -1;
function tick() {
  const n = new Date();
  const h = n.getHours(), m = n.getMinutes();
  setText($('time'), `${fmtH(h)}:${pad(m)}:${pad(n.getSeconds())}`);
  setText($('ampm'), suffix(h));
  if (m === lastMinute) return;
  lastMinute = m;
  const day = n.getDate();
  setText($('greeting'), (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + `, ${CONFIG.name}.`);
  setText($('date'), `${n.toLocaleDateString('en-US', { weekday: 'long' })} the ${day}${ordinal(day)}`);
}
tick();
setInterval(tick, 1000);
$('clock').addEventListener('click', () => {
  hour12 = !hour12;
  store.set('hour12', hour12);
  tick();
  renderWeather();
});

// ---- weather ----
const IMPERIAL = CONFIG.units === 'imperial';
const UNIT = IMPERIAL ? { t: '°F', w: 'mph' } : { t: '°C', w: 'km/h' };
const WMO = [ // [max code, icon, text]
  [0, '☀', 'clear'], [2, '⛅', 'partly cloudy'], [3, '☁', 'overcast'], [48, '≋', 'fog'],
  [57, '☂', 'drizzle'], [67, '☂', 'rain'], [77, '❄', 'snow'], [82, '☂', 'showers'],
  [86, '❄', 'snow showers'], [99, '⚡', 'thunderstorm'],
];
const wmo = c => (WMO.find(([max]) => c <= max) || WMO[WMO.length - 1]).slice(1); // -> [icon, text]
const deg = v => `${Math.round(v)}°`;
// "2026-10-13T06:58" -> same format as the clock
const hm = iso => iso ? `${fmtH(+iso.slice(11, 13))}:${iso.slice(14, 16)}${suffix(+iso.slice(11, 13))}` : '--:--';

let wx = null; // last data shown
function renderWeather() {
  if (!wx) return;
  const { d, place } = wx;
  const [icon, text] = wmo(d.current.weather_code);
  setText($('wx-place'), place);
  setText($('wx-now'), `${icon} ${text}`);
  setText($('wx-temp'), `${Math.round(d.current.temperature_2m)}${UNIT.t} · feels ${deg(d.current.apparent_temperature)}`);
  setText($('wx-range'), `${deg(d.daily.temperature_2m_max[0])} / ${deg(d.daily.temperature_2m_min[0])}`);
  setText($('wx-wind'), `${Math.round(d.current.wind_speed_10m)} ${UNIT.w}`);
  setText($('wx-rain'), `${d.daily.precipitation_probability_max[0]}%`);
  setText($('wx-sunrise'), hm(d.daily.sunrise[0]));
  setText($('wx-sunset'), hm(d.daily.sunset[0]));
  const days = $('wx-days');
  days.replaceChildren();
  for (let i = 1; i < d.daily.time.length; i++) {
    const row = document.createElement('div');
    row.className = 'wx-row';
    const day = document.createElement('span');
    day.textContent = new Date(d.daily.time[i] + 'T12:00').toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const val = document.createElement('span');
    val.textContent = `${wmo(d.daily.weather_code[i])[0]} ${deg(d.daily.temperature_2m_max[i])}/${deg(d.daily.temperature_2m_min[i])}`;
    row.append(day, val);
    days.appendChild(row);
  }
}

const WX_TTL = 15 * 60 * 1000;
function loadWeather(lat, lon, place) {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)},${CONFIG.units}`;
  setText($('wx-place'), place);
  const cached = store.get('wx', null);
  if (cached && cached.key === key) {
    wx = { d: cached.d, place };
    renderWeather();
    if (Date.now() - cached.t < WX_TTL) return;
  }
  const unitParams = IMPERIAL ? '&temperature_unit=fahrenheit&wind_speed_unit=mph' : '';
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max' +
    `&timezone=auto&forecast_days=4${unitParams}`)
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(d => {
      store.set('wx', { key, t: Date.now(), d });
      wx = { d, place };
      renderWeather();
    })
    .catch(() => { if (!wx) setText($('wx-now'), navigator.onLine ? 'unavailable' : 'offline'); });
}
const { lat, lon, name } = CONFIG.home;
if (CONFIG.geolocate && navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    p => loadWeather(p.coords.latitude, p.coords.longitude, 'local'),
    () => loadWeather(lat, lon, name),
    { timeout: 4000 }
  );
} else {
  loadWeather(lat, lon, name);
}

// ---- quotes ----
const quoteEl = $('quote'), authorEl = $('author');
let quote = null;
function showQuote([text, author]) {
  quote = text;
  quoteEl.textContent = text;
  authorEl.textContent = `— ${author}`;
}
function localQuote() {
  let q;
  do q = QUOTES[Math.floor(Math.random() * QUOTES.length)]; while (q[0] === quote && QUOTES.length > 1);
  return q;
}
function fetchQuote() {
  if (!CONFIG.useQuoteApi) return Promise.resolve(localQuote());
  return fetch('https://quotescdn.vercel.app/api/random')
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(q => [q.quote, q.author])
    .catch(localQuote);
}
let busy = false;
function loadQuote() {
  if (busy) return;
  busy = true;
  quoteEl.classList.add('swapping');
  authorEl.classList.add('swapping');
  Promise.all([fetchQuote(), new Promise(r => setTimeout(r, 150))]).then(([q]) => {
    showQuote(q);
    quoteEl.classList.remove('swapping');
    authorEl.classList.remove('swapping');
    busy = false;
  });
}
showQuote(localQuote());
$('new-quote').addEventListener('click', loadQuote);

// ---- keys: n = new quote, otherwise a link key jumps (search box must be unfocused: Esc) ----
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
  if (e.key === 'n') loadQuote();
  else linkKeys.get(e.key)?.();
});
