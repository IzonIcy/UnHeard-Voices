# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Open Graph link preview image, generated from the dataset so the category legend reflects real counts (`scripts/generate_og_image.py`).
- `CHANGELOG.md`, `CONTRIBUTING.md`, and `SECURITY.md`.

### Changed

- The code style in `AGENTS.md` is now enforced instead of just documented. ESLint
  checks indent, quotes and semicolons, `pnpm lint` covers `tests` and the root
  config files as well as `src`, husky runs it pre-commit, and `.editorconfig`
  states the convention for editors. Every JS file in the repo was brought into
  line; the reformat changes no behaviour.
- `vitest.config.js` was written in a different style to the rest of the repo.
- Added `biome.json`. The editor tooling formats `.js`/`.jsx`/`.json` with Biome,
  which had no project config and so ran on its defaults: tabs, double quotes and
  semicolons, which is where the drift above came from. It now matches the
  documented style. CSS and Markdown are excluded because Prettier owns those, and
  the two disagreed on line width.

### Fixed

- Escape now dismisses the event detail panel wherever focus is, not only when the canvas has it. The panel declares `aria-modal`, but Escape was bound to the canvas alone, so activating a related event (which re-renders the panel and drops focus to the body) left it stuck open. Covered by `tests/keyboardNav.test.jsx`.
- PNG export no longer bakes in the hover glow. The snapshot is taken after a redraw with the highlight cleared, so the image matches the event its filename claims.

- `js-yaml` was held at 4.3.1 by eslint's dependency tree, below the 4.3.2 that fixes GHSA-2883-xcg3-v3hh (high severity, unbounded CPU use parsing merge sources). Pinned through a pnpm override.

- On narrow screens the insights panel and legend were absolutely positioned over the canvas, hiding most of the constellation and swallowing taps meant for the nodes. The stage now lays its parts out in normal flow, and the visualization leads the filter rail instead of sitting ~1100px below the fold. Guarded by `tests/mobileLayout.test.js`.
- The PNG export button shared the top-right corner with the insights panel and covered the Leading Category card.

- Canvas backing store is sized from the laid-out CSS box multiplied by `devicePixelRatio` instead of a hardcoded 1200x600, and all hit-testing geometry stays in CSS pixels. The visualization is no longer a blurry upscale on retina displays and nodes keep the same physical size across devices. Covered by `tests/canvasDpr.test.jsx`.
- Interaction fixes: the pointer throttle keeps only the newest coordinates instead of dropping them, and its pending frame is cancelled on leave and unmount so a queued frame can no longer re-arm the hover after the pointer is gone, tooltips are clamped against the real box size in both directions so a node in the bottom-right corner no longer pushes the tooltip off screen, and the first `ArrowRight` with nothing hovered now lands on the first event instead of skipping it. `Enter` with no highlight opens the first event rather than an unseen selection. Covered by `tests/interaction.test.js` and `tests/keyboardNav.test.jsx`.
- Constellation node positions are derived from event identity rather than the current filter, so hiding a category no longer reshuffles the graph. Layout slots are deterministic per id. Covered by `tests/starLayout.test.js`.
