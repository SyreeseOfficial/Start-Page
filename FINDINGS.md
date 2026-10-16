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

---

## Round 2 (reviewed 2026-10-13, after the refactor into `app.js` / `search.js` / `theme.js` / `base.css`)

Still open from the first list: edit-links-in-page, HN pane, notes pane, world clocks, `!bang` passthrough. Items below are new.

### Bugs (verified in code)
- [ ] **[H]** `URL_RE` (`search.js:15`) treats any `word.tld` as a URL. Verified with node: `package.json`, `next.js`, `main.py`, `README.md`, `node.js` all return true and navigate to `https://package.json` instead of searching. For a dev start page this is the most common false positive. Fix: only auto-navigate when there is a scheme, a `www.` prefix, a path/port, `localhost`, an IP, or the TLD is in a short allowlist (`com org net io dev app ai co edu gov`).
- [ ] **[M]** Engine prefix is case-sensitive: `Y cats` or `GH ripgrep` falls through to Google (`search.js:30-31`). Mobile/tablet keyboards auto-capitalize the first letter, so prefixes never work there. Lowercase the prefix (`prefix.toLowerCase()`) and add `autocapitalize="off"` to both `<input>`s.
- [ ] **[M]** `auxclick` counts right-click as a visit (`app.js:52-57`). Chrome and recent Firefox fire `auxclick` for any non-primary button, so right-click > "copy link" inflates the use count and reorders links. Guard with `e.button === 1`.
- [ ] **[M]** Frecency reorders links on every load, which fights muscle memory (the key is fixed but the row position moves). Also `hits` is never pruned (keys for links removed from `CONFIG` stay forever) and there is no way to reset it. Options: keep static order and only show a subtle "most used" marker, or only re-sort once per day, plus a `reset order` action (`localStorage.removeItem('hits')`).
- [ ] **[M]** Weather icons are text glyphs (`☀ ☂ ❄ ⚡ ≋`) that JetBrains Mono does not contain, so each falls back to a different system font and some render as color emoji. Append `︎` (text variation selector) or set `font-variant-emoji: text` on `.wx` so they stay monochrome and match the theme colors.
- [ ] **[L]** Weather ignores `is_day`: it shows `☀ clear` at 2 am. Request `current=is_day` and swap to `☾` for codes 0-1 at night (the greeting already knows the time but uses the browser clock, not the location's).
- [ ] **[L]** Greeting says "Good morning" from 00:00 to 11:59 (`app.js:75`), so 2 am is "morning". Add a night bucket (22:00-04:59: "Still up" / "Good night").
- [ ] **[L]** WMO table maps code 1 ("mainly clear") to `partly cloudy` (`app.js:90-93`, the `[2, ...]` bucket) and lumps freezing drizzle/rain (56, 57, 66, 67) with plain rain. Split 0 / 1 / 2 / 3 so the text matches the sky.
- [ ] **[L]** With `geolocate: true`, cached weather isn't shown until the geolocation callback returns (up to 4 s), because `loadWeather` is only called from inside it (`app.js:151-157`). Render the cached payload first, then refine. Also store the last good coords so the next load skips the wait.
- [ ] **[L]** Stale weather is shown with no sign it is stale: if the fetch fails and a cache from yesterday exists, it renders as if current. Show `updated 3h ago` (or dim the pane) when `Date.now() - cached.t` is over the TTL.
- [ ] **[L]** The page never refreshes while it stays open. A pinned tab left overnight keeps yesterday's weather and quote, and `setInterval` is throttled in background tabs. Add a `visibilitychange` listener that calls `tick()` and `loadWeather()` (the 15 min cache already limits requests).

### Search box
- [ ] **[M]** A single character that matches a link key always jumps (`search.js:28`), so you can never search for `g`, `x`, `t`, `a` and so on. Either document it in the hint or require `Tab`/`Alt+Enter` for link jumps; at minimum show the target while typing (ghost text `g -> gmail`).
- [ ] **[M]** Default engine is hardcoded to Google (`search.js:33`). Add `CONFIG.defaultEngine` (DuckDuckGo, Brave, Kagi, SearXNG URL) and move `ENGINES` plus the default into one place the README points at.
- [ ] **[M]** The placeholder lists every engine and is truncated on narrow windows (the full text is only in `title`). Use a short placeholder (`search · type ? for help`) and show the engine list in a one-line hint under the box or in a `?` overlay.
- [ ] **[L]** Up/Down arrow recall of the last ~20 queries (stored in `localStorage`), like a shell. Fits the TUI theme and needs no network, unlike search suggestions.
- [ ] **[L]** `Ctrl+Enter` / `Shift+Enter` to open the result in a new tab (`window.open`), since `go()` always replaces the current page.
- [ ] **[L]** Extract the routing into a pure `route(value) -> url` function so it can be unit-tested with `node --test` (URL detection, prefixes, link keys). Search routing is the one part with real logic and no tests.

### UI / UX
- [ ] **[M]** Shortcuts are undiscoverable beyond the `[/]` and `[n]` hints: `Esc`, `1-4` themes, link keys needing an unfocused input. Add a `?` overlay (one small `<dialog>`) listing keys, and show the active theme name briefly after switching.
- [ ] **[M]** First visit ignores `prefers-color-scheme`. `theme.js` always defaults to Dracula; default to `light` when the OS asks for it, and apply `matchMedia` changes if no saved theme exists.
- [ ] **[L]** On wide screens the links pane stretches to fill the row height (`grid-template-rows: ... 1fr ...`) with large empty space below four short columns. Cap the width of the whole grid (`max-width: 1400px; margin: auto`) so it doesn't look sparse on ultrawide monitors.
- [ ] **[L]** Date line is only `Tuesday the 13th`; add month (and optionally ISO week number) so the pane works as a calendar glance. Cheap via `toLocaleDateString`.
- [ ] **[L]** The `wx` block is 8 rows of label/value divs; collapse hi/lo + wind + rain onto one dense line and give the freed space to a 12-hour sparkline (`hourly=temperature_2m`, a `▁▂▃▅▆` string, no library).
- [ ] **[L]** Quote pane: a long quote at ~900-1200 px wraps the author onto its own line and shifts the `[n] new` button. Let the quote truncate/wrap inside its own flex child (`min-width: 0; flex: 1`) so the button stays put.
- [ ] **[L]** Clicking the quote could copy it (`navigator.clipboard.writeText`) with a brief `copied` flash, and `p` could step back to the previous quote (keep the last 5 in memory).

### Accessibility
- [ ] **[M]** Link groups are bare `div`s. Use `<nav aria-label="links">` with an `<h2>` per group and `<ul>/<li>` rows (keep the `## ` look via the existing `::before`), so screen readers get headings and a list count.
- [ ] **[L]** Add `aria-keyshortcuts="g"` on each link anchor and `aria-label="Toggle 12 or 24 hour clock"` on `#clock`; right now the button's accessible name is the ticking time, which is re-announced as it changes.
- [ ] **[L]** Weather rows are label/value `div` pairs; a `<dl>` with `<dt>/<dd>` gives the same visual result with proper semantics for free.

### Privacy / hardening
- [ ] **[M]** Add a strict `<meta http-equiv="Content-Security-Policy">`: `default-src 'self'; connect-src https://api.open-meteo.com https://quotescdn.vercel.app; img-src 'self' data:; style-src 'self' 'unsafe-inline'`. The README promises "no tracking"; a CSP makes that enforced rather than promised, and it blocks anything injected via a future user-editable links feature.
- [ ] **[L]** Move `CONFIG` into `config.js` and ship `config.example.js` (gitignore the real one). Pulling updates then never conflicts with personal name/links/home coordinates, and the repo stops publishing a name and home location.

### Content / cleanup
- [ ] **[M]** Several quotes are misattributed or unsourced, which is awkward on a page that prints them in green under a name. Common offenders in `quotes.js`: "Simplicity is the ultimate sophistication" (da Vinci), "In the middle of difficulty lies opportunity" (Einstein), "Believe you can and you're halfway there" (T. Roosevelt), "Whether you think you can..." (Ford), "Be less curious about people..." (Curie). Re-attribute or drop them.
- [ ] **[L]** Drop filler entries (`Unknown`, `Every developer`) and near-duplicates (two "courage is not the absence of fear" quotes: Mandela and Twain; three "simplicity" quotes); 100 distinct quotes beats 100 with repeats. Mixing dev quotes and general inspiration is fine, but consider an optional `tags` field so one can pin the pool to `dev` only.
- [ ] **[L]** `index.html` and `minimal.html` each embed the same inline-SVG favicon and the cat `<pre>`. If a third page is ever added, move the cat to `base.css` as a `::before` or into `search.js`; until then leave it.
- [ ] **[L]** The font is the full variable woff2 (31 KB, weights 100-800 plus all glyphs). Subsetting to Latin + box-drawing with `pyftsubset` could halve it; only worth it if load time on a cold file:// open is measurable.
- [ ] **[L]** README says "Everything personal lives in the `CONFIG` block" but link-key conflicts aren't checked: two links with the same key silently overwrite each other in `linkKeys` (`app.js:47`). Warn in the console on duplicate keys, or on a key that collides with `n`, `/` or `1-4`.
