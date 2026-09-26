# Unheard Voices

Interactive timeline and constellation view of historical events that mainstream history tends to skip over: indigenous resistance, queer pioneers, anti-colonial movements, forgotten inventors.

**Live:** https://un-heard-voices-8xof.vercel.app/

## The dataset

60 events in `src/data/events.json`, each with an integer year, a category, a description, and a Wikipedia article title. Current entries run 1712–2025; the schema test allows 1700–2026. Categories: `arts`, `civil_rights`, `disability`, `indigenous`, `labor`, `lgbtq`, `resistance`, `science`, `women`.

## Two views

- **Timeline** — chronological, good for seeing what happened when
- **Constellation** — graph view showing how events connect through shared people, places, movements, and regions, plus explicit influence links

Both filter by year range, category, and search, and the full UI state lives in the URL query string, so any view is a shareable link. The canvas is keyboard navigable: arrows move the highlight, `Home`/`End` jump to the ends, `Enter` or `Space` opens the detail panel, `Escape` closes it. The current canvas can be exported as a PNG.

## Run it

```bash
pnpm install
pnpm dev        # localhost:5173
```

Other scripts:

```bash
pnpm test         # vitest run
pnpm test:watch
pnpm lint         # eslint src/
pnpm build        # -> dist/
pnpm preview      # serve the production build
```

## Stack

Vite 8 + React 19, plain JSX, no TypeScript. The visualization is a hand-written Canvas 2D renderer in `src/components/HistographyVisualization.jsx` — no D3, no charting library. `src/App.jsx` owns the URL-synced state and passes it down. Pure logic (geometry, hit testing, keyboard resolution, layout, export filenames) lives in `src/lib/` so it can be unit tested without a canvas.

## Layout

```
src/
  App.jsx              # state, URL sync, filter controls
  components/
    HistographyVisualization.jsx  # canvas renderer, detail panel, EVENT_METADATA
  data/events.json     # the dataset
  lib/                 # pure, unit-tested logic
    canvasGeometry.js  # DPR-aware sizing, coordinate mapping
    interaction.js     # tooltip clamping, keyboard index resolution
    starLayout.js      # deterministic constellation positions
    exportImage.js     # PNG download
  styles/              # index.css, timeline.css
tests/                 # vitest + jsdom, 8 files / 49 tests
```

## Tests

`pnpm test` runs 8 files / 49 tests: the dataset schema, the pure lib functions, DPR-aware canvas sizing, keyboard navigation, and PNG filename derivation.

## Deploy

Pushes to `main` build on Vercel using `vercel.json` (`pnpm install --frozen-lockfile`, `pnpm run build`, output `dist`). That output is a plain static bundle and can be hosted anywhere.

## If it doesn't work

```bash
rm -rf node_modules && pnpm install
```

## Writing about it

[Building a canvas timeline that doesn't lie about where things are](blog/building-a-canvas-timeline.md) — on `devicePixelRatio`, hit targets, and why the layout stopped moving when you filter.

Contributing? See [CONTRIBUTING.md](CONTRIBUTING.md).
