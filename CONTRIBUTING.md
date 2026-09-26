# Contributing

## Setup

Requires Node 22+ (`package.json` engines, and CI uses Node 22) and pnpm 10.

```bash
pnpm install
```

`pnpm install` runs the `prepare` script, which installs the git hooks. There is no lockfile churn to worry about — CI uses `--frozen-lockfile`, so commit `pnpm-lock.yaml` whenever dependencies change.

## Before you push

```bash
pnpm lint     # eslint src/
pnpm test     # vitest run
pnpm build    # production bundle
```

A Husky `pre-commit` hook runs `pnpm test`, so a failing test blocks the commit. There is no pre-push hook; if you want the full gate, run all three.

CI runs the same lint, test, and build on every push to `main` and every pull request, plus a gitleaks secret scan.

## Conventions

- 2-space indent, single quotes, no semicolons at the end of statements
- Named exports for anything reusable; the React component in a `.jsx` file is the default export
- Pure logic belongs in `src/lib/` with a unit test next to it in `tests/`. Geometry, hit testing, keyboard mapping, and filename derivation are all pure functions precisely so they can be tested without a canvas or a layout engine — keep it that way
- Keep the canvas component doing rendering and event wiring only. If you find yourself writing arithmetic in a `useEffect`, extract it
- Comment the _why_, not the what. The comments in `src/lib/` are mostly regression notes; match that
- Don't add dependencies. A static JSON dataset and a hand-rolled canvas have kept the bundle and the deploy trivial

## Adding a timeline event

Two files, and the schema test in `tests/eventsSchema.test.js` will tell you if you get either wrong.

1. Append to `src/data/events.json`:

```json
{
  "id": 61,
  "title": "Event Title",
  "date": 1901,
  "year": "c. 1901",
  "category": "resistance",
  "description": "One or two sentences on what happened and why it mattered.",
  "wikiLink": "Wikipedia Article Title"
}
```

- `id` must be a unique integer
- `date` is an integer year between 1700 and 2026; `year` is the display string and must match `date` after stripping an optional `c. ` prefix
- `category` must be one of the nine in the list above. A new category also needs an entry in both `CATEGORY_COLORS` and `CATEGORY_GLOWS` in `HistographyVisualization.jsx` and in the valid set in the schema test
- `wikiLink` is the article _title_, not a URL — the detail view builds the URL

2. Add the matching `EVENT_METADATA` entry in `src/components/HistographyVisualization.jsx`, keyed by the event id:

```js
61: {
  people: ['Person Name'],
  places: ['Place', 'Country'],
  movements: ['abolition'],
  regions: ['north_america'],
  influencedBy: [2, 3]
},
```

Real entries have exactly `people`, `places`, `movements`, `regions`, and `influencedBy`. All five are arrays of strings, except `influencedBy`, which is an array of event ids. Use an empty array rather than omitting a key.

The schema test fails if an event id is missing from `EVENT_METADATA`. That has bitten before: search scopes, related-event lookups, and tags all return nothing silently for a missing entry rather than erroring.

Movements and regions are free-form strings, but they get display labels from `MOVEMENT_LABELS` and `REGION_LABELS` in the same file. Add a label there for anything you introduce so the filter chips read properly.

## Commits and pull requests

Plain imperative subjects, no type prefixes, no emoji. Describe the why when it isn't obvious from the diff. See [CHANGELOG.md](CHANGELOG.md) for whether an entry is warranted — user-visible changes go under Unreleased.
