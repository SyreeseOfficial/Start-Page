# Start-Page — Findings

Rounds 1 and 2 (both 2026-10-23) added to the 2026-10-08 and 2026-10-13 lists; older open items are merged in below (effort shown as `?` where the old list gave none). Done items from earlier rounds are kept at the bottom. Items tagged "(open item)" in the text refer to an older entry that is also in this list. Reviewed against the repo at commit `e535e49`.

Effort: **XS** under 5 min · **S** about 15 min · **M** about an hour · **L** half a day · **?** not estimated. Sorted by value, then effort, then area.

**283 items.** 12 high, 209 medium, 62 low.

## Do these first

1. `localStorage` values are trusted without a shape check _[Bug, XS]_
2. Link key collisions are silent _[Bug, XS]_
3. `linkKeys` and `ENGINES` keys can overlap: `y`, `d`, `r` are both a link key and an engine prefix _[Bug, XS]_
4. One bad weather cache kills the whole page _[Bug, S]_
5. Ship a WebExtension so new tab needs no New Tab Override _[Feature, S]_
6. Link editor drawer that writes JSON _[Feature, S]_
7. Command mode in the search box _[Feature, S]_
8. Persist more settings in the UI (not just clock format): theme is saved, units and name are not _[Feature, S]_

## High value

1. [ ] **[XS]** _Bug_ — `localStorage` values are trusted without a shape check. `store.get('hits', {})` returns whatever JSON is stored; a string, array or `null` from another page on the same origin (`file://` pages share storage in some browsers) breaks `hits[href]`. Validate with `typeof === 'object' && !Array.isArray(...)` and fall back.
2. [ ] **[XS]** _Bug_ — Link key collisions are silent. Two links with the same key overwrite each other in `linkKeys` (`app.js` link loop), and a link key of `n` is shadowed by the quote handler; reserve `n`, `/`, `1-4` and warn in the console at load.
3. [ ] **[XS]** _Bug_ — `linkKeys` and `ENGINES` keys can overlap: `y`, `d`, `r` are both a link key and an engine prefix. `y` alone jumps to YouTube, `y cats` searches it; fine, but a link key `w` added later would silently beat `w cats`? (no, prefix wins only with a query). Add a startup check that logs overlapping keys so the behavior is intentional.
4. [ ] **[S]** _Bug_ — One bad weather cache kills the whole page. `loadWeather` renders the cached payload before fetching (`app.js` cached branch); if the stored shape lacks a field the render reads (`d.daily.precipitation_probability_max[0]` throws on a payload cached by an older version), the exception aborts the script, so the refetch never runs, the quote and key handlers below it never register, and the cache is never overwritten. Wrap the cached render in try/catch, drop the entry on failure, and store a `v: 1` schema version in the cache.
5. [ ] **[S]** _Feature_ — Ship a WebExtension so new tab needs no New Tab Override. A 10-line `manifest.json` with `chrome_url_overrides: { newtab: "index.html" }` makes `index.html` the real new tab in Firefox (temporary add-on, or signed unlisted), where `fetch` to Open-Meteo works, so the minimal page can become the full page.
6. [ ] **[S]** _Feature_ — Link editor drawer that writes JSON. Press `e`, edit a textarea of the `CONFIG.links` JSON, validate, save to `localStorage`, reload. Open item "edit links in-page" in the older list is the same thing; this adds JSON export/import so edits survive clearing site data.
7. [ ] **[S]** _Feature_ — Command mode in the search box. Prefix `:` runs local actions without a mouse: `:theme nord`, `:clock 12`, `:units imperial`, `:reset order`, `:export`. Replaces several keys and makes new settings discoverable.
8. [ ] **[S]** _Feature_ — Persist more settings in the UI (not just clock format): theme is saved, units and name are not. A `:` command or `s` panel that writes `localStorage` overrides on top of `CONFIG` means you never edit `app.js` for preference changes.
9. [ ] **[S]** _Feature_ — Calendar glance from an ICS URL: show the next 3 events from a Google Calendar private ICS feed (or any `.ics`) in the home pane. A start page is where you look at the day; this is the highest-value missing pane. Needs the extension context for CORS.
10. [ ] **[S]** _Privacy_ — Remove the unused `quotescdn.vercel.app` code path or move it behind a clear opt-in in the README with a warning. `useQuoteApi` is false by default, but the origin stays in any future CSP; ship the CSP and delete the dead branch if you never turn it on.
11. [ ] **[S]** _Testing_ — Add `node --test` for pure logic: `route()` (extract from `search.js` first), `ordinal`, `wmo`, `hm`, link-key collision check. The routing function has the only real branches in the app and zero tests.
12. [ ] **[?]** _Bugs_ — `URL_RE` (`search.js:15`) treats any `word.tld` as a URL. Verified with node: `package.json`, `next.js`, `main.py`, `README.md`, `node.js` all return true and navigate to `https://package.json` instead of searching. For a dev start page this is the most common false positive. Fix: only auto-navigate when there is a scheme, a `www.` prefix, a path/port, `localhost`, an IP, or the TLD is in a short allowlist (`com org net io dev app ai co edu gov`).

## Medium value

13. [ ] **[XS]** _Bug_ — Typing `/` inside the search box after Esc doesn't re-focus when a link is focused; the global handler returns when `e.target.tagName === 'INPUT'` but not for `TEXTAREA`/`contenteditable` (if the editor drawer lands). Check `isContentEditable` and `TEXTAREA` too.
14. [ ] **[XS]** _Bug_ — The 1-4 theme keys fire when focus is on the clock `<button>`; harmless, but pressing `1` while a screen reader is on a link changes the theme. Ignore when `e.target` is interactive other than body.
15. [ ] **[XS]** _Bug_ — `Escape` inside the search box blurs but does not clear; a second Esc could clear the text, like most search UIs.
16. [ ] **[XS]** _Bug_ — `autofocus` on the search input steals focus on every new tab; typing a link key right after opening a tab types into the box instead. Provide `CONFIG.autofocusSearch` and, when false, make `/` the only focus path.
17. [ ] **[XS]** _Bug_ — `URL_RE` accepts invalid IPs (`999.999.1.1` returns true, run today) and rejects `[::1]:3000`; use `new URL()` in a try/catch with a TLD allowlist instead of one regex.
18. [ ] **[XS]** _Bug_ — `URL_RE` rejects internationalized domains (`münchen.de` false, run today) and trailing-dot FQDNs (`example.com.`). Low frequency but a one-line `\p{L}` fix.
19. [ ] **[XS]** _Bug_ — `tick()` computes the greeting only when the minute changes, so the "Good evening" switch at 18:00:00 can lag up to 59 s after a laptop wake from sleep (first tick resets `lastMinute`, fine) but a throttled background tab misses minutes; re-run on `visibilitychange`.
20. [ ] **[XS]** _Bug_ — `greeting` buckets: 00:00-04:59 is "Good morning". Add a night greeting (open item) and make the boundaries configurable.
21. [ ] **[XS]** _Bug_ — `navigator.onLine` is unreliable (true behind a captive portal); the `offline` label can be wrong. Prefer the fetch error type plus an `online` event listener to retry.
22. [ ] **[XS]** _Bug_ — `WX_TTL` check uses the cache even if `cached.t` is in the future (clock changes); treat negative age as stale.
23. [ ] **[XS]** _Content_ — Quotes are skewed toward a few authors: Einstein has 6 of 97 entries and three entries are attributed to `Unknown`/`Every developer` (run today), which prints as a green byline under a name. Cap each author at 2, drop unattributed lines, and add a `source` field for the ones kept.
24. [ ] **[XS]** _Links_ — Validate link URLs at load: only `http:`, `https:` or `mailto:`; reject `javascript:` and `data:` so a corrupted/edited config can't run code on click.
25. [ ] **[XS]** _Search_ — Add `autocapitalize="off"` and `autocorrect="off"` to both inputs (open item mentions it for the prefix bug; explicit one-liner).
26. [ ] **[XS]** _Search_ — Trim trailing punctuation from pasted URLs (`example.com.` / `example.com,`).
27. [ ] **[S]** _A11y_ — `aria-live="polite"` on the weather summary and `role="status"` on cache-age text so changes are announced once, not on every tick.
28. [ ] **[S]** _A11y_ — Ensure the clock `<button>` has a stable accessible name (open item) and the time is `aria-hidden` or exposed via `<time datetime>`.
29. [ ] **[S]** _A11y_ — Add a "skip to search" link at the top and landmark roles (`main`, `nav`, `search`).
30. [ ] **[S]** _A11y_ — Check contrast for every theme programmatically (`node scripts/contrast.mjs`) and fail below 4.5:1 for text tokens; light theme `--border` vs `--bg` too.
31. [ ] **[S]** _A11y_ — Respect `prefers-reduced-motion` for the quote fade (the opacity swap) and the `scale` transform; the CSS covers transitions, verify `swapping` class timing isn't JS-driven.
32. [ ] **[S]** _A11y_ — Provide keyboard alternatives for hover-only effects (pane label color) and avoid information only in color (weather colors cyan/yellow).
33. [ ] **[S]** _A11y_ — Ensure the page works at 200% and 400% zoom without horizontal scroll (grid min widths); test at 320 px.
34. [ ] **[S]** _A11y_ — Language: `lang="en"` is set; set `dir` and honor `navigator.language` if the UI is ever translated.
35. [ ] **[S]** _A11y_ — Test the page with screen readers (NVDA/Orca) and keyboard-only: the clock `<button>` re-announces every second if its text node changes; use `aria-hidden` on seconds and a polite per-minute label.
36. [ ] **[S]** _A11y_ — Provide a labelled landmark for each pane (`<section aria-labelledby>`) and use `<h2>`s styled as pane labels so headings navigation works.
37. [ ] **[S]** _A11y_ — Check focus indication contrast against all four themes (the 2px accent outline on `--bg` should meet 3:1; the light theme's `--accent` #6f42c1 on #fbf8f1 does, nord's may not).
38. [ ] **[S]** _Bug_ — Search treats `-x-.com` as a URL (regex allows leading hyphen labels). Tighten label rules (no leading/trailing hyphen).
39. [ ] **[S]** _Bug_ — Date and greeting use the browser's timezone, weather uses the home location's. While travelling the greeting and sunset disagree. Use `d.utc_offset_seconds` from Open-Meteo for the weather block or document it.
40. [ ] **[S]** _Bug_ — `CONFIG.name` empty gives "Good morning, ." Build the greeting with a conditional comma.
41. [ ] **[S]** _Bug_ — `renderWeather` rebuilds the 3 forecast rows from scratch on every clock click; fine, but the day names use `new Date(d.daily.time[i] + 'T12:00')` in browser tz, so a user far from the home location can see the wrong weekday label. Parse as UTC and format with `timeZone: 'UTC'`.
42. [ ] **[S]** _Bug_ — `fetch` has no timeout; a hung connection leaves `...` forever and blocks nothing, but the cached values stay stale. Use `AbortSignal.timeout(8000)`.
43. [ ] **[S]** _Bug_ — No retry when the connection comes back: add `window.addEventListener('online', () => loadWeather(...))`.
44. [ ] **[S]** _Config_ — Move `CONFIG` into `config.js` with `config.example.js` (open item) and a `?config=` override.
45. [ ] **[S]** _Config_ — Profiles via URL: `index.html#work` loads a different link set; useful for a shared machine.
46. [ ] **[S]** _Config_ — Export/import settings as one JSON blob (`:export` prints, `:import` pastes), including `hits` and theme.
47. [ ] **[S]** _Config_ — Validate `CONFIG` at startup and show a visible error banner naming the bad key instead of a blank pane.
48. [ ] **[S]** _Config_ — Support units for time zone display (`CONFIG.timeZone`) for the clock so it matches the home location.
49. [ ] **[S]** _Config_ — Allow `links` to be loaded from `links.json` (fetch on `file://` is blocked; use the extension, or keep JS).
50. [ ] **[S]** _Config_ — Sync config across devices by encoding it in the URL hash (shareable setup link).
51. [ ] **[S]** _Config_ — `CONFIG.version` and a migration function for `localStorage` keys when formats change.
52. [ ] **[S]** _Config_ — `CONFIG` validation at startup: unknown keys, duplicate link keys, malformed URLs and non-string labels produce a visible banner (not just a console warning), since a typo in the array silently drops a group.
53. [ ] **[S]** _Config_ — Split the personal block into `config.js` loaded after defaults and shipped as `config.example.js` (older item); add `CONFIG.version` so `localStorage` caches (`wx`, `hits`) are invalidated on shape changes (this caused the stale-cache crash scenario).
54. [ ] **[S]** _Content_ — Add a per-quote `tags` field (dev, stoic, humor) and a `quoteTags` config so the home pane shows only the categories you like; with 97 quotes in one flat array, a mood filter is the cheapest personalization.
55. [ ] **[S]** _Content_ — Make quotes loadable from a plain text file (`quotes.txt`, one `quote | author` per line) merged with `quotes.js`, so adding a quote does not mean editing a JS array and escaping apostrophes.
56. [ ] **[S]** _Content_ — Show a "word of the day" or "this day in history" line from an offline JSON bundled with the page (365 short entries), as an optional replacement for the quote pane; no network, no tracking.
57. [ ] **[S]** _Docs_ — README: add a "How it works" section listing each file's job, load order and the global `linkKeys` handshake.
58. [ ] **[S]** _Docs_ — README: document `localStorage` keys (`hits`, `wx`, `hour12`, `theme`) and how to reset them.
59. [ ] **[S]** _Docs_ — README: add a table of every key and what it does, generated from one source so it can't drift from `app.js`.
60. [ ] **[S]** _Docs_ — README: browser support (Firefox, Chromium) and the `color-mix()` / `100dvh` requirements (Firefox 113+, Chromium 111+).
61. [ ] **[S]** _Docs_ — Add `CONTRIBUTING.md`/design notes: "no build step, no dependencies, no third-party requests by default" as the rules new features must keep.
62. [ ] **[S]** _Docs_ — Add a CHANGELOG with the feature rounds so users know what changed when pulling.
63. [ ] **[S]** _Docs_ — Screenshots for each theme in the README (generated with Playwright) plus a short GIF of the keyboard flow.
64. [ ] **[S]** _Docs_ — FAQ: why Firefox's new tab can't load a local file and what New Tab Override does (move from the README body).
65. [ ] **[S]** _Link_ — Tooltip each link with its URL and its key; add `rel="noopener noreferrer"` to links that open in new tabs via modifier keys.
66. [ ] **[S]** _Link_ — Support Ctrl/Cmd+click and middle-click opening in background tabs for link keys (`Ctrl+g` style) without breaking frecency counting.
67. [ ] **[S]** _Link_ — Fuzzy launcher: typing `gmail` without a prefix matches link labels by prefix and jumps with Enter; the single-letter key rule makes labels reachable only by key today.
68. [ ] **[S]** _Link_ — Add link groups collapse/expand with persistence, and a "pin" star that survives frecency re-sorting (older list has pinning).
69. [ ] **[S]** _Link_ — Link icons: optional emoji per link (`['g','gmail','url','📧']`), rendered before the label, fully offline.
70. [ ] **[S]** _Links_ — Open all links in a group with `Shift+<group key>` (e.g. all "dev" tools). Add group keys.
71. [ ] **[S]** _Links_ — Favicons next to labels via `https://icons.duckduckgo.com/ip3/<host>.ico` (third party) or by caching them at build time into `icons/`. Opt-in.
72. [ ] **[S]** _Links_ — Per-link `title`/tooltip showing the full URL on hover.
73. [ ] **[S]** _Links_ — `target`/modifier support: Ctrl/Meta+click or `Shift+key` opens in a background tab (`window.open` with `noopener`).
74. [ ] **[S]** _Links_ — Link badges: a small dot on links used in the last hour, or a dim style for links never used in 90 days.
75. [ ] **[S]** _Links_ — Prune `hits` entries for URLs no longer in `CONFIG` (open frecency item mentions it); add decay so old counts fade (halve counts weekly).
76. [ ] **[S]** _Links_ — Make frecency optional (`sortByUse: false`) because reordering fights muscle memory (older note); store the first-seen order and only re-sort on demand with `:sort`.
77. [ ] **[S]** _Links_ — Collapsible groups with state saved, for people with long link lists.
78. [ ] **[S]** _Links_ — Drag-and-drop reorder within and between groups once editing exists, saving to `localStorage`.
79. [ ] **[S]** _Links_ — Link validation script: `node scripts/check-links.mjs` pings each configured URL and reports redirects/404s. Run in CI weekly.
80. [ ] **[S]** _Links_ — Quick-add from the page: `:add name url key` appends a link to the first group (feeds the editor).
81. [ ] **[S]** _Links_ — Import links from a Firefox bookmarks HTML/JSON export (`:import bookmarks.html`) so the toolbar folder becomes a group.
82. [ ] **[S]** _Links_ — Support an `alias` list per link (`gh`, `git`) matched in the search box in addition to the single key.
83. [ ] **[S]** _Links_ — Group keys with number prefixes (`1g` = first group first link) to scale beyond 26 letters.
84. [ ] **[S]** _Links_ — Show a "recent" row of the last 5 visited links independent of group.
85. [ ] **[S]** _Packaging_ — Ship the WebExtension form (`manifest.json` with `chrome_url_overrides`) as a second install path, with `browser_specific_settings.gecko.id` so Firefox keeps `localStorage` stable across restarts; temporary add-ons lose state on some setups.
86. [ ] **[S]** _Packaging_ — Provide a `deploy` option for GitHub Pages/Netlify (static) so the same page works as a start page on every device via a bookmark; document that `file://` and `https://` differ for geolocation permission persistence.
87. [ ] **[S]** _Packaging_ — Add a `package.json` with only dev tooling (`node --test`, `eslint`, `prettier`) and a `scripts` block; the repo has `node_modules/` in `.gitignore` but no package file, so contributors can't discover the commands.
88. [ ] **[S]** _Perf_ — Preload the font: `<link rel="preload" as="font" type="font/woff2" crossorigin href="fonts/JetBrainsMono.woff2">` removes the `font-display: swap` flash on first paint.
89. [ ] **[S]** _Perf_ — Measure the cost of the `feTurbulence` noise overlay: an SVG filter background over a full-viewport pseudo-element repaints on resize and can raise GPU use on large monitors; pre-render it as a small PNG/WebP tile instead.
90. [ ] **[S]** _Perf_ — Inline critical CSS from `base.css` into `index.html` to avoid the render-blocking request on `file://`; negligible locally, measurable from a network drive.
91. [ ] **[S]** _Perf_ — Defer `quotes.js` parsing (8 KB) until the first `n` press by loading it with a dynamic `import()` after first paint.
92. [ ] **[S]** _Perf_ — Throttle `tick` to `requestAnimationFrame`-free `setTimeout` aligned to the next second boundary (avoid drift: `setInterval(1000)` drifts and can skip a second display).
93. [ ] **[S]** _Perf_ — Stop the interval when the tab is hidden (`document.hidden`) and resume with an immediate tick.
94. [ ] **[S]** _Perf_ — Lighthouse run (performance, accessibility, best practices) recorded in the README with scores.
95. [ ] **[S]** _Perf_ — Use `content-visibility: auto` on the forecast block if panes grow.
96. [ ] **[S]** _Perf_ — Subset the font (open item) and add `unicode-range` so box-drawing/arrow glyphs load separately.
97. [ ] **[S]** _Perf_ — Measure first paint with `performance.mark` and show it in the `?` overlay in dev; target under 100 ms on `file://`, so regressions from new panes are visible.
98. [ ] **[S]** _Perf_ — Replace the full-page `#screen::before` SVG noise (turbulence filter) with a pre-rendered 64x64 PNG data URI; filter-based backgrounds repaint on resize and cost GPU time on large monitors.
99. [ ] **[S]** _Perf_ — Avoid re-creating the forecast DOM on every clock click or toggle (`renderWeather` clears and rebuilds `#wx-days`); update text nodes in place.
100. [ ] **[S]** _Perf_ — Use `requestIdleCallback` for non-critical init (quote pick, link frecency sort, weather fetch) so the first frame shows the clock and search immediately.
101. [ ] **[S]** _Perf_ — Inline `theme.js` in `<head>` (it is a separate request blocking first paint on slow disks/network drives) to avoid the theme flash entirely.
102. [ ] **[S]** _Privacy_ — Clear-data command (`:clear`) that removes `hits`, `wx`, `hour12`, `theme` keys in one go.
103. [ ] **[S]** _Privacy_ — Document exactly what is sent to Open-Meteo (rounded lat/lon, IP visible to them) and round coordinates to 2 decimals (already `toFixed(2)` in the cache key but the request uses the full value). Round the request too.
104. [ ] **[S]** _Privacy_ — Do not send geolocated precise coordinates; round to 1 decimal (~11 km) for the weather request.
105. [ ] **[S]** _Privacy_ — Check how `localStorage` behaves under `file://` in Firefox: with `privacy.file_unique_origin` each file can get its own storage, so a theme chosen on `index.html` may not apply to `minimal.html`, and moving the folder resets `hits`, `theme` and `hour12`. If confirmed, document it and offer export/import of settings (or serve over `http://localhost`).
106. [ ] **[S]** _Privacy_ — Open-Meteo sees your IP and (with `geolocate`) precise coordinates; add a `privacy.roundCoords` setting (default 1 decimal) and a README table of every network request the page can make and when (weather only, today).
107. [ ] **[S]** _Quality_ — Add ESLint (`eslint:recommended`, browser env) and Prettier configs; run via `npx` only (no `package.json` needed).
108. [ ] **[S]** _Quality_ — Add `// @ts-check` + JSDoc types to `app.js`/`search.js` and run `tsc --noEmit --allowJs` once; catches the `linkKeys` TDZ-style ordering issues.
109. [ ] **[S]** _Quality_ — Playwright smoke test: load `index.html`, assert the clock text matches `\d\d:\d\d:\d\d`, press `1-4`, type `y cats` and assert the navigation URL.
110. [ ] **[S]** _Quality_ — HTML validation (`vnu.jar` or `html-validate`) in CI; the cat `<pre>` entity usage and `autofocus` combos are the likely warnings.
111. [ ] **[S]** _Quality_ — GitHub Actions workflow running lint, node tests and the link checker on push.
112. [ ] **[S]** _Quality_ — Pre-commit hook that rejects `console.log` and trailing whitespace.
113. [ ] **[S]** _Quality_ — Add `.editorconfig` (2 spaces, LF, final newline) so editors agree with the file style.
114. [ ] **[S]** _Quality_ — Dedupe `store` helper usage: `theme.js` uses raw `localStorage` try/catch while `app.js` uses `store`; load a tiny shared `store.js` in head.
115. [ ] **[S]** _Quality_ — `linkKeys` is a global `const` declared in `search.js` and filled by `app.js` (implicit load-order dependency); move to a `window.StartPage` namespace or ES modules with `type="module"`.
116. [ ] **[S]** _Quality_ — Convert scripts to ES modules (`type="module"`) so imports document dependencies; works on `file://` in Firefox only with `security.fileuri.strict_origin_policy` quirks, so verify first.
117. [ ] **[S]** _Quality_ — Replace the repeated `$('wx-...')` lookups with one object of cached elements built at load.
118. [ ] **[S]** _Quality_ — Extract weather code into `weather.js` and links into `links.js` so `app.js` is just wiring (currently 190 lines mixing five concerns).
119. [ ] **[S]** _Quality_ — Name the magic numbers (`150` ms swap delay, `4000` geolocation timeout, `WX_TTL`) in `CONFIG` or a constants block.
120. [ ] **[S]** _Quality_ — Unit-test `ordinal`, `fmtH`, `hm`, `wmo` and `route` in `node --test` by extracting them to `lib.js`; `ordinal(11..13)` and 12-hour edge cases (00:00, 12:00) are the classic bugs.
121. [ ] **[S]** _Quality_ — Visual regression screenshots per theme at 1440x900 and 390x844 with Playwright `toHaveScreenshot()`; the CSS-variable themes (dracula, nord, gruvbox, light) are only verified by eye.
122. [ ] **[S]** _Quality_ — Lint CSS (`stylelint`) for unused custom properties: `--noise` and `--strong` are used, but a theme missing a variable falls back silently; add a test that every theme defines every token.
123. [ ] **[S]** _Quality_ — Stub `fetch` and `navigator.geolocation` in a tiny jsdom test to cover the weather fallback paths (HTTP error, offline, cached-then-stale) that currently have no tests and caused the cache-shape bug.
124. [ ] **[S]** _Search_ — Ghost-text hint for link jumps: when the input equals a link key, show `-> gmail` at the right edge before Enter so single-letter jumps aren't a surprise (existing open item notes the surprise; this is the fix).
125. [ ] **[S]** _Search_ — Support `!bang`-style passthrough to DuckDuckGo for unknown prefixes (open item) plus a `bang` toggle.
126. [ ] **[S]** _Search_ — Custom search engines in `CONFIG.engines` (merge into `ENGINES`) so engine changes don't mean editing `search.js`.
127. [ ] **[S]** _Search_ — Calculator in the box: `= 12*7`, show the result inline and copy on Enter (use a safe parser, not `eval`).
128. [ ] **[S]** _Search_ — Unit conversions inline: `5 km in mi`, `72 f in c`.
129. [ ] **[S]** _Search_ — Timer commands: `timer 10m tea` with a browser notification at the end and the remaining time in the title.
130. [ ] **[S]** _Search_ — `wiki` style direct answers using the DuckDuckGo instant answer API (opt-in, adds a third-party call).
131. [ ] **[S]** _Search_ — Search suggestions dropdown from DuckDuckGo's autocomplete (opt-in; sends keystrokes to a third party, so off by default).
132. [ ] **[S]** _Search_ — Local suggestions from your own links: typing `gi` lists `github`, `gifs`; Tab accepts. Fuzzy-match link labels so every link is reachable by name, not just key.
133. [ ] **[S]** _Search_ — Show the target engine in the placeholder as you type a prefix (`y cats` -> "youtube: cats").
134. [ ] **[S]** _Search_ — Persist the last 20 queries (open item) and add `Ctrl+R` reverse search like a shell.
135. [ ] **[S]** _Search_ — `Shift+Enter` to search with the default engine even when the text matches a link key or URL.
136. [ ] **[S]** _Search_ — `Ctrl+Enter` opens in a new tab (open item); also middle-click on an engine hint.
137. [ ] **[S]** _Search_ — Open `about:` and `chrome://` style internal URLs: `about:preferences` currently goes to Google. Allow a small allowlist of internal schemes.
138. [ ] **[S]** _Search_ — Handle email addresses (`a@b.com`) as `mailto:` or search? Today `a@b.com` is not matched by `URL_RE` and goes to Google; decide.
139. [ ] **[S]** _Search_ — Paste of multi-line text should search only the first line or show a confirmation; `input` strips newlines silently.
140. [ ] **[S]** _Search_ — Prevent accidental search leaks: warn (flash border) when the input looks like a password or token (long hex/base64 with no spaces) before sending it to Google.
141. [ ] **[S]** _Security_ — Add a strict CSP `<meta>` (open item) including `connect-src` for Open-Meteo only, `base-uri 'none'`, `form-action 'none'`, `frame-ancestors` can't be set via meta; note the extension context needs `content_security_policy` in the manifest.
142. [ ] **[S]** _Security_ — Subresource-free by design: add a test that fails if any HTML references an `http(s)` asset (`link`, `script`, `img`).
143. [ ] **[S]** _Security_ — Sanitize `CONFIG.name` with `textContent` (already used) and never `innerHTML`; add a lint rule (`no-unsanitized`) so future edits don't regress.
144. [ ] **[S]** _Security_ — Strip query strings and fragments from `hits` keys so tracking params in a link don't create separate counts; also avoid storing full URLs with tokens (use link ids).
145. [ ] **[S]** _Security_ — Put a `rel="noopener noreferrer"` on any future `target="_blank"` link; document the rule.
146. [ ] **[S]** _Security_ — If an editor or import is added, cap sizes (config JSON <100 KB) and validate with a tiny schema before writing to `localStorage`.
147. [ ] **[S]** _UI_ — Settings/help overlay on `?` (open item) showing keys, engines, version and the config path.
148. [ ] **[S]** _UI_ — Add a `zen` toggle (`z`) that hides every pane except the clock and search; remember it.
149. [ ] **[S]** _UI_ — Day-progress and year-progress bars (`day ▓▓▓░░ 48% · year 80%`) in the home pane.
150. [ ] **[S]** _UI_ — ISO week number and day-of-year next to the date.
151. [ ] **[S]** _UI_ — Countdown to a configured date (`CONFIG.countdowns: [['trip', '2027-03-01']]`) in the date block.
152. [ ] **[S]** _UI_ — World clocks for 2-3 time zones with `Intl.DateTimeFormat({ timeZone })` (open item).
153. [ ] **[S]** _UI_ — Pomodoro timer that shows the remaining time in `document.title` so it is visible in the tab strip.
154. [ ] **[S]** _UI_ — Scratch notes pane saved in `localStorage` (open item) with Markdown-ish checklist and `t` to focus.
155. [ ] **[S]** _UI_ — Habit/streak tracker: three checkboxes for today that reset daily.
156. [ ] **[S]** _UI_ — Hacker News top stories pane (open item) behind `CONFIG.panes.hn` with 30-minute cache.
157. [ ] **[S]** _UI_ — RSS/Atom reader for 2-3 feeds via a CORS-friendly JSON converter or the extension context.
158. [ ] **[S]** _UI_ — GitHub pane: open PRs/review requests via the public API with a fine-grained token stored locally.
159. [ ] **[S]** _UI_ — Random "link of the day" from a read-later list stored locally.
160. [ ] **[S]** _UI_ — Cat animation: blink every few seconds (`o.o` -> `-.-`) using a text swap; stop under reduced motion.
161. [ ] **[S]** _UI_ — Cat reacts to weather (`T.T` when raining, `^.^` clear) and time (`-.-` after midnight).
162. [ ] **[S]** _UI_ — Easter egg: Konami code toggles a rainbow theme; harmless, removable.
163. [ ] **[S]** _UI_ — Font size and density settings (`:size 14`) for different monitors, saved locally.
164. [ ] **[S]** _UI_ — Custom background: solid color or local image path in `CONFIG`, with an overlay to keep text contrast.
165. [ ] **[S]** _UI_ — Per-theme noise intensity is already a variable; expose `:grain 0` to turn off, and respect `prefers-reduced-transparency`.
166. [ ] **[S]** _UI_ — Auto theme by time: light during the day, dark after sunset (use the fetched sunrise/sunset) when `theme: 'auto'`.
167. [ ] **[S]** _UI_ — Respect `prefers-contrast: more` with a high-contrast theme (white/black, no dim border).
168. [ ] **[S]** _UI_ — Theme picker UI (list with swatches) for discoverability; `1-4` are undocumented in the page itself.
169. [ ] **[S]** _UI_ — More built-in themes: Solarized, Catppuccin, Tokyo Night, Rosé Pine, Monokai, plus `:theme custom` reading CSS variables from config.
170. [ ] **[S]** _UI_ — Show theme name briefly (toast) after switching with 1-4.
171. [ ] **[S]** _UI_ — Keyboard focus ring for `#search` pane (focus-within border is the only cue); add outline for the input at high zoom.
172. [ ] **[S]** _UI_ — Clock: optional seconds-less mode and blinking colon, plus a leading-zero toggle.
173. [ ] **[S]** _UI_ — Date line: add month and year option (`Friday, Oct 23`), locale-aware via `Intl`.
174. [ ] **[S]** _UI_ — Quote pane: copy-on-click and `p` for previous (open item), plus a "favorite" `f` that saves to `localStorage` and a `:quotes saved` view.
175. [ ] **[S]** _UI_ — Quotes: allow user quotes in `localStorage` merged with `QUOTES`.
176. [ ] **[S]** _UI_ — Quote of the day mode: deterministic by date so it doesn't change on every new tab (`CONFIG.quoteMode: 'daily' | 'random'`).
177. [ ] **[S]** _UI_ — Quote tags (dev, stoic, humor) and a filter command.
178. [ ] **[S]** _UI_ — Footer line with version, last weather update and the keyboard hint, replacing the scattered `[/]` and `[n]` hints.
179. [ ] **[S]** _UX_ — Remember the last used engine prefix for the session and offer `Shift+Enter` to search with it again, for repeated searches on the same site.
180. [ ] **[S]** _UX_ — Add keyboard focus order labels (`aria-keyshortcuts`) and a visible "press ?" hint in a corner, so new users find the overlay.
181. [ ] **[S]** _UX_ — Support multi-profile link sets by URL fragment (`index.html#work`) with different groups/themes, for one page serving work and home.
182. [ ] **[S]** _UX_ — Greeting variants: random from a list per time bucket, or show day-specific lines (Monday/Friday) from config; the single "Good morning" line is static.
183. [ ] **[S]** _UX_ — Show sunrise/sunset as relative times ("sunset in 2h 14m") toggled by clicking the row, since the clock is already on screen.
184. [ ] **[S]** _UX_ — Add a tiny scratchpad (`localStorage`) shown below the quote that persists across tabs; pair with `t` to focus. (older list has a notes pane)
185. [ ] **[S]** _UX_ — Replace the cat ASCII with an animated sprite (blink/ears) that reacts to focus on the search box (eyes follow typing) using CSS only.
186. [ ] **[S]** _Weather_ — Add `is_day` to the request and show a moon glyph at night (open item) and use it for the favicon/title.
187. [ ] **[S]** _Weather_ — Air quality line (US AQI / PM2.5) from `air-quality-api.open-meteo.com` with a color per band.
188. [ ] **[S]** _Weather_ — UV index max in the daily request, shown as `uv 6 (high)`; useful for the sunscreen decision, cheap to add.
189. [ ] **[S]** _Weather_ — "Rain starts in 12 min" nowcast using `minutely_15=precipitation` for the next hour; show only when rain is imminent.
190. [ ] **[S]** _Weather_ — Wind direction arrow and gusts (`wind_direction_10m`, `wind_gusts_10m`).
191. [ ] **[S]** _Weather_ — Humidity, pressure and dew point on one dense row (`relative_humidity_2m`, `surface_pressure`).
192. [ ] **[S]** _Weather_ — Weather alerts for the US from api.weather.gov (`/alerts/active?point=lat,lon`); show a red line when any alert is active.
193. [ ] **[S]** _Weather_ — Moon phase computed locally (no API) with a glyph and illumination %.
194. [ ] **[S]** _Weather_ — Day length and a sunrise-to-sunset progress bar in text (`▓▓▓▓░░░░ 62%`).
195. [ ] **[S]** _Weather_ — Hourly sparkline for the next 12 hours (open item) using block glyphs; share the request.
196. [ ] **[S]** _Weather_ — Look up the home location by name via Open-Meteo's geocoding API (`CONFIG.home.query = 'Brooklyn'`), cache lat/lon, so no one hand-types coordinates.
197. [ ] **[S]** _Weather_ — Reverse-geocode the geolocated position so `place` shows the city instead of the literal `local` (e.g. BigDataCloud client-side reverse geocode, opt-in).
198. [ ] **[S]** _Weather_ — Remember the last geolocation (open item says skip the 4 s wait); store `{lat, lon, t}` and refresh in the background.
199. [ ] **[S]** _Weather_ — Show `updated 14m ago` and dim when stale (open item); add a refresh key `w`.
200. [ ] **[S]** _Weather_ — Auto-refresh on `visibilitychange` and every 15 min while visible (open item).
201. [ ] **[S]** _Weather_ — Precipitation amount (`precipitation_sum`) next to the probability in the forecast rows.
202. [ ] **[S]** _Weather_ — Feels-like explanation: show wind chill vs heat index label when feels-like differs by 3+ degrees.
203. [ ] **[S]** _Weather_ — Switch units automatically by locale when the user hasn't set `units` (`navigator.language` en-US -> imperial).
204. [ ] **[S]** _Weather_ — Use `Intl.DisplayNames`/locale for weekday names instead of hardcoded `en-US`.
205. [ ] **[S]** _Weather_ — Fallback provider (met.no, wttr.in JSON) when Open-Meteo is down; keep the same render shape.
206. [ ] **[S]** _Weather_ — Weather icons as small inline SVG or consistent text glyphs with the variation selector (open item); test in Firefox/Linux fonts.
207. [ ] **[?]** _Accessibility_ — Link groups are bare `div`s. Use `<nav aria-label="links">` with an `<h2>` per group and `<ul>/<li>` rows (keep the `## ` look via the existing `::before`), so screen readers get headings and a list count.
208. [ ] **[?]** _Bugs_ — Engine prefix is case-sensitive: `Y cats` or `GH ripgrep` falls through to Google (`search.js:30-31`). Mobile/tablet keyboards auto-capitalize the first letter, so prefixes never work there. Lowercase the prefix (`prefix.toLowerCase()`) and add `autocapitalize="off"` to both `<input>`s.
209. [ ] **[?]** _Bugs_ — `auxclick` counts right-click as a visit (`app.js:52-57`). Chrome and recent Firefox fire `auxclick` for any non-primary button, so right-click > "copy link" inflates the use count and reorders links. Guard with `e.button === 1`.
210. [ ] **[?]** _Bugs_ — Frecency reorders links on every load, which fights muscle memory (the key is fixed but the row position moves). Also `hits` is never pruned (keys for links removed from `CONFIG` stay forever) and there is no way to reset it. Options: keep static order and only show a subtle "most used" marker, or only re-sort once per day, plus a `reset order` action (`localStorage.removeItem('hits')`).
211. [ ] **[?]** _Bugs_ — Weather icons are text glyphs (`☀ ☂ ❄ ⚡ ≋`) that JetBrains Mono does not contain, so each falls back to a different system font and some render as color emoji. Append `︎` (text variation selector) or set `font-variant-emoji: text` on `.wx` so they stay monochrome and match the theme colors.
212. [ ] **[?]** _Content / cleanup_ — Several quotes are misattributed or unsourced, which is awkward on a page that prints them in green under a name. Common offenders in `quotes.js`: "Simplicity is the ultimate sophistication" (da Vinci), "In the middle of difficulty lies opportunity" (Einstein), "Believe you can and you're halfway there" (T. Roosevelt), "Whether you think you can..." (Ford), "Be less curious about people..." (Curie). Re-attribute or drop them.
213. [ ] **[?]** _Privacy / hardening_ — Add a strict `<meta http-equiv="Content-Security-Policy">`: `default-src 'self'; connect-src https://api.open-meteo.com https://quotescdn.vercel.app; img-src 'self' data:; style-src 'self' 'unsafe-inline'`. The README promises "no tracking"; a CSP makes that enforced rather than promised, and it blocks anything injected via a future user-editable links feature.
214. [ ] **[?]** _Search box_ — A single character that matches a link key always jumps (`search.js:28`), so you can never search for `g`, `x`, `t`, `a` and so on. Either document it in the hint or require `Tab`/`Alt+Enter` for link jumps; at minimum show the target while typing (ghost text `g -> gmail`).
215. [ ] **[?]** _Search box_ — Default engine is hardcoded to Google (`search.js:33`). Add `CONFIG.defaultEngine` (DuckDuckGo, Brave, Kagi, SearXNG URL) and move `ENGINES` plus the default into one place the README points at.
216. [ ] **[?]** _Search box_ — The placeholder lists every engine and is truncated on narrow windows (the full text is only in `title`). Use a short placeholder (`search · type ? for help`) and show the engine list in a one-line hint under the box or in a `?` overlay.
217. [ ] **[?]** _Skip_ — Edit links in-page: press `e` to open a small editor, store `LINK_GROUPS` in `localStorage`, with a default fallback. Stops you from editing source for every new bookmark.
218. [ ] **[?]** _Skip_ — Hacker News top 5 pane (`hacker-news.firebaseio.com`, CORS-enabled) or an RSS-to-JSON feed; click-through, refreshed every 30 min and cached.
219. [ ] **[?]** _Skip_ — Persistent scratch todo/notes pane in `localStorage` (3-5 items, `t` to add, click to tick). Natural fit for a terminal-style start page.
220. [ ] **[?]** _UI / UX_ — Shortcuts are undiscoverable beyond the `[/]` and `[n]` hints: `Esc`, `1-4` themes, link keys needing an unfocused input. Add a `?` overlay (one small `<dialog>`) listing keys, and show the active theme name briefly after switching.
221. [ ] **[?]** _UI / UX_ — First visit ignores `prefers-color-scheme`. `theme.js` always defaults to Dracula; default to `light` when the OS asks for it, and apply `matchMedia` changes if no saved theme exists.

## Low value / nice to have

222. [ ] **[XS]** _Cleanup_ — `index.html` inline `<style>` is ~90 lines specific to the full page; move to `index.css` so `index.html` is markup only and caches separately.
223. [ ] **[XS]** _Cleanup_ — Both pages repeat the favicon data URI and `theme-color` meta; generate from one snippet or add a real `favicon.svg` file.
224. [ ] **[XS]** _Cleanup_ — `minimal.html` lacks the `?` hint and the theme keys explanation; add a dim one-line hint under the search box.
225. [ ] **[XS]** _Cleanup_ — `.gitignore` has `node_modules/` and `*.log` but the repo has no package.json; add `.vscode/` and `.idea/`.
226. [ ] **[XS]** _Cleanup_ — Remove the `screenshot.webp` regeneration step from memory: add `scripts/screenshot.mjs` so README images update with one command.
227. [ ] **[XS]** _Cleanup_ — `quotes.js` has 97 entries; add a duplicate/attribution check script (open item notes misattributions) that flags exact-text duplicates.
228. [ ] **[XS]** _Cleanup_ — Sort `quotes.js` entries by author for easier review and add a comment per misattributed quote with the source.
229. [ ] **[XS]** _Cleanup_ — License header: `LICENSE` is MIT; add SPDX comments to JS files if you share it.
230. [ ] **[XS]** _Cleanup_ — Rename `minimal.webp`/`screenshot.webp` to `docs/` and reference from README to keep the root to runtime files.
231. [ ] **[XS]** _Cleanup_ — `fonts/OFL.txt` plus `LICENSE`: add a `NOTICE` line in README for font attribution next to the license section.
232. [ ] **[XS]** _Cleanup_ — Add `.editorconfig`/Prettier config; HTML/CSS/JS in this repo use 2-space indentation consistently, and a config keeps it that way.
233. [ ] **[S]** _Feature_ — Sunrise/sunset notifications or tab-title changes (`☾ 17:42`) as the sun goes down.
234. [ ] **[S]** _Feature_ — Daily "first open" tasks: show yesterday's unfinished notes on the first open each day.
235. [ ] **[S]** _Feature_ — Currency/crypto ticker pane from a public no-key API; adds a third-party call, so opt-in.
236. [ ] **[S]** _Feature_ — Package as a Firefox sidebar page or a Chrome side panel using the same `index.html`.
237. [ ] **[S]** _Feature_ — Mobile layout test and a PWA manifest so it can be the phone home page (`display: standalone`, icons).
238. [ ] **[S]** _Feature_ — Service worker that caches the app shell and last API responses for true offline use (needs https or localhost; file:// can't register one).
239. [ ] **[S]** _Feature_ — Optional `localhost` server script (`python -m http.server`) documented for people who want a service worker and `fetch` to local JSON.
240. [ ] **[S]** _Feature_ — "Focus mode" (`f` key): hide everything except the search box and clock, remembered per session, for a minimal new tab on demand without a second HTML file.
241. [ ] **[S]** _Feature_ — "Recent searches" chips below the search box (last 5), clickable, cleared with `Esc` twice; offline history in `localStorage`.
242. [ ] **[S]** _Feature_ — RSS reader pane for 3 feeds via the extension context (no CORS), with unread counts and "mark all read".
243. [ ] **[S]** _UI_ — Add a subtle blinking caret in the empty search box placeholder state to match the TUI look (CSS only, off under reduced motion).
244. [ ] **[S]** _UI_ — Box-drawing borders (`┌─┐`) via pseudo-elements instead of CSS borders for a more authentic terminal look; keep as a theme variant.
245. [ ] **[S]** _UI_ — Add a status bar line at the bottom (`vim`-style) showing mode, last key pressed, and theme.
246. [ ] **[S]** _UI_ — Typing animation for the greeting on first paint, once per day, skippable.
247. [ ] **[S]** _UI_ — Show a random tip each load (`tip: press ? for keys`).
248. [ ] **[S]** _UI_ — "Last visited" tooltips on links using timestamps in `hits` (change the value to `{n, last}`).
249. [ ] **[S]** _UI_ — Pin favorites with a star so they stay on top regardless of frecency.
250. [ ] **[S]** _UI_ — Add a minimal-mode query param (`index.html?min`) so one file can serve both pages and the duplicate HTML can go.
251. [ ] **[S]** _UI_ — Responsive: make link columns `repeat(auto-fit, minmax(160px, 1fr))` instead of two fixed columns so 5+ groups fit on wide screens.
252. [ ] **[S]** _UI_ — Print stylesheet that hides decoration and prints the links list (some people print a cheat sheet).
253. [ ] **[S]** _UI_ — Add a high-DPI cat variant (SVG) as a theme option.
254. [ ] **[M]** _Feature_ — A tiny settings page (`settings.html`) generating the `CONFIG` JSON with a live preview and a download button.
255. [ ] **[M]** _Feature_ — Plugin hook: `window.StartPage.panes.push({ title, render })` so extra panes are separate files, not edits to `app.js`.
256. [ ] **[M]** _Feature_ — Bookmarks pane reading Firefox bookmarks via the extension's `browser.bookmarks` API (extension-only), replacing hand-copied links.
257. [ ] **[M]** _Feature_ — Tab/session list pane via `browser.sessions` (extension-only): recently closed tabs.
258. [ ] **[M]** _Feature_ — Top sites pane via `browser.topSites` (extension-only) as a frecency source for the links.
259. [ ] **[M]** _Feature_ — Vim-style navigation: `j/k` moves a cursor through links, `Enter` opens, `gg`/`G` jump.
260. [ ] **[L]** _Feature_ — Rewrite as a small Web Component set (`<sp-clock>`, `<sp-weather>`) once panes exceed five, to isolate state and styles.
261. [ ] **[?]** _Accessibility_ — Add `aria-keyshortcuts="g"` on each link anchor and `aria-label="Toggle 12 or 24 hour clock"` on `#clock`; right now the button's accessible name is the ticking time, which is re-announced as it changes.
262. [ ] **[?]** _Accessibility_ — Weather rows are label/value `div` pairs; a `<dl>` with `<dt>/<dd>` gives the same visual result with proper semantics for free.
263. [ ] **[?]** _Bugs_ — Weather ignores `is_day`: it shows `☀ clear` at 2 am. Request `current=is_day` and swap to `☾` for codes 0-1 at night (the greeting already knows the time but uses the browser clock, not the location's).
264. [ ] **[?]** _Bugs_ — Greeting says "Good morning" from 00:00 to 11:59 (`app.js:75`), so 2 am is "morning". Add a night bucket (22:00-04:59: "Still up" / "Good night").
265. [ ] **[?]** _Bugs_ — WMO table maps code 1 ("mainly clear") to `partly cloudy` (`app.js:90-93`, the `[2, ...]` bucket) and lumps freezing drizzle/rain (56, 57, 66, 67) with plain rain. Split 0 / 1 / 2 / 3 so the text matches the sky.
266. [ ] **[?]** _Bugs_ — With `geolocate: true`, cached weather isn't shown until the geolocation callback returns (up to 4 s), because `loadWeather` is only called from inside it (`app.js:151-157`). Render the cached payload first, then refine. Also store the last good coords so the next load skips the wait.
267. [ ] **[?]** _Bugs_ — Stale weather is shown with no sign it is stale: if the fetch fails and a cache from yesterday exists, it renders as if current. Show `updated 3h ago` (or dim the pane) when `Date.now() - cached.t` is over the TTL.
268. [ ] **[?]** _Bugs_ — The page never refreshes while it stays open. A pinned tab left overnight keeps yesterday's weather and quote, and `setInterval` is throttled in background tabs. Add a `visibilitychange` listener that calls `tick()` and `loadWeather()` (the 15 min cache already limits requests).
269. [ ] **[?]** _Content / cleanup_ — Drop filler entries (`Unknown`, `Every developer`) and near-duplicates (two "courage is not the absence of fear" quotes: Mandela and Twain; three "simplicity" quotes); 100 distinct quotes beats 100 with repeats. Mixing dev quotes and general inspiration is fine, but consider an optional `tags` field so one can pin the pool to `dev` only.
270. [ ] **[?]** _Content / cleanup_ — `index.html` and `minimal.html` each embed the same inline-SVG favicon and the cat `<pre>`. If a third page is ever added, move the cat to `base.css` as a `::before` or into `search.js`; until then leave it.
271. [ ] **[?]** _Content / cleanup_ — The font is the full variable woff2 (31 KB, weights 100-800 plus all glyphs). Subsetting to Latin + box-drawing with `pyftsubset` could halve it; only worth it if load time on a cold file:// open is measurable.
272. [ ] **[?]** _Content / cleanup_ — README says "Everything personal lives in the `CONFIG` block" but link-key conflicts aren't checked: two links with the same key silently overwrite each other in `linkKeys` (`app.js:47`). Warn in the console on duplicate keys, or on a key that collides with `n`, `/` or `1-4`.
273. [ ] **[?]** _Privacy / hardening_ — Move `CONFIG` into `config.js` and ship `config.example.js` (gitignore the real one). Pulling updates then never conflicts with personal name/links/home coordinates, and the repo stops publishing a name and home location.
274. [ ] **[?]** _Search box_ — Up/Down arrow recall of the last ~20 queries (stored in `localStorage`), like a shell. Fits the TUI theme and needs no network, unlike search suggestions.
275. [ ] **[?]** _Search box_ — `Ctrl+Enter` / `Shift+Enter` to open the result in a new tab (`window.open`), since `go()` always replaces the current page.
276. [ ] **[?]** _Search box_ — Extract the routing into a pure `route(value) -> url` function so it can be unit-tested with `node --test` (URL detection, prefixes, link keys). Search routing is the one part with real logic and no tests.
277. [ ] **[?]** _Skip_ — World clocks / countdown to a date in the home pane.
278. [ ] **[?]** _Skip_ — `!bang` passthrough to DuckDuckGo (`!w cats`) for engines not in the map.
279. [ ] **[?]** _UI / UX_ — On wide screens the links pane stretches to fill the row height (`grid-template-rows: ... 1fr ...`) with large empty space below four short columns. Cap the width of the whole grid (`max-width: 1400px; margin: auto`) so it doesn't look sparse on ultrawide monitors.
280. [ ] **[?]** _UI / UX_ — Date line is only `Tuesday the 13th`; add month (and optionally ISO week number) so the pane works as a calendar glance. Cheap via `toLocaleDateString`.
281. [ ] **[?]** _UI / UX_ — The `wx` block is 8 rows of label/value divs; collapse hi/lo + wind + rain onto one dense line and give the freed space to a 12-hour sparkline (`hourly=temperature_2m`, a `▁▂▃▅▆` string, no library).
282. [ ] **[?]** _UI / UX_ — Quote pane: a long quote at ~900-1200 px wraps the author onto its own line and shifts the `[n] new` button. Let the quote truncate/wrap inside its own flex child (`min-width: 0; flex: 1`) so the button stays put.
283. [ ] **[?]** _UI / UX_ — Clicking the quote could copy it (`navigator.clipboard.writeText`) with a brief `copied` flash, and `p` could step back to the previous quote (keep the last 5 in memory).

## Done (earlier rounds, kept for reference)

- [x] **[H]** Link shortcut keys do nothing. Each link shows a key (`g`, `p`, `c`, `h`, `y`...) and the README says "each with a single-key shortcut", but `app.js` only handles `/` and `n` (`app.js:102-107`). Wire them up. Caveat: the search input is `autofocus`, so single letters would be typed into it. Cheapest fit with the existing `y query` / `gh query` syntax: in the search box, a lone link key + Enter jumps (`g⏎` = Gmail). Alternative: `Esc` blurs the input and enables single-key mode.
- [x] **[H]** README "Install" says "Download `index.html`" and "Everything lives in `index.html`: edit `LINK_GROUPS`, `tick()`, `loadWeather()`". Those moved to `app.js` in the last refactor, so a user who downloads only `index.html` gets a page with no links, clock, weather or quotes. Same for `minimal.html` needing `minimal.js`. Update README (or inline the scripts again).
- [x] **[H]** Every new tab calls 2 third parties on top of Google Fonts: `quotescdn.vercel.app` (an unrelated hosted API that can vanish or log) and Open-Meteo. Bundle ~100 quotes in `quotes.js` and pick one with `Math.random()`: instant, offline, zero requests. Keep the API as an opt-in `USE_QUOTE_API` flag if you want fresh ones.
- [x] **[H]** Layout breaks in small/half-width windows: fixed `grid-template-columns: 290px 1fr`, `height: 100vh`, `overflow: hidden`, no media queries (`index.html:30-47`). On a tiled half-screen or a phone the links pane is clipped and not scrollable. Add `@media (max-width: 900px)` to stack to one column, set `overflow: auto` and `min-height: 100dvh`.
- [x] **[M]** README says "Colors: edit the CSS variables at the top of `<style>`". There are none; only `color-scheme` is defined, and ~15 hex colors are repeated throughout (`#282a36`, `#6272a4`, `#bd93f9`, ...). Introduce `--bg --fg --muted --accent --pink --cyan --green --yellow` on `:root` and use them (also makes theming below trivial).
- [x] **[M]** Weather failure is silent and permanent: `.catch(() => {})` (`app.js:49`) leaves `...` / `--` forever, and `r.json()` runs without checking `r.ok`. Show `offline` / `unavailable` and keep the last cached values.
- [x] **[M]** Quote failure message is developer text: "Could not load a quote - check console for error" (`app.js:73`). Fall back to a local quote instead (see Privacy).
- [x] **[M]** Custom search box breaks normal editing: the real `<input>` is transparent and the visible text is a mirrored `<span>` with a fake cursor always at the end (`index.html:87-103`). Arrow keys, click-to-position, selection highlight, and IME input (CJK) don't show; long input overflows the box in `index.html`. Make the input visible (`color`, `caret-color: var(--accent)`) and delete the echo/cursor mirror (~25 lines of CSS+JS across both pages).
- [x] **[M]** Self-host JetBrains Mono (woff2, 400 + 700, ~40 KB) and drop both Google Fonts `<link>`s (`index.html:7-9`, same in `minimal.html`). Removes the render-blocking request, the Google tracking ping, and the offline fallback flash.
- [x] **[M]** Geolocation permission prompt on every new-tab load (`app.js:51`) and a 4 s wait before weather shows. Put `HOME = { name, lat, lon }` in a config block and make geolocation opt-in (`GEOLOCATE = false`). Faster, no prompt, correct place name instead of the literal `local`.
- [x] **[M]** Weather is minimal and °C-only (`app.js:44`): add condition text/icon (`weather_code`), feels-like, high/low, wind; add `UNITS = 'metric' | 'imperial'` (and `temperature_unit=fahrenheit` in the API call).
- [x] **[M]** Search box can only do Google, `y`, `gh`. Replace the hardcoded regex with an `ENGINES` map (`y`, `gh`, `w` Wikipedia, `d` DuckDuckGo, `mdn`, `npm`, `aur`, `r` Reddit) and show the list in the hint. Treat input that looks like a URL (`example.com`, `localhost:3000`) as navigation, not a Google search.
- [x] **[M]** Greeting hardcodes `Syreese` (`app.js:31`). Move to a `CONFIG` block at the top of `app.js` with name, links, home location, units, 12/24 h clock.
- [x] **[M]** Contrast: muted `#6272a4` on `#282a36` is about 3.3:1 for small text (hints, weather labels, link keys), below WCAG AA 4.5:1. Lighten the muted token to ~`#8a96c4` for text (keep `#6272a4` for borders).
- [x] **[M]** `minimal.html` duplicates the search CSS (~45 lines) and `minimal.js` duplicates the search handler from `app.js:84-101`. Extract `search.js` + `base.css` shared by both pages (or one page with a `minimal` body class that hides the panes). Search behavior changes then happen once.
- [x] **[M]** Screenshots are 5.2 MB (`screenshot.png`) and 1.7 MB (`minimal.png`) in git. Re-export as WebP/optimized PNG at ~1600 px wide (about 300 KB each) so cloning stays quick.
- [x] **[L]** `n` fires `loadQuote()` with no in-flight guard (`app.js:106`); holding it spams the API.
- [x] **[L]** `new-quote` is `<a href="#">` with `preventDefault`. It is an action, so make it a `<button>`; `href="#"` also adds `#` to history if JS fails.
- [x] **[L]** No favicon: every load requests `/favicon.ico` (404 locally). Add an inline `data:` SVG favicon.
- [x] **[L]** Cache the last weather response in `localStorage` (with timestamp): render it instantly, refetch only if older than ~15 min. A new tab is then never blank and stops hitting the API on every open.
- [x] **[L]** Add `:focus-visible` outlines on links and the quote button (only the search has a focus style), and `aria-label="Search"` on the input (currently unlabeled and invisible to screen readers).
- [x] **[L]** Respect `prefers-reduced-motion` for the hover transforms, blinking cursor, and quote fade.
- [x] **[L]** Mark decorative cat `aria-hidden="true"`; set `<title>` per page and add `<meta name="theme-color">`.
- [x] **[L]** Update the clock element only when the text changes and recompute greeting/date once per minute rather than every second (`app.js:28-34`); negligible cost, but cleaner.
- [x] **[L]** 12/24-hour toggle and show sunrise/sunset in the same format as the clock.
- [x] **[L]** Theme switcher (Dracula, Nord, Gruvbox, light) once CSS variables exist; `1`-`4` to switch or `t`.
- [x] **[L]** Frecency: sort links by use count (tracked in `localStorage`) within each group, or show a "recent" row.
- [x] **[L]** Hourly forecast strip or 3-day outlook from the same Open-Meteo call (`hourly=temperature_2m,precipitation_probability`).
- [x] **[L]** Link rows are built with `innerHTML` template strings (`app.js:17`) while everything else uses DOM APIs. Data is static so it is safe, but switch to `createElement` before links become user-editable (see edit feature) to avoid an XSS foothold.
- [x] **[L]** No `LICENSE`, `.gitignore`, or `<noscript>` message. Add a MIT license and a one-line noscript ("enable JavaScript").
- [x] **[L]** README: document the `minimal.html` + New Tab Override setup order, the `/` and `n` keys (plus new link keys), and that `app.js` must sit beside `index.html`.
