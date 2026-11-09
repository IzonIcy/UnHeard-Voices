# UnHeard-Voices — Interactive Historical Timeline

*Portfolio piece demonstrating React + canvas data visualization. Not a flagship.*
Static site, 60 curated events, no backend.

## Quick Start

Node 22+ (see `mise.toml`).

- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Test: `pnpm test`

There is no `typecheck` script — the project is untyped JSX.

## Architecture

```
src/
├── App.jsx              # state, URL sync, filter controls
├── components/
│   └── HistographyVisualization.jsx  # canvas renderer, detail panel, EVENT_METADATA
├── data/events.json     # the dataset (1712-2025)
├── lib/                 # pure logic, unit tested without a canvas
│   ├── canvasGeometry.js  # DPR-aware sizing, coordinate mapping
│   ├── interaction.js     # tooltip clamping, keyboard index resolution
│   ├── starLayout.js      # deterministic constellation positions
│   └── exportImage.js     # PNG download
└── styles/              # index.css, timeline.css
tests/                   # vitest + jsdom
```

Two views share one canvas element: a chronological timeline and a polar
"constellation" of events. There is no force simulation and no D3 — positions
are computed from event identity so they stay put when filters change.

## Conventions

- 2-space indent, single quotes, no semicolons, named exports. These are
  enforced, not just documented: `indent`/`quotes`/`semi` rules in
  `eslint.config.js` plus `.editorconfig`. `pnpm lint` covers `src` and
  `tests`, and husky runs it pre-commit. If a formatter rewrites a file to
  tabs/double quotes/semicolons, `pnpm lint` will now fail — that is the
  convention being enforced, not a bug in your change.
- Pure logic belongs in `src/lib/` with tests; the component stays thin.
- Geometry is authored in CSS pixels. The backing store is scaled by
  `devicePixelRatio` via `ctx.setTransform` — do not reintroduce hardcoded
  canvas `width`/`height` attributes, they fight the sizing effect.
- One concern per commit. Husky runs lint and tests pre-commit.

## Don't

- No backend, auth, or database.
- No new dependencies without a reason. The canvas renderer is hand-written
  on purpose.
- No features beyond the current demo.

## Deferred

- TypeScript: worth doing eventually, but the bugs fixed so far were
  coordinate-space and lifecycle mistakes, not type errors. A rewrite is not
  currently the highest-value work.
- Virtualized timeline: unnecessary at 60 events. Revisit past ~1000.

## Baseline Checklist

- [x] GPG signed commits
- [x] Gitleaks + Dependabot enabled
- [ ] CodeQL
- [x] `CHANGELOG.md`
- [x] `CONTRIBUTING.md`
- [x] `SECURITY.md`
- [x] Tests passing in CI
- [ ] TypeScript strict mode
- [ ] Release workflow (GitHub Actions → Vercel)
- [ ] Custom domain
- [ ] Blog post
