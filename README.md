# home

A fast, keyboard-driven start page styled like a terminal TUI. Built to replace Firefox's new tab page — one HTML file, no build step, no tracking.

![screenshot](screenshot.png)

## Features

- **Live clock & date** with a time-based greeting
- **Weather** via [Open-Meteo](https://open-meteo.com/) — geolocates you automatically, falls back to New York
- **Random quotes** on load, with a one-key refresh
- **Quick-launch links** grouped by category, each with a single-key shortcut
- **Inline search bar** — plain text hits Google, `y <query>` hits YouTube, `gh <query>` hits GitHub
- Dracula color scheme, JetBrains Mono, subtle grain + hover glow

### Keyboard shortcuts

| Key | Action |
|---|---|
| `/` | Focus the search bar |
| `n` | Load a new quote |
| `Enter` (in search) | Run the search |

## Install

This is a static file — no dependencies, no build.

1. Download `index.html`
2. Open `about:preferences#home` in Firefox
3. Set **New Windows and Tabs** to **Custom URL...** and point it at the local file path (e.g. `file:///path/to/index.html`)

Or just double-click `index.html` to preview it in any browser.

## Customize

Everything lives in `index.html`:

- **Links** — edit the `LINK_GROUPS` array
- **Name** — edit the greeting string in `tick()`
- **Default location** — edit the fallback coordinates passed to `loadWeather()`
- **Colors** — edit the CSS variables at the top of `<style>`
