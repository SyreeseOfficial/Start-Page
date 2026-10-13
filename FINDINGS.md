# Start-Page: Findings

Reviewed 2026-10-08. Files: `index.html` (224 lines), `app.js` (107), `minimal.html` (115), `minimal.js` (23). Tags: **[H]** high, **[M]** medium, **[L]** low. `[ ]` = open, `[x]` = done.

## Skip
- [ ] **[M]** Edit links in-page: press `e` to open a small editor, store `LINK_GROUPS` in `localStorage`, with a default fallback. Stops you from editing source for every new bookmark.
- [ ] **[M]** Hacker News top 5 pane (`hacker-news.firebaseio.com`, CORS-enabled) or an RSS-to-JSON feed; click-through, refreshed every 30 min and cached.
- [ ] **[M]** Persistent scratch todo/notes pane in `localStorage` (3-5 items, `t` to add, click to tick). Natural fit for a terminal-style start page.
- [ ] **[L]** World clocks / countdown to a date in the home pane.
- [ ] **[L]** `!bang` passthrough to DuckDuckGo (`!w cats`) for engines not in the map.

## Done

### Bugs / broken promises (verified)
- [x] **[H]** Link shortcut keys do nothing. Each link shows a key (`g`, `p`, `c`, `h`, `y`...) and the README says "each with a single-key shortcut", but `app.js` only handles `/` and `n` (`app.js:102-107`). Wire them up. Caveat: the search input is `autofocus`, so single letters would be typed into it. Cheapest fit with the existing `y query` / `gh query` syntax: in the search box, a lone link key + Enter jumps (`g⏎` = Gmail). Alternative: `Esc` blurs the input and enables single-key mode.
- [x] **[H]** README "Install" says "Download `index.html`" and "Everything lives in `index.html`: edit `LINK_GROUPS`, `tick()`, `loadWeather()`". Those moved to `app.js` in the last refactor, so a user who downloads only `index.html` gets a page with no links, clock, weather or quotes. Same for `minimal.html` needing `minimal.js`. Update README (or inline the scripts again).
- [x] **[M]** README says "Colors: edit the CSS variables at the top of `<style>`". There are none; only `color-scheme` is defined, and ~15 hex colors are repeated throughout (`#282a36`, `#6272a4`, `#bd93f9`, ...). Introduce `--bg --fg --muted --accent --pink --cyan --green --yellow` on `:root` and use them (also makes theming below trivial).
- [x] **[M]** Weather failure is silent and permanent: `.catch(() => {})` (`app.js:49`) leaves `...` / `--` forever, and `r.json()` runs without checking `r.ok`. Show `offline` / `unavailable` and keep the last cached values.
- [x] **[M]** Quote failure message is developer text: "Could not load a quote - check console for error" (`app.js:73`). Fall back to a local quote instead (see Privacy).
- [x] **[M]** Custom search box breaks normal editing: the real `<input>` is transparent and the visible text is a mirrored `<span>` with a fake cursor always at the end (`index.html:87-103`). Arrow keys, click-to-position, selection highlight, and IME input (CJK) don't show; long input overflows the box in `index.html`. Make the input visible (`color`, `caret-color: var(--accent)`) and delete the echo/cursor mirror (~25 lines of CSS+JS across both pages).
- [x] **[L]** `n` fires `loadQuote()` with no in-flight guard (`app.js:106`); holding it spams the API.
- [x] **[L]** `new-quote` is `<a href="#">` with `preventDefault`. It is an action, so make it a `<button>`; `href="#"` also adds `#` to history if JS fails.
- [x] **[L]** No favicon: every load requests `/favicon.ico` (404 locally). Add an inline `data:` SVG favicon.

### Privacy / offline (README says "no tracking")
- [x] **[H]** Every new tab calls 2 third parties on top of Google Fonts: `quotescdn.vercel.app` (an unrelated hosted API that can vanish or log) and Open-Meteo. Bundle ~100 quotes in `quotes.js` and pick one with `Math.random()`: instant, offline, zero requests. Keep the API as an opt-in `USE_QUOTE_API` flag if you want fresh ones.
- [x] **[M]** Self-host JetBrains Mono (woff2, 400 + 700, ~40 KB) and drop both Google Fonts `<link>`s (`index.html:7-9`, same in `minimal.html`). Removes the render-blocking request, the Google tracking ping, and the offline fallback flash.
- [x] **[M]** Geolocation permission prompt on every new-tab load (`app.js:51`) and a 4 s wait before weather shows. Put `HOME = { name, lat, lon }` in a config block and make geolocation opt-in (`GEOLOCATE = false`). Faster, no prompt, correct place name instead of the literal `local`.
- [x] **[L]** Cache the last weather response in `localStorage` (with timestamp): render it instantly, refetch only if older than ~15 min. A new tab is then never blank and stops hitting the API on every open.

### UI / UX
- [x] **[H]** Layout breaks in small/half-width windows: fixed `grid-template-columns: 290px 1fr`, `height: 100vh`, `overflow: hidden`, no media queries (`index.html:30-47`). On a tiled half-screen or a phone the links pane is clipped and not scrollable. Add `@media (max-width: 900px)` to stack to one column, set `overflow: auto` and `min-height: 100dvh`.
- [x] **[M]** Weather is minimal and °C-only (`app.js:44`): add condition text/icon (`weather_code`), feels-like, high/low, wind; add `UNITS = 'metric' | 'imperial'` (and `temperature_unit=fahrenheit` in the API call).
- [x] **[M]** Search box can only do Google, `y`, `gh`. Replace the hardcoded regex with an `ENGINES` map (`y`, `gh`, `w` Wikipedia, `d` DuckDuckGo, `mdn`, `npm`, `aur`, `r` Reddit) and show the list in the hint. Treat input that looks like a URL (`example.com`, `localhost:3000`) as navigation, not a Google search.
- [x] **[M]** Greeting hardcodes `Syreese` (`app.js:31`). Move to a `CONFIG` block at the top of `app.js` with name, links, home location, units, 12/24 h clock.
- [x] **[M]** Contrast: muted `#6272a4` on `#282a36` is about 3.3:1 for small text (hints, weather labels, link keys), below WCAG AA 4.5:1. Lighten the muted token to ~`#8a96c4` for text (keep `#6272a4` for borders).
- [x] **[L]** Add `:focus-visible` outlines on links and the quote button (only the search has a focus style), and `aria-label="Search"` on the input (currently unlabeled and invisible to screen readers).
- [x] **[L]** Respect `prefers-reduced-motion` for the hover transforms, blinking cursor, and quote fade.
- [x] **[L]** Mark decorative cat `aria-hidden="true"`; set `<title>` per page and add `<meta name="theme-color">`.
- [x] **[L]** Update the clock element only when the text changes and recompute greeting/date once per minute rather than every second (`app.js:28-34`); negligible cost, but cleaner.
- [x] **[L]** 12/24-hour toggle and show sunrise/sunset in the same format as the clock.

### New features (pick 2-3, keep it fast)
- [x] **[L]** Theme switcher (Dracula, Nord, Gruvbox, light) once CSS variables exist; `1`-`4` to switch or `t`.
- [x] **[L]** Frecency: sort links by use count (tracked in `localStorage`) within each group, or show a "recent" row.
- [x] **[L]** Hourly forecast strip or 3-day outlook from the same Open-Meteo call (`hourly=temperature_2m,precipitation_probability`).

### Remove / clean up
- [x] **[M]** `minimal.html` duplicates the search CSS (~45 lines) and `minimal.js` duplicates the search handler from `app.js:84-101`. Extract `search.js` + `base.css` shared by both pages (or one page with a `minimal` body class that hides the panes). Search behavior changes then happen once.
- [x] **[M]** Screenshots are 5.2 MB (`screenshot.png`) and 1.7 MB (`minimal.png`) in git. Re-export as WebP/optimized PNG at ~1600 px wide (about 300 KB each) so cloning stays quick.
- [x] **[L]** Link rows are built with `innerHTML` template strings (`app.js:17`) while everything else uses DOM APIs. Data is static so it is safe, but switch to `createElement` before links become user-editable (see edit feature) to avoid an XSS foothold.
- [x] **[L]** No `LICENSE`, `.gitignore`, or `<noscript>` message. Add a MIT license and a one-line noscript ("enable JavaScript").
- [x] **[L]** README: document the `minimal.html` + New Tab Override setup order, the `/` and `n` keys (plus new link keys), and that `app.js` must sit beside `index.html`.
