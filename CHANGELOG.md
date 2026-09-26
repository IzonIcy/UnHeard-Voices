# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Canvas backing store is sized from the laid-out CSS box multiplied by `devicePixelRatio` instead of a hardcoded 1200x600, and all hit-testing geometry stays in CSS pixels. The visualization is no longer a blurry upscale on retina displays and nodes keep the same physical size across devices. Covered by `tests/canvasDpr.test.jsx`.
- Interaction fixes: the pointer throttle keeps only the newest coordinates instead of dropping them, and its pending frame is cancelled on leave and unmount so a queued frame can no longer re-arm the hover after the pointer is gone, tooltips are clamped against the real box size in both directions so a node in the bottom-right corner no longer pushes the tooltip off screen, and the first `ArrowRight` with nothing hovered now lands on the first event instead of skipping it. `Enter` with no highlight opens the first event rather than an unseen selection. Covered by `tests/interaction.test.js` and `tests/keyboardNav.test.jsx`.
- Constellation node positions are derived from event identity rather than the current filter, so hiding a category no longer reshuffles the graph. Layout slots are deterministic per id. Covered by `tests/starLayout.test.js`.
